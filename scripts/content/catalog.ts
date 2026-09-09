export interface ContentEntry {
  id: string
  legacySource: string
  source: string
  route: string
  title: string
  section: string
  legacyJsonNames: string[]
}

export interface ContentSectionMetadata {
  id: string
  title: string
}

type ContentEntryDefinition = readonly [
  legacyStem: string,
  targetPathUnderDocs: string,
  id: string,
  title: string,
  legacyJsonStem: string,
]

const EXPECTED_CONTENT_ENTRY_COUNT = 101
const EXPECTED_LEGACY_ALL_ENTRY_COUNT = 42
const KEBAB_CASE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function defineSectionEntries(
  section: string,
  definitions: readonly ContentEntryDefinition[],
): ContentEntry[] {
  return definitions.map(
    ([legacyStem, targetPathUnderDocs, id, title, legacyJsonStem]) => ({
      id,
      legacySource: 'api/' + legacyStem + '.md',
      source: 'docs/' + targetPathUnderDocs + '.md',
      route: '/' + targetPathUnderDocs + '.html',
      title,
      section,
      legacyJsonNames:
        id === 'api.core.monkeyking'
          ? ['monkeyking', 'autojs']
          : [legacyJsonStem],
    }),
  )
}

export const contentSections = [
  { id: 'guide', title: 'Guide' },
  { id: 'project', title: 'Project' },
  { id: 'api/core', title: 'Core API' },
  { id: 'api/automation', title: 'Automation API' },
  { id: 'api/system', title: 'System API' },
  { id: 'api/media', title: 'Media API' },
  { id: 'api/network', title: 'Network API' },
  { id: 'api/utilities', title: 'Utility API' },
  { id: 'api/types', title: 'API Types' },
  { id: 'reference/android', title: 'Android Reference' },
  { id: 'reference/runtime', title: 'Runtime Reference' },
  { id: 'reference/glossaries', title: 'Glossaries' },
  { id: 'reference', title: 'Reference' },
] as const satisfies readonly ContentSectionMetadata[]

export const contentSectionOrder: readonly string[] = contentSections.map(
  ({ id }) => id,
)

export const contentEntries: readonly ContentEntry[] = [
  ...defineSectionEntries('guide', [
    ['overview', 'guide/overview', 'guide.overview', 'Overview - 综述', 'overview'],
    [
      'manual',
      'guide/manual',
      'guide.manual',
      'Manual - Monkey King 使用手册',
      'manual',
    ],
    [
      'qa',
      'guide/troubleshooting',
      'guide.troubleshooting',
      'Troubleshooting - 疑难解答',
      'qa',
    ],
  ]),
  ...defineSectionEntries('project', [
    [
      'documentation',
      'project/about',
      'project.about',
      'About - 关于文档',
      'documentation',
    ],
    [
      'progress',
      'project/progress',
      'project.progress',
      'Progress - 文档部署进度',
      'progress',
    ],
    [
      'changelog',
      'project/changelog',
      'project.changelog',
      'Changelog - 文档更新日志',
      'changelog',
    ],
  ]),
  ...defineSectionEntries('api/core', [
    ['global', 'api/core/global', 'api.core.global', 'Global - 全局对象', 'global'],
    [
      'autojs',
      'api/core/monkeyking',
      'api.core.monkeyking',
      'Monkey King - 本体应用',
      'autojs',
    ],
    ['app', 'api/core/app', 'api.core.app', 'App - 通用应用', 'app'],
    ['modules', 'api/core/modules', 'api.core.modules', 'Modules - 模块', 'modules'],
    ['plugins', 'api/core/plugins', 'api.core.plugins', 'Plugins - 插件', 'plugins'],
  ]),
  ...defineSectionEntries('api/automation', [
    [
      'automator',
      'api/automation/automator',
      'api.automation.automator',
      'Automator - 自动化',
      'automator',
    ],
    ['keys', 'api/automation/keys', 'api.automation.keys', 'Keys - 按键', 'keys'],
    [
      'dialogs',
      'api/automation/dialogs',
      'api.automation.dialogs',
      'Dialogs - 对话框',
      'dialogs',
    ],
    [
      'floaty',
      'api/automation/floaty',
      'api.automation.floaty',
      'Floaty - 悬浮窗',
      'floaty',
    ],
    ['ui', 'api/automation/ui', 'api.automation.ui', 'UI - 用户界面', 'ui'],
    [
      'uiSelectorType',
      'api/automation/ui-selector',
      'api.automation.ui-selector',
      'UiSelector - 选择器',
      'uiSelectorType',
    ],
    [
      'uiObjectType',
      'api/automation/ui-object',
      'api.automation.ui-object',
      'UiObject - 控件节点',
      'uiObjectType',
    ],
    [
      'uiObjectCollectionType',
      'api/automation/ui-object-collection',
      'api.automation.ui-object-collection',
      'UiObjectCollection - 控件集合',
      'uiObjectCollectionType',
    ],
    [
      'uiObjectActionsType',
      'api/automation/ui-object-actions',
      'api.automation.ui-object-actions',
      'UiObjectActions - 控件节点行为',
      'uiObjectActionsType',
    ],
  ]),
  ...defineSectionEntries('api/system', [
    ['console', 'api/system/console', 'api.system.console', 'Console - 控制台', 'console'],
    ['device', 'api/system/device', 'api.system.device', 'Device - 设备', 'device'],
    [
      'storages',
      'api/system/storages',
      'api.system.storages',
      'Storages - 存储',
      'storages',
    ],
    ['files', 'api/system/files', 'api.system.files', 'Files - 文件', 'files'],
    ['engines', 'api/system/engines', 'api.system.engines', 'Engines - 引擎', 'engines'],
    ['tasks', 'api/system/tasks', 'api.system.tasks', 'Tasks - 任务', 'tasks'],
    ['toast', 'api/system/toast', 'api.system.toast', 'Toast - 消息浮动框', 'toast'],
    ['notice', 'api/system/notice', 'api.system.notice', 'Notice - 消息通知', 'notice'],
    ['shell', 'api/system/shell', 'api.system.shell', 'Shell', 'shell'],
    ['shizuku', 'api/system/shizuku', 'api.system.shizuku', 'Shizuku', 'shizuku'],
    ['sensors', 'api/system/sensors', 'api.system.sensors', 'Sensors - 传感器', 'sensors'],
    ['timers', 'api/system/timers', 'api.system.timers', 'Timers - 定时器', 'timers'],
    ['threads', 'api/system/threads', 'api.system.threads', 'Threads - 线程', 'threads'],
    [
      'continuation',
      'api/system/continuation',
      'api.system.continuation',
      'Continuation - 协程',
      'continuation',
    ],
    ['events', 'api/system/events', 'api.system.events', 'Events - 事件监听', 'events'],
  ]),
  ...defineSectionEntries('api/media', [
    ['color', 'api/media/color', 'api.media.color', 'Color - 颜色', 'color'],
    ['image', 'api/media/image', 'api.media.image', 'Images - 图像', 'image'],
    ['ocr', 'api/media/ocr', 'api.media.ocr', 'OCR - 光学字符识别', 'ocr'],
    ['barcode', 'api/media/barcode', 'api.media.barcode', 'Barcode - 条码', 'barcode'],
    ['qrcode', 'api/media/qr-code', 'api.media.qr-code', 'QR Code - 二维码', 'qrcode'],
    ['media', 'api/media/media', 'api.media.media', 'Media - 多媒体', 'media'],
    [
      'recorder',
      'api/media/recorder',
      'api.media.recorder',
      'Recorder - 记录器',
      'recorder',
    ],
    ['canvas', 'api/media/canvas', 'api.media.canvas', 'Canvas - 画布', 'canvas'],
  ]),
  ...defineSectionEntries('api/network', [
    ['web', 'api/network/web', 'api.network.web', 'Web - 万维网', 'web'],
    ['http', 'api/network/http', 'api.network.http', 'HTTP', 'http'],
    [
      'webSocketType',
      'api/network/web-socket',
      'api.network.web-socket',
      'WebSocket',
      'webSocketType',
    ],
  ]),
  ...defineSectionEntries('api/utilities', [
    ['base64', 'api/utilities/base64', 'api.utilities.base64', 'Base64', 'base64'],
    ['crypto', 'api/utilities/crypto', 'api.utilities.crypto', 'Crypto - 密文', 'crypto'],
    ['opencc', 'api/utilities/opencc', 'api.utilities.opencc', 'OpenCC - 中文转换', 'opencc'],
    [
      'i18n',
      'api/utilities/i18n',
      'api.utilities.i18n',
      'Internationalization - 国际化',
      'i18n',
    ],
    [
      's13n',
      'api/utilities/s13n',
      'api.utilities.s13n',
      'Standardization - 标准化',
      's13n',
    ],
    ['e4x', 'api/utilities/e4x', 'api.utilities.e4x', 'E4X', 'e4x'],
    [
      'polyfill',
      'api/utilities/polyfill',
      'api.utilities.polyfill',
      'Polyfill - 代码填泥',
      'polyfill',
    ],
    ['arrayx', 'api/utilities/arrayx', 'api.utilities.arrayx', 'Arrayx - Array 扩展', 'arrayx'],
    [
      'numberx',
      'api/utilities/numberx',
      'api.utilities.numberx',
      'Numberx - Number 扩展',
      'numberx',
    ],
    ['mathx', 'api/utilities/mathx', 'api.utilities.mathx', 'Mathx - Math 扩展', 'mathx'],
    [
      'versionType',
      'api/utilities/version',
      'api.utilities.version',
      'Version - 版本工具类',
      'versionType',
    ],
  ]),
  ...defineSectionEntries('api/types', [
    [
      'androidBundleType',
      'api/types/android-bundle',
      'api.types.android-bundle',
      'AndroidBundle',
      'androidBundleType',
    ],
    [
      'androidRectType',
      'api/types/android-rect',
      'api.types.android-rect',
      'AndroidRect',
      'androidRectType',
    ],
    ['appType', 'api/types/app', 'api.types.app', 'App - 应用枚举类', 'appType'],
    ['colorType', 'api/types/color', 'api.types.color', 'Color - 颜色类', 'colorType'],
    [
      'consoleBuildOptionsType',
      'api/types/console-build-options',
      'api.types.console-build-options',
      'ConsoleBuildOptions',
      'consoleBuildOptionsType',
    ],
    [
      'cryptoCipherOptionsType',
      'api/types/crypto-cipher-options',
      'api.types.crypto-cipher-options',
      'CryptoCipherOptions',
      'cryptoCipherOptionsType',
    ],
    [
      'cryptoKeyPairType',
      'api/types/crypto-key-pair',
      'api.types.crypto-key-pair',
      'CryptoKeyPair',
      'cryptoKeyPairType',
    ],
    [
      'cryptoKeyType',
      'api/types/crypto-key',
      'api.types.crypto-key',
      'CryptoKey',
      'cryptoKeyType',
    ],
    [
      'dataTypes',
      'api/types/data-types',
      'api.types.data-types',
      'Data Types - 数据类型',
      'dataTypes',
    ],
    [
      'eventEmitterType',
      'api/types/event-emitter',
      'api.types.event-emitter',
      'EventEmitter - 事件发射器',
      'eventEmitterType',
    ],
    [
      'httpRequestBuilderOptionsType',
      'api/types/http-request-builder-options',
      'api.types.http-request-builder-options',
      'HttpRequestBuilderOptions',
      'httpRequestBuilderOptionsType',
    ],
    [
      'httpRequestHeadersType',
      'api/types/http-request-headers',
      'api.types.http-request-headers',
      'HttpRequestHeaders',
      'httpRequestHeadersType',
    ],
    [
      'httpResponseBodyType',
      'api/types/http-response-body',
      'api.types.http-response-body',
      'HttpResponseBody',
      'httpResponseBodyType',
    ],
    [
      'httpResponseHeadersType',
      'api/types/http-response-headers',
      'api.types.http-response-headers',
      'HttpResponseHeaders',
      'httpResponseHeadersType',
    ],
    [
      'httpResponseType',
      'api/types/http-response',
      'api.types.http-response',
      'HttpResponse',
      'httpResponseType',
    ],
    [
      'imageWrapperType',
      'api/types/image-wrapper',
      'api.types.image-wrapper',
      'ImageWrapper - 包装图像类',
      'imageWrapperType',
    ],
    [
      'injectableWebClientType',
      'api/types/injectable-web-client',
      'api.types.injectable-web-client',
      'InjectableWebClient',
      'injectableWebClientType',
    ],
    [
      'injectableWebViewType',
      'api/types/injectable-web-view',
      'api.types.injectable-web-view',
      'InjectableWebView',
      'injectableWebViewType',
    ],
    [
      'noticeBuilderType',
      'api/types/notice-builder',
      'api.types.notice-builder',
      'NoticeBuilder',
      'noticeBuilderType',
    ],
    [
      'noticeChannelOptionsType',
      'api/types/notice-channel-options',
      'api.types.notice-channel-options',
      'NoticeChannelOptions',
      'noticeChannelOptionsType',
    ],
    [
      'noticeOptionsType',
      'api/types/notice-options',
      'api.types.notice-options',
      'NoticeOptions',
      'noticeOptionsType',
    ],
    [
      'noticePresetConfigurationType',
      'api/types/notice-preset-configuration',
      'api.types.notice-preset-configuration',
      'NoticePresetConfiguration',
      'noticePresetConfigurationType',
    ],
    [
      'ocrOptionsType',
      'api/types/ocr-options',
      'api.types.ocr-options',
      'OcrOptions',
      'ocrOptionsType',
    ],
    [
      'okhttp3HttpUrlType',
      'api/types/okhttp3-http-url',
      'api.types.okhttp3-http-url',
      'OkHttp3 HttpUrl',
      'okhttp3HttpUrlType',
    ],
    [
      'okhttp3RequestType',
      'api/types/okhttp3-request',
      'api.types.okhttp3-request',
      'OkHttp3 Request',
      'okhttp3RequestType',
    ],
    [
      'omniTypes',
      'api/types/omni-types',
      'api.types.omni-types',
      'Omnipotent Types - 全能类型',
      'omniTypes',
    ],
    [
      'openCCConversionType',
      'api/types/opencc-conversion',
      'api.types.opencc-conversion',
      'OpenCCConversion',
      'openCCConversionType',
    ],
    [
      'opencvPointType',
      'api/types/opencv-point',
      'api.types.opencv-point',
      'OpenCVPoint',
      'opencvPointType',
    ],
    [
      'opencvRectType',
      'api/types/opencv-rect',
      'api.types.opencv-rect',
      'OpenCVRect',
      'opencvRectType',
    ],
    [
      'opencvSizeType',
      'api/types/opencv-size',
      'api.types.opencv-size',
      'OpenCVSize',
      'opencvSizeType',
    ],
    [
      'storageType',
      'api/types/storage',
      'api.types.storage',
      'Storage - 存储类',
      'storageType',
    ],
  ]),
  ...defineSectionEntries('reference/android', [
    [
      'activity',
      'reference/android/activity',
      'reference.android.activity',
      'Activity - 活动',
      'activity',
    ],
    [
      'context',
      'reference/android/context',
      'reference.android.context',
      'Context - 上下文',
      'context',
    ],
    [
      'apiLevel',
      'reference/android/api-level',
      'reference.android.api-level',
      'Android API Level - 安卓 API 级别',
      'apiLevel',
    ],
    [
      'scriptingJava',
      'reference/android/scripting-java',
      'reference.android.scripting-java',
      'Scripting Java - 脚本化 Java',
      'scriptingJava',
    ],
  ]),
  ...defineSectionEntries('reference/runtime', [
    [
      'runtime',
      'reference/runtime/runtime',
      'reference.runtime.runtime',
      'Runtime - 运行时',
      'runtime',
    ],
    [
      'intentType',
      'reference/runtime/intent',
      'reference.runtime.intent',
      'Intent - 意图',
      'intentType',
    ],
    [
      'exceptions',
      'reference/runtime/exceptions',
      'reference.runtime.exceptions',
      'Exceptions - 异常',
      'exceptions',
    ],
  ]),
  ...defineSectionEntries('reference/glossaries', [
    [
      'glossaries',
      'reference/glossaries/glossary',
      'reference.glossaries.glossary',
      'Glossary - 术语',
      'glossaries',
    ],
    [
      'httpHeaderGlossary',
      'reference/glossaries/http-headers',
      'reference.glossaries.http-headers',
      'HTTP Headers - HTTP 标头',
      'httpHeaderGlossary',
    ],
    [
      'httpRequestMethodsGlossary',
      'reference/glossaries/http-request-methods',
      'reference.glossaries.http-request-methods',
      'HTTP Request Methods - HTTP 请求方法',
      'httpRequestMethodsGlossary',
    ],
    [
      'mimeTypeGlossary',
      'reference/glossaries/mime-types',
      'reference.glossaries.mime-types',
      'MIME Types - MIME 类型',
      'mimeTypeGlossary',
    ],
    [
      'notificationChannelGlossary',
      'reference/glossaries/notification-channels',
      'reference.glossaries.notification-channels',
      'Notification Channels - 通知渠道',
      'notificationChannelGlossary',
    ],
  ]),
  ...defineSectionEntries('reference', [
    [
      'colorTable',
      'reference/color-table',
      'reference.color-table',
      'Color Table - 颜色列表',
      'colorTable',
    ],
  ]),
]

export const contentEntriesBySection: Readonly<
  Record<string, readonly ContentEntry[]>
> = Object.fromEntries(
  contentSectionOrder.map((section) => [
    section,
    contentEntries.filter((entry) => entry.section === section),
  ]),
)

const REQUIRED_DELETED_LEGACY_SOURCES = [
  'api/all.md',
  'api/sidebar.md',
  'api/toc.md',
  'api/coverpage.md',
  'api/404.md',
  'api/util.md',
] as const

export const deletedLegacySources: readonly string[] = [
  ...REQUIRED_DELETED_LEGACY_SOURCES,
]

const REQUIRED_FROZEN_LEGACY_JSON_STEMS = [
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
] as const

export const frozenLegacyJsonStems: readonly string[] = [
  ...REQUIRED_FROZEN_LEGACY_JSON_STEMS,
]

const REQUIRED_LEGACY_ALL_ENTRY_IDS = [
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

export const legacyAllEntryIds: readonly string[] = [
  ...REQUIRED_LEGACY_ALL_ENTRY_IDS,
]

export interface ContentCatalogValidationOptions {
  entries?: readonly ContentEntry[]
  deletedSources?: readonly string[]
  frozenJsonStems?: readonly string[]
  allEntryIds?: readonly string[]
  legacyMarkdownSources?: readonly string[]
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
    entries.map(({ legacySource }) => legacySource),
  )
  addDuplicateErrors(errors, 'source', entries.map(({ source }) => source))
  addDuplicateErrors(errors, 'route', entries.map(({ route }) => route))
  addDuplicateErrors(
    errors,
    'legacy JSON name',
    entries.flatMap(({ legacyJsonNames }) => legacyJsonNames),
  )

  for (const entry of entries) {
    if (!entry.title.trim()) {
      errors.push('Missing title for ' + (entry.id || entry.legacySource))
    }

    if (!/^api\/[^/]+\.md$/.test(entry.legacySource)) {
      errors.push(
        'Invalid legacy source for ' + entry.id + ': ' + entry.legacySource,
      )
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
    if (entry.legacyJsonNames.length !== expectedJsonNameCount) {
      errors.push(
        'Expected ' +
          expectedJsonNameCount +
          ' legacy JSON name(s) for ' +
          entry.id +
          ', found ' +
          entry.legacyJsonNames.length,
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

  if (!sameOrderedValues(deletedSources, REQUIRED_DELETED_LEGACY_SOURCES)) {
    errors.push('Deleted legacy source list does not match the required six paths')
  }
  if (
    !sameOrderedValues(
      frozenJsonStems,
      REQUIRED_FROZEN_LEGACY_JSON_STEMS,
    )
  ) {
    errors.push('Frozen legacy JSON stem list does not match the required ten stems')
  }

  if (allEntryIds.length !== EXPECTED_LEGACY_ALL_ENTRY_COUNT) {
    errors.push(
      'Expected ' +
        EXPECTED_LEGACY_ALL_ENTRY_COUNT +
        ' legacy all-document entries, found ' +
        allEntryIds.length,
    )
  }
  addDuplicateErrors(errors, 'legacy all-document id', allEntryIds)
  if (!sameOrderedValues(allEntryIds, REQUIRED_LEGACY_ALL_ENTRY_IDS)) {
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
    ({ legacyJsonNames }) => legacyJsonNames,
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
    ...entries.map(({ legacySource }) => legacySource),
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
