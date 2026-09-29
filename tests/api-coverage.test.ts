import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'

const generatorModulePath = '../scripts/api/' + 'coverage-generator'
const checkerModulePath = '../scripts/api/' + 'checker'
const coverageCliModulePath = '../scripts/api/' + 'coverage'
const fixtureDocs = resolve(process.cwd(), 'tests/fixtures/api/docs')

async function loadModule(path: string): Promise<Record<string, any> | null> {
  try {
    return (await import(path)) as Record<string, any>
  } catch {
    return null
  }
}

function fixtureManifest() {
  return {
    schemaVersion: 1,
    source: {
      repository: 'fixture/MonkeyKing',
      ref: 'fixture-ref',
      commit: '1111111111111111111111111111111111111111',
    },
    modules: [
      {
        id: 'alpha',
        name: 'alpha',
        className: 'Alpha',
        aliases: ['$alpha'],
        source: { path: 'Alpha.kt', line: 1 },
      },
    ],
    symbols: [
      {
        id: 'module:alpha',
        owner: 'alpha',
        name: 'alpha',
        kind: 'module',
        public: true,
        source: { path: 'Alpha.kt', line: 1 },
        annotations: [],
        signatures: [],
        overloads: [],
      },
      {
        id: 'alpha.run',
        owner: 'alpha',
        name: 'run',
        kind: 'function',
        public: true,
        source: { path: 'Alpha.kt', line: 2 },
        annotations: [],
        signatures: [],
        overloads: [],
      },
      {
        id: 'alpha.missing',
        owner: 'alpha',
        name: 'missing',
        kind: 'function',
        public: true,
        source: { path: 'Alpha.kt', line: 3 },
        annotations: [],
        signatures: [],
        overloads: [],
      },
      {
        id: 'alias:$alpha',
        owner: 'global',
        name: '$alpha',
        kind: 'alias',
        public: true,
        canonicalId: 'module:alpha',
        source: { path: 'Alpha.kt', line: 1 },
        annotations: [],
        signatures: [],
        overloads: [],
      },
    ],
    annotations: [],
    declarationHints: [],
    assets: [],
    overrides: [],
  }
}

function fixtureProjectRoot(): string {
  const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-api-coverage-'))
  cpSync(fixtureDocs, resolve(root, 'docs'), { recursive: true })
  return root
}

describe('API coverage generator', () => {
  test('maps only addressable member sections and keeps every rule exact', async () => {
    const generator = await loadModule(generatorModulePath)
    const checker = await loadModule(checkerModulePath)
    expect(generator, 'scripts/api/coverage-generator.ts must exist').not.toBeNull()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!generator || !checker) return

    const projectRoot = fixtureProjectRoot()
    const artifacts = await generator.generateApiCoverageArtifacts({
      manifest: fixtureManifest(),
      projectRoot,
      ownerPages: { alpha: 'docs/alpha.md', global: 'docs/global.md' },
    })
    const coverage = artifacts.coverage
    const rules = new Map(
      coverage.rules.map((rule: { patterns: string[] }) => [rule.patterns[0], rule]),
    )

    expect(coverage).toMatchObject({
      schemaVersion: 3,
    })
    expect(coverage).not.toHaveProperty('productVersion')
    expect(coverage).not.toHaveProperty('sourceRef')
    expect(coverage.rules).toHaveLength(3)
    expect(
      coverage.rules.every(
        (rule: { patterns: string[] }) => rule.patterns.length === 1,
      ),
    ).toBe(true)
    expect(rules.get('alpha.run')).toMatchObject({
      status: 'documented',
      target: 'docs/alpha.md#run',
    })
    expect(rules.get('module:alpha')).toMatchObject({
      status: 'documented',
      target: 'docs/alpha.md#alpha-fixture',
    })
    expect(rules.has('alpha.missing')).toBe(false)
    expect(rules.get('alias:$alpha')).toMatchObject({ status: 'alias' })
    expect(artifacts.gaps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ symbolId: 'alpha.missing' }),
      ]),
    )
    expect(artifacts.gaps).toHaveLength(1)
  })

  test('prefers the stable encoded api-symbol anchor over heading heuristics', async () => {
    const generator = await loadModule(generatorModulePath)
    expect(generator, 'scripts/api/coverage-generator.ts must exist').not.toBeNull()
    if (!generator) return

    const projectRoot = fixtureProjectRoot()
    const manifest = fixtureManifest()
    manifest.symbols = manifest.symbols.filter(
      ({ id }: { id: string }) => id === 'module:alpha',
    ) as typeof manifest.symbols
    writeFileSync(
      resolve(projectRoot, 'docs/alpha.md'),
      [
        '<a id="api-symbol-bW9kdWxlOmFscGhh"></a>',
        '',
        '# First title',
        '',
        '# Conflicting title',
      ].join('\n'),
    )

    expect(generator.apiSymbolAnchorId('module:alpha')).toBe(
      'api-symbol-bW9kdWxlOmFscGhh',
    )
    const artifacts = await generator.generateApiCoverageArtifacts({
      manifest,
      projectRoot,
      ownerPages: { alpha: 'docs/alpha.md' },
    })

    expect(artifacts.gaps).toEqual([])
    expect(artifacts.coverage.rules).toEqual([
      expect.objectContaining({
        patterns: ['module:alpha'],
        target: 'docs/alpha.md#api-symbol-bW9kdWxlOmFscGhh',
      }),
    ])
  })

  test('routes global thread helpers to the thread reference page', async () => {
    const generator = await loadModule(generatorModulePath)
    expect(generator, 'scripts/api/coverage-generator.ts must exist').not.toBeNull()
    if (!generator) return

    const projectRoot = fixtureProjectRoot()
    const threadPage = resolve(projectRoot, 'docs/api/system/threads.md')
    mkdirSync(dirname(threadPage), { recursive: true })
    writeFileSync(threadPage, ['# Threads', '', '## sync(func)'].join('\n'))

    const manifest = fixtureManifest()
    manifest.modules = []
    manifest.symbols = [
      {
        id: 'global:sync',
        owner: 'global',
        name: 'sync',
        kind: 'function',
        public: true,
        source: {
          path: 'app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/threads/Threads.kt',
          line: 1,
        },
        annotations: [],
        signatures: [],
        overloads: [],
      },
    ] as typeof manifest.symbols

    const artifacts = await generator.generateApiCoverageArtifacts({
      manifest,
      projectRoot,
    })
    expect(artifacts.gaps).toEqual([])
    expect(artifacts.coverage.rules).toEqual([
      expect.objectContaining({
        patterns: ['global:sync'],
        target: 'docs/api/system/threads.md#sync-func',
      }),
    ])
  })

  test('keeps an exact nested-module section ahead of the page H1', async () => {
    const generator = await loadModule(generatorModulePath)
    expect(generator, 'scripts/api/coverage-generator.ts must exist').not.toBeNull()
    if (!generator) return

    const projectRoot = fixtureProjectRoot()
    const manifest = fixtureManifest()
    manifest.symbols = [
      {
        ...manifest.symbols.find(
          ({ id }: { id: string }) => id === 'module:alpha',
        )!,
        id: 'module:alpha.nested',
        owner: 'alpha.nested',
        name: 'nested',
      },
    ] as typeof manifest.symbols
    writeFileSync(
      resolve(projectRoot, 'docs/alpha.md'),
      ['# Alpha API', '', '## nested'].join('\n'),
    )

    const artifacts = await generator.generateApiCoverageArtifacts({
      manifest,
      projectRoot,
      ownerPages: { alpha: 'docs/alpha.md' },
    })

    expect(artifacts.gaps).toEqual([])
    expect(artifacts.coverage.rules).toEqual([
      expect.objectContaining({
        patterns: ['module:alpha.nested'],
        target: 'docs/alpha.md#nested',
      }),
    ])
  })

  test('maps MIME constants only when their generated compatibility anchor exists', async () => {
    const generator = await loadModule(generatorModulePath)
    expect(generator, 'scripts/api/coverage-generator.ts must exist').not.toBeNull()
    if (!generator) return

    const projectRoot = fixtureProjectRoot()
    const manifest = fixtureManifest()
    manifest.modules = []
    manifest.symbols = [
      {
        id: 'mime.APPLICATION_JSON',
        owner: 'mime',
        name: 'APPLICATION_JSON',
        kind: 'property',
        public: true,
        source: { path: 'Mime.kt', line: 1 },
        annotations: [],
        signatures: [],
        overloads: [],
      },
    ] as typeof manifest.symbols
    writeFileSync(
      resolve(projectRoot, 'docs/mime.md'),
      [
        '# MIME',
        '',
        '<a id="mime-constant-application-json"></a>',
      ].join('\n'),
    )

    const mapped = await generator.generateApiCoverageArtifacts({
      manifest,
      projectRoot,
      ownerPages: { mime: 'docs/mime.md' },
    })
    expect(mapped.gaps).toEqual([])
    expect(mapped.coverage.rules).toEqual([
      expect.objectContaining({
        patterns: ['mime.APPLICATION_JSON'],
        target: 'docs/mime.md#mime-constant-application-json',
      }),
    ])

    writeFileSync(resolve(projectRoot, 'docs/mime.md'), '# MIME\n')
    const missing = await generator.generateApiCoverageArtifacts({
      manifest,
      projectRoot,
      ownerPages: { mime: 'docs/mime.md' },
    })
    expect(missing.coverage.rules).toEqual([])
    expect(missing.gaps).toEqual([
      expect.objectContaining({ symbolId: 'mime.APPLICATION_JSON' }),
    ])
  })

  test('keeps module targets unique when owners share one canonical page', async () => {
    const generator = await loadModule(generatorModulePath)
    expect(generator, 'scripts/api/coverage-generator.ts must exist').not.toBeNull()
    if (!generator) return

    const projectRoot = fixtureProjectRoot()
    const manifest = fixtureManifest()
    manifest.symbols = [
      manifest.symbols.find(({ id }: { id: string }) => id === 'module:alpha')!,
      {
        ...manifest.symbols.find(
          ({ id }: { id: string }) => id === 'module:alpha',
        )!,
        id: 'module:beta',
        owner: 'beta',
        name: 'beta',
      },
    ] as typeof manifest.symbols
    writeFileSync(resolve(projectRoot, 'docs/alpha.md'), '# Shared API\n')

    const artifacts = await generator.generateApiCoverageArtifacts({
      manifest,
      projectRoot,
      ownerPages: {
        alpha: 'docs/alpha.md',
        beta: 'docs/alpha.md',
      },
    })

    expect(artifacts.coverage.rules).toEqual([])
    expect(artifacts.gaps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ symbolId: 'module:alpha' }),
        expect.objectContaining({ symbolId: 'module:beta' }),
      ]),
    )
    expect(artifacts.gaps).toHaveLength(2)
  })

  test('produces valid coverage when every public symbol has a real section', async () => {
    const generator = await loadModule(generatorModulePath)
    const checker = await loadModule(checkerModulePath)
    expect(generator, 'scripts/api/coverage-generator.ts must exist').not.toBeNull()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!generator || !checker) return

    const projectRoot = fixtureProjectRoot()
    const manifest = fixtureManifest()
    manifest.symbols = manifest.symbols.filter(
      ({ id }: { id: string }) => id === 'alpha.run',
    ) as typeof manifest.symbols
    const artifacts = await generator.generateApiCoverageArtifacts({
      manifest,
      projectRoot,
      ownerPages: { alpha: 'docs/alpha.md' },
    })

    expect(artifacts.gaps).toEqual([])

    expect(
      await checker.validateApiSurface({
        manifest,
        coverage: artifacts.coverage,
        projectRoot,
      }).then((report: { errors: unknown[] }) => report.errors),
    ).toEqual([])
  })

  test('writes deterministic gaps and refuses to publish partial coverage', async () => {
    const coverageCli = await loadModule(coverageCliModulePath)
    expect(coverageCli, 'scripts/api/coverage.ts must exist').not.toBeNull()
    if (!coverageCli) return

    const projectRoot = fixtureProjectRoot()
    writeFileSync(
      resolve(projectRoot, 'surface.json'),
      JSON.stringify(fixtureManifest()),
    )
    const arguments_ = {
      root: projectRoot,
      manifest: 'surface.json',
      output: 'coverage.json',
      gaps: 'gaps.json',
      check: false,
    }
    writeFileSync(resolve(projectRoot, 'coverage.json'), '{"stale":true}\n')

    await expect(coverageCli.runCoverage(arguments_)).rejects.toThrow(
      /coverage has \d+ gaps/i,
    )
    const first = readFileSync(resolve(projectRoot, 'gaps.json'), 'utf8')
    expect(existsSync(resolve(projectRoot, 'coverage.json'))).toBe(false)
    await expect(coverageCli.runCoverage(arguments_)).rejects.toThrow(
      /coverage has \d+ gaps/i,
    )
    expect(readFileSync(resolve(projectRoot, 'gaps.json'), 'utf8')).toBe(first)
  })

  test('uses rendered duplicate ids and ignores pseudo headings', async () => {
    const generator = await loadModule(generatorModulePath)
    expect(generator, 'scripts/api/coverage-generator.ts must exist').not.toBeNull()
    if (!generator) return

    const projectRoot = fixtureProjectRoot()
    const manifest = fixtureManifest()
    manifest.symbols = manifest.symbols.filter(
      ({ id }: { id: string }) => id === 'alpha.run',
    ) as typeof manifest.symbols
    writeFileSync(
      resolve(projectRoot, 'docs/alpha.md'),
      [
        '# Alpha',
        '',
        '## First {#run}',
        '',
        '```md',
        '## Run',
        '```',
        '',
        '<!-- ## Run -->',
        '',
        '## Run',
      ].join('\n'),
    )

    const artifacts = await generator.generateApiCoverageArtifacts({
      manifest,
      projectRoot,
      ownerPages: { alpha: 'docs/alpha.md' },
    })

    expect(artifacts.gaps).toEqual([])
    expect(artifacts.coverage.rules).toEqual([
      expect.objectContaining({
        patterns: ['alpha.run'],
        target: 'docs/alpha.md#run-1',
      }),
    ])
  })

  test('does not treat fenced or commented member headings as documentation', async () => {
    const generator = await loadModule(generatorModulePath)
    expect(generator, 'scripts/api/coverage-generator.ts must exist').not.toBeNull()
    if (!generator) return

    const projectRoot = fixtureProjectRoot()
    const manifest = fixtureManifest()
    manifest.symbols = manifest.symbols.filter(
      ({ id }: { id: string }) => id === 'alpha.run',
    ) as typeof manifest.symbols
    writeFileSync(
      resolve(projectRoot, 'docs/alpha.md'),
      [
        '# Alpha',
        '',
        '```md',
        '## Run',
        '<a id="api-symbol-YWxwaGEucnVu"></a>',
        '```',
        '',
        '<!-- ## Run -->',
        '<!-- <a id="api-symbol-YWxwaGEucnVu"></a> -->',
      ].join('\n'),
    )

    const artifacts = await generator.generateApiCoverageArtifacts({
      manifest,
      projectRoot,
      ownerPages: { alpha: 'docs/alpha.md' },
    })

    expect(artifacts.coverage.rules).toEqual([])
    expect(artifacts.gaps).toEqual([
      expect.objectContaining({ symbolId: 'alpha.run' }),
    ])
  })
})
