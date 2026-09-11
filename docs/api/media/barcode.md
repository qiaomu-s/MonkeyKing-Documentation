# 条码 (Barcode)

`barcode` 是全局可调用模块，使用设备内置的 ML Kit 条码扫描器识别一维码和二维码。传入图像时直接分析该图像；省略图像时会同步截取当前屏幕，因此必须先取得屏幕捕获权限。

检测会等待扫描器完成后再把结果返回给脚本。由路径读取的临时图像和标记为一次性使用的图像会在扫描后进入回收流程；调用方自己长期持有的 `ImageWrapper` 应继续按 [图像资源规则](image.md) 管理。

## 公共选项

```ts
interface BarcodeDetectOptions {
  /** true 时返回全部结果；仅用于 barcode()/detect()/recognizeText()。默认 false。 */
  isAll?: boolean
  /** 格式常量、格式名或两者组成的数组；省略时扫描全部格式。当前版本仅校验并传递这些值，不保证缩小扫描范围。 */
  format?: number | string | Array<number | string>
  /** 要求扫描器同时报告尚不能完整解码的候选条码。默认 false。 */
  enableAllPotentialBarcodes?: boolean
}
```

格式字符串不区分大小写，非单词字符会转换为下划线，并可省略 `FORMAT_` 前缀；例如 `"qr-code"`、`"FORMAT_QRCODE"` 和 `"FORMAT_QR_CODE"` 都会归一为 QR Code 格式。未知格式会抛出参数异常。

实现限制：MonkeyKing 6.7.0 会把 `FORMAT_ALL_FORMATS` 与用户提供的格式一起传给 ML Kit，因此 `format` 不能用于缩小扫描范围；如果业务只接受特定格式，请在返回结果层按 `result.format` 自行过滤。`qrcode` 模块不受此限制，它在源码中固定使用 `FORMAT_QR_CODE`。

`detect` 系列返回 `Barcode.Result`。常用字段包括 `rawValue`、`displayValue`、`rawBytes`、`format`、`formatName`、`valueType`、`valueTypeName`、`boundingBox` 和 `cornerPoints`；对于联系人、网址、Wi-Fi 等结构化内容，还可读取对应的 `contactInfo`、`url`、`wifi` 等字段。

<a id="api-symbol-bW9kdWxlOmJhcmNvZGU"></a>

## `barcode` 模块

脚本运行时自动提供，无需导入。模块本身可调用，也公开下列四个方法。MonkeyKing 6.7.0 的这些入口均为同步入口；扫描器失败或取消时返回空结果，不把 ML Kit 的失败对象直接抛给脚本。

<a id="api-symbol-Y2FsbDpiYXJjb2Rl"></a>

## `barcode(input?, options?)`

```ts
barcode(options?: BarcodeDetectOptions): string | string[] | null
barcode(image: ImageWrapper | string, options?: BarcodeDetectOptions): string | string[] | null
barcode(isAll: true): string[]
```

模块调用是 `recognizeText` 的快捷形式。默认返回第一条 `rawValue`，无结果时返回 `null`；`options.isAll === true` 或以 `true` 作为唯一参数时返回所有非空文本。最多接受三个实参，多余实参会触发参数数量异常。

```js
images.requestScreenCapture(false)
const first = barcode({ format: ['EAN_13', 'CODE_128'] })
console.log(first)

const all = barcode('/sdcard/Download/labels.png', { isAll: true })
console.log(all)
```

<a id="api-symbol-YmFyY29kZS5kZXRlY3Q"></a>

## `barcode.detect(input?, options?)`

```ts
barcode.detect(options?: BarcodeDetectOptions): Barcode.Result | Barcode.Result[] | null
barcode.detect(image: ImageWrapper | string, options?: BarcodeDetectOptions): Barcode.Result | Barcode.Result[] | null
```

返回完整检测对象。默认只返回第一项；`options.isAll` 为 `true` 时返回数组。省略图像会捕获屏幕。路径无法解码为图像时抛出 `WrappedIllegalArgumentException`；图像已回收或扫描失败时，单项模式返回 `null`，全部模式返回空数组。

```js
const result = barcode.detect('/sdcard/Download/ticket.png', {
  format: 'QR_CODE',
})
if (result) {
  console.log(result.formatName, result.rawValue, result.boundingBox)
}
```

<a id="api-symbol-YmFyY29kZS5kZXRlY3RBbGw"></a>

## `barcode.detectAll(input?, options?)`

```ts
barcode.detectAll(options?: Omit<BarcodeDetectOptions, 'isAll'>): Barcode.Result[]
barcode.detectAll(image: ImageWrapper | string, options?: Omit<BarcodeDetectOptions, 'isAll'>): Barcode.Result[]
```

始终返回数组并扫描全部结果；无匹配、图像已回收或扫描失败时返回 `[]`。`isAll` 在此入口没有意义。省略图像时需要已有屏幕捕获授权。

```js
const results = barcode.detectAll('/sdcard/Download/parcel.jpg', {
  format: ['CODE_128', 'DATA_MATRIX'],
})
results.forEach(result => console.log(result.formatName, result.rawValue))
```

<a id="api-symbol-YmFyY29kZS5yZWNvZ25pemVUZXh0"></a>

## `barcode.recognizeText(input?, options?)`

```ts
barcode.recognizeText(options?: BarcodeDetectOptions): string | string[] | null
barcode.recognizeText(image: ImageWrapper | string, options?: BarcodeDetectOptions): string | string[] | null
```

只返回检测对象的 `rawValue`。默认返回第一条非空文本或 `null`；`options.isAll` 为 `true` 时返回所有非空文本。输入、权限、异常和同步阻塞行为与 `barcode.detect` 相同。

```js
const value = barcode.recognizeText('/sdcard/Download/code.png')
toastLog(value == null ? '未识别到条码' : value)
```

<a id="api-symbol-YmFyY29kZS5yZWNvZ25pemVUZXh0cw"></a>

## `barcode.recognizeTexts(input?, options?)`

```ts
barcode.recognizeTexts(options?: Omit<BarcodeDetectOptions, 'isAll'>): string[]
barcode.recognizeTexts(image: ImageWrapper | string, options?: Omit<BarcodeDetectOptions, 'isAll'>): string[]
```

扫描全部条码并返回其中非空的 `rawValue`；无结果时返回 `[]`。如需格式、边界或结构化字段，请改用 `barcode.detectAll`。

```js
const values = barcode.recognizeTexts('/sdcard/Download/codes.png')
console.log(JSON.stringify(values))
```

## 权限、线程与生命周期

- 文件路径会经 MonkeyKing 文件模块规范化；路径无效时抛出异常。
- 省略图像时会调用屏幕捕获。首次使用前应在前台请求授权；不要在 UI 线程高频循环调用同步扫描入口。
- 扫描器每次调用都会创建并等待一次检测任务。脚本结束时无需单独关闭 `barcode` 模块。
- API 在 MonkeyKing 6.7.0 中可用；可用格式和结构化结果字段由应用内置的 ML Kit 版本决定。


## 逐符号版本与 Rhino 2.0 示例

下列每个条目都对应一个公开 API 符号；示例按 Rhino 2.0 语法书写。需要文件、网络或 UI 资源的示例应在具备相应运行条件时执行。

<!-- api-member-contract id="barcode.detect" version="6.7.0" -->
`barcode.detect` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof barcode.detect);
```

<!-- api-member-contract id="barcode.detectAll" version="6.7.0" -->
`barcode.detectAll` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof barcode.detectAll);
```

<!-- api-member-contract id="barcode.recognizeText" version="6.7.0" -->
`barcode.recognizeText` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof barcode.recognizeText);
```

<!-- api-member-contract id="barcode.recognizeTexts" version="6.7.0" -->
`barcode.recognizeTexts` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof barcode.recognizeTexts);
```

<!-- api-member-contract id="call:barcode" version="6.7.0" -->
`call:barcode` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof barcode);
```

<!-- api-member-contract id="module:barcode" version="6.7.0" -->
`module:barcode` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof barcode);
```
