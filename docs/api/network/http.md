# HTTP

`http` 使用 MonkeyKing 持有的 OkHttp 客户端构建并发送请求。模块同时提供阻塞/回调入口和明确返回 Promise 的 `*Async` 入口；响应包装、响应体消费与文件保存合同分别见 [HttpResponse](../types/http-response.md) 和 [HttpResponseBody](../types/http-response-body.md)。

URL 未以 `http://` 或 `https://` 开头时会自动补 `http://`。请求方法、头、正文和客户端选项见 [HttpRequestBuilderOptions](../types/http-request-builder-options.md)。

<a id="api-symbol-bW9kdWxlOmh0dHA"></a>

## `http` 模块

运行时自动提供，无需导入，另有 `$http` 同义入口。每个请求都从当前共享 OkHttp 客户端创建 builder，应用 `timeout`、`client`、`isInsecure` 和重试设置，再把构建后的客户端保存回模块；因此客户端配置会影响当前脚本运行时后续请求。

网络 I/O 需要 Android `INTERNET` 权限（应用通常在清单中声明，无运行时弹窗）。同步入口会占用调用线程，不能在 Android UI 线程直接执行阻塞请求；UI 和并发场景优先使用 `*Async`。

## 底层客户端

<a id="api-symbol-aHR0cC5va2h0dHA"></a>

### `http.okhttp`

```ts
readonly http.okhttp: MutableOkHttp
```

MonkeyKing 的可变 OkHttp 持有者。它保存当前 `OkHttpClient`、重试拦截器和 `maxRetries`。普通脚本应通过请求选项配置；直接修改属于高级用法。

<a id="api-symbol-aHR0cC5fX29raHR0cF9f"></a>

### `http.__okhttp__`

```ts
readonly http.__okhttp__: MutableOkHttp
```

与 `http.okhttp` 指向同一对象的不可枚举、只读、永久属性，供兼容和底层集成使用。

<a id="api-symbol-aHR0cC5jbGllbnQ"></a>

### `http.client()`

```ts
http.client(): okhttp3.OkHttpClient
```

返回当前生效的 OkHttp 客户端。后续请求重新应用 client options 时，模块可能替换其内部客户端；此前取得的对象仍是旧实例。

## 构建与通用发送

<a id="api-symbol-aHR0cC5idWlsZFJlcXVlc3Q"></a>

### `http.buildRequest(url, options?)`

```ts
http.buildRequest(url: string, options?: HttpRequestBuilderOptions): okhttp3.Request
```

只构建请求，不发起网络 I/O。通用调用应在 `options.method` 中给出有效方法；`headers`、`body`、`files` 和 `contentType` 按类型页规则应用。`options` 不是 JavaScript 对象时抛出 `WrappedIllegalArgumentException`，无效 URL、方法或头由 OkHttp builder 拒绝。

```js
const request = http.buildRequest('https://example.com/items', {
  method: 'POST',
  contentType: 'application/json',
  body: JSON.stringify({ limit: 10 }),
  headers: { accept: 'application/json' },
})
console.log(request.method(), request.url())
```

<a id="api-symbol-aHR0cC5yZXF1ZXN0"></a>

### `http.request(url, options?, callback?)`

```ts
http.request(url: string, options?: HttpRequestBuilderOptions): HttpResponse
http.request(
  url: string,
  options: HttpRequestBuilderOptions,
  callback: (response: HttpResponse | null, error: java.io.IOException | null) => void,
): undefined
```

无回调时调用 `Call.execute()` 并阻塞到响应或异常，成功返回 `HttpResponse`。提供回调时调用 `Call.enqueue()`：成功回调 `(response, null)`，网络失败回调 `(null, error)`，直接返回 `undefined`。在启用 continuation 的 UI 环境中，运行时可挂起并恢复脚本，但回调合同不变。

每个成功响应都持有底层连接资源；必须完整消费 `response.body` 或显式 `close()`。

<a id="api-symbol-aHR0cC5yZXF1ZXN0QXN5bmM"></a>

### `http.requestAsync(url, options?, callback?)`

```ts
http.requestAsync(
  url: string,
  options?: HttpRequestBuilderOptions,
  callback?: (response: HttpResponse, error: null) => void,
): Promise<HttpResponse>
```

在后台线程执行同步 OkHttp call，并在 UI/Rhino 上下文中包装响应。Promise 成功解析为 `HttpResponse`，失败时拒绝。可选回调只在成功映射后以 `(response, null)` 调用；失败处理应使用 Promise rejection。

```js
http.requestAsync('https://example.com/api', { method: 'GET' })
  .then(response => {
    console.log(response.statusCode)
    return response.body.string()
  })
  .then(text => console.log(text))
  .catch(error => console.error(error))
```

## GET 与 HEAD

<a id="api-symbol-aHR0cC5nZXQ"></a>

### `http.get(url, options?, callback?)`

```ts
http.get(url: string, options?: HttpRequestBuilderOptions): HttpResponse
http.get(url: string, options: HttpRequestBuilderOptions, callback: HttpCallback): undefined
```

把 `options.method` 设为 `GET` 后调用 `http.request`。传入的 options 对象会被原地写入 `method`。其余同步/回调行为与通用入口相同。

<a id="api-symbol-aHR0cC5nZXRBc3luYw"></a>

### `http.getAsync(url, options?, callback?)`

```ts
http.getAsync(url: string, options?: HttpRequestBuilderOptions, callback?: AsyncHttpCallback): Promise<HttpResponse>
```

把方法设为 `GET` 后调用 `http.requestAsync`。

```js
http.getAsync('https://example.com/data.json', {
  headers: { accept: 'application/json' },
}).then(response => response.body.json())
```

<a id="api-symbol-aHR0cC5oZWFk"></a>

### `http.head(url, options?, callback?)`

```ts
http.head(url: string, options?: HttpRequestBuilderOptions): HttpResponse
http.head(url: string, options: HttpRequestBuilderOptions, callback: HttpCallback): undefined
```

把方法设为 `HEAD` 后发送请求。响应体通常为空，仍应调用 `response.body.close()` 释放连接资源。

<a id="api-symbol-aHR0cC5oZWFkQXN5bmM"></a>

### `http.headAsync(url, options?, callback?)`

```ts
http.headAsync(url: string, options?: HttpRequestBuilderOptions, callback?: AsyncHttpCallback): Promise<HttpResponse>
```

`HEAD` 的 Promise 版本。

## 表单、JSON 与 multipart POST

<a id="api-symbol-aHR0cC5wb3N0"></a>

### `http.post(url, data?, options?, callback?)`

```ts
http.post(url: string, data?: object, options?: HttpRequestBuilderOptions, callback?: HttpCallback): HttpResponse | undefined
```

把方法设为 `POST`。`contentType` 缺省时使用 `application/x-www-form-urlencoded`，将 `data` 的键值逐项转为字符串并构建 `FormBody`。若要发送原始字符串或自定义 `RequestBody`，应显式设置其他 `contentType`。

<a id="api-symbol-aHR0cC5wb3N0QXN5bmM"></a>

### `http.postAsync(url, data?, options?, callback?)`

```ts
http.postAsync(url: string, data?: object, options?: HttpRequestBuilderOptions, callback?: AsyncHttpCallback): Promise<HttpResponse>
```

与 `http.post` 使用相同表单构建逻辑，通过 Promise 返回。

```js
http.postAsync('https://example.com/login', {
  username: 'demo',
  password: 'secret',
}).then(response => response.body.string())
```

<a id="api-symbol-aHR0cC5wb3N0SnNvbg"></a>

### `http.postJson(url, data?, options?, callback?)`

```ts
http.postJson(url: string, data?: unknown, options?: HttpRequestBuilderOptions, callback?: HttpCallback): HttpResponse | undefined
```

强制 `contentType = application/json`，用运行时 `JSON.stringify` 序列化 `data`，再走 POST 入口。该赋值会覆盖 options 原有的 `contentType`。

<a id="api-symbol-aHR0cC5wb3N0SnNvbkFzeW5j"></a>

### `http.postJsonAsync(url, data?, options?, callback?)`

```ts
http.postJsonAsync(url: string, data?: unknown, options?: HttpRequestBuilderOptions, callback?: AsyncHttpCallback): Promise<HttpResponse>
```

JSON POST 的 Promise 版本。

```js
http.postJsonAsync('https://example.com/items', { name: 'Monkey' })
  .then(response => response.body.json())
```

<a id="api-symbol-aHR0cC5wb3N0TXVsdGlwYXJ0"></a>

### `http.postMultipart(url, files?, options?, callback?)`

```ts
http.postMultipart(url: string, files?: Record<string, MultipartValue>, options?: HttpRequestBuilderOptions, callback?: HttpCallback): HttpResponse | undefined

type MultipartValue =
  | string
  | number
  | PFileInterface
  | [fileName: string, path: string | java.net.URI]
  | [fileName: string, mimeType: string, path: string | java.net.URI]
```

强制 `POST` 和 `multipart/form-data`。省略 `files` 时仍会构建一个空的 multipart body。字符串/数字成为普通表单字段；文件对象或二/三元素数组成为文件 part。二元素数组按扩展名推断 MIME，未知时使用 `application/octet-stream`。路径按当前脚本运行时解析；无效数组长度或值类型抛出参数异常。

<a id="api-symbol-aHR0cC5wb3N0TXVsdGlwYXJ0QXN5bmM"></a>

### `http.postMultipartAsync(url, files?, options?, callback?)`

```ts
http.postMultipartAsync(url: string, files?: Record<string, MultipartValue>, options?: HttpRequestBuilderOptions, callback?: AsyncHttpCallback): Promise<HttpResponse>
```

multipart POST 的 Promise 版本。

```js
http.postMultipartAsync('https://example.com/upload', {
  note: 'profile image',
  avatar: ['avatar.png', 'image/png', '/sdcard/Download/avatar.png'],
}).then(response => response.body.string())
```

## PUT

<a id="api-symbol-aHR0cC5wdXQ"></a>

### `http.put(url, data?, options?, callback?)`

```ts
http.put(url: string, data?: object, options?: HttpRequestBuilderOptions, callback?: HttpCallback): HttpResponse | undefined
```

把方法设为 `PUT`，正文构建规则与 `http.post` 相同，默认 form-urlencoded。

<a id="api-symbol-aHR0cC5wdXRBc3luYw"></a>

### `http.putAsync(url, data?, options?, callback?)`

```ts
http.putAsync(url: string, data?: object, options?: HttpRequestBuilderOptions, callback?: AsyncHttpCallback): Promise<HttpResponse>
```

PUT 的 Promise 版本。

## DELETE 与兼容名

<a id="api-symbol-aHR0cC5kZWxldGU"></a>

### `http.delete(url, data?, options?, callback?)`

```ts
http.delete(url: string, data?: object, options?: HttpRequestBuilderOptions, callback?: HttpCallback): HttpResponse | undefined
```

把方法设为 `DELETE`，并按 POST 相同规则构建可选正文。默认 content type 是 form-urlencoded。

<a id="api-symbol-aHR0cC5kZWw"></a>

### `http.del(url, data?, options?, callback?)`

```ts
http.del(url: string, data?: object, options?: HttpRequestBuilderOptions, callback?: HttpCallback): HttpResponse | undefined
```

`http.delete` 的完整同义入口，保留用于兼容。

<a id="api-symbol-aHR0cC5kZWxldGVBc3luYw"></a>

### `http.deleteAsync(url, data?, options?, callback?)`

```ts
http.deleteAsync(url: string, data?: object, options?: HttpRequestBuilderOptions, callback?: AsyncHttpCallback): Promise<HttpResponse>
```

DELETE 的 Promise 版本。

<a id="api-symbol-aHR0cC5kZWxBc3luYw"></a>

### `http.delAsync(url, data?, options?, callback?)`

```ts
http.delAsync(url: string, data?: object, options?: HttpRequestBuilderOptions, callback?: AsyncHttpCallback): Promise<HttpResponse>
```

`http.deleteAsync` 的完整同义入口。

## 超时、重试、安全与生命周期

- `timeout` 默认 `30000` 毫秒，同时设置 connect/read/write timeout。
- `maxRetries` 默认 `3`；重试拦截器会对非 2xx 响应关闭旧 response 后重发，因此最多可能执行 4 次。它不在该循环中捕获首次网络 I/O 异常。
- `cacheBody` 默认 `false`；开启时，`string()` 或 `bytes()` 可在响应长度不超过 `bodyCacheThresholdBytes`（默认 8 MiB，未知长度也允许缓存）时保存同类型结果供重复读取。
- `isInsecure`/`insecure` 会安装信任所有证书的 TrustManager 并跳过主机名校验，只能用于受控调试环境；它会破坏 TLS 身份验证，不应进入生产脚本。
- 同步入口的异常直接抛出；回调入口以 `(null, error)` 报告 OkHttp I/O 失败；Promise 入口拒绝 Promise。
- 完整读取 `string()`、`bytes()`、`json()` 或 `saveToFile()` 会自动关闭响应体；`stream()` 的流和未消费响应必须由调用方关闭。
- 本页描述 MonkeyKing 6.7.0；OkHttp builder 可用方法与行为以应用内置 OkHttp 版本为准。


## 逐符号版本与 Rhino 2.0 示例

下列每个条目都对应一个公开 API 符号；示例按 Rhino 2.0 语法书写。需要文件、网络或 UI 资源的示例应在具备相应运行条件时执行。

<!-- api-member-contract id="http.__okhttp__" version="6.7.0" -->
`http.__okhttp__` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(http.__okhttp__);
```

<!-- api-member-contract id="http.buildRequest" version="6.7.0" -->
`http.buildRequest` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.buildRequest);
```

<!-- api-member-contract id="http.client" version="6.7.0" -->
`http.client` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.client);
```

<!-- api-member-contract id="http.del" version="6.7.0" -->
`http.del` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.del);
```

<!-- api-member-contract id="http.delAsync" version="6.7.0" -->
`http.delAsync` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.delAsync);
```

<!-- api-member-contract id="http.delete" version="6.7.0" -->
`http.delete` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.delete);
```

<!-- api-member-contract id="http.deleteAsync" version="6.7.0" -->
`http.deleteAsync` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.deleteAsync);
```

<!-- api-member-contract id="http.get" version="6.7.0" -->
`http.get` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.get);
```

<!-- api-member-contract id="http.getAsync" version="6.7.0" -->
`http.getAsync` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.getAsync);
```

<!-- api-member-contract id="http.head" version="6.7.0" -->
`http.head` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.head);
```

<!-- api-member-contract id="http.headAsync" version="6.7.0" -->
`http.headAsync` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.headAsync);
```

<!-- api-member-contract id="http.okhttp" version="6.7.0" -->
`http.okhttp` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(http.okhttp);
```

<!-- api-member-contract id="http.post" version="6.7.0" -->
`http.post` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.post);
```

<!-- api-member-contract id="http.postAsync" version="6.7.0" -->
`http.postAsync` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.postAsync);
```

<!-- api-member-contract id="http.postJson" version="6.7.0" -->
`http.postJson` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.postJson);
```

<!-- api-member-contract id="http.postJsonAsync" version="6.7.0" -->
`http.postJsonAsync` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.postJsonAsync);
```

<!-- api-member-contract id="http.postMultipart" version="6.7.0" -->
`http.postMultipart` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.postMultipart);
```

<!-- api-member-contract id="http.postMultipartAsync" version="6.7.0" -->
`http.postMultipartAsync` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.postMultipartAsync);
```

<!-- api-member-contract id="http.put" version="6.7.0" -->
`http.put` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.put);
```

<!-- api-member-contract id="http.putAsync" version="6.7.0" -->
`http.putAsync` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.putAsync);
```

<!-- api-member-contract id="http.request" version="6.7.0" -->
`http.request` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.request);
```

<!-- api-member-contract id="http.requestAsync" version="6.7.0" -->
`http.requestAsync` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http.requestAsync);
```

<!-- api-member-contract id="module:http" version="6.7.0" -->
`module:http` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof http);
```
