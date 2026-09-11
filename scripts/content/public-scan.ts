import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

export interface PublicScanViolation {
  readonly file: string
  readonly line: number
  readonly message: string
}

const root = resolve(process.cwd())

/**
 * These patterns are deliberately limited to product/source provenance. API
 * identifiers such as `ScriptRuntime`, MIME values, compatibility package
 * names, and ordinary third-party reference links are valid public content.
 */
const hardPatterns: readonly [string, RegExp][] = [
  [
    'private repository URL or name',
    /qiaomu-s\/(?:AutoJs6|MonkeyKing-Documentation|MonkeyKing)\b/i,
  ],
  ['private repository URL or name', /(?:SuperMonster003|hyb1996)\/[^\s"'<>]+/i],
  ['source commit hash', /\b[0-9a-f]{40}\b/i],
  ['internal source path', /(?:^|[\\/])app\/src\/main\//i],
  ['internal checkout path', /(?:^|[\\/])(?:\.source|\.worktrees)\//i],
]

const prosePatterns: readonly [string, RegExp][] = [
  [
    'open-source attribution',
    /(?:开源|开放源|\bFork\b|上游|许可证|\bPull\s*Request\b|\bIssue\b|贡献者|贡献)/i,
  ],
  ['Apache license attribution', /Apache[- ]?2\.0/i],
  [
    'fixed-source wording',
    /(?:固定源码|源码仓|源码提交|源码位置|源码合同|源码路径|源码行号|提交\s*SHA)/i,
  ],
]

function walk(path: string): string[] {
  if (!existsSync(path)) return []
  if (statSync(path).isFile()) return [path]
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    walk(join(path, entry.name)),
  )
}

function blank(value: string): string {
  return value.replace(/[^\n]/g, ' ')
}

/** Remove code while retaining prose and link destinations for policy checks. */
function proseOnly(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, blank)
    .replace(/~~~[\s\S]*?~~~/g, blank)
    .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, blank)
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, blank)
    .replace(/<[^>]*>/g, '')
    .replace(/`[^`\n]*`/g, blank)
}

function sourceTextForJson(value: unknown, key = ''): string[] {
  if (typeof value === 'string') {
    const codeLike =
      /^(?:id|name|owner|kind|aliases|signatures|overloads|patterns|target|url)$/i.test(
        key,
      )
    return [codeLike ? value : proseOnly(value)]
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => sourceTextForJson(item, key))
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([childKey, child]) => sourceTextForJson(child, childKey),
    )
  }
  return []
}

function candidatesForFile(path: string): { readonly raw: string; readonly prose: string } {
  const text = readFileSync(path, 'utf8')
  if (path.endsWith('.json')) {
    try {
      const parsed = sourceTextForJson(JSON.parse(text)).join('\n')
      return { raw: text, prose: parsed }
    } catch {
      return { raw: text, prose: proseOnly(text) }
    }
  }
  return { raw: text, prose: proseOnly(text) }
}

export function scanPublicContent(projectRoot = root): PublicScanViolation[] {
  const targets = [
    resolve(projectRoot, 'README.md'),
    resolve(projectRoot, 'docs'),
    resolve(projectRoot, 'json'),
    resolve(projectRoot, 'api-surface'),
    resolve(projectRoot, 'dist/web'),
    resolve(projectRoot, 'dist/android'),
  ].flatMap(walk)

  const violations: PublicScanViolation[] = []
  for (const path of targets) {
    const relativePath = relative(projectRoot, path)
    if (relativePath.startsWith('docs/superpowers/')) continue
    if (!/\.(?:md|mdx|json|html|txt)$/i.test(path)) continue

    const candidates = candidatesForFile(path)
    const rawLines = candidates.raw.split(/\r?\n/)
    const proseLines = candidates.prose.split(/\r?\n/)
    rawLines.forEach((line, index) => {
      for (const [message, pattern] of hardPatterns) {
        // Hashes are checked in prose only so examples of SHA-1/SHA-256
        // values and ETags remain valid technical documentation.
        const candidate = message === 'source commit hash' ? proseLines[index] ?? '' : line
        if (pattern.test(candidate)) {
          violations.push({ file: relativePath, line: index + 1, message })
          break
        }
      }
      const proseLine = proseLines[index] ?? ''
      for (const [message, pattern] of prosePatterns) {
        if (pattern.test(proseLine)) {
          violations.push({ file: relativePath, line: index + 1, message })
          break
        }
      }
      if (
        relativePath.startsWith('api-surface/') &&
        /(?:"|\b)(?:sourceRef|declarationHints|providers|repository|commit)\s*[:=]/i.test(
          line,
        )
      ) {
        violations.push({
          file: relativePath,
          line: index + 1,
          message: 'internal source location field',
        })
      }
    })
  }

  const seen = new Set<string>()
  return violations.filter((violation) => {
    const key = `${violation.file}:${violation.line}:${violation.message}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const violations = scanPublicContent()
if (violations.length > 0) {
  throw new Error(
    `Public content policy violations:\n${violations
      .map(({ file, line, message }) => `${file}:${line}: ${message}`)
      .join('\n')}`,
  )
}

process.stdout.write(`Public content scan passed for ${walk(root).length} files.\n`)
