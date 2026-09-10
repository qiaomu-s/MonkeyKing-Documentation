# HttpResponse

`HttpResponse` 是 MonkeyKing 对 `okhttp3.Response` 的 Rhino 友好包装。HTTP 状态码不会自动当作异常：只要 OkHttp 成功取得响应，即使是 4xx/5xx，也会返回本对象。网络失败则由同步、回调或 Promise 入口按各自错误通道报告。

```ts
interface HttpResponse {
  readonly request: okhttp3.Request
  readonly statusCode: number
  readonly statusMessage: string
  readonly body: HttpResponseBody
  readonly headers: HttpResponseHeaders
  readonly url: okhttp3.HttpUrl
  readonly method: string
}
```

响应体持有连接资源。应调用 `body.string()`、`bytes()`、`json()`、`saveToFile()` 完整消费，或显式 `body.close()`。

<a id="api-symbol-aHR0cC5yZXNwb25zZS5zdGF0dXNDb2Rl"></a>

## `response.statusCode`

```ts
readonly statusCode: number
```

OkHttp `Response.code`，例如 `200`、`404`。它只表示 HTTP 响应状态；不会因为非 2xx 自动抛错。

<a id="api-symbol-aHR0cC5yZXNwb25zZS5zdGF0dXNNZXNzYWdl"></a>

## `response.statusMessage`

```ts
readonly statusMessage: string
```

OkHttp `Response.message`，例如 `OK`。HTTP/2 或服务器实现可能返回空/简短消息，业务逻辑应主要判断状态码。

<a id="api-symbol-aHR0cC5yZXNwb25zZS5ib2R5"></a>

## `response.body`

```ts
readonly body: HttpResponseBody
```

包装非空 OkHttp response body，提供字符串、字节、JSON、流、文件保存和关闭方法。完整合同见 [HttpResponseBody](http-response-body.md)。

<a id="api-symbol-aHR0cC5yZXNwb25zZS5tZXRob2Q"></a>

## `response.method`

```ts
readonly method: string
```

产生该响应的最终 request method，例如 `GET`、`POST`。

<a id="api-symbol-aHR0cC5yZXNwb25zZS51cmw"></a>

## `response.url`

```ts
readonly url: okhttp3.HttpUrl
```

产生该响应的最终请求 URL。发生重定向时可能与脚本最初传入的字符串不同。类型见 [Okhttp3HttpUrl](okhttp3-http-url.md)。

<a id="api-symbol-aHR0cC5yZXNwb25zZS5yZXF1ZXN0"></a>

## `response.request`

```ts
readonly request: okhttp3.Request
```

产生该响应的最终 OkHttp 请求，可读取 method、url、headers、body、tag 等底层信息。类型见 [Okhttp3Request](okhttp3-request.md)。

```js
const response = http.get('https://example.com')
try {
  console.log(response.request.method())
  console.log(String(response.url))
  console.log(response.statusCode, response.statusMessage)
} finally {
  response.body.close()
}
```

<a id="api-symbol-aHR0cC5yZXNwb25zZS5oZWFkZXJz"></a>

## `response.headers`

```ts
readonly headers: HttpResponseHeaders
```

把 OkHttp `Headers` 转成普通 Rhino 对象。名称统一为小写；单次出现的字段值为字符串，多次出现的同名字段值为字符串数组。对象在包装响应时创建，与之后的响应体消费无关。

<a id="api-symbol-ZHluYW1pYzpodHRwLnJlc3BvbnNlLmhlYWRlcnM"></a>

## 动态响应头字段

```ts
type HttpResponseHeaders = Record<string, string | string[]>
```

运行时遍历 `res.headers` 的原始顺序：第一次出现写入字符串，后续同名值按顺序追加到数组。访问时使用小写键，例如 `response.headers['content-type']`。常见字段见 [HttpResponseHeaders](http-response-headers.md)。

```js
const response = http.get('https://example.com')
try {
  Object.entries(response.headers).forEach(([name, value]) => {
    console.log(name + ': ' + JSON.stringify(value))
  })
} finally {
  response.body.close()
}
```

---

# HttpSaveResult

`response.body.saveToFile()` 不通过异常表示复制阶段的普通失败，而返回 `HttpSaveResult`。五个属性均为只读、永久属性；`error` 保留原始异常对象。

```ts
interface HttpSaveResult {
  readonly code: number
  readonly path: string | null
  readonly bytesCopied: number
  readonly success: boolean
  readonly error: Throwable | null
  isSuccess(): boolean
}
```

<a id="api-symbol-aHR0cC5zYXZlUmVzdWx0LmNvZGU"></a>

## `saveResult.code`

```ts
readonly code: number
```

`0` 表示成功，`-1` 表示通用失败。当前 6.7.0 只定义这两个结果码。

<a id="api-symbol-aHR0cC5zYXZlUmVzdWx0LnBhdGg"></a>

## `saveResult.path`

```ts
readonly path: string | null
```

运行时规范化后的目标路径。由 `saveToFile` 创建的结果通常非空；构造失败结果的底层 API 允许 `null`。

<a id="api-symbol-aHR0cC5zYXZlUmVzdWx0LmJ5dGVzQ29waWVk"></a>

## `saveResult.bytesCopied`

```ts
readonly bytesCopied: number
```

成功时是写入总字节数；失败时是异常发生前已复制的字节数，可用于诊断部分文件。

<a id="api-symbol-aHR0cC5zYXZlUmVzdWx0LnN1Y2Nlc3M"></a>

## `saveResult.success`

```ts
readonly success: boolean
```

等价于 `code === 0`。

<a id="api-symbol-aHR0cC5zYXZlUmVzdWx0LmVycm9y"></a>

## `saveResult.error`

```ts
readonly error: Throwable | null
```

成功时为 `null`；失败时保留复制、读取、写入或 flush 阶段捕获的原始异常。

<a id="api-symbol-aHR0cC5zYXZlUmVzdWx0LmlzU3VjY2Vzcw"></a>

## `saveResult.isSuccess()`

```ts
isSuccess(): boolean
```

不接受参数，返回 `code === 0`，与 `success` 属性相同。

```js
http.getAsync('https://example.com/archive.zip').then(response => {
  const result = response.body.saveToFile('/sdcard/Download/archive.zip')
  if (!result.isSuccess()) {
    console.error(result.code, result.bytesCopied, result.error)
  }
})
```

## 线程、生命周期与版本

- response 对象在网络完成后构造；Promise 入口在 Rhino/UI 映射阶段创建包装对象。
- header 对象和状态字段不持有额外流资源，body 持有。关闭 body 后仍可读取状态、请求、URL 和 headers。
- `HttpSaveResult` 只描述一次复制结果，不会自动删除失败时留下的部分文件。
- 本页合同对应 MonkeyKing 6.7.0 与其内置 OkHttp 版本。


## 逐符号版本与 Rhino 2.0 示例

下列每个条目都对应一个公开 API 符号；示例按 Rhino 2.0 语法书写。需要文件、网络或 UI 资源的示例应在具备相应运行条件时执行。

<!-- api-member-contract id="dynamic:http.response.headers" version="6.7.0" -->
`dynamic:http.response.headers` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var response = http.get('https://example.com');
console.log(response.headerFields);
```

<!-- api-member-contract id="http.response.body" version="6.7.0" -->
`http.response.body` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var response = http.get('https://example.com');
console.log(response.body);
```

<!-- api-member-contract id="http.response.headers" version="6.7.0" -->
`http.response.headers` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var response = http.get('https://example.com');
console.log(response.headers);
```

<!-- api-member-contract id="http.response.method" version="6.7.0" -->
`http.response.method` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var response = http.get('https://example.com');
console.log(response.method);
```

<!-- api-member-contract id="http.response.request" version="6.7.0" -->
`http.response.request` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var response = http.get('https://example.com');
console.log(response.request);
```

<!-- api-member-contract id="http.response.statusCode" version="6.7.0" -->
`http.response.statusCode` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var response = http.get('https://example.com');
console.log(response.statusCode);
```

<!-- api-member-contract id="http.response.statusMessage" version="6.7.0" -->
`http.response.statusMessage` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var response = http.get('https://example.com');
console.log(response.statusMessage);
```

<!-- api-member-contract id="http.response.url" version="6.7.0" -->
`http.response.url` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var response = http.get('https://example.com');
console.log(response.url);
```

<!-- api-member-contract id="http.saveResult.bytesCopied" version="6.7.0" -->
`http.saveResult.bytesCopied` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var saveResult = http.get('https://example.com').body.saveToFile('/sdcard/demo.bin');
console.log(saveResult.bytesCopied);
```

<!-- api-member-contract id="http.saveResult.code" version="6.7.0" -->
`http.saveResult.code` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var saveResult = http.get('https://example.com').body.saveToFile('/sdcard/demo.bin');
console.log(saveResult.code);
```

<!-- api-member-contract id="http.saveResult.error" version="6.7.0" -->
`http.saveResult.error` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var saveResult = http.get('https://example.com').body.saveToFile('/sdcard/demo.bin');
console.log(saveResult.error);
```

<!-- api-member-contract id="http.saveResult.isSuccess" version="6.7.0" -->
`http.saveResult.isSuccess` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var saveResult = http.get('https://example.com').body.saveToFile('/sdcard/demo.bin');
console.log(saveResult.isSuccess);
```

<!-- api-member-contract id="http.saveResult.path" version="6.7.0" -->
`http.saveResult.path` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var saveResult = http.get('https://example.com').body.saveToFile('/sdcard/demo.bin');
console.log(saveResult.path);
```

<!-- api-member-contract id="http.saveResult.success" version="6.7.0" -->
`http.saveResult.success` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var saveResult = http.get('https://example.com').body.saveToFile('/sdcard/demo.bin');
console.log(saveResult.success);
```
