# 包装图像类 (ImageWrapper)

`ImageWrapper` 统一包装 Android `Bitmap`、OpenCV `Mat` 和屏幕捕获图像。`images.read`、`images.captureScreen`、图像变换和 OCR 等入口都使用该类型传递像素与原生资源。

实例拥有可回收资源。完成处理后应调用 `recycle()`，尤其是在循环截图或批量 OpenCV 处理中；脚本运行时退出时也会清理已登记的图像资源，但不应把退出清理当作长期脚本的内存管理策略。

```js
const image = images.read('/sdcard/Download/input.png', true)
try {
  console.log(image.width, image.height, image.pixel(0, 0))
} finally {
  image.recycle()
}
```

## 属性

### `width`

```ts
readonly width: number
```

图像宽度（像素）。图像已回收时抛出状态异常。

### `height`

```ts
readonly height: number
```

图像高度（像素）。图像已回收时抛出状态异常。

### `size`

```ts
readonly size: org.opencv.core.Size
```

返回新的 OpenCV `Size(width, height)`。图像已回收时抛出状态异常。

### `bitmap`

```ts
readonly bitmap: android.graphics.Bitmap
```

返回内部位图；若实例当前只持有 `Mat`，则按需创建位图并转换像素。返回值与包装器共享生命周期：回收包装器后不要继续使用该位图，也不要单独回收它后再复用包装器。

### `mat`

```ts
readonly mat: com.qiaomu.monkeyking.core.opencv.Mat
```

返回内部 OpenCV 矩阵；若实例当前只持有位图，则按需创建并转换。矩阵由包装器管理，调用方不应在包装器仍会使用它时单独 `release()`。

### `bgrMat`

```ts
readonly bgrMat: com.qiaomu.monkeyking.core.opencv.Mat
```

把当前矩阵从 BGRA 转为新的 BGR 矩阵并返回。每次读取都会创建转换结果；应避免无意义地重复读取，并让包装器负责最终释放最近一次结果。

### `plane`

```ts
readonly plane: android.media.Image.Plane | null
```

底层媒体图像平面（如果仍存在）。当前版本的屏幕媒体图像构造流程会立即复制像素并关闭原始 `Image`，因此常规截图包装器通常不再保留该引用。

## 方法

<a id="m-oneshot"></a>

### `oneShot()`

```ts
oneShot(): ImageWrapper
```

把当前实例标记为“一次性”并返回同一个对象。之后 MonkeyKing 图像 API 在完成一次操作后调用内部 `shoot()` 时会自动 `recycle()`；普通实例的 `shoot()` 不执行回收。

```js
const image = images.read('/sdcard/Download/input.png', true).oneShot()
const gray = images.grayscale(image) // 操作结束后 image 自动回收
try {
  images.save(gray, '/sdcard/Download/gray.png')
} finally {
  gray.recycle()
}
```

标记不可撤销。不要在把实例交给会触发 `shoot()` 的 API 后继续访问它。

### `saveTo(path)`

```ts
saveTo(path: string): boolean
```

确保父目录存在并保存图像。内部只有位图时按 PNG、质量 100 写入；只有 OpenCV 矩阵时使用 `Imgcodecs.imwrite`，格式由路径扩展名决定。目录创建失败会抛出运行时异常；位图输出路径不可创建时抛出 `UncheckedIOException`；部分编码失败以 `false` 返回。

```js
const shot = images.captureScreen()
try {
  if (!shot.saveTo('/sdcard/Pictures/shot.png')) {
    throw new Error('保存失败')
  }
} finally {
  shot.recycle()
}
```

### `pixel(x, y)`

```ts
pixel(x: number, y: number): ColorInt
```

返回指定像素的 ARGB 颜色整数。坐标必须满足 `0 <= x < width`、`0 <= y < height`，越界抛出 `ArrayIndexOutOfBoundsException`。

对于矩阵图像：单通道值扩展为不透明灰度，三通道按 RGB 转为不透明色，四个及以上通道取前四个 RGBA 分量；不支持的通道数会抛出异常。

### `clone()`

```ts
clone(): ImageWrapper
```

深复制当前图像并返回独立包装器。位图会复制为可变位图（缺失配置时使用 `ARGB_8888`），矩阵会调用 `clone()`；调用方负责回收新实例。

### `ensureNotRecycled()`

```ts
ensureNotRecycled(): void
```

实例仍可用时返回；已回收时抛出带本地化消息的状态异常。公开属性和像素方法会自动执行此检查。

### `isRecycled()`

```ts
isRecycled(): boolean
```

返回包装器是否已执行回收。该查询本身不会抛出“已回收”异常。

### `recycle()`

```ts
recycle(): void
```

同步释放持有的 `Bitmap`、OpenCV `Mat`、BGR 矩阵和媒体图像，并把实例标记为已回收。方法使用实例锁保护清理过程，重复调用不会再次访问已置空的成员。

```js
const image = images.read('/sdcard/Download/large.png', true)
image.recycle()
console.log(image.isRecycled()) // true
// image.width // 抛出异常
```

## 所有权、线程与异常

- `images.read`、`images.load`、`images.captureScreen` 和大多数变换返回的新包装器由调用方负责回收。
- 路径参数被转换为当前脚本运行时路径；共享存储访问仍受 Android 权限和分区存储规则约束。
- 包装器的 `recycle()` 有同步保护，但像素读取、位图/矩阵转换和其他属性访问并非并发事务；不要在一个线程回收的同时从另一个线程使用同一实例。
- 调用图像 API 时，如果输入是路径，运行时通常创建一次性包装器并在操作后自动回收；这不影响方法返回的新图像。
- 本页描述 MonkeyKing 的资源合同。
