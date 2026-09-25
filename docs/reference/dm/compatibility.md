# dm Android 兼容约定

> 预览状态：仅适用于已提供 `dm` 全局对象的授权构建。

Monkey King 保留大漠风格的 PascalCase 兼容接口，同时提供 camelCase 便捷接口。兼容接口的输出参数在 Java 中使用 `IntRef`，Rhino 中使用 `{ value: -1 }`。

输入图像支持软件 `Bitmap`、普通 PNG/JPEG/BMP/GIF 和屏幕截图；GIF 首帧用于离线工作台。硬件 Bitmap 会在必要时复制为可读像素。扫描坐标属于原图，右下角在矩形转换时采用包含约定。

每个 `Dm` 实例独立维护字库、图片缓存、冻结帧和配置。Java 应使用 `try-with-resources`，脚本退出会自动关闭实例：

```java
import android.content.Context;
import com.monkeyking.dm.Dm;

public final class DmSetup {
    private DmSetup() {}

    public static int configureDm(Context context) {
        try (Dm dm = new Dm(context.getCacheDir())) {
            return dm.SetPath(context.getFilesDir().getAbsolutePath());
        }
    }
}
```

加密图片、加密字库和密码设置不支持；相关旧接口会返回明确的“不支持”错误。
