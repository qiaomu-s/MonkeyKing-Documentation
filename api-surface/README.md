# API surface audit

Last audited: 2026-09-10

The source of truth is Monkey King 6.7.0 commit
`bafa2986212d27b6b59f1324f89548b72a810966`. Extraction reads that commit
through `git ls-tree` and `git show`; it never reads the source repository's
floating working tree.

- `manifest.json` is the deterministic public module and symbol inventory.
- `gaps.json` lists public symbols that do not yet resolve to a unique,
  addressable member section in the documentation.
- `coverage.json` is generated only when `gaps.json` is empty. A partial
  coverage file is intentionally not written.

Regenerate and verify the source manifest:

```bash
npm run api:extract -- \
  --source /path/to/MonkeyKing \
  --ref bafa2986212d27b6b59f1324f89548b72a810966

npm run api:extract -- \
  --source /path/to/MonkeyKing \
  --ref bafa2986212d27b6b59f1324f89548b72a810966 \
  --check
```

Recompute documentation coverage:

```bash
npm run api:coverage
```

This command always refreshes `gaps.json`. It exits non-zero while any public
symbol lacks a real target and writes `coverage.json` only after all gaps are
resolved. Once coverage is complete, validate the committed mapping with:

```bash
npm run api:coverage -- --check
npm run api:check
```

Every coverage rule matches exactly one public symbol. Alias rules resolve via
`canonicalId`; two non-alias symbols may not share a documentation target.
Runtime-computed or reflected surfaces must be declared explicitly in
`scripts/api/overrides.ts` with a fixed source location and reason.
