import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vitepress'

export type DocsBuildTarget = 'web' | 'android'

export interface DocsBuildPlan {
  readonly target: DocsBuildTarget
  readonly docsRoot: string
}

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))

export function createBuildPlan(targetValue?: string): DocsBuildPlan {
  if (targetValue === undefined || targetValue === '') {
    throw new Error('Expected build target: web or android')
  }
  if (targetValue !== 'web' && targetValue !== 'android') {
    throw new Error(`Unsupported DOCS_BUILD_TARGET: ${targetValue}`)
  }

  return Object.freeze({
    target: targetValue,
    docsRoot: resolve(repositoryRoot, 'docs'),
  })
}

export async function buildDocumentation(plan: DocsBuildPlan): Promise<void> {
  const previousTarget = process.env.DOCS_BUILD_TARGET
  process.env.DOCS_BUILD_TARGET = plan.target

  try {
    await build(plan.docsRoot)
  } finally {
    if (previousTarget === undefined) {
      delete process.env.DOCS_BUILD_TARGET
    } else {
      process.env.DOCS_BUILD_TARGET = previousTarget
    }
  }
}

function isDirectExecution(): boolean {
  const executable = process.argv[1]
  return (
    executable !== undefined &&
    pathToFileURL(resolve(executable)).href === import.meta.url
  )
}

async function main(): Promise<void> {
  await buildDocumentation(createBuildPlan(process.argv[2]))
}

if (isDirectExecution()) {
  main().catch((error: unknown) => {
    const message =
      error instanceof Error ? error.stack ?? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  })
}
