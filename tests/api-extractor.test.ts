import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const extractorModulePath = '../scripts/api/' + 'extractor'
const modelModulePath = '../scripts/api/' + 'model'
const fixtureRoot = resolve(process.cwd(), 'tests/fixtures/api/source')
const fixtureCommit = '1111111111111111111111111111111111111111'

interface FixtureReader {
  readonly repositoryName: string
  resolveRef(ref: string): string
  listFiles(prefix?: string): string[]
  readFile(path: string): string
}

function fixtureFiles(directory = fixtureRoot): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = join(directory, entry.name)
    return entry.isDirectory()
      ? fixtureFiles(absolute)
      : [relative(fixtureRoot, absolute).replaceAll('\\', '/')]
  })
}

function createFixtureReader(reverse = false): FixtureReader {
  const files = fixtureFiles().sort()
  if (reverse) files.reverse()

  return {
    repositoryName: 'fixture/MonkeyKing',
    resolveRef: () => fixtureCommit,
    listFiles: (prefix = '') => files.filter((path) => path.startsWith(prefix)),
    readFile: (path) => readFileSync(resolve(fixtureRoot, path), 'utf8'),
  }
}

async function loadExtractor(): Promise<Record<string, any> | null> {
  try {
    return (await import(extractorModulePath)) as Record<string, any>
  } catch {
    return null
  }
}

async function loadModel(): Promise<Record<string, any> | null> {
  try {
    return (await import(modelModulePath)) as Record<string, any>
  } catch {
    return null
  }
}

const dynamicOverrides = [
  {
    id: 'fixture-dynamic-key',
    className: 'DynamicKey',
    key: 'dynamic',
    reason: 'The fixture computes its key and member list at runtime.',
    source: {
      path: 'app/src/main/java/example/runtime/api/augment/dynamic/DynamicKey.kt',
      line: 4,
    },
    assignments: ['selfAssignmentFunctions'],
    members: [{ name: 'generated', kind: 'function' }],
  },
]

describe('API manifest extractor', () => {
  test('extracts nested registrations, aliases, globals, getters, classes and annotations', async () => {
    const extractor = await loadExtractor()
    expect(extractor, 'scripts/api/extractor.ts must exist').not.toBeNull()
    if (!extractor) return

    const manifest = await extractor.extractApiManifest(createFixtureReader(), {
      ref: 'fixture-ref',
      overrides: dynamicOverrides,
    })

    expect(manifest.source).toEqual({
      repository: 'fixture/MonkeyKing',
      ref: 'fixture-ref',
      commit: fixtureCommit,
    })
    expect(manifest.modules.map(({ id }: { id: string }) => id)).toEqual([
      'alpha',
      'alpha.nested',
      'dynamic',
      'proxy',
    ])
    expect(manifest.modules.find(({ id }: { id: string }) => id === 'alpha')).toMatchObject({
      aliases: ['$alpha'],
      className: 'Alpha',
    })
    expect(
      manifest.modules.find(({ id }: { id: string }) => id === 'alpha.nested'),
    ).toMatchObject({ parent: 'alpha', aliases: [], className: 'Nested' })

    const symbols = new Map(
      manifest.symbols.map((symbol: { id: string }) => [symbol.id, symbol]),
    )
    expect(symbols.get('alpha.answer')).toMatchObject({ kind: 'property' })
    expect(symbols.get('alpha.state')).toMatchObject({ kind: 'getter' })
    expect(symbols.get('alpha.Thing')).toMatchObject({ kind: 'class' })
    expect(symbols.get('alpha.run')).toMatchObject({
      kind: 'function',
      annotations: expect.arrayContaining(['RhinoRuntimeFunctionInterface']),
      signatures: ['run(value: string): string;'],
      overloads: ['run(value: number): number;'],
    })
    expect(symbols.get('alpha.var')).toMatchObject({
      kind: 'function',
      annotations: ['ScriptInterface'],
      signatures: ['`var`(value: string): string;'],
      overloads: ['`var`(value: number): number;'],
    })
    expect(symbols.has('alpha.publicAfterPrivateAnnotation')).toBe(false)
    expect(symbols.get('alias:alpha.get')).toMatchObject({
      kind: 'alias',
      canonicalId: 'alpha.fetch',
    })
    expect(symbols.get('global:fetch')).toMatchObject({
      kind: 'global',
      canonicalId: 'alpha.fetch',
    })
    expect(symbols.get('global:get')).toMatchObject({
      kind: 'global',
      canonicalId: 'alpha.fetch',
    })
    expect(symbols.get('global:GLOBAL_VALUE')).toMatchObject({ kind: 'property' })
    expect(symbols.get('global:globalOnly')).toMatchObject({ kind: 'function' })
    expect(symbols.get('global:globalOnly')).not.toHaveProperty('canonicalId')
    expect(symbols.get('global:renamedGlobal')).toMatchObject({
      kind: 'function',
      annotations: ['RhinoRuntimeFunctionInterface'],
    })
    expect(symbols.get('global:renamedGlobalAlias')).toMatchObject({
      kind: 'alias',
      canonicalId: 'global:renamedGlobal',
    })
    expect(symbols.has('alpha.commentedOut')).toBe(false)
    expect(symbols.has('alias:alpha.commentedOut')).toBe(false)
    expect(symbols.get('global:globalHelper')).toMatchObject({ kind: 'function' })
    expect(symbols.get('global:axios')).toMatchObject({ kind: 'getter' })
    expect(symbols.get('global:shared')).toMatchObject({
      providers: expect.arrayContaining([
        expect.objectContaining({ path: expect.stringContaining('Alpha.kt') }),
        expect.objectContaining({ path: expect.stringContaining('Global.kt') }),
      ]),
    })
    expect(symbols.get('alpha.nested.ping')).toMatchObject({ kind: 'function' })
    expect(symbols.get('call:alpha')).toMatchObject({
      owner: 'alpha',
      name: 'alpha',
      kind: 'callable',
      annotations: ['RhinoRuntimeFunctionInterface'],
    })
    expect(symbols.get('construct:alpha.nested')).toMatchObject({
      owner: 'alpha.nested',
      name: 'nested',
      kind: 'constructor',
    })
    expect(symbols.get('dynamic.generated')).toMatchObject({ kind: 'function' })
    expect(symbols.get('alpha.class')).toMatchObject({
      owner: 'alpha',
      kind: 'function',
      source: expect.objectContaining({ path: expect.stringContaining('LegacyUtil.kt') }),
    })
    expect(symbols.get('alpha.getClass')).toMatchObject({ kind: 'function' })
    expect(symbols.has('alpha.hiddenHelper')).toBe(false)
    expect(symbols.get('alpha.nested.fileProviderAuthority')).toMatchObject({
      kind: 'property',
      annotations: ['ScriptInterface'],
    })
    expect(symbols.get('alpha.nested.ensureInstalled')).toMatchObject({
      kind: 'function',
      annotations: ['ScriptInterface'],
    })
    expect(symbols.get('alpha.nested.isActivityShortForm')).toMatchObject({
      kind: 'function',
      annotations: ['ScriptInterface'],
    })
    expect(symbols.has('alpha.nested.privateAnnotated')).toBe(false)
    expect(symbols.get('dynamic.digest')).toMatchObject({ kind: 'function' })
    expect(symbols.get('dynamic.encrypt')).toMatchObject({ kind: 'function' })
    expect(symbols.has('dynamic.cipher')).toBe(false)
    expect(symbols.get('proxy.ensureInstalled')).toMatchObject({ kind: 'function' })
    expect(symbols.get('call:dynamic')).toMatchObject({
      kind: 'callable',
      source: expect.objectContaining({ line: 3 }),
    })
    expect(symbols.get('global:Promise')).toMatchObject({ kind: 'engine-global' })
    expect(symbols.get('global:Module')).toMatchObject({ kind: 'engine-global' })
    expect(symbols.get('global:require')).toMatchObject({ kind: 'engine-global' })
    expect(symbols.get('global:structuredClone')).toMatchObject({
      kind: 'engine-global',
    })
    expect(symbols.get('global:__engine__')).toMatchObject({ public: false })

    expect(manifest.assets.map(({ id }: { id: string }) => id)).toEqual([
      'promise',
      'structured-clone.min',
    ])
    expect(manifest.overrides).toEqual([
      expect.objectContaining({
        id: 'fixture-dynamic-key',
        reason: 'The fixture computes its key and member list at runtime.',
      }),
    ])
  })

  test('serializes deterministically regardless of source listing order', async () => {
    const extractor = await loadExtractor()
    const model = await loadModel()
    expect(extractor, 'scripts/api/extractor.ts must exist').not.toBeNull()
    expect(model, 'scripts/api/model.ts must exist').not.toBeNull()
    if (!extractor || !model) return

    const normal = await extractor.extractApiManifest(createFixtureReader(), {
      ref: 'fixture-ref',
      overrides: dynamicOverrides,
    })
    const reversed = await extractor.extractApiManifest(createFixtureReader(true), {
      ref: 'fixture-ref',
      overrides: dynamicOverrides,
    })

    expect(model.stableJson(normal)).toBe(model.stableJson(reversed))
    expect(model.manifestMatches(model.stableJson(normal), normal)).toBe(true)
    expect(model.manifestMatches('{}\n', normal)).toBe(false)
  })

  test('rejects computed assignment lists unless the override names the assignment', async () => {
    const extractor = await loadExtractor()
    expect(extractor, 'scripts/api/extractor.ts must exist').not.toBeNull()
    if (!extractor) return

    const keyOnlyOverride = {
      ...dynamicOverrides[0],
      assignments: [],
    }

    await expect(
      extractor.extractApiManifest(createFixtureReader(), {
        ref: 'fixture-ref',
        overrides: [keyOnlyOverride],
      }),
    ).rejects.toThrow(
      /DynamicKey\.selfAssignmentFunctions.*auditable override/i,
    )
  })

  test.each([
    {
      label: 'missing path',
      source: { path: 'app/src/main/java/example/Missing.kt', line: 1 },
      expected: /missing source/i,
    },
    {
      label: 'out-of-range line',
      source: dynamicOverrides[0].source,
      line: 999,
      expected: /outside.*source/i,
    },
    {
      label: 'blank line',
      source: dynamicOverrides[0].source,
      line: 2,
      expected: /blank/i,
    },
    {
      label: 'unrelated line',
      source: dynamicOverrides[0].source,
      line: 1,
      expected: /semantic evidence/i,
    },
  ])('rejects override evidence with a $label', async ({ source, line, expected }) => {
    const extractor = await loadExtractor()
    expect(extractor, 'scripts/api/extractor.ts must exist').not.toBeNull()
    if (!extractor) return

    await expect(
      extractor.extractApiManifest(createFixtureReader(), {
        ref: 'fixture-ref',
        overrides: [
          {
            ...dynamicOverrides[0],
            source: { ...source, ...(line ? { line } : {}) },
          },
        ],
      }),
    ).rejects.toThrow(expected)
  })

  test('applies an explicit standalone dynamic surface to its documented owner', async () => {
    const extractor = await loadExtractor()
    expect(extractor, 'scripts/api/extractor.ts must exist').not.toBeNull()
    if (!extractor) return

    const manifest = await extractor.extractApiManifest(createFixtureReader(), {
      ref: 'fixture-ref',
      overrides: [
        ...dynamicOverrides,
        {
          id: 'fixture-result-surface',
          className: 'ResultSurface',
          owner: 'alpha.Result',
          reason: 'The returned object installs members at runtime.',
          source: {
            path: 'app/src/main/java/example/runtime/api/augment/alpha/ResultSurface.kt',
            line: 3,
          },
          includeAnnotatedMembers: true,
          members: [
            { name: 'value', kind: 'property' },
            {
              id: 'dynamic:alpha.Result.fields',
              name: 'fields',
              kind: 'dynamic',
              canonicalId: 'alpha.Result.value',
            },
          ],
        },
        {
          id: 'fixture-global-reflection',
          className: 'GlobalSurface',
          owner: 'global',
          idPrefix: 'global:',
          includeAnnotatedMembers: true,
          includeJvmFieldsAs: 'class',
          reason: 'The global proxy resolves reflected fields and annotated methods.',
          source: {
            path: 'app/src/main/java/example/runtime/api/augment/global/GlobalSurface.kt',
            line: 3,
          },
        },
        {
          id: 'fixture-java-public-surface',
          className: 'Database',
          owner: 'alpha.Database',
          includePublicMembers: true,
          reason: 'The returned Java object exposes its declared public members.',
          source: {
            path: 'app/src/main/java/example/core/Database.java',
            line: 3,
          },
        },
      ],
    })

    const symbols = new Map(
      manifest.symbols.map((symbol: { id: string }) => [symbol.id, symbol]),
    )
    expect(symbols.get('alpha.Result.value')).toMatchObject({
      owner: 'alpha.Result',
      kind: 'property',
    })
    expect(symbols.get('alpha.Result.close')).toMatchObject({
      owner: 'alpha.Result',
      kind: 'function',
      annotations: ['RhinoStandardFunctionInterface'],
    })
    expect(symbols.has('alpha.Result.secret')).toBe(false)
    expect(symbols.has('alpha.Result.visibleButUnannotated')).toBe(false)
    expect(symbols.has('alpha.Result.companionLeak')).toBe(false)
    expect(symbols.has('alpha.Result.afterCompanion')).toBe(false)
    expect(symbols.get('dynamic:alpha.Result.fields')).toMatchObject({
      owner: 'alpha.Result',
      name: 'fields',
      kind: 'dynamic',
      canonicalId: 'alpha.Result.value',
    })
    expect(symbols.get('global:Thing')).toMatchObject({
      owner: 'global',
      name: 'Thing',
      kind: 'class',
    })
    expect(symbols.get('global:find')).toMatchObject({
      owner: 'global',
      name: 'find',
      kind: 'function',
    })
    expect(symbols.get('alpha.Database.name')).toMatchObject({ kind: 'property' })
    expect(symbols.get('alpha.Database.execSQL')).toMatchObject({ kind: 'function' })
    expect(symbols.get('alpha.Database.query')).toMatchObject({ kind: 'function' })
    expect(symbols.has('alpha.Database.hiddenHelper')).toBe(false)
    expect(manifest.overrides).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'fixture-result-surface' }),
      ]),
    )
  })
})
