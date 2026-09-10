import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  API_COVERAGE_SCHEMA_VERSION,
  type ApiCoverage,
  type ApiManifest,
  type ApiSymbol,
  type CoverageRule,
} from './model'
import { markdownSlug } from './checker'

export interface GenerateApiCoverageOptions {
  readonly manifest: ApiManifest
  readonly projectRoot: string
  readonly ownerPages?: Readonly<Record<string, string>>
}

export interface ApiCoverageGap {
  readonly symbolId: string
  readonly owner: string
  readonly name: string
  readonly kind: ApiSymbol['kind']
  readonly source: ApiSymbol['source']
  readonly expectedPage?: string
  readonly reason: string
}

export interface ApiCoverageArtifacts {
  readonly coverage: ApiCoverage
  readonly gaps: readonly ApiCoverageGap[]
}

interface HeadingRecord {
  readonly level: number
  readonly text: string
  readonly anchor: string
}

export const defaultOwnerPages: Readonly<Record<string, string>> = Object.freeze({
  global: 'docs/api/core/global.md',
  species: 'docs/api/core/global.md',
  isNullish: 'docs/api/core/global.md',
  app: 'docs/api/core/app.md',
  monkeyking: 'docs/api/core/monkeyking.md',
  'monkeyking.version': 'docs/api/core/monkeyking.md',
  plugins: 'docs/api/core/plugins.md',
  auto: 'docs/api/automation/automator.md',
  automator: 'docs/api/automation/automator.md',
  rootAutomator: 'docs/api/automation/automator.md',
  'rootAutomator.instance': 'docs/api/automation/automator.md',
  selector: 'docs/api/automation/ui-selector.md',
  ui: 'docs/api/automation/ui.md',
  'ui.Widget': 'docs/api/automation/ui.md',
  dialogs: 'docs/api/automation/dialogs.md',
  floaty: 'docs/api/automation/floaty.md',
  keys: 'docs/api/automation/keys.md',
  console: 'docs/api/system/console.md',
  continuation: 'docs/api/system/continuation.md',
  device: 'docs/api/system/device.md',
  engines: 'docs/api/system/engines.md',
  events: 'docs/api/system/events.md',
  files: 'docs/api/system/files.md',
  notice: 'docs/api/system/notice.md',
  'notice.channel': 'docs/api/system/notice.md',
  sensors: 'docs/api/system/sensors.md',
  shell: 'docs/api/system/shell.md',
  shizuku: 'docs/api/system/shizuku.md',
  sqlite: 'docs/api/system/sqlite.md',
  'sqlite.cursor': 'docs/api/system/sqlite.md',
  'sqlite.database': 'docs/api/system/sqlite.md',
  storages: 'docs/api/system/storages.md',
  sysprops: 'docs/api/system/sysprops.md',
  tasks: 'docs/api/system/tasks.md',
  threads: 'docs/api/system/threads.md',
  'threads.volatileResult': 'docs/api/system/threads.md',
  timers: 'docs/api/system/timers.md',
  toast: 'docs/api/system/toast.md',
  barcode: 'docs/api/media/barcode.md',
  canvas: 'docs/api/media/canvas.md',
  color: 'docs/api/media/color.md',
  colors: 'docs/api/media/color.md',
  'color.result': 'docs/api/types/color.md',
  images: 'docs/api/media/image.md',
  media: 'docs/api/media/media.md',
  mediainfo: 'docs/api/media/mediainfo.md',
  'mediainfo.result': 'docs/api/media/mediainfo.md',
  ocr: 'docs/api/media/ocr.md',
  'ocr.mlkit': 'docs/api/media/ocr.md',
  'ocr.paddle': 'docs/api/media/ocr.md',
  'ocr.rapid': 'docs/api/media/ocr.md',
  qrcode: 'docs/api/media/qr-code.md',
  recorder: 'docs/api/media/recorder.md',
  http: 'docs/api/network/http.md',
  'http.response': 'docs/api/types/http-response.md',
  'http.response.body': 'docs/api/types/http-response-body.md',
  'http.saveResult': 'docs/api/types/http-response.md',
  web: 'docs/api/network/web.md',
  webSocket: 'docs/api/network/web-socket.md',
  'webSocket.instance': 'docs/api/network/web-socket.md',
  Arrayx: 'docs/api/utilities/arrayx.md',
  Mathx: 'docs/api/utilities/mathx.md',
  Numberx: 'docs/api/utilities/numberx.md',
  base64: 'docs/api/utilities/base64.md',
  crypto: 'docs/api/utilities/crypto.md',
  cvt: 'docs/api/utilities/converter.md',
  'cvt.bytes': 'docs/api/utilities/converter.md',
  fmt: 'docs/api/utilities/formatter.md',
  'fmt.bytes': 'docs/api/utilities/formatter.md',
  jsox: 'docs/api/utilities/jsox.md',
  mime: 'docs/api/utilities/mime.md',
  'mime.result': 'docs/api/utilities/mime.md',
  nanoid: 'docs/api/utilities/nanoid.md',
  opencc: 'docs/api/utilities/opencc.md',
  pinyin: 'docs/api/utilities/pinyin.md',
  'pinyin.result': 'docs/api/utilities/pinyin.md',
  pinyin4j: 'docs/api/utilities/pinyin4j.md',
  s13n: 'docs/api/utilities/s13n.md',
  util: 'docs/api/utilities/util.md',
  'util.inspect': 'docs/api/utilities/util.md',
  'util.java': 'docs/api/utilities/util.md',
  'util.morseCode': 'docs/api/utilities/util.md',
  'util.morseCode.result': 'docs/api/utilities/util.md',
  'util.version': 'docs/api/utilities/util.md',
  'util.versionCodes': 'docs/api/utilities/util.md',
  'util.versionCodes.result': 'docs/api/utilities/util.md',
  zip: 'docs/api/utilities/zip.md',
  'zip.result': 'docs/api/utilities/zip.md',
})

function compareText(left: string, right: string): number {
  return left.localeCompare(right, 'en')
}

function parseHeadings(markdown: string): HeadingRecord[] {
  const headings: HeadingRecord[] = []
  const duplicateCounts = new Map<string, number>()
  const pattern = /^(#{1,6})\s+(.+?)\s*#*\s*$/gm
  let match: RegExpExecArray | null

  while ((match = pattern.exec(markdown)) !== null) {
    const rawText = match[2]
    const explicit = rawText.match(/\s*\{#([^}]+)\}\s*$/)
    const text = explicit ? rawText.slice(0, explicit.index).trim() : rawText
    const base = explicit?.[1] ?? markdownSlug(text)
    if (!base) continue
    const count = duplicateCounts.get(base) ?? 0
    const anchor = explicit ? base : count === 0 ? base : `${base}-${count}`
    duplicateCounts.set(base, count + 1)
    headings.push({ level: match[1].length, text, anchor })
  }
  return headings
}

function normalizedHeading(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^\[[^\]]+\]\s*/, '')
    .replaceAll('\\', '')
    .trim()
}

function headingMatchRank(
  heading: HeadingRecord,
  symbol: ApiSymbol,
): number | undefined {
  if (heading.level === 1) return undefined
  const text = normalizedHeading(heading.text)
  const escapedName = symbol.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const member = new RegExp(
    `(?:^|[A-Za-z_$][A-Za-z0-9_$]*\\.)${escapedName}(?=\\s*(?:\\(|\\[|$))`,
    'i',
  )
  if (!member.test(text)) return undefined

  const exactName = text.localeCompare(symbol.name, 'en', {
    sensitivity: 'accent',
  }) === 0
  const callable = new RegExp(
    `(?:^|[A-Za-z_$][A-Za-z0-9_$]*\\.)${escapedName}\\s*\\(`,
    'i',
  ).test(text)

  if (symbol.kind === 'module') {
    return exactName && heading.level === 2 ? 0 : undefined
  }
  if (symbol.kind === 'callable') return callable ? heading.level : undefined
  if (symbol.kind === 'constructor') {
    const constructorMarker =
      /^\[c\]/i.test(heading.text.trim()) || /^new\s+/i.test(text)
    return constructorMarker || callable ? heading.level : undefined
  }
  return heading.level
}

function pageForOwner(
  owner: string,
  ownerPages: Readonly<Record<string, string>>,
): string | undefined {
  let candidate = owner
  while (candidate) {
    const page = ownerPages[candidate]
    if (page) return page
    const separator = candidate.lastIndexOf('.')
    if (separator < 0) return undefined
    candidate = candidate.slice(0, separator)
  }
  return undefined
}

function pageForSymbol(
  symbol: ApiSymbol,
  ownerPages: Readonly<Record<string, string>>,
): string | undefined {
  if (symbol.owner !== 'global') return pageForOwner(symbol.owner, ownerPages)
  if (symbol.source.path.endsWith('/core/accessibility/UiSelector.kt')) {
    return 'docs/api/automation/ui-selector.md'
  }
  const augmentablePage = [
    ['/augment/console/', 'docs/api/system/console.md'],
    ['/augment/shell/', 'docs/api/system/shell.md'],
    ['/augment/timers/', 'docs/api/system/timers.md'],
  ] as const
  for (const [sourceSegment, page] of augmentablePage) {
    if (symbol.source.path.includes(sourceSegment)) return page
  }
  if (['global:Module', 'global:Promise', 'global:require'].includes(symbol.id)) {
    return 'docs/api/core/modules.md'
  }
  if (symbol.kind === 'class') {
    return 'docs/reference/android/scripting-java.md'
  }
  return pageForOwner(symbol.owner, ownerPages)
}

function isExternalSymbol(symbol: ApiSymbol): boolean {
  return (
    symbol.kind === 'engine-global' ||
    (symbol.kind === 'class' && symbol.owner === 'global') ||
    (symbol.kind === 'dynamic' &&
      /(?:delegated|forwarded|public-methods)/i.test(symbol.id))
  )
}

function gap(
  symbol: ApiSymbol,
  reason: string,
  expectedPage?: string,
): ApiCoverageGap {
  return {
    symbolId: symbol.id,
    owner: symbol.owner,
    name: symbol.name,
    kind: symbol.kind,
    source: symbol.source,
    ...(expectedPage ? { expectedPage } : {}),
    reason,
  }
}

export function generateApiCoverageArtifacts(
  options: GenerateApiCoverageOptions,
): ApiCoverageArtifacts {
  const ownerPages = options.ownerPages ?? defaultOwnerPages
  const headingCache = new Map<string, readonly HeadingRecord[]>()
  const claimedTargets = new Map<string, string>()
  const publicSymbols = options.manifest.symbols
    .filter((symbol) => symbol.public)
    .sort((left, right) => compareText(left.id, right.id))
  const rules: CoverageRule[] = []
  const gaps: ApiCoverageGap[] = []
  const mappedCanonicalIds = new Set<string>()

  for (const symbol of publicSymbols.filter((candidate) => !candidate.canonicalId)) {
    const page = pageForSymbol(symbol, ownerPages)
    if (!page) {
      gaps.push(
        gap(
          symbol,
          `No canonical documentation page is registered for owner ${symbol.owner}.`,
        ),
      )
      continue
    }

    const absolutePage = resolve(options.projectRoot, page)
    if (!existsSync(absolutePage)) {
      gaps.push(
        gap(symbol, `The canonical documentation page ${page} is not present.`, page),
      )
      continue
    }

    let headings = headingCache.get(page)
    if (!headings) {
      headings = parseHeadings(readFileSync(absolutePage, 'utf8'))
      headingCache.set(page, headings)
    }
    const matches = headings
      .map((heading) => ({ heading, rank: headingMatchRank(heading, symbol) }))
      .filter(
        (
          candidate,
        ): candidate is { readonly heading: HeadingRecord; readonly rank: number } =>
          candidate.rank !== undefined,
      )
    const bestRank = Math.min(...matches.map(({ rank }) => rank))
    const sectionMatches = matches.filter(({ rank }) => rank === bestRank)
    if (sectionMatches.length !== 1) {
      gaps.push(
        gap(
          symbol,
          sectionMatches.length === 0
            ? `No addressable member section exists for ${symbol.id} in ${page}.`
            : `More than one equally specific member section matches ${symbol.id} in ${page}.`,
          page,
        ),
      )
      continue
    }

    const target = `${page}#${sectionMatches[0].heading.anchor}`
    const claimedBy = claimedTargets.get(target)
    if (claimedBy) {
      gaps.push(
        gap(
          symbol,
          `${target} is already assigned to ${claimedBy}; distinct symbols need distinct anchors.`,
          page,
        ),
      )
      continue
    }
    claimedTargets.set(target, symbol.id)
    mappedCanonicalIds.add(symbol.id)
    rules.push({
      id: `coverage:${symbol.id}`,
      patterns: [symbol.id],
      status: isExternalSymbol(symbol) ? 'external' : 'documented',
      target,
    })
  }

  for (const symbol of publicSymbols.filter((candidate) => candidate.canonicalId)) {
    if (symbol.canonicalId && mappedCanonicalIds.has(symbol.canonicalId)) {
      rules.push({
        id: `coverage:${symbol.id}`,
        patterns: [symbol.id],
        status: 'alias',
      })
      continue
    }
    gaps.push(
      gap(
        symbol,
        `Canonical symbol ${symbol.canonicalId ?? '(missing)'} has no documented target.`,
      ),
    )
  }

  rules.sort((left, right) => compareText(left.patterns[0], right.patterns[0]))
  gaps.sort((left, right) => compareText(left.symbolId, right.symbolId))

  return {
    coverage: {
      schemaVersion: API_COVERAGE_SCHEMA_VERSION,
      sourceRef: options.manifest.source.commit,
      rules,
    },
    gaps,
  }
}

export function generateApiCoverage(
  options: GenerateApiCoverageOptions,
): ApiCoverage {
  return generateApiCoverageArtifacts(options).coverage
}
