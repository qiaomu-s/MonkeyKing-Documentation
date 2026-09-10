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
        patterns: ['module:dynamic', 'dynamic.*'],
        status: 'documented',
        target: 'docs/dynamic.md#dynamic-api',
      },
      {
        id: 'global',
        patterns: ['global:*'],
        status: 'documented',
        target: 'docs/global.md#global-api',
      },
      {
        id: 'aliases',
        patterns: ['alias:*'],
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
  test('accepts a complete unique mapping with existing pages and anchors', async () => {
    const checker = await loadChecker()
    expect(checker, 'scripts/api/checker.ts must exist').not.toBeNull()
    if (!checker) return

    const report = checker.validateApiSurface({
      manifest: manifest(),
      coverage: coverage(),
      projectRoot: fixtureProjectRoot(),
    })

    expect(report.errors).toEqual([])
    expect(report.publicSymbolCount).toBe(5)
    expect(report.mappedSymbolCount).toBe(5)
  })

  test('reports schema, unknown, duplicate and unmapped coverage errors', async () => {
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
      },
    ] as typeof invalidCoverage.rules

    const report = checker.validateApiSurface({
      manifest: manifest(),
      coverage: invalidCoverage,
      projectRoot: fixtureProjectRoot(),
    })
    const codes = report.errors.map(({ code }: { code: string }) => code)

    expect(codes).toContain('coverage-schema')
    expect(codes).toContain('unknown-symbol')
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

    const report = checker.validateApiSurface({
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

    const report = checker.validateApiSurface({
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
      patterns: ['module:dynamic', 'dynamic.*'],
      status: 'excluded',
    } as (typeof invalidCoverage.rules)[number]

    const report = checker.validateApiSurface({
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
})
