# MonkeyKing Documentation VitePress Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy Docsify/static-generator documentation stack with a production VitePress 1.6.4 site for Monkey King while preserving the committed compatibility JSON contract.

**Architecture:** A typed 101-page content catalog is the source of truth for source moves, routes, navigation, and legacy JSON names. A deterministic Markdown migration layer rewrites only syntax and links that are unsafe under VitePress, while VitePress configuration generates both root-hosted web output and `/assets/docs/` Android output. Independent validators derive rendered headings and generated files so dead links, missing assets, unsafe Vue syntax, branding regressions, and JSON drift fail CI.

**Tech Stack:** Node.js 22, npm 11, TypeScript 5.9, VitePress 1.6.4, Vitest 3.2, Playwright 1.63, AJV 8, legacy `marked` 0.3.19 compatibility alias.

---

### Task 1: Establish the locked toolchain

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `.nvmrc`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Modify: `.gitignore`
- Test: `tests/toolchain.contract.test.ts`

- [x] **Step 1: Add failing contract tests for exact package identity, scripts, dependencies, Node range, and Playwright preview command.**
- [x] **Step 2: Run `npm test -- tests/toolchain.contract.test.ts` and confirm the missing root toolchain fails.**
- [x] **Step 3: Add the exact manifest and configuration, including `vitepress: 1.6.4` and `npm@11.17.0`.**
- [x] **Step 4: Run `npm ci --dry-run`, `npx tsc --noEmit`, and the toolchain contract test.**
- [x] **Step 5: Commit the toolchain baseline.**

### Task 2: Make the content catalog authoritative

**Files:**
- Create: `scripts/content/catalog.ts`
- Create: `scripts/check-content.ts`
- Test: `tests/content-catalog.test.ts`
- Test: `tests/content-catalog.types.test.ts`

- [x] **Step 1: Write tests that require exactly 101 entries, 42 aggregate entries, unique IDs/routes/sources, kebab-case targets, and complete coverage of retained/deleted legacy Markdown.**
- [x] **Step 2: Run the catalog tests and confirm they fail without the catalog.**
- [x] **Step 3: Define `ContentEntry` plus immutable `contentEntries`, section order, deleted sources, frozen JSON stems, and legacy-all order.**
- [x] **Step 4: Run `npm run check:content`, catalog tests, and TypeScript checking.**
- [x] **Step 5: Commit the typed content catalog.**

### Task 3: Preserve compatibility JSON generation

**Files:**
- Create: `scripts/json/legacy-parser.ts`
- Create: `scripts/json/build.ts`
- Create: `scripts/json/frozen.ts`
- Create: `scripts/json/legacy-document.schema.json`
- Create: `tests/fixtures/json/legacy-golden.md`
- Create: `tests/fixtures/json/legacy-golden.json`
- Test: `tests/json-compatibility.test.ts`
- Delete: `generator/**`
- Delete: `json/404.json`
- Delete: `json/coverpage.json`
- Delete: `json/sidebar.json`
- Delete: `json/toc.json`
- Delete: `json/util.json`

- [x] **Step 1: Add golden, corpus-parity, schema, alias, frozen-hash, inventory, recovery, and serialization tests.**
- [x] **Step 2: Run the JSON tests and confirm the TypeScript replacement is absent.**
- [x] **Step 3: Port the legacy parser with `marked-legacy@0.3.19`, preserving heading classification, cloning, parameter parsing, HTML formatting, and `all.json` concatenation order.**
- [x] **Step 4: Generate 101 active page outputs, byte-identical `monkeyking.json`/`autojs.json`, `all.json`, and retain the 10 hash-pinned frozen files.**
- [x] **Step 5: Run `npm run json:build`, `npm test -- tests/json-compatibility.test.ts`, and `git diff --exit-code -- json`.**
- [x] **Step 6: Remove the legacy generator and commit the compatibility implementation.**

### Task 4: Implement deterministic Markdown migration

**Files:**
- Create: `scripts/content/markdown-links.ts`
- Create: `scripts/content/fragment-overrides.ts`
- Create: `scripts/content/brand-policy.ts`
- Create: `scripts/migrate-content.ts`
- Test: `tests/content-migration.test.ts`
- Test: `tests/fixtures/content/link-cases.md`

- [ ] **Step 1: Add a failing migration test covering relative `.md` links, same-page fragments, catalog aliases, image paths, Vue interpolation, pseudo-tags, malformed backticks, brand replacements, explicit dead-link removals, and a second idempotent run.**

  The core assertions must include:

  ```ts
  expect(migrateMarkdown(input, context)).toBe(expected)
  expect(migrateMarkdown(migrateMarkdown(input, context), context)).toBe(expected)
  expect(resolveCatalogLink('api/global.md#waitcondition', current)).toBe(
    '../core/global.md#wait-condition',
  )
  ```

- [ ] **Step 2: Run `npm test -- tests/content-migration.test.ts` and confirm the missing migration functions fail.**
- [ ] **Step 3: Implement a Markdown-aware scanner that excludes fenced and inline code before escaping literal `{{`/`}}` and rewriting links.**
- [ ] **Step 4: Implement catalog-relative page rewrites, preserving `.md` in source files and mapping fragments through uniform and contextual override tables.**
- [ ] **Step 5: Implement explicit content repairs: 38 interpolation blocks, 5 pseudo-tags, 5 backtick errors, 13 page dead links, 223 invalid fragments, and 4 broken image references.**
- [ ] **Step 6: Implement context-scoped brand rules: current product/object/package/repository/domain names migrate; upstream attribution, changelog history, third-party names, and documented enum values remain allowlisted.**
- [ ] **Step 7: Re-run the focused test and TypeScript check, then commit the migration engine.**

### Task 5: Move and normalize the 101 content pages

**Files:**
- Create/modify: `docs/guide/**/*.md`
- Create/modify: `docs/project/**/*.md`
- Create/modify: `docs/api/**/*.md`
- Create/modify: `docs/reference/**/*.md`
- Create: `docs/public/images/*`
- Create: `docs/public/CNAME`
- Delete: `api/**/*.md`
- Delete: `api/static/**`
- Delete: `api/images/**`
- Delete: legacy `docs/*.html`, `docs/assets/**`, `docs/images/**`, and `docs/plugins/**`

- [ ] **Step 1: Add a failing inventory test that requires every catalog target to exist, every deleted source to be absent, exactly 37 migrated image files, and no missing referenced image.**
- [ ] **Step 2: Run `npm run check:content` and the inventory test to record the legacy-layout failures.**
- [ ] **Step 3: Run `npm run migrate:content` once to copy retained Markdown into catalog destinations and copy only existing images into `docs/public/images/`.**
- [ ] **Step 4: Remove Docsify entry/config/plugin/theme files and the six retired Markdown sources: `all.md`, `sidebar.md`, `toc.md`, `coverpage.md`, `404.md`, and `util.md`.**
- [ ] **Step 5: Run the migration a second time and require `git diff --exit-code` for the migrated content tree to prove idempotency.**
- [ ] **Step 6: Run the inventory, migration, catalog, JSON, and TypeScript tests, then commit the migrated corpus.**

### Task 6: Build the VitePress site and brand theme

**Files:**
- Create: `.vitepress/config.mts`
- Create: `.vitepress/navigation.ts`
- Create: `.vitepress/theme/index.ts`
- Create: `.vitepress/theme/custom.css`
- Create: `docs/index.md`
- Create: `docs/public/logo.png`
- Test: `tests/vitepress-config.test.ts`

- [ ] **Step 1: Add failing configuration tests for `srcDir: docs`, `srcExclude: superpowers/**`, `.html` routes, local search, catalog-derived nav/sidebar, CNAME, logo, social links, and environment-selected base/outDir.**
- [ ] **Step 2: Run the focused test and confirm the VitePress configuration modules are missing.**
- [ ] **Step 3: Generate nav and sidebar from `contentEntriesBySection` so route and title data are never duplicated.**
- [ ] **Step 4: Add a config factory equivalent to:**

  ```ts
  export function createDocsConfig(target: 'web' | 'android') {
    return defineConfig({
      srcDir: 'docs',
      srcExclude: ['superpowers/**'],
      base: target === 'android' ? '/assets/docs/' : '/',
      outDir: target === 'android' ? 'dist/android' : 'dist/web',
      cleanUrls: false,
      themeConfig: { search: { provider: 'local' } },
    })
  }
  ```

- [ ] **Step 5: Add the Monkey King home layout, `#00695C` theme tokens, accessible focus styles, dark mode support, and responsive defaults without replacing the standard VitePress document layout.**
- [ ] **Step 6: Run the config tests and TypeScript check, then commit the site shell.**

### Task 7: Add build and rendered-link verification

**Files:**
- Create: `scripts/build.ts`
- Create: `scripts/check-links.ts`
- Create: `scripts/content/rendered-pages.ts`
- Test: `tests/build-contract.test.ts`
- Test: `tests/rendered-links.test.ts`

- [ ] **Step 1: Add failing tests for target validation, isolated output directories, JSON publication, generated page count, rendered heading IDs, page links, fragments, and assets.**
- [ ] **Step 2: Run focused tests and confirm the orchestration/checker modules are missing.**
- [ ] **Step 3: Implement target-specific VitePress builds through `DOCS_BUILD_TARGET=web|android`, removing only the resolved `dist/web` or `dist/android` directory before a build.**
- [ ] **Step 4: Copy committed JSON to `dist/web/json/` after the web build and verify the copy byte-for-byte.**
- [ ] **Step 5: Parse generated HTML to build the authoritative route/ID inventory, then fail on any internal URL whose page, fragment, or asset is absent.**
- [ ] **Step 6: Assert Android HTML contains `/assets/docs/` internal pages/assets and no root-hosted internal dependency.**
- [ ] **Step 7: Run unit tests, `npm run build:web`, `npm run check:links`, and `npm run build:android`, then commit build verification.**

### Task 8: Cover user-facing behavior with Playwright

**Files:**
- Create: `tests/e2e/documentation.spec.ts`

- [ ] **Step 1: Add tests for desktop home navigation, an API page and TOC anchor, local search, theme switching, unknown-route 404, mobile navigation, and visible Monkey King branding.**
- [ ] **Step 2: Run `npm run test:e2e` and confirm failures identify any missing site behavior.**
- [ ] **Step 3: Fix only the VitePress config/theme/content issues revealed by those flows.**
- [ ] **Step 4: Re-run Playwright with zero failures and commit the browser coverage.**

### Task 9: Replace repository operations and publishing docs

**Files:**
- Create: `.github/workflows/pages.yml`
- Modify: `README.md`
- Delete: `project.json`
- Delete: remaining Docsify/generated HTML artifacts

- [ ] **Step 1: Add tests that parse the workflow and README for Node 22, `npm ci`, tests, both build targets, Pages artifact `dist/web`, concurrency, custom domain instructions, JSON workflow, and the explicit phase-two API-audit disclaimer.**
- [ ] **Step 2: Run the focused tests and confirm the legacy README/workflow fails the contract.**
- [ ] **Step 3: Add the GitHub Pages workflow with least-required permissions, cancellation-safe concurrency, validation before deployment, and official Pages actions.**
- [ ] **Step 4: Rewrite README development/deployment/Android/JSON instructions for MonkeyKing-Documentation and remove obsolete generator/project metadata.**
- [ ] **Step 5: Run the focused tests and commit repository operations.**

### Task 10: Final verification and integration

**Files:**
- Modify only files required by fresh verification failures.

- [ ] **Step 1: Run `npm ci` from the lock file.**
- [ ] **Step 2: Run `npx tsc --noEmit`.**
- [ ] **Step 3: Run `npm run check:content`, `npm run json:build`, and `git diff --exit-code -- json`.**
- [ ] **Step 4: Run `npm test` and record the test/file counts.**
- [ ] **Step 5: Run `npm run build:web`, `npm run check:links`, and `npm run build:android`.**
- [ ] **Step 6: Run `npm run test:e2e` and record the browser result.**
- [ ] **Step 7: Audit `git status`, `git diff --check`, generated inventory, brand allowlist residue, and the final commit range.**
- [ ] **Step 8: Merge the completed migration branch into `master` without rewriting history, preserving the approved root lock file.**
