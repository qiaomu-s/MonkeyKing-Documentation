import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, isAbsolute, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  applyBrandPolicy,
  assertAllowedLegacyBrands,
} from './content/brand-policy'
import {
  contentEntries,
  deletedLegacySources,
} from './content/catalog'
import type { ContentEntry } from './content/catalog'
import {
  buildHeadingIndex,
  rewriteMarkdownLinks,
} from './content/markdown-links'
import type {
  HeadingIndex,
  MarkdownLinkContext,
} from './content/markdown-links'
import {
  scanMarkdownCode,
  transformOutsideMarkdownCode,
} from './content/markdown-source'

export interface MigrationContext {
  readonly current: ContentEntry
  readonly entries?: readonly ContentEntry[]
  readonly headingIndex?: HeadingIndex
}

export interface MigrateContentOptions {
  readonly rootDirectory?: string
  readonly entries?: readonly ContentEntry[]
  readonly imageNames?: readonly string[]
  readonly deletedSources?: readonly string[]
}

export interface MigrateContentReport {
  readonly entriesWritten: number
  readonly imagesCopied: number
  readonly pathsDeleted: number
}

interface RepairVariant {
  readonly oldText: string
  readonly newText: string
}

interface AuditedRepairGroup {
  readonly id: string
  readonly legacySource: string
  readonly expectedOccurrences: number
  readonly variants: readonly RepairVariant[]
  readonly additionalRepairedTexts?: readonly string[]
}

export const legacyImageNames = Object.freeze([
  'autojs6-notification-append-script-name-on-title-dark.png',
  'autojs6-notification-append-script-name-on-title.png',
  'autojs6-notification-big-content-sample-dark.png',
  'autojs6-notification-big-content-sample.png',
  'autojs6-notification-big-text-for-content-dark.png',
  'autojs6-notification-big-text-for-content.png',
  'autojs6-notification-content-sample-dark.png',
  'autojs6-notification-content-sample.png',
  'autojs6-notification-item-details-dark.png',
  'autojs6-notification-item-details.png',
  'autojs6-notification-list-dark.png',
  'autojs6-notification-list-with-same-names-dark.png',
  'autojs6-notification-list-with-same-names.png',
  'autojs6-notification-list.png',
  'autojs6-notification-title-sample-dark.png',
  'autojs6-notification-title-sample.png',
  'ex-gravity.png',
  'ex-layout-gravity.png',
  'ex-marginLeft.png',
  'ex-padding.png',
  'ex-properties.png',
  'ex-w.png',
  'ex1-horizontal.png',
  'ex1-margin.png',
  'ex1.png',
  'ex2-margin.png',
  'h-distance-color-detection-dark.png',
  'h-distance-color-detection.png',
  'hs-distance-color-detection-dark.png',
  'hs-distance-color-detection.png',
  'logo.png',
  'rgb-difference-color-detection-dark.png',
  'rgb-difference-color-detection.png',
  'rgb-distance-color-detection-dark.png',
  'rgb-distance-color-detection.png',
  'weighted-rgb-distance-color-detection-dark.png',
  'weighted-rgb-distance-color-detection.png',
] as const)

const auditedRepairGroups: readonly AuditedRepairGroup[] = Object.freeze([
  Object.freeze({
    id: 'canvas-array-number',
    legacySource: 'api/canvas.md',
    expectedOccurrences: 1,
    variants: Object.freeze([
      Object.freeze({
        oldText:
          '* `pts` {Array<number>} 点坐标数组 [x0, y0, x1, y1, x2, y2, ...]\n',
        newText:
          '* `pts` {Array&lt;number&gt;} 点坐标数组 [x0, y0, x1, y1, x2, y2, ...]\n',
      }),
    ]),
  }),
  Object.freeze({
    id: 'data-types-generic-array',
    legacySource: 'api/dataTypes.md',
    expectedOccurrences: 1,
    variants: Object.freeze([
      Object.freeze({
        oldText: '例如 Array<T>.\n',
        newText: '例如 `Array<T>`.\n',
      }),
    ]),
  }),
  Object.freeze({
    id: 'http-cookie-placeholders',
    legacySource: 'api/httpRequestHeadersType.md',
    expectedOccurrences: 1,
    variants: Object.freeze([
      Object.freeze({
        oldText:
          '| &lt;cookie-list&gt; | 一系列的名值对, 形式为 <cookie-name>=<cookie-value>, 以分号和空格分隔 |\n',
        newText:
          '| &lt;cookie-list&gt; | 一系列的名值对, 形式为 &lt;cookie-name&gt;=&lt;cookie-value&gt;, 以分号和空格分隔 |\n',
      }),
    ]),
  }),
  Object.freeze({
    id: 'keys-string-placeholder',
    legacySource: 'api/keys.md',
    expectedOccurrences: 1,
    variants: Object.freeze([
      Object.freeze({
        oldText:
          '* code {number} | <String> 要按下的按键的数字代码或名称. 参见下表.\n',
        newText:
          '* code {number} | &lt;String&gt; 要按下的按键的数字代码或名称. 参见下表.\n',
      }),
    ]),
  }),
  Object.freeze({
    id: 'color-yellow-backtick',
    legacySource: 'api/color.md',
    expectedOccurrences: 1,
    variants: Object.freeze([
      Object.freeze({
        oldText:
          "> 'purple', 'red', 'silver', 'teal', 'white', 'yellow'`.\n",
        newText:
          "> 'purple', 'red', 'silver', 'teal', 'white', 'yellow'.\n",
      }),
    ]),
  }),
  Object.freeze({
    id: 'events-exit-heading',
    legacySource: 'api/events.md',
    expectedOccurrences: 1,
    variants: Object.freeze([
      Object.freeze({
        oldText: "## 事件: 'exit`\n",
        newText: "## 事件: 'exit'\n",
      }),
    ]),
  }),
  Object.freeze({
    id: 'image-empty-code-item',
    legacySource: 'api/image.md',
    expectedOccurrences: 1,
    variants: Object.freeze([
      Object.freeze({
        oldText:
          '    * `BGR2HSV ` BGR转换为HSV\n    * ``\n* `dstCn` {number} 目标图像的颜色通道数量, 如果不填写则根据其他参数自动决定.\n',
        newText:
          '    * `BGR2HSV ` BGR转换为HSV\n* `dstCn` {number} 目标图像的颜色通道数量, 如果不填写则根据其他参数自动决定.\n',
      }),
    ]),
  }),
  Object.freeze({
    id: 'ui-bold-inline-code',
    legacySource: 'api/ui.md',
    expectedOccurrences: 1,
    variants: Object.freeze([
      Object.freeze({
        oldText:
          '例如, 粗体：`<text textStyle="bold" textSize="18sp" text="这是粗体"/>\n',
        newText:
          '例如, 粗体：`<text textStyle="bold" textSize="18sp" text="这是粗体"/>`\n',
      }),
    ]),
  }),
  Object.freeze({
    id: 'ui-ems-inline-code',
    legacySource: 'api/ui.md',
    expectedOccurrences: 1,
    variants: Object.freeze([
      Object.freeze({
        oldText:
          '例如, 限制文本最长为5em: `<text ems="5" ellipsize="end" text="很长很长很长很长很长很长很长的文本"/>\n',
        newText:
          '例如, 限制文本最长为5em: `<text ems="5" ellipsize="end" text="很长很长很长很长很长很长很长的文本"/>`\n',
      }),
    ]),
  }),
  Object.freeze({
    id: 'ui-properties-image',
    legacySource: 'api/ui.md',
    expectedOccurrences: 1,
    variants: Object.freeze([
      Object.freeze({
        oldText: '![ex-properties](images/ex1-properties.png)\n',
        newText: '![ex-properties](images/ex-properties.png)\n',
      }),
    ]),
    additionalRepairedTexts: Object.freeze([
      '![ex-properties](/images/ex-properties.png)\n',
    ]),
  }),
  Object.freeze({
    id: 'ui-missing-input-image',
    legacySource: 'api/ui.md',
    expectedOccurrences: 1,
    variants: Object.freeze([
      Object.freeze({
        oldText:
          '效果如图：\n\n![ex-input](ex-input.png)\n\n除此之外, 输入框控件有另外一些主要属性(虽然这些属性对于文本控件也是可用的但一般只用于输入框控件)：\n',
        newText:
          '效果如下：\n\n除此之外, 输入框控件有另外一些主要属性(虽然这些属性对于文本控件也是可用的但一般只用于输入框控件)：\n',
      }),
    ]),
  }),
  Object.freeze({
    id: 'ui-missing-hint-image',
    legacySource: 'api/ui.md',
    expectedOccurrences: 1,
    variants: Object.freeze([
      Object.freeze({
        oldText:
          '输入提示. 这个提示会在输入框为空的时候显示出来. 如图所示:\n\n![ex-hint](images/ex-hint.png)\n\n上面图片效果的代码为：\n',
        newText:
          '输入提示. 这个提示会在输入框为空的时候显示出来.\n\n示例代码如下：\n',
      }),
    ]),
  }),
  Object.freeze({
    id: 'sensors-axis-image',
    legacySource: 'api/sensors.md',
    expectedOccurrences: 1,
    variants: Object.freeze([
      Object.freeze({
        oldText:
          '      这里的x轴, y轴, z轴所属的坐标系统如下图(其中z轴垂直于设备屏幕表面):\n\n  !![axis_device](#images/axis_device.png)\n',
        newText:
          'x 轴和 y 轴位于设备屏幕平面内，z 轴垂直于设备屏幕表面。\n',
      }),
      Object.freeze({
        oldText:
          '这里的x轴, y轴, z轴所属的坐标系统如下图(其中z轴垂直于设备屏幕表面):\n\n  !![axis_device](#images/axis_device.png)\n',
        newText:
          'x 轴和 y 轴位于设备屏幕平面内，z 轴垂直于设备屏幕表面。\n',
      }),
    ]),
  }),
])

function countAtLineBoundary(value: string, search: string): number {
  let count = 0
  let fromIndex = 0
  while (true) {
    const index = value.indexOf(search, fromIndex)
    if (index < 0) return count
    if (index === 0 || value[index - 1] === '\n') count += 1
    fromIndex = index + search.length
  }
}

function applyAuditedRepairGroup(
  markdown: string,
  group: AuditedRepairGroup,
): string {
  const oldCount = group.variants.reduce(
    (count, variant) => count + countAtLineBoundary(markdown, variant.oldText),
    0,
  )
  const repairedTexts = [
    ...new Set([
      ...group.variants.map(({ newText }) => newText),
      ...(group.additionalRepairedTexts ?? []),
    ]),
  ]
  const repairedCount = repairedTexts.reduce(
    (count, repairedText) =>
      count + countAtLineBoundary(markdown, repairedText),
    0,
  )

  if (oldCount === group.expectedOccurrences && repairedCount === 0) {
    return group.variants.reduce(
      (value, variant) => value.replaceAll(variant.oldText, variant.newText),
      markdown,
    )
  }
  if (oldCount === 0 && repairedCount === group.expectedOccurrences) {
    return markdown
  }

  throw new Error(
    `Audited repair state mismatch for ${group.legacySource} (${group.id}): ` +
      `expected ${group.expectedOccurrences}, legacy=${oldCount}, repaired=${repairedCount}`,
  )
}

export function repairKnownContentDefects(
  markdown: string,
  context: Pick<MigrationContext, 'current'>,
): string {
  let repaired = auditedRepairGroups
    .filter((group) => group.legacySource === context.current.legacySource)
    .reduce(applyAuditedRepairGroup, markdown)

  if (context.current.legacySource === 'api/ocrOptionsType.md') {
    const expectedHeadingCount = countAtLineBoundary(
      repaired,
      '# OcrOptions\n',
    )
    const h1Count = [...repaired.matchAll(/^#\s+\S.*$/gm)].length
    if (expectedHeadingCount === 0 && h1Count === 0) {
      repaired = `# OcrOptions\n\n${repaired}`
    } else if (expectedHeadingCount !== 1 || h1Count !== 1) {
      throw new Error(
        `Audited repair state mismatch for api/ocrOptionsType.md (ocr-options-h1): ` +
          `expected 1, OcrOptions=${expectedHeadingCount}, h1=${h1Count}`,
      )
    }
  }

  return repaired
}

const expectedDefaultVueInterpolationOpenings = 38
const expectedDefaultVueInterpolationClosings = 38
const legacyVueInterpolationOpening = '{{'
const legacyVueInterpolationClosing = '}}'
const migratedVueInterpolationOpening = '&#123;&#123;'
const migratedVueInterpolationClosing = '&#125;&#125;'
const nestedTypeClosingLegacySource = 'api/crypto.md'
const legacyNestedTypeClosing = '- }} - 选项参数\n'
const migratedNestedTypeClosing = '- &#125;&#125; - 选项参数\n'

function countOutsideMarkdownCode(markdown: string, token: string): number {
  const { protectedRanges } = scanMarkdownCode(markdown)
  let count = 0
  let cursor = 0

  for (const range of protectedRanges) {
    count += markdown.slice(cursor, range.start).split(token).length - 1
    cursor = range.end
  }
  count += markdown.slice(cursor).split(token).length - 1
  return count
}

function assertDefaultVueInterpolationState(
  sources: readonly {
    readonly entry: ContentEntry
    readonly markdown: string
  }[],
): void {
  const legacyOpenings = sources.reduce(
    (count, source) =>
      count +
      countOutsideMarkdownCode(source.markdown, legacyVueInterpolationOpening),
    0,
  )
  const migratedOpenings = sources.reduce(
    (count, source) =>
      count +
      countOutsideMarkdownCode(
        source.markdown,
        migratedVueInterpolationOpening,
      ),
    0,
  )
  const legacyClosingTotal = sources.reduce(
    (count, source) =>
      count +
      countOutsideMarkdownCode(source.markdown, legacyVueInterpolationClosing),
    0,
  )
  const migratedClosingTotal = sources.reduce(
    (count, source) =>
      count +
      countOutsideMarkdownCode(
        source.markdown,
        migratedVueInterpolationClosing,
      ),
    0,
  )
  const nestedTypeSource = sources.find(
    ({ entry }) => entry.legacySource === nestedTypeClosingLegacySource,
  )
  const legacyNestedTypeClosings = nestedTypeSource
    ? countOutsideMarkdownCode(
        nestedTypeSource.markdown,
        legacyNestedTypeClosing,
      )
    : 0
  const migratedNestedTypeClosings = nestedTypeSource
    ? countOutsideMarkdownCode(
        nestedTypeSource.markdown,
        migratedNestedTypeClosing,
      )
    : 0
  const legacyClosings = legacyClosingTotal - legacyNestedTypeClosings
  const migratedClosings = migratedClosingTotal - migratedNestedTypeClosings
  const validLegacyState =
    legacyOpenings === expectedDefaultVueInterpolationOpenings &&
    legacyClosings === expectedDefaultVueInterpolationClosings &&
    legacyNestedTypeClosings === 1 &&
    migratedOpenings === 0 &&
    migratedClosings === 0 &&
    migratedNestedTypeClosings === 0
  const validMigratedState =
    legacyOpenings === 0 &&
    legacyClosings === 0 &&
    legacyNestedTypeClosings === 0 &&
    migratedOpenings === expectedDefaultVueInterpolationOpenings &&
    migratedClosings === expectedDefaultVueInterpolationClosings &&
    migratedNestedTypeClosings === 1

  if (!validLegacyState && !validMigratedState) {
    throw new Error(
      `Audited Vue interpolation state mismatch: expected ${expectedDefaultVueInterpolationOpenings} paired openings/closings and one nested-type closing literal; ` +
        `legacy openings=${legacyOpenings}, closings=${legacyClosings}, nested=${legacyNestedTypeClosings}; ` +
        `migrated openings=${migratedOpenings}, closings=${migratedClosings}, nested=${migratedNestedTypeClosings}`,
    )
  }
}

function normalizeMarkdownSyntax(markdown: string): string {
  const { fenceOpenings } = scanMarkdownCode(markdown)
  let normalized = markdown

  for (const opening of [...fenceOpenings].reverse()) {
    const info = markdown.slice(opening.infoStart, opening.infoEnd)
    const normalizedInfo = info.replace(
      /^(\s*)(?:badjs|e4x)(?=\s|$)/i,
      '$1js',
    )
    normalized =
      normalized.slice(0, opening.infoStart) +
      normalizedInfo +
      normalized.slice(opening.infoEnd)
  }

  return transformOutsideMarkdownCode(normalized, (source) =>
    source
      .replaceAll('{{', '&#123;&#123;')
      .replaceAll('}}', '&#125;&#125;'),
  )
}

export function preprocessMarkdown(
  markdown: string,
  context: Pick<MigrationContext, 'current'>,
): string {
  return normalizeMarkdownSyntax(
    applyBrandPolicy(repairKnownContentDefects(markdown, context), context),
  )
}

export function migrateMarkdown(
  markdown: string,
  context: MigrationContext,
): string {
  const preprocessed = preprocessMarkdown(markdown, context)
  const linkContext: MarkdownLinkContext = {
    current: context.current,
    entries: context.entries,
    headingIndex: context.headingIndex,
  }
  return rewriteMarkdownLinks(preprocessed, linkContext)
}

function isInsideRoot(root: string, candidate: string): boolean {
  const relativePath = relative(root, candidate)
  return (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !isAbsolute(relativePath))
  )
}

export function resolveRepoPath(
  rootDirectory: string,
  repositoryPath: string,
): string {
  if (isAbsolute(repositoryPath)) {
    throw new Error(`Expected relative repository path: ${repositoryPath}`)
  }

  const root = resolve(rootDirectory)
  const candidate = resolve(root, repositoryPath)
  if (!isInsideRoot(root, candidate)) {
    throw new Error(`Path is outside repository root: ${repositoryPath}`)
  }

  let existingAncestor = candidate
  while (!existsSync(existingAncestor)) {
    const parent = dirname(existingAncestor)
    if (parent === existingAncestor) break
    existingAncestor = parent
  }
  if (existsSync(existingAncestor)) {
    const realRoot = realpathSync(root)
    const realAncestor = realpathSync(existingAncestor)
    if (!isInsideRoot(realRoot, realAncestor)) {
      throw new Error(`Path crosses a symlink outside repository root: ${repositoryPath}`)
    }
  }
  if (existsSync(candidate) && lstatSync(candidate).isSymbolicLink()) {
    throw new Error(`Refusing repository operation through symlink: ${repositoryPath}`)
  }

  return candidate
}

function writeIfChanged(path: string, content: string): boolean {
  if (existsSync(path) && readFileSync(path, 'utf8') === content) return false
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
  return true
}

function copyIfChanged(source: string, destination: string): boolean {
  if (
    existsSync(destination) &&
    readFileSync(source).equals(readFileSync(destination))
  ) {
    return false
  }
  mkdirSync(dirname(destination), { recursive: true })
  copyFileSync(source, destination)
  return true
}

function migratedImageName(name: string): string {
  return name.replace(/^autojs6-notification-/i, 'monkeyking-notification-')
}

function normalizedRepositoryPath(path: string): string {
  return path.replaceAll('\\', '/')
}

function assertExactFileInventory(
  actual: ReadonlySet<string>,
  expected: ReadonlySet<string>,
  label: string,
): void {
  const unexpected = [...actual].filter((name) => !expected.has(name))
  if (unexpected.length > 0) {
    throw new Error(`Unknown ${label} artifact: ${unexpected.join(', ')}`)
  }
  const missing = [...expected].filter((name) => !actual.has(name))
  if (missing.length > 0) {
    throw new Error(`Missing ${label} artifact: ${missing.join(', ')}`)
  }
}

function validateApiLayout(
  rootDirectory: string,
  entries: readonly ContentEntry[],
  imageNames: readonly string[],
  retiredSources: readonly string[],
  requireLegacyRuntimeArtifacts: boolean,
): void {
  const apiDirectory = resolveRepoPath(rootDirectory, 'api')
  if (!existsSync(apiDirectory)) return

  const expectedMarkdownNames = new Set(
    [...entries.map(({ legacySource }) => legacySource), ...retiredSources].map(
      (path) => basename(path),
    ),
  )
  const allowedFiles = new Set([
    ...expectedMarkdownNames,
    '.gitignore',
    'index.html',
    'CNAME',
  ])
  const allowedDirectories = new Set(['images', 'static'])
  const actualMarkdownNames = new Set<string>()
  const topLevel = readdirSync(apiDirectory, { withFileTypes: true })

  for (const artifact of topLevel) {
    if (artifact.isFile() && allowedFiles.has(artifact.name)) {
      if (artifact.name.endsWith('.md')) actualMarkdownNames.add(artifact.name)
      continue
    }
    if (artifact.isDirectory() && allowedDirectories.has(artifact.name)) {
      continue
    }
    throw new Error(`Unknown api artifact: api/${artifact.name}`)
  }

  assertExactFileInventory(
    actualMarkdownNames,
    expectedMarkdownNames,
    'api Markdown',
  )

  if (requireLegacyRuntimeArtifacts) {
    for (const required of [
      '.gitignore',
      'images',
      'static',
      'index.html',
      'CNAME',
    ]) {
      if (!topLevel.some(({ name }) => name === required)) {
        throw new Error(`Missing api artifact: api/${required}`)
      }
    }
  }

  const imagesDirectory = resolveRepoPath(rootDirectory, 'api/images')
  if (existsSync(imagesDirectory)) {
    const actualImages = new Set<string>()
    for (const image of readdirSync(imagesDirectory, { withFileTypes: true })) {
      if (!image.isFile()) {
        throw new Error(`Unknown image artifact: api/images/${image.name}`)
      }
      actualImages.add(image.name)
    }
    assertExactFileInventory(
      actualImages,
      new Set(imageNames),
      'image',
    )
  } else if (imageNames.length > 0) {
    throw new Error('Missing image artifact: api/images')
  }
}

function isWithinFreeDocsArea(repositoryPath: string): boolean {
  return [
    'docs/.vitepress',
    'docs/assets',
    'docs/images',
    'docs/plugins',
    'docs/superpowers',
  ].some(
    (prefix) =>
      repositoryPath === prefix || repositoryPath.startsWith(`${prefix}/`),
  )
}

function validateDocsLayout(
  rootDirectory: string,
  entries: readonly ContentEntry[],
  imageNames: readonly string[],
): void {
  const docsDirectory = resolveRepoPath(rootDirectory, 'docs')
  if (!existsSync(docsDirectory)) return

  const allowedFiles = new Set([
    ...entries.map(({ source }) => source),
    'docs/index.md',
    'docs/public/CNAME',
    'docs/public/logo.png',
    ...imageNames.map(
      (name) => `docs/public/images/${migratedImageName(name)}`,
    ),
  ])

  const visit = (directory: string): void => {
    for (const artifact of readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = resolve(directory, artifact.name)
      const repositoryPath = normalizedRepositoryPath(
        relative(rootDirectory, absolutePath),
      )
      const directLegacyHtml =
        dirname(repositoryPath) === 'docs' && repositoryPath.endsWith('.html')
      const allowedDirectory = [...allowedFiles].some((path) =>
        path.startsWith(`${repositoryPath}/`),
      )

      if (isWithinFreeDocsArea(repositoryPath) || directLegacyHtml) {
        if (artifact.isDirectory()) visit(absolutePath)
        continue
      }
      if (artifact.isFile() && allowedFiles.has(repositoryPath)) continue
      if (artifact.isDirectory() && allowedDirectory) {
        visit(absolutePath)
        continue
      }
      throw new Error(`Unknown docs artifact: ${repositoryPath}`)
    }
  }

  visit(docsDirectory)
}

function validateMigrationLayout(
  rootDirectory: string,
  entries: readonly ContentEntry[],
  imageNames: readonly string[],
  retiredSources: readonly string[],
  requireLegacyRuntimeArtifacts: boolean,
): void {
  validateApiLayout(
    rootDirectory,
    entries,
    imageNames,
    retiredSources,
    requireLegacyRuntimeArtifacts,
  )
  validateDocsLayout(rootDirectory, entries, imageNames)
}

function removeIfPresent(path: string): boolean {
  if (!existsSync(path)) return false
  rmSync(path, { recursive: statSync(path).isDirectory(), force: true })
  return true
}

function removeLegacyArtifacts(rootDirectory: string): number {
  let deleted = 0
  for (const repositoryPath of [
    'api',
    'docs/assets',
    'docs/images',
    'docs/plugins',
  ]) {
    if (removeIfPresent(resolveRepoPath(rootDirectory, repositoryPath))) {
      deleted += 1
    }
  }

  const docsDirectory = resolveRepoPath(rootDirectory, 'docs')
  if (existsSync(docsDirectory)) {
    for (const entry of readdirSync(docsDirectory, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.html')) {
        if (
          removeIfPresent(
            resolveRepoPath(rootDirectory, `docs/${entry.name}`),
          )
        ) {
          deleted += 1
        }
      }
    }
  }
  return deleted
}

export async function migrateContent(
  options: MigrateContentOptions = {},
): Promise<MigrateContentReport> {
  const rootDirectory = resolve(options.rootDirectory ?? process.cwd())
  const entries = options.entries ?? contentEntries
  const imageNames = options.imageNames ?? legacyImageNames
  const retiredSources = options.deletedSources ?? deletedLegacySources
  validateMigrationLayout(
    rootDirectory,
    entries,
    imageNames,
    retiredSources,
    options.entries === undefined,
  )

  const migrationSources = entries.map((entry) => {
    const legacyPath = resolveRepoPath(rootDirectory, entry.legacySource)
    const canonicalPath = resolveRepoPath(rootDirectory, entry.source)
    const inputPath = existsSync(canonicalPath) ? canonicalPath : legacyPath
    if (!existsSync(inputPath) || !statSync(inputPath).isFile()) {
      throw new Error(
        `Missing migration input for ${entry.id}: ${entry.legacySource} or ${entry.source}`,
      )
    }
    return {
      entry,
      markdown: readFileSync(inputPath, 'utf8'),
    }
  })

  if (options.entries === undefined) {
    assertDefaultVueInterpolationState(migrationSources)
  }

  const preprocessedSources = migrationSources.map((source) => ({
    entry: source.entry,
    markdown: preprocessMarkdown(source.markdown, {
      current: source.entry,
    }),
  }))

  const headingIndex = await buildHeadingIndex(preprocessedSources)
  const migratedSources = preprocessedSources.map((source) => {
    const markdown = rewriteMarkdownLinks(source.markdown, {
      current: source.entry,
      entries,
      headingIndex,
    })
    assertAllowedLegacyBrands(markdown, { current: source.entry })
    return { entry: source.entry, markdown }
  })

  let entriesWritten = 0
  for (const source of migratedSources) {
    const destination = resolveRepoPath(rootDirectory, source.entry.source)
    if (writeIfChanged(destination, source.markdown)) entriesWritten += 1
  }

  let imagesCopied = 0
  for (const imageName of imageNames) {
    const source = resolveRepoPath(rootDirectory, `api/images/${imageName}`)
    const destination = resolveRepoPath(
      rootDirectory,
      `docs/public/images/${migratedImageName(imageName)}`,
    )
    if (existsSync(source)) {
      if (copyIfChanged(source, destination)) imagesCopied += 1
    } else if (!existsSync(destination)) {
      throw new Error(`Missing migration image: ${imageName}`)
    }
  }

  const expectedPublicCname = 'docs.monkeyking.com\n'
  const legacyCname = resolveRepoPath(rootDirectory, 'api/CNAME')
  const publicCname = resolveRepoPath(rootDirectory, 'docs/public/CNAME')
  if (existsSync(legacyCname) || existsSync(publicCname)) {
    writeIfChanged(publicCname, expectedPublicCname)
  } else if (options.entries === undefined) {
    throw new Error('Missing api/CNAME and docs/public/CNAME')
  }

  const pathsDeleted = removeLegacyArtifacts(rootDirectory)

  return Object.freeze({ entriesWritten, imagesCopied, pathsDeleted })
}

function isDirectExecution(): boolean {
  const executable = process.argv[1]
  return executable !== undefined && pathToFileURL(resolve(executable)).href === import.meta.url
}

if (isDirectExecution()) {
  migrateContent()
    .then((report) => {
      process.stdout.write(
        `Migrated ${contentEntries.length} entries (${report.entriesWritten} written), ` +
          `${report.imagesCopied} images copied, ${report.pathsDeleted} legacy paths removed.\n`,
      )
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.stack ?? error.message : String(error)
      process.stderr.write(`${message}\n`)
      process.exitCode = 1
    })
}
