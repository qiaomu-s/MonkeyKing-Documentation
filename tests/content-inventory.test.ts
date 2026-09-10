import { createHash } from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { checkContent } from '../scripts/check-content'
import {
  contentEntries,
  deletedLegacySources,
} from '../scripts/content/catalog'
import { migratedImageNames } from '../scripts/migrate-content'

const expectedCname = 'docs.monkeyking.com\n'
const expectedLogoSha256 =
  'a7bc5657e071e590708783a107a94f0f550f23d95769eab6b9ed4b633fd67e32'

function writeFixture(root: string, repositoryPath: string, content = ''): void {
  const path = resolve(root, repositoryPath)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

function writeLegacyFixture(root: string): void {
  for (const source of [
    ...contentEntries.map(({ legacySource }) => legacySource),
    ...deletedLegacySources,
  ]) {
    writeFixture(root, source)
  }
}

function writeCanonicalFixture(root: string): void {
  for (const { source } of contentEntries) writeFixture(root, source)
  for (const imageName of migratedImageNames) {
    writeFixture(root, `docs/public/images/${imageName}`, imageName)
  }
  copyFileSync(
    resolve(process.cwd(), 'docs/public/images/logo.png'),
    resolve(root, 'docs/public/images/logo.png'),
  )
  copyFileSync(
    resolve(process.cwd(), 'docs/public/images/logo.png'),
    resolve(root, 'docs/public/logo.png'),
  )
  writeFixture(root, 'docs/public/CNAME', expectedCname)
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

describe('content inventory', () => {
  test('checks a complete legacy tree without requiring canonical files', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-legacy-inventory-'))
    try {
      writeLegacyFixture(root)
      const report = checkContent(root)

      expect(report.phase).toBe('legacy')
      expect(report.errors).toEqual([])
      expect(report.legacyMarkdownCount).toBe(107)
      expect(report.canonicalMarkdownCount).toBe(0)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('rejects a mixed legacy and canonical tree', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-mixed-inventory-'))
    try {
      writeLegacyFixture(root)
      writeFixture(root, contentEntries[0].source)
      const report = checkContent(root)

      expect(report.phase).toBe('mixed')
      expect(report.errors.join('\n')).toMatch(/mixed legacy and canonical/i)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('rejects a canonical image reference whose file is missing', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-image-inventory-'))
    try {
      writeCanonicalFixture(root)
      writeFixture(
        root,
        contentEntries[0].source,
        '# Overview\n\n![Missing](/images/missing.png)\n',
      )
      const report = checkContent(root)

      expect(report.phase).toBe('canonical')
      expect(report.errors.join('\n')).toMatch(
        /missing image reference.*missing\.png/i,
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test.each([
    [
      'multiline inline destination',
      '![Missing](\n  /images/missing-inline.png\n)\n',
      'missing-inline.png',
    ],
    [
      'multiline reference definition and usage',
      '![Missing]\n[missing-ref]\n\n[missing-ref]:\n  /images/missing-reference.png\n',
      'missing-reference.png',
    ],
    [
      'multiline HTML src',
      '<img\n  alt="Missing"\n  src = "/images/missing-html.png"\n>\n',
      'missing-html.png',
    ],
    [
      'multiline HTML srcset',
      '<source\n  srcset="/images/ex1.png 1x,\n    /images/missing-srcset.png 2x"\n>\n',
      'missing-srcset.png',
    ],
    [
      'unquoted HTML src',
      '<img src=/images/missing-unquoted.png alt="Missing">\n',
      'missing-unquoted.png',
    ],
  ])('rejects a missing image in %s', (_kind, markdown, missingName) => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-image-syntax-'))
    try {
      writeCanonicalFixture(root)
      writeFixture(root, contentEntries[0].source, `# Overview\n\n${markdown}`)

      const report = checkContent(root)

      expect(report.errors.join('\n')).toMatch(
        new RegExp(`missing image reference.*${missingName}`, 'i'),
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('ignores image-like syntax in code ranges and unused link definitions', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-image-code-'))
    try {
      writeCanonicalFixture(root)
      writeFixture(
        root,
        contentEntries[0].source,
        '# Overview\n\n' +
          '`![Inline](/images/missing-inline-code.png)`\n\n' +
          '```md\n![Fence](/images/missing-fence.png)\n```\n\n' +
          '[ordinary-link]:\n  /images/missing-unused.png\n\n' +
          '[Ordinary][ordinary-link]\n' +
          '![Existing](/images/ex1.png)\n',
      )

      expect(checkContent(root).errors).toEqual([])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('ignores image-like syntax in HTML comments and CommonMark indented code', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-image-protected-'))
    try {
      writeCanonicalFixture(root)
      writeFixture(
        root,
        contentEntries[0].source,
        '# Overview\n\n' +
          '<!-- ![Comment](/images/missing-comment)\n' +
          '<img src="/images/missing-comment-html.png"> -->\n\n' +
          '    ![Indented](/images/missing-indented)\n' +
          '\t<img src="/images/missing-tabbed.png">\n\n' +
          '![Existing](/images/ex1.png)\n',
      )

      expect(checkContent(root).errors).toEqual([])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('still checks real images adjacent to comments and indented code', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-image-adjacent-'))
    try {
      writeCanonicalFixture(root)
      writeFixture(
        root,
        contentEntries[0].source,
        '# Overview\n\n' +
          '<!-- ![Ignored](/images/missing-comment) -->\n' +
          '    ![Ignored](/images/missing-indented)\n\n' +
          '![Missing](/images/missing-real)\n',
      )

      const errors = checkContent(root).errors.join('\n')
      expect(errors).toMatch(/missing image reference.*missing-real/i)
      expect(errors).not.toMatch(/missing-comment|missing-indented/i)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('resolves blockquoted reference images with prefixed continuation lines', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-image-quote-ref-'))
    try {
      writeCanonicalFixture(root)
      writeFixture(
        root,
        contentEntries[0].source,
        '# Overview\n\n' +
          '> ![Missing]\n' +
          '> [quoted-ref]\n' +
          '>\n' +
          '> [quoted-ref]:\n' +
          '>   /images/missing-quoted.png\n',
      )

      expect(checkContent(root).errors.join('\n')).toMatch(
        /missing image reference.*missing-quoted\.png/i,
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('rejects a local image target without a filename extension', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-image-extensionless-'))
    try {
      writeCanonicalFixture(root)
      writeFixture(
        root,
        contentEntries[0].source,
        '# Overview\n\n![Missing](/images/missing?v=1#hero)\n',
      )

      expect(checkContent(root).errors.join('\n')).toMatch(
        /missing image reference.*\/images\/missing/i,
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test.each(['images/missing', '#images/missing'])(
    'rejects a non-canonical extensionless local image target: %s',
    (target) => {
      const root = mkdtempSync(
        resolve(tmpdir(), 'monkeyking-image-noncanonical-'),
      )
      try {
        writeCanonicalFixture(root)
        writeFixture(
          root,
          contentEntries[0].source,
          `# Overview\n\n![Missing](${target})\n`,
        )

        expect(checkContent(root).errors.join('\n')).toMatch(
          /non-canonical image reference/i,
        )
      } finally {
        rmSync(root, { recursive: true, force: true })
      }
    },
  )

  test('checks image references in the published home page', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-home-image-'))
    try {
      writeCanonicalFixture(root)
      writeFixture(root, 'docs/index.md', '![Missing](/images/missing-home.png)\n')

      expect(checkContent(root).errors.join('\n')).toMatch(
        /missing image reference.*missing-home\.png/i,
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('checks legacy brands in the published home page', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-home-brand-'))
    try {
      writeCanonicalFixture(root)
      writeFixture(root, 'docs/index.md', '# Home\n\nAUTOJS6\n')

      expect(checkContent(root).errors.join('\n')).toMatch(
        /docs\/index\.md:3: AUTOJS6/,
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('rejects a drifted committed brand logo', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-brand-logo-'))
    try {
      writeCanonicalFixture(root)
      writeFixture(root, 'docs/public/logo.png', 'drifted-logo')

      expect(checkContent(root).errors.join('\n')).toMatch(
        /invalid public logo.*sha-256/i,
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test.each([
    'docs/rogue.txt',
    'docs/api/core/rogue.txt',
    'docs/.vitepress/rogue.ts',
  ])('rejects an unplanned canonical artifact: %s', (artifact) => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-docs-artifact-'))
    try {
      writeCanonicalFixture(root)
      writeFixture(root, artifact, 'rogue\n')

      expect(checkContent(root).errors.join('\n')).toMatch(
        /unexpected canonical artifact.*rogue/i,
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('allows only the planned VitePress shell plus excluded superpowers files', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-site-shell-'))
    try {
      writeCanonicalFixture(root)
      for (const path of [
        'docs/index.md',
        'docs/.vitepress/config.mts',
        'docs/.vitepress/navigation.ts',
        'docs/.vitepress/theme/Layout.vue',
        'docs/.vitepress/theme/components/HomeApiSearch.vue',
        'docs/.vitepress/theme/custom.css',
        'docs/.vitepress/theme/env.d.ts',
        'docs/.vitepress/theme/index.ts',
        'docs/.vitepress/theme/search-focus.ts',
        'docs/superpowers/plans/keep.md',
        'docs/superpowers/nested/bytes.bin',
      ]) {
        writeFixture(root, path, 'planned\n')
      }

      expect(checkContent(root).errors).toEqual([])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('matches the canonical repository inventory exactly', () => {
    const report = checkContent(process.cwd())

    expect(report.phase).toBe('canonical')
    expect(report.errors).toEqual([])
    expect(report.legacyMarkdownCount).toBe(0)
    expect(report.canonicalMarkdownCount).toBe(101)
    expect(report.imageCount).toBe(37)
    expect(migratedImageNames).toHaveLength(37)
    expect(new Set(migratedImageNames).size).toBe(37)
    expect(
      migratedImageNames.filter((name) =>
        name.startsWith('monkeyking-notification-'),
      ),
    ).toHaveLength(16)
    expect(
      migratedImageNames.some((name) => name.startsWith('autojs6-notification-')),
    ).toBe(false)
    expect(readFileSync(resolve(process.cwd(), 'docs/public/CNAME'), 'utf8')).toBe(
      expectedCname,
    )
    expect(
      sha256(resolve(process.cwd(), 'docs/public/images/logo.png')),
    ).toBe(expectedLogoSha256)
    expect(sha256(resolve(process.cwd(), 'docs/public/logo.png'))).toBe(
      expectedLogoSha256,
    )
    expect(existsSync(resolve(process.cwd(), 'api'))).toBe(false)
  })
})
