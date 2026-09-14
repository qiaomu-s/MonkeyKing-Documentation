import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { basename, dirname, extname, resolve } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import {
  contentEntries,
  frozenLegacyJsonStems,
  legacyAllEntryIds,
} from '../scripts/content/catalog'
import type { ContentEntry } from '../scripts/content/catalog'
import {
  buildLegacyJson,
  checkLegacyJson,
  createLegacyJsonOutputs,
  resolveEntryMarkdownPath,
} from '../scripts/json/build'
import { frozenLegacyJsonManifest } from '../scripts/json/frozen'
import {
  parseLegacyMarkdown,
  stringifyLegacyDocument,
} from '../scripts/json/legacy-parser'

const fixtureDirectory = resolve(process.cwd(), 'tests/fixtures/json')
const legacyCorpusStructureFixturePath = resolve(
  fixtureDirectory,
  'legacy-corpus-structure.json',
)
const frozenFixtureDirectory = resolve(fixtureDirectory, 'frozen')
const legacyCorpusStructureBaseSha =
  'f7de717b3a6d086003462772712aaa479eeda2e9'
const legacyCorpusStructureAlgorithm = 'recursive-json-structure-v1'
const retiredJsonFilenames = [
  '404.json',
  'coverpage.json',
  'sidebar.json',
  'toc.json',
] as const
const frozenJsonHashes = Object.fromEntries(
  frozenLegacyJsonManifest.map(({ stem, sha256 }) => [`${stem}.json`, sha256]),
)
const expectedCommittedJsonFilenames = [
  ...contentEntries.flatMap((entry) =>
    entry.jsonNames.map((name) => `${name}.json`),
  ),
  'all.json',
  ...Object.keys(frozenJsonHashes),
].sort()
const expectedCurrentOnlyJsonFilenames = [
  ...contentEntries
    .filter(({ legacySource }) => legacySource === undefined)
    .flatMap(({ jsonNames }) => jsonNames.map((name) => `${name}.json`)),
  'monkeyking.json',
].sort()

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function jsonStructureSignature(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) {
    return JSON.stringify([
      'array',
      value.length,
      value.map((child) => jsonStructureSignature(child)),
    ])
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return JSON.stringify([
      'object',
      Object.keys(record)
        .sort()
        .map((key) => [key, jsonStructureSignature(record[key])]),
    ])
  }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return typeof value
  }
  throw new Error(`Unsupported JSON value type: ${typeof value}`)
}

function jsonStructureSha256(value: unknown): string {
  return createHash('sha256')
    .update(jsonStructureSignature(value))
    .digest('hex')
}

function copyMarkdownInputs(sourceRoot: string, destinationRoot: string): void {
  for (const entry of contentEntries) {
    const source = resolveEntryMarkdownPath(sourceRoot, entry)
    const repositoryPath = source === resolve(sourceRoot, entry.source)
      ? entry.source
      : entry.legacySource ?? entry.source
    const destination = resolve(destinationRoot, repositoryPath)
    mkdirSync(dirname(destination), { recursive: true })
    copyFileSync(source, destination)
  }
}

function createTemporaryJsonProject(sourceRoot = process.cwd()): string {
  const temporaryRoot = mkdtempSync(resolve(tmpdir(), 'legacy-json-build-'))
  mkdirSync(resolve(temporaryRoot, 'json'), { recursive: true })

  copyMarkdownInputs(sourceRoot, temporaryRoot)

  for (const filename of Object.keys(frozenJsonHashes).sort()) {
    copyFileSync(
      resolve(frozenFixtureDirectory, filename),
      resolve(temporaryRoot, 'json', filename),
    )
  }

  buildLegacyJson(temporaryRoot)

  for (const filename of retiredJsonFilenames) {
    writeFileSync(resolve(temporaryRoot, 'json', filename), '{}')
  }

  return temporaryRoot
}

function replaceEntryPaths(
  entry: ContentEntry,
  source: string,
  legacySource = 'missing/legacy.md',
): ContentEntry {
  return { ...entry, source, legacySource }
}

function expectedDocumentSource(entry: ContentEntry): string {
  return `..\\${(entry.legacySource ?? entry.source).replaceAll('/', '\\')}`
}

function snapshotJsonDirectory(rootDirectory: string): Record<string, string> {
  return snapshotDirectory(resolve(rootDirectory, 'json'))
}

function snapshotDirectory(directory: string): Record<string, string> {
  return Object.fromEntries(
    readdirSync(directory)
      .sort()
      .map((filename) => [
        filename,
        readFileSync(resolve(directory, filename)).toString('base64'),
      ]),
  )
}

function temporaryJsonArtifacts(rootDirectory: string): string[] {
  return readdirSync(rootDirectory)
    .filter(
      (filename) =>
        filename.startsWith('.json-staging-') ||
        filename.startsWith('.json-backup-'),
    )
    .sort()
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

  test('centralizes the frozen legacy JSON manifest', () => {
    expect(existsSync(resolve(process.cwd(), 'scripts/json/frozen.ts'))).toBe(true)
    expect(frozenLegacyJsonManifest.map(({ stem }) => stem)).toEqual(
      frozenLegacyJsonStems,
    )
    expect(Object.isFrozen(frozenLegacyJsonManifest)).toBe(true)
    expect(frozenLegacyJsonManifest.every((entry) => Object.isFrozen(entry))).toBe(
      true,
    )
  })

  test('provides exactly the BASE frozen JSON fixtures', () => {
    expect(existsSync(frozenFixtureDirectory)).toBe(true)
    if (!existsSync(frozenFixtureDirectory)) return

    const fixtureFilenames = readdirSync(frozenFixtureDirectory).sort()
    const expectedFilenames = Object.keys(frozenJsonHashes).sort()
    expect(fixtureFilenames).toEqual(expectedFilenames)
    expect(fixtureFilenames).toHaveLength(10)

    for (const [filename, expectedHash] of Object.entries(frozenJsonHashes)) {
      const fixturePath = resolve(frozenFixtureDirectory, filename)
      const committedPath = resolve(process.cwd(), 'json', filename)
      expect(sha256(fixturePath), filename).toBe(expectedHash)
      expect(readFileSync(fixturePath), filename).toEqual(
        readFileSync(committedPath),
      )
    }
  })

  test('ignores active and frozen JSON beside an alternate Markdown corpus', () => {
    const sourceRoot = mkdtempSync(resolve(tmpdir(), 'legacy-json-source-'))
    let temporaryRoot: string | undefined

    try {
      copyMarkdownInputs(process.cwd(), sourceRoot)
      mkdirSync(resolve(sourceRoot, 'json'), { recursive: true })
      writeFileSync(
        resolve(sourceRoot, 'json/overview.json'),
        '{"poisoned":"active"}',
      )
      writeFileSync(
        resolve(sourceRoot, 'json/accessibilityActionsType.json'),
        '{"poisoned":"frozen"}',
      )

      temporaryRoot = createTemporaryJsonProject(sourceRoot)
      const jsonDirectory = resolve(temporaryRoot, 'json')
      expect(
        readFileSync(resolve(jsonDirectory, 'overview.json'), 'utf8'),
      ).not.toContain('poisoned')
      expect(
        sha256(resolve(jsonDirectory, 'accessibilityActionsType.json')),
      ).toBe(frozenJsonHashes['accessibilityActionsType.json'])
    } finally {
      if (temporaryRoot) {
        rmSync(temporaryRoot, { recursive: true, force: true })
      }
      rmSync(sourceRoot, { recursive: true, force: true })
    }
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

  test('preserves the legacy OCR options module hierarchy', () => {
    const document = JSON.parse(
      readFileSync(resolve(process.cwd(), 'json/ocrOptionsType.json'), 'utf8'),
    ) as {
      readonly modules: readonly {
        readonly textRaw?: string
        readonly desc?: string
        readonly modules?: readonly { readonly textRaw?: string }[]
      }[]
    }

    expect(document.modules).toHaveLength(1)
    const ocrOptions = document.modules[0]
    expect(ocrOptions.textRaw).toBe('OcrOptions')
    expect(ocrOptions.desc ?? '').toContain(
      'OcrOptions</code> 是 <a href="../media/ocr.md">ocr</a> 主模块及三个固定引擎入口共享的选项对象。',
    )
    expect(ocrOptions.modules?.map(({ textRaw }) => textRaw)).not.toContain(
      'OcrOptions',
    )
    expect(ocrOptions.modules?.[0]?.textRaw).toBe('[p?] region')
  })

  test('uses a stable recursive JSON structure signature', () => {
    const baseline = {
      modules: [{ name: 'old', params: [1, true, null] }],
    }
    const textOnlyChange = {
      modules: [{ name: 'new', params: [99, false, null] }],
    }

    expect(jsonStructureSha256(textOnlyChange)).toBe(
      jsonStructureSha256(baseline),
    )
    expect(
      jsonStructureSha256({
        modules: [{ renamed: 'old', params: [1, true, null] }],
      }),
    ).not.toBe(jsonStructureSha256(baseline))
    expect(
      jsonStructureSha256({
        modules: [{ name: 'old', params: [true, 1, null] }],
      }),
    ).not.toBe(jsonStructureSha256(baseline))
    expect(
      jsonStructureSha256({
        modules: [{ name: 'old', params: [1, true] }],
      }),
    ).not.toBe(jsonStructureSha256(baseline))
  })

  test('matches the fixed BASE corpus structure using freshly generated JSON', () => {
    expect(existsSync(legacyCorpusStructureFixturePath)).toBe(true)
    if (!existsSync(legacyCorpusStructureFixturePath)) return

    const fixture = JSON.parse(
      readFileSync(legacyCorpusStructureFixturePath, 'utf8'),
    ) as {
      readonly metadata: {
        readonly baseSha: string
        readonly algorithm: string
        readonly hash: string
        readonly sharedFileCount: number
        readonly baseOnlyFiles: readonly string[]
        readonly currentOnlyFiles: readonly string[]
      }
      readonly files: Readonly<Record<string, string>>
    }
    expect(Object.keys(fixture).sort()).toEqual(['files', 'metadata'])
    expect(fixture.metadata).toEqual({
      baseSha: legacyCorpusStructureBaseSha,
      algorithm: legacyCorpusStructureAlgorithm,
      hash: 'sha256',
      sharedFileCount: 112,
      baseOnlyFiles: [
        '404.json',
        'coverpage.json',
        'sidebar.json',
        'toc.json',
        'util.json',
      ],
      currentOnlyFiles: ['monkeyking.json'],
    })

    const fixtureFilenamesInOrder = Object.keys(fixture.files)
    const fixtureFilenames = [...fixtureFilenamesInOrder].sort()
    expect(fixtureFilenamesInOrder).toEqual(fixtureFilenames)
    expect(fixtureFilenames).toHaveLength(112)
    expect(
      fixtureFilenames.every((filename) =>
        /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*\.json$/.test(filename),
      ),
    ).toBe(true)
    expect(
      Object.values(fixture.files).every((digest) =>
        /^[0-9a-f]{64}$/.test(digest),
      ),
    ).toBe(true)

    const temporaryRoot = createTemporaryJsonProject()
    try {
      buildLegacyJson(temporaryRoot)
      const generatedJsonDirectory = resolve(temporaryRoot, 'json')
      const generatedFilenames = readdirSync(generatedJsonDirectory)
        .filter((filename) => filename.endsWith('.json'))
        .sort()

      expect(
        generatedFilenames.filter(
          (filename) => !fixtureFilenames.includes(filename),
        ),
      ).toEqual(expectedCurrentOnlyJsonFilenames)
      expect(
        fixtureFilenames.filter(
          (filename) => !generatedFilenames.includes(filename),
        ),
      ).toEqual([])

      for (const filename of fixtureFilenames) {
        const generated = JSON.parse(
          readFileSync(resolve(generatedJsonDirectory, filename), 'utf8'),
        ) as unknown
        expect(jsonStructureSha256(generated), filename).toBe(
          fixture.files[filename],
        )
      }
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('rejects active Markdown YAML blocks without adding a YAML parser', () => {
    expect(() =>
      parseLegacyMarkdown(
        '# Active\n<!-- YAML\nadded: v1\n-->\n',
        '..\\api\\active.md',
      ),
    ).toThrow(/YAML metadata blocks are not supported.*active\.md/i)
  })

  test('allows YAML marker text when marked does not lex it as an HTML block', () => {
    const markdown = [
      '# Active',
      '',
      '```html',
      '<!-- YAML',
      'added: v1',
      '-->',
      '```',
      '',
      'The literal `<!-- YAML` marker is documented here.',
    ].join('\n')

    expect(() =>
      parseLegacyMarkdown(markdown, '..\\api\\active.md'),
    ).not.toThrow()
  })

  test('rejects a YAML marker nested inside a marked HTML token', () => {
    expect(() =>
      parseLegacyMarkdown(
        '# Active\n\n<div>\n<!-- YAML\nadded: v1\n-->\n</div>\n',
        '..\\api\\active.md',
      ),
    ).toThrow(/YAML metadata blocks are not supported.*active\.md/i)
  })

  test('selects canonical Markdown when present and otherwise falls back to legacy input', () => {
    const temporaryRoot = mkdtempSync(resolve(tmpdir(), 'legacy-json-input-'))
    const entry = contentEntries.find(
      (candidate) => candidate.legacySource !== undefined,
    )!
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

  test('rejects relative and absolute Markdown paths that escape the project root', () => {
    const sandboxRoot = mkdtempSync(resolve(tmpdir(), 'legacy-json-path-'))
    const temporaryRoot = resolve(sandboxRoot, 'project')
    const outsidePath = resolve(sandboxRoot, 'outside.md')
    const entry = contentEntries[0]

    try {
      mkdirSync(temporaryRoot)
      writeFileSync(outsidePath, 'outside')

      expect(() =>
        resolveEntryMarkdownPath(
          temporaryRoot,
          replaceEntryPaths(entry, '../outside.md'),
        ),
      ).toThrow(/unsafe|outside|escape/i)
      expect(() =>
        resolveEntryMarkdownPath(
          temporaryRoot,
          replaceEntryPaths(entry, outsidePath),
        ),
      ).toThrow(/unsafe|absolute|outside|escape/i)
      expect(readFileSync(outsidePath, 'utf8')).toBe('outside')
    } finally {
      rmSync(sandboxRoot, { recursive: true, force: true })
    }
  })

  test('rejects symlink and non-regular Markdown inputs', () => {
    const temporaryRoot = mkdtempSync(resolve(tmpdir(), 'legacy-json-input-kind-'))
    const entry = contentEntries[0]
    const canonicalPath = resolve(temporaryRoot, entry.source)
    const outsidePath = resolve(temporaryRoot, 'outside.md')

    try {
      mkdirSync(resolve(canonicalPath, '..'), { recursive: true })
      writeFileSync(outsidePath, 'outside')
      symlinkSync(outsidePath, canonicalPath)

      expect(() => resolveEntryMarkdownPath(temporaryRoot, entry)).toThrow(
        /symbolic link|regular file/i,
      )
      expect(readFileSync(outsidePath, 'utf8')).toBe('outside')

      rmSync(canonicalPath)
      mkdirSync(canonicalPath)
      expect(() => resolveEntryMarkdownPath(temporaryRoot, entry)).toThrow(
        /regular file/i,
      )
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('rejects Markdown inputs reached through a symlinked parent directory', () => {
    const sandboxRoot = mkdtempSync(resolve(tmpdir(), 'legacy-json-parent-link-'))
    const temporaryRoot = resolve(sandboxRoot, 'project')
    const outsideDocs = resolve(sandboxRoot, 'outside-docs')
    const outsideMarkdown = resolve(outsideDocs, 'guide/overview.md')
    const entry = contentEntries[0]

    try {
      mkdirSync(temporaryRoot)
      mkdirSync(resolve(outsideMarkdown, '..'), { recursive: true })
      writeFileSync(outsideMarkdown, 'outside')
      symlinkSync(outsideDocs, resolve(temporaryRoot, 'docs'))

      expect(() => resolveEntryMarkdownPath(temporaryRoot, entry)).toThrow(
        /symbolic link|outside|escape/i,
      )
      expect(readFileSync(outsideMarkdown, 'utf8')).toBe('outside')
    } finally {
      rmSync(sandboxRoot, { recursive: true, force: true })
    }
  })

  test('rejects symlink and non-regular files already present in json output', () => {
    const temporaryRoot = createTemporaryJsonProject()
    const outputPath = resolve(temporaryRoot, 'json/overview.json')
    const outsidePath = resolve(temporaryRoot, 'outside.json')

    try {
      rmSync(outputPath)
      writeFileSync(outsidePath, 'outside')
      symlinkSync(outsidePath, outputPath)

      expect(() => buildLegacyJson(temporaryRoot)).toThrow(
        /symbolic link|regular file/i,
      )
      expect(readFileSync(outsidePath, 'utf8')).toBe('outside')

      rmSync(outputPath)
      mkdirSync(outputPath)
      expect(() => buildLegacyJson(temporaryRoot)).toThrow(/regular file/i)
      expect(readFileSync(outsidePath, 'utf8')).toBe('outside')
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('matches every active JSON document and preserves historical source labels', () => {
    const outputs = createLegacyJsonOutputs(process.cwd())
    const outputsByFilename = new Map(
      outputs.map(({ filename, text }) => [filename, text]),
    )

    expect(outputs).toHaveLength(
      contentEntries.reduce((count, entry) => count + entry.jsonNames.length, 1),
    )

    for (const entry of contentEntries) {
      for (const jsonName of entry.jsonNames) {
        const filename = `${jsonName}.json`
        const committed = readFileSync(
          resolve(process.cwd(), 'json', filename),
          'utf8',
        )
        expect(committed, filename).toBe(outputsByFilename.get(filename))
        expect(JSON.parse(committed).source, filename).toBe(
          expectedDocumentSource(entry),
        )
      }
    }

    expect(outputsByFilename.get('all.json')).toBe(
      readFileSync(resolve(process.cwd(), 'json/all.json'), 'utf8'),
    )
    expect(readFileSync(resolve(process.cwd(), 'json/monkeyking.json'))).toEqual(
      readFileSync(resolve(process.cwd(), 'json/autojs.json')),
    )
  })

  test('keeps the committed root JSON inventory exact', () => {
    expect(readdirSync(resolve(process.cwd(), 'json')).sort()).toEqual(
      expectedCommittedJsonFilenames,
    )
    expect(expectedCommittedJsonFilenames).toHaveLength(
      contentEntries.reduce((count, entry) => count + entry.jsonNames.length, 1) +
        frozenLegacyJsonStems.length,
    )
  })

  test('checks generated JSON without Git or writing output', () => {
    const temporaryRoot = createTemporaryJsonProject()

    try {
      buildLegacyJson(temporaryRoot)
      const before = snapshotJsonDirectory(temporaryRoot)

      expect(() => checkLegacyJson(temporaryRoot)).not.toThrow()
      expect(snapshotJsonDirectory(temporaryRoot)).toEqual(before)
      expect(temporaryJsonArtifacts(temporaryRoot)).toEqual([])
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('rejects JSON drift without rewriting the changed file', () => {
    const temporaryRoot = createTemporaryJsonProject()
    const jsonPath = resolve(temporaryRoot, 'json/overview.json')

    try {
      buildLegacyJson(temporaryRoot)
      writeFileSync(jsonPath, `${readFileSync(jsonPath, 'utf8')}\n`)
      const before = snapshotJsonDirectory(temporaryRoot)

      expect(() => checkLegacyJson(temporaryRoot)).toThrow(/JSON drift.*overview\.json/i)
      expect(snapshotJsonDirectory(temporaryRoot)).toEqual(before)
      expect(temporaryJsonArtifacts(temporaryRoot)).toEqual([])
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('rejects missing, unexpected, and altered frozen JSON', () => {
    const temporaryRoot = createTemporaryJsonProject()
    const jsonDirectory = resolve(temporaryRoot, 'json')
    const generatedPath = resolve(jsonDirectory, 'overview.json')
    const frozenPath = resolve(jsonDirectory, Object.keys(frozenJsonHashes)[0])

    try {
      buildLegacyJson(temporaryRoot)
      rmSync(generatedPath)
      expect(() => checkLegacyJson(temporaryRoot)).toThrow(/inventory|missing/i)

      writeFileSync(generatedPath, createLegacyJsonOutputs(temporaryRoot).find(
        ({ filename }) => filename === 'overview.json',
      )?.text ?? '')
      writeFileSync(resolve(jsonDirectory, 'rogue.json'), '{}')
      expect(() => checkLegacyJson(temporaryRoot)).toThrow(/inventory|unexpected/i)

      rmSync(resolve(jsonDirectory, 'rogue.json'))
      writeFileSync(frozenPath, '{}')
      expect(() => checkLegacyJson(temporaryRoot)).toThrow(/Frozen legacy JSON hash mismatch/i)
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('rejects unexpected JSON without deleting or rewriting it', () => {
    const temporaryRoot = createTemporaryJsonProject()
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

  test('validates the catalog before touching existing JSON output', () => {
    const temporaryRoot = createTemporaryJsonProject()
    const before = snapshotJsonDirectory(temporaryRoot)

    try {
      expect(() =>
        buildLegacyJson(temporaryRoot, {
          catalogValidator: () => ['injected invalid catalog'],
        }),
      ).toThrow(/injected invalid catalog/i)
      expect(snapshotJsonDirectory(temporaryRoot)).toEqual(before)
      expect(temporaryJsonArtifacts(temporaryRoot)).toEqual([])
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('leaves existing JSON byte-identical when staging fails midway', () => {
    const temporaryRoot = createTemporaryJsonProject()
    const before = snapshotJsonDirectory(temporaryRoot)
    let stagedFiles = 0

    try {
      expect(() =>
        buildLegacyJson(temporaryRoot, {
          afterStageFile: () => {
            stagedFiles++
            if (stagedFiles === 4) throw new Error('injected staging failure')
          },
        }),
      ).toThrow(/injected staging failure/i)
      expect(stagedFiles).toBe(4)
      expect(snapshotJsonDirectory(temporaryRoot)).toEqual(before)
      expect(temporaryJsonArtifacts(temporaryRoot)).toEqual([])
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('validates the complete staging directory before committing it', () => {
    const temporaryRoot = createTemporaryJsonProject()
    const before = snapshotJsonDirectory(temporaryRoot)

    try {
      expect(() =>
        buildLegacyJson(temporaryRoot, {
          afterStageFile: (filename, stagingDirectory) => {
            if (filename === 'overview.json') {
              writeFileSync(resolve(stagingDirectory, filename), '{}')
            }
          },
        }),
      ).toThrow(/schema validation failed.*overview\.json/i)
      expect(snapshotJsonDirectory(temporaryRoot)).toEqual(before)
      expect(temporaryJsonArtifacts(temporaryRoot)).toEqual([])
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('restores existing JSON when the staging-directory commit rename fails', () => {
    const temporaryRoot = createTemporaryJsonProject()
    const before = snapshotJsonDirectory(temporaryRoot)
    let renameCalls = 0

    try {
      expect(() =>
        buildLegacyJson(temporaryRoot, {
          renameDirectory: (source, destination) => {
            renameCalls++
            if (renameCalls === 2) {
              throw new Error('injected commit rename failure')
            }
            renameSync(source, destination)
          },
        }),
      ).toThrow(/injected commit rename failure/i)
      expect(renameCalls).toBe(3)
      expect(snapshotJsonDirectory(temporaryRoot)).toEqual(before)
      expect(temporaryJsonArtifacts(temporaryRoot)).toEqual([])
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('retains the recoverable backup when commit and restore renames both fail', () => {
    const temporaryRoot = createTemporaryJsonProject()
    const jsonDirectory = resolve(temporaryRoot, 'json')
    const before = snapshotJsonDirectory(temporaryRoot)
    let renameCalls = 0
    let caught: unknown

    try {
      try {
        buildLegacyJson(temporaryRoot, {
          renameDirectory: (source, destination) => {
            renameCalls++
            if (renameCalls === 1) {
              renameSync(source, destination)
              return
            }
            if (renameCalls === 2) {
              mkdirSync(destination)
              throw new Error('injected commit rename failure')
            }
            throw new Error('injected restore rename failure')
          },
        })
      } catch (error) {
        caught = error
      }

      expect(caught).toBeInstanceOf(AggregateError)
      expect(renameCalls).toBe(3)
      expect(readdirSync(jsonDirectory)).toEqual([])

      const artifacts = temporaryJsonArtifacts(temporaryRoot)
      expect(artifacts).toHaveLength(1)
      expect(artifacts[0]).toMatch(/^\.json-backup-/)
      const backupDirectory = resolve(temporaryRoot, artifacts[0])
      expect(snapshotDirectory(backupDirectory)).toEqual(before)
      expect((caught as Error).message).toContain(backupDirectory)
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  test('builds the catalog-derived schema-ready inventory while preserving frozen bytes', () => {
    const temporaryRoot = createTemporaryJsonProject()
    const jsonDirectory = resolve(temporaryRoot, 'json')
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

      expect(firstInventory).toHaveLength(expectedCommittedJsonFilenames.length)
      expect(firstInventory).toEqual(expectedCommittedJsonFilenames)
      expect(
        retiredJsonFilenames.every(
          (filename) => !existsSync(resolve(jsonDirectory, filename)),
        ),
      ).toBe(true)
      expect(firstContents.get('monkeyking.json')).toBe(
        firstContents.get('autojs.json'),
      )

      for (const entry of contentEntries) {
        for (const jsonName of entry.jsonNames) {
          expect(
            JSON.parse(firstContents.get(`${jsonName}.json`) ?? '{}').source,
          ).toBe(expectedDocumentSource(entry))
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

  test('validates every generated document with the Draft 2020-12 legacy schema', () => {
    const schema = JSON.parse(
      readFileSync(
        resolve(process.cwd(), 'scripts/json/legacy-document.schema.json'),
        'utf8',
      ),
    ) as object
    const validate = new Ajv2020({ allErrors: true }).compile(schema)
    const documents = readdirSync(resolve(process.cwd(), 'json'))
      .sort()
      .map((filename) => ({
        filename,
        text: readFileSync(resolve(process.cwd(), 'json', filename), 'utf8'),
      }))

    expect(documents).toHaveLength(expectedCommittedJsonFilenames.length)
    expect(documents.map(({ filename }) => filename)).toEqual(
      expectedCommittedJsonFilenames,
    )
    for (const { filename, text } of documents) {
      expect(validate(JSON.parse(text)), `${filename}: ${JSON.stringify(validate.errors)}`).toBe(
        true,
      )
    }

    expect(validate({})).toBe(false)
    expect(
      validate({ source: '..\\docs\\api\\utilities\\util.md' }),
    ).toBe(true)
    expect(validate({ source: '../docs/api/utilities/util.md' })).toBe(true)
    expect(validate({ source: '..\\docs\\..\\escape.md' })).toBe(false)
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

  test('enforces collection-specific legacy section semantics', () => {
    const schema = JSON.parse(
      readFileSync(
        resolve(process.cwd(), 'scripts/json/legacy-document.schema.json'),
        'utf8',
      ),
    ) as { $id?: string }
    const validate = new Ajv2020({ allErrors: true }).compile(schema)
    const section = { textRaw: 'Section', name: 'section' }
    const invalidDocuments = [
      { source: '..\\api\\bad.md', modules: [{ ...section, type: 'method' }] },
      { source: '..\\api\\bad.md', classes: [{ ...section, type: 'module' }] },
      { source: '..\\api\\bad.md', methods: [{ ...section, type: 'method' }] },
      {
        source: '..\\api\\bad.md',
        classMethods: [{ ...section, type: 'classMethod' }],
      },
      { source: '..\\api\\bad.md', ctors: [{ ...section, type: 'ctor' }] },
      { source: '..\\api\\bad.md', events: [{ ...section, type: 'event' }] },
      { source: '..\\api\\bad.md', miscs: [{ ...section, type: 'module' }] },
    ]

    for (const document of invalidDocuments) {
      expect(validate(document), JSON.stringify(document)).toBe(false)
    }
    expect(
      validate({
        source: '..\\api\\property.md',
        properties: [{ ...section, type: 'DynamicRuntimeType' }],
      }),
    ).toBe(true)
    expect(schema.$id).toBe(
      'https://docs.monkeyking.com/schemas/legacy-document.schema.json',
    )
  })
})
