import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { buildMarkdownDocumentIndexes } from '../scripts/content/markdown-links'

const mimeModulePath = '../scripts/api/' + 'mime-appendix'
const fixtureRoot = resolve(process.cwd(), 'tests/fixtures/api/mime')
const fixtureSource = readFileSync(resolve(fixtureRoot, 'Mime.kt'), 'utf8')
const fixtureDocument = readFileSync(resolve(fixtureRoot, 'document.md'), 'utf8')

async function loadMimeModule(): Promise<Record<string, any> | null> {
  try {
    return (await import(mimeModulePath)) as Record<string, any>
  } catch {
    return null
  }
}

function fixtureReader(source = fixtureSource) {
  return {
    repositoryName: 'fixture/MonkeyKing',
    resolveRef: () => '1111111111111111111111111111111111111111',
    listFiles: () => ['app/src/main/java/example/runtime/api/Mime.kt'],
    readFile: () => source,
  }
}

describe('MIME appendix generator', () => {
  test('parses only explicit constants and renders stable names, values and anchors', async () => {
    const mime = await loadMimeModule()
    expect(mime, 'scripts/api/mime-appendix.ts must exist').not.toBeNull()
    if (!mime) return

    const constants = mime.extractMimeConstants(fixtureSource, 2)

    expect(constants).toEqual([
      expect.objectContaining({
        name: 'APPLICATION_JSON',
        value: '"application/json"',
        anchor: 'mime-constant-application-json',
      }),
      expect.objectContaining({
        name: 'APPLICATION_JSON_ALIAS',
        value: 'APPLICATION_JSON',
        anchor: 'mime-constant-application-json-alias',
      }),
    ])
    expect(mime.renderMimeAppendix(constants)).toBe(
      [
        '| 稳定锚点 | 公开成员 | 常量值 |',
        '| --- | --- | --- |',
        '| <a id="mime-constant-application-json"></a> | `mime.APPLICATION_JSON` | `"application/json"` |',
        '| <a id="mime-constant-application-json-alias"></a> | `mime.APPLICATION_JSON_ALIAS` | `APPLICATION_JSON` |',
      ].join('\n'),
    )
  })

  test('replaces only marker contents and detects byte drift in check mode', async () => {
    const mime = await loadMimeModule()
    expect(mime, 'scripts/api/mime-appendix.ts must exist').not.toBeNull()
    if (!mime) return

    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-mime-appendix-'))
    const document = resolve(root, 'mime.md')
    writeFileSync(document, fixtureDocument)
    const options = {
      reader: fixtureReader(),
      ref: 'fixture-ref',
      document,
      check: false,
      expectedConstantCount: 2,
      sourcePath: 'app/src/main/java/example/runtime/api/Mime.kt',
    }

    mime.runMimeAppendixWithReader(options)
    const generated = readFileSync(document, 'utf8')
    expect(generated).toContain('mime-constant-application-json')
    expect(generated).toContain('Content before the generated appendix.')
    expect(generated).toContain('Content after the generated appendix.')
    expect(() =>
      mime.runMimeAppendixWithReader({ ...options, check: true }),
    ).not.toThrow()

    writeFileSync(document, generated.replace('application/json', 'text/plain'))
    expect(() =>
      mime.runMimeAppendixWithReader({ ...options, check: true }),
    ).toThrow(/drift/i)
  })

  test('rejects missing markers, duplicate names and unsupported values', async () => {
    const mime = await loadMimeModule()
    expect(mime, 'scripts/api/mime-appendix.ts must exist').not.toBeNull()
    if (!mime) return

    expect(() =>
      mime.replaceMimeAppendix('no generated markers', 'generated'),
    ).toThrow(/marker/i)
    expect(() =>
      mime.extractMimeConstants(
        `${fixtureSource}\n@JvmField\nval APPLICATION_JSON = "duplicate"\n`,
        3,
      ),
    ).toThrow(/duplicate/i)
    expect(() =>
      mime.extractMimeConstants(
        fixtureSource.replace(
          'val APPLICATION_JSON_ALIAS = APPLICATION_JSON',
          'val APPLICATION_JSON_ALIAS = createMimeType()',
        ),
        2,
      ),
    ).toThrow(/unsupported.*value/i)
  })

  test('indexes generated explicit anchors with the shared VitePress renderer', async () => {
    const mime = await loadMimeModule()
    expect(mime, 'scripts/api/mime-appendix.ts must exist').not.toBeNull()
    if (!mime) return

    const constants = mime.extractMimeConstants(fixtureSource, 2)
    const markdown = mime.replaceMimeAppendix(
      fixtureDocument,
      mime.renderMimeAppendix(constants),
    )
    const indexes = await buildMarkdownDocumentIndexes(
      [{ id: 'mime', markdown }],
      process.cwd(),
    )

    expect(indexes.get('mime')?.anchors).toContain(
      'mime-constant-application-json',
    )
  })

  test('parses source, ref, document and check flags explicitly', async () => {
    const mime = await loadMimeModule()
    expect(mime, 'scripts/api/mime-appendix.ts must exist').not.toBeNull()
    if (!mime) return

    expect(
      mime.parseMimeAppendixArguments([
        '--source',
        '/tmp/MonkeyKing',
        '--ref',
        'fixed-ref',
        '--document',
        '/tmp/mime.md',
        '--check',
      ]),
    ).toEqual({
      source: '/tmp/MonkeyKing',
      ref: 'fixed-ref',
      document: '/tmp/mime.md',
      check: true,
    })
    expect(() => mime.parseMimeAppendixArguments([])).toThrow(/--source/)
  })
})
