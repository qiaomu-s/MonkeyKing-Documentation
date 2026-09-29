import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { generateApiCoverageArtifacts } from '../scripts/api/coverage-generator'
import type { ApiManifest } from '../scripts/api/model'
import { buildMarkdownDocumentIndexes } from '../scripts/content/markdown-links'

const scopedOwners = new Set([
  'app',
  'auto',
  'automator',
  'dialogs',
  'floaty',
  'keys',
  'plugins',
  'rootAutomator',
  'rootAutomator.instance',
  'selector',
  'ui',
  'ui.Widget',
])

const scopedPages = [
  'docs/api/automation/automator.md',
  'docs/api/automation/dialogs.md',
  'docs/api/automation/floaty.md',
  'docs/api/automation/keys.md',
  'docs/api/automation/ui.md',
  'docs/api/automation/ui-selector.md',
  'docs/api/automation/ui-object.md',
  'docs/api/automation/ui-object-actions.md',
  'docs/api/automation/ui-object-collection.md',
  'docs/api/core/app.md',
  'docs/api/core/plugins.md',
] as const

interface SourceHeading {
  readonly level: number
  readonly line: number
}

function markdown(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

function sourceHeadings(source: string): readonly SourceHeading[] {
  const headings: SourceHeading[] = []
  const lines = source.split('\n')
  let fence: { marker: string; size: number } | undefined

  for (const [line, sourceLine] of lines.entries()) {
    const fenceMatch = sourceLine.match(/^\s*(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1][0]
      if (!fence) fence = { marker, size: fenceMatch[1].length }
      else if (marker === fence.marker && fenceMatch[1].length >= fence.size) {
        fence = undefined
      }
      continue
    }
    if (fence) continue

    const heading = sourceLine.match(/^ {0,3}(#{1,6})\s+\S/)
    if (heading) headings.push({ level: heading[1].length, line })
  }

  return headings
}

describe('automation and core app API contracts', () => {
  test('maps every scoped canonical manifest symbol to a unique real section', async () => {
    const manifest = JSON.parse(markdown('api-surface/manifest.json')) as ApiManifest
    const artifacts = await generateApiCoverageArtifacts({
      manifest,
      projectRoot: process.cwd(),
    })
    const scopedSymbols = manifest.symbols.filter(
      (symbol) => symbol.public && scopedOwners.has(symbol.owner) && !symbol.canonicalId,
    )
    const scopedGaps = artifacts.gaps.filter((gap) => scopedOwners.has(gap.owner))
    const rules = new Map(
      artifacts.coverage.rules.map((rule) => [rule.patterns[0], rule]),
    )

    expect(scopedGaps).toEqual([])
    expect(scopedSymbols.every((symbol) => rules.get(symbol.id)?.target)).toBe(true)
    expect(
      new Set(scopedSymbols.map((symbol) => rules.get(symbol.id)?.target)).size,
    ).toBe(scopedSymbols.length)
  })

  test('keeps every mapped scoped section versioned and runnable', async () => {
    const manifest = JSON.parse(markdown('api-surface/manifest.json')) as ApiManifest
    const artifacts = await generateApiCoverageArtifacts({
      manifest,
      projectRoot: process.cwd(),
    })
    const scopedSymbols = manifest.symbols.filter(
      (symbol) => symbol.public && scopedOwners.has(symbol.owner) && !symbol.canonicalId,
    )
    const rules = new Map(
      artifacts.coverage.rules.map((rule) => [rule.patterns[0], rule]),
    )
    const pageSources = new Map<string, string>(
      scopedPages.map((page) => [page, markdown(page)] as const),
    )
    const indexes = await buildMarkdownDocumentIndexes(
      [...pageSources].map(([id, source]) => ({ id, markdown: source })),
      process.cwd(),
    )

    for (const symbol of scopedSymbols) {
      const target = rules.get(symbol.id)?.target
      if (!target) continue
      const [page, anchor] = target.split('#')
      const source = pageSources.get(page)
      const index = indexes.get(page)
      expect(source, `${symbol.id} must target a scoped page`).toBeDefined()
      expect(index, `${page} must have a Markdown index`).toBeDefined()
      if (!source || !index) continue

      const rawHeadings = sourceHeadings(source)
      expect(rawHeadings, `${page} heading scan must match rendered headings`).toHaveLength(
        index.headings.length,
      )
      const headingIndex = index.headings.findIndex((heading) => heading.anchor === anchor)
      const lines = source.split('\n')
      let section: string
      if (headingIndex >= 0) {
        const current = rawHeadings[headingIndex]
        const next = rawHeadings
          .slice(headingIndex + 1)
          .find((heading) => heading.level <= current.level)
        section = lines.slice(current.line, next?.line ?? lines.length).join('\n')
      } else {
        const anchorLine = lines.findIndex((line) =>
          line.includes(`<a id="${anchor}"></a>`),
        )
        expect(anchorLine, `${symbol.id} explicit target anchor must exist`).toBeGreaterThanOrEqual(0)
        if (anchorLine < 0) continue
        const headingOffset = rawHeadings.findIndex((heading) => heading.line > anchorLine)
        const current = rawHeadings[headingOffset]
        expect(current, `${symbol.id} explicit anchor must precede a heading`).toBeDefined()
        if (!current) continue
        const next = rawHeadings
          .slice(headingOffset + 1)
          .find((heading) => heading.level <= current.level)
        section = lines.slice(anchorLine, next?.line ?? lines.length).join('\n')
      }

      expect(section, `${symbol.id} must not expose the removed product version`).not.toMatch(
        /\bv?6\.7\.0\b/,
      )
      expect(section, `${symbol.id} must include a Rhino JavaScript example`).toMatch(
        /```(?:js|javascript)\s/,
      )
    }
  })

  test('contains no unfinished placeholders in the scoped pages', () => {
    for (const page of scopedPages) {
      expect(markdown(page), page).not.toMatch(
        /待补充|\bPENDING\b|孤立|xxx\s*事件|完善中/i,
      )
    }
  })

  test('does not advertise removed plugins.extend calls as current examples', () => {
    expect(markdown('docs/api/types/data-types.md')).not.toMatch(
      /plugins\.extend(?:All(?:But)?)?\s*\(/,
    )
  })
})
