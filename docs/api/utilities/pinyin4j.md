# Pinyin4j

**自 v6.6.1 起提供。**

本页所有 `js` 代码块均为 Monkey King **Rhino 2.0** 示例。

Pinyin4j 模块封装 pinyin4j 2.5.1，用于把基础汉字转换为汉语拼音，或把带数字的声调转换为声调符号。

## pinyin4j

### pinyin4j(string, options?)

**v6.6.1**

- **string** { `string` } - 待转换文本
- **options** { `object | string` } - 可选；字符串会直接作为分隔符
- <ins>**returns**</ins> { `string` }
- **异常**：参数数量或格式选项不合法时抛出异常
- **副作用 / 生命周期**：同步纯计算，不持有资源

全局可调用入口，与 `pinyin4j.of` 等价。`$pinyin4j` 是同一函数对象的别名。

```js
console.log(pinyin4j('中国')); // zhongguo
console.log(pinyin4j('中国', ' ')); // zhong guo
console.log($pinyin4j === pinyin4j); // true
```

### pinyin4j.of(string, options?)

**v6.6.1**

- **string** { `string` } - 待转换文本
- **options** { `object | string` } - 格式选项，或作为简写的分隔符字符串
- <ins>**returns**</ins> { `string` }
- **异常**：参数数量、枚举值或底层拼音格式组合不合法时抛出异常
- **副作用 / 生命周期**：同步纯计算，不持有资源

逐字符转换 `U+4E00` 至 `U+9FA5` 范围内的汉字。范围外字符原样保留；一个汉字有多个读音时只采用 pinyin4j 返回的第一项。

选项对象支持以下名称和别名：

| 选项 | 默认值 | 合法值 |
| --- | --- | --- |
| `separator` / `sep` | 空字符串 | 任意字符串 |
| `case` / `caseType` | `LOWERCASE` | `LOWERCASE`、`LOW`、`L`、`0`；或 `UPPERCASE`、`UP`、`U`、`1` |
| `tone` / `toneType` | `WITHOUT_TONE` | `WITH_TONE_NUMBER`、`WITH_NUMBER`、`NUMBER`、`NUM`；`WITHOUT_TONE`、`NO_TONE`、`NO`、`FALSE`、`0`；`WITH_TONE_MARK`、`WITH_MARK`、`MARK`、`TRUE`、`1` |
| `v` / `vChar` / `vCharType` | `WITH_V` | `WITH_U_AND_COLON`、`U_AND_COLON`、`U_COLON`、`U:`；`WITH_V`、`V`；`WITH_U_UNICODE`、`U_UNICODE`、`UNICODE`、`Ü` |

也可直接传入 pinyin4j 的 `HanyuPinyinCaseType`、`HanyuPinyinToneType` 和 `HanyuPinyinVCharType` 枚举对象。使用声调符号且未指定 v 字符格式时，默认改用 Unicode `ü`。

```js
console.log(pinyin4j.of('中国', {
    separator: ' ',
    case: 'UPPERCASE',
    tone: 'WITH_TONE_NUMBER',
})); // ZHONG1 GUO2

console.log(pinyin4j.of('女', {
    tone: 'WITH_TONE_MARK',
})); // nǚ
```

实现会在每个输入字符转换后追加分隔符，最后只移除首尾空白。因此空格分隔符不会留下尾随空格，而 `-` 一类非空白分隔符会保留在结果末尾。

```js
console.log(pinyin4j.of('中国', '-')); // zhong-guo-
```

### pinyin4j.as(numberedPinyin)

**v6.6.1**

- **numberedPinyin** { `string` } - 含 0 至 4 声调数字的拼音文本
- <ins>**returns**</ins> { `string` } - 转换声调后的文本
- **异常**：参数数量不为 1 时抛出异常
- **副作用 / 生命周期**：同步纯计算，不持有资源

把可识别的韵母加数字形式替换为 Unicode 声调字符。未匹配的内容原样保留；数字 0 表示轻声并移除数字。

```js
console.log(pinyin4j.as('zhong1 guo2')); // zhōng guó
console.log(pinyin4j.as('nv3 hai2')); // nǚ hái
```

### 异常、线程与副作用

- `pinyin4j` 与 `pinyin4j.of` 必须传入 1 至 2 个参数，`pinyin4j.as` 必须传入 1 个参数；数量不符会抛出异常。
- 非法的大小写、声调或 v 字符枚举值会抛出参数异常；pinyin4j 不接受的格式组合也可能抛出格式异常。
- 空字符串返回空字符串。除无效枚举外，输入会按 Monkey King 的字符串转换规则处理。
- 所有转换同步完成，只进行内存计算，不访问文件、网络或 Android 权限，也不维护需要关闭的资源。

<!-- fixed-source-contracts:start -->

## 固定源码合同表

下表覆盖本页在固定提交 `bafa2986212d` 中的每个 canonical 公共成员。每行同时给出稳定锚点、源码位置、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Y2FsbDpwaW55aW40ag"></a> `call:pinyin4j` | `pinyin4j(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/pinyin4j/Pinyin4j.kt:L87` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：同步执行 | 生命周期：无模块级持久资源；副作用：除明确记录的 I/O 外仅返回计算结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof pinyin4j);` |
| <a id="api-symbol-bW9kdWxlOnBpbnlpbjRq"></a> `module:pinyin4j` | `pinyin4j` 模块入口 · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/ScriptRuntime.kt:L801` | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：无需额外 Android 权限；线程：同步执行 | 生命周期：无模块级持久资源；副作用：除明确记录的 I/O 外仅返回计算结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof pinyin4j);` |
| <a id="api-symbol-cGlueWluNGouYXM"></a> `pinyin4j.as` | `pinyin4j.as(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/pinyin4j/Pinyin4j.kt:L165` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：同步执行 | 生命周期：无模块级持久资源；副作用：除明确记录的 I/O 外仅返回计算结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof pinyin4j.as);` |
| <a id="api-symbol-cGlueWluNGoub2Y"></a> `pinyin4j.of` | `pinyin4j.of(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/pinyin4j/Pinyin4j.kt:L92` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：同步执行 | 生命周期：无模块级持久资源；副作用：除明确记录的 I/O 外仅返回计算结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof pinyin4j.of);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: pinyin4j');
```

<!-- fixed-source-contracts:end -->
