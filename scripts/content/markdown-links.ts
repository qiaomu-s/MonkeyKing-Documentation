import { posix } from 'node:path'
import { createMarkdownRenderer } from 'vitepress'
import { contentEntries } from './catalog'
import type { ContentEntry } from './catalog'
import { resolveFragmentOverride } from './fragment-overrides'
import {
  isBackslashEscaped,
  scanMarkdownCode,
} from './markdown-source'
import type { SourceRange } from './markdown-source'

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
    super(`Unresolved fragment "${fragment}" for ${entry.legacySource ?? entry.source}`)
    this.name = 'UnresolvedFragmentError'
  }
}

export class AmbiguousFragmentError extends Error {
  constructor(entry: ContentEntry, fragment: string, candidates: readonly string[]) {
    super(
      `Ambiguous fragment "${fragment}" for ${entry.legacySource ?? entry.source}: ${candidates.join(', ')}`,
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
  return entry.legacySource === undefined
    ? entry.jsonNames[0] ?? posix.basename(entry.source, '.md')
    : posix.basename(entry.legacySource, '.md')
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
    currentLegacySource: context.current.legacySource ?? context.current.source,
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
    throw new Error(`Unknown legacy Markdown target "${rawTarget}" from ${context.current.legacySource ?? context.current.source}`)
  }

  if (override?.kind === 'link') {
    if (
      context.headingIndex &&
      override.fragment &&
      !(context.headingIndex.get(targetEntry.id) ?? []).includes(
        override.fragment,
      )
    ) {
      throw new UnresolvedFragmentError(targetEntry, override.fragment)
    }
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

function protectedRangeAt(
  index: number,
  ranges: readonly SourceRange[],
): SourceRange | undefined {
  return ranges.find((range) => index >= range.start && index < range.end)
}

function overlapsProtectedRange(
  start: number,
  end: number,
  ranges: readonly SourceRange[],
): boolean {
  return ranges.some((range) => range.start < end && range.end > start)
}

function findClosingBracket(
  source: string,
  opening: number,
  protectedRanges: readonly SourceRange[],
): number {
  let depth = 1
  for (let index = opening + 1; index < source.length; index += 1) {
    const protectedRange = protectedRangeAt(index, protectedRanges)
    if (protectedRange) {
      index = protectedRange.end - 1
      continue
    }
    if (isBackslashEscaped(source, index)) continue
    if (source[index] === '[') depth += 1
    if (source[index] === ']') depth -= 1
    if (depth === 0) return index
  }
  return -1
}

function findClosingParenthesis(
  source: string,
  opening: number,
  protectedRanges: readonly SourceRange[],
): number {
  let depth = 1
  let angleDestination = false
  let destinationStarted = false
  let destinationFinished = false
  let quotedTitle: '"' | "'" | undefined

  for (let index = opening + 1; index < source.length; index += 1) {
    const protectedRange = protectedRangeAt(index, protectedRanges)
    if (protectedRange) {
      index = protectedRange.end - 1
      continue
    }
    if (isBackslashEscaped(source, index)) continue

    const character = source[index]
    if (quotedTitle) {
      if (character === quotedTitle) quotedTitle = undefined
      continue
    }
    if (!destinationStarted && /\s/.test(character)) continue
    if (!destinationStarted) {
      destinationStarted = true
      if (character === '<') angleDestination = true
    }
    if (character === '>' && angleDestination) angleDestination = false
    if (angleDestination) continue

    if (depth === 1 && destinationStarted && /\s/.test(character)) {
      destinationFinished = true
      continue
    }
    if (
      depth === 1 &&
      destinationFinished &&
      (character === '"' || character === "'")
    ) {
      quotedTitle = character
      continue
    }
    if (character === '(') depth += 1
    if (character === ')') depth -= 1
    if (depth === 0) return index
  }
  return -1
}

interface DestinationParts {
  readonly prefix: string
  readonly destination: string
  readonly suffix: string
  readonly angleWrapped: boolean
}

function destinationAndSuffix(content: string): DestinationParts | undefined {
  const trimmedStart = content.trimStart()
  const prefix = content.slice(0, content.length - trimmedStart.length)
  if (trimmedStart === '') return undefined

  if (trimmedStart.startsWith('<')) {
    const closing = trimmedStart.indexOf('>')
    if (closing >= 0) {
      return {
        prefix,
        destination: trimmedStart.slice(1, closing),
        suffix: trimmedStart.slice(closing + 1),
        angleWrapped: true,
      }
    }
  }

  const match = /^(\S+)([\s\S]*)$/.exec(trimmedStart)
  return match
    ? {
        prefix,
        destination: match[1],
        suffix: match[2],
        angleWrapped: false,
      }
    : undefined
}

function formatDestination(parts: DestinationParts, target: string): string {
  return (
    parts.prefix +
    (parts.angleWrapped ? `<${target}>` : target) +
    parts.suffix
  )
}

function normalizeImageName(name: string): string {
  return name.replace(/^autojs6-notification-/i, 'monkeyking-notification-')
}

function splitImageTarget(target: string): {
  readonly path: string
  readonly suffix: string
} {
  const queryIndex = target.indexOf('?')
  const fragmentIndex = target.indexOf('#')
  const delimiterIndexes = [queryIndex, fragmentIndex].filter(
    (index) => index >= 0,
  )
  const delimiterIndex =
    delimiterIndexes.length === 0 ? -1 : Math.min(...delimiterIndexes)

  return delimiterIndex < 0
    ? { path: target, suffix: '' }
    : {
        path: target.slice(0, delimiterIndex),
        suffix: target.slice(delimiterIndex),
      }
}

function normalizeImageTarget(target: string): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) {
    return target
  }
  const { path, suffix } = splitImageTarget(target)
  if (!/\.(?:png|jpe?g|gif|svg|webp|avif)$/i.test(path)) {
    return target
  }
  const name = normalizeImageName(posix.basename(path))
  return `/images/${name}${suffix}`
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

interface SourceLine {
  readonly start: number
  readonly contentEnd: number
  readonly end: number
  readonly content: string
}

function sourceLineAt(source: string, start: number): SourceLine {
  const newline = source.indexOf('\n', start)
  const end = newline < 0 ? source.length : newline + 1
  let contentEnd = newline < 0 ? source.length : newline
  if (contentEnd > start && source[contentEnd - 1] === '\r') {
    contentEnd -= 1
  }
  return {
    start,
    contentEnd,
    end,
    content: source.slice(start, contentEnd),
  }
}

function rewrittenDestination(
  parts: DestinationParts,
  label: string,
  lineContext: string,
  context: MarkdownLinkContext,
  report: MutableLinkRewriteReport,
): string | undefined {
  const rawTarget = parts.destination
  if (label === '//' || (parts.angleWrapped && rawTarget === '')) {
    return formatDestination(parts, rawTarget)
  }
  const imageTarget = normalizeImageTarget(rawTarget)
  if (imageTarget !== rawTarget) {
    return formatDestination(parts, imageTarget)
  }

  const resolved = resolveLink(rawTarget, label, lineContext, context)
  recordResolution(resolved.resolution, report, resolved.kind === 'unlink')
  return resolved.kind === 'unlink'
    ? undefined
    : formatDestination(parts, resolved.target ?? rawTarget)
}

function rewriteReferenceDefinitions(
  markdown: string,
  context: MarkdownLinkContext,
  report: MutableLinkRewriteReport,
): string {
  const { protectedRanges } = scanMarkdownCode(markdown)
  let output = ''
  let index = 0

  while (index < markdown.length) {
    const line = sourceLineAt(markdown, index)
    if (overlapsProtectedRange(line.start, line.end, protectedRanges)) {
      output += markdown.slice(line.start, line.end)
      index = line.end
      continue
    }

    const match = /^([ \t]{0,3}\[([^\]\r\n]+)\]:)([ \t]*)(.*)$/.exec(
      line.content,
    )
    if (!match) {
      output += markdown.slice(line.start, line.end)
      index = line.end
      continue
    }

    const sameLineParts = destinationAndSuffix(match[3] + match[4])
    if (sameLineParts) {
      const rewritten = rewrittenDestination(
        sameLineParts,
        match[2],
        line.content,
        context,
        report,
      )
      if (rewritten !== undefined) {
        output +=
          match[1] +
          rewritten +
          markdown.slice(line.contentEnd, line.end)
      }
      index = line.end
      continue
    }

    const nextLine =
      line.end < markdown.length ? sourceLineAt(markdown, line.end) : undefined
    const continuation =
      nextLine &&
      !overlapsProtectedRange(
        nextLine.start,
        nextLine.end,
        protectedRanges,
      ) &&
      /^[ \t]{1,3}\S/.test(nextLine.content)
        ? destinationAndSuffix(nextLine.content)
        : undefined

    if (!nextLine || !continuation) {
      output += markdown.slice(line.start, line.end)
      index = line.end
      continue
    }

    const rewritten = rewrittenDestination(
      continuation,
      match[2],
      line.content + '\n' + nextLine.content,
      context,
      report,
    )
    if (rewritten !== undefined) {
      output += markdown.slice(line.start, line.end)
      output +=
        rewritten + markdown.slice(nextLine.contentEnd, nextLine.end)
    }
    index = nextLine.end
  }

  return output
}

function lineContextAt(source: string, index: number): string {
  const start = source.lastIndexOf('\n', Math.max(0, index - 1)) + 1
  const newline = source.indexOf('\n', index)
  const end = newline < 0 ? source.length : newline
  return source.slice(start, end).replace(/\r$/, '')
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

function findHtmlTagEnd(source: string, opening: number): number {
  let quote: '"' | "'" | undefined
  for (let index = opening + 1; index < source.length; index += 1) {
    const character = source[index]
    if (quote) {
      if (character === quote && !isBackslashEscaped(source, index)) {
        quote = undefined
      }
      continue
    }
    if (character === '"' || character === "'") {
      quote = character
      continue
    }
    if (character === '>') return index
  }
  return -1
}

function rewriteInlineLinksAndHtml(
  markdown: string,
  context: MarkdownLinkContext,
  report: MutableLinkRewriteReport,
): string {
  const { protectedRanges } = scanMarkdownCode(markdown)
  let protectedIndex = 0
  let output = ''
  let index = 0

  while (index < markdown.length) {
    while (
      protectedIndex < protectedRanges.length &&
      protectedRanges[protectedIndex].end <= index
    ) {
      protectedIndex += 1
    }
    const protectedRange = protectedRanges[protectedIndex]
    if (protectedRange && protectedRange.start <= index) {
      output += markdown.slice(index, protectedRange.end)
      index = protectedRange.end
      continue
    }

    if (
      markdown[index] === '<' &&
      /^<(?:img|source)\b/i.test(markdown.slice(index))
    ) {
      const closing = findHtmlTagEnd(markdown, index)
      if (
        closing >= 0 &&
        !overlapsProtectedRange(index, closing + 1, protectedRanges)
      ) {
        output += rewriteHtmlImages(markdown.slice(index, closing + 1))
        index = closing + 1
        continue
      }
    }

    const image =
      markdown[index] === '!' &&
      markdown[index + 1] === '[' &&
      !isBackslashEscaped(markdown, index) &&
      !isBackslashEscaped(markdown, index + 1)
    const openingBracket = image ? index + 1 : index
    if (
      markdown[openingBracket] !== '[' ||
      isBackslashEscaped(markdown, openingBracket)
    ) {
      output += markdown[index]
      index += 1
      continue
    }

    const closingBracket = findClosingBracket(
      markdown,
      openingBracket,
      protectedRanges,
    )
    if (closingBracket < 0 || markdown[closingBracket + 1] !== '(') {
      output += markdown[index]
      index += 1
      continue
    }
    const closingParenthesis = findClosingParenthesis(
      markdown,
      closingBracket + 1,
      protectedRanges,
    )
    if (closingParenthesis < 0) {
      output += markdown[index]
      index += 1
      continue
    }

    const label = markdown.slice(openingBracket + 1, closingBracket)
    const content = markdown.slice(closingBracket + 2, closingParenthesis)
    const parts = destinationAndSuffix(content)
    if (!parts) {
      output += markdown[index]
      index += 1
      continue
    }

    if (image) {
      const target = normalizeImageTarget(parts.destination)
      output += `![${label}](${formatDestination(parts, target)})`
    } else {
      const resolved = resolveLink(
        parts.destination,
        label,
        lineContextAt(markdown, index),
        context,
      )
      recordResolution(resolved.resolution, report, resolved.kind === 'unlink')
      output +=
        resolved.kind === 'unlink'
          ? (resolved.label ?? label)
          : `[${resolved.label ?? label}](${formatDestination(
              parts,
              resolved.target ?? parts.destination,
            )})`
    }
    index = closingParenthesis + 1
  }

  return output
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

  const definitionsRewritten = rewriteReferenceDefinitions(
    markdown,
    context,
    mutableReport,
  )
  const rewritten = rewriteInlineLinksAndHtml(
    definitionsRewritten,
    context,
    mutableReport,
  )

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
