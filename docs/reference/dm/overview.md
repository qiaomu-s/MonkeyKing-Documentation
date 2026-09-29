# dm 图色与文字识别

`dm` 已纳入 Monkey King 正式 API 清单。完整的模块、兼容接口和 camelCase 便捷接口请参阅 [dm 图色与文字识别 API](../../api/media/dm.md)；本组页面继续提供字库格式、制作流程、兼容约定和 VS Code 工具教程。

Monkey King 的 `dm` 是独立的脚本级对象，提供大漠风格的图色、找图、公开明文字库和字库识别接口。每个脚本拥有自己的图片缓存、输入源、字库槽位和识别配置；脚本结束后由运行时释放。

## 三层职责

- **字库工具**：VS Code 字库编辑器和截图工作台负责取色、分割、点阵编辑和第二张图片验证。
- **字库文件**：公开明文格式为 `HEX$文字$指标$高度`，由 `setDict`、`setDictMem`、`addDict`、`saveDict` 管理。
- **识别引擎**：设备端执行二值化、点阵匹配和坐标排序；`ocr` 不会自动切换到通用 OCR。

常用流程：

```js
dm.setDisplayInput('screen');
dm.setDict(0, './assets/dm/main.dm.txt');
dm.useDict(0);
const text = dm.ocr(0, 0, device.width - 1, device.height - 1, 'ffffff', 0.9);
```

坐标属于输入图像。截图发生旋转、裁剪或缩放时，应使用快照中的变换元数据换算点击坐标，不能把编辑器显示坐标直接当作设备坐标。

本模块不提供加密、解密、密码设置或私有加密图片/字库解析。无法解析的文件会报告格式错误。
