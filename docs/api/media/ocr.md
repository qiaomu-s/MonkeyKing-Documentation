# 光学字符识别 (OCR)

`ocr` 从图片或当前屏幕中识别文本。MonkeyKing 6.7.0 提供三种工作模式：`mlkit`（默认）、`paddle` 和 `rapid`。主模块根据 `ocr.mode` 或单次调用的 `options.mode` 分派；`ocr.mlkit`、`ocr.paddle`、`ocr.rapid` 则固定使用对应引擎。

所有公开识别入口对 Rhino 脚本表现为同步调用：它们在返回前完成推理。省略图片时会捕获当前屏幕，必须先取得屏幕捕获权限；在 UI 线程或紧密循环中反复调用可能造成明显阻塞。

## 通用输入与结果

```ts
type OcrMode = 'mlkit' | 'paddle' | 'rapid'
type OcrImage = ImageWrapper | string
type OcrRegion = number[] | android.graphics.Rect | org.opencv.core.Rect

interface OcrResult {
  text: string
  label: string       // text 的同义字段
  confidence: number  // 0..1
  bounds: android.graphics.Rect
}
```

每个 `recognizeText`、`detect` 和可调用模块都接受同一组输入形式：

```ts
fn(options?: OcrOptions): Result[]
fn(region: OcrRegion): Result[]
fn(image: OcrImage, options?: OcrOptions): Result[]
fn(image: OcrImage, region: OcrRegion): Result[]
```

- `image` 是路径时，运行时先用 `images.read` 解码；路径无效会抛出 `WrappedIllegalArgumentException`。
- 省略 `image` 时同步捕获屏幕；调用前应先执行 `images.requestScreenCapture(...)`。
- `options.region` 缺省或为 `undefined` 时识别整张图；显式为 `null` 时返回空数组。区域也可作为第二个位置参数直接传入。
- 区域识别先裁剪图像；`detect` 返回的 `bounds` 会重新偏移到原图坐标系。
- 每个公开入口最多接受三个实参。未知模式、错误参数数量或无法解析的图片会抛出参数异常。
- 识别所需的引擎库会在首次调用对应引擎时检查并准备。

完整选项见 [OcrOptions](../types/ocr-options.md)。

<a id="api-symbol-bW9kdWxlOm9jcg"></a>

## `ocr` 模块

运行时自动提供，无需导入。主模块公开模式切换、文本识别、结构化检测和摘要方法，并可直接作为函数调用。

<a id="api-symbol-b2NyLm1vZGU"></a>

## `ocr.mode`

```ts
ocr.mode: 'mlkit' | 'paddle' | 'rapid'
```

读写当前默认引擎，初始值为 `mlkit`。赋值会走与 `ocr.tap` 相同的模式解析；模式名不区分大小写。未知名称会抛出 `WrappedIllegalArgumentException`。

```js
console.log(ocr.mode) // mlkit
ocr.mode = 'paddle'
const text = ocr('/sdcard/Download/page.png')
```

<a id="api-symbol-Y2FsbDpvY3I"></a>

## `ocr(input?, optionsOrRegion?)`

```ts
ocr(options?: OcrOptions): string[]
ocr(region: OcrRegion): string[]
ocr(image: OcrImage, options?: OcrOptions): string[]
ocr(image: OcrImage, region: OcrRegion): string[]
```

`ocr(...)` 是 `ocr.recognizeText(...)` 的快捷形式，使用当前模式或 `options.mode`。始终返回字符串数组；没有结果或引擎任务失败时返回 `[]`。

```js
images.requestScreenCapture(false)
const labels = ocr({
  mode: 'mlkit',
  region: [0, 0, 0.75, 0.5],
})
console.log(labels.join('\n'))
```

<a id="api-symbol-b2NyLnJlY29nbml6ZVRleHQ"></a>

## `ocr.recognizeText(input?, optionsOrRegion?)`

```ts
ocr.recognizeText(options?: OcrOptions): string[]
ocr.recognizeText(region: OcrRegion): string[]
ocr.recognizeText(image: OcrImage, options?: OcrOptions): string[]
ocr.recognizeText(image: OcrImage, region: OcrRegion): string[]
```

返回引擎输出的文本标签。需要置信度和位置时改用 `ocr.detect`。

```js
const labels = ocr.recognizeText('/sdcard/Download/receipt.jpg', {
  mode: 'paddle',
  scoreThreshold: 0.6,
})
labels.forEach(label => console.log(label))
```

<a id="api-symbol-b2NyLmRldGVjdA"></a>

<a id="m-detect"></a>

## `ocr.detect(input?, optionsOrRegion?)`

```ts
ocr.detect(options?: OcrOptions): OcrResult[]
ocr.detect(region: OcrRegion): OcrResult[]
ocr.detect(image: OcrImage, options?: OcrOptions): OcrResult[]
ocr.detect(image: OcrImage, region: OcrRegion): OcrResult[]
```

返回包含文本、置信度和 Android 边界矩形的结果。使用区域时，边界仍以原始图片左上角为坐标原点。

```js
const results = ocr.detect('/sdcard/Download/page.png', {
  mode: 'rapid',
  region: [40, 80, 800, 1200],
})
results
  .filter(result => result.confidence >= 0.7)
  .forEach(result => console.log(result.text, result.bounds))
```

<a id="api-symbol-b2NyLnRhcA"></a>

## `ocr.tap(mode)`

```ts
ocr.tap(mode: OcrMode | typeof ocr.mlkit | typeof ocr.paddle | typeof ocr.rapid): void
```

切换默认引擎。除模式字符串外，也接受三个引擎模块对象。未知值抛出 `WrappedIllegalArgumentException`，不会产生识别结果。

```js
ocr.tap('rapid')
console.log(ocr.mode) // rapid
ocr.tap(ocr.mlkit)
```

<a id="api-symbol-b2NyLnN1bW1hcnk"></a>

## `ocr.summary()`

```ts
ocr.summary(): string
```

不接受参数，返回包含当前模式和全部可用模式（`mlkit`、`paddle`、`rapid`）的多行摘要。传入参数会触发参数数量异常。

<a id="api-symbol-b2NyLnRvU3RyaW5n"></a>

## `ocr.toString()`

```ts
ocr.toString(): string
```

返回值与 `ocr.summary()` 相同。该函数由运行时作为字面量 `toString` 属性导出，不接受参数。

```js
console.log(String(ocr))
console.log(ocr.toString())
```

<a id="api-symbol-bW9kdWxlOm9jci5tbGtpdA"></a>

## `ocr.mlkit` 模块

固定使用 ML Kit 中文文字识别器，不读取 `options.mode`。识别器按需创建，并在脚本运行时回收阶段关闭。当前实现会等待 ML Kit Task 完成；任务取消或失败时记录警告并返回空数组。

<a id="api-symbol-Y2FsbDpvY3IubWxraXQ"></a>

## `ocr.mlkit(input?, optionsOrRegion?)`

```ts
ocr.mlkit(options?: OcrOptions): string[]
ocr.mlkit(region: OcrRegion): string[]
ocr.mlkit(image: OcrImage, options?: OcrOptions): string[]
ocr.mlkit(image: OcrImage, region: OcrRegion): string[]
```

`ocr.mlkit.recognizeText` 的快捷形式。除通用 `region` 外，6.7.0 的 ML Kit 实现不消费 Paddle 专用选项。

<a id="api-symbol-b2NyLm1sa2l0LnJlY29nbml6ZVRleHQ"></a>

## `ocr.mlkit.recognizeText(input?, optionsOrRegion?)`

```ts
ocr.mlkit.recognizeText(input?: OcrImage | OcrRegion | OcrOptions, optionsOrRegion?: OcrOptions | OcrRegion): string[]
```

返回按版面顺序整理的文本行。已回收图像、空结果或失败任务返回 `[]`。

<a id="api-symbol-b2NyLm1sa2l0LmRldGVjdA"></a>

## `ocr.mlkit.detect(input?, optionsOrRegion?)`

```ts
ocr.mlkit.detect(input?: OcrImage | OcrRegion | OcrOptions, optionsOrRegion?: OcrOptions | OcrRegion): OcrResult[]
```

把 ML Kit 的每一条文字行转换为 `OcrResult`。置信度和边界来自内置识别器；失败不会抛出 ML Kit Task 异常，而是返回空数组。

```js
const results = ocr.mlkit.detect('/sdcard/Download/chinese.png')
results.forEach(result => console.log(result.text, result.confidence))
```

<a id="api-symbol-bW9kdWxlOm9jci5wYWRkbGU"></a>

## `ocr.paddle` 模块

固定使用 Paddle OCR。在 MonkeyKing 主应用中，它通过可用的 Paddle OCR 插件执行；没有可用插件时抛出 `WrappedIllegalArgumentException`。打包后的 INRT 应用使用内置本地引擎。实现通过当前脚本的协程上下文阻塞等待结果。

<a id="api-symbol-Y2FsbDpvY3IucGFkZGxl"></a>

## `ocr.paddle(input?, optionsOrRegion?)`

```ts
ocr.paddle(options?: OcrOptions): string[]
ocr.paddle(region: OcrRegion): string[]
ocr.paddle(image: OcrImage, options?: OcrOptions): string[]
ocr.paddle(image: OcrImage, region: OcrRegion): string[]
```

`ocr.paddle.recognizeText` 的快捷形式。可使用 `cpuThreadNum`、`useSlim`、`useOpenCL`、`detLongSize`、`scoreThreshold`、`useRaw`、`imageQuality` 和 `imageFormat`；`mergeLine` 只影响结构化 `detect` 结果。

<a id="api-symbol-b2NyLnBhZGRsZS5yZWNvZ25pemVUZXh0"></a>

## `ocr.paddle.recognizeText(input?, optionsOrRegion?)`

```ts
ocr.paddle.recognizeText(input?: OcrImage | OcrRegion | OcrOptions, optionsOrRegion?: OcrOptions | OcrRegion): string[]
```

返回 Paddle 输出的文本数组。默认 `cpuThreadNum = 4`、`useSlim = true`、`useOpenCL = false`、`useRaw = true`；其他选项和设备/插件能力会影响推理。

<a id="api-symbol-b2NyLnBhZGRsZS5kZXRlY3Q"></a>

## `ocr.paddle.detect(input?, optionsOrRegion?)`

```ts
ocr.paddle.detect(input?: OcrImage | OcrRegion | OcrOptions, optionsOrRegion?: OcrOptions | OcrRegion): OcrResult[]
```

返回 Paddle 文本、置信度和矩形。`mergeLine: true` 时，只有在 `splitWords` 与 `useWordSegmentation` 都为 `false` 的情况下才会合并同一行；合并后的置信度按各段文本长度加权，边界为各段并集。

```js
const results = ocr.paddle.detect('/sdcard/Download/document.jpg', {
  cpuThreadNum: 4,
  scoreThreshold: 0.55,
  mergeLine: true,
})
```

<a id="api-symbol-bW9kdWxlOm9jci5yYXBpZA"></a>

## `ocr.rapid` 模块

固定使用 Rapid OCR 本地引擎。6.7.0 的实现使用内置固定推理参数，除通用 `region` 外不消费 `OcrOptions`；无需 Paddle 插件。

<a id="api-symbol-Y2FsbDpvY3IucmFwaWQ"></a>

## `ocr.rapid(input?, optionsOrRegion?)`

```ts
ocr.rapid(options?: OcrOptions): string[]
ocr.rapid(region: OcrRegion): string[]
ocr.rapid(image: OcrImage, options?: OcrOptions): string[]
ocr.rapid(image: OcrImage, region: OcrRegion): string[]
```

`ocr.rapid.recognizeText` 的快捷形式。调用同步执行本地推理。

<a id="api-symbol-b2NyLnJhcGlkLnJlY29nbml6ZVRleHQ"></a>

## `ocr.rapid.recognizeText(input?, optionsOrRegion?)`

```ts
ocr.rapid.recognizeText(input?: OcrImage | OcrRegion | OcrOptions, optionsOrRegion?: OcrOptions | OcrRegion): string[]
```

返回 Rapid OCR 文本块的 `text` 字段数组。无图像、位图已回收或无检测结果时返回 `[]`。

<a id="api-symbol-b2NyLnJhcGlkLmRldGVjdA"></a>

## `ocr.rapid.detect(input?, optionsOrRegion?)`

```ts
ocr.rapid.detect(input?: OcrImage | OcrRegion | OcrOptions, optionsOrRegion?: OcrOptions | OcrRegion): OcrResult[]
```

把每个 Rapid 文本块转换为 `OcrResult`：边界取文本块左上与右下点，置信度取 `boxScore`。

```js
const results = ocr.rapid.detect('/sdcard/Download/sign.png')
results.forEach(result => console.log(result.text, result.bounds))
```

## 生命周期、权限与错误恢复

- 省略图片时需要屏幕捕获授权；读取文件路径时需要相应存储访问能力。OCR 模块不会代替脚本请求这些权限。
- 引擎调用同步占用调用线程。批量识别时应在工作线程串行执行，并及时回收不再使用的图像。
- ML Kit 识别器由运行时缓存并在退出时关闭；Paddle/Rapid 的库文件由引擎准备流程管理。
- 使用区域时会产生临时裁剪图像；避免同时在其他线程回收原始图像。
- 本页描述 MonkeyKing 6.7.0 的公开合同。底层模型、插件或设备能力差异可能改变识别质量，但不改变这里的返回形态。


## 逐符号版本与 Rhino 2.0 示例

下列每个条目都对应一个公开 API 符号；示例按 Rhino 2.0 语法书写。需要文件、网络或 UI 资源的示例应在具备相应运行条件时执行。

<!-- api-member-contract id="call:ocr" version="6.7.0" -->
`call:ocr` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr);
```

<!-- api-member-contract id="call:ocr.mlkit" version="6.7.0" -->
`call:ocr.mlkit` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.mlkit);
```

<!-- api-member-contract id="call:ocr.paddle" version="6.7.0" -->
`call:ocr.paddle` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.paddle);
```

<!-- api-member-contract id="call:ocr.rapid" version="6.7.0" -->
`call:ocr.rapid` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.rapid);
```

<!-- api-member-contract id="module:ocr" version="6.7.0" -->
`module:ocr` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr);
```

<!-- api-member-contract id="module:ocr.mlkit" version="6.7.0" -->
`module:ocr.mlkit` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.mlkit);
```

<!-- api-member-contract id="module:ocr.paddle" version="6.7.0" -->
`module:ocr.paddle` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.paddle);
```

<!-- api-member-contract id="module:ocr.rapid" version="6.7.0" -->
`module:ocr.rapid` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.rapid);
```

<!-- api-member-contract id="ocr.detect" version="6.7.0" -->
`ocr.detect` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.detect);
```

<!-- api-member-contract id="ocr.mlkit.detect" version="6.7.0" -->
`ocr.mlkit.detect` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.mlkit.detect);
```

<!-- api-member-contract id="ocr.mlkit.recognizeText" version="6.7.0" -->
`ocr.mlkit.recognizeText` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.mlkit.recognizeText);
```

<!-- api-member-contract id="ocr.mode" version="6.7.0" -->
`ocr.mode` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(ocr.mode);
```

<!-- api-member-contract id="ocr.paddle.detect" version="6.7.0" -->
`ocr.paddle.detect` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.paddle.detect);
```

<!-- api-member-contract id="ocr.paddle.recognizeText" version="6.7.0" -->
`ocr.paddle.recognizeText` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.paddle.recognizeText);
```

<!-- api-member-contract id="ocr.rapid.detect" version="6.7.0" -->
`ocr.rapid.detect` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.rapid.detect);
```

<!-- api-member-contract id="ocr.rapid.recognizeText" version="6.7.0" -->
`ocr.rapid.recognizeText` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.rapid.recognizeText);
```

<!-- api-member-contract id="ocr.recognizeText" version="6.7.0" -->
`ocr.recognizeText` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.recognizeText);
```

<!-- api-member-contract id="ocr.summary" version="6.7.0" -->
`ocr.summary` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.summary);
```

<!-- api-member-contract id="ocr.tap" version="6.7.0" -->
`ocr.tap` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.tap);
```

<!-- api-member-contract id="ocr.toString" version="6.7.0" -->
`ocr.toString` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof ocr.toString);
```
