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

function pascalToCamel(name: string): string {
  if (/^[A-Z0-9]+$/.test(name)) return name.toLowerCase()
  const acronym = name.match(/^[A-Z]+(?=[0-9]|[A-Z][a-z]|$)/)?.[0]
  if (acronym && acronym.length > 1) {
    return acronym.toLowerCase() + name.slice(acronym.length)
  }
  return name.slice(0, 1).toLowerCase() + name.slice(1)
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
    expect(dmSymbols).toHaveLength(223)
    expect(methodSymbols).toHaveLength(222)

    for (const symbol of methodSymbols.filter((candidate) =>
      /^[A-Z]/.test(candidate.name),
    )) {
      expect(
        ids.has(`dm.${pascalToCamel(symbol.name)}`),
        `${symbol.id} must have its camelCase counterpart`,
      ).toBe(true)
    }

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

    expect(page).toContain('SetPicPwd')
    expect(page).toContain('SetDictPwd')
    expect(page).toMatch(/不支持加密资源|不支持加密/)
    expect(page).not.toMatch(/dm\.(?:invoke|modernFind|modernText)\b/)
  })
})
