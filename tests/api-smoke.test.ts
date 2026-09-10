import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  parseSmokeOptions,
  quoteRemoteShellArgument,
  runApiSmoke,
  type CommandResult,
} from '../scripts/smoke/api'

describe('Monkey King API smoke runner', () => {
  test('quotes scripts for the remote Android shell', () => {
    expect(quoteRemoteShellArgument("a'b (c)\nline 2")).toBe(
      "'a'\\''b (c)\nline 2'",
    )
  })

  test('parses an explicit emulator serial and timeout', () => {
    expect(
      parseSmokeOptions([
        '--serial',
        'emulator-5554',
        '--timeout',
        '45000',
      ]),
    ).toMatchObject({
      serial: 'emulator-5554',
      timeoutMs: 45_000,
    })
  })

  test('rejects a missing serial', () => {
    expect(() => parseSmokeOptions([])).toThrow(/--serial/)
  })

  test('launches RunIntentActivity and waits for a unique pass marker', async () => {
    const calls: string[][] = []
    let logReads = 0
    let clock = 0
    const command = (
      _executable: string,
      args: readonly string[],
    ): CommandResult => {
      calls.push([...args])
      const joined = args.join(' ')
      if (joined.endsWith('get-state')) return { status: 0, stdout: 'device\n', stderr: '' }
      if (joined.includes('shell pm path')) {
        return {
          status: 0,
          stdout: 'package:/data/app/com.qiaomu.monkeyking/base.apk\n',
          stderr: '',
        }
      }
      if (joined.includes('logcat -d')) {
        logReads += 1
        return {
          status: 0,
          stdout: logReads === 1 ? '' : 'D/GlobalConsole: MKDOC_TEST:PASS:global,files\n',
          stderr: '',
        }
      }
      return { status: 0, stdout: 'ok\n', stderr: '' }
    }

    const result = await runApiSmoke(
      {
        serial: 'emulator-5554',
        timeoutMs: 2_000,
        pollIntervalMs: 100,
        marker: 'MKDOC_TEST',
      },
      {
        command,
        now: () => clock,
        sleep: async (milliseconds) => {
          clock += milliseconds
        },
      },
    )

    expect(result.marker).toBe('MKDOC_TEST')
    expect(result.log).toContain('MKDOC_TEST:PASS')
    expect(calls).toContainEqual([
      '-s',
      'emulator-5554',
      'shell',
      'am',
      'start',
      '-W',
      '-n',
      'com.qiaomu.monkeyking/com.qiaomu.monkeyking.external.open.RunIntentActivity',
      '--es',
      'script',
      expect.stringContaining('MKDOC_TEST'),
    ])
  })

  test('fails before launch when Monkey King is not installed', async () => {
    const command = (
      _executable: string,
      args: readonly string[],
    ): CommandResult => {
      const joined = args.join(' ')
      if (joined.endsWith('get-state')) return { status: 0, stdout: 'device\n', stderr: '' }
      if (joined.includes('shell pm path')) return { status: 1, stdout: '', stderr: 'not found' }
      return { status: 0, stdout: '', stderr: '' }
    }

    await expect(
      runApiSmoke(
        { serial: 'emulator-5554', marker: 'MKDOC_TEST' },
        { command },
      ),
    ).rejects.toThrow(/not installed/i)
  })

  test('keeps representative smoke coverage in the device script', () => {
    const smokeSource = readFileSync(
      resolve(process.cwd(), 'scripts/smoke/monkeyking-api-smoke.js'),
      'utf8',
    )

    for (const api of [
      'isNullish',
      'structuredClone',
      'cvt.bytes',
      'fmt.bytes',
      'pinyin.simple',
      'pinyin4j.of',
      'nanoid',
      'mime',
      'files.write',
      'sqlite.open',
      'zip.zipFile',
      'mediainfo',
    ]) {
      expect(smokeSource, `missing smoke coverage for ${api}`).toContain(api)
    }
  })
})
