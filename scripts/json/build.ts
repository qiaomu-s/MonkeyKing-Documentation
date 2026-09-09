import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { createHash } from 'node:crypto'
import Ajv2020 from 'ajv/dist/2020.js'
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep,
  win32,
} from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  contentEntries,
  frozenLegacyJsonStems,
  legacyAllEntryIds,
  validateContentCatalog,
} from '../content/catalog'
import type { ContentEntry } from '../content/catalog'
import { frozenLegacyJsonManifest } from './frozen'
import {
  parseLegacyMarkdown,
  stringifyLegacyDocument,
  stripLegacyComments,
} from './legacy-parser'

export interface LegacyJsonOutput {
  readonly filename: string
  readonly text: string
}

export interface LegacyJsonBuildOptions {
  readonly catalogValidator?: () => readonly string[]
  readonly afterStageFile?: (
    filename: string,
    stagingDirectory: string,
  ) => void
  readonly renameDirectory?: (source: string, destination: string) => void
}

export const retiredLegacyJsonFilenames = Object.freeze([
  '404.json',
  'coverpage.json',
  'sidebar.json',
  'toc.json',
  'util.json',
] as const)

const expectedGeneratedJsonFilenames = Object.freeze([
  ...contentEntries.flatMap((entry) =>
    entry.legacyJsonNames.map((name) => `${name}.json`),
  ),
  'all.json',
])

export const expectedLegacyJsonFilenames = Object.freeze([
  ...expectedGeneratedJsonFilenames,
  ...frozenLegacyJsonManifest.map(({ stem }) => `${stem}.json`),
].sort())

const safeLegacyJsonStem = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/
const legacyDocumentSchema = JSON.parse(
  readFileSync(new URL('./legacy-document.schema.json', import.meta.url), 'utf8'),
) as object
const validateLegacyDocument = new Ajv2020({ allErrors: true }).compile(
  legacyDocumentSchema,
)

export function resolveWithin(
  baseDirectory: string,
  relativePath: string,
): string {
  if (
    !relativePath ||
    relativePath.includes('\0') ||
    isAbsolute(relativePath) ||
    win32.isAbsolute(relativePath) ||
    /^[A-Za-z]:/.test(relativePath) ||
    relativePath.split(/[\\/]+/).includes('..')
  ) {
    throw new Error(`Unsafe path outside base directory: ${relativePath}`)
  }

  const base = resolve(baseDirectory)
  const candidate = resolve(base, relativePath)
  const pathFromBase = relative(base, candidate)
  if (
    pathFromBase === '..' ||
    pathFromBase.startsWith(`..${sep}`) ||
    isAbsolute(pathFromBase)
  ) {
    throw new Error(`Unsafe path escape from ${base}: ${relativePath}`)
  }

  return candidate
}

function assertSafeLegacyJsonStem(stem: string, context: string): void {
  if (!safeLegacyJsonStem.test(stem)) {
    throw new Error(`Unsafe legacy JSON stem for ${context}: ${stem}`)
  }
}

function assertRegularFile(path: string, context: string): void {
  const stats = lstatSync(path)
  if (stats.isSymbolicLink()) {
    throw new Error(`Refusing symbolic link for ${context}: ${path}`)
  }
  if (!stats.isFile()) {
    throw new Error(`Expected regular file for ${context}: ${path}`)
  }
}

function assertRegularDirectory(path: string, context: string): void {
  const stats = lstatSync(path)
  if (stats.isSymbolicLink()) {
    throw new Error(`Refusing symbolic link for ${context}: ${path}`)
  }
  if (!stats.isDirectory()) {
    throw new Error(`Expected regular directory for ${context}: ${path}`)
  }
}

function assertRealPathWithin(
  baseDirectory: string,
  candidatePath: string,
  context: string,
): void {
  const realBase = realpathSync(baseDirectory)
  const realCandidate = realpathSync(candidatePath)
  const pathFromBase = relative(realBase, realCandidate)
  if (
    pathFromBase === '..' ||
    pathFromBase.startsWith(`..${sep}`) ||
    isAbsolute(pathFromBase)
  ) {
    throw new Error(`Resolved path escapes project root for ${context}: ${candidatePath}`)
  }
}

function resolveJsonOutputPath(jsonDirectory: string, filename: string): string {
  if (basename(filename) !== filename || !filename.endsWith('.json')) {
    throw new Error(`Unsafe JSON output basename: ${filename}`)
  }
  assertSafeLegacyJsonStem(filename.slice(0, -'.json'.length), filename)
  return resolveWithin(jsonDirectory, filename)
}

export function resolveEntryMarkdownPath(
  rootDirectory: string,
  entry: ContentEntry,
): string {
  const canonicalPath = resolveWithin(rootDirectory, entry.source)
  if (existsSync(canonicalPath)) {
    assertRegularFile(canonicalPath, `canonical Markdown input ${entry.id}`)
    assertRealPathWithin(rootDirectory, canonicalPath, entry.id)
    return canonicalPath
  }

  const legacyPath = resolveWithin(rootDirectory, entry.legacySource)
  if (existsSync(legacyPath)) {
    assertRegularFile(legacyPath, `legacy Markdown input ${entry.id}`)
    assertRealPathWithin(rootDirectory, legacyPath, entry.id)
    return legacyPath
  }

  throw new Error(
    `Missing Markdown input for ${entry.id}: neither ${entry.source} nor ${entry.legacySource} exists`,
  )
}

export function createLegacyJsonOutputs(
  rootDirectory: string,
): readonly LegacyJsonOutput[] {
  const outputs: LegacyJsonOutput[] = []

  for (const entry of contentEntries) {
    const legacyStem = basename(entry.legacySource, extname(entry.legacySource))
    assertSafeLegacyJsonStem(legacyStem, entry.legacySource)
    const input = readFileSync(resolveEntryMarkdownPath(rootDirectory, entry), 'utf8')
    const text = stringifyLegacyDocument(
      parseLegacyMarkdown(input, `..\\api\\${legacyStem}.md`),
    )

    for (const jsonName of entry.legacyJsonNames) {
      assertSafeLegacyJsonStem(jsonName, entry.id)
      outputs.push({ filename: `${jsonName}.json`, text })
    }
  }

  const entriesById = new Map(contentEntries.map((entry) => [entry.id, entry]))
  const allMarkdown =
    legacyAllEntryIds
      .map((entryId) => {
        const entry = entriesById.get(entryId)
        if (!entry) {
          throw new Error(`Unknown legacy all-document entry id: ${entryId}`)
        }
        const legacyStem = basename(entry.legacySource, extname(entry.legacySource))
        assertSafeLegacyJsonStem(legacyStem, entry.legacySource)
        const body = stripLegacyComments(
          readFileSync(resolveEntryMarkdownPath(rootDirectory, entry), 'utf8'),
        )
        return `<!-- [start-include:${legacyStem}.md] -->\n${body}\n<!-- [end-include:${legacyStem}.md] -->\n`
      })
      .join('\n\n') + '\n'

  outputs.push({
    filename: 'all.json',
    text: stringifyLegacyDocument(
      parseLegacyMarkdown(allMarkdown, '..\\api\\all.md'),
    ),
  })

  return outputs
}

export function buildLegacyJson(
  rootDirectory = process.cwd(),
  options: LegacyJsonBuildOptions = {},
): void {
  validateCatalog(options.catalogValidator ?? validateContentCatalog)
  validateFrozenManifest()

  const projectRoot = resolve(rootDirectory)
  assertRegularDirectory(projectRoot, 'project root')
  const jsonDirectory = resolveWithin(projectRoot, 'json')
  assertRegularDirectory(jsonDirectory, 'legacy JSON output')
  verifyFrozenLegacyJson(jsonDirectory, 'before build')
  validateExistingJsonInventory(jsonDirectory)

  const outputs = createLegacyJsonOutputs(projectRoot)
  const stagingDirectory = mkdtempSync(
    resolveWithin(dirname(jsonDirectory), '.json-staging-'),
  )

  try {
    stageLegacyJson(
      jsonDirectory,
      stagingDirectory,
      outputs,
      options.afterStageFile,
    )
    verifyFrozenLegacyJson(stagingDirectory, 'in staging')
    validateFinalJsonInventory(stagingDirectory)
    validateJsonSchema(stagingDirectory)
    commitStagedDirectory(
      jsonDirectory,
      stagingDirectory,
      options.renameDirectory ?? renameSync,
    )
  } finally {
    if (existsSync(stagingDirectory)) {
      rmSync(stagingDirectory, { recursive: true, force: true })
    }
  }
}

function validateCatalog(validator: () => readonly string[]): void {
  const errors = validator()
  if (errors.length > 0) {
    throw new Error(`Invalid content catalog:\n- ${errors.join('\n- ')}`)
  }
}

function validateFrozenManifest(): void {
  const manifestStems = frozenLegacyJsonManifest.map(({ stem }) => stem)
  if (
    manifestStems.length !== frozenLegacyJsonStems.length ||
    !manifestStems.every((stem, index) => stem === frozenLegacyJsonStems[index])
  ) {
    throw new Error('Frozen legacy JSON manifest does not match the content catalog')
  }
}

function stageLegacyJson(
  sourceJsonDirectory: string,
  stagingDirectory: string,
  outputs: readonly LegacyJsonOutput[],
  afterStageFile?: (filename: string, stagingDirectory: string) => void,
): void {
  assertRegularDirectory(stagingDirectory, 'legacy JSON staging output')

  for (const { filename, text } of outputs) {
    writeFileSync(resolveJsonOutputPath(stagingDirectory, filename), text)
    afterStageFile?.(filename, stagingDirectory)
  }

  for (const { stem } of frozenLegacyJsonManifest) {
    const filename = `${stem}.json`
    const sourcePath = resolveJsonOutputPath(sourceJsonDirectory, filename)
    assertRegularFile(sourcePath, `frozen legacy JSON ${filename}`)
    copyFileSync(
      sourcePath,
      resolveJsonOutputPath(stagingDirectory, filename),
    )
    afterStageFile?.(filename, stagingDirectory)
  }
}

function commitStagedDirectory(
  jsonDirectory: string,
  stagingDirectory: string,
  renameDirectory: (source: string, destination: string) => void,
): void {
  const parentDirectory = dirname(jsonDirectory)
  const backupDirectory = mkdtempSync(
    resolveWithin(parentDirectory, '.json-backup-'),
  )
  rmSync(backupDirectory, { recursive: true })

  try {
    renameDirectory(jsonDirectory, backupDirectory)
    try {
      renameDirectory(stagingDirectory, jsonDirectory)
    } catch (commitError) {
      try {
        renameDirectory(backupDirectory, jsonDirectory)
      } catch (recoveryError) {
        throw new AggregateError(
          [commitError, recoveryError],
          `Failed to commit staged JSON and restore the original directory; backup retained at ${backupDirectory}`,
        )
      }
      throw commitError
    }

    rmSync(backupDirectory, { recursive: true })
  } finally {
    if (existsSync(stagingDirectory)) {
      rmSync(stagingDirectory, { recursive: true, force: true })
    }
    if (existsSync(backupDirectory) && existsSync(jsonDirectory)) {
      rmSync(backupDirectory, { recursive: true, force: true })
    }
  }
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function outputFilenames(jsonDirectory: string): string[] {
  if (!existsSync(jsonDirectory)) {
    throw new Error(`Missing JSON output directory: ${jsonDirectory}`)
  }

  return readdirSync(jsonDirectory).sort()
}

function verifyFrozenLegacyJson(
  jsonDirectory: string,
  phase: string,
): void {
  for (const { stem, sha256: expectedHash } of frozenLegacyJsonManifest) {
    const frozenPath = resolveJsonOutputPath(jsonDirectory, `${stem}.json`)
    if (!existsSync(frozenPath)) {
      throw new Error(`Missing frozen legacy JSON ${phase}: ${stem}.json`)
    }
    assertRegularFile(frozenPath, `frozen legacy JSON ${stem}.json`)

    const actualHash = sha256(frozenPath)
    if (actualHash !== expectedHash) {
      throw new Error(
        `Frozen legacy JSON hash mismatch ${phase}: ${stem}.json expected ${expectedHash}, received ${actualHash}`,
      )
    }
  }
}

function validateExistingJsonInventory(jsonDirectory: string): void {
  validateExistingOutputFiles(jsonDirectory)
  const allowed = new Set([
    ...expectedLegacyJsonFilenames,
    ...retiredLegacyJsonFilenames,
  ])
  const unexpected = outputFilenames(jsonDirectory).filter(
    (filename) => !allowed.has(filename),
  )

  if (unexpected.length > 0) {
    throw new Error(`Unexpected JSON file(s): ${unexpected.join(', ')}`)
  }
}

function validateExistingOutputFiles(jsonDirectory: string): void {
  for (const entry of readdirSync(jsonDirectory, { withFileTypes: true })) {
    const outputPath = resolveWithin(jsonDirectory, entry.name)
    assertRegularFile(outputPath, `existing JSON output ${entry.name}`)
  }
}

function validateFinalJsonInventory(jsonDirectory: string): void {
  validateExistingOutputFiles(jsonDirectory)
  const actual = outputFilenames(jsonDirectory)
  const missing = expectedLegacyJsonFilenames.filter(
    (filename) => !actual.includes(filename),
  )
  const unexpected = actual.filter(
    (filename) => !expectedLegacyJsonFilenames.includes(filename),
  )

  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(
      `Invalid final JSON inventory; missing: ${missing.join(', ') || '(none)'}; unexpected: ${unexpected.join(', ') || '(none)'}`,
    )
  }
}

function validateJsonSchema(jsonDirectory: string): void {
  for (const filename of outputFilenames(jsonDirectory)) {
    const path = resolveJsonOutputPath(jsonDirectory, filename)
    assertRegularFile(path, `staged JSON document ${filename}`)

    let document: unknown
    try {
      document = JSON.parse(readFileSync(path, 'utf8'))
    } catch (error) {
      throw new Error(`Invalid JSON in staged document ${filename}`, {
        cause: error,
      })
    }

    if (!validateLegacyDocument(document)) {
      throw new Error(
        `Legacy JSON schema validation failed for ${filename}: ${JSON.stringify(validateLegacyDocument.errors)}`,
      )
    }
  }
}

const invokedPath = process.argv[1]
if (
  invokedPath &&
  import.meta.url === pathToFileURL(resolve(invokedPath)).href
) {
  buildLegacyJson()
  process.stdout.write(
    `Generated ${expectedGeneratedJsonFilenames.length} active/all JSON files and preserved ${frozenLegacyJsonManifest.length} frozen files.\n`,
  )
}
