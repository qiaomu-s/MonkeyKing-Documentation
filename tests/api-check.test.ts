import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

const checkerModulePath = '../scripts/api/' + 'checker'
const fixtureDocs = resolve(process.cwd(), 'tests/fixtures/api/docs')

async function loadChecker(): Promise<Record<string, any> | null> {
  try {
    return (await import(checkerModulePath)) as Record<string, any>
  } catch {
    return null
  }
}

function manifest() {
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
      {
        id: 'dynamic',
        name: 'dynamic',
        className: 'Dynamic',
        aliases: [],
        source: { path: 'Dynamic.kt', line: 1 },
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
        id: 'module:dynamic',
        owner: 'dynamic',
        name: 'dynamic',
        kind: 'module',
        public: true,
        source: { path: 'Dynamic.kt', line: 1 },
        annotations: [],
        signatures: [],
        overloads: [],
      },
      {
        id: 'global:helper',
        owner: 'global',
        name: 'helper',
        kind: 'global',
        public: true,
        source: { path: 'Global.kt', line: 1 },
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

function coverage() {
  return {
    schemaVersion: 1,
    sourceRef: '1111111111111111111111111111111111111111',
    rules: [
      {
        id: 'alpha-module',
        patterns: ['module:alpha'],
        status: 'documented',
        target: 'docs/alpha.md#alpha',
      },
      {
        id: 'alpha-run',
        patterns: ['alpha.run'],
        status: 'documented',
        target: 'docs/alpha.md#run',
      },
      {
        id: 'dynamic',
        patterns: ['module:dynamic'],
        status: 'documented',
        target: 'docs/dynamic.md#dynamic-api',
      },
      {
        id: 'global',
        patterns: ['global:helper'],
        status: 'documented',
        target: 'docs/global.md#global-api',
      },
      {
        id: 'aliases',
        patterns: ['alias:$alpha'],
        status: 'alias',
      },
    ],
  }
}

function fixtureProjectRoot(): string {
  const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-api-check-'))
  cpSync(fixtureDocs, resolve(root, 'docs'), { recursive: true })
  return root
}

describe('API surface checker', () => {
  test('indexes exact symbol patterns while preserving cached wildcard matching', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const symbols = Array.from({ length: 20_000 }, (_, index) => ({
      id: `bulk.symbol-${index}`,
      public: true,
    }))
    const matcher = checker.createCoverageSymbolMatcher(symbols)
    const started = performance.now()
    let exactMatches = 0
    for (const symbol of symbols) {
      exactMatches += matcher.match(symbol.id).length
    }
    const exactDuration = performance.now() - started

    expect(exactMatches).toBe(symbols.length)
    expect(exactDuration).toBeLessThan(1_500)
    expect(matcher.match('bulk.symbol-1*')).toHaveLength(11_111)
    expect(matcher.match('bulk.symbol-1*')).toHaveLength(11_111)
  })

  test('accepts a complete unique mapping with existing pages and anchors', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const report = await checker.validateApiSurface({
      manifest: manifest(),
      coverage: coverage(),
      projectRoot: fixtureProjectRoot(),
    })

    expect(report.errors).toEqual([])
    expect(report.publicSymbolCount).toBe(5)
    expect(report.mappedSymbolCount).toBe(5)
  })

  test('reports unknown, duplicate and unmapped coverage errors', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const invalidCoverage = coverage()
    invalidCoverage.rules = [
      invalidCoverage.rules[0],
      invalidCoverage.rules[1],
      {
        id: 'duplicate-alpha',
        patterns: ['alpha.run'],
        status: 'documented',
        target: 'docs/alpha.md#alpha',
      },
      {
        id: 'unknown',
        patterns: ['missing.*'],
        status: 'excluded',
        reason: 'The symbol does not exist in the fixture.',
      },
    ] as typeof invalidCoverage.rules

    const report = await checker.validateApiSurface({
      manifest: manifest(),
      coverage: invalidCoverage,
      projectRoot: fixtureProjectRoot(),
    })
    const codes = report.errors.map(({ code }: { code: string }) => code)

    expect(codes).toContain('invalid-pattern')
    expect(codes).toContain('duplicate-mapping')
    expect(codes).toContain('unmapped-symbol')
  })

  test('requires mapped pages and anchors to exist', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const projectRoot = fixtureProjectRoot()
    writeFileSync(
      resolve(projectRoot, 'docs/alpha.md'),
      readFileSync(resolve(projectRoot, 'docs/alpha.md'), 'utf8').replace(
        '<a id="alpha"></a>',
        '',
      ),
    )

    const report = await checker.validateApiSurface({
      manifest: manifest(),
      coverage: coverage(),
      projectRoot,
    })

    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'missing-anchor' }),
      ]),
    )
  })

  test('rejects two non-alias symbols that hide behind one documented target', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const duplicateTargetCoverage = coverage()
    duplicateTargetCoverage.rules[1] = {
      ...duplicateTargetCoverage.rules[1],
      target: 'docs/alpha.md#alpha',
    }

    const report = await checker.validateApiSurface({
      manifest: manifest(),
      coverage: duplicateTargetCoverage,
      projectRoot: fixtureProjectRoot(),
    })

    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'duplicate-target',
          symbolId: 'alpha.run',
        }),
      ]),
    )
  })

  test('requires excluded entries to explain why they are not documented', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const invalidCoverage = coverage()
    invalidCoverage.rules[2] = {
      id: 'dynamic',
      patterns: ['module:dynamic'],
      status: 'excluded',
    } as (typeof invalidCoverage.rules)[number]

    const report = await checker.validateApiSurface({
      manifest: manifest(),
      coverage: invalidCoverage,
      projectRoot: fixtureProjectRoot(),
    })

    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'coverage-schema' }),
      ]),
    )
  })

  test.each([
    { manifest: null, coverage: coverage(), expected: 'manifest-schema' },
    { manifest: manifest(), coverage: null, expected: 'coverage-schema' },
    {
      manifest: { ...manifest(), symbols: [null] },
      coverage: coverage(),
      expected: 'manifest-schema',
    },
    {
      manifest: manifest(),
      coverage: { ...coverage(), rules: [null] },
      expected: 'coverage-schema',
    },
  ])(
    'returns $expected without dereferencing an invalid payload',
    async ({ manifest: invalidManifest, coverage: invalidCoverage, expected }) => {
      const checker = await loadChecker()
      expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
      if (!checker) return

      await expect(
        checker.validateApiSurface({
          manifest: invalidManifest,
          coverage: invalidCoverage,
          projectRoot: fixtureProjectRoot(),
        }),
      ).resolves.toEqual(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ code: expected }),
          ]),
          mappedSymbolCount: 0,
        }),
      )
    },
  )

  test('rejects duplicate ids across manifest and coverage namespaces', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const duplicateManifest = manifest()
    duplicateManifest.modules.push({ ...duplicateManifest.modules[0] })
    duplicateManifest.assets = [
      { id: 'fixture-asset', path: 'assets/a.js' },
      { id: 'fixture-asset', path: 'assets/b.js' },
    ] as any
    duplicateManifest.overrides = [
      {
        id: 'fixture-override',
        className: 'First',
        reason: 'Fixture evidence.',
        source: { path: 'First.kt', line: 1 },
      },
      {
        id: 'fixture-override',
        className: 'Second',
        reason: 'Fixture evidence.',
        source: { path: 'Second.kt', line: 1 },
      },
    ] as any
    const duplicateCoverage = coverage()
    duplicateCoverage.rules.push({ ...duplicateCoverage.rules[0] })

    const report = await checker.validateApiSurface({
      manifest: duplicateManifest,
      coverage: duplicateCoverage,
      projectRoot: fixtureProjectRoot(),
    })
    const codes = report.errors.map(({ code }: { code: string }) => code)

    expect(codes).toEqual(
      expect.arrayContaining([
        'duplicate-module',
        'duplicate-asset',
        'duplicate-override',
        'duplicate-rule',
      ]),
    )
  })

  test('requires every pattern to hit and every rule to identify one symbol', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const invalidCoverage = coverage()
    invalidCoverage.rules[0] = {
      ...invalidCoverage.rules[0],
      patterns: ['module:alpha', 'missing:*'],
      exclude: ['also-missing:*'],
    } as unknown as (typeof invalidCoverage.rules)[number]
    invalidCoverage.rules[1] = {
      ...invalidCoverage.rules[1],
      patterns: ['*'],
    }
    invalidCoverage.rules[2] = {
      ...invalidCoverage.rules[2],
      patterns: ['module:*'],
    }

    const report = await checker.validateApiSurface({
      manifest: manifest(),
      coverage: invalidCoverage,
      projectRoot: fixtureProjectRoot(),
    })

    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'invalid-pattern', ruleId: 'alpha-module' }),
        expect.objectContaining({ code: 'invalid-pattern', ruleId: 'alpha-run' }),
        expect.objectContaining({ code: 'batch-mapping', ruleId: 'dynamic' }),
      ]),
    )
  })

  test('requires aliases to use and resolve an existing canonical rule', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const invalidManifest = manifest()
    const alias = invalidManifest.symbols.find(
      ({ id }: { id: string }) => id === 'alias:$alpha',
    )!
    alias.canonicalId = 'module:missing'
    const invalidCoverage = coverage()
    invalidCoverage.rules.at(-1)!.status = 'documented'
    invalidCoverage.rules.at(-1)!.target = 'docs/alpha.md#alpha'

    const report = await checker.validateApiSurface({
      manifest: invalidManifest,
      coverage: invalidCoverage,
      projectRoot: fixtureProjectRoot(),
    })

    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'invalid-alias',
          symbolId: 'alias:$alpha',
        }),
      ]),
    )
  })

  test('rejects alias targets and missing canonical rules', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const targetCoverage = coverage()
    targetCoverage.rules.at(-1)!.target = 'docs/alpha.md#alpha'
    const schemaReport = await checker.validateApiSurface({
      manifest: manifest(),
      coverage: targetCoverage,
      projectRoot: fixtureProjectRoot(),
    })
    expect(schemaReport.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'coverage-schema' }),
      ]),
    )

    const missingCanonicalManifest = manifest()
    missingCanonicalManifest.symbols.find(
      ({ id }: { id: string }) => id === 'alias:$alpha',
    )!.canonicalId = 'module:missing'
    const semanticReport = await checker.validateApiSurface({
      manifest: missingCanonicalManifest,
      coverage: coverage(),
      projectRoot: fixtureProjectRoot(),
    })
    expect(semanticReport.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'invalid-alias',
          symbolId: 'alias:$alpha',
        }),
      ]),
    )
  })

  test('rejects a catch-all even when the manifest has one public symbol', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const singleManifest = manifest()
    singleManifest.symbols = singleManifest.symbols.slice(0, 1)
    const report = await checker.validateApiSurface({
      manifest: singleManifest,
      coverage: {
        schemaVersion: 1,
        sourceRef: singleManifest.source.commit,
        rules: [
          {
            id: 'catch-all',
            patterns: ['*'],
            status: 'documented',
            target: 'docs/alpha.md#alpha',
          },
        ],
      },
      projectRoot: fixtureProjectRoot(),
    })

    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'invalid-pattern', ruleId: 'catch-all' }),
      ]),
    )
  })

  test('does not let a reasoned exclusion satisfy strict coverage', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const excludedCoverage = coverage()
    excludedCoverage.rules[2] = {
      id: 'dynamic',
      patterns: ['module:dynamic'],
      status: 'excluded',
      reason: 'This fixture intentionally exercises strict mode.',
    } as (typeof excludedCoverage.rules)[number]
    const report = await checker.validateApiSurface({
      manifest: manifest(),
      coverage: excludedCoverage,
      projectRoot: fixtureProjectRoot(),
    })

    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'invalid-target', ruleId: 'dynamic' }),
        expect.objectContaining({ code: 'unmapped-symbol', symbolId: 'module:dynamic' }),
      ]),
    )
  })

  test.each([null, '', '   '])(
    'rejects excluded reason %j',
    async (reason) => {
      const checker = await loadChecker()
      expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
      if (!checker) return

      const invalidCoverage = coverage()
      invalidCoverage.rules[2] = {
        id: 'dynamic',
        patterns: ['module:dynamic'],
        status: 'excluded',
        reason,
      } as unknown as (typeof invalidCoverage.rules)[number]
      const report = await checker.validateApiSurface({
        manifest: manifest(),
        coverage: invalidCoverage,
        projectRoot: fixtureProjectRoot(),
      })

      expect(report.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: 'coverage-schema' }),
        ]),
      )
    },
  )

  test('uses VitePress anchors and ignores code and comment pseudo anchors', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const projectRoot = fixtureProjectRoot()
    writeFileSync(
      resolve(projectRoot, 'docs/alpha.md'),
      [
        '# Fixture',
        '',
        '## First {#run}',
        '',
        '## Run',
        '',
        '<a id="real-id"></a>',
        '',
        '`<a id="code-id"></a>`',
        '',
        '```md',
        '## fenced',
        '<a id="fenced-id"></a>',
        '```',
        '',
        '<!--',
        '## commented',
        '<a id="comment-id"></a>',
        '-->',
      ].join('\n'),
    )
    const singleManifest = manifest()
    singleManifest.symbols = singleManifest.symbols.filter(
      ({ id }: { id: string }) => id === 'alpha.run',
    ) as typeof singleManifest.symbols

    const checkTarget = async (anchor: string) =>
      checker.validateApiSurface({
        manifest: singleManifest,
        coverage: {
          schemaVersion: 1,
          sourceRef: singleManifest.source.commit,
          rules: [
            {
              id: 'alpha-run',
              patterns: ['alpha.run'],
              status: 'documented',
              target: `docs/alpha.md#${anchor}`,
            },
          ],
        },
        projectRoot,
      })

    await expect(checkTarget('run-1')).resolves.toMatchObject({ errors: [] })
    await expect(checkTarget('real-id')).resolves.toMatchObject({ errors: [] })
    for (const anchor of [
      'code-id',
      'fenced',
      'fenced-id',
      'commented',
      'comment-id',
    ]) {
      await expect(checkTarget(anchor)).resolves.toEqual(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ code: 'missing-anchor' }),
          ]),
        }),
      )
    }
  })
})
