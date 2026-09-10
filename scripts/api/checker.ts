import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Ajv from 'ajv'
import type {
  ApiCoverage,
  ApiManifest,
  ApiSymbol,
  CoverageRule,
} from './model'
import { coverageSchema, manifestSchema } from './schema'

export interface ApiCheckError {
  readonly code:
    | 'manifest-schema'
    | 'coverage-schema'
    | 'source-ref-mismatch'
    | 'duplicate-symbol'
    | 'unknown-symbol'
    | 'duplicate-mapping'
    | 'duplicate-target'
    | 'unmapped-symbol'
    | 'invalid-alias'
    | 'invalid-target'
    | 'missing-page'
    | 'missing-anchor'
  readonly message: string
  readonly symbolId?: string
  readonly ruleId?: string
}

export interface ApiCheckReport {
  readonly errors: readonly ApiCheckError[]
  readonly publicSymbolCount: number
  readonly mappedSymbolCount: number
}

export interface ValidateApiSurfaceOptions {
  readonly manifest: ApiManifest | unknown
  readonly coverage: ApiCoverage | unknown
  readonly projectRoot: string
}

const ajv = new Ajv({ allErrors: true, strict: false })
const validateManifestSchema = ajv.compile(manifestSchema)
const validateCoverageSchema = ajv.compile(coverageSchema)

function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replaceAll('*', '.*')
  return new RegExp(`^${escaped}$`)
}

function matches(pattern: string, symbolId: string): boolean {
  return patternToRegExp(pattern).test(symbolId)
}

function matchesRule(rule: CoverageRule, symbolId: string): boolean {
  return (
    rule.patterns.some((pattern) => matches(pattern, symbolId)) &&
    !(rule.exclude ?? []).some((pattern) => matches(pattern, symbolId))
  )
}

function formatAjvErrors(prefix: string, errors: typeof validateManifestSchema.errors): string {
  return (errors ?? [])
    .map((error) => `${prefix}${error.instancePath || '/'} ${error.message ?? ''}`.trim())
    .join('; ')
}

export function markdownSlug(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .trim()
    .toLowerCase()
    .replace(/[\u0000-\u001f!"#$%&'()*+,./:;<=>?@[\]\\^`{|}~]/g, '')
    .replace(/\s+/g, '-')
}

export function markdownAnchors(markdown: string): ReadonlySet<string> {
  const anchors = new Set<string>()
  const explicit = /\bid\s*=\s*["']([^"']+)["']/g
  let match: RegExpExecArray | null
  while ((match = explicit.exec(markdown)) !== null) anchors.add(match[1])

  const duplicateCounts = new Map<string, number>()
  const headings = /^#{1,6}\s+(.+?)\s*#*\s*$/gm
  while ((match = headings.exec(markdown)) !== null) {
    const explicitHeading = match[1].match(/\s*\{#([^}]+)\}\s*$/)
    if (explicitHeading) {
      anchors.add(explicitHeading[1])
      continue
    }
    const base = markdownSlug(match[1])
    if (!base) continue
    const count = duplicateCounts.get(base) ?? 0
    anchors.add(count === 0 ? base : `${base}-${count}`)
    duplicateCounts.set(base, count + 1)
  }
  return anchors
}

function resolvedTarget(
  symbol: ApiSymbol,
  rule: CoverageRule,
  rulesBySymbol: ReadonlyMap<string, CoverageRule>,
  symbolsById: ReadonlyMap<string, ApiSymbol>,
  visited = new Set<string>(),
): string | undefined {
  if (rule.target) return rule.target
  if (rule.status !== 'alias' || !symbol.canonicalId) return undefined
  if (visited.has(symbol.id)) return undefined
  visited.add(symbol.id)
  const canonical = symbolsById.get(symbol.canonicalId)
  const canonicalRule = rulesBySymbol.get(symbol.canonicalId)
  return canonical && canonicalRule
    ? resolvedTarget(canonical, canonicalRule, rulesBySymbol, symbolsById, visited)
    : undefined
}

function resolvesToExcluded(
  symbol: ApiSymbol,
  rule: CoverageRule,
  rulesBySymbol: ReadonlyMap<string, CoverageRule>,
  symbolsById: ReadonlyMap<string, ApiSymbol>,
  visited = new Set<string>(),
): boolean {
  if (rule.status === 'excluded') return true
  if (rule.status !== 'alias' || !symbol.canonicalId) return false
  if (visited.has(symbol.id)) return false
  visited.add(symbol.id)
  const canonical = symbolsById.get(symbol.canonicalId)
  const canonicalRule = rulesBySymbol.get(symbol.canonicalId)
  return canonical && canonicalRule
    ? resolvesToExcluded(
        canonical,
        canonicalRule,
        rulesBySymbol,
        symbolsById,
        visited,
      )
    : false
}

export function validateApiSurface(
  options: ValidateApiSurfaceOptions,
): ApiCheckReport {
  const errors: ApiCheckError[] = []
  const manifestValid = validateManifestSchema(options.manifest)
  if (!manifestValid) {
    errors.push({
      code: 'manifest-schema',
      message: formatAjvErrors('manifest', validateManifestSchema.errors),
    })
  }
  const coverageValid = validateCoverageSchema(options.coverage)
  if (!coverageValid) {
    errors.push({
      code: 'coverage-schema',
      message: formatAjvErrors('coverage', validateCoverageSchema.errors),
    })
  }

  const manifest = options.manifest as Partial<ApiManifest>
  const coverage = options.coverage as Partial<ApiCoverage>
  const symbols = Array.isArray(manifest.symbols) ? manifest.symbols : []
  const rules = Array.isArray(coverage.rules) ? coverage.rules : []
  const publicSymbols = symbols.filter((symbol) => symbol.public)
  const symbolsById = new Map<string, ApiSymbol>()

  for (const symbol of symbols) {
    if (symbolsById.has(symbol.id)) {
      errors.push({
        code: 'duplicate-symbol',
        message: `Manifest contains duplicate symbol ${symbol.id}.`,
        symbolId: symbol.id,
      })
    }
    symbolsById.set(symbol.id, symbol)
  }

  if (
    manifest.source?.commit &&
    coverage.sourceRef &&
    manifest.source.commit !== coverage.sourceRef
  ) {
    errors.push({
      code: 'source-ref-mismatch',
      message:
        `Coverage sourceRef ${coverage.sourceRef} does not match manifest commit ` +
        `${manifest.source.commit}.`,
    })
  }

  const matchedRules = new Map<string, CoverageRule[]>()
  for (const rule of rules) {
    const matchesForRule = publicSymbols.filter((symbol) =>
      matchesRule(rule, symbol.id),
    )
    if (matchesForRule.length === 0) {
      errors.push({
        code: 'unknown-symbol',
        message: `Coverage rule ${rule.id} does not match a public manifest symbol.`,
        ruleId: rule.id,
      })
    }
    for (const symbol of matchesForRule) {
      const current = matchedRules.get(symbol.id) ?? []
      current.push(rule)
      matchedRules.set(symbol.id, current)
    }
  }

  const rulesBySymbol = new Map<string, CoverageRule>()
  for (const symbol of publicSymbols) {
    const matchesForSymbol = matchedRules.get(symbol.id) ?? []
    if (matchesForSymbol.length === 0) {
      errors.push({
        code: 'unmapped-symbol',
        message: `Public symbol ${symbol.id} has no coverage mapping.`,
        symbolId: symbol.id,
      })
      continue
    }
    if (matchesForSymbol.length > 1) {
      errors.push({
        code: 'duplicate-mapping',
        message:
          `Public symbol ${symbol.id} is matched by rules ` +
          `${matchesForSymbol.map(({ id }) => id).join(', ')}.`,
        symbolId: symbol.id,
      })
      continue
    }
    rulesBySymbol.set(symbol.id, matchesForSymbol[0])
  }

  const checkedTargets = new Set<string>()
  const documentedTargets = new Map<string, string>()
  const anchorsByPage = new Map<string, ReadonlySet<string>>()
  for (const symbol of publicSymbols) {
    const rule = rulesBySymbol.get(symbol.id)
    if (!rule) continue
    if (rule.status === 'excluded') continue
    if (rule.status === 'alias' && !symbol.canonicalId) {
      errors.push({
        code: 'invalid-alias',
        message: `Alias coverage rule ${rule.id} matched non-alias ${symbol.id}.`,
        symbolId: symbol.id,
        ruleId: rule.id,
      })
      continue
    }

    const target = resolvedTarget(
      symbol,
      rule,
      rulesBySymbol,
      symbolsById,
    )
    if (
      rule.status === 'alias' &&
      resolvesToExcluded(symbol, rule, rulesBySymbol, symbolsById)
    ) {
      continue
    }
    if (!target) {
      errors.push({
        code: 'invalid-target',
        message: `Coverage rule ${rule.id} does not resolve to a page#anchor target.`,
        symbolId: symbol.id,
        ruleId: rule.id,
      })
      continue
    }
    if (rule.status !== 'alias') {
      const existingSymbolId = documentedTargets.get(target)
      if (existingSymbolId) {
        errors.push({
          code: 'duplicate-target',
          message:
            `Public symbols ${existingSymbolId} and ${symbol.id} resolve to the same ` +
            `non-alias documentation target ${target}.`,
          symbolId: symbol.id,
          ruleId: rule.id,
        })
        continue
      }
      documentedTargets.set(target, symbol.id)
    }
    if (checkedTargets.has(target)) continue
    checkedTargets.add(target)

    const targetMatch = target.match(/^(docs\/.+\.md)#([^#]+)$/)
    if (!targetMatch) {
      errors.push({
        code: 'invalid-target',
        message: `Coverage target ${target} must use docs/...md#anchor format.`,
        symbolId: symbol.id,
        ruleId: rule.id,
      })
      continue
    }
    const pagePath = resolve(options.projectRoot, targetMatch[1])
    if (!existsSync(pagePath)) {
      errors.push({
        code: 'missing-page',
        message: `Coverage target page does not exist: ${targetMatch[1]}.`,
        symbolId: symbol.id,
        ruleId: rule.id,
      })
      continue
    }
    let anchors = anchorsByPage.get(pagePath)
    if (!anchors) {
      anchors = markdownAnchors(readFileSync(pagePath, 'utf8'))
      anchorsByPage.set(pagePath, anchors)
    }
    if (!anchors.has(targetMatch[2])) {
      errors.push({
        code: 'missing-anchor',
        message: `Coverage target anchor does not exist: ${target}.`,
        symbolId: symbol.id,
        ruleId: rule.id,
      })
    }
  }

  return {
    errors,
    publicSymbolCount: publicSymbols.length,
    mappedSymbolCount: rulesBySymbol.size,
  }
}

export function assertApiSurface(options: ValidateApiSurfaceOptions): ApiCheckReport {
  const report = validateApiSurface(options)
  if (report.errors.length === 0) return report
  throw new Error(
    report.errors
      .map(({ code, message }) => `[${code}] ${message}`)
      .join('\n'),
  )
}
