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


## 组合示例

```js
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const hit = dm.findStrFast(x1, y1, x2, y2, '确定|取消', 'ffffff-202020', 0.9)
if (hit == null) console.log('未命中')
const blocks = dm.getWordsNoDict(x1, y1, x2, y2, 'ffffff-202020')
console.log(blocks)
dm.close()
```
