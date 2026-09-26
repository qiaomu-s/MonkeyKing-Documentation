import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

const sourceReaderModulePath = '../scripts/api/' + 'source-reader'

async function loadSourceReader(): Promise<Record<string, any> | null> {
  try {
    return (await import(sourceReaderModulePath)) as Record<string, any>
  } catch {
    return null
  }
}

describe('Git source identity', () => {
  test('is stable across mirror origins and directories without an origin', async () => {
    const sourceReader = await loadSourceReader()
    expect(sourceReader, 'scripts/api/source-reader.ts must exist').not.toBeNull()
    if (!sourceReader) return

    const root = mkdtempSync(resolve(tmpdir(), 'monkeyking-source-reader-'))
    const mirror = resolve(root, 'mirror-checkout')
    const noOrigin = resolve(root, 'renamed-local-copy')
    mkdirSync(mirror)
    mkdirSync(noOrigin)
    execFileSync('git', ['init', '--quiet', mirror])
    execFileSync('git', [
      '-C',
      mirror,
      'remote',
      'add',
      'origin',
      'git@github.com:mirror-owner/renamed-fork.git',
    ])

    expect(sourceReader.MONKEYKING_SOURCE_REPOSITORY).toBe('qiaomu-s/MonkeyKing')
    expect(new sourceReader.GitSourceReader(mirror).repositoryName).toBe(
      'qiaomu-s/MonkeyKing',
    )
    expect(new sourceReader.GitSourceReader(noOrigin).repositoryName).toBe(
      'qiaomu-s/MonkeyKing',
    )
  })
})
