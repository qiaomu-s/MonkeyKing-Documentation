import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { basename, extname, resolve } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import {
  contentEntries,
  legacyAllEntryIds,
} from '../scripts/content/catalog'
import {
  buildLegacyJson,
  createLegacyJsonOutputs,
  resolveEntryMarkdownPath,
} from '../scripts/json/build'
import {
  parseLegacyMarkdown,
  stringifyLegacyDocument,
} from '../scripts/json/legacy-parser'

const fixtureDirectory = resolve(process.cwd(), 'tests/fixtures/json')
const retiredJsonFilenames = [
  '404.json',
  'coverpage.json',
  'sidebar.json',
  'toc.json',
  'util.json',
] as const
const frozenJsonHashes = {
  'accessibilityActionsType.json':
    '135ef9e95e2803174f72ba77eb53c7f819c23bd074cf10ac0f7823266822fced',
  'coordinates-based-automation.json':
    'b9cb567af85eeda2db3ee8f6e4f786d3e76493ea71a85c4496bc268f13d4d607',
  'coordinatesBasedAutomation.json':
    '203775cf8672d3bce5bc3e280d749639c5ef2a3a460bb19b8ba3b88430691d5b',
  'errors.json':
    'd988e2ac4af1cf7fc867da3f3a970d32214ea789699ca06e71f4e7c4ac4ca191',
  'globals.json':
    '12d8d4d329947023987583805a0cf097d334fc9d226cefa36b583c1b98d6283e',
  'imageWrapper.json':
    'a6b43d45784ff4b0399746df63236087a56c39cd14425633ef41d4533a3ae5f5',
  'intent.json':
    '676513ed7e2e7dfc4d848de3adc72f2442ad1fdd968e18ec578594d23c888ab7',
  'intrinsicTypes.json':
    'd3df3c9d02e63328ff76543eb5cb28f4dc38abd35c6767e86d953694acf64eb6',
  'widgets-based-automation.json':
    '0da3b149a8eb254e6fca9efa6f7aa1194fe72d5c4272ce7dd55993487d344249',
  'widgetsBasedAutomation.json':
    '04b03a2d9cc21f68be86b8b014bb964112b76148e6285c25d53d90734e04e9ed',
} as const

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function createTemporaryLegacyProject(): string {
  const temporaryRoot = mkdtempSync(resolve(tmpdir(), 'legacy-json-build-'))
  mkdirSync(resolve(temporaryRoot, 'api'), { recursive: true })
  mkdirSync(resolve(temporaryRoot, 'json'), { recursive: true })

  for (const entry of contentEntries) {
    copyFileSync(
      resolve(process.cwd(), entry.legacySource),
      resolve(temporaryRoot, entry.legacySource),
    )
  }

  for (const filename of readdirSync(resolve(process.cwd(), 'json'))) {
    if (filename.endsWith('.json')) {
      copyFileSync(
        resolve(process.cwd(), 'json', filename),
        resolve(temporaryRoot, 'json', filename),
      )
    }
  }

  for (const filename of retiredJsonFilenames) {
    writeFileSync(resolve(temporaryRoot, 'json', filename), '{}')
  }

  return temporaryRoot
}

describe('legacy JSON compatibility', () => {
  test('provides the TypeScript legacy parser module', () => {
    expect(
      existsSync(resolve(process.cwd(), 'scripts/json/legacy-parser.ts')),
    ).toBe(true)
  })

  test('provides the JSON build module and compatibility schema', () => {
    expect(existsSync(resolve(process.cwd(), 'scripts/json/build.ts'))).toBe(true)
    expect(
      existsSync(
        resolve(process.cwd(), 'scripts/json/legacy-document.schema.json'),
      ),
    ).toBe(true)
  })

  test('preserves the legacy parser golden behavior', () => {
    const markdown = readFileSync(
      resolve(fixtureDirectory, 'legacy-golden.md'),
      'utf8',
    )
    const expected = readFileSync(
      resolve(fixtureDirectory, 'legacy-golden.json'),
      'utf8',
    ).trimEnd()

    const actual = stringifyLegacyDocument(
      parseLegacyMarkdown(markdown, '..\\api\\fixture.md'),
    )

    expect(actual).toBe(expected)
    expect(actual.endsWith('\n')).toBe(false)
    expect(actual).not.toContain('removed before lexing')
    expect(actual).toContain('<h3>Example</h3>\\n')
    expect(actual).not.toContain('<h3 id=')
    expect(actual).toContain('"name": "<ins>**returns**</ins>"')
  })

  test('rejects active Markdown YAML blocks without adding a YAML parser', () => {
    expect(() =>
      parseLegacyMarkdown(
        '# Active\n<!-- YAML\nadded: v1\n-->\n',
        '..\\api\\active.md',
      ),
    ).toThrow(/YAML metadata blocks are not supported.*active\.md/i)
  })

  test('selects canonical Markdown when present and otherwise falls back to legacy input', () => {
    const temporaryRoot = mkdtempSync(resolve(tmpdir(), 'legacy-json-input-'))
    const entry = contentEntries[0]
    const canonicalPath = resolve(temporaryRoot, entry.source)
    const legacyPath = resolve(temporaryRoot, entry.legacySource)

    try {
      mkdirSync(resolve(canonicalPath, '..'), { recursive: true })
      mkdirSync(resolve(legacyPath, '..'), { recursive: true })
      writeFileSync(legacyPath, 'legacy')

      expect(resolveEntryMarkdownPath(temporaryRoot, entry)).toBe(legacyPath)

      writeFileSync(canonicalPath, 'canonical')
      expect(resolveEntryMarkdownPath(temporaryRoot, entry)).toBe(canonicalPath)

      rmSync(canonicalPath)
      rmSync(legacyPath)
      expect(() => resolveEntryMarkdownPath(temporaryRoot, entry)).toThrow(
        new RegExp(`${entry.source}.*${entry.legacySource}`, 's'),
      )
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('matches all 101 active legacy JSON baselines and parses all Markdown once', () => {
    const outputs = createLegacyJsonOutputs(process.cwd())
    const outputsByFilename = new Map(
      outputs.map(({ filename, text }) => [filename, text]),
    )

    expect(contentEntries).toHaveLength(101)
    expect(legacyAllEntryIds).toHaveLength(42)
    expect(outputs).toHaveLength(103)

    for (const entry of contentEntries) {
      const legacyStem = basename(entry.legacySource, extname(entry.legacySource))
      const baseline = readFileSync(
        resolve(process.cwd(), 'json', `${legacyStem}.json`),
        'utf8',
      )

      for (const jsonName of entry.legacyJsonNames) {
        expect(outputsByFilename.get(`${jsonName}.json`), jsonName).toBe(baseline)
      }
    }

    expect(outputsByFilename.get('all.json')).toBe(
      readFileSync(resolve(process.cwd(), 'json/all.json'), 'utf8'),
    )
    expect(outputsByFilename.get('monkeyking.json')).toBe(
      outputsByFilename.get('autojs.json'),
    )
  })

  test('rejects unexpected JSON without deleting or rewriting it', () => {
    const temporaryRoot = createTemporaryLegacyProject()
    const roguePath = resolve(temporaryRoot, 'json/rogue.json')
    const retiredPath = resolve(temporaryRoot, 'json/404.json')

    try {
      writeFileSync(roguePath, '{"ownedBy":"user"}')

      expect(() => buildLegacyJson(temporaryRoot)).toThrow(
        /Unexpected JSON file.*rogue\.json/i,
      )
      expect(readFileSync(roguePath, 'utf8')).toBe('{"ownedBy":"user"}')
      expect(existsSync(retiredPath)).toBe(true)
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('builds exactly 113 schema-ready files while preserving frozen bytes', () => {
    const temporaryRoot = createTemporaryLegacyProject()
    const jsonDirectory = resolve(temporaryRoot, 'json')
    const expectedFilenames = [
      ...contentEntries.flatMap((entry) =>
        entry.legacyJsonNames.map((name) => `${name}.json`),
      ),
      'all.json',
      ...Object.keys(frozenJsonHashes),
    ].sort()

    try {
      buildLegacyJson(temporaryRoot)

      const firstInventory = readdirSync(jsonDirectory)
        .filter((filename) => filename.endsWith('.json'))
        .sort()
      const firstContents = new Map(
        firstInventory.map((filename) => [
          filename,
          readFileSync(resolve(jsonDirectory, filename), 'utf8'),
        ]),
      )

      expect(firstInventory).toHaveLength(113)
      expect(firstInventory).toEqual(expectedFilenames)
      expect(
        retiredJsonFilenames.every(
          (filename) => !existsSync(resolve(jsonDirectory, filename)),
        ),
      ).toBe(true)
      expect(firstContents.get('monkeyking.json')).toBe(
        firstContents.get('autojs.json'),
      )

      for (const entry of contentEntries) {
        const legacyStem = basename(entry.legacySource, extname(entry.legacySource))
        for (const jsonName of entry.legacyJsonNames) {
          expect(
            JSON.parse(firstContents.get(`${jsonName}.json`) ?? '{}').source,
          ).toBe(`..\\api\\${legacyStem}.md`)
        }
      }
      expect(JSON.parse(firstContents.get('all.json') ?? '{}').source).toBe(
        '..\\api\\all.md',
      )

      for (const [filename, hash] of Object.entries(frozenJsonHashes)) {
        expect(sha256(resolve(jsonDirectory, filename)), filename).toBe(hash)
        const source = JSON.parse(
          readFileSync(resolve(jsonDirectory, filename), 'utf8'),
        ).source as string
        const stem = filename.slice(0, -'.json'.length)
        expect(source.replace(/^\.\.[\\/]api[\\/]/, ''), filename).toBe(
          `${stem}.md`,
        )
      }

      buildLegacyJson(temporaryRoot)
      const secondInventory = readdirSync(jsonDirectory)
        .filter((filename) => filename.endsWith('.json'))
        .sort()
      expect(secondInventory).toEqual(firstInventory)
      for (const filename of secondInventory) {
        expect(readFileSync(resolve(jsonDirectory, filename), 'utf8')).toBe(
          firstContents.get(filename),
        )
      }
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('validates all 113 documents with the Draft 2020-12 legacy schema', () => {
    const schema = JSON.parse(
      readFileSync(
        resolve(process.cwd(), 'scripts/json/legacy-document.schema.json'),
        'utf8',
      ),
    ) as object
    const validate = new Ajv2020({ allErrors: true }).compile(schema)
    const documents = [
      ...createLegacyJsonOutputs(process.cwd()),
      ...Object.keys(frozenJsonHashes).map((filename) => ({
        filename,
        text: readFileSync(resolve(process.cwd(), 'json', filename), 'utf8'),
      })),
    ]

    expect(documents).toHaveLength(113)
    for (const { filename, text } of documents) {
      expect(validate(JSON.parse(text)), `${filename}: ${JSON.stringify(validate.errors)}`).toBe(
        true,
      )
    }

    expect(validate({})).toBe(false)
    expect(validate({ source: '..\\api\\bad.md', unexpected: true })).toBe(false)
    expect(validate({ source: 'api/bad.md' })).toBe(false)
    expect(
      validate({
        source: '..\\api\\bad.md',
        methods: [
          {
            textRaw: 'bad()',
            name: 'bad',
            signatures: [{}],
          },
        ],
      }),
    ).toBe(false)
    expect(
      validate({
        source: '..\\api\\bad.md',
        methods: [
          {
            textRaw: 'bad()',
            name: 'bad',
            signatures: [
              {
                params: [{ optional: false }],
                return: { name: 'not-return' },
              },
            ],
          },
        ],
      }),
    ).toBe(false)
  })
})
