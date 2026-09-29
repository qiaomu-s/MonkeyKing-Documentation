# Formatter / fmt

**提供。**

本页所有 `js` 代码块均为 Monkey King **Rhino 2.0** 示例。

## formatter

Formatter 是 Monkey King 的数据格式化模块。目前脚本 API 只暴露缩写入口 `fmt` 与 `$fmt`，不存在名为 `formatter` 的全局变量。

当前公开的格式化器只有 `bytes`，用于把字节值换算并输出带单位的字符串。

## fmt

### fmt
- **类型**：`object`
- **返回值**：无；`fmt` 本身不可调用
- **副作用**：无

全局格式化对象。`$fmt` 是同一对象的别名。

```js
console.log($fmt === fmt); // true
console.log(typeof fmt.bytes); // "function"
```

### fmt.bytes.UNITS
- **类型**：`string`
- **值**：`"KMGTPEZYRQ"`

按从小到大的顺序列出可用单位前缀。

```js
console.log(fmt.bytes.UNITS); // KMGTPEZYRQ
```

### fmt.bytes.AUTO
- **类型**：`string`
- **值**：`"AUTO"`

表示自动选择输出单位。

```js
console.log(fmt.bytes.AUTO); // AUTO
```

### fmt.bytes.IEC_DIV
- **类型**：`number`
- **值**：`1024`

IEC 二进制单位的进位基数。

```js
console.log(fmt.bytes.IEC_DIV); // 1024
```

### fmt.bytes.SI_DIV
- **类型**：`number`
- **值**：`1000`

SI 十进制单位的进位基数。

```js
console.log(fmt.bytes.SI_DIV); // 1000
```

### fmt.bytes(source, arg1?, arg2?, arg3?)
- **source** { `number | string` } - 非负字节值。字符串可同时携带单位，例如 `"1.5 MiB"`
- **arg1 / arg2 / arg3** - 按下方重载表解释
- <ins>**returns**</ins> { `string` } - 格式化后的数值与单位
- **异常**：参数数量、数值、单位或选项不合法时抛出参数异常
- **副作用 / 生命周期**：同步纯计算，不持有资源

默认从 `B` 转换到 `AUTO`，保留 2 位小数，使用空格分隔数值与单位，不移除末尾的零，并使用宽松单位规则。

可用调用形式：

| 调用形式 | 含义 |
| --- | --- |
| `fmt.bytes(source)` | 使用全部默认值 |
| `fmt.bytes(source, options)` | 使用选项对象 |
| `fmt.bytes(source, toUnit)` | 指定目标单位 |
| `fmt.bytes(source, fractionDigits)` | 指定小数位数 |
| `fmt.bytes(source, useIecIdentifier)` | 指定是否显示 IEC 标识 |
| `fmt.bytes(source, fromUnit, toUnit)` | 指定源单位和目标单位 |
| `fmt.bytes(source, toUnit, options)` | 指定目标单位并补充选项 |
| `fmt.bytes(source, toUnit, fractionDigits)` | 指定目标单位和小数位数 |
| `fmt.bytes(source, toUnit, useIecIdentifier)` | 指定目标单位和 IEC 标识 |
| `fmt.bytes(source, fromUnit, toUnit, options)` | 完整选项形式 |
| `fmt.bytes(source, fromUnit, toUnit, fractionDigits)` | 完整数值形式 |
| `fmt.bytes(source, fromUnit, toUnit, useIecIdentifier)` | 完整标识形式 |

选项对象支持：

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fromUnit` | `string` | `"B"` | 源单位；source 已携带单位时不可与其冲突 |
| `toUnit` | `string` | `"AUTO"` | 目标单位，或 `fmt.bytes.AUTO` |
| `useIecIdentifier` | `boolean` | `false` | 宽松模式下是否显示 `KiB`、`MiB` 一类标识 |
| `useSpace` | `boolean` | `true` | 数值与单位之间是否插入空格 |
| `fractionDigits` | `number` | `2` | 转换并舍入为非负整数，表示结果保留的小数位数 |
| `trimTrailingZero` | `boolean` | `false` | 是否移除小数部分末尾的零 |
| `autoCarryThreshold` | `number` | `1024` | 转换并舍入为正整数，作为自动提前进位阈值；仅能与 `AUTO` 同用 |
| `strict` | `boolean` | `false` | 是否区分 SI 与 IEC 单位 |

```js
console.log(fmt.bytes(1536)); // 1.50 KB
console.log(fmt.bytes(1536, {
    useIecIdentifier: true,
    trimTrailingZero: true,
})); // 1.5 KiB
console.log(fmt.bytes(1024, { toUnit: 'KB', useSpace: false })); // 1.00KB
```

### fmt.bytes.strict(source, arg1?, arg2?, arg3?)
- **参数**：参数总数必须为 1 至 4；当前实现合同应使用以选项对象收尾的重载
- <ins>**returns**</ins> { `string` }
- **异常**：除通用校验外，选项对象含非空 `strict` 时抛出异常
- **副作用 / 生命周期**：同步纯计算，不持有资源

强制使用严格单位规则。`KB`、`MB` 等 SI 单位以 1000 为基数，`KiB`、`MiB` 等 IEC 单位以 1024 为基数，并按明确的目标单位输出对应标识。

选项对象中不得再提供非空的 `strict`；`useIecIdentifier` 在严格模式下不决定标签，是否使用 `i` 由目标单位本身决定。

可用形式为 `strict(source, options)`、`strict(source, toUnit, options)`、`strict(source, fromUnit, toUnit, options)`。实现合同的纯位置参数分支会把模式布尔值传入 `strict` 选项槽，继而触发空值校验；因此 `strict(source)` 或 `strict(source, fromUnit, toUnit)` 当前会抛出异常。

```js
console.log(fmt.bytes.strict(1000, { fromUnit: 'B', toUnit: 'KB' })); // 1.00 KB
console.log(fmt.bytes.strict(1024, { fromUnit: 'B', toUnit: 'KiB' })); // 1.00 KiB
```

### fmt.bytes.loose(source, arg1?, arg2?, arg3?)
- **参数**：参数总数必须为 1 至 4；当前实现合同应使用以选项对象收尾的重载
- <ins>**returns**</ins> { `string` }
- **异常**：除通用校验外，选项对象含非空 `strict` 时抛出异常
- **副作用 / 生命周期**：同步纯计算，不持有资源

强制使用宽松单位规则。单位不区分 SI 与 IEC 标识，换算统一按 1024 进位；`useIecIdentifier` 只控制输出标签。选项对象中不得再提供非空的 `strict`。可用形式与 `strict` 相同；纯位置参数分支在当前实现合同中同样会触发空值校验异常。

```js
console.log(fmt.bytes.loose('1 KB', { toUnit: 'B' })); // 1024.00 B
console.log(fmt.bytes.loose(1024, { useIecIdentifier: true })); // 1.00 KiB
```

### 单位、异常与执行特性

- 单位名称不区分大小写；基础单位为 `B`，前缀范围为 `K` 至 `Q`。
- `source` 字符串只接受非负十进制数、可选空白和可选单位；负数、`NaN`、非法文本会抛出异常。
- `source` 内嵌单位与 `fromUnit` 同时出现且含义冲突时会抛出异常。
- `fractionDigits` 为负数、`autoCarryThreshold` 非正数、非 `AUTO` 目标使用自定义进位阈值、单位无效或参数个数不在 1 至 4 之间时会抛出异常。
- 严格模式的 `AUTO` 会自动选阶；显式指定 `KB` 或 `KiB` 可避免输出单位含义不明确。
- 本模块只进行同步内存计算，不访问文件、网络或 Android 权限，也不维护需要关闭的资源。

<!-- api-contracts:start -->

## API 合同表

下表覆盖本页在当前公开 API 中的每个 canonical 公共成员。每行同时给出稳定锚点、实现合同、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Y2FsbDpmbXQuYnl0ZXM"></a> `call:fmt.bytes` | `fmt.bytes(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步格式化 | 生命周期：无持久资源；副作用：无，仅返回字符串 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof fmt.bytes);` |
| <a id="api-symbol-Zm10LmJ5dGVzLkFVVE8"></a> `fmt.bytes.AUTO` | `fmt.bytes.AUTO` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步格式化 | 生命周期：无持久资源；副作用：无，仅返回字符串 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(fmt.bytes.AUTO);` |
| <a id="api-symbol-Zm10LmJ5dGVzLklFQ19ESVY"></a> `fmt.bytes.IEC_DIV` | `fmt.bytes.IEC_DIV` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步格式化 | 生命周期：无持久资源；副作用：无，仅返回字符串 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(fmt.bytes.IEC_DIV);` |
| <a id="api-symbol-Zm10LmJ5dGVzLmxvb3Nl"></a> `fmt.bytes.loose` | `fmt.bytes.loose(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步格式化 | 生命周期：无持久资源；副作用：无，仅返回字符串 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof fmt.bytes.loose);` |
| <a id="api-symbol-Zm10LmJ5dGVzLlNJX0RJVg"></a> `fmt.bytes.SI_DIV` | `fmt.bytes.SI_DIV` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步格式化 | 生命周期：无持久资源；副作用：无，仅返回字符串 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(fmt.bytes.SI_DIV);` |
| <a id="api-symbol-Zm10LmJ5dGVzLnN0cmljdA"></a> `fmt.bytes.strict` | `fmt.bytes.strict(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步格式化 | 生命周期：无持久资源；副作用：无，仅返回字符串 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof fmt.bytes.strict);` |
| <a id="api-symbol-Zm10LmJ5dGVzLlVOSVRT"></a> `fmt.bytes.UNITS` | `fmt.bytes.UNITS` · 实现合同  | 属性访问；无调用参数 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步格式化 | 生命周期：无持久资源；副作用：无，仅返回字符串 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(fmt.bytes.UNITS);` |
| <a id="api-symbol-bW9kdWxlOmZtdA"></a> `module:fmt` | `fmt` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：无需 Android 权限；线程：同步格式化 | 生命周期：无持久资源；副作用：无，仅返回字符串 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof fmt);` |
| <a id="api-symbol-bW9kdWxlOmZtdC5ieXRlcw"></a> `module:fmt.bytes` | `bytes` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步格式化 | 生命周期：无持久资源；副作用：无，仅返回字符串 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof fmt.bytes);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: formatter');
```

<!-- api-contracts:end -->
