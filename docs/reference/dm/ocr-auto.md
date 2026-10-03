# 独立 OCR 迁移指南

通用模型识别使用独立 `ocr` 模块。DM 的 `dm.ocr`、`dm.ocrInFile`、`dm.ocrEx`、`dm.ocrExOne` 和正常字库识别继续使用 DM 点阵字库；它们不会自动切换到模型 OCR。迁移模型识别代码时，直接传入图片，不需要设置 DM 输入源。

## 十二个识别入口

| 模块 | 文本快捷调用 | 文本识别 | 结构化检测 |
| --- | --- | --- | --- |
| 当前模式 | `ocr(...)` | `ocr.recognizeText(...)` | `ocr.detect(...)` |
| ML Kit | `ocr.mlkit(...)` | `ocr.mlkit.recognizeText(...)` | `ocr.mlkit.detect(...)` |
| Paddle | `ocr.paddle(...)` | `ocr.paddle.recognizeText(...)` | `ocr.paddle.detect(...)` |
| Rapid | `ocr.rapid(...)` | `ocr.rapid.recognizeText(...)` | `ocr.rapid.detect(...)` |

以上入口均同步识别。主模块默认使用 `mlkit`，可通过 `ocr.mode` 或单次 `options.mode` 切换；引擎子模块固定使用对应引擎。完整输入形式与依赖见 [OCR API](../../api/media/ocr.md)，引擎专属参数见 [OcrOptions](../../api/types/ocr-options.md)。

## 迁移图片与结果

需要文字时使用快捷调用或 `recognizeText`，返回 `string[]`。需要置信度与位置时使用 `detect`，返回 `OcrResult[]`，读取 `text`、`label`、`confidence` 和 Android 矩形 `bounds`；不要继续读取旧桥接结果的 `points` 或 `detectionConfidence`。

```js
// 在普通工作脚本运行；UI 脚本请使用工作线程。
if (!images.requestScreenCapture(false)) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  const results = ocr.rapid.detect(frame)
  for (const result of results) {
    const bounds = result.bounds
    console.log(result.text, result.confidence,
      bounds.left, bounds.top, bounds.right, bounds.bottom)
  }
} finally {
  frame.recycle()
}
```

也可传图片路径，或省略图片直接识别当前屏幕；省略图片仍需截图权限。区域使用 `{ region: [x, y, width, height] }`，检测结果的 `bounds` 属于原图坐标系。

不要把旧桥接的 `maxSideLen`、`doAngle` 直接当作独立模块的选项。Rapid 只消费通用区域选项，Paddle 的尺寸设置使用 `detLongSize`，置信度设置使用 `scoreThreshold`；应依据各引擎文档重新配置。没有识别结果或引擎任务失败时可能返回 `[]`；错误参数、无效图片路径及依赖准备错误应按实际异常处理。空数组本身不能证明模型可用。
