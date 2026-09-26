import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { extractApiManifest } from './extractor'
import { stableJson } from './model'
import { projectApiManifest } from './public-projection'
import { dynamicOverrides, MONKEYKING_API_BASELINE } from './overrides'
import {
  GitSourceReader,
  MONKEYKING_SOURCE_REPOSITORY,
} from './source-reader'

export interface ExtractArguments {
  readonly source: string
  readonly ref: string
  readonly check: boolean
  readonly workingTree: boolean
  readonly output: string
  /** Optional private-audit destination; never part of the public artifact. */
  readonly internalOutput?: string
}

export function parseExtractArguments(args: readonly string[]): ExtractArguments {
  let source: string | undefined
  let ref: string = MONKEYKING_API_BASELINE
  let check = false
  let workingTree = false
  let output = 'api-surface/manifest.json'
  let internalOutput: string | undefined

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
      case '--internal-output':
        internalOutput = args[++index] ?? ''
        break
      case '--check':
        check = true
        break
      case '--working-tree':
        workingTree = true
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
  if (internalOutput === '') {
    throw new Error('api:extract requires a non-empty --internal-output value.')
  }
  return {
    source,
    ref,
    check,
    workingTree,
    output,
    ...(internalOutput ? { internalOutput } : {}),
  }
}

export async function runExtract(arguments_: ExtractArguments): Promise<void> {
  const reader = new GitSourceReader(arguments_.source, arguments_.workingTree)
  const manifest = await extractApiManifest(reader, {
    repository: MONKEYKING_SOURCE_REPOSITORY,
    ref: arguments_.ref,
    overrides: dynamicOverrides,
  })
  const outputPath = resolve(process.cwd(), arguments_.output)
  const publicManifest = projectApiManifest(manifest)
  const output = stableJson(publicManifest)

  if (arguments_.internalOutput) {
    const internalOutputPath = resolve(process.cwd(), arguments_.internalOutput)
    mkdirSync(dirname(internalOutputPath), { recursive: true })
    writeFileSync(internalOutputPath, stableJson(manifest))
  }

  if (arguments_.check) {
    if (!existsSync(outputPath)) {
      throw new Error(`API manifest is missing: ${arguments_.output}`)
    }
    if (readFileSync(outputPath, 'utf8') !== output) {
      throw new Error(
        'API manifest drift detected. Run api:extract to refresh the public artifact.',
      )
    }
    process.stdout.write(
      `API manifest matches: ${publicManifest.modules.length} modules, ` +
        `${publicManifest.symbols.length} public symbols.\n`,
    )
    return
  }

  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, output)
  process.stdout.write(
    `Wrote ${arguments_.output}: ${publicManifest.modules.length} modules, ` +
      `${publicManifest.symbols.length} public symbols.\n`,
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
