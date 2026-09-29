export const contentSections = Object.freeze([
  Object.freeze({ id: 'guide', title: 'Guide' }),
  Object.freeze({ id: 'project', title: 'Project' }),
  Object.freeze({ id: 'api/core', title: 'Core API' }),
  Object.freeze({ id: 'api/automation', title: 'Automation API' }),
  Object.freeze({ id: 'api/system', title: 'System API' }),
  Object.freeze({ id: 'api/media', title: 'Media API' }),
  Object.freeze({ id: 'api/network', title: 'Network API' }),
  Object.freeze({ id: 'api/utilities', title: 'Utility API' }),
  Object.freeze({ id: 'api/types', title: 'API Types' }),
  Object.freeze({ id: 'reference/android', title: 'Android Reference' }),
  Object.freeze({ id: 'reference/runtime', title: 'Runtime Reference' }),
  Object.freeze({ id: 'reference/glossaries', title: 'Glossaries' }),
  Object.freeze({ id: 'reference/dm', title: '大漠参考' }),
  Object.freeze({ id: 'reference', title: 'Reference' }),
] as const)

export type ContentSectionId = (typeof contentSections)[number]['id']

export interface ContentEntry {
  readonly id: string
  readonly legacySource?: string
  readonly source: string
  readonly route: string
  readonly title: string
  readonly section: ContentSectionId
  readonly jsonNames: readonly string[]
  readonly includeInLegacyAll: boolean
  /** @deprecated Use jsonNames. */
  readonly legacyJsonNames: readonly string[]
}

type ContentTargetPath = `${ContentSectionId}/${string}`
type LegacyContentEntryDefinition = readonly [
  legacyStem: string,
  targetPathUnderDocs: ContentTargetPath,
  title: string,
  legacyJsonNames?: readonly [string, ...string[]],
]
type CanonicalContentEntryDefinition = readonly [
  legacyStem: undefined,
  targetPathUnderDocs: ContentTargetPath,
  title: string,
  jsonNames: readonly [string, ...string[]],
]
type ContentEntryDefinition =
  | LegacyContentEntryDefinition
  | CanonicalContentEntryDefinition

type DottedPath<Path extends string> =
  Path extends `${infer Head}/${infer Tail}`
    ? `${Head}.${DottedPath<Tail>}`
    : Path

type DirectoryPath<Path extends string> =
  Path extends `${infer Head}/${infer Tail}`
    ? Tail extends `${string}/${string}`
      ? `${Head}/${DirectoryPath<Tail>}`
      : Head
    : never

type DefinitionJsonNames<Definition extends ContentEntryDefinition> =
  Definition[3] extends readonly [string, ...string[]]
    ? Definition[3]
    : Definition[0] extends string
      ? readonly [Definition[0]]
      : never

type ContentEntryFromDefinition<
  Definition extends ContentEntryDefinition,
> = Definition extends ContentEntryDefinition
  ? Readonly<{
      id: DottedPath<Definition[1]>
      legacySource: Definition[0] extends string
        ? `api/${Definition[0]}.md`
        : undefined
      source: `docs/${Definition[1]}.md`
      route: `/${Definition[1]}.html`
      title: Definition[2]
      section: Extract<DirectoryPath<Definition[1]>, ContentSectionId>
      jsonNames: DefinitionJsonNames<Definition>
      includeInLegacyAll: boolean
      legacyJsonNames: DefinitionJsonNames<Definition>
    }>
  : never

const KEBAB_CASE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SAFE_LEGACY_JSON_STEM = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/

const legacyAllEntryIdDefinitions = [
  'guide.overview',
  'project.about',
  'guide.troubleshooting',
  'api.core.global',
  'api.automation.automator',
  'api.core.monkeyking',
  'api.core.app',
  'api.media.color',
  'api.media.image',
  'api.media.ocr',
  'api.media.barcode',
  'api.media.qr-code',
  'api.automation.keys',
  'api.system.device',
  'api.system.storages',
  'api.system.files',
  'api.system.engines',
  'api.system.tasks',
  'api.core.modules',
  'api.core.plugins',
  'api.system.toast',
  'api.system.notice',
  'api.system.console',
  'api.system.shell',
  'api.media.media',
  'api.system.sensors',
  'api.media.recorder',
  'api.system.timers',
  'api.system.threads',
  'api.system.continuation',
  'api.system.events',
  'api.automation.dialogs',
  'api.automation.floaty',
  'api.media.canvas',
  'api.automation.ui',
  'api.network.web',
  'api.network.http',
  'api.utilities.base64',
  'api.utilities.crypto',
  'api.utilities.opencc',
  'api.utilities.i18n',
  'api.utilities.e4x',
] as const
const legacyAllEntryIdSet = new Set<string>(legacyAllEntryIdDefinitions)

const contentDefinitions = [
  ['overview', 'guide/overview', 'Overview - 综述'],
  ['manual', 'guide/manual', 'Manual - Monkey King 使用手册'],
  ['qa', 'guide/troubleshooting', 'Troubleshooting - 疑难解答'],
  ['documentation', 'project/about', 'About - 关于文档'],
  ['progress', 'project/progress', 'Progress - 文档部署进度'],
  ['changelog', 'project/changelog', 'Changelog - 文档更新日志'],
  ['global', 'api/core/global', 'Global - 全局对象'],
  ['autojs', 'api/core/monkeyking', 'Monkey King - 本体应用', ['monkeyking', 'autojs']],
  ['app', 'api/core/app', 'App - 通用应用'],
  ['modules', 'api/core/modules', 'Modules - 模块'],
  ['plugins', 'api/core/plugins', 'Plugins - 插件'],
  ['automator', 'api/automation/automator', 'Automator - 自动化'],
  ['keys', 'api/automation/keys', 'Keys - 按键'],
  ['dialogs', 'api/automation/dialogs', 'Dialogs - 对话框'],
  ['floaty', 'api/automation/floaty', 'Floaty - 悬浮窗'],
  ['ui', 'api/automation/ui', 'UI - 用户界面'],
  ['uiSelectorType', 'api/automation/ui-selector', 'UiSelector - 选择器'],
  ['uiObjectType', 'api/automation/ui-object', 'UiObject - 控件节点'],
  ['uiObjectCollectionType', 'api/automation/ui-object-collection', 'UiObjectCollection - 控件集合'],
  ['uiObjectActionsType', 'api/automation/ui-object-actions', 'UiObjectActions - 控件节点行为'],
  ['console', 'api/system/console', 'Console - 控制台'],
  ['device', 'api/system/device', 'Device - 设备'],
  ['storages', 'api/system/storages', 'Storages - 存储'],
  ['files', 'api/system/files', 'Files - 文件'],
  ['engines', 'api/system/engines', 'Engines - 引擎'],
  ['tasks', 'api/system/tasks', 'Tasks - 任务'],
  ['toast', 'api/system/toast', 'Toast - 消息浮动框'],
  ['notice', 'api/system/notice', 'Notice - 消息通知'],
  ['shell', 'api/system/shell', 'Shell'],
  ['shizuku', 'api/system/shizuku', 'Shizuku'],
  ['sensors', 'api/system/sensors', 'Sensors - 传感器'],
  ['timers', 'api/system/timers', 'Timers - 定时器'],
  ['threads', 'api/system/threads', 'Threads - 线程'],
  ['continuation', 'api/system/continuation', 'Continuation - 协程'],
  ['events', 'api/system/events', 'Events - 事件监听'],
  [undefined, 'api/system/sysprops', 'Sysprops - 系统属性', ['sysprops']],
  [undefined, 'api/system/sqlite', 'SQLite - 数据库', ['sqlite']],
  ['color', 'api/media/color', 'Color - 颜色'],
  ['image', 'api/media/image', 'Images - 图像'],
  ['ocr', 'api/media/ocr', 'OCR - 光学字符识别'],
  [undefined, 'api/media/dm', 'DM - 图色与文字识别 API', ['dmApi']],
  ['barcode', 'api/media/barcode', 'Barcode - 条码'],
  ['qrcode', 'api/media/qr-code', 'QR Code - 二维码'],
  ['media', 'api/media/media', 'Media - 多媒体'],
  ['recorder', 'api/media/recorder', 'Recorder - 记录器'],
  ['canvas', 'api/media/canvas', 'Canvas - 画布'],
  [undefined, 'api/media/mediainfo', 'MediaInfo - 媒体信息', ['mediainfo']],
  ['web', 'api/network/web', 'Web - 万维网'],
  ['http', 'api/network/http', 'HTTP'],
  ['webSocketType', 'api/network/web-socket', 'WebSocket'],
  ['base64', 'api/utilities/base64', 'Base64'],
  ['crypto', 'api/utilities/crypto', 'Crypto - 密文'],
  ['opencc', 'api/utilities/opencc', 'OpenCC - 中文转换'],
  ['i18n', 'api/utilities/i18n', 'Internationalization - 国际化'],
  ['s13n', 'api/utilities/s13n', 'Standardization - 标准化'],
  ['e4x', 'api/utilities/e4x', 'E4X'],
  ['polyfill', 'api/utilities/polyfill', 'Polyfill - 代码填泥'],
  ['arrayx', 'api/utilities/arrayx', 'Arrayx - Array 扩展'],
  ['numberx', 'api/utilities/numberx', 'Numberx - Number 扩展'],
  ['mathx', 'api/utilities/mathx', 'Mathx - Math 扩展'],
  ['versionType', 'api/utilities/version', 'Version - 版本工具类'],
  [undefined, 'api/utilities/util', 'Util - 实用工具', ['util']],
  [undefined, 'api/utilities/converter', 'Converter / cvt - 数据转换', ['cvt']],
  [undefined, 'api/utilities/formatter', 'Formatter / fmt - 数据格式化', ['fmt']],
  [undefined, 'api/utilities/jsox', 'Jsox - JavaScript 对象扩展', ['jsox']],
  [undefined, 'api/utilities/mime', 'MIME - 媒体类型', ['mime']],
  [undefined, 'api/utilities/zip', 'Zip - 压缩与解压', ['zip']],
  [undefined, 'api/utilities/nanoid', 'NanoID', ['nanoid']],
  [undefined, 'api/utilities/pinyin', 'Pinyin - 拼音', ['pinyin']],
  [undefined, 'api/utilities/pinyin4j', 'Pinyin4j - 拼音转换', ['pinyin4j']],
  ['androidBundleType', 'api/types/android-bundle', 'AndroidBundle'],
  ['androidRectType', 'api/types/android-rect', 'AndroidRect'],
  ['appType', 'api/types/app', 'App - 应用枚举类'],
  ['colorType', 'api/types/color', 'Color - 颜色类'],
  ['consoleBuildOptionsType', 'api/types/console-build-options', 'ConsoleBuildOptions'],
  ['cryptoCipherOptionsType', 'api/types/crypto-cipher-options', 'CryptoCipherOptions'],
  ['cryptoKeyPairType', 'api/types/crypto-key-pair', 'CryptoKeyPair'],
  ['cryptoKeyType', 'api/types/crypto-key', 'CryptoKey'],
  ['dataTypes', 'api/types/data-types', 'Data Types - 数据类型'],
  ['eventEmitterType', 'api/types/event-emitter', 'EventEmitter - 事件发射器'],
  ['httpRequestBuilderOptionsType', 'api/types/http-request-builder-options', 'HttpRequestBuilderOptions'],
  ['httpRequestHeadersType', 'api/types/http-request-headers', 'HttpRequestHeaders'],
  ['httpResponseBodyType', 'api/types/http-response-body', 'HttpResponseBody'],
  ['httpResponseHeadersType', 'api/types/http-response-headers', 'HttpResponseHeaders'],
  ['httpResponseType', 'api/types/http-response', 'HttpResponse'],
  ['imageWrapperType', 'api/types/image-wrapper', 'ImageWrapper - 包装图像类'],
  ['injectableWebClientType', 'api/types/injectable-web-client', 'InjectableWebClient'],
  ['injectableWebViewType', 'api/types/injectable-web-view', 'InjectableWebView'],
  ['noticeBuilderType', 'api/types/notice-builder', 'NoticeBuilder'],
  ['noticeChannelOptionsType', 'api/types/notice-channel-options', 'NoticeChannelOptions'],
  ['noticeOptionsType', 'api/types/notice-options', 'NoticeOptions'],
  ['noticePresetConfigurationType', 'api/types/notice-preset-configuration', 'NoticePresetConfiguration'],
  ['ocrOptionsType', 'api/types/ocr-options', 'OcrOptions'],
  ['okhttp3HttpUrlType', 'api/types/okhttp3-http-url', 'OkHttp3 HttpUrl'],
  ['okhttp3RequestType', 'api/types/okhttp3-request', 'OkHttp3 Request'],
  ['omniTypes', 'api/types/omni-types', 'Omnipotent Types - 全能类型'],
  ['openCCConversionType', 'api/types/opencc-conversion', 'OpenCCConversion'],
  ['opencvPointType', 'api/types/opencv-point', 'OpenCVPoint'],
  ['opencvRectType', 'api/types/opencv-rect', 'OpenCVRect'],
  ['opencvSizeType', 'api/types/opencv-size', 'OpenCVSize'],
  ['storageType', 'api/types/storage', 'Storage - 存储类'],
  ['activity', 'reference/android/activity', 'Activity - 活动'],
  ['context', 'reference/android/context', 'Context - 上下文'],
  ['apiLevel', 'reference/android/api-level', 'Android API Level - 安卓 API 级别'],
  ['scriptingJava', 'reference/android/scripting-java', 'Scripting Java - 脚本化 Java'],
  ['runtime', 'reference/runtime/runtime', 'Runtime - 运行时'],
  ['intentType', 'reference/runtime/intent', 'Intent - 意图'],
  ['exceptions', 'reference/runtime/exceptions', 'Exceptions - 异常'],
  ['glossaries', 'reference/glossaries/glossary', 'Glossary - 术语'],
  ['httpHeaderGlossary', 'reference/glossaries/http-headers', 'HTTP Headers - HTTP 标头'],
  ['httpRequestMethodsGlossary', 'reference/glossaries/http-request-methods', 'HTTP Request Methods - HTTP 请求方法'],
  ['mimeTypeGlossary', 'reference/glossaries/mime-types', 'MIME Types - MIME 类型'],
  ['notificationChannelGlossary', 'reference/glossaries/notification-channels', 'Notification Channels - 通知渠道'],
  [undefined, 'reference/dm/overview', 'DM - 图色与文字识别总览', ['dm']],
  [undefined, 'reference/dm/image', 'DM 图色与找图', ['dmImage']],
  [undefined, 'reference/dm/dictionary', 'DM 明文字库', ['dmDictionary']],
  [undefined, 'reference/dm/text', 'DM 字库文字识别', ['dmText']],
  [undefined, 'reference/dm/ocr-auto', 'DM 通用 OCR', ['dmOcrAuto']],
  [undefined, 'reference/dm/compatibility', 'DM Android 兼容约定', ['dmCompatibility']],
  [undefined, 'reference/dm/examples', 'DM Java / JS 示例', ['dmExamples']],
  [undefined, 'reference/dm/vscode', 'VS Code 大漠字库工具', ['dmVscode']],
  ['colorTable', 'reference/color-table', 'Color Table - 颜色列表'],
] as const satisfies readonly ContentEntryDefinition[]

const EXPECTED_CONTENT_ENTRY_COUNT = contentDefinitions.length
const EXPECTED_LEGACY_ALL_ENTRY_COUNT = legacyAllEntryIdDefinitions.length

function createContentEntry<
  const Definition extends ContentEntryDefinition,
>(definition: Definition): ContentEntryFromDefinition<Definition> {
  const [legacyStem, targetPathUnderDocs, title, explicitJsonNames] = definition
  const jsonNames = Object.freeze(
    explicitJsonNames
      ? [...explicitJsonNames]
      : legacyStem === undefined
        ? []
        : [legacyStem],
  )
  const id = targetPathUnderDocs.replaceAll('/', '.')

  return Object.freeze({
    id,
    legacySource:
      legacyStem === undefined ? undefined : 'api/' + legacyStem + '.md',
    source: 'docs/' + targetPathUnderDocs + '.md',
    route: '/' + targetPathUnderDocs + '.html',
    title,
    section: targetPathUnderDocs.slice(
      0,
      targetPathUnderDocs.lastIndexOf('/'),
    ),
    jsonNames,
    includeInLegacyAll: legacyAllEntryIdSet.has(id),
    legacyJsonNames: jsonNames,
  }) as unknown as ContentEntryFromDefinition<Definition>
}

type CatalogDefinition = (typeof contentDefinitions)[number]

export const contentEntries: readonly ContentEntryFromDefinition<CatalogDefinition>[] =
  Object.freeze(
    contentDefinitions.map((definition) => createContentEntry(definition)),
  )

export type ContentEntryId = (typeof contentEntries)[number]['id']

export const contentSectionOrder: readonly ContentSectionId[] = Object.freeze(
  contentSections.map(({ id }) => id),
)

export const contentEntriesBySection = Object.freeze(
  Object.fromEntries(
    contentSectionOrder.map((section) => [
      section,
      Object.freeze(
        contentEntries.filter((entry) => entry.section === section),
      ),
    ]),
  ),
) as unknown as Readonly<
  Record<ContentSectionId, readonly ContentEntry[]>
>

export const deletedLegacySources = Object.freeze([
  'api/all.md',
  'api/sidebar.md',
  'api/toc.md',
  'api/coverpage.md',
  'api/404.md',
  'api/util.md',
] as const)

export const frozenLegacyJsonStems = Object.freeze([
  'accessibilityActionsType',
  'coordinates-based-automation',
  'coordinatesBasedAutomation',
  'errors',
  'globals',
  'imageWrapper',
  'intent',
  'intrinsicTypes',
  'widgets-based-automation',
  'widgetsBasedAutomation',
] as const)

export const legacyAllEntryIds = Object.freeze(
  [...legacyAllEntryIdDefinitions] as const satisfies readonly ContentEntryId[],
)

export interface ContentCatalogValidationOptions {
  readonly entries?: readonly ContentEntry[]
  readonly deletedSources?: readonly string[]
  readonly frozenJsonStems?: readonly string[]
  readonly allEntryIds?: readonly string[]
  readonly legacyMarkdownSources?: readonly string[]
}

function sameOrderedValues(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  )
}

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value)
    }
    seen.add(value)
  }

  return [...duplicates]
}

function addDuplicateErrors(
  errors: string[],
  label: string,
  values: readonly string[],
): void {
  const duplicates = duplicateValues(values)
  if (duplicates.length > 0) {
    errors.push('Duplicate ' + label + ': ' + duplicates.join(', '))
  }
}

function validateSpecialMapping(
  errors: string[],
  entries: readonly ContentEntry[],
  expected: Pick<
    ContentEntry,
    'id' | 'legacySource' | 'source' | 'route' | 'legacyJsonNames'
  >,
): void {
  const actual = entries.find(
    ({ legacySource }) => legacySource === expected.legacySource,
  )

  if (
    !actual ||
    actual.id !== expected.id ||
    actual.source !== expected.source ||
    actual.route !== expected.route ||
    !sameOrderedValues(actual.legacyJsonNames, expected.legacyJsonNames)
  ) {
    errors.push('Invalid special mapping for ' + expected.legacySource)
  }
}

function addUnsafeJsonStemErrors(
  errors: string[],
  kind: 'generated' | 'frozen',
  stems: readonly string[],
  entryId?: string,
): void {
  for (const stem of stems) {
    if (!SAFE_LEGACY_JSON_STEM.test(stem)) {
      errors.push(
        'Invalid ' +
          kind +
          ' legacy JSON stem' +
          (entryId ? ' for ' + entryId : '') +
          ': ' +
          JSON.stringify(stem),
      )
    }
  }
}

export function validateContentCatalog(
  options: ContentCatalogValidationOptions = {},
): string[] {
  const entries = options.entries ?? contentEntries
  const deletedSources = options.deletedSources ?? deletedLegacySources
  const frozenJsonStems = options.frozenJsonStems ?? frozenLegacyJsonStems
  const allEntryIds = options.allEntryIds ?? legacyAllEntryIds
  const errors: string[] = []

  if (entries.length !== EXPECTED_CONTENT_ENTRY_COUNT) {
    errors.push(
      'Expected ' +
        EXPECTED_CONTENT_ENTRY_COUNT +
        ' content entries, found ' +
        entries.length,
    )
  }

  addDuplicateErrors(errors, 'content id', entries.map(({ id }) => id))
  addDuplicateErrors(
    errors,
    'legacy source',
    entries.flatMap(({ legacySource }) =>
      legacySource === undefined ? [] : [legacySource],
    ),
  )
  addDuplicateErrors(errors, 'source', entries.map(({ source }) => source))
  addDuplicateErrors(errors, 'route', entries.map(({ route }) => route))
  addDuplicateErrors(
    errors,
    'JSON name',
    entries.flatMap(({ jsonNames }) => jsonNames),
  )

  for (const entry of entries) {
    if (!entry.title.trim()) {
      errors.push('Missing title for ' + (entry.id || entry.source))
    }

    addUnsafeJsonStemErrors(errors, 'generated', entry.jsonNames, entry.id)

    if (
      entry.legacySource !== undefined &&
      !/^api\/[^/]+\.md$/.test(entry.legacySource)
    ) {
      errors.push(
        'Invalid legacy source for ' + entry.id + ': ' + entry.legacySource,
      )
    }

    if (!sameOrderedValues(entry.legacyJsonNames, entry.jsonNames)) {
      errors.push(`Legacy JSON-name alias mismatch for ${entry.id}`)
    }

    if (
      entry.includeInLegacyAll !== legacyAllEntryIdSet.has(entry.id)
    ) {
      errors.push(`Legacy all-document membership mismatch for ${entry.id}`)
    }

    if (!/^docs\/.+\.md$/.test(entry.source)) {
      errors.push('Invalid source for ' + entry.id + ': ' + entry.source)
      continue
    }

    const relativeSource = entry.source.slice('docs/'.length, -'.md'.length)
    const sourceSegments = relativeSource.split('/')
    const expectedSection = sourceSegments.slice(0, -1).join('/')
    const expectedId = relativeSource.replaceAll('/', '.')
    const expectedRoute = entry.source
      .slice('docs'.length)
      .replace(/\.md$/, '.html')

    if (!sourceSegments.every((segment) => KEBAB_CASE_SEGMENT.test(segment))) {
      errors.push(
        'Source path must be kebab-case for ' +
          entry.id +
          ': ' +
          entry.source,
      )
    }
    if (entry.section !== expectedSection) {
      errors.push(
        'Section mismatch for ' +
          entry.id +
          ': expected ' +
          expectedSection +
          ', found ' +
          entry.section,
      )
    }
    if (entry.id !== expectedId) {
      errors.push(
        'Id mismatch for ' +
          entry.source +
          ': expected ' +
          expectedId +
          ', found ' +
          entry.id,
      )
    }
    if (entry.route !== expectedRoute) {
      errors.push(
        'Route mismatch for ' +
          entry.id +
          ': expected ' +
          expectedRoute +
          ', found ' +
          entry.route,
      )
    }

    const expectedJsonNameCount =
      entry.id === 'api.core.monkeyking' ? 2 : 1
    if (entry.jsonNames.length !== expectedJsonNameCount) {
      errors.push(
        'Expected ' +
          expectedJsonNameCount +
          ' JSON name(s) for ' +
          entry.id +
          ', found ' +
          entry.jsonNames.length,
      )
    }
  }

  const actualSectionOrder = [
    ...new Set(entries.map(({ section }) => section)),
  ]
  if (!sameOrderedValues(actualSectionOrder, contentSectionOrder)) {
    errors.push(
      'Section order mismatch: expected ' +
        contentSectionOrder.join(', ') +
        ', found ' +
        actualSectionOrder.join(', '),
    )
  }

  validateSpecialMapping(errors, entries, {
    id: 'api.core.monkeyking',
    legacySource: 'api/autojs.md',
    source: 'docs/api/core/monkeyking.md',
    route: '/api/core/monkeyking.html',
    legacyJsonNames: ['monkeyking', 'autojs'],
  })
  validateSpecialMapping(errors, entries, {
    id: 'guide.troubleshooting',
    legacySource: 'api/qa.md',
    source: 'docs/guide/troubleshooting.md',
    route: '/guide/troubleshooting.html',
    legacyJsonNames: ['qa'],
  })
  validateSpecialMapping(errors, entries, {
    id: 'project.about',
    legacySource: 'api/documentation.md',
    source: 'docs/project/about.md',
    route: '/project/about.html',
    legacyJsonNames: ['documentation'],
  })

  if (!sameOrderedValues(deletedSources, deletedLegacySources)) {
    errors.push('Deleted legacy source list does not match the required six paths')
  }
  if (!sameOrderedValues(frozenJsonStems, frozenLegacyJsonStems)) {
    errors.push('Frozen legacy JSON stem list does not match the required ten stems')
  }
  addUnsafeJsonStemErrors(errors, 'frozen', frozenJsonStems)

  if (allEntryIds.length !== EXPECTED_LEGACY_ALL_ENTRY_COUNT) {
    errors.push(
      'Expected ' +
        EXPECTED_LEGACY_ALL_ENTRY_COUNT +
        ' legacy all-document entries, found ' +
        allEntryIds.length,
    )
  }
  addDuplicateErrors(errors, 'legacy all-document id', allEntryIds)
  if (!sameOrderedValues(allEntryIds, legacyAllEntryIds)) {
    errors.push('Legacy all-document entry order does not match the required order')
  }

  const knownIds = new Set(entries.map(({ id }) => id))
  const unknownAllEntryIds = allEntryIds.filter((id) => !knownIds.has(id))
  if (unknownAllEntryIds.length > 0) {
    errors.push(
      'Unknown legacy all-document content ids: ' +
        unknownAllEntryIds.join(', '),
    )
  }

  const generatedJsonNames = entries.flatMap(
    ({ jsonNames }) => jsonNames,
  )
  const frozenGeneratedCollisions = frozenJsonStems.filter((stem) =>
    generatedJsonNames.includes(stem),
  )
  if (frozenGeneratedCollisions.length > 0) {
    errors.push(
      'Frozen JSON stems collide with generated names: ' +
        frozenGeneratedCollisions.join(', '),
    )
  }

  const expectedLegacySources = [
    ...entries.flatMap(({ legacySource }) =>
      legacySource === undefined ? [] : [legacySource],
    ),
    ...deletedSources,
  ]
  addDuplicateErrors(errors, 'covered legacy source', expectedLegacySources)

  if (options.legacyMarkdownSources) {
    const actualSources = [...options.legacyMarkdownSources].sort()
    const expectedSources = [...expectedLegacySources].sort()
    const actualSet = new Set(actualSources)
    const expectedSet = new Set(expectedSources)
    const missingSources = expectedSources.filter(
      (source) => !actualSet.has(source),
    )
    const unexpectedSources = actualSources.filter(
      (source) => !expectedSet.has(source),
    )

    addDuplicateErrors(errors, 'actual legacy Markdown source', actualSources)
    if (missingSources.length > 0) {
      errors.push(
        'Missing legacy Markdown sources: ' + missingSources.join(', '),
      )
    }
    if (unexpectedSources.length > 0) {
      errors.push(
        'Unexpected legacy Markdown sources: ' +
          unexpectedSources.join(', '),
      )
    }
  }

  return errors
}
