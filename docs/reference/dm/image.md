# dm 图色导航

本页覆盖取色、偏色、多颜色、多点找色、找图、截图、图片缓存、图片尺寸、资源释放、屏幕输入和帧控制。所有示例均使用 camelCase，并按 MonkeyKing Android 的自然返回值编写。

### dm.appendPicAddr

<a id="api-symbol-ZG0uYXBwZW5kUGljQWRkcg"></a>

#### 签名

```js
dm.appendPicAddr(buffers, data, length)
```

#### 实现与兼容

原始命令：`AppendPicAddr`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.appendpicaddr/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `buffers` | `Object` | 是 | — | 已有托管模板数组；首次使用空数组 `[]`，后续传入上次 appendPicAddr 返回的数组。 |
| `data` | `Object` | 是 | — | 二进制输入；使用 `DmBuffer`、`byte[]` 或直接 ByteBuffer，不接受裸地址。 |
| `length` | `int` | 是 | — | 按 `int` 传入；不能传入 Java 内部输出指针类型。 |

#### 返回值

`DmBuffer[]`；调用方负责释放返回的缓冲区。

#### 示例

```js
// 准备三张模板；每次 append 都要保留返回的新集合。
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
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.bgr2rgb

<a id="api-symbol-ZG0uYmdyMnJnYg"></a>

#### 签名

```js
dm.bgr2rgb(color)
```

#### 实现与兼容

原始命令：`BGR2RGB`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.bgr2rgb/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `color` | `String` | 是 | — | 六位 RGB 颜色表达式，不使用按键精灵的 BGR 顺序。 |

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
const input = '123456'
const converted = dm.bgr2rgb(input)
console.log(converted) // 563412；只交换红蓝通道，不带偏色或 # 前缀。
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.capture

<a id="api-symbol-ZG0uY2FwdHVyZQ"></a>

#### 签名

```js
dm.capture(x1, y1, x2, y2, file)
```

#### 实现与兼容

原始命令：`Capture`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.capture/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `file` | `String` | 是 | — | 文件或目录路径；相对路径基于 `setPath()` 或当前工作目录。 |

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
  const output = files.path('./output/capture.bmp')
  files.ensureDir(output)
  const saved = dm.capture(x1, y1, x2, y2, output)
  console.log(saved === 1 ? output : '截图保存失败')
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

### dm.captureGif

<a id="api-symbol-ZG0uY2FwdHVyZUdpZg"></a>

#### 签名

```js
dm.captureGif(x1, y1, x2, y2, file, delay, duration)
```

#### 实现与兼容

原始命令：`CaptureGif`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.capturegif/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `file` | `String` | 是 | — | 文件或目录路径；相对路径基于 `setPath()` 或当前工作目录。 |
| `delay` | `int` | 是 | — | 非负毫秒数。 |
| `duration` | `int` | 是 | — | 非负毫秒数。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
if (!requestScreenCapture()) throw new Error('未取得截图权限')
dm.useScreen()
// 只读取尺寸，不冻结输入；测试期间不要旋转屏幕。
const frame = images.captureScreen()
const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
frame.recycle()
const output = files.path('./output/animation.gif')
files.ensureDir(output)
// 每 100ms 采一帧，持续 2000ms；setImage/keepScreen 会导致静态帧。
console.log(dm.captureGif(x1, y1, x2, y2, output, 100, 2000))
// 两个时间参数均为 0 时保存单帧 GIF。
const single = files.path('./output/single.gif')
console.log(dm.captureGif(x1, y1, x2, y2, single, 0, 0))
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

屏幕输入逐帧采集；`setImage` 或冻结帧会生成静态帧 GIF。

### dm.captureJpg

<a id="api-symbol-ZG0uY2FwdHVyZUpwZw"></a>

#### 签名

```js
dm.captureJpg(x1, y1, x2, y2, file, quality)
```

#### 实现与兼容

原始命令：`CaptureJpg`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.capturejpg/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `file` | `String` | 是 | — | 文件或目录路径；相对路径基于 `setPath()` 或当前工作目录。 |
| `quality` | `int` | 是 | — | JPEG 质量，范围 `0–100`。 |

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
  const output = files.path('./output/capture.jpg')
  files.ensureDir(output)
  const saved = dm.captureJpg(x1, y1, x2, y2, output, 85)
  console.log(saved === 1 ? output : '截图保存失败')
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

### dm.capturePng

<a id="api-symbol-ZG0uY2FwdHVyZVBuZw"></a>

#### 签名

```js
dm.capturePng(x1, y1, x2, y2, file)
```

#### 实现与兼容

原始命令：`CapturePng`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.capturepng/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `file` | `String` | 是 | — | 文件或目录路径；相对路径基于 `setPath()` 或当前工作目录。 |

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
  const output = files.path('./output/capture.png')
  files.ensureDir(output)
  const saved = dm.capturePng(x1, y1, x2, y2, output)
  console.log(saved === 1 ? output : '截图保存失败')
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

### dm.capturePre

<a id="api-symbol-ZG0uY2FwdHVyZVByZQ"></a>

#### 签名

```js
dm.capturePre(file)
```

#### 实现与兼容

原始命令：`CapturePre`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.capturepre/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `file` | `String` | 是 | — | 文件或目录路径；相对路径基于 `setPath()` 或当前工作目录。 |

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
  // 必须先执行图像操作；保存刚刚识别使用的区域，而不是重新截图。
  dm.enableDisplayDebug(1)
  try {
    dm.findColor(x1, y1, x2, y2, 'ff0000-101010', 1.0, 0)
    const output = files.path('./output/last-search.bmp')
    files.ensureDir(output)
    console.log(dm.capturePre(output))
  } finally {
    dm.enableDisplayDebug(0)
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

### dm.cmpColor

<a id="api-symbol-ZG0uY21wQ29sb3I"></a>

#### 签名

```js
dm.cmpColor(x, y, color, similarity)
```

#### 实现与兼容

原始命令：`CmpColor`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.cmpcolor/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 六位 RGB 颜色表达式，不使用按键精灵的 BGR 顺序。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### 返回值

`number`；颜色匹配时为 `0`，不匹配时为 `1`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  const x = Math.floor(x2 / 2), y = Math.floor(y2 / 2)
  const result = dm.cmpColor(x, y, 'ffffff-000000|eeeeee-202020', 1.0)
  console.log(result === 0 ? '颜色匹配' : '颜色不匹配') // 注意：0 才是匹配。
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

### dm.enableDisplayDebug

<a id="api-symbol-ZG0uZW5hYmxlRGlzcGxheURlYnVn"></a>

#### 签名

```js
dm.enableDisplayDebug(enabled)
```

#### 实现与兼容

原始命令：`EnableDisplayDebug`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.enabledisplaydebug/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `int` | 是 | — | 整数开关；必须使用 `0/1`，不传布尔值。 |

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
  dm.enableDisplayDebug(1)
  try {
    console.log(dm.findColor(x1, y1, x2, y2, 'ff0000-101010', 1.0, 0))
    const output = files.path('./output/debug-find.bmp')
    files.ensureDir(output)
    console.log(dm.capturePre(output))
  } finally {
    dm.enableDisplayDebug(0)
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

### dm.enableFindPicMultithread

<a id="api-symbol-ZG0uZW5hYmxlRmluZFBpY011bHRpdGhyZWFk"></a>

#### 签名

```js
dm.enableFindPicMultithread(enabled)
```

#### 实现与兼容

原始命令：`EnableFindPicMultithread`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.enablefindpicmultithread/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `int` | 是 | — | 整数开关；必须使用 `0/1`，不传布尔值。 |

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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  dm.setFindPicMultithreadCount(2) // 至少两个模板时尝试并行
  dm.setFindPicMultithreadLimit(2) // 线程数量上限
  try {
    dm.enableFindPicMultithread(0)
    const serial = dm.findPicEx(x1, y1, x2, y2, 'button.png|cancel.png', '202020', 0.9, 0)
    console.log('关闭多线程时的命中数', serial.length)
    dm.enableFindPicMultithread(1)
    const matches = dm.findPicEx(x1, y1, x2, y2, 'button.png|cancel.png', '202020', 0.9, 0)
    if (matches.length === 0) console.log('未命中')
    for (const match of matches) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    }
  } finally {
    dm.freePic('button.png|cancel.png')
    dm.enableFindPicMultithread(0)
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

### dm.enableGetColorByCapture

<a id="api-symbol-ZG0uZW5hYmxlR2V0Q29sb3JCeUNhcHR1cmU"></a>

#### 签名

```js
dm.enableGetColorByCapture(enabled)
```

#### 实现与兼容

原始命令：`EnableGetColorByCapture`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.enablegetcoloryycapture/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `int` | 是 | — | 整数开关；必须使用 `0/1`，不传布尔值。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
if (!requestScreenCapture()) throw new Error('未取得截图权限')
dm.useScreen()
// 只读取尺寸，不冻结输入；测试期间不要旋转屏幕。
const frame = images.captureScreen()
const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
frame.recycle()
dm.enableGetColorByCapture(1)
console.log('重新采集', dm.getColor(0, 0))
try {
  dm.enableGetColorByCapture(0)
  console.log('复用最近帧', dm.getColor(0, 0))
} finally {
  dm.enableGetColorByCapture(1)
}
console.log('再次采集', dm.getColor(0, 0))
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.findColor

<a id="api-symbol-ZG0uZmluZENvbG9y"></a>

#### 签名

```js
dm.findColor(x1, y1, x2, y2, color, similarity, direction)
```

#### 实现与兼容

原始命令：`FindColor`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findcolor/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | RGB 颜色表达式，支持 `RRGGBB-DRDGDB`、`\|` 多颜色和 `@` 反色。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |
| `4` | 从中心向外 |
| `5` | 从上到下，从左到右 |
| `6` | 从上到下，从右到左 |
| `7` | 从下到上，从左到右 |
| `8` | 从下到上，从右到左 |

#### 颜色、偏色与反色

`color` 使用 `RRGGBB-DRDGDB`，例如 `123456-000000|aabbcc-030303|ddeeff-202020`。竖线分隔多个候选颜色；整个表达式前加 `@` 启用反色模式，表示匹配指定颜色之外的颜色，例如 `@123456-000000|333333-101010`。该格式使用 RGB 顺序，不是按键精灵的 BGR 顺序。

`similarity` 范围为 `0.1–1.0`。偏色是单点颜色容差，多颜色是候选条件集合；两者可以同时使用。

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
  // RGB 顺序；每个候选可有独立偏色。
  const color = '123456-000000|aabbcc-030303|ddeeff-202020'
  const match = dm.findColor(x1, y1, x2, y2, color, 1.0, 0)
  if (match !== null) {
    console.log('结果值', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
  // 反色是排除整个候选集合，不是逐通道取补色。
  // 反色可能命中几乎所有像素，因此这里只搜索最多 64×64 的小区域。
  const inverse = dm.findColor(x1, y1, Math.min(x2, 63), Math.min(y2, 63), '@123456-000000|333333-101010', 1.0, 0)
  console.log(inverse === null ? '没有反色命中' : inverse)
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

### dm.findColorBlock

<a id="api-symbol-ZG0uZmluZENvbG9yQmxvY2s"></a>

#### 签名

```js
dm.findColorBlock(x1, y1, x2, y2, color, similarity, count, width, height)
```

#### 实现与兼容

原始命令：`FindColorBlock`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findcolorblock/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 六位 RGB 颜色表达式，不使用按键精灵的 BGR 顺序。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `count` | `int` | 是 | — | 块内匹配像素数的下限，范围 `0–width*height`。 |
| `width` | `int` | 是 | — | 滑动矩形块的像素尺寸；必须为正整数。 |
| `height` | `int` | 是 | — | 滑动矩形块的像素尺寸；必须为正整数。 |

#### 颜色块参数

`count` 是滑动矩形块内要求匹配的颜色像素数量下限；`width` 和 `height` 是正整数尺寸，`count` 必须位于 `0–width*height`。这不是连通区域检测。普通接口返回一个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`；颜色表达式仍支持 RGB 偏色和 `|` 多颜色条件。

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
  // 查找指定颜色的密集区域；数量和块尺寸应按实际图像调整。
  const color = 'ffffff-101010|eeeeee-080808'
  const count = 30, width = 10, height = 8
  const match = dm.findColorBlock(x1, y1, x2, y2, color, 1.0, count, width, height)
  if (match !== null) {
    console.log('颜色块', match.value, '坐标', match.x, match.y)
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

### dm.findColorBlockEx

<a id="api-symbol-ZG0uZmluZENvbG9yQmxvY2tFeA"></a>

#### 签名

```js
dm.findColorBlockEx(x1, y1, x2, y2, color, similarity, count, width, height)
```

#### 实现与兼容

原始命令：`FindColorBlockEx`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findcolorblockex/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 六位 RGB 颜色表达式，不使用按键精灵的 BGR 顺序。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `count` | `int` | 是 | — | 块内匹配像素数的下限，范围 `0–width*height`。 |
| `width` | `int` | 是 | — | 滑动矩形块的像素尺寸；必须为正整数。 |
| `height` | `int` | 是 | — | 滑动矩形块的像素尺寸；必须为正整数。 |

#### 颜色块参数

`count` 是滑动矩形块内要求匹配的颜色像素数量下限；`width` 和 `height` 是正整数尺寸，`count` 必须位于 `0–width*height`。这不是连通区域检测。普通接口返回一个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`；颜色表达式仍支持 RGB 偏色和 `|` 多颜色条件。

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
  // 查找指定颜色的密集区域；数量和块尺寸应按实际图像调整。
  const color = 'ffffff-101010|eeeeee-080808'
  const count = 30, width = 10, height = 8
  const matches = dm.findColorBlockEx(x1, y1, x2, y2, color, 1.0, count, width, height)
  if (matches.length === 0) console.log('未命中')
  for (const match of matches) {
    console.log('颜色块', match.value, '坐标', match.x, match.y)
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

### dm.findColorE

<a id="api-symbol-ZG0uZmluZENvbG9yRQ"></a>

#### 签名

```js
dm.findColorE(x1, y1, x2, y2, color, similarity, direction)
```

#### 实现与兼容

原始命令：`FindColorE`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findcolore/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | RGB 颜色表达式，支持 `RRGGBB-DRDGDB`、`\|` 多颜色和 `@` 反色。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |
| `4` | 从中心向外 |
| `5` | 从上到下，从左到右 |
| `6` | 从上到下，从右到左 |
| `7` | 从下到上，从左到右 |
| `8` | 从下到上，从右到左 |

#### 颜色、偏色与反色

`color` 使用 `RRGGBB-DRDGDB`，例如 `123456-000000|aabbcc-030303|ddeeff-202020`。竖线分隔多个候选颜色；整个表达式前加 `@` 启用反色模式，表示匹配指定颜色之外的颜色，例如 `@123456-000000|333333-101010`。该格式使用 RGB 顺序，不是按键精灵的 BGR 顺序。

`similarity` 范围为 `0.1–1.0`。偏色是单点颜色容差，多颜色是候选条件集合；两者可以同时使用。

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
  // RGB 顺序；每个候选可有独立偏色。
  const color = '123456-000000|aabbcc-030303|ddeeff-202020'
  const match = dm.findColorE(x1, y1, x2, y2, color, 1.0, 0)
  if (match !== null) {
    console.log('结果值', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
  // 反色是排除整个候选集合，不是逐通道取补色。
  // 反色可能命中几乎所有像素，因此这里只搜索最多 64×64 的小区域。
  const inverse = dm.findColorE(x1, y1, Math.min(x2, 63), Math.min(y2, 63), '@123456-000000|333333-101010', 1.0, 0)
  console.log(inverse === null ? '没有反色命中' : inverse)
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

### dm.findColorEx

<a id="api-symbol-ZG0uZmluZENvbG9yRXg"></a>

#### 签名

```js
dm.findColorEx(x1, y1, x2, y2, color, similarity, direction)
```

#### 实现与兼容

原始命令：`FindColorEx`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findcolorex/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | RGB 颜色表达式，支持 `RRGGBB-DRDGDB`、`\|` 多颜色和 `@` 反色。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |
| `5` | 从上到下，从左到右 |
| `6` | 从上到下，从右到左 |
| `7` | 从下到上，从左到右 |
| `8` | 从下到上，从右到左 |

#### 颜色、偏色与反色

`color` 使用 `RRGGBB-DRDGDB`，例如 `123456-000000|aabbcc-030303|ddeeff-202020`。竖线分隔多个候选颜色；整个表达式前加 `@` 启用反色模式，表示匹配指定颜色之外的颜色，例如 `@123456-000000|333333-101010`。该格式使用 RGB 顺序，不是按键精灵的 BGR 顺序。

`similarity` 范围为 `0.1–1.0`。偏色是单点颜色容差，多颜色是候选条件集合；两者可以同时使用。

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
  // RGB 顺序；每个候选可有独立偏色。
  const color = '123456-000000|aabbcc-030303|ddeeff-202020'
  const matches = dm.findColorEx(x1, y1, x2, y2, color, 1.0, 0)
  if (matches.length === 0) console.log('未命中')
  for (const match of matches) {
    console.log('结果值', match.value, '坐标', match.x, match.y)
  }
  // 反色是排除整个候选集合，不是逐通道取补色。
  // 反色可能命中几乎所有像素，因此这里只搜索最多 64×64 的小区域。
  const inverse = dm.findColorEx(x1, y1, Math.min(x2, 63), Math.min(y2, 63), '@123456-000000|333333-101010', 1.0, 0)
  console.log('反色命中数', inverse.length)
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

### dm.findMulColor

<a id="api-symbol-ZG0uZmluZE11bENvbG9y"></a>

#### 签名

```js
dm.findMulColor(x1, y1, x2, y2, color, similarity)
```

#### 实现与兼容

原始命令：`FindMulColor`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findmulcolor/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 六位 RGB 颜色表达式，不使用按键精灵的 BGR 顺序。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### 返回值

`number`；全部候选颜色均存在时为 `1`，否则为 `0`；不返回坐标。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 检查每一种候选颜色是否都在区域内出现，不返回坐标。
  const found = dm.findMulColor(x1, y1, x2, y2, 'ff0000-101010|00ff00-101010|0000ff-101010', 1.0)
  console.log(found === 1 ? '全部颜色均存在' : '至少一种颜色不存在')
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

### dm.findMultiColor

<a id="api-symbol-ZG0uZmluZE11bHRpQ29sb3I"></a>

#### 签名

```js
dm.findMultiColor(x1, y1, x2, y2, color, offsets, similarity, direction)
```

#### 实现与兼容

原始命令：`FindMultiColor`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findmulticolor/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 首点颜色表达式；支持 RGB 偏色和多颜色条件。 |
| `offsets` | `String` | 是 | — | 多点偏移，格式为 `x\|y\|颜色`，多个偏移点用逗号分隔。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 多点颜色与偏移

首点 `color` 使用 `RRGGBB-DRDGDB`；`offsets` 使用 `x|y|颜色`，多个偏移点用逗号分隔。例如 `8|0|aabbcc-030303,-4|3|ddeeff-202020`。偏移点颜色支持多颜色条件，颜色前加 `-` 表示反色匹配。

多点找色要求首点和每个偏移点同时满足；这与普通找色中的多颜色候选不是同一概念。

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
  const color = 'cc805b-020202|606060-010101'
  // 正负偏移、多候选和偏移反色可以组合；所有点都必须满足。
  const offsets = '9|2|-00ff00|-ff0000,15|2|2dff1c-010101,-6|11|a0d962|aabbcc,11|-4|-ffffff'
  const match = dm.findMultiColor(x1, y1, x2, y2, color, offsets, 1.0, 1)
  if (match !== null) {
    console.log('首点', match.value, '坐标', match.x, match.y)
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

### dm.findMultiColorE

<a id="api-symbol-ZG0uZmluZE11bHRpQ29sb3JF"></a>

#### 签名

```js
dm.findMultiColorE(x1, y1, x2, y2, color, offsets, similarity, direction)
```

#### 实现与兼容

原始命令：`FindMultiColorE`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findmulticolore/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 首点颜色表达式；支持 RGB 偏色和多颜色条件。 |
| `offsets` | `String` | 是 | — | 多点偏移，格式为 `x\|y\|颜色`，多个偏移点用逗号分隔。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 多点颜色与偏移

首点 `color` 使用 `RRGGBB-DRDGDB`；`offsets` 使用 `x|y|颜色`，多个偏移点用逗号分隔。例如 `8|0|aabbcc-030303,-4|3|ddeeff-202020`。偏移点颜色支持多颜色条件，颜色前加 `-` 表示反色匹配。

多点找色要求首点和每个偏移点同时满足；这与普通找色中的多颜色候选不是同一概念。

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
  const color = 'cc805b-020202|606060-010101'
  // 正负偏移、多候选和偏移反色可以组合；所有点都必须满足。
  const offsets = '9|2|-00ff00|-ff0000,15|2|2dff1c-010101,-6|11|a0d962|aabbcc,11|-4|-ffffff'
  const match = dm.findMultiColorE(x1, y1, x2, y2, color, offsets, 1.0, 1)
  if (match !== null) {
    console.log('首点', match.value, '坐标', match.x, match.y)
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

### dm.findMultiColorEx

<a id="api-symbol-ZG0uZmluZE11bHRpQ29sb3JFeA"></a>

#### 签名

```js
dm.findMultiColorEx(x1, y1, x2, y2, color, offsets, similarity, direction)
```

#### 实现与兼容

原始命令：`FindMultiColorEx`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findmulticolorex/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 首点颜色表达式；支持 RGB 偏色和多颜色条件。 |
| `offsets` | `String` | 是 | — | 多点偏移，格式为 `x\|y\|颜色`，多个偏移点用逗号分隔。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 多点颜色与偏移

首点 `color` 使用 `RRGGBB-DRDGDB`；`offsets` 使用 `x|y|颜色`，多个偏移点用逗号分隔。例如 `8|0|aabbcc-030303,-4|3|ddeeff-202020`。偏移点颜色支持多颜色条件，颜色前加 `-` 表示反色匹配。

多点找色要求首点和每个偏移点同时满足；这与普通找色中的多颜色候选不是同一概念。

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
  const color = 'cc805b-020202|606060-010101'
  // 正负偏移、多候选和偏移反色可以组合；所有点都必须满足。
  const offsets = '9|2|-00ff00|-ff0000,15|2|2dff1c-010101,-6|11|a0d962|aabbcc,11|-4|-ffffff'
  const matches = dm.findMultiColorEx(x1, y1, x2, y2, color, offsets, 1.0, 1)
  if (matches.length === 0) console.log('未命中')
  for (const match of matches) {
    console.log('首点', match.value, '坐标', match.x, match.y)
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

### dm.findPic

<a id="api-symbol-ZG0uZmluZFBpYw"></a>

#### 签名

```js
dm.findPic(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPic`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpic/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `String` | 是 | — | 图片文件名或 `\|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。


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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  const pictures = 'button.png|cancel.png'
  try {
    dm.loadPic(pictures)
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 普通相似度范围 0.1–1.0。
    const match = dm.findPic(x1, y1, x2, y2, pictures, delta, 0.9, 0)
    if (match !== null) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    dm.freePic(pictures)
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findPicE

<a id="api-symbol-ZG0uZmluZFBpY0U"></a>

#### 签名

```js
dm.findPicE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPicE`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpice/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `String` | 是 | — | 图片文件名或 `\|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。


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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  const pictures = 'button.png|cancel.png'
  try {
    dm.loadPic(pictures)
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 普通相似度范围 0.1–1.0。
    const match = dm.findPicE(x1, y1, x2, y2, pictures, delta, 0.9, 0)
    if (match !== null) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    dm.freePic(pictures)
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findPicEx

<a id="api-symbol-ZG0uZmluZFBpY0V4"></a>

#### 签名

```js
dm.findPicEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPicEx`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpicex/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `String` | 是 | — | 图片文件名或 `\|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。


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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  const pictures = 'button.png|cancel.png'
  try {
    dm.loadPic(pictures)
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 普通相似度范围 0.1–1.0。
    const matches = dm.findPicEx(x1, y1, x2, y2, pictures, delta, 0.9, 0)
    if (matches.length === 0) console.log('未命中')
    for (const match of matches) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    dm.freePic(pictures)
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findPicExS

<a id="api-symbol-ZG0uZmluZFBpY0V4Uw"></a>

#### 签名

```js
dm.findPicExS(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPicExS`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpicexs/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `String` | 是 | — | 图片文件名或 `\|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。


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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  const pictures = 'button.png|cancel.png'
  try {
    dm.loadPic(pictures)
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 普通相似度范围 0.1–1.0。
    const matches = dm.findPicExS(x1, y1, x2, y2, pictures, delta, 0.9, 0)
    if (matches.length === 0) console.log('未命中')
    for (const match of matches) {
      console.log('模板名', match.value, '坐标', match.x, match.y)
    }
    // S 变体的 value 直接为模板名。
  } finally {
    dm.freePic(pictures)
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findPicMem

<a id="api-symbol-ZG0uZmluZFBpY01lbQ"></a>

#### 签名

```js
dm.findPicMem(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPicMem`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpicmem/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `Object` | 是 | — | 编码图片的 `DmBuffer` 或字节数组；多个模板使用数组，不接受裸地址。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。


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
  // 先准备两张模板；即使第二张加载或查找失败，也释放已创建的缓冲区。
  const templates = []
  try {
    templates.push(dm.buffer(files.readBytes('./assets/dm/button.png')))
    templates.push(dm.buffer(files.readBytes('./assets/dm/cancel.png')))
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 普通相似度范围 0.1–1.0。
    const match = dm.findPicMem(x1, y1, x2, y2, templates, delta, 0.9, 0)
    if (match !== null) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    for (const template of templates) template.close()
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findPicMemE

<a id="api-symbol-ZG0uZmluZFBpY01lbUU"></a>

#### 签名

```js
dm.findPicMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPicMemE`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpicmeme/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `Object` | 是 | — | 编码图片的 `DmBuffer` 或字节数组；多个模板使用数组，不接受裸地址。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。


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
  // 先准备两张模板；即使第二张加载或查找失败，也释放已创建的缓冲区。
  const templates = []
  try {
    templates.push(dm.buffer(files.readBytes('./assets/dm/button.png')))
    templates.push(dm.buffer(files.readBytes('./assets/dm/cancel.png')))
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 普通相似度范围 0.1–1.0。
    const match = dm.findPicMemE(x1, y1, x2, y2, templates, delta, 0.9, 0)
    if (match !== null) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    for (const template of templates) template.close()
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findPicMemEx

<a id="api-symbol-ZG0uZmluZFBpY01lbUV4"></a>

#### 签名

```js
dm.findPicMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPicMemEx`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpicmemex/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `Object` | 是 | — | 编码图片的 `DmBuffer` 或字节数组；多个模板使用数组，不接受裸地址。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。


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
  // 先准备两张模板；即使第二张加载或查找失败，也释放已创建的缓冲区。
  const templates = []
  try {
    templates.push(dm.buffer(files.readBytes('./assets/dm/button.png')))
    templates.push(dm.buffer(files.readBytes('./assets/dm/cancel.png')))
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 普通相似度范围 0.1–1.0。
    const matches = dm.findPicMemEx(x1, y1, x2, y2, templates, delta, 0.9, 0)
    if (matches.length === 0) console.log('未命中')
    for (const match of matches) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    for (const template of templates) template.close()
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findPicS

<a id="api-symbol-ZG0uZmluZFBpY1M"></a>

#### 签名

```js
dm.findPicS(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPicS`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpics/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `String` | 是 | — | 图片文件名或 `\|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。


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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  const pictures = 'button.png|cancel.png'
  try {
    dm.loadPic(pictures)
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 普通相似度范围 0.1–1.0。
    const match = dm.findPicS(x1, y1, x2, y2, pictures, delta, 0.9, 0)
    if (match !== null) {
      console.log('模板名', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
    // S 变体的 value 直接为模板名。
  } finally {
    dm.freePic(pictures)
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findPicSim

<a id="api-symbol-ZG0uZmluZFBpY1NpbQ"></a>

#### 签名

```js
dm.findPicSim(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPicSim`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpicsim/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `String` | 是 | — | 图片文件名或 `\|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `int` | 是 | — | 图片相似率整数，范围 `0–100`。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。

Android `DmMatch` 不提供每次命中的实际相似率字段；输入阈值不是输出分数。参考 PC 示例中的命中分数不能从本接口读取，不应把 `value` 当成分数。


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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  const pictures = 'button.png|cancel.png'
  try {
    dm.loadPic(pictures)
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 80 表示百分比相似率，范围 0–100，不是 0.8。
    const match = dm.findPicSim(x1, y1, x2, y2, pictures, delta, 80, 0)
    if (match !== null) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    dm.freePic(pictures)
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findPicSimE

<a id="api-symbol-ZG0uZmluZFBpY1NpbUU"></a>

#### 签名

```js
dm.findPicSimE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPicSimE`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpicsime/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `String` | 是 | — | 图片文件名或 `\|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `int` | 是 | — | 图片相似率整数，范围 `0–100`。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。

Android `DmMatch` 不提供每次命中的实际相似率字段；输入阈值不是输出分数。参考 PC 示例中的命中分数不能从本接口读取，不应把 `value` 当成分数。


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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  const pictures = 'button.png|cancel.png'
  try {
    dm.loadPic(pictures)
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 80 表示百分比相似率，范围 0–100，不是 0.8。
    const match = dm.findPicSimE(x1, y1, x2, y2, pictures, delta, 80, 0)
    if (match !== null) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    dm.freePic(pictures)
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findPicSimEx

<a id="api-symbol-ZG0uZmluZFBpY1NpbUV4"></a>

#### 签名

```js
dm.findPicSimEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPicSimEx`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpicsimex/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `String` | 是 | — | 图片文件名或 `\|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `int` | 是 | — | 图片相似率整数，范围 `0–100`。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。

Android `DmMatch` 不提供每次命中的实际相似率字段；输入阈值不是输出分数。参考 PC 示例中的命中分数不能从本接口读取，不应把 `value` 当成分数。


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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  const pictures = 'button.png|cancel.png'
  try {
    dm.loadPic(pictures)
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 80 表示百分比相似率，范围 0–100，不是 0.8。
    const matches = dm.findPicSimEx(x1, y1, x2, y2, pictures, delta, 80, 0)
    if (matches.length === 0) console.log('未命中')
    for (const match of matches) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    dm.freePic(pictures)
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findPicSimMem

<a id="api-symbol-ZG0uZmluZFBpY1NpbU1lbQ"></a>

#### 签名

```js
dm.findPicSimMem(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPicSimMem`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpicsimmem/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `Object` | 是 | — | 编码图片的 `DmBuffer` 或字节数组；多个模板使用数组，不接受裸地址。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `int` | 是 | — | 图片相似率整数，范围 `0–100`。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。

Android `DmMatch` 不提供每次命中的实际相似率字段；输入阈值不是输出分数。参考 PC 示例中的命中分数不能从本接口读取，不应把 `value` 当成分数。


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
  // 先准备两张模板；即使第二张加载或查找失败，也释放已创建的缓冲区。
  const templates = []
  try {
    templates.push(dm.buffer(files.readBytes('./assets/dm/button.png')))
    templates.push(dm.buffer(files.readBytes('./assets/dm/cancel.png')))
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 80 表示百分比相似率，范围 0–100，不是 0.8。
    const match = dm.findPicSimMem(x1, y1, x2, y2, templates, delta, 80, 0)
    if (match !== null) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    for (const template of templates) template.close()
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findPicSimMemE

<a id="api-symbol-ZG0uZmluZFBpY1NpbU1lbUU"></a>

#### 签名

```js
dm.findPicSimMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPicSimMemE`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpicsimmeme/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `Object` | 是 | — | 编码图片的 `DmBuffer` 或字节数组；多个模板使用数组，不接受裸地址。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `int` | 是 | — | 图片相似率整数，范围 `0–100`。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。

Android `DmMatch` 不提供每次命中的实际相似率字段；输入阈值不是输出分数。参考 PC 示例中的命中分数不能从本接口读取，不应把 `value` 当成分数。


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
  // 先准备两张模板；即使第二张加载或查找失败，也释放已创建的缓冲区。
  const templates = []
  try {
    templates.push(dm.buffer(files.readBytes('./assets/dm/button.png')))
    templates.push(dm.buffer(files.readBytes('./assets/dm/cancel.png')))
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 80 表示百分比相似率，范围 0–100，不是 0.8。
    const match = dm.findPicSimMemE(x1, y1, x2, y2, templates, delta, 80, 0)
    if (match !== null) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    for (const template of templates) template.close()
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findPicSimMemEx

<a id="api-symbol-ZG0uZmluZFBpY1NpbU1lbUV4"></a>

#### 签名

```js
dm.findPicSimMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 实现与兼容

原始命令：`FindPicSimMemEx`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findpicsimmemex/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `pictures` | `Object` | 是 | — | 编码图片的 `DmBuffer` 或字节数组；多个模板使用数组，不接受裸地址。 |
| `delta` | `String` | 是 | — | 图片偏色；六位十六进制表示 RGB 偏色，两位十六进制表示灰度偏色。 |
| `similarity` | `int` | 是 | — | 图片相似率整数，范围 `0–100`。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 图片偏色与变体

`delta` 使用六位 RGB 偏色（例如 `203040`），也可使用两位灰度偏色（例如 `20`）。普通找图相似度为 `0.1–1.0`；`findPicSim*` 使用 `0–100` 的整数相似率。带 `Ex` 返回全部命中，带 `S` 将结果值改为图片名，带 `Mem` 从 `DmBuffer` 或字节数组读取模板。

所有十四个找图入口均接受八个参数，区域右下角包含在扫描范围内。`E` 与普通入口一样返回首个 `DmMatch | null`；五个 `Ex` / `ExS` 入口返回 `DmMatch[]`，未命中为空数组。`value` 是从 `0` 开始的模板编号，只有 `findPicS` 与 `findPicExS` 改为图片名；`x/y` 是输入图像内模板左上角，`width/height` 是模板尺寸。

Android `DmMatch` 不提供每次命中的实际相似率字段；输入阈值不是输出分数。参考 PC 示例中的命中分数不能从本接口读取，不应把 `value` 当成分数。


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
  // 先准备两张模板；即使第二张加载或查找失败，也释放已创建的缓冲区。
  const templates = []
  try {
    templates.push(dm.buffer(files.readBytes('./assets/dm/button.png')))
    templates.push(dm.buffer(files.readBytes('./assets/dm/cancel.png')))
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 80 表示百分比相似率，范围 0–100，不是 0.8。
    const matches = dm.findPicSimMemEx(x1, y1, x2, y2, templates, delta, 80, 0)
    if (matches.length === 0) console.log('未命中')
    for (const match of matches) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    for (const template of templates) template.close()
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

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

示例中的模板、截图和字库路径是前置资源，不是随文档附带的文件；请先准备相应文件，再按实际画面调整颜色和阈值。

### dm.findShape

<a id="api-symbol-ZG0uZmluZFNoYXBl"></a>

#### 签名

```js
dm.findShape(x1, y1, x2, y2, shape, similarity, direction)
```

#### 实现与兼容

原始命令：`FindShape`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findshape/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `shape` | `String` | 是 | — | 形状关系，格式为 `x\|y\|e`；x/y 是相对基准点的偏移，e=1 要求颜色相似，e=0 要求不相似；多个关系用逗号分隔。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 形状关系

`shape` 使用 `x|y|e` 描述相对点关系，不使用颜色偏色格式；多个关系用逗号分隔。返回坐标是基准点，`x/y` 是相对基准点的像素偏移，可以为负数。`e=1` 要求该点颜色与基准点相似，`e=0` 要求不相似；不是固定的黑白或前景/背景编号。相似度为 `1.0` 时要求对应关系严格成立，降低相似度会扩大颜色相似容差。

所有偏移点必须落在查找区域内；靠近边缘而容纳不下完整形状的基准点不会命中。示例使用九个采样点，同时约束相似和不相似位置，需要按实际目标截图重新采样，不能保证匹配任意屏幕。

MonkeyKing 方向仅支持 `0–3`；参考页面列出的 `0–8` 不适用于本 Android 接口。普通接口和 `E` 接口都返回 `DmMatch | null`，不解析 PC 坐标串；`Ex` 接口返回全部 `DmMatch[]`。

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
  // 按目标截图采样后替换形状：偏移相对于返回的基准点，不是绝对坐标。
  // e=1 要求颜色与基准点相似，e=0 要求不相似；不是前景/背景颜色编号。
  const shape = '1|1|0,1|6|1,0|10|1,9|10|1,7|6|1,7|8|0,8|9|0,2|2|1,3|1|1'
  const similarity = 1.0
  const direction = 0 // 从左到右，从上到下
  const match = dm.findShape(x1, y1, x2, y2, shape, similarity, direction)
  if (match !== null) {
    console.log('形状', match.value, '坐标', match.x, match.y)
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

### dm.findShapeE

<a id="api-symbol-ZG0uZmluZFNoYXBlRQ"></a>

#### 签名

```js
dm.findShapeE(x1, y1, x2, y2, shape, similarity, direction)
```

#### 实现与兼容

原始命令：`FindShapeE`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findshapee/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `shape` | `String` | 是 | — | 形状关系，格式为 `x\|y\|e`；x/y 是相对基准点的偏移，e=1 要求颜色相似，e=0 要求不相似；多个关系用逗号分隔。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 形状关系

`shape` 使用 `x|y|e` 描述相对点关系，不使用颜色偏色格式；多个关系用逗号分隔。返回坐标是基准点，`x/y` 是相对基准点的像素偏移，可以为负数。`e=1` 要求该点颜色与基准点相似，`e=0` 要求不相似；不是固定的黑白或前景/背景编号。相似度为 `1.0` 时要求对应关系严格成立，降低相似度会扩大颜色相似容差。

所有偏移点必须落在查找区域内；靠近边缘而容纳不下完整形状的基准点不会命中。示例使用九个采样点，同时约束相似和不相似位置，需要按实际目标截图重新采样，不能保证匹配任意屏幕。

MonkeyKing 方向仅支持 `0–3`；参考页面列出的 `0–8` 不适用于本 Android 接口。普通接口和 `E` 接口都返回 `DmMatch | null`，不解析 PC 坐标串；`Ex` 接口返回全部 `DmMatch[]`。

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
  // 按目标截图采样后替换形状：偏移相对于返回的基准点，不是绝对坐标。
  // e=1 要求颜色与基准点相似，e=0 要求不相似；不是前景/背景颜色编号。
  const shape = '1|1|0,1|6|1,0|10|1,9|10|1,7|6|1,7|8|0,8|9|0,2|2|1,3|1|1'
  const similarity = 1.0
  const direction = 0 // 从左到右，从上到下
  const match = dm.findShapeE(x1, y1, x2, y2, shape, similarity, direction)
  if (match !== null) {
    console.log('形状', match.value, '坐标', match.x, match.y)
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

### dm.findShapeEx

<a id="api-symbol-ZG0uZmluZFNoYXBlRXg"></a>

#### 签名

```js
dm.findShapeEx(x1, y1, x2, y2, shape, similarity, direction)
```

#### 实现与兼容

原始命令：`FindShapeEx`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.findshapeex/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `shape` | `String` | 是 | — | 形状关系，格式为 `x\|y\|e`；x/y 是相对基准点的偏移，e=1 要求颜色相似，e=0 要求不相似；多个关系用逗号分隔。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向；可用值见本函数的方向表。 |

#### 扫描方向

| 值 | 扫描顺序 |
| --- | --- |
| `0` | 从左到右，从上到下 |
| `1` | 从左到右，从下到上 |
| `2` | 从右到左，从上到下 |
| `3` | 从右到左，从下到上 |

#### 形状关系

`shape` 使用 `x|y|e` 描述相对点关系，不使用颜色偏色格式；多个关系用逗号分隔。返回坐标是基准点，`x/y` 是相对基准点的像素偏移，可以为负数。`e=1` 要求该点颜色与基准点相似，`e=0` 要求不相似；不是固定的黑白或前景/背景编号。相似度为 `1.0` 时要求对应关系严格成立，降低相似度会扩大颜色相似容差。

所有偏移点必须落在查找区域内；靠近边缘而容纳不下完整形状的基准点不会命中。示例使用九个采样点，同时约束相似和不相似位置，需要按实际目标截图重新采样，不能保证匹配任意屏幕。

MonkeyKing 方向仅支持 `0–3`；参考页面列出的 `0–8` 不适用于本 Android 接口。普通接口和 `E` 接口都返回 `DmMatch | null`，不解析 PC 坐标串；`Ex` 接口返回全部 `DmMatch[]`。

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
  // 按目标截图采样后替换形状：偏移相对于返回的基准点，不是绝对坐标。
  // e=1 要求颜色与基准点相似，e=0 要求不相似；不是前景/背景颜色编号。
  const shape = '1|1|0,1|6|1,0|10|1,9|10|1,7|6|1,7|8|0,8|9|0,2|2|1,3|1|1'
  const similarity = 1.0
  const direction = 1 // 从左到右，从下到上
  const matches = dm.findShapeEx(x1, y1, x2, y2, shape, similarity, direction)
  if (matches.length === 0) console.log('未命中')
  for (const match of matches) {
    console.log('形状', match.value, '坐标', match.x, match.y)
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

### dm.freePic

<a id="api-symbol-ZG0uZnJlZVBpYw"></a>

#### 签名

```js
dm.freePic(pictures)
```

#### 实现与兼容

原始命令：`FreePic`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.freepic/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `pictures` | `String` | 是 | — | 图片文件名或 `\|` 分隔的多模板列表；相对路径基于 `setPath()`。 |

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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  // loadPic 不直接展开通配符；先用 matchPicName 展开，再加入明确文件名。
  const expanded = dm.matchPicName('button*.png')
  const pictures = expanded ? expanded + '|cancel.png' : 'cancel.png'
  try {
    dm.loadPic(pictures)
    const match = dm.findPic(x1, y1, x2, y2, pictures, '202020', 0.9, 0)
    if (match !== null) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
  } finally {
    // 多模板任务完成后释放对应缓存，不删除磁盘文件。
    dm.freePic(pictures)
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

### dm.getAveHSV

<a id="api-symbol-ZG0uZ2V0QXZlSFNW"></a>

#### 签名

```js
dm.getAveHSV(x1, y1, x2, y2)
```

#### 实现与兼容

原始命令：`GetAveHSV`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getavehsv/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |

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
  // 统计输入帧中心小区域，而非把整个屏幕混成一个平均色。
  const left = Math.floor(x2 / 3), top = Math.floor(y2 / 3)
  console.log(dm.getAveHSV(left, top, Math.min(x2, left + 30), Math.min(y2, top + 30)))
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

### dm.getAveRGB

<a id="api-symbol-ZG0uZ2V0QXZlUkdC"></a>

#### 签名

```js
dm.getAveRGB(x1, y1, x2, y2)
```

#### 实现与兼容

原始命令：`GetAveRGB`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getavergb/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |

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
  // 统计输入帧中心小区域，而非把整个屏幕混成一个平均色。
  const left = Math.floor(x2 / 3), top = Math.floor(y2 / 3)
  console.log(dm.getAveRGB(left, top, Math.min(x2, left + 30), Math.min(y2, top + 30)))
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

### dm.getColor

<a id="api-symbol-ZG0uZ2V0Q29sb3I"></a>

#### 签名

```js
dm.getColor(x, y)
```

#### 实现与兼容

原始命令：`GetColor`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getcolor/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |

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
  const x = Math.floor(x2 / 2), y = Math.floor(y2 / 2)
  const color = dm.getColor(x, y)
  console.log('中心像素', x, y, color)
  const expected = 'ffffff'
  console.log(color.toLowerCase() === expected ? '与目标颜色相等' : '与目标颜色不同')
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

### dm.getColorBGR

<a id="api-symbol-ZG0uZ2V0Q29sb3JCR1I"></a>

#### 签名

```js
dm.getColorBGR(x, y)
```

#### 实现与兼容

原始命令：`GetColorBGR`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getcolorbgr/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |

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
  const x = Math.floor(x2 / 2), y = Math.floor(y2 / 2)
  const color = dm.getColorBGR(x, y)
  console.log('中心像素', x, y, color)
  const expected = '0000ff'
  console.log(color.toLowerCase() === expected ? '与目标颜色相等' : '与目标颜色不同')
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

### dm.getColorHSV

<a id="api-symbol-ZG0uZ2V0Q29sb3JIU1Y"></a>

#### 签名

```js
dm.getColorHSV(x, y)
```

#### 实现与兼容

原始命令：`GetColorHSV`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getcolorhsv/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |

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
  const x = Math.floor(x2 / 2), y = Math.floor(y2 / 2)
  const color = dm.getColorHSV(x, y)
  console.log('中心像素', x, y, color)
  const expected = '0.100.100'
  console.log(color.toLowerCase() === expected ? '与目标颜色相等' : '与目标颜色不同')
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

### dm.getColorNum

<a id="api-symbol-ZG0uZ2V0Q29sb3JOdW0"></a>

#### 签名

```js
dm.getColorNum(x1, y1, x2, y2, color, similarity)
```

#### 实现与兼容

原始命令：`GetColorNum`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getcolornum/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `color` | `String` | 是 | — | 六位 RGB 颜色表达式，不使用按键精灵的 BGR 顺序。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### 返回值

`number`；符合条件的记录、字形或像素数量，没有时为 `0`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  const count = dm.getColorNum(x1, y1, x2, y2, 'ffffff-202020|eeeeee-101010|dddddd-080808', 1.0)
  console.log('符合条件的像素数', count)
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

### dm.getPicSize

<a id="api-symbol-ZG0uZ2V0UGljU2l6ZQ"></a>

#### 签名

```js
dm.getPicSize(pictures)
```

#### 实现与兼容

原始命令：`GetPicSize`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getpicsize/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `pictures` | `String` | 是 | — | 单个可读图片文件路径；相对路径基于 `setPath()`。 |

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
// 先准备 button.png 和 cancel.png 两张模板。
dm.setPath(files.path('./assets/dm'))
try {
  const size = dm.getPicSize('button.png').split(',')
  console.log('宽度', Number(size[0]), '高度', Number(size[1]))
} finally {
  dm.freePic('button.png')
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.getScreenData

<a id="api-symbol-ZG0uZ2V0U2NyZWVuRGF0YQ"></a>

#### 签名

```js
dm.getScreenData(x1, y1, x2, y2)
```

#### 实现与兼容

原始命令：`GetScreenData`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getscreendata/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |

#### 返回值

`DmBuffer`；调用方负责在 `finally` 中调用 `close()`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  const data = dm.getScreenData(x1, y1, x2, y2)
  try {
    console.log('字节数', data.size())
    // 这是原始像素数据，不是可直接解码的图片文件。
  } finally {
    data.close()
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

再次调用同一种数据获取方法会关闭它上次返回的缓冲区；请先消费或复制数据，不要保留旧缓冲区供后续调用使用。

### dm.getScreenDataBmp

<a id="api-symbol-ZG0uZ2V0U2NyZWVuRGF0YUJtcA"></a>

#### 签名

```js
dm.getScreenDataBmp(x1, y1, x2, y2)
```

#### 实现与兼容

原始命令：`GetScreenDataBmp`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.getscreendatabmp/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |

#### 返回值

`DmBuffer`；调用方负责在 `finally` 中调用 `close()`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  const data = dm.getScreenDataBmp(x1, y1, x2, y2)
  try {
    console.log('字节数', data.size())
    // 这是含 BMP 文件头的数据，可用于内存图片接口。
    const output = files.path('./output/frame.bmp')
    files.ensureDir(output)
    files.writeBytes(output, data.bytes())
    console.log('可供图片查看器打开的文件', output)
  } finally {
    data.close()
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

再次调用同一种数据获取方法会关闭它上次返回的缓冲区；请先消费或复制数据，不要保留旧缓冲区供后续调用使用。

### dm.imageToBmp

<a id="api-symbol-ZG0uaW1hZ2VUb0JtcA"></a>

#### 签名

```js
dm.imageToBmp(input, output)
```

#### 实现与兼容

原始命令：`ImageToBmp`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.imagetobmp/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `input` | `String` | 是 | — | 文件或目录路径；相对路径基于 `setPath()` 或当前工作目录。 |
| `output` | `String` | 是 | — | 文件或目录路径；相对路径基于 `setPath()` 或当前工作目录。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 先准备三种格式的图片；GIF 转换只处理解码得到的一帧。
for (const extension of ['png', 'jpg', 'gif']) {
  const input = files.path('./assets/dm/input.' + extension)
  const output = files.path('./output/from-' + extension + '.bmp')
  files.ensureDir(output)
  console.log(dm.imageToBmp(input, output) === 1 ? output : '转换失败')
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.isDisplayDead

<a id="api-symbol-ZG0uaXNEaXNwbGF5RGVhZA"></a>

#### 签名

```js
dm.isDisplayDead(x1, y1, x2, y2, timeout)
```

#### 实现与兼容

原始命令：`IsDisplayDead`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.isdisplaydead/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y1` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `x2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `y2` | `int` | 是 | — | 输入图像像素坐标；区域左上角和右下角均为包含边界。 |
| `timeout` | `int` | 是 | — | 非负秒数；连续观察区域是否保持不变。 |

#### 返回值

`number`；在指定秒数内区域保持不变时为 `1`，发生变化时为 `0`。静止画面不一定表示应用故障。

#### 示例

```js
if (!requestScreenCapture()) throw new Error('未取得截图权限')
dm.useScreen()
// 只读取尺寸，不冻结输入；测试期间不要旋转屏幕。
const frame = images.captureScreen()
const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
frame.recycle()
// timeout 单位是秒；静止画面也会返回 1，不一定意味着应用故障。
const unchanged = dm.isDisplayDead(x1, y1, x2, y2, 2)
console.log(unchanged === 1 ? '区域持续两秒未变化' : '区域发生变化')
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.loadPic

<a id="api-symbol-ZG0ubG9hZFBpYw"></a>

#### 签名

```js
dm.loadPic(pictures)
```

#### 实现与兼容

原始命令：`LoadPic`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.loadpic/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `pictures` | `String` | 是 | — | 图片文件名或 `\|` 分隔的多模板列表；相对路径基于 `setPath()`。 |

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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  // loadPic 不直接展开通配符；先用 matchPicName 展开，再加入明确文件名。
  const expanded = dm.matchPicName('button*.png')
  const pictures = expanded ? expanded + '|cancel.png' : 'cancel.png'
  try {
    dm.loadPic(pictures)
    const match = dm.findPic(x1, y1, x2, y2, pictures, '202020', 0.9, 0)
    if (match !== null) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
  } finally {
    // 多模板任务完成后释放对应缓存，不删除磁盘文件。
    dm.freePic(pictures)
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

Android 不直接在 loadPic 中展开通配符；用 matchPicName 获取明确文件列表后再加载。

### dm.loadPicByte

<a id="api-symbol-ZG0ubG9hZFBpY0J5dGU"></a>

#### 签名

```js
dm.loadPicByte(data, length, pictures)
```

#### 实现与兼容

原始命令：`LoadPicByte`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.loadpicbyte/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `data` | `Object` | 是 | — | 二进制输入；使用 `DmBuffer`、`byte[]` 或直接 ByteBuffer，不接受裸地址。 |
| `length` | `int` | 是 | — | 按 `int` 传入；不能传入 Java 内部输出指针类型。 |
| `pictures` | `String` | 是 | — | 内存图片的缓存名称；后续找图用此名称引用，不需要同名磁盘文件。 |

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
  const bytes = files.readBytes('./assets/dm/button.png')
  const data = dm.buffer(bytes)
  try {
    dm.loadPicByte(data, data.size(), 'memory-button.png')
    const match = dm.findPic(x1, y1, x2, y2, 'memory-button.png', '202020', 0.9, 0)
    if (match !== null) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
  } finally {
    try {
      dm.freePic('memory-button.png')
    } finally {
      data.close()
    }
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

### dm.matchPicName

<a id="api-symbol-ZG0ubWF0Y2hQaWNOYW1l"></a>

#### 签名

```js
dm.matchPicName(pictures)
```

#### 实现与兼容

原始命令：`MatchPicName`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.matchpicname/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `pictures` | `String` | 是 | — | 文件名通配模式，例如 `*.png`；匹配结果是以竖线分隔的文件路径。 |

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
// 先准备 button.png 和 cancel.png 两张模板。
dm.setPath(files.path('./assets/dm'))
const pictures = dm.matchPicName('*.png')
if (pictures === '') console.log('没有匹配的文件')
else for (const file of pictures.split('|')) console.log(file)
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.rgb2bgr

<a id="api-symbol-ZG0ucmdiMmJncg"></a>

#### 签名

```js
dm.rgb2bgr(color)
```

#### 实现与兼容

原始命令：`RGB2BGR`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.rgb2bgr/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `color` | `String` | 是 | — | 六位 RGB 颜色表达式，不使用按键精灵的 BGR 顺序。 |

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
const input = '123456'
const converted = dm.rgb2bgr(input)
console.log(converted) // 563412；只交换红蓝通道，不带偏色或 # 前缀。
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.setExcludeRegion

<a id="api-symbol-ZG0uc2V0RXhjbHVkZVJlZ2lvbg"></a>

#### 签名

```js
dm.setExcludeRegion(mode, code)
```

#### 实现与兼容

原始命令：`SetExcludeRegion`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setexcluderegion/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `mode` | `int` | 是 | — | `0` 追加排除矩形，`1` 设置填充色，`2` 清空排除矩形。 |
| `code` | `String` | 是 | — | 模式 `0` 使用 `x1,y1,x2,y2\|...`；模式 `1` 使用六位 RGB 颜色；模式 `2` 使用空字符串。 |

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
  // 小坐标示范；所有矩形都必须适合实际输入尺寸。
  if (x2 < 100 || y2 < 100) throw new Error('本示例需要至少 101×101 的输入')
  dm.setExcludeRegion(2, '')
  try {
    dm.setExcludeRegion(0, '0,0,20,20|40,40,60,60')
    dm.setExcludeRegion(0, '80,80,100,100')
    dm.setExcludeRegion(1, 'ff11ff')
    const match = dm.findColor(x1, y1, x2, y2, '00ff00-101010', 1.0, 0)
    if (match !== null) {
      console.log('结果值', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
  } finally {
    dm.setExcludeRegion(2, '')
    dm.setExcludeRegion(1, 'ff00ff')
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

### dm.setFindPicMultithreadCount

<a id="api-symbol-ZG0uc2V0RmluZFBpY011bHRpdGhyZWFkQ291bnQ"></a>

#### 签名

```js
dm.setFindPicMultithreadCount(count)
```

#### 实现与兼容

原始命令：`SetFindPicMultithreadCount`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setfindpicmultithreadcount/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `count` | `int` | 是 | — | 启用并行找图的模板数量门槛；至少为 `1`。 |

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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  dm.setFindPicMultithreadCount(2) // 至少两个模板时尝试并行
  dm.setFindPicMultithreadLimit(2) // 线程数量上限
  try {
    dm.enableFindPicMultithread(0)
    const serial = dm.findPicEx(x1, y1, x2, y2, 'button.png|cancel.png', '202020', 0.9, 0)
    console.log('关闭多线程时的命中数', serial.length)
    dm.enableFindPicMultithread(1)
    const matches = dm.findPicEx(x1, y1, x2, y2, 'button.png|cancel.png', '202020', 0.9, 0)
    if (matches.length === 0) console.log('未命中')
    for (const match of matches) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    }
  } finally {
    dm.freePic('button.png|cancel.png')
    dm.enableFindPicMultithread(0)
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

### dm.setFindPicMultithreadLimit

<a id="api-symbol-ZG0uc2V0RmluZFBpY011bHRpdGhyZWFkTGltaXQ"></a>

#### 签名

```js
dm.setFindPicMultithreadLimit(count)
```

#### 实现与兼容

原始命令：`SetFindPicMultithreadLimit`；参数语义参考[原始分类页](https://zimaoxy.com/docs/qscript/dm.setfindpicmultithreadlimit/)，返回值和 Android 行为以 MonkeyKing 实现为准。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `count` | `int` | 是 | — | 并行线程数量上限；至少为 `1`。 |

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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  dm.setFindPicMultithreadCount(2) // 至少两个模板时尝试并行
  dm.setFindPicMultithreadLimit(2) // 线程数量上限
  try {
    dm.enableFindPicMultithread(0)
    const serial = dm.findPicEx(x1, y1, x2, y2, 'button.png|cancel.png', '202020', 0.9, 0)
    console.log('关闭多线程时的命中数', serial.length)
    dm.enableFindPicMultithread(1)
    const matches = dm.findPicEx(x1, y1, x2, y2, 'button.png|cancel.png', '202020', 0.9, 0)
    if (matches.length === 0) console.log('未命中')
    for (const match of matches) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    }
  } finally {
    dm.freePic('button.png|cancel.png')
    dm.enableFindPicMultithread(0)
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

### dm.setPath

<a id="api-symbol-ZG0uc2V0UGF0aA"></a>

#### 签名

```js
dm.setPath(path)
```

#### 实现与兼容

原始命令：`SetPath`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `path` | `String` | 是 | — | 文件或目录路径；相对路径基于 `setPath()` 或当前工作目录。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 使用绝对目录，避免重复 setPath 时相对路径不断叠加。
dm.setPath(files.path('./assets/dm'))
console.log(dm.matchPicName('*.png'))
// 也可传相对目录，但它相对于当前 DM 基准目录，不是自动相对于脚本目录。
// 先准备 assets/dm/templates 子目录；用完恢复到已知绝对目录。
dm.setPath('templates')
try {
  console.log(dm.matchPicName('*.png'))
} finally {
  dm.setPath(files.path('./assets/dm'))
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.setDisplayInput

<a id="api-symbol-ZG0uc2V0RGlzcGxheUlucHV0"></a>

#### 签名

```js
dm.setDisplayInput(source)
```

#### 实现与兼容

原始命令：`SetDisplayInput`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `source` | `String` | 是 | — | 输入源：`screen` 或 `pic:相对路径`。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
// 文件输入不需要截图权限；坐标按该文件的实际尺寸计算。
const file = files.path('./assets/dm/screen.png')
const frame = images.read(file)
if (frame === null) throw new Error('无法读取图片')
try {
  dm.setPath(files.path('./assets/dm'))
  dm.setDisplayInput('pic:screen.png') // 相对于 DM 基准目录
  console.log('相对文件输入', dm.getColor(0, 0))
  dm.setDisplayInput('pic:' + file)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  const match = dm.findColor(x1, y1, x2, y2, 'ffffff-202020', 1.0, 0)
  if (match !== null) {
    console.log('结果值', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
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
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

每次 pic: 输入都会重新解码文件，不依赖找图模板缓存；不需要为刷新输入而清除模板缓存。裸地址 mem: 输入不支持，使用 setImage(DmBuffer) 替代。

### dm.enablePicCache

<a id="api-symbol-ZG0uZW5hYmxlUGljQ2FjaGU"></a>

#### 签名

```js
dm.enablePicCache(enabled)
```

#### 实现与兼容

原始命令：`EnablePicCache`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `int` | 是 | — | 整数开关；必须使用 `0/1`，不传布尔值。 |

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
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  dm.enablePicCache(0) // 文件模板每次重新读取，适用于磁盘模板会更新的场景。
  try {
    for (let i = 0; i < 2; i++) {
      console.log(dm.findPic(x1, y1, x2, y2, 'button.png', '202020', 0.9, 0))
    }
  } finally {
    dm.freePic('button.png')
    dm.enablePicCache(1)
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

### dm.buffer

<a id="api-symbol-ZG0uYnVmZmVy"></a>

#### 签名

```js
dm.buffer(bytes)
```

#### 实现与兼容

原始命令：`buffer`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `bytes` | `byte[]` | 是 | — | 二进制输入；使用 `DmBuffer`、`byte[]` 或直接 ByteBuffer，不接受裸地址。 |

#### 返回值

`DmBuffer`；调用方负责在 `finally` 中调用 `close()`。

#### 示例

```js
const data = dm.buffer(files.readBytes('./assets/dm/button.png'))
try {
  console.log('模板字节数', data.size())
  // data 可传给内存找图、setImage 或其他接受编码图像的接口。
} finally {
  data.close()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.cancel

<a id="api-symbol-ZG0uY2FuY2Vs"></a>

#### 签名

```js
dm.cancel()
```

#### 实现与兼容

原始命令：`cancel`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| — | — | — | — | 无参数。 |

#### 返回值

`undefined`。

#### 示例

```js
// 取消状态不可复位：仅在本脚本不再需要 DM 时执行。
dm.cancel()
dm.close()
// 此后不要再次调用本脚本的 dm 对象。
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.close

<a id="api-symbol-ZG0uY2xvc2U"></a>

#### 签名

```js
dm.close()
```

#### 实现与兼容

原始命令：`close`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| — | — | — | — | 无参数。 |

#### 返回值

`undefined`。

#### 示例

```js
// 在本脚本所有 DM 任务完成后释放引擎；不是每次查找后关闭。
try {
  console.log('当前字库槽位', dm.getNowDict())
} finally {
  dm.close()
}
// close 后本脚本的 dm 不再可用。
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.getFrameInfo

<a id="api-symbol-ZG0uZ2V0RnJhbWVJbmZv"></a>

#### 签名

```js
dm.getFrameInfo()
```

#### 实现与兼容

原始命令：`getFrameInfo`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| — | — | — | — | 无参数。 |

#### 返回值

`Bundle`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 可能为 null（例如没有元数据的文件输入），不能无条件读取字段。
  const info = dm.getFrameInfo()
  console.log(info === null ? '当前帧没有元数据' : info)
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

### dm.getLastFindTimings

<a id="api-symbol-ZG0uZ2V0TGFzdEZpbmRUaW1pbmdz"></a>

#### 签名

```js
dm.getLastFindTimings()
```

#### 实现与兼容

原始命令：`getLastFindTimings`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| — | — | — | — | 无参数。 |

#### 返回值

`Map`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  dm.findColor(x1, y1, x2, y2, 'ff0000-101010', 1.0, 0)
  const timings = dm.getLastFindTimings()
  console.log(timings.valid ? timings : '没有有效的 DM 原生耗时记录')
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

### dm.keepScreen

<a id="api-symbol-ZG0ua2VlcFNjcmVlbg"></a>

#### 签名

```js
dm.keepScreen(keep)
```

#### 实现与兼容

原始命令：`keepScreen`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `keep` | `boolean` | 是 | — | 布尔开关；必须使用 `false/true`，不传数值。 |

#### 返回值

`undefined`。

#### 示例

```js
if (!requestScreenCapture()) throw new Error('未取得截图权限')
dm.useScreen()
dm.keepScreen(true)
try {
  // 两次单点取色读取同一冻结帧。
  console.log(dm.getColor(0, 0), dm.getColor(0, 0))
} finally {
  dm.keepScreen(false)
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

### dm.setImage

<a id="api-symbol-ZG0uc2V0SW1hZ2U"></a>

#### 签名

```js
dm.setImage(image)
```

#### 实现与兼容

原始命令：`setImage`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `image` | `Object` | 是 | — | ImageWrapper、Bitmap 或 `DmBuffer` 输入。 |

#### 返回值

`undefined`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  console.log('输入尺寸', frame.getWidth(), frame.getHeight())
  const match = dm.findShape(x1, y1, x2, y2, '1|1|0,1|6|1,0|10|1,9|10|1,7|6|1,7|8|0,8|9|0,2|2|1,3|1|1', 1.0, 0)
  if (match !== null) {
    console.log('结果值', match.value, '坐标', match.x, match.y)
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

### dm.setSimdEnabled

<a id="api-symbol-ZG0uc2V0U2ltZEVuYWJsZWQ"></a>

#### 签名

```js
dm.setSimdEnabled(enabled)
```

#### 实现与兼容

原始命令：`setSimdEnabled`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `boolean` | 是 | — | 布尔开关；必须使用 `false/true`，不传数值。 |

#### 返回值

`undefined`。

#### 示例

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 同一固定帧对比结果；不要只凭一次耗时判断性能。
  dm.setSimdEnabled(false)
  try {
    const scalar = dm.findColor(x1, y1, x2, y2, 'ff0000-101010', 1.0, 0)
    dm.setSimdEnabled(true)
    const accelerated = dm.findColor(x1, y1, x2, y2, 'ff0000-101010', 1.0, 0)
    console.log(scalar, accelerated)
  } finally {
    dm.setSimdEnabled(true)
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

### dm.useScreen

<a id="api-symbol-ZG0udXNlU2NyZWVu"></a>

#### 签名

```js
dm.useScreen()
```

#### 实现与兼容

原始命令：`useScreen`；这是 MonkeyKing Android 扩展入口，不属于 PC 大漠兼容命令。

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| — | — | — | — | 无参数。 |

#### 返回值

`undefined`。

#### 示例

```js
if (!requestScreenCapture()) throw new Error('未取得截图权限')
dm.useScreen() // 解除文件/固定图输入；后续操作重新采集屏幕。
console.log(dm.getColor(0, 0))
```

#### 注意事项

示例使用 Rhino 的 camelCase API，独立运行于普通工作脚本；UI 脚本请放入工作线程。屏幕示例需要截图权限，区域尺寸从实际输入帧读取。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。
