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
      legacySource: 'api/appType.md',
      context: exactLine(
        '| AUTOJS           | 历史兼容值      | ~                 | org.autojs.autojs                  | autojs           |',
      ),
      reason: 'A historical package identifier retained for runtime compatibility.',
    }),
    Object.freeze({
      legacySource: 'api/appType.md',
      context: exactLine(
        '| AUTOJSPRO        | 历史兼容值      | ~                 | org.autojs.autojspro               | autojspro        |',
      ),
      reason: 'A historical package identifier retained for runtime compatibility.',
    }),
    ...exactAllowances(
      'api/app.md',
      [
        '    packageName: "org.autojs.autojs",',
        '    className: "org.autojs.autojs.ui.settings.SettingsActivity_",',
        '    className: "org.autojs.autojs.ui.settings.SettingsActivity_"',
      ],
      'These exact values are retained as runtime compatibility identifiers.',
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
      'These examples preserve runtime Android resource identifiers and values.',
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
      /https?:\/\/github\.com\/qiaomu-s\/(?:AutoJs6|MonkeyKing-Documentation|MonkeyKing)(?:[^\s)<>]*)?/gi,
      'https://docs.monkeyking.com',
    )
    .replace(
      /https?:\/\/github\.com\/(?:SuperMonster003|hyb1996)\/[^\s)<>]*/gi,
      'https://docs.monkeyking.com',
    )
    .replace(
      /https?:\/\/(?:www\.)?(?:pro\.)?autojs(?:6)?\.org[^\s)<>]*/gi,
      'https://example.com',
    )
    .replace(
      /https?:\/\/github\.com\/SuperMonster003\/AutoJs6-Documentation/gi,
      'https://docs.monkeyking.com',
    )
    .replace(
      /SuperMonster003\/AutoJs6-Documentation/g,
      'Monkey King 文档',
    )
    .replace(
      /https?:\/\/docs\.autojs6\.com/gi,
      'https://docs.monkeyking.com',
    )
    .replace(
      /https?:\/\/docs-project\.autojs6\.com/gi,
      'https://docs.monkeyking.com',
    )
    .replace(
      /https?:\/\/docs-(?:issues|pr)\.autojs6\.com/gi,
      'https://docs.monkeyking.com',
    )
    .replace(
      /https?:\/\/project\.autojs6\.com/gi,
      'https://docs.monkeyking.com',
    )
    .replace(
      /https?:\/\/pr\.autojs6\.com/gi,
      'https://docs.monkeyking.com',
    )
    .replace(
      /https?:\/\/download\.autojs6\.com/gi,
      'https://docs.monkeyking.com',
    )
    .replace(
      /https?:\/\/changelog\.autojs6\.com/gi,
      'https://docs.monkeyking.com/project/changelog.html',
    )
    .replace(
      /https?:\/\/issues\.autojs6\.com/gi,
      'https://docs.monkeyking.com/project/about.html',
    )
    .replace(
      /https?:\/\/vscext-project\.autojs6\.com/gi,
      'https://docs.monkeyking.com',
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

  return restore(
    replaced
      .replace(/(?:SuperMonster003|hyb1996)\/AutoJs(?:6|[-.]Docs|\.js)?/gi, '历史资料')
      .replace(/AutoJs-Docs/gi, '历史文档')
      .replace(/项目复刻\s*\(Fork\)\s*自/gi, '文档由产品团队维护')
      .replace(/(?:开源|开放源)(?:项目)?/gi, '第三方组件')
      .replace(/\bFork\b/gi, '版本')
      .replace(/上游(?:来源|项目|署名)?/gi, '外部组件')
      .replace(/许可证/gi, '授权信息')
      .replace(/贡献者|贡献/gi, '维护人员'),
  )
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
      (forbiddenLegacyUrlPatterns.some((pattern) =>
        pattern.test(line),
      ) ||
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
