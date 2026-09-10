# MIME - 媒体类型

`mime` 用于解析 MIME 字符串、创建 OkHttp `MediaType`、按文件扩展名推断类型，并提供 IANA 媒体类型常量。运行时同时注册 `mime` 与 `$mime`，两者引用同一个模块对象。

版本：**v6.6.0**

参考：[IANA Media Types](https://www.iana.org/assignments/media-types/media-types.xhtml)、[OkHttp MediaType](https://square.github.io/okhttp/5.x/okhttp/okhttp3/-media-type/)。

## mime

### mime(value)

- `value` {string} - MIME 字符串
- 返回 {JsMime}

解析一个 MIME 字符串。参数数量不为 1 或字符串格式无法被底层解析器接受时会抛出错误。

```js
let parsed = mime('text/html; charset=utf-8');

console.log(parsed.type); // text
console.log(parsed.subtype); // html
console.log(parsed.mimeTypeRefined); // text/html
console.log(parsed.parameters.charset); // utf-8
```

## JsMime

`mime(value)` 返回的只读数据对象。

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `raw` | `string` | 原始输入 |
| `type` | `string` | 主类型，例如 `text` |
| `subtype` | `string` | 子类型，例如 `html` |
| `mimeType` | `string` | 规范化后的完整类型，保留参数 |
| `mimeTypeRefined` | `string` | 只含 `type/subtype` 的类型 |
| `parameters` | `Object` | 分号后可解析的键值参数，值均为字符串 |

`String(parsed)` 会返回包含上述字段的可读文本。

```js
let parsed = $mime('application/json; profile=compact');
console.log(parsed.mimeType); // application/json; profile=compact
console.log(String(parsed));
```

## mime.getMediaType(value)

- `value` {string} - 媒体类型字符串
- 返回 {okhttp3.MediaType}

使用 OkHttp 的严格解析接口创建 `MediaType`。格式非法时抛出 `IllegalArgumentException`。

## mime.parseMediaType(value)

- `value` {string} - 媒体类型字符串
- 返回 {okhttp3.MediaType | null}

使用 OkHttp 的容错解析接口。格式非法时返回 `null`，不会因语法错误抛出异常。

```js
let jsonType = mime.getMediaType(mime.APPLICATION_JSON);
let invalid = mime.parseMediaType('not a media type');

console.log(jsonType.type); // application
console.log(invalid); // null
```

## mime.fromFile(path)

- `path` {string} - 文件路径或文件名
- 返回 {string | null}

只读取路径扩展名并通过 Android `MimeTypeMap` 查询，不检查文件内容，也不要求文件实际存在。

- 路径没有扩展名时返回 `mime.WILDCARD`，即 `*/*`。
- 扩展名存在但 Android 没有映射时返回 `null`。
- 找到映射时返回对应 MIME 字符串。

```js
console.log(mime.fromFile('/sdcard/photo.png')); // image/png
console.log(mime.fromFile('/sdcard/README')); // */*
```

## mime.fromFileOr(path, defaultType?)

先调用 `mime.fromFile(path)`。结果为空时返回 `defaultType`；默认类型也为空时返回 `mime.WILDCARD`。

```js
let type = mime.fromFileOr('./archive.unknownext', mime.APPLICATION_OCTET_STREAM);
console.log(type); // application/octet-stream
```

## mime.fromFileOrWildcard(path)

等价于 `mime.fromFileOr(path, mime.WILDCARD)`，保证返回字符串。

## MIME 常量

固定源码在 `mime` 对象上公开 **2540** 个大写常量，覆盖 IANA 注册表及少量兼容别名。常量名称把媒体类型转为大写下划线形式，例如 `application/problem+json` 对应 `APPLICATION_PROBLEM_JSON`；同一值可能有多个兼容名称。

按名称前缀统计的常量族：

| 前缀 | 数量 | 示例 |
| --- | ---: | --- |
| `APPLICATION_` | 1842 | `APPLICATION_JSON`、`APPLICATION_PDF`、`APPLICATION_XML`、`APPLICATION_ZIP` |
| `AUDIO_` | 180 | `AUDIO_AAC`、`AUDIO_FLAC`、`AUDIO_MPEG`、`AUDIO_OGG` |
| `CHEMICAL_` | 54 | 化学数据媒体类型 |
| `FONT_` | 6 | 字体媒体类型 |
| `IMAGE_` | 109 | `IMAGE_JPEG`、`IMAGE_PNG`、`IMAGE_SVG_XML`、`IMAGE_WEBP` |
| `INODE_` | 6 | inode 兼容类型 |
| `MESSAGE_` | 24 | `MESSAGE_RFC822` 等消息类型 |
| `MODEL_` | 42 | 三维模型类型 |
| `MULTIPART_` | 19 | `MULTIPART_FORM_DATA` 等复合类型 |
| `TEXT_` | 139 | `TEXT_PLAIN`、`TEXT_HTML`、`TEXT_CSS`、`TEXT_CSV`、`TEXT_MARKDOWN` |
| `VIDEO_` | 111 | `VIDEO_MP4`、`VIDEO_MPEG`、`VIDEO_OGG`、`VIDEO_WEBM` |

其余顶层兼容常量包括：

| 常量 | 值 |
| --- | --- |
| `mime.WILDCARD` | `*/*` |
| `mime.MEDIA_TYPE_WILDCARD` | `*` |
| `mime.APPLICATION_X_WWW_FORM_URLENCODED` | `application/x-www-form-urlencoded` |
| `mime.APPLICATION_FORM_URLENCODED` | `application/x-www-form-urlencoded` |
| `mime.APPLICATION_JSON_PATCH_JSON` | `application/json-patch+json` |
| `mime.MULTIPART_FORM_DATA` | `multipart/form-data` |
| `mime.SERVER_SENT_EVENTS` | `text/event-stream` |
| `mime.TEXT_EVENT_STREAM` | `text/event-stream` |

常用文件类型：

```js
console.log(mime.APPLICATION_JSON); // application/json
console.log(mime.APPLICATION_PDF); // application/pdf
console.log(mime.IMAGE_PNG); // image/png
console.log(mime.AUDIO_FLAC); // audio/flac
console.log(mime.VIDEO_MP4); // video/mp4
```

常量值来自固定源码生成时采用的注册表快照。IANA 后续新增或变更不会在已安装的 Monkey King 版本中自动同步，跨版本依赖冷门常量前应先检查其是否存在。

## 副作用与兼容性

- `mime(value)` 和 OkHttp 转换只处理内存中的字符串。
- 文件推断只查看扩展名，不读取文件内容。
- Android `MimeTypeMap` 的映射可能随系统版本变化；需要稳定结果时优先使用明确常量或自有映射。
- `JsMime.parameters` 进行轻量键值拆分，不负责 RFC 参数解码、字符集验证或引号语义规范化。
