# dm 文字识别导航

本页覆盖 OCR、FindStr、无字库识别、结果解析、字库加载与切换、字间距和行高配置。所有示例均使用 camelCase。

### dm.addDict

<a id="api-symbol-ZG0uYWRkRGljdA"></a>

#### 签名

```js
dm.addDict(index, entry)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位或结果索引，必须是非负整数。 |
| `entry` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.addDict(index, entry)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.clearDict

<a id="api-symbol-ZG0uY2xlYXJEaWN0"></a>

#### 签名

```js
dm.clearDict(index)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位或结果索引，必须是非负整数。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.clearDict(index)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.enableShareDict

<a id="api-symbol-ZG0uZW5hYmxlU2hhcmVEaWN0"></a>

#### 签名

```js
dm.enableShareDict(enabled)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `int` | 是 | — | 功能开关或质量参数；取值范围见设备实现。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.enableShareDict(enabled)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.fetchWord

<a id="api-symbol-ZG0uZmV0Y2hXb3Jk"></a>

#### 签名

```js
dm.fetchWord(x1, y1, x2, y2, color, text)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 六位十六进制 RGB 颜色或设备支持的颜色表达式。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |

#### 返回值

`String`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.fetchWord(x1, y1, x2, y2, color, text)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findStr

<a id="api-symbol-ZG0uZmluZFN0cg"></a>

#### 签名

```js
dm.findStr(x1, y1, x2, y2, text, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findStr(x1, y1, x2, y2, text, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findStrE

<a id="api-symbol-ZG0uZmluZFN0ckU"></a>

#### 签名

```js
dm.findStrE(x1, y1, x2, y2, text, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findStrE(x1, y1, x2, y2, text, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findStrEx

<a id="api-symbol-ZG0uZmluZFN0ckV4"></a>

#### 签名

```js
dm.findStrEx(x1, y1, x2, y2, text, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findStrEx(x1, y1, x2, y2, text, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findStrExS

<a id="api-symbol-ZG0uZmluZFN0ckV4Uw"></a>

#### 签名

```js
dm.findStrExS(x1, y1, x2, y2, text, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findStrExS(x1, y1, x2, y2, text, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findStrFast

<a id="api-symbol-ZG0uZmluZFN0ckZhc3Q"></a>

#### 签名

```js
dm.findStrFast(x1, y1, x2, y2, text, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findStrFast(x1, y1, x2, y2, text, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findStrFastE

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RF"></a>

#### 签名

```js
dm.findStrFastE(x1, y1, x2, y2, text, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findStrFastE(x1, y1, x2, y2, text, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findStrFastEx

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RFeA"></a>

#### 签名

```js
dm.findStrFastEx(x1, y1, x2, y2, text, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findStrFastEx(x1, y1, x2, y2, text, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findStrFastExS

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RFeFM"></a>

#### 签名

```js
dm.findStrFastExS(x1, y1, x2, y2, text, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findStrFastExS(x1, y1, x2, y2, text, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findStrFastS

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RT"></a>

#### 签名

```js
dm.findStrFastS(x1, y1, x2, y2, text, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findStrFastS(x1, y1, x2, y2, text, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findStrS

<a id="api-symbol-ZG0uZmluZFN0clM"></a>

#### 签名

```js
dm.findStrS(x1, y1, x2, y2, text, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findStrS(x1, y1, x2, y2, text, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findStrWithFont

<a id="api-symbol-ZG0uZmluZFN0cldpdGhGb250"></a>

#### 签名

```js
dm.findStrWithFont(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |
| `font` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `size` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `style` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findStrWithFont(x1, y1, x2, y2, text, color, similarity, font, size, style)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findStrWithFontE

<a id="api-symbol-ZG0uZmluZFN0cldpdGhGb250RQ"></a>

#### 签名

```js
dm.findStrWithFontE(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |
| `font` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `size` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `style` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.findStrWithFontE(x1, y1, x2, y2, text, color, similarity, font, size, style)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.findStrWithFontEx

<a id="api-symbol-ZG0uZmluZFN0cldpdGhGb250RXg"></a>

#### 签名

```js
dm.findStrWithFontEx(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |
| `font` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `size` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `style` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch[]`；未命中时为空数组。

#### 示例

```js
const result = dm.findStrWithFontEx(x1, y1, x2, y2, text, color, similarity, font, size, style)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getDict

<a id="api-symbol-ZG0uZ2V0RGljdA"></a>

#### 签名

```js
dm.getDict(index, entry)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位或结果索引，必须是非负整数。 |
| `entry` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`String`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.getDict(index, entry)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getDictCount

<a id="api-symbol-ZG0uZ2V0RGljdENvdW50"></a>

#### 签名

```js
dm.getDictCount(index)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位或结果索引，必须是非负整数。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.getDictCount(index)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getDictInfo

<a id="api-symbol-ZG0uZ2V0RGljdEluZm8"></a>

#### 签名

```js
dm.getDictInfo(text, font, size, style)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `text` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `font` | `String` | 是 | — | 待识别文字、字体名或字典文本。 |
| `size` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `style` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`String`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.getDictInfo(text, font, size, style)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getNowDict

<a id="api-symbol-ZG0uZ2V0Tm93RGljdA"></a>

#### 签名

```js
dm.getNowDict()
```

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

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getResultCount

<a id="api-symbol-ZG0uZ2V0UmVzdWx0Q291bnQ"></a>

#### 签名

```js
dm.getResultCount(results)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `results` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.getResultCount(results)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getResultPos

<a id="api-symbol-ZG0uZ2V0UmVzdWx0UG9z"></a>

#### 签名

```js
dm.getResultPos(results, index)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `results` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `index` | `int` | 是 | — | 字库槽位或结果索引，必须是非负整数。 |

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.getResultPos(results, index)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getWordResultCount

<a id="api-symbol-ZG0uZ2V0V29yZFJlc3VsdENvdW50"></a>

#### 签名

```js
dm.getWordResultCount(results)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `results` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.getWordResultCount(results)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getWordResultPos

<a id="api-symbol-ZG0uZ2V0V29yZFJlc3VsdFBvcw"></a>

#### 签名

```js
dm.getWordResultPos(results, index)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `results` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `index` | `int` | 是 | — | 字库槽位或结果索引，必须是非负整数。 |

#### 返回值

`DmMatch`；未命中时为 `null`。

#### 示例

```js
const result = dm.getWordResultPos(results, index)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getWordResultStr

<a id="api-symbol-ZG0uZ2V0V29yZFJlc3VsdFN0cg"></a>

#### 签名

```js
dm.getWordResultStr(results, index)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `results` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `index` | `int` | 是 | — | 字库槽位或结果索引，必须是非负整数。 |

#### 返回值

`String`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.getWordResultStr(results, index)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getWords

<a id="api-symbol-ZG0uZ2V0V29yZHM"></a>

#### 签名

```js
dm.getWords(x1, y1, x2, y2, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch[]`；无结果时为空数组。

#### 示例

```js
const result = dm.getWords(x1, y1, x2, y2, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getWordsNoDict

<a id="api-symbol-ZG0uZ2V0V29yZHNOb0RpY3Q"></a>

#### 签名

```js
dm.getWordsNoDict(x1, y1, x2, y2, color)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch[]`；无结果时为空数组。

#### 示例

```js
const result = dm.getWordsNoDict(x1, y1, x2, y2, color)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.ocr

<a id="api-symbol-ZG0ub2Ny"></a>

#### 签名

```js
dm.ocr(x1, y1, x2, y2, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`string`；未识别到文字时为空字符串。

#### 示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const text = dm.ocr(0, 0, device.width - 1, device.height - 1, 'ffffff', 0.9)
console.log(text)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.ocrEx

<a id="api-symbol-ZG0ub2NyRXg"></a>

#### 签名

```js
dm.ocrEx(x1, y1, x2, y2, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch[]`；无结果时为空数组。

#### 示例

```js
const result = dm.ocrEx(x1, y1, x2, y2, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.ocrExOne

<a id="api-symbol-ZG0ub2NyRXhPbmU"></a>

#### 签名

```js
dm.ocrExOne(x1, y1, x2, y2, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`DmMatch[]`；无结果时为空数组。

#### 示例

```js
const result = dm.ocrExOne(x1, y1, x2, y2, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.ocrInFile

<a id="api-symbol-ZG0ub2NySW5GaWxl"></a>

#### 签名

```js
dm.ocrInFile(x1, y1, x2, y2, pictures, color, similarity)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `x1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y1` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `x2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `y2` | `int` | 是 | — | 输入图像中的像素坐标；右下边界包含在区域内。 |
| `pictures` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |
| `color` | `String` | 是 | — | 文字颜色表达式，支持 RGB、HSV 和灰度格式；详细规则见下方说明。 |
| `similarity` | `double` | 是 | — | 相似度，取值范围为 `0.1` 到 `1.0`；值越高越严格。 |

#### OCR 颜色格式与返回串

颜色表达式支持 RGB、HSV 和灰度格式：RGB 使用 `RRGGBB-DRDGDB`，HSV 使用 `H.S.V-DH.DS.DV`，灰度使用带 `#` 的两位十六进制值及可选偏差，例如 `#40-0`。多个颜色条件使用 `|` 分隔；`Ocr` 的颜色表达式后的逗号内容作为识别结果的换行分隔符，例如 `ffffff,\\n`。也支持在最前面使用 `b@` 表示按背景色匹配。

官方兼容返回格式为：`OcrEx` 返回 `字符$x$y|字符$x$y`，`OcrExOne` 返回 `文字|x,y|x,y`。MonkeyKing 的 camelCase facade 将这两种结果适配为 `DmMatch[]`，底层兼容入口仍保留原始返回串。

#### 返回值

`string`；无结果时为空字符串。

#### 示例

```js
const result = dm.ocrInFile(x1, y1, x2, y2, pictures, color, similarity)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.saveDict

<a id="api-symbol-ZG0uc2F2ZURpY3Q"></a>

#### 签名

```js
dm.saveDict(index, file)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位或结果索引，必须是非负整数。 |
| `file` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.saveDict(index, file)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setColGapNoDict

<a id="api-symbol-ZG0uc2V0Q29sR2FwTm9EaWN0"></a>

#### 签名

```js
dm.setColGapNoDict(gap)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `gap` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setColGapNoDict(gap)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setDict

<a id="api-symbol-ZG0uc2V0RGljdA"></a>

#### 签名

```js
dm.setDict(index, file)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位或结果索引，必须是非负整数。 |
| `file` | `String` | 是 | — | 资源文件名或相对路径；先设置资源根目录。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setDict(index, file)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setDictMem

<a id="api-symbol-ZG0uc2V0RGljdE1lbQ"></a>

#### 签名

```js
dm.setDictMem(index, data, length)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位或结果索引，必须是非负整数。 |
| `data` | `Object` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |
| `length` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setDictMem(index, data, length)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setDictPwd

<a id="api-symbol-ZG0uc2V0RGljdFB3ZA"></a>

#### 签名

```js
dm.setDictPwd(password)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `password` | `String` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setDictPwd(password)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setExactOcr

<a id="api-symbol-ZG0uc2V0RXhhY3RPY3I"></a>

#### 签名

```js
dm.setExactOcr(enabled)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `int` | 是 | — | 功能开关或质量参数；取值范围见设备实现。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setExactOcr(enabled)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setMinColGap

<a id="api-symbol-ZG0uc2V0TWluQ29sR2Fw"></a>

#### 签名

```js
dm.setMinColGap(gap)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `gap` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setMinColGap(gap)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setMinRowGap

<a id="api-symbol-ZG0uc2V0TWluUm93R2Fw"></a>

#### 签名

```js
dm.setMinRowGap(gap)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `gap` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setMinRowGap(gap)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setRowGapNoDict

<a id="api-symbol-ZG0uc2V0Um93R2FwTm9EaWN0"></a>

#### 签名

```js
dm.setRowGapNoDict(gap)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `gap` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setRowGapNoDict(gap)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setWordGap

<a id="api-symbol-ZG0uc2V0V29yZEdhcA"></a>

#### 签名

```js
dm.setWordGap(gap)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `gap` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setWordGap(gap)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setWordGapNoDict

<a id="api-symbol-ZG0uc2V0V29yZEdhcE5vRGljdA"></a>

#### 签名

```js
dm.setWordGapNoDict(gap)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `gap` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setWordGapNoDict(gap)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setWordLineHeight

<a id="api-symbol-ZG0uc2V0V29yZExpbmVIZWlnaHQ"></a>

#### 签名

```js
dm.setWordLineHeight(height)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `height` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setWordLineHeight(height)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setWordLineHeightNoDict

<a id="api-symbol-ZG0uc2V0V29yZExpbmVIZWlnaHROb0RpY3Q"></a>

#### 签名

```js
dm.setWordLineHeightNoDict(height)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `height` | `int` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.setWordLineHeightNoDict(height)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.useDict

<a id="api-symbol-ZG0udXNlRGljdA"></a>

#### 签名

```js
dm.useDict(index)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `index` | `int` | 是 | — | 字库槽位或结果索引，必须是非负整数。 |

#### 返回值

`number`；成功通常为 `1`，失败为 `0`。

#### 示例

```js
const result = dm.useDict(index)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.cancel

<a id="api-symbol-ZG0uY2FuY2Vs"></a>

#### 签名

```js
dm.cancel()
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| — | — | — | — | 无参数。 |

#### 返回值

`void`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.cancel()
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.close

<a id="api-symbol-ZG0uY2xvc2U"></a>

#### 签名

```js
dm.close()
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| — | — | — | — | 无参数。 |

#### 返回值

`void`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.close()
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getFrameInfo

<a id="api-symbol-ZG0uZ2V0RnJhbWVJbmZv"></a>

#### 签名

```js
dm.getFrameInfo()
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| — | — | — | — | 无参数。 |

#### 返回值

`Bundle`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.getFrameInfo()
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.getLastFindTimings

<a id="api-symbol-ZG0uZ2V0TGFzdEZpbmRUaW1pbmdz"></a>

#### 签名

```js
dm.getLastFindTimings()
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| — | — | — | — | 无参数。 |

#### 返回值

`Map`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.getLastFindTimings()
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.ocrAuto

<a id="api-symbol-ZG0ub2NyQXV0bw"></a>

#### 签名

```js
dm.ocrAuto(options)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `options` | `Map` | 是 | — | 按接口类型传入；不可传入 Java 内部对象。 |

#### 返回值

`string`；无结果时为空字符串。

#### 示例

```js
const result = dm.ocrAuto(options)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。

### dm.setSimdEnabled

<a id="api-symbol-ZG0uc2V0U2ltZEVuYWJsZWQ"></a>

#### 签名

```js
dm.setSimdEnabled(enabled)
```

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `boolean` | 是 | — | 功能开关或质量参数；取值范围见设备实现。 |

#### 返回值

`void`；具体失败值遵循底层命令约定。

#### 示例

```js
const result = dm.setSimdEnabled(enabled)
console.log(result)
```

#### 注意事项

坐标必须落在当前屏幕、文件或冻结帧范围内；颜色使用不带 `#` 的 RGB 十六进制字符串。识别或找图前确认输入帧已设置，重复调用时可配合 `dm.keepScreen(true)` 复用同一帧。涉及图片或字库的资源在任务结束后释放，`DmBuffer` 使用完必须调用 `close()`。


## 组合示例

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const hit = dm.findStrFast(0, 0, device.width - 1, device.height - 1, '确定', 'ffffff', 0.9)
if (hit == null) console.log('未命中')
const blocks = dm.getWordsNoDict(0, 0, device.width - 1, device.height - 1, 'ffffff')
console.log(blocks)
dm.close()
```
