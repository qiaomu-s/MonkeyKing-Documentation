import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const monkeyKingPackage = 'com.qiaomu.monkeyking'
const runIntentComponent =
  'com.qiaomu.monkeyking/com.qiaomu.monkeyking.external.open.RunIntentActivity'
const smokeTemplatePath = fileURLToPath(
  new URL('./monkeyking-api-smoke.js', import.meta.url),
)

export interface SmokeOptions {
  readonly serial: string
  readonly timeoutMs?: number
  readonly pollIntervalMs?: number
  readonly marker?: string
}

export interface ResolvedSmokeOptions {
  readonly serial: string
  readonly timeoutMs: number
  readonly pollIntervalMs: number
  readonly marker?: string
}

export interface CommandResult {
  readonly status: number | null
  readonly stdout: string
  readonly stderr: string
}

export interface SmokeDependencies {
  readonly command?: (
    executable: string,
    args: readonly string[],
  ) => CommandResult
  readonly now?: () => number
  readonly sleep?: (milliseconds: number) => Promise<void>
}

export interface SmokeResult {
  readonly marker: string
  readonly log: string
}

function positiveInteger(raw: string | undefined, option: string): number {
  const value = Number(raw)
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${option} must be a positive integer`)
  }
  return value
}

export function parseSmokeOptions(argv: readonly string[]): ResolvedSmokeOptions {
  let serial = process.env.ANDROID_SERIAL ?? ''
  let timeoutMs = 30_000
  let pollIntervalMs = 500

  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index]
    if (option === '--serial') {
      serial = argv[++index] ?? ''
    } else if (option === '--timeout') {
      timeoutMs = positiveInteger(argv[++index], '--timeout')
    } else if (option === '--poll-interval') {
      pollIntervalMs = positiveInteger(argv[++index], '--poll-interval')
    } else {
      throw new Error(`Unknown api:smoke option: ${option}`)
    }
  }

  if (serial.trim() === '') {
    throw new Error('api:smoke requires --serial <adb-serial>')
  }
  return { serial, timeoutMs, pollIntervalMs }
}

function defaultCommand(
  executable: string,
  args: readonly string[],
): CommandResult {
  const result = spawnSync(executable, [...args], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  })
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? result.error?.message ?? '',
  }
}

function commandFailure(label: string, result: CommandResult): Error {
  const detail = [result.stderr.trim(), result.stdout.trim()]
    .filter(Boolean)
    .join('\n')
  return new Error(`${label} failed${detail === '' ? '' : `:\n${detail}`}`)
}

function ensureSuccess(label: string, result: CommandResult): void {
  if (result.status !== 0) throw commandFailure(label, result)
}

function makeMarker(now: number): string {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `MKDOC_SMOKE_${now}_${random}`
}

export function quoteRemoteShellArgument(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`
}

function smokeSource(marker: string): string {
  return readFileSync(smokeTemplatePath, 'utf8').replaceAll(
    '__SMOKE_MARKER__',
    marker,
  )
}

export async function runApiSmoke(
  options: SmokeOptions,
  dependencies: SmokeDependencies = {},
): Promise<SmokeResult> {
  const command = dependencies.command ?? defaultCommand
  const now = dependencies.now ?? Date.now
  const sleep =
    dependencies.sleep ??
    ((milliseconds: number) =>
      new Promise<void>((resolveSleep) => setTimeout(resolveSleep, milliseconds)))
  const timeoutMs = options.timeoutMs ?? 30_000
  const pollIntervalMs = options.pollIntervalMs ?? 500
  const marker = options.marker ?? makeMarker(now())
  const adb = (...args: string[]) =>
    command('adb', ['-s', options.serial, ...args])

  const state = adb('get-state')
  ensureSuccess(`ADB device ${options.serial}`, state)
  if (state.stdout.trim() !== 'device') {
    throw new Error(
      `ADB device ${options.serial} is not ready: ${state.stdout.trim() || 'unknown state'}`,
    )
  }

  const packagePath = adb('shell', 'pm', 'path', monkeyKingPackage)
  if (
    packagePath.status !== 0 ||
    !packagePath.stdout.includes(`package:`)
  ) {
    throw new Error(
      `Monkey King (${monkeyKingPackage}) is not installed on ${options.serial}`,
    )
  }

  ensureSuccess('Clear device logcat', adb('logcat', '-c'))
  ensureSuccess(
    'Launch Monkey King API smoke script',
    adb(
      'shell',
      'am',
      'start',
      '-W',
      '-n',
      runIntentComponent,
      '--es',
      'script',
      quoteRemoteShellArgument(smokeSource(marker)),
    ),
  )

  const deadline = now() + timeoutMs
  let latestLog = ''
  while (now() <= deadline) {
    const logcat = adb(
      'logcat',
      '-d',
      '-v',
      'brief',
      'GlobalConsole:D',
      '*:S',
    )
    ensureSuccess('Read Monkey King smoke log', logcat)
    latestLog = logcat.stdout

    if (latestLog.includes(`${marker}:FAIL:`)) {
      throw new Error(`Monkey King API smoke failed:\n${latestLog.trim()}`)
    }
    if (latestLog.includes(`${marker}:PASS:`)) {
      return Object.freeze({ marker, log: latestLog })
    }
    await sleep(pollIntervalMs)
  }

  throw new Error(
    `Timed out after ${timeoutMs} ms waiting for ${marker}` +
      (latestLog.trim() === '' ? '' : `:\n${latestLog.trim()}`),
  )
}

function isDirectExecution(): boolean {
  const executable = process.argv[1]
  return executable !== undefined && pathToFileURL(resolve(executable)).href === import.meta.url
}

if (isDirectExecution()) {
  try {
    const result = await runApiSmoke(parseSmokeOptions(process.argv.slice(2)))
    console.log(`Monkey King API smoke passed: ${result.marker}`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
