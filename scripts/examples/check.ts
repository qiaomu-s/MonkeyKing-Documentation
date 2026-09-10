import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { contentEntries } from '../content/catalog'

export interface JavaScriptExample {
  readonly source: string
  readonly line: number
  readonly code: string
}

export interface ExampleCheckReport {
  readonly exampleCount: number
  readonly errors: readonly string[]
}

interface FenceState {
  readonly marker: '`' | '~'
  readonly length: number
  readonly quoteDepth: number
  readonly source: string
  readonly line: number
  readonly capture: boolean
  readonly code: string[]
}

interface Delimiter {
  readonly value: '(' | '[' | '{'
  readonly line: number
}

function stripBlockquotePrefix(line: string): {
  readonly content: string
  readonly depth: number
} {
  let cursor = 0
  let depth = 0

  while (cursor < line.length) {
    const match = /^ {0,3}>[ \t]?/.exec(line.slice(cursor))
    if (!match) break
    cursor += match[0].length
    depth += 1
  }

  return { content: line.slice(cursor), depth }
}

function stripExpectedBlockquotePrefix(line: string, depth: number): string {
  let cursor = 0
  for (let index = 0; index < depth; index += 1) {
    const match = /^ {0,3}>[ \t]?/.exec(line.slice(cursor))
    if (!match) return line
    cursor += match[0].length
  }
  return line.slice(cursor)
}

export function extractJavaScriptExamples(
  markdown: string,
  source: string,
): JavaScriptExample[] {
  const examples: JavaScriptExample[] = []
  const lines = markdown.split(/\r?\n/)
  let active: FenceState | undefined

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index]
    const lineNumber = index + 1

    if (active) {
      const quoted = stripBlockquotePrefix(rawLine)
      const candidate =
        quoted.depth === active.quoteDepth
          ? quoted.content
          : stripExpectedBlockquotePrefix(rawLine, active.quoteDepth)
      const closing = /^( {0,3})(`{3,}|~{3,})[ \t]*$/.exec(candidate)
      if (
        closing &&
        closing[2][0] === active.marker &&
        closing[2].length >= active.length
      ) {
        if (active.capture) {
          examples.push({
            source: active.source,
            line: active.line,
            code: active.code.length === 0 ? '' : `${active.code.join('\n')}\n`,
          })
        }
        active = undefined
        continue
      }

      if (active.capture) active.code.push(candidate)
      continue
    }

    const quoted = stripBlockquotePrefix(rawLine)
    const opening = /^( {0,3})(`{3,}|~{3,})[ \t]*([^ \t]*)?.*$/.exec(
      quoted.content,
    )
    if (!opening) continue

    const language = (opening[3] ?? '').toLowerCase()
    active = {
      marker: opening[2][0] as '`' | '~',
      length: opening[2].length,
      quoteDepth: quoted.depth,
      source,
      line: lineNumber,
      capture: language === 'js' || language === 'javascript',
      code: [],
    }
  }

  if (active?.capture) {
    examples.push({
      source: active.source,
      line: active.line,
      code: active.code.length === 0 ? '' : `${active.code.join('\n')}\n`,
    })
  }

  return examples
}

function lineAt(source: string, index: number): number {
  let line = 1
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (source[cursor] === '\n') line += 1
  }
  return line
}

function startsRegularExpression(
  source: string,
  index: number,
  previousSignificant: string | undefined,
): boolean {
  if (source[index + 1] === '/' || source[index + 1] === '*') return false
  return (
    previousSignificant === undefined ||
    /[({[=,:;!&|?+\-*%^~<>]/.test(previousSignificant)
  )
}

function structuralErrors(code: string): string[] {
  const errors: string[] = []
  const stack: Delimiter[] = []
  const expectedOpen = new Map<string, Delimiter['value']>([
    [')', '('],
    [']', '['],
    ['}', '{'],
  ])
  let state:
    | 'normal'
    | 'single'
    | 'double'
    | 'template'
    | 'line-comment'
    | 'block-comment'
    | 'regex' = 'normal'
  let escaped = false
  let regexCharacterClass = false
  let previousSignificant: string | undefined
  let inXmlTag = false

  for (let index = 0; index < code.length; index += 1) {
    const character = code[index]
    const next = code[index + 1]

    if (state === 'line-comment') {
      if (character === '\n') state = 'normal'
      continue
    }
    if (state === 'block-comment') {
      if (character === '*' && next === '/') {
        state = 'normal'
        index += 1
      }
      continue
    }
    if (state === 'single' || state === 'double' || state === 'template') {
      if (escaped) {
        escaped = false
        continue
      }
      if (character === '\\') {
        escaped = true
        continue
      }
      const quote = state === 'single' ? "'" : state === 'double' ? '"' : '`'
      if (character === quote) state = 'normal'
      continue
    }
    if (state === 'regex') {
      if (escaped) {
        escaped = false
        continue
      }
      if (character === '\\') {
        escaped = true
        continue
      }
      if (character === '[') regexCharacterClass = true
      if (character === ']') regexCharacterClass = false
      if (character === '/' && !regexCharacterClass) {
        state = 'normal'
        previousSignificant = '/'
      }
      continue
    }

    if (character === '/' && next === '/') {
      state = 'line-comment'
      index += 1
      continue
    }
    if (character === '/' && next === '*') {
      state = 'block-comment'
      index += 1
      continue
    }
    if (
      character === '<' &&
      (/[A-Za-z_$]/.test(next ?? '') || next === '/' || next === '!' || next === '?')
    ) {
      inXmlTag = true
    }
    if (character === '>') inXmlTag = false
    if (
      character === '/' &&
      !inXmlTag &&
      startsRegularExpression(code, index, previousSignificant)
    ) {
      state = 'regex'
      regexCharacterClass = false
      continue
    }
    if (character === "'") {
      state = 'single'
      escaped = false
      continue
    }
    if (character === '"') {
      state = 'double'
      escaped = false
      continue
    }
    if (character === '`') {
      state = 'template'
      escaped = false
      continue
    }

    if (character === '(' || character === '[' || character === '{') {
      stack.push({ value: character, line: lineAt(code, index) })
    } else if (character === ')' || character === ']' || character === '}') {
      const opening = stack.pop()
      if (!opening || opening.value !== expectedOpen.get(character)) {
        errors.push(
          `Unexpected closing delimiter ${character} at example line ${lineAt(code, index)}`,
        )
      }
    }

    if (!/\s/.test(character)) previousSignificant = character
  }

  if (state === 'single' || state === 'double' || state === 'template') {
    errors.push('Unclosed string literal')
  } else if (state === 'block-comment') {
    errors.push('Unclosed block comment')
  } else if (state === 'regex') {
    errors.push('Unclosed regular expression literal')
  }

  for (const delimiter of stack.reverse()) {
    errors.push(
      `Unclosed delimiter ${delimiter.value} from example line ${delimiter.line}`,
    )
  }
  return errors
}

function placeholderError(code: string): boolean {
  return (
    /\b(?:TODO|FIXME|PENDING)\b/i.test(code) ||
    /待补充|待完善/.test(code) ||
    /(?:^|\n)\s*(?:\.\.\.|xxx(?:\s+事件)?)\s*(?:\n|$)/i.test(code)
  )
}

export function checkJavaScriptExamples(
  rootDirectory = process.cwd(),
  sources: readonly string[] = contentEntries.map(({ source }) => source),
): ExampleCheckReport {
  rootDirectory = resolve(rootDirectory)
  const errors: string[] = []
  let exampleCount = 0

  for (const source of sources) {
    const path = resolve(rootDirectory, source)
    if (!existsSync(path)) {
      errors.push(`Missing documentation source: ${source}`)
      continue
    }

    const examples = extractJavaScriptExamples(readFileSync(path, 'utf8'), source)
    exampleCount += examples.length
    for (const example of examples) {
      const label = `${example.source}:${example.line}`
      if (example.code.trim() === '') {
        errors.push(`Empty JavaScript example at ${label}`)
        continue
      }
      if (placeholderError(example.code)) {
        errors.push(`Placeholder text in JavaScript example at ${label}`)
      }
      for (const error of structuralErrors(example.code)) {
        errors.push(`${label}: ${error}`)
      }
    }
  }

  return Object.freeze({
    exampleCount,
    errors: Object.freeze(errors),
  })
}

function isDirectExecution(): boolean {
  const executable = process.argv[1]
  return executable !== undefined && pathToFileURL(resolve(executable)).href === import.meta.url
}

if (isDirectExecution()) {
  const report = checkJavaScriptExamples()
  if (report.errors.length > 0) {
    console.error(
      `Example validation failed with ${report.errors.length} error(s) across ${report.exampleCount} JavaScript examples:`,
    )
    for (const error of report.errors) console.error(`- ${error}`)
    process.exitCode = 1
  } else {
    console.log(`Validated ${report.exampleCount} JavaScript examples.`)
  }
}
