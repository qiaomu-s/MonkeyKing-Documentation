import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const MONKEYKING_SOURCE_REPOSITORY = 'qiaomu-s/MonkeyKing'

export interface SourceReader {
  readonly repositoryName: string
  readonly workingTree?: boolean
  resolveRef(ref: string): string
  listFiles(prefix?: string): string[]
  readFile(path: string): string
}

export class GitSourceReader implements SourceReader {
  readonly sourceDirectory: string
  readonly repositoryName = MONKEYKING_SOURCE_REPOSITORY
  readonly workingTree: boolean
  private resolvedCommit: string | null = null

  constructor(sourceDirectory: string, workingTree = false) {
    this.sourceDirectory = resolve(sourceDirectory)
    this.workingTree = workingTree
  }

  resolveRef(ref: string): string {
    const commit = this.git(['rev-parse', '--verify', `${ref}^{commit}`]).trim()
    if (!/^[0-9a-f]{40}$/i.test(commit)) {
      throw new Error(`Ref ${JSON.stringify(ref)} did not resolve to a commit.`)
    }
    this.resolvedCommit = commit
    return commit
  }

  listFiles(prefix = ''): string[] {
    if (this.workingTree) {
      return this.git([
        'ls-files',
        '--cached',
        '--others',
        '--exclude-standard',
        '--',
        prefix || '.',
      ])
        .split('\n')
        .map((path) => path.trim())
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right, 'en'))
    }
    const commit = this.requireResolvedCommit()
    const args = ['ls-tree', '-r', '--name-only', commit]
    if (prefix) args.push('--', prefix)
    const output = this.git(args)
    return output
      .split('\n')
      .map((path) => path.trim())
      .filter(Boolean)
      .sort((left, right) => left.localeCompare(right, 'en'))
  }

  readFile(path: string): string {
    if (this.workingTree) {
      const relativePath = this.resolveWorkingTreePath(path)
      const absolutePath = resolve(this.sourceDirectory, relativePath)
      if (!existsSync(absolutePath)) {
        throw new Error(`Working-tree source file is missing: ${path}`)
      }
      return readFileSync(absolutePath, 'utf8')
    }
    const commit = this.requireResolvedCommit()
    return this.git(['show', `${commit}:${path}`])
  }

  private requireResolvedCommit(): string {
    if (this.resolvedCommit === null) {
      throw new Error('resolveRef() must be called before reading source files.')
    }
    return this.resolvedCommit
  }

  private resolveWorkingTreePath(path: string): string {
    const direct = resolve(this.sourceDirectory, path)
    if (existsSync(direct)) return path

    const suffix = path.split('/').slice(-4).join('/')
    const candidates = this.listFiles()
      .filter((candidate) => candidate.endsWith(`/${suffix}`))
    if (candidates.length === 1) return candidates[0]
    return path
  }

  private git(args: readonly string[], allowFailure = false): string {
    try {
      return execFileSync('git', ['-C', this.sourceDirectory, ...args], {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        stdio: ['ignore', 'pipe', allowFailure ? 'ignore' : 'pipe'],
      })
    } catch (error) {
      if (allowFailure) return ''
      const detail =
        error instanceof Error ? error.message : String(error)
      throw new Error(
        `Git source read failed: git -C ${this.sourceDirectory} ${args.join(' ')}\n${detail}`,
      )
    }
  }
}
