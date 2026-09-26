/**
 * The extractor keeps a richer, source-backed model internally.  That model
 * is intentionally versioned separately from the files that are published in
 * `api-surface/`: source locations are useful while auditing, but must never
 * cross the public documentation boundary.
 */
export const INTERNAL_API_MANIFEST_SCHEMA_VERSION = 1 as const
export const INTERNAL_API_COVERAGE_SCHEMA_VERSION = 1 as const

export const API_MANIFEST_SCHEMA_VERSION = 2 as const
export const API_COVERAGE_SCHEMA_VERSION = 2 as const
export const API_PRODUCT_VERSION = '6.7.0' as const

export interface SourceLocation {
  readonly path: string
  readonly line: number
}

export interface ApiSourceIdentity {
  readonly repository: string
  readonly ref: string
  readonly commit: string
}

export interface ApiModule {
  readonly id: string
  readonly name: string
  readonly parent?: string
  readonly className: string
  readonly aliases: readonly string[]
  readonly source: SourceLocation
  readonly dynamic?: boolean
}

export type ApiSymbolKind =
  | 'module'
  | 'callable'
  | 'constructor'
  | 'dynamic'
  | 'function'
  | 'property'
  | 'getter'
  | 'class'
  | 'alias'
  | 'global'
  | 'engine-global'

export interface ApiSymbol {
  readonly id: string
  readonly owner: string
  readonly name: string
  readonly kind: ApiSymbolKind
  readonly public: boolean
  readonly canonicalId?: string
  readonly source: SourceLocation
  readonly providers?: readonly SourceLocation[]
  readonly annotations: readonly string[]
  readonly signatures: readonly string[]
  readonly overloads: readonly string[]
}

export interface AnnotationEvidence {
  readonly path: string
  readonly line: number
  readonly member: string
  readonly annotations: readonly string[]
}

export interface DeclarationHint {
  readonly path: string
  readonly line: number
  readonly kind: 'signature' | 'overload' | 'typescript'
  readonly value: string
}

export interface AssetModule {
  readonly id: string
  readonly path: string
}

export interface DynamicOverrideMember {
  readonly id?: string
  readonly canonicalId?: string
  readonly name: string
  readonly kind: Exclude<ApiSymbolKind, 'module' | 'alias' | 'global' | 'engine-global'>
  readonly aliases?: readonly string[]
  readonly global?: boolean
}

export interface DynamicOverride {
  readonly id: string
  readonly className: string
  readonly sourceClassName?: string
  readonly key?: string
  readonly owner?: string
  readonly idPrefix?: string
  readonly module?: {
    readonly id: string
    readonly name: string
    readonly className: string
    readonly aliases: readonly string[]
    readonly source: SourceLocation
  }
  readonly assignments?: readonly DynamicAssignmentName[]
  readonly includeAnnotatedMembers?: boolean
  readonly includePublicMembers?: boolean
  readonly includeJvmFieldsAs?: 'class' | 'property'
  readonly excludeMembers?: readonly string[]
  readonly reason: string
  readonly source: SourceLocation
  readonly members?: readonly DynamicOverrideMember[]
  readonly optional?: boolean
}

export type DynamicAssignmentName =
  | 'selfAssignmentProperties'
  | 'globalAssignmentProperties'
  | 'selfAssignmentFunctions'
  | 'globalAssignmentFunctions'
  | 'selfAssignmentGetters'
  | 'globalAssignmentGetters'
  | 'selfAssignmentGettersAndSetters'
  | 'selfAssignmentJavaClasses'
  | 'globalAssignmentJavaClasses'

export interface AppliedOverride {
  readonly id: string
  readonly className: string
  readonly reason: string
  readonly source: SourceLocation
}

export interface ApiManifest {
  readonly schemaVersion: typeof INTERNAL_API_MANIFEST_SCHEMA_VERSION
  readonly source: ApiSourceIdentity
  readonly modules: readonly ApiModule[]
  readonly symbols: readonly ApiSymbol[]
  readonly annotations: readonly AnnotationEvidence[]
  readonly declarationHints: readonly DeclarationHint[]
  readonly assets: readonly AssetModule[]
  readonly overrides: readonly AppliedOverride[]
}

export type CoverageStatus =
  | 'documented'
  | 'alias'
  | 'external'
  | 'excluded'

export interface CoverageRule {
  readonly id: string
  readonly patterns: readonly string[]
  readonly exclude?: readonly string[]
  readonly status: CoverageStatus
  readonly target?: string
  readonly reason?: string
}

export interface ApiCoverage {
  readonly schemaVersion: typeof INTERNAL_API_COVERAGE_SCHEMA_VERSION
  readonly sourceRef: string
  readonly rules: readonly CoverageRule[]
}

// Explicit names for private audit consumers.  `ApiManifest`/`ApiCoverage`
// remain aliases for existing extractor callers.
export type InternalApiManifest = ApiManifest
export type InternalApiCoverage = ApiCoverage

/**
 * Public manifest contract.  Keep this type deliberately small: consumers
 * need the runtime surface and its documentation metadata, never extraction
 * evidence such as repository names, paths, line numbers, or provider lists.
 */
export interface PublicApiModule {
  readonly id: string
  readonly name: string
  readonly className: string
  readonly aliases: readonly string[]
  readonly dynamic?: boolean
}

export interface PublicApiSymbol {
  readonly id: string
  readonly owner: string
  readonly name: string
  readonly kind: ApiSymbolKind
  readonly public: true
  readonly canonicalId?: string | null
  readonly annotations: readonly string[]
  readonly signatures: readonly string[]
  readonly overloads: readonly string[]
}

export interface PublicApiManifest {
  readonly schemaVersion: typeof API_MANIFEST_SCHEMA_VERSION
  readonly productVersion: typeof API_PRODUCT_VERSION
  readonly modules: readonly PublicApiModule[]
  readonly symbols: readonly PublicApiSymbol[]
}

export interface PublicCoverageRule {
  readonly id: string
  readonly patterns: readonly string[]
  readonly status: CoverageStatus
  readonly target?: string
  readonly reason?: string
}

export interface PublicApiCoverage {
  readonly schemaVersion: typeof API_COVERAGE_SCHEMA_VERSION
  readonly productVersion: typeof API_PRODUCT_VERSION
  readonly rules: readonly PublicCoverageRule[]
}

export interface PublicApiGap {
  readonly symbolId: string
  readonly owner: string
  readonly name: string
  readonly kind: ApiSymbolKind
  readonly expectedPage?: string
  readonly reason: string
}

export interface PublicApiGaps {
  readonly gaps: readonly PublicApiGap[]
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => sortJsonValue(item))
  if (value === null || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right, 'en'))
      .map(([key, nested]) => [key, sortJsonValue(nested)]),
  )
}

export function stableJson(value: unknown): string {
  return `${JSON.stringify(sortJsonValue(value), null, 2)}\n`
}

export function manifestMatches(
  existingText: string,
  manifest: unknown,
): boolean {
  return existingText === stableJson(manifest)
}
