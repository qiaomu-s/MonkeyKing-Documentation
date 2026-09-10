# NanoID

**自 v6.6.0 起提供。**

本页所有 `js` 代码块均为 Monkey King **Rhino 2.0** 示例。

NanoID 使用 `java.security.SecureRandom` 生成适合 URL 使用的随机标识符。默认长度为 21，字符来自一个包含大小写字母、数字、连字符和下划线的 64 字符字母表。

## nanoid

### nanoid(size?)

**v6.6.0**

- **[ size = `21` ]** { `number` } - 标识符长度；输入会转换并舍入为整数
- <ins>**returns**</ins> { `string` } - 长度为 size 的随机字符串
- **异常**：参数过多、长度为负数或无法分配随机字节缓冲区时抛出异常
- **副作用 / 生命周期**：同步消耗安全随机源，不持有需要关闭的资源

全局可调用入口。`$nanoid` 是同一函数对象的别名。

```js
let id = nanoid();
console.log(id.length); // 21

let shortId = nanoid(8);
console.log(shortId.length); // 8
console.log(/^[A-Za-z0-9_-]+$/.test(shortId)); // true

console.log($nanoid === nanoid); // true
```

每次调用都会创建安全随机数生成器并填充新的字节缓冲区。相同长度的多次调用不保证不同，但随机碰撞概率随长度增大而迅速降低。

### 参数、异常与执行特性

- 不传参数时使用长度 21；长度为 0 时返回空字符串。
- 负长度无法创建随机字节缓冲区，会抛出运行时异常。
- 只接受零个或一个参数；参数过多会抛出参数数量异常。
- 极大的长度可能因内存不足而失败，调用方应对外部输入设置合理上限。
- 该函数同步执行，不访问文件、网络或 Android 权限，也不持有需要关闭的资源。

<!-- fixed-source-contracts:start -->

## 固定源码合同表

下表覆盖本页在固定提交 `bafa2986212d` 中的每个 canonical 公共成员。每行同时给出稳定锚点、源码位置、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Y2FsbDpuYW5vaWQ"></a> `call:nanoid` | `nanoid(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/nanoid/NanoID.kt:L14` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：同步执行 | 生命周期：无模块级持久资源；副作用：除明确记录的 I/O 外仅返回计算结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof nanoid);` |
| <a id="api-symbol-bW9kdWxlOm5hbm9pZA"></a> `module:nanoid` | `nanoid` 模块入口 · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/ScriptRuntime.kt:L799` | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：无需额外 Android 权限；线程：同步执行 | 生命周期：无模块级持久资源；副作用：除明确记录的 I/O 外仅返回计算结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof nanoid);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: nanoid');
```

<!-- fixed-source-contracts:end -->
