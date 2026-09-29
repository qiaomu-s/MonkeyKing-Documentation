# dm Android 兼容约定

> 运行条件：本页适用于提供 `dm` 全局对象的 Monkey King 构建。

## API 命名和返回值

脚本公开入口统一使用 camelCase：

| 旧 PC 名称 | Android 名称 |
| --- | --- |
| `SetDict` | `setDict` |
| `UseDict` | `useDict` |
| `FindColor` | `findColor` |
| `FindMultiColor` | `findMultiColor` |
| `FindPicEx` | `findPicEx` |
| `FindStrFast` | `findStrFast` |
| `Ocr` | `ocr` |

Android 查找接口直接返回 `DmMatch`、`DmMatch[]` 或 `null`，不使用 `intX/intY`、`IntRef`、`BufferRef` 等输出指针。`Ex` 变体返回数组；`S` 变体把实际文字或图片名放入 `value`。

## 颜色格式

- 找色颜色：`RRGGBB-DRDGDB`，多个候选用 `|`；
- 找色反色：整体表达式前加 `@`；
- 多点找色偏移：`x|y|颜色`，多个偏移用逗号；
- 多点偏移反色：颜色前加 `-`；
- 找图偏色：六位 RGB 偏色或两位灰度偏色；
- OCR：支持 RGB、HSV、灰度和 `b@` 背景色模式。

例如：

```js
const match = dm.findMultiColor(
  0, 0, device.width - 1, device.height - 1,
  '123456-000000',
  '8|0|aabbcc-030303,-4|3|ddeeff-202020',
  1.0,
  0,
)
```

## 输入和生命周期

输入图像支持软件 `Bitmap`、普通 PNG/JPEG/BMP/GIF、屏幕截图和 `DmBuffer`。扫描坐标属于原图，右下角采用包含约定。每个 `Dm` 实例独立维护字库、图片缓存、冻结帧和配置。Java 应使用 `try-with-resources`：

```java
import android.content.Context;
import com.monkeyking.dm.Dm;

public final class DmSetup {
    private DmSetup() {}

    public static int configureDm(Context context) {
        try (Dm dm = new Dm(context.getCacheDir())) {
            return dm.setPath(context.getFilesDir().getAbsolutePath());
        }
    }
}
```

加密图片、加密字库、密码设置、裸地址和 PC 窗口专属接口不属于 Android API。旧脚本需要同时迁移名称和返回值：删除输出指针参数，改用 `DmMatch` 字段或数组遍历。
