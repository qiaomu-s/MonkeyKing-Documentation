import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const manifestPath = resolve(
  root,
  '../MonkeyKing/docs/dm/api-manifest.json',
)
const entries = JSON.parse(readFileSync(manifestPath, 'utf8'))
const engineEntries = [
  ['buffer', 'DmBuffer buffer(byte[] bytes)'],
  ['cancel', 'void cancel()'],
  ['close', 'void close()'],
  ['getFrameInfo', 'Bundle getFrameInfo()'],
  ['getLastFindTimings', 'Map getLastFindTimings()'],
  ['keepScreen', 'void keepScreen(boolean keep)'],
  ['ocrAuto', 'Object ocrAuto(Map options)'],
  ['setImage', 'void setImage(Object image)'],
  ['setSimdEnabled', 'void setSimdEnabled(boolean enabled)'],
  ['useScreen', 'void useScreen()'],
].map(([modern, java]) => ({ modern, java, source: 'DmEngine extension' }))

const imageNames = new Set([
  'appendPicAddr', 'bgr2rgb', 'capture', 'captureGif', 'captureJpg',
  'capturePng', 'capturePre', 'cmpColor', 'enableDisplayDebug',
  'enableFindPicMultithread', 'enableGetColorByCapture', 'findColor',
  'findColorBlock', 'findColorBlockEx', 'findColorE', 'findColorEx',
  'findMulColor', 'findMultiColor', 'findMultiColorE', 'findMultiColorEx',
  'findPic', 'findPicE', 'findPicEx', 'findPicExS', 'findPicMem',
  'findPicMemE', 'findPicMemEx', 'findPicS', 'findPicSim', 'findPicSimE',
  'findPicSimEx', 'findPicSimMem', 'findPicSimMemE', 'findPicSimMemEx',
  'findShape', 'findShapeE', 'findShapeEx', 'freePic', 'getAveHSV',
  'getAveRGB', 'getColor', 'getColorBGR', 'getColorHSV', 'getColorNum',
  'getPicSize', 'getScreenData', 'getScreenDataBmp', 'imageToBmp',
  'isDisplayDead', 'loadPic', 'loadPicByte', 'matchPicName', 'rgb2bgr',
  'setExcludeRegion', 'setFindPicMultithreadCount', 'setFindPicMultithreadLimit',
  'setPicPwd', 'setPath', 'setDisplayInput', 'enablePicCache',
])

function anchor(name) {
  return Buffer.from(`dm.${name}`).toString('base64url')
}

function parseJava(entry) {
  const match = entry.java.match(/^(.+?)\s+(\w+)\((.*)\)$/)
  if (!match) return { returnType: 'unknown', params: [] }
  const params = match[3].trim()
  return {
    returnType: match[1],
    params: params
      ? params.split(/,\s*/).map((value) => {
          const parts = value.trim().split(/\s+/)
          return { type: parts.slice(0, -1).join(' '), name: parts.at(-1) }
        })
      : [],
  }
}

function category(name) {
  if (name.startsWith('ocr') || name.startsWith('findStr') ||
      name.startsWith('getWord') || name.startsWith('getWords') ||
      name.includes('Dict') || name.includes('dict') ||
      name.includes('Word') || name.includes('word') ||
      ['fetchWord', 'getResultCount', 'getResultPos', 'setExactOcr',
        'setMinColGap', 'setMinRowGap', 'setColGapNoDict',
        'setRowGapNoDict', 'setWordGap', 'setWordGapNoDict',
        'setWordLineHeight', 'setWordLineHeightNoDict'].includes(name)) {
    return 'text'
  }
  return 'image'
}

function returnDescription(name, returnType) {
  if (name.startsWith('find') || name.startsWith('getResultPos') ||
      name.startsWith('getWordResultPos')) {
    return returnType.includes('[]')
      ? '`DmMatch[]`；未命中时为空数组。'
      : '`DmMatch`；未命中时为 `null`。'
  }
  if (name === 'ocr') return '`string`；未识别到文字时为空字符串。'
  if (name.startsWith('ocr') || name.startsWith('getWords')) {
    return returnType.includes('[]')
      ? '`DmMatch[]`；无结果时为空数组。'
      : '`string`；无结果时为空字符串。'
  }
  if (returnType === 'int') return '`number`；成功通常为 `1`，失败为 `0`。'
  if (returnType.includes('DmBuffer')) return '`DmBuffer`；调用方负责 `close()`。'
  if (returnType.includes('List')) return '`DmBuffer[]` 或空数组。'
  return `\`${returnType}\`；具体失败值遵循底层命令约定。`
}

function parameterDescription(param) {
  if (/^x[12]?$|^y[12]?$/i.test(param.name)) return '输入图像中的像素坐标；右下边界包含在区域内。'
  if (param.name === 'color' || param.name === 'delta') return '六位十六进制颜色；多颜色条件按接口格式传入。'
  if (param.name === 'similarity') return '相似度，通常为 `0.0` 到 `1.0`；值越高越严格。'
  if (param.name === 'direction') return '扫描方向编号；保持与设备端和示例一致。'
  if (param.name.toLowerCase().includes('file') || param.name === 'pictures') return '资源文件名或相对路径；先设置资源根目录。'
  if (param.name === 'index') return '字库槽位或结果索引，必须是非负整数。'
  if (param.name === 'enabled' || param.name === 'quality') return '功能开关或质量参数；取值范围见设备实现。'
  if (param.name === 'text' || param.name === 'font') return '待识别文字、字体名或字典文本。'
  return '按接口类型传入；不可传入 Java 内部对象。'
}

function functionSection(entry) {
  const name = entry.modern
  const parsed = parseJava(entry)
  const signature = `${name}(${parsed.params.map(({ name: param }) => param).join(', ')})`
  const params = parsed.params.length
    ? parsed.params.map(({ type, name: param }) =>
        `| \`${param}\` | \`${type}\` | 是 | — | ${parameterDescription({ type, name: param })} |`).join('\n')
    : '| — | — | — | — | 无参数。 |'
  const example = name === 'findColor'
    ? `const match = dm.findColor(0, 0, device.width - 1, device.height - 1, 'ffffff', 0.9, 0)
if (match) console.log(match.x, match.y)`
    : name === 'ocr'
      ? `dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const text = dm.ocr(0, 0, device.width - 1, device.height - 1, 'ffffff', 0.9)
console.log(text)`
      : `const result = dm.${signature}
console.log(result)`
  return `### dm.${name}

<a id="api-symbol-${anchor(name)}"></a>

#### 签名

\`\`\`js
dm.${signature}
\`\`\`

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
${params}

#### 返回值

${returnDescription(name, parsed.returnType)}

#### 示例

\`\`\`js
${example}
\`\`\`

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 \`#\` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 \`dm.keepScreen(true)\` 复用同一帧。涉及图片或字库的资源在任务结束后释放，\`DmBuffer\` 使用完必须调用 \`close()\`。
`
}

const allEntries = [...entries, ...engineEntries]
const imageEntries = allEntries.filter((entry) => imageNames.has(entry.modern) || entry.modern === 'setImage' || entry.modern === 'useScreen' || entry.modern === 'keepScreen' || entry.modern === 'buffer')
const textEntries = allEntries.filter((entry) => !imageEntries.includes(entry))
const header = `# dm 图色与文字识别 API

Monkey King 提供脚本级全局对象 \`dm\`。公开入口统一使用 camelCase；底层大漠命令名仅作为实现映射，不是可调用的脚本 API。找色、找图和文字识别结果使用自然返回值：单结果为 \`DmMatch | null\`，多结果为 \`DmMatch[]\`，文字识别为字符串或结构化结果。

<a id="api-symbol-bW9kdWxlOmRt"></a>

加密图片和加密字库不在支持范围内；\`setPicPwd\` 与 \`setDictPwd\` 仅保留入口并对非空密码返回“不支持加密资源”。

## 输入与资源生命周期

输入可以来自屏幕、离线图片、\`DmBuffer\` 或冻结帧。坐标使用输入图像坐标，矩形右下角包含在扫描区域内。一次截图多次识别时可调用 \`dm.keepScreen(true)\`，使用 \`dm.close()\` 或 \`DmBuffer.close()\` 释放资源。

`

const page = `${header}## 图色导航

${imageEntries.map(functionSection).join('\n')}

## 文字识别导航

${textEntries.map(functionSection).join('\n')}
`
writeFileSync(resolve(root, 'docs/api/media/dm.md'), page.trimEnd() + '\n')

const imagePage = `# dm 图色导航

本页覆盖取色、颜色比较、颜色块、多点找色、找图、截图、图片缓存、图片尺寸、资源释放、屏幕输入和帧控制。所有示例均使用 camelCase。

${imageEntries.map(functionSection).join('\n')}
`
writeFileSync(resolve(root, 'docs/reference/dm/image.md'), imagePage.trimEnd() + '\n')

const textPage = `# dm 文字识别导航

本页覆盖 OCR、FindStr、无字库识别、结果解析、字库加载与切换、字间距和行高配置。所有示例均使用 camelCase。

${textEntries.map(functionSection).join('\n')}

## 组合示例

\`\`\`js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const hit = dm.findStrFast(0, 0, device.width - 1, device.height - 1, '确定', 'ffffff', 0.9)
if (hit == null) console.log('未命中')
const blocks = dm.getWordsNoDict(0, 0, device.width - 1, device.height - 1, 'ffffff')
console.log(blocks)
dm.close()
\`\`\`
`
writeFileSync(resolve(root, 'docs/reference/dm/text.md'), textPage.trimEnd() + '\n')
