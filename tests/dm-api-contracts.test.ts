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

const directionFunctionNames = new Set([
  'findColor',
  'findColorE',
  'findColorEx',
  'findMultiColor',
  'findMultiColorE',
  'findMultiColorEx',
  'findPic',
  'findPicE',
  'findPicEx',
  'findPicExS',
  'findPicMem',
  'findPicMemE',
  'findPicMemEx',
  'findPicS',
  'findPicSim',
  'findPicSimE',
  'findPicSimEx',
  'findPicSimMem',
  'findPicSimMemE',
  'findPicSimMemEx',
  'findShape',
  'findShapeE',
  'findShapeEx',
])

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

  test('documents every direction value for every direction-based dm function', () => {
    const manifest = readManifest()
    const page = readText('docs/api/media/dm.md')
    const directionFunctions = manifest.symbols.filter(
      (symbol) =>
        symbol.public &&
        symbol.owner === 'dm' &&
        !symbol.canonicalId &&
        directionFunctionNames.has(symbol.name),
    )

    expect(directionFunctions).toHaveLength(directionFunctionNames.size)
    for (const symbol of directionFunctions) {
      const anchor = `id="${apiSymbolAnchorId(symbol.id)}"`
      const start = page.indexOf(anchor)
      expect(start, symbol.id).toBeGreaterThanOrEqual(0)
      const section = page.slice(start, page.indexOf('\n### ', start + 1))
      expect(section, symbol.id).toContain('#### 扫描方向')
      for (const [value, description] of [
        ['0', '从左到右，从上到下'],
        ['1', '从左到右，从下到上'],
        ['2', '从右到左，从上到下'],
        ['3', '从右到左，从下到上'],
        ['4', '从中心向外'],
        ['5', '从上到下，从左到右'],
        ['6', '从上到下，从右到左'],
        ['7', '从下到上，从左到右'],
        ['8', '从下到上，从右到左'],
      ]) {
        expect(section, `${symbol.id}: direction ${value}`).toContain(
          `| \`${value}\` | ${description} |`,
        )
      }
    }
  })

  test('documents official color matching format and similarity constraints', () => {
    const page = readText('docs/api/media/dm.md')
    for (const name of [
      'findColor',
      'findColorE',
      'findColorEx',
      'findMultiColor',
      'findMultiColorE',
      'findMultiColorEx',
    ]) {
      const start = page.indexOf(`### dm.${name}`)
      expect(start, name).toBeGreaterThanOrEqual(0)
      const section = page.slice(start, page.indexOf('\n### ', start + 1))
      expect(section, name).toContain('RRGGBB-DRDGDB')
      expect(section, name).toContain('反色模式')
      expect(section, name).toContain('0.1')
      expect(section, name).toContain('1.0')
    }
  })
})
