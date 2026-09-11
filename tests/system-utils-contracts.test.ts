import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  apiSymbolAnchorId,
  defaultOwnerPages,
  generateApiCoverageArtifacts,
} from '../scripts/api/coverage-generator'
import type { ApiManifest, ApiSymbol } from '../scripts/api/model'
import { findPlaceholderIssues } from '../scripts/content/quality'

interface SymbolFixture {
  readonly sourceCommit: string
  readonly canonical: readonly string[]
  readonly aliases: readonly string[]
}

const FIXED_SOURCE_COMMIT = 'bafa2986212d27b6b59f1324f89548b72a810966'

const scopedOwners = new Set([
  'console',
  'continuation',
  'device',
  'engines',
  'events',
  'files',
  'notice',
  'notice.channel',
  'sensors',
  'shell',
  'shizuku',
  'sqlite',
  'sqlite.cursor',
  'sqlite.database',
  'storages',
  'storages.result',
  'sysprops',
  'tasks',
  'threads',
  'threads.volatileResult',
  'timers',
  'toast',
  'Arrayx',
  'Mathx',
  'Numberx',
  'base64',
  'crypto',
  'cvt',
  'cvt.bytes',
  'fmt',
  'fmt.bytes',
  'jsox',
  'mime',
  'mime.result',
  'nanoid',
  'opencc',
  'pinyin',
  'pinyin.result',
  'pinyin4j',
  's13n',
  'util',
  'util.inspect',
  'util.java',
  'util.morseCode',
  'util.morseCode.result',
  'util.version',
  'util.versionCodes',
  'util.versionCodes.result',
  'zip',
  'zip.result',
])

const scopedSpecialOwners = new Set(['species', 'isNullish'])

const moduleGlobalIds = new Set([
  'global:Module',
  'global:Promise',
  'global:require',
  'global:ResultAdapter',
])

const scopedPages = [
  'docs/api/core/global.md',
  'docs/api/types/data-types.md',
  'docs/api/types/omni-types.md',
  'docs/api/types/storage.md',
  ...Object.values(defaultOwnerPages).filter(
    (page) =>
      page.startsWith('docs/api/system/') ||
      page.startsWith('docs/api/utilities/'),
  ),
].filter((page, index, pages) => pages.indexOf(page) === index)

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf8')) as T
}

function markdown(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

function pageForOwner(owner: string): string | undefined {
  let candidate = owner
  while (candidate) {
    const page = defaultOwnerPages[candidate]
    if (page) return page
    const separator = candidate.lastIndexOf('.')
    if (separator < 0) return undefined
    candidate = candidate.slice(0, separator)
  }
  return undefined
}

function expectedPage(symbol: ApiSymbol): string | undefined {
  if (moduleGlobalIds.has(symbol.id)) return 'docs/api/core/modules.md'
  if (symbol.owner !== 'global') return pageForOwner(symbol.owner)
  if (symbol.kind === 'class') return 'docs/api/core/global.md'
  if (symbol.source.path.includes('/augment/console/')) {
    return 'docs/api/system/console.md'
  }
  if (symbol.source.path.includes('/augment/shell/')) {
    return 'docs/api/system/shell.md'
  }
  if (symbol.source.path.includes('/augment/timers/')) {
    return 'docs/api/system/timers.md'
  }
  return 'docs/api/core/global.md'
}

function isScopedSymbol(
  symbol: ApiSymbol,
  symbolsById: ReadonlyMap<string, ApiSymbol>,
): boolean {
  if (!symbol.public) return false
  if (moduleGlobalIds.has(symbol.id)) return false
  if (scopedOwners.has(symbol.owner)) return true
  if (scopedSpecialOwners.has(symbol.owner)) return true
  if (symbol.owner !== 'global') return false
  if (symbol.kind === 'class' || symbol.kind === 'engine-global') return true
  if (symbol.id === 'global:i18n') return true
  if (/\/augment\/(console|shell|timers)\//.test(symbol.source.path)) return true
  if (symbol.source.path.endsWith('/augment/global/Global.kt')) return true
  const canonical = symbol.canonicalId
    ? symbolsById.get(symbol.canonicalId)
    : undefined
  return Boolean(
    canonical &&
      (scopedOwners.has(canonical.owner) ||
        (canonical.owner === 'global' &&
          canonical.source.path.endsWith('/augment/global/Global.kt'))),
  )
}

function contractRow(markdownSource: string, anchor: string): readonly string[] {
  const line = markdownSource
    .split('\n')
    .find((candidate) => candidate.includes(`id="${anchor}"`))
  if (!line?.startsWith('|')) return []
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim())
}

describe('Monkey King 6.7.0 system and utilities source contracts', () => {
  const manifest = readJson<ApiManifest>('api-surface/manifest.json')
  const remediationFixture = readJson<SymbolFixture>(
    'tests/fixtures/api/system-utils-gap-ids.json',
  )
  const symbolFixture = readJson<SymbolFixture>(
    'tests/fixtures/api/system-utils-symbol-ids.json',
  )
  const symbolsById = new Map(
    manifest.symbols.map((symbol) => [symbol.id, symbol]),
  )
  const scopedSymbols = manifest.symbols.filter((symbol) =>
    isScopedSymbol(symbol, symbolsById),
  )

  test('freezes the exact fixed-source remediation scope', () => {
    expect(manifest.source.commit).toBe(FIXED_SOURCE_COMMIT)
    expect(remediationFixture.sourceCommit).toBe(FIXED_SOURCE_COMMIT)
    expect(remediationFixture.canonical).toHaveLength(638)
    expect(remediationFixture.aliases).toHaveLength(9)
    expect(symbolFixture.sourceCommit).toBe(FIXED_SOURCE_COMMIT)
    expect(symbolFixture.canonical).toHaveLength(3638)
    expect(symbolFixture.aliases).toHaveLength(44)
    for (const symbolId of moduleGlobalIds) {
      expect(symbolFixture.canonical, symbolId).not.toContain(symbolId)
      expect(remediationFixture.canonical, symbolId).not.toContain(symbolId)
    }

    const fixtureIds = [
      ...remediationFixture.canonical,
      ...remediationFixture.aliases,
    ]
    expect(new Set(fixtureIds).size).toBe(fixtureIds.length)
    for (const symbolId of fixtureIds) {
      const symbol = symbolsById.get(symbolId)
      expect(symbol, symbolId).toBeDefined()
      expect(symbol && isScopedSymbol(symbol, symbolsById), symbolId).toBe(true)
    }

    expect(symbolFixture.canonical).toEqual(
      scopedSymbols
        .filter((symbol) => !symbol.canonicalId)
        .map((symbol) => symbol.id)
        .sort(),
    )
    expect(symbolFixture.aliases).toEqual(
      scopedSymbols
        .filter((symbol) => symbol.canonicalId)
        .map((symbol) => symbol.id)
        .sort(),
    )
  })

  test('contains no placeholder prose in any scoped page', () => {
    const issues = scopedPages.flatMap((page) =>
      findPlaceholderIssues(markdown(page), page),
    )
    expect(issues).toEqual([])
  })

  test('maps every scoped public symbol once and only aliases mapped canonicals', async () => {
    const artifacts = await generateApiCoverageArtifacts({
      manifest,
      projectRoot: process.cwd(),
    })
    const scopedIds = new Set(scopedSymbols.map((symbol) => symbol.id))
    const scopedGaps = artifacts.gaps
      .filter((gap) => scopedIds.has(gap.symbolId))
      .map((gap) => `${gap.symbolId}: ${gap.reason}`)
    expect(scopedGaps).toEqual([])

    const rulesById = new Map(
      artifacts.coverage.rules.map((rule) => [rule.patterns[0], rule]),
    )
    const canonicalTargets = new Set<string>()

    for (const symbol of scopedSymbols) {
      const rule = rulesById.get(symbol.id)
      expect(rule, symbol.id).toBeDefined()
      if (!rule) continue

      if (symbol.canonicalId) {
        expect(rule.status, symbol.id).toBe('alias')
        expect(rulesById.has(symbol.canonicalId), symbol.id).toBe(true)
        continue
      }

      expect(rule.target, symbol.id).toBeDefined()
      expect(canonicalTargets.has(rule.target!), symbol.id).toBe(false)
      canonicalTargets.add(rule.target!)

      if (
        symbol.owner === 'global' &&
        (symbol.kind === 'class' || symbol.kind === 'engine-global')
      ) {
        if (moduleGlobalIds.has(symbol.id)) {
          expect(rule.target, symbol.id).toMatch(/^docs\/api\/core\/modules\.md#/)
        } else {
          expect(rule.target, symbol.id).toMatch(/^docs\/api\/core\/global\.md#/)
        }
      }
    }

    for (const symbolId of moduleGlobalIds) {
      const rule = rulesById.get(symbolId)
      expect(rule, symbolId).toBeDefined()
      expect(rule?.target, symbolId).toMatch(/^docs\/api\/core\/modules\.md#/)
    }

    const structuredCloneRule = rulesById.get('global:structuredClone')
    expect(structuredCloneRule?.target).toMatch(
      /^docs\/api\/core\/global\.md#/,
    )
  })

  test('backs every remediated canonical API with a structured source-contract row', () => {
    const pageSources = new Map<string, string>()

    for (const symbolId of symbolFixture.canonical) {
      const symbol = symbolsById.get(symbolId)
      expect(symbol, symbolId).toBeDefined()
      if (!symbol) continue

      const page = expectedPage(symbol)
      expect(page, symbolId).toBeDefined()
      if (!page) continue

      const source = pageSources.get(page) ?? markdown(page)
      pageSources.set(page, source)
      const anchor = apiSymbolAnchorId(symbol.id)
      const rows = source
        .split('\n')
        .filter((line) => line.includes(`id="${anchor}"`))

      expect(rows, symbol.id).toHaveLength(1)
      const cells = contractRow(source, anchor)
      expect(cells, symbol.id).toHaveLength(8)
      expect(cells[0], symbol.id).toContain(`${symbol.id}`)
      expect(cells[1], symbol.id).not.toBe('')
      expect(cells[2], symbol.id).toMatch(/参数|无参数|入口|属性/)
      expect(cells[3], symbol.id).toMatch(/返回|异常|类对象|委托/)
      expect(cells[4], symbol.id).toMatch(/权限|线程/)
      expect(cells[5], symbol.id).toMatch(/生命周期|副作用/)
      expect(cells[6], symbol.id).toMatch(/(?:≤\s*)?v\d+\.\d+\.\d+/)
      expect(cells[7], symbol.id).toContain('Rhino 2.0')
      expect(cells[7], symbol.id).toMatch(/console\.log\(/)
    }

    for (const [page, source] of pageSources) {
      expect(source, page).toContain('固定源码合同表')
      expect(source, page).toContain('Rhino 2.0')
      expect(source, page).toMatch(/```js[\s\S]+?```/)
    }
  }, 15_000)

  test('documents the three type reference pages as runtime-facing contracts', () => {
    const dataTypes = markdown('docs/api/types/data-types.md')
    const omniTypes = markdown('docs/api/types/omni-types.md')
    const storage = markdown('docs/api/types/storage.md')

    for (const [page, source] of [
      ['data-types', dataTypes],
      ['omni-types', omniTypes],
      ['storage', storage],
    ] as const) {
      expect(source, page).toContain('Rhino 2.0')
      expect(source, page).toMatch(/(?:≤\s*)?v\d+\.\d+\.\d+/)
      expect(source, page).toMatch(/参数|类型/)
      expect(source, page).toMatch(/返回|值/)
      expect(source, page).toMatch(/异常/)
      expect(source, page).toMatch(/生命周期/)
      expect(source, page).toMatch(/副作用/)
    }

    for (const member of [
      'storage.name',
      'storage.size',
      'storage.putSync(',
      'storage.removeSync(',
      'storage.clearSync(',
      'storage.selfRemove(',
      'storage.selfRemoveSync(',
    ]) {
      expect(storage).toContain(member)
    }
  })

  test('documents getMacAddress fallback semantics instead of requiring WLAN connectivity', () => {
    const source = markdown('docs/api/system/device.md')

    expect(source).toContain('回退到 `wlan0` 网络接口和 `/sys/class/net/wlan0/address`')
    expect(source).toContain('权限、接口或系统策略不允许读取时返回 `null`')
    expect(source).toContain('不要用此方法判断当前是否已连接 WLAN')
    expect(source).not.toContain('需要在有WLAN连接的情况下才能获取')
    expect(source).not.toContain('未来可能增加有root权限')
  })

  test('documents nullable device identifiers from the fixed source', () => {
    const source = markdown('docs/api/system/device.md')

    expect(source).toContain('## device.getIMEI()')
    expect(source).toContain('## device.getSerial()')
    expect(source).toContain('## device.imei')
    expect(source).toContain('## device.serial')
    expect(source).toContain('返回设备的 IMEI。Android 系统限制、缺少电话状态权限或设备不提供 IMEI 时返回 `null`')
    expect(source).toContain('返回设备的硬件序列号。Android 版本、系统权限或厂商策略不允许读取时返回 `null`')
    expect(source).toContain('该字段在模块初始化时读取')
    expect(source).toContain('* {string|null}')
  })

  test('documents current shell overloads and interactive wait support', () => {
    const source = markdown('docs/api/system/shell.md')

    expect(source).toContain('## shell(cmd[, options][, withRoot])')
    expect(source).toContain('数组元素会按换行拼接后在同一 shell 进程中执行')
    expect(source).toContain('参数对象中的 `root` 和 `exit` 是 Monkey King 选项')
    expect(source).toContain('## Shell.execAndWaitFor(cmd)')
    expect(source).toContain('## Shell.isInitialized()')
    expect(source).toContain('onInitialized()')
    expect(source).toContain('onInterrupted(error)')
    expect(source).not.toContain('如果后续能找到解决方案')
  })
})
