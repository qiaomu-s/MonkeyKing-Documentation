import {
  INTERNAL_API_MANIFEST_SCHEMA_VERSION,
  type AnnotationEvidence,
  type ApiManifest,
  type ApiModule,
  type ApiSymbol,
  type ApiSymbolKind,
  type AppliedOverride,
  type DeclarationHint,
  type DynamicAssignmentName,
  type DynamicOverride,
  type PublicApiManifest,
  type SourceLocation,
} from './model'
import {
  findBalancedRange,
  lineNumberAt,
  maskComments,
  maskNonCode,
  splitTopLevel,
  type BalancedRange,
} from './lexer'
import type { SourceReader } from './source-reader'
import { projectApiManifest } from './public-projection'

export interface ExtractApiManifestOptions {
  readonly repository: string
  readonly ref: string
  readonly overrides?: readonly DynamicOverride[]
}

interface Registration {
  readonly className: string
  readonly targetName: string
  readonly withDollarPrefix: boolean
  readonly prototypeExpressions: readonly string[]
  readonly source: SourceLocation
  readonly lambdaNames: readonly string[]
}

interface MethodMetadata {
  readonly annotations: ReadonlyMap<string, readonly string[]>
  readonly locations: ReadonlyMap<string, SourceLocation>
  readonly signatures: ReadonlyMap<string, readonly string[]>
  readonly overloads: ReadonlyMap<string, readonly string[]>
  readonly evidence: readonly AnnotationEvidence[]
  readonly hints: readonly DeclarationHint[]
}

const assignmentKinds = {
  selfAssignmentProperties: 'property',
  globalAssignmentProperties: 'property',
  selfAssignmentFunctions: 'function',
  globalAssignmentFunctions: 'function',
  selfAssignmentGetters: 'getter',
  globalAssignmentGetters: 'getter',
  selfAssignmentGettersAndSetters: 'getter',
  selfAssignmentJavaClasses: 'class',
  globalAssignmentJavaClasses: 'class',
} as const satisfies Readonly<Record<string, ApiSymbolKind>>

type AssignmentName = keyof typeof assignmentKinds

const dynamicAssignmentNames = Object.keys(
  assignmentKinds,
) as DynamicAssignmentName[]

const annotationNames = new Set([
  'AugmentableProxyInterface',
  'AugmentableSimpleGetterProxyInterface',
  'RhinoFunctionBody',
  'RhinoFunctionObjectBody',
  'RhinoRuntimeFunctionInterface',
  'RhinoRuntimeFunctionWithThisObjInterface',
  'RhinoSingletonFunctionInterface',
  'RhinoStandardFunctionInterface',
  'ScriptClass',
  'ScriptInterface',
  'ScriptVariable',
])

const publicMemberAnnotationNames = new Set([
  'RhinoFunctionObjectBody',
  'RhinoRuntimeFunctionInterface',
  'RhinoRuntimeFunctionWithThisObjInterface',
  'RhinoSingletonFunctionInterface',
  'RhinoStandardFunctionInterface',
  'ScriptClass',
  'ScriptInterface',
  'ScriptVariable',
])

const kotlinIdentifierSource =
  '(?:[A-Za-z_][A-Za-z0-9_]*|`[^`\\r\\n]+`)'

function normalizeKotlinIdentifier(value: string): string {
  return value.startsWith('`') && value.endsWith('`')
    ? value.slice(1, -1)
    : value
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, 'en')
}

function location(path: string, source: string, offset: number): SourceLocation {
  return { path, line: lineNumberAt(source, offset) }
}

function lowerFirst(value: string): string {
  return value.slice(0, 1).toLowerCase() + value.slice(1)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stringLiterals(expression: string): Array<{
  readonly value: string
  readonly offset: number
}> {
  const values: Array<{ value: string; offset: number }> = []
  const pattern = /"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(expression)) !== null) {
    const raw = match[1] ?? match[2] ?? ''
    values.push({
      value: raw
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\([\\"'])/g, '$1'),
      offset: match.index,
    })
  }
  return values
}

function referencedNames(expression: string): string[] {
  const code = maskComments(expression)
  const references: Array<{ value: string; offset: number }> = [
    ...stringLiterals(code),
  ]
  const functionPattern = new RegExp(
    `::(${kotlinIdentifierSource})\\.name(\\.lowercase\\(\\))?`,
    'g',
  )
  let match: RegExpExecArray | null

  while ((match = functionPattern.exec(code)) !== null) {
    const raw = normalizeKotlinIdentifier(match[1])
    references.push({
      value: match[2] ? raw.toLowerCase() : raw,
      offset: match.index,
    })
  }

  const unique = new Set<string>()
  return references
    .sort((left, right) => left.offset - right.offset)
    .map(({ value }) => value)
    .filter((value) => {
      if (unique.has(value)) return false
      unique.add(value)
      return true
    })
}

function listOfNames(expression: string): string[] | null {
  const masked = maskNonCode(expression)
  const match = /\blistOf(?:<[^>]+>)?\s*\(/.exec(masked)
  if (!match) return null
  const open = masked.indexOf('(', match.index + match[0].length - 1)
  const range = findBalancedRange(expression, open, '(', ')')
  return referencedNames(expression.slice(range.start + 1, range.end))
}

function functionExposure(expression: string): {
  readonly methodName: string | undefined
  readonly exposedNames: readonly string[]
} {
  const references = referencedNames(expression)
  const methodName = references[0]
  if (!methodName) return { methodName: undefined, exposedNames: [] }
  const listedAliases = listOfNames(expression)
  if (listedAliases) {
    return { methodName, exposedNames: listedAliases }
  }
  return {
    methodName,
    exposedNames: references.length > 1 ? references.slice(1) : [methodName],
  }
}

function extractImports(source: string): ReadonlyMap<string, string> {
  const imports = new Map<string, string>()
  const pattern = /^\s*import\s+([A-Za-z0-9_.]+)(?:\s+as\s+([A-Za-z0-9_]+))?/gm
  let match: RegExpExecArray | null

  while ((match = pattern.exec(source)) !== null) {
    const qualified = match[1]
    const localName = match[2] ?? qualified.slice(qualified.lastIndexOf('.') + 1)
    imports.set(localName, qualified)
  }
  return imports
}

function findSourcePathForImport(
  className: string,
  imports: ReadonlyMap<string, string>,
  sourceFiles: readonly string[],
): string | null {
  const qualified = imports.get(className)
  if (!qualified) return null
  return findSourcePathForQualifiedType(qualified, sourceFiles, className)
}

function findSourcePathForQualifiedType(
  qualifiedName: string,
  sourceFiles: readonly string[],
  localName = qualifiedName.split('.').at(-1) ?? qualifiedName,
): string | null {
  const segments = qualifiedName.split('.')
  for (let length = segments.length; length > 0; length -= 1) {
    const relative = segments.slice(0, length).join('/')
    const exact = sourceFiles.find(
      (path) =>
        path.endsWith(`${relative}.kt`) || path.endsWith(`${relative}.java`),
    )
    if (exact) return exact
  }

  const packagePath = segments.slice(0, -1).join('/')
  return (
    sourceFiles.find((path) => {
      if (packagePath && !path.includes(`/${packagePath}/`)) return false
      const fileName = path
        .slice(path.lastIndexOf('/') + 1)
        .replace(/\.(?:kt|java)$/, '')
      return fileName.toLowerCase() === localName.toLowerCase()
    }) ?? null
  )
}

function extractFunctionBody(source: string, functionName: string): string {
  const masked = maskNonCode(source)
  const pattern = new RegExp(`\\bfun\\s+${functionName}\\s*\\(`)
  const match = pattern.exec(masked)
  if (!match) throw new Error(`Cannot find function ${functionName}().`)
  const openBrace = masked.indexOf('{', match.index + match[0].length)
  if (openBrace < 0) throw new Error(`Cannot find body for ${functionName}().`)
  const range = findBalancedRange(source, openBrace, '{', '}')
  return source.slice(range.start + 1, range.end)
}

function parseRegistrations(path: string, source: string): Registration[] {
  const body = extractFunctionBody(source, 'augment')
  const bodyStart = source.indexOf(body)
  const masked = maskNonCode(body)
  const pattern =
    /\b([A-Z][A-Za-z0-9_]*)\s*(?:\([^{};\n]*?\))?\s*\.\s*(augmentWithRuntime|augment|proxying)\s*\(/g
  const registrations: Registration[] = []
  let match: RegExpExecArray | null

  while ((match = pattern.exec(masked)) !== null) {
    const open = masked.indexOf('(', match.index + match[0].length - 1)
    const range = findBalancedRange(body, open, '(', ')')
    const args = splitTopLevel(body.slice(range.start + 1, range.end), ',')
    const targetName = args[0]?.trim()
    if (!targetName || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(targetName)) continue

    const booleans = args
      .slice(1)
      .map((argument) => argument.trim())
      .filter((argument) => argument === 'true' || argument === 'false')
    const prototypeIndex = match[2] === 'augmentWithRuntime' ? 2 : 1
    const prototypeCandidate = args[prototypeIndex]?.trim()
    const prototypeExpressions =
      prototypeCandidate &&
      !/^(?:true|false|null|READONLY|PERMANENT|DONTENUM|\d+)$/.test(
        prototypeCandidate,
      )
        ? [prototypeCandidate]
        : []
    const suffix = body.slice(range.end + 1, range.end + 320)
    const lambdaNames = [...suffix.matchAll(/\.also\s*\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*->/g)]
      .map((lambda) => lambda[1])

    registrations.push({
      className: match[1],
      targetName,
      withDollarPrefix: booleans.at(-1) !== 'false',
      prototypeExpressions,
      source: location(path, source, bodyStart + match.index),
      lambdaNames,
    })
    pattern.lastIndex = range.end + 1
  }

  return registrations
}

function parseAssignedAugmentables(path: string, source: string): Registration[] {
  const body = extractFunctionBody(source, 'augment')
  const bodyStart = source.indexOf(body)
  const masked = maskNonCode(body)
  const pattern =
    /\b([A-Z][A-Za-z0-9_]*)\s*(?:\([^{};\n]*?\))?\s*\.\s*assignWithRuntime\s*\(\s*target\b/g
  return [...masked.matchAll(pattern)].map((match) => ({
    className: match[1],
    targetName: 'global',
    withDollarPrefix: false,
    prototypeExpressions: [],
    source: location(path, source, bodyStart + (match.index ?? 0)),
    lambdaNames: [],
  }))
}

function augmentableCapabilities(
  className: string,
  source: string,
): { readonly callable: boolean; readonly constructable: boolean } {
  const masked = maskNonCode(source)
  const declaration = new RegExp(
    `\\b(?:class|object)\\s+${escapeRegExp(className)}\\b`,
  ).exec(masked)
  if (!declaration) return { callable: false, constructable: false }
  const bodyStart = masked.indexOf('{', declaration.index + declaration[0].length)
  const header = masked.slice(
    declaration.index,
    bodyStart < 0 ? declaration.index + 1_000 : bodyStart,
  )
  const versatile = /\bVersatile\b/.test(header)
  return {
    callable: versatile || /\bInvokable\b/.test(header),
    constructable: versatile || /\bConstructable\b/.test(header),
  }
}

function declaredMethodLocation(
  path: string,
  source: string,
  className: string,
  methodName: string,
): SourceLocation {
  const masked = maskNonCode(source)
  const match = new RegExp(
    `\\b(?:override\\s+)?fun\\s+${escapeRegExp(methodName)}\\s*\\(`,
  ).exec(masked)
  const classDeclaration = new RegExp(
    `\\b(?:class|object)\\s+${escapeRegExp(className)}\\b`,
  ).exec(masked)
  return location(path, source, match?.index ?? classDeclaration?.index ?? 0)
}

function explicitKey(
  className: string,
  source: string,
  override: DynamicOverride | undefined,
): { readonly key: string; readonly dynamic: boolean } {
  if (override?.key) return { key: override.key, dynamic: true }

  const literal = source.match(
    /override\s+val\s+key(?:\s*:\s*[^=\n]+)?\s*=\s*"([^"]+)"/,
  )
  if (literal) return { key: literal[1], dynamic: false }

  const keyDeclaration = source.match(
    /override\s+val\s+key(?:\s*:\s*[^=\n]+)?\s*=\s*([^\n]+)/,
  )
  if (!keyDeclaration) return { key: lowerFirst(className), dynamic: false }

  const expression = keyDeclaration[1]
  if (/super\.key\.lowercase\(\)/.test(expression)) {
    return { key: className.toLowerCase(), dynamic: false }
  }
  if (/javaClass\.simpleName(?!\.lowercaseFirstChar)/.test(expression)) {
    return { key: className, dynamic: false }
  }
  if (/lowercaseFirstChar\(\)/.test(expression)) {
    return { key: lowerFirst(className), dynamic: false }
  }

  throw new Error(
    `Dynamic key for ${className} requires an auditable override: ${expression.trim()}`,
  )
}

function parseDeclarationHints(path: string, source: string): DeclarationHint[] {
  const hints: DeclarationHint[] = []
  const marker = /^[ \t]*\/\/[ \t]*@(Signature|Overload)(?:[ \t]+([^\r\n]*))?[ \t]*$/gm
  let match: RegExpExecArray | null

  while ((match = marker.exec(source)) !== null) {
    const kind = match[1] === 'Signature' ? 'signature' : 'overload'
    const inline = match[2]?.trim()
    if (inline) {
      hints.push({
        path,
        line: lineNumberAt(source, match.index),
        kind,
        value: inline,
      })
      continue
    }

    let cursor = marker.lastIndex
    if (source[cursor] === '\r') cursor += 1
    if (source[cursor] === '\n') cursor += 1
    while (cursor < source.length) {
      const lineEnd = source.indexOf('\n', cursor)
      const end = lineEnd < 0 ? source.length : lineEnd
      const comment = /^[ \t]*\/\/[ \t]*(.*?)[ \t]*\r?$/.exec(
        source.slice(cursor, end),
      )
      if (!comment || /^@(Signature|Overload)\b/.test(comment[1])) break
      const value = comment[1].trim()
      if (!value) break
      hints.push({
        path,
        line: lineNumberAt(source, cursor),
        kind,
        value,
      })
      cursor = lineEnd < 0 ? source.length : lineEnd + 1
    }
    marker.lastIndex = cursor
  }

  const typescript = /TypeScript Declarations\s*:/g
  while ((match = typescript.exec(source)) !== null) {
    hints.push({
      path,
      line: lineNumberAt(source, match.index),
      kind: 'typescript',
      value: 'TypeScript Declarations',
    })
  }
  return hints
}

function nextDeclaredMember(masked: string, start: number): {
  readonly name: string
  readonly offset: number
  readonly public: boolean
} | null {
  let declarationStart = start
  const skipWhitespace = (): void => {
    while (/\s/.test(masked[declarationStart] ?? '')) declarationStart += 1
  }
  const skipParenthesizedArguments = (): boolean => {
    if (masked[declarationStart] !== '(') return true
    let depth = 0
    for (let index = declarationStart; index < masked.length; index += 1) {
      if (masked[index] === '(') depth += 1
      if (masked[index] !== ')') continue
      depth -= 1
      if (depth === 0) {
        declarationStart = index + 1
        return true
      }
    }
    return false
  }

  skipWhitespace()
  if (!skipParenthesizedArguments()) return null
  skipWhitespace()
  while (masked[declarationStart] === '@') {
    const annotation = /^@(?:[A-Za-z_][A-Za-z0-9_]*:)?[A-Za-z_][A-Za-z0-9_.]*/.exec(
      masked.slice(declarationStart),
    )
    if (!annotation) return null
    declarationStart += annotation[0].length
    skipWhitespace()
    if (!skipParenthesizedArguments()) return null
    skipWhitespace()
  }

  const tail = masked.slice(declarationStart, declarationStart + 900)
  const kotlin = new RegExp(
    `^(?:(public|private|protected|internal)\\s+)?` +
      `(?:(?:override|open|final|abstract|sealed|data|enum|annotation|value|suspend|operator|infix|tailrec|external|inline|const|lateinit)\\s+)*` +
      `(?:fun|val|var|class|object|interface)\\s+(?:<[^>]+>\\s*)?(${kotlinIdentifierSource})`,
  )
  const java = /^(public|protected|private)\s+(?:(?:static|final|abstract|synchronized|native)\s+)*(?:[A-Za-z_][A-Za-z0-9_$.<>?\[\], ]*\s+)([A-Za-z_][A-Za-z0-9_]*)\s*(?:\(|=|;)/
  const kotlinMatch = kotlin.exec(tail)
  const javaMatch = java.exec(tail)
  const candidates = [
    ...(kotlinMatch
      ? [{
          match: kotlinMatch,
          name: normalizeKotlinIdentifier(kotlinMatch[2]),
          public: !['private', 'protected', 'internal'].includes(kotlinMatch[1] ?? ''),
        }]
      : []),
    ...(javaMatch
      ? [{
          match: javaMatch,
          name: javaMatch[2],
          public: javaMatch[1] === 'public',
        }]
      : []),
  ].sort((left, right) => left.match.index - right.match.index)
  const candidate = candidates[0]
  return candidate
    ? {
        name: candidate.name,
        offset: declarationStart + candidate.match.index,
        public: candidate.public,
      }
    : null
}

function parseMethodMetadata(path: string, source: string): MethodMetadata {
  const masked = maskNonCode(source)
  const grouped = new Map<
    string,
    { annotations: Set<string>; source: SourceLocation }
  >()
  const evidence: AnnotationEvidence[] = []
  const annotationPattern = /@(?:get:)?([A-Za-z_][A-Za-z0-9_]*)/g
  let match: RegExpExecArray | null

  while ((match = annotationPattern.exec(masked)) !== null) {
    const annotation = match[1]
    if (!annotationNames.has(annotation)) continue
    const declaration = nextDeclaredMember(masked, annotationPattern.lastIndex)
    if (!declaration?.public) continue
    const sourceLocation = location(path, source, declaration.offset)
    const existing = grouped.get(declaration.name) ?? {
      annotations: new Set<string>(),
      source: sourceLocation,
    }
    existing.annotations.add(annotation)
    grouped.set(declaration.name, existing)
  }

  const annotations = new Map<string, readonly string[]>()
  const locations = new Map<string, SourceLocation>()
  for (const [member, data] of grouped) {
    const values = [...data.annotations].sort(compareText)
    annotations.set(member, values)
    locations.set(member, data.source)
    evidence.push({
      path,
      line: data.source.line,
      member,
      annotations: values,
    })
  }

  const hints = parseDeclarationHints(path, source)
  const signatures = new Map<string, string[]>()
  const overloads = new Map<string, string[]>()
  for (const hint of hints) {
    if (hint.kind === 'typescript') continue
    const rawName = new RegExp(`^(${kotlinIdentifierSource})\\s*\\(`).exec(
      hint.value,
    )?.[1]
    if (!rawName) continue
    const name = normalizeKotlinIdentifier(rawName)
    const target = hint.kind === 'signature' ? signatures : overloads
    const values = target.get(name) ?? []
    values.push(hint.value)
    target.set(name, values)
  }

  return {
    annotations,
    locations,
    signatures,
    overloads,
    evidence,
    hints,
  }
}

function assignmentLists(
  path: string,
  source: string,
): Array<{
  readonly name: AssignmentName
  readonly entries: readonly { expression: string; source: SourceLocation }[]
}> {
  const masked = maskNonCode(source)
  const names = Object.keys(assignmentKinds) as AssignmentName[]
  const lists: Array<{
    name: AssignmentName
    entries: Array<{ expression: string; source: SourceLocation }>
  }> = []

  for (const name of names) {
    const pattern = new RegExp(
      `override\\s+val\\s+${name}(?:\\s*:[^=\\n]+)?\\s*=\\s*listOf(?:<[^\\n(]+>)?\\s*\\(`,
      'g',
    )
    let match: RegExpExecArray | null
    while ((match = pattern.exec(masked)) !== null) {
      const open = masked.indexOf('(', match.index + match[0].length - 1)
      const range = findBalancedRange(source, open, '(', ')')
      const inner = source.slice(range.start + 1, range.end)
      const innerOffset = range.start + 1
      const entries = splitTopLevel(inner, ',')
        .filter((expression) => maskComments(expression).trim().length > 0)
        .map((expression) => {
          const relativeOffset = inner.indexOf(expression)
          return {
            expression,
            source: location(path, source, innerOffset + Math.max(relativeOffset, 0)),
          }
        })
      lists.push({ name, entries })
      pattern.lastIndex = range.end + 1
    }
  }
  return lists
}

function assertDynamicAssignmentsAreOverridden(
  className: string,
  source: string,
  override: DynamicOverride | undefined,
): void {
  const masked = maskNonCode(source)
  for (const name of dynamicAssignmentNames) {
    const declaration = new RegExp(
      `override\\s+val\\s+${name}(?:\\s*:[^=\\n]+)?\\s*=\\s*`,
      'g',
    )
    let match: RegExpExecArray | null
    while ((match = declaration.exec(masked)) !== null) {
      const expression = masked.slice(declaration.lastIndex)
      if (/^listOf(?:<[^\n(]+>)?\s*\(/.test(expression)) continue
      if (override?.assignments?.includes(name)) continue
      throw new Error(
        `${className}.${name} uses a computed assignment and requires an auditable override.`,
      )
    }
  }
}

function makeSymbol(
  id: string,
  owner: string,
  name: string,
  kind: ApiSymbolKind,
  source: SourceLocation,
  metadata: MethodMetadata,
  canonicalId?: string,
  isPublic = true,
  metadataName = name,
): ApiSymbol {
  return {
    id,
    owner,
    name,
    kind,
    public: isPublic,
    ...(canonicalId ? { canonicalId } : {}),
    source: metadata.locations.get(metadataName) ?? source,
    annotations: metadata.annotations.get(metadataName) ?? [],
    signatures: metadata.signatures.get(metadataName) ?? [],
    overloads: metadata.overloads.get(metadataName) ?? [],
  }
}

function addSymbol(symbols: Map<string, ApiSymbol>, symbol: ApiSymbol): void {
  const existing = symbols.get(symbol.id)
  if (!existing) {
    symbols.set(symbol.id, symbol)
    return
  }

  const providerKey = ({ path, line }: SourceLocation) => `${path}:${line}`
  const providers = [
    ...(existing.providers ?? [existing.source]),
    ...(symbol.providers ?? [symbol.source]),
  ]
    .filter(
      (provider, index, all) =>
        all.findIndex((candidate) => providerKey(candidate) === providerKey(provider)) ===
        index,
    )
    .sort((left, right) =>
      compareText(left.path, right.path) || left.line - right.line,
    )
  const annotations = [...new Set([...existing.annotations, ...symbol.annotations])].sort(
    compareText,
  )
  const signatures = [...new Set([...existing.signatures, ...symbol.signatures])].sort(
    compareText,
  )
  const overloads = [...new Set([...existing.overloads, ...symbol.overloads])].sort(
    compareText,
  )
  const canonicalId =
    existing.canonicalId === symbol.canonicalId ? existing.canonicalId : undefined

  symbols.set(symbol.id, {
    ...existing,
    kind: existing.kind === symbol.kind ? existing.kind : 'global',
    public: existing.public || symbol.public,
    ...(canonicalId ? { canonicalId } : { canonicalId: undefined }),
    source: providers[0],
    providers,
    annotations,
    signatures,
    overloads,
  })
}

function addAssignments(
  symbols: Map<string, ApiSymbol>,
  owner: string,
  sourcePath: string,
  source: string,
  metadata: MethodMetadata,
): void {
  for (const assignment of assignmentLists(sourcePath, source)) {
    const kind = assignmentKinds[assignment.name]
    const isSelf = assignment.name.startsWith('self')
    const isFunction = assignment.name.endsWith('Functions')

    for (const entry of assignment.entries) {
      const names = referencedNames(entry.expression)
      const functionNames = isFunction
        ? functionExposure(entry.expression)
        : { methodName: names[0], exposedNames: names.slice(0, 1) }
      const canonicalName = functionNames.methodName
      if (!canonicalName) continue
      const exposedNames = functionNames.exposedNames
      const activeExpression = maskComments(entry.expression)
      const isIgnored = /\bAS_IGNORED\b/.test(activeExpression)
      const isGlobal =
        !isSelf || /\bAS_GLOBAL\b/.test(activeExpression) || owner === 'global'
      const primaryName = exposedNames.includes(canonicalName)
        ? canonicalName
        : exposedNames[0]
      if (!primaryName) continue

      let selfCanonicalId: string | undefined

      if (isSelf && !isIgnored && owner !== 'global') {
        selfCanonicalId = `${owner}.${primaryName}`
        for (const exposedName of exposedNames) {
          addSymbol(
            symbols,
            exposedName === primaryName
              ? makeSymbol(
                  selfCanonicalId,
                  owner,
                  exposedName,
                  kind,
                  entry.source,
                  metadata,
                  undefined,
                  true,
                  canonicalName,
                )
              : makeSymbol(
                  `alias:${owner}.${exposedName}`,
                  owner,
                  exposedName,
                  'alias',
                  entry.source,
                  metadata,
                  selfCanonicalId,
                  true,
                  canonicalName,
                ),
          )
        }
      }

      if (isGlobal) {
        const globalKind = !isSelf || owner === 'global' ? kind : 'global'
        const globalCanonicalId = selfCanonicalId ?? `global:${primaryName}`
        for (const exposedName of exposedNames) {
          const globalId = `global:${exposedName}`
          const isPrimaryGlobal = !selfCanonicalId && exposedName === primaryName
          addSymbol(
            symbols,
            makeSymbol(
              globalId,
              'global',
              exposedName,
              isPrimaryGlobal ? globalKind : selfCanonicalId ? globalKind : 'alias',
              entry.source,
              metadata,
              isPrimaryGlobal ? undefined : globalCanonicalId,
              true,
              canonicalName,
            ),
          )
        }
      }
    }
  }
}

function engineGlobals(
  symbols: Map<string, ApiSymbol>,
  path: string,
  source: string,
): void {
  const masked = maskNonCode(source)
  const pattern = /\.defineProp\s*\(/g
  const emptyMetadata: MethodMetadata = {
    annotations: new Map(),
    locations: new Map(),
    signatures: new Map(),
    overloads: new Map(),
    evidence: [],
    hints: [],
  }
  let match: RegExpExecArray | null

  while ((match = pattern.exec(masked)) !== null) {
    const open = masked.indexOf('(', match.index)
    const range = findBalancedRange(source, open, '(', ')')
    const firstArgument = splitTopLevel(
      source.slice(range.start + 1, range.end),
      ',',
    )[0]
    const name = firstArgument ? stringLiterals(firstArgument)[0]?.value : undefined
    if (!name) continue
    addSymbol(
      symbols,
      makeSymbol(
        `global:${name}`,
        'global',
        name,
        'engine-global',
        location(path, source, match.index),
        emptyMetadata,
        undefined,
        name !== '__engine__',
      ),
    )
    pattern.lastIndex = range.end + 1
  }
}

function annotationCandidate(path: string): boolean {
  if (!/\.(?:kt|java)$/.test(path)) return false
  return [
    '/runtime/',
    '/core/',
    '/timing/',
    '/theme/',
    '/pluginclient/',
    '/execution/ScriptExecuteActivity.',
    '/util/App.',
    '/lang/ThreadCompat.',
  ].some((segment) => path.includes(segment))
}

function classSourcePath(
  registration: Registration,
  imports: ReadonlyMap<string, string>,
  sourceFiles: readonly string[],
): string {
  const path = findSourcePathForImport(registration.className, imports, sourceFiles)
  if (path) return path
  throw new Error(
    `Cannot resolve source for registered augmentable ${registration.className}.`,
  )
}

interface PrototypeSource {
  readonly className: string
  readonly path: string
}

interface PrototypeMember {
  readonly name: string
  readonly kind: 'function' | 'property'
  readonly source: SourceLocation
  readonly metadata: MethodMetadata
}

interface PrototypeExtractionContext {
  readonly sourceFiles: readonly string[]
  readonly readMetadata: (
    path: string,
  ) => { readonly source: string; readonly metadata: MethodMetadata }
  readonly cache: Map<string, readonly PrototypeMember[]>
}

interface TypeBody {
  readonly kind: 'class' | 'object' | 'interface'
  readonly declaration: number
  readonly nameEnd: number
  readonly open: number
  readonly close: number
}

function runtimeValueTypes(source: string): ReadonlyMap<string, string> {
  const masked = maskNonCode(source)
  const types = new Map<string, string>()
  const references = new Map<string, string>()
  const identifier = '[A-Za-z_][A-Za-z0-9_]*'
  const explicit = new RegExp(
    `\\b(?:lateinit\\s+)?(?:val|var)\\s+(${identifier})\\s*:\\s*(${identifier})`,
    'g',
  )
  let match: RegExpExecArray | null

  while ((match = explicit.exec(masked)) !== null) {
    types.set(match[1], match[2])
  }

  const inferred = new RegExp(
    `\\b(?:val|var)\\s+(${identifier})(?:\\s*:[^=\\n]+)?\\s*=\\s*` +
      `(${identifier}(?:\\.${identifier})*)`,
    'g',
  )
  while ((match = inferred.exec(masked)) !== null) {
    const expression = match[2]
    const parts = expression.split('.')
    const first = parts[0]
    const last = parts.at(-1) ?? first
    if (/^[A-Z]/.test(first)) {
      types.set(match[1], first)
    } else {
      references.set(match[1], last)
    }
  }

  let changed = true
  while (changed) {
    changed = false
    for (const [name, referencedName] of references) {
      const type = types.get(referencedName)
      if (!type || types.has(name)) continue
      types.set(name, type)
      changed = true
    }
  }
  return types
}

function prototypeTypeNames(
  expression: string,
  valueTypes: ReadonlyMap<string, string>,
  imports: ReadonlyMap<string, string>,
): string[] {
  const code = maskComments(expression)
  const types = new Set<string>()
  const pattern = /[A-Za-z_][A-Za-z0-9_]*/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(code)) !== null) {
    const name = match[0]
    const previous = code.slice(0, match.index).trimEnd().at(-1)
    const next = code.slice(match.index + name.length).trimStart().at(0)
    if (previous === '.' || next === '.') continue
    const valueType = valueTypes.get(name)
    if (valueType) {
      types.add(valueType)
      continue
    }
    if (imports.has(name)) types.add(name)
  }
  return [...types].sort(compareText)
}

function prototypeSource(
  typeName: string,
  imports: ReadonlyMap<string, string>,
  sourceFiles: readonly string[],
  currentPath?: string,
  currentSource?: string,
): PrototypeSource | null {
  const typeSegments = typeName.split('.')
  const importedRoot = imports.get(typeSegments[0])
  const qualifiedName = importedRoot
    ? [importedRoot, ...typeSegments.slice(1)].join('.')
    : imports.get(typeName) ?? (typeSegments.length > 1 ? typeName : undefined)
  const className = (qualifiedName ?? typeName).split('.').at(-1) ?? typeName
  const importedPath = qualifiedName
    ? findSourcePathForQualifiedType(qualifiedName, sourceFiles, className)
    : null
  const packageName = currentSource?.match(
    /^\s*package\s+([A-Za-z_][A-Za-z0-9_.]*)/m,
  )?.[1]
  const samePackagePath = packageName
    ? findSourcePathForQualifiedType(
        `${packageName}.${typeName}`,
        sourceFiles,
        className,
      )
    : null
  const currentDirectory = currentPath?.slice(0, currentPath.lastIndexOf('/'))
  const outerTypeName = typeSegments[0]
  const sameDirectoryPath = currentDirectory
    ? sourceFiles.find(
        (path) =>
          path === `${currentDirectory}/${outerTypeName}.kt` ||
          path === `${currentDirectory}/${outerTypeName}.java`,
      )
    : undefined
  const fallbackPath = sourceFiles
    .filter((path) =>
      path.endsWith(`/${className}.kt`) || path.endsWith(`/${className}.java`),
    )
    .sort((left, right) =>
      left.length - right.length || compareText(left, right),
    )[0]
  const path = importedPath ?? samePackagePath ?? sameDirectoryPath ?? fallbackPath
  return path ? { className, path } : null
}

function classBody(
  source: string,
  className: string,
): TypeBody | null {
  const masked = maskNonCode(source)
  const declaration = new RegExp(
    `\\b(class|object|interface)\\s+${escapeRegExp(className)}\\b`,
  ).exec(masked)
  if (!declaration) return null
  const nameEnd = declaration.index + declaration[0].length
  let roundDepth = 0
  let squareDepth = 0
  let angleDepth = 0
  let open = -1
  for (let index = nameEnd; index < masked.length; index += 1) {
    const character = masked[index]
    if (
      character === '{' &&
      roundDepth === 0 &&
      squareDepth === 0 &&
      angleDepth === 0
    ) {
      open = index
      break
    }
    if (character === '(') roundDepth += 1
    if (character === ')') roundDepth = Math.max(0, roundDepth - 1)
    if (character === '[') squareDepth += 1
    if (character === ']') squareDepth = Math.max(0, squareDepth - 1)
    if (character === '<') angleDepth += 1
    if (character === '>') angleDepth = Math.max(0, angleDepth - 1)
  }
  if (open < 0) return null
  const range = findBalancedRange(source, open, '{', '}')
  return {
    kind: declaration[1] as TypeBody['kind'],
    declaration: declaration.index,
    nameEnd,
    open,
    close: range.end,
  }
}

function splitTypeList(source: string): string[] {
  const masked = maskNonCode(source)
  const parts: string[] = []
  let start = 0
  let roundDepth = 0
  let squareDepth = 0
  let angleDepth = 0

  for (let index = 0; index < masked.length; index += 1) {
    const character = masked[index]
    if (
      character === ',' &&
      roundDepth === 0 &&
      squareDepth === 0 &&
      angleDepth === 0
    ) {
      parts.push(source.slice(start, index))
      start = index + 1
      continue
    }
    if (character === '(') roundDepth += 1
    if (character === ')') roundDepth = Math.max(0, roundDepth - 1)
    if (character === '[') squareDepth += 1
    if (character === ']') squareDepth = Math.max(0, squareDepth - 1)
    if (character === '<') angleDepth += 1
    if (character === '>') angleDepth = Math.max(0, angleDepth - 1)
  }
  parts.push(source.slice(start))
  return parts
}

function topLevelKeywordRanges(
  source: string,
  keywords: ReadonlySet<string>,
): Array<{ readonly keyword: string; readonly start: number; readonly end: number }> {
  const masked = maskNonCode(source)
  const ranges: Array<{ keyword: string; start: number; end: number }> = []
  let roundDepth = 0
  let squareDepth = 0
  let angleDepth = 0

  for (let index = 0; index < masked.length; index += 1) {
    const character = masked[index]
    if (character === '(') roundDepth += 1
    if (character === ')') roundDepth = Math.max(0, roundDepth - 1)
    if (character === '[') squareDepth += 1
    if (character === ']') squareDepth = Math.max(0, squareDepth - 1)
    if (character === '<') angleDepth += 1
    if (character === '>') angleDepth = Math.max(0, angleDepth - 1)
    if (
      roundDepth !== 0 ||
      squareDepth !== 0 ||
      angleDepth !== 0 ||
      !/[A-Za-z_]/.test(character)
    ) {
      continue
    }

    const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(masked.slice(index))
    if (!match) continue
    if (keywords.has(match[0])) {
      ranges.push({ keyword: match[0], start: index, end: index + match[0].length })
    }
    index += match[0].length - 1
  }
  return ranges
}

function topLevelCharacter(source: string, target: string): number {
  const masked = maskNonCode(source)
  let roundDepth = 0
  let squareDepth = 0
  let angleDepth = 0

  for (let index = 0; index < masked.length; index += 1) {
    const character = masked[index]
    if (
      character === target &&
      roundDepth === 0 &&
      squareDepth === 0 &&
      angleDepth === 0
    ) {
      return index
    }
    if (character === '(') roundDepth += 1
    if (character === ')') roundDepth = Math.max(0, roundDepth - 1)
    if (character === '[') squareDepth += 1
    if (character === ']') squareDepth = Math.max(0, squareDepth - 1)
    if (character === '<') angleDepth += 1
    if (character === '>') angleDepth = Math.max(0, angleDepth - 1)
  }
  return -1
}

function inheritedTypeName(declaration: string): string | null {
  const withoutAnnotations = declaration
    .trim()
    .replace(/^(?:@[A-Za-z_][A-Za-z0-9_.]*(?:\([^)]*\))?\s*)+/, '')
  const match = /^(?:[A-Za-z_][A-Za-z0-9_]*\.)*[A-Za-z_][A-Za-z0-9_]*/.exec(
    withoutAnnotations,
  )
  const name = match?.[0]
  return name && !['Any', 'Object', 'java.lang.Object'].includes(name)
    ? name
    : null
}

function inheritedTypeNames(
  source: string,
  prototype: PrototypeSource,
  body: TypeBody,
): string[] {
  const header = maskNonCode(source).slice(body.nameEnd, body.open)
  const declarations: string[] = []

  if (prototype.path.endsWith('.kt')) {
    const colon = topLevelCharacter(header, ':')
    if (colon >= 0) {
      let inheritance = header.slice(colon + 1)
      const where = topLevelKeywordRanges(
        inheritance,
        new Set(['where']),
      )[0]
      if (where) inheritance = inheritance.slice(0, where.start)
      declarations.push(...splitTypeList(inheritance))
    }
  } else {
    const clauses = topLevelKeywordRanges(
      header,
      new Set(['extends', 'implements']),
    )
    for (let index = 0; index < clauses.length; index += 1) {
      const clause = clauses[index]
      const end = clauses[index + 1]?.start ?? header.length
      declarations.push(...splitTypeList(header.slice(clause.end, end)))
    }
  }

  const seen = new Set<string>()
  return declarations
    .map(inheritedTypeName)
    .filter((name): name is string => {
      if (!name || seen.has(name)) return false
      seen.add(name)
      return true
    })
}

function declaredPrototypeMembers(
  source: string,
  prototype: PrototypeSource,
  metadata: MethodMetadata,
): PrototypeMember[] {
  const body = classBody(source, prototype.className)
  if (!body) return []
  const masked = maskNonCode(source)
  const depths = new Int16Array(body.close - body.open + 1)
  let depth = 0
  for (let index = body.open + 1; index < body.close; index += 1) {
    depths[index - body.open] = depth
    if (masked[index] === '{') depth += 1
    if (masked[index] === '}') depth -= 1
  }

  const companionRanges: BalancedRange[] = []
  if (prototype.path.endsWith('.kt')) {
    const companionPattern = /\bcompanion\s+object(?:\s+[A-Za-z_][A-Za-z0-9_]*)?\s*\{/g
    let companion: RegExpExecArray | null
    while ((companion = companionPattern.exec(masked)) !== null) {
      if (companion.index <= body.open || companion.index >= body.close) continue
      const open = masked.indexOf('{', companion.index)
      const range = findBalancedRange(source, open, '{', '}')
      companionRanges.push(range)
      companionPattern.lastIndex = range.end + 1
    }
  }

  const inDirectCompanionBody = (offset: number): boolean =>
    companionRanges.some(
      (range) =>
        offset > range.start &&
        offset < range.end &&
        depths[offset - body.open] === 1,
    )
  const nestedConstructorRanges: BalancedRange[] = []
  if (prototype.path.endsWith('.kt')) {
    const nestedType = /\b(?:class|object|interface)\s+[A-Za-z_][A-Za-z0-9_]*/g
    let declaration: RegExpExecArray | null
    while ((declaration = nestedType.exec(masked)) !== null) {
      const offset = declaration.index
      if (
        offset <= body.open ||
        offset >= body.close ||
        depths[offset - body.open] !== 0
      ) {
        continue
      }
      const nextParenthesis = masked.indexOf('(', nestedType.lastIndex)
      const nextBody = masked.indexOf('{', nestedType.lastIndex)
      if (
        nextParenthesis < 0 ||
        nextParenthesis >= body.close ||
        (nextBody >= 0 && nextBody < nextParenthesis)
      ) {
        continue
      }
      nestedConstructorRanges.push(
        findBalancedRange(source, nextParenthesis, '(', ')'),
      )
    }
  }
  const members: PrototypeMember[] = []
  let match: RegExpExecArray | null
  if (prototype.path.endsWith('.kt')) {
    const kotlin = new RegExp(
      `\\b(?:(public|private|protected|internal)\\s+)?` +
        `(?:(?:override|open|final|abstract|suspend|operator|infix|tailrec|external|inline|const|lateinit)\\s+)*` +
        `(fun|val|var)\\s+(?:<[^>]+>\\s*)?(${kotlinIdentifierSource})`,
      'g',
    )
    while ((match = kotlin.exec(masked)) !== null) {
      const offset = match.index
      if (offset <= body.declaration || offset >= body.close) continue
      if (
        nestedConstructorRanges.some(
          (range) => offset > range.start && offset < range.end,
        )
      ) {
        continue
      }
      if (['private', 'protected', 'internal'].includes(match[1] ?? '')) continue
      const name = normalizeKotlinIdentifier(match[3])
      const inHeader = offset >= body.nameEnd && offset < body.open
      const inDirectBody =
        offset > body.open && depths[offset - body.open] === 0
      const inCompanion = inDirectCompanionBody(offset)
      if (!inHeader && !inDirectBody && !inCompanion) continue
      if (
        inCompanion &&
        !(metadata.annotations.get(name) ?? []).some((annotation) =>
          publicMemberAnnotationNames.has(annotation),
        )
      ) {
        continue
      }
      members.push({
        name,
        kind: match[2] === 'fun' ? 'function' : 'property',
        source: location(prototype.path, source, offset),
        metadata,
      })
    }
  } else {
    const addJavaMatches = (pattern: RegExp, implicitInterface: boolean): void => {
      while ((match = pattern.exec(masked)) !== null) {
        const offset = match.index
        if (offset <= body.open || offset >= body.close) continue
        if (depths[offset - body.open] !== 0) continue
        const visibility = implicitInterface ? undefined : match[1]
        const name = implicitInterface ? match[1] : match[2]
        const suffix = implicitInterface ? match[2] : match[3]
        if (!implicitInterface && visibility !== 'public') continue
        members.push({
          name,
          kind: suffix === '(' ? 'function' : 'property',
          source: location(prototype.path, source, offset),
          metadata,
        })
      }
    }

    addJavaMatches(
      /\b(public|protected|private)\s+(?:(?:static|final|abstract|default|synchronized|native|strictfp|transient|volatile)\s+)*(?:<[^;{}()]+>\s*)?(?:[A-Za-z_$][A-Za-z0-9_$.<>?\[\], &]*\s+)([A-Za-z_$][A-Za-z0-9_$]*)\s*(\(|=|;)/g,
      false,
    )
    if (body.kind === 'interface') {
      addJavaMatches(
        /^(?!\s*(?:public|protected|private)\b)\s*(?:(?:static|final|abstract|default|synchronized|native|strictfp|transient|volatile)\s+)*(?:<[^;{}()]+>\s*)?(?:[A-Za-z_$][A-Za-z0-9_$.<>?\[\], &]*\s+)([A-Za-z_$][A-Za-z0-9_$]*)\s*(\(|=|;)/gm,
        true,
      )
    }
  }

  return members.filter(
    (member, index, all) =>
      all.findIndex((candidate) => candidate.name === member.name) === index,
  )
}

function prototypeMembers(
  prototype: PrototypeSource,
  context: PrototypeExtractionContext,
  visiting = new Set<string>(),
): readonly PrototypeMember[] {
  const key = `${prototype.path}#${prototype.className}`
  const cached = context.cache.get(key)
  if (cached) return cached
  if (visiting.has(key)) return []
  visiting.add(key)

  const { source, metadata } = context.readMetadata(prototype.path)
  const body = classBody(source, prototype.className)
  if (!body) {
    visiting.delete(key)
    context.cache.set(key, [])
    return []
  }

  const members = declaredPrototypeMembers(source, prototype, metadata)
  const names = new Set(members.map(({ name }) => name))
  const imports = extractImports(source)
  for (const typeName of inheritedTypeNames(source, prototype, body)) {
    const parent = prototypeSource(
      typeName,
      imports,
      context.sourceFiles,
      prototype.path,
      source,
    )
    if (!parent) continue
    for (const member of prototypeMembers(parent, context, visiting)) {
      if (names.has(member.name)) continue
      names.add(member.name)
      members.push(member)
    }
  }

  visiting.delete(key)
  context.cache.set(key, members)
  return members
}

function addPrototypeMembers(
  symbols: Map<string, ApiSymbol>,
  owner: string,
  prototype: PrototypeSource,
  context: PrototypeExtractionContext,
): void {
  for (const member of prototypeMembers(prototype, context)) {
    addSymbol(
      symbols,
      makeSymbol(
        `${owner}.${member.name}`,
        owner,
        member.name,
        member.kind,
        member.source,
        member.metadata,
      ),
    )
  }
}

function assertOverrideEvidence(
  reader: SourceReader,
  sourceFiles: readonly string[],
  override: DynamicOverride,
): void {
  if (!sourceFiles.includes(override.source.path)) {
    throw new Error(
      `Override ${override.id} references missing source ${override.source.path}.`,
    )
  }
  const source = reader.readFile(override.source.path)
  const lines = source.split(/\r?\n/)
  if (override.source.line > lines.length) {
    throw new Error(
      `Override ${override.id} line ${override.source.line} is outside source ` +
        `${override.source.path} (${lines.length} lines).`,
    )
  }
  const evidenceLine = lines[override.source.line - 1] ?? ''
  if (!evidenceLine.trim()) {
    throw new Error(
      `Override ${override.id} references a blank evidence line at ` +
        `${override.source.path}:${override.source.line}.`,
    )
  }

  const window = lines
    .slice(
      Math.max(0, override.source.line - 2),
      Math.min(lines.length, override.source.line + 1),
    )
    .join('\n')
  const candidateNames = [
    override.className,
    ...(override.sourceClassName ? [override.sourceClassName] : []),
    ...(override.assignments ?? []),
    ...(override.members ?? []).flatMap((member) => [
      member.name,
      ...(member.aliases ?? []),
    ]),
    ...(override.key ? ['key'] : []),
  ].filter((name) =>
    new RegExp(`\\b${escapeRegExp(name)}\\b`).test(source),
  )
  const hasNamedEvidence = candidateNames.some((name) =>
    new RegExp(`\\b${escapeRegExp(name)}\\b`).test(window),
  )
  const hasStructuralEvidence =
    /\b(?:class|object|interface|fun|val|var|init|for)\b|@Jvm|declared(?:Member|Method|Field)|\.methods\b|defineProp(?:erty)?\b|newNativeObject\b|toNativeArray\b|prototype\b|\bextends\b/.test(
      window,
    )
  if (!hasNamedEvidence && !hasStructuralEvidence) {
    throw new Error(
      `Override ${override.id} has no related member, declaration, or reflection ` +
        `semantic evidence near ${override.source.path}:${override.source.line}.`,
    )
  }
}

function overrideMemberSourcePath(
  override: DynamicOverride,
  sourceFiles: readonly string[],
): string {
  const sourceClassNames = [override.sourceClassName, override.className].filter(
    (name): name is string => Boolean(name),
  )
  const candidate = sourceFiles
    .filter(
      (path) =>
        sourceClassNames.some(
          (className) =>
            path.endsWith(`/${className}.kt`) ||
            path.endsWith(`/${className}.java`),
        ),
    )
    .sort((left, right) =>
      left.length - right.length || compareText(left, right),
    )[0]
  return candidate ?? override.source.path
}

function applyOverrideMembers(
  symbols: Map<string, ApiSymbol>,
  moduleId: string,
  override: DynamicOverride,
  sourceText: string,
  metadata: MethodMetadata,
  prototypeContext: PrototypeExtractionContext,
  memberSourcePath = override.source.path,
): void {
  const excludedMembers = new Set(override.excludeMembers ?? [])
  const memberId = (name: string) =>
    override.idPrefix ? `${override.idPrefix}${name}` : `${moduleId}.${name}`

  if (override.includePublicMembers) {
    const prototype = {
      className: override.sourceClassName ?? override.className,
      path: memberSourcePath,
    }
    for (const member of prototypeMembers(prototype, prototypeContext)) {
      if (excludedMembers.has(member.name)) continue
      addSymbol(
        symbols,
        makeSymbol(
          memberId(member.name),
          moduleId,
          member.name,
          member.kind,
          member.source,
          member.metadata,
        ),
      )
    }
  }

  if (override.includeAnnotatedMembers) {
    for (const [name, annotations] of metadata.annotations) {
      if (excludedMembers.has(name)) continue
      if (!annotations.some((annotation) => publicMemberAnnotationNames.has(annotation))) {
        continue
      }
      const kind: ApiSymbolKind = annotations.includes('ScriptVariable')
        ? 'property'
        : annotations.includes('ScriptClass')
          ? 'class'
          : 'function'
      addSymbol(
        symbols,
        makeSymbol(
          memberId(name),
          moduleId,
          name,
          kind,
          metadata.locations.get(name) ?? override.source,
          metadata,
        ),
      )
    }
  }

  if (override.includeJvmFieldsAs) {
    const masked = maskNonCode(sourceText)
    const pattern = /@JvmField\b/g
    let match: RegExpExecArray | null
    while ((match = pattern.exec(masked)) !== null) {
      const declaration = nextDeclaredMember(masked, pattern.lastIndex)
      if (!declaration || excludedMembers.has(declaration.name)) continue
      addSymbol(
        symbols,
        makeSymbol(
          memberId(declaration.name),
          moduleId,
          declaration.name,
          override.includeJvmFieldsAs,
          location(memberSourcePath, sourceText, declaration.offset),
          metadata,
        ),
      )
    }
  }

  for (const member of override.members ?? []) {
    if (excludedMembers.has(member.name)) continue
    const canonicalId = member.id ?? memberId(member.name)
    addSymbol(
      symbols,
      makeSymbol(
        canonicalId,
        moduleId,
        member.name,
        member.kind,
        override.source,
        metadata,
        member.canonicalId,
      ),
    )
    for (const alias of member.aliases ?? []) {
      addSymbol(
        symbols,
        makeSymbol(
          `alias:${moduleId}.${alias}`,
          moduleId,
          alias,
          'alias',
          override.source,
          metadata,
          canonicalId,
        ),
      )
    }
    if (member.global) {
      addSymbol(
        symbols,
        makeSymbol(
          `global:${member.name}`,
          'global',
          member.name,
          'global',
          override.source,
          metadata,
          canonicalId,
        ),
      )
    }
  }
}

export async function extractApiManifest(
  reader: SourceReader,
  options: ExtractApiManifestOptions,
): Promise<ApiManifest> {
  const commit = reader.resolveRef(options.ref)
  const allFiles = reader.listFiles('app/src/main/')
  const sourceFiles = allFiles.filter((path) => /\.(?:kt|java)$/.test(path))
  const runtimePath = sourceFiles
    .filter((path) => path.endsWith('/runtime/ScriptRuntime.kt'))
    .sort((left, right) => left.length - right.length)[0]
  const enginePath = sourceFiles
    .filter((path) => path.endsWith('/engine/RhinoJavaScriptEngine.kt'))
    .sort((left, right) => left.length - right.length)[0]

  if (!runtimePath || !enginePath) {
    throw new Error('Cannot locate ScriptRuntime.kt or RhinoJavaScriptEngine.kt.')
  }

  for (const override of options.overrides ?? []) {
    assertOverrideEvidence(reader, sourceFiles, override)
  }

  const runtimeSource = reader.readFile(runtimePath)
  const imports = extractImports(runtimeSource)
  const valueTypes = runtimeValueTypes(runtimeSource)
  const overridesByClass = new Map(
    (options.overrides ?? []).map((override) => [override.className, override]),
  )
  const registrations = parseRegistrations(runtimePath, runtimeSource)
  const assigned = parseAssignedAugmentables(runtimePath, runtimeSource)
  const moduleAliases = new Map<string, string>([['target', '']])
  const modules: ApiModule[] = []
  const symbols = new Map<string, ApiSymbol>()
  const metadataByPath = new Map<string, MethodMetadata>()
  const appliedOverrides = new Map<string, AppliedOverride>()

  const readMetadata = (path: string): { source: string; metadata: MethodMetadata } => {
    const source = reader.readFile(path)
    const metadata = metadataByPath.get(path) ?? parseMethodMetadata(path, source)
    metadataByPath.set(path, metadata)
    return { source, metadata }
  }
  const prototypeContext: PrototypeExtractionContext = {
    sourceFiles,
    readMetadata,
    cache: new Map(),
  }

  for (const registration of registrations) {
    const parent = moduleAliases.get(registration.targetName)
    if (parent === undefined) {
      throw new Error(
        `Cannot resolve nested augmentation target ${registration.targetName} for ${registration.className}.`,
      )
    }
    const sourcePath = classSourcePath(registration, imports, sourceFiles)
    const { source, metadata } = readMetadata(sourcePath)
    const actualClassName =
      imports.get(registration.className)?.split('.').at(-1) ??
      registration.className
    const override =
      overridesByClass.get(registration.className) ??
      overridesByClass.get(actualClassName)
    const resolvedKey = explicitKey(actualClassName, source, override)
    const moduleId = parent ? `${parent}.${resolvedKey.key}` : resolvedKey.key
    const aliases = registration.withDollarPrefix ? [`$${resolvedKey.key}`] : []

    modules.push({
      id: moduleId,
      name: resolvedKey.key,
      ...(parent ? { parent } : {}),
      className: actualClassName,
      aliases,
      source: registration.source,
      ...(resolvedKey.dynamic ? { dynamic: true } : {}),
    })
    addSymbol(
      symbols,
      makeSymbol(
        `module:${moduleId}`,
        moduleId,
        resolvedKey.key,
        'module',
        registration.source,
        metadata,
      ),
    )
    for (const alias of aliases) {
      addSymbol(
        symbols,
        makeSymbol(
          `alias:${parent ? `${parent}.` : ''}${alias}`,
          parent || 'global',
          alias,
          'alias',
          registration.source,
          metadata,
          `module:${moduleId}`,
        ),
      )
    }

    addAssignments(symbols, moduleId, sourcePath, source, metadata)
    assertDynamicAssignmentsAreOverridden(actualClassName, source, override)
    for (const expression of registration.prototypeExpressions) {
      for (const typeName of prototypeTypeNames(expression, valueTypes, imports)) {
        const prototype = prototypeSource(
          typeName,
          imports,
          sourceFiles,
          runtimePath,
          runtimeSource,
        )
        if (!prototype) continue
        addPrototypeMembers(symbols, moduleId, prototype, prototypeContext)
      }
    }

    const capabilities = augmentableCapabilities(actualClassName, source)
    if (capabilities.callable) {
      addSymbol(
        symbols,
        makeSymbol(
          `call:${moduleId}`,
          moduleId,
          resolvedKey.key,
          'callable',
          declaredMethodLocation(sourcePath, source, actualClassName, 'invoke'),
          metadata,
          undefined,
          true,
          'invoke',
        ),
      )
    }
    if (capabilities.constructable) {
      addSymbol(
        symbols,
        makeSymbol(
          `construct:${moduleId}`,
          moduleId,
          resolvedKey.key,
          'constructor',
          declaredMethodLocation(sourcePath, source, actualClassName, 'construct'),
          metadata,
          undefined,
          true,
          'construct',
        ),
      )
    }
    if (override) {
      applyOverrideMembers(
        symbols,
        override.owner ?? moduleId,
        override,
        source,
        metadata,
        prototypeContext,
        sourcePath,
      )
      appliedOverrides.set(override.id, {
        id: override.id,
        className: override.className,
        reason: override.reason,
        source: override.source,
      })
    }
    for (const lambdaName of registration.lambdaNames) {
      moduleAliases.set(lambdaName, moduleId)
    }
  }

  for (const assignment of assigned) {
    const sourcePath = classSourcePath(assignment, imports, sourceFiles)
    const { source, metadata } = readMetadata(sourcePath)
    const actualClassName =
      imports.get(assignment.className)?.split('.').at(-1) ?? assignment.className
    const override =
      overridesByClass.get(assignment.className) ??
      overridesByClass.get(actualClassName)
    assertDynamicAssignmentsAreOverridden(actualClassName, source, override)
    addAssignments(symbols, 'global', sourcePath, source, metadata)
  }

  for (const override of options.overrides ?? []) {
    if (appliedOverrides.has(override.id)) continue
    if (!override.owner) {
      throw new Error(
        `Override ${override.id} does not match a registered class and has no explicit owner.`,
      )
    }
    const memberSourcePath = overrideMemberSourcePath(override, sourceFiles)
    const { source, metadata } = readMetadata(memberSourcePath)
    applyOverrideMembers(
      symbols,
      override.owner,
      override,
      source,
      metadata,
      prototypeContext,
      memberSourcePath,
    )
    appliedOverrides.set(override.id, {
      id: override.id,
      className: override.className,
      reason: override.reason,
      source: override.source,
    })
  }

  const engineSource = reader.readFile(enginePath)
  engineGlobals(symbols, enginePath, engineSource)
  engineGlobals(symbols, runtimePath, runtimeSource)
  if (/\bjs_structured_clone\b/.test(maskNonCode(runtimeSource))) {
    const emptyMetadata: MethodMetadata = {
      annotations: new Map(),
      locations: new Map(),
      signatures: new Map(),
      overloads: new Map(),
      evidence: [],
      hints: [],
    }
    addSymbol(
      symbols,
      makeSymbol(
        'global:structuredClone',
        'global',
        'structuredClone',
        'engine-global',
        location(runtimePath, runtimeSource, runtimeSource.indexOf('js_structured_clone')),
        emptyMetadata,
      ),
    )
  }

  for (const path of sourceFiles.filter(annotationCandidate)) {
    if (metadataByPath.has(path)) continue
    const source = reader.readFile(path)
    if (!source.includes('@')) continue
    const metadata = parseMethodMetadata(path, source)
    if (metadata.evidence.length > 0 || metadata.hints.length > 0) {
      metadataByPath.set(path, metadata)
    }
  }

  const annotations = [...metadataByPath.values()]
    .flatMap(({ evidence }) => evidence)
    .sort((left, right) =>
      compareText(left.path, right.path) ||
      left.line - right.line ||
      compareText(left.member, right.member),
    )
  const declarationHints = [...metadataByPath.values()]
    .flatMap(({ hints }) => hints)
    .sort((left, right) =>
      compareText(left.path, right.path) ||
      left.line - right.line ||
      compareText(left.value, right.value),
    )
  const assets = allFiles
    .filter(
      (path) =>
        path.startsWith('app/src/main/assets/modules/') && path.endsWith('.js'),
    )
    .map((path) => ({
      id: path
        .slice('app/src/main/assets/modules/'.length)
        .replace(/\.js$/, ''),
      path,
    }))
    .sort((left, right) => compareText(left.id, right.id))

  return {
    schemaVersion: INTERNAL_API_MANIFEST_SCHEMA_VERSION,
    source: {
      repository: options.repository,
      ref: options.ref,
      commit,
    },
    modules: modules.sort((left, right) => compareText(left.id, right.id)),
    symbols: [...symbols.values()].sort((left, right) =>
      compareText(left.id, right.id),
    ),
    annotations,
    declarationHints,
    assets,
    overrides: [...appliedOverrides.values()].sort((left, right) =>
      compareText(left.id, right.id),
    ),
  }
}

/** Extract and immediately project the source-backed model for public use. */
export async function extractPublicApiManifest(
  reader: SourceReader,
  options: ExtractApiManifestOptions,
): Promise<PublicApiManifest> {
  return projectApiManifest(await extractApiManifest(reader, options))
}
