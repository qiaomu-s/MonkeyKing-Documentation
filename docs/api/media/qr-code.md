# 二维码 (QR Code)

`qrcode` 是只识别 QR Code 的全局可调用模块。它与 [barcode](barcode.md) 共用检测实现，但格式固定为 `FORMAT_QR_CODE`，适合不希望其他条码格式参与匹配的场景。

输入可以是 `ImageWrapper`、图片路径或省略。省略图像会同步捕获当前屏幕，因此需要预先取得屏幕捕获权限。检测入口会等待 ML Kit 任务完成后再返回。

## 公共选项

```ts
interface QrCodeDetectOptions {
  /** true 时返回全部结果；仅用于 qrcode()/detect()/recognizeText()。默认 false。 */
  isAll?: boolean
  /** 同时报告尚不能完整解码的候选 QR Code。默认 false。 */
  enableAllPotentialQrCodes?: boolean
  /** 兼容 barcode 模块的同义选项。默认 false。 */
  enableAllPotentialBarcodes?: boolean
}
```

当两个候选选项同时出现时，`enableAllPotentialQrCodes` 优先。完整结果对象与 `barcode.detect` 返回的 `Barcode.Result` 结构相同，包含文本、格式、类型、边界和结构化载荷等字段。

<a id="api-symbol-bW9kdWxlOnFyY29kZQ"></a>

## `qrcode` 模块

脚本运行时自动提供，无需导入。它可直接调用，也公开 `detect`、`detectAll`、`recognizeText` 和 `recognizeTexts`。

<a id="api-symbol-Y2FsbDpxcmNvZGU"></a>

## `qrcode(input?, options?)`

```ts
qrcode(options?: QrCodeDetectOptions): string | string[] | null
qrcode(image: ImageWrapper | string, options?: QrCodeDetectOptions): string | string[] | null
qrcode(isAll: true): string[]
```

模块调用是 `qrcode.recognizeText` 的快捷形式。默认返回第一条 `rawValue` 或 `null`；`options.isAll === true` 或以 `true` 作为唯一参数时返回所有非空文本。最多接受三个实参。

```js
images.requestScreenCapture(false)
const values = qrcode(true)
console.log(JSON.stringify(values))
```

<a id="api-symbol-cXJjb2RlLmRldGVjdA"></a>

## `qrcode.detect(input?, options?)`

```ts
qrcode.detect(options?: QrCodeDetectOptions): Barcode.Result | Barcode.Result[] | null
qrcode.detect(image: ImageWrapper | string, options?: QrCodeDetectOptions): Barcode.Result | Barcode.Result[] | null
```

默认返回第一个完整结果，无匹配时返回 `null`；`options.isAll` 为 `true` 时返回数组。路径无法读取为图像时抛出 `WrappedIllegalArgumentException`；图像已回收或扫描失败时返回空结果形态。

```js
const result = qrcode.detect('/sdcard/Download/login-qr.png')
if (result) console.log(result.rawValue, result.boundingBox)
```

<a id="api-symbol-cXJjb2RlLmRldGVjdEFsbA"></a>

## `qrcode.detectAll(input?, options?)`

```ts
qrcode.detectAll(options?: Omit<QrCodeDetectOptions, 'isAll'>): Barcode.Result[]
qrcode.detectAll(image: ImageWrapper | string, options?: Omit<QrCodeDetectOptions, 'isAll'>): Barcode.Result[]
```

始终返回全部 QR Code 结果数组；无匹配、图像已回收或扫描失败时返回 `[]`。

```js
const results = qrcode.detectAll('/sdcard/Download/poster.png', {
  enableAllPotentialQrCodes: true,
})
results.forEach(result => console.log(result.rawValue))
```

<a id="api-symbol-cXJjb2RlLnJlY29nbml6ZVRleHQ"></a>

## `qrcode.recognizeText(input?, options?)`

```ts
qrcode.recognizeText(options?: QrCodeDetectOptions): string | string[] | null
qrcode.recognizeText(image: ImageWrapper | string, options?: QrCodeDetectOptions): string | string[] | null
```

默认返回第一条非空 `rawValue` 或 `null`；`options.isAll` 为 `true` 时返回全部非空文本。只需要文本时优先使用该入口。

```js
const value = qrcode.recognizeText('/sdcard/Download/payment.png')
toastLog(value == null ? '未识别到二维码' : value)
```

<a id="api-symbol-cXJjb2RlLnJlY29nbml6ZVRleHRz"></a>

## `qrcode.recognizeTexts(input?, options?)`

```ts
qrcode.recognizeTexts(options?: Omit<QrCodeDetectOptions, 'isAll'>): string[]
qrcode.recognizeTexts(image: ImageWrapper | string, options?: Omit<QrCodeDetectOptions, 'isAll'>): string[]
```

返回所有非空 `rawValue`；无结果时返回 `[]`。如需边界或类型信息，请改用 `qrcode.detectAll`。

```js
const values = qrcode.recognizeTexts('/sdcard/Download/qr-grid.png')
console.log(values.join('\n'))
```

## 权限、线程与生命周期

- 文件路径会经 MonkeyKing 文件模块规范化；无效图片路径会抛出参数异常。
- 省略图像时需要屏幕捕获授权。同步扫描不适合放在 UI 线程的紧密循环中。
- 路径读取产生的临时图像由检测流程按一次性资源处理；调用方持有的普通 `ImageWrapper` 仍由调用方管理。
- API 在 MonkeyKing 中可用；底层识别能力由应用内置的 ML Kit 版本决定。


## 逐符号版本与 Rhino 2.0 示例

下列每个条目都对应一个公开 API 符号；示例按 Rhino 2.0 语法书写。需要文件、网络或 UI 资源的示例应在具备相应运行条件时执行。

<!-- api-member-contract id="call:qrcode" -->
`call:qrcode` · Rhino 2.0 示例：
```js
console.log(typeof qrcode);
```

<!-- api-member-contract id="module:qrcode" -->
`module:qrcode` · Rhino 2.0 示例：
```js
console.log(typeof qrcode);
```

<!-- api-member-contract id="qrcode.detect" -->
`qrcode.detect` · Rhino 2.0 示例：
```js
console.log(typeof qrcode.detect);
```

<!-- api-member-contract id="qrcode.detectAll" -->
`qrcode.detectAll` · Rhino 2.0 示例：
```js
console.log(typeof qrcode.detectAll);
```

<!-- api-member-contract id="qrcode.recognizeText" -->
`qrcode.recognizeText` · Rhino 2.0 示例：
```js
console.log(typeof qrcode.recognizeText);
```

<!-- api-member-contract id="qrcode.recognizeTexts" -->
`qrcode.recognizeTexts` · Rhino 2.0 示例：
```js
console.log(typeof qrcode.recognizeTexts);
```
