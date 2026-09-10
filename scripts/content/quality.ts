import { scanMarkdownCode } from './markdown-source'

export interface ContentSource {
  readonly source: string
  readonly markdown: string
}

export interface PlaceholderIssue {
  readonly source: string
  readonly line: number
  readonly marker: string
}

export interface ContentQualityReport {
  readonly scannedSourceCount: number
  readonly issues: readonly PlaceholderIssue[]
}

interface PlaceholderPattern {
  readonly label: string
  readonly expression: RegExp
}

const placeholderPatterns: readonly PlaceholderPattern[] = Object.freeze([
  {
    label: '待补充/待完善',
    expression: /待补充(?:或完善)?|待完善/g,
  },
  {
    label: 'PENDING',
    expression: /\bPENDING\b/gi,
  },
  {
    label: 'TODO/FIXME',
    expression: /\b(?:TODO|FIXME)\b/gi,
  },
  {
    label: 'xxx 事件',
    expression: /\bxxx[ \t]*事件/gi,
  },
  {
    label: '孤立省略号',
    expression: /^[ \t]*(?:>[ \t]*)?(?:[-*+][ \t]+)?\.{3}[ \t]*$/gm,
  },
])

function maskedMarkdown(markdown: string): string {
  const characters = [...markdown]
  for (const { start, end } of scanMarkdownCode(markdown).protectedRanges) {
    for (let index = start; index < end; index += 1) {
      if (characters[index] !== '\n' && characters[index] !== '\r') {
        characters[index] = ' '
      }
    }
  }
  return characters.join('')
}

function sourceLine(markdown: string, index: number): number {
  let line = 1
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (markdown[cursor] === '\n') line += 1
  }
  return line
}

export function findPlaceholderIssues(
  markdown: string,
  source: string,
): PlaceholderIssue[] {
  const searchable = maskedMarkdown(markdown)
  const issues: PlaceholderIssue[] = []

  for (const pattern of placeholderPatterns) {
    pattern.expression.lastIndex = 0
    for (const match of searchable.matchAll(pattern.expression)) {
      issues.push({
        source,
        line: sourceLine(searchable, match.index ?? 0),
        marker: pattern.label,
      })
    }
  }

  return issues.sort(
    (left, right) =>
      left.line - right.line || left.marker.localeCompare(right.marker),
  )
}

export function inspectContentQuality(
  sources: readonly ContentSource[],
): ContentQualityReport {
  const issues = sources.flatMap(({ source, markdown }) =>
    findPlaceholderIssues(markdown, source),
  )
  return Object.freeze({
    scannedSourceCount: sources.length,
    issues: Object.freeze(issues),
  })
}
