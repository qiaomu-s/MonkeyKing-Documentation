import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rootDirectory = process.cwd()
const workflowPath = resolve(rootDirectory, '.github/workflows/pages.yml')
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
  test('runs the complete Node 22.23.2 quality gate for trusted master runs', () => {
    const workflow = readOptionalText(workflowPath)

    expect(existsSync(workflowPath), 'Pages workflow must exist').toBe(true)
    expect(workflow).toMatch(/push:\s*\n\s+branches:\s*\n\s+- master/)
    expect(workflow).toContain('workflow_dispatch:')
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

  test('publishes only the master web artifact with least-required Pages access', () => {
    const workflow = readOptionalText(workflowPath)
    const masterOnlyCondition =
      "if: github.ref == 'refs/heads/master' && (github.event_name == 'push' || github.event_name == 'workflow_dispatch')"

    expect(workflow).toContain('permissions:\n  contents: read')
    expect(workflow).toContain('group: pages-${{ github.ref }}')
    expect(workflow).toContain('cancel-in-progress: true')
    expect(workflow).toContain(masterOnlyCondition)
    expect(workflow).toContain('uses: actions/upload-pages-artifact@v3')
    expect(workflow).toContain('path: ./dist/web')
    expect(workflow).toMatch(
      /deploy:\s*\n\s+if: github\.ref == 'refs\/heads\/master' && \(github\.event_name == 'push' \|\| github\.event_name == 'workflow_dispatch'\)[\s\S]*?needs: quality[\s\S]*?permissions:\s*\n\s+pages: write\s*\n\s+id-token: write/,
    )
    expect(workflow).toContain('name: github-pages')
    expect(workflow).toContain('url: ${{ steps.deployment.outputs.page_url }}')
    expect(workflow).toContain('uses: actions/deploy-pages@v4')
  })

  test('keeps protected API auditing separate from public Pages builds', () => {
    const workflow = readOptionalText(internalAuditWorkflowPath)

    expect(existsSync(internalAuditWorkflowPath)).toBe(true)
    expect(workflow).toMatch(/push:\s*\n\s+branches:\s*\n\s+- master/)
    expect(workflow).toContain('workflow_dispatch:')
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

    expect(readme).toContain('MonkeyKing-Documentation')
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

  test('ignores operating-system metadata and generated VitePress caches', () => {
    const gitignore = readOptionalText(gitignorePath)

    expect(gitignore).toMatch(/^\.DS_Store$/m)
    expect(gitignore).toMatch(/^docs\/\.vitepress\/cache\/$/m)
  })
})
