import type { ContentEntry } from './catalog'

export interface BrandPolicyContext {
  readonly current: ContentEntry
}

export interface LegacyBrandAllowance {
  readonly legacySource: string
  readonly context: RegExp
  readonly reason: string
}

export const legacyBrandAllowlist: readonly LegacyBrandAllowance[] =
  Object.freeze([
    Object.freeze({
      legacySource: 'api/changelog.md',
      context: /^AutoJs6 \d+\.\d+\.\d+$/,
      reason: 'An explicit historical release identity.',
    }),
    Object.freeze({
      legacySource: 'api/appType.md',
      context:
        /^\| AUTOJS\s+\| Auto\.js\s+\| ~\s+\| org\.autojs\.autojs\s+\| autojs\s+\|$/,
      reason: 'The formal third-party Auto.js application enum row.',
    }),
    Object.freeze({
      legacySource: 'api/appType.md',
      context:
        /^\| AUTOJSPRO\s+\| AutoJsPro\s+\| ~\s+\| org\.autojs\.autojspro\s+\| autojspro\s+\|$/,
      reason: 'The formal third-party AutoJsPro application enum row.',
    }),
    Object.freeze({
      legacySource: 'api/app.md',
      context: /^\s*(?:packageName|className): "org\.autojs\.autojs(?:\.[^"]+)?",?$/,
      reason: 'An example that explicitly launches the third-party Auto.js app.',
    }),
    Object.freeze({
      legacySource: 'api/ui.md',
      context:
        /^Keep upstream Auto\.js, AutoJs-Docs, Auto\.js Pro, and `org\.autojs\.autojs`\.$/,
      reason: 'The migration fixture documents the upstream-name exception.',
    }),
  ])

const forbiddenLegacyBrandPatterns: readonly RegExp[] = Object.freeze([
  /AutoJs6/,
  /(?<![\w])AutoJs(?![\w-])/,
  /autojs6/,
  /org\.autojs\.autojs(?!pro)/,
  /(?<![\w])autojs(?![\w])/,
])

const forbiddenLegacyUrlPatterns: readonly RegExp[] = Object.freeze([
  /AutoJs6|autojs6/,
  /org(?:\.|\/)autojs(?:\.|\/)autojs(?!pro)/,
  /docs\.autojs6\.com/i,
  /SuperMonster003\/AutoJs6-Documentation/i,
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
