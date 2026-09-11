# Util - 实用工具

`util` 汇集类型判断、对象继承、格式化、类型断言、尺寸换算以及 Java 互操作等通用能力。运行时同时注册 `util` 与 `$util`，两者引用同一个模块对象。

版本：**v6.7.0**

本页所有 `js` 代码块均为 Monkey King **Rhino 2.0** 示例。

## util

```js
console.log(util === $util); // true
console.log(util.isArray([1, 2])); // true
console.log(util.format('%s: %d', 'count', 2)); // count: 2
```

## Java 类原型成员

运行时在 `util` 的 prototype 上公开以下四个同步方法。它们不访问文件、网络或 Android 权限，也不持有资源；四者自 **v6.6.0** 起可用。返回的外部类型参阅 Java 官方的 [`java.lang.Class`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Class.html)。

### util.class(value)

### util.getClass(value)

- `value` {any} - 必填且不能是 `null`
- 返回 {`java.lang.Class`} - `value` 本身若已经是 `Class` 就原样返回，否则返回其实际 Java 类
- 异常 - value 为 `null` 时抛出参数异常；参数数量不正确时由 Rhino 调用桥接层拒绝

`util.class(value)` 与 `util.getClass(value)` 是同义入口。

### util.className(value)

### util.getClassName(value)

- `value` {any} - 必填且不能是 `null`
- 返回 {string} - 上述 `Class.getName()` 的结果，即完整二进制类名
- 异常 - value 为 `null` 时抛出参数异常；其他类访问错误会原样传播

`util.className(value)` 与 `util.getClassName(value)` 是同义入口。

```js
let list = new java.util.ArrayList();
let klass = util.class(list);

console.log(klass === util.getClass(list)); // true
console.log(util.getClass(klass) === klass); // true
console.log(util.className(list)); // java.util.ArrayList
console.log(util.getClassName(list)); // java.util.ArrayList
```

## 类型判断

下列方法都只接收一个参数并返回 `boolean`：

| 方法 | 为 `true` 的条件 |
| --- | --- |
| `util.isArray(value)` | JavaScript 数组 |
| `util.isBoolean(value)` | 布尔值 |
| `util.isNull(value)` | 严格为 `null` |
| `util.isNullOrUndefined(value)` | `null` 或 `undefined` |
| `util.isNumber(value)` | JavaScript 数值 |
| `util.isString(value)` | 字符串 |
| `util.isSymbol(value)` | `Symbol` |
| `util.isUndefined(value)` | `undefined` |
| `util.isRegExp(value)` | 正则表达式 |
| `util.isObject(value)` | 非空的 JavaScript 对象；`null` 明确返回 `false` |
| `util.isDate(value)` | `Date` |
| `util.isError(value)` | 错误对象 |
| `util.isFunction(value)` | 可调用函数 |
| `util.isBigInt(value)` | `BigInt` |
| `util.isJavaObject(value)` | Rhino 包装的 Java 对象 |
| `util.isJavaArray(value)` | Rhino 包装的 Java 数组 |
| `util.isInteger(value)` | 整数 |
| `util.isPrimitive(value)` | 非引用值 |
| `util.isReference(value)` | 非空对象或函数 |
| `util.isEmptyObject(value)` | 没有自有属性的脚本对象 |

参数数量不为 1 时会抛出参数错误。

```js
console.log(util.isObject({})); // true
console.log(util.isObject(null)); // false
```

## util.unwrapJavaObject(value)

解除 Rhino 的 Java 包装并返回底层值；非包装值按运行时的通用解包规则处理。

```js
let list = new java.util.ArrayList();
let raw = util.unwrapJavaObject(list);
console.log(raw.getClass().getName());
```

## util.extend(child, parent)

设置构造函数或脚本对象的继承关系，并调整 `child.prototype` 的原型链。`child` 必须是 `ScriptableObject`；`parent` 可以是脚本对象、可转换为脚本对象的值或 `null`。非法原型会抛出参数错误。

```js
function Animal() {}
Animal.prototype.kind = 'animal';

function Cat() {}
util.extend(Cat, Animal);

console.log(new Cat().kind); // animal
```

## util.format(format, values)

生成格式化字符串。参数可以继续追加，不限制为固定数量。

- 首个参数不是字符串时，对全部参数调用 `util.inspect` 后用空格连接。
- `%s` 转为字符串。
- `%d` 转为数值。
- `%j` 使用 JSON 序列化；循环引用显示为 `[Circular]`。
- `%%` 输出百分号。
- 缺少对应值或遇到未知占位符时保留原文本。
- 尚未消费的参数追加到结果尾部，对象使用 `util.inspect`。

```js
console.log(util.format('%s=%d', 'size', 3)); // size=3
console.log(util.format({ ok: true }, [1, 2]));
```

## util.log(values)

先用 `util.format` 生成消息，再在前方加入 `dd MMM HH:mm:ss` 格式的本地时间并写入全局控制台。此方法只输出日志，不返回有意义的值。

## util.deprecate() 与 util.debuglog()

这两个 Node.js 兼容名称不适用于 Monkey King。当前实现只向全局控制台输出警告，不会创建包装函数或调试记录器。

## 字符串工具

### util.checkStringArgument(source, pattern)

将原始值去除首尾空白后进行不区分大小写的完整匹配。`pattern` 可为字符串或运行时可识别的正则对象；字符串会自动加上首尾锚点。`source` 必须为非空的原始值，其他类型会抛出错误。

### util.assureStringStartsWith(source, start)

当 `source` 尚未以 `start` 开头时补上前缀。两个参数都必须是字符串。

### util.assureStringEndsWith(source, end)

当 `source` 尚未以 `end` 结尾时补上后缀。两个参数都必须是字符串。

### util.assureStringSurroundsWith(source, start, end?)

同时保证前缀和后缀；省略 `end` 或传入空值时，后缀沿用 `start`。

```js
console.log(util.assureStringStartsWith('api', '/')); // /api
console.log(util.assureStringEndsWith('index', '.md')); // index.md
console.log(util.assureStringSurroundsWith('name', '"')); // "name"
```

## 类型断言

### util.ensureType(value, type)

按 JavaScript `typeof` 语义校验类型。`type` 必须是以下字符串之一：`object`、`string`、`undefined`、`symbol`、`bigint`、`number`、`function`、`boolean`。类型不匹配或名称非法时抛出参数错误，校验成功时没有返回值。

### 便捷断言

下列方法可接收任意数量的值并逐个校验，任意一个不匹配都会抛出参数错误：

- `util.ensureStringType(values)`
- `util.ensureNumberType(values)`
- `util.ensureUndefinedType(values)`
- `util.ensureBooleanType(values)`
- `util.ensureSymbolType(values)`
- `util.ensureBigIntType(values)`
- `util.ensureObjectType(values)`
- `util.ensureFunctionType(values)`
- `util.ensureNonNullObjectType(values)`
- `util.ensureArrayType(values)`

```js
util.ensureType(1, 'number');
util.ensureStringType('a', 'b');
util.ensureArrayType([], [1]);
```

## util.toRegular(fn)

将没有普通 `prototype` 的函数包装为常规函数。已经具备对象型 `prototype` 的函数会原样返回；参数不是函数时抛出类型错误。

`util.toRegularAndCall()` 与 `util.toRegularAndApply()` 已废弃，当前实现调用即抛出过时函数异常。

## 尺寸换算

| 方法 | 说明 | 返回值 |
| --- | --- | --- |
| `util.dpToPx(value)` | dp 转 px | `number` |
| `util.spToPx(value)` | sp 转 px | `number` |
| `util.pxToDp(value)` | px 转 dp | `number` |
| `util.pxToSp(value)` | px 转 sp | `number` |

结果依赖当前设备的显示密度或字体缩放设置。

## util.inspect(value, options?)

返回适合调试输出的字符串，也可以直接调用 `util.inspect(value)`。支持的选项如下：

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `showHidden` | `false` | 是否显示隐藏属性 |
| `depth` | `2` | 最大递归深度 |
| `colors` | `false` | 是否加入 ANSI 样式 |
| `customInspect` | `false` | 是否允许对象自定义检查逻辑 |
| `maxArrayItems` | `10000` | 最多显示的数组项目数 |
| `maxObjectKeys` | `10000` | 最多显示的对象键数 |
| `maxStringLength` | `100000` | 最长字符串长度 |

`options` 必须是 JavaScript 对象。`util.inspect.colors` 与 `util.inspect.styles` 暴露当前 ANSI 颜色和类型样式映射。

## util.java

Java 互操作辅助对象。

### util.java.instanceof(object, classValue)

判断 `object` 是否为目标 Java 类或其子类的实例。`classValue` 可为 `Class`、`NativeJavaClass`、包装类或可解析的完整类名。`object` 为 `null` 时抛出错误，类无法解析时会传播类加载异常。

### util.java.array(componentType, dimensions)

创建 Java 数组。`componentType` 可为 Java 类、完整类名或 `string`、`int`、`long`、`double`、`char`、`byte`、`float`、`short`、`boolean`；后续一个或多个参数为各维长度。未提供维度时抛出错误。

```js
let bytes = util.java.array('byte', 16);
let matrix = util.java.array('int', 2, 3);
console.log(bytes.length); // 16
```

### util.java.toJsArray(iterable, nullToEmpty?)

把 Java `Iterable` 转为 JavaScript 数组。输入为 `null` 时默认返回 `null`；`nullToEmpty` 为真时返回空数组。非可迭代值会抛出参数错误。

### util.java.objectToMap(object)

把 JavaScript 普通对象的自有属性复制到 `HashMap<String, Object>`。空值返回 `null`，非普通对象会抛出参数错误。

### util.java.mapToObject(map)

把 Java `Map` 的条目复制到 JavaScript 普通对象，键按字符串转换。空值返回 `null`，非 `Map` 值会抛出参数错误。

## util.morseCode

`util.morseCode(source, timeSpan?)` 返回一个摩尔斯电码对象。`timeSpan` 的默认值和下限都是 `100` 毫秒；支持拉丁字母、数字和内置字典中的常用标点，无法识别的字符会抛出错误。

对象具有只读的 `code`、`pattern` 属性，以及 `getCode()`、`getPattern()`、`vibrate(delay?)`、`toString()`、`toStringReadable()` 方法。两个字符串方法都返回原始摩尔斯字符串的可读表示。模块还提供同名快捷方法：

- `util.morseCode.getCode(source, timeSpan?)`
- `util.morseCode.getPattern(source, timeSpan?)`
- `util.morseCode.vibrate(source, delay?)`

`pattern` 是 Android 振动节奏数组。`vibrate` 会触发设备振动，延迟为负数或非数值时按 `0` 处理；空节奏不会振动。

```js
let sos = util.morseCode('SOS');
console.log(sos.getCode());
console.log(sos.getPattern());
// sos.vibrate(200); // 在真实设备上产生振动
```

## util.version

`util.version.sdkInt` 是当前 Android 系统的 API 级别整数。

## util.versionCodes

提供 Android 版本代码查询：

- `util.versionCodes.search(value)`：返回第一个匹配的版本信息对象或 `null`。
- `util.versionCodes.searchAll(value)`：返回全部匹配项并按 API 级别降序排列。
- `util.versionCodes.summary(detail?)`：生成版本摘要；`detail` 为真时包含完整字段。
- `util.versionCodes.toString(detail?)`：与 `summary` 相同。

查询值可为 API 级别、版本代码、发布名称、内部代号、平台版本、发布日期、时间戳、数值或 `Date`。结果对象包含 `versionCode`、`apiLevel`、`releaseName`、`platformVersion`、`internalCodename`、`releaseDate`、`releaseTimestamp`，其 `valueOf()` 返回 `apiLevel`。

## 内部兼容方法

`util.__assignFunctions__(source, target, functionNames)` 用于把指定方法绑定后复制到另一个脚本对象。它要求前两个参数为 `ScriptableObject`、第三个参数为数组，且每个名称都指向函数。该名称主要供运行时模块装配使用，业务脚本不应依赖它。

## 共同执行契约

- 除 `util.log`、警告方法、尺寸换算和 `morseCode.vibrate` 外，成员均为当前线程内的同步内存操作；不创建需要关闭的生命周期资源。
- 可见副作用仅包括：`util.log`、`deprecate`、`debuglog` 写控制台，尺寸换算读取显示指标，`morseCode.vibrate` 触发设备振动并受设备振动能力与系统策略限制。其余成员不要求 Android 权限。
- 参数数量、类型或合法值不满足各成员说明时会同步抛出异常；没有声明容错返回值的成员不会吞掉错误。

<!-- api-contracts:start -->

## API 合同表

下表覆盖本页在产品版本 `6.7.0` 中的每个 canonical 公共成员。每行同时给出稳定锚点、实现合同、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Y2FsbDp1dGlsLmluc3BlY3Q"></a> `call:util.inspect` | `util.inspect(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.inspect);` |
| <a id="api-symbol-Y2FsbDp1dGlsLm1vcnNlQ29kZQ"></a> `call:util.morseCode` | `morseCode(...args)` · 实现合同  | 参数：1 至 2 个参数；可选项与默认值见本页说明或页面约束 | 返回：NativeObject；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.morseCode);` |
| <a id="api-symbol-bW9kdWxlOnV0aWw"></a> `module:util` | `util` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util);` |
| <a id="api-symbol-bW9kdWxlOnV0aWwuaW5zcGVjdA"></a> `module:util.inspect` | `inspect` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.inspect);` |
| <a id="api-symbol-bW9kdWxlOnV0aWwuamF2YQ"></a> `module:util.java` | `java` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.java);` |
| <a id="api-symbol-bW9kdWxlOnV0aWwubW9yc2VDb2Rl"></a> `module:util.morseCode` | `morseCode` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.morseCode);` |
| <a id="api-symbol-bW9kdWxlOnV0aWwudmVyc2lvbg"></a> `module:util.version` | `version` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.version);` |
| <a id="api-symbol-bW9kdWxlOnV0aWwudmVyc2lvbkNvZGVz"></a> `module:util.versionCodes` | `versionCodes` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.versionCodes);` |
| <a id="api-symbol-dXRpbC5fX2Fzc2lnbkZ1bmN0aW9uc19f"></a> `util.__assignFunctions__` | `util.__assignFunctions__(...args)` · 实现合同  | 参数：恰好 3 个参数；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.__assignFunctions__);` |
| <a id="api-symbol-dXRpbC5hc3N1cmVTdHJpbmdFbmRzV2l0aA"></a> `util.assureStringEndsWith` | `util.assureStringEndsWith(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.assureStringEndsWith);` |
| <a id="api-symbol-dXRpbC5hc3N1cmVTdHJpbmdTdGFydHNXaXRo"></a> `util.assureStringStartsWith` | `util.assureStringStartsWith(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.assureStringStartsWith);` |
| <a id="api-symbol-dXRpbC5hc3N1cmVTdHJpbmdTdXJyb3VuZHNXaXRo"></a> `util.assureStringSurroundsWith` | `util.assureStringSurroundsWith(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.assureStringSurroundsWith);` |
| <a id="api-symbol-dXRpbC5jaGVja1N0cmluZ0FyZ3VtZW50"></a> `util.checkStringArgument` | `util.checkStringArgument(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.checkStringArgument);` |
| <a id="api-symbol-dXRpbC5jbGFzcw"></a> `util.class` | `util.class(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.class);` |
| <a id="api-symbol-dXRpbC5jbGFzc05hbWU"></a> `util.className` | `util.className(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.className);` |
| <a id="api-symbol-dXRpbC5kZWJ1Z2xvZw"></a> `util.debuglog` | `util.debuglog(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.debuglog);` |
| <a id="api-symbol-dXRpbC5kZXByZWNhdGU"></a> `util.deprecate` | `util.deprecate(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.deprecate);` |
| <a id="api-symbol-dXRpbC5kcFRvUHg"></a> `util.dpToPx` | `util.dpToPx(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.dpToPx);` |
| <a id="api-symbol-dXRpbC5lbnN1cmVBcnJheVR5cGU"></a> `util.ensureArrayType` | `util.ensureArrayType(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.ensureArrayType);` |
| <a id="api-symbol-dXRpbC5lbnN1cmVCaWdJbnRUeXBl"></a> `util.ensureBigIntType` | `util.ensureBigIntType(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.ensureBigIntType);` |
| <a id="api-symbol-dXRpbC5lbnN1cmVCb29sZWFuVHlwZQ"></a> `util.ensureBooleanType` | `util.ensureBooleanType(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.ensureBooleanType);` |
| <a id="api-symbol-dXRpbC5lbnN1cmVGdW5jdGlvblR5cGU"></a> `util.ensureFunctionType` | `util.ensureFunctionType(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.ensureFunctionType);` |
| <a id="api-symbol-dXRpbC5lbnN1cmVOb25OdWxsT2JqZWN0VHlwZQ"></a> `util.ensureNonNullObjectType` | `util.ensureNonNullObjectType(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.ensureNonNullObjectType);` |
| <a id="api-symbol-dXRpbC5lbnN1cmVOdW1iZXJUeXBl"></a> `util.ensureNumberType` | `util.ensureNumberType(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.ensureNumberType);` |
| <a id="api-symbol-dXRpbC5lbnN1cmVPYmplY3RUeXBl"></a> `util.ensureObjectType` | `util.ensureObjectType(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.ensureObjectType);` |
| <a id="api-symbol-dXRpbC5lbnN1cmVTdHJpbmdUeXBl"></a> `util.ensureStringType` | `util.ensureStringType(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.ensureStringType);` |
| <a id="api-symbol-dXRpbC5lbnN1cmVTeW1ib2xUeXBl"></a> `util.ensureSymbolType` | `util.ensureSymbolType(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.ensureSymbolType);` |
| <a id="api-symbol-dXRpbC5lbnN1cmVUeXBl"></a> `util.ensureType` | `util.ensureType(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.ensureType);` |
| <a id="api-symbol-dXRpbC5lbnN1cmVVbmRlZmluZWRUeXBl"></a> `util.ensureUndefinedType` | `util.ensureUndefinedType(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.ensureUndefinedType);` |
| <a id="api-symbol-dXRpbC5leHRlbmQ"></a> `util.extend` | `util.extend(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.extend);` |
| <a id="api-symbol-dXRpbC5mb3JtYXQ"></a> `util.format` | `util.format(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.format);` |
| <a id="api-symbol-dXRpbC5nZXRDbGFzcw"></a> `util.getClass` | `util.getClass(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.getClass);` |
| <a id="api-symbol-dXRpbC5nZXRDbGFzc05hbWU"></a> `util.getClassName` | `util.getClassName(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.getClassName);` |
| <a id="api-symbol-dXRpbC5pbnNwZWN0LmNvbG9ycw"></a> `util.inspect.colors` | `util.inspect.colors` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(util.inspect.colors);` |
| <a id="api-symbol-dXRpbC5pbnNwZWN0LnN0eWxlcw"></a> `util.inspect.styles` | `util.inspect.styles` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(util.inspect.styles);` |
| <a id="api-symbol-dXRpbC5pc0FycmF5"></a> `util.isArray` | `util.isArray(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isArray);` |
| <a id="api-symbol-dXRpbC5pc0JpZ0ludA"></a> `util.isBigInt` | `util.isBigInt(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isBigInt);` |
| <a id="api-symbol-dXRpbC5pc0Jvb2xlYW4"></a> `util.isBoolean` | `util.isBoolean(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isBoolean);` |
| <a id="api-symbol-dXRpbC5pc0RhdGU"></a> `util.isDate` | `util.isDate(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isDate);` |
| <a id="api-symbol-dXRpbC5pc0VtcHR5T2JqZWN0"></a> `util.isEmptyObject` | `util.isEmptyObject(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isEmptyObject);` |
| <a id="api-symbol-dXRpbC5pc0Vycm9y"></a> `util.isError` | `util.isError(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isError);` |
| <a id="api-symbol-dXRpbC5pc0Z1bmN0aW9u"></a> `util.isFunction` | `util.isFunction(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isFunction);` |
| <a id="api-symbol-dXRpbC5pc0ludGVnZXI"></a> `util.isInteger` | `util.isInteger(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isInteger);` |
| <a id="api-symbol-dXRpbC5pc0phdmFBcnJheQ"></a> `util.isJavaArray` | `util.isJavaArray(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isJavaArray);` |
| <a id="api-symbol-dXRpbC5pc0phdmFPYmplY3Q"></a> `util.isJavaObject` | `util.isJavaObject(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isJavaObject);` |
| <a id="api-symbol-dXRpbC5pc051bGw"></a> `util.isNull` | `util.isNull(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isNull);` |
| <a id="api-symbol-dXRpbC5pc051bGxPclVuZGVmaW5lZA"></a> `util.isNullOrUndefined` | `util.isNullOrUndefined(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isNullOrUndefined);` |
| <a id="api-symbol-dXRpbC5pc051bWJlcg"></a> `util.isNumber` | `util.isNumber(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isNumber);` |
| <a id="api-symbol-dXRpbC5pc09iamVjdA"></a> `util.isObject` | `util.isObject(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isObject);` |
| <a id="api-symbol-dXRpbC5pc1ByaW1pdGl2ZQ"></a> `util.isPrimitive` | `util.isPrimitive(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isPrimitive);` |
| <a id="api-symbol-dXRpbC5pc1JlZmVyZW5jZQ"></a> `util.isReference` | `util.isReference(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isReference);` |
| <a id="api-symbol-dXRpbC5pc1JlZ0V4cA"></a> `util.isRegExp` | `util.isRegExp(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isRegExp);` |
| <a id="api-symbol-dXRpbC5pc1N0cmluZw"></a> `util.isString` | `util.isString(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isString);` |
| <a id="api-symbol-dXRpbC5pc1N5bWJvbA"></a> `util.isSymbol` | `util.isSymbol(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isSymbol);` |
| <a id="api-symbol-dXRpbC5pc1VuZGVmaW5lZA"></a> `util.isUndefined` | `util.isUndefined(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.isUndefined);` |
| <a id="api-symbol-dXRpbC5qYXZhLmFycmF5"></a> `util.java.array` | `util.java.array(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.java.array);` |
| <a id="api-symbol-dXRpbC5qYXZhLmluc3RhbmNlb2Y"></a> `util.java.instanceof` | `util.java.instanceof(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.java.instanceof);` |
| <a id="api-symbol-dXRpbC5qYXZhLm1hcFRvT2JqZWN0"></a> `util.java.mapToObject` | `util.java.mapToObject(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.java.mapToObject);` |
| <a id="api-symbol-dXRpbC5qYXZhLm9iamVjdFRvTWFw"></a> `util.java.objectToMap` | `util.java.objectToMap(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.java.objectToMap);` |
| <a id="api-symbol-dXRpbC5qYXZhLnRvSnNBcnJheQ"></a> `util.java.toJsArray` | `util.java.toJsArray(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.java.toJsArray);` |
| <a id="api-symbol-dXRpbC5sb2c"></a> `util.log` | `util.log(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.log);` |
| <a id="api-symbol-dXRpbC5tb3JzZUNvZGUuZ2V0Q29kZQ"></a> `util.morseCode.getCode` | `util.morseCode.getCode(...args)` · 实现合同  | 参数：1 至 2 个参数；可选项与默认值见本页说明或页面约束 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.morseCode.getCode);` |
| <a id="api-symbol-dXRpbC5tb3JzZUNvZGUuZ2V0UGF0dGVybg"></a> `util.morseCode.getPattern` | `util.morseCode.getPattern(...args)` · 实现合同  | 参数：1 至 2 个参数；可选项与默认值见本页说明或页面约束 | 返回：NativeArray；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.morseCode.getPattern);` |
| <a id="api-symbol-dXRpbC5tb3JzZUNvZGUucmVzdWx0LmNvZGU"></a> `util.morseCode.result.code` | `pattern.code` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(morsePattern.code);` |
| <a id="api-symbol-dXRpbC5tb3JzZUNvZGUucmVzdWx0LmdldENvZGU"></a> `util.morseCode.result.getCode` | `pattern.getCode()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Any；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof morsePattern.getCode);` |
| <a id="api-symbol-dXRpbC5tb3JzZUNvZGUucmVzdWx0LmdldFBhdHRlcm4"></a> `util.morseCode.result.getPattern` | `pattern.getPattern()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Any；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof morsePattern.getPattern);` |
| <a id="api-symbol-dXRpbC5tb3JzZUNvZGUucmVzdWx0LnBhdHRlcm4"></a> `util.morseCode.result.pattern` | `pattern.pattern` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(morsePattern.pattern);` |
| <a id="api-symbol-dXRpbC5tb3JzZUNvZGUucmVzdWx0LnRvU3RyaW5n"></a> `util.morseCode.result.toString` | `pattern.toString()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof morsePattern.toString);` |
| <a id="api-symbol-dXRpbC5tb3JzZUNvZGUucmVzdWx0LnRvU3RyaW5nUmVhZGFibGU"></a> `util.morseCode.result.toStringReadable` | `pattern.toStringReadable()` · 实现合同  | 无参数；不接受额外参数 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof morsePattern.toStringReadable);` |
| <a id="api-symbol-dXRpbC5tb3JzZUNvZGUucmVzdWx0LnZpYnJhdGU"></a> `util.morseCode.result.vibrate` | `pattern.vibrate(...args)` · 实现合同  | 参数：0 至 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Any；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof morsePattern.vibrate);` |
| <a id="api-symbol-dXRpbC5tb3JzZUNvZGUudmlicmF0ZQ"></a> `util.morseCode.vibrate` | `util.morseCode.vibrate(...args)` · 实现合同  | 参数：1 至 2 个参数；可选项与默认值见本页说明或页面约束 | 返回：Any；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.morseCode.vibrate);` |
| <a id="api-symbol-dXRpbC5weFRvRHA"></a> `util.pxToDp` | `util.pxToDp(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.pxToDp);` |
| <a id="api-symbol-dXRpbC5weFRvU3A"></a> `util.pxToSp` | `util.pxToSp(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.pxToSp);` |
| <a id="api-symbol-dXRpbC5zcFRvUHg"></a> `util.spToPx` | `util.spToPx(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.spToPx);` |
| <a id="api-symbol-dXRpbC50b1JlZ3VsYXI"></a> `util.toRegular` | `util.toRegular(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.toRegular);` |
| <a id="api-symbol-dXRpbC50b1JlZ3VsYXJBbmRBcHBseQ"></a> `util.toRegularAndApply` | `util.toRegularAndApply(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.toRegularAndApply);` |
| <a id="api-symbol-dXRpbC50b1JlZ3VsYXJBbmRDYWxs"></a> `util.toRegularAndCall` | `util.toRegularAndCall(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.toRegularAndCall);` |
| <a id="api-symbol-dXRpbC51bndyYXBKYXZhT2JqZWN0"></a> `util.unwrapJavaObject` | `util.unwrapJavaObject(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.unwrapJavaObject);` |
| <a id="api-symbol-dXRpbC52ZXJzaW9uLnNka0ludA"></a> `util.version.sdkInt` | `util.version.sdkInt` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(util.version.sdkInt);` |
| <a id="api-symbol-dXRpbC52ZXJzaW9uQ29kZXMucmVzdWx0LmFwaUxldmVs"></a> `util.versionCodes.result.apiLevel` | `versionInfo.apiLevel` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(versionInfo.apiLevel);` |
| <a id="api-symbol-dXRpbC52ZXJzaW9uQ29kZXMucmVzdWx0LmludGVybmFsQ29kZW5hbWU"></a> `util.versionCodes.result.internalCodename` | `versionInfo.internalCodename` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(versionInfo.internalCodename);` |
| <a id="api-symbol-dXRpbC52ZXJzaW9uQ29kZXMucmVzdWx0LnBsYXRmb3JtVmVyc2lvbg"></a> `util.versionCodes.result.platformVersion` | `versionInfo.platformVersion` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(versionInfo.platformVersion);` |
| <a id="api-symbol-dXRpbC52ZXJzaW9uQ29kZXMucmVzdWx0LnJlbGVhc2VEYXRl"></a> `util.versionCodes.result.releaseDate` | `versionInfo.releaseDate` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(versionInfo.releaseDate);` |
| <a id="api-symbol-dXRpbC52ZXJzaW9uQ29kZXMucmVzdWx0LnJlbGVhc2VOYW1l"></a> `util.versionCodes.result.releaseName` | `versionInfo.releaseName` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(versionInfo.releaseName);` |
| <a id="api-symbol-dXRpbC52ZXJzaW9uQ29kZXMucmVzdWx0LnJlbGVhc2VUaW1lc3RhbXA"></a> `util.versionCodes.result.releaseTimestamp` | `versionInfo.releaseTimestamp` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(versionInfo.releaseTimestamp);` |
| <a id="api-symbol-dXRpbC52ZXJzaW9uQ29kZXMucmVzdWx0LnZhbHVlT2Y"></a> `util.versionCodes.result.valueOf` | `versionInfo.valueOf(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：Any?；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof versionInfo.valueOf);` |
| <a id="api-symbol-dXRpbC52ZXJzaW9uQ29kZXMucmVzdWx0LnZlcnNpb25Db2Rl"></a> `util.versionCodes.result.versionCode` | `versionInfo.versionCode` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(versionInfo.versionCode);` |
| <a id="api-symbol-dXRpbC52ZXJzaW9uQ29kZXMuc2VhcmNo"></a> `util.versionCodes.search` | `util.versionCodes.search(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.versionCodes.search);` |
| <a id="api-symbol-dXRpbC52ZXJzaW9uQ29kZXMuc2VhcmNoQWxs"></a> `util.versionCodes.searchAll` | `util.versionCodes.searchAll(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.versionCodes.searchAll);` |
| <a id="api-symbol-dXRpbC52ZXJzaW9uQ29kZXMuc3VtbWFyeQ"></a> `util.versionCodes.summary` | `util.versionCodes.summary(...args)` · 实现合同  | 参数：0 至 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.versionCodes.summary);` |
| <a id="api-symbol-dXRpbC52ZXJzaW9uQ29kZXMudG9TdHJpbmc"></a> `util.versionCodes.toString` | `util.versionCodes.toString(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：通用转换和判断无需权限，振动辅助按设备能力执行；线程：多数同步，回调辅助在调用线程执行 | 生命周期：模块和子模块随引擎存在；副作用：多数纯计算，振动与日志方法产生外部效果 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof util.versionCodes.toString);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: util');
```

<!-- api-contracts:end -->
