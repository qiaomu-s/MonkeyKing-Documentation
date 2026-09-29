# dm 图色导航

本页覆盖取色、颜色比较、颜色块、多点找色、找图、截图、图片缓存、图片尺寸、资源释放、屏幕输入和帧控制。所有示例均使用 camelCase。

### dm.appendPicAddr

<a id="api-symbol-ZG0uYXBwZW5kUGljQWRkcg"></a>

#### 签名

```js
dm.appendPicAddr(buffers, data, length)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `buffers` | `Object` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `data` | `Object` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `length` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`DmBuffer`；调用方负责 `close()`。

#### 示例

```js
const result = dm.appendPicAddr(buffers, data, length)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.bgr2rgb

<a id="api-symbol-ZG0uYmdyMnJnYg"></a>

#### 签名

```js
dm.bgr2rgb(color)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `color` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |

#### 返回值

`String`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.bgr2rgb(color)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.capture

<a id="api-symbol-ZG0uY2FwdHVyZQ"></a>

#### 签名

```js
dm.capture(x1, y1, x2, y2, file)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `file` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.capture(x1, y1, x2, y2, file)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.captureGif

<a id="api-symbol-ZG0uY2FwdHVyZUdpZg"></a>

#### 签名

```js
dm.captureGif(x1, y1, x2, y2, file, delay, duration)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `file` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delay` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `duration` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.captureGif(x1, y1, x2, y2, file, delay, duration)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.captureJpg

<a id="api-symbol-ZG0uY2FwdHVyZUpwZw"></a>

#### 签名

```js
dm.captureJpg(x1, y1, x2, y2, file, quality)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `file` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `quality` | `int` | 是 | — | 功能开关或质量参数；取值范围见设备实现。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.captureJpg(x1, y1, x2, y2, file, quality)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.capturePng

<a id="api-symbol-ZG0uY2FwdHVyZVBuZw"></a>

#### 签名

```js
dm.capturePng(x1, y1, x2, y2, file)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `file` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.capturePng(x1, y1, x2, y2, file)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.capturePre

<a id="api-symbol-ZG0uY2FwdHVyZVByZQ"></a>

#### 签名

```js
dm.capturePre(file)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `file` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.capturePre(file)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.cmpColor

<a id="api-symbol-ZG0uY21wQ29sb3I"></a>

#### 签名

```js
dm.cmpColor(x, y, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.cmpColor(x, y, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.enableDisplayDebug

<a id="api-symbol-ZG0uZW5hYmxlRGlzcGxheURlYnVn"></a>

#### 签名

```js
dm.enableDisplayDebug(enabled)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `int` | 是 | — | 功能开关或质量参数；取值范围见设备实现。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.enableDisplayDebug(enabled)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.enableFindPicMultithread

<a id="api-symbol-ZG0uZW5hYmxlRmluZFBpY011bHRpdGhyZWFk"></a>

#### 签名

```js
dm.enableFindPicMultithread(enabled)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `int` | 是 | — | 功能开关或质量参数；取值范围见设备实现。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.enableFindPicMultithread(enabled)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.enableGetColorByCapture

<a id="api-symbol-ZG0uZW5hYmxlR2V0Q29sb3JCeUNhcHR1cmU"></a>

#### 签名

```js
dm.enableGetColorByCapture(enabled)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `int` | 是 | — | 功能开关或质量参数；取值范围见设备实现。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.enableGetColorByCapture(enabled)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findColor

<a id="api-symbol-ZG0uZmluZENvbG9y"></a>

#### 签名

```js
dm.findColor(x1, y1, x2, y2, color, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 颜色格式与相似度

`color` 使用 `RRGGBB-DRDGDB` 格式，例如 `123456-000000|aabbcc-030303`。多个条件使用 `|` 分隔；在整个表达式前加 `@` 可启用反色模式，匹配不属于指定颜色条件的颜色，例如 `@123456-000000|aabbcc-030303`。该参数只支持 RGB 颜色。

`similarity` 取值范围为 `0.1` 到 `1.0`；值越高，匹配越严格。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const match = dm.findColor(0, 0, device.width - 1, device.height - 1, '@123456-000000|aabbcc-030303', 1.0, 0)
if (match) console.log(match.x, match.y)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findColorBlock

<a id="api-symbol-ZG0uZmluZENvbG9yQmxvY2s"></a>

#### 签名

```js
dm.findColorBlock(x1, y1, x2, y2, color, similarity, count, width, height)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `count` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `width` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `height` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findColorBlock(x1, y1, x2, y2, color, similarity, count, width, height)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findColorBlockEx

<a id="api-symbol-ZG0uZmluZENvbG9yQmxvY2tFeA"></a>

#### 签名

```js
dm.findColorBlockEx(x1, y1, x2, y2, color, similarity, count, width, height)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `count` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `width` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `height` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findColorBlockEx(x1, y1, x2, y2, color, similarity, count, width, height)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findColorE

<a id="api-symbol-ZG0uZmluZENvbG9yRQ"></a>

#### 签名

```js
dm.findColorE(x1, y1, x2, y2, color, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 颜色格式与相似度

`color` 使用 `RRGGBB-DRDGDB` 格式，例如 `123456-000000|aabbcc-030303`。多个条件使用 `|` 分隔；在整个表达式前加 `@` 可启用反色模式，匹配不属于指定颜色条件的颜色，例如 `@123456-000000|aabbcc-030303`。该参数只支持 RGB 颜色。

`similarity` 取值范围为 `0.1` 到 `1.0`；值越高，匹配越严格。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findColorE(x1, y1, x2, y2, color, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findColorEx

<a id="api-symbol-ZG0uZmluZENvbG9yRXg"></a>

#### 签名

```js
dm.findColorEx(x1, y1, x2, y2, color, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 颜色格式与相似度

`color` 使用 `RRGGBB-DRDGDB` 格式，例如 `123456-000000|aabbcc-030303`。多个条件使用 `|` 分隔；在整个表达式前加 `@` 可启用反色模式，匹配不属于指定颜色条件的颜色，例如 `@123456-000000|aabbcc-030303`。该参数只支持 RGB 颜色。

`similarity` 取值范围为 `0.1` 到 `1.0`；值越高，匹配越严格。

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findColorEx(x1, y1, x2, y2, color, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findMulColor

<a id="api-symbol-ZG0uZmluZE11bENvbG9y"></a>

#### 签名

```js
dm.findMulColor(x1, y1, x2, y2, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findMulColor(x1, y1, x2, y2, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findMultiColor

<a id="api-symbol-ZG0uZmluZE11bHRpQ29sb3I"></a>

#### 签名

```js
dm.findMultiColor(x1, y1, x2, y2, color, offsets, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `offsets` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 颜色格式与相似度

`color` 使用 `RRGGBB-DRDGDB` 格式，例如 `123456-000000|aabbcc-030303`。多个条件使用 `|` 分隔；在整个表达式前加 `@` 可启用反色模式，匹配不属于指定颜色条件的颜色，例如 `@123456-000000|aabbcc-030303`。该参数只支持 RGB 颜色。

`similarity` 取值范围为 `0.1` 到 `1.0`；值越高，匹配越严格。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findMultiColor(x1, y1, x2, y2, color, offsets, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findMultiColorE

<a id="api-symbol-ZG0uZmluZE11bHRpQ29sb3JF"></a>

#### 签名

```js
dm.findMultiColorE(x1, y1, x2, y2, color, offsets, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `offsets` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 颜色格式与相似度

`color` 使用 `RRGGBB-DRDGDB` 格式，例如 `123456-000000|aabbcc-030303`。多个条件使用 `|` 分隔；在整个表达式前加 `@` 可启用反色模式，匹配不属于指定颜色条件的颜色，例如 `@123456-000000|aabbcc-030303`。该参数只支持 RGB 颜色。

`similarity` 取值范围为 `0.1` 到 `1.0`；值越高，匹配越严格。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findMultiColorE(x1, y1, x2, y2, color, offsets, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findMultiColorEx

<a id="api-symbol-ZG0uZmluZE11bHRpQ29sb3JFeA"></a>

#### 签名

```js
dm.findMultiColorEx(x1, y1, x2, y2, color, offsets, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `offsets` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 颜色格式与相似度

`color` 使用 `RRGGBB-DRDGDB` 格式，例如 `123456-000000|aabbcc-030303`。多个条件使用 `|` 分隔；在整个表达式前加 `@` 可启用反色模式，匹配不属于指定颜色条件的颜色，例如 `@123456-000000|aabbcc-030303`。该参数只支持 RGB 颜色。

`similarity` 取值范围为 `0.1` 到 `1.0`；值越高，匹配越严格。

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findMultiColorEx(x1, y1, x2, y2, color, offsets, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPic

<a id="api-symbol-ZG0uZmluZFBpYw"></a>

#### 签名

```js
dm.findPic(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findPic(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPicE

<a id="api-symbol-ZG0uZmluZFBpY0U"></a>

#### 签名

```js
dm.findPicE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findPicE(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPicEx

<a id="api-symbol-ZG0uZmluZFBpY0V4"></a>

#### 签名

```js
dm.findPicEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findPicEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPicExS

<a id="api-symbol-ZG0uZmluZFBpY0V4Uw"></a>

#### 签名

```js
dm.findPicExS(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findPicExS(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPicMem

<a id="api-symbol-ZG0uZmluZFBpY01lbQ"></a>

#### 签名

```js
dm.findPicMem(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `Object` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findPicMem(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPicMemE

<a id="api-symbol-ZG0uZmluZFBpY01lbUU"></a>

#### 签名

```js
dm.findPicMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `Object` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findPicMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPicMemEx

<a id="api-symbol-ZG0uZmluZFBpY01lbUV4"></a>

#### 签名

```js
dm.findPicMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `Object` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findPicMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPicS

<a id="api-symbol-ZG0uZmluZFBpY1M"></a>

#### 签名

```js
dm.findPicS(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findPicS(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPicSim

<a id="api-symbol-ZG0uZmluZFBpY1NpbQ"></a>

#### 签名

```js
dm.findPicSim(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `int` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findPicSim(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPicSimE

<a id="api-symbol-ZG0uZmluZFBpY1NpbUU"></a>

#### 签名

```js
dm.findPicSimE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `int` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findPicSimE(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPicSimEx

<a id="api-symbol-ZG0uZmluZFBpY1NpbUV4"></a>

#### 签名

```js
dm.findPicSimEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `int` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findPicSimEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPicSimMem

<a id="api-symbol-ZG0uZmluZFBpY1NpbU1lbQ"></a>

#### 签名

```js
dm.findPicSimMem(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `Object` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `int` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findPicSimMem(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPicSimMemE

<a id="api-symbol-ZG0uZmluZFBpY1NpbU1lbUU"></a>

#### 签名

```js
dm.findPicSimMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `Object` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `int` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findPicSimMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findPicSimMemEx

<a id="api-symbol-ZG0uZmluZFBpY1NpbU1lbUV4"></a>

#### 签名

```js
dm.findPicSimMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `Object` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `delta` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `int` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findPicSimMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findShape

<a id="api-symbol-ZG0uZmluZFNoYXBl"></a>

#### 签名

```js
dm.findShape(x1, y1, x2, y2, shape, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `shape` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findShape(x1, y1, x2, y2, shape, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findShapeE

<a id="api-symbol-ZG0uZmluZFNoYXBlRQ"></a>

#### 签名

```js
dm.findShapeE(x1, y1, x2, y2, shape, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `shape` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findShapeE(x1, y1, x2, y2, shape, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findShapeEx

<a id="api-symbol-ZG0uZmluZFNoYXBlRXg"></a>

#### 签名

```js
dm.findShapeEx(x1, y1, x2, y2, shape, similarity, direction)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `shape` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |
| `direction` | `int` | 是 | — | 扫描方向编号；保持与设备端和示例一致。 |

#### 扫描方向

`direction` 使用以下扫描顺序：

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

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findShapeEx(x1, y1, x2, y2, shape, similarity, direction)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.freePic

<a id="api-symbol-ZG0uZnJlZVBpYw"></a>

#### 签名

```js
dm.freePic(pictures)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.freePic(pictures)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getAveHSV

<a id="api-symbol-ZG0uZ2V0QXZlSFNW"></a>

#### 签名

```js
dm.getAveHSV(x1, y1, x2, y2)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |

#### 返回值

`String`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.getAveHSV(x1, y1, x2, y2)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getAveRGB

<a id="api-symbol-ZG0uZ2V0QXZlUkdC"></a>

#### 签名

```js
dm.getAveRGB(x1, y1, x2, y2)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |

#### 返回值

`String`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.getAveRGB(x1, y1, x2, y2)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getColor

<a id="api-symbol-ZG0uZ2V0Q29sb3I"></a>

#### 签名

```js
dm.getColor(x, y)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |

#### 返回值

`String`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.getColor(x, y)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getColorBGR

<a id="api-symbol-ZG0uZ2V0Q29sb3JCR1I"></a>

#### 签名

```js
dm.getColorBGR(x, y)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |

#### 返回值

`String`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.getColorBGR(x, y)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getColorHSV

<a id="api-symbol-ZG0uZ2V0Q29sb3JIU1Y"></a>

#### 签名

```js
dm.getColorHSV(x, y)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |

#### 返回值

`String`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.getColorHSV(x, y)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getColorNum

<a id="api-symbol-ZG0uZ2V0Q29sb3JOdW0"></a>

#### 签名

```js
dm.getColorNum(x1, y1, x2, y2, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |
| `similarity` | `double` | 是 | — | 相似度，通常为 `0.0` 到 `1.0`；值越高越严格。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.getColorNum(x1, y1, x2, y2, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getPicSize

<a id="api-symbol-ZG0uZ2V0UGljU2l6ZQ"></a>

#### 签名

```js
dm.getPicSize(pictures)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |

#### 返回值

`String`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.getPicSize(pictures)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getScreenData

<a id="api-symbol-ZG0uZ2V0U2NyZWVuRGF0YQ"></a>

#### 签名

```js
dm.getScreenData(x1, y1, x2, y2)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |

#### 返回值

`DmBuffer`；调用方负责 `close()`。

#### 示例

```js
const result = dm.getScreenData(x1, y1, x2, y2)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getScreenDataBmp

<a id="api-symbol-ZG0uZ2V0U2NyZWVuRGF0YUJtcA"></a>

#### 签名

```js
dm.getScreenDataBmp(x1, y1, x2, y2)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |

#### 返回值

`DmBuffer`；调用方负责 `close()`。

#### 示例

```js
const result = dm.getScreenDataBmp(x1, y1, x2, y2)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.imageToBmp

<a id="api-symbol-ZG0uaW1hZ2VUb0JtcA"></a>

#### 签名

```js
dm.imageToBmp(input, output)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `input` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `output` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.imageToBmp(input, output)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.isDisplayDead

<a id="api-symbol-ZG0uaXNEaXNwbGF5RGVhZA"></a>

#### 签名

```js
dm.isDisplayDead(x1, y1, x2, y2, timeout)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `timeout` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.isDisplayDead(x1, y1, x2, y2, timeout)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.loadPic

<a id="api-symbol-ZG0ubG9hZFBpYw"></a>

#### 签名

```js
dm.loadPic(pictures)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.loadPic(pictures)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.loadPicByte

<a id="api-symbol-ZG0ubG9hZFBpY0J5dGU"></a>

#### 签名

```js
dm.loadPicByte(data, length, pictures)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `data` | `Object` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `length` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.loadPicByte(data, length, pictures)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.matchPicName

<a id="api-symbol-ZG0ubWF0Y2hQaWNOYW1l"></a>

#### 签名

```js
dm.matchPicName(pictures)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |

#### 返回值

`String`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.matchPicName(pictures)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.rgb2bgr

<a id="api-symbol-ZG0ucmdiMmJncg"></a>

#### 签名

```js
dm.rgb2bgr(color)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `color` | `String` | 是 | — | 六位十六进制颜色；多颜色条件按接口格式传入。 |

#### 返回值

`String`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.rgb2bgr(color)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setExcludeRegion

<a id="api-symbol-ZG0uc2V0RXhjbHVkZVJlZ2lvbg"></a>

#### 签名

```js
dm.setExcludeRegion(mode, code)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `mode` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `code` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setExcludeRegion(mode, code)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setFindPicMultithreadCount

<a id="api-symbol-ZG0uc2V0RmluZFBpY011bHRpdGhyZWFkQ291bnQ"></a>

#### 签名

```js
dm.setFindPicMultithreadCount(count)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `count` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setFindPicMultithreadCount(count)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setFindPicMultithreadLimit

<a id="api-symbol-ZG0uc2V0RmluZFBpY011bHRpdGhyZWFkTGltaXQ"></a>

#### 签名

```js
dm.setFindPicMultithreadLimit(count)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `count` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setFindPicMultithreadLimit(count)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setPicPwd

<a id="api-symbol-ZG0uc2V0UGljUHdk"></a>

#### 签名

```js
dm.setPicPwd(password)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `password` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setPicPwd(password)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setPath

<a id="api-symbol-ZG0uc2V0UGF0aA"></a>

#### 签名

```js
dm.setPath(path)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `path` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setPath(path)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setDisplayInput

<a id="api-symbol-ZG0uc2V0RGlzcGxheUlucHV0"></a>

#### 签名

```js
dm.setDisplayInput(source)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `source` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setDisplayInput(source)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.enablePicCache

<a id="api-symbol-ZG0uZW5hYmxlUGljQ2FjaGU"></a>

#### 签名

```js
dm.enablePicCache(enabled)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `int` | 是 | — | 功能开关或质量参数；取值范围见设备实现。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.enablePicCache(enabled)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.buffer

<a id="api-symbol-ZG0uYnVmZmVy"></a>

#### 签名

```js
dm.buffer(bytes)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `bytes` | `byte[]` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`DmBuffer`；调用方负责 `close()`。

#### 示例

```js
const result = dm.buffer(bytes)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.keepScreen

<a id="api-symbol-ZG0ua2VlcFNjcmVlbg"></a>

#### 签名

```js
dm.keepScreen(keep)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `keep` | `boolean` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`void`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.keepScreen(keep)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setImage

<a id="api-symbol-ZG0uc2V0SW1hZ2U"></a>

#### 签名

```js
dm.setImage(image)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `image` | `Object` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`void`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.setImage(image)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.useScreen

<a id="api-symbol-ZG0udXNlU2NyZWVu"></a>

#### 签名

```js
dm.useScreen()
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| — | — | — | — | 无参数。 |

#### 返回值

`void`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.useScreen()
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。
