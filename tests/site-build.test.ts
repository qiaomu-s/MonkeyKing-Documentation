import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const buildScriptPath = resolve(process.cwd(), 'scripts/build.ts')

async function loadBuildScript() {
  if (!existsSync(buildScriptPath)) return undefined
  return import('../scripts/build')
}

describe('documentation build orchestration', () => {
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
})
