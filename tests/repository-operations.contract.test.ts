import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rootDirectory = process.cwd()
const workflowPath = resolve(rootDirectory, '.github/workflows/quality.yml')
const obsoletePagesWorkflowPath = resolve(rootDirectory, '.github/workflows/pages.yml')
const vercelConfigPath = resolve(rootDirectory, 'vercel.json')
const readmePath = resolve(rootDirectory, 'README.md')
const projectMetadataPath = resolve(rootDirectory, 'project.json')
const gitignorePath = resolve(rootDirectory, '.gitignore')
const internalAuditWorkflowPath = resolve(
  rootDirectory,
  '.github/workflows/internal-api-audit.yml',
)

function readOptionalText(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

function expectInOrder(source: string, values: readonly string[]): void {
  let previousIndex = -1

  for (const value of values) {
    const index = source.indexOf(value)
    expect(index, `missing ${value}`).toBeGreaterThan(-1)
    expect(index, `${value} must follow the preceding quality gate`).toBeGreaterThan(
      previousIndex,
    )
    previousIndex = index
  }
}

describe('repository operations contract', () => {
  test('keeps the complete Node 22.23.2 quality gate manual-only', () => {
    const workflow = readOptionalText(workflowPath)

    expect(existsSync(workflowPath), 'quality workflow must exist').toBe(true)
    expect(existsSync(obsoletePagesWorkflowPath)).toBe(false)
    expect(workflow).toContain('workflow_dispatch:')
    expect(workflow).not.toMatch(/^\s+push:/m)
    expect(workflow).not.toContain('pull_request:')
    expect(workflow).not.toContain('MONKEYKING_SOURCE_TOKEN')
    expect(workflow).not.toContain('AutoJs6')
    expect(workflow).not.toContain('.source/monkeyking')
    expect(workflow).toContain('node-version: 22.23.2')
    expect(workflow).toContain('uses: actions/checkout@v7')
    expect(workflow).toContain('uses: actions/setup-node@v7')
    expect(workflow).toMatch(
      /uses: actions\/checkout@v7\s*\n\s+with:\s*\n\s+persist-credentials: false/,
    )
    expect(workflow).toContain('cache: npm')
    expectInOrder(workflow, [
      'run: npm install --global npm@11.17.0',
      'run: test "$(npm --version)" = "11.17.0"',
      'run: npm ci',
      'run: npx tsc --noEmit',
      'run: npm run api:coverage -- --check',
      'run: npm run api:check',
      'run: npm run examples:check',
      'run: npm run check:content',
      'run: npm run json:build',
      'run: git diff --exit-code -- api-surface json',
      'run: npm test',
      'run: npm run build:web',
      'run: npm run build:android',
      'run: npm run public:scan',
      'run: npm run check:links',
      'run: npx playwright install --with-deps chromium',
      'run: npm run test:e2e',
    ])
  })

  test('runs master-only quality gates without GitHub Pages deployment access', () => {
    const workflow = readOptionalText(workflowPath)

    expect(workflow).toContain('permissions:\n  contents: read')
    expect(workflow).toContain('group: quality-${{ github.ref }}')
    expect(workflow).toContain('cancel-in-progress: true')
    expect(workflow).toContain("if: github.ref == 'refs/heads/master'")
    expect(workflow).not.toMatch(/upload-pages-artifact|deploy-pages|github-pages/)
    expect(workflow).not.toMatch(/pages: write|id-token: write|^  deploy:/m)
  })

  test('configures Vercel static web builds for master only', () => {
    expect(existsSync(vercelConfigPath), 'root Vercel config must exist').toBe(true)
    if (!existsSync(vercelConfigPath)) return

    const config = JSON.parse(readFileSync(vercelConfigPath, 'utf8')) as Record<string, unknown>
    expect(config).toMatchObject({
      framework: null,
      installCommand: 'npm ci',
      buildCommand: 'npm run build:vercel',
      outputDirectory: 'dist/web',
      git: { deploymentEnabled: { master: true, '**': false } },
    })
    expect((config.git as { deploymentEnabled: unknown }).deploymentEnabled).toEqual({
      master: true,
      '**': false,
    })
    expect(config).not.toHaveProperty('nodeVersion')
    expect(JSON.stringify(config)).not.toMatch(/MONKEYKING_SOURCE_TOKEN|\.source\/monkeyking|AutoJs6/)
  })

  test('keeps protected API auditing separate and manual-only', () => {
    const workflow = readOptionalText(internalAuditWorkflowPath)

    expect(existsSync(internalAuditWorkflowPath)).toBe(true)
    expect(workflow).toContain('workflow_dispatch:')
    expect(workflow).not.toMatch(/^\s+push:/m)
    expect(workflow).not.toContain('pull_request:')
    expect(workflow).toContain('permissions:\n  contents: read')
    expect(workflow).toContain('persist-credentials: false')
    expect(workflow).toContain('SOURCE_REPOSITORY: ${{ vars.MONKEYKING_SOURCE_REPOSITORY }}')
    expect(workflow).toContain('SOURCE_REF: ${{ vars.MONKEYKING_SOURCE_REF }}')
    expect(workflow).toContain('SOURCE_TOKEN: ${{ secrets.MONKEYKING_SOURCE_TOKEN }}')
    expect(workflow).not.toContain('cache: npm')
    expect(workflow).toContain('--internal-output')
    expect(workflow).toContain('--internal-manifest')
    expect(workflow).toContain('if: always()')
    expect(workflow).not.toContain('actions/upload-artifact')
    expect(workflow).toContain('Protected API audit completed.')
  })

  test('documents local installation and product workflows in Chinese', () => {
    const readme = readOptionalText(readmePath)

    expect(readme).toContain('Monkey King 文档')
    expect(readme).not.toContain('MonkeyKing-Documentation')
    expect(readme).toContain('Monkey King 官方产品文档')
    expect(readme).toContain('Node.js 22.23.2')
    expect(readme).toContain('npm@11.17.0')
    for (const command of [
      'npm ci',
      'npm run docs:dev',
      'npm run docs:preview',
      'npm run api:check',
      'npm run public:scan',
      'npm run examples:check',
      'npm run check:content',
      'npm run json:build',
      'npm run build:web',
      'npm run check:links',
      'npm run build:android',
      'npm test',
      'npm run test:e2e',
    ]) {
      expect(readme, `README must document ${command}`).toContain(command)
    }
  })

  test('documents compatibility JSON and both deployment artifacts', () => {
    const readme = readOptionalText(readmePath)

    expect(readme).toContain('monkeyking.json')
    expect(readme).toContain('autojs.json')
    expect(readme).toMatch(/monkeyking\.json[\s\S]*autojs\.json[\s\S]*内容保持一致/)
    expect(readme).toContain('dist/web/')
    expect(readme).toContain('dist/android/')
    expect(readme).toContain('WebViewAssetLoader')
  })

  test('keeps internal deployment and source-audit details out of public README', () => {
    const readme = readOptionalText(readmePath)

    expect(readme).toContain('内部校验')
    expect(readme).toContain('应用内反馈入口或授权支持渠道')
    expect(readme).not.toMatch(/github\.com|Fork|上游|许可证|\bIssue\b|\bPR\b|提交 SHA/i)
  })

  test('removes obsolete project metadata', () => {
    expect(existsSync(projectMetadataPath)).toBe(false)
  })

  test('ignores OS metadata, VitePress caches, and local Vercel links', () => {
    if (!existsSync(gitignorePath)) return

    const gitignore = readOptionalText(gitignorePath)

    expect(gitignore).toMatch(/^\.DS_Store$/m)
    expect(gitignore).toMatch(/^docs\/\.vitepress\/cache\/$/m)
    expect(gitignore).toMatch(/^\.vercel\/$/m)
    expect(gitignore.match(/^\.vercel\/?$/gm)).toEqual(['.vercel/'])
    expect(gitignore).toMatch(/^\.env\*$/m)
  })
})
