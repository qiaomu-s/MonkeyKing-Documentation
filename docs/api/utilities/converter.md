# Converter / cvt

**提供。**

本页所有 `js` 代码块均为 Monkey King **Rhino 2.0** 示例。

## converter

Converter 是 Monkey King 的数据转换模块。目前脚本 API 只暴露缩写入口 `cvt` 与 `$cvt`，不存在名为 `converter` 的全局变量。

当前公开的转换器只有 `bytes`，用于在字节单位之间换算并返回数值。

## cvt

### cvt
- **类型**：`object`
- **返回值**：无；`cvt` 本身不可调用
- **副作用**：无

全局转换器对象。`$cvt` 是同一对象的别名。

```js
console.log($cvt === cvt); // true
console.log(typeof cvt.bytes); // "function"
```

### cvt.bytes.UNITS
- **类型**：`string`
- **值**：`"KMGTPEZYRQ"`

按从小到大的顺序列出可用单位前缀，即 K、M、G、T、P、E、Z、Y、R、Q。

```js
console.log(cvt.bytes.UNITS); // KMGTPEZYRQ
```

### cvt.bytes.AUTO
- **类型**：`string`
- **值**：`"AUTO"`

表示自动选择目标单位。

```js
console.log(cvt.bytes.AUTO); // AUTO
```

### cvt.bytes.IEC_DIV
- **类型**：`number`
- **值**：`1024`

IEC 二进制单位的进位基数。

```js
console.log(cvt.bytes.IEC_DIV); // 1024
```

### cvt.bytes.SI_DIV
- **类型**：`number`
- **值**：`1000`

SI 十进制单位的进位基数。

```js
console.log(cvt.bytes.SI_DIV); // 1000
```

### cvt.bytes(source, arg1?, arg2?, arg3?)
- **source** { `number | string` } - 非负字节值。字符串可同时携带单位，例如 `"1.5 MiB"`
- **arg1 / arg2 / arg3** - 按下方重载表解释
- <ins>**returns**</ins> { `number | java.math.BigDecimal` } - 换算结果；超出 JavaScript 安全整数范围时保留为高精度 Java 大数对象
- **异常**：参数数量、数值、单位或选项不合法时抛出参数异常
- **副作用 / 生命周期**：同步纯计算，不持有资源

默认从 `B` 转换到 `AUTO`，保留 2 位小数，自动进位阈值为 1024，并使用宽松单位规则。

可用调用形式：

| 调用形式 | 含义 |
| --- | --- |
| `cvt.bytes(source)` | 使用全部默认值 |
| `cvt.bytes(source, options)` | 使用选项对象 |
| `cvt.bytes(source, toUnit)` | 指定目标单位 |
| `cvt.bytes(source, fractionDigits)` | 指定小数位数 |
| `cvt.bytes(source, fromUnit, toUnit)` | 指定源单位和目标单位 |
| `cvt.bytes(source, toUnit, options)` | 指定目标单位并补充选项 |
| `cvt.bytes(source, toUnit, fractionDigits)` | 指定目标单位和小数位数 |
| `cvt.bytes(source, fromUnit, toUnit, options)` | 完整选项形式 |
| `cvt.bytes(source, fromUnit, toUnit, fractionDigits)` | 完整数值形式 |

为与 `fmt.bytes` 的位置参数保持兼容，第二、第三或第四参数位也接受布尔值；该布尔值不改变 `cvt.bytes` 的数值换算。需要选择严格模式时应使用 `strict` 选项或 `cvt.bytes.strict`。

选项对象支持：

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fromUnit` | `string` | `"B"` | 源单位；source 已携带单位时不可与其冲突 |
| `toUnit` | `string` | `"AUTO"` | 目标单位，或 `cvt.bytes.AUTO` |
| `fractionDigits` | `number` | `2` | 转换并舍入为非负整数，表示结果保留的小数位数 |
| `autoCarryThreshold` | `number` | `1024` | 转换并舍入为正整数，作为自动提前进位阈值；仅能与 `AUTO` 同用 |
| `strict` | `boolean` | `false` | 是否区分 SI 与 IEC 单位 |

```js
console.log(cvt.bytes(1536)); // 1.5
console.log(cvt.bytes('1.5 MiB', 'KiB')); // 1536
console.log(cvt.bytes(1500, { toUnit: 'KB', fractionDigits: 3 })); // 1.465
```

### cvt.bytes.strict(source, arg1?, arg2?, arg3?)
- **参数**：参数总数必须为 1 至 4；当前实现合同应使用以选项对象收尾的重载
- <ins>**returns**</ins> { `number | java.math.BigDecimal` }
- **异常**：除通用校验外，选项对象含非空 `strict` 时抛出异常
- **副作用 / 生命周期**：同步纯计算，不持有资源

强制使用严格单位规则。`KB`、`MB` 等 SI 单位以 1000 为基数，`KiB`、`MiB` 等 IEC 单位以 1024 为基数。选项对象中不得再提供非空的 `strict`。

可用形式为 `strict(source, options)`、`strict(source, toUnit, options)`、`strict(source, fromUnit, toUnit, options)`。实现合同的纯位置参数分支会把模式布尔值传入 `strict` 选项槽，继而触发空值校验；因此 `strict(source)` 或 `strict(source, fromUnit, toUnit)` 当前会抛出异常。

```js
console.log(cvt.bytes.strict(1, { fromUnit: 'KB', toUnit: 'B' })); // 1000
console.log(cvt.bytes.strict(1, { fromUnit: 'KiB', toUnit: 'B' })); // 1024
```

### cvt.bytes.loose(source, arg1?, arg2?, arg3?)
- **参数**：参数总数必须为 1 至 4；当前实现合同应使用以选项对象收尾的重载
- <ins>**returns**</ins> { `number | java.math.BigDecimal` }
- **异常**：除通用校验外，选项对象含非空 `strict` 时抛出异常
- **副作用 / 生命周期**：同步纯计算，不持有资源

强制使用宽松单位规则。单位不区分 SI 与 IEC 标识，`K`、`KB`、`KiB` 会统一按 1024 进位。选项对象中不得再提供非空的 `strict`。可用形式与 `strict` 相同；纯位置参数分支在当前实现合同中同样会触发空值校验异常。

```js
console.log(cvt.bytes.loose(1, { fromUnit: 'KB', toUnit: 'B' })); // 1024
console.log(cvt.bytes.loose('2 MiB', { toUnit: 'KiB' })); // 2048
```

### 单位、异常与执行特性

- 单位名称不区分大小写；基础单位为 `B`，前缀范围为 `K` 至 `Q`。
- `source` 字符串只接受非负十进制数、可选空白和可选单位；负数、`NaN`、非法文本会抛出异常。
- `source` 内嵌单位与 `fromUnit` 同时出现且含义冲突时会抛出异常。
- `fractionDigits` 为负数、`autoCarryThreshold` 非正数、非 `AUTO` 目标使用自定义进位阈值、单位无效或参数个数不在 1 至 4 之间时会抛出异常。
- 本模块只进行同步内存计算，不访问文件、网络或 Android 权限，也不维护需要关闭的资源。

<!-- api-contracts:start -->

## API 合同表

下表覆盖本页在当前公开 API 中的每个 canonical 公共成员。每行同时给出稳定锚点、实现合同、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Y2FsbDpjdnQuYnl0ZXM"></a> `call:cvt.bytes` | `cvt.bytes(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换 | 生命周期：无持久资源；副作用：无，仅返回转换结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof cvt.bytes);` |
| <a id="api-symbol-Y3Z0LmJ5dGVzLkFVVE8"></a> `cvt.bytes.AUTO` | `cvt.bytes.AUTO` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换 | 生命周期：无持久资源；副作用：无，仅返回转换结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(cvt.bytes.AUTO);` |
| <a id="api-symbol-Y3Z0LmJ5dGVzLklFQ19ESVY"></a> `cvt.bytes.IEC_DIV` | `cvt.bytes.IEC_DIV` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换 | 生命周期：无持久资源；副作用：无，仅返回转换结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(cvt.bytes.IEC_DIV);` |
| <a id="api-symbol-Y3Z0LmJ5dGVzLmxvb3Nl"></a> `cvt.bytes.loose` | `cvt.bytes.loose(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换 | 生命周期：无持久资源；副作用：无，仅返回转换结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof cvt.bytes.loose);` |
| <a id="api-symbol-Y3Z0LmJ5dGVzLlNJX0RJVg"></a> `cvt.bytes.SI_DIV` | `cvt.bytes.SI_DIV` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换 | 生命周期：无持久资源；副作用：无，仅返回转换结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(cvt.bytes.SI_DIV);` |
| <a id="api-symbol-Y3Z0LmJ5dGVzLnN0cmljdA"></a> `cvt.bytes.strict` | `cvt.bytes.strict(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换 | 生命周期：无持久资源；副作用：无，仅返回转换结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof cvt.bytes.strict);` |
| <a id="api-symbol-Y3Z0LmJ5dGVzLlVOSVRT"></a> `cvt.bytes.UNITS` | `cvt.bytes.UNITS` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换 | 生命周期：无持久资源；副作用：无，仅返回转换结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(cvt.bytes.UNITS);` |
| <a id="api-symbol-bW9kdWxlOmN2dA"></a> `module:cvt` | `cvt` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：无需 Android 权限；线程：同步转换 | 生命周期：无持久资源；副作用：无，仅返回转换结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof cvt);` |
| <a id="api-symbol-bW9kdWxlOmN2dC5ieXRlcw"></a> `module:cvt.bytes` | `bytes` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换 | 生命周期：无持久资源；副作用：无，仅返回转换结果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof cvt.bytes);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: converter');
```

<!-- api-contracts:end -->
