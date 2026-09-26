# dm 字库文字识别

> 运行条件：本页适用于提供 `dm` 全局对象的 Monkey King 6.7.0 构建。

`Ocr` 使用当前字库识别区域内文字：

```js
dm.SetDict(0, './assets/dm/main.dm.txt');
dm.UseDict(0);
const value = dm.Ocr(0, 0, 1079, 1919, 'ffffff', 0.9);
```

`FindStr` 先识别区域，再搜索目标文字；`FindStrFast` 针对目标字符搜索，适合已知目标且需要低延迟的场景：

```js
const hit = dm.findStrFast(0, 0, 1079, 1919, '确定', 'ffffff', 0.9);
if (hit) console.log(hit.value, hit.x, hit.y);
```

`GetWordsNoDict` 只做前景分割，不依赖字库。行高、字间距和分割间距会影响文字分组，必须在第二张图片上复测。工作台会分别显示文字、命中框、耗时和未识别前景区域。

字体、字号、抗锯齿、缩放比例和设备密度变化都会改变点阵。Android 字体生成的模板应在目标设备截图上制作或验证。
