# MediaInfo - 媒体信息

`mediainfo` 同步读取本地媒体文件的容器、视频、音频、字幕等元数据。运行时同时注册 `mediainfo` 与 `$mediainfo`，两者引用同一个模块对象。

版本：**v6.7.0**

## mediainfo

### mediainfo(path)

等价于 `mediainfo.read(path)`。

```js
let info = mediainfo(files.path('./sample.mp4'));
console.log(info.path);
console.log(info.general('Format'));
console.log(info.video('Width'));
```

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
| `path` | `string` | 解析后的绝对路径，只读 |
| `inform` | `string` | MediaInfo 生成的完整文本报告，只读 |

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

- `info.general(parameter = '')`
- `info.video(parameter = '')`
- `info.audio(parameter = '')`
- `info.text(parameter = '')`
- `info.other(parameter = '')`
- `info.image(parameter = '')`
- `info.menu(parameter = '')`
- `info.max(parameter = '')`

查询固定使用相应流类型的第 `0` 个流。省略参数时返回该流的默认信息；指定参数时，名称应使用 MediaInfo 支持的字段名称。文件没有该流或字段时，底层库通常返回空字符串。

```js
let info = $mediainfo.read('/sdcard/Movies/demo.mp4');
console.log(info.general('FileSize/String'));
console.log(info.video('Format'));
console.log(info.audio('Channel(s)'));
```

### 字符串表示

`String(info)` 或 `info.toString()` 返回 `MediainfoNativeObject` 的可读摘要，其中包含从 `inform` 派生出的动态区段和字段。该转换不会再次读取文件。

## 生命周期与副作用

- 创建对象时立即同步读取文件并解析全部区段，没有延迟加载。
- 对象保存的是读取时的快照；文件后续发生变化时应重新调用 `mediainfo.read`。
- 模块只读取媒体内容，不修改源文件。
- 返回对象没有显式 `close()`；底层 MediaInfo 调用由运行时封装管理。
