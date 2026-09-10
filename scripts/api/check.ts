import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { assertApiSurface } from './checker'
import type { ApiCoverage, ApiManifest } from './model'

export interface CheckArguments {
  readonly root: string
  readonly manifest: string
  readonly coverage: string
}

export function parseCheckArguments(args: readonly string[]): CheckArguments {
  let root = process.cwd()
  let manifest = 'api-surface/manifest.json'
  let coverage = 'api-surface/coverage.json'

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    switch (argument) {
      case '--root':
        root = args[++index] ?? ''
        break
      case '--manifest':
        manifest = args[++index] ?? ''
        break
      case '--coverage':
        coverage = args[++index] ?? ''
        break
      default:
        throw new Error(`Unknown api:check argument: ${argument}`)
    }
  }

  if (!root || !manifest || !coverage) {
    throw new Error('api:check arguments must not be empty.')
  }
  return { root, manifest, coverage }
}

export function runCheck(arguments_: CheckArguments): void {
  const root = resolve(arguments_.root)
  const manifest = JSON.parse(
    readFileSync(resolve(root, arguments_.manifest), 'utf8'),
  ) as ApiManifest
  const coverage = JSON.parse(
    readFileSync(resolve(root, arguments_.coverage), 'utf8'),
  ) as ApiCoverage
  const report = assertApiSurface({ manifest, coverage, projectRoot: root })
  process.stdout.write(
    `API coverage valid: ${report.mappedSymbolCount}/${report.publicSymbolCount} ` +
      'public symbols mapped.\n',
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
  try {
    runCheck(parseCheckArguments(process.argv.slice(2)))
  } catch (error) {
    const message =
      error instanceof Error ? error.stack ?? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  }
}
