# dm 图色与文字识别 API

Monkey King 当前运行时提供脚本级全局对象 `dm`。本页是正式 API 清单；图色算法、明文字库格式、坐标变换和 VS Code 制作流程见 [大漠参考总览](../../reference/dm/overview.md)。

**`6.7.0`**

每个脚本拥有独立的 `dm`、图片缓存、输入帧、字库槽位和识别配置。脚本退出或显式调用 `dm.close()` 时释放资源。坐标属于输入图像，屏幕旋转和截图裁剪信息通过 `dm.getFrameInfo()` 获取。

## JS 返回对象

`Find*`、`find*`、`FindStr*` 和 `findStr*` 的便捷结果包含 `value`、`x`、`y`、`width`、`height`。兼容接口的输出参数使用普通 JavaScript 对象，例如 `{ value: -1 }`；`IntRef`、`BufferRef` 和其他 Java 类不作为 JS 构造函数暴露。

```js
const x = { value: -1 }
const y = { value: -1 }
const ok = dm.FindColor(0, 0, 100, 100, "ffffff", 0.9, 0, x, y)
const match = dm.findColor(0, 0, 100, 100, "ffffff", 0.9, 0)
```

## 加密资源兼容边界

`SetPicPwd`、`setPicPwd`、`SetDictPwd` 和 `setDictPwd` 保留兼容入口，但当前实现不解析私有加密图片或字库，也不提供加密、解密或密码设置能力。当前不支持加密资源，仅接受空密码或对私有加密资源返回不支持；无法解析的文件报告格式错误。

## dm 模块

<a id="api-symbol-bW9kdWxlOmRt"></a>
`dm` 是运行时自动提供的全局对象，不需要导入。PascalCase 方法保留兼容语义，camelCase 方法提供便捷返回值。

## 图色、取色和统计

<a id="api-symbol-ZG0uQkdSMlJHQg"></a>
## `dm.BGR2RGB(...)`

**`6.7.0`**

```js
dm.BGR2RGB(color)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uYmdyMnJnYg"></a>
## `dm.bgr2rgb(...)`

**`6.7.0`**

```js
dm.bgr2rgb(color)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ21wQ29sb3I"></a>
## `dm.CmpColor(...)`

**`6.7.0`**

```js
dm.CmpColor(x, y, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY21wQ29sb3I"></a>
## `dm.cmpColor(...)`

**`6.7.0`**

```js
dm.cmpColor(x, y, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZENvbG9y"></a>
## `dm.FindColor(...)`

**`6.7.0`**

```js
dm.FindColor(x1, y1, x2, y2, color, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZENvbG9y"></a>
## `dm.findColor(...)`

**`6.7.0`**

```js
dm.findColor(x1, y1, x2, y2, color, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZENvbG9yQmxvY2s"></a>
## `dm.FindColorBlock(...)`

**`6.7.0`**

```js
dm.FindColorBlock(x1, y1, x2, y2, color, similarity, count, width, height, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZENvbG9yQmxvY2s"></a>
## `dm.findColorBlock(...)`

**`6.7.0`**

```js
dm.findColorBlock(x1, y1, x2, y2, color, similarity, count, width, height)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZENvbG9yQmxvY2tFeA"></a>
## `dm.FindColorBlockEx(...)`

**`6.7.0`**

```js
dm.FindColorBlockEx(x1, y1, x2, y2, color, similarity, count, width, height)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZENvbG9yQmxvY2tFeA"></a>
## `dm.findColorBlockEx(...)`

**`6.7.0`**

```js
dm.findColorBlockEx(x1, y1, x2, y2, color, similarity, count, width, height)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZENvbG9yRQ"></a>
## `dm.FindColorE(...)`

**`6.7.0`**

```js
dm.FindColorE(x1, y1, x2, y2, color, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZENvbG9yRQ"></a>
## `dm.findColorE(...)`

**`6.7.0`**

```js
dm.findColorE(x1, y1, x2, y2, color, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZENvbG9yRXg"></a>
## `dm.FindColorEx(...)`

**`6.7.0`**

```js
dm.FindColorEx(x1, y1, x2, y2, color, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZENvbG9yRXg"></a>
## `dm.findColorEx(...)`

**`6.7.0`**

```js
dm.findColorEx(x1, y1, x2, y2, color, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZE11bENvbG9y"></a>
## `dm.FindMulColor(...)`

**`6.7.0`**

```js
dm.FindMulColor(x1, y1, x2, y2, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZE11bENvbG9y"></a>
## `dm.findMulColor(...)`

**`6.7.0`**

```js
dm.findMulColor(x1, y1, x2, y2, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZE11bHRpQ29sb3I"></a>
## `dm.FindMultiColor(...)`

**`6.7.0`**

```js
dm.FindMultiColor(x1, y1, x2, y2, color, offsets, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZE11bHRpQ29sb3I"></a>
## `dm.findMultiColor(...)`

**`6.7.0`**

```js
dm.findMultiColor(x1, y1, x2, y2, color, offsets, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZE11bHRpQ29sb3JF"></a>
## `dm.FindMultiColorE(...)`

**`6.7.0`**

```js
dm.FindMultiColorE(x1, y1, x2, y2, color, offsets, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZE11bHRpQ29sb3JF"></a>
## `dm.findMultiColorE(...)`

**`6.7.0`**

```js
dm.findMultiColorE(x1, y1, x2, y2, color, offsets, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZE11bHRpQ29sb3JFeA"></a>
## `dm.FindMultiColorEx(...)`

**`6.7.0`**

```js
dm.FindMultiColorEx(x1, y1, x2, y2, color, offsets, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZE11bHRpQ29sb3JFeA"></a>
## `dm.findMultiColorEx(...)`

**`6.7.0`**

```js
dm.findMultiColorEx(x1, y1, x2, y2, color, offsets, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFNoYXBl"></a>
## `dm.FindShape(...)`

**`6.7.0`**

```js
dm.FindShape(x1, y1, x2, y2, shape, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFNoYXBl"></a>
## `dm.findShape(...)`

**`6.7.0`**

```js
dm.findShape(x1, y1, x2, y2, shape, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFNoYXBlRQ"></a>
## `dm.FindShapeE(...)`

**`6.7.0`**

```js
dm.FindShapeE(x1, y1, x2, y2, shape, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFNoYXBlRQ"></a>
## `dm.findShapeE(...)`

**`6.7.0`**

```js
dm.findShapeE(x1, y1, x2, y2, shape, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFNoYXBlRXg"></a>
## `dm.FindShapeEx(...)`

**`6.7.0`**

```js
dm.FindShapeEx(x1, y1, x2, y2, shape, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFNoYXBlRXg"></a>
## `dm.findShapeEx(...)`

**`6.7.0`**

```js
dm.findShapeEx(x1, y1, x2, y2, shape, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0QXZlSFNW"></a>
## `dm.GetAveHSV(...)`

**`6.7.0`**

```js
dm.GetAveHSV(x1, y1, x2, y2)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0QXZlSFNW"></a>
## `dm.getAveHSV(...)`

**`6.7.0`**

```js
dm.getAveHSV(x1, y1, x2, y2)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0QXZlUkdC"></a>
## `dm.GetAveRGB(...)`

**`6.7.0`**

```js
dm.GetAveRGB(x1, y1, x2, y2)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0QXZlUkdC"></a>
## `dm.getAveRGB(...)`

**`6.7.0`**

```js
dm.getAveRGB(x1, y1, x2, y2)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0Q29sb3I"></a>
## `dm.GetColor(...)`

**`6.7.0`**

```js
dm.GetColor(x, y)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0Q29sb3I"></a>
## `dm.getColor(...)`

**`6.7.0`**

```js
dm.getColor(x, y)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0Q29sb3JCR1I"></a>
## `dm.GetColorBGR(...)`

**`6.7.0`**

```js
dm.GetColorBGR(x, y)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0Q29sb3JCR1I"></a>
## `dm.getColorBGR(...)`

**`6.7.0`**

```js
dm.getColorBGR(x, y)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0Q29sb3JIU1Y"></a>
## `dm.GetColorHSV(...)`

**`6.7.0`**

```js
dm.GetColorHSV(x, y)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0Q29sb3JIU1Y"></a>
## `dm.getColorHSV(...)`

**`6.7.0`**

```js
dm.getColorHSV(x, y)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0Q29sb3JOdW0"></a>
## `dm.GetColorNum(...)`

**`6.7.0`**

```js
dm.GetColorNum(x1, y1, x2, y2, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0Q29sb3JOdW0"></a>
## `dm.getColorNum(...)`

**`6.7.0`**

```js
dm.getColorNum(x1, y1, x2, y2, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uUkdCMkJHUg"></a>
## `dm.RGB2BGR(...)`

**`6.7.0`**

```js
dm.RGB2BGR(color)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ucmdiMmJncg"></a>
## `dm.rgb2bgr(...)`

**`6.7.0`**

```js
dm.rgb2bgr(color)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

## 找图、缓存和截图

<a id="api-symbol-ZG0uQXBwZW5kUGljQWRkcg"></a>
## `dm.AppendPicAddr(...)`

**`6.7.0`**

```js
dm.AppendPicAddr(buffers, data, length)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uYXBwZW5kUGljQWRkcg"></a>
## `dm.appendPicAddr(...)`

**`6.7.0`**

```js
dm.appendPicAddr(buffers, data, length)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ2FwdHVyZQ"></a>
## `dm.Capture(...)`

**`6.7.0`**

```js
dm.Capture(x1, y1, x2, y2, file)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY2FwdHVyZQ"></a>
## `dm.capture(...)`

**`6.7.0`**

```js
dm.capture(x1, y1, x2, y2, file)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ2FwdHVyZUdpZg"></a>
## `dm.CaptureGif(...)`

**`6.7.0`**

```js
dm.CaptureGif(x1, y1, x2, y2, file, delay, duration)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY2FwdHVyZUdpZg"></a>
## `dm.captureGif(...)`

**`6.7.0`**

```js
dm.captureGif(x1, y1, x2, y2, file, delay, duration)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ2FwdHVyZUpwZw"></a>
## `dm.CaptureJpg(...)`

**`6.7.0`**

```js
dm.CaptureJpg(x1, y1, x2, y2, file, quality)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY2FwdHVyZUpwZw"></a>
## `dm.captureJpg(...)`

**`6.7.0`**

```js
dm.captureJpg(x1, y1, x2, y2, file, quality)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ2FwdHVyZVBuZw"></a>
## `dm.CapturePng(...)`

**`6.7.0`**

```js
dm.CapturePng(x1, y1, x2, y2, file)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY2FwdHVyZVBuZw"></a>
## `dm.capturePng(...)`

**`6.7.0`**

```js
dm.capturePng(x1, y1, x2, y2, file)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ2FwdHVyZVByZQ"></a>
## `dm.CapturePre(...)`

**`6.7.0`**

```js
dm.CapturePre(file)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY2FwdHVyZVByZQ"></a>
## `dm.capturePre(...)`

**`6.7.0`**

```js
dm.capturePre(file)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpYw"></a>
## `dm.FindPic(...)`

**`6.7.0`**

```js
dm.FindPic(x1, y1, x2, y2, pictures, delta, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpYw"></a>
## `dm.findPic(...)`

**`6.7.0`**

```js
dm.findPic(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY0U"></a>
## `dm.FindPicE(...)`

**`6.7.0`**

```js
dm.FindPicE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY0U"></a>
## `dm.findPicE(...)`

**`6.7.0`**

```js
dm.findPicE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY0V4"></a>
## `dm.FindPicEx(...)`

**`6.7.0`**

```js
dm.FindPicEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY0V4"></a>
## `dm.findPicEx(...)`

**`6.7.0`**

```js
dm.findPicEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY0V4Uw"></a>
## `dm.FindPicExS(...)`

**`6.7.0`**

```js
dm.FindPicExS(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY0V4Uw"></a>
## `dm.findPicExS(...)`

**`6.7.0`**

```js
dm.findPicExS(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY01lbQ"></a>
## `dm.FindPicMem(...)`

**`6.7.0`**

```js
dm.FindPicMem(x1, y1, x2, y2, pictures, delta, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY01lbQ"></a>
## `dm.findPicMem(...)`

**`6.7.0`**

```js
dm.findPicMem(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY01lbUU"></a>
## `dm.FindPicMemE(...)`

**`6.7.0`**

```js
dm.FindPicMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY01lbUU"></a>
## `dm.findPicMemE(...)`

**`6.7.0`**

```js
dm.findPicMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY01lbUV4"></a>
## `dm.FindPicMemEx(...)`

**`6.7.0`**

```js
dm.FindPicMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY01lbUV4"></a>
## `dm.findPicMemEx(...)`

**`6.7.0`**

```js
dm.findPicMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1M"></a>
## `dm.FindPicS(...)`

**`6.7.0`**

```js
dm.FindPicS(x1, y1, x2, y2, pictures, delta, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1M"></a>
## `dm.findPicS(...)`

**`6.7.0`**

```js
dm.findPicS(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1NpbQ"></a>
## `dm.FindPicSim(...)`

**`6.7.0`**

```js
dm.FindPicSim(x1, y1, x2, y2, pictures, delta, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1NpbQ"></a>
## `dm.findPicSim(...)`

**`6.7.0`**

```js
dm.findPicSim(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1NpbUU"></a>
## `dm.FindPicSimE(...)`

**`6.7.0`**

```js
dm.FindPicSimE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1NpbUU"></a>
## `dm.findPicSimE(...)`

**`6.7.0`**

```js
dm.findPicSimE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1NpbUV4"></a>
## `dm.FindPicSimEx(...)`

**`6.7.0`**

```js
dm.FindPicSimEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1NpbUV4"></a>
## `dm.findPicSimEx(...)`

**`6.7.0`**

```js
dm.findPicSimEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1NpbU1lbQ"></a>
## `dm.FindPicSimMem(...)`

**`6.7.0`**

```js
dm.FindPicSimMem(x1, y1, x2, y2, pictures, delta, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1NpbU1lbQ"></a>
## `dm.findPicSimMem(...)`

**`6.7.0`**

```js
dm.findPicSimMem(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1NpbU1lbUU"></a>
## `dm.FindPicSimMemE(...)`

**`6.7.0`**

```js
dm.FindPicSimMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1NpbU1lbUU"></a>
## `dm.findPicSimMemE(...)`

**`6.7.0`**

```js
dm.findPicSimMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1NpbU1lbUV4"></a>
## `dm.FindPicSimMemEx(...)`

**`6.7.0`**

```js
dm.FindPicSimMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1NpbU1lbUV4"></a>
## `dm.findPicSimMemEx(...)`

**`6.7.0`**

```js
dm.findPicSimMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRnJlZVBpYw"></a>
## `dm.FreePic(...)`

**`6.7.0`**

```js
dm.FreePic(pictures)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZnJlZVBpYw"></a>
## `dm.freePic(...)`

**`6.7.0`**

```js
dm.freePic(pictures)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0UGljU2l6ZQ"></a>
## `dm.GetPicSize(...)`

**`6.7.0`**

```js
dm.GetPicSize(pictures)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0UGljU2l6ZQ"></a>
## `dm.getPicSize(...)`

**`6.7.0`**

```js
dm.getPicSize(pictures)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0U2NyZWVuRGF0YQ"></a>
## `dm.GetScreenData(...)`

**`6.7.0`**

```js
dm.GetScreenData(x1, y1, x2, y2)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0U2NyZWVuRGF0YQ"></a>
## `dm.getScreenData(...)`

**`6.7.0`**

```js
dm.getScreenData(x1, y1, x2, y2)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0U2NyZWVuRGF0YUJtcA"></a>
## `dm.GetScreenDataBmp(...)`

**`6.7.0`**

```js
dm.GetScreenDataBmp(x1, y1, x2, y2, outBUFFER, outLENGTH)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0U2NyZWVuRGF0YUJtcA"></a>
## `dm.getScreenDataBmp(...)`

**`6.7.0`**

```js
dm.getScreenDataBmp(x1, y1, x2, y2)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uSW1hZ2VUb0JtcA"></a>
## `dm.ImageToBmp(...)`

**`6.7.0`**

```js
dm.ImageToBmp(input, output)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uaW1hZ2VUb0JtcA"></a>
## `dm.imageToBmp(...)`

**`6.7.0`**

```js
dm.imageToBmp(input, output)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uSXNEaXNwbGF5RGVhZA"></a>
## `dm.IsDisplayDead(...)`

**`6.7.0`**

```js
dm.IsDisplayDead(x1, y1, x2, y2, timeout)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uaXNEaXNwbGF5RGVhZA"></a>
## `dm.isDisplayDead(...)`

**`6.7.0`**

```js
dm.isDisplayDead(x1, y1, x2, y2, timeout)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uTG9hZFBpYw"></a>
## `dm.LoadPic(...)`

**`6.7.0`**

```js
dm.LoadPic(pictures)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ubG9hZFBpYw"></a>
## `dm.loadPic(...)`

**`6.7.0`**

```js
dm.loadPic(pictures)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uTG9hZFBpY0J5dGU"></a>
## `dm.LoadPicByte(...)`

**`6.7.0`**

```js
dm.LoadPicByte(data, length, pictures)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ubG9hZFBpY0J5dGU"></a>
## `dm.loadPicByte(...)`

**`6.7.0`**

```js
dm.loadPicByte(data, length, pictures)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uTWF0Y2hQaWNOYW1l"></a>
## `dm.MatchPicName(...)`

**`6.7.0`**

```js
dm.MatchPicName(pictures)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ubWF0Y2hQaWNOYW1l"></a>
## `dm.matchPicName(...)`

**`6.7.0`**

```js
dm.matchPicName(pictures)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

## 字库和文字识别

<a id="api-symbol-ZG0uQWRkRGljdA"></a>
## `dm.AddDict(...)`

**`6.7.0`**

```js
dm.AddDict(index, entry)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uYWRkRGljdA"></a>
## `dm.addDict(...)`

**`6.7.0`**

```js
dm.addDict(index, entry)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ2xlYXJEaWN0"></a>
## `dm.ClearDict(...)`

**`6.7.0`**

```js
dm.ClearDict(index)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY2xlYXJEaWN0"></a>
## `dm.clearDict(...)`

**`6.7.0`**

```js
dm.clearDict(index)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRW5hYmxlU2hhcmVEaWN0"></a>
## `dm.EnableShareDict(...)`

**`6.7.0`**

```js
dm.EnableShareDict(enabled)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZW5hYmxlU2hhcmVEaWN0"></a>
## `dm.enableShareDict(...)`

**`6.7.0`**

```js
dm.enableShareDict(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmV0Y2hXb3Jk"></a>
## `dm.FetchWord(...)`

**`6.7.0`**

```js
dm.FetchWord(x1, y1, x2, y2, color, text)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmV0Y2hXb3Jk"></a>
## `dm.fetchWord(...)`

**`6.7.0`**

```js
dm.fetchWord(x1, y1, x2, y2, color, text)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0cg"></a>
## `dm.FindStr(...)`

**`6.7.0`**

```js
dm.FindStr(x1, y1, x2, y2, text, color, similarity, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0cg"></a>
## `dm.findStr(...)`

**`6.7.0`**

```js
dm.findStr(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckU"></a>
## `dm.FindStrE(...)`

**`6.7.0`**

```js
dm.FindStrE(x1, y1, x2, y2, text, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckU"></a>
## `dm.findStrE(...)`

**`6.7.0`**

```js
dm.findStrE(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckV4"></a>
## `dm.FindStrEx(...)`

**`6.7.0`**

```js
dm.FindStrEx(x1, y1, x2, y2, text, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckV4"></a>
## `dm.findStrEx(...)`

**`6.7.0`**

```js
dm.findStrEx(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckV4Uw"></a>
## `dm.FindStrExS(...)`

**`6.7.0`**

```js
dm.FindStrExS(x1, y1, x2, y2, text, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckV4Uw"></a>
## `dm.findStrExS(...)`

**`6.7.0`**

```js
dm.findStrExS(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckZhc3Q"></a>
## `dm.FindStrFast(...)`

**`6.7.0`**

```js
dm.FindStrFast(x1, y1, x2, y2, text, color, similarity, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckZhc3Q"></a>
## `dm.findStrFast(...)`

**`6.7.0`**

```js
dm.findStrFast(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckZhc3RF"></a>
## `dm.FindStrFastE(...)`

**`6.7.0`**

```js
dm.FindStrFastE(x1, y1, x2, y2, text, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RF"></a>
## `dm.findStrFastE(...)`

**`6.7.0`**

```js
dm.findStrFastE(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckZhc3RFeA"></a>
## `dm.FindStrFastEx(...)`

**`6.7.0`**

```js
dm.FindStrFastEx(x1, y1, x2, y2, text, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RFeA"></a>
## `dm.findStrFastEx(...)`

**`6.7.0`**

```js
dm.findStrFastEx(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckZhc3RFeFM"></a>
## `dm.FindStrFastExS(...)`

**`6.7.0`**

```js
dm.FindStrFastExS(x1, y1, x2, y2, text, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RFeFM"></a>
## `dm.findStrFastExS(...)`

**`6.7.0`**

```js
dm.findStrFastExS(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckZhc3RT"></a>
## `dm.FindStrFastS(...)`

**`6.7.0`**

```js
dm.FindStrFastS(x1, y1, x2, y2, text, color, similarity, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RT"></a>
## `dm.findStrFastS(...)`

**`6.7.0`**

```js
dm.findStrFastS(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0clM"></a>
## `dm.FindStrS(...)`

**`6.7.0`**

```js
dm.FindStrS(x1, y1, x2, y2, text, color, similarity, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0clM"></a>
## `dm.findStrS(...)`

**`6.7.0`**

```js
dm.findStrS(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0cldpdGhGb250"></a>
## `dm.FindStrWithFont(...)`

**`6.7.0`**

```js
dm.FindStrWithFont(x1, y1, x2, y2, text, color, similarity, font, size, style, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0cldpdGhGb250"></a>
## `dm.findStrWithFont(...)`

**`6.7.0`**

```js
dm.findStrWithFont(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0cldpdGhGb250RQ"></a>
## `dm.FindStrWithFontE(...)`

**`6.7.0`**

```js
dm.FindStrWithFontE(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0cldpdGhGb250RQ"></a>
## `dm.findStrWithFontE(...)`

**`6.7.0`**

```js
dm.findStrWithFontE(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0cldpdGhGb250RXg"></a>
## `dm.FindStrWithFontEx(...)`

**`6.7.0`**

```js
dm.FindStrWithFontEx(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0cldpdGhGb250RXg"></a>
## `dm.findStrWithFontEx(...)`

**`6.7.0`**

```js
dm.findStrWithFontEx(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0RGljdA"></a>
## `dm.GetDict(...)`

**`6.7.0`**

```js
dm.GetDict(index, entry)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0RGljdA"></a>
## `dm.getDict(...)`

**`6.7.0`**

```js
dm.getDict(index, entry)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0RGljdENvdW50"></a>
## `dm.GetDictCount(...)`

**`6.7.0`**

```js
dm.GetDictCount(index)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0RGljdENvdW50"></a>
## `dm.getDictCount(...)`

**`6.7.0`**

```js
dm.getDictCount(index)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0RGljdEluZm8"></a>
## `dm.GetDictInfo(...)`

**`6.7.0`**

```js
dm.GetDictInfo(text, font, size, style)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0RGljdEluZm8"></a>
## `dm.getDictInfo(...)`

**`6.7.0`**

```js
dm.getDictInfo(text, font, size, style)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0Tm93RGljdA"></a>
## `dm.GetNowDict(...)`

**`6.7.0`**

```js
dm.GetNowDict()
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0Tm93RGljdA"></a>
## `dm.getNowDict(...)`

**`6.7.0`**

```js
dm.getNowDict()
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0UmVzdWx0Q291bnQ"></a>
## `dm.GetResultCount(...)`

**`6.7.0`**

```js
dm.GetResultCount(results)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0UmVzdWx0Q291bnQ"></a>
## `dm.getResultCount(...)`

**`6.7.0`**

```js
dm.getResultCount(results)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0UmVzdWx0UG9z"></a>
## `dm.GetResultPos(...)`

**`6.7.0`**

```js
dm.GetResultPos(results, index, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0UmVzdWx0UG9z"></a>
## `dm.getResultPos(...)`

**`6.7.0`**

```js
dm.getResultPos(results, index)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0V29yZFJlc3VsdENvdW50"></a>
## `dm.GetWordResultCount(...)`

**`6.7.0`**

```js
dm.GetWordResultCount(results)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0V29yZFJlc3VsdENvdW50"></a>
## `dm.getWordResultCount(...)`

**`6.7.0`**

```js
dm.getWordResultCount(results)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0V29yZFJlc3VsdFBvcw"></a>
## `dm.GetWordResultPos(...)`

**`6.7.0`**

```js
dm.GetWordResultPos(results, index, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0V29yZFJlc3VsdFBvcw"></a>
## `dm.getWordResultPos(...)`

**`6.7.0`**

```js
dm.getWordResultPos(results, index)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0V29yZFJlc3VsdFN0cg"></a>
## `dm.GetWordResultStr(...)`

**`6.7.0`**

```js
dm.GetWordResultStr(results, index)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0V29yZFJlc3VsdFN0cg"></a>
## `dm.getWordResultStr(...)`

**`6.7.0`**

```js
dm.getWordResultStr(results, index)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0V29yZHM"></a>
## `dm.GetWords(...)`

**`6.7.0`**

```js
dm.GetWords(x1, y1, x2, y2, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0V29yZHM"></a>
## `dm.getWords(...)`

**`6.7.0`**

```js
dm.getWords(x1, y1, x2, y2, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0V29yZHNOb0RpY3Q"></a>
## `dm.GetWordsNoDict(...)`

**`6.7.0`**

```js
dm.GetWordsNoDict(x1, y1, x2, y2, color)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0V29yZHNOb0RpY3Q"></a>
## `dm.getWordsNoDict(...)`

**`6.7.0`**

```js
dm.getWordsNoDict(x1, y1, x2, y2, color)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uT2Ny"></a>
## `dm.Ocr(...)`

**`6.7.0`**

```js
dm.Ocr(x1, y1, x2, y2, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ub2Ny"></a>
## `dm.ocr(...)`

**`6.7.0`**

```js
dm.ocr(x1, y1, x2, y2, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uT2NyRXg"></a>
## `dm.OcrEx(...)`

**`6.7.0`**

```js
dm.OcrEx(x1, y1, x2, y2, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ub2NyRXg"></a>
## `dm.ocrEx(...)`

**`6.7.0`**

```js
dm.ocrEx(x1, y1, x2, y2, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uT2NyRXhPbmU"></a>
## `dm.OcrExOne(...)`

**`6.7.0`**

```js
dm.OcrExOne(x1, y1, x2, y2, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ub2NyRXhPbmU"></a>
## `dm.ocrExOne(...)`

**`6.7.0`**

```js
dm.ocrExOne(x1, y1, x2, y2, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uT2NySW5GaWxl"></a>
## `dm.OcrInFile(...)`

**`6.7.0`**

```js
dm.OcrInFile(x1, y1, x2, y2, pictures, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ub2NySW5GaWxl"></a>
## `dm.ocrInFile(...)`

**`6.7.0`**

```js
dm.ocrInFile(x1, y1, x2, y2, pictures, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2F2ZURpY3Q"></a>
## `dm.SaveDict(...)`

**`6.7.0`**

```js
dm.SaveDict(index, file)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2F2ZURpY3Q"></a>
## `dm.saveDict(...)`

**`6.7.0`**

```js
dm.saveDict(index, file)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uVXNlRGljdA"></a>
## `dm.UseDict(...)`

**`6.7.0`**

```js
dm.UseDict(index)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0udXNlRGljdA"></a>
## `dm.useDict(...)`

**`6.7.0`**

```js
dm.useDict(index)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0ub2NyQXV0bw"></a>
## `dm.ocrAuto(...)`

**`6.7.0`**

```js
dm.ocrAuto(options?)
```

调用已安装的 RapidOCR 原生引擎；它与公开字库 `Ocr` 使用不同的识别路径。

## 输入源、配置和扩展

<a id="api-symbol-ZG0uRW5hYmxlRGlzcGxheURlYnVn"></a>
## `dm.EnableDisplayDebug(...)`

**`6.7.0`**

```js
dm.EnableDisplayDebug(enabled)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZW5hYmxlRGlzcGxheURlYnVn"></a>
## `dm.enableDisplayDebug(...)`

**`6.7.0`**

```js
dm.enableDisplayDebug(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRW5hYmxlRmluZFBpY011bHRpdGhyZWFk"></a>
## `dm.EnableFindPicMultithread(...)`

**`6.7.0`**

```js
dm.EnableFindPicMultithread(enabled)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZW5hYmxlRmluZFBpY011bHRpdGhyZWFk"></a>
## `dm.enableFindPicMultithread(...)`

**`6.7.0`**

```js
dm.enableFindPicMultithread(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRW5hYmxlR2V0Q29sb3JCeUNhcHR1cmU"></a>
## `dm.EnableGetColorByCapture(...)`

**`6.7.0`**

```js
dm.EnableGetColorByCapture(enabled)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZW5hYmxlR2V0Q29sb3JCeUNhcHR1cmU"></a>
## `dm.enableGetColorByCapture(...)`

**`6.7.0`**

```js
dm.enableGetColorByCapture(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RXhjbHVkZVJlZ2lvbg"></a>
## `dm.SetExcludeRegion(...)`

**`6.7.0`**

```js
dm.SetExcludeRegion(mode, code)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RXhjbHVkZVJlZ2lvbg"></a>
## `dm.setExcludeRegion(...)`

**`6.7.0`**

```js
dm.setExcludeRegion(mode, code)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RmluZFBpY011bHRpdGhyZWFkQ291bnQ"></a>
## `dm.SetFindPicMultithreadCount(...)`

**`6.7.0`**

```js
dm.SetFindPicMultithreadCount(count)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RmluZFBpY011bHRpdGhyZWFkQ291bnQ"></a>
## `dm.setFindPicMultithreadCount(...)`

**`6.7.0`**

```js
dm.setFindPicMultithreadCount(count)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RmluZFBpY011bHRpdGhyZWFkTGltaXQ"></a>
## `dm.SetFindPicMultithreadLimit(...)`

**`6.7.0`**

```js
dm.SetFindPicMultithreadLimit(count)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RmluZFBpY011bHRpdGhyZWFkTGltaXQ"></a>
## `dm.setFindPicMultithreadLimit(...)`

**`6.7.0`**

```js
dm.setFindPicMultithreadLimit(count)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0UGljUHdk"></a>
## `dm.SetPicPwd(...)`

**`6.7.0`**

```js
dm.SetPicPwd(password)
```

保留兼容入口，但当前不解析加密图片、加密字库或密码资源；传入非空密码会报告不支持。

<a id="api-symbol-ZG0uc2V0UGljUHdk"></a>
## `dm.setPicPwd(...)`

**`6.7.0`**

```js
dm.setPicPwd(password)
```

保留兼容入口，但当前不解析加密图片、加密字库或密码资源；传入非空密码会报告不支持。

<a id="api-symbol-ZG0uU2V0Q29sR2FwTm9EaWN0"></a>
## `dm.SetColGapNoDict(...)`

**`6.7.0`**

```js
dm.SetColGapNoDict(gap)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0Q29sR2FwTm9EaWN0"></a>
## `dm.setColGapNoDict(...)`

**`6.7.0`**

```js
dm.setColGapNoDict(gap)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RGljdA"></a>
## `dm.SetDict(...)`

**`6.7.0`**

```js
dm.SetDict(index, file)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RGljdA"></a>
## `dm.setDict(...)`

**`6.7.0`**

```js
dm.setDict(index, file)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RGljdE1lbQ"></a>
## `dm.SetDictMem(...)`

**`6.7.0`**

```js
dm.SetDictMem(index, data, length)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RGljdE1lbQ"></a>
## `dm.setDictMem(...)`

**`6.7.0`**

```js
dm.setDictMem(index, data, length)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RGljdFB3ZA"></a>
## `dm.SetDictPwd(...)`

**`6.7.0`**

```js
dm.SetDictPwd(password)
```

保留兼容入口，但当前不解析加密图片、加密字库或密码资源；传入非空密码会报告不支持。

<a id="api-symbol-ZG0uc2V0RGljdFB3ZA"></a>
## `dm.setDictPwd(...)`

**`6.7.0`**

```js
dm.setDictPwd(password)
```

保留兼容入口，但当前不解析加密图片、加密字库或密码资源；传入非空密码会报告不支持。

<a id="api-symbol-ZG0uU2V0RXhhY3RPY3I"></a>
## `dm.SetExactOcr(...)`

**`6.7.0`**

```js
dm.SetExactOcr(enabled)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RXhhY3RPY3I"></a>
## `dm.setExactOcr(...)`

**`6.7.0`**

```js
dm.setExactOcr(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0TWluQ29sR2Fw"></a>
## `dm.SetMinColGap(...)`

**`6.7.0`**

```js
dm.SetMinColGap(gap)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0TWluQ29sR2Fw"></a>
## `dm.setMinColGap(...)`

**`6.7.0`**

```js
dm.setMinColGap(gap)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0TWluUm93R2Fw"></a>
## `dm.SetMinRowGap(...)`

**`6.7.0`**

```js
dm.SetMinRowGap(gap)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0TWluUm93R2Fw"></a>
## `dm.setMinRowGap(...)`

**`6.7.0`**

```js
dm.setMinRowGap(gap)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0Um93R2FwTm9EaWN0"></a>
## `dm.SetRowGapNoDict(...)`

**`6.7.0`**

```js
dm.SetRowGapNoDict(gap)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0Um93R2FwTm9EaWN0"></a>
## `dm.setRowGapNoDict(...)`

**`6.7.0`**

```js
dm.setRowGapNoDict(gap)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0V29yZEdhcA"></a>
## `dm.SetWordGap(...)`

**`6.7.0`**

```js
dm.SetWordGap(gap)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0V29yZEdhcA"></a>
## `dm.setWordGap(...)`

**`6.7.0`**

```js
dm.setWordGap(gap)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0V29yZEdhcE5vRGljdA"></a>
## `dm.SetWordGapNoDict(...)`

**`6.7.0`**

```js
dm.SetWordGapNoDict(gap)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0V29yZEdhcE5vRGljdA"></a>
## `dm.setWordGapNoDict(...)`

**`6.7.0`**

```js
dm.setWordGapNoDict(gap)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0V29yZExpbmVIZWlnaHQ"></a>
## `dm.SetWordLineHeight(...)`

**`6.7.0`**

```js
dm.SetWordLineHeight(height)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0V29yZExpbmVIZWlnaHQ"></a>
## `dm.setWordLineHeight(...)`

**`6.7.0`**

```js
dm.setWordLineHeight(height)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0V29yZExpbmVIZWlnaHROb0RpY3Q"></a>
## `dm.SetWordLineHeightNoDict(...)`

**`6.7.0`**

```js
dm.SetWordLineHeightNoDict(height)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0V29yZExpbmVIZWlnaHROb0RpY3Q"></a>
## `dm.setWordLineHeightNoDict(...)`

**`6.7.0`**

```js
dm.setWordLineHeightNoDict(height)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0UGF0aA"></a>
## `dm.SetPath(...)`

**`6.7.0`**

```js
dm.SetPath(path)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0UGF0aA"></a>
## `dm.setPath(...)`

**`6.7.0`**

```js
dm.setPath(path)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RGlzcGxheUlucHV0"></a>
## `dm.SetDisplayInput(...)`

**`6.7.0`**

```js
dm.SetDisplayInput(source)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RGlzcGxheUlucHV0"></a>
## `dm.setDisplayInput(...)`

**`6.7.0`**

```js
dm.setDisplayInput(source)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRW5hYmxlUGljQ2FjaGU"></a>
## `dm.EnablePicCache(...)`

**`6.7.0`**

```js
dm.EnablePicCache(enabled)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZW5hYmxlUGljQ2FjaGU"></a>
## `dm.enablePicCache(...)`

**`6.7.0`**

```js
dm.enablePicCache(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uY2FuY2Vs"></a>
## `dm.cancel(...)`

**`6.7.0`**

```js
dm.cancel()
```

取消当前长时间识别或匹配任务。

<a id="api-symbol-ZG0uY2xvc2U"></a>
## `dm.close(...)`

**`6.7.0`**

```js
dm.close()
```

释放当前脚本的图片、字库、缓冲区和 native 资源。

<a id="api-symbol-ZG0udXNlU2NyZWVu"></a>
## `dm.useScreen(...)`

**`6.7.0`**

```js
dm.useScreen()
```

切换回现有截图授权作为输入源。

<a id="api-symbol-ZG0ua2VlcFNjcmVlbg"></a>
## `dm.keepScreen(...)`

**`6.7.0`**

```js
dm.keepScreen(keep)
```

冻结或解除当前输入帧，适合在一次截图上执行多次识别。

<a id="api-symbol-ZG0uZ2V0RnJhbWVJbmZv"></a>
## `dm.getFrameInfo(...)`

**`6.7.0`**

```js
dm.getFrameInfo()
```

返回输入帧的旋转、裁剪和截图变换元数据。

<a id="api-symbol-ZG0uc2V0U2ltZEVuYWJsZWQ"></a>
## `dm.setSimdEnabled(...)`

**`6.7.0`**

```js
dm.setSimdEnabled(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uYnVmZmVy"></a>
## `dm.buffer(...)`

**`6.7.0`**

```js
dm.buffer(bytesOrDirectByteBuffer)
```

创建受 `Dm` 生命周期管理的缓冲区，替代裸地址；关闭后不能继续访问。

<a id="api-symbol-ZG0uZ2V0TGFzdEZpbmRUaW1pbmdz"></a>
## `dm.getLastFindTimings(...)`

**`6.7.0`**

```js
dm.getLastFindTimings()
```

返回最近一次找色、找图或找形状操作的截图、JNI 和 native 核心耗时。

<a id="api-symbol-ZG0uc2V0SW1hZ2U"></a>
## `dm.setImage(...)`

**`6.7.0`**

```js
dm.setImage(image)
```

将 `ImageWrapper`、Android `Bitmap` 或 `DmBuffer` 设为当前离线输入图像；显示缩放不会改变取样坐标。


<!-- api-member-contract id="dm.addDict" version="6.7.0" -->
`dm.addDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["addDict"]);
```

<!-- api-member-contract id="dm.AddDict" version="6.7.0" -->
`dm.AddDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["AddDict"]);
```

<!-- api-member-contract id="dm.appendPicAddr" version="6.7.0" -->
`dm.appendPicAddr` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["appendPicAddr"]);
```

<!-- api-member-contract id="dm.AppendPicAddr" version="6.7.0" -->
`dm.AppendPicAddr` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["AppendPicAddr"]);
```

<!-- api-member-contract id="dm.bgr2rgb" version="6.7.0" -->
`dm.bgr2rgb` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["bgr2rgb"]);
```

<!-- api-member-contract id="dm.BGR2RGB" version="6.7.0" -->
`dm.BGR2RGB` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["BGR2RGB"]);
```

<!-- api-member-contract id="dm.buffer" version="6.7.0" -->
`dm.buffer` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["buffer"]);
```

<!-- api-member-contract id="dm.cancel" version="6.7.0" -->
`dm.cancel` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["cancel"]);
```

<!-- api-member-contract id="dm.capture" version="6.7.0" -->
`dm.capture` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["capture"]);
```

<!-- api-member-contract id="dm.Capture" version="6.7.0" -->
`dm.Capture` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["Capture"]);
```

<!-- api-member-contract id="dm.captureGif" version="6.7.0" -->
`dm.captureGif` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["captureGif"]);
```

<!-- api-member-contract id="dm.CaptureGif" version="6.7.0" -->
`dm.CaptureGif` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["CaptureGif"]);
```

<!-- api-member-contract id="dm.captureJpg" version="6.7.0" -->
`dm.captureJpg` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["captureJpg"]);
```

<!-- api-member-contract id="dm.CaptureJpg" version="6.7.0" -->
`dm.CaptureJpg` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["CaptureJpg"]);
```

<!-- api-member-contract id="dm.capturePng" version="6.7.0" -->
`dm.capturePng` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["capturePng"]);
```

<!-- api-member-contract id="dm.CapturePng" version="6.7.0" -->
`dm.CapturePng` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["CapturePng"]);
```

<!-- api-member-contract id="dm.capturePre" version="6.7.0" -->
`dm.capturePre` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["capturePre"]);
```

<!-- api-member-contract id="dm.CapturePre" version="6.7.0" -->
`dm.CapturePre` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["CapturePre"]);
```

<!-- api-member-contract id="dm.clearDict" version="6.7.0" -->
`dm.clearDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["clearDict"]);
```

<!-- api-member-contract id="dm.ClearDict" version="6.7.0" -->
`dm.ClearDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["ClearDict"]);
```

<!-- api-member-contract id="dm.close" version="6.7.0" -->
`dm.close` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["close"]);
```

<!-- api-member-contract id="dm.cmpColor" version="6.7.0" -->
`dm.cmpColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["cmpColor"]);
```

<!-- api-member-contract id="dm.CmpColor" version="6.7.0" -->
`dm.CmpColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["CmpColor"]);
```

<!-- api-member-contract id="dm.enableDisplayDebug" version="6.7.0" -->
`dm.enableDisplayDebug` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["enableDisplayDebug"]);
```

<!-- api-member-contract id="dm.EnableDisplayDebug" version="6.7.0" -->
`dm.EnableDisplayDebug` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["EnableDisplayDebug"]);
```

<!-- api-member-contract id="dm.enableFindPicMultithread" version="6.7.0" -->
`dm.enableFindPicMultithread` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["enableFindPicMultithread"]);
```

<!-- api-member-contract id="dm.EnableFindPicMultithread" version="6.7.0" -->
`dm.EnableFindPicMultithread` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["EnableFindPicMultithread"]);
```

<!-- api-member-contract id="dm.enableGetColorByCapture" version="6.7.0" -->
`dm.enableGetColorByCapture` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["enableGetColorByCapture"]);
```

<!-- api-member-contract id="dm.EnableGetColorByCapture" version="6.7.0" -->
`dm.EnableGetColorByCapture` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["EnableGetColorByCapture"]);
```

<!-- api-member-contract id="dm.enablePicCache" version="6.7.0" -->
`dm.enablePicCache` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["enablePicCache"]);
```

<!-- api-member-contract id="dm.EnablePicCache" version="6.7.0" -->
`dm.EnablePicCache` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["EnablePicCache"]);
```

<!-- api-member-contract id="dm.enableShareDict" version="6.7.0" -->
`dm.enableShareDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["enableShareDict"]);
```

<!-- api-member-contract id="dm.EnableShareDict" version="6.7.0" -->
`dm.EnableShareDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["EnableShareDict"]);
```

<!-- api-member-contract id="dm.fetchWord" version="6.7.0" -->
`dm.fetchWord` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["fetchWord"]);
```

<!-- api-member-contract id="dm.FetchWord" version="6.7.0" -->
`dm.FetchWord` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FetchWord"]);
```

<!-- api-member-contract id="dm.findColor" version="6.7.0" -->
`dm.findColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findColor"]);
```

<!-- api-member-contract id="dm.FindColor" version="6.7.0" -->
`dm.FindColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindColor"]);
```

<!-- api-member-contract id="dm.findColorBlock" version="6.7.0" -->
`dm.findColorBlock` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findColorBlock"]);
```

<!-- api-member-contract id="dm.FindColorBlock" version="6.7.0" -->
`dm.FindColorBlock` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindColorBlock"]);
```

<!-- api-member-contract id="dm.findColorBlockEx" version="6.7.0" -->
`dm.findColorBlockEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findColorBlockEx"]);
```

<!-- api-member-contract id="dm.FindColorBlockEx" version="6.7.0" -->
`dm.FindColorBlockEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindColorBlockEx"]);
```

<!-- api-member-contract id="dm.findColorE" version="6.7.0" -->
`dm.findColorE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findColorE"]);
```

<!-- api-member-contract id="dm.FindColorE" version="6.7.0" -->
`dm.FindColorE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindColorE"]);
```

<!-- api-member-contract id="dm.findColorEx" version="6.7.0" -->
`dm.findColorEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findColorEx"]);
```

<!-- api-member-contract id="dm.FindColorEx" version="6.7.0" -->
`dm.FindColorEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindColorEx"]);
```

<!-- api-member-contract id="dm.findMulColor" version="6.7.0" -->
`dm.findMulColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findMulColor"]);
```

<!-- api-member-contract id="dm.FindMulColor" version="6.7.0" -->
`dm.FindMulColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindMulColor"]);
```

<!-- api-member-contract id="dm.findMultiColor" version="6.7.0" -->
`dm.findMultiColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findMultiColor"]);
```

<!-- api-member-contract id="dm.FindMultiColor" version="6.7.0" -->
`dm.FindMultiColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindMultiColor"]);
```

<!-- api-member-contract id="dm.findMultiColorE" version="6.7.0" -->
`dm.findMultiColorE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findMultiColorE"]);
```

<!-- api-member-contract id="dm.FindMultiColorE" version="6.7.0" -->
`dm.FindMultiColorE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindMultiColorE"]);
```

<!-- api-member-contract id="dm.findMultiColorEx" version="6.7.0" -->
`dm.findMultiColorEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findMultiColorEx"]);
```

<!-- api-member-contract id="dm.FindMultiColorEx" version="6.7.0" -->
`dm.FindMultiColorEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindMultiColorEx"]);
```

<!-- api-member-contract id="dm.findPic" version="6.7.0" -->
`dm.findPic` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPic"]);
```

<!-- api-member-contract id="dm.FindPic" version="6.7.0" -->
`dm.FindPic` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPic"]);
```

<!-- api-member-contract id="dm.findPicE" version="6.7.0" -->
`dm.findPicE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicE"]);
```

<!-- api-member-contract id="dm.FindPicE" version="6.7.0" -->
`dm.FindPicE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicE"]);
```

<!-- api-member-contract id="dm.findPicEx" version="6.7.0" -->
`dm.findPicEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicEx"]);
```

<!-- api-member-contract id="dm.FindPicEx" version="6.7.0" -->
`dm.FindPicEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicEx"]);
```

<!-- api-member-contract id="dm.findPicExS" version="6.7.0" -->
`dm.findPicExS` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicExS"]);
```

<!-- api-member-contract id="dm.FindPicExS" version="6.7.0" -->
`dm.FindPicExS` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicExS"]);
```

<!-- api-member-contract id="dm.findPicMem" version="6.7.0" -->
`dm.findPicMem` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicMem"]);
```

<!-- api-member-contract id="dm.FindPicMem" version="6.7.0" -->
`dm.FindPicMem` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicMem"]);
```

<!-- api-member-contract id="dm.findPicMemE" version="6.7.0" -->
`dm.findPicMemE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicMemE"]);
```

<!-- api-member-contract id="dm.FindPicMemE" version="6.7.0" -->
`dm.FindPicMemE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicMemE"]);
```

<!-- api-member-contract id="dm.findPicMemEx" version="6.7.0" -->
`dm.findPicMemEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicMemEx"]);
```

<!-- api-member-contract id="dm.FindPicMemEx" version="6.7.0" -->
`dm.FindPicMemEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicMemEx"]);
```

<!-- api-member-contract id="dm.findPicS" version="6.7.0" -->
`dm.findPicS` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicS"]);
```

<!-- api-member-contract id="dm.FindPicS" version="6.7.0" -->
`dm.FindPicS` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicS"]);
```

<!-- api-member-contract id="dm.findPicSim" version="6.7.0" -->
`dm.findPicSim` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicSim"]);
```

<!-- api-member-contract id="dm.FindPicSim" version="6.7.0" -->
`dm.FindPicSim` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicSim"]);
```

<!-- api-member-contract id="dm.findPicSimE" version="6.7.0" -->
`dm.findPicSimE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicSimE"]);
```

<!-- api-member-contract id="dm.FindPicSimE" version="6.7.0" -->
`dm.FindPicSimE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicSimE"]);
```

<!-- api-member-contract id="dm.findPicSimEx" version="6.7.0" -->
`dm.findPicSimEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicSimEx"]);
```

<!-- api-member-contract id="dm.FindPicSimEx" version="6.7.0" -->
`dm.FindPicSimEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicSimEx"]);
```

<!-- api-member-contract id="dm.findPicSimMem" version="6.7.0" -->
`dm.findPicSimMem` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicSimMem"]);
```

<!-- api-member-contract id="dm.FindPicSimMem" version="6.7.0" -->
`dm.FindPicSimMem` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicSimMem"]);
```

<!-- api-member-contract id="dm.findPicSimMemE" version="6.7.0" -->
`dm.findPicSimMemE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicSimMemE"]);
```

<!-- api-member-contract id="dm.FindPicSimMemE" version="6.7.0" -->
`dm.FindPicSimMemE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicSimMemE"]);
```

<!-- api-member-contract id="dm.findPicSimMemEx" version="6.7.0" -->
`dm.findPicSimMemEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicSimMemEx"]);
```

<!-- api-member-contract id="dm.FindPicSimMemEx" version="6.7.0" -->
`dm.FindPicSimMemEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicSimMemEx"]);
```

<!-- api-member-contract id="dm.findShape" version="6.7.0" -->
`dm.findShape` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findShape"]);
```

<!-- api-member-contract id="dm.FindShape" version="6.7.0" -->
`dm.FindShape` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindShape"]);
```

<!-- api-member-contract id="dm.findShapeE" version="6.7.0" -->
`dm.findShapeE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findShapeE"]);
```

<!-- api-member-contract id="dm.FindShapeE" version="6.7.0" -->
`dm.FindShapeE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindShapeE"]);
```

<!-- api-member-contract id="dm.findShapeEx" version="6.7.0" -->
`dm.findShapeEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findShapeEx"]);
```

<!-- api-member-contract id="dm.FindShapeEx" version="6.7.0" -->
`dm.FindShapeEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindShapeEx"]);
```

<!-- api-member-contract id="dm.findStr" version="6.7.0" -->
`dm.findStr` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findStr"]);
```

<!-- api-member-contract id="dm.FindStr" version="6.7.0" -->
`dm.FindStr` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStr"]);
```

<!-- api-member-contract id="dm.findStrE" version="6.7.0" -->
`dm.findStrE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrE"]);
```

<!-- api-member-contract id="dm.FindStrE" version="6.7.0" -->
`dm.FindStrE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrE"]);
```

<!-- api-member-contract id="dm.findStrEx" version="6.7.0" -->
`dm.findStrEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrEx"]);
```

<!-- api-member-contract id="dm.FindStrEx" version="6.7.0" -->
`dm.FindStrEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrEx"]);
```

<!-- api-member-contract id="dm.findStrExS" version="6.7.0" -->
`dm.findStrExS` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrExS"]);
```

<!-- api-member-contract id="dm.FindStrExS" version="6.7.0" -->
`dm.FindStrExS` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrExS"]);
```

<!-- api-member-contract id="dm.findStrFast" version="6.7.0" -->
`dm.findStrFast` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrFast"]);
```

<!-- api-member-contract id="dm.FindStrFast" version="6.7.0" -->
`dm.FindStrFast` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrFast"]);
```

<!-- api-member-contract id="dm.findStrFastE" version="6.7.0" -->
`dm.findStrFastE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrFastE"]);
```

<!-- api-member-contract id="dm.FindStrFastE" version="6.7.0" -->
`dm.FindStrFastE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrFastE"]);
```

<!-- api-member-contract id="dm.findStrFastEx" version="6.7.0" -->
`dm.findStrFastEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrFastEx"]);
```

<!-- api-member-contract id="dm.FindStrFastEx" version="6.7.0" -->
`dm.FindStrFastEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrFastEx"]);
```

<!-- api-member-contract id="dm.findStrFastExS" version="6.7.0" -->
`dm.findStrFastExS` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrFastExS"]);
```

<!-- api-member-contract id="dm.FindStrFastExS" version="6.7.0" -->
`dm.FindStrFastExS` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrFastExS"]);
```

<!-- api-member-contract id="dm.findStrFastS" version="6.7.0" -->
`dm.findStrFastS` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrFastS"]);
```

<!-- api-member-contract id="dm.FindStrFastS" version="6.7.0" -->
`dm.FindStrFastS` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrFastS"]);
```

<!-- api-member-contract id="dm.findStrS" version="6.7.0" -->
`dm.findStrS` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrS"]);
```

<!-- api-member-contract id="dm.FindStrS" version="6.7.0" -->
`dm.FindStrS` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrS"]);
```

<!-- api-member-contract id="dm.findStrWithFont" version="6.7.0" -->
`dm.findStrWithFont` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrWithFont"]);
```

<!-- api-member-contract id="dm.FindStrWithFont" version="6.7.0" -->
`dm.FindStrWithFont` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrWithFont"]);
```

<!-- api-member-contract id="dm.findStrWithFontE" version="6.7.0" -->
`dm.findStrWithFontE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrWithFontE"]);
```

<!-- api-member-contract id="dm.FindStrWithFontE" version="6.7.0" -->
`dm.FindStrWithFontE` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrWithFontE"]);
```

<!-- api-member-contract id="dm.findStrWithFontEx" version="6.7.0" -->
`dm.findStrWithFontEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrWithFontEx"]);
```

<!-- api-member-contract id="dm.FindStrWithFontEx" version="6.7.0" -->
`dm.FindStrWithFontEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrWithFontEx"]);
```

<!-- api-member-contract id="dm.freePic" version="6.7.0" -->
`dm.freePic` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["freePic"]);
```

<!-- api-member-contract id="dm.FreePic" version="6.7.0" -->
`dm.FreePic` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["FreePic"]);
```

<!-- api-member-contract id="dm.getAveHSV" version="6.7.0" -->
`dm.getAveHSV` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getAveHSV"]);
```

<!-- api-member-contract id="dm.GetAveHSV" version="6.7.0" -->
`dm.GetAveHSV` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetAveHSV"]);
```

<!-- api-member-contract id="dm.getAveRGB" version="6.7.0" -->
`dm.getAveRGB` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getAveRGB"]);
```

<!-- api-member-contract id="dm.GetAveRGB" version="6.7.0" -->
`dm.GetAveRGB` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetAveRGB"]);
```

<!-- api-member-contract id="dm.getColor" version="6.7.0" -->
`dm.getColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getColor"]);
```

<!-- api-member-contract id="dm.GetColor" version="6.7.0" -->
`dm.GetColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetColor"]);
```

<!-- api-member-contract id="dm.getColorBGR" version="6.7.0" -->
`dm.getColorBGR` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getColorBGR"]);
```

<!-- api-member-contract id="dm.GetColorBGR" version="6.7.0" -->
`dm.GetColorBGR` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetColorBGR"]);
```

<!-- api-member-contract id="dm.getColorHSV" version="6.7.0" -->
`dm.getColorHSV` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getColorHSV"]);
```

<!-- api-member-contract id="dm.GetColorHSV" version="6.7.0" -->
`dm.GetColorHSV` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetColorHSV"]);
```

<!-- api-member-contract id="dm.getColorNum" version="6.7.0" -->
`dm.getColorNum` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getColorNum"]);
```

<!-- api-member-contract id="dm.GetColorNum" version="6.7.0" -->
`dm.GetColorNum` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetColorNum"]);
```

<!-- api-member-contract id="dm.getDict" version="6.7.0" -->
`dm.getDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getDict"]);
```

<!-- api-member-contract id="dm.GetDict" version="6.7.0" -->
`dm.GetDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetDict"]);
```

<!-- api-member-contract id="dm.getDictCount" version="6.7.0" -->
`dm.getDictCount` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getDictCount"]);
```

<!-- api-member-contract id="dm.GetDictCount" version="6.7.0" -->
`dm.GetDictCount` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetDictCount"]);
```

<!-- api-member-contract id="dm.getDictInfo" version="6.7.0" -->
`dm.getDictInfo` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getDictInfo"]);
```

<!-- api-member-contract id="dm.GetDictInfo" version="6.7.0" -->
`dm.GetDictInfo` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetDictInfo"]);
```

<!-- api-member-contract id="dm.getFrameInfo" version="6.7.0" -->
`dm.getFrameInfo` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getFrameInfo"]);
```

<!-- api-member-contract id="dm.getLastFindTimings" version="6.7.0" -->
`dm.getLastFindTimings` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getLastFindTimings"]);
```

<!-- api-member-contract id="dm.getNowDict" version="6.7.0" -->
`dm.getNowDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getNowDict"]);
```

<!-- api-member-contract id="dm.GetNowDict" version="6.7.0" -->
`dm.GetNowDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetNowDict"]);
```

<!-- api-member-contract id="dm.getPicSize" version="6.7.0" -->
`dm.getPicSize` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getPicSize"]);
```

<!-- api-member-contract id="dm.GetPicSize" version="6.7.0" -->
`dm.GetPicSize` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetPicSize"]);
```

<!-- api-member-contract id="dm.getResultCount" version="6.7.0" -->
`dm.getResultCount` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getResultCount"]);
```

<!-- api-member-contract id="dm.GetResultCount" version="6.7.0" -->
`dm.GetResultCount` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetResultCount"]);
```

<!-- api-member-contract id="dm.getResultPos" version="6.7.0" -->
`dm.getResultPos` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getResultPos"]);
```

<!-- api-member-contract id="dm.GetResultPos" version="6.7.0" -->
`dm.GetResultPos` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetResultPos"]);
```

<!-- api-member-contract id="dm.getScreenData" version="6.7.0" -->
`dm.getScreenData` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getScreenData"]);
```

<!-- api-member-contract id="dm.GetScreenData" version="6.7.0" -->
`dm.GetScreenData` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetScreenData"]);
```

<!-- api-member-contract id="dm.getScreenDataBmp" version="6.7.0" -->
`dm.getScreenDataBmp` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getScreenDataBmp"]);
```

<!-- api-member-contract id="dm.GetScreenDataBmp" version="6.7.0" -->
`dm.GetScreenDataBmp` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetScreenDataBmp"]);
```

<!-- api-member-contract id="dm.getWordResultCount" version="6.7.0" -->
`dm.getWordResultCount` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getWordResultCount"]);
```

<!-- api-member-contract id="dm.GetWordResultCount" version="6.7.0" -->
`dm.GetWordResultCount` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetWordResultCount"]);
```

<!-- api-member-contract id="dm.getWordResultPos" version="6.7.0" -->
`dm.getWordResultPos` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getWordResultPos"]);
```

<!-- api-member-contract id="dm.GetWordResultPos" version="6.7.0" -->
`dm.GetWordResultPos` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetWordResultPos"]);
```

<!-- api-member-contract id="dm.getWordResultStr" version="6.7.0" -->
`dm.getWordResultStr` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getWordResultStr"]);
```

<!-- api-member-contract id="dm.GetWordResultStr" version="6.7.0" -->
`dm.GetWordResultStr` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetWordResultStr"]);
```

<!-- api-member-contract id="dm.getWords" version="6.7.0" -->
`dm.getWords` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getWords"]);
```

<!-- api-member-contract id="dm.GetWords" version="6.7.0" -->
`dm.GetWords` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetWords"]);
```

<!-- api-member-contract id="dm.getWordsNoDict" version="6.7.0" -->
`dm.getWordsNoDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["getWordsNoDict"]);
```

<!-- api-member-contract id="dm.GetWordsNoDict" version="6.7.0" -->
`dm.GetWordsNoDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["GetWordsNoDict"]);
```

<!-- api-member-contract id="dm.imageToBmp" version="6.7.0" -->
`dm.imageToBmp` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["imageToBmp"]);
```

<!-- api-member-contract id="dm.ImageToBmp" version="6.7.0" -->
`dm.ImageToBmp` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["ImageToBmp"]);
```

<!-- api-member-contract id="dm.isDisplayDead" version="6.7.0" -->
`dm.isDisplayDead` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["isDisplayDead"]);
```

<!-- api-member-contract id="dm.IsDisplayDead" version="6.7.0" -->
`dm.IsDisplayDead` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["IsDisplayDead"]);
```

<!-- api-member-contract id="dm.keepScreen" version="6.7.0" -->
`dm.keepScreen` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["keepScreen"]);
```

<!-- api-member-contract id="dm.loadPic" version="6.7.0" -->
`dm.loadPic` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["loadPic"]);
```

<!-- api-member-contract id="dm.LoadPic" version="6.7.0" -->
`dm.LoadPic` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["LoadPic"]);
```

<!-- api-member-contract id="dm.loadPicByte" version="6.7.0" -->
`dm.loadPicByte` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["loadPicByte"]);
```

<!-- api-member-contract id="dm.LoadPicByte" version="6.7.0" -->
`dm.LoadPicByte` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["LoadPicByte"]);
```

<!-- api-member-contract id="dm.matchPicName" version="6.7.0" -->
`dm.matchPicName` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["matchPicName"]);
```

<!-- api-member-contract id="dm.MatchPicName" version="6.7.0" -->
`dm.MatchPicName` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["MatchPicName"]);
```

<!-- api-member-contract id="dm.ocr" version="6.7.0" -->
`dm.ocr` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["ocr"]);
```

<!-- api-member-contract id="dm.Ocr" version="6.7.0" -->
`dm.Ocr` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["Ocr"]);
```

<!-- api-member-contract id="dm.ocrAuto" version="6.7.0" -->
`dm.ocrAuto` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["ocrAuto"]);
```

<!-- api-member-contract id="dm.ocrEx" version="6.7.0" -->
`dm.ocrEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["ocrEx"]);
```

<!-- api-member-contract id="dm.OcrEx" version="6.7.0" -->
`dm.OcrEx` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["OcrEx"]);
```

<!-- api-member-contract id="dm.ocrExOne" version="6.7.0" -->
`dm.ocrExOne` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["ocrExOne"]);
```

<!-- api-member-contract id="dm.OcrExOne" version="6.7.0" -->
`dm.OcrExOne` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["OcrExOne"]);
```

<!-- api-member-contract id="dm.ocrInFile" version="6.7.0" -->
`dm.ocrInFile` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["ocrInFile"]);
```

<!-- api-member-contract id="dm.OcrInFile" version="6.7.0" -->
`dm.OcrInFile` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["OcrInFile"]);
```

<!-- api-member-contract id="dm.rgb2bgr" version="6.7.0" -->
`dm.rgb2bgr` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["rgb2bgr"]);
```

<!-- api-member-contract id="dm.RGB2BGR" version="6.7.0" -->
`dm.RGB2BGR` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["RGB2BGR"]);
```

<!-- api-member-contract id="dm.saveDict" version="6.7.0" -->
`dm.saveDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["saveDict"]);
```

<!-- api-member-contract id="dm.SaveDict" version="6.7.0" -->
`dm.SaveDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SaveDict"]);
```

<!-- api-member-contract id="dm.setColGapNoDict" version="6.7.0" -->
`dm.setColGapNoDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setColGapNoDict"]);
```

<!-- api-member-contract id="dm.SetColGapNoDict" version="6.7.0" -->
`dm.SetColGapNoDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetColGapNoDict"]);
```

<!-- api-member-contract id="dm.setDict" version="6.7.0" -->
`dm.setDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setDict"]);
```

<!-- api-member-contract id="dm.SetDict" version="6.7.0" -->
`dm.SetDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetDict"]);
```

<!-- api-member-contract id="dm.setDictMem" version="6.7.0" -->
`dm.setDictMem` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setDictMem"]);
```

<!-- api-member-contract id="dm.SetDictMem" version="6.7.0" -->
`dm.SetDictMem` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetDictMem"]);
```

<!-- api-member-contract id="dm.setDictPwd" version="6.7.0" -->
`dm.setDictPwd` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setDictPwd"]);
```

<!-- api-member-contract id="dm.SetDictPwd" version="6.7.0" -->
`dm.SetDictPwd` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetDictPwd"]);
```

<!-- api-member-contract id="dm.setDisplayInput" version="6.7.0" -->
`dm.setDisplayInput` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setDisplayInput"]);
```

<!-- api-member-contract id="dm.SetDisplayInput" version="6.7.0" -->
`dm.SetDisplayInput` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetDisplayInput"]);
```

<!-- api-member-contract id="dm.setExactOcr" version="6.7.0" -->
`dm.setExactOcr` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setExactOcr"]);
```

<!-- api-member-contract id="dm.SetExactOcr" version="6.7.0" -->
`dm.SetExactOcr` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetExactOcr"]);
```

<!-- api-member-contract id="dm.setExcludeRegion" version="6.7.0" -->
`dm.setExcludeRegion` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setExcludeRegion"]);
```

<!-- api-member-contract id="dm.SetExcludeRegion" version="6.7.0" -->
`dm.SetExcludeRegion` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetExcludeRegion"]);
```

<!-- api-member-contract id="dm.setFindPicMultithreadCount" version="6.7.0" -->
`dm.setFindPicMultithreadCount` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setFindPicMultithreadCount"]);
```

<!-- api-member-contract id="dm.SetFindPicMultithreadCount" version="6.7.0" -->
`dm.SetFindPicMultithreadCount` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetFindPicMultithreadCount"]);
```

<!-- api-member-contract id="dm.setFindPicMultithreadLimit" version="6.7.0" -->
`dm.setFindPicMultithreadLimit` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setFindPicMultithreadLimit"]);
```

<!-- api-member-contract id="dm.SetFindPicMultithreadLimit" version="6.7.0" -->
`dm.SetFindPicMultithreadLimit` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetFindPicMultithreadLimit"]);
```

<!-- api-member-contract id="dm.setImage" version="6.7.0" -->
`dm.setImage` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setImage"]);
```

<!-- api-member-contract id="dm.setMinColGap" version="6.7.0" -->
`dm.setMinColGap` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setMinColGap"]);
```

<!-- api-member-contract id="dm.SetMinColGap" version="6.7.0" -->
`dm.SetMinColGap` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetMinColGap"]);
```

<!-- api-member-contract id="dm.setMinRowGap" version="6.7.0" -->
`dm.setMinRowGap` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setMinRowGap"]);
```

<!-- api-member-contract id="dm.SetMinRowGap" version="6.7.0" -->
`dm.SetMinRowGap` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetMinRowGap"]);
```

<!-- api-member-contract id="dm.setPath" version="6.7.0" -->
`dm.setPath` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setPath"]);
```

<!-- api-member-contract id="dm.SetPath" version="6.7.0" -->
`dm.SetPath` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetPath"]);
```

<!-- api-member-contract id="dm.setPicPwd" version="6.7.0" -->
`dm.setPicPwd` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setPicPwd"]);
```

<!-- api-member-contract id="dm.SetPicPwd" version="6.7.0" -->
`dm.SetPicPwd` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetPicPwd"]);
```

<!-- api-member-contract id="dm.setRowGapNoDict" version="6.7.0" -->
`dm.setRowGapNoDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setRowGapNoDict"]);
```

<!-- api-member-contract id="dm.SetRowGapNoDict" version="6.7.0" -->
`dm.SetRowGapNoDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetRowGapNoDict"]);
```

<!-- api-member-contract id="dm.setSimdEnabled" version="6.7.0" -->
`dm.setSimdEnabled` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setSimdEnabled"]);
```

<!-- api-member-contract id="dm.setWordGap" version="6.7.0" -->
`dm.setWordGap` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setWordGap"]);
```

<!-- api-member-contract id="dm.SetWordGap" version="6.7.0" -->
`dm.SetWordGap` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetWordGap"]);
```

<!-- api-member-contract id="dm.setWordGapNoDict" version="6.7.0" -->
`dm.setWordGapNoDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setWordGapNoDict"]);
```

<!-- api-member-contract id="dm.SetWordGapNoDict" version="6.7.0" -->
`dm.SetWordGapNoDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetWordGapNoDict"]);
```

<!-- api-member-contract id="dm.setWordLineHeight" version="6.7.0" -->
`dm.setWordLineHeight` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setWordLineHeight"]);
```

<!-- api-member-contract id="dm.SetWordLineHeight" version="6.7.0" -->
`dm.SetWordLineHeight` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetWordLineHeight"]);
```

<!-- api-member-contract id="dm.setWordLineHeightNoDict" version="6.7.0" -->
`dm.setWordLineHeightNoDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["setWordLineHeightNoDict"]);
```

<!-- api-member-contract id="dm.SetWordLineHeightNoDict" version="6.7.0" -->
`dm.SetWordLineHeightNoDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["SetWordLineHeightNoDict"]);
```

<!-- api-member-contract id="dm.useDict" version="6.7.0" -->
`dm.useDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["useDict"]);
```

<!-- api-member-contract id="dm.UseDict" version="6.7.0" -->
`dm.UseDict` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["UseDict"]);
```

<!-- api-member-contract id="dm.useScreen" version="6.7.0" -->
`dm.useScreen` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm["useScreen"]);
```

<!-- api-member-contract id="module:dm" version="6.7.0" -->
`module:dm` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof dm);
```
