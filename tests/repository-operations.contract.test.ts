import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rootDirectory = process.cwd()
const workflowPath = resolve(rootDirectory, '.github/workflows/pages.yml')
const readmePath = resolve(rootDirectory, 'README.md')
const projectMetadataPath = resolve(rootDirectory, 'project.json')

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
  test('runs the complete Node 22 quality gate for pull requests and master', () => {
    const workflow = readOptionalText(workflowPath)

    expect(existsSync(workflowPath), 'Pages workflow must exist').toBe(true)
    expect(workflow).toMatch(/push:\s*\n\s+branches:\s*\n\s+- master/)
    expect(workflow).toMatch(/pull_request:\s*\n\s+branches:\s*\n\s+- master/)
    expect(workflow).toContain('node-version: 22')
    expect(workflow).toContain('uses: actions/checkout@v7')
    expect(workflow).toContain('uses: actions/setup-node@v7')
    expectInOrder(workflow, [
      'run: npm ci',
      'run: npx tsc --noEmit',
      'run: npm run check:content',
      'run: npm run json:build',
      'run: git diff --exit-code -- json',
      'run: npm test',
      'run: npm run build:web',
      'run: npm run check:links',
      'run: npm run build:android',
      'run: npx playwright install --with-deps chromium',
      'run: npm run test:e2e',
    ])
  })

  test('publishes only the master web artifact with least-required Pages access', () => {
    const workflow = readOptionalText(workflowPath)
    const masterOnlyCondition =
      "if: github.event_name == 'push' && github.ref == 'refs/heads/master'"

    expect(workflow).toContain('permissions:\n  contents: read')
    expect(workflow).toContain('group: pages-${{ github.ref }}')
    expect(workflow).toContain('cancel-in-progress: true')
    expect(workflow).toContain(masterOnlyCondition)
    expect(workflow).toContain('uses: actions/upload-pages-artifact@v5')
    expect(workflow).toContain('path: ./dist/web')
    expect(workflow).toMatch(
      /deploy:\s*\n\s+if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/master'[\s\S]*?needs: quality[\s\S]*?permissions:\s*\n\s+pages: write\s*\n\s+id-token: write/,
    )
    expect(workflow).toContain('name: github-pages')
    expect(workflow).toContain('url: ${{ steps.deployment.outputs.page_url }}')
    expect(workflow).toContain('uses: actions/deploy-pages@v5')
  })

  test('documents the MonkeyKing repository and local workflows in Chinese', () => {
    const readme = readOptionalText(readmePath)

    expect(readme).toContain('MonkeyKing-Documentation')
    expect(readme).toContain('qiaomu-s/MonkeyKing-Documentation')
    expect(readme).toContain('https://docs.monkeyking.com')
    expect(readme).toContain('Node.js 22')
    expect(readme).toContain('npm@11.17.0')
    for (const command of [
      'npm ci',
      'npm run docs:dev',
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
    expect(readme).toMatch(/monkeyking\.json[\s\S]*autojs\.json[\s\S]*字节一致/)
    expect(readme).toMatch(/10\s*个冻结/)
    expect(readme).toContain('git diff --exit-code -- json')
    expect(readme).toContain('dist/web/json/')
    expect(readme).toContain('dist/web/')
    expect(readme).toContain('dist/android/')
    expect(readme).toContain('/assets/docs/')
    expect(readme).toContain('WebViewAssetLoader')
    expect(readme).toContain('file:///android_asset/docs/')
  })

  test('documents Pages setup, DNS, HTTPS, phase two, and upstream attribution', () => {
    const readme = readOptionalText(readmePath)

    expect(readme).toContain('GitHub Actions')
    expect(readme).toContain('docs.monkeyking.com')
    expect(readme).toContain('qiaomu-s.github.io')
    expect(readme).toContain('Enforce HTTPS')
    expect(readme).toMatch(/阶段二[\s\S]*Monkey King 6\.7\.0[\s\S]*API[\s\S]*全量对账/)
    expect(readme).toContain('hyb1996/AutoJs-Docs')
    expect(readme).toContain('AutoJs6-Documentation')
    expect(readme).toContain('LICENSE')
  })

  test('removes obsolete project metadata', () => {
    expect(existsSync(projectMetadataPath)).toBe(false)
  })
})
