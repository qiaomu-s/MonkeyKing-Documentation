import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { apiSymbolAnchorId } from '../scripts/api/coverage-generator'

interface ManifestSymbol {
  readonly id: string
  readonly owner: string
  readonly name: string
  readonly kind: string
  readonly public: boolean
  readonly canonicalId?: string
}

interface Manifest {
  readonly modules: readonly { id: string }[]
  readonly symbols: readonly ManifestSymbol[]
}

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

function readManifest(): Manifest {
  return JSON.parse(readText('api-surface/manifest.json')) as Manifest
}

describe('formal dm API surface', () => {
  test('matches the reviewed Rhino surface and excludes Java implementation types', () => {
    const manifest = readManifest()
    const dmSymbols = manifest.symbols.filter(
      (symbol) => symbol.public && symbol.owner === 'dm' && !symbol.canonicalId,
    )
    const methodSymbols = dmSymbols.filter((symbol) => symbol.kind !== 'module')
    const ids = new Set(manifest.symbols.map((symbol) => symbol.id))

    expect(manifest.modules.some(({ id }) => id === 'dm')).toBe(true)
    expect(ids.has('module:dm')).toBe(true)
    expect(dmSymbols.length).toBeGreaterThan(100)
    expect(methodSymbols.length).toBeGreaterThan(100)
    expect(methodSymbols.every((symbol) => !/^[A-Z]/.test(symbol.name))).toBe(true)

    for (const id of [
      'dm.invoke',
      'dm.modernFind',
      'dm.modernText',
      'dm.IntRef',
      'dm.BufferRef',
      'dm.DmBuffer',
      'dm.constructor',
    ]) {
      expect(ids.has(id), `${id} must not be a JS API symbol`).toBe(false)
    }
  })

  test('keeps every dm symbol addressable on the formal API page', () => {
    const manifest = readManifest()
    const page = readText('docs/api/media/dm.md')
    const dmSymbols = manifest.symbols.filter(
      (symbol) => symbol.public && symbol.owner === 'dm' && !symbol.canonicalId,
    )

    for (const symbol of dmSymbols) {
      expect(page, symbol.id).toContain(`id="${apiSymbolAnchorId(symbol.id)}"`)
    }

    expect(page).toContain('setPicPwd')
    expect(page).toContain('setDictPwd')
    expect(page).toMatch(/不支持加密资源|不支持加密/)
    expect(page).not.toMatch(/dm\.[A-Z][A-Za-z0-9]*\s*\(/)
    expect(page).not.toMatch(/dm\.(?:invoke|modernFind|modernText)\b/)
  })
})
