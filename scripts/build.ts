import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vitepress'
import { contentEntries } from './content/catalog'
import {
  validateRenderedPages,
  type RenderedPagesReport,
} from './content/rendered-pages'
import { expectedLegacyJsonFilenames } from './json/build'

export type DocsBuildTarget = 'web' | 'android'

export interface DocsBuildPlan {
  readonly target: DocsBuildTarget
  readonly projectRoot: string
  readonly docsRoot: string
  readonly outDir: string
}

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))

function assertDirectoryIfPresent(path: string, label: string): void {
  if (!existsSync(path)) return
  const stats = lstatSync(path)
  if (stats.isSymbolicLink()) {
    throw new Error(`Refusing symbolic link for ${label}: ${path}`)
  }
  if (!stats.isDirectory()) {
    throw new Error(`Expected directory for ${label}: ${path}`)
  }
}

function assertRegularFile(path: string, label: string): void {
  if (!existsSync(path)) throw new Error(`Missing ${label}: ${path}`)
  const stats = lstatSync(path)
  if (stats.isSymbolicLink()) {
    throw new Error(`Refusing symbolic link for ${label}: ${path}`)
  }
  if (!stats.isFile()) {
    throw new Error(`Expected regular file for ${label}: ${path}`)
  }
}

function expectedOutDir(projectRoot: string, target: DocsBuildTarget): string {
  return resolve(projectRoot, 'dist', target)
}

function validateBuildOutputPath(plan: DocsBuildPlan): void {
  const expected = expectedOutDir(plan.projectRoot, plan.target)
  if (resolve(plan.outDir) !== expected) {
    throw new Error('Build plan outDir does not match the selected target')
  }

  assertDirectoryIfPresent(
    resolve(plan.projectRoot, 'dist'),
    'build output parent',
  )
  assertDirectoryIfPresent(plan.outDir, 'build output')
}

export function createBuildPlan(
  targetValue?: string,
  projectRootValue = repositoryRoot,
): DocsBuildPlan {
  if (targetValue === undefined || targetValue === '') {
    throw new Error('Expected build target: web or android')
  }
  if (targetValue !== 'web' && targetValue !== 'android') {
    throw new Error(`Unsupported DOCS_BUILD_TARGET: ${targetValue}`)
  }

  const projectRoot = resolve(projectRootValue)
  const plan = Object.freeze({
    target: targetValue,
    projectRoot,
    docsRoot: resolve(projectRoot, 'docs'),
    outDir: expectedOutDir(projectRoot, targetValue),
  })
  validateBuildOutputPath(plan)
  return plan
}

export function cleanBuildOutput(plan: DocsBuildPlan): void {
  validateBuildOutputPath(plan)
  if (existsSync(plan.outDir)) {
    rmSync(plan.outDir, { recursive: true, force: true })
  }
}

function validateJsonInventory(directory: string, label: string): void {
  assertDirectoryIfPresent(directory, label)
  if (!existsSync(directory)) throw new Error(`Missing ${label}: ${directory}`)

  const entries = readdirSync(directory, { withFileTypes: true })
  const actual = entries.map(({ name }) => name).sort()
  const expected = [...expectedLegacyJsonFilenames]
  if (
    actual.length !== expected.length ||
    actual.some((name, index) => name !== expected[index])
  ) {
    throw new Error(
      `Invalid legacy JSON inventory for ${label}: expected ${expected.length} files, received ${actual.length}`,
    )
  }

  for (const entry of entries) {
    const path = resolve(directory, entry.name)
    if (entry.isSymbolicLink()) {
      throw new Error(`Refusing symbolic link for legacy JSON source: ${path}`)
    }
    if (!entry.isFile()) {
      throw new Error(`Expected regular JSON file for ${label}: ${path}`)
    }
    assertRegularFile(path, `${label} ${entry.name}`)
  }
}

export function verifyPublishedJson(
  sourceDirectory: string,
  destinationDirectory: string,
): void {
  validateJsonInventory(sourceDirectory, 'legacy JSON source')
  validateJsonInventory(destinationDirectory, 'published JSON destination')

  for (const filename of expectedLegacyJsonFilenames) {
    const source = readFileSync(resolve(sourceDirectory, filename))
    const destination = readFileSync(resolve(destinationDirectory, filename))
    if (!source.equals(destination)) {
      throw new Error(`Published JSON byte mismatch: ${filename}`)
    }
  }
}

export function publishWebJson(plan: DocsBuildPlan): void {
  if (plan.target !== 'web') {
    throw new Error('Compatibility JSON may only be published by the web build')
  }
  validateBuildOutputPath(plan)
  assertDirectoryIfPresent(plan.outDir, 'web build output')
  if (!existsSync(plan.outDir)) {
    throw new Error(`Missing web build output: ${plan.outDir}`)
  }

  const sourceDirectory = resolve(plan.projectRoot, 'json')
  validateJsonInventory(sourceDirectory, 'legacy JSON source')
  const destinationDirectory = resolve(plan.outDir, 'json')
  assertDirectoryIfPresent(destinationDirectory, 'published JSON destination')
  if (existsSync(destinationDirectory)) {
    rmSync(destinationDirectory, { recursive: true, force: true })
  }
  mkdirSync(destinationDirectory, { recursive: true })

  for (const filename of expectedLegacyJsonFilenames) {
    copyFileSync(
      resolve(sourceDirectory, filename),
      resolve(destinationDirectory, filename),
    )
  }
  verifyPublishedJson(sourceDirectory, destinationDirectory)
}

export function expectedRenderedHtmlFiles(): readonly string[] {
  return Object.freeze(
    [
      '404.html',
      'index.html',
      ...contentEntries.map(({ route }) => route.slice(1)),
    ].sort(),
  )
}

export function expectedSearchKeys(): readonly string[] {
  return Object.freeze(
    [
      'index.md',
      ...contentEntries.map(({ source }) =>
        source.slice('docs/'.length).replaceAll('/', '_'),
      ),
    ].sort(),
  )
}

function validateBuiltOutput(plan: DocsBuildPlan): RenderedPagesReport {
  const base = plan.target === 'android' ? '/assets/docs/' : '/'
  const report = validateRenderedPages({
    outputDirectory: plan.outDir,
    base,
    expectedHtmlFiles: expectedRenderedHtmlFiles(),
    expectedSearchKeys: expectedSearchKeys(),
    requireBaseForAbsoluteUrls: plan.target === 'android',
  })

  const jsonDirectory = resolve(plan.outDir, 'json')
  if (plan.target === 'android' && existsSync(jsonDirectory)) {
    throw new Error('Android build must not publish legacy JSON')
  }
  return report
}

export async function buildDocumentation(
  plan: DocsBuildPlan,
): Promise<RenderedPagesReport> {
  cleanBuildOutput(plan)
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

  const report = validateBuiltOutput(plan)
  if (plan.target === 'web') publishWebJson(plan)
  return report
}

function isDirectExecution(): boolean {
  const executable = process.argv[1]
  return (
    executable !== undefined &&
    pathToFileURL(resolve(executable)).href === import.meta.url
  )
}

async function main(): Promise<void> {
  const plan = createBuildPlan(process.argv[2])
  const report = await buildDocumentation(plan)
  process.stdout.write(
    `Built ${plan.target} documentation: ${report.htmlFileCount} HTML files, ` +
      `${report.referenceCount} internal references checked.\n`,
  )
}

if (isDirectExecution()) {
  main().catch((error: unknown) => {
    const message =
      error instanceof Error ? error.stack ?? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  })
}
