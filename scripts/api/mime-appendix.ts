import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  findBalancedRange,
  lineNumberAt,
  maskComments,
  maskNonCode,
} from './lexer'
import { MONKEYKING_API_BASELINE } from './overrides'
import { GitSourceReader, type SourceReader } from './source-reader'

export const MIME_SOURCE_PATH =
  'app/src/main/java/com/qiaomu/monkeyking/runtime/api/Mime.kt'
export const MIME_CONSTANT_COUNT = 2_540
export const MIME_APPENDIX_START = '<!-- mime-constant-manifest:start -->'
export const MIME_APPENDIX_END = '<!-- mime-constant-manifest:end -->'

export interface MimeConstant {
  readonly name: string
  readonly value: string
  readonly anchor: string
  readonly line: number
}

export interface MimeAppendixArguments {
  readonly source: string
  readonly ref: string
  readonly document: string
  readonly check: boolean
}

export interface RunMimeAppendixWithReaderOptions {
  readonly reader: SourceReader
  readonly ref: string
  readonly document: string
  readonly check: boolean
  readonly expectedConstantCount?: number
  readonly sourcePath?: string
}

export interface MimeAppendixResult {
  readonly commit: string
  readonly constantCount: number
  readonly changed: boolean
}

function skipWhitespace(source: string, start: number): number {
  let cursor = start
  while (/\s/.test(source[cursor] ?? '')) cursor += 1
  return cursor
}

function declarationAfterJvmField(masked: string, start: number): {
  readonly name: string
  readonly valueStart: number
  readonly declarationStart: number
} {
  let cursor = skipWhitespace(masked, start)
  while (masked[cursor] === '@') {
    const annotation = /^@[A-Za-z_][A-Za-z0-9_.:]*/.exec(
      masked.slice(cursor),
    )
    if (!annotation) break
    cursor = skipWhitespace(masked, cursor + annotation[0].length)
    if (masked[cursor] === '(') {
      cursor = findBalancedRange(masked, cursor, '(', ')').end + 1
    }
    cursor = skipWhitespace(masked, cursor)
  }

  const declaration = /^(?:const[ \t]+)?val[ \t]+([A-Z][A-Z0-9_]*)(?:[ \t]*:[^=\r\n]+)?[ \t]*=/.exec(
    masked.slice(cursor),
  )
  if (!declaration) {
    throw new Error(
      `@JvmField at line ${lineNumberAt(masked, start)} is not followed by ` +
        'an explicit uppercase val declaration.',
    )
  }
  return {
    name: declaration[1],
    valueStart: cursor + declaration[0].length,
    declarationStart: cursor,
  }
}

function declarationValue(source: string, valueStart: number): string {
  let start = valueStart
  while (source[start] === ' ' || source[start] === '\t') start += 1
  const lineEnd = source.indexOf('\n', start)
  const tail = source.slice(start, lineEnd < 0 ? source.length : lineEnd)
  const active = maskComments(tail).trimEnd()
  const value = tail.slice(0, active.length).trim()
  if (
    !/^"(?:\\.|[^"\\\r\n])*"$/.test(value) &&
    !/^[A-Z][A-Z0-9_]*$/.test(value)
  ) {
    throw new Error(
      `Unsupported MIME constant value at line ${lineNumberAt(source, start)}: ` +
        `${value || '(empty)'}.`,
    )
  }
  return value
}

export function mimeConstantAnchor(name: string): string {
  if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid MIME constant name ${JSON.stringify(name)}.`)
  }
  return `mime-constant-${name.toLowerCase().replaceAll('_', '-')}`
}

export function extractMimeConstants(
  source: string,
  expectedCount = MIME_CONSTANT_COUNT,
): MimeConstant[] {
  if (!Number.isSafeInteger(expectedCount) || expectedCount <= 0) {
    throw new Error('Expected MIME constant count must be a positive integer.')
  }
  const masked = maskNonCode(source)
  const annotation = /@JvmField\b/g
  const constants: MimeConstant[] = []
  let match: RegExpExecArray | null

  while ((match = annotation.exec(masked)) !== null) {
    const declaration = declarationAfterJvmField(masked, annotation.lastIndex)
    constants.push({
      name: declaration.name,
      value: declarationValue(source, declaration.valueStart),
      anchor: mimeConstantAnchor(declaration.name),
      line: lineNumberAt(source, declaration.declarationStart),
    })
  }

  const names = new Set<string>()
  const anchors = new Set<string>()
  for (const constant of constants) {
    if (names.has(constant.name)) {
      throw new Error(`Duplicate MIME constant name ${constant.name}.`)
    }
    if (anchors.has(constant.anchor)) {
      throw new Error(`Duplicate MIME constant anchor ${constant.anchor}.`)
    }
    names.add(constant.name)
    anchors.add(constant.anchor)
  }
  for (const constant of constants) {
    if (
      /^[A-Z][A-Z0-9_]*$/.test(constant.value) &&
      !names.has(constant.value)
    ) {
      throw new Error(
        `MIME constant ${constant.name} references unknown constant ${constant.value}.`,
      )
    }
  }

  if (
    constants.length !== expectedCount ||
    names.size !== expectedCount ||
    anchors.size !== expectedCount
  ) {
    throw new Error(
      `Expected exactly ${expectedCount} unique MIME constants and anchors; ` +
        `received ${constants.length} declarations, ${names.size} names, and ` +
        `${anchors.size} anchors.`,
    )
  }
  return constants
}

export function renderMimeAppendix(
  constants: readonly MimeConstant[],
): string {
  return [
    '| 稳定锚点 | 公开成员 | 常量值 |',
    '| --- | --- | --- |',
    ...constants.map(({ name, value, anchor }) => {
      if (value.includes('`')) {
        throw new Error(`MIME constant ${name} cannot be rendered as Markdown code.`)
      }
      return `| <a id="${anchor}"></a> | \`mime.${name}\` | \`${value}\` |`
    }),
  ].join('\n')
}

function markerMatch(document: string, marker: string): RegExpExecArray {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = [
    ...document.matchAll(new RegExp(`^[ \\t]*${escaped}[ \\t]*$`, 'gm')),
  ]
  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one ${marker} marker, received ${matches.length}.`,
    )
  }
  return matches[0]
}

export function replaceMimeAppendix(
  document: string,
  appendix: string,
): string {
  const start = markerMatch(document, MIME_APPENDIX_START)
  const end = markerMatch(document, MIME_APPENDIX_END)
  const startEnd = (start.index ?? 0) + start[0].length
  const endStart = end.index ?? 0
  if (startEnd >= endStart) {
    throw new Error('MIME appendix markers are missing or out of order.')
  }
  const newline = document.includes('\r\n') ? '\r\n' : '\n'
  const normalizedAppendix = appendix.replace(/\r?\n/g, newline)
  return (
    document.slice(0, startEnd) +
    newline +
    normalizedAppendix +
    newline +
    document.slice(endStart)
  )
}

export function runMimeAppendixWithReader(
  options: RunMimeAppendixWithReaderOptions,
): MimeAppendixResult {
  const commit = options.reader.resolveRef(options.ref)
  const sourcePath = options.sourcePath ?? MIME_SOURCE_PATH
  const source = options.reader.readFile(sourcePath)
  const constants = extractMimeConstants(
    source,
    options.expectedConstantCount ?? MIME_CONSTANT_COUNT,
  )
  if (!existsSync(options.document)) {
    throw new Error(`MIME documentation does not exist: ${options.document}`)
  }
  const existing = readFileSync(options.document, 'utf8')
  const expected = replaceMimeAppendix(
    existing,
    renderMimeAppendix(constants),
  )
  const changed = existing !== expected

  if (options.check) {
    if (changed) {
      throw new Error(
        `MIME appendix drift detected for ${options.document} at ${commit}.`,
      )
    }
  } else if (changed) {
    writeFileSync(options.document, expected)
  }

  return { commit, constantCount: constants.length, changed }
}

export function parseMimeAppendixArguments(
  args: readonly string[],
): MimeAppendixArguments {
  let source: string | undefined
  let ref: string = MONKEYKING_API_BASELINE
  let document = 'docs/api/utilities/mime.md'
  let check = false

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    switch (argument) {
      case '--source':
        source = args[++index]
        break
      case '--ref':
        ref = args[++index] ?? ''
        break
      case '--document':
        document = args[++index] ?? ''
        break
      case '--check':
        check = true
        break
      default:
        throw new Error(`Unknown api:mime argument: ${argument}`)
    }
  }

  if (!source) {
    throw new Error('api:mime requires --source <MonkeyKing repository>.')
  }
  if (!ref) throw new Error('api:mime requires a non-empty --ref value.')
  if (!document) {
    throw new Error('api:mime requires a non-empty --document value.')
  }
  return { source, ref, document, check }
}

export function runMimeAppendix(
  arguments_: MimeAppendixArguments,
): MimeAppendixResult {
  const document = resolve(process.cwd(), arguments_.document)
  const result = runMimeAppendixWithReader({
    reader: new GitSourceReader(arguments_.source),
    ref: arguments_.ref,
    document,
    check: arguments_.check,
  })
  process.stdout.write(
    arguments_.check
      ? `MIME appendix matches ${result.commit}: ${result.constantCount} constants.\n`
      : `Updated ${arguments_.document} from ${result.commit}: ` +
          `${result.constantCount} constants.\n`,
  )
  return result
}

function isDirectExecution(): boolean {
  const executable = process.argv[1]
  return (
    executable !== undefined &&
    pathToFileURL(resolve(executable)).href === import.meta.url
  )
}

if (isDirectExecution()) {
  try {
    runMimeAppendix(parseMimeAppendixArguments(process.argv.slice(2)))
  } catch (error) {
    const message =
      error instanceof Error ? error.stack ?? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  }
}
