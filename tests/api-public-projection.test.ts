import Ajv from 'ajv'
import {
  projectApiCoverage,
  projectApiGaps,
  projectApiManifest,
} from '../scripts/api/public-projection'
import { coverageSchema, gapsSchema, manifestSchema } from '../scripts/api/schema'
import type { ApiCoverage, ApiManifest } from '../scripts/api/model'

const source = { path: 'internal/runtime/Example.kt', line: 7 }

function internalManifest(): ApiManifest {
  return {
    schemaVersion: 1,
    source: {
      repository: 'internal/product',
      ref: 'release',
      commit: '1111111111111111111111111111111111111111',
    },
    modules: [
      {
        id: 'alpha',
        name: 'alpha',
        className: 'Alpha',
        aliases: ['$alpha'],
        source,
      },
    ],
    symbols: [
      {
        id: 'alpha.run',
        owner: 'alpha',
        name: 'run',
        kind: 'function',
        public: true,
        source,
        providers: [source, { path: 'internal/runtime/Provider.kt', line: 12 }],
        annotations: ['ScriptInterface'],
        signatures: ['run(): void;'],
        overloads: [],
      },
      {
        id: 'global:__engine__',
        owner: 'global',
        name: '__engine__',
        kind: 'engine-global',
        public: false,
        source,
        annotations: [],
        signatures: [],
        overloads: [],
      },
    ],
    annotations: [
      { path: source.path, line: source.line, member: 'run', annotations: ['ScriptInterface'] },
    ],
    declarationHints: [
      { path: source.path, line: source.line, kind: 'signature', value: 'run(): void;' },
    ],
    assets: [{ id: 'alpha', path: 'internal/assets/alpha.js' }],
    overrides: [
      { id: 'alpha', className: 'Alpha', reason: 'Dynamic fixture.', source },
    ],
  }
}

describe('public API projection', () => {
  test('publishes only the v2 runtime contract', () => {
    const projected = projectApiManifest(internalManifest())

    expect(projected).toEqual({
      schemaVersion: 2,
      productVersion: '6.7.0',
      modules: [
        {
          id: 'alpha',
          name: 'alpha',
          className: 'Alpha',
          aliases: ['$alpha'],
        },
      ],
      symbols: [
        {
          id: 'alpha.run',
          owner: 'alpha',
          name: 'run',
          kind: 'function',
          public: true,
          annotations: ['ScriptInterface'],
          signatures: ['run(): void;'],
          overloads: [],
        },
      ],
    })
    expect(JSON.stringify(projected)).not.toMatch(
      /repository|commit|source|path|line|providers|assets|declarationHints|overrides/,
    )
  })

  test('strips source refs and gap evidence', () => {
    const coverage: ApiCoverage = {
      schemaVersion: 1,
      sourceRef: '1111111111111111111111111111111111111111',
      rules: [
        {
          id: 'coverage:alpha.run',
          patterns: ['alpha.run'],
          status: 'documented',
          target: 'docs/alpha.md#run',
        },
      ],
    }

    expect(projectApiCoverage(coverage)).toEqual({
      schemaVersion: 2,
      productVersion: '6.7.0',
      rules: coverage.rules,
    })
    expect(
      projectApiGaps([
        {
          symbolId: 'alpha.missing',
          owner: 'alpha',
          name: 'missing',
          kind: 'function',
          source,
          expectedPage: 'docs/alpha.md',
          reason: 'Missing section.',
        },
      ]),
    ).toEqual({
      gaps: [
        {
          symbolId: 'alpha.missing',
          owner: 'alpha',
          name: 'missing',
          kind: 'function',
          expectedPage: 'docs/alpha.md',
          reason: 'Missing section.',
        },
      ],
    })
  })

  test('schemas reject provenance fields in public artifacts', () => {
    const ajv = new Ajv({ allErrors: true, strict: false })
    const validateManifest = ajv.compile(manifestSchema)
    const validateCoverage = ajv.compile(coverageSchema)
    const validateGaps = ajv.compile(gapsSchema)
    const manifest = projectApiManifest(internalManifest())
    const coverage = projectApiCoverage({ rules: [] })
    const gaps = projectApiGaps([])

    expect(validateManifest(manifest)).toBe(true)
    expect(validateCoverage(coverage)).toBe(true)
    expect(validateGaps(gaps)).toBe(true)
    expect(validateManifest({ ...manifest, source: { commit: 'hidden' } })).toBe(false)
    expect(validateCoverage({ ...coverage, sourceRef: 'hidden' })).toBe(false)
    expect(
      validateGaps({
        gaps: [
          {
            symbolId: 'alpha.missing',
            owner: 'alpha',
            name: 'missing',
            kind: 'function',
            reason: 'Missing section.',
            source,
          },
        ],
      }),
    ).toBe(false)
  })
})
