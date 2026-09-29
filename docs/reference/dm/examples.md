# dm Java / JS 示例

> 运行条件：本页适用于提供 `dm` 全局对象的 Monkey King 构建。

## 图色：偏色与多点找色

```js
const x1 = 0, y1 = 0, x2 = device.width - 1, y2 = device.height - 1
const color = '123456-000000|aabbcc-030303|ddeeff-202020'
const single = dm.findColor(x1, y1, x2, y2, color, 1.0, 0)
if (single) console.log(single.x, single.y)

const multi = dm.findMultiColor(
  x1, y1, x2, y2,
  '123456-000000',
  '8|0|aabbcc-030303,-4|3|ddeeff-202020',
  1.0,
  0,
)
if (multi) console.log(multi.x, multi.y)
dm.close()
```

## 找图：文件模板和内存模板

```js
dm.setPath('./assets/dm')
dm.loadPic('button.png')
const hit = dm.findPic(
  0, 0, device.width - 1, device.height - 1,
  'button.png', '202020', 0.9, 0,
)
console.log(hit || '未找到按钮')
dm.freePic('button.png')
dm.close()
```

```js
const template = dm.buffer(files.readBytes('./assets/dm/button.png'))
try {
  const hit = dm.findPicMem(
    0, 0, device.width - 1, device.height - 1,
    template, '202020', 0.9, 0,
  )
  console.log(hit)
} finally {
  template.close()
}
```

## OCR、FindStr 和免字库识别

```js
dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
const text = dm.ocr(
  0, 0, device.width - 1, device.height - 1,
  'ffffff-202020,\\n',
  0.9,
)
console.log(text || '没有识别到文字')

const hit = dm.findStrFast(
  0, 0, device.width - 1, device.height - 1,
  '确定|取消',
  'ffffff-202020',
  0.9,
)
if (hit) console.log(hit.value, hit.x, hit.y)

const words = dm.getWordsNoDict(
  0, 0, device.width - 1, device.height - 1,
  'ffffff-202020',
)
console.log(words)
dm.close()
```

## Java：DmBuffer 生命周期

```java
import java.io.File;
import com.monkeyking.dm.Dm;
import com.monkeyking.dm.DmBuffer;
import com.monkeyking.dm.DmMatch;

public final class DmBufferExample {
    private DmBufferExample() {}

    public static DmMatch find(File workDir, int width, int height) {
        try (Dm dm = new Dm(workDir)) {
            DmBuffer frame = dm.getScreenDataBmp(0, 0, width - 1, height - 1);
            try {
                DmMatch hit = dm.findPicMem(
                    0, 0, width - 1, height - 1,
                    frame, "202020", 0.9, 0
                );
                return hit;
            } finally {
                frame.close();
            }
        }
    }
}
```

Android 不使用 `intX/intY`、`IntRef`、`BufferRef` 或 `x.value/y.value`。旧 PC 示例应改为读取 `DmMatch.x`、`DmMatch.y`，或遍历 `DmMatch[]`。
