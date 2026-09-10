const lexerModulePath = '../scripts/api/' + 'lexer'

async function loadLexer(): Promise<Record<string, any> | null> {
  try {
    return (await import(lexerModulePath)) as Record<string, any>
  } catch {
    return null
  }
}

describe('API source lexer', () => {
  test('masks comments and strings without changing source offsets', async () => {
    const lexer = await loadLexer()
    expect(lexer, 'scripts/api/lexer.ts must exist').not.toBeNull()
    if (!lexer) return

    const source = [
      'realCall(one, nested(two, three))',
      '// fakeCall(commented())',
      'val text = "fakeCall(inString)"',
      'val raw = """fakeCall(inRawString)"""',
      '/* outer fakeCall(block()) /* nested */ stillCommented() */',
      "val char = ')'",
    ].join('\n')

    const masked = lexer.maskNonCode(source) as string

    expect(masked).toHaveLength(source.length)
    expect(masked.split('\n')).toHaveLength(source.split('\n').length)
    expect(masked).toContain('realCall(one, nested(two, three))')
    expect(masked).not.toContain('fakeCall')
    expect(masked).not.toContain('stillCommented')
  })

  test('finds balanced ranges through nested calls', async () => {
    const lexer = await loadLexer()
    expect(lexer, 'scripts/api/lexer.ts must exist').not.toBeNull()
    if (!lexer) return

    const source = 'invoke(first, nested(second, listOf("ignored,comma")), last)'
    const open = source.indexOf('(')
    const range = lexer.findBalancedRange(source, open, '(', ')') as {
      start: number
      end: number
    }

    expect(source.slice(range.start, range.end + 1)).toBe(
      '(first, nested(second, listOf("ignored,comma")), last)',
    )
  })

  test('splits only at top-level delimiters', async () => {
    const lexer = await loadLexer()
    expect(lexer, 'scripts/api/lexer.ts must exist').not.toBeNull()
    if (!lexer) return

    expect(
      lexer.splitTopLevel(
        'first, nested(second, third), listOf("fourth,fifth"), last',
        ',',
      ),
    ).toEqual([
      'first',
      'nested(second, third)',
      'listOf("fourth,fifth")',
      'last',
    ])
  })
})
