# HttpRequestBuilderOptions

`HttpRequestBuilderOptions` controls both OkHttp request construction and the shared client used to execute it. Convenience methods such as `http.get` and `http.postJson` write their method/content fields into the supplied object, so reuse a fresh object when later mutation would be surprising.

```ts
interface HttpRequestBuilderOptions {
  method?: string
  headers?: HttpRequestHeaders
  contentType?: string
  body?: string | okhttp3.RequestBody | ((sink: okio.BufferedSink) => void)
  files?: Record<string, MultipartValue>

  timeout?: number
  maxRetries?: number
  client?: Record<string, unknown | [unknown, unknown]>
  isInsecure?: boolean
  insecure?: boolean

  cacheBody?: boolean
  bodyCacheThresholdBytes?: number
}
```

## 请求构建字段

### `method`

```ts
method?: string
```

通用 `http.request`/`http.buildRequest` 的 HTTP 方法。`get`、`head`、`post`、`put`、`delete` 等便捷入口会覆盖为对应大写方法。方法与是否允许正文由 OkHttp `Request.Builder.method` 验证。

### `headers`

```ts
headers?: Record<string, unknown | unknown[]>
```

键值会转为字符串并传给 OkHttp `Request.Builder.header`。数组值会依次调用同一 `header` 方法；由于该方法替换已有同名头，最终数组项生效。需要更复杂的多值头时可直接构建 `okhttp3.Request` 或在单个字符串中按协议格式合并。

### `contentType`

```ts
contentType?: string
```

为字符串正文和函数正文创建 `MediaType`。`http.post`、`put`、`delete` 缺省时使用 `application/x-www-form-urlencoded`；`postJson` 强制为 `application/json`；`postMultipart` 强制为 `multipart/form-data`。

### `body`

```ts
body?: string | okhttp3.RequestBody | ((sink: okio.BufferedSink) => void)
```

- `okhttp3.RequestBody`：直接使用。
- 字符串：按 `contentType` 创建请求体。
- 函数：OkHttp 写正文时在 Rhino 上下文中调用，并传入 `BufferedSink`；函数必须同步完成写入。

其他类型会抛出 `WrappedIllegalArgumentException`。便捷表单和 JSON 方法会自行生成/覆盖该字段。

```js
const response = http.request('https://example.com/raw', {
  method: 'POST',
  contentType: 'text/plain; charset=utf-8',
  body: 'hello',
})
console.log(response.body.string())
```

### `files`

```ts
files?: Record<string, MultipartValue>

type MultipartValue =
  | string
  | number
  | PFileInterface
  | [fileName: string, path: string | java.net.URI]
  | [fileName: string, mimeType: string, path: string | java.net.URI]
```

仅 multipart 构建使用。字符串/数字成为普通字段；文件对象和数组成为文件 part。二元素数组按扩展名推断 MIME，无法推断时使用 `application/octet-stream`。

## 执行与客户端字段

### `timeout`

```ts
timeout?: number // 默认 30000，单位毫秒
```

同一个值设置 OkHttp connect/read/write timeout。值按长整数转换；单位是毫秒，不是秒。

### `maxRetries`

```ts
maxRetries?: number // 默认 3
```

写入共享 `MutableOkHttp.maxRetries`。重试拦截器对非成功 HTTP 响应关闭并重发，最多额外尝试该次数；它不会把网络 I/O 异常转换为 HTTP 重试。

### `client`

```ts
client?: Record<string, unknown | [unknown, unknown]>
```

以属性名反射调用当前内置版本的 `okhttp3.OkHttpClient.Builder`：

- 值不是二元素列表时尝试一参数 overload。
- 二元素列表优先尝试二参数 overload。
- boolean、long/int/double、string 和 `TimeUnit` 会按目标参数类型转换；`TimeUnit` 可写成大小写不敏感字符串。
- Java 对象参数在类型匹配时原样传入。
- 不存在的方法、只有零参数的方法或无法用一/二参数调用的方法会抛出异常。

构建后的客户端保存回当前 `http` 模块，影响后续请求。可用 builder 方法取决于应用内置 OkHttp 版本，参阅 OkHttp 官方 `OkHttpClient.Builder` API。

```js
http.get('https://example.com', {
  client: {
    followRedirects: false,
    pingInterval: [30, 'SECONDS'],
  },
})
```

### `isInsecure` / `insecure`

```ts
isInsecure?: boolean
insecure?: boolean
```

同义开关，默认 `false`。为 `true` 时安装信任所有 X.509 证书的 TrustManager，并让主机名校验始终通过。这会禁用 TLS 身份验证，只适合受控调试，不能用于生产或处理敏感数据。

## 响应体缓存字段

### `cacheBody`

```ts
cacheBody?: boolean // 默认 false
```

开启后，`response.body.string()` 或 `bytes()` 在完整读取时可缓存该表示，使相同方法能够重复读取；默认的一次性响应流在完整读取后立即关闭。

### `bodyCacheThresholdBytes`

```ts
bodyCacheThresholdBytes?: number // 默认 8388608（8 MiB）
```

已知 `Content-Length` 不超过阈值时才缓存；长度未知时运行时允许缓存。缓存字符串和缓存字节是两个独立槽位：先读取并关闭一种表示后，不能依赖另一种表示仍可首次读取。

## 线程、异常与版本

- options 解析与 request 构建在调用线程完成；`*Async` 只把网络执行放到后台。
- 无效字段类型、反射方法或 multipart 数据抛出参数异常；OkHttp 的 URL、方法、头和值验证异常继续向外传播。
- 每次请求应用 client options 都会更新共享客户端和重试次数，多个脚本线程并发修改时应由调用方协调。
- 本页合同对应 MonkeyKing 和其内置 OkHttp 版本。
