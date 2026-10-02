import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { getDmExample } from '../scripts/dm-examples.mjs'

interface AuditEntry {
  modern: string
  referenceStatus: 'verified' | 'missing' | 'android-extension'
  referenceUrl: string | null
  referenceScenarios: string[]
  referenceEvidence: { available: boolean; articleIdentityMatches?: boolean } | null
  completionStatus: string
  registryComparison: {
    codeSha256: string
    declaredScenarios: string[]
    residualGaps: unknown[]
    scenarioMappings: { referenceScenario: number; status: string }[]
  }
}

const audit = JSON.parse(readFileSync('scripts/dm-example-audit.json', 'utf8')) as {
  publish: boolean
  visibility: string
  entries: AuditEntry[]
  registrySnapshot: { sha256: string; generatorSha256: string }
}
const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')

describe('internal DM reference example audit', () => {
  test('tracks all public methods without claiming unavailable references were verified', () => {
    const manifest = JSON.parse(readFileSync('api-surface/manifest.json', 'utf8')) as {
      symbols: { owner: string; kind: string; name: string; public: boolean; canonicalId?: string }[]
    }
    const names = manifest.symbols
      .filter((symbol) => symbol.public && symbol.owner === 'dm' &&
        symbol.kind === 'function' && !symbol.canonicalId)
      .map((symbol) => symbol.name)
    expect(audit.publish).toBe(false)
    expect(audit.visibility).toBe('internal-nonpublic')
    expect(audit.entries).toHaveLength(114)
    expect(audit.entries.map((entry) => entry.modern).sort()).toEqual(names.sort())
    expect(audit.entries.filter((entry) => entry.referenceStatus === 'verified')).toHaveLength(103)
    expect(audit.entries.filter((entry) => entry.referenceStatus === 'missing').map((entry) => entry.modern))
      .toEqual(['getScreenData'])
    expect(audit.entries.filter((entry) => entry.referenceStatus === 'android-extension')).toHaveLength(10)
    for (const entry of audit.entries) {
      if (entry.referenceStatus === 'verified') {
        expect(entry.referenceEvidence?.available, entry.modern).toBe(true)
        expect(entry.referenceEvidence?.articleIdentityMatches, entry.modern).toBe(true)
        expect(entry.referenceScenarios.length, entry.modern).toBeGreaterThan(0)
      } else if (entry.referenceStatus === 'android-extension') {
        expect(entry.referenceUrl, entry.modern).toBeNull()
      } else {
        expect(entry.referenceEvidence?.available, entry.modern).toBe(false)
      }
    }
  })

  test('pins completion decisions to the reviewed example and generator snapshot', () => {
    expect(audit.registrySnapshot.sha256).toBe(sha256(readFileSync('scripts/dm-examples.mjs')))
    expect(audit.registrySnapshot.generatorSha256)
      .toBe(sha256(readFileSync('scripts/generate-dm-docs.mjs')))
    for (const entry of audit.entries) {
      const example = getDmExample(entry.modern)
      expect(entry.completionStatus, entry.modern).toBe('complete')
      expect(entry.registryComparison.codeSha256, entry.modern).toBe(sha256(example.code))
      expect(entry.registryComparison.declaredScenarios, entry.modern).toEqual(example.scenarios)
      expect(entry.registryComparison.residualGaps, entry.modern).toEqual([])
      expect(entry.registryComparison.scenarioMappings.map((mapping) => mapping.referenceScenario))
        .toEqual(entry.referenceScenarios.map((_, index) => index + 1))
      for (const mapping of entry.registryComparison.scenarioMappings) {
        expect(['adapted', 'unsupported-documented', 'not-applicable-adaptation'])
          .toContain(mapping.status)
      }
    }
  })
})
