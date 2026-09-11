# OcrOptions

`OcrOptions` 是 [ocr](../media/ocr.md) 主模块及三个固定引擎入口共享的选项对象。`region` 和 `mode` 由通用分派器处理；其余选项只由 MonkeyKing 6.7.0 的 Paddle 实现消费。ML Kit 与 Rapid 会忽略这些 Paddle 专用字段。

```ts
interface OcrOptions {
  region?: OmniRegion | null
  mode?: 'mlkit' | 'paddle' | 'rapid'

  cpuThreadNum?: number
  useSlim?: boolean
  useOpenCL?: boolean
  detLongSize?: number
  scoreThreshold?: number
  mergeLine?: boolean
  splitWords?: boolean
  useWordSegmentation?: boolean
  useRaw?: boolean
  raw?: boolean
  imageQuality?: number
  imageFormat?: string
}
```

<a id="p-region"></a>

## [p?] region

```ts
region?: OmniRegion | null
```

限制识别区域。属性省略或为 `undefined` 时识别整张图；显式为 `null` 时返回空数组，不启动引擎；提供矩形值时只识别该区域。

支持三种矩形表示：

- 四元素数组 `[x, y, width, height]`；整数按像素解释，小数区域值按 `OmniRegion` 的比例规则解释。
- `android.graphics.Rect`。
- `org.opencv.core.Rect`。

区域也可直接作为识别函数的位置参数：`ocr(image, region)` 等价于 `ocr(image, { region })`。`detect` 返回的边界会偏移回原图坐标系。

```js
const topHalf = ocr.detect('/sdcard/Download/page.png', {
  region: [0, 0, -1, 0.5],
})
```

## `mode`

```ts
mode?: 'mlkit' | 'paddle' | 'rapid'
```

只覆盖当前这一调用的引擎，不修改 `ocr.mode`。仅主模块 `ocr(...)`、`ocr.recognizeText(...)` 和 `ocr.detect(...)` 使用该字段；固定入口 `ocr.mlkit`、`ocr.paddle`、`ocr.rapid` 忽略它。未知模式会抛出 `WrappedIllegalArgumentException`。

## Paddle 推理选项

以下默认值来自 MonkeyKing 6.7.0 的运行时解析器。选项会传给插件或打包应用内置的 Paddle 引擎；实际支持范围仍取决于所选引擎实现。

| 属性 | 类型 | 默认值 | 运行时合同 |
| --- | --- | --- | --- |
| `cpuThreadNum` | `number` | `4` | 转为整数后作为 Paddle CPU 线程数。通用分派器不额外限制范围。 |
| `useSlim` | `boolean` | `true` | 选择精简模型配置。 |
| `useOpenCL` | `boolean` | `false` | 请求使用 OpenCL；设备或插件不支持时的处理由引擎决定。 |
| `detLongSize` | `number` | `0` | 转为整数后传入检测长边配置；`0` 表示保留引擎默认策略。 |
| `scoreThreshold` | `number` | `-1` | 转为浮点数后传入置信度阈值；`-1` 表示保留引擎默认策略。 |
| `mergeLine` | `boolean` | `false` | `detect` 后按行合并结果；`recognizeText` 不执行 MonkeyKing 的合并步骤。 |
| `splitWords` | `boolean` | `false` | 为 `true` 时强制禁用 MonkeyKing 的 `mergeLine` 后处理。 |
| `useWordSegmentation` | `boolean` | `false` | 为 `true` 时强制禁用 MonkeyKing 的 `mergeLine` 后处理。 |
| `useRaw` | `boolean` | `true` | Android API 27 及以上时请求把原始图像交给 Paddle 端。 |
| `raw` | `boolean` | `false` | 兼容启用开关；与 `useRaw` 做逻辑或。要禁用原图模式，应显式设置 `useRaw: false` 且不把 `raw` 设为 `true`。 |
| `imageQuality` | `number` | `-1` | 仅当转为整数后大于 `0` 才传给 Paddle 端。 |
| `imageFormat` | `string` | `''` | 仅非空白字符串会传给 Paddle 端。 |

### `mergeLine` 后处理

`mergeLine: true` 且 `splitWords`、`useWordSegmentation` 均为 `false` 时，`ocr.paddle.detect` 会先按版面顺序排序，再合并垂直中心足够接近的相邻结果：

- 文本直接拼接，不自动插入空格。
- 边界是各段矩形的并集。
- 置信度按各段文本长度加权平均，空文本权重至少为 `1`。

```js
const lines = ocr.paddle.detect('/sdcard/Download/document.jpg', {
  cpuThreadNum: 4,
  useSlim: true,
  scoreThreshold: 0.55,
  mergeLine: true,
})
```

## 权限、线程与错误

- 该对象本身不申请权限。省略图片时仍需屏幕捕获授权；文件路径仍需相应存储访问能力。
- 数字和布尔字段按 Rhino 转换规则解析；无法转换的值会抛出参数转换异常。
- Paddle 在 MonkeyKing 主应用中需要可用插件；无插件时调用失败。打包后的 INRT 应用使用内置引擎。
- OCR 调用在返回前完成推理，选项不会把入口改为异步调用。
