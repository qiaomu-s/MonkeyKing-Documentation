import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  contentEntries,
  contentEntriesBySection,
  contentSectionOrder,
  contentSections,
  deletedLegacySources,
  frozenLegacyJsonStems,
  legacyAllEntryIds,
  validateContentCatalog,
} from '../scripts/content/catalog'
import type {
  ContentCatalogValidationOptions,
  ContentEntry,
} from '../scripts/content/catalog'

const kebabCaseSegment = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const expectedLegacyMarkdownSources = [
  ...contentEntries.flatMap(({ legacySource }) =>
    legacySource === undefined ? [] : [legacySource],
  ),
  ...deletedLegacySources,
].sort()
const expectedCanonicalOnlyEntries = [
  ['api.system.sysprops', 'docs/api/system/sysprops.md', 'sysprops'],
  ['api.system.sqlite', 'docs/api/system/sqlite.md', 'sqlite'],
  ['api.media.dm', 'docs/api/media/dm.md', 'dmApi'],
  ['api.media.mediainfo', 'docs/api/media/mediainfo.md', 'mediainfo'],
  ['api.utilities.util', 'docs/api/utilities/util.md', 'util'],
  ['api.utilities.converter', 'docs/api/utilities/converter.md', 'cvt'],
  ['api.utilities.formatter', 'docs/api/utilities/formatter.md', 'fmt'],
  ['api.utilities.jsox', 'docs/api/utilities/jsox.md', 'jsox'],
  ['api.utilities.mime', 'docs/api/utilities/mime.md', 'mime'],
  ['api.utilities.zip', 'docs/api/utilities/zip.md', 'zip'],
  ['api.utilities.nanoid', 'docs/api/utilities/nanoid.md', 'nanoid'],
  ['api.utilities.pinyin', 'docs/api/utilities/pinyin.md', 'pinyin'],
  ['api.utilities.pinyin4j', 'docs/api/utilities/pinyin4j.md', 'pinyin4j'],
  ['reference.dm.overview', 'docs/reference/dm/overview.md', 'dm'],
  ['reference.dm.image', 'docs/reference/dm/image.md', 'dmImage'],
  ['reference.dm.dictionary', 'docs/reference/dm/dictionary.md', 'dmDictionary'],
  ['reference.dm.text', 'docs/reference/dm/text.md', 'dmText'],
  ['reference.dm.ocr-auto', 'docs/reference/dm/ocr-auto.md', 'ocrMigration'],
  ['reference.dm.compatibility', 'docs/reference/dm/compatibility.md', 'dmCompatibility'],
  ['reference.dm.examples', 'docs/reference/dm/examples.md', 'dmExamples'],
  ['reference.dm.vscode', 'docs/reference/dm/vscode.md', 'dmVscode'],
] as const
const expectedLegacyAllEntryIds = [
  'guide.overview',
  'project.about',
  'guide.troubleshooting',
  'api.core.global',
  'api.automation.automator',
  'api.core.monkeyking',
  'api.core.app',
  'api.media.color',
  'api.media.image',
  'api.media.ocr',
  'api.media.barcode',
  'api.media.qr-code',
  'api.automation.keys',
  'api.system.device',
  'api.system.storages',
  'api.system.files',
  'api.system.engines',
  'api.system.tasks',
  'api.core.modules',
  'api.core.plugins',
  'api.system.toast',
  'api.system.notice',
  'api.system.console',
  'api.system.shell',
  'api.media.media',
  'api.system.sensors',
  'api.media.recorder',
  'api.system.timers',
  'api.system.threads',
  'api.system.continuation',
  'api.system.events',
  'api.automation.dialogs',
  'api.automation.floaty',
  'api.media.canvas',
  'api.automation.ui',
  'api.network.web',
  'api.network.http',
  'api.utilities.base64',
  'api.utilities.crypto',
  'api.utilities.opencc',
  'api.utilities.i18n',
  'api.utilities.e4x',
] as const

function valuesFor(key: 'id' | 'source' | 'route'): string[] {
  return contentEntries.map((entry) => entry[key])
}

function expectUnique(values: readonly string[]): void {
  expect(new Set(values).size).toBe(values.length)
}

function readLegacyMarkdownSources(): string[] {
  const apiDirectory = resolve(process.cwd(), 'api')
  if (!existsSync(apiDirectory)) return []

  return readdirSync(apiDirectory, {
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => `api/${entry.name}`)
    .sort()
}

function replaceEntry(
  index: number,
  replacement: Partial<ContentEntry>,
): readonly ContentEntry[] {
  return contentEntries.map((entry, entryIndex) =>
    entryIndex === index ? { ...entry, ...replacement } : entry,
  )
}

describe('content catalog contract', () => {
  test('provides the reusable TypeScript content catalog', () => {
    expect(existsSync(resolve(process.cwd(), 'scripts/content/catalog.ts'))).toBe(true)
  })

  test('contains the complete legacy corpus plus canonical-only module and dm pages', () => {
    const legacyEntryCount =
      expectedLegacyMarkdownSources.length - deletedLegacySources.length

    expect(contentEntries).toHaveLength(
      legacyEntryCount + expectedCanonicalOnlyEntries.length,
    )
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
      'reference/dm',
      'reference',
    ])
    expect([...new Set(contentEntries.map(({ section }) => section))]).toEqual(
      contentSectionOrder,
    )
  })

  test.each(['id', 'source', 'route'] as const)(
    'keeps every %s unique',
    (key) => {
      expectUnique(valuesFor(key))
    },
  )

  test('keeps every defined legacy source unique', () => {
    expectUnique(
      contentEntries.flatMap(({ legacySource }) =>
        legacySource === undefined ? [] : [legacySource],
      ),
    )
  })

  test('keeps JSON names unique while preserving the Monkey King compatibility alias', () => {
    const monkeyKing = contentEntries.find(({ id }) => id === 'api.core.monkeyking')
    const otherEntries = contentEntries.filter(({ id }) => id !== 'api.core.monkeyking')
    const jsonNames = contentEntries.flatMap(({ jsonNames }) => jsonNames)

    expect(monkeyKing?.jsonNames).toEqual(['monkeyking', 'autojs'])
    expect(otherEntries.every(({ jsonNames }) => jsonNames.length === 1)).toBe(
      true,
    )
    expect(contentEntries.every((entry) => entry.legacyJsonNames === entry.jsonNames)).toBe(
      true,
    )
    expectUnique(jsonNames)
  })

  test('declares every canonical-only module and preview reference JSON entry name', () => {
    expect(
      contentEntries
        .filter(({ legacySource }) => legacySource === undefined)
        .map(({ id, source, jsonNames, includeInLegacyAll }) => [
          id,
          source,
          jsonNames[0],
          includeInLegacyAll,
        ]),
    ).toEqual(
      expectedCanonicalOnlyEntries.map(([id, source, jsonName]) => [
        id,
        source,
        jsonName,
        false,
      ]),
    )
  })

  test('uses kebab-case source directories and basenames', () => {
    for (const entry of contentEntries) {
      expect(entry.source).toMatch(/^docs\/.+\.md$/)

      const relativeSource = entry.source.slice('docs/'.length, -'.md'.length)
      const sourceSegments = relativeSource.split('/')

      expect(sourceSegments.every((segment) => kebabCaseSegment.test(segment))).toBe(true)
      expect(entry.section).toBe(sourceSegments.slice(0, -1).join('/'))
      expect(entry.id).toBe(relativeSource.replaceAll('/', '.'))
      if (entry.legacySource !== undefined) {
        expect(entry.legacySource).toMatch(/^api\/[^/]+\.md$/)
      }
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
      jsonNames: ['monkeyking', 'autojs'],
      legacyJsonNames: ['monkeyking', 'autojs'],
      includeInLegacyAll: true,
    })
    expect(contentEntries.find(({ legacySource }) => legacySource === 'api/qa.md')).toEqual({
      id: 'guide.troubleshooting',
      legacySource: 'api/qa.md',
      source: 'docs/guide/troubleshooting.md',
      route: '/guide/troubleshooting.html',
      title: 'Troubleshooting - 疑难解答',
      section: 'guide',
      jsonNames: ['qa'],
      legacyJsonNames: ['qa'],
      includeInLegacyAll: true,
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
      jsonNames: ['documentation'],
      legacyJsonNames: ['documentation'],
      includeInLegacyAll: true,
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

  test('preserves the legacy all-document include order by canonical id', () => {
    expect(legacyAllEntryIds).toHaveLength(expectedLegacyAllEntryIds.length)
    expectUnique(legacyAllEntryIds)
    expect(legacyAllEntryIds.every((id) => contentEntries.some((entry) => entry.id === id))).toBe(
      true,
    )
    expect(legacyAllEntryIds).toEqual(expectedLegacyAllEntryIds)
    expect(
      new Set(
        contentEntries
          .filter(({ includeInLegacyAll }) => includeInLegacyAll)
          .map(({ id }) => id),
      ),
    ).toEqual(new Set(expectedLegacyAllEntryIds))
  })

  test('freezes the exported catalog and every nested collection at runtime', () => {
    expect(Object.isFrozen(contentSections)).toBe(true)
    expect(contentSections.every((section) => Object.isFrozen(section))).toBe(true)
    expect(Object.isFrozen(contentSectionOrder)).toBe(true)
    expect(Object.isFrozen(contentEntries)).toBe(true)
    expect(contentEntries.every((entry) => Object.isFrozen(entry))).toBe(true)
    expect(
      contentEntries.every(
        ({ jsonNames, legacyJsonNames }) =>
          Object.isFrozen(jsonNames) && Object.isFrozen(legacyJsonNames),
      ),
    ).toBe(true)
    expect(Object.isFrozen(contentEntriesBySection)).toBe(true)
    expect(
      Object.values(contentEntriesBySection).every((entries) =>
        Object.isFrozen(entries),
      ),
    ).toBe(true)
    expect(Object.isFrozen(deletedLegacySources)).toBe(true)
    expect(Object.isFrozen(frozenLegacyJsonStems)).toBe(true)
    expect(Object.isFrozen(legacyAllEntryIds)).toBe(true)
  })

  test('covers either the complete legacy inventory or all canonical targets', () => {
    const actualLegacySources = readLegacyMarkdownSources()
    const actualCanonicalSources = contentEntries
      .map(({ source }) => source)
      .filter((source) => existsSync(resolve(process.cwd(), source)))
      .sort()

    if (actualLegacySources.length > 0) {
      expect(actualLegacySources).toHaveLength(107)
      expect(actualLegacySources).toEqual(expectedLegacyMarkdownSources)
      expect(actualCanonicalSources).toEqual([])
      expect(
        validateContentCatalog({ legacyMarkdownSources: actualLegacySources }),
      ).toEqual([])
    } else {
      expect(actualCanonicalSources).toEqual(
        contentEntries.map(({ source }) => source).sort(),
      )
      expect(validateContentCatalog()).toEqual([])
    }
  })

  const actualLegacySources = expectedLegacyMarkdownSources
  const mutationCases: Array<{
    name: string
    options: ContentCatalogValidationOptions
    expectedError: RegExp
  }> = [
    {
      name: 'duplicate content identity',
      options: {
        entries: replaceEntry(1, { id: contentEntries[0].id }),
      },
      expectedError: /Duplicate content id/,
    },
    {
      name: 'route mismatch',
      options: {
        entries: replaceEntry(0, { route: '/wrong.html' }),
      },
      expectedError: /Route mismatch/,
    },
    {
      name: 'non-kebab source path',
      options: {
        entries: replaceEntry(0, { source: 'docs/guide/not_kebab.md' }),
      },
      expectedError: /Source path must be kebab-case/,
    },
    {
      name: 'unknown legacy all-document id',
      options: {
        allEntryIds: [...legacyAllEntryIds.slice(0, -1), 'unknown.content'],
      },
      expectedError: /Unknown legacy all-document content ids/,
    },
    {
      name: 'generated and frozen JSON collision',
      options: {
        frozenJsonStems: [
          ...frozenLegacyJsonStems,
          contentEntries[0].legacyJsonNames[0],
        ],
      },
      expectedError: /Frozen JSON stems collide with generated names/,
    },
    {
      name: 'unsafe generated JSON stem',
      options: {
        entries: replaceEntry(8, {
          jsonNames: ['nested/name'],
          legacyJsonNames: ['nested/name'],
        }),
      },
      expectedError: /Invalid generated legacy JSON stem/,
    },
    {
      name: 'missing legacy Markdown source',
      options: {
        legacyMarkdownSources: actualLegacySources.slice(1),
      },
      expectedError: /Missing legacy Markdown sources/,
    },
    {
      name: 'extra legacy Markdown source',
      options: {
        legacyMarkdownSources: [...actualLegacySources, 'api/unexpected.md'],
      },
      expectedError: /Unexpected legacy Markdown sources/,
    },
  ]

  test.each(mutationCases)(
    'reports $name',
    ({ options, expectedError }) => {
      expect(validateContentCatalog(options).join('\n')).toMatch(expectedError)
    },
  )

  test.each([
    '',
    'has space',
    'nested/name',
    'nested\\name',
    '.',
    '..',
    '../escape',
    'name.json',
    'control\u0000character',
  ])('rejects unsafe generated JSON stem %j', (stem) => {
    const errors = validateContentCatalog({
      entries: replaceEntry(8, {
        jsonNames: [stem],
        legacyJsonNames: [stem],
      }),
    })

    expect(errors.join('\n')).toMatch(/Invalid generated legacy JSON stem/)
  })

  test.each([
    '',
    'has space',
    'nested/name',
    'nested\\name',
    '.',
    '..',
    '../escape',
    'name.json',
    'control\u0000character',
  ])('rejects unsafe frozen JSON stem %j', (stem) => {
    const errors = validateContentCatalog({
      frozenJsonStems: [...frozenLegacyJsonStems.slice(0, -1), stem],
    })

    expect(errors.join('\n')).toMatch(/Invalid frozen legacy JSON stem/)
  })

  test.each(['404', 'camelCase9', 'kebab-case9'])(
    'accepts safe numeric, camelCase, and kebab-case JSON stem %s',
    (stem) => {
      const errors = validateContentCatalog({
        entries: replaceEntry(8, {
          jsonNames: [stem],
          legacyJsonNames: [stem],
        }),
      })

      expect(errors.filter((error) => error.includes('legacy JSON stem'))).toEqual([])
    },
  )
})
