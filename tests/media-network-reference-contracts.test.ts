import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { generateApiCoverageArtifacts } from '../scripts/api/coverage-generator'
import { buildMarkdownDocumentIndexes } from '../scripts/content/markdown-links'
import { inspectContentQuality } from '../scripts/content/quality'
import { checkJavaScriptExamples } from '../scripts/examples/check'
import type { ApiManifest } from '../scripts/api/model'

const scopeOwners = new Set([
  'images',
  'barcode',
  'qrcode',
  'canvas',
  'color',
  'colors',
  'color.result',
  'media',
  'mediainfo',
  'mediainfo.result',
  'recorder',
  'ocr',
  'ocr.mlkit',
  'ocr.paddle',
  'ocr.rapid',
  'http',
  'http.response',
  'http.response.body',
  'http.saveResult',
  'web',
  'webSocket',
  'webSocket.instance',
])

const scopePages = [
  'docs/api/media/barcode.md',
  'docs/api/media/canvas.md',
  'docs/api/media/color.md',
  'docs/api/media/image.md',
  'docs/api/media/media.md',
  'docs/api/media/mediainfo.md',
  'docs/api/media/ocr.md',
  'docs/api/media/qr-code.md',
  'docs/api/media/recorder.md',
  'docs/api/network/http.md',
  'docs/api/network/web.md',
  'docs/api/network/web-socket.md',
  'docs/api/types/color.md',
  'docs/api/types/image-wrapper.md',
  'docs/api/types/http-request-builder-options.md',
  'docs/api/types/http-request-headers.md',
  'docs/api/types/http-response.md',
  'docs/api/types/http-response-body.md',
  'docs/api/types/http-response-headers.md',
  'docs/api/types/okhttp3-http-url.md',
  'docs/api/types/okhttp3-request.md',
  'docs/api/types/ocr-options.md',
  'docs/api/types/opencv-point.md',
  'docs/api/types/opencv-rect.md',
  'docs/api/types/opencv-size.md',
  'docs/api/types/injectable-web-client.md',
  'docs/api/types/injectable-web-view.md',
] as const

function markdown(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

interface MemberContract {
  readonly id: string
  readonly version: string
  readonly example: string
  readonly source: string
}

interface MemberContractGroup {
  readonly ids: readonly string[]
  readonly version: string
  readonly examples: Readonly<Record<string, string>>
  readonly source: string
}

function extractMemberContracts(
  source: string,
  contents: string,
): MemberContract[] {
  const contracts: MemberContract[] = []
  const pattern =
    /<!-- api-member-contract id="([^"]+)" version="([^"]+)" -->\s*\n[^\n]*Rhino 2\.0 示例：[^\n]*\n\s*```js\s*\n([\s\S]*?)```/g
  for (const match of contents.matchAll(pattern)) {
    contracts.push({
      id: match[1],
      version: match[2],
      example: match[3].trim(),
      source,
    })
  }
  return contracts
}

function extractMemberContractGroups(
  source: string,
  contents: string,
): MemberContractGroup[] {
  const groups: MemberContractGroup[] = []
  const pattern =
    /<!-- api-member-contract-group ids="([^"]+)" version="([^"]+)" -->\s*\n\s*```json\s*\n([\s\S]*?)```/g
  for (const match of contents.matchAll(pattern)) {
    groups.push({
      ids: match[1].trim().split(/\s+/),
      version: match[2],
      examples: JSON.parse(match[3]) as Readonly<Record<string, string>>,
      source,
    })
  }
  return groups
}

describe('media, network, and related type reference contracts', () => {
  test('maps every scoped non-alias symbol once with a real VitePress anchor', async () => {
    const manifest = JSON.parse(
      markdown('api-surface/manifest.json'),
    ) as ApiManifest
    const scopedSymbols = manifest.symbols.filter(
      (symbol) =>
        symbol.public &&
        !symbol.canonicalId &&
        scopeOwners.has(symbol.owner),
    )
    const artifacts = await generateApiCoverageArtifacts({
      manifest,
      projectRoot: process.cwd(),
    })
    const scopedGaps = artifacts.gaps.filter((gap) =>
      scopeOwners.has(gap.owner),
    )
    expect(scopedGaps, scopedGaps.map((gap) => gap.symbolId).join('\n')).toEqual(
      [],
    )

    const scopedIds = new Set(scopedSymbols.map((symbol) => symbol.id))
    const rules = artifacts.coverage.rules.filter((rule) =>
      scopedIds.has(rule.patterns[0]),
    )
    expect(rules).toHaveLength(scopedSymbols.length)
    expect(new Set(rules.map((rule) => rule.patterns[0])).size).toBe(
      scopedSymbols.length,
    )
    expect(new Set(rules.map((rule) => rule.target)).size).toBe(rules.length)

    const sources = new Map<string, string>()
    for (const rule of rules) {
      const page = rule.target?.match(/^(docs\/.+\.md)#/)?.[1]
      expect(page, rule.id).toBeDefined()
      if (page && !sources.has(page)) sources.set(page, markdown(page))
    }
    const indexes = await buildMarkdownDocumentIndexes(
      [...sources].map(([id, source]) => ({ id, markdown: source })),
      process.cwd(),
    )
    for (const rule of rules) {
      const match = rule.target?.match(/^(docs\/.+\.md)#([^#]+)$/)
      expect(match, rule.id).not.toBeNull()
      if (!match) continue
      expect(indexes.get(match[1])?.anchors, rule.target).toContain(match[2])
    }
  })

  test('contains no placeholder or partial-list prose in scoped pages', () => {
    const sources = scopePages.map((source) => ({
      source,
      markdown: markdown(source),
    }))
    expect(inspectContentQuality(sources).issues).toEqual([])
    for (const source of sources) {
      expect(source.markdown, source.source).not.toMatch(
        /(?:此章节待补充或完善|仅列(?:举|出)(?:了)?(?:常用的)?部分)/,
      )
    }
  })

  test('gives every scoped public symbol its own versioned Rhino 2.0 example', () => {
    const manifest = JSON.parse(
      markdown('api-surface/manifest.json'),
    ) as ApiManifest
    const scopedSymbols = manifest.symbols.filter(
      (symbol) =>
        symbol.public &&
        !symbol.canonicalId &&
        scopeOwners.has(symbol.owner),
    )
    const contracts = scopePages.flatMap((source) => {
      const contents = markdown(source)
      return [
        ...extractMemberContracts(source, contents),
        ...extractMemberContractGroups(source, contents).flatMap((group) =>
          group.ids.map((id) => ({
            id,
            version: group.version,
            example: group.examples[id] ?? '',
            source: group.source,
          })),
        ),
      ]
    })
    const contractsById = new Map<string, MemberContract[]>()

    for (const contract of contracts) {
      const matches = contractsById.get(contract.id) ?? []
      matches.push(contract)
      contractsById.set(contract.id, matches)
    }

    expect(
      [...contractsById].filter(([, matches]) => matches.length !== 1),
    ).toEqual([])
    expect(new Set(contracts.map(({ id }) => id))).toEqual(
      new Set(scopedSymbols.map(({ id }) => id)),
    )

    for (const symbol of scopedSymbols) {
      const contract = contractsById.get(symbol.id)?.[0]
      expect(contract, symbol.id).toBeDefined()
      if (!contract) continue
      expect(contract.version, `${contract.source}: ${symbol.id}`).toBe('6.7.0')
      expect(contract.example, `${contract.source}: ${symbol.id}`).not.toBe('')
      expect(contract.example, `${contract.source}: ${symbol.id}`).not.toMatch(
        /(?:TODO|FIXME|PENDING|待补充|待完善|\.\.\.|xxx)/i,
      )
    }

    expect(checkJavaScriptExamples(process.cwd(), scopePages).errors).toEqual(
      [],
    )
  })

  test('preserves source-faithful null, color-comparison, and WebView overload contracts', () => {
    const ocr = markdown('docs/api/media/ocr.md')
    expect(ocr).toContain(
      'options.region` 缺省、`null` 或 `undefined` 时识别整张图',
    )
    expect(ocr).not.toContain('显式为 `null` 时返回空数组')

    const ocrOptions = markdown('docs/api/types/ocr-options.md')
    expect(ocrOptions).toContain(
      '属性省略、为 `null` 或为 `undefined` 时均识别整张图',
    )
    expect(ocrOptions).not.toContain('显式为 `null` 时返回空数组')

    const color = markdown('docs/api/media/color.md')
    expect(color).toContain('### isEqual(colorA, colorB, thresholdOrOptions?)')
    expect(color).toContain('公开实现与 `isSimilar` 使用同一颜色检测器')
    expect(color).not.toContain('### isEqual(colorA, colorB, alphaMatters?)')
    expect(color).not.toContain('是否考虑 `A (alpha)` 分量')

    const colorType = markdown('docs/api/types/color.md')
    expect(colorType).toContain('### isEqual(other, thresholdOrOptions?)')
    expect(colorType).toContain('静态 `colors.isEqual` 的实例转发')
    expect(colorType).not.toContain('### isEqual(other, alphaMatters?)')

    const web = markdown('docs/api/network/web.md')
    expect(web).toContain('### newInjectableWebView(context, url?)')
    expect(web).toContain('第一个参数是 Android `Context`，第二个参数是可选 URL')
    expect(web).not.toContain('通过 `activity` 参数可传入不同的 `org.mozilla.javascript.Context`')

    const colorOpening = color.slice(0, color.indexOf('<p style='))
    expect(colorOpening).not.toContain('... ...')
    const responseHeaders = markdown('docs/api/types/http-response-headers.md')
    expect(responseHeaders).not.toContain('... ...')
  })
})
