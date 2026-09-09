import { createHash } from 'node:crypto'
import {
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
    expect(existsSync(resolve(process.cwd(), 'api'))).toBe(false)
  })
})
