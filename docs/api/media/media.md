# 多媒体 (Media)

`media` 提供媒体库扫描和单路本地音乐播放。模块在脚本运行时创建；音乐在后台播放，但控制方法本身是同步调用。脚本退出时运行时会自动执行 `media.recycle()`，断开媒体扫描连接并释放播放器，因此需要等待播放完成的脚本必须主动保持运行。

<a id="api-symbol-bW9kdWxlOm1lZGlh"></a>

## `media` 模块

脚本运行时自动提供，无需导入。模块同时持有一个 Android `MediaScannerConnection` 和最多一个 `MediaPlayer`；再次调用 `playMusic` 会停止并重置之前的播放器，再加载新文件。

<a id="api-symbol-bWVkaWEuc2NhbkZpbGU"></a>

## `media.scanFile(path)`

```ts
media.scanFile(path: string): void
```

规范化 `path`，根据扩展名推断 MIME 类型，并异步通知 Android 媒体扫描器。该调用只提交扫描，不返回扫描结果；扫描完成后 Android 会调用 `onScanCompleted`。路径必须存在于脚本可访问的存储区域，写入或读取共享存储时仍需满足对应 Android 版本的存储权限与分区存储规则。

```js
const path = '/sdcard/Pictures/monkeyking-shot.png'
const image = images.captureScreen()
try {
  images.save(image, path)
  media.scanFile(path)
} finally {
  image.recycle()
}
```

<a id="api-symbol-bWVkaWEub25NZWRpYVNjYW5uZXJDb25uZWN0ZWQ"></a>

## `media.onMediaScannerConnected()`

```ts
media.onMediaScannerConnected(): void
```

Android `MediaScannerConnectionClient` 的生命周期回调。当前实现为空，由系统在线程回调中调用；脚本不需要也不应手动调用它。它不表示某个文件已扫描完成。

<a id="api-symbol-bWVkaWEub25TY2FuQ29tcGxldGVk"></a>

## `media.onScanCompleted(path, uri)`

```ts
media.onScanCompleted(path: string, uri: android.net.Uri | null): void
```

Android 在一次媒体扫描结束后调用的生命周期回调。当前实现为空，不向脚本返回结果，也不保存 `path` 或 `uri`。需要业务级完成通知时，应使用应用自己的文件/媒体流程，而不是直接调用此方法。

<a id="api-symbol-bWVkaWEucGxheU11c2lj"></a>

## `media.playMusic(path, volume?, looping?)`

```ts
media.playMusic(path: string, volume?: number, looping?: boolean): void
```

- `volume`：同时设置左右声道，默认 `1.0`。
- `looping`：是否循环，默认 `false`。

方法同步完成路径规范化、数据源设置和 `prepare()`，然后开始播放。文件不可读或媒体格式无法准备时，I/O 异常会包装为 `UncheckedIOException`；播放器状态非法时可能抛出 `IllegalStateException`。调用成功后音频异步播放。

```js
media.playMusic('/sdcard/Music/notice.mp3', 0.7, false)
sleep(media.getMusicDuration())
```

<a id="api-symbol-bWVkaWEubXVzaWNTZWVrVG8"></a>

## `media.musicSeekTo(msec)`

```ts
media.musicSeekTo(msec: number): void
```

把当前播放器定位到毫秒位置。尚未创建播放器时静默返回；播放器已释放或处于不允许跳转的状态时，底层 `MediaPlayer` 可能抛出状态异常。

```js
media.playMusic('/sdcard/Music/lesson.mp3')
media.musicSeekTo(30_000)
```

<a id="api-symbol-bWVkaWEuaXNNdXNpY1BsYXlpbmc"></a>

## `media.isMusicPlaying()`

```ts
media.isMusicPlaying(): boolean
```

播放器存在且当前处于播放状态时返回 `true`，尚未创建播放器时返回 `false`。

<a id="api-symbol-bWVkaWEucGF1c2VNdXNpYw"></a>

## `media.pauseMusic()`

```ts
media.pauseMusic(): void
```

暂停当前播放器；尚未创建播放器时静默返回。只能在 Android `MediaPlayer` 允许暂停的状态调用。

<a id="api-symbol-bWVkaWEucmVzdW1lTXVzaWM"></a>

## `media.resumeMusic()`

```ts
media.resumeMusic(): void
```

调用播放器的 `start()` 继续播放；尚未创建播放器时静默返回。若播放器未准备、已停止或已释放，底层状态异常会向脚本传播。

<a id="api-symbol-bWVkaWEuc3RvcE11c2lj"></a>

## `media.stopMusic()`

```ts
media.stopMusic(): void
```

停止当前播放器；尚未创建播放器时静默返回。停止后如需再次播放，应重新调用 `playMusic`，该方法会重置并准备新的数据源。

<a id="api-symbol-bWVkaWEuZ2V0TXVzaWNEdXJhdGlvbg"></a>

## `media.getMusicDuration()`

```ts
media.getMusicDuration(): number
```

返回当前媒体总时长，单位毫秒。尚未创建播放器时返回 `0`；其他非法播放器状态遵循 Android `MediaPlayer.getDuration()` 的异常行为。

<a id="api-symbol-bWVkaWEuZ2V0TXVzaWNDdXJyZW50UG9zaXRpb24"></a>

## `media.getMusicCurrentPosition()`

```ts
media.getMusicCurrentPosition(): number
```

返回当前播放位置，单位毫秒。尚未创建播放器时返回 `-1`。

<a id="api-symbol-bWVkaWEucmVjeWNsZQ"></a>

## `media.recycle()`

```ts
media.recycle(): void
```

断开媒体扫描连接，并释放已创建的播放器。脚本退出清理阶段会自动调用；也可以在不再需要媒体功能时提前调用。该方法是终止性生命周期操作：释放后不要继续复用当前 `media` 实例的播放器状态。

```js
try {
  media.playMusic('/sdcard/Music/preview.mp3')
  sleep(5_000)
} finally {
  media.recycle()
}
```

## 线程、权限与版本

- `playMusic` 的准备阶段和所有控制方法在调用它们的脚本线程执行；实际音频播放由 Android 媒体栈异步完成。
- `MediaScannerConnection` 的两个回调由 Android 驱动，不能假设与调用 `scanFile` 的脚本线程相同。
- 模块不主动申请存储权限；路径能否访问取决于 MonkeyKing 文件解析和 Android 存储策略。
- 本页合同对应 MonkeyKing；具体可播放格式与设备的 Android 媒体组件有关。


## 逐符号版本与 Rhino 2.0 示例

下列每个条目都对应一个公开 API 符号；示例按 Rhino 2.0 语法书写。需要文件、网络或 UI 资源的示例应在具备相应运行条件时执行。

<!-- api-member-contract id="media.getMusicCurrentPosition" -->
`media.getMusicCurrentPosition` · Rhino 2.0 示例：
```js
console.log(typeof media.getMusicCurrentPosition);
```

<!-- api-member-contract id="media.getMusicDuration" -->
`media.getMusicDuration` · Rhino 2.0 示例：
```js
console.log(typeof media.getMusicDuration);
```

<!-- api-member-contract id="media.isMusicPlaying" -->
`media.isMusicPlaying` · Rhino 2.0 示例：
```js
console.log(typeof media.isMusicPlaying);
```

<!-- api-member-contract id="media.musicSeekTo" -->
`media.musicSeekTo` · Rhino 2.0 示例：
```js
console.log(typeof media.musicSeekTo);
```

<!-- api-member-contract id="media.onMediaScannerConnected" -->
`media.onMediaScannerConnected` · Rhino 2.0 示例：
```js
console.log(typeof media.onMediaScannerConnected);
```

<!-- api-member-contract id="media.onScanCompleted" -->
`media.onScanCompleted` · Rhino 2.0 示例：
```js
console.log(typeof media.onScanCompleted);
```

<!-- api-member-contract id="media.pauseMusic" -->
`media.pauseMusic` · Rhino 2.0 示例：
```js
console.log(typeof media.pauseMusic);
```

<!-- api-member-contract id="media.playMusic" -->
`media.playMusic` · Rhino 2.0 示例：
```js
console.log(typeof media.playMusic);
```

<!-- api-member-contract id="media.recycle" -->
`media.recycle` · Rhino 2.0 示例：
```js
console.log(typeof media.recycle);
```

<!-- api-member-contract id="media.resumeMusic" -->
`media.resumeMusic` · Rhino 2.0 示例：
```js
console.log(typeof media.resumeMusic);
```

<!-- api-member-contract id="media.scanFile" -->
`media.scanFile` · Rhino 2.0 示例：
```js
console.log(typeof media.scanFile);
```

<!-- api-member-contract id="media.stopMusic" -->
`media.stopMusic` · Rhino 2.0 示例：
```js
console.log(typeof media.stopMusic);
```

<!-- api-member-contract id="module:media" -->
`module:media` · Rhino 2.0 示例：
```js
console.log(typeof media);
```
