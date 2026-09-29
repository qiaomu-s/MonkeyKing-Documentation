# Okhttp3HttpUrl

`Okhttp3HttpUrl` 是 MonkeyKing 内置 OkHttp 4.12.0 的 `okhttp3.HttpUrl`。`HttpResponse.url` 和 `HttpResponse.request.url()` 返回该不可变对象；它已经完成 URL 解析和规范化，比重新拆分字符串更可靠。

官方 API：[`okhttp3.HttpUrl`](https://square.github.io/okhttp/4.x/okhttp/okhttp3/-http-url/)。

```js
const response = http.get('https://example.com:8443/a/b?q=monkey#top')
try {
  const url = response.url
  console.log(url.scheme())       // https
  console.log(url.host())         // example.com
  console.log(url.port())         // 8443
  console.log(url.encodedPath())  // /a/b
  console.log(url.query())        // q=monkey
} finally {
  response.body.close()
}
```

## 常用方法

### `scheme()`

```ts
scheme(): string
```

返回规范化的小写 scheme，OkHttp `HttpUrl` 支持 `http` 和 `https`。

### `isHttps()`

```ts
isHttps(): boolean
```

scheme 为 `https` 时返回 `true`。

### `host()` / `port()`

```ts
host(): string
port(): number
```

返回规范化主机和有效端口。URL 未显式给端口时返回 scheme 默认端口。

### `username()` / `password()`

```ts
username(): string
password(): string
```

返回解码后的 user-info；未提供时为空字符串。需要编码形式可用 `encodedUsername()`、`encodedPassword()`。

### `encodedPath()` / `pathSegments()`

```ts
encodedPath(): string
pathSegments(): java.util.List<string>
```

分别返回保留百分号编码的完整路径和解码后的路径段。另有 `encodedPathSegments()`、`pathSize()`。

### `query()` / `encodedQuery()`

```ts
query(): string | null
encodedQuery(): string | null
```

返回解码/编码查询串，没有 query 时为 `null`。可用 `queryParameter(name)`、`queryParameterValues(name)`、`queryParameterName(index)`、`queryParameterValue(index)` 和 `querySize()` 精确访问参数。

### `fragment()` / `encodedFragment()`

```ts
fragment(): string | null
encodedFragment(): string | null
```

返回解码/编码 fragment，没有时为 `null`。

### `resolve(link)`

```ts
resolve(link: string): okhttp3.HttpUrl | null
```

相对当前 URL 解析链接；无法解析时返回 `null`，原对象不变。

### `newBuilder()`

```ts
newBuilder(): okhttp3.HttpUrl.Builder
```

返回以当前 URL 为起点的可变 builder。构建结果仍是新的不可变 `HttpUrl`。

### `uri()` / `url()` / `toString()`

```ts
uri(): java.net.URI
url(): java.net.URL
toString(): string
```

转换为 Java URI、URL 或规范化字符串。Java 转换可能对目标类型不能表示的内容抛出异常。

## 生命周期、线程与版本

- `HttpUrl` 不持有响应体或连接资源，不需要关闭；关闭责任仍属于 `HttpResponse.body`。
- 对象不可变，可安全地只读共享；builder 可变，不应并发修改。
- 本页只描述 MonkeyKing 固定依赖 OkHttp 4.12.0 的公开方法；更多方法以官方 4.x API 为准。
