import { execFileSync } from 'node:child_process'
import { basename, resolve } from 'node:path'

export interface SourceReader {
  readonly repositoryName: string
  resolveRef(ref: string): string
  listFiles(prefix?: string): string[]
  readFile(path: string): string
}

function normalizeRepositoryName(remote: string, sourceDirectory: string): string {
  const trimmed = remote.trim().replace(/\.git$/, '')
  const githubMatch = trimmed.match(
    /github\.com[/:]([^/]+\/[^/]+)$/,
  )
  return githubMatch?.[1] ?? basename(sourceDirectory)
}

export class GitSourceReader implements SourceReader {
  readonly sourceDirectory: string
  readonly repositoryName: string
  private resolvedCommit: string | null = null

  constructor(sourceDirectory: string) {
    this.sourceDirectory = resolve(sourceDirectory)
    const remote = this.git(['config', '--get', 'remote.origin.url'], true)
    this.repositoryName = normalizeRepositoryName(
      remote || '',
      this.sourceDirectory,
    )
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
    const commit = this.requireResolvedCommit()
    return this.git(['show', `${commit}:${path}`])
  }

  private requireResolvedCommit(): string {
    if (this.resolvedCommit === null) {
      throw new Error('resolveRef() must be called before reading source files.')
    }
    return this.resolvedCommit
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
