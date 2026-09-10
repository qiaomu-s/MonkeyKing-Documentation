# Okhttp3Request

`Okhttp3Request` 是 MonkeyKing 6.7.0 内置 OkHttp 4.12.0 的 `okhttp3.Request`。`http.buildRequest` 直接返回该类型，`HttpResponse.request` 返回产生最终响应的请求。

官方 API：[`okhttp3.Request`](https://square.github.io/okhttp/4.x/okhttp/okhttp3/-request/)。

```js
const request = http.buildRequest('https://example.com/items', {
  method: 'GET',
  headers: { accept: 'application/json' },
})

console.log(request.method())
console.log(request.url())
console.log(request.header('accept'))
```

## 常用方法

### `method()`

```ts
method(): string
```

返回大写或调用方指定形式的 HTTP 方法。

### `url()`

```ts
url(): okhttp3.HttpUrl
```

返回已解析、规范化的 URL。类型见 [Okhttp3HttpUrl](okhttp3-http-url.md)。

### `headers()`

```ts
headers(): okhttp3.Headers
```

返回请求的完整不可变 header 集合。使用 `header(name)` 读取最后一个同名值，使用 `headers(name)` 读取全部同名值。

### `header(name)` / `headers(name)`

```ts
header(name: string): string | null
headers(name: string): java.util.List<string>
```

名称匹配不区分大小写；不存在时单值入口返回 `null`，多值入口返回空列表。

### `body()`

```ts
body(): okhttp3.RequestBody | null
```

返回请求体；GET/HEAD 等无 body 请求通常为 `null`。请求体可能是一次写入的流式实现，不要假设可以任意重复读取。

### `cacheControl()`

```ts
cacheControl(): okhttp3.CacheControl
```

解析请求 `Cache-Control` header 并返回 OkHttp `CacheControl`。

```js
const request = http.buildRequest('https://example.com', {
  method: 'GET',
  headers: { 'cache-control': 'no-store, no-cache' },
})
const policy = request.cacheControl()
console.log(policy.noStore(), policy.noCache())
```

### `isHttps()`

```ts
isHttps(): boolean
```

请求 URL 使用 HTTPS 时返回 `true`。

### `tag()` / `tag(type)`

```ts
tag(): object | null
tag(type: java.lang.Class): object | null
```

读取 builder 附加的请求标签；MonkeyKing 默认构建流程不设置 tag。

### `newBuilder()`

```ts
newBuilder(): okhttp3.Request.Builder
```

返回以当前请求为模板的可变 builder，可修改 URL、方法、headers、body 或 tags 后构建新请求；原请求保持不变。

### `toString()`

```ts
toString(): string
```

返回 OkHttp 调试摘要，通常包含方法、URL 和 tags。不要把格式当作稳定序列化协议。

## 生命周期、线程与版本

- Request 对象不可变且不持有打开的 response body，不需要关闭；其中的自定义 `RequestBody` 可能在发送时访问外部资源，应由其创建者管理。
- `Request.Builder` 可变，不应由多个线程并发修改；已构建 Request 可安全只读共享。
- `HttpResponse.request` 可能是重定向链最终请求，不一定等于最初构建的对象。
- 本页合同固定到 OkHttp 4.12.0；其他方法请以官方 4.x API 为准。
