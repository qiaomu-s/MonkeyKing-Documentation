import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
} from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import ts from 'typescript'

export interface RenderedPagesValidationOptions {
  readonly outputDirectory: string
  readonly base: string
  readonly expectedHtmlFiles: readonly string[]
  readonly expectedSearchKeys?: readonly string[]
  readonly requireBaseForAbsoluteUrls?: boolean
}

export interface RenderedPagesReport {
  readonly htmlFileCount: number
  readonly referenceCount: number
  readonly fragmentReferenceCount: number
  readonly searchPageCount: number
}

interface HtmlTag {
  readonly name: string
  readonly attributes: ReadonlyMap<string, string>
}

interface ParsedHtml {
  readonly tags: readonly HtmlTag[]
  readonly styleBlocks: readonly string[]
  readonly inlineModuleScripts: readonly string[]
}

interface AttributeReference {
  readonly attribute: string
  readonly kind: 'link' | 'asset'
}

type ReferenceKind = 'link' | 'asset' | 'css' | 'js-import' | 'search'

const renderedOrigin = 'https://rendered.monkeyking.invalid'
const externalSchemes = new Set(['http', 'https', 'mailto', 'tel', 'data'])
const additionalSingleUrlAttributesByTag = new Map<
  string,
  readonly AttributeReference[]
>([
  ['button', [{ attribute: 'formaction', kind: 'link' }]],
  ['form', [{ attribute: 'action', kind: 'link' }]],
  ['input', [{ attribute: 'formaction', kind: 'link' }]],
  ['object', [{ attribute: 'data', kind: 'asset' }]],
  ['video', [{ attribute: 'poster', kind: 'asset' }]],
])
const additionalListUrlAttributesByTag = new Map<string, readonly string[]>([
  ['link', ['imagesrcset']],
])

function toPosixPath(path: string): string {
  return path.split(sep).join('/')
}

function normalizeBase(base: string): string {
  if (!base.startsWith('/') || !base.endsWith('/') || base.includes('\\')) {
    throw new Error(`Invalid rendered site base: ${base}`)
  }
  return base.replace(/\/{2,}/g, '/')
}

function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi,
    (entity) => {
      const normalized = entity.toLowerCase()
      if (normalized === '&amp;') return '&'
      if (normalized === '&quot;') return '"'
      if (normalized === '&apos;') return "'"
      if (normalized === '&lt;') return '<'
      if (normalized === '&gt;') return '>'
      const numeric = normalized.startsWith('&#x')
        ? Number.parseInt(normalized.slice(3, -1), 16)
        : Number.parseInt(normalized.slice(2, -1), 10)
      return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : entity
    },
  )
}

function decodeUrlComponent(value: string, source: string): string {
  try {
    const decoded = decodeURIComponent(value)
    if (decoded.includes('\0')) {
      throw new Error(`NUL byte in rendered URL from ${source}: ${value}`)
    }
    if (decoded.includes('\\')) {
      throw new Error(`backslash in rendered URL from ${source}: ${value}`)
    }
    return decoded
  } catch (error) {
    if (error instanceof Error && /NUL byte|backslash/.test(error.message)) {
      throw error
    }
    throw new Error(`Invalid URL encoding in ${source}: ${value}`)
  }
}

function walkOutputFiles(root: string): readonly string[] {
  if (!existsSync(root)) throw new Error(`Missing rendered output: ${root}`)
  const rootStats = lstatSync(root)
  if (rootStats.isSymbolicLink()) {
    throw new Error(`Refusing symbolic link for rendered output: ${root}`)
  }
  if (!rootStats.isDirectory()) {
    throw new Error(`Expected rendered output directory: ${root}`)
  }

  const files: string[] = []
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name)
      const repositoryPath = toPosixPath(relative(root, path))
      if (entry.isSymbolicLink()) {
        throw new Error(`Refusing symbolic link in rendered output: ${repositoryPath}`)
      }
      if (entry.isDirectory()) {
        visit(path)
      } else if (entry.isFile()) {
        files.push(repositoryPath)
      } else {
        throw new Error(`Unsupported rendered artifact: ${repositoryPath}`)
      }
    }
  }
  visit(root)
  return files.sort()
}

function findTagEnd(html: string, start: number): number {
  let quote = ''
  for (let index = start; index < html.length; index += 1) {
    const char = html[index]
    if (quote) {
      if (char === quote && html[index - 1] !== '\\') quote = ''
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
    } else if (char === '>') {
      return index
    }
  }
  return -1
}

function parseAttributes(tag: string, nameEnd: number): ReadonlyMap<string, string> {
  const attributes = new Map<string, string>()
  let index = nameEnd
  while (index < tag.length) {
    while (/\s/.test(tag[index] ?? '')) index += 1
    if (index >= tag.length || tag[index] === '>' || tag[index] === '/') break

    const nameStart = index
    while (index < tag.length && !/[\s=/>]/.test(tag[index])) index += 1
    const name = tag.slice(nameStart, index).toLowerCase()
    while (/\s/.test(tag[index] ?? '')) index += 1
    if (tag[index] !== '=') {
      attributes.set(name, '')
      continue
    }
    index += 1
    while (/\s/.test(tag[index] ?? '')) index += 1

    let value = ''
    const quote = tag[index]
    if (quote === '"' || quote === "'") {
      index += 1
      const valueStart = index
      while (index < tag.length && tag[index] !== quote) index += 1
      value = tag.slice(valueStart, index)
      if (tag[index] === quote) index += 1
    } else {
      const valueStart = index
      while (index < tag.length && !/[\s>]/.test(tag[index])) index += 1
      value = tag.slice(valueStart, index)
    }
    attributes.set(name, decodeHtmlEntities(value))
  }
  return attributes
}

function parseHtml(html: string): ParsedHtml {
  const tags: HtmlTag[] = []
  const styleBlocks: string[] = []
  const inlineModuleScripts: string[] = []
  const lowerHtml = html.toLowerCase()
  let index = 0

  while (index < html.length) {
    const opening = html.indexOf('<', index)
    if (opening < 0) break
    if (html.startsWith('<!--', opening)) {
      const closing = html.indexOf('-->', opening + 4)
      index = closing < 0 ? html.length : closing + 3
      continue
    }
    if (/^<\s*[!/]/.test(html.slice(opening, opening + 4))) {
      const closing = findTagEnd(html, opening + 1)
      index = closing < 0 ? html.length : closing + 1
      continue
    }

    const nameMatch = /^<\s*([A-Za-z][\w:-]*)/.exec(html.slice(opening))
    if (!nameMatch) {
      index = opening + 1
      continue
    }
    const closing = findTagEnd(html, opening + nameMatch[0].length)
    if (closing < 0) break
    const rawTag = html.slice(opening, closing + 1)
    const name = nameMatch[1].toLowerCase()
    const attributes = parseAttributes(rawTag, nameMatch[0].length)
    tags.push({
      name,
      attributes,
    })

    if ((name === 'script' || name === 'style') && !/\/\s*>$/.test(rawTag)) {
      const rawClosing = `</${name}`
      const closeStart = lowerHtml.indexOf(rawClosing, closing + 1)
      if (closeStart < 0) {
        index = closing + 1
        continue
      }
      const contents = html.slice(closing + 1, closeStart)
      if (name === 'style') styleBlocks.push(contents)
      if (
        name === 'script' &&
        attributes.get('type')?.trim().toLowerCase() === 'module' &&
        !attributes.has('src')
      ) {
        inlineModuleScripts.push(contents)
      }
      const closeEnd = findTagEnd(html, closeStart + rawClosing.length)
      index = closeEnd < 0 ? html.length : closeEnd + 1
      continue
    }
    index = closing + 1
  }

  return { tags, styleBlocks, inlineModuleScripts }
}

function parseSrcset(value: string): readonly string[] {
  const urls: string[] = []
  let index = 0
  while (index < value.length) {
    while (/[\s,]/.test(value[index] ?? '')) index += 1
    if (index >= value.length) break
    const start = index
    if (value.slice(index).toLowerCase().startsWith('data:')) {
      while (index < value.length && !/\s/.test(value[index])) index += 1
    } else {
      while (index < value.length && !/[\s,]/.test(value[index])) index += 1
    }
    urls.push(value.slice(start, index))
    while (index < value.length && value[index] !== ',') index += 1
    if (value[index] === ',') index += 1
  }
  return urls
}

function isCssIdentifierCharacter(char: string | undefined): boolean {
  return char !== undefined && /[A-Za-z\d_-]/.test(char)
}

function skipCssComment(css: string, index: number): number | undefined {
  if (!css.startsWith('/*', index)) return undefined
  const closing = css.indexOf('*/', index + 2)
  return closing < 0 ? css.length : closing + 2
}

function skipCssTrivia(css: string, start: number): number {
  let index = start
  while (index < css.length) {
    if (/\s/.test(css[index])) {
      index += 1
      continue
    }
    const afterComment = skipCssComment(css, index)
    if (afterComment === undefined) break
    index = afterComment
  }
  return index
}

function readQuotedValue(
  source: string,
  start: number,
): { readonly value: string; readonly end: number } {
  const quote = source[start]
  let value = ''
  let index = start + 1
  while (index < source.length) {
    const char = source[index]
    if (char === quote) return { value, end: index + 1 }
    if (char === '\\' && index + 1 < source.length) {
      value += char + source[index + 1]
      index += 2
      continue
    }
    value += char
    index += 1
  }
  return { value, end: source.length }
}

function readCssUrlFunction(
  css: string,
  openParenthesis: number,
): { readonly value?: string; readonly end: number } {
  let index = skipCssTrivia(css, openParenthesis + 1)
  const quote = css[index]
  if (quote === '"' || quote === "'") {
    const quoted = readQuotedValue(css, index)
    index = skipCssTrivia(css, quoted.end)
    return css[index] === ')'
      ? { value: quoted.value, end: index + 1 }
      : { end: quoted.end }
  }

  const start = index
  while (index < css.length) {
    if (css[index] === '\\' && index + 1 < css.length) {
      index += 2
      continue
    }
    if (css[index] === ')') {
      return { value: css.slice(start, index).trim(), end: index + 1 }
    }
    if (css[index] === '"' || css[index] === "'") return { end: index + 1 }
    index += 1
  }
  return { end: css.length }
}

function cssReferences(css: string): readonly string[] {
  const references: string[] = []
  let index = 0
  while (index < css.length) {
    const afterComment = skipCssComment(css, index)
    if (afterComment !== undefined) {
      index = afterComment
      continue
    }

    const char = css[index]
    if (char === '"' || char === "'") {
      index = readQuotedValue(css, index).end
      continue
    }

    if (
      char === '@' &&
      css.slice(index + 1, index + 7).toLowerCase() === 'import' &&
      !isCssIdentifierCharacter(css[index + 7])
    ) {
      const valueStart = skipCssTrivia(css, index + 7)
      const quote = css[valueStart]
      if (quote === '"' || quote === "'") {
        const quoted = readQuotedValue(css, valueStart)
        references.push(quoted.value)
        index = quoted.end
        continue
      }
      index = valueStart
      continue
    }

    if (
      css.slice(index, index + 3).toLowerCase() === 'url' &&
      !isCssIdentifierCharacter(css[index - 1]) &&
      !isCssIdentifierCharacter(css[index + 3])
    ) {
      const openParenthesis = skipCssTrivia(css, index + 3)
      if (css[openParenthesis] === '(') {
        const parsed = readCssUrlFunction(css, openParenthesis)
        if (parsed.value !== undefined) references.push(parsed.value)
        index = parsed.end
        continue
      }
    }
    index += 1
  }
  return references
}

function localJavaScriptSpecifier(node: ts.Node | undefined): string | undefined {
  if (
    !node ||
    (!ts.isStringLiteral(node) &&
      !ts.isNoSubstitutionTemplateLiteral(node))
  ) {
    return undefined
  }
  const specifier = node.text
  return specifier.startsWith('/') ||
    specifier.startsWith('./') ||
    specifier.startsWith('../')
    ? specifier
    : undefined
}

function javascriptImports(source: string): readonly string[] {
  const sourceFile = ts.createSourceFile(
    'rendered.js',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  )
  const imports: string[] = []
  const visit = (node: ts.Node): void => {
    let target: string | undefined
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      target = localJavaScriptSpecifier(node.moduleSpecifier)
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      target = localJavaScriptSpecifier(node.moduleReference.expression)
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      target = localJavaScriptSpecifier(node.arguments[0])
    }
    if (target !== undefined) imports.push(target)
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return imports
}

function assertRelativePathDoesNotEscape(rawUrl: string, sourceFile: string): void {
  const pathPart = rawUrl.split(/[?#]/, 1)[0]
  if (!pathPart || pathPart.startsWith('/')) return
  const decoded = decodeUrlComponent(pathPart, sourceFile)
  const stack = dirname(sourceFile) === '.' ? [] : dirname(sourceFile).split('/')
  for (const segment of decoded.split('/')) {
    if (!segment || segment === '.') continue
    if (segment === '..') {
      if (stack.length === 0) {
        throw new Error(`URL escapes rendered site base from ${sourceFile}: ${rawUrl}`)
      }
      stack.pop()
    } else {
      stack.push(segment)
    }
  }
}

function addError(errors: Set<string>, message: string): void {
  if (errors.size < 100) errors.add(message)
}

function validateReference(
  rawValue: string,
  sourceFile: string,
  kind: ReferenceKind,
  files: ReadonlySet<string>,
  idsByHtmlFile: ReadonlyMap<string, ReadonlySet<string>>,
  base: string,
  requireBaseForAbsoluteUrls: boolean,
  errors: Set<string>,
): { local: boolean; fragment: boolean } {
  const value = decodeHtmlEntities(rawValue).trim()
  if (!value || value === '#') return { local: false, fragment: false }
  if (value.startsWith('//')) return { local: false, fragment: false }

  const scheme = /^([A-Za-z][A-Za-z\d+.-]*):/.exec(value)?.[1].toLowerCase()
  if (scheme) {
    if (!externalSchemes.has(scheme)) {
      addError(errors, `Unsafe URL scheme in ${sourceFile}: ${value}`)
    }
    return { local: false, fragment: false }
  }

  try {
    assertRelativePathDoesNotEscape(value, sourceFile)
    const currentPublicPath = `${base}${sourceFile}`
    const resolved = new URL(value, `${renderedOrigin}${currentPublicPath}`)
    if (resolved.origin !== renderedOrigin) return { local: false, fragment: false }

    const decodedPathname = decodeUrlComponent(resolved.pathname, sourceFile)
    if (
      requireBaseForAbsoluteUrls &&
      value.startsWith('/') &&
      !decodedPathname.startsWith(base)
    ) {
      addError(
        errors,
        `Absolute rendered URL from ${sourceFile} must start with ${base}: ${value}`,
      )
      return { local: true, fragment: false }
    }
    if (!decodedPathname.startsWith(base)) {
      addError(errors, `URL escapes rendered site base from ${sourceFile}: ${value}`)
      return { local: true, fragment: false }
    }

    let targetFile = decodedPathname.slice(base.length)
    if (!targetFile || targetFile.endsWith('/')) targetFile += 'index.html'
    targetFile = targetFile.replace(/^\/+/, '')
    if (
      isAbsolute(targetFile) ||
      targetFile.includes('\\') ||
      targetFile.split('/').includes('..')
    ) {
      addError(errors, `URL escapes rendered site base from ${sourceFile}: ${value}`)
      return { local: true, fragment: false }
    }

    if (!files.has(targetFile)) {
      const message =
        kind === 'js-import'
          ? 'Missing JavaScript import'
          : kind === 'link' && (targetFile.endsWith('.html') || targetFile === 'index.html')
            ? 'Missing rendered page'
            : 'Missing rendered asset'
      addError(errors, `${message} from ${sourceFile}: ${targetFile}`)
      return { local: true, fragment: false }
    }

    const rawFragment = resolved.hash.startsWith('#') ? resolved.hash.slice(1) : ''
    if (rawFragment) {
      const fragment = decodeUrlComponent(rawFragment, sourceFile)
      const targetIds = idsByHtmlFile.get(targetFile)
      if (!targetIds?.has(fragment)) {
        addError(
          errors,
          `Missing fragment from ${sourceFile}: ${targetFile}#${fragment}`,
        )
      }
      return { local: true, fragment: true }
    }
    return { local: true, fragment: false }
  } catch (error) {
    addError(errors, error instanceof Error ? error.message : String(error))
    return { local: true, fragment: false }
  }
}

function validateSearchIndex(
  outputDirectory: string,
  files: ReadonlySet<string>,
  expectedKeys: readonly string[],
  errors: Set<string>,
): number {
  const path = resolve(outputDirectory, 'hashmap.json')
  if (!files.has('hashmap.json')) {
    addError(errors, 'Missing rendered local-search hashmap: hashmap.json')
    return 0
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    addError(errors, 'Invalid rendered local-search hashmap JSON')
    return 0
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    addError(errors, 'Invalid rendered local-search hashmap shape')
    return 0
  }

  const entries = Object.entries(parsed as Record<string, unknown>)
  const actualKeys = entries.map(([key]) => key).sort()
  const expected = [...expectedKeys].sort()
  if (
    actualKeys.length !== expected.length ||
    actualKeys.some((key, index) => key !== expected[index])
  ) {
    addError(
      errors,
      `Invalid rendered local-search inventory: expected ${expected.length}, received ${actualKeys.length}`,
    )
  }

  for (const [key, hashValue] of entries) {
    if (typeof hashValue !== 'string' || !/^[A-Za-z\d_-]+$/.test(hashValue)) {
      addError(errors, `Invalid rendered local-search hash for ${key}`)
      continue
    }
    for (const suffix of ['.js', '.lean.js']) {
      const target = `assets/${key}.${hashValue}${suffix}`
      if (!files.has(target)) {
        addError(errors, `Missing rendered local-search asset: ${target}`)
      }
    }
  }
  return entries.length
}

export function validateRenderedPages(
  options: RenderedPagesValidationOptions,
): RenderedPagesReport {
  const outputDirectory = resolve(options.outputDirectory)
  const base = normalizeBase(options.base)
  const outputFiles = walkOutputFiles(outputDirectory)
  const files = new Set(outputFiles)
  const htmlFiles = outputFiles.filter((path) => path.endsWith('.html'))
  const expectedHtml = [...options.expectedHtmlFiles].sort()
  const missingHtml = expectedHtml.filter((path) => !htmlFiles.includes(path))
  const unexpectedHtml = htmlFiles.filter((path) => !expectedHtml.includes(path))
  if (missingHtml.length > 0 || unexpectedHtml.length > 0) {
    const details = [
      missingHtml.length > 0 ? `missing: ${missingHtml.join(', ')}` : '',
      unexpectedHtml.length > 0
        ? `unexpected: ${unexpectedHtml.join(', ')}`
        : '',
    ]
      .filter(Boolean)
      .join('; ')
    throw new Error(`Invalid rendered HTML inventory; ${details}`)
  }

  const parsedByHtmlFile = new Map<string, ParsedHtml>()
  const idsByHtmlFile = new Map<string, ReadonlySet<string>>()
  for (const htmlFile of htmlFiles) {
    const parsed = parseHtml(
      readFileSync(resolve(outputDirectory, htmlFile), 'utf8'),
    )
    parsedByHtmlFile.set(htmlFile, parsed)
    idsByHtmlFile.set(
      htmlFile,
      new Set(
        parsed.tags
          .map(({ attributes }) => attributes.get('id'))
          .filter((id): id is string => id !== undefined && id !== ''),
      ),
    )
  }

  const errors = new Set<string>()
  let referenceCount = 0
  let fragmentReferenceCount = 0
  const inspect = (
    value: string,
    sourceFile: string,
    kind: ReferenceKind,
  ): void => {
    const result = validateReference(
      value,
      sourceFile,
      kind,
      files,
      idsByHtmlFile,
      base,
      options.requireBaseForAbsoluteUrls ?? false,
      errors,
    )
    if (result.local) referenceCount += 1
    if (result.fragment) fragmentReferenceCount += 1
  }

  for (const [htmlFile, parsed] of parsedByHtmlFile) {
    for (const tag of parsed.tags) {
      const href = tag.attributes.get('href')
      if (href !== undefined) {
        inspect(
          href,
          htmlFile,
          tag.name === 'a' || tag.name === 'area' ? 'link' : 'asset',
        )
      }
      const src = tag.attributes.get('src')
      if (src !== undefined) inspect(src, htmlFile, 'asset')
      const srcset = tag.attributes.get('srcset')
      if (srcset !== undefined) {
        for (const candidate of parseSrcset(srcset)) {
          inspect(candidate, htmlFile, 'asset')
        }
      }
      for (
        const reference of additionalSingleUrlAttributesByTag.get(tag.name) ?? []
      ) {
        const value = tag.attributes.get(reference.attribute)
        if (value !== undefined) inspect(value, htmlFile, reference.kind)
      }
      for (
        const attribute of additionalListUrlAttributesByTag.get(tag.name) ?? []
      ) {
        const value = tag.attributes.get(attribute)
        if (value !== undefined) {
          for (const candidate of parseSrcset(value)) {
            inspect(candidate, htmlFile, 'asset')
          }
        }
      }
      const inlineStyle = tag.attributes.get('style')
      if (inlineStyle !== undefined) {
        for (const reference of cssReferences(inlineStyle)) {
          inspect(reference, htmlFile, 'css')
        }
      }
    }
    for (const css of parsed.styleBlocks) {
      for (const reference of cssReferences(css)) {
        inspect(reference, htmlFile, 'css')
      }
    }
    for (const source of parsed.inlineModuleScripts) {
      for (const target of javascriptImports(source)) {
        inspect(target, htmlFile, 'js-import')
      }
    }
  }

  for (const cssFile of outputFiles.filter((path) => path.endsWith('.css'))) {
    const css = readFileSync(resolve(outputDirectory, cssFile), 'utf8')
    for (const reference of cssReferences(css)) {
      inspect(reference, cssFile, 'css')
    }
  }

  for (const javascriptFile of outputFiles.filter((path) => /\.m?js$/.test(path))) {
    const source = readFileSync(resolve(outputDirectory, javascriptFile), 'utf8')
    for (const target of javascriptImports(source)) {
      inspect(target, javascriptFile, 'js-import')
    }
  }

  const searchPageCount = options.expectedSearchKeys
    ? validateSearchIndex(
        outputDirectory,
        files,
        options.expectedSearchKeys,
        errors,
      )
    : 0

  if (errors.size > 0) {
    throw new Error(`Rendered page validation failed:\n- ${[...errors].join('\n- ')}`)
  }

  return Object.freeze({
    htmlFileCount: htmlFiles.length,
    referenceCount,
    fragmentReferenceCount,
    searchPageCount,
  })
}
