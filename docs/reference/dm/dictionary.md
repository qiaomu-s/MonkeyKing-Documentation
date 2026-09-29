# dm 明文字库

> 运行条件：本页适用于提供 `dm` 全局对象的 Monkey King 构建。

字库条目格式：

```text
HEX$文字$指标$高度
```

点阵按列主序编码，每列从高位到低位写入 HEX。高度小于 4 时，末尾空白列属于格式补零，读取时会恢复为紧边界。文字标签不能包含 `$`、`|`、制表符或换行。

## 制作和加载

```js
const glyph = dm.FetchWord(10, 20, 80, 60, 'ffffff', '确');
dm.AddDict(0, glyph);
dm.SaveDict(0, './assets/dm/main.dm.txt');

dm.SetDict(0, './assets/dm/main.dm.txt');
dm.UseDict(0);
```

`SetDictMem` 接收 `byte[]` 或已关闭前会保持有效的 `DmBuffer`，不接受裸地址。`GetDictCount`、`GetDict` 可用于检查加载结果，重复文字不会自动去重，多个字形变体可以同时存在。

损坏行应保留并显示行号；编辑器不会静默删除或改写。加密字库不在兼容范围内。
