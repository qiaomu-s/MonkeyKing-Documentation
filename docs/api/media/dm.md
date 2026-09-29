# dm 图色与文字识别 API

Monkey King 的 `dm` 是 Android 脚本级对象，公开入口统一使用 camelCase。底层大漠命令名只用于兼容分发，不是脚本可调用名称。查找接口使用自然返回值：单个结果为 `DmMatch | null`，多结果为 `DmMatch[]`；OCR 和文件 OCR 返回字符串或结构化结果。

Android 不支持 PC 私有加密图片、加密字库、裸地址和输出指针。请使用 `DmBuffer`、字节数组或直接 ByteBuffer；缓冲区使用完必须调用 `close()`。

<a id="api-symbol-bW9kdWxlOmRt"></a>

## 图色导航

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
| `buffers` | `Object` | 是 | — | 二进制输入；使用 `DmBuffer`、`byte[]` 或直接 ByteBuffer，不接受裸地址。 |
| `data` | `Object` | 是 | — | 二进制输入；使用 `DmBuffer`、`byte[]` 或直接 ByteBuffer，不接受裸地址。 |
| `length` | `int` | 是 | — | 按 `int` 传入；不能传入 Java 内部输出指针类型。 |

#### 返回值

`DmBuffer`；调用方负责在 `finally` 中调用 `close()`。

#### 示例

```js
const source = dm.buffer(files.readBytes('./assets/dm/button.png'))
try {
  const buffers = dm.appendPicAddr([], source, source.size())
  try {
    console.log(buffers.length)
  } finally {
    buffers.forEach(buffer => buffer.close())
  }
} finally {
  source.close()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const result = dm.bgr2rgb('ffffff-202020')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.capture(x1, y1, x2, y2, './assets/dm/output.bin')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.captureGif(x1, y1, x2, y2, './assets/dm/output.bin', 100, 1000)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.captureJpg(x1, y1, x2, y2, './assets/dm/output.bin', 90)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.capturePng(x1, y1, x2, y2, './assets/dm/output.bin')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const result = dm.capturePre('./assets/dm/output.bin')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.cmpColor(x, y, 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `enabled` | `int` | 是 | — | 布尔开关；使用 `0/1` 或 `false/true`。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.enableDisplayDebug(1)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `enabled` | `int` | 是 | — | 布尔开关；使用 `0/1` 或 `false/true`。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.enableFindPicMultithread(1)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `enabled` | `int` | 是 | — | 布尔开关；使用 `0/1` 或 `false/true`。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.enableGetColorByCapture(1)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `color` | `String` | 是 | — | RGB 颜色表达式，支持 `RRGGBB-DRDGDB`、`|` 多颜色和 `@` 反色。 |
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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const match = dm.findColor(x1, y1, x2, y2, '123456-000000|aabbcc-030303|ddeeff-202020', 1.0, 0)
if (match) console.log(`找到: ${match.x}, ${match.y}`)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `count` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |
| `width` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |
| `height` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |

#### 颜色块参数

`count` 是要求满足的颜色像素数量，`width` 和 `height` 是连通块/密度判断使用的尺寸约束，三者都必须是非负整数。普通接口返回一个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`；颜色表达式仍支持 RGB 偏色和 `|` 多颜色条件。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findColorBlock(x1, y1, x2, y2, 'ffffff-202020', 0.9, 4, 64, 64)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `count` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |
| `width` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |
| `height` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |

#### 颜色块参数

`count` 是要求满足的颜色像素数量，`width` 和 `height` 是连通块/密度判断使用的尺寸约束，三者都必须是非负整数。普通接口返回一个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`；颜色表达式仍支持 RGB 偏色和 `|` 多颜色条件。

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findColorBlockEx(x1, y1, x2, y2, 'ffffff-202020', 0.9, 4, 64, 64)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `color` | `String` | 是 | — | RGB 颜色表达式，支持 `RRGGBB-DRDGDB`、`|` 多颜色和 `@` 反色。 |
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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findColorE(x1, y1, x2, y2, 'ffffff-202020', 0.9, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `color` | `String` | 是 | — | RGB 颜色表达式，支持 `RRGGBB-DRDGDB`、`|` 多颜色和 `@` 反色。 |
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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findColorEx(x1, y1, x2, y2, 'ffffff-202020', 0.9, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findMulColor(x1, y1, x2, y2, 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `offsets` | `String` | 是 | — | 多点偏移，格式为 `x|y|颜色`，多个偏移点用逗号分隔。 |
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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const match = dm.findMultiColor(x1, y1, x2, y2, '123456-000000', '8|0|aabbcc-030303,-4|3|ddeeff-202020', 1.0, 0)
if (match) console.log(`基准点: ${match.x}, ${match.y}`)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `offsets` | `String` | 是 | — | 多点偏移，格式为 `x|y|颜色`，多个偏移点用逗号分隔。 |
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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findMultiColorE(x1, y1, x2, y2, 'ffffff-202020', '8|0|aabbcc-030303,-4|3|ddeeff-202020', 0.9, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `offsets` | `String` | 是 | — | 多点偏移，格式为 `x|y|颜色`，多个偏移点用逗号分隔。 |
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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findMultiColorEx(x1, y1, x2, y2, 'ffffff-202020', '8|0|aabbcc-030303,-4|3|ddeeff-202020', 0.9, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
dm.setPath('./assets/dm')
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
dm.loadPic('button.png')
const match = dm.findPic(x1, y1, x2, y2, 'button.png', '202020', 0.9, 0)
if (match) console.log(match.x, match.y)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
dm.setPath('./assets/dm')
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findPicE(x1, y1, x2, y2, 'button.png', '202020', 0.9, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
dm.setPath('./assets/dm')
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findPicEx(x1, y1, x2, y2, 'button.png', '202020', 0.9, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
dm.setPath('./assets/dm')
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findPicExS(x1, y1, x2, y2, 'button.png', '202020', 0.9, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `pictures` | `Object` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const template = dm.buffer(files.readBytes('./assets/dm/button.png'))
try {
  const match = dm.findPicMem(x1, y1, x2, y2, template, '202020', 0.9, 0)
  console.log(match)
} finally {
  template.close()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `pictures` | `Object` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const template = dm.buffer(files.readBytes('./assets/dm/button.png'))
try {
  const result = dm.findPicMemE(x1, y1, x2, y2, template, '202020', 0.9, 0)
  console.log(result)
} finally {
  template.close()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `pictures` | `Object` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const template = dm.buffer(files.readBytes('./assets/dm/button.png'))
try {
  const result = dm.findPicMemEx(x1, y1, x2, y2, template, '202020', 0.9, 0)
  console.log(result)
} finally {
  template.close()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
dm.setPath('./assets/dm')
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findPicS(x1, y1, x2, y2, 'button.png', '202020', 0.9, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
dm.setPath('./assets/dm')
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findPicSim(x1, y1, x2, y2, 'button.png', '202020', 90, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
dm.setPath('./assets/dm')
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findPicSimE(x1, y1, x2, y2, 'button.png', '202020', 90, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
dm.setPath('./assets/dm')
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findPicSimEx(x1, y1, x2, y2, 'button.png', '202020', 90, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `pictures` | `Object` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const template = dm.buffer(files.readBytes('./assets/dm/button.png'))
try {
  const result = dm.findPicSimMem(x1, y1, x2, y2, template, '202020', 90, 0)
  console.log(result)
} finally {
  template.close()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `pictures` | `Object` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const template = dm.buffer(files.readBytes('./assets/dm/button.png'))
try {
  const result = dm.findPicSimMemE(x1, y1, x2, y2, template, '202020', 90, 0)
  console.log(result)
} finally {
  template.close()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `pictures` | `Object` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
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

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const template = dm.buffer(files.readBytes('./assets/dm/button.png'))
try {
  const result = dm.findPicSimMemEx(x1, y1, x2, y2, template, '202020', 90, 0)
  console.log(result)
} finally {
  template.close()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

图片任务完成后按所有权释放 `DmBuffer`，并按需调用 `freePic()` 清理缓存。

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
| `shape` | `String` | 是 | — | 形状关系，格式为 `x|y|e`，多个关系用逗号分隔。 |
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

`shape` 使用 `x|y|e` 描述相对点关系，不使用颜色偏色格式；多个关系用逗号分隔。方向仅支持 `0–3`，普通接口返回一个 `DmMatch | null`，`Ex` 接口返回全部结果。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findShape(x1, y1, x2, y2, '1|0|1', 0.9, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `shape` | `String` | 是 | — | 形状关系，格式为 `x|y|e`，多个关系用逗号分隔。 |
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

`shape` 使用 `x|y|e` 描述相对点关系，不使用颜色偏色格式；多个关系用逗号分隔。方向仅支持 `0–3`，普通接口返回一个 `DmMatch | null`，`Ex` 接口返回全部结果。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findShapeE(x1, y1, x2, y2, '1|0|1', 0.9, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `shape` | `String` | 是 | — | 形状关系，格式为 `x|y|e`，多个关系用逗号分隔。 |
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

`shape` 使用 `x|y|e` 描述相对点关系，不使用颜色偏色格式；多个关系用逗号分隔。方向仅支持 `0–3`，普通接口返回一个 `DmMatch | null`，`Ex` 接口返回全部结果。

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findShapeEx(x1, y1, x2, y2, '1|0|1', 0.9, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
dm.setPath('./assets/dm')
const result = dm.freePic('button.png')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.getAveHSV(x1, y1, x2, y2)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.getAveRGB(x1, y1, x2, y2)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.getColor(x, y)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.getColorBGR(x, y)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.getColorHSV(x, y)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.getColorNum(x1, y1, x2, y2, 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
dm.setPath('./assets/dm')
const result = dm.getPicSize('button.png')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const frame = dm.getScreenData(x1, y1, x2, y2)
try {
  console.log(frame.size())
} finally {
  frame.close()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

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
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const frame = dm.getScreenDataBmp(x1, y1, x2, y2)
try {
  console.log(frame.size())
} finally {
  frame.close()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

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
const result = dm.imageToBmp('./assets/dm/output.bin', './assets/dm/output.bin')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `timeout` | `int` | 是 | — | 非负毫秒数。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.isDisplayDead(x1, y1, x2, y2, 1)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
dm.setPath('./assets/dm')
const result = dm.loadPic('button.png')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const data = files.readBytes('./assets/dm/button.png')
console.log(dm.loadPicByte(data, data.length, 'button.png'))
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
dm.setPath('./assets/dm')
const result = dm.matchPicName('button.png')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const result = dm.rgb2bgr('ffffff-202020')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `mode` | `int` | 是 | — | 排除区域模式编号；使用当前实现支持的模式。 |
| `code` | `String` | 是 | — | 排除区域描述字符串；为空表示清除对应配置。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setExcludeRegion(0, '')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `count` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setFindPicMultithreadCount(4)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `count` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setFindPicMultithreadLimit(4)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const result = dm.setPath('./assets/dm/output.bin')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const result = dm.setDisplayInput('screen')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

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
| `enabled` | `int` | 是 | — | 布尔开关；使用 `0/1` 或 `false/true`。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.enablePicCache(1)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const bytes = dm.buffer(files.readBytes('./assets/dm/input.bin'))
try {
  console.log(bytes.size())
} finally {
  bytes.close()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
dm.cancel()
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
dm.close()
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
console.log(dm.getFrameInfo())
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
console.log(dm.getLastFindTimings())
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `keep` | `boolean` | 是 | — | 布尔开关；使用 `0/1` 或 `false/true`。 |

#### 返回值

`undefined`。

#### 示例

```js
dm.keepScreen(true)
try {
  console.log(dm.getFrameInfo())
} finally {
  dm.keepScreen(false)
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  console.log(dm.getFrameInfo())
} finally {
  frame.recycle()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `enabled` | `boolean` | 是 | — | 布尔开关；使用 `0/1` 或 `false/true`。 |

#### 返回值

`undefined`。

#### 示例

```js
dm.setSimdEnabled(true)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
dm.useScreen()
console.log(dm.getFrameInfo())
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。


## 文字识别导航

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
| `entry` | `String` | 是 | — | 明文字库条目，格式为 `HEX$文字$指标$高度`。 |

#### 字库格式

字库使用 UTF-8 或 GB18030 明文条目 `HEX$文字$指标$高度`；Android 不支持加密字库和裸地址。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.addDict(0, '414243$确$0$16')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const result = dm.clearDict(0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `enabled` | `int` | 是 | — | 布尔开关；使用 `0/1` 或 `false/true`。 |

#### 识别参数

该设置在后续识别调用中生效；间距和行高参数必须为非负整数，`setExactOcr` 与 `enableShareDict` 使用 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.enableShareDict(1)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `color` | `String` | 是 | — | 六位 RGB 颜色表达式，不使用按键精灵的 BGR 顺序。 |
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const glyph = dm.fetchWord(x1, y1, x2, y2, 'ffffff-202020', '确')
if (glyph) {
  dm.addDict(0, glyph)
  dm.useDict(0)
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，`Fast` 只限制候选字形，不改变坐标含义。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findStr(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，`Fast` 只限制候选字形，不改变坐标含义。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findStrE(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，`Fast` 只限制候选字形，不改变坐标含义。

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findStrEx(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，`Fast` 只限制候选字形，不改变坐标含义。

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findStrExS(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，`Fast` 只限制候选字形，不改变坐标含义。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const hit = dm.findStrFast(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9)
if (hit) console.log(hit.value, hit.x, hit.y)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，`Fast` 只限制候选字形，不改变坐标含义。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findStrFastE(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，`Fast` 只限制候选字形，不改变坐标含义。

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findStrFastEx(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，`Fast` 只限制候选字形，不改变坐标含义。

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findStrFastExS(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，`Fast` 只限制候选字形，不改变坐标含义。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findStrFastS(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，`Fast` 只限制候选字形，不改变坐标含义。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findStrS(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `font` | `String` | 是 | — | 字体文件路径或 Android Typeface 名称。 |
| `size` | `int` | 是 | — | 字体像素大小；必须为正整数。 |
| `style` | `int` | 是 | — | 字体样式位：`1` 粗体、`2` 斜体、`4` 下划线、`8` 删除线，可组合。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，`Fast` 只限制候选字形，不改变坐标含义。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findStrWithFont(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9, 'sans-serif', 24, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `font` | `String` | 是 | — | 字体文件路径或 Android Typeface 名称。 |
| `size` | `int` | 是 | — | 字体像素大小；必须为正整数。 |
| `style` | `int` | 是 | — | 字体样式位：`1` 粗体、`2` 斜体、`4` 下划线、`8` 删除线，可组合。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，`Fast` 只限制候选字形，不改变坐标含义。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findStrWithFontE(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9, 'sans-serif', 24, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |
| `font` | `String` | 是 | — | 字体文件路径或 Android Typeface 名称。 |
| `size` | `int` | 是 | — | 字体像素大小；必须为正整数。 |
| `style` | `int` | 是 | — | 字体样式位：`1` 粗体、`2` 斜体、`4` 下划线、`8` 删除线，可组合。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### FindStr 返回语义

多个候选文字使用 `|` 分隔。普通接口返回首个 `DmMatch | null`，`Ex` 接口返回全部 `DmMatch[]`，`S` 接口的 `value` 为实际文字，`Fast` 只限制候选字形，不改变坐标含义。

#### 返回值

`DmMatch[]`；未命中或没有记录时为空数组。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.findStrWithFontEx(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9, 'sans-serif', 24, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `entry` | `int` | 是 | — | 明文字库条目，格式为 `HEX$文字$指标$高度`。 |

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
const result = dm.getDict(0, '414243$确$0$16')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.getDictCount(0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `text` | `String` | 是 | — | 待查找文字或字库文本；多个候选使用 `|` 分隔。 |
| `font` | `String` | 是 | — | 字体文件路径或 Android Typeface 名称。 |
| `size` | `int` | 是 | — | 字体像素大小；必须为正整数。 |
| `style` | `int` | 是 | — | 字体样式位：`1` 粗体、`2` 斜体、`4` 下划线、`8` 删除线，可组合。 |

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
const result = dm.getDictInfo('确定|取消', 'sans-serif', 24, 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.getNowDict()
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.getResultCount('确定$10$20|取消$30$20')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `index` | `int` | 是 | — | 字库槽位，Android 支持 `0–99`。 |

#### 兼容结果解析

仅对底层兼容结果字符串进行解析；索引从 `0` 开始，越界返回空值或 `null`，不会改变新 API 的自然返回值。

#### 返回值

`DmMatch`；索引越界时返回 `null`。

#### 示例

```js
const result = dm.getResultPos('确定$10$20|取消$30$20', 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.getWordResultCount('确定$10$20|取消$30$20')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `index` | `int` | 是 | — | 字库槽位，Android 支持 `0–99`。 |

#### 兼容结果解析

仅对底层兼容结果字符串进行解析；索引从 `0` 开始，越界返回空值或 `null`，不会改变新 API 的自然返回值。

#### 返回值

`DmMatch`；索引越界时返回 `null`。

#### 示例

```js
const result = dm.getWordResultPos('确定$10$20|取消$30$20', 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `index` | `int` | 是 | — | 字库槽位，Android 支持 `0–99`。 |

#### 兼容结果解析

仅对底层兼容结果字符串进行解析；索引从 `0` 开始，越界返回空值或 `null`，不会改变新 API 的自然返回值。

#### 返回值

`String`；失败值遵循 MonkeyKing Android 实现约定。

#### 示例

```js
const result = dm.getWordResultStr('确定$10$20|取消$30$20', 0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### 有字库与免字库

该接口使用当前字库把字符分组为词组。 返回数组中的每个元素包含 `value`、`x`、`y`、`width` 和 `height`；没有结果时为空数组。

#### 返回值

`DmMatch[]`；没有结果时为空数组。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.getWords(x1, y1, x2, y2, 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### 有字库与免字库

该接口不读取点阵字库，直接按图像连通区域返回词组。 返回数组中的每个元素包含 `value`、`x`、`y`、`width` 和 `height`；没有结果时为空数组。

#### 返回值

`DmMatch[]`；没有结果时为空数组。

#### 示例

```js
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const words = dm.getWordsNoDict(x1, y1, x2, y2, 'ffffff-202020')
console.log(words.length ? words : '未识别到词组')
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### OCR 颜色和分隔符

支持 RGB、HSV、灰度和 `b@` 背景色模式；颜色条件用 `|` 分隔。颜色表达式后可以追加分隔符，例如 `ffffff-202020,\\n`，返回值是拼接后的完整字符串；未识别到文字时返回空字符串。

#### 返回值

`string`；没有识别到文字时为空字符串。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const text = dm.ocr(x1, y1, x2, y2, 'ffffff-202020,\\n', 0.9)
console.log(text || '未识别到文字')
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### OCR 结构化结果

Android facade 已将 PC 的结果字符串适配为 `DmMatch[]`：`value` 是文字，`x/y/width/height` 是输入图像坐标。无结果返回空数组。

#### 返回值

`DmMatch[]`；没有结果时为空数组。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.ocrEx(x1, y1, x2, y2, 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### OCR 结构化结果

Android facade 已将 PC 的结果字符串适配为 `DmMatch[]`：`value` 是文字，`x/y/width/height` 是输入图像坐标。无结果返回空数组。

#### 返回值

`DmMatch[]`；没有结果时为空数组。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const x = 0, y = 0
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const result = dm.ocrExOne(x1, y1, x2, y2, 'ffffff-202020', 0.9)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `pictures` | `String` | 是 | — | 图片文件名或 `|` 分隔的多模板列表；相对路径基于 `setPath()`。 |
| `color` | `String` | 是 | — | 文字颜色表达式；支持 RGB、HSV、灰度、`|` 多颜色和 `b@` 背景色模式。 |
| `similarity` | `double` | 是 | — | 相似度，范围 `0.1–1.0`；数值越高越严格。 |

#### OCR 颜色格式

支持 RGB `RRGGBB-DRDGDB`、HSV `H.S.V-DH.DS.DV` 和灰度 `#40-0` 格式；多个条件使用 `|`。`b@` 表示按背景色匹配。只有 `ocr` 支持在颜色表达式后追加分隔符，例如 `ffffff,\\n`。
#### 文件输入

该接口直接读取图片文件，不会复用屏幕帧；文件路径基于 `setPath()`。

#### 返回值

`string`；没有识别到文字时为空字符串。

#### 示例

```js
dm.setPath('./assets/dm')
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const text = dm.ocrInFile(0, 0, 1079, 1919, 'screen.png', 'ffffff-202020', 0.9)
console.log(text || '文件中没有文字')
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

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
const result = dm.saveDict(0, './assets/dm/output.bin')
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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

该设置在后续识别调用中生效；间距和行高参数必须为非负整数，`setExactOcr` 与 `enableShareDict` 使用 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setColGapNoDict(1)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
console.log(dm.getDictCount(0))
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

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
  console.log(dm.setDictMem(0, dict, bytes.length))
} finally {
  dict.close()
}
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

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
| `enabled` | `int` | 是 | — | 布尔开关；使用 `0/1` 或 `false/true`。 |

#### 识别参数

该设置在后续识别调用中生效；间距和行高参数必须为非负整数，`setExactOcr` 与 `enableShareDict` 使用 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setExactOcr(1)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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

该设置在后续识别调用中生效；间距和行高参数必须为非负整数，`setExactOcr` 与 `enableShareDict` 使用 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setMinColGap(1)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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

该设置在后续识别调用中生效；间距和行高参数必须为非负整数，`setExactOcr` 与 `enableShareDict` 使用 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setMinRowGap(1)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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

该设置在后续识别调用中生效；间距和行高参数必须为非负整数，`setExactOcr` 与 `enableShareDict` 使用 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setRowGapNoDict(1)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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

该设置在后续识别调用中生效；间距和行高参数必须为非负整数，`setExactOcr` 与 `enableShareDict` 使用 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setWordGap(1)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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

该设置在后续识别调用中生效；间距和行高参数必须为非负整数，`setExactOcr` 与 `enableShareDict` 使用 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setWordGapNoDict(1)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `height` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |

#### 识别参数

该设置在后续识别调用中生效；间距和行高参数必须为非负整数，`setExactOcr` 与 `enableShareDict` 使用 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setWordLineHeight(64)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
| `height` | `int` | 是 | — | 非负整数；具体用途由函数名称决定。 |

#### 识别参数

该设置在后续识别调用中生效；间距和行高参数必须为非负整数，`setExactOcr` 与 `enableShareDict` 使用 `0/1`。修改后重新调用 OCR 或 FindStr 才会看到新设置的效果。

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setWordLineHeightNoDict(64)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

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
const result = dm.useDict(0)
console.log(result)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。

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
const blocks = dm.ocrAuto({ maxSideLen: 128, doAngle: false })
for (const block of blocks) console.log(block.text, block.confidence)
```

#### 注意事项

示例使用 Rhino 的 camelCase API；`device.width` 和 `device.height` 表示当前输入设备尺寸。

坐标必须属于当前输入帧；右下角坐标包含在扫描区域内。

未命中时按本条目的返回值说明处理，不要读取未初始化的输出变量。
