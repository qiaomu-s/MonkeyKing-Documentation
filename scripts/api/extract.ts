import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { extractApiManifest } from './extractor'
import { manifestMatches, stableJson } from './model'
import { dynamicOverrides, MONKEYKING_API_BASELINE } from './overrides'
import { GitSourceReader } from './source-reader'

export interface ExtractArguments {
  readonly source: string
  readonly ref: string
  readonly check: boolean
  readonly output: string
}

export function parseExtractArguments(args: readonly string[]): ExtractArguments {
  let source: string | undefined
  let ref: string = MONKEYKING_API_BASELINE
  let check = false
  let output = 'api-surface/manifest.json'

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    switch (argument) {
      case '--source':
        source = args[++index]
        break
      case '--ref':
        ref = args[++index] ?? ''
        break
      case '--output':
        output = args[++index] ?? ''
        break
      case '--check':
        check = true
        break
      default:
        throw new Error(`Unknown api:extract argument: ${argument}`)
    }
  }

  if (!source) {
    throw new Error('api:extract requires --source <MonkeyKing repository>.')
  }
  if (!ref) throw new Error('api:extract requires a non-empty --ref value.')
  if (!output) throw new Error('api:extract requires a non-empty --output value.')
  return { source, ref, check, output }
}

export async function runExtract(arguments_: ExtractArguments): Promise<void> {
  const reader = new GitSourceReader(arguments_.source)
  const manifest = await extractApiManifest(reader, {
    ref: arguments_.ref,
    overrides: dynamicOverrides,
  })
  const outputPath = resolve(process.cwd(), arguments_.output)
  const output = stableJson(manifest)

  if (arguments_.check) {
    if (!existsSync(outputPath)) {
      throw new Error(`API manifest is missing: ${arguments_.output}`)
    }
    if (!manifestMatches(readFileSync(outputPath, 'utf8'), manifest)) {
      throw new Error(
        `API manifest drift detected. Run api:extract for ${manifest.source.commit}.`,
      )
    }
    process.stdout.write(
      `API manifest matches ${manifest.source.commit}: ` +
        `${manifest.modules.length} modules, ${manifest.symbols.length} symbols.\n`,
    )
    return
  }

  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, output)
  process.stdout.write(
    `Wrote ${arguments_.output} from ${manifest.source.commit}: ` +
      `${manifest.modules.length} modules, ${manifest.symbols.length} symbols.\n`,
  )
}

function isDirectExecution(): boolean {
  const executable = process.argv[1]
  return (
    executable !== undefined &&
    pathToFileURL(resolve(executable)).href === import.meta.url
  )
}

if (isDirectExecution()) {
  runExtract(parseExtractArguments(process.argv.slice(2))).catch((error) => {
    const message =
      error instanceof Error ? error.stack ?? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  })
}
