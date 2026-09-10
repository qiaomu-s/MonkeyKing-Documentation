# HttpResponseBody

`HttpResponseBody` 包装 OkHttp `ResponseBody`，同时提供适合 Rhino 的完整读取、JSON、流式保存和关闭方法。底层响应体通常只能消费一次：完整读取方法会自动关闭，`stream()` 则把关闭责任交给调用方。

```ts
interface HttpResponseBody {
  readonly contentType: okhttp3.MediaType | null
  string(): string
  bytes(): byte[]
  json(): unknown
  stream(): java.io.InputStream
  saveToFile(path: string, bufferSize?: number): HttpSaveResult
  close(): void
}
```

<a id="api-symbol-aHR0cC5yZXNwb25zZS5ib2R5LmNvbnRlbnRUeXBl"></a>

## `body.contentType`

```ts
readonly contentType: okhttp3.MediaType | null
```

调用底层 `ResponseBody.contentType()`。服务器未提供或 OkHttp 无法解析媒体类型时为 `null`。该 getter 不读取正文。

<a id="api-symbol-aHR0cC5yZXNwb25zZS5ib2R5LnN0cmluZw"></a>

## `body.string()`

```ts
body.string(): string
```

不接受参数，完整读取正文为字符串，然后立即关闭底层 body。`cacheBody: true` 且已知长度不超过阈值（或长度未知）时缓存字符串；之后再次调用 `string()` 直接返回缓存。未缓存且 body 已关闭时抛出 `IllegalStateException`。

```js
const response = http.get('https://example.com')
const text = response.body.string() // 完整消费并自动关闭
console.log(text)
```

<a id="api-symbol-aHR0cC5yZXNwb25zZS5ib2R5LmJ5dGVz"></a>

## `body.bytes()`

```ts
body.bytes(): byte[]
```

完整读取为 Java 字节数组并自动关闭。缓存条件与 `string()` 相同，但字节缓存和字符串缓存相互独立；先以一种表示关闭 body 后，不能依赖另一种表示还能首次读取。

<a id="api-symbol-aHR0cC5yZXNwb25zZS5ib2R5Lmpzb24"></a>

## `body.json()`

```ts
body.json(): unknown
```

先调用 `string()`，再用 Rhino `JSON.parse` 解析。无效 JSON 抛出 `IllegalStateException`，消息说明正文不是有效 JSON；无论解析成功与否，字符串读取已经消费并关闭响应体。

```js
http.getAsync('https://example.com/data.json').then(response => {
  const value = response.body.json()
  console.log(JSON.stringify(value))
})
```

<a id="api-symbol-aHR0cC5yZXNwb25zZS5ib2R5LnN0cmVhbQ"></a>

## `body.stream()`

```ts
body.stream(): java.io.InputStream
```

返回 OkHttp byte stream，不自动关闭，也不启用 body cache。适合逐块处理大响应；调用方必须关闭返回流，并在异常路径中同时确保 body 被关闭。body 已显式关闭时抛出 `IllegalStateException`。

```js
const response = http.get('https://example.com/large.bin')
const input = response.body.stream()
try {
  console.log(input.read())
} finally {
  input.close()
  response.body.close()
}
```

<a id="api-symbol-aHR0cC5yZXNwb25zZS5ib2R5LnNhdmVUb0ZpbGU"></a>

## `body.saveToFile(path, bufferSize?)`

```ts
body.saveToFile(path: string, bufferSize?: number): HttpSaveResult
```

直接把 byte stream 复制到运行时路径，避免把完整响应装入内存。`bufferSize` 转为整数；省略、为零或负数时使用 `8192`。目标是现有目录或路径以 `/` 结尾时抛出 `WrappedIllegalArgumentException`。

复制、打开、写入或 flush 阶段的异常被捕获到 `HttpSaveResult`，不会再次抛出；结果包含 `success`、`code`、`path`、`bytesCopied` 和 `error`。无论成功失败，输入流、输出流和 body 都会关闭。失败可能留下部分文件，调用方决定是否删除。

```js
http.getAsync('https://example.com/package.zip').then(response => {
  const result = response.body.saveToFile(
    '/sdcard/Download/package.zip',
    64 * 1024,
  )
  if (!result.success) console.error(result.error)
})
```

<a id="api-symbol-aHR0cC5yZXNwb25zZS5ib2R5LmNsb3Nl"></a>

## `body.close()`

```ts
body.close(): void
```

显式关闭底层 response body，并把包装器标记为关闭。方法幂等且不接受参数；底层 close 异常会被吞掉。未读取正文、HEAD 响应、提前终止流式读取和异常路径都应调用。

<a id="api-symbol-ZHluYW1pYzpodHRwLnJlc3BvbnNlLmJvZHkuZm9yd2FyZGVkLW1lbWJlcnM"></a>

## 动态转发的 OkHttp 方法

包装器在属性查询时检查底层 `okhttp3.ResponseBody`。未被上述 MonkeyKing 方法覆盖的底层函数会绑定到原始 ResponseBody 后转发，因此可访问内置 OkHttp 版本公开的方法，例如 `contentLength()`、`source()` 或 `charStream()`。

这些转发入口共享同一条一次性流和关闭状态；调用底层消费方法可能绕过 MonkeyKing 的 `closed` 标记与 cache 逻辑。需要稳定生命周期时优先使用本页六个显式方法，并只把动态转发用于高级互操作。

## 缓存、线程与版本

- 默认 `cacheBody = false`，完整读取后不能重复读取。开启缓存只缓存 `string` 或 `bytes` 的同类型结果，不缓存 stream。
- 响应包装和完整读取同步运行在调用它们的线程；大 body 使用 `stream()`/`saveToFile()` 或把处理放在工作线程。
- body 不会被 JavaScript 垃圾回收及时、确定地关闭；必须显式消费或关闭。
- 本页合同对应 MonkeyKing 6.7.0 与其内置 OkHttp 版本。


## 逐符号版本与 Rhino 2.0 示例

下列每个条目都对应一个公开 API 符号；示例按 Rhino 2.0 语法书写。需要文件、网络或 UI 资源的示例应在具备相应运行条件时执行。

<!-- api-member-contract id="dynamic:http.response.body.forwarded-members" version="6.7.0" -->
`dynamic:http.response.body.forwarded-members` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var body = http.get('https://example.com').body;
console.log(body.forwardedMembers);
```

<!-- api-member-contract id="http.response.body.bytes" version="6.7.0" -->
`http.response.body.bytes` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var body = http.get('https://example.com').body;
console.log(body.bytes);
```

<!-- api-member-contract id="http.response.body.close" version="6.7.0" -->
`http.response.body.close` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var body = http.get('https://example.com').body;
console.log(body.close);
```

<!-- api-member-contract id="http.response.body.contentType" version="6.7.0" -->
`http.response.body.contentType` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var body = http.get('https://example.com').body;
console.log(body.contentType);
```

<!-- api-member-contract id="http.response.body.json" version="6.7.0" -->
`http.response.body.json` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var body = http.get('https://example.com').body;
console.log(body.json);
```

<!-- api-member-contract id="http.response.body.saveToFile" version="6.7.0" -->
`http.response.body.saveToFile` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var body = http.get('https://example.com').body;
console.log(body.saveToFile);
```

<!-- api-member-contract id="http.response.body.stream" version="6.7.0" -->
`http.response.body.stream` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var body = http.get('https://example.com').body;
console.log(body.stream);
```

<!-- api-member-contract id="http.response.body.string" version="6.7.0" -->
`http.response.body.string` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var body = http.get('https://example.com').body;
console.log(body.string);
```
