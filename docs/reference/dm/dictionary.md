# dm 明文字库

> 运行条件：本页适用于提供 `dm` 全局对象的 Monkey King 构建。

Android 只支持明文字库，不支持 PC 私有加密字库接口。字库输入支持 UTF-8 和 GB18030。

字库条目格式：

```text
HEX$文字$指标$高度
```

点阵按列主序编码，每列从高位到低位写入 HEX。高度小于 4 时，末尾空白列属于格式补零，读取时会恢复为紧边界。文字标签不能包含 `$`、`|`、制表符或换行。

## 制作和加载

```js
const x1 = 10, y1 = 20, x2 = 80, y2 = 60
const glyph = dm.fetchWord(x1, y1, x2, y2, 'ffffff-202020', '确')
if (glyph) {
  dm.addDict(0, glyph)
  dm.saveDict(0, './assets/dm/main.dm.txt')
}

dm.setDict(0, './assets/dm/main.dm.txt')
dm.useDict(0)
console.log(dm.getDictCount(0))
```

`setDictMem` 接收 `byte[]` 或在调用期间保持打开的 `DmBuffer`，不接受裸地址。`getDictCount`、`getDict` 可用于检查加载结果，重复文字不会自动去重，多个字形变体可以同时存在。

字库槽位为 `0–99`。损坏行应报告格式错误和行号；不能静默把损坏数据当作有效字库。使用内存字库时，完成调用后应在 `finally` 中关闭 `DmBuffer`。
