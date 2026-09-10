import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Ajv from 'ajv'
import { buildMarkdownDocumentIndexes } from '../content/markdown-links'
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
    | 'duplicate-module'
    | 'duplicate-symbol'
    | 'duplicate-asset'
    | 'duplicate-override'
    | 'duplicate-rule'
    | 'unknown-symbol'
    | 'invalid-pattern'
    | 'batch-mapping'
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

function formatAjvErrors(
  prefix: string,
  errors: typeof validateManifestSchema.errors,
): string {
  return (errors ?? [])
    .map((error) =>
      `${prefix}${error.instancePath || '/'} ${error.message ?? ''}`.trim(),
    )
    .join('; ')
}

function addDuplicateIdErrors<T extends { readonly id: string }>(
  items: readonly T[],
  code:
    | 'duplicate-module'
    | 'duplicate-symbol'
    | 'duplicate-asset'
    | 'duplicate-override'
    | 'duplicate-rule',
  label: string,
  errors: ApiCheckError[],
): void {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.id)) {
      errors.push({
        code,
        message: `${label} contains duplicate id ${item.id}.`,
        ...(code === 'duplicate-symbol' ? { symbolId: item.id } : {}),
        ...(code === 'duplicate-rule' ? { ruleId: item.id } : {}),
      })
    }
    seen.add(item.id)
  }
}

function resolvedAliasTarget(
  symbol: ApiSymbol,
  rulesBySymbol: ReadonlyMap<string, CoverageRule>,
  symbolsById: ReadonlyMap<string, ApiSymbol>,
  visited = new Set<string>(),
): string | undefined {
  if (!symbol.canonicalId || visited.has(symbol.id)) return undefined
  visited.add(symbol.id)
  const canonical = symbolsById.get(symbol.canonicalId)
  const canonicalRule = rulesBySymbol.get(symbol.canonicalId)
  if (!canonical?.public || !canonicalRule) return undefined
  if (canonicalRule.status === 'alias') {
    return resolvedAliasTarget(canonical, rulesBySymbol, symbolsById, visited)
  }
  if (!['documented', 'external'].includes(canonicalRule.status)) {
    return undefined
  }
  return canonicalRule.target
}

interface TargetCheck {
  readonly symbol: ApiSymbol
  readonly rule: CoverageRule
  readonly target: string
  readonly page: string
  readonly anchor: string
}

export async function validateApiSurface(
  options: ValidateApiSurfaceOptions,
): Promise<ApiCheckReport> {
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

  const publicSymbolCount = manifestValid
    ? (options.manifest as ApiManifest).symbols.filter((symbol) => symbol.public)
        .length
    : 0
  if (!manifestValid || !coverageValid) {
    return { errors, publicSymbolCount, mappedSymbolCount: 0 }
  }

  const manifest = options.manifest as ApiManifest
  const coverage = options.coverage as ApiCoverage
  const symbols = manifest.symbols
  const rules = coverage.rules
  const publicSymbols = symbols.filter((symbol) => symbol.public)

  addDuplicateIdErrors(
    manifest.modules,
    'duplicate-module',
    'Manifest modules',
    errors,
  )
  addDuplicateIdErrors(
    symbols,
    'duplicate-symbol',
    'Manifest symbols',
    errors,
  )
  addDuplicateIdErrors(
    manifest.assets,
    'duplicate-asset',
    'Manifest assets',
    errors,
  )
  addDuplicateIdErrors(
    manifest.overrides,
    'duplicate-override',
    'Manifest overrides',
    errors,
  )
  addDuplicateIdErrors(
    rules,
    'duplicate-rule',
    'Coverage rules',
    errors,
  )

  const symbolsById = new Map(symbols.map((symbol) => [symbol.id, symbol]))
  if (manifest.source.commit !== coverage.sourceRef) {
    errors.push({
      code: 'source-ref-mismatch',
      message:
        `Coverage sourceRef ${coverage.sourceRef} does not match manifest commit ` +
        `${manifest.source.commit}.`,
    })
  }

  const matchedRules = new Map<string, CoverageRule[]>()
  for (const rule of rules) {
    let validRule = true
    const included = new Map<string, ApiSymbol>()

    for (const pattern of rule.patterns) {
      if (pattern === '*') {
        errors.push({
          code: 'invalid-pattern',
          message: `Coverage rule ${rule.id} may not use the catch-all pattern *.`,
          ruleId: rule.id,
        })
        validRule = false
      }
      const patternMatches = publicSymbols.filter((symbol) =>
        matches(pattern, symbol.id),
      )
      if (patternMatches.length === 0) {
        errors.push({
          code: 'invalid-pattern',
          message: `Coverage rule ${rule.id} pattern ${pattern} matches no public symbol.`,
          ruleId: rule.id,
        })
        validRule = false
      }
      for (const symbol of patternMatches) included.set(symbol.id, symbol)
    }

    for (const pattern of rule.exclude ?? []) {
      const excluded = [...included.values()].filter((symbol) =>
        matches(pattern, symbol.id),
      )
      if (excluded.length === 0) {
        errors.push({
          code: 'invalid-pattern',
          message:
            `Coverage rule ${rule.id} exclude pattern ${pattern} removes no ` +
            'included public symbol.',
          ruleId: rule.id,
        })
        validRule = false
      }
      for (const symbol of excluded) included.delete(symbol.id)
    }

    if (included.size === 0) {
      errors.push({
        code: 'unknown-symbol',
        message: `Coverage rule ${rule.id} identifies no public manifest symbol.`,
        ruleId: rule.id,
      })
      validRule = false
    }
    if (included.size > 1) {
      errors.push({
        code: 'batch-mapping',
        message:
          `Coverage rule ${rule.id} identifies ${included.size} public symbols; ` +
          'strict coverage requires one rule per symbol.',
        ruleId: rule.id,
      })
      validRule = false
    }
    if (rule.status === 'excluded') {
      errors.push({
        code: 'invalid-target',
        message:
          `Coverage rule ${rule.id} is excluded; strict coverage requires a ` +
          'real documented, external, or canonical alias target.',
        ruleId: rule.id,
      })
      validRule = false
    }
    if (!validRule || included.size !== 1) continue

    const symbol = included.values().next().value as ApiSymbol
    const current = matchedRules.get(symbol.id) ?? []
    current.push(rule)
    matchedRules.set(symbol.id, current)
  }

  const rulesBySymbol = new Map<string, CoverageRule>()
  for (const symbol of publicSymbols) {
    const matchesForSymbol = matchedRules.get(symbol.id) ?? []
    if (matchesForSymbol.length === 0) {
      errors.push({
        code: 'unmapped-symbol',
        message: `Public symbol ${symbol.id} has no valid coverage mapping.`,
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

  const documentedTargets = new Map<string, string>()
  const targetChecks: TargetCheck[] = []
  const pageSources = new Map<string, string>()
  for (const symbol of publicSymbols) {
    const rule = rulesBySymbol.get(symbol.id)
    if (!rule) continue

    const aliasSymbol = Boolean(symbol.canonicalId)
    if (rule.status === 'alias' && !aliasSymbol) {
      errors.push({
        code: 'invalid-alias',
        message: `Alias coverage rule ${rule.id} matched non-alias ${symbol.id}.`,
        symbolId: symbol.id,
        ruleId: rule.id,
      })
      continue
    }
    if (rule.status !== 'alias' && aliasSymbol) {
      errors.push({
        code: 'invalid-alias',
        message:
          `Alias symbol ${symbol.id} must use an alias rule and resolve its ` +
          `canonical symbol ${symbol.canonicalId}.`,
        symbolId: symbol.id,
        ruleId: rule.id,
      })
      continue
    }

    const target =
      rule.status === 'alias'
        ? resolvedAliasTarget(symbol, rulesBySymbol, symbolsById)
        : rule.target
    if (!target) {
      errors.push({
        code: rule.status === 'alias' ? 'invalid-alias' : 'invalid-target',
        message:
          rule.status === 'alias'
            ? `Alias ${symbol.id} does not resolve to an existing public canonical rule.`
            : `Coverage rule ${rule.id} does not resolve to a page#anchor target.`,
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
    if (!pageSources.has(targetMatch[1])) {
      pageSources.set(targetMatch[1], readFileSync(pagePath, 'utf8'))
    }
    targetChecks.push({
      symbol,
      rule,
      target,
      page: targetMatch[1],
      anchor: targetMatch[2],
    })
  }

  const documentIndexes = await buildMarkdownDocumentIndexes(
    [...pageSources].map(([id, markdown]) => ({ id, markdown })),
    options.projectRoot,
  )
  for (const check of targetChecks) {
    if (documentIndexes.get(check.page)?.anchors.has(check.anchor)) continue
    errors.push({
      code: 'missing-anchor',
      message: `Coverage target anchor does not exist: ${check.target}.`,
      symbolId: check.symbol.id,
      ruleId: check.rule.id,
    })
  }

  return {
    errors,
    publicSymbolCount: publicSymbols.length,
    mappedSymbolCount: rulesBySymbol.size,
  }
}

export async function assertApiSurface(
  options: ValidateApiSurfaceOptions,
): Promise<ApiCheckReport> {
  const report = await validateApiSurface(options)
  if (report.errors.length === 0) return report
  throw new Error(
    report.errors
      .map(({ code, message }) => `[${code}] ${message}`)
      .join('\n'),
  )
}
