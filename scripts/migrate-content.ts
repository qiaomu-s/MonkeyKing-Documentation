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
import { createHash } from 'node:crypto'
import { basename, dirname, isAbsolute, posix, relative, resolve } from 'node:path'
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
  /**
   * Identifies whether the input came from the retained legacy tree or the
   * canonical docs tree. Canonical pages may have intentionally removed a
   * one-off legacy repair artifact while legacy fallback migration must still
   * enforce that repair.
   */
  readonly sourceKind?: 'legacy' | 'canonical'
  readonly entries?: readonly ContentEntry[]
  readonly headingIndex?: HeadingIndex
}

export interface MigrateContentOptions {
  readonly rootDirectory?: string
  readonly entries?: readonly ContentEntry[]
  readonly imageNames?: readonly string[]
  readonly deletedSources?: readonly string[]
  readonly legacyArtifactInventory?: LegacyArtifactInventory
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
  /**
   * Some pages were fully rewritten in the canonical corpus and no longer
   * contain the historical artifact. Keep strict validation for legacy input,
   * but allow the canonical rewrite to omit that artifact.
   */
  readonly allowCanonicalAbsent?: boolean
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

export const expectedBrandLogoSha256 =
  'a7bc5657e071e590708783a107a94f0f550f23d95769eab6b9ed4b633fd67e32'

const legacyArtifactDirectories = [
  'api/static',
  'api/images',
  'docs/assets',
  'docs/images',
  'docs/plugins',
] as const

type LegacyArtifactDirectory = (typeof legacyArtifactDirectories)[number]

export type LegacyArtifactInventory = Readonly<
  Partial<Record<LegacyArtifactDirectory, readonly string[]>>
>

const defaultApiStaticFiles = Object.freeze([
  'docsify-config.js',
  'docsify-copy-code@2-styles.css',
  'docsify-copy-code@2.js',
  'docsify-copy-code@2.min.js',
  'docsify.js',
  'docsify.min.js',
  'fonts.css',
  'fonts/6xK3dSBYKcSV-LCoeQqfX1RYOo3qN67lqDY.woff2',
  'fonts/6xK3dSBYKcSV-LCoeQqfX1RYOo3qNK7lqDY.woff2',
  'fonts/6xK3dSBYKcSV-LCoeQqfX1RYOo3qNa7lqDY.woff2',
  'fonts/6xK3dSBYKcSV-LCoeQqfX1RYOo3qNq7lqDY.woff2',
  'fonts/6xK3dSBYKcSV-LCoeQqfX1RYOo3qO67lqDY.woff2',
  'fonts/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7l.woff2',
  'fonts/6xK3dSBYKcSV-LCoeQqfX1RYOo3qPK7lqDY.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwkxduz8A.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwlBduz8A.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwlxdu.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwmBduz8A.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwmRduz8A.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwmhduz8A.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwmxduz8A.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwkxduz8A.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwlBduz8A.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwlxdu.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwmBduz8A.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwmRduz8A.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwmhduz8A.woff2',
  'fonts/6xKydSBYKcSV-LCoeQqfX1RYOo3ik4zwmxduz8A.woff2',
  'fonts/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_QOW4Ep0.woff2',
  'fonts/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_R-W4Ep0.woff2',
  'fonts/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_ROW4.woff2',
  'fonts/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_S-W4Ep0.woff2',
  'fonts/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_SeW4Ep0.woff2',
  'fonts/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_SuW4Ep0.woff2',
  'prism-java.js',
  'prism-java.min.js',
  'prism-kotlin.js',
  'prism-kotlin.min.js',
  'search.js',
  'search.min.js',
  'vue.css',
  'zoom-image-styles.css',
  'zoom-image.js',
  'zoom-image.min.js',
])

const defaultDocsAssetFiles = Object.freeze([
  'dnt_helper.js',
  'fonts.css',
  'fonts/S6u8w4BMUTPHjxsAUi-qJCY.woff2',
  'fonts/S6u8w4BMUTPHjxsAXC-q.woff2',
  'fonts/S6u9w4BMUTPHh6UVSwaPGR_p.woff2',
  'fonts/S6u9w4BMUTPHh6UVSwiPGQ.woff2',
  'fonts/S6uyw4BMUTPHjx4wXg.woff2',
  'fonts/S6uyw4BMUTPHjxAwXjeu.woff2',
  'sh.css',
  'sh_java.js',
  'sh_javascript.js',
  'sh_main.js',
  'style.css',
])

const defaultDocsPluginFiles = Object.freeze([
  'docsify-copy-code@2-styles.css',
  'docsify-copy-code@2.js',
  'zoom-image-styles.css',
  'zoom-image.js',
])

export const defaultLegacyArtifactInventory = Object.freeze({
  'api/static': defaultApiStaticFiles,
  'api/images': legacyImageNames,
  'docs/assets': defaultDocsAssetFiles,
  'docs/images': legacyImageNames,
  'docs/plugins': defaultDocsPluginFiles,
}) satisfies Readonly<Record<LegacyArtifactDirectory, readonly string[]>>

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
    allowCanonicalAbsent: true,
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
  allowCanonicalAbsent = false,
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
  if (allowCanonicalAbsent && oldCount === 0 && repairedCount === 0) {
    return markdown
  }

  throw new Error(
    `Audited repair state mismatch for ${group.legacySource} (${group.id}): ` +
      `expected ${group.expectedOccurrences}, legacy=${oldCount}, repaired=${repairedCount}`,
  )
}

export function repairKnownContentDefects(
  markdown: string,
  context: Pick<MigrationContext, 'current' | 'sourceKind'>,
): string {
  let repaired = auditedRepairGroups
    .filter((group) => group.legacySource === context.current.legacySource)
    .reduce(
      (value, group) =>
        applyAuditedRepairGroup(
          value,
          group,
          context.sourceKind === 'canonical' && group.allowCanonicalAbsent === true,
        ),
      markdown,
    )

  if (context.current.legacySource === 'api/ocrOptionsType.md') {
    const duplicateTitle = '# OcrOptions\n\n## OcrOptions\n'
    if (repaired.startsWith(duplicateTitle)) {
      repaired = '# OcrOptions\n' + repaired.slice(duplicateTitle.length)
    }

    const legacyTitleCount = countAtLineBoundary(
      repaired,
      '## OcrOptions\n',
    )
    const initialH1Count = [...repaired.matchAll(/^#\s+\S.*$/gm)].length
    if (legacyTitleCount === 1 && initialH1Count === 0) {
      repaired = repaired.replace('## OcrOptions\n', '# OcrOptions\n')
    }

    const expectedHeadingCount = countAtLineBoundary(repaired, '# OcrOptions\n')
    const remainingLegacyTitleCount = countAtLineBoundary(
      repaired,
      '## OcrOptions\n',
    )
    const h1Count = [...repaired.matchAll(/^#\s+\S.*$/gm)].length
    if (
      expectedHeadingCount !== 1 ||
      remainingLegacyTitleCount !== 0 ||
      h1Count !== 1
    ) {
      throw new Error(
        `Audited repair state mismatch for api/ocrOptionsType.md (ocr-options-h1): ` +
          `expected 1, OcrOptions=${expectedHeadingCount}, ` +
          `legacy=${remainingLegacyTitleCount}, h1=${h1Count}`,
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

interface MarkdownLine {
  readonly start: number
  readonly end: number
  readonly content: string
}

function markdownLines(markdown: string): readonly MarkdownLine[] {
  const lines: MarkdownLine[] = []
  let start = 0

  while (start < markdown.length) {
    const newline = markdown.indexOf('\n', start)
    const end = newline < 0 ? markdown.length : newline + 1
    const contentEnd =
      newline < 0
        ? markdown.length
        : newline > start && markdown[newline - 1] === '\r'
          ? newline - 1
          : newline
    lines.push({ start, end, content: markdown.slice(start, contentEnd) })
    start = end
  }
  return lines
}

function isTableDelimiter(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed.includes('|')) return false
  const cells = trimmed
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
  return (
    cells.length >= 1 &&
    cells.every((cell) => /^[ \t]*:?-+:?[ \t]*$/.test(cell))
  )
}

function tableLineStarts(markdown: string): ReadonlySet<number> {
  const lines = markdownLines(markdown)
  const starts = new Set<number>()
  const candidates = lines.map(({ content }) =>
    content.replace(/[ \t]+$/, '').replace(/\|<br>$/, '|'),
  )

  for (let index = 1; index < lines.length; index += 1) {
    if (!isTableDelimiter(candidates[index])) continue
    if (!candidates[index - 1].includes('|')) continue

    starts.add(lines[index - 1].start)
    starts.add(lines[index].start)
    for (let row = index + 1; row < lines.length; row += 1) {
      if (candidates[row].trim() === '' || !candidates[row].includes('|')) break
      starts.add(lines[row].start)
    }
  }
  return starts
}

function isProtectedOffset(
  offset: number,
  ranges: readonly { readonly start: number; readonly end: number }[],
): boolean {
  return ranges.some((range) => offset >= range.start && offset < range.end)
}

function repairTrailingTableBreaks(markdown: string): string {
  const { protectedRanges } = scanMarkdownCode(markdown)
  const tableStarts = tableLineStarts(markdown)
  return markdown.replace(/\|<br>(?=\r?$)/gm, (artifact, offset: number) => {
    const lineStart = markdown.lastIndexOf('\n', Math.max(0, offset - 1)) + 1
    return tableStarts.has(lineStart) && !isProtectedOffset(offset, protectedRanges)
      ? '|'
      : artifact
  })
}

function normalizeTrailingWhitespace(markdown: string): string {
  const repaired = repairTrailingTableBreaks(markdown)
  const { protectedRanges } = scanMarkdownCode(repaired)
  const tableStarts = tableLineStarts(repaired)
  const normalized = repaired.replace(
    /[ \t]+(?=\r?$)/gm,
    (whitespace: string, offset: number) => {
      const insideProtectedCode = isProtectedOffset(offset, protectedRanges)
      const lineStart = repaired.lastIndexOf('\n', Math.max(0, offset - 1)) + 1
      const linePrefix = repaired.slice(lineStart, offset)
      const insideIndentedCode = /^(?: {4}|\t)/.test(linePrefix)

      if (
        !insideProtectedCode &&
        !insideIndentedCode &&
        !tableStarts.has(lineStart) &&
        /^ {2,}$/.test(whitespace)
      ) {
        return '<br>'
      }
      return ''
    },
  )
  if (normalized === '') return normalized
  return normalized.replace(/(?:\r?\n)+$/, '') + '\n'
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
  context: Pick<MigrationContext, 'current' | 'sourceKind'>,
): string {
  const brandContext = {
    current: {
      legacySource: context.current.legacySource ?? context.current.source,
    },
  }
  return normalizeMarkdownSyntax(
    normalizeTrailingWhitespace(
      applyBrandPolicy(repairKnownContentDefects(markdown, context), brandContext),
    ),
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

export function migratedImageName(name: string): string {
  return name.replace(/^autojs6-notification-/i, 'monkeyking-notification-')
}

export const migratedImageNames: readonly string[] = Object.freeze(
  legacyImageNames.map(migratedImageName),
)

function normalizedRepositoryPath(path: string): string {
  return path.replaceAll('\\', '/')
}

function assertExactFileInventory(
  actual: ReadonlySet<string>,
  expected: ReadonlySet<string>,
  label: string,
): void {
  const unexpected = [...actual]
    .filter((name) => !expected.has(name))
    .sort()
  if (unexpected.length > 0) {
    throw new Error(`Unknown ${label} artifact: ${unexpected.join(', ')}`)
  }
  const missing = [...expected]
    .filter((name) => !actual.has(name))
    .sort()
  if (missing.length > 0) {
    throw new Error(`Missing ${label} artifact: ${missing.join(', ')}`)
  }
}

function lstatIfPresent(path: string): ReturnType<typeof lstatSync> | undefined {
  try {
    return lstatSync(path)
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return undefined
    }
    throw error
  }
}

function normalizeLegacyArtifactName(
  directory: LegacyArtifactDirectory,
  name: string,
): string {
  const normalized = normalizedRepositoryPath(name)
  if (
    normalized === '' ||
    normalized.startsWith('/') ||
    normalized !== posix.normalize(normalized) ||
    normalized === '..' ||
    normalized.startsWith('../')
  ) {
    throw new Error(
      `Invalid legacy artifact inventory entry for ${directory}: ${name}`,
    )
  }
  return normalized
}

function resolvedLegacyArtifactInventory(
  defaultEntries: boolean,
  imageNames: readonly string[],
  overrides: LegacyArtifactInventory | undefined,
): Readonly<Record<LegacyArtifactDirectory, readonly string[]>> {
  const base: Record<LegacyArtifactDirectory, readonly string[]> = defaultEntries
    ? { ...defaultLegacyArtifactInventory }
    : {
        'api/static': [],
        'api/images': imageNames,
        'docs/assets': [],
        'docs/images': [],
        'docs/plugins': [],
      }

  for (const directory of legacyArtifactDirectories) {
    const override = overrides?.[directory]
    if (override !== undefined) base[directory] = override
    base[directory] = Object.freeze(
      base[directory].map((name) => normalizeLegacyArtifactName(directory, name)),
    )
  }
  return Object.freeze(base)
}

function inspectLegacyArtifactDirectory(
  rootDirectory: string,
  repositoryDirectory: LegacyArtifactDirectory,
  expectedNames: readonly string[],
  required: boolean,
): void {
  const absoluteDirectory = resolve(rootDirectory, repositoryDirectory)
  const rootStats = lstatIfPresent(absoluteDirectory)
  if (!rootStats) {
    if (required) {
      throw new Error(`Missing legacy artifact directory: ${repositoryDirectory}`)
    }
    return
  }
  if (rootStats.isSymbolicLink()) {
    throw new Error(`Symbolic link legacy artifact: ${repositoryDirectory}`)
  }
  if (!rootStats.isDirectory()) {
    throw new Error(`Expected legacy artifact directory: ${repositoryDirectory}`)
  }

  const expected = new Set(expectedNames)
  const actual = new Set<string>()
  const visit = (directory: string, relativeDirectory = ''): void => {
    for (const artifact of readdirSync(directory, { withFileTypes: true })) {
      const relativeName = relativeDirectory
        ? `${relativeDirectory}/${artifact.name}`
        : artifact.name
      const repositoryPath = `${repositoryDirectory}/${relativeName}`
      const absolutePath = resolve(directory, artifact.name)
      const stats = lstatSync(absolutePath)

      if (stats.isSymbolicLink()) {
        throw new Error(`Symbolic link legacy artifact: ${repositoryPath}`)
      }
      if (stats.isDirectory()) {
        if (![...expected].some((name) => name.startsWith(`${relativeName}/`))) {
          throw new Error(`Unknown legacy artifact: ${repositoryPath}`)
        }
        visit(absolutePath, relativeName)
        continue
      }
      if (!stats.isFile()) {
        throw new Error(`Unsupported legacy artifact: ${repositoryPath}`)
      }
      actual.add(relativeName)
    }
  }
  visit(absoluteDirectory)

  assertExactFileInventory(
    actual,
    expected,
    `legacy ${repositoryDirectory}`,
  )
}

function validateLegacyArtifactInventory(
  rootDirectory: string,
  inventory: Readonly<Record<LegacyArtifactDirectory, readonly string[]>>,
  requireDefaultRoots: boolean,
  legacyLayoutExists: boolean,
  explicitInventory: LegacyArtifactInventory | undefined,
): void {
  const explicit = explicitInventory ?? {}
  for (const directory of legacyArtifactDirectories) {
    const explicitlyRequired = Object.prototype.hasOwnProperty.call(
      explicit,
      directory,
    )
    inspectLegacyArtifactDirectory(
      rootDirectory,
      directory,
      inventory[directory],
      requireDefaultRoots || (legacyLayoutExists && explicitlyRequired),
    )
  }
}

function fileSha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function validateDefaultBrandLogo(rootDirectory: string): string {
  const repositoryPath = 'docs/public/logo.png'
  const path = resolve(rootDirectory, repositoryPath)
  const stats = lstatIfPresent(path)
  if (!stats) throw new Error(`Missing committed brand logo: ${repositoryPath}`)
  if (stats.isSymbolicLink() || !stats.isFile()) {
    throw new Error(`Expected regular committed brand logo: ${repositoryPath}`)
  }
  const actualSha256 = fileSha256(path)
  if (actualSha256 !== expectedBrandLogoSha256) {
    throw new Error(
      `Invalid committed brand logo SHA-256: expected ${expectedBrandLogoSha256}, got ${actualSha256}`,
    )
  }
  return path
}

function validateApiLayout(
  rootDirectory: string,
  entries: readonly ContentEntry[],
  retiredSources: readonly string[],
  requireLegacyRuntimeArtifacts: boolean,
): void {
  const apiDirectory = resolveRepoPath(rootDirectory, 'api')
  if (!existsSync(apiDirectory)) return

  const expectedMarkdownNames = new Set(
    [
      ...entries.flatMap(({ legacySource }) =>
        legacySource === undefined ? [] : [legacySource],
      ),
      ...retiredSources,
    ].map((path) => basename(path)),
  )
  const allowedFiles = new Set([
    ...expectedMarkdownNames,
    '.gitignore',
    'CNAME',
    'index.html',
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
    ]) {
      if (!topLevel.some(({ name }) => name === required)) {
        throw new Error(`Missing api artifact: api/${required}`)
      }
    }
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
    'docs/public/logo.png',
    'docs/public/CNAME',
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
  legacyArtifactInventory: Readonly<
    Record<LegacyArtifactDirectory, readonly string[]>
  >,
  explicitLegacyArtifactInventory: LegacyArtifactInventory | undefined,
): void {
  const legacyLayoutExists = existsSync(resolve(rootDirectory, 'api'))
  validateLegacyArtifactInventory(
    rootDirectory,
    legacyArtifactInventory,
    requireLegacyRuntimeArtifacts,
    legacyLayoutExists,
    explicitLegacyArtifactInventory,
  )
  validateApiLayout(
    rootDirectory,
    entries,
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
  const defaultEntries = options.entries === undefined
  const legacyArtifactInventory = resolvedLegacyArtifactInventory(
    defaultEntries,
    imageNames,
    options.legacyArtifactInventory,
  )
  validateMigrationLayout(
    rootDirectory,
    entries,
    imageNames,
    retiredSources,
    defaultEntries && existsSync(resolve(rootDirectory, 'api')),
    legacyArtifactInventory,
    options.legacyArtifactInventory,
  )
  const defaultBrandLogo = defaultEntries
    ? validateDefaultBrandLogo(rootDirectory)
    : undefined

  const migrationSources = entries.map((entry) => {
    const legacyPath = entry.legacySource
      ? resolveRepoPath(rootDirectory, entry.legacySource)
      : undefined
    const canonicalPath = resolveRepoPath(rootDirectory, entry.source)
    const inputPath = existsSync(canonicalPath) ? canonicalPath : legacyPath
    if (
      inputPath === undefined ||
      !existsSync(inputPath) ||
      !statSync(inputPath).isFile()
    ) {
      throw new Error(
        `Missing migration input for ${entry.id}: ${entry.legacySource ? `${entry.legacySource} or ` : ''}${entry.source}`,
      )
    }
    return {
      entry,
      markdown: readFileSync(inputPath, 'utf8'),
      sourceKind: inputPath === canonicalPath ? ('canonical' as const) : ('legacy' as const),
    }
  })

  if (options.entries === undefined) {
    assertDefaultVueInterpolationState(migrationSources)
  }

  const preprocessedSources = migrationSources.map((source) => ({
    entry: source.entry,
    markdown: preprocessMarkdown(source.markdown, {
      current: source.entry,
      sourceKind: source.sourceKind,
    }),
  }))

  const headingIndex = await buildHeadingIndex(preprocessedSources)
  const migratedSources = preprocessedSources.map((source) => {
    const markdown = rewriteMarkdownLinks(source.markdown, {
      current: source.entry,
      entries,
      headingIndex,
    })
    assertAllowedLegacyBrands(markdown, {
      current: {
        legacySource: source.entry.legacySource ?? source.entry.source,
      },
    })
    return { entry: source.entry, markdown }
  })

  let entriesWritten = 0
  for (const source of migratedSources) {
    const destination = resolveRepoPath(rootDirectory, source.entry.source)
    if (writeIfChanged(destination, source.markdown)) entriesWritten += 1
  }

  let imagesCopied = 0
  for (const imageName of imageNames) {
    const legacySource = resolveRepoPath(
      rootDirectory,
      `api/images/${imageName}`,
    )
    const source =
      imageName === 'logo.png' && defaultBrandLogo
        ? defaultBrandLogo
        : legacySource
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

  const legacyCname = resolveRepoPath(rootDirectory, 'api/CNAME')
  const publicCname = resolveRepoPath(rootDirectory, 'docs/public/CNAME')
  if (existsSync(legacyCname)) removeIfPresent(legacyCname)
  if (existsSync(publicCname)) removeIfPresent(publicCname)

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
