import {
  findPlaceholderIssues,
  inspectContentQuality,
} from '../scripts/content/quality'

describe('documentation content quality', () => {
  test.each([
    '此章节待补充或完善。',
    'PENDING',
    'TODO: describe this member',
    '用于 xxx 事件。',
    '...',
  ])('rejects placeholder prose: %s', (placeholder) => {
    const issues = findPlaceholderIssues(
      `# Example\n\n${placeholder}\n`,
      'docs/api/example.md',
    )

    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({
      source: 'docs/api/example.md',
      line: 3,
    })
  })

  test('ignores placeholder-shaped text inside code and normal inline ellipses', () => {
    const markdown = [
      '# Example',
      '',
      '可以用 `TODO` 作为普通字符串，也可以写 try...catch。',
      '',
      '```js',
      'const PENDING = "待补充";',
      'function rest(...args) { return args; }',
      '```',
      '',
    ].join('\n')

    expect(findPlaceholderIssues(markdown, 'docs/api/example.md')).toEqual([])
  })

  test('does not treat the public TODO function as unfinished prose', () => {
    const markdown = [
      '# Global',
      '',
      '## [m] TODO',
      '',
      '### TODO(reason?)',
      '',
      '调用 `TODO()` 会抛出 NotImplementedError。',
      '',
    ].join('\n')

    expect(findPlaceholderIssues(markdown, 'docs/api/global.md')).toEqual([])
  })

  test('reports issues across the supplied content set', () => {
    const report = inspectContentQuality([
      { source: 'docs/a.md', markdown: '# A\n\n完整正文。\n' },
      { source: 'docs/b.md', markdown: '# B\n\n待完善。\n' },
    ])

    expect(report.scannedSourceCount).toBe(2)
    expect(report.issues).toHaveLength(1)
    expect(report.issues[0].source).toBe('docs/b.md')
  })
})
