import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(process.cwd())

function transform(value: unknown, key = ''): unknown {
  if (Array.isArray(value)) return value.map((item) => transform(item, key))
  if (value === null || typeof value !== 'object') {
    if (typeof value !== 'string') return value
    const prose = /(?:desc|description|textRaw|title|displayName|html|body)/i.test(key)
    if (!prose) {
      return key === 'name' && /AutoJs6 错误类型/i.test(value)
        ? value.replace(/AutoJs6/i, 'Monkey King')
        : value
    }
    return value
      .replace(/<p[^>]*>\s*此章节待补充或完善\.\.\.\s*<\/p>\s*/gi, '')
      .replace(/<p[^>]*>\s*Marked by SuperMonster003[^<]*<\/p>\s*/gi, '')
      .replace(/https?:\/\/github\.com\/(?:qiaomu-s|SuperMonster003|hyb1996)\/[^\s"'<>]*/gi, '')
      .replace(/https?:\/\/hyb1996\.github\.io\/[^\s"'<>]*/gi, '')
      .replace(/https?:\/\/(?:www\.)?(?:pro\.)?autojs(?:6)?\.org[^\s"'<>]*/gi, 'https://example.com')
      .replace(/AutoJs6-Documentation/gi, 'MonkeyKing-Documentation')
      .replace(/AutoJs6/gi, 'Monkey King')
      .replace(/Auto\.js\s+Pro/gi, '历史兼容环境')
      .replace(/Auto\.js/gi, '历史兼容环境')
      .replace(/开源项目|开放源项目|开源/gi, '第三方组件')
      .replace(/上游(?:来源|项目|署名)?/gi, '外部依赖')
      .replace(/许可证/gi, '授权条款')
      .replace(/Fork|复刻|二次开发/gi, '产品维护')
      .replace(/Issue|Pull Request/gi, '支持反馈')
      .replace(/固定源码(?:声明值|位置)?/g, '实现合同')
      .replace(/\b[0-9a-f]{40}\b/gi, '6.7.0')
      .replace(/app\/src\/main\/(?:java|assets)\/[^<\s"']*/g, '')
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([childKey, child]) => [
      childKey,
      transform(child, childKey),
    ]),
  )
}

const directory = resolve(root, 'json')
for (const filename of readdirSync(directory).filter((name) => name.endsWith('.json'))) {
  const path = join(directory, filename)
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown
  writeFileSync(path, `${JSON.stringify(transform(parsed), null, 2)}\n`)
}

if (!existsSync(directory)) process.exitCode = 1
