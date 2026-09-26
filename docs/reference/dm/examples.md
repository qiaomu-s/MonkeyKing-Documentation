# dm Java / JS 示例

> 运行条件：本页适用于提供 `dm` 全局对象的 Monkey King 6.7.0 构建。

## Java

```java
import android.content.Context;
import android.graphics.Bitmap;
import com.monkeyking.dm.Dm;
import com.monkeyking.dm.DmMatch;

public final class DmExamples {
    private DmExamples() {}

    public static DmMatch findLogin(
            Context context,
            Bitmap bitmap,
            byte[] dictionaryBytes
    ) {
        try (Dm dm = new Dm(context.getCacheDir())) {
            dm.setImage(bitmap);
            dm.SetDictMem(0, dictionaryBytes, dictionaryBytes.length);
            dm.UseDict(0);
            return dm.findStr(
                    0, 0, bitmap.getWidth() - 1, bitmap.getHeight() - 1,
                    "登录", "ffffff", 0.9
            );
        }
    }
}
```

## Rhino / JavaScript

```js
dm.SetPath('./assets');
dm.SetDict(0, './dm/main.dm.txt');
dm.UseDict(0);
const one = dm.findStr(0, 0, 1079, 1919, '登录', 'ffffff', 0.9);
const many = dm.findStrEx(0, 0, 1079, 1919, '登录|确定', 'ffffff', 0.9);
```

兼容模式：

```js
const x = { value: -1 }, y = { value: -1 };
const ok = dm.FindStrFast(0, 0, 1079, 1919, '确定', 'ffffff', 0.9, x, y);
```
