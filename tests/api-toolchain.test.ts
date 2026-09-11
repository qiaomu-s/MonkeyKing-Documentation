import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const extractCliModulePath = '../scripts/api/' + 'extract'
const checkCliModulePath = '../scripts/api/' + 'check'
const coverageCliModulePath = '../scripts/api/' + 'coverage'

async function loadCli(path: string): Promise<Record<string, any> | null> {
  try {
    return (await import(path)) as Record<string, any>
  } catch {
    return null
  }
}

describe('API tooling command contract', () => {
  test('exposes extraction and validation commands', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
    ) as { scripts?: Record<string, string> }

    expect(packageJson.scripts).toMatchObject({
      'api:extract': 'tsx scripts/api/extract.ts',
      'api:coverage': 'tsx scripts/api/coverage.ts',
      'api:check': 'tsx scripts/api/check.ts',
      'api:mime': 'tsx scripts/api/mime-appendix.ts',
    })
  })

  test('parses coverage generation and drift flags explicitly', async () => {
    const coverageCli = await loadCli(coverageCliModulePath)
    expect(coverageCli, 'scripts/api/coverage.ts must exist').not.toBeNull()
    if (!coverageCli) return

    expect(
      coverageCli.parseCoverageArguments([
        '--root',
        '/tmp/docs',
        '--manifest',
        'surface.json',
        '--output',
        'coverage.json',
        '--check',
      ]),
    ).toEqual({
      root: '/tmp/docs',
      manifest: 'surface.json',
      output: 'coverage.json',
      gaps: 'api-surface/gaps.json',
      check: true,
    })

    expect(
      coverageCli.parseCoverageArguments([
        '--internal-manifest',
        '/tmp/internal-api.json',
      ]),
    ).toEqual({
      root: process.cwd(),
      manifest: 'api-surface/manifest.json',
      output: 'api-surface/coverage.json',
      gaps: 'api-surface/gaps.json',
      check: false,
      internalManifest: '/tmp/internal-api.json',
    })
  })

  test('parses source, ref and manifest drift flags explicitly', async () => {
    const extractCli = await loadCli(extractCliModulePath)
    expect(extractCli, 'scripts/api/extract.ts must exist').not.toBeNull()
    if (!extractCli) return

    expect(
      extractCli.parseExtractArguments([
        '--source',
        '/tmp/MonkeyKing',
        '--ref',
        'fixed-sha',
        '--check',
      ]),
    ).toEqual({
      source: '/tmp/MonkeyKing',
      ref: 'fixed-sha',
      check: true,
      output: 'api-surface/manifest.json',
    })
    expect(() => extractCli.parseExtractArguments([])).toThrow(/--source/)
    expect(
      extractCli.parseExtractArguments([
        '--source',
        '/tmp/MonkeyKing',
        '--internal-output',
        '/tmp/internal-api.json',
      ]),
    ).toMatchObject({ internalOutput: '/tmp/internal-api.json' })
  })

  test('allows the checker root and input files to be overridden', async () => {
    const checkCli = await loadCli(checkCliModulePath)
    expect(checkCli, 'scripts/api/check.ts must exist').not.toBeNull()
    if (!checkCli) return

    expect(
      checkCli.parseCheckArguments([
        '--root',
        '/tmp/docs',
        '--manifest',
        'surface.json',
        '--coverage',
        'coverage.json',
      ]),
    ).toEqual({
      root: '/tmp/docs',
      manifest: 'surface.json',
      coverage: 'coverage.json',
    })
  })
})
