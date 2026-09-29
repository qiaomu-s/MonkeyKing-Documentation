const sourceLocationSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['path', 'line'],
  properties: {
    path: { type: 'string', minLength: 1 },
    line: { type: 'integer', minimum: 1 },
  },
} as const

/** Internal source-backed schema.  It is used by the extractor and private
 * audit fixtures, never by the published `api-surface/manifest.json`. */
export const internalManifestSchema = {
  $id: 'https://qiaomu-s.github.io/MonkeyKing-Documentation/internal-api-manifest.schema.json',
  type: 'object',
  additionalProperties: false,
  required: [
    'schemaVersion',
    'source',
    'modules',
    'symbols',
    'annotations',
    'declarationHints',
    'assets',
    'overrides',
  ],
  properties: {
    schemaVersion: { type: 'integer', const: 1 },
    source: {
      type: 'object',
      additionalProperties: false,
      required: ['repository', 'ref', 'commit'],
      properties: {
        repository: { type: 'string', minLength: 1 },
        ref: { type: 'string', minLength: 1 },
        commit: { type: 'string', pattern: '^[0-9a-fA-F]{40}$' },
      },
    },
    modules: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'name', 'className', 'aliases', 'source'],
        properties: {
          id: { type: 'string', minLength: 1 },
          name: { type: 'string', minLength: 1 },
          parent: { type: 'string', minLength: 1, nullable: true },
          className: { type: 'string', minLength: 1 },
          aliases: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
          source: sourceLocationSchema,
          dynamic: { type: 'boolean', nullable: true },
        },
      },
    },
    symbols: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'owner',
          'name',
          'kind',
          'public',
          'source',
          'annotations',
          'signatures',
          'overloads',
        ],
        properties: {
          id: { type: 'string', minLength: 1 },
          owner: { type: 'string', minLength: 1 },
          name: { type: 'string', minLength: 1 },
          kind: {
            enum: [
              'module',
              'callable',
              'constructor',
              'dynamic',
              'function',
              'property',
              'getter',
              'class',
              'alias',
              'global',
              'engine-global',
            ],
          },
          public: { type: 'boolean' },
          canonicalId: { type: 'string', minLength: 1, nullable: true },
          source: sourceLocationSchema,
          providers: {
            type: 'array',
            nullable: true,
            minItems: 2,
            items: sourceLocationSchema,
          },
          annotations: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
          signatures: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
          overloads: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
        },
      },
    },
    annotations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['path', 'line', 'member', 'annotations'],
        properties: {
          path: { type: 'string', minLength: 1 },
          line: { type: 'integer', minimum: 1 },
          member: { type: 'string', minLength: 1 },
          annotations: {
            type: 'array',
            minItems: 1,
            items: { type: 'string', minLength: 1 },
          },
        },
      },
    },
    declarationHints: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['path', 'line', 'kind', 'value'],
        properties: {
          path: { type: 'string', minLength: 1 },
          line: { type: 'integer', minimum: 1 },
          kind: { enum: ['signature', 'overload', 'typescript'] },
          value: { type: 'string', minLength: 1 },
        },
      },
    },
    assets: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'path'],
        properties: {
          id: { type: 'string', minLength: 1 },
          path: { type: 'string', minLength: 1 },
        },
      },
    },
    overrides: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'className', 'reason', 'source'],
        properties: {
          id: { type: 'string', minLength: 1 },
          className: { type: 'string', minLength: 1 },
          reason: { type: 'string', minLength: 1 },
          source: sourceLocationSchema,
        },
      },
    },
  },
} as const

/** Internal coverage schema retained for source-backed audit fixtures. */
export const internalCoverageSchema = {
  $id: 'https://qiaomu-s.github.io/MonkeyKing-Documentation/internal-api-coverage.schema.json',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'sourceRef', 'rules'],
  properties: {
    schemaVersion: { type: 'integer', const: 1 },
    sourceRef: { type: 'string', pattern: '^[0-9a-fA-F]{40}$' },
    rules: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'patterns', 'status'],
        properties: {
          id: { type: 'string', minLength: 1 },
          patterns: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: { type: 'string', minLength: 1 },
          },
          exclude: {
            type: 'array',
            uniqueItems: true,
            items: { type: 'string', minLength: 1 },
          },
          status: {
            enum: ['documented', 'alias', 'external', 'excluded'],
          },
          target: { type: 'string', minLength: 1 },
          reason: { type: 'string', minLength: 1, pattern: '\\S' },
        },
        allOf: [
          {
            if: {
              properties: { status: { enum: ['documented', 'external'] } },
              required: ['status'],
            },
            then: { required: ['target'] },
          },
          {
            if: {
              properties: { status: { const: 'excluded' } },
              required: ['status'],
            },
            then: { required: ['reason'] },
          },
          {
            if: {
              properties: { status: { const: 'alias' } },
              required: ['status'],
            },
            then: { not: { required: ['target'] } },
          },
        ],
      },
    },
  },
} as const

const publicSymbolKind = {
  enum: [
    'module',
    'callable',
    'constructor',
    'dynamic',
    'function',
    'property',
    'getter',
    'class',
    'alias',
    'global',
    'engine-global',
  ],
} as const

/** Public manifest schema (v3).  No source/provenance/version fields are permitted. */
export const manifestSchema = {
  $id: 'api-manifest.schema.json',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'modules', 'symbols'],
  properties: {
    schemaVersion: { type: 'integer', const: 3 },
    modules: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'name', 'className', 'aliases'],
        properties: {
          id: { type: 'string', minLength: 1 },
          name: { type: 'string', minLength: 1 },
          className: { type: 'string', minLength: 1 },
          aliases: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
          dynamic: { type: 'boolean' },
        },
      },
    },
    symbols: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'owner',
          'name',
          'kind',
          'public',
          'annotations',
          'signatures',
          'overloads',
        ],
        properties: {
          id: { type: 'string', minLength: 1 },
          owner: { type: 'string', minLength: 1 },
          name: { type: 'string', minLength: 1 },
          kind: publicSymbolKind,
          public: { const: true },
          canonicalId: { type: ['string', 'null'], minLength: 1 },
          annotations: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
          signatures: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
          overloads: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
        },
      },
    },
  },
} as const

/** Public coverage schema (v3).  Rules intentionally have no source ref or product version. */
export const coverageSchema = {
  $id: 'api-coverage.schema.json',
  type: 'object',
  additionalProperties: false,
  required: ['schemaVersion', 'rules'],
  properties: {
    schemaVersion: { type: 'integer', const: 3 },
    rules: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'patterns', 'status'],
        properties: {
          id: { type: 'string', minLength: 1 },
          patterns: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: { type: 'string', minLength: 1 },
          },
          status: {
            enum: ['documented', 'alias', 'external', 'excluded'],
          },
          target: { type: 'string', minLength: 1 },
          reason: { type: 'string', minLength: 1, pattern: '\\S' },
        },
        allOf: [
          {
            if: {
              properties: { status: { enum: ['documented', 'external'] } },
              required: ['status'],
            },
            then: { required: ['target'] },
          },
          {
            if: {
              properties: { status: { const: 'excluded' } },
              required: ['status'],
            },
            then: { required: ['reason'] },
          },
          {
            if: {
              properties: { status: { const: 'alias' } },
              required: ['status'],
            },
            then: { not: { required: ['target'] } },
          },
        ],
      },
    },
  },
} as const

export const gapsSchema = {
  $id: 'api-gaps.schema.json',
  type: 'object',
  additionalProperties: false,
  required: ['gaps'],
  properties: {
    gaps: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['symbolId', 'owner', 'name', 'kind', 'reason'],
        properties: {
          symbolId: { type: 'string', minLength: 1 },
          owner: { type: 'string', minLength: 1 },
          name: { type: 'string', minLength: 1 },
          kind: publicSymbolKind,
          expectedPage: { type: 'string', minLength: 1 },
          reason: { type: 'string', minLength: 1, pattern: '\\S' },
        },
      },
    },
  },
} as const
