import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { applyBrandPolicy } from './content/brand-policy'
import {
  contentEntries,
  deletedLegacySources,
} from './content/catalog'
import type { ContentEntry } from './content/catalog'
import {
  buildHeadingIndex,
  rewriteMarkdownLinks,
} from './content/markdown-links'
import type {
  HeadingIndex,
  MarkdownLinkContext,
} from './content/markdown-links'

export interface MigrationContext {
  readonly current: ContentEntry
  readonly entries?: readonly ContentEntry[]
  readonly headingIndex?: HeadingIndex
}

export interface MigrateContentOptions {
  readonly rootDirectory?: string
  readonly entries?: readonly ContentEntry[]
  readonly imageNames?: readonly string[]
  readonly deletedSources?: readonly string[]
}

export interface MigrateContentReport {
  readonly entriesWritten: number
  readonly imagesCopied: number
  readonly pathsDeleted: number
}

interface ExactRepair {
  readonly legacySource: string
  readonly oldText: string
  readonly newText: string
  readonly expectedOccurrences: number
}

export const legacyImageNames = Object.freeze([
  'autojs6-notification-append-script-name-on-title-dark.png',
  'autojs6-notification-append-script-name-on-title.png',
  'autojs6-notification-big-content-sample-dark.png',
  'autojs6-notification-big-content-sample.png',
  'autojs6-notification-big-text-for-content-dark.png',
  'autojs6-notification-big-text-for-content.png',
  'autojs6-notification-content-sample-dark.png',
  'autojs6-notification-content-sample.png',
  'autojs6-notification-item-details-dark.png',
  'autojs6-notification-item-details.png',
  'autojs6-notification-list-dark.png',
  'autojs6-notification-list-with-same-names-dark.png',
  'autojs6-notification-list-with-same-names.png',
  'autojs6-notification-list.png',
  'autojs6-notification-title-sample-dark.png',
  'autojs6-notification-title-sample.png',
  'ex-gravity.png',
  'ex-layout-gravity.png',
  'ex-marginLeft.png',
  'ex-padding.png',
  'ex-properties.png',
  'ex-w.png',
  'ex1-horizontal.png',
  'ex1-margin.png',
  'ex1.png',
  'ex2-margin.png',
  'h-distance-color-detection-dark.png',
  'h-distance-color-detection.png',
  'hs-distance-color-detection-dark.png',
  'hs-distance-color-detection.png',
  'logo.png',
  'rgb-difference-color-detection-dark.png',
  'rgb-difference-color-detection.png',
  'rgb-distance-color-detection-dark.png',
  'rgb-distance-color-detection.png',
  'weighted-rgb-distance-color-detection-dark.png',
  'weighted-rgb-distance-color-detection.png',
] as const)

const exactRepairs: readonly ExactRepair[] = Object.freeze([
  Object.freeze({
    legacySource: 'api/canvas.md',
    oldText: 'Array<number>',
    newText: 'Array&lt;number&gt;',
    expectedOccurrences: 1,
  }),
  Object.freeze({
    legacySource: 'api/dataTypes.md',
    oldText: '例如 Array<T>.',
    newText: '例如 `Array<T>`.',
    expectedOccurrences: 1,
  }),
  Object.freeze({
    legacySource: 'api/httpRequestHeadersType.md',
    oldText: '<cookie-name>=<cookie-value>',
    newText: '&lt;cookie-name&gt;=&lt;cookie-value&gt;',
    expectedOccurrences: 1,
  }),
  Object.freeze({
    legacySource: 'api/keys.md',
    oldText: '<String>',
    newText: '&lt;String&gt;',
    expectedOccurrences: 1,
  }),
  Object.freeze({
    legacySource: 'api/color.md',
    oldText: "'yellow'`.",
    newText: "'yellow'.",
    expectedOccurrences: 1,
  }),
  Object.freeze({
    legacySource: 'api/events.md',
    oldText: "## 事件: 'exit`",
    newText: "## 事件: 'exit'",
    expectedOccurrences: 1,
  }),
  Object.freeze({
    legacySource: 'api/image.md',
    oldText: '    * ``\n',
    newText: '',
    expectedOccurrences: 1,
  }),
  Object.freeze({
    legacySource: 'api/ui.md',
    oldText:
      '例如, 粗体：`<text textStyle="bold" textSize="18sp" text="这是粗体"/>',
    newText:
      '例如, 粗体：`<text textStyle="bold" textSize="18sp" text="这是粗体"/>`',
    expectedOccurrences: 1,
  }),
  Object.freeze({
    legacySource: 'api/ui.md',
    oldText:
      '例如, 限制文本最长为5em: `<text ems="5" ellipsize="end" text="很长很长很长很长很长很长很长的文本"/>',
    newText:
      '例如, 限制文本最长为5em: `<text ems="5" ellipsize="end" text="很长很长很长很长很长很长很长的文本"/>`',
    expectedOccurrences: 1,
  }),
  Object.freeze({
    legacySource: 'api/ui.md',
    oldText: 'images/ex1-properties.png',
    newText: 'images/ex-properties.png',
    expectedOccurrences: 1,
  }),
  Object.freeze({
    legacySource: 'api/ui.md',
    oldText: '效果如图：\n\n![ex-input](ex-input.png)\n',
    newText: '效果如下：\n',
    expectedOccurrences: 1,
  }),
  Object.freeze({
    legacySource: 'api/ui.md',
    oldText:
      '输入提示. 这个提示会在输入框为空的时候显示出来. 如图所示:\n\n![ex-hint](images/ex-hint.png)\n\n上面图片效果的代码为：',
    newText:
      '输入提示. 这个提示会在输入框为空的时候显示出来.\n\n示例代码如下：',
    expectedOccurrences: 1,
  }),
  Object.freeze({
    legacySource: 'api/sensors.md',
    oldText:
      '      这里的x轴, y轴, z轴所属的坐标系统如下图(其中z轴垂直于设备屏幕表面):\n\n  !![axis_device](#images/axis_device.png)\n',
    newText:
      'x 轴和 y 轴位于设备屏幕平面内，z 轴垂直于设备屏幕表面。\n',
    expectedOccurrences: 1,
  }),
  Object.freeze({
    legacySource: 'api/sensors.md',
    oldText:
      '这里的x轴, y轴, z轴所属的坐标系统如下图(其中z轴垂直于设备屏幕表面):\n\n  !![axis_device](#images/axis_device.png)\n',
    newText:
      'x 轴和 y 轴位于设备屏幕平面内，z 轴垂直于设备屏幕表面。\n',
    expectedOccurrences: 1,
  }),
])

function countOccurrences(value: string, search: string): number {
  if (!search) return 0
  let count = 0
  let fromIndex = 0
  while (true) {
    const index = value.indexOf(search, fromIndex)
    if (index < 0) return count
    count += 1
    fromIndex = index + search.length
  }
}

function replaceAuditedOccurrence(
  markdown: string,
  repair: ExactRepair,
): string {
  const count = countOccurrences(markdown, repair.oldText)
  if (count === 0) return markdown
  if (count !== repair.expectedOccurrences) {
    throw new Error(
      `Expected ${repair.expectedOccurrences} occurrence(s) of audited fragment in ${repair.legacySource}, found ${count}`,
    )
  }
  return markdown.replaceAll(repair.oldText, repair.newText)
}

export function repairKnownContentDefects(
  markdown: string,
  context: Pick<MigrationContext, 'current'>,
): string {
  let repaired = exactRepairs
    .filter((repair) => repair.legacySource === context.current.legacySource)
    .reduce(replaceAuditedOccurrence, markdown)

  if (
    context.current.legacySource === 'api/ocrOptionsType.md' &&
    !/^#\s+\S/m.test(repaired)
  ) {
    repaired = `# OcrOptions\n\n${repaired}`
  }

  return repaired
}

function inlineCodeRanges(line: string): readonly (readonly [number, number])[] {
  const ranges: Array<readonly [number, number]> = []
  let index = 0
  while (index < line.length) {
    if (line[index] !== '`' || line[index - 1] === '\\') {
      index += 1
      continue
    }
    let length = 1
    while (line[index + length] === '`') length += 1
    const delimiter = '`'.repeat(length)
    const closing = line.indexOf(delimiter, index + length)
    if (closing < 0) {
      index += length
      continue
    }
    ranges.push([index, closing + length])
    index = closing + length
  }
  return ranges
}

function escapeVueLiterals(line: string): string {
  const ranges = inlineCodeRanges(line)
  let output = ''
  let index = 0
  while (index < line.length) {
    const protectedCode = ranges.some(
      ([start, end]) => index >= start && index < end,
    )
    if (!protectedCode && line.startsWith('{{', index)) {
      output += '&#123;&#123;'
      index += 2
      continue
    }
    if (!protectedCode && line.startsWith('}}', index)) {
      output += '&#125;&#125;'
      index += 2
      continue
    }
    output += line[index]
    index += 1
  }
  return output
}

function normalizeMarkdownSyntax(markdown: string): string {
  let fence: { readonly marker: string; readonly length: number } | undefined

  return markdown
    .split(/(?<=\n)/)
    .map((lineWithEnding) => {
      const hasNewline = lineWithEnding.endsWith('\n')
      const line = hasNewline ? lineWithEnding.slice(0, -1) : lineWithEnding
      const fenceMatch = /^(\s{0,3})(`{3,}|~{3,})(.*)$/.exec(line)

      if (fence) {
        if (
          fenceMatch &&
          fenceMatch[2][0] === fence.marker &&
          fenceMatch[2].length >= fence.length &&
          fenceMatch[3].trim() === ''
        ) {
          fence = undefined
        }
        return lineWithEnding
      }

      if (fenceMatch) {
        fence = { marker: fenceMatch[2][0], length: fenceMatch[2].length }
        const info = fenceMatch[3]
        const normalizedInfo = info.replace(
          /^(\s*)(?:badjs|e4x)(?=\s|$)/i,
          '$1js',
        )
        return (
          fenceMatch[1] +
          fenceMatch[2] +
          normalizedInfo +
          (hasNewline ? '\n' : '')
        )
      }

      return escapeVueLiterals(line) + (hasNewline ? '\n' : '')
    })
    .join('')
}

export function preprocessMarkdown(
  markdown: string,
  context: Pick<MigrationContext, 'current'>,
): string {
  return normalizeMarkdownSyntax(
    applyBrandPolicy(repairKnownContentDefects(markdown, context), context),
  )
}

export function migrateMarkdown(
  markdown: string,
  context: MigrationContext,
): string {
  const preprocessed = preprocessMarkdown(markdown, context)
  const linkContext: MarkdownLinkContext = {
    current: context.current,
    entries: context.entries,
    headingIndex: context.headingIndex,
  }
  return rewriteMarkdownLinks(preprocessed, linkContext)
}

function isInsideRoot(root: string, candidate: string): boolean {
  const relativePath = relative(root, candidate)
  return (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !isAbsolute(relativePath))
  )
}

export function resolveRepoPath(
  rootDirectory: string,
  repositoryPath: string,
): string {
  if (isAbsolute(repositoryPath)) {
    throw new Error(`Expected relative repository path: ${repositoryPath}`)
  }

  const root = resolve(rootDirectory)
  const candidate = resolve(root, repositoryPath)
  if (!isInsideRoot(root, candidate)) {
    throw new Error(`Path is outside repository root: ${repositoryPath}`)
  }

  let existingAncestor = candidate
  while (!existsSync(existingAncestor)) {
    const parent = dirname(existingAncestor)
    if (parent === existingAncestor) break
    existingAncestor = parent
  }
  if (existsSync(existingAncestor)) {
    const realRoot = realpathSync(root)
    const realAncestor = realpathSync(existingAncestor)
    if (!isInsideRoot(realRoot, realAncestor)) {
      throw new Error(`Path crosses a symlink outside repository root: ${repositoryPath}`)
    }
  }
  if (existsSync(candidate) && lstatSync(candidate).isSymbolicLink()) {
    throw new Error(`Refusing repository operation through symlink: ${repositoryPath}`)
  }

  return candidate
}

function writeIfChanged(path: string, content: string): boolean {
  if (existsSync(path) && readFileSync(path, 'utf8') === content) return false
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
  return true
}

function copyIfChanged(source: string, destination: string): boolean {
  if (
    existsSync(destination) &&
    readFileSync(source).equals(readFileSync(destination))
  ) {
    return false
  }
  mkdirSync(dirname(destination), { recursive: true })
  copyFileSync(source, destination)
  return true
}

function migratedImageName(name: string): string {
  return name.replace(/^autojs6-notification-/i, 'monkeyking-notification-')
}

function removeIfPresent(path: string): boolean {
  if (!existsSync(path)) return false
  rmSync(path, { recursive: statSync(path).isDirectory(), force: true })
  return true
}

function removeLegacyArtifacts(rootDirectory: string): number {
  let deleted = 0
  for (const repositoryPath of [
    'api/static',
    'api/index.html',
    'api/CNAME',
    'api/images',
    'docs/assets',
    'docs/images',
    'docs/plugins',
  ]) {
    if (removeIfPresent(resolveRepoPath(rootDirectory, repositoryPath))) {
      deleted += 1
    }
  }

  const docsDirectory = resolveRepoPath(rootDirectory, 'docs')
  if (existsSync(docsDirectory)) {
    for (const entry of readdirSync(docsDirectory, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.html')) {
        if (
          removeIfPresent(
            resolveRepoPath(rootDirectory, `docs/${entry.name}`),
          )
        ) {
          deleted += 1
        }
      }
    }
  }
  return deleted
}

export async function migrateContent(
  options: MigrateContentOptions = {},
): Promise<MigrateContentReport> {
  const rootDirectory = resolve(options.rootDirectory ?? process.cwd())
  const entries = options.entries ?? contentEntries
  const imageNames = options.imageNames ?? legacyImageNames
  const retiredSources = options.deletedSources ?? deletedLegacySources

  const preprocessedSources = entries.map((entry) => {
    const legacyPath = resolveRepoPath(rootDirectory, entry.legacySource)
    const canonicalPath = resolveRepoPath(rootDirectory, entry.source)
    const inputPath = existsSync(legacyPath) ? legacyPath : canonicalPath
    if (!existsSync(inputPath) || !statSync(inputPath).isFile()) {
      throw new Error(
        `Missing migration input for ${entry.id}: ${entry.legacySource} or ${entry.source}`,
      )
    }
    return {
      entry,
      markdown: preprocessMarkdown(readFileSync(inputPath, 'utf8'), {
        current: entry,
      }),
    }
  })

  const headingIndex = await buildHeadingIndex(preprocessedSources)
  let entriesWritten = 0
  for (const source of preprocessedSources) {
    const migrated = rewriteMarkdownLinks(source.markdown, {
      current: source.entry,
      entries,
      headingIndex,
    })
    const destination = resolveRepoPath(rootDirectory, source.entry.source)
    if (writeIfChanged(destination, migrated)) entriesWritten += 1
  }

  let imagesCopied = 0
  for (const imageName of imageNames) {
    const source = resolveRepoPath(rootDirectory, `api/images/${imageName}`)
    const destination = resolveRepoPath(
      rootDirectory,
      `docs/public/images/${migratedImageName(imageName)}`,
    )
    if (existsSync(source)) {
      if (copyIfChanged(source, destination)) imagesCopied += 1
    } else if (!existsSync(destination)) {
      throw new Error(`Missing migration image: ${imageName}`)
    }
  }

  const legacyCname = resolveRepoPath(rootDirectory, 'api/CNAME')
  const publicCname = resolveRepoPath(rootDirectory, 'docs/public/CNAME')
  if (existsSync(legacyCname)) {
    copyIfChanged(legacyCname, publicCname)
  } else if (!existsSync(publicCname) && options.entries === undefined) {
    throw new Error('Missing api/CNAME and docs/public/CNAME')
  }

  let pathsDeleted = 0
  for (const repositoryPath of [
    ...entries.map((entry) => entry.legacySource),
    ...retiredSources,
  ]) {
    if (removeIfPresent(resolveRepoPath(rootDirectory, repositoryPath))) {
      pathsDeleted += 1
    }
  }
  pathsDeleted += removeLegacyArtifacts(rootDirectory)

  return Object.freeze({ entriesWritten, imagesCopied, pathsDeleted })
}

function isDirectExecution(): boolean {
  const executable = process.argv[1]
  return executable !== undefined && pathToFileURL(resolve(executable)).href === import.meta.url
}

if (isDirectExecution()) {
  migrateContent()
    .then((report) => {
      process.stdout.write(
        `Migrated ${contentEntries.length} entries (${report.entriesWritten} written), ` +
          `${report.imagesCopied} images copied, ${report.pathsDeleted} legacy paths removed.\n`,
      )
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.stack ?? error.message : String(error)
      process.stderr.write(`${message}\n`)
      process.exitCode = 1
    })
}
