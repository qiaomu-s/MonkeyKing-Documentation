import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { dynamicOverrides } from '../scripts/api/overrides'
import { contentEntries } from '../scripts/content/catalog'
import { getDmExample } from '../scripts/dm-examples.mjs'

const read = (path: string) => readFileSync(resolve(path), 'utf8')
const manifest = JSON.parse(read('api-surface/manifest.json')) as {
  symbols: { id: string; owner: string; name: string; kind: string }[]
}
const pictureContracts = [
  ['findPic', 'String', 'double', false],
  ['findPicE', 'String', 'double', false],
  ['findPicEx', 'String', 'double', true],
  ['findPicExS', 'String', 'double', true],
  ['findPicMem', 'Object', 'double', false],
  ['findPicMemE', 'Object', 'double', false],
  ['findPicMemEx', 'Object', 'double', true],
  ['findPicS', 'String', 'double', false],
  ['findPicSim', 'String', 'int', false],
  ['findPicSimE', 'String', 'int', false],
  ['findPicSimEx', 'String', 'int', true],
  ['findPicSimMem', 'Object', 'int', false],
  ['findPicSimMemE', 'Object', 'int', false],
  ['findPicSimMemEx', 'Object', 'int', true],
] as const

describe('approved standalone OCR and image contracts', () => {
  test('keeps all twelve standalone recognition entrypoints and DM dictionary OCR', () => {
    const ids = new Set(manifest.symbols.map(({ id }) => id))
    const page = read('docs/api/media/ocr.md')
    for (const owner of ['ocr', 'ocr.mlkit', 'ocr.paddle', 'ocr.rapid']) {
      for (const id of [`call:${owner}`, `${owner}.recognizeText`, `${owner}.detect`]) {
        expect(ids.has(id), id).toBe(true)
        expect(page, id).toContain(`api-symbol-${Buffer.from(id).toString('base64url')}`)
      }
    }
    for (const name of ['ocr', 'ocrInFile', 'ocrEx', 'ocrExOne', 'setDict', 'useDict']) {
      expect(ids.has(`dm.${name}`), name).toBe(true)
      expect(read('docs/api/media/dm.md')).toContain(`### dm.${name}\n`)
    }
    expect(ids.has('dm.ocrAuto')).toBe(false)
    expect(read('api-surface/coverage.json')).not.toContain('dm.ocrAuto')
    expect(() => getDmExample('ocrAuto')).toThrow(/Missing explicit DM example/)
    for (const path of ['docs/api/media/dm.md', 'docs/reference/dm/text.md',
      'docs/reference/dm/overview.md', 'docs/reference/dm/ocr-auto.md']) {
      expect(read(path), path).not.toContain('ocrAuto')
    }
    const migration = contentEntries.find(({ source }) => source === 'docs/reference/dm/ocr-auto.md')
    expect(migration?.title).toBe('独立 OCR 迁移指南')
    expect(migration?.jsonNames).toEqual(['ocrMigration'])
    for (const id of ['dm-java-facade-methods', 'dm-engine-script-methods']) {
      expect(dynamicOverrides.find((override) => override.id === id)?.excludeMembers).toContain('ocrAuto')
    }
  })

  test.each(pictureContracts)('%s documents the conventional eight arguments and natural result', (name, pictures, similarity, multiple) => {
    expect(manifest.symbols.filter(({ owner, name }) => owner === 'dm' && name.startsWith('findPic')))
      .toHaveLength(14)
    for (const path of ['docs/api/media/dm.md', 'docs/reference/dm/image.md']) {
      const section = read(path).split(`### dm.${name}\n`)[1]?.split(/\n### /)[0]
      expect(section, path).toBeDefined()
      expect(section).toContain(`dm.${name}(x1, y1, x2, y2, pictures, delta, similarity, direction)`)
      for (const [param, type] of [['x1', 'int'], ['y1', 'int'], ['x2', 'int'], ['y2', 'int'],
        ['pictures', pictures], ['delta', 'String'], ['similarity', similarity], ['direction', 'int']]) {
        expect(section).toContain(`| \`${param}\` | \`${type}\` | 是 |`)
      }
      expect(section).toContain(multiple
        ? '`DmMatch[]`；未命中或没有记录时为空数组。'
        : '`DmMatch`；未命中时为 `null`。')
      expect(section).toContain('`value` 是从 `0` 开始的模板编号')
      expect(section).toContain('`findPicS` 与 `findPicExS` 改为图片名')
      expect(section).toContain('`width/height` 是模板尺寸')
    }
  })

  test('documents both region overloads, defaults, and the actual similarity conversion', () => {
    const section = read('docs/api/media/image.md').split('## images.findImageInRegion')[1]?.split('## images.matchTemplate')[0]
    expect(section).toContain('options?: {')
    expect(section).toContain('width?: number')
    expect(section).toContain('height?: number')
    expect(section).toContain('threshold?: number')
    expect(section).toContain('org.opencv.core.Point | null')
    expect(section).toContain('`weakThreshold` | `0.6`')
    expect(section).toContain('`threshold` | `0.9`')
    expect(section).toContain('`level` | `-1`')
    expect(section).toContain('round(255 * (1 - similarity))')
    expect(section).toContain('不能与 `threshold` 同时设置')
    expect(section).toContain('0, 50, 400, 300, 0.8')
  })

  test('a later DM manifest import cannot regenerate the retired bridge', () => {
    const root = mkdtempSync(join(tmpdir(), 'dm-retired-contract-'))
    try {
      const scripts = join(root, 'MonkeyKing-Documentation', 'scripts')
      const manifestDir = join(root, 'MonkeyKing', 'docs', 'dm')
      mkdirSync(scripts, { recursive: true })
      mkdirSync(manifestDir, { recursive: true })
      for (const file of ['generate-dm-docs.mjs', 'dm-examples.mjs']) {
        copyFileSync(resolve('scripts', file), join(scripts, file))
      }
      const names = manifest.symbols.filter(({ owner, kind }) => owner === 'dm' && kind === 'function')
        .map(({ name }) => name)
      writeFileSync(join(manifestDir, 'api-manifest.json'), JSON.stringify(
        [...names, 'ocrAuto'].map((modern) => ({ modern, java: `int ${modern}()` })),
      ))
      const child = spawnSync(process.execPath, ['--input-type=module', '--eval', `
        import fs from 'node:fs'
        import { syncBuiltinESMExports } from 'node:module'
        fs.writeFileSync = (path, text) => {
          if (text.includes('ocrAuto')) throw new Error('Retired bridge restored: ' + path)
          process.stdout.write('checked-generated-document\\n')
        }
        syncBuiltinESMExports()
        await import(${JSON.stringify(pathToFileURL(join(scripts, 'generate-dm-docs.mjs')).href)})
      `], { encoding: 'utf8', timeout: 10_000 })
      expect(child.error).toBeUndefined()
      expect(child.status, child.stderr).toBe(0)
      expect(child.stdout).toContain('checked-generated-document')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
