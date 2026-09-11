# MediaInfo - 媒体信息

`mediainfo` 同步读取本地媒体文件的容器、视频、音频、字幕等元数据。运行时同时注册 `mediainfo` 与 `$mediainfo`，两者引用同一个模块对象。

版本：**v6.7.0**

本页所有 `js` 代码块均为 Monkey King **Rhino 2.0** 示例。

<a id="api-symbol-bW9kdWxlOm1lZGlhaW5mbw"></a>

## mediainfo

<a id="api-symbol-Y2FsbDptZWRpYWluZm8"></a>

### mediainfo(path)

等价于 `mediainfo.read(path)`。

```js
let info = mediainfo(files.path('./sample.mp4'));
console.log(info.path);
console.log(info.general('Format'));
console.log(info.video('Width'));
```

<a id="api-symbol-bWVkaWFpbmZvLnJlYWQ"></a>

## mediainfo.read(path)

- `path` {string} - 媒体文件路径；相对路径按 `files` 模块规则解析
- 返回 {MediainfoNativeObject}

读取文件并返回媒体信息对象。`null`、`undefined`、空字符串或只含空白的路径会抛出参数错误。

该方法会同步访问文件系统并加载本地 `mediainfo` 原生库，适合在工作线程中处理较大的文件。原生库不可用时会抛出 `MediaInfo library is not available`；文件不可读、格式不受支持或路径无效时会传播底层错误。

```js
let info = mediainfo.read('/sdcard/Movies/demo.mkv');
console.log(String(info));
```

## MediainfoNativeObject

### 固定属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| [`path`](#info-path) | `string` | 解析后的绝对路径，只读 |
| [`inform`](#info-inform) | `string` | MediaInfo 生成的完整文本报告，只读 |

<a id="api-symbol-bWVkaWFpbmZvLnJlc3VsdC5wYXRo"></a>

#### info.path

版本：**6.7.0**。读取时解析后的绝对路径，只读。

<a id="api-symbol-bWVkaWFpbmZvLnJlc3VsdC5pbmZvcm0"></a>

#### info.inform

版本：**6.7.0**。MediaInfo 生成的完整文本报告，只读。

<a id="api-symbol-ZHluYW1pYzptZWRpYWluZm8ucmVzdWx0Lm1ldGFkYXRh"></a>

### 动态区段

构造对象时，运行时会解析 `inform`。报告中的每个区段会成为一个小写属性，例如 `general`、`video`、`audio`、`text`、`other`、`image`、`menu`；区段中的字段会转换为 lowerCamelCase，只读保存为字符串。

区段是否存在以及字段名称取决于实际文件。例如视频文件可能具有 `info.video.width`，纯音频文件通常没有视频字段。读取前应先判断属性是否存在。

```js
let info = mediainfo.read('/sdcard/Music/song.flac');
if (info.audio) {
    console.log(info.audio.format);
    console.log(info.audio.duration);
}
```

### 查询函数

对象始终提供以下函数，均接受可选的 `parameter` 字符串并返回 MediaInfo 对应值：

<a id="api-symbol-bWVkaWFpbmZvLnJlc3VsdC5nZW5lcmFs"></a>
- `info.general(parameter = '')`
<a id="api-symbol-bWVkaWFpbmZvLnJlc3VsdC52aWRlbw"></a>
- `info.video(parameter = '')`
<a id="api-symbol-bWVkaWFpbmZvLnJlc3VsdC5hdWRpbw"></a>
- `info.audio(parameter = '')`
<a id="api-symbol-bWVkaWFpbmZvLnJlc3VsdC50ZXh0"></a>
- `info.text(parameter = '')`
<a id="api-symbol-bWVkaWFpbmZvLnJlc3VsdC5vdGhlcg"></a>
- `info.other(parameter = '')`
<a id="api-symbol-bWVkaWFpbmZvLnJlc3VsdC5pbWFnZQ"></a>
- `info.image(parameter = '')`
<a id="api-symbol-bWVkaWFpbmZvLnJlc3VsdC5tZW51"></a>
- `info.menu(parameter = '')`
<a id="api-symbol-bWVkaWFpbmZvLnJlc3VsdC5tYXg"></a>
- `info.max(parameter = '')`

查询固定使用相应流类型的第 `0` 个流。省略参数时返回该流的默认信息；指定参数时，名称应使用 MediaInfo 支持的字段名称。文件没有该流或字段时，底层库通常返回空字符串。

```js
let info = $mediainfo.read('/sdcard/Movies/demo.mp4');
console.log(info.general('FileSize/String'));
console.log(info.video('Format'));
console.log(info.audio('Channel(s)'));
```

<a id="api-symbol-bWVkaWFpbmZvLnJlc3VsdC50b1N0cmluZw"></a>

### 字符串表示

`String(info)` 或 `info.toString()` 返回 `MediainfoNativeObject` 的可读摘要，其中包含从 `inform` 派生出的动态区段和字段。该转换不会再次读取文件。

## 生命周期与副作用

- 创建对象时立即同步读取文件并解析全部区段，没有延迟加载。
- 对象保存的是读取时的快照；文件后续发生变化时应重新调用 `mediainfo.read`。
- 模块只读取媒体内容，不修改源文件。
- 返回对象没有显式 `close()`；底层 MediaInfo 调用由运行时封装管理。
- 路径、文件读取、格式解析或原生库加载异常会同步抛出，不会返回部分初始化对象。
- 模块不请求额外 Android 运行时权限，但调用方必须对目标路径具有系统允许的读取权限；受分区存储限制的路径仍可能失败。


## 逐符号版本与 Rhino 2.0 示例

下列每个条目都对应一个公开 API 符号；示例按 Rhino 2.0 语法书写。需要文件、网络或 UI 资源的示例应在具备相应运行条件时执行。

<!-- api-member-contract id="call:mediainfo" version="6.7.0" -->
`call:mediainfo` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof mediainfo);
```

<!-- api-member-contract id="dynamic:mediainfo.result.metadata" version="6.7.0" -->
`dynamic:mediainfo.result.metadata` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var info = mediainfo.read('/sdcard/demo.mp4');
console.log(info.metadata);
```

<!-- api-member-contract id="mediainfo.read" version="6.7.0" -->
`mediainfo.read` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof mediainfo.read);
```

<!-- api-member-contract id="mediainfo.result.audio" version="6.7.0" -->
`mediainfo.result.audio` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var info = mediainfo.read('/sdcard/demo.mp4');
console.log(info.audio);
```

<!-- api-member-contract id="mediainfo.result.general" version="6.7.0" -->
`mediainfo.result.general` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var info = mediainfo.read('/sdcard/demo.mp4');
console.log(info.general);
```

<!-- api-member-contract id="mediainfo.result.image" version="6.7.0" -->
`mediainfo.result.image` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var info = mediainfo.read('/sdcard/demo.mp4');
console.log(info.image);
```

<!-- api-member-contract id="mediainfo.result.inform" version="6.7.0" -->
`mediainfo.result.inform` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var info = mediainfo.read('/sdcard/demo.mp4');
console.log(info.inform);
```

<!-- api-member-contract id="mediainfo.result.max" version="6.7.0" -->
`mediainfo.result.max` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var info = mediainfo.read('/sdcard/demo.mp4');
console.log(info.max);
```

<!-- api-member-contract id="mediainfo.result.menu" version="6.7.0" -->
`mediainfo.result.menu` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var info = mediainfo.read('/sdcard/demo.mp4');
console.log(info.menu);
```

<!-- api-member-contract id="mediainfo.result.other" version="6.7.0" -->
`mediainfo.result.other` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var info = mediainfo.read('/sdcard/demo.mp4');
console.log(info.other);
```

<!-- api-member-contract id="mediainfo.result.path" version="6.7.0" -->
`mediainfo.result.path` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var info = mediainfo.read('/sdcard/demo.mp4');
console.log(info.path);
```

<!-- api-member-contract id="mediainfo.result.text" version="6.7.0" -->
`mediainfo.result.text` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var info = mediainfo.read('/sdcard/demo.mp4');
console.log(info.text);
```

<!-- api-member-contract id="mediainfo.result.toString" version="6.7.0" -->
`mediainfo.result.toString` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var info = mediainfo.read('/sdcard/demo.mp4');
console.log(info.toString);
```

<!-- api-member-contract id="mediainfo.result.video" version="6.7.0" -->
`mediainfo.result.video` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var info = mediainfo.read('/sdcard/demo.mp4');
console.log(info.video);
```

<!-- api-member-contract id="module:mediainfo" version="6.7.0" -->
`module:mediainfo` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof mediainfo);
```
