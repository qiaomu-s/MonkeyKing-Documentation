# dm 图色与找图

> 预览状态：仅适用于已提供 `dm` 全局对象的授权构建。

图色接口在输入图像上工作。输入可以是屏幕、离线图片或冻结帧：

```js
dm.SetDisplayInput('pic:./assets/images/login.png');
dm.EnablePicCache(1);
const point = dm.findColor(0, 0, 1079, 1919, 'ffffff', 0.9, 0);
if (point) console.log(point.x, point.y);
```

兼容接口保留 PascalCase、返回值和输出参数：

```js
const x = { value: -1 };
const y = { value: -1 };
const found = dm.FindColor(0, 0, 1079, 1919, 'ffffff', 0.9, 0, x, y);
```

`findColor`、`findMultiColor`、颜色块检测和找图都遵守区域边界与扫描方向。`Sim` 使用百分比相似度；默认保留完整像素检查，避免用抽样换取速度。透明模板会使用透明掩码，多结果按所选扫描方向返回。

一次截图多次识别时可使用 `keepScreen(true)`，结束后调用 `keepScreen(false)`。图片缓存由 `EnablePicCache` 控制，资源生命周期由 `DmBuffer.close()` 管理。
