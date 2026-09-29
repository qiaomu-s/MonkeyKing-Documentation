import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const manifestPath = resolve(root, '../MonkeyKing/docs/dm/api-manifest.json')
const manifestEntries = JSON.parse(readFileSync(manifestPath, 'utf8'))

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
].map(([modern, java]) => ({ modern, java, source: 'MonkeyKing DmEngine extension' }))

const imageNames = new Set([
  'appendPicAddr', 'bgr2rgb', 'buffer', 'capture', 'captureGif', 'captureJpg',
  'capturePng', 'capturePre', 'cancel', 'close', 'cmpColor', 'enableDisplayDebug',
  'enableFindPicMultithread', 'enableGetColorByCapture', 'enablePicCache',
  'findColor', 'findColorBlock', 'findColorBlockEx', 'findColorE',
  'findColorEx', 'findMulColor', 'findMultiColor', 'findMultiColorE',
  'findMultiColorEx', 'findPic', 'findPicE', 'findPicEx', 'findPicExS',
  'findPicMem', 'findPicMemE', 'findPicMemEx', 'findPicS', 'findPicSim',
  'findPicSimE', 'findPicSimEx', 'findPicSimMem', 'findPicSimMemE',
  'findPicSimMemEx', 'findShape', 'findShapeE', 'findShapeEx', 'freePic',
  'getAveHSV', 'getAveRGB', 'getColor', 'getColorBGR', 'getColorHSV',
  'getColorNum', 'getFrameInfo', 'getLastFindTimings', 'getPicSize',
  'getScreenData', 'getScreenDataBmp', 'imageToBmp', 'isDisplayDead',
  'keepScreen', 'loadPic', 'loadPicByte', 'matchPicName', 'rgb2bgr',
  'setDisplayInput', 'setExcludeRegion', 'setFindPicMultithreadCount',
  'setFindPicMultithreadLimit', 'setImage', 'setPath', 'setSimdEnabled',
  'useScreen',
])

const colorMatchNames = new Set(['findColor', 'findColorE', 'findColorEx'])
const multiColorMatchNames = new Set([
  'findMultiColor', 'findMultiColorE', 'findMultiColorEx',
])
const pictureNames = new Set([
  'findPic', 'findPicE', 'findPicEx', 'findPicExS', 'findPicMem',
  'findPicMemE', 'findPicMemEx', 'findPicS', 'findPicSim', 'findPicSimE',
  'findPicSimEx', 'findPicSimMem', 'findPicSimMemE', 'findPicSimMemEx',
])
const pictureSimNames = new Set([
  'findPicSim', 'findPicSimE', 'findPicSimEx', 'findPicSimMem',
  'findPicSimMemE', 'findPicSimMemEx',
])
const shapeNames = new Set(['findShape', 'findShapeE', 'findShapeEx'])
const ocrNames = new Set([
  'ocr', 'ocrEx', 'ocrExOne', 'ocrInFile', 'getWords', 'getWordsNoDict',
  'findStr', 'findStrE', 'findStrEx', 'findStrExS', 'findStrFast',
  'findStrFastE', 'findStrFastEx', 'findStrFastExS', 'findStrFastS',
  'findStrS', 'findStrWithFont', 'findStrWithFontE', 'findStrWithFontEx',
])
const resultParserNames = new Set([
  'getResultCount', 'getResultPos', 'getWordResultCount',
  'getWordResultPos', 'getWordResultStr',
])

const scanDirections = [
  ['0', '从左到右，从上到下'],
  ['1', '从左到右，从下到上'],
  ['2', '从右到左，从上到下'],
  ['3', '从右到左，从下到上'],
  ['4', '从中心向外'],
  ['5', '从上到下，从左到右'],
  ['6', '从上到下，从右到左'],
  ['7', '从下到上，从左到右'],
  ['8', '从下到上，从右到左'],
]

const directionContracts = {
  findColor: scanDirections,
  findColorE: scanDirections,
  findColorEx: scanDirections.filter(([value]) => value !== '4'),
  findMultiColor: scanDirections.slice(0, 4),
  findMultiColorE: scanDirections.slice(0, 4),
  findMultiColorEx: scanDirections.slice(0, 4),
  ...Object.fromEntries([...pictureNames].map((name) => [name, scanDirections.slice(0, 4)])),
  findShape: scanDirections.slice(0, 4),
  findShapeE: scanDirections.slice(0, 4),
  findShapeEx: scanDirections.slice(0, 4),
}

function anchor(name) {
  return Buffer.from(`dm.${name}`).toString('base64url')
}

function parseJava(entry) {
  const match = entry.java.match(/^(.+?)\s+(\w+)\((.*)\)$/)
  if (!match) return { returnType: 'unknown', params: [] }
  const rawParams = match[3].trim()
  return {
    returnType: match[1],
    params: rawParams
      ? rawParams.split(/,\s*/).map((value) => {
          const parts = value.trim().split(/\s+/)
          return { type: parts.slice(0, -1).join(' '), name: parts.at(-1) }
        })
      : [],
  }
}

function isMultiResult(name, returnType) {
  return returnType.includes('[]') || name.endsWith('Ex') || name.endsWith('ExS')
}

function returnDescription(name, returnType) {
  if (name.startsWith('find')) {
    return isMultiResult(name, returnType)
      ? '`DmMatch[]`；未命中或没有记录时为空数组。'
      : '`DmMatch`；未命中时为 `null`。'
  }
  if (name === 'getResultPos' || name === 'getWordResultPos') {
    return '`DmMatch`；索引越界时返回 `null`。'
  }
  if (name === 'ocr' || name === 'ocrInFile') {
    return '`string`；没有识别到文字时为空字符串。'
  }
  if (name === 'getWords' || name === 'getWordsNoDict' ||
      name === 'ocrEx' || name === 'ocrExOne') {
    return '`DmMatch[]`；没有结果时为空数组。'
  }
  if (name === 'ocrAuto') {
    return '`Object[]`；每个 block 包含 `text`、`confidence`、`detectionConfidence` 和 `points`。'
  }
  if (name === 'buffer' || returnType.includes('DmBuffer')) {
    return '`DmBuffer`；调用方负责在 `finally` 中调用 `close()`。'
  }
  if (returnType.includes('List')) {
    return '`DmBuffer[]`；调用方负责释放返回的缓冲区。'
  }
  if (returnType === 'int') {
    return '`number`；成功通常为 `1`，失败为 `0`。'
  }
  if (returnType === 'void') return '`undefined`。'
  return `\`${returnType}\`；失败值遵循 MonkeyKing Android 实现约定。`
}

function parameterDescription(param, name) {
  const { name: paramName, type } = param
  if (/^x[12]?$|^y[12]?$/i.test(paramName)) {
    return '输入图像像素坐标；区域左上角和右下角均为包含边界。'
  }
  if (paramName === 'x' || paramName === 'y') {
    return '输入图像中的像素坐标；必须位于当前输入帧范围内。'
  }
  if (paramName === 'color') {
    if (colorMatchNames.has(name)) return 'RGB 颜色表达式，支持 `RRGGBB-DRDGDB`、`|` 多颜色和 `@` 反色。'
    if (multiColorMatchNames.has(name)) return '首点颜色表达式；支持 RGB 偏色和多颜色条件。'
    if (ocrNames.has(name)) return '文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。'
    return '六位 RGB 颜色表达式，不使用按键精灵的 BGR 顺序。'
  }
  if (paramName === 'offsets') return '多点偏移，格式为 `x|y|颜色`，多个偏移点用逗号分隔。'
  if (paramName === 'shape') return '形状关系，格式为 `x|y|e`，多个关系用逗号分隔。'
  if (paramName === 'delta') return '图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。'
  if (paramName === 'similarity') {
    return pictureSimNames.has(name)
      ? '图片相似率整数，范围 `0–100`。'
      : '相似度，范围 `0.1–1.0`；数值越高越严格。'
  }
  if (paramName === 'direction') return '扫描方向；可用值见本函数的方向表。'
  if (paramName === 'pictures') return '图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。'
  if (/^(file|path|input|output)$/.test(paramName)) return '文件或目录路径；相对路径基于 `setPath()` 或当前工作目录。'
  if (paramName === 'source') return '输入源：`screen` 或 `pic:相对路径`。'
  if (paramName === 'index') return '字库槽位，Android 支持 `0–99`。'
  if (paramName === 'entry') return '明文字库条目，格式为 `HEX$文字$指标$高度`。'
  if (paramName === 'results') return '兼容结果字符串，仅用于结果解析接口。'
  if (paramName === 'text') return '待查找文字或字库文本；多个候选使用 `|` 分隔。'
  if (paramName === 'font') return '字体文件路径或 Android Typeface 名称。'
  if (paramName === 'size') return '字体像素大小；必须为正整数。'
  if (paramName === 'style') return '字体样式位：`1` 粗体、`2` 斜体、`4` 下划线、`8` 删除线，可组合。'
  if (paramName === 'enabled' || paramName === 'keep') return '布尔开关；使用 `0/1` 或 `false/true`。'
  if (paramName === 'quality') return 'JPEG 质量，范围 `0–100`。'
  if (paramName === 'delay' || paramName === 'duration' || paramName === 'timeout') return '非负毫秒数。'
  if (paramName === 'count' || paramName === 'width' || paramName === 'height' || paramName === 'gap') return '非负整数；具体用途由函数名称决定。'
  if (paramName === 'mode') return '排除区域模式编号；使用当前实现支持的模式。'
  if (paramName === 'code') return '排除区域描述字符串；为空表示清除对应配置。'
  if (paramName === 'options') return '通用 OCR 选项对象，例如 `{ maxSideLen: 128, doAngle: false }`。'
  if (paramName === 'bytes' || paramName === 'data' || paramName === 'buffers' || type.includes('ByteBuffer')) {
    return '二进制输入；使用 `DmBuffer`、`byte[]` 或直接 ByteBuffer，不接受裸地址。'
  }
  if (paramName === 'image') return 'ImageWrapper、Bitmap 或 `DmBuffer` 输入。'
  return `按 \`${type}\` 传入；不能传入 Java 内部输出指针类型。`
}

function directionSection(name) {
  const directions = directionContracts[name]
  if (!directions) return ''
  return `#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
${directions.map(([value, description]) => `| \`${value}\` | ${description} |`).join('\n')}
`
}

function colorSection(name) {
  if (colorMatchNames.has(name)) {
    return `#### 颜色、偏色与反色

\`color\` 使用 \`RRGGBB-DRDGDB\`，例如 \`123456-000000|aabbcc-030303|ddeeff-202020\`。竖线分隔多个候选颜色；整个表达式前加 \`@\` 启用反色模式，表示匹配指定颜色之外的颜色，例如 \`@123456-000000|333333-101010\`。该格式使用 RGB 顺序，不是按键精灵的 BGR 顺序。

\`similarity\` 范围为 \`0.1–1.0\`。偏色是单点颜色容差，多颜色是候选条件集合；两者可以同时使用。`
  }
  if (multiColorMatchNames.has(name)) {
    return `#### 多点颜色与偏移

首点 \`color\` 使用 \`RRGGBB-DRDGDB\`；\`offsets\` 使用 \`x|y|颜色\`，多个偏移点用逗号分隔。例如 \`8|0|aabbcc-030303,-4|3|ddeeff-202020\`。偏移点颜色支持多颜色条件，颜色前加 \`-\` 表示反色匹配。

多点找色要求首点和每个偏移点同时满足；这与普通找色中的多颜色候选不是同一概念。`
  }
  if (name === 'findColorBlock' || name === 'findColorBlockEx') {
    return `#### 颜色块参数

\`count\` 是要求满足的颜色像素数量，\`width\` 和 \`height\` 是连通块/密度判断使用的尺寸约束，三者都必须是非负整数。普通接口返回一个 \`DmMatch | null\`，\`Ex\` 接口返回全部 \`DmMatch[]\`；颜色表达式仍支持 RGB 偏色和 \`|\` 多颜色条件。`
  }
  if (shapeNames.has(name)) {
    return `#### 形状关系

\`shape\` 使用 \`x|y|e\` 描述相对点关系，不使用颜色偏色格式；多个关系用逗号分隔。方向仅支持 \`0–3\`，普通接口返回一个 \`DmMatch | null\`，\`Ex\` 接口返回全部结果。`
  }
  if (ocrNames.has(name)) {
    return `#### OCR 颜色格式

支持 RGB \`RRGGBB-DRDGDB\`、HSV \`H.S.V-DH.DS.DV\` 和灰度 \`#40-0\` 格式；多个条件使用 \`|\`。\`b@\` 表示按背景色匹配。只有 \`ocr\` 支持在颜色表达式后追加分隔符，例如 \`ffffff,\\\\n\`。`
  }
  return ''
}

function pictureSection(name) {
  if (!pictureNames.has(name)) return ''
  return `#### 图片偏色与变体

\`delta\` 使用六位 RGB 偏色（例如 \`203040\`），也可使用两位灰度偏色（例如 \`20\`）。普通找图相似度为 \`0.1–1.0\`；\`findPicSim*\` 使用 \`0–100\` 的整数相似率。带 \`Ex\` 返回全部命中，带 \`S\` 将结果值改为图片名，带 \`Mem\` 从 \`DmBuffer\` 或字节数组读取模板。`
}

function textSection(name) {
  if (name === 'ocr') {
    return `#### OCR 颜色和分隔符

支持 RGB、HSV、灰度和 \`b@\` 背景色模式；颜色条件用 \`|\` 分隔。颜色表达式后可以追加分隔符，例如 \`ffffff-202020,\\\\n\`，返回值是拼接后的完整字符串；未识别到文字时返回空字符串。`
  }
  if (name.startsWith('findStr')) {
    return `#### FindStr 返回语义

多个候选文字使用 \`|\` 分隔。普通接口返回首个 \`DmMatch | null\`，\`Ex\` 接口返回全部 \`DmMatch[]\`，\`S\` 接口的 \`value\` 为实际文字，\`Fast\` 只限制候选字形，不改变坐标含义。`
  }
  if (name === 'getWords' || name === 'getWordsNoDict') {
    return `#### 有字库与免字库

${name === 'getWords' ? '该接口使用当前字库把字符分组为词组。' : '该接口不读取点阵字库，直接按图像连通区域返回词组。'} 返回数组中的每个元素包含 \`value\`、\`x\`、\`y\`、\`width\` 和 \`height\`；没有结果时为空数组。`
  }
  if (name === 'ocrEx' || name === 'ocrExOne') {
    return `#### OCR 结构化结果

Android facade 已将 PC 的结果字符串适配为 \`DmMatch[]\`：\`value\` 是文字，\`x/y/width/height\` 是输入图像坐标。无结果返回空数组。`
  }
  if (name === 'ocrInFile') {
    return '#### 文件输入\n\n该接口直接读取图片文件，不会复用屏幕帧；文件路径基于 `setPath()`。'
  }
  if (name === 'ocrAuto') {
    return '#### 通用 OCR\n\n该扩展使用 MonkeyKing 内置 OCR 模型，不依赖 DM 点阵字库；模型不可用或输入无效时抛出错误。'
  }
  if ([
    'setExactOcr', 'enableShareDict', 'setMinColGap', 'setMinRowGap',
    'setColGapNoDict', 'setRowGapNoDict', 'setWordGap', 'setWordGapNoDict',
    'setWordLineHeight', 'setWordLineHeightNoDict',
  ].includes(name)) {
    return '#### 识别参数\n\n该设置在后续识别调用中生效；间距和行高参数必须为非负整数，`setExactOcr` 与 `enableShareDict` 使用 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。'
  }
  if (name === 'setDict' || name === 'setDictMem' || name === 'addDict') {
    return '#### 字库格式\n\n字库使用 UTF-8 或 GB18030 明文条目 `HEX$文字$指标$高度`；Android 不支持加密字库和裸地址。'
  }
  if (resultParserNames.has(name)) {
    return '#### 兼容结果解析\n\n仅对底层兼容结果字符串进行解析；索引从 `0` 开始，越界返回空值或 `null`，不会改变新 API 的自然返回值。'
  }
  return ''
}

function setupFor(name) {
  if (pictureNames.has(name) || ['loadPic', 'loadPicByte', 'getPicSize', 'matchPicName', 'freePic'].includes(name)) {
    return "dm.setPath('./assets/dm')\n"
  }
  if (ocrNames.has(name) && !['getWordsNoDict', 'ocrAuto'].includes(name)) {
    return "dm.setDict(0, './assets/dm/main.dm.txt')\ndm.useDict(0)\n"
  }
  return ''
}

function exampleFor(name, parsed) {
  const region = "const x = 0, y = 0\nconst x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1\n"
  if (name === 'findColor') {
    return `${region}const match = dm.findColor(x1, y1, x2, y2, '123456-000000|aabbcc-030303|ddeeff-202020', 1.0, 0)
if (match) console.log(\`找到: \${match.x}, \${match.y}\`)`
  }
  if (name === 'findMultiColor') {
    return `${region}const match = dm.findMultiColor(x1, y1, x2, y2, '123456-000000', '8|0|aabbcc-030303,-4|3|ddeeff-202020', 1.0, 0)
if (match) console.log(\`基准点: \${match.x}, \${match.y}\`)`
  }
  if (name === 'findPic') {
    return `${setupFor(name)}${region}dm.loadPic('button.png')
const match = dm.findPic(x1, y1, x2, y2, 'button.png', '202020', 0.9, 0)
if (match) console.log(match.x, match.y)`
  }
  if (name === 'findPicMem') {
    return `${region}const template = dm.buffer(files.readBytes('./assets/dm/button.png'))
try {
  const match = dm.findPicMem(x1, y1, x2, y2, template, '202020', 0.9, 0)
  console.log(match)
} finally {
  template.close()
}`
  }
  if (/^findPic(?:Sim)?Mem(?:E|Ex)?$/.test(name)) {
    return `${region}const template = dm.buffer(files.readBytes('./assets/dm/button.png'))
try {
  const result = dm.${name}(x1, y1, x2, y2, template, '202020', ${pictureSimNames.has(name) ? '90' : '0.9'}, 0)
  console.log(result)
} finally {
  template.close()
}`
  }
  if (name === 'loadPicByte') {
    return `const data = files.readBytes('./assets/dm/button.png')
console.log(dm.loadPicByte(data, data.length, 'button.png'))`
  }
  if (name === 'appendPicAddr') {
    return `const source = dm.buffer(files.readBytes('./assets/dm/button.png'))
try {
  const buffers = dm.appendPicAddr([], source, source.size())
  try {
    console.log(buffers.length)
  } finally {
    buffers.forEach(buffer => buffer.close())
  }
} finally {
  source.close()
}`
  }
  if (name === 'getScreenData' || name === 'getScreenDataBmp') {
    return `${region}const frame = dm.${name}(x1, y1, x2, y2)
try {
  console.log(frame.size())
} finally {
  frame.close()
}`
  }
  if (name === 'ocr') {
    return `${setupFor(name)}${region}const text = dm.ocr(x1, y1, x2, y2, 'ffffff-202020,\\\\n', 0.9)
console.log(text || '未识别到文字')`
  }
  if (name === 'findStrFast') {
    return `${setupFor(name)}${region}const hit = dm.findStrFast(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9)
if (hit) console.log(hit.value, hit.x, hit.y)`
  }
  if (name === 'getWordsNoDict') {
    return `${region}const words = dm.getWordsNoDict(x1, y1, x2, y2, 'ffffff-202020')
console.log(words.length ? words : '未识别到词组')`
  }
  if (name === 'ocrInFile') {
    return `dm.setPath('./assets/dm')
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const text = dm.ocrInFile(0, 0, 1079, 1919, 'screen.png', 'ffffff-202020', 0.9)
console.log(text || '文件中没有文字')`
  }
  if (name === 'ocrAuto') {
    return `const blocks = dm.ocrAuto({ maxSideLen: 128, doAngle: false })
for (const block of blocks) console.log(block.text, block.confidence)`
  }
  if (name === 'setDict') {
    return `dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
console.log(dm.getDictCount(0))`
  }
  if (name === 'setDictMem') {
    return `const bytes = files.readBytes('./assets/dm/main.dm.txt')
const dict = dm.buffer(bytes)
try {
  console.log(dm.setDictMem(0, dict, bytes.length))
} finally {
  dict.close()
}`
  }
  if (name === 'fetchWord') {
    return `${region}const glyph = dm.fetchWord(x1, y1, x2, y2, 'ffffff-202020', '确')
if (glyph) {
  dm.addDict(0, glyph)
  dm.useDict(0)
}`
  }
  if (name === 'buffer') {
    return `const bytes = dm.buffer(files.readBytes('./assets/dm/input.bin'))
try {
  console.log(bytes.size())
} finally {
  bytes.close()
}`
  }
  if (name === 'setImage') {
    return `const frame = images.captureScreen()
try {
  dm.setImage(frame)
  console.log(dm.getFrameInfo())
} finally {
  frame.recycle()
}`
  }
  if (name === 'keepScreen') {
    return `dm.keepScreen(true)
try {
  console.log(dm.getFrameInfo())
} finally {
  dm.keepScreen(false)
}`
  }
  if (name === 'useScreen') return 'dm.useScreen()\nconsole.log(dm.getFrameInfo())'
  if (name === 'close') return 'dm.close()'
  if (name === 'cancel') return 'dm.cancel()'
  if (name === 'getFrameInfo') return 'console.log(dm.getFrameInfo())'
  if (name === 'getLastFindTimings') return 'console.log(dm.getLastFindTimings())'
  if (name === 'setSimdEnabled') return 'dm.setSimdEnabled(true)'

  const args = parsed.params.map(({ name: paramName, type }) => {
    if (/^x[12]?$|^y[12]?$/i.test(paramName)) return paramName
    if (paramName === 'x' || paramName === 'y') return '0'
    if (paramName === 'color') return "'ffffff-202020'"
    if (paramName === 'offsets') return "'8|0|aabbcc-030303,-4|3|ddeeff-202020'"
    if (paramName === 'shape') return "'1|0|1'"
    if (paramName === 'delta') return "'202020'"
    if (paramName === 'similarity') return pictureSimNames.has(name) ? '90' : '0.9'
    if (paramName === 'direction') return '0'
    if (paramName === 'pictures') return "'button.png'"
    if (/^(file|path|input|output)$/.test(paramName)) return "'./assets/dm/output.bin'"
    if (paramName === 'source') return "'screen'"
    if (paramName === 'index') return '0'
    if (paramName === 'entry') return "'414243$确$0$16'"
    if (paramName === 'results') return "'确定$10$20|取消$30$20'"
    if (paramName === 'text') return "'确定|取消'"
    if (paramName === 'font') return "'sans-serif'"
    if (paramName === 'size') return '24'
    if (paramName === 'style') return '0'
    if (paramName === 'enabled') return '1'
    if (paramName === 'keep') return 'true'
    if (paramName === 'quality') return '90'
    if (paramName === 'delay') return '100'
    if (paramName === 'duration') return '1000'
    if (paramName === 'timeout') return '1'
    if (paramName === 'count') return '4'
    if (paramName === 'width' || paramName === 'height') return '64'
    if (paramName === 'gap') return '1'
    if (paramName === 'mode') return '0'
    if (paramName === 'code') return "''"
    if (paramName === 'options') return '{ maxSideLen: 128, doAngle: false }'
    if (paramName === 'image') return 'frame'
    if (paramName === 'bytes' || paramName === 'data') return "files.readBytes('./assets/dm/input.bin')"
    if (paramName === 'buffers') return '[]'
    if (paramName === 'length') return '3'
    if (type === 'boolean') return 'true'
    return '0'
  })
  const call = `dm.${name}(${args.join(', ')})`
  const setup = `${setupFor(name)}${parsed.params.some(({ name: p }) => /^(?:x|y|x1|x2|y1|y2)$/i.test(p)) ? region : ''}`
  if (parsed.returnType === 'void') return `${setup}${call}`
  return `${setup}const result = ${call}
console.log(result)`
}

function noteFor(name) {
  const notes = [
    '示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。',
    '坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。',
    '未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。',
  ]
  if (pictureNames.has(name)) notes.push('图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。')
  if (ocrNames.has(name)) notes.push('文字识别依赖当前字库或免字库模式；空结果不是异常。')
  if (name === 'captureGif') notes.push('屏幕输入逐帧采集；`setImage` 或冻结帧会生成静态帧 GIF。')
  if (name === 'ocrInFile') notes.push('文件 OCR 不复用屏幕帧，文件路径必须可读。')
  return notes.join('\n\n')
}

function functionSection(entry) {
  const name = entry.modern
  const parsed = parseJava(entry)
  const signature = `${name}(${parsed.params.map(({ name: param }) => param).join(', ')})`
  const implementation = entry.source?.startsWith('http')
    ? `原始命令：\`${entry.name}\`；参数语义参考[原始分类页](${entry.source})，返回值和 Android 行为以 MonkeyKing 实现为准。`
    : `原始命令：\`${entry.name ?? name}\`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。`
  const params = parsed.params.length
    ? parsed.params.map(({ type, name: param }) =>
        `| \`${param}\` | \`${type}\` | 是 | — | ${parameterDescription({ type, name: param }, name)} |`).join('\n')
    : '| — | — | — | — | 无参数。 |'
  const details = [
    directionSection(name),
    colorSection(name),
    pictureSection(name),
    textSection(name),
  ].filter(Boolean).join('\n')
  return `### dm.${name}

<a id="api-symbol-${anchor(name)}"></a>

#### 签名

\`\`\`js
dm.${signature}
\`\`\`

#### 实现与兼容

${implementation}

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
${params}

${details ? `${details}\n\n` : ''}#### 返回值

${returnDescription(name, parsed.returnType)}

#### 示例

\`\`\`js
${exampleFor(name, parsed)}
\`\`\`

#### 注意事项

${noteFor(name)}
`
}

const allEntries = [...manifestEntries, ...engineEntries]
const imageEntries = allEntries.filter(({ modern }) => imageNames.has(modern))
const textEntries = allEntries.filter(({ modern }) => !imageNames.has(modern))

const header = `# dm 图色与文字识别 API

Monkey King 的 \`dm\` 是 Android 脚本级对象，公开入口统一使用 camelCase。底层大漠命令名只用于兼容分发，不是脚本可调用名称。查找接口使用自然返回值：单个结果为 \`DmMatch | null\`，多结果为 \`DmMatch[]\`；OCR 和文件 OCR 返回字符串或结构化结果。

Android 不支持 PC 私有加密图片、加密字库、裸地址和输出指针。请使用 \`DmBuffer\`、字节数组或直接 ByteBuffer；缓冲区使用完必须调用 \`close()\`。

<a id="api-symbol-bW9kdWxlOmRt"></a>

`

const page = `${header}## 图色导航

${imageEntries.map(functionSection).join('\n')}

## 文字识别导航

${textEntries.map(functionSection).join('\n')}
`

const imagePage = `# dm 图色导航

本页覆盖取色、偏色、多颜色、多点找色、找图、截图、图片缓存、图片尺寸、资源释放、屏幕输入和帧控制。所有示例均使用 camelCase，并按 MonkeyKing Android 的自然返回值编写。

${imageEntries.map(functionSection).join('\n')}
`

const textPage = `# dm 文字识别导航

本页覆盖 OCR、FindStr、无字库识别、结果解析、字库加载与切换、字间距和行高配置。所有示例均使用 camelCase；不使用 PC 输出指针。

${textEntries.map(functionSection).join('\n')}

## 组合示例

\`\`\`js
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const hit = dm.findStrFast(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9)
if (hit == null) console.log('未命中')
const blocks = dm.getWordsNoDict(x1, y1, x2, y2, 'ffffff-202020')
console.log(blocks)
dm.close()
\`\`\`
`

writeFileSync(resolve(root, 'docs/api/media/dm.md'), page.trimEnd() + '\n')
writeFileSync(resolve(root, 'docs/reference/dm/image.md'), imagePage.trimEnd() + '\n')
writeFileSync(resolve(root, 'docs/reference/dm/text.md'), textPage.trimEnd() + '\n')
