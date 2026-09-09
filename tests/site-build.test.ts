import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { expectedLegacyJsonFilenames } from '../scripts/json/build'

const buildScriptPath = resolve(process.cwd(), 'scripts/build.ts')

async function loadBuildScript() {
  if (!existsSync(buildScriptPath)) return undefined
  return import('../scripts/build')
}

describe('documentation build orchestration', () => {
  let androidHtml = ''

  beforeAll(() => {
    const staleAndroidJson = resolve(
      process.cwd(),
      'dist/android/json/stale.json',
    )
    mkdirSync(resolve(staleAndroidJson, '..'), { recursive: true })
    writeFileSync(staleAndroidJson, '{}')

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
  }, 120_000)

  test.each(['web', 'android'] as const)(
    'creates a %s build plan rooted at docs',
    async (target) => {
      const buildScript = await loadBuildScript()

      expect(buildScript, 'scripts/build.ts must exist').toBeDefined()
      if (!buildScript) return

      expect(buildScript.createBuildPlan(target)).toEqual({
        target,
        projectRoot: process.cwd(),
        docsRoot: resolve(process.cwd(), 'docs'),
        outDir: resolve(process.cwd(), 'dist', target),
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

  test('does not publish legacy JSON in the Android artifact', () => {
    expect(existsSync(resolve(process.cwd(), 'dist/android/json'))).toBe(false)
  })
})

describe('safe build output handling', () => {
  const temporaryDirectories: string[] = []

  afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  function createFixtureRoot(): string {
    const root = mkdtempSync(join(tmpdir(), 'monkeyking-build-'))
    temporaryDirectories.push(root)
    mkdirSync(resolve(root, 'docs'), { recursive: true })
    return root
  }

  test('cleans only the selected target and preserves the other artifact', async () => {
    const root = createFixtureRoot()
    const webFile = resolve(root, 'dist/web/stale.txt')
    const androidFile = resolve(root, 'dist/android/keep.txt')
    mkdirSync(resolve(webFile, '..'), { recursive: true })
    mkdirSync(resolve(androidFile, '..'), { recursive: true })
    writeFileSync(webFile, 'stale')
    writeFileSync(androidFile, 'keep')

    const buildScript = await loadBuildScript()
    expect(buildScript).toBeDefined()
    if (!buildScript) return

    buildScript.cleanBuildOutput(buildScript.createBuildPlan('web', root))

    expect(existsSync(resolve(root, 'dist/web'))).toBe(false)
    expect(readFileSync(androidFile, 'utf8')).toBe('keep')
  })

  test('rejects a shallow-copied plan before deleting anything', async () => {
    const root = createFixtureRoot()
    const outside = mkdtempSync(join(tmpdir(), 'monkeyking-outside-'))
    temporaryDirectories.push(outside)
    const sentinel = resolve(outside, 'sentinel.txt')
    writeFileSync(sentinel, 'keep')

    const buildScript = await loadBuildScript()
    expect(buildScript).toBeDefined()
    if (!buildScript) return

    const plan = buildScript.createBuildPlan('web', root)
    expect(() =>
      buildScript.cleanBuildOutput({ ...plan, outDir: outside }),
    ).toThrow('Untrusted build plan')
    expect(readFileSync(sentinel, 'utf8')).toBe('keep')
  })

  test('rejects a forged plan with matching projectRoot and outDir', async () => {
    const root = createFixtureRoot()
    const outside = mkdtempSync(join(tmpdir(), 'monkeyking-outside-'))
    temporaryDirectories.push(outside)
    const sentinel = resolve(outside, 'dist/web/sentinel.txt')
    mkdirSync(resolve(sentinel, '..'), { recursive: true })
    writeFileSync(sentinel, 'keep')

    const buildScript = await loadBuildScript()
    expect(buildScript).toBeDefined()
    if (!buildScript) return

    const plan = buildScript.createBuildPlan('web', root)
    expect(() =>
      buildScript.cleanBuildOutput({
        ...plan,
        projectRoot: outside,
        docsRoot: resolve(outside, 'docs'),
        outDir: resolve(outside, 'dist/web'),
      }),
    ).toThrow('Untrusted build plan')
    expect(readFileSync(sentinel, 'utf8')).toBe('keep')
  })

  test('rejects a replaced project root and preserves the symlink target', async () => {
    const root = createFixtureRoot()
    const relocatedRoot = `${root}-relocated`
    const outside = mkdtempSync(join(tmpdir(), 'monkeyking-outside-'))
    temporaryDirectories.push(relocatedRoot, outside)
    const sentinel = resolve(outside, 'dist/web/sentinel.txt')
    mkdirSync(resolve(sentinel, '..'), { recursive: true })
    writeFileSync(sentinel, 'keep')

    const buildScript = await loadBuildScript()
    expect(buildScript).toBeDefined()
    if (!buildScript) return

    const plan = buildScript.createBuildPlan('web', root)
    renameSync(root, relocatedRoot)
    symlinkSync(outside, root, 'dir')

    expect(() => buildScript.cleanBuildOutput(plan)).toThrow(
      'Refusing replaced project root',
    )
    expect(readFileSync(sentinel, 'utf8')).toBe('keep')
  })

  test('rejects symbolic-link and non-directory output paths', async () => {
    const root = createFixtureRoot()
    const outside = mkdtempSync(join(tmpdir(), 'monkeyking-outside-'))
    temporaryDirectories.push(outside)
    mkdirSync(resolve(root, 'dist'), { recursive: true })
    symlinkSync(outside, resolve(root, 'dist/web'), 'dir')

    const buildScript = await loadBuildScript()
    expect(buildScript).toBeDefined()
    if (!buildScript) return

    expect(() => buildScript.createBuildPlan('web', root)).toThrow(
      'Refusing symbolic link for build output',
    )

    rmSync(resolve(root, 'dist/web'))
    writeFileSync(resolve(root, 'dist/web'), 'not a directory')
    expect(() => buildScript.createBuildPlan('web', root)).toThrow(
      'Expected directory for build output',
    )
  })

  test('rejects a dangling symbolic-link output path', async () => {
    const root = createFixtureRoot()
    mkdirSync(resolve(root, 'dist'), { recursive: true })
    symlinkSync(
      resolve(root, 'missing-output-target'),
      resolve(root, 'dist/web'),
      'dir',
    )

    const buildScript = await loadBuildScript()
    expect(buildScript).toBeDefined()
    if (!buildScript) return

    expect(() => buildScript.createBuildPlan('web', root)).toThrow(
      'Refusing symbolic link for build output',
    )
  })

  test('rejects a symbolic-link dist parent before VitePress can follow it', async () => {
    const root = createFixtureRoot()
    const outside = mkdtempSync(join(tmpdir(), 'monkeyking-outside-'))
    temporaryDirectories.push(outside)
    symlinkSync(outside, resolve(root, 'dist'), 'dir')

    const buildScript = await loadBuildScript()
    expect(buildScript).toBeDefined()
    if (!buildScript) return

    expect(() => buildScript.createBuildPlan('web', root)).toThrow(
      'Refusing symbolic link for build output parent',
    )
  })

  test('copies the exact legacy JSON inventory byte for byte', async () => {
    const root = createFixtureRoot()
    const source = resolve(root, 'json')
    mkdirSync(source)
    for (const filename of expectedLegacyJsonFilenames) {
      writeFileSync(resolve(source, filename), Buffer.from(`bytes:${filename}`))
    }

    const buildScript = await loadBuildScript()
    expect(buildScript).toBeDefined()
    if (!buildScript) return

    const plan = buildScript.createBuildPlan('web', root)
    mkdirSync(plan.outDir, { recursive: true })
    buildScript.publishWebJson(plan)

    const destination = resolve(plan.outDir, 'json')
    expect(readdirSync(destination).sort()).toEqual(expectedLegacyJsonFilenames)
    for (const filename of expectedLegacyJsonFilenames) {
      expect(readFileSync(resolve(destination, filename))).toEqual(
        readFileSync(resolve(source, filename)),
      )
    }

    writeFileSync(resolve(destination, expectedLegacyJsonFilenames[0]), 'drift')
    expect(() => buildScript.verifyPublishedJson(source, destination)).toThrow(
      'Published JSON byte mismatch',
    )
  })

  test('rejects rogue and symbolic-link JSON inputs before publishing', async () => {
    const root = createFixtureRoot()
    const source = resolve(root, 'json')
    mkdirSync(source)
    for (const filename of expectedLegacyJsonFilenames) {
      writeFileSync(resolve(source, filename), filename)
    }

    const buildScript = await loadBuildScript()
    expect(buildScript).toBeDefined()
    if (!buildScript) return

    const plan = buildScript.createBuildPlan('web', root)
    mkdirSync(plan.outDir, { recursive: true })
    writeFileSync(resolve(source, 'rogue.json'), '{}')
    expect(() => buildScript.publishWebJson(plan)).toThrow(
      'Invalid legacy JSON inventory',
    )

    rmSync(resolve(source, 'rogue.json'))
    const victim = resolve(root, 'victim.json')
    writeFileSync(victim, '{}')
    rmSync(resolve(source, expectedLegacyJsonFilenames[0]))
    symlinkSync(victim, resolve(source, expectedLegacyJsonFilenames[0]))
    expect(() => buildScript.publishWebJson(plan)).toThrow(
      'Refusing symbolic link for legacy JSON source',
    )
  })
})
