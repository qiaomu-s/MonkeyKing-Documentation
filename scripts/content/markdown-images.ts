import {
  isBackslashEscaped,
  scanMarkdownCode,
} from './markdown-source'
import type { SourceRange } from './markdown-source'

interface SourceLine {
  readonly start: number
  readonly contentEnd: number
  readonly end: number
  readonly content: string
}

interface DestinationParts {
  readonly destination: string
}

function protectedRangeAt(
  index: number,
  ranges: readonly SourceRange[],
): SourceRange | undefined {
  return ranges.find((range) => index >= range.start && index < range.end)
}

function overlapsProtectedRange(
  start: number,
  end: number,
  ranges: readonly SourceRange[],
): boolean {
  return ranges.some((range) => range.start < end && range.end > start)
}

function findClosingBracket(
  source: string,
  opening: number,
  protectedRanges: readonly SourceRange[],
): number {
  let depth = 1
  for (let index = opening + 1; index < source.length; index += 1) {
    const protectedRange = protectedRangeAt(index, protectedRanges)
    if (protectedRange) {
      index = protectedRange.end - 1
      continue
    }
    if (isBackslashEscaped(source, index)) continue
    if (source[index] === '[') depth += 1
    if (source[index] === ']') depth -= 1
    if (depth === 0) return index
  }
  return -1
}

function findClosingParenthesis(
  source: string,
  opening: number,
  protectedRanges: readonly SourceRange[],
): number {
  let depth = 1
  let angleDestination = false
  let destinationStarted = false
  let destinationFinished = false
  let quotedTitle: '"' | "'" | undefined

  for (let index = opening + 1; index < source.length; index += 1) {
    const protectedRange = protectedRangeAt(index, protectedRanges)
    if (protectedRange) {
      index = protectedRange.end - 1
      continue
    }
    if (isBackslashEscaped(source, index)) continue

    const character = source[index]
    if (quotedTitle) {
      if (character === quotedTitle) quotedTitle = undefined
      continue
    }
    if (!destinationStarted && /\s/.test(character)) continue
    if (!destinationStarted) {
      destinationStarted = true
      if (character === '<') angleDestination = true
    }
    if (character === '>' && angleDestination) angleDestination = false
    if (angleDestination) continue

    if (depth === 1 && destinationStarted && /\s/.test(character)) {
      destinationFinished = true
      continue
    }
    if (
      depth === 1 &&
      destinationFinished &&
      (character === '"' || character === "'")
    ) {
      quotedTitle = character
      continue
    }
    if (character === '(') depth += 1
    if (character === ')') depth -= 1
    if (depth === 0) return index
  }
  return -1
}

function destinationAndSuffix(content: string): DestinationParts | undefined {
  const trimmed = content.trimStart()
  if (trimmed === '') return undefined
  if (trimmed.startsWith('<')) {
    const closing = trimmed.indexOf('>')
    if (closing >= 0) {
      return { destination: trimmed.slice(1, closing) }
    }
  }
  const match = /^(\S+)/.exec(trimmed)
  return match ? { destination: match[1] } : undefined
}

function sourceLineAt(source: string, start: number): SourceLine {
  const newline = source.indexOf('\n', start)
  const end = newline < 0 ? source.length : newline + 1
  let contentEnd = newline < 0 ? source.length : newline
  if (contentEnd > start && source[contentEnd - 1] === '\r') contentEnd -= 1
  return {
    start,
    contentEnd,
    end,
    content: source.slice(start, contentEnd),
  }
}

function normalizedReferenceLabel(label: string): string {
  return label
    .replace(/\\([\[\]\\])/g, '$1')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

function referenceDefinitions(
  markdown: string,
  protectedRanges: readonly SourceRange[],
): ReadonlyMap<string, string> {
  const definitions = new Map<string, string>()
  let index = 0

  while (index < markdown.length) {
    const line = sourceLineAt(markdown, index)
    if (overlapsProtectedRange(line.start, line.end, protectedRanges)) {
      index = line.end
      continue
    }
    const match = /^[ \t]{0,3}\[([^\]\r\n]+)\]:[ \t]*(.*)$/.exec(
      line.content,
    )
    if (!match) {
      index = line.end
      continue
    }

    let parts = destinationAndSuffix(match[2])
    if (!parts && line.end < markdown.length) {
      const continuation = sourceLineAt(markdown, line.end)
      if (
        !overlapsProtectedRange(
          continuation.start,
          continuation.end,
          protectedRanges,
        ) &&
        /^[ \t]{1,3}\S/.test(continuation.content)
      ) {
        parts = destinationAndSuffix(continuation.content)
      }
    }
    if (parts) {
      const label = normalizedReferenceLabel(match[1])
      if (!definitions.has(label)) definitions.set(label, parts.destination)
    }
    index = line.end
  }
  return definitions
}

function findHtmlTagEnd(source: string, opening: number): number {
  let quote: '"' | "'" | undefined
  for (let index = opening + 1; index < source.length; index += 1) {
    const character = source[index]
    if (quote) {
      if (character === quote && !isBackslashEscaped(source, index)) {
        quote = undefined
      }
      continue
    }
    if (character === '"' || character === "'") {
      quote = character
      continue
    }
    if (character === '>') return index
  }
  return -1
}

function htmlImageTargets(tag: string): readonly string[] {
  const targets: string[] = []
  const attributePattern =
    /(?:^|\s)(srcset|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi
  for (const match of tag.matchAll(attributePattern)) {
    const value = match[2] ?? match[3] ?? match[4] ?? ''
    if (match[1].toLowerCase() === 'src') {
      targets.push(value)
      continue
    }
    for (const candidate of value.split(',')) {
      const target = /^(\S+)/.exec(candidate.trim())?.[1]
      if (target) targets.push(target)
    }
  }
  return targets
}

function referenceOpeningAfter(source: string, index: number): number {
  let cursor = index
  while (source[cursor] === ' ' || source[cursor] === '\t') cursor += 1
  if (source[cursor] === '\r' && source[cursor + 1] === '\n') cursor += 2
  else if (source[cursor] === '\n') cursor += 1
  while (source[cursor] === ' ' || source[cursor] === '\t') cursor += 1
  return cursor
}

export function collectMarkdownImageTargets(markdown: string): readonly string[] {
  const { protectedRanges } = scanMarkdownCode(markdown)
  const definitions = referenceDefinitions(markdown, protectedRanges)
  const targets: string[] = []
  let protectedIndex = 0
  let index = 0

  while (index < markdown.length) {
    while (
      protectedIndex < protectedRanges.length &&
      protectedRanges[protectedIndex].end <= index
    ) {
      protectedIndex += 1
    }
    const protectedRange = protectedRanges[protectedIndex]
    if (protectedRange && protectedRange.start <= index) {
      index = protectedRange.end
      continue
    }

    if (
      markdown[index] === '<' &&
      /^<(?:img|source)\b/i.test(markdown.slice(index))
    ) {
      const closing = findHtmlTagEnd(markdown, index)
      if (
        closing >= 0 &&
        !overlapsProtectedRange(index, closing + 1, protectedRanges)
      ) {
        targets.push(...htmlImageTargets(markdown.slice(index, closing + 1)))
        index = closing + 1
        continue
      }
    }

    if (
      markdown[index] !== '!' ||
      markdown[index + 1] !== '[' ||
      isBackslashEscaped(markdown, index)
    ) {
      index += 1
      continue
    }
    const closingLabel = findClosingBracket(
      markdown,
      index + 1,
      protectedRanges,
    )
    if (closingLabel < 0) {
      index += 2
      continue
    }
    const label = markdown.slice(index + 2, closingLabel)
    const next = referenceOpeningAfter(markdown, closingLabel + 1)

    if (markdown[closingLabel + 1] === '(') {
      const closing = findClosingParenthesis(
        markdown,
        closingLabel + 1,
        protectedRanges,
      )
      const parts =
        closing < 0
          ? undefined
          : destinationAndSuffix(
              markdown.slice(closingLabel + 2, closing),
            )
      if (parts) targets.push(parts.destination)
      index = closing < 0 ? closingLabel + 1 : closing + 1
      continue
    }

    let referenceLabel = label
    let consumed = closingLabel + 1
    if (markdown[next] === '[') {
      const closingReference = findClosingBracket(
        markdown,
        next,
        protectedRanges,
      )
      if (closingReference >= 0) {
        const explicitLabel = markdown.slice(next + 1, closingReference)
        if (explicitLabel.trim() !== '') referenceLabel = explicitLabel
        consumed = closingReference + 1
      }
    }
    const target = definitions.get(normalizedReferenceLabel(referenceLabel))
    if (target) targets.push(target)
    index = consumed
  }

  return Object.freeze(targets)
}
