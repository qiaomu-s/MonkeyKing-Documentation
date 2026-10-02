# dm 文字识别导航

本页覆盖 OCR、FindStr、无字库识别、结果解析、字库加载与切换、字间距和行高配置。所有示例均使用 camelCase；不使用 PC 输出指针。

### dm.addDict

<a id="api-symbol-ZG0uYWRkRGljdA"></a>

#### 签名

```js
dm.addDict(index, entry)
```

#### 实现与兼容

原始命令：`AddDict`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.adddict/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位，Android 支持 `0–99`。 |
| `entry` | `String` | 是 | — | 明文字库条目，格式为 `HEX$文字$指标$高度`；使用采样或字体生成的有效条目。 |

#### 采样与字形有效性

先选择只包含一个实际字符的区域和正确颜色条件，再采样生成字形。`fetchWord` 在没有前景像素或字形超出支持范围时抛出异常，不是返回空字符串；记录错误并调整采样条件，不能继续导入无效字形。`addDict` 使用有效的 `HEX$文字$指标$高度` 条目；不要用随意拼接的 HEX 代替采样或字体生成。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 将区域缩小到一个实际字符，label 必须与截图中的字符一致。
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
  dm.useDict(0)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.clearDict

<a id="api-symbol-ZG0uY2xlYXJEaWN0"></a>

#### 签名

```js
dm.clearDict(index)
```

#### 实现与兼容

原始命令：`ClearDict`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.cleardict/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位，Android 支持 `0–99`。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 只清空本示例使用的临时槽位，不删除磁盘字库。
dm.clearDict(1)
console.log('清空后的条目数', dm.getDictCount(1))
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.enableShareDict

<a id="api-symbol-ZG0uZW5hYmxlU2hhcmVEaWN0"></a>

#### 签名

```js
dm.enableShareDict(enabled)
```

#### 实现与兼容

原始命令：`EnableShareDict`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.enablesharedict/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `int` | 是 | — | 整数开关；必须使用 `0/1`，不传布尔值。 |

#### 识别参数

该设置在后续识别调用中生效；间距必须为非负整数，行高必须为正整数，`setExactOcr` 与 `enableShareDict` 使用整数 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 同一进程内，相同明文字库内容可共享；不要假定不同进程自动共享字库。
dm.enableShareDict(1)
// 先准备与目标字体、字号和颜色匹配的明文字库。
dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
dm.useDict(0)
console.log(dm.getDictCount(0))
dm.enableShareDict(0)
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.fetchWord

<a id="api-symbol-ZG0uZmV0Y2hXb3Jk"></a>

#### 签名

```js
dm.fetchWord(x1, y1, x2, y2, color, text)
```

#### 实现与兼容

原始命令：`FetchWord`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.fetchword/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |

#### 采样与字形有效性

先选择只包含一个实际字符的区域和正确颜色条件，再采样生成字形。`fetchWord` 在没有前景像素或字形超出支持范围时抛出异常，不是返回空字符串；记录错误并调整采样条件，不能继续导入无效字形。`addDict` 使用有效的 `HEX$文字$指标$高度` 条目；不要用随意拼接的 HEX 代替采样或字体生成。

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 将区域缩小到一个实际字符，label 必须与截图中的字符一致。
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
  dm.useDict(0)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.findStr

<a id="api-symbol-ZG0uZmluZFN0cg"></a>

#### 签名

```js
dm.findStr(x1, y1, x2, y2, text, color, similarity)
```

#### 实现与兼容

原始命令：`FindStr`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findstr/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，其余变体的 `value` 为从 `0` 开始的候选编号。`Fast` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 `ocr` 的行分隔符。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStr(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0)
  console.log(single === null ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 多候选用竖线分隔，不代表跨行拼接。
  const match = dm.findStr(x1, y1, x2, y2, candidates, color, 0.9)
  if (match !== null) {
    console.log('候选文字编号', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.findStrE

<a id="api-symbol-ZG0uZmluZFN0ckU"></a>

#### 签名

```js
dm.findStrE(x1, y1, x2, y2, text, color, similarity)
```

#### 实现与兼容

原始命令：`FindStrE`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findstre/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，其余变体的 `value` 为从 `0` 开始的候选编号。`Fast` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 `ocr` 的行分隔符。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrE(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0)
  console.log(single === null ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 多候选用竖线分隔，不代表跨行拼接。
  const match = dm.findStrE(x1, y1, x2, y2, candidates, color, 0.9)
  if (match !== null) {
    console.log('候选文字编号', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.findStrEx

<a id="api-symbol-ZG0uZmluZFN0ckV4"></a>

#### 签名

```js
dm.findStrEx(x1, y1, x2, y2, text, color, similarity)
```

#### 实现与兼容

原始命令：`FindStrEx`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findstrex/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，其余变体的 `value` 为从 `0` 开始的候选编号。`Fast` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 `ocr` 的行分隔符。

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrEx(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0)
  console.log(single.length === 0 ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 多候选用竖线分隔，不代表跨行拼接。
  const matches = dm.findStrEx(x1, y1, x2, y2, candidates, color, 0.9)
  if (matches.length === 0) console.log('未命中')
  for (const match of matches) {
    console.log('候选文字编号', match.value, '坐标', match.x, match.y)
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.findStrExS

<a id="api-symbol-ZG0uZmluZFN0ckV4Uw"></a>

#### 签名

```js
dm.findStrExS(x1, y1, x2, y2, text, color, similarity)
```

#### 实现与兼容

原始命令：`FindStrExS`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findstrexs/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，其余变体的 `value` 为从 `0` 开始的候选编号。`Fast` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 `ocr` 的行分隔符。

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrExS(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0)
  console.log(single.length === 0 ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 多候选用竖线分隔，不代表跨行拼接。
  const matches = dm.findStrExS(x1, y1, x2, y2, candidates, color, 0.9)
  if (matches.length === 0) console.log('未命中')
  for (const match of matches) {
    console.log('命中文字', match.value, '坐标', match.x, match.y)
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.findStrFast

<a id="api-symbol-ZG0uZmluZFN0ckZhc3Q"></a>

#### 签名

```js
dm.findStrFast(x1, y1, x2, y2, text, color, similarity)
```

#### 实现与兼容

原始命令：`FindStrFast`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findstrfast/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，其余变体的 `value` 为从 `0` 开始的候选编号。`Fast` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 `ocr` 的行分隔符。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrFast(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0)
  console.log(single === null ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 多候选用竖线分隔，不代表跨行拼接。
  const match = dm.findStrFast(x1, y1, x2, y2, candidates, color, 0.9)
  if (match !== null) {
    console.log('候选文字编号', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.findStrFastE

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RF"></a>

#### 签名

```js
dm.findStrFastE(x1, y1, x2, y2, text, color, similarity)
```

#### 实现与兼容

原始命令：`FindStrFastE`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findstrfaste/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，其余变体的 `value` 为从 `0` 开始的候选编号。`Fast` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 `ocr` 的行分隔符。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrFastE(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0)
  console.log(single === null ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 多候选用竖线分隔，不代表跨行拼接。
  const match = dm.findStrFastE(x1, y1, x2, y2, candidates, color, 0.9)
  if (match !== null) {
    console.log('候选文字编号', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.findStrFastEx

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RFeA"></a>

#### 签名

```js
dm.findStrFastEx(x1, y1, x2, y2, text, color, similarity)
```

#### 实现与兼容

原始命令：`FindStrFastEx`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findstrfastex/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，其余变体的 `value` 为从 `0` 开始的候选编号。`Fast` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 `ocr` 的行分隔符。

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrFastEx(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0)
  console.log(single.length === 0 ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 多候选用竖线分隔，不代表跨行拼接。
  const matches = dm.findStrFastEx(x1, y1, x2, y2, candidates, color, 0.9)
  if (matches.length === 0) console.log('未命中')
  for (const match of matches) {
    console.log('候选文字编号', match.value, '坐标', match.x, match.y)
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.findStrFastExS

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RFeFM"></a>

#### 签名

```js
dm.findStrFastExS(x1, y1, x2, y2, text, color, similarity)
```

#### 实现与兼容

原始命令：`FindStrFastExS`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.FindStrFastExS/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，其余变体的 `value` 为从 `0` 开始的候选编号。`Fast` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 `ocr` 的行分隔符。

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrFastExS(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0)
  console.log(single.length === 0 ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 多候选用竖线分隔，不代表跨行拼接。
  const matches = dm.findStrFastExS(x1, y1, x2, y2, candidates, color, 0.9)
  if (matches.length === 0) console.log('未命中')
  for (const match of matches) {
    console.log('命中文字', match.value, '坐标', match.x, match.y)
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.findStrFastS

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RT"></a>

#### 签名

```js
dm.findStrFastS(x1, y1, x2, y2, text, color, similarity)
```

#### 实现与兼容

原始命令：`FindStrFastS`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findstrfasts/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，其余变体的 `value` 为从 `0` 开始的候选编号。`Fast` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 `ocr` 的行分隔符。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrFastS(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0)
  console.log(single === null ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 多候选用竖线分隔，不代表跨行拼接。
  const match = dm.findStrFastS(x1, y1, x2, y2, candidates, color, 0.9)
  if (match !== null) {
    console.log('命中文字', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.findStrS

<a id="api-symbol-ZG0uZmluZFN0clM"></a>

#### 签名

```js
dm.findStrS(x1, y1, x2, y2, text, color, similarity)
```

#### 实现与兼容

原始命令：`FindStrS`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findstrs/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，其余变体的 `value` 为从 `0` 开始的候选编号。`Fast` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 `ocr` 的行分隔符。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrS(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0)
  console.log(single === null ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 多候选用竖线分隔，不代表跨行拼接。
  const match = dm.findStrS(x1, y1, x2, y2, candidates, color, 0.9)
  if (match !== null) {
    console.log('命中文字', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.findStrWithFont

<a id="api-symbol-ZG0uZmluZFN0cldpdGhGb250"></a>

#### 签名

```js
dm.findStrWithFont(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

#### 实现与兼容

原始命令：`FindStrWithFont`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findstrwithfont/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `font` | `String` | 是 | — | 字体文件路径或 Android Typeface 名称。 |
| `size` | `int` | 是 | — | 字体像素大小；必须为正整数。 |
| `style` | `int` | 是 | — | 字体样式位：`1` 粗体、`2` 斜体、`4` 下划线、`8` 删除线，可组合。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，其余变体的 `value` 为从 `0` 开始的候选编号。`Fast` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 `ocr` 的行分隔符。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 系统字体应与画面中的字体和像素字号匹配；此模式无需加载点阵字库。
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrWithFont(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0, 'sans-serif', 24, 0)
  console.log(single === null ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 样式位可以组合：1 | 2 表示粗体加斜体；按目标字体调整。
  const match = dm.findStrWithFont(x1, y1, x2, y2, candidates, color, 0.9, 'sans-serif', 24, 1 | 2)
  if (match !== null) {
    console.log('候选文字编号', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.findStrWithFontE

<a id="api-symbol-ZG0uZmluZFN0cldpdGhGb250RQ"></a>

#### 签名

```js
dm.findStrWithFontE(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

#### 实现与兼容

原始命令：`FindStrWithFontE`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findstrwithfonte/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `font` | `String` | 是 | — | 字体文件路径或 Android Typeface 名称。 |
| `size` | `int` | 是 | — | 字体像素大小；必须为正整数。 |
| `style` | `int` | 是 | — | 字体样式位：`1` 粗体、`2` 斜体、`4` 下划线、`8` 删除线，可组合。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，其余变体的 `value` 为从 `0` 开始的候选编号。`Fast` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 `ocr` 的行分隔符。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 系统字体应与画面中的字体和像素字号匹配；此模式无需加载点阵字库。
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrWithFontE(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0, 'sans-serif', 24, 0)
  console.log(single === null ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 样式位可以组合：1 | 2 表示粗体加斜体；按目标字体调整。
  const match = dm.findStrWithFontE(x1, y1, x2, y2, candidates, color, 0.9, 'sans-serif', 24, 1 | 2)
  if (match !== null) {
    console.log('候选文字编号', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.findStrWithFontEx

<a id="api-symbol-ZG0uZmluZFN0cldpdGhGb250RXg"></a>

#### 签名

```js
dm.findStrWithFontEx(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

#### 实现与兼容

原始命令：`FindStrWithFontEx`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findstrwithfontex/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `font` | `String` | 是 | — | 字体文件路径或 Android Typeface 名称。 |
| `size` | `int` | 是 | — | 字体像素大小；必须为正整数。 |
| `style` | `int` | 是 | — | 字体样式位：`1` 粗体、`2` 斜体、`4` 下划线、`8` 删除线，可组合。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，其余变体的 `value` 为从 `0` 开始的候选编号。`Fast` 限制候选字形，不改变坐标含义；非候选字形可能被忽略，不应仅凭快速命中就断言画面文字完全相同。

参考文档中的 PC 行分隔查找示例不直接移植：当前 Android FindStr 使用候选匹配，不将颜色参数中的分隔字符串插入跨行文字。需要拼接多行文本时使用 `ocr` 的行分隔符。

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 系统字体应与画面中的字体和像素字号匹配；此模式无需加载点阵字库。
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrWithFontEx(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0, 'sans-serif', 24, 0)
  console.log(single.length === 0 ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 样式位可以组合：1 | 2 表示粗体加斜体；按目标字体调整。
  const matches = dm.findStrWithFontEx(x1, y1, x2, y2, candidates, color, 0.9, 'sans-serif', 24, 1 | 2)
  if (matches.length === 0) console.log('未命中')
  for (const match of matches) {
    console.log('候选文字编号', match.value, '坐标', match.x, match.y)
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.getDict

<a id="api-symbol-ZG0uZ2V0RGljdA"></a>

#### 签名

```js
dm.getDict(index, entry)
```

#### 实现与兼容

原始命令：`GetDict`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getdict/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位，Android 支持 `0–99`。 |
| `entry` | `int` | 是 | — | 字库内条目索引，从 `0` 开始，须小于 `getDictCount(index)`。 |

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
// 先准备与目标字体、字号和颜色匹配的明文字库。
dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
dm.useDict(0)
const count = dm.getDictCount(0)
console.log('条目数', count)
for (let entry = 0; entry < count; entry++) {
  console.log(entry, dm.getDict(0, entry))
}
// 第二个槽位独立读取；先检查数量，避免用不存在的条目编号。
dm.setDict(1, files.path('./assets/dm/dialog.dm.txt'))
if (dm.getDictCount(1) > 0) console.log(dm.getDict(1, 0))
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.getDictCount

<a id="api-symbol-ZG0uZ2V0RGljdENvdW50"></a>

#### 签名

```js
dm.getDictCount(index)
```

#### 实现与兼容

原始命令：`GetDictCount`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getdictcount/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位，Android 支持 `0–99`。 |

#### 返回值

`number`；符合条件的记录、字形或像素数量，没有时为 `0`。

#### 示例

```js
// 先准备与目标字体、字号和颜色匹配的明文字库。
dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
dm.useDict(0)
const count = dm.getDictCount(0)
console.log('条目数', count)
for (let entry = 0; entry < count; entry++) {
  console.log(entry, dm.getDict(0, entry))
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.getDictInfo

<a id="api-symbol-ZG0uZ2V0RGljdEluZm8"></a>

#### 签名

```js
dm.getDictInfo(text, font, size, style)
```

#### 实现与兼容

原始命令：`GetDictInfo`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getdictinfo/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `\|` 分隔。 |
| `font` | `String` | 是 | — | 字体文件路径或 Android Typeface 名称。 |
| `size` | `int` | 是 | — | 字体像素大小；必须为正整数。 |
| `style` | `int` | 是 | — | 字体样式位：`1` 粗体、`2` 斜体、`4` 下划线、`8` 删除线，可组合。 |

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
// 使用系统字体生成字形，不把随意编写的 HEX 当成有效字库。
const entries = dm.getDictInfo('确定取消', 'sans-serif', 24, 0)
dm.clearDict(1)
for (const entry of entries.split('|')) {
  if (entry !== '') dm.addDict(1, entry)
}
console.log('生成的字形数', dm.getDictCount(1))
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.getNowDict

<a id="api-symbol-ZG0uZ2V0Tm93RGljdA"></a>

#### 签名

```js
dm.getNowDict()
```

#### 实现与兼容

原始命令：`GetNowDict`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getnowdict/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| — | — | — | — | 无参数。 |

#### 返回值

`number`；当前字库槽位编号。

#### 示例

```js
// 先准备与目标字体、字号和颜色匹配的明文字库。
dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
dm.useDict(0)
console.log('当前使用的字库槽位', dm.getNowDict())
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.getResultCount

<a id="api-symbol-ZG0uZ2V0UmVzdWx0Q291bnQ"></a>

#### 签名

```js
dm.getResultCount(results)
```

#### 实现与兼容

原始命令：`GetResultCount`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getresultcount/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `results` | `String` | 是 | — | 兼容结果字符串，仅用于结果解析接口。 |

#### 兼容结果解析

仅对底层兼容结果字符串进行解析；索引从 `0` 开始，越界返回空值或 `null`，不会改变新 API 的自然返回值。

#### 返回值

`number`；符合条件的记录、字形或像素数量，没有时为 `0`。

#### 示例

```js
// 仅用于保存下来的 PC 兼容结果串；现代查找结果数组直接遍历即可。
const results = '10,20|30,40'
const count = dm.getResultCount(results)
for (let index = 0; index < count; index++) {
  const position = dm.getResultPos(results, index)
  if (position !== null) console.log(position.x, position.y)
}
console.log('空串数量', dm.getResultCount(''))
console.log('越界结果', dm.getResultPos(results, count)) // null
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.getResultPos

<a id="api-symbol-ZG0uZ2V0UmVzdWx0UG9z"></a>

#### 签名

```js
dm.getResultPos(results, index)
```

#### 实现与兼容

原始命令：`GetResultPos`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getresultpos/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `results` | `String` | 是 | — | 兼容结果字符串，仅用于结果解析接口。 |
| `index` | `int` | 是 | — | 兼容结果中的记录索引，从 `0` 开始；不是字库槽位。 |

#### 兼容结果解析

仅对底层兼容结果字符串进行解析；索引从 `0` 开始，越界返回空值或 `null`，不会改变新 API 的自然返回值。

#### 返回值

`DmMatch`；索引越界时返回 `null`。

#### 示例

```js
// 仅用于保存下来的 PC 兼容结果串；现代查找结果数组直接遍历即可。
const results = '10,20|30,40'
const count = dm.getResultCount(results)
for (let index = 0; index < count; index++) {
  const position = dm.getResultPos(results, index)
  if (position !== null) console.log(position.x, position.y)
}
console.log('空串数量', dm.getResultCount(''))
console.log('越界结果', dm.getResultPos(results, count)) // null
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.getWordResultCount

<a id="api-symbol-ZG0uZ2V0V29yZFJlc3VsdENvdW50"></a>

#### 签名

```js
dm.getWordResultCount(results)
```

#### 实现与兼容

原始命令：`GetWordResultCount`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getWordresultcount/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `results` | `String` | 是 | — | 兼容结果字符串，仅用于结果解析接口。 |

#### 兼容结果解析

仅对底层兼容结果字符串进行解析；索引从 `0` 开始，越界返回空值或 `null`，不会改变新 API 的自然返回值。

#### 返回值

`number`；符合条件的记录、字形或像素数量，没有时为 `0`。

#### 示例

```js
// 历史词组串，与现代 getWords() 返回的数组不同。
const results = '确定,10,20|取消,30,40'
const count = dm.getWordResultCount(results)
for (let index = 0; index < count; index++) {
  const word = dm.getWordResultStr(results, index)
  const position = dm.getWordResultPos(results, index)
  if (position !== null) console.log(word, position.x, position.y)
}
console.log('空串数量', dm.getWordResultCount(''))
console.log('越界文字', dm.getWordResultStr(results, count)) // 空字符串
console.log('越界位置', dm.getWordResultPos(results, count)) // null
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.getWordResultPos

<a id="api-symbol-ZG0uZ2V0V29yZFJlc3VsdFBvcw"></a>

#### 签名

```js
dm.getWordResultPos(results, index)
```

#### 实现与兼容

原始命令：`GetWordResultPos`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getwordresultpos/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `results` | `String` | 是 | — | 兼容结果字符串，仅用于结果解析接口。 |
| `index` | `int` | 是 | — | 兼容结果中的记录索引，从 `0` 开始；不是字库槽位。 |

#### 兼容结果解析

仅对底层兼容结果字符串进行解析；索引从 `0` 开始，越界返回空值或 `null`，不会改变新 API 的自然返回值。

#### 返回值

`DmMatch`；索引越界时返回 `null`。

#### 示例

```js
// 历史词组串，与现代 getWords() 返回的数组不同。
const results = '确定,10,20|取消,30,40'
const count = dm.getWordResultCount(results)
for (let index = 0; index < count; index++) {
  const word = dm.getWordResultStr(results, index)
  const position = dm.getWordResultPos(results, index)
  if (position !== null) console.log(word, position.x, position.y)
}
console.log('空串数量', dm.getWordResultCount(''))
console.log('越界文字', dm.getWordResultStr(results, count)) // 空字符串
console.log('越界位置', dm.getWordResultPos(results, count)) // null
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.getWordResultStr

<a id="api-symbol-ZG0uZ2V0V29yZFJlc3VsdFN0cg"></a>

#### 签名

```js
dm.getWordResultStr(results, index)
```

#### 实现与兼容

原始命令：`GetWordResultStr`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getwordresultstr/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `results` | `String` | 是 | — | 兼容结果字符串，仅用于结果解析接口。 |
| `index` | `int` | 是 | — | 兼容结果中的记录索引，从 `0` 开始；不是字库槽位。 |

#### 兼容结果解析

仅对底层兼容结果字符串进行解析；索引从 `0` 开始，越界返回空值或 `null`，不会改变新 API 的自然返回值。

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
// 历史词组串，与现代 getWords() 返回的数组不同。
const results = '确定,10,20|取消,30,40'
const count = dm.getWordResultCount(results)
for (let index = 0; index < count; index++) {
  const word = dm.getWordResultStr(results, index)
  const position = dm.getWordResultPos(results, index)
  if (position !== null) console.log(word, position.x, position.y)
}
console.log('空串数量', dm.getWordResultCount(''))
console.log('越界文字', dm.getWordResultStr(results, count)) // 空字符串
console.log('越界位置', dm.getWordResultPos(results, count)) // null
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.getWords

<a id="api-symbol-ZG0uZ2V0V29yZHM"></a>

#### 签名

```js
dm.getWords(x1, y1, x2, y2, color, similarity)
```

#### 实现与兼容

原始命令：`GetWords`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getwords/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### 有字库与免字库

该接口使用当前字库把字符分组为词组。 返回数组中的每个元素包含 `value`、`x`、`y`、`width` 和 `height`；没有结果时为空数组。

#### 返回值

`DmMatch[]`；没有结果时为空数组。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  const words = dm.getWords(x1, y1, x2, y2, 'ffffff-202020', 0.9)
  if (words.length === 0) console.log('未识别到词组')
  for (const word of words) {
    console.log(word.value, word.x, word.y, word.width, word.height)
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.getWordsNoDict

<a id="api-symbol-ZG0uZ2V0V29yZHNOb0RpY3Q"></a>

#### 签名

```js
dm.getWordsNoDict(x1, y1, x2, y2, color)
```

#### 实现与兼容

原始命令：`GetWordsNoDict`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getwordsnodict/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### 有字库与免字库

该接口不读取点阵字库，直接按图像连通区域返回词组。 返回数组中的每个元素包含 `value`、`x`、`y`、`width` 和 `height`；没有结果时为空数组。

#### 返回值

`DmMatch[]`；没有结果时为空数组。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 免字库模式按图像分组，不保证 value 为识别出的文字。
  const words = dm.getWordsNoDict(x1, y1, x2, y2, 'ffffff-202020')
  if (words.length === 0) console.log('未识别到词组')
  for (const word of words) {
    console.log(word.value, word.x, word.y, word.width, word.height)
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.ocr

<a id="api-symbol-ZG0ub2Ny"></a>

#### 签名

```js
dm.ocr(x1, y1, x2, y2, color, similarity)
```

#### 实现与兼容

原始命令：`Ocr`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.ocr/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### OCR 颜色和分隔符

支持 RGB、HSV、灰度和 `b@` 背景色模式；颜色条件用 `|` 分隔。颜色表达式后可以追加行分隔符，例如 JS 表达式 `'ffffff-202020,' + '\n'`；运行时这里的 `\n` 是真正的换行字符。返回值是拼接后的完整字符串；未识别到文字时返回空字符串。

#### 返回值

`string`；没有识别到文字时为空字符串。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 各模式用于不同截图/字库场景；按实际字库采样颜色选择，不要求结果相同。
  const formats = [
    ['RGB 单色', '9f2e3f-000000'],
    ['RGB 偏色', '9f2e3f-030303'],
    ['RGB 多色', '9f2e3f-030303|2d3f2f-000000|3f9e4d-100000'],
    ['HSV 多色', '20.30.40-0.0.0|30.40.50-0.0.0'],
    ['灰度多色', '#40-0|#70-10'],
    ['背景色', 'b@ffffff-000000'],
  ]
  for (const item of formats) {
    const text = dm.ocr(x1, y1, x2, y2, item[1], 1.0)
    console.log(item[0], text || '未识别到文字')
  }
  // 逗号后是行分隔字符串，不是另一种颜色。
  const pipeLines = dm.ocr(x1, y1, x2, y2, '9f2e3f-000000,|', 1.0)
  const newLines = dm.ocr(x1, y1, x2, y2, '9f2e3f-000000,' + '\n', 1.0)
  console.log(pipeLines, newLines)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.ocrEx

<a id="api-symbol-ZG0ub2NyRXg"></a>

#### 签名

```js
dm.ocrEx(x1, y1, x2, y2, color, similarity)
```

#### 实现与兼容

原始命令：`OcrEx`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.ocrex/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### OCR 结构化结果

Android facade 已将 PC 的结果字符串适配为 `DmMatch[]`：`value` 是文字，`x/y/width/height` 是输入图像坐标。无结果返回空数组。

#### 返回值

`DmMatch[]`；没有结果时为空数组。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  const formats = [
    ['RGB 单色', '9f2e3f-000000'],
    ['RGB 偏色', '9f2e3f-030303'],
    ['RGB 多色', '9f2e3f-030303|2d3f2f-000000|3f9e4d-100000'],
    ['HSV 多色', '20.30.40-0.0.0|30.40.50-0.0.0'],
    ['灰度多色', '#40-0|#70-10'],
    ['背景色', 'b@ffffff-000000'],
  ]
  for (const item of formats) {
    // Android 返回结构化数组，不使用 split 解析 PC 结果串。
    console.log(item[0])
    const matches = dm.ocrEx(x1, y1, x2, y2, item[1], 1.0)
    if (matches.length === 0) console.log('未命中')
    for (const match of matches) {
      console.log('文字', match.value, '坐标', match.x, match.y)
    }
    // 按返回顺序组合整体文字；不自动插入行分隔符。
    console.log('完整文字', matches.map(match => match.value).join(''))
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.ocrExOne

<a id="api-symbol-ZG0ub2NyRXhPbmU"></a>

#### 签名

```js
dm.ocrExOne(x1, y1, x2, y2, color, similarity)
```

#### 实现与兼容

原始命令：`OcrExOne`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.ocrexone/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### OCR 结构化结果

Android facade 已将 PC 的结果字符串适配为 `DmMatch[]`：`value` 是文字，`x/y/width/height` 是输入图像坐标。无结果返回空数组。

#### 返回值

`DmMatch[]`；没有结果时为空数组。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  const formats = [
    ['RGB 单色', '9f2e3f-000000'],
    ['RGB 偏色', '9f2e3f-030303'],
    ['RGB 多色', '9f2e3f-030303|2d3f2f-000000|3f9e4d-100000'],
    ['HSV 多色', '20.30.40-0.0.0|30.40.50-0.0.0'],
    ['灰度多色', '#40-0|#70-10'],
    ['背景色', 'b@ffffff-000000'],
  ]
  for (const item of formats) {
    // Android 返回结构化数组，不使用 split 解析 PC 结果串。
    console.log(item[0])
    const matches = dm.ocrExOne(x1, y1, x2, y2, item[1], 1.0)
    if (matches.length === 0) console.log('未命中')
    for (const match of matches) {
      console.log('文字', match.value, '坐标', match.x, match.y)
    }
    // 按返回顺序组合整体文字；不自动插入行分隔符。
    console.log('完整文字', matches.map(match => match.value).join(''))
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

文字识别依赖当前字库或免字库模式；空结果不是异常。

### dm.ocrInFile

<a id="api-symbol-ZG0ub2NySW5GaWxl"></a>

#### 签名

```js
dm.ocrInFile(x1, y1, x2, y2, pictures, color, similarity)
```

#### 实现与兼容

原始命令：`OcrInFile`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.ocrinfile/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `String` | 是 | — | 单个可读图片文件路径；相对路径基于 `setPath()`。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`\|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。拼接文本时可在 `ocr` 的颜色表达式后追加行分隔符，例如 JS 表达式 `'ffffff,' + '\n'`；传入真正的换行字符，不要传入反斜杠加字母 n。
#### 文件输入

该接口直接读取图片文件，不会复用屏幕帧；文件路径基于 `setPath()`。

#### 返回值

`string`；没有识别到文字时为空字符串。

#### 示例

```js
// 先准备与目标字体、字号和颜色匹配的明文字库。
dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
dm.useDict(0)
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
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

文字识别依赖当前字库或免字库模式；空结果不是异常。

文件 OCR 不复用屏幕帧，文件路径必须可读。

### dm.saveDict

<a id="api-symbol-ZG0uc2F2ZURpY3Q"></a>

#### 签名

```js
dm.saveDict(index, file)
```

#### 实现与兼容

原始命令：`SaveDict`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.savedict/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位，Android 支持 `0–99`。 |
| `file` | `String` | 是 | — | 文件或目录路径；相对路径基于 `setPath()` 或当前工作目录。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 在临时槽位生成并追加三个真实字形，再持久化，不手写虚假的 HEX。
dm.clearDict(1)
const entries = dm.getDictInfo('确认好', 'sans-serif', 24, 0)
for (const entry of entries.split('|')) {
  if (entry !== '') dm.addDict(1, entry)
}
const output = files.path('./output/export.dm.txt')
files.ensureDir(output)
console.log(dm.saveDict(1, output) === 1 ? output : '字库保存失败')
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.setColGapNoDict

<a id="api-symbol-ZG0uc2V0Q29sR2FwTm9EaWN0"></a>

#### 签名

```js
dm.setColGapNoDict(gap)
```

#### 实现与兼容

原始命令：`SetColGapNoDict`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setcolgapnodict/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `gap` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |

#### 识别参数

该设置在后续识别调用中生效；间距必须为非负整数，行高必须为正整数，`setExactOcr` 与 `enableShareDict` 使用整数 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 免字库分组；按实际字间距与行高调整。
  dm.setColGapNoDict(1)
  // 设置作用于后续调用，不会改变已经返回的结果。
  const words = dm.getWordsNoDict(x1, y1, x2, y2, 'ffffff-202020')
  if (words.length === 0) console.log('没有词组')
  for (const word of words) console.log(word.value, word.x, word.y, word.width, word.height)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.setDict

<a id="api-symbol-ZG0uc2V0RGljdA"></a>

#### 签名

```js
dm.setDict(index, file)
```

#### 实现与兼容

原始命令：`SetDict`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setdict/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位，Android 支持 `0–99`。 |
| `file` | `String` | 是 | — | 文件或目录路径；相对路径基于 `setPath()` 或当前工作目录。 |

#### 字库格式

字库使用 UTF-8 或 GB18030 明文条目 `HEX$文字$指标$高度`；Android 不支持加密字库和裸地址。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 先准备与目标字体、字号和颜色匹配的明文字库。
dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
dm.useDict(0)
console.log('字库条目数', dm.getDictCount(0))
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.setDictMem

<a id="api-symbol-ZG0uc2V0RGljdE1lbQ"></a>

#### 签名

```js
dm.setDictMem(index, data, length)
```

#### 实现与兼容

原始命令：`SetDictMem`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setdictmem/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位，Android 支持 `0–99`。 |
| `data` | `Object` | 是 | — | 二进制输入；使用 `DmBuffer`、`byte[]` 或直接 ByteBuffer，不接受裸地址。 |
| `length` | `int` | 是 | — | 按 `int` 传入；不能传入 Java 内部输出指针类型。 |

#### 字库格式

字库使用 UTF-8 或 GB18030 明文条目 `HEX$文字$指标$高度`；Android 不支持加密字库和裸地址。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const bytes = files.readBytes('./assets/dm/main.dm.txt')
const dict = dm.buffer(bytes)
try {
  console.log(dm.setDictMem(0, dict, dict.size()))
  dm.useDict(0)
  console.log('条目数', dm.getDictCount(0))
} finally {
  dict.close()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.setExactOcr

<a id="api-symbol-ZG0uc2V0RXhhY3RPY3I"></a>

#### 签名

```js
dm.setExactOcr(enabled)
```

#### 实现与兼容

原始命令：`SetExactOcr`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setexactocr/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `int` | 是 | — | 整数开关；必须使用 `0/1`，不传布尔值。 |

#### 识别参数

该设置在后续识别调用中生效；间距必须为非负整数，行高必须为正整数，`setExactOcr` 与 `enableShareDict` 使用整数 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  dm.setExactOcr(1)
  // 设置作用于后续调用，不会改变已经返回的结果。
  const words = dm.getWords(x1, y1, x2, y2, 'ffffff-202020', 0.9)
  if (words.length === 0) console.log('没有词组')
  for (const word of words) console.log(word.value, word.x, word.y, word.width, word.height)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.setMinColGap

<a id="api-symbol-ZG0uc2V0TWluQ29sR2Fw"></a>

#### 签名

```js
dm.setMinColGap(gap)
```

#### 实现与兼容

原始命令：`SetMinColGap`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setmincolgap/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `gap` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |

#### 识别参数

该设置在后续识别调用中生效；间距必须为非负整数，行高必须为正整数，`setExactOcr` 与 `enableShareDict` 使用整数 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  dm.setMinColGap(1)
  // 设置作用于后续调用，不会改变已经返回的结果。
  const words = dm.getWords(x1, y1, x2, y2, 'ffffff-202020', 0.9)
  if (words.length === 0) console.log('没有词组')
  for (const word of words) console.log(word.value, word.x, word.y, word.width, word.height)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.setMinRowGap

<a id="api-symbol-ZG0uc2V0TWluUm93R2Fw"></a>

#### 签名

```js
dm.setMinRowGap(gap)
```

#### 实现与兼容

原始命令：`SetMinRowGap`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setminrowgap/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `gap` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |

#### 识别参数

该设置在后续识别调用中生效；间距必须为非负整数，行高必须为正整数，`setExactOcr` 与 `enableShareDict` 使用整数 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  dm.setMinRowGap(2)
  // 设置作用于后续调用，不会改变已经返回的结果。
  const words = dm.getWords(x1, y1, x2, y2, 'ffffff-202020', 0.9)
  if (words.length === 0) console.log('没有词组')
  for (const word of words) console.log(word.value, word.x, word.y, word.width, word.height)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.setRowGapNoDict

<a id="api-symbol-ZG0uc2V0Um93R2FwTm9EaWN0"></a>

#### 签名

```js
dm.setRowGapNoDict(gap)
```

#### 实现与兼容

原始命令：`SetRowGapNoDict`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setrowgapnodict/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `gap` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |

#### 识别参数

该设置在后续识别调用中生效；间距必须为非负整数，行高必须为正整数，`setExactOcr` 与 `enableShareDict` 使用整数 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 免字库分组；按实际字间距与行高调整。
  dm.setRowGapNoDict(2)
  // 设置作用于后续调用，不会改变已经返回的结果。
  const words = dm.getWordsNoDict(x1, y1, x2, y2, 'ffffff-202020')
  if (words.length === 0) console.log('没有词组')
  for (const word of words) console.log(word.value, word.x, word.y, word.width, word.height)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.setWordGap

<a id="api-symbol-ZG0uc2V0V29yZEdhcA"></a>

#### 签名

```js
dm.setWordGap(gap)
```

#### 实现与兼容

原始命令：`SetWordGap`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setwordgap/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `gap` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |

#### 识别参数

该设置在后续识别调用中生效；间距必须为非负整数，行高必须为正整数，`setExactOcr` 与 `enableShareDict` 使用整数 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  dm.setWordGap(3)
  // 设置作用于后续调用，不会改变已经返回的结果。
  const words = dm.getWords(x1, y1, x2, y2, 'ffffff-202020', 0.9)
  if (words.length === 0) console.log('没有词组')
  for (const word of words) console.log(word.value, word.x, word.y, word.width, word.height)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.setWordGapNoDict

<a id="api-symbol-ZG0uc2V0V29yZEdhcE5vRGljdA"></a>

#### 签名

```js
dm.setWordGapNoDict(gap)
```

#### 实现与兼容

原始命令：`SetWordGapNoDict`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setwordgapnodict/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `gap` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |

#### 识别参数

该设置在后续识别调用中生效；间距必须为非负整数，行高必须为正整数，`setExactOcr` 与 `enableShareDict` 使用整数 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 免字库分组；按实际字间距与行高调整。
  dm.setWordGapNoDict(3)
  // 设置作用于后续调用，不会改变已经返回的结果。
  const words = dm.getWordsNoDict(x1, y1, x2, y2, 'ffffff-202020')
  if (words.length === 0) console.log('没有词组')
  for (const word of words) console.log(word.value, word.x, word.y, word.width, word.height)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.setWordLineHeight

<a id="api-symbol-ZG0uc2V0V29yZExpbmVIZWlnaHQ"></a>

#### 签名

```js
dm.setWordLineHeight(height)
```

#### 实现与兼容

原始命令：`SetWordLineHeight`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setwordlineheight/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `height` | `int` | 是 | — | 分组使用的行高，单位为像素；必须为正整数。 |

#### 识别参数

该设置在后续识别调用中生效；间距必须为非负整数，行高必须为正整数，`setExactOcr` 与 `enableShareDict` 使用整数 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  dm.setWordLineHeight(24)
  // 设置作用于后续调用，不会改变已经返回的结果。
  const words = dm.getWords(x1, y1, x2, y2, 'ffffff-202020', 0.9)
  if (words.length === 0) console.log('没有词组')
  for (const word of words) console.log(word.value, word.x, word.y, word.width, word.height)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.setWordLineHeightNoDict

<a id="api-symbol-ZG0uc2V0V29yZExpbmVIZWlnaHROb0RpY3Q"></a>

#### 签名

```js
dm.setWordLineHeightNoDict(height)
```

#### 实现与兼容

原始命令：`SetWordLineHeightNoDict`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setwordlineheightnodict/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `height` | `int` | 是 | — | 分组使用的行高，单位为像素；必须为正整数。 |

#### 识别参数

该设置在后续识别调用中生效；间距必须为非负整数，行高必须为正整数，`setExactOcr` 与 `enableShareDict` 使用整数 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 免字库分组；按实际字间距与行高调整。
  dm.setWordLineHeightNoDict(24)
  // 设置作用于后续调用，不会改变已经返回的结果。
  const words = dm.getWordsNoDict(x1, y1, x2, y2, 'ffffff-202020')
  if (words.length === 0) console.log('没有词组')
  for (const word of words) console.log(word.value, word.x, word.y, word.width, word.height)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.useDict

<a id="api-symbol-ZG0udXNlRGljdA"></a>

#### 签名

```js
dm.useDict(index)
```

#### 实现与兼容

原始命令：`UseDict`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.usedict/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位，Android 支持 `0–99`。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 两份字库分别适配不同界面的字体；初始化一次，切换时无需重新加载。
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
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.ocrAuto

<a id="api-symbol-ZG0ub2NyQXV0bw"></a>

#### 签名

```js
dm.ocrAuto(options)
```

#### 实现与兼容

原始命令：`ocrAuto`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `options` | `Map` | 是 | — | 通用 OCR 选项对象，例如 `{ maxSideLen: 128, doAngle: false }`。 |

#### 通用 OCR

该扩展使用 MonkeyKing 内置 OCR 模型，不依赖 DM 点阵字库；模型不可用或输入无效时抛出错误。

#### 返回值

`Object[]`；每个 block 包含 `text`、`confidence`、`detectionConfidence` 和 `points`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 不依赖点阵字库，需要可用的内置 OCR 模型。
  const blocks = dm.ocrAuto({ maxSideLen: 960, doAngle: false })
  if (blocks.length === 0) console.log('未识别到文字')
  for (const block of blocks) {
    console.log(block.text, block.confidence, block.detectionConfidence)
    for (const point of block.points) console.log(point.x, point.y)
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。


## 组合示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrFast(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0)
  console.log(single === null ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 多候选用竖线分隔，不代表跨行拼接。
  const match = dm.findStrFast(x1, y1, x2, y2, candidates, color, 0.9)
  if (match !== null) {
    console.log('候选文字编号', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```
