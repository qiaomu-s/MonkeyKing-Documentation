export interface SourceRange {
  readonly start: number
  readonly end: number
}

export interface FenceOpening {
  readonly infoStart: number
  readonly infoEnd: number
}

export interface MarkdownCodeScan {
  readonly protectedRanges: readonly SourceRange[]
  readonly fenceOpenings: readonly FenceOpening[]
}

interface SourceLine {
  readonly start: number
  readonly contentEnd: number
  readonly end: number
  readonly content: string
}

interface BlockquotePrefix {
  readonly depth: number
  readonly length: number
}

interface ActiveFence {
  readonly start: number
  readonly marker: string
  readonly length: number
  readonly blockquoteDepth: number
}

function sourceLines(markdown: string): readonly SourceLine[] {
  const lines: SourceLine[] = []
  let start = 0

  while (start < markdown.length) {
    const newline = markdown.indexOf('\n', start)
    const end = newline < 0 ? markdown.length : newline + 1
    let contentEnd = newline < 0 ? markdown.length : newline
    if (contentEnd > start && markdown[contentEnd - 1] === '\r') {
      contentEnd -= 1
    }
    lines.push({
      start,
      contentEnd,
      end,
      content: markdown.slice(start, contentEnd),
    })
    start = end
  }

  return lines
}

function blockquotePrefix(line: string): BlockquotePrefix {
  let depth = 0
  let length = 0

  while (length < line.length) {
    const match = /^ {0,3}>[ \t]?/.exec(line.slice(length))
    if (!match) break
    depth += 1
    length += match[0].length
  }

  return { depth, length }
}

export function isBackslashEscaped(source: string, index: number): boolean {
  let backslashes = 0
  for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor -= 1) {
    backslashes += 1
  }
  return backslashes % 2 === 1
}

function fenceRanges(markdown: string): {
  readonly ranges: readonly SourceRange[]
  readonly openings: readonly FenceOpening[]
  readonly lines: readonly SourceLine[]
} {
  const ranges: SourceRange[] = []
  const openings: FenceOpening[] = []
  const lines = sourceLines(markdown)
  let active: ActiveFence | undefined

  for (const line of lines) {
    const quote = blockquotePrefix(line.content)

    if (active && quote.depth < active.blockquoteDepth) {
      ranges.push({ start: active.start, end: line.start })
      active = undefined
    }

    const content = line.content.slice(quote.length)
    if (active) {
      const closing = /^( {0,3})(`{3,}|~{3,})[ \t]*$/.exec(content)
      if (
        quote.depth === active.blockquoteDepth &&
        closing &&
        closing[2][0] === active.marker &&
        closing[2].length >= active.length
      ) {
        ranges.push({ start: active.start, end: line.end })
        active = undefined
      }
      continue
    }

    const opening = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(content)
    if (!opening) continue
    if (opening[2][0] === '`' && opening[3].includes('`')) continue

    const markerStart = line.start + quote.length + opening[1].length
    openings.push({
      infoStart: markerStart + opening[2].length,
      infoEnd: line.contentEnd,
    })
    active = {
      start: line.start,
      marker: opening[2][0],
      length: opening[2].length,
      blockquoteDepth: quote.depth,
    }
  }

  if (active) ranges.push({ start: active.start, end: markdown.length })
  return { ranges, openings, lines }
}

function overlapsRange(
  start: number,
  end: number,
  ranges: readonly SourceRange[],
): boolean {
  return ranges.some((range) => range.start < end && range.end > start)
}

function findClosingBackticks(
  markdown: string,
  start: number,
  end: number,
  runLength: number,
): number {
  let cursor = start

  while (cursor < end) {
    if (markdown[cursor] !== '`' || isBackslashEscaped(markdown, cursor)) {
      cursor += 1
      continue
    }

    let length = 1
    while (markdown[cursor + length] === '`') length += 1
    if (length === runLength) return cursor
    cursor += length
  }

  return -1
}

function inlineCodeRanges(
  markdown: string,
  fences: readonly SourceRange[],
  lines: readonly SourceLine[],
): readonly SourceRange[] {
  const blocks: SourceRange[] = []
  let blockStart: number | undefined

  for (const line of lines) {
    if (overlapsRange(line.start, line.end, fences)) {
      if (blockStart !== undefined && blockStart < line.start) {
        blocks.push({ start: blockStart, end: line.start })
      }
      blockStart = undefined
      continue
    }

    const quote = blockquotePrefix(line.content)
    const isBlank = line.content.slice(quote.length).trim() === ''
    if (isBlank) {
      if (blockStart !== undefined && blockStart < line.start) {
        blocks.push({ start: blockStart, end: line.start })
      }
      blockStart = undefined
    } else if (blockStart === undefined) {
      blockStart = line.start
    }
  }

  if (blockStart !== undefined && blockStart < markdown.length) {
    blocks.push({ start: blockStart, end: markdown.length })
  }

  const ranges: SourceRange[] = []
  for (const block of blocks) {
    let cursor = block.start
    while (cursor < block.end) {
      if (markdown[cursor] !== '`' || isBackslashEscaped(markdown, cursor)) {
        cursor += 1
        continue
      }

      let runLength = 1
      while (markdown[cursor + runLength] === '`') runLength += 1
      const closing = findClosingBackticks(
        markdown,
        cursor + runLength,
        block.end,
        runLength,
      )
      if (closing < 0) {
        cursor += runLength
        continue
      }

      ranges.push({ start: cursor, end: closing + runLength })
      cursor = closing + runLength
    }
  }

  return ranges
}

export function scanMarkdownCode(markdown: string): MarkdownCodeScan {
  const fences = fenceRanges(markdown)
  const inline = inlineCodeRanges(markdown, fences.ranges, fences.lines)
  return {
    protectedRanges: [...fences.ranges, ...inline].sort(
      (left, right) => left.start - right.start,
    ),
    fenceOpenings: fences.openings,
  }
}

export function transformOutsideMarkdownCode(
  markdown: string,
  transform: (source: string) => string,
): string {
  const { protectedRanges } = scanMarkdownCode(markdown)
  let output = ''
  let cursor = 0

  for (const range of protectedRanges) {
    output += transform(markdown.slice(cursor, range.start))
    output += markdown.slice(range.start, range.end)
    cursor = range.end
  }

  return output + transform(markdown.slice(cursor))
}
