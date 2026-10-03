// Explicit examples are shared by the generated API and reference pages.
const examples = new Map()
const indent = (text) => text.split('\n').map((line) => line ? `  ${line}` : '').join('\n')
const region = 'const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1'
const dict = `// 先准备与目标字体、字号和颜色匹配的明文字库。
dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
dm.useDict(0)`
const picturePath = `// 先准备 button.png 和 cancel.png 两张模板。
dm.setPath(files.path('./assets/dm'))`

function screen(body) {
  return `// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  ${region}
${indent(body)}
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}`
}

function matches(call, multiple = false, label = '结果值') {
  return multiple
    ? `const matches = ${call}
if (matches.length === 0) console.log('未命中')
for (const match of matches) {
  console.log('${label}', match.value, '坐标', match.x, match.y)
}`
    : `const match = ${call}
if (match !== null) {
  console.log('${label}', match.value, '坐标', match.x, match.y)
} else {
  console.log('未命中')
}`
}

function add(name, code, scenarios) {
  if (examples.has(name)) throw new Error(`Duplicate DM example: ${name}`)
  examples.set(name, { code, scenarios })
}

export const shapePattern = '1|1|0,1|6|1,0|10|1,9|10|1,7|6|1,7|8|0,8|9|0,2|2|1,3|1|1'
for (const name of ['findShape', 'findShapeE', 'findShapeEx']) {
  add(name, screen(`// 按目标截图采样后替换形状：偏移相对于返回的基准点，不是绝对坐标。
// e=1 要求颜色与基准点相似，e=0 要求不相似；不是前景/背景颜色编号。
const shape = '${shapePattern}'
const similarity = 1.0
const direction = ${name === 'findShapeEx' ? 1 : 0} // ${name === 'findShapeEx' ? '从左到右，从下到上' : '从左到右，从上到下'}
${matches(`dm.${name}(x1, y1, x2, y2, shape, similarity, direction)`, name.endsWith('Ex'), '形状')}`),
  ['九点相对形状', '相似与不相似关系', '方向选择', '空结果处理', name.endsWith('Ex') ? '多结果遍历' : '首个结果判空'])
}

for (const name of ['findColor', 'findColorE', 'findColorEx']) {
  add(name, screen(`// RGB 顺序；每个候选可有独立偏色。
const color = '123456-000000|aabbcc-030303|ddeeff-202020'
${matches(`dm.${name}(x1, y1, x2, y2, color, 1.0, 0)`, name.endsWith('Ex'))}
// 反色是排除整个候选集合，不是逐通道取补色。
// 反色可能命中几乎所有像素，因此这里只搜索最多 64×64 的小区域。
const inverse = dm.${name}(x1, y1, Math.min(x2, 63), Math.min(y2, 63), '@123456-000000|333333-101010', 1.0, 0)
${name.endsWith('Ex') ? "console.log('反色命中数', inverse.length)" : "console.log(inverse === null ? '没有反色命中' : inverse)"}`),
  ['RGB多颜色偏色', '@反色', '空结果处理', '自然返回值'])
}
for (const name of ['findMultiColor', 'findMultiColorE', 'findMultiColorEx']) {
  add(name, screen(`const color = 'cc805b-020202|606060-010101'
// 正负偏移、多候选和偏移反色可以组合；所有点都必须满足。
const offsets = '9|2|-00ff00|-ff0000,15|2|2dff1c-010101,-6|11|a0d962|aabbcc,11|-4|-ffffff'
${matches(`dm.${name}(x1, y1, x2, y2, color, offsets, 1.0, 1)`, name.endsWith('Ex'), '首点')}`),
  ['首点多颜色', '多个正负偏移', '偏移颜色候选与反色', '自然返回值'])
}
for (const name of ['findColorBlock', 'findColorBlockEx']) {
  add(name, screen(`// 查找指定颜色的密集区域；数量和块尺寸应按实际图像调整。
const color = 'ffffff-101010|eeeeee-080808'
const count = 30, width = 10, height = 8
${matches(`dm.${name}(x1, y1, x2, y2, color, 1.0, count, width, height)`, name.endsWith('Ex'), '颜色块')}`),
  ['多颜色与偏色', '像素数量与块尺寸', '单个或全部结果'])
}
add('findMulColor', screen(`// 检查每一种候选颜色是否都在区域内出现，不返回坐标。
const found = dm.findMulColor(x1, y1, x2, y2, 'ff0000-101010|00ff00-101010|0000ff-101010', 1.0)
console.log(found === 1 ? '全部颜色均存在' : '至少一种颜色不存在')`), ['全部颜色存在性', '整数结果'])

for (const name of [
  'findPic', 'findPicE', 'findPicEx', 'findPicExS', 'findPicS',
  'findPicSim', 'findPicSimE', 'findPicSimEx',
  'findPicMem', 'findPicMemE', 'findPicMemEx',
  'findPicSimMem', 'findPicSimMemE', 'findPicSimMemEx',
]) {
  const memory = name.includes('Mem')
  const sim = name.includes('Sim')
  const all = name.includes('Ex')
  const named = name.endsWith('S')
  const call = `dm.${name}(x1, y1, x2, y2, ${memory ? 'templates' : 'pictures'}, delta, ${sim ? '80' : '0.9'}, 0)`
  const search = `// RGB 偏色；灰度匹配时可改为两位 '20'。
const delta = '202020'
// ${sim ? '80 表示百分比相似率，范围 0–100，不是 0.8。' : '普通相似度范围 0.1–1.0。'}
${matches(call, all, named ? '模板名' : '模板编号')}
// ${named ? 'S 变体的 value 直接为模板名。' : 'value 是 templates/pictures 中从 0 开始的模板编号。'}`
  const body = memory
    ? `// 先准备两张模板；即使第二张加载或查找失败，也释放已创建的缓冲区。
const templates = []
try {
  templates.push(dm.buffer(files.readBytes('./assets/dm/button.png')))
  templates.push(dm.buffer(files.readBytes('./assets/dm/cancel.png')))
${indent(search)}
} finally {
  for (const template of templates) template.close()
}`
    : `${picturePath}
const pictures = 'button.png|cancel.png'
try {
  dm.loadPic(pictures)
${indent(search)}
} finally {
  dm.freePic(pictures)
}`
  add(name, screen(body), ['多模板', 'RGB及灰度偏色', sim ? '整数相似率' : '普通相似度', named ? '模板名' : '模板编号', all ? '遍历全部结果' : '首个结果判空', '资源释放'])
}

const ocrFormats = `const formats = [
  ['RGB 单色', '9f2e3f-000000'],
  ['RGB 偏色', '9f2e3f-030303'],
  ['RGB 多色', '9f2e3f-030303|2d3f2f-000000|3f9e4d-100000'],
  ['HSV 多色', '20.30.40-0.0.0|30.40.50-0.0.0'],
  ['灰度多色', '#40-0|#70-10'],
  ['背景色', 'b@ffffff-000000'],
]`
add('ocr', screen(`${dict}
// 各模式用于不同截图/字库场景；按实际字库采样颜色选择，不要求结果相同。
${ocrFormats}
for (const item of formats) {
  const text = dm.ocr(x1, y1, x2, y2, item[1], 1.0)
  console.log(item[0], text || '未识别到文字')
}
// 逗号后是行分隔字符串，不是另一种颜色。
const pipeLines = dm.ocr(x1, y1, x2, y2, '9f2e3f-000000,|', 1.0)
const newLines = dm.ocr(x1, y1, x2, y2, '9f2e3f-000000,' + '\\n', 1.0)
console.log(pipeLines, newLines)`), ['RGB单色', 'RGB偏色', 'RGB多色', 'HSV多色', '灰度多色', '背景色', '竖线行分隔', '真实换行', '空字符串'])
for (const name of ['ocrEx', 'ocrExOne']) {
  add(name, screen(`${dict}
${ocrFormats}
for (const item of formats) {
  // Android 返回结构化数组，不使用 split 解析 PC 结果串。
  console.log(item[0])
${indent(matches(`dm.${name}(x1, y1, x2, y2, item[1], 1.0)`, true, '文字'))}
  // 按返回顺序组合整体文字；不自动插入行分隔符。
  console.log('完整文字', matches.map(match => match.value).join(''))
}`), ['多种OCR颜色格式', '结构化文字与坐标', '空数组', '逐项遍历', '拼接整体文字'])
}
for (const name of ['getWords', 'getWordsNoDict']) {
  add(name, screen(`${name === 'getWords' ? dict : '// 免字库模式按图像分组，不保证 value 为识别出的文字。'}
const words = dm.${name}(x1, y1, x2, y2, 'ffffff-202020'${name === 'getWords' ? ', 0.9' : ''})
if (words.length === 0) console.log('未识别到词组')
for (const word of words) {
  console.log(word.value, word.x, word.y, word.width, word.height)
}`), ['词组分组', name === 'getWords' ? '字库初始化' : '免字库', '文字与包围框', '空结果'])
}
for (const name of [
  'findStr', 'findStrE', 'findStrEx', 'findStrExS', 'findStrS',
  'findStrFast', 'findStrFastE', 'findStrFastEx', 'findStrFastExS', 'findStrFastS',
  'findStrWithFont', 'findStrWithFontE', 'findStrWithFontEx',
]) {
  const font = name.includes('WithFont')
  const label = name.endsWith('S') ? '命中文字' : '候选文字编号'
  add(name, screen(`${font ? '// 系统字体应与画面中的字体和像素字号匹配；此模式无需加载点阵字库。' : dict}
// 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
const single = dm.${name}(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0${font ? ", 'sans-serif', 24, 0" : ''})
console.log(${name.includes('Ex') ? "single.length === 0 ? '未命中单个候选' : single" : "single === null ? '未命中单个候选' : single"})
const candidates = '确定|取消'
const color = 'ffffff-202020|eeeeee-101010'
${font ? '// 样式位可以组合：1 | 2 表示粗体加斜体；按目标字体调整。' : '// 多候选用竖线分隔，不代表跨行拼接。'}
${matches(`dm.${name}(x1, y1, x2, y2, candidates, color, 0.9${font ? ", 'sans-serif', 24, 1 | 2" : ''})`, name.includes('Ex'), label)}`),
  ['单个与多个候选文字', '颜色偏色', font ? '字体字号及组合样式' : '字库初始化', name.includes('Fast') ? '快速候选查找' : '文字查找', '空结果处理', label])
}

add('ocrInFile', `${dict}
// 文件坐标来自文件本身，不使用 device.width/height。
const file = files.path('./assets/dm/screen.png')
const image = images.read(file)
if (image === null) throw new Error('无法读取图片')
try {
  const text = dm.ocrInFile(0, 0, image.getWidth() - 1, image.getHeight() - 1,
    file, 'ffffff-202020', 0.9)
  console.log(text || '文件中没有文字')
} finally {
  image.recycle()
}`, ['文件输入', '文件实际尺寸', '字库初始化', '空结果', '图像释放'])

for (const [name, ext, extra] of [
  ['capture', 'bmp', ''], ['capturePng', 'png', ''], ['captureJpg', 'jpg', ', 85'],
]) {
  add(name, screen(`const output = files.path('./output/capture.${ext}')
files.ensureDir(output)
const saved = dm.${name}(x1, y1, x2, y2, output${extra})
console.log(saved === 1 ? output : '截图保存失败')`), ['可写输出目录', `${ext}截图`, '保存结果'])
}
add('capturePre', screen(`// 必须先执行图像操作；保存刚刚识别使用的区域，而不是重新截图。
dm.enableDisplayDebug(1)
try {
  dm.findColor(x1, y1, x2, y2, 'ff0000-101010', 1.0, 0)
  const output = files.path('./output/last-search.bmp')
  files.ensureDir(output)
  console.log(dm.capturePre(output))
} finally {
  dm.enableDisplayDebug(0)
}`), ['调试开关', '先执行图像操作', '保存识别区域', '输出目录'])

function liveScreen(body) {
  return `if (!requestScreenCapture()) throw new Error('未取得截图权限')
dm.useScreen()
// 只读取尺寸，不冻结输入；测试期间不要旋转屏幕。
const frame = images.captureScreen()
${region}
frame.recycle()
${body}`
}
add('captureGif', liveScreen(`const output = files.path('./output/animation.gif')
files.ensureDir(output)
// 每 100ms 采一帧，持续 2000ms；setImage/keepScreen 会导致静态帧。
console.log(dm.captureGif(x1, y1, x2, y2, output, 100, 2000))
// 两个时间参数均为 0 时保存单帧 GIF。
const single = files.path('./output/single.gif')
console.log(dm.captureGif(x1, y1, x2, y2, single, 0, 0))`), ['实时屏幕', '帧间隔与总时长', '单帧GIF', '输出目录', '避免冻结帧'])
add('isDisplayDead', liveScreen(`// timeout 单位是秒；静止画面也会返回 1，不一定意味着应用故障。
const unchanged = dm.isDisplayDead(x1, y1, x2, y2, 2)
console.log(unchanged === 1 ? '区域持续两秒未变化' : '区域发生变化')`), ['实时帧比较', '秒级超时', '静止不等于故障'])
add('imageToBmp', `// 先准备三种格式的图片；GIF 转换只处理解码得到的一帧。
for (const extension of ['png', 'jpg', 'gif']) {
  const input = files.path('./assets/dm/input.' + extension)
  const output = files.path('./output/from-' + extension + '.bmp')
  files.ensureDir(output)
  console.log(dm.imageToBmp(input, output) === 1 ? output : '转换失败')
}`, ['PNG转换', 'JPEG转换', 'GIF单帧转换', '输入输出路径'])
for (const name of ['bgr2rgb', 'rgb2bgr']) {
  add(name, `const input = '123456'
const converted = dm.${name}(input)
console.log(converted) // 563412；只交换红蓝通道，不带偏色或 # 前缀。`, ['六位颜色', '红蓝通道转换'])
}
for (const name of ['getColor', 'getColorBGR', 'getColorHSV']) {
  add(name, screen(`const x = Math.floor(x2 / 2), y = Math.floor(y2 / 2)
const color = dm.${name}(x, y)
console.log('中心像素', x, y, color)
const expected = '${name === 'getColor' ? 'ffffff' : name === 'getColorBGR' ? '0000ff' : '0.100.100'}'
console.log(color.toLowerCase() === expected ? '与目标颜色相等' : '与目标颜色不同')`), ['单点取色', '当前帧中心坐标', '颜色文本比较', name])
}
for (const name of ['getAveRGB', 'getAveHSV']) {
  add(name, screen(`// 统计输入帧中心小区域，而非把整个屏幕混成一个平均色。
const left = Math.floor(x2 / 3), top = Math.floor(y2 / 3)
console.log(dm.${name}(left, top, Math.min(x2, left + 30), Math.min(y2, top + 30)))`), ['区域平均颜色', '区域边界'])
}
add('cmpColor', screen(`const x = Math.floor(x2 / 2), y = Math.floor(y2 / 2)
const result = dm.cmpColor(x, y, 'ffffff-000000|eeeeee-202020', 1.0)
console.log(result === 0 ? '颜色匹配' : '颜色不匹配') // 注意：0 才是匹配。`), ['单点偏色比较', '0表示匹配'])
add('getColorNum', screen(`const count = dm.getColorNum(x1, y1, x2, y2, 'ffffff-202020|eeeeee-101010|dddddd-080808', 1.0)
console.log('符合条件的像素数', count)`), ['颜色候选', '像素计数'])

for (const name of ['getScreenData', 'getScreenDataBmp']) {
  add(name, screen(`const data = dm.${name}(x1, y1, x2, y2)
try {
  console.log('字节数', data.size())
  // ${name === 'getScreenData' ? '这是原始像素数据，不是可直接解码的图片文件。' : '这是含 BMP 文件头的数据，可用于内存图片接口。'}
${name === 'getScreenDataBmp' ? `  const output = files.path('./output/frame.bmp')
  files.ensureDir(output)
  files.writeBytes(output, data.bytes())
  console.log('可供图片查看器打开的文件', output)\n` : ''}} finally {
  data.close()
}`), ['图像区域数据', '托管缓冲区', '数据格式', ...(name === 'getScreenDataBmp' ? ['保存BMP字节'] : []), '释放'])
}

add('appendPicAddr', `// 准备三张模板；每次 append 都要保留返回的新集合。
let buffers = []
try {
  for (const file of ['button.png', 'cancel.png', 'confirm.png']) {
    const source = dm.buffer(files.readBytes('./assets/dm/' + file))
    try {
      buffers = dm.appendPicAddr(buffers, source, source.size())
    } finally {
      source.close() // 新增元素是数据副本，不依赖 source 继续存活。
    }
  }
  console.log('模板数', buffers.length)
  // buffers 可直接传给 findPicMem 系列。
} finally {
  // 后一次结果沿用此前元素，因此只统一释放最终集合，不能逐次释放旧集合。
  for (const buffer of buffers) buffer.close()
}`, ['连续追加三个模板', '托管模板列表', '复制数据', '分层释放'])
add('loadPicByte', screen(`const bytes = files.readBytes('./assets/dm/button.png')
const data = dm.buffer(bytes)
try {
  dm.loadPicByte(data, data.size(), 'memory-button.png')
${indent(matches("dm.findPic(x1, y1, x2, y2, 'memory-button.png', '202020', 0.9, 0)", false, '模板编号'))}
} finally {
  try {
    dm.freePic('memory-button.png')
  } finally {
    data.close()
  }
}`), ['内存数据加载', '缓存别名查找', '释放缓存与缓冲区'])
for (const name of ['loadPic', 'freePic']) {
  add(name, screen(`${picturePath}
// loadPic 不直接展开通配符；先用 matchPicName 展开，再加入明确文件名。
const expanded = dm.matchPicName('button*.png')
const pictures = expanded ? expanded + '|cancel.png' : 'cancel.png'
try {
  dm.loadPic(pictures)
${indent(matches("dm.findPic(x1, y1, x2, y2, pictures, '202020', 0.9, 0)", false, '模板编号'))}
} finally {
  // 多模板任务完成后释放对应缓存，不删除磁盘文件。
  dm.freePic(pictures)
}`), ['通配符展开', '加载多个模板', '查找缓存图片', '释放缓存'])
}
add('getPicSize', `${picturePath}
try {
  const size = dm.getPicSize('button.png').split(',')
  console.log('宽度', Number(size[0]), '高度', Number(size[1]))
} finally {
  dm.freePic('button.png')
}`, ['尺寸字符串解析', '清理自动加载的模板'])
add('matchPicName', `${picturePath}
const pictures = dm.matchPicName('*.png')
if (pictures === '') console.log('没有匹配的文件')
else for (const file of pictures.split('|')) console.log(file)`, ['文件通配符', '空列表', '遍历路径'])

add('setExcludeRegion', screen(`// 小坐标示范；所有矩形都必须适合实际输入尺寸。
if (x2 < 100 || y2 < 100) throw new Error('本示例需要至少 101×101 的输入')
dm.setExcludeRegion(2, '')
try {
  dm.setExcludeRegion(0, '0,0,20,20|40,40,60,60')
  dm.setExcludeRegion(0, '80,80,100,100')
  dm.setExcludeRegion(1, 'ff11ff')
${indent(matches("dm.findColor(x1, y1, x2, y2, '00ff00-101010', 1.0, 0)"))}
} finally {
  dm.setExcludeRegion(2, '')
  dm.setExcludeRegion(1, 'ff00ff')
}`), ['清空', '追加多个矩形', '设置填充色', '识别', '清理配置'])
for (const name of ['enableDisplayDebug', 'enablePicCache']) {
  const body = name === 'enablePicCache'
    ? `${picturePath}
dm.enablePicCache(0) // 文件模板每次重新读取，适用于磁盘模板会更新的场景。
try {
  for (let i = 0; i < 2; i++) {
    console.log(dm.findPic(x1, y1, x2, y2, 'button.png', '202020', 0.9, 0))
  }
} finally {
  dm.freePic('button.png')
  dm.enablePicCache(1)
}`
    : `dm.enableDisplayDebug(1)
try {
  console.log(dm.findColor(x1, y1, x2, y2, 'ff0000-101010', 1.0, 0))
  const output = files.path('./output/debug-find.bmp')
  files.ensureDir(output)
  console.log(dm.capturePre(output))
} finally {
  dm.enableDisplayDebug(0)
}`
  add(name, screen(body), ['开关配置', '后续图色操作', '资源或配置清理'])
}
add('enableGetColorByCapture', liveScreen(`dm.enableGetColorByCapture(1)
console.log('重新采集', dm.getColor(0, 0))
try {
  dm.enableGetColorByCapture(0)
  console.log('复用最近帧', dm.getColor(0, 0))
} finally {
  dm.enableGetColorByCapture(1)
}
console.log('再次采集', dm.getColor(0, 0))`), ['实时屏幕', '开启采集取色', '复用最近帧', '恢复采集'])
for (const name of ['enableFindPicMultithread', 'setFindPicMultithreadCount', 'setFindPicMultithreadLimit']) {
  add(name, screen(`${picturePath}
dm.setFindPicMultithreadCount(2) // 至少两个模板时尝试并行
dm.setFindPicMultithreadLimit(2) // 线程数量上限
try {
  dm.enableFindPicMultithread(0)
  const serial = dm.findPicEx(x1, y1, x2, y2, 'button.png|cancel.png', '202020', 0.9, 0)
  console.log('关闭多线程时的命中数', serial.length)
  dm.enableFindPicMultithread(1)
${indent(matches("dm.findPicEx(x1, y1, x2, y2, 'button.png|cancel.png', '202020', 0.9, 0)", true, '模板编号'))}
} finally {
  dm.freePic('button.png|cancel.png')
  dm.enableFindPicMultithread(0)
}`), ['先关闭再开启并行', '模板数门槛', '线程上限', '多模板任务', '清理'])
}

add('setDict', `${dict}
console.log('字库条目数', dm.getDictCount(0))`, ['初始化一次', '选择槽位', '查看条目数'])
add('useDict', screen(`// 两份字库分别适配不同界面的字体；初始化一次，切换时无需重新加载。
dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
dm.setDict(1, files.path('./assets/dm/dialog.dm.txt'))
dm.useDict(0)
const previous = dm.getNowDict()
try {
  dm.useDict(1)
  console.log('当前槽位', dm.getNowDict())
  const text = dm.ocr(x1, y1, x2, y2, 'ffffff-202020', 0.9)
  console.log(text || '未识别到文字')
} finally {
  dm.useDict(previous)
}`), ['多个字库', '切换槽位', '临时字库OCR', '恢复主字库'])
add('setDictMem', `const bytes = files.readBytes('./assets/dm/main.dm.txt')
const dict = dm.buffer(bytes)
try {
  console.log(dm.setDictMem(0, dict, dict.size()))
  dm.useDict(0)
  console.log('条目数', dm.getDictCount(0))
} finally {
  dict.close()
}`, ['文件字节输入', '托管字库', '选择槽位', '释放'])
for (const name of ['fetchWord', 'addDict']) {
  add(name, screen(`// 将区域缩小到一个实际字符，label 必须与截图中的字符一致。
// 这里演示左上角 16×24 像素，执行前请按目标位置调整。
const right = Math.min(x2, 15), bottom = Math.min(y2, 23)
// 各项是不同画面/字库的采样方案；实际使用时选择与目标画面一致的一项。
const modes = [
  ['RGB 前景', 'ffffff-202020|eeeeee-101010'],
  ['RGB 背景', 'b@000000-101010|101010-080808'],
  ['HSV 背景', 'b@0.0.100-0.0.5'],
  ['HSV 前景', '20.30.40-0.0.0|30.40.50-0.0.0'],
]
for (let index = 0; index < modes.length; index++) {
  const mode = modes[index]
  try {
    const glyph = dm.fetchWord(0, 0, right, bottom, mode[1], '确')
    dm.addDict(index, glyph)
    console.log(mode[0], '已加入字形', dm.getDictCount(index))
  } catch (error) {
    // 无前景像素或字形无效会抛异常，不是返回空字符串。
    console.log(mode[0], '采样失败，请检查区域、颜色及字形尺寸', String(error))
  }
}
dm.useDict(0)`), ['真实字形采样', '单字符区域', 'RGB多色前景', 'RGB背景', 'HSV背景', 'HSV多色前景', '采样异常', '追加并选择字库'])
}
for (const name of ['getDict', 'getDictCount']) {
  add(name, `${dict}
const count = dm.getDictCount(0)
console.log('条目数', count)
for (let entry = 0; entry < count; entry++) {
  console.log(entry, dm.getDict(0, entry))
}${name === 'getDict' ? `
// 第二个槽位独立读取；先检查数量，避免用不存在的条目编号。
dm.setDict(1, files.path('./assets/dm/dialog.dm.txt'))
if (dm.getDictCount(1) > 0) console.log(dm.getDict(1, 0))` : ''}`, ['字库初始化', '数量', '按条目索引遍历', ...(name === 'getDict' ? ['读取另一个槽位'] : [])])
}
add('getNowDict', `${dict}
console.log('当前使用的字库槽位', dm.getNowDict())`, ['选择字库', '读取当前槽位'])
add('getDictInfo', `// 使用系统字体生成字形，不把随意编写的 HEX 当成有效字库。
const entries = dm.getDictInfo('确定取消', 'sans-serif', 24, 0)
dm.clearDict(1)
for (const entry of entries.split('|')) {
  if (entry !== '') dm.addDict(1, entry)
}
console.log('生成的字形数', dm.getDictCount(1))`, ['系统字体', '多个字符', '导入生成条目'])
add('clearDict', `// 只清空本示例使用的临时槽位，不删除磁盘字库。
dm.clearDict(1)
console.log('清空后的条目数', dm.getDictCount(1))`, ['清空指定槽位', '验证数量'])
add('saveDict', `// 在临时槽位生成并追加三个真实字形，再持久化，不手写虚假的 HEX。
dm.clearDict(1)
const entries = dm.getDictInfo('确认好', 'sans-serif', 24, 0)
for (const entry of entries.split('|')) {
  if (entry !== '') dm.addDict(1, entry)
}
const output = files.path('./output/export.dm.txt')
files.ensureDir(output)
console.log(dm.saveDict(1, output) === 1 ? output : '字库保存失败')`, ['追加多个真实字形', '明文字库导出', '可写输出目录'])
add('enableShareDict', `// 同一进程内，相同明文字库内容可共享；不要假定不同进程自动共享字库。
dm.enableShareDict(1)
${dict}
console.log(dm.getDictCount(0))
dm.enableShareDict(0)`, ['共享开关', '初始化', 'Android边界'])

for (const [name, value] of [
  ['setExactOcr', 1], ['setMinColGap', 1], ['setMinRowGap', 2],
  ['setWordGap', 3], ['setWordLineHeight', 24],
  ['setColGapNoDict', 1], ['setRowGapNoDict', 2], ['setWordGapNoDict', 3], ['setWordLineHeightNoDict', 24],
]) {
  const noDict = name.endsWith('NoDict')
  add(name, screen(`${noDict ? '// 免字库分组；按实际字间距与行高调整。' : dict}
dm.${name}(${value})
// 设置作用于后续调用，不会改变已经返回的结果。
const words = dm.${noDict ? 'getWordsNoDict' : 'getWords'}(x1, y1, x2, y2, 'ffffff-202020'${noDict ? '' : ', 0.9'})
if (words.length === 0) console.log('没有词组')
for (const word of words) console.log(word.value, word.x, word.y, word.width, word.height)`),
  ['识别参数设置', noDict ? '免字库分组' : '字库识别', '调用后观察结果'])
}
for (const name of ['getResultCount', 'getResultPos']) {
  add(name, `// 仅用于保存下来的 PC 兼容结果串；现代查找结果数组直接遍历即可。
const results = '10,20|30,40'
const count = dm.getResultCount(results)
for (let index = 0; index < count; index++) {
  const position = dm.getResultPos(results, index)
  if (position !== null) console.log(position.x, position.y)
}
console.log('空串数量', dm.getResultCount(''))
console.log('越界结果', dm.getResultPos(results, count)) // null`, ['兼容坐标串', '结果计数', '遍历坐标', '空串与越界'])
}
for (const name of ['getWordResultCount', 'getWordResultPos', 'getWordResultStr']) {
  add(name, `// 历史词组串，与现代 getWords() 返回的数组不同。
const results = '确定,10,20|取消,30,40'
const count = dm.getWordResultCount(results)
for (let index = 0; index < count; index++) {
  const word = dm.getWordResultStr(results, index)
  const position = dm.getWordResultPos(results, index)
  if (position !== null) console.log(word, position.x, position.y)
}
console.log('空串数量', dm.getWordResultCount(''))
console.log('越界文字', dm.getWordResultStr(results, count)) // 空字符串
console.log('越界位置', dm.getWordResultPos(results, count)) // null`, ['兼容词组串', '计数', '文字与坐标', '空串与越界'])
}

add('setPath', `// 使用绝对目录，避免重复 setPath 时相对路径不断叠加。
dm.setPath(files.path('./assets/dm'))
console.log(dm.matchPicName('*.png'))
// 也可传相对目录，但它相对于当前 DM 基准目录，不是自动相对于脚本目录。
// 先准备 assets/dm/templates 子目录；用完恢复到已知绝对目录。
dm.setPath('templates')
try {
  console.log(dm.matchPicName('*.png'))
} finally {
  dm.setPath(files.path('./assets/dm'))
}`, ['绝对基准目录', '后续相对路径', '相对目录以当前基准解析', '恢复基准目录'])
add('setDisplayInput', `// 文件输入不需要截图权限；坐标按该文件的实际尺寸计算。
const file = files.path('./assets/dm/screen.png')
const frame = images.read(file)
if (frame === null) throw new Error('无法读取图片')
try {
  dm.setPath(files.path('./assets/dm'))
  dm.setDisplayInput('pic:screen.png') // 相对于 DM 基准目录
  console.log('相对文件输入', dm.getColor(0, 0))
  dm.setDisplayInput('pic:' + file)
  ${region}
${indent(matches("dm.findColor(x1, y1, x2, y2, 'ffffff-202020', 1.0, 0)"))}
  // 内存图像使用托管对象，不使用 PC 的 mem:整数地址。
  const data = dm.buffer(files.readBytes(file))
  try {
    dm.setImage(data)
    console.log('托管内存输入', dm.getColor(0, 0))
  } finally {
    data.close()
  }
} finally {
  try {
    dm.setDisplayInput('screen')
  } finally {
    frame.recycle()
  }
}`, ['相对文件输入', '绝对文件输入', '文件实际尺寸', '托管内存输入替代裸地址', '恢复屏幕输入'])
add('setImage', screen(`console.log('输入尺寸', frame.getWidth(), frame.getHeight())
${matches("dm.findShape(x1, y1, x2, y2, '" + shapePattern + "', 1.0, 0)")}`), ['固定输入帧', '实际尺寸', '查找', '恢复与释放'])
add('buffer', `const data = dm.buffer(files.readBytes('./assets/dm/button.png'))
try {
  console.log('模板字节数', data.size())
  // data 可传给内存找图、setImage 或其他接受编码图像的接口。
} finally {
  data.close()
}`, ['托管字节输入', '用途', '释放'])
add('keepScreen', `if (!requestScreenCapture()) throw new Error('未取得截图权限')
dm.useScreen()
dm.keepScreen(true)
try {
  // 两次单点取色读取同一冻结帧。
  console.log(dm.getColor(0, 0), dm.getColor(0, 0))
} finally {
  dm.keepScreen(false)
}`, ['冻结屏幕', '重复读取同一帧', '解冻'])
add('useScreen', `if (!requestScreenCapture()) throw new Error('未取得截图权限')
dm.useScreen() // 解除文件/固定图输入；后续操作重新采集屏幕。
console.log(dm.getColor(0, 0))`, ['恢复屏幕', '触发新采样'])
add('getFrameInfo', screen(`// 可能为 null（例如没有元数据的文件输入），不能无条件读取字段。
const info = dm.getFrameInfo()
console.log(info === null ? '当前帧没有元数据' : info)`), ['先建立输入帧', '元数据判空'])
add('getLastFindTimings', screen(`dm.findColor(x1, y1, x2, y2, 'ff0000-101010', 1.0, 0)
const timings = dm.getLastFindTimings()
console.log(timings.valid ? timings : '没有有效的 DM 原生耗时记录')`), ['先执行查找', '有效性标志', '观察耗时'])
add('setSimdEnabled', screen(`// 同一固定帧对比结果；不要只凭一次耗时判断性能。
dm.setSimdEnabled(false)
try {
  const scalar = dm.findColor(x1, y1, x2, y2, 'ff0000-101010', 1.0, 0)
  dm.setSimdEnabled(true)
  const accelerated = dm.findColor(x1, y1, x2, y2, 'ff0000-101010', 1.0, 0)
  console.log(scalar, accelerated)
} finally {
  dm.setSimdEnabled(true)
}`), ['标量与加速切换', '固定输入结果比较', '恢复默认'])
add('cancel', `// 取消状态不可复位：仅在本脚本不再需要 DM 时执行。
dm.cancel()
dm.close()
// 此后不要再次调用本脚本的 dm 对象。`, ['终止当前引擎', '释放', '不可复用'])
add('close', `// 在本脚本所有 DM 任务完成后释放引擎；不是每次查找后关闭。
try {
  console.log('当前字库槽位', dm.getNowDict())
} finally {
  dm.close()
}
// close 后本脚本的 dm 不再可用。`, ['最终释放', '异常清理', '不可复用'])

export function getDmExample(name) {
  const example = examples.get(name)
  if (!example) throw new Error(`Missing explicit DM example: ${name}`)
  return example
}

export function validateDmExamples(names) {
  const expected = new Set(names)
  for (const name of expected) getDmExample(name)
  for (const name of examples.keys()) {
    if (!expected.has(name)) throw new Error(`Stale DM example: ${name}`)
  }
}
