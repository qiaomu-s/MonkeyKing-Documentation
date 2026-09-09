import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const buildScriptPath = resolve(process.cwd(), 'scripts/build.ts')

async function loadBuildScript() {
  if (!existsSync(buildScriptPath)) return undefined
  return import('../scripts/build')
}

describe('documentation build orchestration', () => {
  let androidHtml = ''

  beforeAll(() => {
    execFileSync(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['run', 'build:android'],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'pipe',
      },
    )
    androidHtml = readFileSync(
      resolve(process.cwd(), 'dist/android/index.html'),
      'utf8',
    )
  })

  test.each(['web', 'android'] as const)(
    'creates a %s build plan rooted at docs',
    async (target) => {
      const buildScript = await loadBuildScript()

      expect(buildScript, 'scripts/build.ts must exist').toBeDefined()
      if (!buildScript) return

      expect(buildScript.createBuildPlan(target)).toEqual({
        target,
        docsRoot: resolve(process.cwd(), 'docs'),
      })
    },
  )

  test('rejects missing and unsupported build targets', async () => {
    const buildScript = await loadBuildScript()

    expect(buildScript, 'scripts/build.ts must exist').toBeDefined()
    if (!buildScript) return

    expect(() => buildScript.createBuildPlan(undefined)).toThrow(
      'Expected build target: web or android',
    )
    expect(() => buildScript.createBuildPlan('mobile')).toThrow(
      'Unsupported DOCS_BUILD_TARGET: mobile',
    )
  })

  test('keeps the Android navbar logo and image inside the asset-loader base', () => {
    expect(androidHtml).toContain('<a class="title" href="/assets/docs/"')
    expect(androidHtml).toContain('src="/assets/docs/logo.png"')
  })

  test('copies the custom-domain declaration into the Android artifact', () => {
    expect(
      readFileSync(resolve(process.cwd(), 'dist/android/CNAME'), 'utf8'),
    ).toBe('docs.monkeyking.com\n')
  })
})
