import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Script } from 'node:vm'
import { getDmExample, shapePattern, validateDmExamples } from '../scripts/dm-examples.mjs'

// Deliberately independent of the implementation's registry and the generated docs.
const methods = [
  'addDict', 'appendPicAddr', 'bgr2rgb', 'buffer', 'cancel', 'capture',
  'captureGif', 'captureJpg', 'capturePng', 'capturePre', 'clearDict', 'close',
  'cmpColor', 'enableDisplayDebug', 'enableFindPicMultithread',
  'enableGetColorByCapture', 'enablePicCache', 'enableShareDict', 'fetchWord',
  'findColor', 'findColorBlock', 'findColorBlockEx', 'findColorE', 'findColorEx',
  'findMulColor', 'findMultiColor', 'findMultiColorE', 'findMultiColorEx',
  'findPic', 'findPicE', 'findPicEx', 'findPicExS', 'findPicMem', 'findPicMemE',
  'findPicMemEx', 'findPicS', 'findPicSim', 'findPicSimE', 'findPicSimEx',
  'findPicSimMem', 'findPicSimMemE', 'findPicSimMemEx',
  'findShape', 'findShapeE', 'findShapeEx',
  'findStr', 'findStrE', 'findStrEx', 'findStrExS', 'findStrFast', 'findStrFastE',
  'findStrFastEx', 'findStrFastExS', 'findStrFastS', 'findStrS',
  'findStrWithFont', 'findStrWithFontE', 'findStrWithFontEx', 'freePic',
  'getAveHSV', 'getAveRGB', 'getColor', 'getColorBGR', 'getColorHSV', 'getColorNum',
  'getDict', 'getDictCount', 'getDictInfo', 'getFrameInfo', 'getLastFindTimings',
  'getNowDict', 'getPicSize', 'getResultCount', 'getResultPos',
  'getScreenData', 'getScreenDataBmp', 'getWordResultCount', 'getWordResultPos',
  'getWordResultStr', 'getWords', 'getWordsNoDict', 'imageToBmp', 'isDisplayDead',
  'keepScreen', 'loadPic', 'loadPicByte', 'matchPicName', 'ocr',
  'ocrEx', 'ocrExOne', 'ocrInFile', 'rgb2bgr', 'saveDict', 'setColGapNoDict',
  'setDict', 'setDictMem', 'setDisplayInput', 'setExactOcr', 'setExcludeRegion',
  'setFindPicMultithreadCount', 'setFindPicMultithreadLimit', 'setImage',
  'setMinColGap', 'setMinRowGap', 'setPath', 'setRowGapNoDict', 'setSimdEnabled',
  'setWordGap', 'setWordGapNoDict', 'setWordLineHeight', 'setWordLineHeightNoDict',
  'useDict', 'useScreen',
] as const

const pictureMethods = methods.filter((name) => name.startsWith('findPic'))
const textMethods = methods.filter((name) => name.startsWith('findStr'))
const ocrFormats = [
  '9f2e3f-000000',
  '9f2e3f-030303',
  '9f2e3f-030303|2d3f2f-000000|3f9e4d-100000',
  '20.30.40-0.0.0|30.40.50-0.0.0',
  '#40-0|#70-10',
  'b@ffffff-000000',
]
const hits = [
  { value: 0, x: 17, y: 23 },
  { value: 1, x: 41, y: 59 },
]

// These mocks exercise generated JavaScript control flow, not Android recognition.
function screenHarness(overrides: Record<string, unknown> = {}) {
  const frame = {
    getWidth: vi.fn(() => 321),
    getHeight: vi.fn(() => 241),
    recycle: vi.fn(),
  }
  const requestScreenCapture = vi.fn(() => true)
  const captureScreen = vi.fn(() => frame)
  const setImage = vi.fn()
  const useScreen = vi.fn()
  const log = vi.fn()
  const context = {
    requestScreenCapture,
    images: { captureScreen },
    dm: { setImage, useScreen, ...overrides },
    files: {
      path: vi.fn((path: string) => `/mock/${path}`),
      readBytes: vi.fn((path: string) => Buffer.from(path)),
    },
    console: { log },
  }
  return {
    frame, requestScreenCapture, captureScreen, setImage, useScreen, log, context,
    run(name: string) {
      new Script(getDmExample(name).code, { filename: `${name}.example.js` })
        .runInNewContext(context, { timeout: 1000 })
    },
  }
}

function expectReleased(harness: ReturnType<typeof screenHarness>) {
  expect(harness.requestScreenCapture).toHaveBeenCalledOnce()
  expect(harness.captureScreen).toHaveBeenCalledOnce()
  expect(harness.setImage).toHaveBeenCalledExactlyOnceWith(harness.frame)
  expect(harness.frame.getWidth).toHaveBeenCalled()
  expect(harness.frame.getHeight).toHaveBeenCalled()
  expect(harness.useScreen).toHaveBeenCalledOnce()
  expect(harness.frame.recycle).toHaveBeenCalledOnce()
  expect(harness.requestScreenCapture.mock.invocationCallOrder[0])
    .toBeLessThan(harness.captureScreen.mock.invocationCallOrder[0])
  expect(harness.setImage.mock.invocationCallOrder[0])
    .toBeLessThan(harness.useScreen.mock.invocationCallOrder[0])
  expect(harness.useScreen.mock.invocationCallOrder[0])
    .toBeLessThan(harness.frame.recycle.mock.invocationCallOrder[0])
}

function expectLoggedHits(
  harness: ReturnType<typeof screenHarness>,
  expected: readonly { value: string | number; x: number; y: number }[],
) {
  for (const match of expected) {
    expect(harness.log.mock.calls.some(
      (args) => args.includes(match.value) && args.includes(match.x) && args.includes(match.y),
    ), JSON.stringify(match)).toBe(true)
  }
}

describe('explicit DM example registry', () => {
  test('covers exactly the 113 canonical public dm functions', () => {
    const manifest = JSON.parse(readFileSync(resolve('api-surface/manifest.json'), 'utf8')) as {
      symbols: { public: boolean; owner: string; canonicalId?: string; kind: string; name: string }[]
    }
    const canonical = manifest.symbols
      .filter((symbol) => symbol.public && symbol.owner === 'dm'
        && !symbol.canonicalId && symbol.kind === 'function')
      .map((symbol) => symbol.name)
    expect(methods).toHaveLength(113)
    expect(new Set(methods).size).toBe(113)
    expect([...methods].sort()).toEqual(canonical.sort())
    expect(() => validateDmExamples(methods)).not.toThrow()
  })

  test.each(methods)('%s has executable syntax, explicit invocation and scenarios', (name) => {
    const { code, scenarios } = getDmExample(name)
    expect(code.trim()).not.toBe('')
    expect(code).toMatch(new RegExp(`\\bdm\\.${name}\\s*\\(`))
    expect(scenarios.length).toBeGreaterThan(0)
    expect(scenarios.every((scenario: string) => scenario.trim().length > 0)).toBe(true)
    expect(new Set(scenarios).size).toBe(scenarios.length)
    expect(() => new Script(code)).not.toThrow()
  })

  test.each(['notARealDmMethod', 'FindShape', 'toString', '__proto__', ''])(
    'rejects unknown name %j rather than supplying a fallback',
    (name) => {
      expect(() => getDmExample(name)).toThrow(/Missing explicit DM example/)
      expect(() => validateDmExamples([...methods, name])).toThrow(/Missing explicit DM example/)
    },
  )

  test.each(methods)('rejects stale registry entry %s', (name) => {
    expect(() => validateDmExamples(methods.filter((method) => method !== name)))
      .toThrow(`Stale DM example: ${name}`)
  })

  test('rejects an empty manifest as stale', () => {
    expect(() => validateDmExamples([])).toThrow(/Stale DM example/)
  })

  test.each(['missing', 'stale'])('generator rejects %s examples before any write', (mode) => {
    const root = mkdtempSync(join(tmpdir(), 'dm-example-preflight-'))
    try {
      const scripts = join(root, 'MonkeyKing-Documentation', 'scripts')
      const manifestDir = join(root, 'MonkeyKing', 'docs', 'dm')
      mkdirSync(scripts, { recursive: true })
      mkdirSync(manifestDir, { recursive: true })
      for (const file of ['generate-dm-docs.mjs', 'dm-examples.mjs']) {
        copyFileSync(resolve('scripts', file), join(scripts, file))
      }
      const names = mode === 'missing'
        ? [...methods, 'missingExampleForRegression']
        : methods.filter((name) => name !== 'findShape')
      writeFileSync(join(manifestDir, 'api-manifest.json'), JSON.stringify(
        names.map((modern) => ({ modern, java: `int ${modern}()` })),
      ))
      const generatorUrl = pathToFileURL(join(scripts, 'generate-dm-docs.mjs')).href
      // Trap writes in the child before importing the real generator, even if it
      // catches a write failure; no generated files in the shared checkout change.
      const child = spawnSync(process.execPath, ['--input-type=module', '--eval', `
        import fs from 'node:fs'
        import { syncBuiltinESMExports } from 'node:module'
        fs.writeFileSync = () => {
          process.stderr.write('UNEXPECTED_GENERATOR_WRITE\\n')
          throw new Error('Unexpected generator write')
        }
        syncBuiltinESMExports()
        await import(${JSON.stringify(generatorUrl)})
      `], { encoding: 'utf8', timeout: 10_000 })
      expect(child.error).toBeUndefined()
      expect(child.status).toBe(1)
      expect(child.stderr).toContain(mode === 'missing'
        ? 'Missing explicit DM example: missingExampleForRegression'
        : 'Stale DM example: findShape')
      expect(child.stderr).not.toContain('UNEXPECTED_GENERATOR_WRITE')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('generated shape examples: JavaScript-only simulation', () => {
  test('uses the reviewed nine relative coordinates and both equality flags', () => {
    const points = shapePattern.split(',').map((point) => point.split('|').map(Number))
    expect(points).toEqual([
      [1, 1, 0], [1, 6, 1], [0, 10, 1], [9, 10, 1], [7, 6, 1],
      [7, 8, 0], [8, 9, 0], [2, 2, 1], [3, 1, 1],
    ])
    expect(new Set(points.map((point) => point[2]))).toEqual(new Set([0, 1]))
  })

  test.each(['findShape', 'findShapeE', 'findShapeEx'])('%s handles hits and misses', (name) => {
    const multiple = name.endsWith('Ex')
    for (const found of [true, false]) {
      const result = found ? (multiple ? hits : hits[0]) : (multiple ? [] : null)
      const find = vi.fn((..._args: unknown[]) => result)
      const harness = screenHarness({ [name]: find })
      expect(() => harness.run(name)).not.toThrow()
      expect(find).toHaveBeenCalledOnce()
      expect(find.mock.calls[0].slice(0, 6)).toEqual([0, 0, 320, 240, shapePattern, 1])
      const direction = find.mock.calls[0][6]
      expect([0, 1, 2, 3]).toContain(direction)
      expect(direction).not.toBe(4)
      expect(getDmExample(name).code).not.toContain('从中心向外')
      if (found) expectLoggedHits(harness, multiple ? hits : [hits[0]])
      else expect(harness.log).toHaveBeenCalledExactlyOnceWith('未命中')
      expectReleased(harness)
    }
  })

  test('denied capture permission prevents acquisition, search and cleanup of unowned resources', () => {
    const findShape = vi.fn()
    const harness = screenHarness({ findShape })
    harness.requestScreenCapture.mockReturnValue(false)
    expect(() => harness.run('findShape')).toThrow()
    expect(harness.captureScreen).not.toHaveBeenCalled()
    expect(harness.setImage).not.toHaveBeenCalled()
    expect(findShape).not.toHaveBeenCalled()
    expect(harness.useScreen).not.toHaveBeenCalled()
    expect(harness.frame.recycle).not.toHaveBeenCalled()
  })
})

describe('generated OCR and text examples: JavaScript-only simulation', () => {
  test.each(['ocr', 'ocrEx', 'ocrExOne'])('%s exercises six color formats and empty results', (name) => {
    for (const found of [true, false]) {
      const words = [{ value: 'recognized', x: 17, y: 23 }, { value: 'second', x: 41, y: 59 }]
      const result = name === 'ocr' ? (found ? 'recognized' : '') : (found ? words : [])
      const ocr = vi.fn((..._args: unknown[]) => result)
      const setDict = vi.fn()
      const useDict = vi.fn()
      const harness = screenHarness({ [name]: ocr, setDict, useDict })
      harness.run(name)
      expect(setDict).toHaveBeenCalledExactlyOnceWith(0, '/mock/./assets/dm/main.dm.txt')
      expect(useDict).toHaveBeenCalledExactlyOnceWith(0)
      expect(useDict.mock.invocationCallOrder[0]).toBeLessThan(ocr.mock.invocationCallOrder[0])
      expect(ocr.mock.calls.slice(0, 6).map((args) => args[4])).toEqual(ocrFormats)
      for (const args of ocr.mock.calls) {
        expect(args.slice(0, 4)).toEqual([0, 0, 320, 240])
        expect(args[5]).toBe(1)
      }
      if (name === 'ocr') {
        expect(ocr).toHaveBeenCalledTimes(8)
        expect(ocr.mock.calls[6][4]).toBe('9f2e3f-000000,|')
        expect(ocr.mock.calls[7][4]).toBe('9f2e3f-000000,\n')
        expect(ocr.mock.calls[7][4]).not.toContain('\\n')
        if (!found) expect(harness.log).toHaveBeenCalledWith('RGB 单色', '未识别到文字')
      } else {
        expect(ocr).toHaveBeenCalledTimes(6)
        if (found) {
          for (const word of words) {
            expect(harness.log).toHaveBeenCalledWith('文字', word.value, '坐标', word.x, word.y)
          }
        } else {
          expect(harness.log.mock.calls.filter((args) => args[0] === '未命中')).toHaveLength(6)
        }
      }
      expectReleased(harness)
    }
  })

  test.each(textMethods)('%s handles natural match/null or match-array returns', (name) => {
    const multiple = name.includes('Ex')
    for (const found of [true, false]) {
      const textHits = hits.map((hit, index) => ({
        ...hit, value: name.endsWith('S') ? ['确定', '取消'][index] : hit.value,
      }))
      const result = found ? (multiple ? textHits : textHits[0]) : (multiple ? [] : null)
      const find = vi.fn((..._args: unknown[]) => result)
      const harness = screenHarness({ [name]: find, setDict: vi.fn(), useDict: vi.fn() })
      harness.run(name)
      expect(find.mock.calls.map((args) => args[4])).toEqual(['确定', '确定|取消'])
      for (const args of find.mock.calls) {
        expect(args.slice(0, 4)).toEqual([0, 0, 320, 240])
      }
      if (found) expectLoggedHits(harness, multiple ? textHits : [textHits[0]])
      else expect(harness.log).toHaveBeenCalledWith('未命中')
      expectReleased(harness)
    }
  })
})

describe('generated picture examples: JavaScript-only simulation', () => {
  test.each(pictureMethods)('%s uses multiple templates, correct similarity and natural results', (name) => {
    const memory = name.includes('Mem')
    const multiple = name.includes('Ex')
    for (const found of [true, false]) {
      const pictureHits = hits.map((hit, index) => ({
        ...hit, value: name.endsWith('S') ? ['button.png', 'cancel.png'][index] : hit.value,
      }))
      const result = found ? (multiple ? pictureHits : pictureHits[0]) : (multiple ? [] : null)
      const find = vi.fn((..._args: unknown[]) => result)
      const buffers = [{ close: vi.fn() }, { close: vi.fn() }]
      const buffer = vi.fn().mockReturnValueOnce(buffers[0]).mockReturnValueOnce(buffers[1])
      const loadPic = vi.fn()
      const freePic = vi.fn()
      const harness = screenHarness({ [name]: find, buffer, setPath: vi.fn(), loadPic, freePic })
      harness.run(name)
      expect(find).toHaveBeenCalledOnce()
      expect(find.mock.calls[0]).toEqual([
        0, 0, 320, 240, memory ? buffers : 'button.png|cancel.png',
        '202020', name.includes('Sim') ? 80 : 0.9, 0,
      ])
      if (found) {
        for (const hit of multiple ? pictureHits : [pictureHits[0]]) {
          expect(harness.log).toHaveBeenCalledWith(
            name.endsWith('S') ? '模板名' : '模板编号', hit.value, '坐标', hit.x, hit.y,
          )
        }
      } else {
        expect(harness.log).toHaveBeenCalledWith('未命中')
      }
      if (memory) {
        expect(harness.context.files.readBytes.mock.calls).toEqual([
          ['./assets/dm/button.png'], ['./assets/dm/cancel.png'],
        ])
        expect(buffer).toHaveBeenCalledTimes(2)
        for (const resource of buffers) {
          expect(resource.close).toHaveBeenCalledOnce()
          expect(resource.close.mock.invocationCallOrder[0])
            .toBeLessThan(harness.useScreen.mock.invocationCallOrder[0])
        }
      } else {
        expect(loadPic).toHaveBeenCalledExactlyOnceWith('button.png|cancel.png')
        expect(freePic).toHaveBeenCalledExactlyOnceWith('button.png|cancel.png')
        expect(loadPic.mock.invocationCallOrder[0]).toBeLessThan(find.mock.invocationCallOrder[0])
        expect(freePic.mock.invocationCallOrder[0]).toBeLessThan(harness.useScreen.mock.invocationCallOrder[0])
      }
      expectReleased(harness)
    }
  })

  test.each(['second read', 'second buffer', 'find'])(
    'findPicMem closes every acquired buffer when %s throws',
    (failure) => {
      const error = new Error(`injected ${failure} failure`)
      const buffers = [{ close: vi.fn() }, { close: vi.fn() }]
      const buffer = vi.fn().mockReturnValueOnce(buffers[0])
      if (failure === 'second buffer') buffer.mockImplementationOnce(() => { throw error })
      else buffer.mockReturnValueOnce(buffers[1])
      const findPicMem = vi.fn(() => { throw error })
      const harness = screenHarness({ buffer, findPicMem })
      if (failure === 'second read') {
        harness.context.files.readBytes
          .mockReturnValueOnce(Buffer.from('first'))
          .mockImplementationOnce(() => { throw error })
      }
      expect(() => harness.run('findPicMem')).toThrow(error)
      expect(buffer).toHaveBeenCalledTimes(failure === 'second read' ? 1 : 2)
      expect(findPicMem).toHaveBeenCalledTimes(failure === 'find' ? 1 : 0)
      expect(buffers[0].close).toHaveBeenCalledOnce()
      expect(buffers[1].close).toHaveBeenCalledTimes(failure === 'find' ? 1 : 0)
      for (const resource of buffers.slice(0, failure === 'find' ? 2 : 1)) {
        expect(resource.close.mock.invocationCallOrder[0])
          .toBeLessThan(harness.useScreen.mock.invocationCallOrder[0])
      }
      expectReleased(harness)
    },
  )
})

describe('generated color and timing examples: JavaScript-only simulation', () => {
  test.each(['findMultiColor', 'findMultiColorE', 'findMultiColorEx'])(
    '%s combines positive/negative offsets, multiple candidates and inverted colors',
    (name) => {
      const find = vi.fn((..._args: unknown[]) => name.endsWith('Ex') ? [] : null)
      const harness = screenHarness({ [name]: find })
      harness.run(name)
      expect(find).toHaveBeenCalledOnce()
      const [x1, y1, x2, y2, color, offsets, similarity, direction] = find.mock.calls[0]
      expect([x1, y1, x2, y2]).toEqual([0, 0, 320, 240])
      expect(String(color).split('|').length).toBeGreaterThan(1)
      const points = String(offsets).split(',').map((point) => point.split('|'))
      expect(points.some(([x]) => Number(x) < 0)).toBe(true)
      expect(points.some(([, y]) => Number(y) < 0)).toBe(true)
      expect(points.some(([x, y]) => Number(x) > 0 && Number(y) > 0)).toBe(true)
      expect(points.some((point) => point.length > 3)).toBe(true)
      expect(points.some((point) => point.slice(2).some((value) => /^-[0-9a-f]{6}$/i.test(value))))
        .toBe(true)
      expect(similarity).toBe(1)
      expect([0, 1, 2, 3]).toContain(direction)
      expect(harness.log).toHaveBeenCalledWith('未命中')
      expectReleased(harness)
    },
  )

  test.each([0, 1])('findMulColor interprets integer result %i, not a DmMatch', (result) => {
    const findMulColor = vi.fn((..._args: unknown[]) => result)
    const harness = screenHarness({ findMulColor })
    harness.run('findMulColor')
    expect(findMulColor).toHaveBeenCalledOnce()
    expect(findMulColor.mock.calls[0].slice(0, 4)).toEqual([0, 0, 320, 240])
    expect(harness.log).toHaveBeenCalledExactlyOnceWith(
      result === 1 ? '全部颜色均存在' : '至少一种颜色不存在',
    )
    expect(getDmExample('findMulColor').code).not.toMatch(/\b(?:found|match)\.(?:value|x|y)\b/)
    expectReleased(harness)
  })

  test.each([0, 1])('cmpColor interprets %i with zero as success', (result) => {
    const cmpColor = vi.fn()
    cmpColor.mockReturnValue(result)
    const harness = screenHarness({ cmpColor })
    harness.run('cmpColor')
    expect(cmpColor).toHaveBeenCalledExactlyOnceWith(160, 120, 'ffffff-000000|eeeeee-202020', 1)
    expect(harness.log).toHaveBeenCalledExactlyOnceWith(result === 0 ? '颜色匹配' : '颜色不匹配')
    expectReleased(harness)
  })

  test.each([0, 1])('isDisplayDead uses live screen input and seconds (result %i)', (result) => {
    const isDisplayDead = vi.fn().mockReturnValue(result)
    const keepScreen = vi.fn()
    const harness = screenHarness({ isDisplayDead, keepScreen })
    harness.run('isDisplayDead')
    expect(isDisplayDead).toHaveBeenCalledExactlyOnceWith(0, 0, 320, 240, 2)
    expect(harness.requestScreenCapture).toHaveBeenCalledOnce()
    expect(harness.captureScreen).toHaveBeenCalledOnce()
    expect(harness.useScreen).toHaveBeenCalledOnce()
    expect(harness.setImage).not.toHaveBeenCalled()
    expect(keepScreen).not.toHaveBeenCalled()
    expect(harness.frame.recycle).toHaveBeenCalledOnce()
    expect(harness.frame.recycle.mock.invocationCallOrder[0])
      .toBeLessThan(isDisplayDead.mock.invocationCallOrder[0])
    expect(harness.log).toHaveBeenCalledExactlyOnceWith(
      result === 1 ? '区域持续两秒未变化' : '区域发生变化',
    )
    expect(getDmExample('isDisplayDead').code).toContain('单位是秒')
  })
})

describe('reference scenario adaptations: JavaScript-only simulation', () => {
  test('captureGif includes animated and zero-delay single-frame output', () => {
    const captureGif = vi.fn(() => 1)
    const harness = screenHarness({ captureGif })
    Object.assign(harness.context.files, { ensureDir: vi.fn() })
    harness.run('captureGif')
    expect(captureGif.mock.calls).toHaveLength(2)
    expect(captureGif).toHaveBeenNthCalledWith(
      1, 0, 0, 320, 240, '/mock/./output/animation.gif', 100, 2000,
    )
    expect(captureGif).toHaveBeenNthCalledWith(
      2, 0, 0, 320, 240, '/mock/./output/single.gif', 0, 0,
    )
    expect(harness.setImage).not.toHaveBeenCalled()
    expect(harness.frame.recycle).toHaveBeenCalledOnce()
  })

  test.each(['fetchWord', 'addDict'])('%s covers four sampling modes and catches empty-foreground errors', (name) => {
    const fetchWord = vi.fn()
      .mockReturnValueOnce('valid-rgb-glyph')
      .mockImplementationOnce(() => { throw new Error('empty foreground') })
      .mockReturnValueOnce('valid-hsv-background')
      .mockReturnValueOnce('valid-hsv-foreground')
    const addDict = vi.fn()
    const useDict = vi.fn()
    const harness = screenHarness({ fetchWord, addDict, useDict, getDictCount: vi.fn(() => 1) })
    harness.run(name)
    expect(fetchWord.mock.calls.map((args) => args[4])).toEqual([
      'ffffff-202020|eeeeee-101010',
      'b@000000-101010|101010-080808',
      'b@0.0.100-0.0.5',
      '20.30.40-0.0.0|30.40.50-0.0.0',
    ])
    expect(addDict.mock.calls).toEqual([
      [0, 'valid-rgb-glyph'], [2, 'valid-hsv-background'], [3, 'valid-hsv-foreground'],
    ])
    expect(harness.log.mock.calls.some((args) => args.includes('Error: empty foreground'))).toBe(true)
    expectReleased(harness)
  })

  test('useDict restores the previous slot when temporary OCR throws', () => {
    const useDict = vi.fn()
    const failure = new Error('OCR failure')
    const harness = screenHarness({
      setDict: vi.fn(), getNowDict: vi.fn(() => 0), useDict,
      ocr: vi.fn(() => { throw failure }),
    })
    expect(() => harness.run('useDict')).toThrow(failure)
    expect(useDict.mock.calls).toEqual([[0], [1], [0]])
    expectReleased(harness)
  })

  test('appendPicAddr retains all appended copies and releases source buffers independently', () => {
    const sources = Array.from({ length: 3 }, () => ({ close: vi.fn(), size: () => 4 }))
    const copies = Array.from({ length: 3 }, () => ({ close: vi.fn() }))
    let sourceIndex = 0, copyIndex = 0
    const appendPicAddr = vi.fn((list: unknown[], _source: unknown, _length: number) => [
      ...list, copies[copyIndex++],
    ])
    const harness = screenHarness({
      buffer: vi.fn(() => sources[sourceIndex++]),
      appendPicAddr,
    })
    harness.run('appendPicAddr')
    expect(appendPicAddr.mock.calls.map((args) => args[0].length)).toEqual([0, 1, 2])
    for (const buffer of [...sources, ...copies]) expect(buffer.close).toHaveBeenCalledOnce()
    expect(harness.log).toHaveBeenCalledWith('模板数', 3)
  })

  test('frame recycling still happens when resetting the DM input fails', () => {
    const harness = screenHarness({ findShape: vi.fn(() => null) })
    harness.useScreen.mockImplementation(() => { throw new Error('engine cancelled') })
    expect(() => harness.run('findShape')).toThrow('engine cancelled')
    expect(harness.frame.recycle).toHaveBeenCalledOnce()
  })

  test('file input cleanup releases the image even if screen restoration throws', () => {
    const data = { close: vi.fn() }
    const harness = screenHarness({
      setPath: vi.fn(), getColor: vi.fn(() => 'ffffff'),
      findColor: vi.fn(() => null), buffer: vi.fn(() => data),
      setDisplayInput: vi.fn((source: string) => {
        if (source === 'screen') throw new Error('engine cancelled')
      }),
    })
    Object.assign(harness.context.images, { read: vi.fn(() => harness.frame) })
    expect(() => harness.run('setDisplayInput')).toThrow('engine cancelled')
    expect(data.close).toHaveBeenCalledOnce()
    expect(harness.frame.recycle).toHaveBeenCalledOnce()
  })
})
