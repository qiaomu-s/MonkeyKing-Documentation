import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { createHash } from 'node:crypto'
import { basename, extname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  contentEntries,
  frozenLegacyJsonStems,
  legacyAllEntryIds,
} from '../content/catalog'
import type { ContentEntry } from '../content/catalog'
import {
  parseLegacyMarkdown,
  stringifyLegacyDocument,
  stripLegacyComments,
} from './legacy-parser'

export interface LegacyJsonOutput {
  readonly filename: string
  readonly text: string
}

export const retiredLegacyJsonFilenames = Object.freeze([
  '404.json',
  'coverpage.json',
  'sidebar.json',
  'toc.json',
  'util.json',
] as const)

export const frozenLegacyJsonSha256 = Object.freeze({
  accessibilityActionsType:
    '135ef9e95e2803174f72ba77eb53c7f819c23bd074cf10ac0f7823266822fced',
  'coordinates-based-automation':
    'b9cb567af85eeda2db3ee8f6e4f786d3e76493ea71a85c4496bc268f13d4d607',
  coordinatesBasedAutomation:
    '203775cf8672d3bce5bc3e280d749639c5ef2a3a460bb19b8ba3b88430691d5b',
  errors: 'd988e2ac4af1cf7fc867da3f3a970d32214ea789699ca06e71f4e7c4ac4ca191',
  globals: '12d8d4d329947023987583805a0cf097d334fc9d226cefa36b583c1b98d6283e',
  imageWrapper:
    'a6b43d45784ff4b0399746df63236087a56c39cd14425633ef41d4533a3ae5f5',
  intent: '676513ed7e2e7dfc4d848de3adc72f2442ad1fdd968e18ec578594d23c888ab7',
  intrinsicTypes:
    'd3df3c9d02e63328ff76543eb5cb28f4dc38abd35c6767e86d953694acf64eb6',
  'widgets-based-automation':
    '0da3b149a8eb254e6fca9efa6f7aa1194fe72d5c4272ce7dd55993487d344249',
  widgetsBasedAutomation:
    '04b03a2d9cc21f68be86b8b014bb964112b76148e6285c25d53d90734e04e9ed',
} as const)

const expectedGeneratedJsonFilenames = Object.freeze([
  ...contentEntries.flatMap((entry) =>
    entry.legacyJsonNames.map((name) => `${name}.json`),
  ),
  'all.json',
])

export const expectedLegacyJsonFilenames = Object.freeze([
  ...expectedGeneratedJsonFilenames,
  ...frozenLegacyJsonStems.map((stem) => `${stem}.json`),
].sort())

export function resolveEntryMarkdownPath(
  rootDirectory: string,
  entry: ContentEntry,
): string {
  const canonicalPath = resolve(rootDirectory, entry.source)
  if (existsSync(canonicalPath)) return canonicalPath

  const legacyPath = resolve(rootDirectory, entry.legacySource)
  if (existsSync(legacyPath)) return legacyPath

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
    const input = readFileSync(resolveEntryMarkdownPath(rootDirectory, entry), 'utf8')
    const text = stringifyLegacyDocument(
      parseLegacyMarkdown(input, `..\\api\\${legacyStem}.md`),
    )

    for (const jsonName of entry.legacyJsonNames) {
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

export function buildLegacyJson(rootDirectory = process.cwd()): void {
  const jsonDirectory = resolve(rootDirectory, 'json')
  verifyFrozenLegacyJson(jsonDirectory, 'before build')
  validateExistingJsonInventory(jsonDirectory)

  const outputs = createLegacyJsonOutputs(rootDirectory)
  for (const { filename, text } of outputs) {
    writeFileSync(resolve(jsonDirectory, filename), text)
  }

  for (const filename of retiredLegacyJsonFilenames) {
    const retiredPath = resolve(jsonDirectory, filename)
    if (existsSync(retiredPath)) rmSync(retiredPath)
  }

  verifyFrozenLegacyJson(jsonDirectory, 'after build')
  validateFinalJsonInventory(jsonDirectory)
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function jsonFilenames(jsonDirectory: string): string[] {
  if (!existsSync(jsonDirectory)) {
    throw new Error(`Missing JSON output directory: ${jsonDirectory}`)
  }

  return readdirSync(jsonDirectory)
    .filter((filename) => filename.endsWith('.json'))
    .sort()
}

function verifyFrozenLegacyJson(
  jsonDirectory: string,
  phase: string,
): void {
  for (const stem of frozenLegacyJsonStems) {
    const frozenPath = resolve(jsonDirectory, `${stem}.json`)
    if (!existsSync(frozenPath)) {
      throw new Error(`Missing frozen legacy JSON ${phase}: ${stem}.json`)
    }

    const expectedHash = frozenLegacyJsonSha256[stem]
    const actualHash = sha256(frozenPath)
    if (actualHash !== expectedHash) {
      throw new Error(
        `Frozen legacy JSON hash mismatch ${phase}: ${stem}.json expected ${expectedHash}, received ${actualHash}`,
      )
    }
  }
}

function validateExistingJsonInventory(jsonDirectory: string): void {
  const allowed = new Set([
    ...expectedLegacyJsonFilenames,
    ...retiredLegacyJsonFilenames,
  ])
  const unexpected = jsonFilenames(jsonDirectory).filter(
    (filename) => !allowed.has(filename),
  )

  if (unexpected.length > 0) {
    throw new Error(`Unexpected JSON file(s): ${unexpected.join(', ')}`)
  }
}

function validateFinalJsonInventory(jsonDirectory: string): void {
  const actual = jsonFilenames(jsonDirectory)
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

const invokedPath = process.argv[1]
if (
  invokedPath &&
  import.meta.url === pathToFileURL(resolve(invokedPath)).href
) {
  buildLegacyJson()
  process.stdout.write(
    `Generated ${expectedGeneratedJsonFilenames.length} active/all JSON files and preserved ${frozenLegacyJsonStems.length} frozen files.\n`,
  )
}
