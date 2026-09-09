import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
} from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { assertAllowedLegacyBrands } from './content/brand-policy'
import {
  contentEntries,
  contentSectionOrder,
  deletedLegacySources,
  frozenLegacyJsonStems,
  legacyAllEntryIds,
  validateContentCatalog,
} from './content/catalog'
import { transformOutsideMarkdownCode } from './content/markdown-source'
import { migratedImageNames } from './migrate-content'

export type ContentLayoutPhase = 'legacy' | 'canonical' | 'mixed' | 'missing'

export interface ContentCheckReport {
  readonly phase: ContentLayoutPhase
  readonly errors: readonly string[]
  readonly legacyMarkdownCount: number
  readonly canonicalMarkdownCount: number
  readonly imageCount: number
}

const expectedPublicCname = 'docs.monkeyking.com\n'
const optionalPublishedMarkdown = new Set(['docs/index.md'])
const retiredArtifactPaths = [
  'docs/assets',
  'docs/images',
  'docs/plugins',
] as const
const imageExtension = /\.(?:png|jpe?g|gif|svg|webp|avif)$/i

function repositoryPath(rootDirectory: string, absolutePath: string): string {
  return relative(rootDirectory, absolutePath).replaceAll('\\', '/')
}

function walkFiles(
  rootDirectory: string,
  directory: string,
  ignoredPrefixes: readonly string[] = [],
): string[] {
  if (!existsSync(directory)) return []

  const files: string[] = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = resolve(directory, entry.name)
    const path = repositoryPath(rootDirectory, absolutePath)
    if (
      ignoredPrefixes.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`),
      )
    ) {
      continue
    }
    if (entry.isDirectory()) {
      files.push(...walkFiles(rootDirectory, absolutePath, ignoredPrefixes))
    } else {
      files.push(path)
    }
  }
  return files.sort()
}

function regularFileError(path: string, label: string): string | undefined {
  if (!existsSync(path)) return `Missing ${label}: ${path}`
  const stats = lstatSync(path)
  if (stats.isSymbolicLink() || !stats.isFile()) {
    return `Expected regular ${label}: ${path}`
  }
  return undefined
}

function normalizedImageTarget(target: string): string {
  return target.trim().replace(/^<(.*)>$/, '$1').split(/[?#]/, 1)[0]
}

function inspectImageTarget(
  rawTarget: string,
  source: string,
  expectedImages: ReadonlySet<string>,
  errors: string[],
): void {
  const target = normalizedImageTarget(rawTarget)
  if (!imageExtension.test(target)) return
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) return

  if (!target.startsWith('/images/')) {
    errors.push(`Non-canonical image reference in ${source}: ${rawTarget}`)
    return
  }

  const imageName = target.slice('/images/'.length)
  if (imageName.includes('/') || !expectedImages.has(imageName)) {
    errors.push(`Missing image reference in ${source}: ${rawTarget}`)
  }
}

function inspectMarkdownImages(
  markdown: string,
  source: string,
  expectedImages: ReadonlySet<string>,
  errors: string[],
): void {
  transformOutsideMarkdownCode(markdown, (prose) => {
    for (const match of prose.matchAll(/!\[[^\]]*\]\(\s*(<?[^\s)>]+>?)/g)) {
      inspectImageTarget(match[1], source, expectedImages, errors)
    }

    for (const tag of prose.matchAll(/<(?:img|source)\b[^>]*>/gi)) {
      for (const attribute of tag[0].matchAll(/\b(src|srcset)=(['"])(.*?)\2/gi)) {
        const targets =
          attribute[1].toLowerCase() === 'srcset'
            ? attribute[3]
                .split(',')
                .map((candidate) => candidate.trim().split(/\s+/, 1)[0])
            : [attribute[3]]
        for (const target of targets) {
          inspectImageTarget(target, source, expectedImages, errors)
        }
      }
    }

    for (const definition of prose.matchAll(
      /^[ \t]{0,3}\[[^\]\r\n]+\]:[ \t]*(<?[^\s>]+>?)/gm,
    )) {
      inspectImageTarget(definition[1], source, expectedImages, errors)
    }
    return prose
  })
}

function inspectCanonicalLayout(
  rootDirectory: string,
  errors: string[],
): { readonly canonicalMarkdownCount: number; readonly imageCount: number } {
  const expectedSources = new Set<string>(
    contentEntries.map(({ source }) => source),
  )
  let canonicalMarkdownCount = 0

  for (const entry of contentEntries) {
    const absolutePath = resolve(rootDirectory, entry.source)
    const error = regularFileError(
      absolutePath,
      `canonical Markdown for ${entry.id}`,
    )
    if (error) {
      errors.push(error)
      continue
    }
    canonicalMarkdownCount += 1
  }

  const publishedMarkdown = walkFiles(
    rootDirectory,
    resolve(rootDirectory, 'docs'),
    ['docs/superpowers'],
  ).filter((path) => path.endsWith('.md'))
  const unexpectedMarkdown = publishedMarkdown.filter(
    (path) => !expectedSources.has(path) && !optionalPublishedMarkdown.has(path),
  )
  if (unexpectedMarkdown.length > 0) {
    errors.push(`Unexpected canonical Markdown: ${unexpectedMarkdown.join(', ')}`)
  }

  for (const path of retiredArtifactPaths) {
    if (existsSync(resolve(rootDirectory, path))) {
      errors.push(`Legacy documentation artifact remains: ${path}`)
    }
  }
  const directLegacyHtml = walkFiles(
    rootDirectory,
    resolve(rootDirectory, 'docs'),
    ['docs/.vitepress', 'docs/public', 'docs/superpowers'],
  ).filter((path) => dirname(path) === 'docs' && path.endsWith('.html'))
  if (directLegacyHtml.length > 0) {
    errors.push(`Legacy generated HTML remains: ${directLegacyHtml.join(', ')}`)
  }

  const expectedImages = new Set(migratedImageNames)
  const imagesDirectory = resolve(rootDirectory, 'docs/public/images')
  let imageNames: string[] = []
  if (!existsSync(imagesDirectory)) {
    errors.push(`Missing migrated image directory: ${imagesDirectory}`)
  } else {
    imageNames = readdirSync(imagesDirectory, { withFileTypes: true })
      .map((entry) => {
        if (!entry.isFile()) {
          errors.push(`Expected regular migrated image: ${entry.name}`)
        }
        return entry.name
      })
      .sort()
    const unexpected = imageNames.filter((name) => !expectedImages.has(name))
    const missing = migratedImageNames.filter((name) => !imageNames.includes(name))
    if (unexpected.length > 0) {
      errors.push(`Unexpected migrated images: ${unexpected.join(', ')}`)
    }
    if (missing.length > 0) {
      errors.push(`Missing migrated images: ${missing.join(', ')}`)
    }
  }

  const cnamePath = resolve(rootDirectory, 'docs/public/CNAME')
  const cnameError = regularFileError(cnamePath, 'public CNAME')
  if (cnameError) {
    errors.push(cnameError)
  } else if (readFileSync(cnamePath, 'utf8') !== expectedPublicCname) {
    errors.push(`Invalid public CNAME bytes: ${cnamePath}`)
  }

  for (const entry of contentEntries) {
    const path = resolve(rootDirectory, entry.source)
    if (!existsSync(path) || !lstatSync(path).isFile()) continue
    const markdown = readFileSync(path, 'utf8')
    inspectMarkdownImages(markdown, entry.source, expectedImages, errors)
    try {
      assertAllowedLegacyBrands(markdown, { current: entry })
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }

  return { canonicalMarkdownCount, imageCount: imageNames.length }
}

export function checkContent(rootDirectory = process.cwd()): ContentCheckReport {
  rootDirectory = resolve(rootDirectory)
  const errors = validateContentCatalog()
  const apiDirectory = resolve(rootDirectory, 'api')
  const apiExists = existsSync(apiDirectory)
  const legacyMarkdownSources = apiExists
    ? readdirSync(apiDirectory, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .map((entry) => `api/${entry.name}`)
        .sort()
    : []
  const canonicalMarkdownCount = contentEntries.filter(({ source }) =>
    existsSync(resolve(rootDirectory, source)),
  ).length
  const phase: ContentLayoutPhase = apiExists
    ? canonicalMarkdownCount > 0
      ? 'mixed'
      : 'legacy'
    : canonicalMarkdownCount > 0
      ? 'canonical'
      : 'missing'
  let imageCount = 0

  if (phase === 'legacy' || phase === 'mixed') {
    errors.push(...validateContentCatalog({ legacyMarkdownSources }))
  }
  if (phase === 'mixed') {
    errors.push('Mixed legacy and canonical content layouts are not allowed')
  } else if (phase === 'canonical') {
    const canonical = inspectCanonicalLayout(rootDirectory, errors)
    imageCount = canonical.imageCount
  } else if (phase === 'missing') {
    errors.push('Neither the legacy nor canonical content layout exists')
  }

  return Object.freeze({
    phase,
    errors: Object.freeze(errors),
    legacyMarkdownCount: legacyMarkdownSources.length,
    canonicalMarkdownCount,
    imageCount,
  })
}

function printReport(report: ContentCheckReport): void {
  if (report.errors.length > 0) {
    console.error(
      `Content validation failed in ${report.phase} phase with ${report.errors.length} error(s):`,
    )
    for (const error of report.errors) console.error(`- ${error}`)
    process.exitCode = 1
    return
  }

  const generatedJsonNameCount = contentEntries.reduce(
    (count, entry) => count + entry.legacyJsonNames.length,
    0,
  )
  console.log(
    `Content valid in ${report.phase} phase: ${contentEntries.length} entries across ` +
      `${contentSectionOrder.length} sections; ${legacyAllEntryIds.length} legacy all-document entries; ` +
      `${generatedJsonNameCount} generated JSON names; ${frozenLegacyJsonStems.length} frozen JSON stems; ` +
      `${deletedLegacySources.length} deleted legacy sources; ${report.legacyMarkdownCount} legacy Markdown files; ` +
      `${report.canonicalMarkdownCount} canonical Markdown files; ${report.imageCount} migrated images.`,
  )
}

function isDirectExecution(): boolean {
  const executable = process.argv[1]
  return executable !== undefined && pathToFileURL(resolve(executable)).href === import.meta.url
}

if (isDirectExecution()) printReport(checkContent())
