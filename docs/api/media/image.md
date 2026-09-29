# 图像 (Images)

<a id="api-symbol-bW9kdWxlOmltYWdlcw"></a>

## `images` 模块

`images` 是全局图像模块，另有 `$images` 同义入口；`captureScreen`、`requestScreenCapture` 和 `requestScreenCaptureAsync` 还会直接导出为同名全局函数。模块覆盖截图、编解码、OpenCV 变换、找色找图、特征匹配和相似度计算。

该模块分为两个部分, 找图找色部分和图片处理部分.

图像和 OpenCV 矩阵占用原生内存。除明确返回布尔值、数字或普通对象的入口外，创建出的 `ImageWrapper`、`Mat`、`ImageFeatures` 应在不用时回收；脚本退出清理只是最后保障。路径输入通常会被包装为一次性图像并在该次操作后自动回收，方法返回的新图像仍由调用方负责。

```js
const image = images.read('./1.png', true)
try {
  const gray = images.grayscale(image)
  try {
    images.save(gray, './gray.png')
  } finally {
    gray.recycle()
  }
} finally {
  image.recycle()
}
```

所有变换和匹配入口同步运行在调用脚本线程；网络加载异步入口和屏幕授权异步入口返回 Promise。OpenCV 函数首次使用时可能触发按需初始化。

## 图片处理

<a id="api-symbol-aW1hZ2VzLnJlYWQ"></a>
## images.read(path[, isStrict])

* `path` {string} 图片路径
* `isStrict` {boolean} 是否在读取失败时抛出异常，默认为 `false`

读取路径 `path` 的图片文件并返回一个 `ImageWrapper`。默认 `isStrict = false` 时，文件不存在或无法解码返回 `null`；传入 `true` 时会抛出异常。

## images.load(url)

* `url` {string} 图片URL地址

加载 URL 指向的网络图片并返回一个 `ImageWrapper`。URL 无效、连接/读取失败或响应无法解码时可能抛出异常；该入口不保证以 `null` 表示失败。

## images.copy(img)

* `img` {Image} 图片
* 返回 {Image}

复制一张图片并返回新的副本. 该函数会完全复制img对象的数据.

## images.save(image, path[, format = "png", quality = 100])

* `image` {Image} 图片
* `path` {string} 路径
* `format` {string} 图片格式, 可选的值为:
    * `png`
    * `jpeg`/`jpg`
    * `webp`
    * `webp_lossless`/`webp-lossless`
    * `webp_lossy`/`webp-lossy`
* `quality` {number} 图片质量, 为0~100的整数值

把图片 `image` 按指定格式和质量保存到 `path` 中；省略 `format` 时默认为 PNG，省略 `quality` 时默认为 100。父目录不存在时会尝试创建，目标文件存在会被覆盖。

```
//把图片压缩为原来的一半质量并保存
var img = images.read("/sdcard/1.png");
images.save(img, "/sdcard/1.jpg", "jpg", 50);
app.viewFile("/sdcard/1.jpg");
```

## images.fromBase64(base64)

* `base64` {string} 图片的Base64数据
* 返回 {Image}

解码Base64数据并返回解码后的图片Image对象. 如果base64无法解码则返回`null`.

## images.toBase64(img[, format = "png", quality = 100])

* `image` {image} 图片
* `format` {string} 图片格式, 可选的值为:
    * `png`
    * `jpeg`/`jpg`
    * `webp`
* `quality` {number} 图片质量, 为0~100的整数值
* 返回 {string}

把图片编码为base64数据并返回.

## images.fromBytes(bytes)

* `bytes` {byte[]} 字节数组

解码字节数组bytes并返回解码后的图片Image对象. 如果bytes无法解码则返回`null`.

## images.toBytes(img[, format = "png", quality = 100])

* `image` {image} 图片
* `format` {string} 图片格式, 可选的值为:
    * `png`
    * `jpeg`/`jpg`
    * `webp`
* `quality` {number} 图片质量, 为0~100的整数值
* 返回 {byte[]}

把图片编码为字节数组并返回.

## images.clip(img, x, y, w, h)

* `img` {Image} 图片
* `x` {number} 剪切区域的左上角横坐标
* `y` {number} 剪切区域的左上角纵坐标
* `w` {number} 剪切区域的宽度
* `h` {number} 剪切区域的高度
* 返回 {Image}

从图片img的位置(x, y)处剪切大小为w * h的区域, 并返回该剪切区域的新图片.

```
var src = images.read("/sdcard/1.png");
var clip = images.clip(src, 100, 100, 400, 400);
images.save(clip, "/sdcard/clip.png");
```

## images.resize(img, size[, interpolation])

**[v4.1.0新增]**

* `img` {Image} 图片
* `size` {Array} 两个元素的数组[w, h], 分别表示宽度和高度；如果只有一个元素, 则宽度和高度相等
* `interpolation` {string} 插值方法, 可选, 默认为"LINEAR"（线性插值）, 可选的值有：
    * `NEAREST` 最近邻插值
    * `LINEAR` 线性插值（默认）
    * `AREA` 区域插值
    * `CUBIC` 三次样条插值
    * `LANCZOS4` Lanczos插值
      参见[InterpolationFlags](https://docs.opencv.org/4.x/da/d54/group__imgproc__transform.html#ga5bb5a1fea74ea38e1a5445ca803ff121/)

* 返回 {Image}

调整图片大小, 并返回调整后的图片. 例如把图片放缩为200*300：`images.resize(img, [200, 300])`.

参见[Imgproc.resize](https://docs.opencv.org/4.x/da/d54/group__imgproc__transform.html#ga47a974309e9102f5f08231edc7e7529d/).

## images.scale(img, fx, fy[, interpolation])

**[v4.1.0新增]**

* `img` {Image} 图片
* `fx` {number} 宽度放缩倍数
* `fy` {number} 高度放缩倍数
* `interpolation` {string} 插值方法, 可选, 默认为"LINEAR"（线性插值）, 可选的值有：
    * `NEAREST` 最近邻插值
    * `LINEAR` 线性插值（默认）
    * `AREA` 区域插值
    * `CUBIC` 三次样条插值
    * `LANCZOS4` Lanczos插值
      参见[InterpolationFlags](https://docs.opencv.org/4.x/da/d54/group__imgproc__transform.html#ga5bb5a1fea74ea38e1a5445ca803ff121/)

* 返回 {Image}

放缩图片, 并返回放缩后的图片. 例如把图片变成原来的一半：`images.scale(img, 0.5, 0.5)`.

参见[Imgproc.resize](https://docs.opencv.org/4.x/da/d54/group__imgproc__transform.html#ga47a974309e9102f5f08231edc7e7529d/).

## images.rotate(img, degree[, x, y])

**[v4.1.0新增]**

* `img` {Image} 图片
* `degree` {number} 旋转角度.
* `x` {number} 旋转中心x坐标, 默认为图片中点
* `y` {number} 旋转中心y坐标, 默认为图片中点
* 返回 {Image}

将图片逆时针旋转 degree 度, 返回旋转后的图片对象.

例如逆时针旋转90度为`images.rotate(img, 90)`.

## images.concat(img1, image2[, direction])

**[v4.1.0新增]**

* `img1` {Image} 图片1
* `img2` {Image} 图片2
* direction {string} 连接方向, 默认为"RIGHT", 可选的值有：
    * `LEFT` 将图片2接到图片1左边
    * `RIGHT` 将图片2接到图片1右边
    * `TOP` 将图片2接到图片1上边
    * `BOTTOM` 将图片2接到图片1下边
* 返回 {Image}

连接两张图片, 并返回连接后的图像. 如果两张图片大小不一致, 小的那张将适当居中.

## images.grayscale(img)

**[v4.1.0新增]**

* `img` {Image} 图片
* 返回 {Image}

灰度化图片, 并返回灰度化后的图片.

## image.threshold(img, threshold, maxVal[, type])

**[v4.1.0新增]**

* `img` {Image} 图片
* `threshold` {number} 阈值
* `maxVal` {number} 最大值
* `type` {string} 阈值化类型, 默认为"BINARY", 参见[ThresholdTypes](https://docs.opencv.org/4.x/d7/d1b/group__imgproc__misc.html#gaa9e58d2860d4afa658ef70a9b1115576/), 可选的值:
    * `BINARY`
    * `BINARY_INV`
    * `TRUNC`
    * `TOZERO`
    * `TOZERO_INV`
    * `OTSU`
    * `TRIANGLE`

* 返回 {Image}

将图片阈值化, 并返回处理后的图像. 可以用这个函数进行图片二值化. 例如：`images.threshold(img, 100, 255, "BINARY")`, 这个代码将图片中大于100的值全部变成255, 其余变成0, 从而达到二值化的效果. 如果img是一张灰度化图片, 这个代码将会得到一张黑白图片.

可以参考有关博客（比如[threshold函数的使用](https://blog.csdn.net/u012566751/article/details/77046445/)）或者OpenCV文档[threshold](https://docs.opencv.org/4.x/d7/d1b/group__imgproc__misc.html#gae8a4a146d1ca78c626a53577199e9c57/).

## images.adaptiveThreshold(img, maxValue, adaptiveMethod, thresholdType, blockSize, C)

**[v4.1.0新增]**

* `img` {Image} 图片
* `maxValue` {number} 最大值
* `adaptiveMethod` {string} 在一个邻域内计算阈值所采用的算法, 可选的值有：
    * `MEAN_C` 计算出领域的平均值再减去参数C的值
    * `GAUSSIAN_C` 计算出领域的高斯均值再减去参数C的值
* `thresholdType` {string} 阈值化类型, 可选的值有：
    * `BINARY`
    * `BINARY_INV`
* `blockSize` {number} 邻域块大小
* `C` {number} 偏移值调整量
* 返回 {Image}

对图片进行自适应阈值化处理, 并返回处理后的图像.

可以参考有关博客（比如[threshold与adaptiveThreshold](https://blog.csdn.net/guduruyu/article/details/68059450/)）或者OpenCV文档[adaptiveThreshold](https://docs.opencv.org/4.x/d7/d1b/group__imgproc__misc.html#ga72b913f352e4a1b1b397736707afcde3
/).

## images.cvtColor(img, code[, dstCn])

**[v4.1.0新增]**

* `img` {Image} 图片
* `code` {string} 颜色空间转换的类型, 可选的值有一共有205个（参见[ColorConversionCodes](https://docs.opencv.org/4.x/d8/d01/group__imgproc__color__conversions.html#ga4e0972be5de079fed4e3a10e24ef5ef0/)）, 这里只列出几个：
    * `BGR2GRAY` BGR转换为灰度
    * `BGR2HSV ` BGR转换为HSV
* `dstCn` {number} 目标图像的颜色通道数量, 如果不填写则根据其他参数自动决定.
* 返回 {Image}

对图像进行颜色空间转换, 并返回转换后的图像.

可以参考有关博客（比如[颜色空间转换](https://blog.csdn.net/u011574296/article/details/70896811?locationNum=14&fps=1)）或者OpenCV文档[cvtColor](https://docs.opencv.org/4.x/d8/d01/group__imgproc__color__conversions.html#ga397ae87e1288a81d2363b61574eb8cab/).

## images.inRange(img, lowerBound, upperBound)

**[v4.1.0新增]**

* `img` {Image} 图片
* `lowerBound` {string} | {number} 颜色下界
* `upperBound` {string} | {number} 颜色下界
* 返回 {Image}

将图片二值化, 在lowerBound~upperBound范围以外的颜色都变成0, 在范围以内的颜色都变成255.

例如`images.inRange(img, "#000000", "#222222")`.

## images.interval(img, color, interval)

**[v4.1.0新增]**

* `img` {Image} 图片
* `color` {string} | {number} 颜色值
* `interval` {number} 每个通道的范围间隔
* 返回 {Image}

将图片二值化, 在color-interval ~ color+interval范围以外的颜色都变成0, 在范围以内的颜色都变成255. 这里对color的加减是对每个通道而言的.

例如`images.interval(img, "#888888", 16)`, 每个通道的颜色值均为0x88, 加减16后的范围是[0x78, 0x98], 因此这个代码将把#787878~#989898的颜色变成#FFFFFF, 而把这个范围以外的变成#000000.

## images.blur(img, size[, anchor, type])

**[v4.1.0新增]**

* `img` {Image} 图片
* `size` {Array} 定义滤波器的大小, 如[3, 3]
* `anchor` {Array} 指定锚点位置(被平滑点), 默认为图像中心
* `type` {string} 推断边缘像素类型, 默认为"DEFAULT", 可选的值有：
    * `CONSTANT` iiiiii|abcdefgh|iiiiiii with some specified i
    * `REPLICATE` aaaaaa|abcdefgh|hhhhhhh
    * `REFLECT` fedcba|abcdefgh|hgfedcb
    * `WRAP` cdefgh|abcdefgh|abcdefg
    * `REFLECT_101` gfedcb|abcdefgh|gfedcba
    * `TRANSPARENT` uvwxyz|abcdefgh|ijklmno
    * `REFLECT101` same as BORDER_REFLECT_101
    * `DEFAULT` same as BORDER_REFLECT_101
    * `ISOLATED` do not look outside of ROI
* 返回 {Image}

对图像进行模糊（平滑处理）, 返回处理后的图像.

可以参考有关博客（比如[实现图像平滑处理](https://www.cnblogs.com/denny402/p/3848316.html)）或者OpenCV文档[blur](https://docs.opencv.org/4.x/d4/d86/group__imgproc__filter.html#ga8c45db9afe636703801b0b2e440fce37/).

## images.medianBlur(img, size)

**[v4.1.0新增]**

* `img` {Image} 图片
* `size` {number} 定义滤波器的大小, 正奇数, 如 3
* 返回 {Image}

对图像进行中值滤波, 返回处理后的图像.

可以参考有关博客（比如[实现图像平滑处理](https://www.cnblogs.com/denny402/p/3848316.html)）或者OpenCV文档[blur](https://docs.opencv.org/4.x/d4/d86/group__imgproc__filter.html#ga564869aa33e58769b4469101aac458f9/).

## images.gaussianBlur(img, size[, sigmaX, sigmaY, type])

**[v4.1.0新增]**

* `img` {Image} 图片
* `size` {Array} 定义滤波器的大小, 如[3, 3]
* `sigmaX` {number} x方向的标准方差, 不填写则自动计算
* `sigmaY` {number} y方向的标准方差, 不填写则自动计算
* `type` {string} 推断边缘像素类型, 默认为"DEFAULT", 参见`images.blur`
* 返回 {Image}

对图像进行高斯模糊, 返回处理后的图像.

可以参考有关博客（比如[实现图像平滑处理](https://www.cnblogs.com/denny402/p/3848316.html)）或者OpenCV文档[GaussianBlur](https://docs.opencv.org/4.x/d4/d86/group__imgproc__filter.html#gaabe8c836e97159a9193fb0b11ac52cf1/).

## images.matToImage(mat)

**[v4.1.0新增]**

* `mat` {Mat} OpenCV的Mat对象
* 返回 {Image}

把Mat对象转换为Image对象.

## 找图找色

<a id="api-symbol-aW1hZ2VzLnJlcXVlc3RTY3JlZW5DYXB0dXJl"></a>
## images.requestScreenCapture(options?)

```ts
images.requestScreenCapture(landscape?: boolean): boolean
images.requestScreenCapture(options?: {
  orientation?: 'none' | 'auto' | 'portrait' | 'landscape' | number
  width?: number
  height?: number
  isAsync?: boolean
  async?: boolean
}): boolean
images.requestScreenCapture(width: number, height: number): boolean
```

布尔参数表示截图方向：`false` 为竖屏，`true` 为横屏；省略时使用自动方向。对象形式还可指定 `orientation`、固定 `width`/`height`，以及连续异步帧的 `isAsync`（兼容名 `async`）。传入两个数字时使用固定宽高并采用 `orientation = none`。

向系统申请屏幕截图权限, 返回是否请求成功.

第一次使用该函数会弹出截图权限请求, 建议选择“总是允许”.

这个函数只是申请截图权限, 并不会真正执行截图, 真正的截图函数是`captureScreen()`.

该函数在截图脚本中只需执行一次, 而无需每次调用`captureScreen()`都调用一次.

同步入口不能在 UI 线程调用；UI 场景应使用 `requestScreenCaptureAsync`。如果不指定方向，截图方向由当前设备屏幕方向决定。

建议在本软件界面运行该函数, 在其他软件界面运行时容易出现一闪而过的黑屏现象.

示例:

```
//请求截图
if(!requestScreenCapture()){
    toast("请求截图失败");
    exit();
}
//连续截图10张图片(间隔1秒)并保存到存储卡目录
for(var i = 0; i < 10; i++){
    captureScreen("/sdcard/screencapture" + i + ".png");
    sleep(1000);
}

```

该函数也可以作为全局函数使用.

## images.captureScreen()

截取当前屏幕并返回一个 `ImageWrapper`；传入保存路径时返回是否保存成功。

没有截图权限时执行该函数会抛出SecurityException.

没有截图权限，或多次重试后仍没有有效帧时会抛出异常。两次调用可能返回相同的 `ImageWrapper`，这是因为设备截图更新需要一定时间，短时间内（一般约 16ms）连续调用可能复用同一帧。

截图需要转换为Bitmap格式, 从而该函数执行需要一定的时间(0~20ms).

另外在requestScreenCapture()执行成功后需要一定时间后才有截图可用, 因此如果立即调用captureScreen(), 会等待一定时间后(一般为几百ms)才返回截图.

例子:

```
//请求横屏截图
requestScreenCapture(true);
//截图
var img = captureScreen();
//获取在点(100, 100)的颜色值
var color = images.pixel(img, 100, 100);
//显示该颜色值
toast(colors.toString(color));
```

该函数也可以作为全局函数使用.

## images.captureScreen(path)

* `path` {string} 截图保存路径

截取当前屏幕并以 PNG 格式保存到 `path` 中。父目录不存在时会尝试创建，文件存在会被覆盖；返回 `boolean` 表示保存是否成功。

该函数也可以作为全局函数使用。

## images.pixel(image, x, y)

* `image` {Image} 图片
* `x` {number} 要获取的像素的横坐标.
* `y` {number} 要获取的像素的纵坐标.

返回图片image在点(x, y)处的像素的ARGB值.

该值的格式为0xAARRGGBB, 是一个"32位整数"(虽然JavaScript中并不区分整数类型和其他数值类型).

坐标系以图片左上角为原点. 以图片左侧边为y轴, 上侧边为x轴.

## images.findColor(image, color, options)

* `image` {Image} 图片
* `color` {number} | {string} 要寻找的颜色的RGB值. 如果是一个整数, 则以0xRRGGBB的形式代表RGB值（A通道会被忽略）；如果是字符串, 则以"#RRGGBB"代表其RGB值.
* `options` {Object} 选项

在图片中寻找颜色color. 找到时返回找到的点Point, 找不到时返回null.

选项包括：

* `region` {Array} 找色区域. 是一个两个或四个元素的数组. (region[0], region[1])表示找色区域的左上角；region[2]*region[3]表示找色区域的宽高. 如果只有region只有两个元素, 则找色区域为(region[0], region[1])到屏幕右下角. 如果不指定region选项, 则找色区域为整张图片.
* `threshold` {number} 找色时颜色相似度的临界值, 范围为0~255（越小越相似, 0为颜色相等, 255为任何颜色都能匹配）. 默认为4. threshold和浮点数相似度(0.0~1.0)的换算为 similarity = (255 - threshold) / 255.

该函数也可以作为全局函数使用.

一个循环找色的例子如下：

```
requestScreenCapture();

//循环找色, 找到红色(#ff0000)时停止并报告坐标
while(true){
    var img = captureScreen();
    var point = findColor(img, "#ff0000");
    if(point){
        toast("找到红色, 坐标为(" + point.x + ", " + point.y + ")");
    }
}

```

一个区域找色的例子如下：

```
//读取本地图片/sdcard/1.png
var img = images.read("/sdcard/1.png");
//判断图片是否加载成功
if(!img){
    toast("没有该图片");
    exit();
}
//在该图片中找色, 指定找色区域为在位置(400, 500)的宽为300长为200的区域, 指定找色临界值为4
var point = findColor(img, "#00ff00", {
     region: [400, 500, 300, 200],
     threshold: 4
 });
if(point){
    toast("找到啦:" + point);
}else{
    toast("没找到");
}
```

## images.findColorInRegion(img, color, x, y[, width, height, threshold])

区域找色的简便方法.

相当于

```
images.findColor(img, color, {
     region: [x, y, width, height],
     threshold: threshold
});
```

该函数也可以作为全局函数使用.

## images.findColorEquals(img, color[, x, y, width, height])

* `img` {Image} 图片
* `color` {number} | {string} 要寻找的颜色
* `x` {number} 找色区域的左上角横坐标
* `y` {number} 找色区域的左上角纵坐标
* `width` {number} 找色区域的宽度
* `height` {number} 找色区域的高度
* 返回 {Point}

在图片img指定区域中找到颜色和color完全相等的某个点, 并返回该点的左边；如果没有找到, 则返回`null`.

找色区域通过`x`, `y`, `width`, `height`指定, 如果不指定找色区域, 则在整张图片中寻找.

该函数也可以作为全局函数使用.

示例：
(通过找QQ红点的颜色来判断是否有未读消息)

```
requestScreenCapture();
launchApp("QQ");
sleep(1200);
var p = findColorEquals(captureScreen(), "#f64d30");
if(p){
    toast("有未读消息");
}else{
    toast("没有未读消息");
}
```

## images.findMultiColors(img, firstColor, colors[, options])

* `img` {Image} 要找色的图片
* `firstColor` {number} | {string} 第一个点的颜色
* `colors` {Array} 表示剩下的点相对于第一个点的位置和颜色的数组, 数组的每个元素为[x, y, color]
* `options` {Object} 选项, 包括：
    * `region` {Array} 找色区域. 是一个两个或四个元素的数组. (region[0], region[1])表示找色区域的左上角；region[2]*region[3]表示找色区域的宽高. 如果只有region只有两个元素, 则找色区域为(region[0], region[1])到屏幕右下角. 如果不指定region选项, 则找色区域为整张图片.
    * `threshold` {number} 找色时颜色相似度的临界值, 范围为0~255（越小越相似, 0为颜色相等, 255为任何颜色都能匹配）. 默认为4. threshold和浮点数相似度(0.0~1.0)的换算为 similarity = (255 - threshold) / 255.

多点找色, 类似于按键精灵的多点找色, 其过程如下：

1. 在图片img中找到颜色firstColor的位置(x0, y0)
2. 对于数组colors的每个元素[x, y, color], 检查图片img在位置(x + x0, y + y0)上的像素是否是颜色color, 是的话返回(x0, y0), 否则继续寻找firstColor的位置, 重新执行第1步
3. 整张图片都找不到时返回`null`

例如, 对于代码`images.findMultiColors(img, "#123456", [[10, 20, "#ffffff"], [30, 40, "#000000"]])`, 假设图片在(100, 200)的位置的颜色为#123456, 这时如果(110, 220)的位置的颜色为#fffff且(130, 240)的位置的颜色为#000000, 则函数返回点(100, 200).

如果要指定找色区域, 则在options中指定, 例如:

```
var p = images.findMultiColors(img, "#123456", [[10, 20, "#ffffff"], [30, 40, "#000000"]], {
    region: [0, 960, 1080, 960]
});
```

## images.detectsColor(image, color, x, y[, threshold = 16, algorithm = "diff"])

* `image` {Image} 图片
* `color` {number} | {string} 要检测的颜色
* `x` {number} 要检测的位置横坐标
* `y` {number} 要检测的位置纵坐标
* `threshold` {number} 颜色相似度临界值, 默认为16. 取值范围为0~255.
* `algorithm` {string} 颜色匹配算法, 包括:
    * "equal": 相等匹配, 只有与给定颜色color完全相等时才匹配.
    * "diff": 差值匹配. 与给定颜色的R、G、B差的绝对值之和小于threshold时匹配.
    * "rgb": rgb欧拉距离相似度. 与给定颜色color的rgb欧拉距离小于等于threshold时匹配.

    * "rgb+": 加权rgb欧拉距离匹配([LAB Delta E](https://en.wikipedia.org/wiki/Color_difference/)).
    * "hs": hs欧拉距离匹配. hs为HSV空间的色调值.

返回图片image在位置(x, y)处是否匹配到颜色color. 用于检测图片中某个位置是否是特定颜色.

一个判断微博客户端的某个微博是否被点赞过的例子：

```
requestScreenCapture();
//找到点赞控件
var like = id("ly_feed_like_icon").findOne();
//获取该控件中点坐标
var x = like.bounds().centerX();
var y = like.bounds().centerY();
//截图
var img = captureScreen();
//判断在该坐标的颜色是否为橙红色
if(images.detectsColor(img, "#fed9a8", x, y)){
    //是的话则已经是点赞过的了, 不做任何动作
}else{
    //否则点击点赞按钮
    like.click();
}
```

## images.findImage(img, template[, options])

* `img` {Image} 大图片
* `template` {Image} 小图片（模板）
* `options` {Object} 找图选项

找图. 在大图片img中查找小图片template的位置（模块匹配）, 找到时返回位置坐标(Point), 找不到时返回null.

选项包括：

* `threshold` {number} 图片相似度. 取值范围为0~1的浮点数. 默认值为0.9.
* `region` {Array} 找图区域. 参见findColor函数关于region的说明.
* `level` {number} **一般而言不必修改此参数**. 不加此参数时该参数会根据图片大小自动调整. 找图算法是采用图像金字塔进行的, level参数表示金字塔的层次, level越大可能带来越高的找图效率, 但也可能造成找图失败（图片因过度缩小而无法分辨）或返回错误位置. 因此, 除非您清楚该参数的意义并需要进行性能调优, 否则不需要用到该参数.

该函数也可以作为全局函数使用.

一个最简单的找图例子如下：

```
var img = images.read("/sdcard/大图.png");
var templ = images.read("/sdcard/小图.png");
var p = findImage(img, templ);
if(p){
    toast("找到啦:" + p);
}else{
    toast("没找到");
}
```

稍微复杂点的区域找图例子如下：

```
auto();
requestScreenCapture();
var wx = images.read("/sdcard/微信图标.png");
//返回桌面
home();
//截图并找图
var p = findImage(captureScreen(), wx, {
    region: [0, 50],
    threshold: 0.8
});
if(p){
    toast("在桌面找到了微信图标啦: " + p);
}else{
    toast("在桌面没有找到微信图标");
}
```

## images.findImageInRegion(img, template, x, y[, width, height, threshold])

区域找图的简便方法. 相当于：

```
images.findImage(img, template, {
    region: [x, y, width, height],
    threshold: threshold
})
```

该函数也可以作为全局函数使用.

## images.matchTemplate(img, template, options)

**[v4.1.0新增]**

* `img` {Image} 大图片
* `template` {Image} 小图片（模板）
* `options` {Object} 找图选项：
    * `threshold` {number} 图片相似度. 取值范围为0~1的浮点数. 默认值为0.9.
    * `region` {Array} 找图区域. 参见findColor函数关于region的说明.
    * `max` {number} 找图结果最大数量, 默认为5
    * `level` {number} **一般而言不必修改此参数**. 不加此参数时该参数会根据图片大小自动调整. 找图算法是采用图像金字塔进行的, level参数表示金字塔的层次, level越大可能带来越高的找图效率, 但也可能造成找图失败（图片因过度缩小而无法分辨）或返回错误位置. 因此, 除非您清楚该参数的意义并需要进行性能调优, 否则不需要用到该参数.
* 返回 {MatchingResult}

在大图片中搜索小图片, 并返回搜索结果MatchingResult. 该函数可以用于找图时找出多个位置, 可以通过max参数控制最大的结果数量. 也可以对匹配结果进行排序、求最值等操作.

# MatchingResult

**[v4.1.0新增]**

## matches

* {Array} 匹配结果的数组.

数组的元素是一个Match对象：

* `point` {Point} 匹配位置
* `similarity` {number} 相似度

例如:

```
var result = images.matchTemplate(img, template, {
    max: 100
});
result.matches.forEach(match => {
    log("point = " + match.point + ", similarity = " + match.similarity);
});
```

## points

* {Array} 匹配位置的数组.

## first()

* 返回 {Match}

第一个匹配结果. 如果没有任何匹配, 则返回`null`.

## last()

* 返回 {Match}

最后一个匹配结果. 如果没有任何匹配, 则返回`null`.

## leftmost()

* 返回 {Match}

位于大图片最左边的匹配结果. 如果没有任何匹配, 则返回`null`.

## topmost()

* 返回 {Match}

位于大图片最上边的匹配结果. 如果没有任何匹配, 则返回`null`.

## rightmost()

* 返回 {Match}

位于大图片最右边的匹配结果. 如果没有任何匹配, 则返回`null`.

## bottommost()

* 返回 {Match}

位于大图片最下边的匹配结果. 如果没有任何匹配, 则返回`null`.

## best()

* 返回 {Match}

相似度最高的匹配结果. 如果没有任何匹配, 则返回`null`.

## worst()

* 返回 {Match}

相似度最低的匹配结果. 如果没有任何匹配, 则返回`null`.

## sortBy(cmp)

* cmp {Function}|{string} 比较函数, 或者是一个字符串表示排序方向. 例如"left"表示将匹配结果按匹配位置从左往右排序、"top"表示将匹配结果按匹配位置从上往下排序, "left-top"表示将匹配结果按匹配位置从左往右、从上往下排序. 方向包括`left`（左）, `top` （上）, `right` （右）, `bottom`（下）.
* {MatchingResult}

对匹配结果进行排序, 并返回排序后的结果.

```
var result = images.matchTemplate(img, template, {
    max: 100
});
log(result.sortBy("top-right"));
```

# Image

表示一张图片, 可以是截图的图片, 或者本地读取的图片, 或者从网络获取的图片.

## Image.getWidth()

返回以像素为单位图片宽度.

## Image.getHeight()

返回以像素为单位的图片高度.

## Image.saveTo(path)

* `path` {string} 路径

把图片保存到路径path. （如果文件存在则覆盖）

## Image.pixel(x, y)

* `x` {number} 横坐标
* `y` {number} 纵坐标

返回图片image在点(x, y)处的像素的ARGB值.

该值的格式为0xAARRGGBB, 是一个"32位整数"(虽然JavaScript中并不区分整数类型和其他数值类型).

坐标系以图片左上角为原点. 以图片左侧边为y轴, 上侧边为x轴.

# Point

findColor, findImage返回的对象. 表示一个点（坐标）.

## Point.x

横坐标.

## Point.y

纵坐标.

---

## MonkeyKing 补充合同

以下入口由 当前 Kotlin 运行时直接导出。图片参数除特别说明外可传 `ImageWrapper` 或路径；路径会严格读取为一次性图像，失败时抛出参数/读取异常，并在调用结束后自动回收。返回的新图像不随输入一起回收。

### 读取、保存与屏幕捕获

<a id="api-symbol-aW1hZ2VzLmltcmVhZA"></a>

#### `images.imread(path)`

```ts
images.imread(path: string): com.qiaomu.monkeyking.core.opencv.Mat
```

规范化路径后直接调用 OpenCV `Imgcodecs.imread`，返回 MonkeyKing `Mat` 包装。与 `images.read` 不同，它不返回 `ImageWrapper`，也不把空矩阵转换为 `null`；调用方必须在用完后 `release()`。

<a id="api-symbol-aW1hZ2VzLmxvYWRBc3luYw"></a>

#### `images.loadAsync(url)`

```ts
images.loadAsync(url: string): Promise<ImageWrapper>
```

在异步操作适配器中通过 HTTP URL 加载并解码图片。成功时 Promise 解析为新 `ImageWrapper`；连接、读取或解码错误使 Promise 拒绝。模块不会缓存响应，调用方负责回收结果。

```js
images.loadAsync('https://example.com/image.png').then(image => {
  try {
    console.log(image.width, image.height)
  } finally {
    image.recycle()
  }
})
```

<a id="api-symbol-aW1hZ2VzLmNhcHR1cmVTY3JlZW4"></a>

#### `images.captureScreen(path?)`

```ts
images.captureScreen(): ImageWrapper
images.captureScreen(path: string): boolean
```

无参数时返回当前有效屏幕帧；带路径时捕获并保存，返回保存是否成功。后台脚本线程在尚无捕获器时会先同步请求授权；UI 线程不会隐式执行同步授权，应先用 `requestScreenCaptureAsync`。没有授权或多次重试后仍无有效帧时抛出 `SecurityException` 或 `WrappedRuntimeException`。

同步捕获器可能复用内部帧包装；不要长期持有或跨线程共享截图。需要长期保存时先 `images.copy`，并回收副本。

<a id="api-symbol-aW1hZ2VzLnJlcXVlc3RTY3JlZW5DYXB0dXJlQXN5bmM"></a>

#### `images.requestScreenCaptureAsync(options?)`

```ts
images.requestScreenCaptureAsync(landscape?: boolean): Promise<boolean>
images.requestScreenCaptureAsync(options?: ScreenCaptureRequestOptions): Promise<boolean>
images.requestScreenCaptureAsync(width: number, height: number): Promise<boolean>

interface ScreenCaptureRequestOptions {
  orientation?: 'none' | 'auto' | 'portrait' | 'landscape' | number
  width?: number
  height?: number
  isAsync?: boolean
  async?: boolean
}
```

先停止旧捕获器，再异步请求 MediaProjection。布尔值 `true` 表示横屏、`false` 表示竖屏；两个数值参数指定固定宽高并使用 `orientation = none`。Promise 解析为授权结果。

`isAsync`（兼容名 `async`）为 `true` 时，捕获器会连续把可用帧作为 `screen_capture_available`、`capture_available` 和兼容事件 `screen_capture` 从 `images` 事件发射器发出。事件图像仍需遵守 `ImageWrapper` 生命周期。

```js
images.requestScreenCaptureAsync({
  orientation: 'portrait',
  isAsync: false,
}).then(granted => {
  if (!granted) throw new Error('用户未授权截图')
})
```

<a id="api-symbol-aW1hZ2VzLnN0b3BTY3JlZW5DYXB0dXJl"></a>

#### `images.stopScreenCapture()`

```ts
images.stopScreenCapture(): void
```

不接受参数，释放捕获器、上一帧缓存和授权请求绑定。之后再次截图需要重新请求授权。脚本退出时运行时也会执行捕获清理。

<a id="api-symbol-aW1hZ2VzLmdldFNjcmVlbkNhcHR1cmVPcHRpb25z"></a>

#### `images.getScreenCaptureOptions()`

```ts
images.getScreenCaptureOptions(): {
  width: number
  height: number
  orientation: number
  density: number
  isAsync: boolean
} | null
```

不接受参数。捕获器尚未建立时返回 `null`；否则返回当前捕获器实际宽高、方向、密度和连续异步模式标记的只读记录。

<a id="api-symbol-aW1hZ2VzLmdldFNjcmVlbkNhcHR1cmVJbmZv"></a>

#### `images.getScreenCaptureInfo()`

```ts
images.getScreenCaptureInfo(): object
```

不接受参数，返回当前截图授权和帧变换元数据对象。对象内容由当前捕获器决定；未建立截图输入时返回空的状态记录。

<a id="api-symbol-aW1hZ2VzLnNhdmVJbWFnZQ"></a>

#### `images.saveImage(image, path, format?, quality?)`

```ts
images.saveImage(image: ImageWrapper | string, path: string, format?: string, quality?: number): boolean
```

与 `images.save` 共用实现。格式默认 `png`，允许 `png`、`jpg`、`jpeg`、`webp`、`webp_lossless`、`webp_lossy`（连字符形式也可）；质量默认 `100` 并限制到 `0..100`。父目录会自动创建；未知格式、空路径、写入失败或不支持的 WebP lossless 质量会抛出异常。

<a id="api-symbol-aW1hZ2VzLnBpeGVs"></a>

#### `images.pixel(image, x, y)`

```ts
images.pixel(image: ImageWrapper | string, x: number, y: number): ColorInt
```

将坐标转为整数并返回 ARGB 像素。坐标越界、输入不是图像或矩阵通道不受支持时抛出异常。实例形式 `image.pixel(x, y)` 使用同一像素合同。

### OpenCV 变换与几何

<a id="api-symbol-aW1hZ2VzLmludmVydA"></a>

#### `images.invert(image)`

```ts
images.invert(image: ImageWrapper | string): ImageWrapper
```

返回颜色反相的新图像。当前版本实现反转 BGR 颜色通道并保留原 alpha 通道；输入不会原地修改。

<a id="api-symbol-aW1hZ2VzLmlzR3JheXNjYWxl"></a>

#### `images.isGrayscale(imageOrMat)`

```ts
images.isGrayscale(value: ImageWrapper | string | org.opencv.core.Mat): boolean
```

单通道矩阵直接返回 `true`；多通道矩阵逐通道比较，所有通道值完全相同才返回 `true`。输入类型无效时抛出 `WrappedIllegalArgumentException`。

<a id="api-symbol-aW1hZ2VzLmJpbGF0ZXJhbEZpbHRlcg"></a>

#### `images.bilateralFilter(image, d?, sigmaColor?, sigmaSpace?, borderType?)`

```ts
images.bilateralFilter(
  image: ImageWrapper | string,
  d?: number,
  sigmaColor?: number,
  sigmaSpace?: number,
  borderType?: string | number,
): ImageWrapper
```

调用 OpenCV bilateral filter，默认 `d = 0`、`sigmaColor = 40`、`sigmaSpace = 20`、`borderType = BORDER_DEFAULT`。字符串边界类型可省略 `BORDER_` 前缀；未知名称或 OpenCV 不接受的参数会抛出异常。

<a id="api-symbol-aW1hZ2VzLmZpbmRDaXJjbGVz"></a>

#### `images.findCircles(image, options?)`

```ts
images.findCircles(image: ImageWrapper | string, options?: {
  region?: OmniRegion
  dp?: number
  minDst?: number
  param1?: number
  param2?: number
  minRadius?: number
  maxRadius?: number
}): Array<{ x: number; y: number; radius: number }>
```

必要时先转为灰度图，再调用 OpenCV `HoughCircles`。默认 `dp = 1`、`minDst = image.height / 8`、`param1 = 100`、`param2 = 100`、`minRadius = 0`、`maxRadius = 0`。指定 `region` 时返回坐标相对于该处理区域；无圆时返回空数组。

<a id="api-symbol-aW1hZ2VzLmZsaXA"></a>

#### `images.flip(image, orientation?, vertical?)`

```ts
images.flip(image: ImageWrapper | string): ImageWrapper
images.flip(image: ImageWrapper | string, orientation: boolean | string | boolean[] | object): ImageWrapper
images.flip(image: ImageWrapper | string, horizontal: boolean, vertical: boolean): ImageWrapper
```

省略方向时默认水平翻转。字符串接受 `h|horizontal|x`、`v|vertical|y`、`both|all|xy` 等；对象可用 `x/h/horizontal` 和 `y/v/vertical`，数组前两项分别表示水平与垂直。无法识别的单值会退化为布尔转换或“不翻转”。返回新图像。

### 找色与找图

以下找色选项共用 `region`、`threshold` 和 `similarity`。`threshold` 默认 `4`，是 `0..255` 色差阈值；`similarity` 会换算为 `round(255 * (1 - similarity))`。同一对象同时提供二者会抛出异常。

<a id="api-symbol-aW1hZ2VzLmRldGVjdENvbG9y"></a>

#### `images.detectColor(image, color, x, y, threshold?, algorithm?)`

```ts
images.detectColor(
  image: ImageWrapper | string,
  color: OmniColor,
  x: number,
  y: number,
  threshold?: number,
  algorithm?: string,
): boolean
```

读取整数坐标像素并用 `ColorDetector` 比较目标色。默认 `threshold = 4`、`algorithm = 'diff'`；未知算法、非法颜色或越界坐标会抛出异常。已废弃的 `images.detectsColor` 使用同一实现。

<a id="api-symbol-aW1hZ2VzLmRldGVjdE11bHRpQ29sb3Jz"></a>

#### `images.detectMultiColors(image, x, y, firstColor, paths, options?)`

```ts
images.detectMultiColors(
  image: ImageWrapper | string,
  x: number,
  y: number,
  firstColor: OmniColor,
  paths: Array<[dx: number, dy: number, color: OmniColor]>,
  options?: { region?: OmniRegion; threshold?: number; similarity?: number },
): boolean
```

先在 `(x, y)` 比较 `firstColor`，再按每个相对偏移比较其颜色；全部满足才返回 `true`。`paths` 必须是 JavaScript 数组，每项也必须可解构为 `[dx, dy, color]`。

<a id="api-symbol-aW1hZ2VzLmRldGVjdHNNdWx0aUNvbG9ycw"></a>

#### `images.detectsMultiColors(...)`

```ts
images.detectsMultiColors(
  image: ImageWrapper | string,
  x: number,
  y: number,
  firstColor: OmniColor,
  paths: Array<[number, number, OmniColor]>,
  options?: object,
): boolean
```

已废弃的兼容名，完整转发到 `images.detectMultiColors`。新代码应使用不带 `s` 的名称。

<a id="api-symbol-aW1hZ2VzLmZpbmRQb2ludEJ5Q29sb3I"></a>

#### `images.findPointByColor(image, color, optionsOrX?, y?, width?, height?, threshold?)`

```ts
images.findPointByColor(
  image: ImageWrapper | string,
  color: OmniColor,
  options?: { region?: OmniRegion; threshold?: number; similarity?: number },
): org.opencv.core.Point | null

images.findPointByColor(
  image: ImageWrapper | string,
  color: OmniColor,
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  threshold?: number,
): org.opencv.core.Point | null
```

在区域内返回第一处匹配颜色的点，无匹配时返回 `null`。位置式区域是兼容形式；对象形式更清晰。坐标和区域会转换为整数并验证不超出图像。

<a id="api-symbol-aW1hZ2VzLmZpbmRQb2ludEJ5Q29sb3JFeGFjdGx5"></a>

#### `images.findPointByColorExactly(image, color, optionsOrX?, y?, width?, height?)`

```ts
images.findPointByColorExactly(
  image: ImageWrapper | string,
  color: OmniColor,
  optionsOrX?: object | number,
  y?: number,
  width?: number,
  height?: number,
): org.opencv.core.Point | null
```

与 `findPointByColor` 相同，但强制色差阈值为 `0`。兼容名 `findColorEquals` 已废弃。

<a id="api-symbol-aW1hZ2VzLmZpbmRQb2ludHNCeUNvbG9y"></a>

#### `images.findPointsByColor(image, color, options?)`

```ts
images.findPointsByColor(
  image: ImageWrapper | string,
  color: OmniColor,
  options?: { region?: OmniRegion; threshold?: number; similarity?: number },
): org.opencv.core.Point[]
```

返回区域内全部匹配点；无匹配时返回空数组。高分辨率图片可能生成很大的数组，应尽量限制 `region`。

<a id="api-symbol-aW1hZ2VzLmZpbmRBbGxQb2ludHNGb3JDb2xvcg"></a>

#### `images.findAllPointsForColor(...)`

```ts
images.findAllPointsForColor(image: ImageWrapper | string, color: OmniColor, options?: object): org.opencv.core.Point[]
```

已废弃的兼容名，转发到 `images.findPointsByColor`。

<a id="api-symbol-aW1hZ2VzLmZpbmRQb2ludEJ5Q29sb3Jz"></a>

#### `images.findPointByColors(image, firstColor, paths, options?)`

```ts
images.findPointByColors(
  image: ImageWrapper | string,
  firstColor: OmniColor,
  paths: Array<[dx: number, dy: number, color: OmniColor]>,
  options?: { region?: OmniRegion; threshold?: number; similarity?: number },
): org.opencv.core.Point | null
```

在区域中搜索第一处满足多点颜色模式的锚点。`paths` 中坐标相对候选锚点；无匹配返回 `null`。已废弃的 `findMultiColors` 是同义入口。

<a id="api-symbol-aW1hZ2VzLmZpbmRQb2ludHNCeUNvbG9ycw"></a>

#### `images.findPointsByColors(image, firstColor, paths, options?)`

```ts
images.findPointsByColors(
  image: ImageWrapper | string,
  firstColor: OmniColor,
  paths: Array<[number, number, OmniColor]>,
  options?: { region?: OmniRegion; threshold?: number; similarity?: number },
): org.opencv.core.Point[]
```

返回全部满足多点颜色模式的锚点，无匹配时返回空数组。

```js
const points = images.findPointsByColors(
  '/sdcard/Download/buttons.png',
  '#1976D2',
  [[10, 0, '#FFFFFF'], [0, 10, '#FFFFFF']],
  { region: [0, 0, -1, 0.5], similarity: 0.95 },
)
console.log(points.length)
```

<a id="api-symbol-aW1hZ2VzLmZpbmRQb2ludEJ5SW1hZ2U"></a>

#### `images.findPointByImage(image, template, optionsOrX?, y?, width?, height?, threshold?)`

```ts
images.findPointByImage(
  image: ImageWrapper | string,
  template: ImageWrapper | string,
  options?: {
    region?: OmniRegion
    weakThreshold?: number
    threshold?: number
    similarity?: number
    level?: number
  },
): org.opencv.core.Point | null
```

返回模板第一次匹配的位置，无匹配时返回 `null`。默认 `weakThreshold = 0.6`、`threshold = 0.9`、`level = -1`；也保留位置式区域兼容重载。旧名称 `findImage`、`findImageInRegion` 使用同一实现。

### 像素批量读取与特征匹配

<a id="api-symbol-aW1hZ2VzLnJlYWRQaXhlbHM"></a>

#### `images.readPixels(path)`

```ts
images.readPixels(path: string): {
  data: int[]
  width: number
  height: number
}
```

严格读取路径，把整张位图按行复制为 ARGB `int[]`，并返回尺寸。无效路径抛出异常。临时图像和位图在返回前回收，因此返回对象只持有独立像素数组；数组长度为 `width * height`。

<a id="api-symbol-aW1hZ2VzLmRldGVjdEFuZENvbXB1dGVGZWF0dXJlcw"></a>

#### `images.detectAndComputeFeatures(image, options?)`

```ts
images.detectAndComputeFeatures(image: ImageWrapper | string, options?: {
  method?: 'SIFT' | 'ORB' | number
  scale?: number
  grayscale?: boolean
  region?: OmniRegion
}): ImageFeatures
```

在指定区域检测并计算特征描述子。默认方法 `SIFT`；`scale` 缺省时按约一百万像素且最长边不超过 1600 的策略自动计算，最终限制到 `0..1`；`grayscale` 默认 `false`。返回对象包含 `javaObject`、`scale`、`region`、`recycled` 和 `recycle()`，必须释放。

<a id="api-symbol-aW1hZ2VzLm1hdGNoRmVhdHVyZXM"></a>

#### `images.matchFeatures(sceneFeatures, objectFeatures, options?)`

```ts
images.matchFeatures(scene: ImageFeatures, object: ImageFeatures, options?: {
  matcher?: string
  threshold?: number
  drawMatches?: string
}): ObjectFrame | null
```

匹配两组特征并返回目标四边形，无足够匹配或无法计算四边形时返回 `null`。ORB 类描述子默认 `BRUTEFORCE_HAMMING`、阈值 `0.8`；其他描述子默认 `FLANNBASED`、阈值 `0.7`。`matcher` 按 OpenCV `DescriptorMatcher` 静态字段名解析；`drawMatches` 会把调试匹配图以 JPEG 质量 100 保存到指定路径。

`ObjectFrame` 包含 `topLeft`、`topRight`、`bottomLeft`、`bottomRight`、`centerX`、`centerY` 和 `center`。坐标会撤销特征缩放并加回场景区域偏移。

```js
const scene = images.detectAndComputeFeatures('/sdcard/Download/scene.png', {
  method: 'ORB',
})
const object = images.detectAndComputeFeatures('/sdcard/Download/logo.png', {
  method: 'ORB',
})
try {
  const frame = images.matchFeatures(scene, object)
  if (frame) console.log(frame.center)
} finally {
  scene.recycle()
  object.recycle()
}
```

### 生命周期、压缩与尺寸

<a id="api-symbol-aW1hZ2VzLmlzUmVjeWNsZWQ"></a>

#### `images.isRecycled(...values)`

```ts
images.isRecycled(...values: unknown[]): boolean
```

只有每个参数都是已回收的 `ImageWrapper` 时返回 `true`；出现普通值、未回收图像时返回 `false`。无参数时按空集合“全部满足”规则返回 `true`。方法不修改参数。

<a id="api-symbol-aW1hZ2VzLnJlY3ljbGU"></a>

#### `images.recycle(...values)`

```ts
images.recycle(...values: unknown[]): boolean
```

依次回收每个尚未回收的 `ImageWrapper`。所有参数都是图像且清理成功时返回 `true`；任一参数类型不符或回收抛错时返回 `false`。已回收图像视为成功，无参数也返回 `true`。

```js
const a = images.read('/sdcard/Download/a.png', true)
const b = images.read('/sdcard/Download/b.png', true)
console.log(images.recycle(a, b))
console.log(images.isRecycled(a, b))
```

<a id="api-symbol-aW1hZ2VzLmNvbXByZXNz"></a>

#### `images.compress(image, format?, quality?)`

```ts
images.compress(
  image: ImageWrapper | string,
  format?: 'png' | 'jpg' | 'jpeg' | 'webp' | 'webp_lossless' | 'webp_lossy',
  quality?: number,
): ImageWrapper
```

把图像编码为字节后重新解码，返回新的包装器。格式默认 `png`，质量默认 `60` 并限制到 `0..100`。PNG 在质量不是 100 时使用 PNG 量化桥；量化失败会抛出 `WrappedRuntimeException`。Android 11 及以上的 lossless WebP 不接受非 100 质量。返回图像必须回收。

<a id="api-symbol-aW1hZ2VzLmNvbXByZXNzVG9CeXRlcw"></a>

#### `images.compressToBytes(image, format?, quality?)`

```ts
images.compressToBytes(image: ImageWrapper | string, format?: string, quality?: number): byte[]
```

使用与 `images.compress` 相同的格式、默认质量 `60` 和异常规则，但直接返回编码字节，不再解码为图像。返回数组不持有原生图像资源。

<a id="api-symbol-aW1hZ2VzLmRvd25zYW1wbGU"></a>

#### `images.downsample(source, requestedWidth, requestedHeight, withAlpha?)`

```ts
images.downsample(
  source: byte[] | string | java.net.URL | android.net.Uri | android.graphics.Bitmap | ImageWrapper,
  requestedWidth: number,
  requestedHeight: number,
  withAlpha?: boolean,
): ImageWrapper
```

按请求尺寸执行降采样并返回新图像；`withAlpha` 默认 `true`。字符串既可为普通文件路径，也可为 URI。无法识别来源类型时抛出 `WrappedIllegalArgumentException`，解码失败时抛出 `WrappedRuntimeException`。对于编码字节、文件、URL 和 URI，降采样发生在解码流程中，可降低峰值内存；对现有位图/包装器则从已有像素生成缩小结果。

<a id="api-symbol-aW1hZ2VzLmdldFNpemU"></a>

#### `images.getSize(source)`

```ts
images.getSize(source: ImageWrapper | org.opencv.core.Mat | android.graphics.Bitmap | string): org.opencv.core.Size
```

返回 `Size(width, height)`。路径形式只读取图片边界而不完整解码，文件不存在时抛出异常；未知类型抛出 `WrappedIllegalArgumentException`。一次性图像会在读取尺寸后触发回收。

<a id="api-symbol-aW1hZ2VzLmJ1aWxkUmVnaW9u"></a>

#### `images.buildRegion(image, region)`

```ts
images.buildRegion(
  image: ImageWrapper | string,
  region: number[] | android.graphics.Rect | org.opencv.core.Rect | null | undefined,
): org.opencv.core.Rect
```

把通用区域规范化为 OpenCV `Rect(x, y, width, height)`。空值表示整张图；数组缺失项分别默认为 `x = 0`、`y = 0`、`width = image.width - x`、`height = image.height - y`。`-1` 和 `0..1` 小数按 MonkeyKing 屏幕度量规则换算。运行时要求 `x/y` 非负且区域右、下边界不超过图像，否则抛出异常。

### 图像相似度

以下方法都接受两个 `ImageWrapper`、路径或 OpenCV `Mat`，路径/包装器会转换为 BGR 矩阵。除 `isEqual` 外，尺寸不一致会抛出异常；`mse` 还要求类型一致。

<a id="api-symbol-aW1hZ2VzLnBzbnI"></a>

#### `images.psnr(imageA, imageB)`

```ts
images.psnr(imageA: ImageLike, imageB: ImageLike): number
```

返回 OpenCV PSNR（峰值信噪比）。值越高通常表示像素误差越小；完全相同图像由 OpenCV 的实现决定其极大值/无穷表示。

<a id="api-symbol-aW1hZ2VzLnNzaW0"></a>

#### `images.ssim(imageA, imageB)`

```ts
images.ssim(imageA: ImageLike, imageB: ImageLike): number
```

返回结构相似度。实现使用 11×11 高斯窗口与固定常数，并把与 `1` 相差小于 `1e-6` 的结果校正为 `1`。

<a id="api-symbol-aW1hZ2VzLm1zc2lt"></a>

#### `images.mssim(imageA, imageB)`

```ts
images.mssim(imageA: ImageLike, imageB: ImageLike): number
```

返回平均结构相似度，是 `images.getSimilarity` 的默认指标；接近 `1` 表示更相似。

<a id="api-symbol-aW1hZ2VzLmhpc3Q"></a>

#### `images.hist(imageA, imageB)`

```ts
images.hist(imageA: ImageLike, imageB: ImageLike): number
```

计算各图第一通道的 256 桶归一化直方图，并用 OpenCV correlation 比较；结果理论范围为 `-1..1`，越接近 `1` 越相似。

<a id="api-symbol-aW1hZ2VzLm1zZQ"></a>

#### `images.mse(imageA, imageB)`

```ts
images.mse(imageA: ImageLike, imageB: ImageLike): number
```

返回所有通道的均方误差；`0` 表示逐像素相同，数值越小越相似。图像尺寸或矩阵类型不同会抛出异常。

<a id="api-symbol-aW1hZ2VzLm5jYw"></a>

#### `images.ncc(imageA, imageB)`

```ts
images.ncc(imageA: ImageLike, imageB: ImageLike): number
```

先转灰度再计算归一化交叉相关，返回值限制在 `-1..1`；越接近 `1` 表示正相关越强。

<a id="api-symbol-aW1hZ2VzLmlzRXF1YWw"></a>

#### `images.isEqual(imageA, imageB)`

```ts
images.isEqual(imageA: ImageWrapper | string, imageB: ImageWrapper | string): boolean
```

尺寸或矩阵类型不同直接返回 `false`；否则对矩阵逐位异或并检查是否存在非零像素，完全一致才返回 `true`。

<a id="api-symbol-aW1hZ2VzLmdldFNpbWlsYXJpdHk"></a>

#### `images.getSimilarity(imageA, imageB, options?)`

```ts
images.getSimilarity(
  imageA: ImageLike,
  imageB: ImageLike,
  options?: { metric?: 'psnr' | 'ssim' | 'mssim' | 'hist' | 'mse' | 'ncc' },
): number
```

按名称分派到上面的指标，默认 `metric = 'mssim'`。指标名转为小写后反射查找；未知名称或返回类型不符合 `Double` 合同会抛出 `WrappedIllegalArgumentException`。

```js
const score = images.getSimilarity(
  '/sdcard/Download/before.png',
  '/sdcard/Download/after.png',
  { metric: 'ssim' },
)
console.log(score)
```

## 权限、线程与版本

- 屏幕捕获需要 Android MediaProjection 授权；同步 `requestScreenCapture` 禁止在 UI 线程调用，UI 场景使用异步入口。
- URL 加载需要网络访问；共享存储路径受 Android 存储策略约束。模块不会自动弹出存储授权界面。
- OpenCV 变换、找色找图、特征和相似度调用均同步占用调用线程，并可能分配较大的临时矩阵。
- 输入为一次性图像时，运行时在 `finally` 中触发回收；普通输入不会自动回收，返回的新资源始终由调用方管理。
- 本节描述 MonkeyKing 的公开入口；底层编码格式和 OpenCV 参数限制以应用内置版本为准。


## 逐符号版本与 Rhino 2.0 示例

下列每个条目都对应一个公开 API 符号；示例按 Rhino 2.0 语法书写。需要文件、网络或 UI 资源的示例应在具备相应运行条件时执行。

<!-- api-member-contract id="images.adaptiveThreshold" -->
`images.adaptiveThreshold` · Rhino 2.0 示例：
```js
console.log(typeof images.adaptiveThreshold);
```

<!-- api-member-contract id="images.bilateralFilter" -->
`images.bilateralFilter` · Rhino 2.0 示例：
```js
console.log(typeof images.bilateralFilter);
```

<!-- api-member-contract id="images.blur" -->
`images.blur` · Rhino 2.0 示例：
```js
console.log(typeof images.blur);
```

<!-- api-member-contract id="images.buildRegion" -->
`images.buildRegion` · Rhino 2.0 示例：
```js
console.log(typeof images.buildRegion);
```

<!-- api-member-contract id="images.captureScreen" -->
`images.captureScreen` · Rhino 2.0 示例：
```js
console.log(typeof images.captureScreen);
```

<!-- api-member-contract id="images.clip" -->
`images.clip` · Rhino 2.0 示例：
```js
console.log(typeof images.clip);
```

<!-- api-member-contract id="images.compress" -->
`images.compress` · Rhino 2.0 示例：
```js
console.log(typeof images.compress);
```

<!-- api-member-contract id="images.compressToBytes" -->
`images.compressToBytes` · Rhino 2.0 示例：
```js
console.log(typeof images.compressToBytes);
```

<!-- api-member-contract id="images.concat" -->
`images.concat` · Rhino 2.0 示例：
```js
console.log(typeof images.concat);
```

<!-- api-member-contract id="images.copy" -->
`images.copy` · Rhino 2.0 示例：
```js
console.log(typeof images.copy);
```

<!-- api-member-contract id="images.cvtColor" -->
`images.cvtColor` · Rhino 2.0 示例：
```js
console.log(typeof images.cvtColor);
```

<!-- api-member-contract id="images.detectAndComputeFeatures" -->
`images.detectAndComputeFeatures` · Rhino 2.0 示例：
```js
console.log(typeof images.detectAndComputeFeatures);
```

<!-- api-member-contract id="images.detectColor" -->
`images.detectColor` · Rhino 2.0 示例：
```js
console.log(typeof images.detectColor);
```

<!-- api-member-contract id="images.detectMultiColors" -->
`images.detectMultiColors` · Rhino 2.0 示例：
```js
console.log(typeof images.detectMultiColors);
```

<!-- api-member-contract id="images.detectsColor" -->
`images.detectsColor` · Rhino 2.0 示例：
```js
console.log(typeof images.detectsColor);
```

<!-- api-member-contract id="images.detectsMultiColors" -->
`images.detectsMultiColors` · Rhino 2.0 示例：
```js
console.log(typeof images.detectsMultiColors);
```

<!-- api-member-contract id="images.downsample" -->
`images.downsample` · Rhino 2.0 示例：
```js
console.log(typeof images.downsample);
```

<!-- api-member-contract id="images.findAllPointsForColor" -->
`images.findAllPointsForColor` · Rhino 2.0 示例：
```js
console.log(typeof images.findAllPointsForColor);
```

<!-- api-member-contract id="images.findCircles" -->
`images.findCircles` · Rhino 2.0 示例：
```js
console.log(typeof images.findCircles);
```

<!-- api-member-contract id="images.findColor" -->
`images.findColor` · Rhino 2.0 示例：
```js
console.log(typeof images.findColor);
```

<!-- api-member-contract id="images.findColorEquals" -->
`images.findColorEquals` · Rhino 2.0 示例：
```js
console.log(typeof images.findColorEquals);
```

<!-- api-member-contract id="images.findColorInRegion" -->
`images.findColorInRegion` · Rhino 2.0 示例：
```js
console.log(typeof images.findColorInRegion);
```

<!-- api-member-contract id="images.findImage" -->
`images.findImage` · Rhino 2.0 示例：
```js
console.log(typeof images.findImage);
```

<!-- api-member-contract id="images.findImageInRegion" -->
`images.findImageInRegion` · Rhino 2.0 示例：
```js
console.log(typeof images.findImageInRegion);
```

<!-- api-member-contract id="images.findMultiColors" -->
`images.findMultiColors` · Rhino 2.0 示例：
```js
console.log(typeof images.findMultiColors);
```

<!-- api-member-contract id="images.findPointByColor" -->
`images.findPointByColor` · Rhino 2.0 示例：
```js
console.log(typeof images.findPointByColor);
```

<!-- api-member-contract id="images.findPointByColorExactly" -->
`images.findPointByColorExactly` · Rhino 2.0 示例：
```js
console.log(typeof images.findPointByColorExactly);
```

<!-- api-member-contract id="images.findPointByColors" -->
`images.findPointByColors` · Rhino 2.0 示例：
```js
console.log(typeof images.findPointByColors);
```

<!-- api-member-contract id="images.findPointByImage" -->
`images.findPointByImage` · Rhino 2.0 示例：
```js
console.log(typeof images.findPointByImage);
```

<!-- api-member-contract id="images.findPointsByColor" -->
`images.findPointsByColor` · Rhino 2.0 示例：
```js
console.log(typeof images.findPointsByColor);
```

<!-- api-member-contract id="images.findPointsByColors" -->
`images.findPointsByColors` · Rhino 2.0 示例：
```js
console.log(typeof images.findPointsByColors);
```

<!-- api-member-contract id="images.flip" -->
`images.flip` · Rhino 2.0 示例：
```js
console.log(typeof images.flip);
```

<!-- api-member-contract id="images.fromBase64" -->
`images.fromBase64` · Rhino 2.0 示例：
```js
console.log(typeof images.fromBase64);
```

<!-- api-member-contract id="images.fromBytes" -->
`images.fromBytes` · Rhino 2.0 示例：
```js
console.log(typeof images.fromBytes);
```

<!-- api-member-contract id="images.gaussianBlur" -->
`images.gaussianBlur` · Rhino 2.0 示例：
```js
console.log(typeof images.gaussianBlur);
```

<!-- api-member-contract id="images.getHeight" -->
`images.getHeight` · Rhino 2.0 示例：
```js
console.log(typeof images.getHeight);
```

<!-- api-member-contract id="images.getScreenCaptureOptions" -->
`images.getScreenCaptureOptions` · Rhino 2.0 示例：
```js
console.log(typeof images.getScreenCaptureOptions);
```

<!-- api-member-contract id="images.getSimilarity" -->
`images.getSimilarity` · Rhino 2.0 示例：
```js
console.log(typeof images.getSimilarity);
```

<!-- api-member-contract id="images.getSize" -->
`images.getSize` · Rhino 2.0 示例：
```js
console.log(typeof images.getSize);
```

<!-- api-member-contract id="images.getWidth" -->
`images.getWidth` · Rhino 2.0 示例：
```js
console.log(typeof images.getWidth);
```

<!-- api-member-contract id="images.grayscale" -->
`images.grayscale` · Rhino 2.0 示例：
```js
console.log(typeof images.grayscale);
```

<!-- api-member-contract id="images.hist" -->
`images.hist` · Rhino 2.0 示例：
```js
console.log(typeof images.hist);
```

<!-- api-member-contract id="images.imread" -->
`images.imread` · Rhino 2.0 示例：
```js
console.log(typeof images.imread);
```

<!-- api-member-contract id="images.inRange" -->
`images.inRange` · Rhino 2.0 示例：
```js
console.log(typeof images.inRange);
```

<!-- api-member-contract id="images.interval" -->
`images.interval` · Rhino 2.0 示例：
```js
console.log(typeof images.interval);
```

<!-- api-member-contract id="images.invert" -->
`images.invert` · Rhino 2.0 示例：
```js
console.log(typeof images.invert);
```

<!-- api-member-contract id="images.isEqual" -->
`images.isEqual` · Rhino 2.0 示例：
```js
console.log(typeof images.isEqual);
```

<!-- api-member-contract id="images.isGrayscale" -->
`images.isGrayscale` · Rhino 2.0 示例：
```js
console.log(typeof images.isGrayscale);
```

<!-- api-member-contract id="images.isRecycled" -->
`images.isRecycled` · Rhino 2.0 示例：
```js
console.log(typeof images.isRecycled);
```

<!-- api-member-contract id="images.load" -->
`images.load` · Rhino 2.0 示例：
```js
console.log(typeof images.load);
```

<!-- api-member-contract id="images.loadAsync" -->
`images.loadAsync` · Rhino 2.0 示例：
```js
console.log(typeof images.loadAsync);
```

<!-- api-member-contract id="images.matchFeatures" -->
`images.matchFeatures` · Rhino 2.0 示例：
```js
console.log(typeof images.matchFeatures);
```

<!-- api-member-contract id="images.matchTemplate" -->
`images.matchTemplate` · Rhino 2.0 示例：
```js
console.log(typeof images.matchTemplate);
```

<!-- api-member-contract id="images.matToImage" -->
`images.matToImage` · Rhino 2.0 示例：
```js
console.log(typeof images.matToImage);
```

<!-- api-member-contract id="images.medianBlur" -->
`images.medianBlur` · Rhino 2.0 示例：
```js
console.log(typeof images.medianBlur);
```

<!-- api-member-contract id="images.mse" -->
`images.mse` · Rhino 2.0 示例：
```js
console.log(typeof images.mse);
```

<!-- api-member-contract id="images.mssim" -->
`images.mssim` · Rhino 2.0 示例：
```js
console.log(typeof images.mssim);
```

<!-- api-member-contract id="images.ncc" -->
`images.ncc` · Rhino 2.0 示例：
```js
console.log(typeof images.ncc);
```

<!-- api-member-contract id="images.pixel" -->
`images.pixel` · Rhino 2.0 示例：
```js
console.log(typeof images.pixel);
```

<!-- api-member-contract id="images.psnr" -->
`images.psnr` · Rhino 2.0 示例：
```js
console.log(typeof images.psnr);
```

<!-- api-member-contract id="images.read" -->
`images.read` · Rhino 2.0 示例：
```js
console.log(typeof images.read);
```

<!-- api-member-contract id="images.readPixels" -->
`images.readPixels` · Rhino 2.0 示例：
```js
console.log(typeof images.readPixels);
```

<!-- api-member-contract id="images.recycle" -->
`images.recycle` · Rhino 2.0 示例：
```js
console.log(typeof images.recycle);
```



<!-- api-member-contract id="images.resize" -->
`images.resize` · Rhino 2.0 示例：
```js
console.log(typeof images.resize);
```

<!-- api-member-contract id="images.rotate" -->
`images.rotate` · Rhino 2.0 示例：
```js
console.log(typeof images.rotate);
```

<!-- api-member-contract id="images.save" -->
`images.save` · Rhino 2.0 示例：
```js
console.log(typeof images.save);
```

<!-- api-member-contract id="images.saveImage" -->
`images.saveImage` · Rhino 2.0 示例：
```js
console.log(typeof images.saveImage);
```

<!-- api-member-contract id="images.scale" -->
`images.scale` · Rhino 2.0 示例：
```js
console.log(typeof images.scale);
```

<!-- api-member-contract id="images.ssim" -->
`images.ssim` · Rhino 2.0 示例：
```js
console.log(typeof images.ssim);
```

<!-- api-member-contract id="images.stopScreenCapture" -->
`images.stopScreenCapture` · Rhino 2.0 示例：
```js
console.log(typeof images.stopScreenCapture);
```

<!-- api-member-contract id="images.threshold" -->
`images.threshold` · Rhino 2.0 示例：
```js
console.log(typeof images.threshold);
```

<!-- api-member-contract id="images.toBase64" -->
`images.toBase64` · Rhino 2.0 示例：
```js
console.log(typeof images.toBase64);
```

<!-- api-member-contract id="images.toBytes" -->
`images.toBytes` · Rhino 2.0 示例：
```js
console.log(typeof images.toBytes);
```

<!-- api-member-contract id="module:images" -->
`module:images` · Rhino 2.0 示例：
```js
console.log(typeof images);
```


<!-- api-member-contract id="images.getScreenCaptureInfo" -->
`images.getScreenCaptureInfo` · Rhino 2.0 示例：
```js
console.log(typeof images.getScreenCaptureInfo);
```
