import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import {
  checkJavaScriptExamples,
  extractJavaScriptExamples,
} from '../scripts/examples/check'

function writeFixture(root: string, path: string, contents: string): void {
  const absolutePath = resolve(root, path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, contents)
}

describe('documentation example checks', () => {
  test('extracts JavaScript fences with source line numbers', () => {
    const markdown = [
      '# API',
      '',
      '```js',
      'const value = 1;',
      '```',
      '',
      '> ```javascript',
      '> console.log(value);',
      '> ```',
      '',
    ].join('\n')

    expect(extractJavaScriptExamples(markdown, 'docs/api/example.md')).toEqual([
      {
        source: 'docs/api/example.md',
        line: 3,
        code: 'const value = 1;\n',
      },
      {
        source: 'docs/api/example.md',
        line: 7,
        code: 'console.log(value);\n',
      },
    ])
  })

  test('reports empty, placeholder, and structurally invalid examples', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-examples-'))
    try {
      writeFixture(
        root,
        'docs/api/example.md',
        [
          '# Example',
          '',
          '```js',
          '```',
          '',
          '```javascript',
          '// TODO: 待补充',
          '```',
          '',
          '```js',
          'if (true) {',
          '```',
          '',
        ].join('\n'),
      )

      const report = checkJavaScriptExamples(root, ['docs/api/example.md'])

      expect(report.exampleCount).toBe(3)
      expect(report.errors.join('\n')).toMatch(/empty JavaScript example/i)
      expect(report.errors.join('\n')).toMatch(/placeholder/i)
      expect(report.errors.join('\n')).toMatch(/unclosed delimiter/i)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('accepts Rhino UI XML literals and spread syntax', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-rhino-examples-'))
    try {
      writeFixture(
        root,
        'docs/api/example.md',
        [
          '# Example',
          '',
          '```js',
          'ui.layout(<vertical><text text="Monkey King" /></vertical>);',
          'const xml = <sales><item price="4" /></sales>;',
          'const values = [1, 2, 3];',
          'console.log(...values);',
          '```',
          '',
        ].join('\n'),
      )

      expect(
        checkJavaScriptExamples(root, ['docs/api/example.md']).errors,
      ).toEqual([])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('reports missing documentation files', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-missing-example-'))
    try {
      expect(
        checkJavaScriptExamples(root, ['docs/api/missing.md']).errors,
      ).toEqual(['Missing documentation source: docs/api/missing.md'])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
