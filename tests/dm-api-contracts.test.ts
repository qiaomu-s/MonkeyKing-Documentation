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

const scanDirections = [
  ['0', '从左到右，从上到下'],
  ['1', '从左到右，从下到上'],
  ['2', '从右到左，从上到下'],
  ['3', '从右到左，从下到上'],
  ['4', '从中心向外'],
  ['5', '从上到下，从左到右'],
  ['6', '从上到下，从右到左'],
  ['7', '从下到上，从左到右'],
  ['8', '从下到上，从右到左'],
] as const

const directionContracts: Record<string, readonly (readonly [string, string])[]> = {
  findColor: scanDirections,
  findColorE: scanDirections,
  findColorEx: scanDirections.filter(([value]) => value !== '4'),
  findMultiColor: scanDirections.slice(0, 4),
  findMultiColorE: scanDirections.slice(0, 4),
  findMultiColorEx: scanDirections.slice(0, 4),
  findPic: scanDirections.slice(0, 4),
  findPicE: scanDirections.slice(0, 4),
  findPicEx: scanDirections.slice(0, 4),
  findPicExS: scanDirections.slice(0, 4),
  findPicMem: scanDirections.slice(0, 4),
  findPicMemE: scanDirections.slice(0, 4),
  findPicMemEx: scanDirections.slice(0, 4),
  findPicS: scanDirections.slice(0, 4),
  findPicSim: scanDirections.slice(0, 4),
  findPicSimE: scanDirections.slice(0, 4),
  findPicSimEx: scanDirections.slice(0, 4),
  findPicSimMem: scanDirections.slice(0, 4),
  findPicSimMemE: scanDirections.slice(0, 4),
  findPicSimMemEx: scanDirections.slice(0, 4),
  findShape: scanDirections.slice(0, 4),
  findShapeE: scanDirections.slice(0, 4),
  findShapeEx: scanDirections.slice(0, 4),
}

function readText(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

function readManifest(): Manifest {
  return JSON.parse(readText('api-surface/manifest.json')) as Manifest
}

function sectionFor(page: string, name: string): string {
  const start = page.indexOf(`### dm.${name}`)
  expect(start, name).toBeGreaterThanOrEqual(0)
  const next = page.indexOf('\n### ', start + 1)
  return page.slice(start, next < 0 ? page.length : next)
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

    expect(page).not.toMatch(/dm\.(?:setPicPwd|setDictPwd|sortPosDistance|writeIniPwd)\b/)
    expect(page).toMatch(/不支持 PC 私有加密图片|不支持 PC 私有加密字库/)
    expect(page).not.toMatch(/dm\.[A-Z][A-Za-z0-9]*\s*\(/)
    expect(page).not.toMatch(/dm\.(?:invoke|modernFind|modernText)\b/)
    expect(page).not.toMatch(/\b(?:IntRef|BufferRef)\b/)
    expect(page).not.toMatch(/\b(?:x|y)\.value\b/)
  })

  test('gives every public method a complete generated section and concrete example', () => {
    const manifest = readManifest()
    const page = readText('docs/api/media/dm.md')
    const dmSymbols = manifest.symbols.filter(
      (symbol) => symbol.public && symbol.owner === 'dm' && !symbol.canonicalId && symbol.kind !== 'module',
    )

    expect(dmSymbols).toHaveLength(114)
    for (const symbol of dmSymbols) {
      const section = sectionFor(page, symbol.name)
      expect(section, symbol.id).toContain('#### 签名')
      expect(section, symbol.id).toContain('#### 参数')
      expect(section, symbol.id).toContain('#### 返回值')
      expect(section, symbol.id).toContain('#### 示例')
      expect(section, symbol.id).toContain('#### 注意事项')
    }
    expect(page).toContain("'123456-000000|aabbcc-030303|ddeeff-202020'")
    expect(page).toContain("'8|0|aabbcc-030303,-4|3|ddeeff-202020'")
    expect(page).toContain('template.close()')
    expect(page).toContain('const x = 0, y = 0')
    expect(page).toContain("files.readBytes('./assets/dm/button.png')")
    expect(page).not.toContain('new Uint8Array(')
  })

  test('documents every direction value for every direction-based dm function', () => {
    const manifest = readManifest()
    const page = readText('docs/api/media/dm.md')
    const directionFunctions = manifest.symbols.filter(
      (symbol) =>
        symbol.public &&
        symbol.owner === 'dm' &&
        !symbol.canonicalId &&
        Object.hasOwn(directionContracts, symbol.name),
    )

    expect(directionFunctions).toHaveLength(Object.keys(directionContracts).length)
    for (const symbol of directionFunctions) {
      const anchor = `id="${apiSymbolAnchorId(symbol.id)}"`
      const start = page.indexOf(anchor)
      expect(start, symbol.id).toBeGreaterThanOrEqual(0)
      const section = sectionFor(page, symbol.name)
      expect(section, symbol.id).toContain('#### 扫描方向')
      for (const [value, description] of directionContracts[symbol.name]) {
        expect(section, `${symbol.id}: direction ${value}`).toContain(
          `| \`${value}\` | ${description} |`,
        )
      }
      for (const [value, description] of scanDirections) {
        if (!directionContracts[symbol.name].some(([allowed]) => allowed === value)) {
          expect(section, `${symbol.id}: direction ${value} must be excluded`).not.toContain(
            `| \`${value}\` | ${description} |`,
          )
        }
      }
    }
  })

  test('documents official color matching format and similarity constraints', () => {
    const page = readText('docs/api/media/dm.md')
    for (const name of ['findColor', 'findColorE', 'findColorEx']) {
      const start = page.indexOf(`### dm.${name}`)
      expect(start, name).toBeGreaterThanOrEqual(0)
      const section = sectionFor(page, name)
      expect(section, name).toContain('RRGGBB-DRDGDB')
      expect(section, name).toContain('反色模式')
      expect(section, name).toContain('0.1')
      expect(section, name).toContain('1.0')
    }
    for (const name of ['findMultiColor', 'findMultiColorE', 'findMultiColorEx']) {
      const start = page.indexOf(`### dm.${name}`)
      const section = page.slice(start, page.indexOf('\n### ', start + 1))
      expect(section, name).toContain('x|y|颜色')
      expect(section, name).toContain('颜色前加 `-`')
      expect(section, name).toContain('0.1')
      expect(section, name).toContain('1.0')
      expect(section, name).not.toContain('从中心向外')
    }
    for (const name of ['findPic', 'findPicSim']) {
      const start = page.indexOf(`### dm.${name}`)
      const section = page.slice(start, page.indexOf('\n### ', start + 1))
      expect(section, name).toContain('六位 RGB 偏色')
      expect(section, name).toContain('两位十六进制表示灰度偏色')
    }
    const picSim = sectionFor(page, 'findPicSim')
    expect(picSim).toContain('范围 `0–100`')
    const shape = sectionFor(page, 'findShape')
    expect(shape).toContain('x|y|e')
    expect(shape).not.toContain('#### FindColor 颜色格式与相似度')
    expect(page).toContain('支持 RGB `RRGGBB-DRDGDB`、HSV')
    expect(page).toContain('`#40-0`')
    expect(page).toContain('`b@` 表示按背景色匹配')
    expect(page).toContain('DmMatch[]')
  })

  test('keeps all DM reference pages free of removed PC-only calls', () => {
    const paths = [
      'docs/api/media/dm.md',
      'docs/reference/dm/overview.md',
      'docs/reference/dm/compatibility.md',
      'docs/reference/dm/dictionary.md',
      'docs/reference/dm/examples.md',
      'docs/reference/dm/image.md',
      'docs/reference/dm/text.md',
    ]
    const contents = paths.map(readText).join('\n')
    expect(contents).not.toMatch(/dm\.(?:setPicPwd|setDictPwd|sortPosDistance|writeIniPwd)\b/)
    expect(contents).not.toMatch(/dm\.(?:Find|Ocr|Set|Get|Capture)[A-Z]\w*\s*\(/)
    expect(contents).not.toContain('dm.invoke(')
  })
})
