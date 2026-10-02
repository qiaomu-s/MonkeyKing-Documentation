# DM Java / JS 示例

> 运行条件：提供 `dm` 全局对象的 Monkey King 构建。每个代码块独立运行于普通工作脚本；UI 脚本请使用工作线程。

屏幕示例先申请截图权限，并以当前截图尺寸计算区域。图片模板、明文字库和待识别截图需要自行准备；示例数值用于说明流程，请按目标画面调整。示例仅输出结果，不执行点击或鼠标移动。

`DmMatch` / `DmMatch[]` 已完成 Android 返回值适配，不需要拆分 PC 结果字符串。脚本中全部 DM 工作结束后才调用 `dm.close()`；关闭或取消后不可复用。

## 形状：九点关系与首个命中

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 按目标截图采样后替换形状：偏移相对于返回的基准点，不是绝对坐标。
  // e=1 要求颜色与基准点相似，e=0 要求不相似；不是前景/背景颜色编号。
  const shape = '1|1|0,1|6|1,0|10|1,9|10|1,7|6|1,7|8|0,8|9|0,2|2|1,3|1|1'
  const similarity = 1.0
  const direction = 0 // 从左到右，从上到下
  const match = dm.findShape(x1, y1, x2, y2, shape, similarity, direction)
  if (match !== null) {
    console.log('形状', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

## 形状：遍历全部命中

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 按目标截图采样后替换形状：偏移相对于返回的基准点，不是绝对坐标。
  // e=1 要求颜色与基准点相似，e=0 要求不相似；不是前景/背景颜色编号。
  const shape = '1|1|0,1|6|1,0|10|1,9|10|1,7|6|1,7|8|0,8|9|0,2|2|1,3|1|1'
  const similarity = 1.0
  const direction = 1 // 从左到右，从下到上
  const matches = dm.findShapeEx(x1, y1, x2, y2, shape, similarity, direction)
  if (matches.length === 0) console.log('未命中')
  for (const match of matches) {
    console.log('形状', match.value, '坐标', match.x, match.y)
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

## 图色：多颜色与反色

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // RGB 顺序；每个候选可有独立偏色。
  const color = '123456-000000|aabbcc-030303|ddeeff-202020'
  const match = dm.findColor(x1, y1, x2, y2, color, 1.0, 0)
  if (match !== null) {
    console.log('结果值', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
  // 反色是排除整个候选集合，不是逐通道取补色。
  // 反色可能命中几乎所有像素，因此这里只搜索最多 64×64 的小区域。
  const inverse = dm.findColor(x1, y1, Math.min(x2, 63), Math.min(y2, 63), '@123456-000000|333333-101010', 1.0, 0)
  console.log(inverse === null ? '没有反色命中' : inverse)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

## 图色：正负偏移与多点条件

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  const color = 'cc805b-020202|606060-010101'
  // 正负偏移、多候选和偏移反色可以组合；所有点都必须满足。
  const offsets = '9|2|-00ff00|-ff0000,15|2|2dff1c-010101,-6|11|a0d962|aabbcc,11|-4|-ffffff'
  const match = dm.findMultiColor(x1, y1, x2, y2, color, offsets, 1.0, 1)
  if (match !== null) {
    console.log('首点', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

## 找图：多模板与命中编号

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备 button.png 和 cancel.png 两张模板。
  dm.setPath(files.path('./assets/dm'))
  const pictures = 'button.png|cancel.png'
  try {
    dm.loadPic(pictures)
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 普通相似度范围 0.1–1.0。
    const matches = dm.findPicEx(x1, y1, x2, y2, pictures, delta, 0.9, 0)
    if (matches.length === 0) console.log('未命中')
    for (const match of matches) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    dm.freePic(pictures)
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

## 找图：内存模板与异常释放

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备两张模板；即使第二张加载或查找失败，也释放已创建的缓冲区。
  const templates = []
  try {
    templates.push(dm.buffer(files.readBytes('./assets/dm/button.png')))
    templates.push(dm.buffer(files.readBytes('./assets/dm/cancel.png')))
    // RGB 偏色；灰度匹配时可改为两位 '20'。
    const delta = '202020'
    // 普通相似度范围 0.1–1.0。
    const match = dm.findPicMem(x1, y1, x2, y2, templates, delta, 0.9, 0)
    if (match !== null) {
      console.log('模板编号', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
    // value 是 templates/pictures 中从 0 开始的模板编号。
  } finally {
    for (const template of templates) template.close()
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

## OCR：颜色模式与行分隔符

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 各模式用于不同截图/字库场景；按实际字库采样颜色选择，不要求结果相同。
  const formats = [
    ['RGB 单色', '9f2e3f-000000'],
    ['RGB 偏色', '9f2e3f-030303'],
    ['RGB 多色', '9f2e3f-030303|2d3f2f-000000|3f9e4d-100000'],
    ['HSV 多色', '20.30.40-0.0.0|30.40.50-0.0.0'],
    ['灰度多色', '#40-0|#70-10'],
    ['背景色', 'b@ffffff-000000'],
  ]
  for (const item of formats) {
    const text = dm.ocr(x1, y1, x2, y2, item[1], 1.0)
    console.log(item[0], text || '未识别到文字')
  }
  // 逗号后是行分隔字符串，不是另一种颜色。
  const pipeLines = dm.ocr(x1, y1, x2, y2, '9f2e3f-000000,|', 1.0)
  const newLines = dm.ocr(x1, y1, x2, y2, '9f2e3f-000000,' + '\n', 1.0)
  console.log(pipeLines, newLines)
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

## 文字：候选查找

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 先准备与目标字体、字号和颜色匹配的明文字库。
  dm.setDict(0, files.path('./assets/dm/main.dm.txt'))
  dm.useDict(0)
  // 先演示单个候选；Ex 变体即使只传一个候选也返回数组。
  const single = dm.findStrFast(x1, y1, x2, y2, '确定', 'ffffff-202020', 1.0)
  console.log(single === null ? '未命中单个候选' : single)
  const candidates = '确定|取消'
  const color = 'ffffff-202020|eeeeee-101010'
  // 多候选用竖线分隔，不代表跨行拼接。
  const match = dm.findStrFast(x1, y1, x2, y2, candidates, color, 0.9)
  if (match !== null) {
    console.log('候选文字编号', match.value, '坐标', match.x, match.y)
  } else {
    console.log('未命中')
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

## 免字库：词组与包围框

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 免字库模式按图像分组，不保证 value 为识别出的文字。
  const words = dm.getWordsNoDict(x1, y1, x2, y2, 'ffffff-202020')
  if (words.length === 0) console.log('未识别到词组')
  for (const word of words) {
    console.log(word.value, word.x, word.y, word.width, word.height)
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

## 排除区域：设置、查找与清理

```js
// 在普通工作脚本运行；UI 脚本请放入工作线程，先取得截图权限。
if (!requestScreenCapture()) throw new Error('未取得截图权限')
const frame = images.captureScreen()
try {
  dm.setImage(frame)
  const x1 = 0, y1 = 0, x2 = frame.getWidth() - 1, y2 = frame.getHeight() - 1
  // 小坐标示范；所有矩形都必须适合实际输入尺寸。
  if (x2 < 100 || y2 < 100) throw new Error('本示例需要至少 101×101 的输入')
  dm.setExcludeRegion(2, '')
  try {
    dm.setExcludeRegion(0, '0,0,20,20|40,40,60,60')
    dm.setExcludeRegion(0, '80,80,100,100')
    dm.setExcludeRegion(1, 'ff11ff')
    const match = dm.findColor(x1, y1, x2, y2, '00ff00-101010', 1.0, 0)
    if (match !== null) {
      console.log('结果值', match.value, '坐标', match.x, match.y)
    } else {
      console.log('未命中')
    }
  } finally {
    dm.setExcludeRegion(2, '')
    dm.setExcludeRegion(1, 'ff00ff')
  }
} finally {
  try {
    dm.useScreen()
  } finally {
    frame.recycle()
  }
}
```

## Java：DmBuffer 生命周期

Java 调用方传入有效的输入 Bitmap 和模板文件字节。引擎复制输入帧，原始 Bitmap 的生命周期仍由调用方管理；此示例不假定无屏幕提供器的引擎可以自行截图。

```java
import android.graphics.Bitmap;
import java.io.File;
import com.monkeyking.dm.Dm;
import com.monkeyking.dm.DmBuffer;
import com.monkeyking.dm.DmMatch;

public final class DmBufferExample {
    private DmBufferExample() {}

    public static DmMatch find(File workDir, Bitmap input, byte[] templateBytes) {
        try (Dm dm = new Dm(workDir)) {
            dm.setImage(input);
            try (DmBuffer template = dm.buffer(templateBytes)) {
                return dm.findPicMem(
                    0, 0, input.getWidth() - 1, input.getHeight() - 1,
                    template, "202020", 0.9, 0
                );
            }
        }
    }
}
```

脚本示例不使用 PC 输出指针。读取 `DmMatch.x`、`DmMatch.y`，或遍历 `DmMatch[]`。
