export interface BrandPolicyContext {
  readonly current: {
    readonly legacySource: string
  }
}

export interface LegacyBrandAllowance {
  readonly legacySource: string
  readonly context: RegExp
  readonly reason: string
}

function exactLine(line: string): RegExp {
  return new RegExp(`^${line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
}

function exactAllowances(
  legacySource: string,
  lines: readonly string[],
  reason: string,
): readonly LegacyBrandAllowance[] {
  return lines.map((line) =>
    Object.freeze({ legacySource, context: exactLine(line), reason }),
  )
}

export const legacyBrandAllowlist: readonly LegacyBrandAllowance[] =
  Object.freeze([
    Object.freeze({
      legacySource: 'api/changelog.md',
      context: exactLine('AutoJs6 1.1.8'),
      reason: 'An explicit historical release identity.',
    }),
    Object.freeze({
      legacySource: 'api/appType.md',
      context: exactLine(
        '| AUTOJS           | Auto.js        | ~                 | org.autojs.autojs                  | autojs           |',
      ),
      reason: 'The formal third-party Auto.js application enum row.',
    }),
    Object.freeze({
      legacySource: 'api/appType.md',
      context: exactLine(
        '| AUTOJSPRO        | AutoJsPro      | ~                 | org.autojs.autojspro               | autojspro        |',
      ),
      reason: 'The formal third-party AutoJsPro application enum row.',
    }),
    ...exactAllowances(
      'api/app.md',
      [
        '    packageName: "org.autojs.autojs",',
        '    className: "org.autojs.autojs.ui.settings.SettingsActivity_",',
        '    className: "org.autojs.autojs.ui.settings.SettingsActivity_"',
        '* `uri` {string} 一个代表Uri的字符串, 例如"file:///sdcard/1.txt", "https://www.autojs.org"',
        '** [[Pro 8.0.0新增](https://pro.autojs.org//)] **',
      ],
      'These exact examples refer to the third-party Auto.js application.',
    ),
    ...exactAllowances(
      'api/dialogs.md',
      ['    app.openUrl("https://www.autojs.org");'],
      'This example opens the third-party Auto.js website.',
    ),
    ...exactAllowances(
      'api/documentation.md',
      [
        '项目复刻 (Fork) 自 [hyb1996/AutoJs-Docs](https://github.com/hyb1996/AutoJs-Docs/) (GitHub).<br>',
        '相对于 [原始 App](https://github.com/hyb1996/Auto.js/), 二次开发的 App 中会增加或修改部分模块功能.<br>',
        '相对于 [原始文档](https://github.com/hyb1996/AutoJs-Docs/), 二次开发的文档将进行部分增删或重新编写.<br>',
      ],
      'These lines attribute the upstream application and documentation.',
    ),
    ...exactAllowances(
      'api/global.md',
      [
        '## [m] requiresAutojsVersion',
        '### requiresAutojsVersion(versionName)',
        'requiresAutojsVersion("6.2.0");',
        '### requiresAutojsVersion(versionCode)',
        'requiresAutojsVersion(1024);',
      ],
      'These lines preserve the published compatibility API identifier.',
    ),
    ...exactAllowances(
      'api/glossaries.md',
      [
        'console.log(R.string.text_app_name_autojspro); /* e.g. 2131887020 */',
        'console.log(context.getString(R.string.text_app_name_autojspro)); /* e.g. AutoJsPro */',
      ],
      'These examples preserve upstream Android resource identifiers and values.',
    ),
    ...exactAllowances(
      'api/scriptingJava.md',
      [
        '> 注: 此章节参考并修改自 [Auto.js Pro](https://pro.autojs.org/) 及 [Scripting Java](http://udn.realityripple.com/docs/Mozilla/Projects/Rhino/Scripting_Java/).',
      ],
      'This page explicitly credits the upstream Auto.js Pro source.',
    ),
    ...exactAllowances(
      'api/qa.md',
      [
        'Monkey King 永久免费, 它是基于开源版本 (Auto.js 4.1.1 alpha2) 二次开发的, 将保持开源免费.',
        '开源版本 (Auto.js 4.1.1 alpha2) 是非常好的学习资料, Monkey King 之所以存在, 恰恰是因为站在巨人的肩膀上.',
        'Monkey King 的目标是对开源版本 (Auto.js 4.1.1 alpha2) 进行完善及扩展.',
        '> Monkey King 基于 MLKit 引擎的 [OCR 实现源码](https://github.com/qiaomu-s/MonkeyKing/blob/master/app/src/main/java/com/qiaomu/monkeyking/runtime/api/OcrMLKit.kt) 参考自 [TonyJiangWJ](https://github.com/TonyJiangWJ) 的 [Auto.js](https://github.com/TonyJiangWJ/Auto.js) 项目.<br>',
        '### 不同的 Auto.js 应用',
        '不同的 Auto.js 应用对 [ JavaScript 封装模块 / Java 包名及类名 ] 等进行了不同程度的 [ 增添 / 修改 / 删减 ], 因此同样的脚本很难在不同 Auto.js 应用上达到同样的运行效果, 甚至出现无法运行的情况.',
        '- 继续使用之前编写脚本代码的 Auto.js 应用',
        '- 修改脚本代码以适应新 Auto.js 应用',
        '- 在脚本代码中加入不同 Auto.js 应用的检测, 在对应分支编写兼容代码',
      ],
      'These lines describe the upstream version or the third-party Auto.js ecosystem.',
    ),
    ...exactAllowances(
      'api/ui.md',
      [
        '**注意：**并不是所有属性都能在js代码设置, 有一些属性只能在布局创建时设置, 例如style属性；还有一些属性虽然能在代码中设置, 但是还没支持；对于这些情况, 在Auto.js Pro 8.1.0+会抛出异常, 其他版本则不会抛出异常.',
        '例如, 圆角矩形的Auto.js图标：`<img w="100" h="100" radius="20" bg="white" src="http://www.autojs.org/assets/uploads/profile/3-profileavatar.png" />`',
        '例如, 圆角矩形带灰色边框的Auto.js图标：`<img w="100" h="100" radius="20" borderWidth="5" borderColor="gray" bg="white" src="http://www.autojs.org/assets/uploads/profile/3-profileavatar.png" />`',
        '例如, 圆形的Auto.js图标：`<img w="100" h="100" circle="true" bg="white" src="http://www.autojs.org/assets/uploads/profile/3-profileavatar.png" />`',
      ],
      'These lines compare Auto.js Pro behavior or preserve fixed upstream icon examples.',
    ),
    ...exactAllowances(
      'api/overview.md',
      [
        '  - [Auto.js Pro](https://pro.autojs.org/)',
        '  - [Auto.js DevTools](https://github.com/pboymt/autojs-dev/)',
      ],
      'These are links to distinct upstream projects.',
    ),
    ...exactAllowances(
      'api/web.md',
      ['> 注: 上述设置参考自 Auto.js 4.1.1 Alpha2 源码.'],
      'This line credits the upstream Auto.js 4.1.1 source.',
    ),
    ...exactAllowances(
      'api/crypto.md',
      [
        '> 注: 本章节参考自 [Auto.js Pro 文档](https://pro.autojs.org/docs/zh/v8/crypto.html).',
      ],
      'This line credits the upstream Auto.js Pro documentation.',
    ),
    ...exactAllowances(
      'api/progress.md',
      [
        '文档以 Auto.js 4.1.1 Alpha2 的原始文档为基础, 逐步完成部署及更新.',
      ],
      'This line records the historical source documentation.',
    ),
    ...exactAllowances(
      'api/cryptoKeyType.md',
      [
        '需特别留意, 与 Auto.js Pro 不同, `keyPair` 默认值为 `null`, 而非 `undefined`. 这是因为 Monkey King 的 [crypto](../utilities/crypto.md) 模块底层实现不是 JavaScript 语言.',
      ],
      'This line explicitly compares behavior with Auto.js Pro.',
    ),
    ...exactAllowances(
      'api/uiSelectorType.md',
      [
        '需额外留意上述匹配方式与 Auto.js 4.x 版本不同, 4.x 版本筛选时会考虑前台活动应用的包名.<br>',
        "如果编写的代码需兼容不同的 Auto.js 版本, 建议使用 [idEndsWith](#m-idendswith) (如 `idEndsWith('some_entry')`) 或 [idMatches](#m-idmatches) (如 `idMatches(/.*some_entry/)`).",
        "如果编写的代码需兼容不同的 Auto.js 版本, 建议使用 [idMatches](#m-idmatches) (如 `idMatches(/.*some_.*/)`).",
        '需额外留意上述匹配方式与 Auto.js 4.x 版本不同, 4.x 版本在做类名前缀筛选时, 不支持简称形式.<br>',
        "如果编写的代码需兼容不同的 Auto.js 版本, 建议使用 [classNameEndsWith](#m-classnameendswith) (如 `classNameEndsWith('RecyclerView')`) 或 [classNameMatches](#m-classnamematches) (如 `classNameMatches(/.*Rec.*/)`).",
      ],
      'These lines document compatibility with the upstream Auto.js 4.x behavior.',
    ),
    ...exactAllowances(
      'api/app.md',
      [
        '但如果有root权限, 则在intent的参数加上`"root": true`即可. 例如使用root权限跳转到Auto.js的设置界面为：',
      ],
      'This example explicitly opens the third-party Auto.js application settings.',
    ),
  ])

const forbiddenLegacyBrandPatterns: readonly RegExp[] = Object.freeze([
  /auto(?:\.?)js/i,
])

const forbiddenLegacyUrlPatterns: readonly RegExp[] = Object.freeze([
  /(?:https?:\/\/|mailto:|tel:|data:)[^\s)<>]*auto(?:\.?)js[^\s)<>]*/i,
])

function isAllowedLegacyBrandLine(
  line: string,
  context: BrandPolicyContext,
): boolean {
  return legacyBrandAllowlist.some(
    (allowance) =>
      allowance.legacySource === context.current.legacySource &&
      allowance.context.test(line),
  )
}

function protectExternalUrls(line: string): {
  readonly value: string
  readonly restore: (value: string) => string
} {
  const protectedValues: string[] = []
  const value = line.replace(
    /(?:https?:\/\/|mailto:|tel:|data:)[^\s)<>]+/g,
    (match) => {
      const token = `\u0000EXTERNAL_URL_${protectedValues.length}\u0000`
      protectedValues.push(match)
      return token
    },
  )

  return {
    value,
    restore: (candidate) =>
      candidate.replace(/\u0000EXTERNAL_URL_(\d+)\u0000/g, (_match, index) => {
        return protectedValues[Number(index)] ?? _match
      }),
  }
}

function replaceKnownBrandUrls(line: string): string {
  return line
    .replace(/data:text\/plain,AutoJs6/g, 'data:text/plain,Monkey%20King')
    .replace(
      /https?:\/\/github\.com\/SuperMonster003\/AutoJs6-Documentation/gi,
      'https://github.com/qiaomu-s/MonkeyKing-Documentation',
    )
    .replace(
      /SuperMonster003\/AutoJs6-Documentation/g,
      'qiaomu-s/MonkeyKing-Documentation',
    )
    .replace(
      /https?:\/\/docs\.autojs6\.com/gi,
      'https://docs.monkeyking.com',
    )
    .replace(
      /https?:\/\/docs-project\.autojs6\.com/gi,
      'https://github.com/qiaomu-s/MonkeyKing-Documentation',
    )
    .replace(
      /https?:\/\/docs-(?:issues|pr)\.autojs6\.com/gi,
      'https://github.com/qiaomu-s/MonkeyKing-Documentation',
    )
    .replace(
      /https?:\/\/project\.autojs6\.com/gi,
      'https://github.com/qiaomu-s/MonkeyKing',
    )
    .replace(
      /https?:\/\/pr\.autojs6\.com/gi,
      'https://github.com/qiaomu-s/MonkeyKing/pull',
    )
    .replace(
      /https?:\/\/download\.autojs6\.com/gi,
      'https://github.com/qiaomu-s/MonkeyKing/releases',
    )
    .replace(
      /https?:\/\/changelog\.autojs6\.com/gi,
      'https://github.com/qiaomu-s/MonkeyKing/releases',
    )
    .replace(
      /https?:\/\/issues\.autojs6\.com/gi,
      'https://github.com/qiaomu-s/MonkeyKing/issues',
    )
    .replace(
      /https?:\/\/vscext-project\.autojs6\.com/gi,
      'https://github.com/qiaomu-s/MonkeyKing',
    )
    .replace(/org\/autojs\/autojs6/g, 'com/qiaomu/monkeyking')
    .replace(/org\/autojs\/autojs/g, 'com/qiaomu/monkeyking')
}

function replaceCurrentProductBrands(line: string): string {
  const knownUrlsReplaced = replaceKnownBrandUrls(line)
  const { value, restore } = protectExternalUrls(knownUrlsReplaced)
  const replaced = value
    .replace(/org\.autojs\.autojs6/g, 'com.qiaomu.monkeyking')
    .replace(/org\.autojs\.autojs/g, 'com.qiaomu.monkeyking')
    .replace(/\bapp\.autojs\b/g, 'app.monkeyking')
    .replace(/AUTOJS6/g, 'MONKEYKING')
    .replace(/\bAutoJs6-Documentation\b/g, 'MonkeyKing-Documentation')
    .replace(/AutoJs6/g, 'Monkey King')
    .replace(/(?<![\w])AutoJs(?![\w-])/g, 'Monkey King')
    .replace(/(?<![\w])Auto\.js(?![\w-])/g, 'Monkey King')
    .replace(/autojs6/g, 'monkeyking')
    .replace(/(?<![\w])autojs(?![\w])/g, 'monkeyking')

  return restore(replaced)
}

export function applyBrandPolicy(
  markdown: string,
  context: BrandPolicyContext,
): string {
  return markdown
    .split(/(?<=\n)/)
    .map((lineWithEnding) => {
      const line = lineWithEnding.endsWith('\n')
        ? lineWithEnding.slice(0, -1)
        : lineWithEnding
      const ending = lineWithEnding.endsWith('\n') ? '\n' : ''

      if (isAllowedLegacyBrandLine(line, context)) {
        return line + ending
      }

      return replaceCurrentProductBrands(line) + ending
    })
    .join('')
}

export function assertAllowedLegacyBrands(
  markdown: string,
  context: BrandPolicyContext,
): void {
  const violations: string[] = []

  markdown.split('\n').forEach((line, index) => {
    const withoutExternalUrls = protectExternalUrls(line).value
    if (
      !isAllowedLegacyBrandLine(line, context) &&
      (forbiddenLegacyUrlPatterns.some((pattern) => pattern.test(line)) ||
        forbiddenLegacyBrandPatterns.some((pattern) =>
          pattern.test(withoutExternalUrls),
        ))
    ) {
      violations.push(`${context.current.legacySource}:${index + 1}: ${line}`)
    }
  })

  if (violations.length > 0) {
    throw new Error(
      `Unapproved legacy brand references:\n${violations.join('\n')}`,
    )
  }
}
