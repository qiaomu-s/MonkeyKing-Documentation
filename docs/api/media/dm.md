# dm 图色与文字识别 API

Monkey King 当前运行时提供脚本级全局对象 `dm`。本页是正式 API 清单；图色算法、明文字库格式、坐标变换和 VS Code 制作流程见 [大漠参考总览](../../reference/dm/overview.md)。
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
```js
dm.BGR2RGB(color)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uYmdyMnJnYg"></a>
## `dm.bgr2rgb(...)`
```js
dm.bgr2rgb(color)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ21wQ29sb3I"></a>
## `dm.CmpColor(...)`
```js
dm.CmpColor(x, y, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY21wQ29sb3I"></a>
## `dm.cmpColor(...)`
```js
dm.cmpColor(x, y, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZENvbG9y"></a>
## `dm.FindColor(...)`
```js
dm.FindColor(x1, y1, x2, y2, color, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZENvbG9y"></a>
## `dm.findColor(...)`
```js
dm.findColor(x1, y1, x2, y2, color, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZENvbG9yQmxvY2s"></a>
## `dm.FindColorBlock(...)`
```js
dm.FindColorBlock(x1, y1, x2, y2, color, similarity, count, width, height, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZENvbG9yQmxvY2s"></a>
## `dm.findColorBlock(...)`
```js
dm.findColorBlock(x1, y1, x2, y2, color, similarity, count, width, height)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZENvbG9yQmxvY2tFeA"></a>
## `dm.FindColorBlockEx(...)`
```js
dm.FindColorBlockEx(x1, y1, x2, y2, color, similarity, count, width, height)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZENvbG9yQmxvY2tFeA"></a>
## `dm.findColorBlockEx(...)`
```js
dm.findColorBlockEx(x1, y1, x2, y2, color, similarity, count, width, height)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZENvbG9yRQ"></a>
## `dm.FindColorE(...)`
```js
dm.FindColorE(x1, y1, x2, y2, color, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZENvbG9yRQ"></a>
## `dm.findColorE(...)`
```js
dm.findColorE(x1, y1, x2, y2, color, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZENvbG9yRXg"></a>
## `dm.FindColorEx(...)`
```js
dm.FindColorEx(x1, y1, x2, y2, color, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZENvbG9yRXg"></a>
## `dm.findColorEx(...)`
```js
dm.findColorEx(x1, y1, x2, y2, color, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZE11bENvbG9y"></a>
## `dm.FindMulColor(...)`
```js
dm.FindMulColor(x1, y1, x2, y2, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZE11bENvbG9y"></a>
## `dm.findMulColor(...)`
```js
dm.findMulColor(x1, y1, x2, y2, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZE11bHRpQ29sb3I"></a>
## `dm.FindMultiColor(...)`
```js
dm.FindMultiColor(x1, y1, x2, y2, color, offsets, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZE11bHRpQ29sb3I"></a>
## `dm.findMultiColor(...)`
```js
dm.findMultiColor(x1, y1, x2, y2, color, offsets, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZE11bHRpQ29sb3JF"></a>
## `dm.FindMultiColorE(...)`
```js
dm.FindMultiColorE(x1, y1, x2, y2, color, offsets, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZE11bHRpQ29sb3JF"></a>
## `dm.findMultiColorE(...)`
```js
dm.findMultiColorE(x1, y1, x2, y2, color, offsets, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZE11bHRpQ29sb3JFeA"></a>
## `dm.FindMultiColorEx(...)`
```js
dm.FindMultiColorEx(x1, y1, x2, y2, color, offsets, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZE11bHRpQ29sb3JFeA"></a>
## `dm.findMultiColorEx(...)`
```js
dm.findMultiColorEx(x1, y1, x2, y2, color, offsets, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFNoYXBl"></a>
## `dm.FindShape(...)`
```js
dm.FindShape(x1, y1, x2, y2, shape, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFNoYXBl"></a>
## `dm.findShape(...)`
```js
dm.findShape(x1, y1, x2, y2, shape, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFNoYXBlRQ"></a>
## `dm.FindShapeE(...)`
```js
dm.FindShapeE(x1, y1, x2, y2, shape, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFNoYXBlRQ"></a>
## `dm.findShapeE(...)`
```js
dm.findShapeE(x1, y1, x2, y2, shape, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFNoYXBlRXg"></a>
## `dm.FindShapeEx(...)`
```js
dm.FindShapeEx(x1, y1, x2, y2, shape, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFNoYXBlRXg"></a>
## `dm.findShapeEx(...)`
```js
dm.findShapeEx(x1, y1, x2, y2, shape, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0QXZlSFNW"></a>
## `dm.GetAveHSV(...)`
```js
dm.GetAveHSV(x1, y1, x2, y2)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0QXZlSFNW"></a>
## `dm.getAveHSV(...)`
```js
dm.getAveHSV(x1, y1, x2, y2)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0QXZlUkdC"></a>
## `dm.GetAveRGB(...)`
```js
dm.GetAveRGB(x1, y1, x2, y2)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0QXZlUkdC"></a>
## `dm.getAveRGB(...)`
```js
dm.getAveRGB(x1, y1, x2, y2)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0Q29sb3I"></a>
## `dm.GetColor(...)`
```js
dm.GetColor(x, y)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0Q29sb3I"></a>
## `dm.getColor(...)`
```js
dm.getColor(x, y)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0Q29sb3JCR1I"></a>
## `dm.GetColorBGR(...)`
```js
dm.GetColorBGR(x, y)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0Q29sb3JCR1I"></a>
## `dm.getColorBGR(...)`
```js
dm.getColorBGR(x, y)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0Q29sb3JIU1Y"></a>
## `dm.GetColorHSV(...)`
```js
dm.GetColorHSV(x, y)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0Q29sb3JIU1Y"></a>
## `dm.getColorHSV(...)`
```js
dm.getColorHSV(x, y)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0Q29sb3JOdW0"></a>
## `dm.GetColorNum(...)`
```js
dm.GetColorNum(x1, y1, x2, y2, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0Q29sb3JOdW0"></a>
## `dm.getColorNum(...)`
```js
dm.getColorNum(x1, y1, x2, y2, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uUkdCMkJHUg"></a>
## `dm.RGB2BGR(...)`
```js
dm.RGB2BGR(color)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ucmdiMmJncg"></a>
## `dm.rgb2bgr(...)`
```js
dm.rgb2bgr(color)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

## 找图、缓存和截图

<a id="api-symbol-ZG0uQXBwZW5kUGljQWRkcg"></a>
## `dm.AppendPicAddr(...)`
```js
dm.AppendPicAddr(buffers, data, length)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uYXBwZW5kUGljQWRkcg"></a>
## `dm.appendPicAddr(...)`
```js
dm.appendPicAddr(buffers, data, length)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ2FwdHVyZQ"></a>
## `dm.Capture(...)`
```js
dm.Capture(x1, y1, x2, y2, file)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY2FwdHVyZQ"></a>
## `dm.capture(...)`
```js
dm.capture(x1, y1, x2, y2, file)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ2FwdHVyZUdpZg"></a>
## `dm.CaptureGif(...)`
```js
dm.CaptureGif(x1, y1, x2, y2, file, delay, duration)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY2FwdHVyZUdpZg"></a>
## `dm.captureGif(...)`
```js
dm.captureGif(x1, y1, x2, y2, file, delay, duration)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ2FwdHVyZUpwZw"></a>
## `dm.CaptureJpg(...)`
```js
dm.CaptureJpg(x1, y1, x2, y2, file, quality)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY2FwdHVyZUpwZw"></a>
## `dm.captureJpg(...)`
```js
dm.captureJpg(x1, y1, x2, y2, file, quality)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ2FwdHVyZVBuZw"></a>
## `dm.CapturePng(...)`
```js
dm.CapturePng(x1, y1, x2, y2, file)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY2FwdHVyZVBuZw"></a>
## `dm.capturePng(...)`
```js
dm.capturePng(x1, y1, x2, y2, file)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ2FwdHVyZVByZQ"></a>
## `dm.CapturePre(...)`
```js
dm.CapturePre(file)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY2FwdHVyZVByZQ"></a>
## `dm.capturePre(...)`
```js
dm.capturePre(file)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpYw"></a>
## `dm.FindPic(...)`
```js
dm.FindPic(x1, y1, x2, y2, pictures, delta, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpYw"></a>
## `dm.findPic(...)`
```js
dm.findPic(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY0U"></a>
## `dm.FindPicE(...)`
```js
dm.FindPicE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY0U"></a>
## `dm.findPicE(...)`
```js
dm.findPicE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY0V4"></a>
## `dm.FindPicEx(...)`
```js
dm.FindPicEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY0V4"></a>
## `dm.findPicEx(...)`
```js
dm.findPicEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY0V4Uw"></a>
## `dm.FindPicExS(...)`
```js
dm.FindPicExS(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY0V4Uw"></a>
## `dm.findPicExS(...)`
```js
dm.findPicExS(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY01lbQ"></a>
## `dm.FindPicMem(...)`
```js
dm.FindPicMem(x1, y1, x2, y2, pictures, delta, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY01lbQ"></a>
## `dm.findPicMem(...)`
```js
dm.findPicMem(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY01lbUU"></a>
## `dm.FindPicMemE(...)`
```js
dm.FindPicMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY01lbUU"></a>
## `dm.findPicMemE(...)`
```js
dm.findPicMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY01lbUV4"></a>
## `dm.FindPicMemEx(...)`
```js
dm.FindPicMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY01lbUV4"></a>
## `dm.findPicMemEx(...)`
```js
dm.findPicMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1M"></a>
## `dm.FindPicS(...)`
```js
dm.FindPicS(x1, y1, x2, y2, pictures, delta, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1M"></a>
## `dm.findPicS(...)`
```js
dm.findPicS(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1NpbQ"></a>
## `dm.FindPicSim(...)`
```js
dm.FindPicSim(x1, y1, x2, y2, pictures, delta, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1NpbQ"></a>
## `dm.findPicSim(...)`
```js
dm.findPicSim(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1NpbUU"></a>
## `dm.FindPicSimE(...)`
```js
dm.FindPicSimE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1NpbUU"></a>
## `dm.findPicSimE(...)`
```js
dm.findPicSimE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1NpbUV4"></a>
## `dm.FindPicSimEx(...)`
```js
dm.FindPicSimEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1NpbUV4"></a>
## `dm.findPicSimEx(...)`
```js
dm.findPicSimEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1NpbU1lbQ"></a>
## `dm.FindPicSimMem(...)`
```js
dm.FindPicSimMem(x1, y1, x2, y2, pictures, delta, similarity, direction, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1NpbU1lbQ"></a>
## `dm.findPicSimMem(...)`
```js
dm.findPicSimMem(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1NpbU1lbUU"></a>
## `dm.FindPicSimMemE(...)`
```js
dm.FindPicSimMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1NpbU1lbUU"></a>
## `dm.findPicSimMemE(...)`
```js
dm.findPicSimMemE(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFBpY1NpbU1lbUV4"></a>
## `dm.FindPicSimMemEx(...)`
```js
dm.FindPicSimMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFBpY1NpbU1lbUV4"></a>
## `dm.findPicSimMemEx(...)`
```js
dm.findPicSimMemEx(x1, y1, x2, y2, pictures, delta, similarity, direction)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRnJlZVBpYw"></a>
## `dm.FreePic(...)`
```js
dm.FreePic(pictures)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZnJlZVBpYw"></a>
## `dm.freePic(...)`
```js
dm.freePic(pictures)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0UGljU2l6ZQ"></a>
## `dm.GetPicSize(...)`
```js
dm.GetPicSize(pictures)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0UGljU2l6ZQ"></a>
## `dm.getPicSize(...)`
```js
dm.getPicSize(pictures)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0U2NyZWVuRGF0YQ"></a>
## `dm.GetScreenData(...)`
```js
dm.GetScreenData(x1, y1, x2, y2)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0U2NyZWVuRGF0YQ"></a>
## `dm.getScreenData(...)`
```js
dm.getScreenData(x1, y1, x2, y2)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0U2NyZWVuRGF0YUJtcA"></a>
## `dm.GetScreenDataBmp(...)`
```js
dm.GetScreenDataBmp(x1, y1, x2, y2, outBUFFER, outLENGTH)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0U2NyZWVuRGF0YUJtcA"></a>
## `dm.getScreenDataBmp(...)`
```js
dm.getScreenDataBmp(x1, y1, x2, y2)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uSW1hZ2VUb0JtcA"></a>
## `dm.ImageToBmp(...)`
```js
dm.ImageToBmp(input, output)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uaW1hZ2VUb0JtcA"></a>
## `dm.imageToBmp(...)`
```js
dm.imageToBmp(input, output)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uSXNEaXNwbGF5RGVhZA"></a>
## `dm.IsDisplayDead(...)`
```js
dm.IsDisplayDead(x1, y1, x2, y2, timeout)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uaXNEaXNwbGF5RGVhZA"></a>
## `dm.isDisplayDead(...)`
```js
dm.isDisplayDead(x1, y1, x2, y2, timeout)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uTG9hZFBpYw"></a>
## `dm.LoadPic(...)`
```js
dm.LoadPic(pictures)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ubG9hZFBpYw"></a>
## `dm.loadPic(...)`
```js
dm.loadPic(pictures)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uTG9hZFBpY0J5dGU"></a>
## `dm.LoadPicByte(...)`
```js
dm.LoadPicByte(data, length, pictures)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ubG9hZFBpY0J5dGU"></a>
## `dm.loadPicByte(...)`
```js
dm.loadPicByte(data, length, pictures)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uTWF0Y2hQaWNOYW1l"></a>
## `dm.MatchPicName(...)`
```js
dm.MatchPicName(pictures)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ubWF0Y2hQaWNOYW1l"></a>
## `dm.matchPicName(...)`
```js
dm.matchPicName(pictures)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

## 字库和文字识别

<a id="api-symbol-ZG0uQWRkRGljdA"></a>
## `dm.AddDict(...)`
```js
dm.AddDict(index, entry)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uYWRkRGljdA"></a>
## `dm.addDict(...)`
```js
dm.addDict(index, entry)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uQ2xlYXJEaWN0"></a>
## `dm.ClearDict(...)`
```js
dm.ClearDict(index)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uY2xlYXJEaWN0"></a>
## `dm.clearDict(...)`
```js
dm.clearDict(index)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRW5hYmxlU2hhcmVEaWN0"></a>
## `dm.EnableShareDict(...)`
```js
dm.EnableShareDict(enabled)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZW5hYmxlU2hhcmVEaWN0"></a>
## `dm.enableShareDict(...)`
```js
dm.enableShareDict(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmV0Y2hXb3Jk"></a>
## `dm.FetchWord(...)`
```js
dm.FetchWord(x1, y1, x2, y2, color, text)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmV0Y2hXb3Jk"></a>
## `dm.fetchWord(...)`
```js
dm.fetchWord(x1, y1, x2, y2, color, text)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0cg"></a>
## `dm.FindStr(...)`
```js
dm.FindStr(x1, y1, x2, y2, text, color, similarity, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0cg"></a>
## `dm.findStr(...)`
```js
dm.findStr(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckU"></a>
## `dm.FindStrE(...)`
```js
dm.FindStrE(x1, y1, x2, y2, text, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckU"></a>
## `dm.findStrE(...)`
```js
dm.findStrE(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckV4"></a>
## `dm.FindStrEx(...)`
```js
dm.FindStrEx(x1, y1, x2, y2, text, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckV4"></a>
## `dm.findStrEx(...)`
```js
dm.findStrEx(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckV4Uw"></a>
## `dm.FindStrExS(...)`
```js
dm.FindStrExS(x1, y1, x2, y2, text, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckV4Uw"></a>
## `dm.findStrExS(...)`
```js
dm.findStrExS(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckZhc3Q"></a>
## `dm.FindStrFast(...)`
```js
dm.FindStrFast(x1, y1, x2, y2, text, color, similarity, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckZhc3Q"></a>
## `dm.findStrFast(...)`
```js
dm.findStrFast(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckZhc3RF"></a>
## `dm.FindStrFastE(...)`
```js
dm.FindStrFastE(x1, y1, x2, y2, text, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RF"></a>
## `dm.findStrFastE(...)`
```js
dm.findStrFastE(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckZhc3RFeA"></a>
## `dm.FindStrFastEx(...)`
```js
dm.FindStrFastEx(x1, y1, x2, y2, text, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RFeA"></a>
## `dm.findStrFastEx(...)`
```js
dm.findStrFastEx(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckZhc3RFeFM"></a>
## `dm.FindStrFastExS(...)`
```js
dm.FindStrFastExS(x1, y1, x2, y2, text, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RFeFM"></a>
## `dm.findStrFastExS(...)`
```js
dm.findStrFastExS(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0ckZhc3RT"></a>
## `dm.FindStrFastS(...)`
```js
dm.FindStrFastS(x1, y1, x2, y2, text, color, similarity, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0ckZhc3RT"></a>
## `dm.findStrFastS(...)`
```js
dm.findStrFastS(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0clM"></a>
## `dm.FindStrS(...)`
```js
dm.FindStrS(x1, y1, x2, y2, text, color, similarity, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0clM"></a>
## `dm.findStrS(...)`
```js
dm.findStrS(x1, y1, x2, y2, text, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0cldpdGhGb250"></a>
## `dm.FindStrWithFont(...)`
```js
dm.FindStrWithFont(x1, y1, x2, y2, text, color, similarity, font, size, style, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0cldpdGhGb250"></a>
## `dm.findStrWithFont(...)`
```js
dm.findStrWithFont(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0cldpdGhGb250RQ"></a>
## `dm.FindStrWithFontE(...)`
```js
dm.FindStrWithFontE(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0cldpdGhGb250RQ"></a>
## `dm.findStrWithFontE(...)`
```js
dm.findStrWithFontE(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRmluZFN0cldpdGhGb250RXg"></a>
## `dm.FindStrWithFontEx(...)`
```js
dm.FindStrWithFontEx(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZmluZFN0cldpdGhGb250RXg"></a>
## `dm.findStrWithFontEx(...)`
```js
dm.findStrWithFontEx(x1, y1, x2, y2, text, color, similarity, font, size, style)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0RGljdA"></a>
## `dm.GetDict(...)`
```js
dm.GetDict(index, entry)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0RGljdA"></a>
## `dm.getDict(...)`
```js
dm.getDict(index, entry)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0RGljdENvdW50"></a>
## `dm.GetDictCount(...)`
```js
dm.GetDictCount(index)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0RGljdENvdW50"></a>
## `dm.getDictCount(...)`
```js
dm.getDictCount(index)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0RGljdEluZm8"></a>
## `dm.GetDictInfo(...)`
```js
dm.GetDictInfo(text, font, size, style)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0RGljdEluZm8"></a>
## `dm.getDictInfo(...)`
```js
dm.getDictInfo(text, font, size, style)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0Tm93RGljdA"></a>
## `dm.GetNowDict(...)`
```js
dm.GetNowDict()
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0Tm93RGljdA"></a>
## `dm.getNowDict(...)`
```js
dm.getNowDict()
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0UmVzdWx0Q291bnQ"></a>
## `dm.GetResultCount(...)`
```js
dm.GetResultCount(results)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0UmVzdWx0Q291bnQ"></a>
## `dm.getResultCount(...)`
```js
dm.getResultCount(results)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0UmVzdWx0UG9z"></a>
## `dm.GetResultPos(...)`
```js
dm.GetResultPos(results, index, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0UmVzdWx0UG9z"></a>
## `dm.getResultPos(...)`
```js
dm.getResultPos(results, index)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0V29yZFJlc3VsdENvdW50"></a>
## `dm.GetWordResultCount(...)`
```js
dm.GetWordResultCount(results)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0V29yZFJlc3VsdENvdW50"></a>
## `dm.getWordResultCount(...)`
```js
dm.getWordResultCount(results)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0V29yZFJlc3VsdFBvcw"></a>
## `dm.GetWordResultPos(...)`
```js
dm.GetWordResultPos(results, index, outX, outY)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0V29yZFJlc3VsdFBvcw"></a>
## `dm.getWordResultPos(...)`
```js
dm.getWordResultPos(results, index)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0V29yZFJlc3VsdFN0cg"></a>
## `dm.GetWordResultStr(...)`
```js
dm.GetWordResultStr(results, index)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0V29yZFJlc3VsdFN0cg"></a>
## `dm.getWordResultStr(...)`
```js
dm.getWordResultStr(results, index)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0V29yZHM"></a>
## `dm.GetWords(...)`
```js
dm.GetWords(x1, y1, x2, y2, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0V29yZHM"></a>
## `dm.getWords(...)`
```js
dm.getWords(x1, y1, x2, y2, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uR2V0V29yZHNOb0RpY3Q"></a>
## `dm.GetWordsNoDict(...)`
```js
dm.GetWordsNoDict(x1, y1, x2, y2, color)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZ2V0V29yZHNOb0RpY3Q"></a>
## `dm.getWordsNoDict(...)`
```js
dm.getWordsNoDict(x1, y1, x2, y2, color)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uT2Ny"></a>
## `dm.Ocr(...)`
```js
dm.Ocr(x1, y1, x2, y2, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ub2Ny"></a>
## `dm.ocr(...)`
```js
dm.ocr(x1, y1, x2, y2, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uT2NyRXg"></a>
## `dm.OcrEx(...)`
```js
dm.OcrEx(x1, y1, x2, y2, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ub2NyRXg"></a>
## `dm.ocrEx(...)`
```js
dm.ocrEx(x1, y1, x2, y2, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uT2NyRXhPbmU"></a>
## `dm.OcrExOne(...)`
```js
dm.OcrExOne(x1, y1, x2, y2, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ub2NyRXhPbmU"></a>
## `dm.ocrExOne(...)`
```js
dm.ocrExOne(x1, y1, x2, y2, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uT2NySW5GaWxl"></a>
## `dm.OcrInFile(...)`
```js
dm.OcrInFile(x1, y1, x2, y2, pictures, color, similarity)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0ub2NySW5GaWxl"></a>
## `dm.ocrInFile(...)`
```js
dm.ocrInFile(x1, y1, x2, y2, pictures, color, similarity)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2F2ZURpY3Q"></a>
## `dm.SaveDict(...)`
```js
dm.SaveDict(index, file)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2F2ZURpY3Q"></a>
## `dm.saveDict(...)`
```js
dm.saveDict(index, file)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uVXNlRGljdA"></a>
## `dm.UseDict(...)`
```js
dm.UseDict(index)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0udXNlRGljdA"></a>
## `dm.useDict(...)`
```js
dm.useDict(index)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0ub2NyQXV0bw"></a>
## `dm.ocrAuto(...)`
```js
dm.ocrAuto(options?)
```

调用已安装的 RapidOCR 原生引擎；它与公开字库 `Ocr` 使用不同的识别路径。

## 输入源、配置和扩展

<a id="api-symbol-ZG0uRW5hYmxlRGlzcGxheURlYnVn"></a>
## `dm.EnableDisplayDebug(...)`
```js
dm.EnableDisplayDebug(enabled)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZW5hYmxlRGlzcGxheURlYnVn"></a>
## `dm.enableDisplayDebug(...)`
```js
dm.enableDisplayDebug(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRW5hYmxlRmluZFBpY011bHRpdGhyZWFk"></a>
## `dm.EnableFindPicMultithread(...)`
```js
dm.EnableFindPicMultithread(enabled)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZW5hYmxlRmluZFBpY011bHRpdGhyZWFk"></a>
## `dm.enableFindPicMultithread(...)`
```js
dm.enableFindPicMultithread(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRW5hYmxlR2V0Q29sb3JCeUNhcHR1cmU"></a>
## `dm.EnableGetColorByCapture(...)`
```js
dm.EnableGetColorByCapture(enabled)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZW5hYmxlR2V0Q29sb3JCeUNhcHR1cmU"></a>
## `dm.enableGetColorByCapture(...)`
```js
dm.enableGetColorByCapture(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RXhjbHVkZVJlZ2lvbg"></a>
## `dm.SetExcludeRegion(...)`
```js
dm.SetExcludeRegion(mode, code)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RXhjbHVkZVJlZ2lvbg"></a>
## `dm.setExcludeRegion(...)`
```js
dm.setExcludeRegion(mode, code)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RmluZFBpY011bHRpdGhyZWFkQ291bnQ"></a>
## `dm.SetFindPicMultithreadCount(...)`
```js
dm.SetFindPicMultithreadCount(count)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RmluZFBpY011bHRpdGhyZWFkQ291bnQ"></a>
## `dm.setFindPicMultithreadCount(...)`
```js
dm.setFindPicMultithreadCount(count)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RmluZFBpY011bHRpdGhyZWFkTGltaXQ"></a>
## `dm.SetFindPicMultithreadLimit(...)`
```js
dm.SetFindPicMultithreadLimit(count)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RmluZFBpY011bHRpdGhyZWFkTGltaXQ"></a>
## `dm.setFindPicMultithreadLimit(...)`
```js
dm.setFindPicMultithreadLimit(count)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0UGljUHdk"></a>
## `dm.SetPicPwd(...)`
```js
dm.SetPicPwd(password)
```

保留兼容入口，但当前不解析加密图片、加密字库或密码资源；传入非空密码会报告不支持。

<a id="api-symbol-ZG0uc2V0UGljUHdk"></a>
## `dm.setPicPwd(...)`
```js
dm.setPicPwd(password)
```

保留兼容入口，但当前不解析加密图片、加密字库或密码资源；传入非空密码会报告不支持。

<a id="api-symbol-ZG0uU2V0Q29sR2FwTm9EaWN0"></a>
## `dm.SetColGapNoDict(...)`
```js
dm.SetColGapNoDict(gap)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0Q29sR2FwTm9EaWN0"></a>
## `dm.setColGapNoDict(...)`
```js
dm.setColGapNoDict(gap)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RGljdA"></a>
## `dm.SetDict(...)`
```js
dm.SetDict(index, file)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RGljdA"></a>
## `dm.setDict(...)`
```js
dm.setDict(index, file)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RGljdE1lbQ"></a>
## `dm.SetDictMem(...)`
```js
dm.SetDictMem(index, data, length)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RGljdE1lbQ"></a>
## `dm.setDictMem(...)`
```js
dm.setDictMem(index, data, length)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RGljdFB3ZA"></a>
## `dm.SetDictPwd(...)`
```js
dm.SetDictPwd(password)
```

保留兼容入口，但当前不解析加密图片、加密字库或密码资源；传入非空密码会报告不支持。

<a id="api-symbol-ZG0uc2V0RGljdFB3ZA"></a>
## `dm.setDictPwd(...)`
```js
dm.setDictPwd(password)
```

保留兼容入口，但当前不解析加密图片、加密字库或密码资源；传入非空密码会报告不支持。

<a id="api-symbol-ZG0uU2V0RXhhY3RPY3I"></a>
## `dm.SetExactOcr(...)`
```js
dm.SetExactOcr(enabled)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RXhhY3RPY3I"></a>
## `dm.setExactOcr(...)`
```js
dm.setExactOcr(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0TWluQ29sR2Fw"></a>
## `dm.SetMinColGap(...)`
```js
dm.SetMinColGap(gap)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0TWluQ29sR2Fw"></a>
## `dm.setMinColGap(...)`
```js
dm.setMinColGap(gap)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0TWluUm93R2Fw"></a>
## `dm.SetMinRowGap(...)`
```js
dm.SetMinRowGap(gap)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0TWluUm93R2Fw"></a>
## `dm.setMinRowGap(...)`
```js
dm.setMinRowGap(gap)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0Um93R2FwTm9EaWN0"></a>
## `dm.SetRowGapNoDict(...)`
```js
dm.SetRowGapNoDict(gap)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0Um93R2FwTm9EaWN0"></a>
## `dm.setRowGapNoDict(...)`
```js
dm.setRowGapNoDict(gap)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0V29yZEdhcA"></a>
## `dm.SetWordGap(...)`
```js
dm.SetWordGap(gap)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0V29yZEdhcA"></a>
## `dm.setWordGap(...)`
```js
dm.setWordGap(gap)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0V29yZEdhcE5vRGljdA"></a>
## `dm.SetWordGapNoDict(...)`
```js
dm.SetWordGapNoDict(gap)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0V29yZEdhcE5vRGljdA"></a>
## `dm.setWordGapNoDict(...)`
```js
dm.setWordGapNoDict(gap)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0V29yZExpbmVIZWlnaHQ"></a>
## `dm.SetWordLineHeight(...)`
```js
dm.SetWordLineHeight(height)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0V29yZExpbmVIZWlnaHQ"></a>
## `dm.setWordLineHeight(...)`
```js
dm.setWordLineHeight(height)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0V29yZExpbmVIZWlnaHROb0RpY3Q"></a>
## `dm.SetWordLineHeightNoDict(...)`
```js
dm.SetWordLineHeightNoDict(height)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0V29yZExpbmVIZWlnaHROb0RpY3Q"></a>
## `dm.setWordLineHeightNoDict(...)`
```js
dm.setWordLineHeightNoDict(height)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0UGF0aA"></a>
## `dm.SetPath(...)`
```js
dm.SetPath(path)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0UGF0aA"></a>
## `dm.setPath(...)`
```js
dm.setPath(path)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uU2V0RGlzcGxheUlucHV0"></a>
## `dm.SetDisplayInput(...)`
```js
dm.SetDisplayInput(source)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uc2V0RGlzcGxheUlucHV0"></a>
## `dm.setDisplayInput(...)`
```js
dm.setDisplayInput(source)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uRW5hYmxlUGljQ2FjaGU"></a>
## `dm.EnablePicCache(...)`
```js
dm.EnablePicCache(enabled)
```

PascalCase 兼容入口，保留大漠原始返回值和 E、Ex、S 结果约定。

<a id="api-symbol-ZG0uZW5hYmxlUGljQ2FjaGU"></a>
## `dm.enablePicCache(...)`
```js
dm.enablePicCache(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uY2FuY2Vs"></a>
## `dm.cancel(...)`
```js
dm.cancel()
```

取消当前长时间识别或匹配任务。

<a id="api-symbol-ZG0uY2xvc2U"></a>
## `dm.close(...)`
```js
dm.close()
```

释放当前脚本的图片、字库、缓冲区和 native 资源。

<a id="api-symbol-ZG0udXNlU2NyZWVu"></a>
## `dm.useScreen(...)`
```js
dm.useScreen()
```

切换回现有截图授权作为输入源。

<a id="api-symbol-ZG0ua2VlcFNjcmVlbg"></a>
## `dm.keepScreen(...)`
```js
dm.keepScreen(keep)
```

冻结或解除当前输入帧，适合在一次截图上执行多次识别。

<a id="api-symbol-ZG0uZ2V0RnJhbWVJbmZv"></a>
## `dm.getFrameInfo(...)`
```js
dm.getFrameInfo()
```

返回输入帧的旋转、裁剪和截图变换元数据。

<a id="api-symbol-ZG0uc2V0U2ltZEVuYWJsZWQ"></a>
## `dm.setSimdEnabled(...)`
```js
dm.setSimdEnabled(enabled)
```

camelCase 便捷入口，使用自然返回类型；单结果未匹配时返回 `null`，多结果接口返回数组。

<a id="api-symbol-ZG0uYnVmZmVy"></a>
## `dm.buffer(...)`
```js
dm.buffer(bytesOrDirectByteBuffer)
```

创建受 `Dm` 生命周期管理的缓冲区，替代裸地址；关闭后不能继续访问。

<a id="api-symbol-ZG0uZ2V0TGFzdEZpbmRUaW1pbmdz"></a>
## `dm.getLastFindTimings(...)`
```js
dm.getLastFindTimings()
```

返回最近一次找色、找图或找形状操作的截图、JNI 和 native 核心耗时。

<a id="api-symbol-ZG0uc2V0SW1hZ2U"></a>
## `dm.setImage(...)`
```js
dm.setImage(image)
```

将 `ImageWrapper`、Android `Bitmap` 或 `DmBuffer` 设为当前离线输入图像；显示缩放不会改变取样坐标。


<!-- api-member-contract id="dm.addDict" -->
`dm.addDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["addDict"]);
```

<!-- api-member-contract id="dm.AddDict" -->
`dm.AddDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["AddDict"]);
```

<!-- api-member-contract id="dm.appendPicAddr" -->
`dm.appendPicAddr` · Rhino 2.0 示例：
```js
console.log(typeof dm["appendPicAddr"]);
```

<!-- api-member-contract id="dm.AppendPicAddr" -->
`dm.AppendPicAddr` · Rhino 2.0 示例：
```js
console.log(typeof dm["AppendPicAddr"]);
```

<!-- api-member-contract id="dm.bgr2rgb" -->
`dm.bgr2rgb` · Rhino 2.0 示例：
```js
console.log(typeof dm["bgr2rgb"]);
```

<!-- api-member-contract id="dm.BGR2RGB" -->
`dm.BGR2RGB` · Rhino 2.0 示例：
```js
console.log(typeof dm["BGR2RGB"]);
```

<!-- api-member-contract id="dm.buffer" -->
`dm.buffer` · Rhino 2.0 示例：
```js
console.log(typeof dm["buffer"]);
```

<!-- api-member-contract id="dm.cancel" -->
`dm.cancel` · Rhino 2.0 示例：
```js
console.log(typeof dm["cancel"]);
```

<!-- api-member-contract id="dm.capture" -->
`dm.capture` · Rhino 2.0 示例：
```js
console.log(typeof dm["capture"]);
```

<!-- api-member-contract id="dm.Capture" -->
`dm.Capture` · Rhino 2.0 示例：
```js
console.log(typeof dm["Capture"]);
```

<!-- api-member-contract id="dm.captureGif" -->
`dm.captureGif` · Rhino 2.0 示例：
```js
console.log(typeof dm["captureGif"]);
```

<!-- api-member-contract id="dm.CaptureGif" -->
`dm.CaptureGif` · Rhino 2.0 示例：
```js
console.log(typeof dm["CaptureGif"]);
```

<!-- api-member-contract id="dm.captureJpg" -->
`dm.captureJpg` · Rhino 2.0 示例：
```js
console.log(typeof dm["captureJpg"]);
```

<!-- api-member-contract id="dm.CaptureJpg" -->
`dm.CaptureJpg` · Rhino 2.0 示例：
```js
console.log(typeof dm["CaptureJpg"]);
```

<!-- api-member-contract id="dm.capturePng" -->
`dm.capturePng` · Rhino 2.0 示例：
```js
console.log(typeof dm["capturePng"]);
```

<!-- api-member-contract id="dm.CapturePng" -->
`dm.CapturePng` · Rhino 2.0 示例：
```js
console.log(typeof dm["CapturePng"]);
```

<!-- api-member-contract id="dm.capturePre" -->
`dm.capturePre` · Rhino 2.0 示例：
```js
console.log(typeof dm["capturePre"]);
```

<!-- api-member-contract id="dm.CapturePre" -->
`dm.CapturePre` · Rhino 2.0 示例：
```js
console.log(typeof dm["CapturePre"]);
```

<!-- api-member-contract id="dm.clearDict" -->
`dm.clearDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["clearDict"]);
```

<!-- api-member-contract id="dm.ClearDict" -->
`dm.ClearDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["ClearDict"]);
```

<!-- api-member-contract id="dm.close" -->
`dm.close` · Rhino 2.0 示例：
```js
console.log(typeof dm["close"]);
```

<!-- api-member-contract id="dm.cmpColor" -->
`dm.cmpColor` · Rhino 2.0 示例：
```js
console.log(typeof dm["cmpColor"]);
```

<!-- api-member-contract id="dm.CmpColor" -->
`dm.CmpColor` · Rhino 2.0 示例：
```js
console.log(typeof dm["CmpColor"]);
```

<!-- api-member-contract id="dm.enableDisplayDebug" -->
`dm.enableDisplayDebug` · Rhino 2.0 示例：
```js
console.log(typeof dm["enableDisplayDebug"]);
```

<!-- api-member-contract id="dm.EnableDisplayDebug" -->
`dm.EnableDisplayDebug` · Rhino 2.0 示例：
```js
console.log(typeof dm["EnableDisplayDebug"]);
```

<!-- api-member-contract id="dm.enableFindPicMultithread" -->
`dm.enableFindPicMultithread` · Rhino 2.0 示例：
```js
console.log(typeof dm["enableFindPicMultithread"]);
```

<!-- api-member-contract id="dm.EnableFindPicMultithread" -->
`dm.EnableFindPicMultithread` · Rhino 2.0 示例：
```js
console.log(typeof dm["EnableFindPicMultithread"]);
```

<!-- api-member-contract id="dm.enableGetColorByCapture" -->
`dm.enableGetColorByCapture` · Rhino 2.0 示例：
```js
console.log(typeof dm["enableGetColorByCapture"]);
```

<!-- api-member-contract id="dm.EnableGetColorByCapture" -->
`dm.EnableGetColorByCapture` · Rhino 2.0 示例：
```js
console.log(typeof dm["EnableGetColorByCapture"]);
```

<!-- api-member-contract id="dm.enablePicCache" -->
`dm.enablePicCache` · Rhino 2.0 示例：
```js
console.log(typeof dm["enablePicCache"]);
```

<!-- api-member-contract id="dm.EnablePicCache" -->
`dm.EnablePicCache` · Rhino 2.0 示例：
```js
console.log(typeof dm["EnablePicCache"]);
```

<!-- api-member-contract id="dm.enableShareDict" -->
`dm.enableShareDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["enableShareDict"]);
```

<!-- api-member-contract id="dm.EnableShareDict" -->
`dm.EnableShareDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["EnableShareDict"]);
```

<!-- api-member-contract id="dm.fetchWord" -->
`dm.fetchWord` · Rhino 2.0 示例：
```js
console.log(typeof dm["fetchWord"]);
```

<!-- api-member-contract id="dm.FetchWord" -->
`dm.FetchWord` · Rhino 2.0 示例：
```js
console.log(typeof dm["FetchWord"]);
```

<!-- api-member-contract id="dm.findColor" -->
`dm.findColor` · Rhino 2.0 示例：
```js
console.log(typeof dm["findColor"]);
```

<!-- api-member-contract id="dm.FindColor" -->
`dm.FindColor` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindColor"]);
```

<!-- api-member-contract id="dm.findColorBlock" -->
`dm.findColorBlock` · Rhino 2.0 示例：
```js
console.log(typeof dm["findColorBlock"]);
```

<!-- api-member-contract id="dm.FindColorBlock" -->
`dm.FindColorBlock` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindColorBlock"]);
```

<!-- api-member-contract id="dm.findColorBlockEx" -->
`dm.findColorBlockEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["findColorBlockEx"]);
```

<!-- api-member-contract id="dm.FindColorBlockEx" -->
`dm.FindColorBlockEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindColorBlockEx"]);
```

<!-- api-member-contract id="dm.findColorE" -->
`dm.findColorE` · Rhino 2.0 示例：
```js
console.log(typeof dm["findColorE"]);
```

<!-- api-member-contract id="dm.FindColorE" -->
`dm.FindColorE` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindColorE"]);
```

<!-- api-member-contract id="dm.findColorEx" -->
`dm.findColorEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["findColorEx"]);
```

<!-- api-member-contract id="dm.FindColorEx" -->
`dm.FindColorEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindColorEx"]);
```

<!-- api-member-contract id="dm.findMulColor" -->
`dm.findMulColor` · Rhino 2.0 示例：
```js
console.log(typeof dm["findMulColor"]);
```

<!-- api-member-contract id="dm.FindMulColor" -->
`dm.FindMulColor` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindMulColor"]);
```

<!-- api-member-contract id="dm.findMultiColor" -->
`dm.findMultiColor` · Rhino 2.0 示例：
```js
console.log(typeof dm["findMultiColor"]);
```

<!-- api-member-contract id="dm.FindMultiColor" -->
`dm.FindMultiColor` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindMultiColor"]);
```

<!-- api-member-contract id="dm.findMultiColorE" -->
`dm.findMultiColorE` · Rhino 2.0 示例：
```js
console.log(typeof dm["findMultiColorE"]);
```

<!-- api-member-contract id="dm.FindMultiColorE" -->
`dm.FindMultiColorE` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindMultiColorE"]);
```

<!-- api-member-contract id="dm.findMultiColorEx" -->
`dm.findMultiColorEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["findMultiColorEx"]);
```

<!-- api-member-contract id="dm.FindMultiColorEx" -->
`dm.FindMultiColorEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindMultiColorEx"]);
```

<!-- api-member-contract id="dm.findPic" -->
`dm.findPic` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPic"]);
```

<!-- api-member-contract id="dm.FindPic" -->
`dm.FindPic` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPic"]);
```

<!-- api-member-contract id="dm.findPicE" -->
`dm.findPicE` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicE"]);
```

<!-- api-member-contract id="dm.FindPicE" -->
`dm.FindPicE` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicE"]);
```

<!-- api-member-contract id="dm.findPicEx" -->
`dm.findPicEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicEx"]);
```

<!-- api-member-contract id="dm.FindPicEx" -->
`dm.FindPicEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicEx"]);
```

<!-- api-member-contract id="dm.findPicExS" -->
`dm.findPicExS` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicExS"]);
```

<!-- api-member-contract id="dm.FindPicExS" -->
`dm.FindPicExS` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicExS"]);
```

<!-- api-member-contract id="dm.findPicMem" -->
`dm.findPicMem` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicMem"]);
```

<!-- api-member-contract id="dm.FindPicMem" -->
`dm.FindPicMem` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicMem"]);
```

<!-- api-member-contract id="dm.findPicMemE" -->
`dm.findPicMemE` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicMemE"]);
```

<!-- api-member-contract id="dm.FindPicMemE" -->
`dm.FindPicMemE` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicMemE"]);
```

<!-- api-member-contract id="dm.findPicMemEx" -->
`dm.findPicMemEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicMemEx"]);
```

<!-- api-member-contract id="dm.FindPicMemEx" -->
`dm.FindPicMemEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicMemEx"]);
```

<!-- api-member-contract id="dm.findPicS" -->
`dm.findPicS` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicS"]);
```

<!-- api-member-contract id="dm.FindPicS" -->
`dm.FindPicS` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicS"]);
```

<!-- api-member-contract id="dm.findPicSim" -->
`dm.findPicSim` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicSim"]);
```

<!-- api-member-contract id="dm.FindPicSim" -->
`dm.FindPicSim` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicSim"]);
```

<!-- api-member-contract id="dm.findPicSimE" -->
`dm.findPicSimE` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicSimE"]);
```

<!-- api-member-contract id="dm.FindPicSimE" -->
`dm.FindPicSimE` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicSimE"]);
```

<!-- api-member-contract id="dm.findPicSimEx" -->
`dm.findPicSimEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicSimEx"]);
```

<!-- api-member-contract id="dm.FindPicSimEx" -->
`dm.FindPicSimEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicSimEx"]);
```

<!-- api-member-contract id="dm.findPicSimMem" -->
`dm.findPicSimMem` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicSimMem"]);
```

<!-- api-member-contract id="dm.FindPicSimMem" -->
`dm.FindPicSimMem` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicSimMem"]);
```

<!-- api-member-contract id="dm.findPicSimMemE" -->
`dm.findPicSimMemE` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicSimMemE"]);
```

<!-- api-member-contract id="dm.FindPicSimMemE" -->
`dm.FindPicSimMemE` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicSimMemE"]);
```

<!-- api-member-contract id="dm.findPicSimMemEx" -->
`dm.findPicSimMemEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["findPicSimMemEx"]);
```

<!-- api-member-contract id="dm.FindPicSimMemEx" -->
`dm.FindPicSimMemEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindPicSimMemEx"]);
```

<!-- api-member-contract id="dm.findShape" -->
`dm.findShape` · Rhino 2.0 示例：
```js
console.log(typeof dm["findShape"]);
```

<!-- api-member-contract id="dm.FindShape" -->
`dm.FindShape` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindShape"]);
```

<!-- api-member-contract id="dm.findShapeE" -->
`dm.findShapeE` · Rhino 2.0 示例：
```js
console.log(typeof dm["findShapeE"]);
```

<!-- api-member-contract id="dm.FindShapeE" -->
`dm.FindShapeE` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindShapeE"]);
```

<!-- api-member-contract id="dm.findShapeEx" -->
`dm.findShapeEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["findShapeEx"]);
```

<!-- api-member-contract id="dm.FindShapeEx" -->
`dm.FindShapeEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindShapeEx"]);
```

<!-- api-member-contract id="dm.findStr" -->
`dm.findStr` · Rhino 2.0 示例：
```js
console.log(typeof dm["findStr"]);
```

<!-- api-member-contract id="dm.FindStr" -->
`dm.FindStr` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStr"]);
```

<!-- api-member-contract id="dm.findStrE" -->
`dm.findStrE` · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrE"]);
```

<!-- api-member-contract id="dm.FindStrE" -->
`dm.FindStrE` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrE"]);
```

<!-- api-member-contract id="dm.findStrEx" -->
`dm.findStrEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrEx"]);
```

<!-- api-member-contract id="dm.FindStrEx" -->
`dm.FindStrEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrEx"]);
```

<!-- api-member-contract id="dm.findStrExS" -->
`dm.findStrExS` · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrExS"]);
```

<!-- api-member-contract id="dm.FindStrExS" -->
`dm.FindStrExS` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrExS"]);
```

<!-- api-member-contract id="dm.findStrFast" -->
`dm.findStrFast` · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrFast"]);
```

<!-- api-member-contract id="dm.FindStrFast" -->
`dm.FindStrFast` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrFast"]);
```

<!-- api-member-contract id="dm.findStrFastE" -->
`dm.findStrFastE` · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrFastE"]);
```

<!-- api-member-contract id="dm.FindStrFastE" -->
`dm.FindStrFastE` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrFastE"]);
```

<!-- api-member-contract id="dm.findStrFastEx" -->
`dm.findStrFastEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrFastEx"]);
```

<!-- api-member-contract id="dm.FindStrFastEx" -->
`dm.FindStrFastEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrFastEx"]);
```

<!-- api-member-contract id="dm.findStrFastExS" -->
`dm.findStrFastExS` · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrFastExS"]);
```

<!-- api-member-contract id="dm.FindStrFastExS" -->
`dm.FindStrFastExS` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrFastExS"]);
```

<!-- api-member-contract id="dm.findStrFastS" -->
`dm.findStrFastS` · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrFastS"]);
```

<!-- api-member-contract id="dm.FindStrFastS" -->
`dm.FindStrFastS` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrFastS"]);
```

<!-- api-member-contract id="dm.findStrS" -->
`dm.findStrS` · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrS"]);
```

<!-- api-member-contract id="dm.FindStrS" -->
`dm.FindStrS` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrS"]);
```

<!-- api-member-contract id="dm.findStrWithFont" -->
`dm.findStrWithFont` · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrWithFont"]);
```

<!-- api-member-contract id="dm.FindStrWithFont" -->
`dm.FindStrWithFont` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrWithFont"]);
```

<!-- api-member-contract id="dm.findStrWithFontE" -->
`dm.findStrWithFontE` · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrWithFontE"]);
```

<!-- api-member-contract id="dm.FindStrWithFontE" -->
`dm.FindStrWithFontE` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrWithFontE"]);
```

<!-- api-member-contract id="dm.findStrWithFontEx" -->
`dm.findStrWithFontEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["findStrWithFontEx"]);
```

<!-- api-member-contract id="dm.FindStrWithFontEx" -->
`dm.FindStrWithFontEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["FindStrWithFontEx"]);
```

<!-- api-member-contract id="dm.freePic" -->
`dm.freePic` · Rhino 2.0 示例：
```js
console.log(typeof dm["freePic"]);
```

<!-- api-member-contract id="dm.FreePic" -->
`dm.FreePic` · Rhino 2.0 示例：
```js
console.log(typeof dm["FreePic"]);
```

<!-- api-member-contract id="dm.getAveHSV" -->
`dm.getAveHSV` · Rhino 2.0 示例：
```js
console.log(typeof dm["getAveHSV"]);
```

<!-- api-member-contract id="dm.GetAveHSV" -->
`dm.GetAveHSV` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetAveHSV"]);
```

<!-- api-member-contract id="dm.getAveRGB" -->
`dm.getAveRGB` · Rhino 2.0 示例：
```js
console.log(typeof dm["getAveRGB"]);
```

<!-- api-member-contract id="dm.GetAveRGB" -->
`dm.GetAveRGB` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetAveRGB"]);
```

<!-- api-member-contract id="dm.getColor" -->
`dm.getColor` · Rhino 2.0 示例：
```js
console.log(typeof dm["getColor"]);
```

<!-- api-member-contract id="dm.GetColor" -->
`dm.GetColor` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetColor"]);
```

<!-- api-member-contract id="dm.getColorBGR" -->
`dm.getColorBGR` · Rhino 2.0 示例：
```js
console.log(typeof dm["getColorBGR"]);
```

<!-- api-member-contract id="dm.GetColorBGR" -->
`dm.GetColorBGR` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetColorBGR"]);
```

<!-- api-member-contract id="dm.getColorHSV" -->
`dm.getColorHSV` · Rhino 2.0 示例：
```js
console.log(typeof dm["getColorHSV"]);
```

<!-- api-member-contract id="dm.GetColorHSV" -->
`dm.GetColorHSV` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetColorHSV"]);
```

<!-- api-member-contract id="dm.getColorNum" -->
`dm.getColorNum` · Rhino 2.0 示例：
```js
console.log(typeof dm["getColorNum"]);
```

<!-- api-member-contract id="dm.GetColorNum" -->
`dm.GetColorNum` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetColorNum"]);
```

<!-- api-member-contract id="dm.getDict" -->
`dm.getDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["getDict"]);
```

<!-- api-member-contract id="dm.GetDict" -->
`dm.GetDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetDict"]);
```

<!-- api-member-contract id="dm.getDictCount" -->
`dm.getDictCount` · Rhino 2.0 示例：
```js
console.log(typeof dm["getDictCount"]);
```

<!-- api-member-contract id="dm.GetDictCount" -->
`dm.GetDictCount` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetDictCount"]);
```

<!-- api-member-contract id="dm.getDictInfo" -->
`dm.getDictInfo` · Rhino 2.0 示例：
```js
console.log(typeof dm["getDictInfo"]);
```

<!-- api-member-contract id="dm.GetDictInfo" -->
`dm.GetDictInfo` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetDictInfo"]);
```

<!-- api-member-contract id="dm.getFrameInfo" -->
`dm.getFrameInfo` · Rhino 2.0 示例：
```js
console.log(typeof dm["getFrameInfo"]);
```

<!-- api-member-contract id="dm.getLastFindTimings" -->
`dm.getLastFindTimings` · Rhino 2.0 示例：
```js
console.log(typeof dm["getLastFindTimings"]);
```

<!-- api-member-contract id="dm.getNowDict" -->
`dm.getNowDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["getNowDict"]);
```

<!-- api-member-contract id="dm.GetNowDict" -->
`dm.GetNowDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetNowDict"]);
```

<!-- api-member-contract id="dm.getPicSize" -->
`dm.getPicSize` · Rhino 2.0 示例：
```js
console.log(typeof dm["getPicSize"]);
```

<!-- api-member-contract id="dm.GetPicSize" -->
`dm.GetPicSize` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetPicSize"]);
```

<!-- api-member-contract id="dm.getResultCount" -->
`dm.getResultCount` · Rhino 2.0 示例：
```js
console.log(typeof dm["getResultCount"]);
```

<!-- api-member-contract id="dm.GetResultCount" -->
`dm.GetResultCount` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetResultCount"]);
```

<!-- api-member-contract id="dm.getResultPos" -->
`dm.getResultPos` · Rhino 2.0 示例：
```js
console.log(typeof dm["getResultPos"]);
```

<!-- api-member-contract id="dm.GetResultPos" -->
`dm.GetResultPos` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetResultPos"]);
```

<!-- api-member-contract id="dm.getScreenData" -->
`dm.getScreenData` · Rhino 2.0 示例：
```js
console.log(typeof dm["getScreenData"]);
```

<!-- api-member-contract id="dm.GetScreenData" -->
`dm.GetScreenData` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetScreenData"]);
```

<!-- api-member-contract id="dm.getScreenDataBmp" -->
`dm.getScreenDataBmp` · Rhino 2.0 示例：
```js
console.log(typeof dm["getScreenDataBmp"]);
```

<!-- api-member-contract id="dm.GetScreenDataBmp" -->
`dm.GetScreenDataBmp` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetScreenDataBmp"]);
```

<!-- api-member-contract id="dm.getWordResultCount" -->
`dm.getWordResultCount` · Rhino 2.0 示例：
```js
console.log(typeof dm["getWordResultCount"]);
```

<!-- api-member-contract id="dm.GetWordResultCount" -->
`dm.GetWordResultCount` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetWordResultCount"]);
```

<!-- api-member-contract id="dm.getWordResultPos" -->
`dm.getWordResultPos` · Rhino 2.0 示例：
```js
console.log(typeof dm["getWordResultPos"]);
```

<!-- api-member-contract id="dm.GetWordResultPos" -->
`dm.GetWordResultPos` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetWordResultPos"]);
```

<!-- api-member-contract id="dm.getWordResultStr" -->
`dm.getWordResultStr` · Rhino 2.0 示例：
```js
console.log(typeof dm["getWordResultStr"]);
```

<!-- api-member-contract id="dm.GetWordResultStr" -->
`dm.GetWordResultStr` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetWordResultStr"]);
```

<!-- api-member-contract id="dm.getWords" -->
`dm.getWords` · Rhino 2.0 示例：
```js
console.log(typeof dm["getWords"]);
```

<!-- api-member-contract id="dm.GetWords" -->
`dm.GetWords` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetWords"]);
```

<!-- api-member-contract id="dm.getWordsNoDict" -->
`dm.getWordsNoDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["getWordsNoDict"]);
```

<!-- api-member-contract id="dm.GetWordsNoDict" -->
`dm.GetWordsNoDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["GetWordsNoDict"]);
```

<!-- api-member-contract id="dm.imageToBmp" -->
`dm.imageToBmp` · Rhino 2.0 示例：
```js
console.log(typeof dm["imageToBmp"]);
```

<!-- api-member-contract id="dm.ImageToBmp" -->
`dm.ImageToBmp` · Rhino 2.0 示例：
```js
console.log(typeof dm["ImageToBmp"]);
```

<!-- api-member-contract id="dm.isDisplayDead" -->
`dm.isDisplayDead` · Rhino 2.0 示例：
```js
console.log(typeof dm["isDisplayDead"]);
```

<!-- api-member-contract id="dm.IsDisplayDead" -->
`dm.IsDisplayDead` · Rhino 2.0 示例：
```js
console.log(typeof dm["IsDisplayDead"]);
```

<!-- api-member-contract id="dm.keepScreen" -->
`dm.keepScreen` · Rhino 2.0 示例：
```js
console.log(typeof dm["keepScreen"]);
```

<!-- api-member-contract id="dm.loadPic" -->
`dm.loadPic` · Rhino 2.0 示例：
```js
console.log(typeof dm["loadPic"]);
```

<!-- api-member-contract id="dm.LoadPic" -->
`dm.LoadPic` · Rhino 2.0 示例：
```js
console.log(typeof dm["LoadPic"]);
```

<!-- api-member-contract id="dm.loadPicByte" -->
`dm.loadPicByte` · Rhino 2.0 示例：
```js
console.log(typeof dm["loadPicByte"]);
```

<!-- api-member-contract id="dm.LoadPicByte" -->
`dm.LoadPicByte` · Rhino 2.0 示例：
```js
console.log(typeof dm["LoadPicByte"]);
```

<!-- api-member-contract id="dm.matchPicName" -->
`dm.matchPicName` · Rhino 2.0 示例：
```js
console.log(typeof dm["matchPicName"]);
```

<!-- api-member-contract id="dm.MatchPicName" -->
`dm.MatchPicName` · Rhino 2.0 示例：
```js
console.log(typeof dm["MatchPicName"]);
```

<!-- api-member-contract id="dm.ocr" -->
`dm.ocr` · Rhino 2.0 示例：
```js
console.log(typeof dm["ocr"]);
```

<!-- api-member-contract id="dm.Ocr" -->
`dm.Ocr` · Rhino 2.0 示例：
```js
console.log(typeof dm["Ocr"]);
```

<!-- api-member-contract id="dm.ocrAuto" -->
`dm.ocrAuto` · Rhino 2.0 示例：
```js
console.log(typeof dm["ocrAuto"]);
```

<!-- api-member-contract id="dm.ocrEx" -->
`dm.ocrEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["ocrEx"]);
```

<!-- api-member-contract id="dm.OcrEx" -->
`dm.OcrEx` · Rhino 2.0 示例：
```js
console.log(typeof dm["OcrEx"]);
```

<!-- api-member-contract id="dm.ocrExOne" -->
`dm.ocrExOne` · Rhino 2.0 示例：
```js
console.log(typeof dm["ocrExOne"]);
```

<!-- api-member-contract id="dm.OcrExOne" -->
`dm.OcrExOne` · Rhino 2.0 示例：
```js
console.log(typeof dm["OcrExOne"]);
```

<!-- api-member-contract id="dm.ocrInFile" -->
`dm.ocrInFile` · Rhino 2.0 示例：
```js
console.log(typeof dm["ocrInFile"]);
```

<!-- api-member-contract id="dm.OcrInFile" -->
`dm.OcrInFile` · Rhino 2.0 示例：
```js
console.log(typeof dm["OcrInFile"]);
```

<!-- api-member-contract id="dm.rgb2bgr" -->
`dm.rgb2bgr` · Rhino 2.0 示例：
```js
console.log(typeof dm["rgb2bgr"]);
```

<!-- api-member-contract id="dm.RGB2BGR" -->
`dm.RGB2BGR` · Rhino 2.0 示例：
```js
console.log(typeof dm["RGB2BGR"]);
```

<!-- api-member-contract id="dm.saveDict" -->
`dm.saveDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["saveDict"]);
```

<!-- api-member-contract id="dm.SaveDict" -->
`dm.SaveDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["SaveDict"]);
```

<!-- api-member-contract id="dm.setColGapNoDict" -->
`dm.setColGapNoDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["setColGapNoDict"]);
```

<!-- api-member-contract id="dm.SetColGapNoDict" -->
`dm.SetColGapNoDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetColGapNoDict"]);
```

<!-- api-member-contract id="dm.setDict" -->
`dm.setDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["setDict"]);
```

<!-- api-member-contract id="dm.SetDict" -->
`dm.SetDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetDict"]);
```

<!-- api-member-contract id="dm.setDictMem" -->
`dm.setDictMem` · Rhino 2.0 示例：
```js
console.log(typeof dm["setDictMem"]);
```

<!-- api-member-contract id="dm.SetDictMem" -->
`dm.SetDictMem` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetDictMem"]);
```

<!-- api-member-contract id="dm.setDictPwd" -->
`dm.setDictPwd` · Rhino 2.0 示例：
```js
console.log(typeof dm["setDictPwd"]);
```

<!-- api-member-contract id="dm.SetDictPwd" -->
`dm.SetDictPwd` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetDictPwd"]);
```

<!-- api-member-contract id="dm.setDisplayInput" -->
`dm.setDisplayInput` · Rhino 2.0 示例：
```js
console.log(typeof dm["setDisplayInput"]);
```

<!-- api-member-contract id="dm.SetDisplayInput" -->
`dm.SetDisplayInput` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetDisplayInput"]);
```

<!-- api-member-contract id="dm.setExactOcr" -->
`dm.setExactOcr` · Rhino 2.0 示例：
```js
console.log(typeof dm["setExactOcr"]);
```

<!-- api-member-contract id="dm.SetExactOcr" -->
`dm.SetExactOcr` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetExactOcr"]);
```

<!-- api-member-contract id="dm.setExcludeRegion" -->
`dm.setExcludeRegion` · Rhino 2.0 示例：
```js
console.log(typeof dm["setExcludeRegion"]);
```

<!-- api-member-contract id="dm.SetExcludeRegion" -->
`dm.SetExcludeRegion` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetExcludeRegion"]);
```

<!-- api-member-contract id="dm.setFindPicMultithreadCount" -->
`dm.setFindPicMultithreadCount` · Rhino 2.0 示例：
```js
console.log(typeof dm["setFindPicMultithreadCount"]);
```

<!-- api-member-contract id="dm.SetFindPicMultithreadCount" -->
`dm.SetFindPicMultithreadCount` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetFindPicMultithreadCount"]);
```

<!-- api-member-contract id="dm.setFindPicMultithreadLimit" -->
`dm.setFindPicMultithreadLimit` · Rhino 2.0 示例：
```js
console.log(typeof dm["setFindPicMultithreadLimit"]);
```

<!-- api-member-contract id="dm.SetFindPicMultithreadLimit" -->
`dm.SetFindPicMultithreadLimit` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetFindPicMultithreadLimit"]);
```

<!-- api-member-contract id="dm.setImage" -->
`dm.setImage` · Rhino 2.0 示例：
```js
console.log(typeof dm["setImage"]);
```

<!-- api-member-contract id="dm.setMinColGap" -->
`dm.setMinColGap` · Rhino 2.0 示例：
```js
console.log(typeof dm["setMinColGap"]);
```

<!-- api-member-contract id="dm.SetMinColGap" -->
`dm.SetMinColGap` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetMinColGap"]);
```

<!-- api-member-contract id="dm.setMinRowGap" -->
`dm.setMinRowGap` · Rhino 2.0 示例：
```js
console.log(typeof dm["setMinRowGap"]);
```

<!-- api-member-contract id="dm.SetMinRowGap" -->
`dm.SetMinRowGap` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetMinRowGap"]);
```

<!-- api-member-contract id="dm.setPath" -->
`dm.setPath` · Rhino 2.0 示例：
```js
console.log(typeof dm["setPath"]);
```

<!-- api-member-contract id="dm.SetPath" -->
`dm.SetPath` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetPath"]);
```

<!-- api-member-contract id="dm.setPicPwd" -->
`dm.setPicPwd` · Rhino 2.0 示例：
```js
console.log(typeof dm["setPicPwd"]);
```

<!-- api-member-contract id="dm.SetPicPwd" -->
`dm.SetPicPwd` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetPicPwd"]);
```

<!-- api-member-contract id="dm.setRowGapNoDict" -->
`dm.setRowGapNoDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["setRowGapNoDict"]);
```

<!-- api-member-contract id="dm.SetRowGapNoDict" -->
`dm.SetRowGapNoDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetRowGapNoDict"]);
```

<!-- api-member-contract id="dm.setSimdEnabled" -->
`dm.setSimdEnabled` · Rhino 2.0 示例：
```js
console.log(typeof dm["setSimdEnabled"]);
```

<!-- api-member-contract id="dm.setWordGap" -->
`dm.setWordGap` · Rhino 2.0 示例：
```js
console.log(typeof dm["setWordGap"]);
```

<!-- api-member-contract id="dm.SetWordGap" -->
`dm.SetWordGap` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetWordGap"]);
```

<!-- api-member-contract id="dm.setWordGapNoDict" -->
`dm.setWordGapNoDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["setWordGapNoDict"]);
```

<!-- api-member-contract id="dm.SetWordGapNoDict" -->
`dm.SetWordGapNoDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetWordGapNoDict"]);
```

<!-- api-member-contract id="dm.setWordLineHeight" -->
`dm.setWordLineHeight` · Rhino 2.0 示例：
```js
console.log(typeof dm["setWordLineHeight"]);
```

<!-- api-member-contract id="dm.SetWordLineHeight" -->
`dm.SetWordLineHeight` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetWordLineHeight"]);
```

<!-- api-member-contract id="dm.setWordLineHeightNoDict" -->
`dm.setWordLineHeightNoDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["setWordLineHeightNoDict"]);
```

<!-- api-member-contract id="dm.SetWordLineHeightNoDict" -->
`dm.SetWordLineHeightNoDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["SetWordLineHeightNoDict"]);
```

<!-- api-member-contract id="dm.useDict" -->
`dm.useDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["useDict"]);
```

<!-- api-member-contract id="dm.UseDict" -->
`dm.UseDict` · Rhino 2.0 示例：
```js
console.log(typeof dm["UseDict"]);
```

<!-- api-member-contract id="dm.useScreen" -->
`dm.useScreen` · Rhino 2.0 示例：
```js
console.log(typeof dm["useScreen"]);
```

<!-- api-member-contract id="module:dm" -->
`module:dm` · Rhino 2.0 示例：
```js
console.log(typeof dm);
```
