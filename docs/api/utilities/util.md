# Util - 实用工具

`util` 汇集类型判断、对象继承、格式化、类型断言、尺寸换算以及 Java 互操作等通用能力。运行时同时注册 `util` 与 `$util`，两者引用同一个模块对象。

版本：**v6.6.0**

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

`util.morseCode(source, timeSpan?)` 返回一个摩尔斯电码对象。`timeSpan` 的默认值和下限都是 `100` 毫秒；支持拉丁字母、数字和源码字典中的常用标点，无法识别的字符会抛出错误。

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
