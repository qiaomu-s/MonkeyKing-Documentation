# dm 图色与文字识别

`dm` 是 Monkey King 的 Android 脚本级对象，提供取色、偏色、多点找色、找图、截图、点阵 OCR、免字库识别和通用 OCR。完整 API 请参阅 [dm 图色与文字识别 API](../../api/media/dm.md)。

每个脚本实例独立维护输入源、图片缓存、冻结帧、字库槽位和识别参数。脚本结束或显式调用 `dm.close()` 后，相关资源才会释放。

## 输入源

- **屏幕**：默认使用实时屏幕帧；`dm.useScreen()` 可恢复屏幕输入。
- **离线图片**：使用 `dm.setDisplayInput('pic:文件名')` 或 `dm.ocrInFile()`。
- **冻结帧**：`dm.keepScreen(true)` 后重复调用使用同一帧，完成后恢复 `false`。
- **内存数据**：使用 `DmBuffer`、`byte[]` 或直接 ByteBuffer；不接受裸地址。

坐标属于输入图像像素，矩形右下角为包含边界。屏幕发生旋转、裁剪或缩放时，应依据帧元数据换算坐标，不能直接使用编辑器显示坐标。

## 返回值

查找接口不再使用 PC 的 `intX/intY` 输出指针：

- 单结果：`DmMatch | null`；
- 多结果：`DmMatch[]`，未命中为空数组；
- `DmMatch` 字段：`value`、`x`、`y`、`width`、`height`；
- OCR：`string` 或结构化 `DmMatch[]`；
- `ocrAuto`：包含文字、置信度和四边形点的 block 数组。

## 常用流程

```js
dm.setDisplayInput('screen')
dm.setPath('./assets/dm')
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)

const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const hit = dm.findColor(
  x1, y1, x2, y2,
  '123456-000000|aabbcc-030303|ddeeff-202020',
  1.0,
  0,
)
if (hit) console.log(hit.x, hit.y)
dm.close()
```

本模块不提供 PC 私有加密图片、加密字库、密码设置、窗口句柄、裸指针或输出指针接口。无法解析的资源应按错误信息处理，不能把密文当作明文资源继续使用。
