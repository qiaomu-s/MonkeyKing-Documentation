import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  contentEntries,
  contentSectionOrder,
  deletedLegacySources,
  frozenLegacyJsonStems,
  legacyAllEntryIds,
  validateContentCatalog,
} from './content/catalog'

const apiDirectory = resolve(process.cwd(), 'api')
const legacyMarkdownSources = readdirSync(apiDirectory, {
  withFileTypes: true,
})
  .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
  .map((entry) => 'api/' + entry.name)
  .sort()

const errors = validateContentCatalog({ legacyMarkdownSources })

if (errors.length > 0) {
  console.error(
    'Content catalog validation failed with ' +
      errors.length +
      ' error(s):',
  )
  for (const error of errors) {
    console.error('- ' + error)
  }
  process.exitCode = 1
} else {
  const generatedJsonNameCount = contentEntries.reduce(
    (count, entry) => count + entry.legacyJsonNames.length,
    0,
  )

  console.log(
    'Content catalog valid: ' +
      contentEntries.length +
      ' entries across ' +
      contentSectionOrder.length +
      ' sections; ' +
      legacyAllEntryIds.length +
      ' legacy all-document entries; ' +
      generatedJsonNameCount +
      ' generated JSON names; ' +
      frozenLegacyJsonStems.length +
      ' frozen JSON stems; ' +
      deletedLegacySources.length +
      ' deleted legacy sources; ' +
      legacyMarkdownSources.length +
      ' legacy Markdown files covered.',
  )
}
