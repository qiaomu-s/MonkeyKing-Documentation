import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getDmExample, validateDmExamples } from './dm-examples.mjs'

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
  if (name === 'findMulColor') return '`number`；全部候选颜色均存在时为 `1`，否则为 `0`；不返回坐标。'
  if (name === 'cmpColor') return '`number`；颜色匹配时为 `0`，不匹配时为 `1`。'
  if (name === 'isDisplayDead') return '`number`；在指定秒数内区域保持不变时为 `1`，发生变化时为 `0`。静止画面不一定表示应用故障。'
  if (['getResultCount', 'getWordResultCount', 'getDictCount', 'getColorNum'].includes(name)) {
    return '`number`；符合条件的记录、字形或像素数量，没有时为 `0`。'
  }
  if (name === 'getNowDict') return '`number`；当前字库槽位编号。'
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
  if (name === 'buffer' || returnType === 'DmBuffer') {
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
    if (ocrNames.has(name) || name === 'fetchWord') return '文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。'
    return '六位 RGB 颜色表达式，不使用按键精灵的 BGR 顺序。'
  }
  if (paramName === 'offsets') return '多点偏移，格式为 `x|y|颜色`，多个偏移点用逗号分隔。'
  if (paramName === 'shape') return '形状关系，格式为 `x|y|e`；x/y 是相对基准点的偏移，e=1 要求颜色相似，e=0 要求不相似；多个关系用逗号分隔。'
  if (paramName === 'delta') return '图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。'
  if (paramName === 'similarity') {
    return pictureSimNames.has(name)
      ? '图片相似率整数，范围 `0–100`。'
      : '相似度，范围 `0.1–1.0`；数值越高越严格。'
  }
  if (paramName === 'direction') return '扫描方向；可用值见本函数的方向表。'
  if (paramName === 'pictures') {
    if (name.includes('Mem')) return '编码图片的 `DmBuffer` 或字节数组；多个模板使用数组，不接受裸地址。'
    if (name === 'ocrInFile' || name === 'getPicSize') return '单个可读图片文件路径；相对路径基于 `setPath()`。'
    if (name === 'loadPicByte') return '内存图片的缓存名称；后续找图用此名称引用，不需要同名磁盘文件。'
    if (name === 'matchPicName') return '文件名通配模式，例如 `*.png`；匹配结果是以竖线分隔的文件路径。'
    return '图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。'
  }
  if (/^(file|path|input|output)$/.test(paramName)) return '文件或目录路径；相对路径基于 `setPath()` 或当前工作目录。'
  if (paramName === 'source') return '输入源：`screen` 或 `pic:相对路径`。'
  if (paramName === 'index') return resultParserNames.has(name)
    ? '兼容结果中的记录索引，从 `0` 开始；不是字库槽位。'
    : '字库槽位，Android 支持 `0–99`。'
  if (paramName === 'entry') return name === 'getDict'
    ? '字库内条目索引，从 `0` 开始，须小于 `getDictCount(index)`。'
    : '明文字库条目，格式为 `HEX$文字$指标$高度`；使用采样或字体生成的有效条目。'
  if (paramName === 'results') return '兼容结果字符串，仅用于结果解析接口。'
  if (paramName === 'text') return '待查找文字或字库文本；多个候选使用 `|` 分隔。'
  if (paramName === 'font') return '字体文件路径或 Android Typeface 名称。'
  if (paramName === 'size') return '字体像素大小；必须为正整数。'
  if (paramName === 'style') return '字体样式位：`1` 粗体、`2` 斜体、`4` 下划线、`8` 删除线，可组合。'
  if (paramName === 'enabled' || paramName === 'keep') return type === 'boolean'
    ? '布尔开关；必须使用 `false/true`，不传数值。'
    : '整数开关；必须使用 `0/1`，不传布尔值。'
  if (paramName === 'quality') return 'JPEG 质量，范围 `0–100`。'
  if (paramName === 'timeout') return '非负秒数；连续观察区域是否保持不变。'
  if (paramName === 'delay' || paramName === 'duration') return '非负毫秒数。'
  if (paramName === 'count' && name === 'setFindPicMultithreadCount') return '启用并行找图的模板数量门槛；至少为 `1`。'
  if (paramName === 'count' && name === 'setFindPicMultithreadLimit') return '并行线程数量上限；至少为 `1`。'
  if ((name === 'findColorBlock' || name === 'findColorBlockEx') && ['count', 'width', 'height'].includes(paramName)) {
    return paramName === 'count' ? '块内匹配像素数的下限，范围 `0–width*height`。' : '滑动矩形块的像素尺寸；必须为正整数。'
  }
  if (paramName === 'height') return '分组使用的行高，单位为像素；必须为正整数。'
  if (paramName === 'count' || paramName === 'width' || paramName === 'gap') return '非负整数；具体用途由函数名称决定。'
  if (paramName === 'mode') return '`0` 追加排除矩形，`1` 设置填充色，`2` 清空排除矩形。'
  if (paramName === 'code') return '模式 `0` 使用 `x1,y1,x2,y2|...`；模式 `1` 使用六位 RGB 颜色；模式 `2` 使用空字符串。'
  if (paramName === 'options') return '通用 OCR 选项对象，例如 `{ maxSideLen: 128, doAngle: false }`。'
  if (paramName === 'buffers') return '已有托管模板数组；首次使用空数组 `[]`，后续传入上次 appendPicAddr 返回的数组。'
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

\`count\` 是滑动矩形块内要求匹配的颜色像素数量下限；\`width\` 和 \`height\` 是正整数尺寸，\`count\` 必须位于 \`0–width*height\`。这不是连通区域检测。普通接口返回一个 \`DmMatch | null\`，\`Ex\` 接口返回全部 \`DmMatch[]\`；颜色表达式仍支持 RGB 偏色和 \`|\` 多颜色条件。`
  }
  if (shapeNames.has(name)) {
    return `#### 形状关系

\`shape\` 使用 \`x|y|e\` 描述相对点关系，不使用颜色偏色格式；多个关系用逗号分隔。返回坐标是基准点，\`x/y\` 是相对基准点的像素偏移，可以为负数。\`e=1\` 要求该点颜色与基准点相似，\`e=0\` 要求不相似；不是固定的黑白或前景/背景编号。相似度为 \`1.0\` 时要求对应关系严格成立，降低相似度会扩大颜色相似容差。

所有偏移点必须落在查找区域内；靠近边缘而容纳不下完整形状的基准点不会命中。示例使用九个采样点，同时约束相似和不相似位置，需要按实际目标截图重新采样，不能保证匹配任意屏幕。

MonkeyKing 方向仅支持 \`0–3\`；参考页面列出的 \`0–8\` 不适用于本 Android 接口。普通接口和 \`E\` 接口都返回 \`DmMatch | null\`，不解析 PC 坐标串；\`Ex\` 接口返回全部 \`DmMatch[]\`。`
  }
  if (ocrNames.has(name)) {
    return `#### OCR 颜色格式

支持 RGB \`RRGGBB-DRDGDB\`、HSV \`H.S.V-DH.DS.DV\` 和灰度 \`#40-0\` 格式；多个条件使用 \`|\`。\`b@\` 表示按背景色匹配。拼接文本时可在 \`ocr\` 的颜色表达式后追加行分隔符，例如 JS 表达式 \`'ffffff,' + '\\n'\`；传入真正的换行字符，不要传入反斜杠加字母 n。`
  }
  return ''
}

function pictureSection(name) {
  if (!pictureNames.has(name)) return ''
  return `#### 图片偏色与变体

\`delta\` 使用六位 RGB 偏色（例如 \`203040\`），也可使用两位灰度偏色（例如 \`20\`）。普通找图相似度为 \`0.1–1.0\`；\`findPicSim*\` 使用 \`0–100\` 的整数相似率。带 \`Ex\` 返回全部命中，带 \`S\` 将结果值改为图片名，带 \`Mem\` 从 \`DmBuffer\` 或字节数组读取模板。
${pictureSimNames.has(name) ? '\nAndroid `DmMatch` 不提供每次命中的实际相似率字段；输入阈值不是输出分数。参考 PC 示例中的命中分数不能从本接口读取，不应把 `value` 当成分数。\n' : ''}`
}

function textSection(name) {
  if (name === 'fetchWord' || name === 'addDict') {
    return '#### 采样与字形有效性\n\n先选择只包含一个实际字符的区域和正确颜色条件，再采样生成字形。`fetchWord` 在没有前景像素或字形超出支持范围时抛出异常，不是返回空字符串；记录错误并调整采样条件，不能继续导入无效字形。`addDict` 使用有效的 `HEX$文字$指标$高度` 条目；不要用随意拼接的 HEX 代替采样或字体生成。'
  }
  if (name === 'ocr') {
    return `#### OCR 颜色和分隔符

支持 RGB、HSV、灰度和 \`b@\` 背景色模式；颜色条件用 \`|\` 分隔。颜色表达式后可以追加行分隔符，例如 JS 表达式 \`'ffffff-202020,' + '\\n'\`；运行时这里的 \`\\n\` 是真正的换行字符。返回值是拼接后的完整字符串；未识别到文字时返回空字符串。`
  }
  if (name.startsWith('findStr')) {
    return `#### FindStr 返回语义

多个候选文字使用 \`|\` 分隔。普通接口返回首个 \`DmMatch | null\`，\`Ex\` 接口返回全部 \`DmMatch[]\`，\`S\` 接口的 \`value\` 为实际文字，其余变体的 \`value\` 为从 \`0\` 开始的候选编号。\`Fast\` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 \`ocr\` 的行分隔符。`
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
    return '#### 识别参数\n\n该设置在后续识别调用中生效；间距必须为非负整数，行高必须为正整数，`setExactOcr` 与 `enableShareDict` 使用整数 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。'
  }
  if (name === 'setDict' || name === 'setDictMem' || name === 'addDict') {
    return '#### 字库格式\n\n字库使用 UTF-8 或 GB18030 明文条目 `HEX$文字$指标$高度`；Android 不支持加密字库和裸地址。'
  }
  if (resultParserNames.has(name)) {
    return '#### 兼容结果解析\n\n仅对底层兼容结果字符串进行解析；索引从 `0` 开始，越界返回空值或 `null`，不会改变新 API 的自然返回值。'
  }
  return ''
}

function noteFor(name) {
  const notes = [
    '示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。',
    '坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。',
    '未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。',
  ]
  if (pictureNames.has(name)) notes.push('图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。')
  if (pictureNames.has(name) || ['setDict', 'setDictMem', 'useDict', 'ocrInFile'].includes(name)) notes.push('示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。')
  if (ocrNames.has(name)) notes.push('文字识别依赖当前字库或免字库模式；空结果不是异常。')
  if (name === 'captureGif') notes.push('屏幕输入逐帧采集；`setImage` 或冻结帧会生成静态帧 GIF。')
  if (name === 'ocrInFile') notes.push('文件 OCR 不复用屏幕帧，文件路径必须可读。')
  if (name === 'loadPic') notes.push('Android 不直接在 loadPic 中展开通配符；用 matchPicName 获取明确文件列表后再加载。')
  if (name === 'setDisplayInput') notes.push('每次 pic: 输入都会重新解码文件，不依赖找图模板缓存；不需要为刷新输入而清除模板缓存。裸地址 mem: 输入不支持，使用 setImage(DmBuffer) 替代。')
  if (name === 'getScreenData' || name === 'getScreenDataBmp') notes.push('再次调用同一种数据获取方法会关闭它上次返回的缓冲区；请先消费或复制数据，不要保留旧缓冲区供后续调用使用。')
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
        `| \`${param}\` | \`${type}\` | 是 | — | ${parameterDescription({ type, name: param }, name).replaceAll('|', '\\|')} |`).join('\n')
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
${getDmExample(name).code}
\`\`\`

#### 注意事项

${noteFor(name)}
`
}

const allEntries = [...manifestEntries, ...engineEntries]
validateDmExamples(allEntries.map(({ modern }) => modern))
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
${getDmExample('findStrFast').code}
\`\`\`
`

const exampleTopics = [
  ['形状：九点关系与首个命中', 'findShape'],
  ['形状：遍历全部命中', 'findShapeEx'],
  ['图色：多颜色与反色', 'findColor'],
  ['图色：正负偏移与多点条件', 'findMultiColor'],
  ['找图：多模板与命中编号', 'findPicEx'],
  ['找图：内存模板与异常释放', 'findPicMem'],
  ['OCR：颜色模式与行分隔符', 'ocr'],
  ['文字：候选查找', 'findStrFast'],
  ['免字库：词组与包围框', 'getWordsNoDict'],
  ['排除区域：设置、查找与清理', 'setExcludeRegion'],
]
const examplesPage = `# DM Java / JS 示例

> 运行条件：提供 \`dm\` 全局对象的 Monkey King 构建。每个代码块独立运行于普通工作脚本；UI 脚本请使用工作线程。

屏幕示例先申请截图权限，并以当前截图尺寸计算区域。图片模板、明文字库和待识别截图需要自行准备；示例数值用于说明流程，请按目标画面调整。示例仅输出结果，不执行点击或鼠标移动。

\`DmMatch\` / \`DmMatch[]\` 已完成 Android 返回值适配，不需要拆分 PC 结果字符串。脚本中全部 DM 工作结束后才调用 \`dm.close()\`；关闭或取消后不可复用。

${exampleTopics.map(([title, name]) => `## ${title}\n\n\`\`\`js\n${getDmExample(name).code}\n\`\`\``).join('\n\n')}

## Java：DmBuffer 生命周期

Java 调用方传入有效的输入 Bitmap 和模板文件字节。引擎复制输入帧，原始 Bitmap 的生命周期仍由调用方管理；此示例不假定无屏幕提供器的引擎可以自行截图。

\`\`\`java
import android.graphics.Bitmap;
import java.io.File;
import com.monkeyking.dm.Dm;
import com.monkeyking.dm.DmBuffer;
import com.monkeyking.dm.DmMatch;

public final class DmBufferExample {
    private DmBufferExample() {}

    public static DmMatch find(File workDir, Bitmap input, byte[] templateBytes) {
        try (Dm dm = new Dm(workDir)) {
            dm.setImage(input);
            try (DmBuffer template = dm.buffer(templateBytes)) {
                return dm.findPicMem(
                    0, 0, input.getWidth() - 1, input.getHeight() - 1,
                    template, "202020", 0.9, 0
                );
            }
        }
    }
}
\`\`\`

脚本示例不使用 PC 输出指针。读取 \`DmMatch.x\`、\`DmMatch.y\`，或遍历 \`DmMatch[]\`。
`

writeFileSync(resolve(root, 'docs/api/media/dm.md'), page.trimEnd() + '\n')
writeFileSync(resolve(root, 'docs/reference/dm/image.md'), imagePage.trimEnd() + '\n')
writeFileSync(resolve(root, 'docs/reference/dm/text.md'), textPage.trimEnd() + '\n')
writeFileSync(resolve(root, 'docs/reference/dm/examples.md'), examplesPage.trimEnd() + '\n')
