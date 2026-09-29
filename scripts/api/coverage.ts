import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { assertApiSurface } from './checker'
import { generateApiCoverageArtifacts } from './coverage-generator'
import {
  stableJson,
  type ApiManifest,
  type PublicApiCoverage,
  type PublicApiManifest,
} from './model'
import { isPublicApiManifest, projectApiGaps } from './public-projection'

export interface CoverageArguments {
  readonly root: string
  readonly manifest: string
  readonly output: string
  readonly gaps: string
  readonly check: boolean
  readonly internalManifest?: string
}

export function parseCoverageArguments(args: readonly string[]): CoverageArguments {
  let root = process.cwd()
  let manifest = 'api-surface/manifest.json'
  let output = 'api-surface/coverage.json'
  let gaps = 'api-surface/gaps.json'
  let check = false
  let internalManifest: string | undefined

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    switch (argument) {
      case '--root':
        root = args[++index] ?? ''
        break
      case '--manifest':
        manifest = args[++index] ?? ''
        break
      case '--output':
        output = args[++index] ?? ''
        break
      case '--gaps':
        gaps = args[++index] ?? ''
        break
      case '--internal-manifest':
        internalManifest = args[++index] ?? ''
        break
      case '--check':
        check = true
        break
      default:
        throw new Error(`Unknown api:coverage argument: ${argument}`)
    }
  }

  if (!root || !manifest || !output || !gaps) {
    throw new Error('api:coverage arguments must not be empty.')
  }
  if (internalManifest === '') {
    throw new Error('api:coverage requires a non-empty --internal-manifest value.')
  }
  return {
    root,
    manifest,
    output,
    gaps,
    check,
    ...(internalManifest ? { internalManifest } : {}),
  }
}

export async function runCoverage(arguments_: CoverageArguments): Promise<void> {
  const root = resolve(arguments_.root)
  const manifestPayload = JSON.parse(
    readFileSync(resolve(root, arguments_.manifest), 'utf8'),
  ) as ApiManifest | PublicApiManifest
  const outputPath = resolve(root, arguments_.output)
  const gapsPath = resolve(root, arguments_.gaps)

  // Public validation intentionally does not recreate route decisions without
  // the internal evidence model.  It validates the committed, already
  // projected artifacts instead.
  if (isPublicApiManifest(manifestPayload) && !arguments_.internalManifest) {
    if (!arguments_.check) {
      throw new Error(
        'Generating API coverage requires --internal-manifest <private audit file>.',
      )
    }
    if (!existsSync(gapsPath)) {
      throw new Error(`API coverage gap inventory is missing: ${arguments_.gaps}`)
    }
    const expectedGaps = stableJson({ gaps: [] })
    if (readFileSync(gapsPath, 'utf8') !== expectedGaps) {
      throw new Error('API coverage gap inventory is not empty or has drifted.')
    }
    if (!existsSync(outputPath)) {
      throw new Error(`API coverage is missing: ${arguments_.output}`)
    }
    const coverage = JSON.parse(
      readFileSync(outputPath, 'utf8'),
    ) as PublicApiCoverage
    const report = await assertApiSurface({
      manifest: manifestPayload,
      coverage,
      projectRoot: root,
    })
    process.stdout.write(
      `API coverage valid: ${report.mappedSymbolCount}/${report.publicSymbolCount} ` +
        'public symbols mapped.\n',
    )
    return
  }

  const routingManifest = arguments_.internalManifest
    ? (JSON.parse(
        readFileSync(resolve(root, arguments_.internalManifest), 'utf8'),
      ) as ApiManifest)
    : (manifestPayload as ApiManifest)
  const artifacts = await generateApiCoverageArtifacts({
    manifest: routingManifest,
    projectRoot: root,
  })
  const output = stableJson(artifacts.coverage)
  const gapsOutput = stableJson(projectApiGaps(artifacts.gaps))

  if (arguments_.check) {
    if (!existsSync(gapsPath)) {
      throw new Error(`API coverage gap inventory is missing: ${arguments_.gaps}`)
    }
    if (readFileSync(gapsPath, 'utf8') !== gapsOutput) {
      throw new Error('API coverage gap inventory drift detected. Run api:coverage.')
    }
    if (artifacts.gaps.length > 0) {
      throw new Error(
        `API coverage has ${artifacts.gaps.length} gaps; see ${arguments_.gaps}.`,
      )
    }
    if (!existsSync(outputPath)) {
      throw new Error(`API coverage is missing: ${arguments_.output}`)
    }
    if (readFileSync(outputPath, 'utf8') !== output) {
      throw new Error('API coverage drift detected. Run api:coverage.')
    }
    process.stdout.write(
      `API coverage matches the published contract: ` +
        `${artifacts.coverage.rules.length} rules.\n`,
    )
    return
  }

  mkdirSync(dirname(gapsPath), { recursive: true })
  writeFileSync(gapsPath, gapsOutput)
  if (artifacts.gaps.length > 0) {
    if (existsSync(outputPath)) rmSync(outputPath)
    throw new Error(
      `API coverage has ${artifacts.gaps.length} gaps; see ${arguments_.gaps}.`,
    )
  }

  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, output)
  const statuses = artifacts.coverage.rules.reduce<Record<string, number>>(
    (counts, rule) => {
      counts[rule.status] = (counts[rule.status] ?? 0) + 1
      return counts
    },
    {},
  )
  process.stdout.write(
    `Wrote ${arguments_.output}: ${artifacts.coverage.rules.length} rules ` +
      `(${statuses.documented ?? 0} documented, ${statuses.alias ?? 0} aliases, ` +
      `${statuses.external ?? 0} external).\n`,
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
  runCoverage(parseCoverageArguments(process.argv.slice(2))).catch((error) => {
    const message =
      error instanceof Error ? error.stack ?? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  })
}
