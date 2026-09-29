# dm Android 兼容约定

> 运行条件：本页适用于提供 `dm` 全局对象的 Monkey King 构建。

Monkey King 的公开 DM 接口统一使用 camelCase。查找和识别接口直接返回 `DmMatch`、`DmMatch[]` 或字符串；Rhino 不暴露 Java 的 `IntRef`、`BufferRef` 等内部类型。

输入图像支持软件 `Bitmap`、普通 PNG/JPEG/BMP/GIF 和屏幕截图；GIF 首帧用于离线工作台。硬件 Bitmap 会在必要时复制为可读像素。扫描坐标属于原图，右下角在矩形转换时采用包含约定。

每个 `Dm` 实例独立维护字库、图片缓存、冻结帧和配置。Java 应使用 `try-with-resources`，脚本退出会自动关闭实例：

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

加密图片、加密字库和密码设置不支持；相关入口会返回明确的“不支持”错误。旧脚本迁移时仅需将名称首字母改为小写，例如 `SetDict` 映射为 `setDict`、`FindColor` 映射为 `findColor`、`Ocr` 映射为 `ocr`。
