import {
  API_COVERAGE_SCHEMA_VERSION,
  API_MANIFEST_SCHEMA_VERSION,
  API_PRODUCT_VERSION,
  type ApiCoverage,
  type ApiManifest,
  type ApiSymbolKind,
  type CoverageRule,
  type PublicApiCoverage,
  type PublicApiGap,
  type PublicApiGaps,
  type PublicApiManifest,
  type PublicApiModule,
  type PublicApiSymbol,
  type PublicCoverageRule,
} from './model'

/** A source-backed gap shape accepted by the projection helper. */
export interface SourceBackedApiGap {
  readonly symbolId: string
  readonly owner: string
  readonly name: string
  readonly kind: ApiSymbolKind
  readonly source?: unknown
  readonly expectedPage?: string
  readonly reason: string
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, 'en')
}

function uniqueStable(values: readonly string[]): string[] {
  return [...new Set(values)]
}

function projectRule(rule: CoverageRule): PublicCoverageRule {
  return {
    id: rule.id,
    patterns: uniqueStable(rule.patterns),
    status: rule.status,
    ...(rule.target ? { target: rule.target } : {}),
    ...(rule.reason ? { reason: rule.reason } : {}),
  }
}

/**
 * Project the internal source-backed extractor result into the public v2
 * manifest.  The projection is intentionally explicit: adding a new field to
 * the internal model cannot accidentally publish provenance metadata.
 */
export function projectApiManifest(manifest: ApiManifest): PublicApiManifest {
  const modules: PublicApiModule[] = manifest.modules
    .map((module) => ({
      id: module.id,
      name: module.name,
      className: module.className,
      aliases: uniqueStable(module.aliases),
      ...(module.dynamic ? { dynamic: true } : {}),
    }))
    .sort((left, right) => compareText(left.id, right.id))

  const symbols: PublicApiSymbol[] = manifest.symbols
    .filter((symbol) => symbol.public && symbol.id !== 'global:__engine__')
    .map((symbol) => ({
      id: symbol.id,
      owner: symbol.owner,
      name: symbol.name,
      kind: symbol.kind,
      public: true as const,
      ...(symbol.canonicalId ? { canonicalId: symbol.canonicalId } : {}),
      annotations: uniqueStable(symbol.annotations),
      signatures: uniqueStable(symbol.signatures),
      overloads: uniqueStable(symbol.overloads),
    }))
    .sort((left, right) => compareText(left.id, right.id))

  return {
    schemaVersion: API_MANIFEST_SCHEMA_VERSION,
    productVersion: API_PRODUCT_VERSION,
    modules,
    symbols,
  }
}

/** Normalize/strip an internal coverage result for publication. */
export function projectApiCoverage(
  coverage: Pick<ApiCoverage, 'rules'>,
): PublicApiCoverage {
  return {
    schemaVersion: API_COVERAGE_SCHEMA_VERSION,
    productVersion: API_PRODUCT_VERSION,
    rules: coverage.rules
      .map(projectRule)
      .sort((left, right) => compareText(left.id, right.id)),
  }
}

/** Strip source locations from a gap inventory before writing gaps.json. */
export function projectApiGaps(
  gaps: readonly SourceBackedApiGap[],
): PublicApiGaps {
  const projected: PublicApiGap[] = gaps
    .map((gap) => ({
      symbolId: gap.symbolId,
      owner: gap.owner,
      name: gap.name,
      kind: gap.kind,
      ...(gap.expectedPage ? { expectedPage: gap.expectedPage } : {}),
      reason: gap.reason,
    }))
    .sort((left, right) => compareText(left.symbolId, right.symbolId))
  return { gaps: projected }
}

export function isPublicApiManifest(value: unknown): value is PublicApiManifest {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<PublicApiManifest>
  return (
    candidate.schemaVersion === API_MANIFEST_SCHEMA_VERSION &&
    candidate.productVersion === API_PRODUCT_VERSION &&
    Array.isArray(candidate.modules) &&
    Array.isArray(candidate.symbols)
  )
}

export function isPublicApiCoverage(value: unknown): value is PublicApiCoverage {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<PublicApiCoverage>
  return (
    candidate.schemaVersion === API_COVERAGE_SCHEMA_VERSION &&
    candidate.productVersion === API_PRODUCT_VERSION &&
    Array.isArray(candidate.rules)
  )
}

// Descriptive aliases keep the projection API easy to discover for private
// audit tooling without creating a second implementation path.
export const projectPublicManifest = projectApiManifest
export const projectPublicCoverage = projectApiCoverage
export const projectPublicGaps = projectApiGaps
