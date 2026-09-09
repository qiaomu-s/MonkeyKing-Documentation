import { posix } from 'node:path'
import { createMarkdownRenderer } from 'vitepress'
import { contentEntries } from './catalog'
import type { ContentEntry } from './catalog'
import { resolveFragmentOverride } from './fragment-overrides'

export type HeadingIndex = ReadonlyMap<string, readonly string[]>

export interface HeadingSource {
  readonly entry: ContentEntry
  readonly markdown: string
}

export interface CatalogLinkOptions {
  readonly entries?: readonly ContentEntry[]
  readonly headingIndex?: HeadingIndex
}

export interface MarkdownLinkContext extends CatalogLinkOptions {
  readonly current: ContentEntry
}

export interface LinkRewriteReport {
  readonly exactFragments: number
  readonly automaticFragments: number
  readonly overrides: number
  readonly unlinked: number
}

interface MutableLinkRewriteReport {
  exactFragments: number
  automaticFragments: number
  overrides: number
  unlinked: number
}

interface ParsedTarget {
  readonly kind: 'external' | 'catalog' | 'unknown'
  readonly original: string
  readonly entry?: ContentEntry
  readonly targetLegacyStem?: string
  readonly fragment?: string
}

interface ResolvedLink {
  readonly kind: 'link' | 'unlink'
  readonly target?: string
  readonly label?: string
  readonly resolution?: 'exact' | 'automatic' | 'override' | 'none'
}

export class UnresolvedFragmentError extends Error {
  constructor(entry: ContentEntry, fragment: string) {
    super(`Unresolved fragment "${fragment}" for ${entry.legacySource}`)
    this.name = 'UnresolvedFragmentError'
  }
}

export class AmbiguousFragmentError extends Error {
  constructor(entry: ContentEntry, fragment: string, candidates: readonly string[]) {
    super(
      `Ambiguous fragment "${fragment}" for ${entry.legacySource}: ${candidates.join(', ')}`,
    )
    this.name = 'AmbiguousFragmentError'
  }
}

const legacyStemAliases: Readonly<Record<string, string>> = Object.freeze({
  images: 'image',
  monkeyking: 'autojs',
})

const fragmentFallbacks: Readonly<Record<string, string>> = Object.freeze({
  waitcondition: 'wait-condition',
})

function safelyDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function legacyStemFor(entry: ContentEntry): string {
  return posix.basename(entry.legacySource, '.md')
}

function normalizeLegacyStem(value: string): string {
  const basename = posix.basename(
    safelyDecode(value)
      .replace(/^\/+/, '')
      .replace(/^api\//i, '')
      .replace(/[?#].*$/, ''),
  )
  const stem = basename.replace(/\.(?:md|html)$/i, '')
  return legacyStemAliases[stem.toLowerCase()] ?? stem
}

function entryByLegacyStem(
  stem: string,
  entries: readonly ContentEntry[],
): ContentEntry | undefined {
  const normalizedStem = normalizeLegacyStem(stem).toLowerCase()
  return entries.find(
    (entry) => legacyStemFor(entry).toLowerCase() === normalizedStem,
  )
}

function entryById(
  id: string,
  entries: readonly ContentEntry[],
): ContentEntry | undefined {
  return entries.find((entry) => entry.id === id)
}

function docsifyTarget(rawTarget: string): string | undefined {
  let url: URL
  try {
    url = new URL(rawTarget)
  } catch {
    return undefined
  }

  if (!['docs.autojs6.com', 'docs.monkeyking.com'].includes(url.hostname)) {
    return undefined
  }

  const hash = url.hash.replace(/^#\/?/, '')
  if (!hash) {
    return undefined
  }

  const [page, query = ''] = hash.split('?')
  const fragment = new URLSearchParams(query).get('id')
  return page + (fragment ? `#${fragment}` : '')
}

function splitTarget(rawTarget: string): {
  readonly path: string
  readonly fragment?: string
} {
  const hashIndex = rawTarget.indexOf('#')
  if (hashIndex < 0) {
    return { path: rawTarget }
  }

  return {
    path: rawTarget.slice(0, hashIndex),
    fragment: rawTarget.slice(hashIndex + 1) || undefined,
  }
}

function parseCatalogTarget(
  rawTarget: string,
  current: ContentEntry,
  entries: readonly ContentEntry[],
): ParsedTarget {
  const trimmed = rawTarget.trim().replace(/^<(.*)>$/, '$1')
  const docsify = docsifyTarget(trimmed)
  if (docsify) {
    return parseCatalogTarget(docsify, current, entries)
  }

  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(trimmed)) {
    return { kind: 'external', original: rawTarget }
  }

  const { path, fragment } = splitTarget(trimmed)
  if (path === '') {
    return {
      kind: 'catalog',
      original: rawTarget,
      entry: current,
      targetLegacyStem: legacyStemFor(current),
      fragment,
    }
  }

  const canonicalPath = posix.normalize(posix.join(posix.dirname(current.source), path))
  const canonicalEntry = entries.find(
    (entry) =>
      entry.source === canonicalPath ||
      entry.route === path ||
      entry.route.replace(/^\//, '') === path.replace(/^\//, ''),
  )
  if (canonicalEntry) {
    return {
      kind: 'catalog',
      original: rawTarget,
      entry: canonicalEntry,
      targetLegacyStem: legacyStemFor(canonicalEntry),
      fragment,
    }
  }

  const targetLegacyStem = normalizeLegacyStem(path)
  const legacyEntry = entryByLegacyStem(targetLegacyStem, entries)
  if (legacyEntry) {
    return {
      kind: 'catalog',
      original: rawTarget,
      entry: legacyEntry,
      targetLegacyStem,
      fragment,
    }
  }

  if (/\.(?:png|jpe?g|gif|svg|webp|avif)$/i.test(path)) {
    return { kind: 'external', original: rawTarget }
  }

  return {
    kind: 'unknown',
    original: rawTarget,
    targetLegacyStem,
    fragment,
  }
}

function comparableFragment(value: string): string {
  return safelyDecode(value)
    .normalize('NFKC')
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu)
    ?.join('') ?? ''
}

function fragmentWithoutLegacyPrefix(
  fragment: string,
  targetLegacyStem: string,
): string {
  const decoded = safelyDecode(fragment)
  const escapedStem = targetLegacyStem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return decoded.replace(new RegExp(`^${escapedStem}[_-]`, 'i'), '')
}

function fragmentKeys(
  value: string,
  targetLegacyStem: string,
  removeMemberMarker: boolean,
): readonly string[] {
  const decoded = safelyDecode(value)
  const withoutPagePrefix = fragmentWithoutLegacyPrefix(
    decoded,
    targetLegacyStem,
  )
  const values = new Set([decoded, withoutPagePrefix])

  if (removeMemberMarker && /^[a-z]+[-_]/i.test(withoutPagePrefix)) {
    const [marker, ...rest] = withoutPagePrefix.split(/[-_]/)
    if (['m', 'p', 'c', 'i', 'e', 'o'].includes(marker.toLowerCase())) {
      values.add(rest.join('-'))
    }
  }

  return [...values].map(comparableFragment).filter(Boolean)
}

function headingKeys(
  heading: string,
  targetLegacyStem: string,
): readonly string[] {
  const keys = new Set([comparableFragment(heading)])
  const decoded = safelyDecode(heading)
  const stemVariants = new Set([
    targetLegacyStem,
    targetLegacyStem.endsWith('s')
      ? targetLegacyStem.slice(0, -1)
      : `${targetLegacyStem}s`,
  ])

  for (const stem of stemVariants) {
    const escapedStem = stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const withoutPrefix = decoded.replace(
      new RegExp(`^${escapedStem}[-_]`, 'i'),
      '',
    )
    keys.add(comparableFragment(withoutPrefix))
  }

  return [...keys].filter(Boolean)
}

function resolveFragment(
  entry: ContentEntry,
  targetLegacyStem: string,
  fragment: string,
  label: string,
  headingIndex: HeadingIndex | undefined,
): { readonly fragment: string; readonly resolution: 'exact' | 'automatic' } {
  const decoded = safelyDecode(fragment)
  if (!headingIndex) {
    return {
      fragment: fragmentFallbacks[decoded.toLowerCase()] ?? decoded,
      resolution:
        fragmentFallbacks[decoded.toLowerCase()] === undefined
          ? 'exact'
          : 'automatic',
    }
  }

  const headings = headingIndex.get(entry.id) ?? []
  if (headings.includes(decoded)) {
    return { fragment: decoded, resolution: 'exact' }
  }

  const lowerExact = headings.filter(
    (candidate) => candidate.toLowerCase() === decoded.toLowerCase(),
  )
  if (lowerExact.length === 1) {
    return { fragment: lowerExact[0], resolution: 'automatic' }
  }

  const sourceKeys = new Set([
    ...fragmentKeys(decoded, targetLegacyStem, true),
    ...fragmentKeys(label, targetLegacyStem, false),
  ])
  const candidates = headings.filter(
    (candidate) =>
      headingKeys(candidate, targetLegacyStem).some((key) =>
        sourceKeys.has(key),
      ),
  )

  if (candidates.length === 1) {
    return { fragment: candidates[0], resolution: 'automatic' }
  }
  if (candidates.length > 1) {
    throw new AmbiguousFragmentError(entry, fragment, candidates)
  }
  throw new UnresolvedFragmentError(entry, fragment)
}

function relativeCatalogTarget(
  current: ContentEntry,
  target: ContentEntry,
  fragment: string | undefined,
): string {
  if (current.id === target.id && fragment) {
    return `#${fragment}`
  }

  const relativePath = posix.relative(posix.dirname(current.source), target.source)
  return relativePath + (fragment ? `#${fragment}` : '')
}

function resolveLink(
  rawTarget: string,
  label: string,
  lineContext: string,
  context: MarkdownLinkContext,
): ResolvedLink {
  const entries = context.entries ?? contentEntries
  const parsed = parseCatalogTarget(rawTarget, context.current, entries)

  if (parsed.kind === 'external') {
    return { kind: 'link', target: rawTarget, resolution: 'none' }
  }

  const targetLegacyStem =
    parsed.targetLegacyStem ??
    (parsed.entry ? legacyStemFor(parsed.entry) : '')
  const override = resolveFragmentOverride({
    currentLegacySource: context.current.legacySource,
    targetLegacyStem,
    fragment: parsed.fragment,
    label,
    context: lineContext,
  })

  if (override?.kind === 'unlink') {
    return { kind: 'unlink', label: override.label ?? label, resolution: 'override' }
  }

  const targetEntry = override?.targetEntryId
    ? entryById(override.targetEntryId, entries)
    : parsed.entry
  if (!targetEntry) {
    throw new Error(`Unknown legacy Markdown target "${rawTarget}" from ${context.current.legacySource}`)
  }

  if (override?.kind === 'link') {
    return {
      kind: 'link',
      target: relativeCatalogTarget(
        context.current,
        targetEntry,
        override.fragment,
      ),
      label: override.label ?? label,
      resolution: 'override',
    }
  }

  const resolvedFragment = parsed.fragment
    ? resolveFragment(
        targetEntry,
        targetLegacyStem,
        parsed.fragment,
        label,
        context.headingIndex,
      )
    : undefined

  return {
    kind: 'link',
    target: relativeCatalogTarget(
      context.current,
      targetEntry,
      resolvedFragment?.fragment,
    ),
    label,
    resolution: resolvedFragment?.resolution ?? 'none',
  }
}

export function resolveCatalogLink(
  rawTarget: string,
  current: ContentEntry,
  options: CatalogLinkOptions = {},
): string {
  const resolved = resolveLink(rawTarget, '', '', { current, ...options })
  if (resolved.kind === 'unlink' || !resolved.target) {
    throw new Error(`Target "${rawTarget}" is explicitly unlinked`)
  }
  return resolved.target
}

function inlineCodeRanges(line: string): readonly (readonly [number, number])[] {
  const ranges: Array<readonly [number, number]> = []
  let index = 0

  while (index < line.length) {
    if (line[index] !== '`' || line[index - 1] === '\\') {
      index += 1
      continue
    }

    let runLength = 1
    while (line[index + runLength] === '`') {
      runLength += 1
    }
    const delimiter = '`'.repeat(runLength)
    const closing = line.indexOf(delimiter, index + runLength)
    if (closing < 0) {
      index += runLength
      continue
    }

    ranges.push([index, closing + runLength])
    index = closing + runLength
  }

  return ranges
}

function isProtected(
  index: number,
  ranges: readonly (readonly [number, number])[],
): boolean {
  return ranges.some(([start, end]) => index >= start && index < end)
}

function findClosingBracket(line: string, opening: number): number {
  let depth = 1
  for (let index = opening + 1; index < line.length; index += 1) {
    if (line[index - 1] === '\\') continue
    if (line[index] === '[') depth += 1
    if (line[index] === ']') depth -= 1
    if (depth === 0) return index
  }
  return -1
}

function findClosingParenthesis(line: string, opening: number): number {
  let depth = 1
  let angleDestination = false
  for (let index = opening + 1; index < line.length; index += 1) {
    if (line[index - 1] === '\\') continue
    if (line[index] === '<' && depth === 1) angleDestination = true
    if (line[index] === '>' && angleDestination) angleDestination = false
    if (angleDestination) continue
    if (line[index] === '(') depth += 1
    if (line[index] === ')') depth -= 1
    if (depth === 0) return index
  }
  return -1
}

function destinationAndSuffix(content: string): {
  readonly destination: string
  readonly suffix: string
} {
  const trimmedStart = content.trimStart()
  const leading = content.slice(0, content.length - trimmedStart.length)
  if (trimmedStart.startsWith('<')) {
    const closing = trimmedStart.indexOf('>')
    if (closing >= 0) {
      return {
        destination: trimmedStart.slice(1, closing),
        suffix: leading + trimmedStart.slice(closing + 1),
      }
    }
  }

  const match = /^(\S+)([\s\S]*)$/.exec(trimmedStart)
  return match
    ? { destination: match[1], suffix: leading + match[2] }
    : { destination: content, suffix: '' }
}

function normalizeImageName(name: string): string {
  return name.replace(/^autojs6-notification-/i, 'monkeyking-notification-')
}

function normalizeImageTarget(target: string): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) {
    return target
  }
  const { path, fragment } = splitTarget(target)
  if (!/\.(?:png|jpe?g|gif|svg|webp|avif)$/i.test(path)) {
    return target
  }
  const name = normalizeImageName(posix.basename(path))
  return `/images/${name}${fragment ? `#${fragment}` : ''}`
}

function recordResolution(
  resolution: ResolvedLink['resolution'],
  report: MutableLinkRewriteReport,
  unlinked = false,
): void {
  if (resolution === 'exact') report.exactFragments += 1
  if (resolution === 'automatic') report.automaticFragments += 1
  if (resolution === 'override') report.overrides += 1
  if (unlinked) report.unlinked += 1
}

function rewriteReferenceDefinition(
  line: string,
  context: MarkdownLinkContext,
  report: MutableLinkRewriteReport,
): string | undefined {
  const match = /^(\s{0,3}\[([^\]]+)\]:\s*)(<?[^\s>]+>?)(.*)$/.exec(line)
  if (!match) return undefined

  const rawTarget = match[3].replace(/^<(.*)>$/, '$1')
  if (match[2] === '//' || rawTarget === '<>') return line
  const imageTarget = normalizeImageTarget(rawTarget)
  if (imageTarget !== rawTarget) {
    return `${match[1]}${imageTarget}${match[4]}`
  }

  const resolved = resolveLink(rawTarget, match[2], line, context)
  recordResolution(resolved.resolution, report, resolved.kind === 'unlink')
  if (resolved.kind === 'unlink') return ''
  return `${match[1]}${resolved.target}${match[4]}`
}

function rewriteInlineLinks(
  line: string,
  context: MarkdownLinkContext,
  report: MutableLinkRewriteReport,
): string {
  const codeRanges = inlineCodeRanges(line)
  let output = ''
  let index = 0

  while (index < line.length) {
    const isImage = line[index] === '!' && line[index + 1] === '['
    const openingBracket = isImage ? index + 1 : index
    if (
      line[openingBracket] !== '[' ||
      isProtected(openingBracket, codeRanges)
    ) {
      output += line[index]
      index += 1
      continue
    }

    const closingBracket = findClosingBracket(line, openingBracket)
    if (closingBracket < 0 || line[closingBracket + 1] !== '(') {
      output += line[index]
      index += 1
      continue
    }
    const closingParenthesis = findClosingParenthesis(line, closingBracket + 1)
    if (closingParenthesis < 0) {
      output += line[index]
      index += 1
      continue
    }

    const label = line.slice(openingBracket + 1, closingBracket)
    const content = line.slice(closingBracket + 2, closingParenthesis)
    const { destination, suffix } = destinationAndSuffix(content)

    if (isImage) {
      const target = normalizeImageTarget(destination)
      output += `![${label}](${target}${suffix})`
    } else {
      const resolved = resolveLink(destination, label, line, context)
      recordResolution(resolved.resolution, report, resolved.kind === 'unlink')
      output +=
        resolved.kind === 'unlink'
          ? (resolved.label ?? label)
          : `[${resolved.label ?? label}](${resolved.target}${suffix})`
    }
    index = closingParenthesis + 1
  }

  return output
}

function rewriteSrcset(value: string): string {
  return value
    .split(',')
    .map((candidate) => {
      const trimmed = candidate.trim()
      const match = /^(\S+)(.*)$/.exec(trimmed)
      return match
        ? `${normalizeImageTarget(match[1])}${match[2]}`
        : candidate
    })
    .join(', ')
}

function rewriteHtmlImages(line: string): string {
  return line.replace(/<(?:img|source)\b[^>]*>/gi, (tag) =>
    tag.replace(
      /\b(src|srcset)=(['"])(.*?)\2/gi,
      (_attribute, name: string, quote: string, value: string) => {
        const rewritten =
          name.toLowerCase() === 'srcset'
            ? rewriteSrcset(value)
            : normalizeImageTarget(value)
        return `${name}=${quote}${rewritten}${quote}`
      },
    ),
  )
}

function rewriteOutsideFences(
  markdown: string,
  transform: (line: string) => string,
): string {
  let fence: { readonly marker: string; readonly length: number } | undefined

  return markdown
    .split(/(?<=\n)/)
    .map((lineWithEnding) => {
      const hasNewline = lineWithEnding.endsWith('\n')
      const line = hasNewline ? lineWithEnding.slice(0, -1) : lineWithEnding
      const fenceMatch = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line)

      if (fence) {
        if (
          fenceMatch &&
          fenceMatch[1][0] === fence.marker &&
          fenceMatch[1].length >= fence.length &&
          fenceMatch[2].trim() === ''
        ) {
          fence = undefined
        }
        return lineWithEnding
      }

      if (fenceMatch) {
        fence = { marker: fenceMatch[1][0], length: fenceMatch[1].length }
        return lineWithEnding
      }

      return transform(line) + (hasNewline ? '\n' : '')
    })
    .join('')
}

export function rewriteMarkdownLinksWithReport(
  markdown: string,
  context: MarkdownLinkContext,
): { readonly markdown: string; readonly report: LinkRewriteReport } {
  const mutableReport: MutableLinkRewriteReport = {
    exactFragments: 0,
    automaticFragments: 0,
    overrides: 0,
    unlinked: 0,
  }

  const rewritten = rewriteOutsideFences(markdown, (line) => {
    const definition = rewriteReferenceDefinition(line, context, mutableReport)
    if (definition !== undefined) return definition
    return rewriteHtmlImages(
      rewriteInlineLinks(line, context, mutableReport),
    )
  })

  return {
    markdown: rewritten,
    report: Object.freeze({ ...mutableReport }),
  }
}

export function rewriteMarkdownLinks(
  markdown: string,
  currentOrContext: ContentEntry | MarkdownLinkContext,
): string {
  const context =
    'current' in currentOrContext
      ? currentOrContext
      : { current: currentOrContext }
  return rewriteMarkdownLinksWithReport(markdown, context).markdown
}

export async function buildHeadingIndex(
  sources: readonly HeadingSource[],
): Promise<HeadingIndex> {
  const renderer = await createMarkdownRenderer(process.cwd())
  const entries = await Promise.all(
    sources.map(async ({ entry, markdown }) => {
      const tokens = renderer.parse(markdown, {})
      const headings = tokens
        .filter((token) => token.type === 'heading_open')
        .map((token) => token.attrGet('id'))
        .filter((id): id is string => id !== null)
      return [entry.id, Object.freeze(headings)] as const
    }),
  )

  return new Map(entries)
}
