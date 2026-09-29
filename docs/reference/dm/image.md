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
