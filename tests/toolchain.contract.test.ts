import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import playwrightConfig from '../playwright.config'

type PackageJson = {
  name?: string
  version?: string
  private?: boolean
  type?: string
  engines?: Record<string, string>
  packageManager?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const packageJsonPath = resolve(process.cwd(), 'package.json')

function readPackageJson(): PackageJson {
  if (!existsSync(packageJsonPath)) {
    return {}
  }

  return JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJson
}

describe('root toolchain contract', () => {
  test('defines the project identity and supported runtime', () => {
    const packageJson = readPackageJson()

    expect(existsSync(packageJsonPath), 'root package.json must exist').toBe(true)
    expect(packageJson).toMatchObject({
      name: 'monkeyking-documentation',
      version: '2.0.0',
      private: true,
      type: 'module',
      engines: { node: '>=22 <23' },
      packageManager: 'npm@11.17.0',
    })
  })

  test('pins the documentation runtime dependencies exactly', () => {
    const { dependencies } = readPackageJson()

    expect(dependencies).toEqual({
      'marked-legacy': 'npm:marked@0.3.19',
      vitepress: '1.6.4',
    })
  })

  test('pins the required development toolchain exactly', () => {
    const { devDependencies } = readPackageJson()

    expect(devDependencies).toEqual({
      '@playwright/test': '1.63.0',
      '@types/node': '22.20.1',
      ajv: '8.20.0',
      tsx: '4.23.13',
      typescript: '5.9.3',
      vitest: '3.2.7',
    })
  })

  test('exposes the documented project commands', () => {
    const { scripts } = readPackageJson()
    const requiredPublicScripts = {
      'docs:dev': 'vitepress dev docs',
      'docs:preview': 'vitepress preview docs --outDir dist/web',
      'json:build': 'tsx scripts/json/build.ts',
      'check:content': 'tsx scripts/check-content.ts',
      'check:links': 'tsx scripts/check-links.ts',
      'build:web': 'tsx scripts/build.ts web',
      'build:android': 'tsx scripts/build.ts android',
      test: 'vitest run',
      'test:e2e': 'playwright test',
    }

    expect(Object.keys(requiredPublicScripts)).toHaveLength(9)
    expect(scripts).toMatchObject(requiredPublicScripts)
    expect(scripts?.['migrate:content']).toBe('tsx scripts/migrate-content.ts')
  })

  test('type-checks the VitePress configuration and custom theme sources', () => {
    const tsconfig = JSON.parse(
      readFileSync(resolve(process.cwd(), 'tsconfig.json'), 'utf8'),
    ) as { include?: string[]; exclude?: string[] }

    expect(tsconfig.include).toEqual(
      expect.arrayContaining([
        'docs/.vitepress/**/*.ts',
        'docs/.vitepress/**/*.mts',
      ]),
    )
    expect(tsconfig.exclude).not.toContain('docs')
  })

  test('builds the web output before starting the Playwright preview server', () => {
    const webServer = Array.isArray(playwrightConfig.webServer)
      ? playwrightConfig.webServer[0]
      : playwrightConfig.webServer

    expect(webServer?.command).toBe(
      'npm run build:web && npm run docs:preview -- --host 127.0.0.1 --port 4173',
    )
  })
})
