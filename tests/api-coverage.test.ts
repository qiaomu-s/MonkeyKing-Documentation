import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

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

    expect(coverage.sourceRef).toBe(
      '1111111111111111111111111111111111111111',
    )
    expect(coverage.rules).toHaveLength(1)
    expect(
      coverage.rules.every(
        (rule: { patterns: string[] }) => rule.patterns.length === 1,
      ),
    ).toBe(true)
    expect(rules.get('alpha.run')).toMatchObject({
      status: 'documented',
      target: 'docs/alpha.md#run',
    })
    expect(rules.has('module:alpha')).toBe(false)
    expect(rules.has('alpha.missing')).toBe(false)
    expect(rules.has('alias:$alpha')).toBe(false)
    expect(artifacts.gaps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ symbolId: 'module:alpha' }),
        expect.objectContaining({ symbolId: 'alpha.missing' }),
        expect.objectContaining({ symbolId: 'alias:$alpha' }),
      ]),
    )
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
      ['# Alpha', '', '```md', '## Run', '```', '', '<!-- ## Run -->'].join(
        '\n',
      ),
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
