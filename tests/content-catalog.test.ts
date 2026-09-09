import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import * as contentCatalog from '../scripts/content/catalog'
import {
  contentEntries,
  contentSectionOrder,
  deletedLegacySources,
  frozenLegacyJsonStems,
  validateContentCatalog,
} from '../scripts/content/catalog'

const kebabCaseSegment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function valuesFor(key: 'id' | 'legacySource' | 'source' | 'route'): string[] {
  return contentEntries.map((entry) => entry[key])
}

function expectUnique(values: readonly string[]): void {
  expect(new Set(values).size).toBe(values.length)
}

describe('content catalog contract', () => {
  test('provides the reusable TypeScript content catalog', () => {
    expect(existsSync(resolve(process.cwd(), 'scripts/content/catalog.ts'))).toBe(true)
  })

  test('contains exactly 101 ordered content entries', () => {
    expect(contentEntries).toHaveLength(101)
    expect(contentSectionOrder).toEqual([
      'guide',
      'project',
      'api/core',
      'api/automation',
      'api/system',
      'api/media',
      'api/network',
      'api/utilities',
      'api/types',
      'reference/android',
      'reference/runtime',
      'reference/glossaries',
      'reference',
    ])
    expect([...new Set(contentEntries.map(({ section }) => section))]).toEqual(
      contentSectionOrder,
    )
  })

  test.each(['id', 'legacySource', 'source', 'route'] as const)(
    'keeps every %s unique',
    (key) => {
      expectUnique(valuesFor(key))
    },
  )

  test('keeps JSON names unique while preserving the Monkey King compatibility alias', () => {
    const monkeyKing = contentEntries.find(({ id }) => id === 'api.core.monkeyking')
    const otherEntries = contentEntries.filter(({ id }) => id !== 'api.core.monkeyking')
    const jsonNames = contentEntries.flatMap(({ legacyJsonNames }) => legacyJsonNames)

    expect(monkeyKing?.legacyJsonNames).toEqual(['monkeyking', 'autojs'])
    expect(otherEntries.every(({ legacyJsonNames }) => legacyJsonNames.length === 1)).toBe(
      true,
    )
    expectUnique(jsonNames)
  })

  test('uses kebab-case source directories and basenames', () => {
    for (const entry of contentEntries) {
      expect(entry.source).toMatch(/^docs\/.+\.md$/)

      const relativeSource = entry.source.slice('docs/'.length, -'.md'.length)
      const sourceSegments = relativeSource.split('/')

      expect(sourceSegments.every((segment) => kebabCaseSegment.test(segment))).toBe(true)
      expect(entry.section).toBe(sourceSegments.slice(0, -1).join('/'))
      expect(entry.id).toBe(relativeSource.replaceAll('/', '.'))
      expect(entry.legacySource).toMatch(/^api\/[^/]+\.md$/)
    }
  })

  test('derives every route from its source path', () => {
    for (const entry of contentEntries) {
      expect(entry.route).toBe(entry.source.slice('docs'.length).replace(/\.md$/, '.html'))
    }
  })

  test('preserves the three special legacy-to-canonical mappings', () => {
    expect(contentEntries.find(({ legacySource }) => legacySource === 'api/autojs.md')).toEqual({
      id: 'api.core.monkeyking',
      legacySource: 'api/autojs.md',
      source: 'docs/api/core/monkeyking.md',
      route: '/api/core/monkeyking.html',
      title: 'Monkey King - 本体应用',
      section: 'api/core',
      legacyJsonNames: ['monkeyking', 'autojs'],
    })
    expect(contentEntries.find(({ legacySource }) => legacySource === 'api/qa.md')).toEqual({
      id: 'guide.troubleshooting',
      legacySource: 'api/qa.md',
      source: 'docs/guide/troubleshooting.md',
      route: '/guide/troubleshooting.html',
      title: 'Troubleshooting - 疑难解答',
      section: 'guide',
      legacyJsonNames: ['qa'],
    })
    expect(
      contentEntries.find(({ legacySource }) => legacySource === 'api/documentation.md'),
    ).toEqual({
      id: 'project.about',
      legacySource: 'api/documentation.md',
      source: 'docs/project/about.md',
      route: '/project/about.html',
      title: 'About - 关于文档',
      section: 'project',
      legacyJsonNames: ['documentation'],
    })
  })

  test('declares the six legacy Markdown sources that will be deleted', () => {
    expect(deletedLegacySources).toEqual([
      'api/all.md',
      'api/sidebar.md',
      'api/toc.md',
      'api/coverpage.md',
      'api/404.md',
      'api/util.md',
    ])
  })

  test('declares exactly the ten frozen legacy JSON stems', () => {
    expect(frozenLegacyJsonStems).toEqual([
      'accessibilityActionsType',
      'coordinates-based-automation',
      'coordinatesBasedAutomation',
      'errors',
      'globals',
      'imageWrapper',
      'intent',
      'intrinsicTypes',
      'widgets-based-automation',
      'widgetsBasedAutomation',
    ])
  })

  test('preserves the 42-entry legacy all-document include order by canonical id', () => {
    const legacyAllEntryIds = Reflect.get(contentCatalog, 'legacyAllEntryIds') as
      | readonly string[]
      | undefined
    const legacyAllStems = [
      ...readFileSync(resolve(process.cwd(), 'api/all.md'), 'utf8').matchAll(
        /^@include (\S+)$/gm,
      ),
    ].map((match) => match[1])
    const expectedEntryIds = legacyAllStems.map(
      (legacyStem) =>
        contentEntries.find(
          ({ legacySource }) => legacySource === `api/${legacyStem}.md`,
        )?.id,
    )

    expect(legacyAllEntryIds).toHaveLength(42)
    expectUnique(legacyAllEntryIds ?? [])
    expect(legacyAllEntryIds?.every((id) => contentEntries.some((entry) => entry.id === id))).toBe(
      true,
    )
    expect(legacyAllEntryIds).toEqual(expectedEntryIds)
  })

  test('covers all 107 current api Markdown files with entries or deletions', () => {
    const actualLegacySources = readdirSync(resolve(process.cwd(), 'api'), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => `api/${entry.name}`)
      .sort()
    const catalogedLegacySources = [
      ...contentEntries.map(({ legacySource }) => legacySource),
      ...deletedLegacySources,
    ].sort()

    expect(actualLegacySources).toHaveLength(107)
    expect(catalogedLegacySources).toEqual(actualLegacySources)
    expect(
      validateContentCatalog({ legacyMarkdownSources: actualLegacySources }),
    ).toEqual([])
  })
})
