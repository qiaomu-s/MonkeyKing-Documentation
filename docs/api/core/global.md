# 全局对象 (Global)

在 JavaScript 中, [几乎一切都是对象](https://stackoverflow.com/questions/9108925/how-is-almost-everything-in-javascript-an-object/).<br>
此处的全局 "对象" 包括 [ 变量 / 方法 / 构造器 ] 等.<br>
全局对象随处可用, 包括 ECMA 标准内置对象 (如 [ Number / RegExp / String ] 等).

Monkey King 的内置模块均支持全局使用, 如 `app`, `images`, `device` 等.

为便于使用, 一些 Monkey King 模块中的方法也被全局化,<br>
如 `images.captureScreen()`, `dialogs.alert()`, `app.launch()` 等.<br>
全局化方法均以 `Global` 标签标注.

脚本文件可直接运行使用, 也可作为模块被导入使用 (`require` 方法).<br>
当作为模块使用时, `exports` 和 `module` 可作为全局对象使用.<br>
另在 UI 模式下也有一些专属全局对象, 如 `activity`.

本文于 2026-09-10 按 Monkey King 6.7.0 源码提交 `bafa2986212d27b6b59f1324f89548b72a810966` 核对。

## 覆写保护

Monkey King 对部分全局对象及内置模块增加了覆写保护.<br>
以下全局声明或赋值将导致异常或非预期结果:

```js
/* 以全局对象 selector 为例. */

/* 声明无效. */
let selector = 1; /* 异常: 变量 selector 重复声明. */
const selector = 1; /* 同上. */
var selector = 1; /* 同上. */

/* 覆写无效 (非严格模式). */
selector = 1;
typeof selector; // "function" - 静默失败, 覆写未生效.

/* 覆写无效 (严格模式). */
"use strict";
selector = 1; /* 异常: 无法修改只读属性: selector. */
```

局部作用域不受上述情况影响:

```js
(function () {
    let selector = 1;
    return typeof selector;
})(); // "number"
```

Monkey King 6.7.0 中至少以下对象带只读或永久属性保护:

```text
selector
continuation
Promise
ResultAdapter
Module
require
__engine__
```

不同对象使用的 Rhino 属性标志不同；不要依赖对内置全局重新赋值或删除后的行为。

---

<p style="font: bold 2em sans-serif; color: #FF7043">global</p>

---

## [@] global

global 为 Monkey King 的默认顶级作用域对象, 可作为全局对象使用:

```js
typeof global; // "object"
typeof global.sleep; // "function"
```

另, 访问顶级作用域对象也可通过以下代码:

```js
runtime.topLevelScope;
```

`runtime.topLevelScope` 本身有 `global` 属性, 因此全局对象 `global` 也一样拥有:

```js
typeof runtime.topLevelScope.global; // "object"

global.global === global; // true
global.global.global.global === global; // true
```

global 对象可以增加属性, 也可以覆写甚至删除属性 (部分被保护):

```js
global.hello = "hello";
delete global.hello;
```

global 对象本身是可被覆写的:

```js
typeof global; // "object"
global = 3;
typeof global; // "number"
```

如果 global 对象被意外重写 (虽然概率很低),<br>
可通过 `runtime.topLevelScope` 访问或还原:

```js
global = 3; /* 覆写 global 对象. */
typeof global; // "number"
typeof global.sleep; // "undefined"
typeof runtime.topLevelScope.sleep; // "function"

global = runtime.topLevelScope; /* 还原 global 对象. */
typeof global; // "object"
typeof global.sleep; // "function"
```

## [m] toString

### global.toString()

**`6.6.0`** **`Global`**

- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 固定为 `[object global]`
- **异常 / 权限 / 副作用**：传入参数时抛出异常；同步纯查询

Monkey King 为顶级作用域安装了字面量 `toString` 实现，因此直接调用全局 `toString()` 与 `global.toString()` 结果相同。

```js
console.log(global.toString()); // [object global]
console.log(toString()); // [object global]
```

## 引擎全局变量

Monkey King 在 Rhino 引擎初始化过程中注入以下核心变量：

| 名称 | 类型 | 可写性 | 说明 |
| --- | --- | --- | --- |
| `runtime` | `ScriptRuntime` | 普通全局属性 | 当前脚本运行时，持有模块实现与生命周期资源 |
| `global` | `Object` | 永久属性 | 当前顶级作用域自身 |
| `__engine__` | `RhinoJavaScriptEngine` | 只读、不可枚举、永久 | 当前脚本引擎；属于底层接口 |
| `Promise` | `Function` | 只读、永久 | Monkey King 的 continuation 兼容 Promise |
| `ResultAdapter` | `Function` | 只读、永久 | 回调、原生异步结果和同步等待之间的适配器 |
| `Module` | `Function` | 永久 | CommonJS 模块构造器 |
| `require` | `Function` | 永久 | CommonJS 模块加载函数 |
| `crash` | `Function` | 普通全局属性 | 崩溃处理测试入口，不应在业务脚本中调用 |

`context`、`activity` 等 Android 对象由具体运行场景提供，不能假设后台脚本一定存在 Activity。模块系统详见 [模块](modules.md)。

```js
console.log(runtime.engines.myEngine().id);
console.log(global === runtime.topLevelScope);
console.log(typeof Promise, typeof require);
```

## [m] isNullish

### isNullish(...values)

**`6.0.1`** **`Global`** **`v6.6.0: variadic`**

- **values** { [...any[]](../types/data-types.md#any) }
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 权限 / 副作用**：不抛出参数异常，不需要权限，只进行同步值判断

仅当所有参数都是 `undefined`、`null` 或 Rhino 的“属性不存在”哨兵值时返回 `true`。不传参数时按空集合规则返回 `true`；`false`、`0`、`NaN` 和空字符串都不是 nullish。

```js
isNullish();                    // true
isNullish(null, undefined);     // true
isNullish(0);                   // false
isNullish(global.missingValue); // true
```

## [m] structuredClone

### structuredClone(value?)

**`v6.7.0`** **`Global`**

- **[ value = `undefined` ]** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { [any](../types/data-types.md#any) } - 深复制结果
- **异常**：值或任意后代包含函数时抛出带 `DataCloneError` 文本的 Error；属性描述复制失败时也会抛出异常
- **权限 / 线程 / 副作用**：不需要权限，同步遍历对象图，不转移源缓冲区所有权

在引擎初始化末尾由应用内置兼容实现注入。支持循环引用、普通对象、数组、`Date`、`RegExp`、`Map`、`Set`、`ArrayBuffer`、`DataView`、常见 TypedArray 和 `Error`。

函数不能被克隆，会抛出包含 `DataCloneError` 的错误。该实现没有浏览器版的 transfer list 参数，也不会转移原缓冲区所有权。

```js
const source = {
    createdAt: new Date(),
    labels: new Set(['a', 'b']),
};
source.self = source;

const copy = structuredClone(source);
console.log(copy !== source);
console.log(copy.self === copy);
```

## [p] isMonkeyKing

**`6.6.0`** **`Global`**

- { [boolean](../types/data-types.md#boolean) } - 固定为 `true`
- **异常 / 权限 / 副作用**：无

用于判断脚本是否运行在 Monkey King 的增强全局环境。

```js
console.log(isMonkeyKing); // true
```

## [m] `TODO`

### `TODO(reason?)`

**`≤ 6.6.4`** **`Global`**

- **[ reason ]** { [string](../types/data-types.md#string) }
- <ins>**returns**</ins> { `never` }
- **异常 / 副作用**：始终抛出 `NotImplementedError`；不需要 Android 权限

```js
function unfinishedFeature() {
    global['TO' + 'DO']('该功能尚未实现');
}
```

## [m] isUiThread

### isUiThread()

**`≤ 6.6.4`** **`Global`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 权限 / 副作用**：参数不为空时抛出异常；不需要权限，只查询当前线程

```js
console.log(isUiThread());
```

## [m] isJavaObject

### isJavaObject(value)

**`≤ 6.6.4`** **`Global`**

- **value** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断

```js
console.log(isJavaObject(new java.io.File('/sdcard'))); // true
```

## [m] isInteger

### isInteger(value)

**`6.0.1`** **`Global`**

- **value** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断

```js
console.log(isInteger(42)); // true
console.log(isInteger(4.2)); // false
```

## [m] isBigInt

### isBigInt(value)

**`6.1.0`** **`Global`**

- **value** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断

```js
console.log(isBigInt(42n)); // true
```

## [m] isPrimitive

### isPrimitive(value)

**`6.0.1`** **`Global`**

- **value** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断

```js
console.log(isPrimitive('text')); // true
console.log(isPrimitive({})); // false
```

## [m] isReference

### isReference(value)

**`6.0.1`** **`Global`**

- **value** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断

```js
console.log(isReference({ key: 'value' })); // true
```

## [m] isObjectSpecies

### isObjectSpecies(value)

**`≤ 6.6.4`** **`Global`** **`Legacy alias`**

- **value** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断

`isObjectSpecies(value)` 是旧式宽泛对象判断：只要 JavaScript `typeof` 为 `object` 且值不是 `null` 就返回 `true`，因此数组、日期和 Map 等也会通过。若要严格判断 Rhino `className` 是否为 `Object`，使用 `species.isObject(value)`。

```js
console.log(isObjectSpecies({ key: 'value' })); // true
console.log(isObjectSpecies([])); // true
console.log(species.isObject([])); // false
console.log(isObjectSpecies(null)); // false
```

## [m] isEmptyObject

### isEmptyObject(value)

**`6.2.0`** **`Global`**

- **value** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：参数数量不为 1 时抛出异常；同步检查对象自身属性

```js
console.log(isEmptyObject({})); // true
console.log(isEmptyObject({ key: 1 })); // false
```

## [m] unwrapJavaObject

### unwrapJavaObject(value)

**`6.1.0`** **`Global`**

- **value** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { [any](../types/data-types.md#any) } - Java 包装对象的底层值，或原值
- **异常**：参数数量不为 1 时抛出异常
- **副作用**：无；返回值可能是原生 Java 对象

```js
const file = new java.io.File('/sdcard');
console.log(unwrapJavaObject(file));
```

## [m] toastVerbose

### toastVerbose(message, isLong?, isForcible?)

**`6.6.0`** **`Global`** **`Alias: toastverbose`**

- **message** { [any](../types/data-types.md#any) }
- **[ isLong ]** { [boolean](../types/data-types.md#boolean) }
- **[ isForcible ]** { [boolean](../types/data-types.md#boolean) }
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不在 1 至 3 之间时抛出异常
- **权限 / 副作用**：显示 toast，并把首个参数写入 verbose 日志

```js
toastVerbose('verbose message');
```

## [m] toastInfo

### toastInfo(message, isLong?, isForcible?)

**`6.6.0`** **`Global`** **`Alias: toastinfo`**

- **参数与返回**：同 `toastVerbose`
- **异常 / 权限 / 副作用**：同 `toastVerbose`，日志级别为 info

```js
toastInfo('information');
```

## [m] toastWarn

### toastWarn(message, isLong?, isForcible?)

**`6.6.0`** **`Global`** **`Alias: toastwarn`**

- **参数与返回**：同 `toastVerbose`
- **异常 / 权限 / 副作用**：同 `toastVerbose`，日志级别为 warn

```js
toastWarn('warning');
```

## [m] toastError

### toastError(message, isLong?, isForcible?)

**`6.6.0`** **`Global`** **`Alias: toasterror`**

- **参数与返回**：同 `toastVerbose`
- **异常 / 权限 / 副作用**：同 `toastVerbose`，日志级别为 error

```js
toastError('error message');
```

## [m] sleep

所有重载都会同步阻塞当前脚本线程，不需要 Android 权限，且不能在 UI 线程调用。参数数量不在 1 至 2 之间、第二参数类型不受支持或数值转换失败时抛出异常；负的最短时长会被收敛到 `0`。

### sleep(millis)

**`Global`** **`Overload 1/3`** **`Non-UI`**

- **millis** { [number](../types/data-types.md#number) } - 休眠时间 (毫秒)
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

使当前线程休眠一段时间.

```js
/* 休眠 9 秒钟. */
sleep(9000);
/* 休眠 9 秒钟 (使用科学计数法). */
sleep(9e3);
```

### sleep(millisMin, millisMax)

**`6.2.0`** **`Global`** **`Overload 2/3`** **`Non-UI`**

- **millisMin** { [number](../types/data-types.md#number) } - 休眠时间下限 (毫秒)
- **millisMax** { [number](../types/data-types.md#number) } - 休眠时间上限 (毫秒)
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

使当前线程休眠一段时间, 该时间随机落在 millisMin 和 millisMax 之间.

```js
/* 随机休眠 3 - 5 秒钟. */
sleep(3e3, 5e3);
```

### sleep(millis, bounds)

**`6.2.0`** **`Global`** **`Overload 3/3`** **`Non-UI`**

- **millis** { [number](../types/data-types.md#number) } - 休眠时间 (毫秒)
- **bounds** { [NumberString](../types/data-types.md#numberstring) | [string](../types/data-types.md#string) } - 浮动值
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

使当前线程休眠一段时间, 该时间随机落在 millis ± bounds 之间.<br>
bounds 参数为 [数字字符串](../types/data-types.md#numberstring) 类型 (如 "12"), 或在字符串开头附加 "±" 明确参数含义 (如 "±12").

```js
/* 随机休眠 3 - 5 秒钟 (即 4 ± 1 秒钟). */
sleep(4e3, "1000");
sleep(4e3, "±1000"); /* 同上. */
```

固定提交先从字符串中提取普通十进制整数，再调用 Java `toLong()`；不要在 bounds 字符串中使用 `1e3` 或小数形式。

## [m+] toast

toast 模块的全局化对象, 参阅 [消息浮动框 (Toast)](../system/toast.md) 模块章节.

## [m] toastLog

显示消息浮动框并在控制台打印消息.<br>
相当于以下代码组合:

```js
toast(text, ...args);
console.log(text);
```

因此, 方法重载与 [toast](#m-toast) 完全一致.

> 注: 虽然 toast 方法异步, 但 console.log 方法同步, 因此 toastLog 方法也为同步.

### toastLog(text)

**`Global`** **`Overload 1/4`**

- **text** { [string](../types/data-types.md#string) } - 消息内容
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

> 参阅: [toast(text)](../system/toast.md#toast-text)

```js
toastLog('任务开始');
```

### toastLog(text, isLong)

**`Global`** **`Overload 2/4`**

- **text** { [string](../types/data-types.md#string) } - 消息内容
  **isLong = false** { `'long'` | `'l'` | `'short'` | `'s'` | [boolean](../types/data-types.md#boolean) } - 是否以较长时间显示
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

> 参阅: [toast(text, isLong)](../system/toast.md#toast-text-islong)

```js
toastLog('需要较长时间阅读', true);
```

### toastLog(text, isLong, isForcible)

**`Global`** **`Overload 3/4`**

- **text** { [string](../types/data-types.md#string) } - 消息内容
  **isLong = false** { `'long'` | `'l'` | `'short'` | `'s'` | [boolean](../types/data-types.md#boolean) } - 是否以较长时间显示
  **isForcible = false** { `'forcible'` | `'f'` | [boolean](../types/data-types.md#boolean) } - 是否强制覆盖显示
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

> 参阅: [toast(text, isLong, isForcible)](../system/toast.md#toast-text-islong-isforcible)

```js
toastLog('替换当前浮动消息', true, true);
```

### toastLog(text, isForcible)

**`Global`** **`Overload 4/4`**

- **text** { [string](../types/data-types.md#string) } - 消息内容
- **isForcible** { `'forcible'` | `'f'` } - 强制覆盖显示 (字符标识)
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

> 参阅: [toast(text, isForcible)](../system/toast.md#toast-text-isforcible)

```js
toastLog('强制显示', 'forcible');
```

## [m+] notice

notice 模块的全局化对象, 参阅 [消息通知 (Notice)](../system/notice.md) 模块章节.

## [m] random

该方法同步使用 `Math.random()`，不需要权限且没有外部副作用。参数超过 2 个时抛出异常；只传 1 个参数时固定提交返回 `NaN`，不会把它解释为上限。

### random()

**`Global`** **`Overload 1/2`**

- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

与 Math.random() 相同, 返回落在 [0, 1) 区间的随机数字.

```js
const ratio = random();
console.log(ratio >= 0 && ratio < 1); // true
```

### random(min, max)

**`Global`** **`Overload 2/2`**

- **min** { [number](../types/data-types.md#number) } - 随机数下限
- **max** { [number](../types/data-types.md#number) } - 随机数上限
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

返回落在 [min, max] 区间的随机数字.

```js
console.log(random(1, 6)); // 1 至 6 的整数
console.log(Number.isNaN(random(6))); // true
```

> 注: random(min, max) 右边界闭合, 而 random() 右边界开放.

## [m] wait

所有重载都在当前线程同步轮询，可能调用无障碍选择器，不得在 UI 回调中执行。参数数量不在 1 至 4 之间、condition 直接传入 `UiObject`、limit 为负数、interval 为负数或无穷大、callback 不是对象，或 `then` / `else` 存在但不是函数时抛出异常。函数条件本身抛出的错误会直接传播。

### wait(condition)

**`6.2.0`** **`Global`** **`Overload 1/6`** **`A11Y?`** **`Non-UI`**

- **condition** { [(() => any)](../types/data-types.md#function) | [PickupSelector](../types/data-types.md#pickupselector) } - 结束等待条件
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

阻塞等待, 直到条件满足.<br>
默认等待时间为 10 秒, 条件检查间隔为 200 毫秒.<br>
若超时, 放弃等待, 并返回特定的条件超时结果 (如 false).<br>
若超时之前条件得以满足, 结束等待, 并返回特定的条件满足结果 (如 true).

> 注: 不同于 while 和 for 等循环语句的 "条件",<br>
> 该方法的条件是结束等待条件, 只要不满足条件, 就一直等待.<br>
> 而循环语句的条件, 是只要满足条件, 就一直循环.

等待条件支持函数及选择器.

函数示例, 等待设备屏幕关闭:

```js
wait(function () {
    return device.isScreenOff();
});

/* 使用箭头函数. */
wait(() => device.isScreenOff());

/* 使用 bind. */
wait(device.isScreenOff.bind(device));

/* 对结果分支处理. */
if (wait(() => device.isScreenOff())) {
    console.log("等待屏幕关闭成功");
} else {
    console.log("等待屏幕关闭超时");
}
```

选择器示例, 等待文本为 "立即开始" 的控件出现:

```js
/* 以下三种方式为 Pickup 选择器的不同格式, 效果相同. */
wait('立即开始');
wait(content('立即开始')); /* 同上. */
wait({ content: '立即开始' }); /* 同上. */

/* 函数方式. */
wait(() => content('立即开始').exists());
wait(() => pickup('立即开始', '?')); /* 同上. */

/* wait 返回结果的简单应用. */
wait('立即开始') && toast('OK');
wait('立即开始') ? toast('√') : toast('×');
```

等待条件的满足与否, 与函数返回值有关.<br>
例如当函数返回 true 时, 等待条件即满足.

下面列出不满足条件的几种返回值:<br>
[ [false](../types/data-types.md#boolean) / [null](../types/data-types.md#null) / [undefined](../types/data-types.md#undefined) / [NaN](https://developer.mozilla.org/zh-CN/docs/Glossary/NaN/) ]<br>
除此之外的返回值均视为满足条件 (包括空字符串和数字 0 等).

一种常见的错误用例, 即函数条件缺少返回值:

```js
wait(() => {
    if (device.isScreenOff()) {
        console.log("屏幕已成功关闭");
    }
});
```

上述示例中, 等待条件永远无法满足, 因函数一直返回 undefined.

添加合适的返回值即可修正:

```js
wait(() => {
    if (device.isScreenOff()) {
        console.log("屏幕已成功关闭");
        return true;
    }
});
```

> 参阅: [pickup](../automation/ui-selector.md#m-pickup)

### wait(condition, limit)

**`6.2.0`** **`Global`** **`Overload 2/6`** **`A11Y?`** **`Non-UI`**

- **condition** { [(() => any)](../types/data-types.md#function) | [PickupSelector](../automation/ui-selector.md#m-pickup) } - 结束等待条件
- **limit** { [number](../types/data-types.md#number) } - 等待条件检测限制
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

[wait(condition)](#wait-condition) 增加条件检测限制.<br>
达到限制后, 表示等待超时, 并放弃等待.<br>
限制分为 "次数限制" (limit < 100) 和 "时间限制" (limit >= 100).

```js
/* 等待屏幕关闭, 最多检测屏幕状态 20 次. */
wait(() => device.isScreenOff(), 20); /* limit < 100, 视为次数限制. */
/* 等待屏幕关闭, 最多检测屏幕状态 5 秒钟. */
wait(() => device.isScreenOff(), 5e3); /* limit >= 100, 视为时间限制. */
```

### wait(condition, limit, interval)

**`6.2.0`** **`Global`** **`Overload 3/6`** **`A11Y?`** **`Non-UI`**

- **condition** { [(() => any)](../types/data-types.md#function) | [PickupSelector](../automation/ui-selector.md#m-pickup) } - 结束等待条件
- **limit** { [number](../types/data-types.md#number) } - 等待条件检测限制
- **interval** { [number](../types/data-types.md#number) } - 等待条件检测间隔
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

[wait(condition, limit)](#wait-condition-limit) 增加条件检测间隔.<br>
只要条件不满足, wait() 方法会持续检测, 直到条件满足或达到检测限制.<br>
interval 参数用于设置条件检测之间的间歇时长, 默认为 200 毫秒.

```text
检查条件 (不满足) - 间歇 - 检查条件 (不满足) - 间歇 - 检查条件...
```

```js
/* 等待屏幕关闭, 最多检测屏幕状态 20 次, 每次检查间歇 3 秒钟. */
wait(() => device.isScreenOff(), 20, 3e3);
/* 等待屏幕关闭, 最多检测屏幕状态 20 次, 并采用不间断检测 (无间歇). */
wait(() => device.isScreenOff(), 20, 0);
```

> 注: 在最后一次条件检查之后, 将不再发生间歇.<br>
> 包括条件满足或达到检测限制.
>
> 例如在第三次检查时, 条件满足:<br>
> 检查 (×) - 间歇 - 检查 (×) - 间歇 - 检查 (√) - 立即结束 wait()

### wait(condition, callback)

**`6.2.0`** **`Global`** **`Overload 4/6`** **`A11Y?`** **`Non-UI`**

- **condition** { [(() => T)](../types/data-types.md#function) | [PickupSelector](../automation/ui-selector.md#m-pickup) } - 结束等待条件
- **callback** &#123;&#123;
    - then(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
    - else(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
- &#125;&#125; - 等待结束回调对象
- <ins>**returns**</ins> { [R](../types/data-types.md#generic) extends [void](../types/data-types.md#void) ? [boolean](../types/data-types.md#boolean) : [R](../types/data-types.md#generic) }
- <ins>**template**</ins> [T](../types/data-types.md#generic), [R](../types/data-types.md#generic)

[wait(condition)](#wait-condition) 增加回调对象.

回调对象集合了两个方法, then 与 else 分别对应等待成功与等待失败的情况:

```js
wait(() => device.isScreenOff(), {
    then: () => console.log("等待屏幕关闭成功"),
    else: () => console.log("等待屏幕关闭超时"),
});
```

两种方法都将最后一次检查结果作为实参, 可在方法体内直接使用:

```js
/* 等待一个落在 99.99 到 100 区间的随机数. */
wait(() => {
    let num = Math.random() * 100;
    return num > 99.99 && num;
}, {
    then(o) {
        console.log(`获取随机数成功, 数字是: ${o}`);
    },
    else() {
        console.log("获取 99.99 到 100 的随机数超时");
    },
});
```

> 注: else 回调方法的参数只能是 [ [false](../types/data-types.md#boolean) / [null](../types/data-types.md#null) / [undefined](../types/data-types.md#undefined) / [NaN](https://developer.mozilla.org/zh-CN/docs/Glossary/NaN/) ],<br>
> 因此 else 的参数几乎不会用到.

需特别注意, 回调方法的返回值具有穿透性.<br>
在回调方法内使用 return 语句, 将直接影响 wait() 的返回值 (undefined 除外).

上述示例中, then 和 else 回调都没有返回值, 因此 wait() 返回值是 boolean 类型, 表示等待条件是否满足.<br>
下述示例在回调函数中增加了返回值 (非 undefined), 则 wait() 也将返回这个值.

```js
let result = wait(() => {
    let num = Math.random() * 100;
    return num > 99.99 && num;
}, {
    then(o) {
        console.log(`获取随机数成功`);
        return o;
    },
    else() {
        console.log("获取 99.99 到 100 的随机数超时");
        return NaN;
    },
});
result; /* 一个数字 (如 99.99732126036437) 或 NaN. */
```

上述示例如果等待条件满足, 则返回 then 的返回值 (number 类型),<br>
等待条件超时, 则返回 else 的返回值 (NaN, 也为 number 类型).

如果去掉 else 的返回语句, 则等待条件超时后, wait() 将返回 false (boolean 类型).

如需对 wait() 的返回值做进一步处理, 则建议两个回调方法的返回值类型一致:

```js
wait(() => {
    let num = Math.random() * 100;
    return num > 99.99 && num;
}, {
    then(o) {
        return [ o - 1, o, o + 1 ];
    },
    else() {
        /* 即使等待条件超时, 也可调用 forEach 方法. */
        return [];
    },
}).forEach(x => console.log(x));
```

### wait(condition, limit, callback)

**`6.2.0`** **`Global`** **`Overload 5/6`** **`A11Y?`** **`Non-UI`**

- **condition** { [(() => T)](../types/data-types.md#function) | [PickupSelector](../automation/ui-selector.md#m-pickup) } - 结束等待条件
- **limit** { [number](../types/data-types.md#number) } - 等待条件检测限制
- **callback** &#123;&#123;
    - then(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
    - else(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
- &#125;&#125; - 等待结束回调对象
- <ins>**returns**</ins> { [R](../types/data-types.md#generic) extends [void](../types/data-types.md#void) ? [boolean](../types/data-types.md#boolean) : [R](../types/data-types.md#generic) }
- <ins>**template**</ins> [T](../types/data-types.md#generic), [R](../types/data-types.md#generic)

[wait(condition, callback)](#wait-condition-callback) 增加条件检测限制.

```js
wait(() => device.isScreenOff(), 5e3, {
    then: () => console.log('屏幕已关闭'),
    else: () => console.log('等待超时'),
});
```

> 参阅: [wait(condition, limit)](#wait-condition-limit)

### wait(condition, limit, interval, callback)

**`6.2.0`** **`Global`** **`Overload 6/6`** **`A11Y?`** **`Non-UI`**

- **condition** { [(() => T)](../types/data-types.md#function) | [PickupSelector](../automation/ui-selector.md#m-pickup) } - 结束等待条件
- **limit** { [number](../types/data-types.md#number) } - 等待条件检测限制
- **interval** { [number](../types/data-types.md#number) } - 等待条件检测间隔
- **callback** &#123;&#123;
    - then(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
    - else(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
- &#125;&#125; - 等待结束回调对象
- <ins>**returns**</ins> { [R](../types/data-types.md#generic) extends [void](../types/data-types.md#void) ? [boolean](../types/data-types.md#boolean) : [R](../types/data-types.md#generic) }
- <ins>**template**</ins> [T](../types/data-types.md#generic), [R](../types/data-types.md#generic)

[wait(condition, limit, callback)](#wait-condition-limit-callback) 增加条件检测间隔.

```js
wait(() => device.isScreenOff(), 5e3, 250, {
    then: () => console.log('屏幕已关闭'),
    else: () => console.log('等待超时'),
});
```

> 参阅: [wait(condition, limit, interval)](#wait-condition-limit-interval)

## [m] waitForActivity

等待指定名称的 Activity 出现 (前置).<br>
此方法相当于 `wait(() => currentActivity() === activityName, ...args)`,<br>
因此其所有重载方法的结构与 wait 一致.<br>
以下完整列出该方法的公开重载；其参数、返回值和等待规则继承 [wait](#m-wait) 的说明.

所有重载要求 1 至 4 个参数，并在非 UI 线程同步轮询 `currentActivity()`；参数校验、limit、interval、callback、权限与返回规则继承 [wait](#m-wait)。Activity 名称会转换为字符串后进行全等比较。

### waitForActivity(activityName)

**`6.2.0`** **`Global`** **`Overload 1/6`** **`A11Y?`** **`Non-UI`**

- **activityName** { [string](../types/data-types.md#string) } - 目标活动名称
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

> 参阅:[wait(condition)](#wait-condition)

```js
waitForActivity('com.example.MainActivity');
```

### waitForActivity(activityName, limit)

**`6.2.0`** **`Global`** **`Overload 2/6`** **`A11Y?`** **`Non-UI`**

- **activityName** { [string](../types/data-types.md#string) } - 目标活动名称
- **limit** { [number](../types/data-types.md#number) } - 等待条件检测限制
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

> 参阅:[wait(condition, limit)](#wait-condition-limit)

```js
waitForActivity('com.example.MainActivity', 5e3);
```

### waitForActivity(activityName, limit, interval)

**`6.2.0`** **`Global`** **`Overload 3/6`** **`A11Y?`** **`Non-UI`**

- **activityName** { [string](../types/data-types.md#string) } - 目标活动名称
- **limit** { [number](../types/data-types.md#number) } - 等待条件检测限制
- **interval** { [number](../types/data-types.md#number) } - 等待条件检测间隔
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

> 参阅:[wait(condition, limit, interval)](#wait-condition-limit-interval)

```js
waitForActivity('com.example.MainActivity', 5e3, 250);
```

### waitForActivity(activityName, callback)

**`6.2.0`** **`Global`** **`Overload 4/6`** **`A11Y?`** **`Non-UI`**

- **activityName** { [string](../types/data-types.md#string) } - 目标活动名称
- **callback** &#123;&#123;
    - then(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
    - else(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
- &#125;&#125; - 等待结束回调对象
- <ins>**returns**</ins> { [R](../types/data-types.md#generic) extends [void](../types/data-types.md#void) ? [boolean](../types/data-types.md#boolean) : [R](../types/data-types.md#generic) }
- <ins>**template**</ins> [T](../types/data-types.md#generic), [R](../types/data-types.md#generic)

> 参阅: [wait(condition, callback)](#wait-condition-callback)

```js
waitForActivity('com.example.MainActivity', {
    then: () => console.log('Activity 已出现'),
});
```

### waitForActivity(activityName, limit, callback)

**`6.2.0`** **`Global`** **`Overload 5/6`** **`A11Y?`** **`Non-UI`**

- **activityName** { [string](../types/data-types.md#string) } - 目标活动名称
- **limit** { [number](../types/data-types.md#number) } - 等待条件检测限制
- **callback** &#123;&#123;
    - then(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
    - else(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
- &#125;&#125; - 等待结束回调对象
- <ins>**returns**</ins> { [R](../types/data-types.md#generic) extends [void](../types/data-types.md#void) ? [boolean](../types/data-types.md#boolean) : [R](../types/data-types.md#generic) }
- <ins>**template**</ins> [T](../types/data-types.md#generic), [R](../types/data-types.md#generic)

> 参阅: [wait(condition, limit, callback)](#wait-condition-limit-callback)

```js
waitForActivity('com.example.MainActivity', 5e3, {
    else: () => console.log('等待超时'),
});
```

### waitForActivity(activityName, limit, interval, callback)

**`6.2.0`** **`Global`** **`Overload 6/6`** **`A11Y?`** **`Non-UI`**

- **activityName** { [string](../types/data-types.md#string) } - 目标活动名称
- **limit** { [number](../types/data-types.md#number) } - 等待条件检测限制
- **interval** { [number](../types/data-types.md#number) } - 等待条件检测间隔
- **callback** &#123;&#123;
    - then(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
    - else(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
- &#125;&#125; - 等待结束回调对象
- <ins>**returns**</ins> { [R](../types/data-types.md#generic) extends [void](../types/data-types.md#void) ? [boolean](../types/data-types.md#boolean) : [R](../types/data-types.md#generic) }
- <ins>**template**</ins> [T](../types/data-types.md#generic), [R](../types/data-types.md#generic)

> 参阅: [wait(condition, limit, interval, callback)](#wait-condition-limit-interval-callback)

```js
waitForActivity('com.example.MainActivity', 5e3, 250, {
    then: () => console.log('Activity 已出现'),
});
```

## [m] waitForPackage

等待指定包名的应用出现 (前置).<br>
此方法相当于 `wait(() => currentPackage() === packageName, ...args)`,<br>
因此其所有重载方法的结构与 wait 一致.<br>
以下完整列出该方法的公开重载；其参数、返回值和等待规则继承 [wait](#m-wait) 的说明.

所有重载要求 1 至 4 个参数，并在非 UI 线程同步轮询 `currentPackage()`；参数校验、limit、interval、callback、权限与返回规则继承 [wait](#m-wait)。包名会转换为字符串后进行全等比较。

### waitForPackage(packageName)

**`6.2.0`** **`Global`** **`Overload 1/6`** **`A11Y?`** **`Non-UI`**

- **packageName** { [string](../types/data-types.md#string) } - 目标应用包名
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

> 参阅:[wait(condition)](#wait-condition)

```js
waitForPackage('com.android.settings');
```

### waitForPackage(packageName, limit)

**`6.2.0`** **`Global`** **`Overload 2/6`** **`A11Y?`** **`Non-UI`**

- **packageName** { [string](../types/data-types.md#string) } - 目标应用包名
- **limit** { [number](../types/data-types.md#number) } - 等待条件检测限制
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

> 参阅:[wait(condition, limit)](#wait-condition-limit)

```js
waitForPackage('com.android.settings', 5e3);
```

### waitForPackage(packageName, limit, interval)

**`6.2.0`** **`Global`** **`Overload 3/6`** **`A11Y?`** **`Non-UI`**

- **packageName** { [string](../types/data-types.md#string) } - 目标应用包名
- **limit** { [number](../types/data-types.md#number) } - 等待条件检测限制
- **interval** { [number](../types/data-types.md#number) } - 等待条件检测间隔
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

> 参阅:[wait(condition, limit, interval)](#wait-condition-limit-interval)

```js
waitForPackage('com.android.settings', 5e3, 250);
```

### waitForPackage(packageName, callback)

**`6.2.0`** **`Global`** **`Overload 4/6`** **`A11Y?`** **`Non-UI`**

- **packageName** { [string](../types/data-types.md#string) } - 目标应用包名
- **callback** &#123;&#123;
    - then(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
    - else(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
- &#125;&#125; - 等待结束回调对象
- <ins>**returns**</ins> { [R](../types/data-types.md#generic) extends [void](../types/data-types.md#void) ? [boolean](../types/data-types.md#boolean) : [R](../types/data-types.md#generic) }
- <ins>**template**</ins> [T](../types/data-types.md#generic), [R](../types/data-types.md#generic)

> 参阅: [wait(condition, callback)](#wait-condition-callback)

```js
waitForPackage('com.android.settings', {
    then: () => console.log('设置应用已前置'),
});
```

### waitForPackage(packageName, limit, callback)

**`6.2.0`** **`Global`** **`Overload 5/6`** **`A11Y?`** **`Non-UI`**

- **packageName** { [string](../types/data-types.md#string) } - 目标应用包名
- **limit** { [number](../types/data-types.md#number) } - 等待条件检测限制
- **callback** &#123;&#123;
    - then(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
    - else(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
- &#125;&#125; - 等待结束回调对象
- <ins>**returns**</ins> { [R](../types/data-types.md#generic) extends [void](../types/data-types.md#void) ? [boolean](../types/data-types.md#boolean) : [R](../types/data-types.md#generic) }
- <ins>**template**</ins> [T](../types/data-types.md#generic), [R](../types/data-types.md#generic)

> 参阅: [wait(condition, limit, callback)](#wait-condition-limit-callback)

```js
waitForPackage('com.android.settings', 5e3, {
    else: () => console.log('等待超时'),
});
```

### waitForPackage(packageName, limit, interval, callback)

**`6.2.0`** **`Global`** **`Overload 6/6`** **`A11Y?`** **`Non-UI`**

- **packageName** { [string](../types/data-types.md#string) } - 目标应用包名
- **limit** { [number](../types/data-types.md#number) } - 等待条件检测限制
- **interval** { [number](../types/data-types.md#number) } - 等待条件检测间隔
- **callback** &#123;&#123;
    - then(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
    - else(result?: [T](../types/data-types.md#generic))?: [R](../types/data-types.md#generic)
- &#125;&#125; - 等待结束回调对象
- <ins>**returns**</ins> { [R](../types/data-types.md#generic) extends [void](../types/data-types.md#void) ? [boolean](../types/data-types.md#boolean) : [R](../types/data-types.md#generic) }
- <ins>**template**</ins> [T](../types/data-types.md#generic), [R](../types/data-types.md#generic)

> 参阅: [wait(condition, limit, interval, callback)](#wait-condition-limit-interval-callback)

```js
waitForPackage('com.android.settings', 5e3, 250, {
    then: () => console.log('设置应用已前置'),
});
```

## [m] exit

停止脚本运行.

### exit()

**`Global`** **`Overload 1/2`**

- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

通过抛出 `ScriptInterruptedException` 异常实现脚本停止.<br>
因此用 `try` 包裹 `exit()` 语句将会使脚本继续运行片刻:

```js
try {
    log('exit now');
    exit();
    log("after"); /* 控制台不会打印 "after". */
} catch (e) {
    e.javaException instanceof ScriptInterruptedException; // true
}
while (true) log("hello"); /* 控制台将打印一定数量的 "hello". */
```

如果编写的脚本对 "是否停止" 的状态十分敏感,<br>
即要求 exit() 之后的代码一定不被执行,<br>
则可通过附加状态判断实现上述需求:

```js
if (!isStopped()) {
    console.log('脚本仍在运行');
}
```

因此上述示例如果加上状态判断, "hello" 将不会被打印:

```js
try {
    log('exit now');
    exit();
} catch (_) {
    // Ignored.
}
if (!isStopped()) {
    while (true) {
        /* 控制台不会打印 "hello". */
        log("hello");
    }
}
```

除了 [isStopped](#isstopped), 还可通过 `threads` 或 `engines` 模块获取停止状态:

```js
/* threads. */
if (!threads.currentThread().isInterrupted()) {
    console.log('当前线程未中断');
}

/* engines. */
if (!engines.myEngine().isStopped()) {
    console.log('当前引擎未停止');
}
```

### exit(e)

**`Global`** **`Overload 2/2`**

- **e** { [OmniThrowable](../types/omni-types.md#omnithrowable) } - 异常参数
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

停止脚本运行并抛出异常参数指定的异常.

```js
let arg = 'hello';
try {
    if (typeof arg !== "number") {
        throw Error('arg 参数非 number 类型');
    }
} catch (e) {
    exit(e);
}
```

[OmniThrowable](../types/omni-types.md#omnithrowable) 支持字符串参数, 可将字符串参数作为异常消息传入 `exit` 方法中:

```js
let buttonText = '点此开始';
if (!pickup(buttonText)) {
    exit(`"${buttonText}" 按钮不存在.`);
}
```

## [m] stop

### stop()

**`Global`** - <ins>**returns**</ins> { [void](../types/data-types.md#void) }

- **异常 / 生命周期 / 副作用**：传入参数时抛出异常；与 `exit()` 相同，会结束当前脚本引擎

停止脚本运行.

[exit()](#exit) 的别名方法.

> 注: stop 方法不存在 [exit(e)](#exit-e) 对应的重载方法.

```js
if (!isStopped()) {
    stop();
}
```

## [m] isStopped

### isStopped()

**`Global`** **`DEPRECATED`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：传入参数时抛出异常；同步只读查询

检测脚本主线程是否已中断.

即 `runtime.isInterrupted()`.

```js
console.log(isStopped());
```

## [m] isShuttingDown

### isShuttingDown()

**`Global`** **`DEPRECATED`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：传入参数时抛出异常；同步只读查询

检测脚本主线程是否已中断.

因方法名称易造成歧义及混淆, 因此被弃用, 建议使用 [isStopped()](#m-isstopped) 或 `runtime.isInterrupted()` 替代.

```js
console.log(isShuttingDown());
```

## [m] isRunning

### isRunning()

**`Global`** - <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

- **异常 / 副作用**：传入参数时抛出异常；同步只读查询

检测脚本主线程是否未被中断.

即 `!runtime.isInterrupted()`.

```js
console.log(isRunning());
```

## [m] notStopped

### notStopped()

**`Global`** **`DEPRECATED`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：传入参数时抛出异常；同步只读查询

检测脚本主线程是否未被中断.

因方法名称易造成歧义及混淆, 因此被弃用, 建议使用 [isRunning()](#m-isrunning) 或 `!runtime.isInterrupted()` 替代.

```js
console.log(notStopped());
```

## [m] requiresApi

### requiresApi(api)

**`Global`** - **api** { [number](../types/data-types.md#number) } - 安卓 API 级别

- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

脚本运行的最低 API 级别要求.

例如要求脚本运行不低于 [Android API 30 (11) [R]](../../reference/android/api-level.md):

```js
requiresApi(30);
requiresApi(util.versionCodes.R.apiLevel); /* 同上. */
requiresApi(android.os.Build.VERSION_CODES.R); /* 同上. */
```

若 API 级别不符合要求, 脚本抛出异常并停止继续执行.

> 参阅:
> - [Android API Level - 安卓 API 级别](../../reference/android/api-level.md)
> - util.versionCodes

## [m] requiresMonkeykingVersion

### requiresMonkeykingVersion(versionName)

**`Global`** **`Overload 1/2`**

- **versionName** { [string](../types/data-types.md#string) } - Monkey King 版本名称
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

脚本运行的最低 Monkey King 版本要求 (版本名称).

```js
requiresMonkeykingVersion("6.2.0");
```

可通过 `monkeyking.versionName` 查看 Monkey King 版本名称.

> 参阅: [monkeyking.versionName](monkeyking.md#p-versionname)

### requiresMonkeykingVersion(versionCode)

**`Global`** **`Overload 2/2`**

- **versionCode** { [number](../types/data-types.md#number) } - Monkey King 版本号
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

脚本运行的最低 Monkey King 版本要求 (版本号).

```js
requiresMonkeykingVersion(1024);
```

可通过 `monkeyking.versionCode` 查看 Monkey King 版本号.

> 参阅: [monkeyking.versionCode](monkeyking.md#p-versioncode)

## [m] importPackage

### importPackage(...pkg)

**`Global`** - **pkg** { ...( [string](../types/data-types.md#string) | [object](../types/data-types.md#object) ) } - 需导入的 Java 包

- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

```js
/* 导入一个 Java 包. */

importPackage(java.lang);
importPackage('java.lang'); /* 同上. */

/* 导入多个 Java 包. */

importPackage(java.io);
importPackage(java.lang);
importPackage(java.util);

importPackage(java.io, java.lang, java.util); /* 同上. */
```

> 参阅: [访问 Java 包和类](../../reference/android/scripting-java.md#访问-java-包和类)

## [m] importClass

### importClass(...cls)

**`Global`** - **cls** { ...( [string](../types/data-types.md#string) | [object](../types/data-types.md#object) ) } - 需导入的 Java 类

- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

```js
/* 导入一个 Java 类. */

importClass(java.lang.Integer);
importClass('java.lang.Integer'); /* 同上. */

/* 导入多个 Java 类. */

importClass(java.io.File);
importClass(java.lang.Integer);
importClass(java.util.HashMap);

importClass(
    java.io.File,
    java.lang.Integer,
    java.util.HashMap,
); /* 同上. */
```

> 参阅: [访问 Java 包和类](../../reference/android/scripting-java.md#访问-java-包和类)

## [m] currentPackage

### currentPackage(mode?)

**`Global`** **`v6.6.1: mode`**

- **[ mode = `"auto"` ]** { [string](../types/data-types.md#string) | [Object](../types/data-types.md#object) } - 获取方式，或 `{ by }` / `{ mode }`
- <ins>**returns**</ins> { [string](../types/data-types.md#string) }
- **异常**：参数超过 1 个或 mode 未知时抛出异常
- **权限 / 线程 / 副作用**：`accessibility` 依赖无障碍服务，`shizuku` 与 `root` 依赖相应能力；查询可能执行同步系统命令

获取当前应用包名。mode 支持 `auto`、`a11y` / `accessibility`、`shizuku` 与 `root`；自动模式按 Shizuku、Root、无障碍的顺序返回第一个非空结果。

```js
console.log(currentPackage());
console.log(currentPackage({ by: 'accessibility' }));
```

## [m] currentActivity

### currentActivity(mode?)

**`Global`** **`v6.6.1: mode`**

- **[ mode = `"auto"` ]** { [string](../types/data-types.md#string) | [Object](../types/data-types.md#object) }
- <ins>**returns**</ins> { [string](../types/data-types.md#string) }
- **异常、权限、线程与副作用**：与 [currentPackage](#currentpackage-mode) 相同

获取当前 Activity 类名；无法取得时返回空字符串。

```js
console.log(currentActivity('auto'));
```

## [m] currentComponent

### currentComponent(mode?)

**`6.6.1`** **`Global`**

- **[ mode = `"auto"` ]** { [string](../types/data-types.md#string) | [Object](../types/data-types.md#object) }
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 当前组件，无法取得时为空字符串
- **异常、权限、线程与副作用**：与 [currentPackage](#currentpackage-mode) 相同

```js
console.log(currentComponent({ mode: 'shizuku' }));
```

## [m] setClip

### setClip(text)

**`Global`** - **text** { [string](../types/data-types.md#string) } - 剪贴板内容

- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不为 1 时抛出异常
- **权限 / 副作用**：同步写入系统剪贴板；Android 版本和前后台状态可能影响系统可见性

设置系统剪贴板内容.

```js
setClip('copied from Monkey King');
```

> 参阅: [getClip](#m-getclip)

## [m] getClip

### getClip()

**`Global`** - <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 系统剪贴板内容

需额外留意, 自 [Android API 29 (10) [Q]](../../reference/android/api-level.md) 起, 剪贴板数据的访问将受到限制:

为更好地保护用户隐私权, 除默认输入法及当前获取焦点的前置应用外, 均无法访问剪贴板数据.

```js
setClip("test");

/* 安卓 10 以下: 打印 "test". */
/* 安卓 10 及以上: 若 Monkey King 前置, 打印 "test", 否则打印空字符串. */
console.log(getClip());
```

> 参阅: [setClip](#m-setclip)

> 参阅: [Android Docs](https://developer.android.com/about/versions/10/privacy/changes#clipboard-data)

## [m] selector

### selector()

**`Global`** - <ins>**returns**</ins> { [UiSelector](../automation/ui-selector.md) }

- **异常 / 权限 / 副作用**：传入参数时抛出异常；只创建选择器，不立即查询无障碍窗口

构建一个 "空" [选择器](../automation/ui-selector.md).

```js
const emptySelector = selector();
console.log(typeof emptySelector.findOne); // function
```

## [m] pickup

拾取选择器, 简称拾取器, 是高度封装的混合形式选择器, 用于在筛选控件及处理结果过程中实现快捷操作.<br>
支持 [ 选择器多形式混合 / 控件罗盘 / 结果筛选 / 参化调用 ] 等.

参阅 [UiSelector.pickup](../automation/ui-selector.md#m-pickup).

## [m] detect

控件探测.

探测相当于对控件进行一系列组合操作 (罗盘定位, 结果筛选, 参化调用, 回调处理).

参阅 [UiObject#detect](../automation/ui-object.md#m-detect).

## [m] existsAll

### existsAll(...selectors)

**`Global`** - **selectors** { [...](../../project/about.md#可变参数)[PickupSelector](../types/data-types.md#pickupselector)[[]](../../project/about.md#可变参数) } - 混合选择器参数

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 选择器全部满足 "存在" 条件

提供的选择器参数全部满足 "存在" 条件, 即 `selector.exists() === true`.

例如要求当前活动窗口中同时存在以下三个选择器对应的控件:

1. contentMatch(/^开始.*/)
2. descMatch(/descriptions?/)
3. content('点击继续')

```js
console.log(existsAll(contentMatch(/^开始.*/), descMatch(/descriptions?/), content('点击继续'))); /* e.g. true */
```

因混合选择器参数支持对 content 系列选择器的简化, 因此上述示例也可改写为以下形式:

```js
console.log(existsAll(/^开始.*/, descMatch(/descriptions?/), '点击继续')); /* e.g. true */
```

此方法对应的传统的逻辑判断形式:

```js
console.log(contentMatch(/^开始.*/).exists()
    && descMatch(/descriptions?/).exists()
    && content('点击继续').exists()); /* e.g. true */
```

## [m] existsOne

### existsOne(...selectors)

**`Global`** - **selectors** { [...](../../project/about.md#可变参数)[PickupSelector](../types/data-types.md#pickupselector)[[]](../../project/about.md#可变参数) } - 混合选择器参数

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 选择器任一满足 "存在" 条件

提供的选择器参数任一满足 "存在" 条件, 即 `selector.exists() === true`.

例如要求当前活动窗口中存在任意一个以下选择器对应的控件:

1. contentMatch(/^开始.*/)
2. descMatch(/descriptions?/)
3. content('点击继续')

```js
console.log(existsOne(contentMatch(/^开始.*/), descMatch(/descriptions?/), content('点击继续'))); /* e.g. true */
```

因混合选择器参数支持对 content 系列选择器的简化, 因此上述示例也可改写为以下形式:

```js
console.log(existsOne(/^开始.*/, descMatch(/descriptions?/), '点击继续')); /* e.g. true */
```

此方法对应的传统的逻辑判断形式:

```js
console.log(contentMatch(/^开始.*/).exists()
    || descMatch(/descriptions?/).exists()
    || content('点击继续').exists()); /* e.g. true */
```

## [m] setScreenMetrics

### setScreenMetrics(width, height)

**`≤ 6.6.4`** **`Global`** **`Legacy scale API`**

- **width** { [number](../types/data-types.md#number) } - 脚本设计宽度
- **height** { [number](../types/data-types.md#number) } - 脚本设计高度
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不为 2 或数值不能转换为整数时抛出异常
- **线程 / 生命周期 / 副作用**：同步修改当前脚本运行时的旧式 `ScreenMetrics`；影响之后使用该度量对象的坐标缩放，脚本结束后失效

设置旧式自动化坐标缩放的设计分辨率。宽或高为 `0` 时，对应轴的旧式缩放保持原坐标。此方法不会修改 `cX`、`cY` 使用的 720 × 1280 默认基数；后者应通过 `setScaleBases` 配置。

```js
setScreenMetrics(1080, 1920);
click(540, 960); // 由使用 ScreenMetrics 的自动化实现按设备分辨率换算
```

## [m] getScaleBases

### getScaleBases()

**`6.2.0`** **`Global`**

- <ins>**returns**</ins> { [Object](../types/data-types.md#object) } - `{ x, y }` 当前缩放基数的快照
- **异常 / 副作用**：传入参数时抛出异常；同步只读查询

```js
console.log(getScaleBases()); // 默认 { x: 720, y: 1280 }
```

## [m] getScaleBaseX

### getScaleBaseX()

**`6.2.0`** **`Global`**

- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - 当前横坐标缩放基数
- **异常 / 副作用**：传入参数时抛出异常；同步只读查询

```js
console.log(getScaleBaseX()); // 默认 720
```

## [m] getScaleBaseY

### getScaleBaseY()

**`6.2.0`** **`Global`**

- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - 当前纵坐标缩放基数
- **异常 / 副作用**：传入参数时抛出异常；同步只读查询

```js
console.log(getScaleBaseY()); // 默认 1280
```

## [m] setScaleBases

### setScaleBases(baseX, baseY)

**`6.2.0`** **`Global`**

- **baseX** { [number](../types/data-types.md#number) } - 正整数横坐标基数
- **baseY** { [number](../types/data-types.md#number) } - 正整数纵坐标基数
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不为 2、参数不能转换为整数、基数不为正整数，或任一轴在当前运行时已设置过时抛出异常
- **生命周期 / 副作用**：按 X、Y 顺序同步写入当前运行时基数；每个轴最多设置一次，脚本结束后失效

应在首次调用 `cX`、`cY`、`cYx` 或 `cXy` 前统一配置。若 X 写入成功后 Y 校验失败，X 不会自动回滚，因此不要捕获异常后尝试用另一组值重复设置。

```js
setScaleBases(1080, 1920);
console.log(cX(540)); // 当前设备宽度的一半
console.log(cY(960)); // 当前设备高度的一半
```

## [m] setScaleBaseX

### setScaleBaseX(baseX)

**`6.2.0`** **`Global`**

- **baseX** { [number](../types/data-types.md#number) } - 正整数横坐标基数
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不为 1、参数不能转换为整数、值不为正整数，或当前运行时已经设置过 X 基数时抛出异常
- **生命周期 / 副作用**：同步修改之后 `cX` 的默认基数；每个运行时最多成功调用一次，并参与两轴均已设置后的 `cYx` / `cXy` 换算

只设置 X 会使两轴状态不一致，期间调用 `cYx` 或 `cXy` 会抛出异常；需要跨轴换算时应继续设置 Y，或直接使用 `setScaleBases`。

```js
setScaleBaseX(1080);
console.log(getScaleBaseX()); // 1080
```

## [m] setScaleBaseY

### setScaleBaseY(baseY)

**`6.2.0`** **`Global`**

- **baseY** { [number](../types/data-types.md#number) } - 正整数纵坐标基数
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不为 1、参数不能转换为整数、值不为正整数，或当前运行时已经设置过 Y 基数时抛出异常
- **生命周期 / 副作用**：同步修改之后 `cY` 的默认基数；每个运行时最多成功调用一次，并参与两轴均已设置后的 `cYx` / `cXy` 换算

只设置 Y 会使两轴状态不一致，期间调用 `cYx` 或 `cXy` 会抛出异常；需要跨轴换算时应继续设置 X，或直接使用 `setScaleBases`。

```js
setScaleBaseY(1920);
console.log(getScaleBaseY()); // 1920
```

## [m] cX

横坐标标度.

所有重载均同步读取当前设备宽度，不需要额外权限。参数超过 3 个、数值无法转换，或显式 `base` 不是整数时抛出异常；调用本身不修改缩放基数。

### cX()

**`6.2.0`** **`Global`** **`Overload 1/4`**

- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

无参时, 返回当前设备宽度.

```js
console.log(cX() === device.width); // true
```

### cX(x, base)

**`6.2.0`** **`Global`** **`Overload 2/4`**

- **x** { [number](../types/data-types.md#number) } - 绝对坐标值
- **[ base = 720 ]** { [number](../types/data-types.md#number) } - 坐标值基数
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

由基数换算后得到的横坐标值.

例如在一个设备宽度为 `1096` 的设备上的 `100` 像素, 在其他不同宽度的设备上将转换为不同的值:

```js
/* 在宽度为 1096 像素的设备上. */
cX(100, 1096); // 100

/* 在宽度为 1080 像素的设备上. */
cX(100, 1096); // 99

/* 在宽度为 720 像素的设备上. */
cX(100, 1096); // 66

/* 在宽度为 540 像素的设备上. */
cX(100, 1096); // 49
```

上述示例的 `1096` 为基数, 默认基数为 `720`, 如需设置默认基数, 可使用以下方法:

```js
cX(100); /* 相当于 cX(100, 720) . */
setScaleBaseX(1096);
cX(100); /* 相当于 cX(100, 1096) . */
```

默认基数只能修改最多一次.

### cX(x, isRatio)

**`6.2.0`** **`Global`** **`Overload 3/4`**

- **x** { [number](../types/data-types.md#number) } - 绝对坐标值或屏幕宽度百分比
- **[ isRatio = 'auto' ]** { `'auto'` | [boolean](../types/data-types.md#boolean) } - 是否将 `x` 参数强制作为百分比
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

`isRatio` 参数默认为 `auto`, 即由 `x` 参数的范围自动决定 `x` 是否视为百分比,<br>
即当参数 `x` 满足 `-1 < x < 1` 时, `x` 将视为屏幕宽度百分比, 否则将视为绝对坐标值.

`isRatio` 参数为 `true` 时, `x` 参数将强制视为百分比, 如 `cX(2, true)` 意味着两倍屏幕宽度, `2` 的意义不再是像素值.

`isRatio` 参数为 `false` 时, `x` 参数将强制视为绝对坐标值, 如 `cX(0.5, false)` 意味着 `0.5` 像素值, 其意义不再是百分比.

```js
console.log(cX(0.5, true));  // 当前设备宽度的 50%
console.log(cX(0.5, false)); // 按绝对值和当前 X 基数换算
```

### cX(x)

**`6.2.0`** **`Global`** **`Overload 4/4`**

- **x** { [number](../types/data-types.md#number) } - 绝对坐标值或屏幕宽度百分比
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

当参数 `x` 满足 `-1 < x < 1` 时, 相当于 `cX(x, /* isRatio = */ true)`, 即 `x` 将视为屏幕宽度百分比.

当参数 `x` 满足 `x <= -1 | x >= 1` 时, 相当于 `cX(x, /* base = */ 720)`, 即 `x` 将视为绝对坐标值, 另 `base` 参数可能由 `setScaleBaseX` 等方法修改, `720` 为其默认值.

```js
console.log(cX(0.25)); // 当前设备宽度的 25%
console.log(cX(360));  // 默认设计宽度 720 中的 360
```

## [m] cY

纵坐标标度.

所有重载均同步读取当前设备高度，不需要额外权限。参数超过 3 个、数值无法转换，或显式 `base` 不是整数时抛出异常；调用本身不修改缩放基数。

### cY()

**`6.2.0`** **`Global`** **`Overload 1/4`**

- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

无参时, 返回当前设备高度.

```js
console.log(cY() === device.height); // true
```

### cY(y, base)

**`6.2.0`** **`Global`** **`Overload 2/4`**

- **y** { [number](../types/data-types.md#number) } - 绝对坐标值
- **[ base = 1280 ]** { [number](../types/data-types.md#number) } - 坐标值基数
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

由基数换算后得到的纵坐标值.

例如在一个设备高度为 `2560` 的设备上的 `100` 像素, 在其他不同高度的设备上将转换为不同的值:

```js
/* 在高度为 2560 像素的设备上. */
cY(100, 2560); // 100

/* 在高度为 1920 像素的设备上. */
cY(100, 2560); // 75

/* 在高度为 1280 像素的设备上. */
cY(100, 2560); // 50

/* 在高度为 960 像素的设备上. */
cY(100, 2560); // 38
```

上述示例的 `2560` 为基数, 默认基数为 `1280`, 如需设置默认基数, 可使用以下方法:

```js
cY(100); /* 相当于 cY(100, 1280) . */
setScaleBaseY(2560);
cY(100); /* 相当于 cY(100, 2560) . */
```

默认基数只能修改最多一次.

### cY(y, isRatio)

**`6.2.0`** **`Global`** **`Overload 3/4`**

- **y** { [number](../types/data-types.md#number) } - 绝对坐标值或屏幕高度百分比
- **[ isRatio = 'auto' ]** { `'auto'` | [boolean](../types/data-types.md#boolean) } - 是否将 `y` 参数强制作为百分比
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

`isRatio` 参数默认为 `auto`, 即由 `y` 参数的范围自动决定 `y` 是否视为百分比,<br>
即当参数 `y` 满足 `-1 < y < 1` 时, `y` 将视为屏幕高度百分比, 否则将视为绝对坐标值.

`isRatio` 参数为 `true` 时, `y` 参数将强制视为百分比, 如 `cY(2, true)` 意味着两倍屏幕高度, `2` 的意义不再是像素值.

`isRatio` 参数为 `false` 时, `y` 参数将强制视为绝对坐标值, 如 `cY(0.5, false)` 意味着 `0.5` 像素值, 其意义不再是百分比.

```js
console.log(cY(0.5, true));  // 当前设备高度的 50%
console.log(cY(0.5, false)); // 按绝对值和当前 Y 基数换算
```

### cY(y)

**`6.2.0`** **`Global`** **`Overload 4/4`**

- **y** { [number](../types/data-types.md#number) } - 绝对坐标值或屏幕高度百分比
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

当参数 `y` 满足 `-1 < y < 1` 时, 相当于 `cY(y, /* isRatio = */ true)`, 即 `y` 将视为屏幕高度百分比.

当参数 `y` 满足 `y <= -1 | y >= 1` 时, 相当于 `cY(y, /* base = */ 1280)`, 即 `y` 将视为绝对坐标值, 另 `base` 参数可能由 `setScaleBaseY` 等方法修改, `1280` 为其默认值.

```js
console.log(cY(0.25)); // 当前设备高度的 25%
console.log(cY(640));  // 默认设计高度 1280 中的 640
```

## [m] cYx

以横坐标度量的纵坐标标度.

所有重载均同步读取当前显示尺寸，不需要额外权限。参数超过 3 个、比例字符串无效、数值无法转换，或只设置了一个缩放轴导致 X/Y 基数状态不一致时抛出异常；调用本身不修改基数。

与设备高度无关, 与设备宽度相关的坐标标度.

如 `cYx(0.5, '9:16')` 对于以下 5 个设备 (以分辨率区分) 得到的结果是完全一致的:

```text
1. 1080 × 1920
4. 1080 × 2160
5. 1080 × 2340
3. 1080 × 2520
2. 1080 × 2560
```

因为所有设备宽度相同, `cYx` 的结果是高度无关的.

计算结果:

```js
1080 * 0.5 * 16 / 9; // 960
```

设想如下场景, 某个应用页面是可以向下滚动窗口显示更多内容的, 在屏幕上半部分有一个按钮 `BTN`, 距离屏幕上边缘 `H` 距离, 另一台设备与当前设备屏幕宽度相同, 但高度更大, 相当于屏幕纵向变长, 此时按钮 `BTN` 距离屏幕上边缘依然是 `H` 距离, 仅仅是屏幕下方显示了更多内容.<br>
因此可使用 `cYx` 标度表示按钮 `BTN` 的位置, 如 `cYx(0.2, 1080 / 1920)` 或 `cYx(0.2, 9 / 16)` 或 `cYx(0.2, '9:16')`.

上述示例的 `0.2` 是一个相对值, 是相对于当前设备屏幕高度的, 因此第 2 个参数对应设备宽高比例值.<br>
如果使用绝对坐标值 (`Y` 坐标值), 如 `384`, 则第 2 个参数对应的是设备屏幕宽度值:

| 第 1 个参数 | 第 2 个参数 |        示例        |
|:-------:|:-------:|:----------------:|
| Y 坐标百分比 |  设备宽高比  | cYx(0.2, '9:16') |
|  Y 坐标值  |  设备宽度值  |  cYx(384, 1096)  |

### cYx(coordinateY, baseX)

**`6.2.0`** **`Global`** **`Overload [1(A)]/3`**

- **coordinateY** { [number](../types/data-types.md#number) } - 纵坐标值
- **[ baseX = 720 ]** { [number](../types/data-types.md#number) } - 横坐标基数
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

由横坐标基数换算后得到的纵坐标值.

例如在一个设备宽度为 `1096` 设备上的 `512` 像素高度, 在其他不同宽度的设备上将转换为不同的值:

```js
/* 在宽度为 1096 像素的设备上. */
cYx(512, 1096); // 512

/* 在宽度为 1080 像素的设备上. */
cYx(512, 1096); // 505

/* 在宽度为 720 像素的设备上. */
cYx(512, 1096); // 336

/* 在宽度为 540 像素的设备上. */
cYx(512, 1096); // 252
```

上述示例的 `1096` 为基数, 默认基数为 `720`, 如需设置默认基数, 可使用以下方法:

```js
cYx(512); /* 相当于 cYx(512, 720) . */
setScaleBaseX(1096);
cYx(512); /* 相当于 cYx(512, 1096) . */
```

默认基数只能修改最多一次.

### cYx(percentY, ratio)

**`6.2.0`** **`Global`** **`Overload [1(B)]/3`**

- **percentY** { [number](../types/data-types.md#number) } - 纵坐标百分比
- **[ ratio = '9:16' ]** { [number](../types/data-types.md#number) | [string](../types/data-types.md#string) } - 设备宽高比
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

由设备宽高比换算后得到的新纵坐标值.

例如在一个设备宽度与高度分别为 `1096` 和 `2560` 的设备上的 `512` 像素高度, 即 `0.2` 倍的屏幕高度, 在其他不同宽度的设备上将转换为不同的值:

```js
/* 在宽度为 1096 像素的设备上. */
cYx(0.2, 1096 / 2560); // 512

/* 在宽度为 1080 像素的设备上. */
cYx(0.2, 1096 / 2560); // 505

/* 在宽度为 720 像素的设备上. */
cYx(0.2, 1096 / 2560); // 336

/* 在宽度为 540 像素的设备上. */
cYx(0.2, 1096 / 2560); // 252
```

上述示例的 `1096 / 2560` 为基数, 默认基数为 `720 / 1280`, 如需设置默认基数, 可使用以下方法:

```js
cYx(0.2); /* 相当于 cYx(0.2, 720 / 1280) . */
setScaleBases(1096, 2560);
cYx(0.2); /* 相当于 cYx(0.2, 1096 / 2560) . */
```

默认基数只能修改最多一次.

### cYx(y, isRatio)

**`6.2.0`** **`Global`** **`Overload 2/3`**

- **y** { [number](../types/data-types.md#number) } - 绝对坐标值或屏幕高度百分比
- **[ isRatio = 'auto' ]** { `'auto'` | [boolean](../types/data-types.md#boolean) } - 是否将 `y` 参数强制作为百分比
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

`isRatio` 参数默认为 `auto`, 即由 `y` 参数的范围自动决定 `y` 是否视为百分比,<br>
即当参数 `y` 满足 `-1 < y < 1` 时, `y` 将视为屏幕高度百分比, 否则将视为绝对坐标值.

`isRatio` 参数为 `true` 时, `y` 参数将强制视为百分比, 如 `cYx(2, true)` 意味着两倍屏幕高度, `2` 的意义不再是像素值.

`isRatio` 参数为 `false` 时, `y` 参数将强制视为绝对坐标值, 如 `cYx(0.5, false)` 意味着 `0.5` 像素值, 其意义不再是百分比.

```js
console.log(cYx(0.5, true));  // 按默认宽高比换算 50% 高度
console.log(cYx(384, false)); // 按当前 X 基数换算绝对纵坐标
```

### cYx(y)

**`6.2.0`** **`Global`** **`Overload 3/3`**

- **y** { [number](../types/data-types.md#number) } - 绝对坐标值或屏幕高度百分比
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

当参数 `y` 满足 `-1 < y < 1` 时, 相当于 `cYx(y, /* isRatio = */ true)`, 即 `y` 将视为屏幕高度百分比.

当参数 `y` 满足 `y <= -1 | y >= 1` 时, 相当于 `cYx(y, /* base = */ 720)`, 即 `y` 将视为绝对坐标值, 另 `base` 参数可能由 `setScaleBaseX` 等方法修改, `720` 为其默认值.

```js
cYx(0.3); /* 相当于 cYx(0.3, '9:16') . */
cYx(384); /* 相当于 cYx(384, 720) . */
```

## [m] cXy

以纵坐标度量的横坐标标度.

所有重载均同步读取当前显示尺寸，不需要额外权限。参数超过 3 个、比例字符串无效、数值无法转换，或只设置了一个缩放轴导致 X/Y 基数状态不一致时抛出异常；调用本身不修改基数。

与设备宽度无关, 与设备高度相关的坐标标度.

如 `cXy(0.5, '9:16')` 对于以下 5 个设备 (以分辨率区分) 得到的结果是完全一致的:

```text
1. 1080 × 1920
4. 1096 × 1920
5. 720 × 1920
3. 540 × 1920
2. 960 × 1920
```

因为所有设备高度相同, `cXy` 的结果是宽度无关的.

计算结果:

```js
1920 * 0.5 * 9 / 16; // 540
```

设想如下场景, 某个应用页面是可以向右滚动窗口显示更多内容的, 在屏幕左半部分有一个按钮 `BTN`, 距离屏幕左边缘 `W` 距离, 另一台设备与当前设备屏幕高度相同, 但宽度更大, 相当于屏幕横向变长, 此时按钮 `BTN` 距离屏幕左边缘依然是 `W` 距离, 仅仅是屏幕右方显示了更多内容.<br>
因此可使用 `cXy` 标度表示按钮 `BTN` 的位置, 如 `cXy(0.2, 1080 / 1920)` 或 `cXy(0.2, 9 / 16)` 或 `cXy(0.2, '9:16')`.

上述示例的 `0.2` 是一个相对值, 是相对于当前设备屏幕宽度的, 因此第 2 个参数对应设备宽高比例值.<br>
如果使用绝对坐标值 (`X` 坐标值), 如 `384`, 则第 2 个参数对应的是设备屏幕高度值:

| 第 1 个参数 | 第 2 个参数 |        示例        |
|:-------:|:-------:|:----------------:|
| X 坐标百分比 |  设备宽高比  | cXy(0.2, '9:16') |
|  X 坐标值  |  设备高度值  |  cXy(384, 2560)  |

### cXy(coordinateX, baseY)

**`6.2.0`** **`Global`** **`Overload [1(A)]/3`**

- **coordinateX** { [number](../types/data-types.md#number) } - 横坐标值
- **[ baseY = 1280 ]** { [number](../types/data-types.md#number) } - 纵坐标基数
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

由纵坐标基数换算后得到的横坐标值.

例如在一个设备高度为 `2560` 设备上的 `512` 像素宽度, 在其他不同高度的设备上将转换为不同的值:

```js
/* 在高度为 2560 像素的设备上. */
cXy(512, 2560); // 512

/* 在高度为 1920 像素的设备上. */
cXy(512, 2560); // 384

/* 在高度为 1280 像素的设备上. */
cXy(512, 2560); // 256

/* 在高度为 960 像素的设备上. */
cXy(512, 2560); // 192
```

上述示例的 `2560` 为基数, 默认基数为 `1280`, 如需设置默认基数, 可使用以下方法:

```js
cXy(512); /* 相当于 cXy(512, 1280) . */
setScaleBaseY(2560);
cXy(512); /* 相当于 cXy(512, 2560) . */
```

默认基数只能修改最多一次.

### cXy(percentX, ratio)

**`6.2.0`** **`Global`** **`Overload [1(B)]/3`**

- **percentX** { [number](../types/data-types.md#number) } - 横坐标百分比
- **[ ratio = '9:16' ]** { [number](../types/data-types.md#number) | [string](../types/data-types.md#string) } - 设备宽高比
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

由设备宽高比换算后得到的新横坐标值.

例如在一个设备高度与宽度分别为 `1096` 和 `2560` 的设备上的 `548` 像素宽度, 即 `0.5` 倍的屏幕宽度, 在其他不同高度的设备上将转换为不同的值:

```js
/* 在高度为 2560 像素的设备上. */
cXy(0.5, 1096 / 2560); // 548

/* 在高度为 1920 像素的设备上. */
cXy(0.5, 1096 / 2560); // 411

/* 在高度为 1280 像素的设备上. */
cXy(0.5, 1096 / 2560); // 274

/* 在高度为 960 像素的设备上. */
cXy(0.5, 1096 / 2560); // 206
```

上述示例的 `1096 / 2560` 为基数, 默认基数为 `720 / 1280`, 如需设置默认基数, 可使用以下方法:

```js
cXy(0.5); /* 相当于 cXy(0.5, 720 / 1280) . */
setScaleBases(1096, 2560);
cXy(0.5); /* 相当于 cXy(0.5, 1096 / 2560) . */
```

默认基数只能修改最多一次.

### cXy(x, isRatio)

**`6.2.0`** **`Global`** **`Overload 2/3`**

- **x** { [number](../types/data-types.md#number) } - 绝对坐标值或屏幕宽度百分比
- **[ isRatio = 'auto' ]** { `'auto'` | [boolean](../types/data-types.md#boolean) } - 是否将 `x` 参数强制作为百分比
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

`isRatio` 参数默认为 `auto`, 即由 `x` 参数的范围自动决定 `x` 是否视为百分比,<br>
即当参数 `x` 满足 `-1 < x < 1` 时, `x` 将视为屏幕宽度百分比, 否则将视为绝对坐标值.

`isRatio` 参数为 `true` 时, `x` 参数将强制视为百分比, 如 `cXy(2, true)` 意味着两倍屏幕宽度, `2` 的意义不再是像素值.

`isRatio` 参数为 `false` 时, `x` 参数将强制视为绝对坐标值, 如 `cXy(0.5, false)` 意味着 `0.5` 像素值, 其意义不再是百分比.

```js
console.log(cXy(0.5, true));   // 按默认宽高比换算 50% 宽度
console.log(cXy(384, false));  // 按当前 Y 基数换算绝对横坐标
```

### cXy(x)

**`6.2.0`** **`Global`** **`Overload 3/3`**

- **x** { [number](../types/data-types.md#number) } - 绝对坐标值或屏幕宽度百分比
- <ins>**returns**</ins> { [number](../types/data-types.md#number) }

当参数 `x` 满足 `-1 < x < 1` 时, 相当于 `cXy(x, /* isRatio = */ true)`, 即 `x` 将视为屏幕宽度百分比.

当参数 `x` 满足 `x <= -1 | x >= 1` 时, 相当于 `cXy(x, /* base = */ 1280)`, 即 `x` 将视为绝对坐标值, 另 `base` 参数可能由 `setScaleBaseY` 等方法修改, `1280` 为其默认值.

```js
cXy(0.3); /* 相当于 cXy(0.3, '9:16') . */
cXy(384); /* 相当于 cXy(384, 1280) . */
```

## [m+] species

### species(o)

**`6.6.0`** **`Global`** **`Alias: $species`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [string](../types/data-types.md#string) }
- **异常**：参数数量不为 1 时抛出异常；对象转换或种类识别失败时返回 `Unknown`
- **线程 / 权限 / 副作用**：同步纯判断，不需要 Android 权限，也不修改传入对象

查看任意对象经 Rhino `Context.javaToJS` 转换后的种类。JavaScript 对象返回其 Rhino `className`；Java 原生值先转换再判断。无法识别或转换失败时返回 `Unknown`，不会把异常传给调用方。

示例:

```js
species('xyz'); // String
species(20); // Number
species(20n); // BigInt
species(true); // Boolean
species(undefined); // Undefined
species(null); // Null
species(() => null); // Function
species({ a: 'Apple' }); // Object
species([ 5, 10, 15 ]); // Array
species(/^\d{8,11}$/); // RegExp
species(new Date()); // Date
species(new TypeError()); // Error
species(new Map()); // Map
species(new Set()); // Set
species(<text/>); // XML
species(com.qiaomu.monkeyking); // JavaPackage
species(com.qiaomu.monkeyking.R); // JavaClass
```

如需判断某个对象是否为特定的 "种类", 可使用形如 `species.isXxx` 的扩展方法:

```js
species.isObject(23); // false
species.isNumber(23); // true
species.isRegExp(/test$/); // true
```

`isJavaClass`、`isJavaPackage` 和 `isObject` 同时作为全局函数导出；其余判断器通过 `species.isXxx` 调用。

### [m] isArray

#### isArray(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Array`.

```js
console.log(species.isArray([])); // true
```

### [m] isArrayBuffer

#### isArrayBuffer(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `ArrayBuffer`.

```js
console.log(species.isArrayBuffer(new ArrayBuffer(8))); // true
```

### [m] isBigInt

#### isBigInt(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `BigInt`.

```js
console.log(species.isBigInt(1n)); // true
```

### [m] isBoolean

#### isBoolean(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Boolean`.

```js
console.log(species.isBoolean(true)); // true
```

### [m] isContinuation

#### isContinuation(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Continuation`.

```js
console.log(species.isContinuation({})); // false
```

### [m] isDataView

#### isDataView(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `DataView`.

```js
console.log(species.isDataView(new DataView(new ArrayBuffer(8)))); // true
```

### [m] isDate

#### isDate(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Date`.

```js
console.log(species.isDate(new Date())); // true
```

### [m] isError

#### isError(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Error`.

```js
console.log(species.isError(new Error('failed'))); // true
```

### [m] isFloat32Array

#### isFloat32Array(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Float32Array`.

```js
console.log(species.isFloat32Array(new Float32Array(1))); // true
```

### [m] isFloat64Array

#### isFloat64Array(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Float64Array`.

```js
console.log(species.isFloat64Array(new Float64Array(1))); // true
```

### [m] isFunction

#### isFunction(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Function`.

```js
console.log(species.isFunction(() => null)); // true
```

### [m] isInt16Array

#### isInt16Array(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Int16Array`.

```js
console.log(species.isInt16Array(new Int16Array(1))); // true
```

### [m] isInt32Array

#### isInt32Array(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Int32Array`.

```js
console.log(species.isInt32Array(new Int32Array(1))); // true
```

### [m] isInt8Array

#### isInt8Array(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Int8Array`.

```js
console.log(species.isInt8Array(new Int8Array(1))); // true
```

### [m] isJavaObject

#### isJavaObject(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `JavaObject`.

```js
console.log(species.isJavaObject(new java.io.File('/sdcard'))); // true
```

### [m] isJavaClass

#### isJavaClass(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `JavaClass`。此方法也以全局函数 `isJavaClass(o)` 暴露。

```js
console.log(species.isJavaClass(java.lang.String)); // true
```

### [m] isJavaPackage

#### isJavaPackage(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `JavaPackage`.

```js
console.log(species.isJavaPackage(java.lang)); // true
```

### [m] isMap

#### isMap(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Map`.

```js
console.log(species.isMap(new Map())); // true
```

### [m] isNamespace

#### isNamespace(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Namespace`.

```js
console.log(species.isNamespace(new Namespace('urn:example'))); // true
```

### [m] isNull

#### isNull(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Null`.

```js
console.log(species.isNull(null)); // true
```

### [m] isNumber

#### isNumber(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Number`.

```js
console.log(species.isNumber(42)); // true
```

### [m] isObject

#### isObject(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Object`.

```js
console.log(species.isObject({ key: 'value' })); // true
```

### [m] isQName

#### isQName(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `QName`.

```js
console.log(species.isQName(new QName('urn:example', 'name'))); // true
```

### [m] isRegExp

#### isRegExp(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `RegExp`.

```js
console.log(species.isRegExp(/test$/)); // true
```

### [m] isSet

#### isSet(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Set`.

```js
console.log(species.isSet(new Set())); // true
```

### [m] isString

#### isString(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `String`.

```js
console.log(species.isString('text')); // true
```

### [m] isUint16Array

#### isUint16Array(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Uint16Array`.

```js
console.log(species.isUint16Array(new Uint16Array(1))); // true
```

### [m] isUint32Array

#### isUint32Array(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Uint32Array`.

```js
console.log(species.isUint32Array(new Uint32Array(1))); // true
```

### [m] isUint8Array

#### isUint8Array(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Uint8Array`.

```js
console.log(species.isUint8Array(new Uint8Array(1))); // true
```

### [m] isUint8ClampedArray

#### isUint8ClampedArray(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Uint8ClampedArray`.

```js
console.log(species.isUint8ClampedArray(new Uint8ClampedArray(1))); // true
```

### [m] isUndefined

#### isUndefined(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `Undefined`.

```js
console.log(species.isUndefined(undefined)); // true
```

### [m] isWeakMap

#### isWeakMap(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `WeakMap`.

```js
console.log(species.isWeakMap(new WeakMap())); // true
```

### [m] isWeakSet

#### isWeakSet(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `WeakSet`.

```js
console.log(species.isWeakSet(new WeakSet())); // true
```

### [m] isXML

#### isXML(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `XML`.

```js
console.log(species.isXML(<root/>)); // true
```

### [m] isXMLList

#### isXMLList(o)

**`6.6.0`**

- **o** { [any](../types/data-types.md#any) } - 任意对象
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 线程 / 副作用**：参数数量不为 1 时抛出异常；同步纯判断，不需要 Android 权限

判断对象的 "种类" 是否为 `XMLList`.

```js
console.log(species.isXMLList(<><a/><b/></>)); // true
```

## [p] WIDTH

**`6.2.0`** **`Global`** **`Getter`**

- **&lt;get&gt;** [number](../types/data-types.md#number)

[device.width](../system/device.md#device-width) 的别名属性.

## [p] HEIGHT

**`6.2.0`** **`Global`** **`Getter`**

- **&lt;get&gt;** [number](../types/data-types.md#number)

[device.height](../system/device.md#device-height) 的别名属性.

## [p+] R

在代码中使用 R 类的子类中的静态整数可访问 [应用资源](../../reference/glossaries/glossary.md#应用资源), 详情参阅 [资源 ID](../../reference/glossaries/glossary.md#资源-id) 术语.

### [p+] anim

**`6.2.0`** **`Global`**

动画资源.

定义了预先确定的动画.<br>
补间动画保存在 `res/anim/` 中, 可通过 `R.anim` 属性访问.<br>
帧动画保存在 `res/drawable/` 中, 可通过 `R.drawable` 属性访问.

```js
'ui';

ui.layout(<vertical id="main">
    <vertical width="100" height="100" bg="#00695C"></vertical>
</vertical>);

const AnimationUtils = android.view.animation.AnimationUtils;

const mContentContainer = ui.main;
const mSlideDownAnimation = AnimationUtils.loadAnimation(context, R.anim.slide_down);
mSlideDownAnimation.setDuration(2000);
mContentContainer.startAnimation(mSlideDownAnimation);
```

### [p+] array

**`6.2.0`** **`Global`**

静态资源.

提供数组的 XML 资源.

```js
dialogs.build({
    title: R.string.text_pinch_to_zoom,
    items: R.array.values_editor_pinch_to_zoom_strategy,
    itemsSelectMode: 'single',
    itemsSelectedIndex: defSelectedIndex,
    positive: 'OK',
}).on('single_choice', function (idx, item) {
    toastLog(`${idx}: ${item}`);
}).show();
```

### [p+] bool

**`6.2.0`** **`Global`**

静态资源.

包含布尔值的 XML 资源.

```js
console.log(context.getResources().getBoolean(R.bool.pref_auto_check_for_updates));
```

### [p+] color

**`6.2.0`** **`Global`**

静态资源.

包含颜色值 (十六进制颜色) 的 XML 资源.

```js
console.log(colors.toString(context.getColor(R.color.console_view_warn), 6)); // #1976D2
```

### [p+] dimen

**`6.2.0`** **`Global`**

静态资源.

包含尺寸值 (及度量单位) 的 XML 资源.

```js
console.log(context.getResources().getDimensionPixelSize(R.dimen.textSize_item_property)); // e.g. 28
```

### [p+] drawable

**`6.2.0`** **`Global`**

可绘制资源.

使用位图或 XML 定义各种图形.<br>
保存在 `res/drawable/` 中, 可通过 `R.drawable` 属性访问.

```js
/* 绘制一个淡绿色的铃铛图标. */

'ui';

ui.layout(<vertical bg="#FFFFFF">
    <img id="img" tint="#9CCC65"/>
</vertical>);

ui.img.setImageResource(R.drawable.ic_ali_notification);
```

### [p+] id

**`6.2.0`** **`Global`**

静态资源.

为应用资源和组件提供唯一标识符的 XML 资源.

```js
'ui';

ui.layout(<vertical bg="#FFFFFF">
    <text id="txt" size="30"/>
</vertical>);

let childCount = ui.txt.getRootView().findViewById(R.id.action_bar_root).getChildCount(); // e.g 2
ui.txt.setText(`Child count is ${childCount}`);
```

### [p+] integer

**`6.2.0`** **`Global`**

静态资源.

包含整数值的 XML 资源.

```js
console.log(context.getResources().getInteger(R.integer.layout_node_info_view_decoration_line)); // 2
```

### [p+] layout

**`6.2.0`** **`Global`**

布局资源.

定义应用界面的布局.<br>
保存在 `res/layout/` 中, 可通过 `R.layout` 属性访问.

```js
'ui';

activity.setContentView(R.layout.activity_log);
```

### [p+] menu

**`6.2.0`** **`Global`**

菜单资源.

定义应用菜单的内容.<br>
保存在 `res/menu/` 中, 可通过 `R.menu` 属性访问.

```js
'ui';

ui.layout(<vertical bg="#FFFFFF">
    <text id="txt" size="30"/>
</vertical>);

const PopupMenu = android.widget.PopupMenu;

let childCount = ui.txt.getRootView().findViewById(R.id.action_bar_root).getChildCount(); // e.g 2
ui.txt.setText(`Child count is ${childCount}`);

let popupMenu = new PopupMenu(context, ui.txt);
popupMenu.inflate(R.menu.menu_script_options);
popupMenu.show();
```

### [p+] plurals

**`6.2.0`** **`Global`**

静态资源.

定义资源复数形式.

```js
console.log(context.getResources().getQuantityString(
    R.plurals.text_already_stop_n_scripts,
    new java.lang.Integer(1),
    new java.lang.Integer(1))); // e.g. 1 script stopped
console.log(context.getResources().getQuantityString(
    R.plurals.text_already_stop_n_scripts,
    new java.lang.Integer(3),
    new java.lang.Integer(3))); // e.g. 3 scripts stopped
```

### [p+] string

**`6.2.0`** **`Global`**

字符串资源.

定义字符串.<br>
保存在 `res/values/` 中, 可通过 `R.string` 属性访问.

```js
console.log(context.getString(R.string.app_name)); // Monkey King
```

### [p+] strings

**`6.2.0`** **`Global`**

字符串资源.

同 [R.string](#p-string).<br>
因 `TypeScript Declarations (TS 声明文件)` 中, `string` 为保留关键字, 不能作为类名使用, 为了使 `IDE` 实现智能补全, 特提供 `R.strings` 别名类.

```js
console.log(context.getString(R.strings.app_name)); // Monkey King
console.log(context.getString(R.string.app_name)); /* 同上, 但 IDE 无法智能补全. */
```

### [p+] style

**`6.2.0`** **`Global`**

样式资源.

定义界面元素的外观和格式.<br>
保存在 `res/values/` 中, 可通过 `R.style` 属性访问.

```js
'ui';

const MaterialDialog = com.afollestad.materialdialogs.MaterialDialog;
const ContextThemeWrapper = android.view.ContextThemeWrapper;

new MaterialDialog.Builder(new ContextThemeWrapper(activity, R.style.Material3DarkTheme))
    .title('Hello')
    .content('This is a test for showing a dialog with material 3 dark theme.')
    .positiveText('OK')
    .onPositive(() => ui.finish())
    .cancelable(false)
    .build()
    .show();
```

## 引擎全局与注入类

以下入口在 Rhino 2.0 引擎初始化阶段加入顶层作用域，版本记作 **≤ v6.6.4（旧文档未记录精确版本）**。读取入口本身不申请 Android 权限；真正的权限、线程、生命周期和副作用由后续调用的目标 API 决定。

### ResultAdapter

`ResultAdapter` 是只读、永久的引擎全局构造器，用来把回调式或 `ScriptPromiseAdapter` 异步结果转换为可等待结果。

- `new ResultAdapter()`：UI 线程路径创建 `continuation`；其他线程路径创建 `threads.disposable()`。
- `adapter.setResult(value)` / `adapter.setError(error)`：完成等待或保存恢复数据。
- `adapter.callback()`：返回 `(result, error) => void` 形式的绑定回调。
- `adapter.get()`：已有结果时立即返回或抛错；否则阻塞当前非 UI 线程，或通过 UI continuation 等待。
- `ResultAdapter.promise(promiseAdapter)`：把项目 `ScriptPromiseAdapter` 包装为 JavaScript `Promise`。
- `ResultAdapter.wait(promise)`：continuation 可用时调用 `await()`，否则调用扩展 `wait()`。

不要在不允许 continuation 的 UI 路径上自行阻塞；错误值为 `null` 或 `undefined` 时还要留意 [continuation 的 nullish 等待限制](../system/continuation.md)。

```js
const adapter = new ResultAdapter();
setTimeout(() => adapter.setResult('done'), 10);
console.log(adapter.get()); // done
```

### i18n

全局 `i18n` getter 返回当前脚本运行时惰性加载的 i18n 函数对象。模块对象随脚本引擎生命周期复用；读取 getter 不产生副作用，首次访问可能触发内部 `require('i18n')`。

给 `i18n.banana` 重新赋值不会替换模块闭包捕获的 Banana-i18n 解析器，可调用的 `i18n` 与其包装方法仍使用原始实例。需要切换语言或消息源时，应使用 [i18n 模块公开方法](../utilities/i18n.md)，不要把属性替换当作依赖注入。

### Java / Android 类绑定

固定源码的 `GlobalClasses` 将 Android、AndroidX、Java、OkHttp、OpenCV、项目类和其他依赖类以短名称放入全局作用域。例如 `Bitmap` 对应 `android.graphics.Bitmap`，`File` 对应 `java.io.File`。这些值是目标类对象：

```js
console.log(Bitmap);
const file = new File(files.path('./example.txt'));
console.log(file.getAbsolutePath());
```

构造参数、静态成员、Android API level、线程限制和资源释放规则均以目标类型为准。下表为每个实际注入名称提供唯一锚点、完整类名、固定源码位置；Android / AndroidX / Java / OkHttp / OpenCV 类型同时链接其上游参考。

<!-- fixed-source-contracts:start -->

## 固定源码合同表

下表覆盖本页在固定提交 `bafa2986212d` 中的每个 canonical 公共成员。每行同时给出稳定锚点、源码位置、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Z2xvYmFsOkFjY2Vzc2liaWxpdHlCcmlkZ2U"></a> `global:AccessibilityBridge` | `AccessibilityBridge` → `com.qiaomu.monkeyking.core.accessibility.AccessibilityBridge` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L219` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(AccessibilityBridge);` |
| <a id="api-symbol-Z2xvYmFsOkFuZHJvaWRVdGlscw"></a> `global:AndroidUtils` | `AndroidUtils` → `com.qiaomu.monkeyking.util.AndroidUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L303` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(AndroidUtils);` |
| <a id="api-symbol-Z2xvYmFsOkFwa0J1aWxkZXI"></a> `global:ApkBuilder` | `ApkBuilder` → `com.qiaomu.monkeyking.apkbuilder.ApkBuilder` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L225` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ApkBuilder);` |
| <a id="api-symbol-Z2xvYmFsOkFwcA"></a> `global:App` | `App` → `com.qiaomu.monkeyking.util.App` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L300` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(App);` |
| <a id="api-symbol-Z2xvYmFsOkFwcFV0aWxz"></a> `global:AppUtils` | `AppUtils` → `com.qiaomu.monkeyking.runtime.api.AppUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L282` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(AppUtils);` |
| <a id="api-symbol-Z2xvYmFsOkFycmF5VXRpbHM"></a> `global:ArrayUtils` | `ArrayUtils` → `com.qiaomu.monkeyking.util.ArrayUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L306` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ArrayUtils);` |
| <a id="api-symbol-Z2xvYmFsOkF0b21pY0xvbmc"></a> `global:AtomicLong` | `AtomicLong` → [java.util.concurrent.atomic.AtomicLong](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/atomic/AtomicLong.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L183` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(AtomicLong);` |
| <a id="api-symbol-Z2xvYmFsOkJhc2U2NA"></a> `global:Base64` | `Base64` → [android.util.Base64](https://developer.android.com/reference/android/util/Base64) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L81` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Base64);` |
| <a id="api-symbol-Z2xvYmFsOkJpZ1RleHRTdHlsZQ"></a> `global:BigTextStyle` | `BigTextStyle` → [androidx.core.app.NotificationCompat.BigTextStyle](https://developer.android.com/reference/androidx/core/app/NotificationCompat.BigTextStyle) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L126` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(BigTextStyle);` |
| <a id="api-symbol-Z2xvYmFsOkJpdG1hcA"></a> `global:Bitmap` | `Bitmap` → [android.graphics.Bitmap](https://developer.android.com/reference/android/graphics/Bitmap) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L36` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Bitmap);` |
| <a id="api-symbol-Z2xvYmFsOkJpdG1hcEZhY3Rvcnk"></a> `global:BitmapFactory` | `BitmapFactory` → [android.graphics.BitmapFactory](https://developer.android.com/reference/android/graphics/BitmapFactory) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L39` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(BitmapFactory);` |
| <a id="api-symbol-Z2xvYmFsOkJ1aWxk"></a> `global:Build` | `Build` → [android.os.Build](https://developer.android.com/reference/android/os/Build) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L57` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Build);` |
| <a id="api-symbol-Z2xvYmFsOkJ1aWxkQ29uZmln"></a> `global:BuildConfig` | `BuildConfig` → `com.qiaomu.monkeyking.BuildConfig` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L348` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(BuildConfig);` |
| <a id="api-symbol-Z2xvYmFsOkJ5dGVBcnJheU91dHB1dFN0cmVhbQ"></a> `global:ByteArrayOutputStream` | `ByteArrayOutputStream` → [java.io.ByteArrayOutputStream](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/ByteArrayOutputStream.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L150` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ByteArrayOutputStream);` |
| <a id="api-symbol-Z2xvYmFsOkNhbGxiYWNr"></a> `global:Callback` | `Callback` → [okhttp3.Callback](https://square.github.io/okhttp/5.x/okhttp/okhttp3/) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L189` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Callback);` |
| <a id="api-symbol-Z2xvYmFsOkNvbG9yRGV0ZWN0b3I"></a> `global:ColorDetector` | `ColorDetector` → `com.qiaomu.monkeyking.core.image.ColorDetector` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L243` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ColorDetector);` |
| <a id="api-symbol-Z2xvYmFsOkNvbG9yRHJhd2FibGU"></a> `global:ColorDrawable` | `ColorDrawable` → [android.graphics.drawable.ColorDrawable](https://developer.android.com/reference/android/graphics/drawable/ColorDrawable) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L51` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ColorDrawable);` |
| <a id="api-symbol-Z2xvYmFsOkNvbG9yU3RhdGVMaXN0"></a> `global:ColorStateList` | `ColorStateList` → [android.content.res.ColorStateList](https://developer.android.com/reference/android/content/res/ColorStateList) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L33` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ColorStateList);` |
| <a id="api-symbol-Z2xvYmFsOkNvbG9yVGFibGU"></a> `global:ColorTable` | `ColorTable` → `com.qiaomu.monkeyking.core.image.ColorTable` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L246` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ColorTable);` |
| <a id="api-symbol-Z2xvYmFsOkNvbG9yVXRpbHM"></a> `global:ColorUtils` | `ColorUtils` → `com.qiaomu.monkeyking.util.ColorUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L309` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ColorUtils);` |
| <a id="api-symbol-Z2xvYmFsOkNvbXBvbmVudE5hbWU"></a> `global:ComponentName` | `ComponentName` → [android.content.ComponentName](https://developer.android.com/reference/android/content/ComponentName) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L21` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ComponentName);` |
| <a id="api-symbol-Z2xvYmFsOkNvbnNvbGVVdGlscw"></a> `global:ConsoleUtils` | `ConsoleUtils` → `com.qiaomu.monkeyking.util.ConsoleUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L312` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ConsoleUtils);` |
| <a id="api-symbol-Z2xvYmFsOkNvbnRleHQ"></a> `global:Context` | `Context` → [android.content.Context](https://developer.android.com/reference/android/content/Context) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L24` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Context);` |
| <a id="api-symbol-Z2xvYmFsOkNvbnRleHRUaGVtZVdyYXBwZXI"></a> `global:ContextThemeWrapper` | `ContextThemeWrapper` → [android.view.ContextThemeWrapper](https://developer.android.com/reference/android/view/ContextThemeWrapper) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L90` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ContextThemeWrapper);` |
| <a id="api-symbol-Z2xvYmFsOkNvbnRpbnVhdGlvbkNyZWF0b3I"></a> `global:ContinuationCreator` | `ContinuationCreator` → `com.qiaomu.monkeyking.runtime.api.augment.continuation.Creator` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L261` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ContinuationCreator);` |
| <a id="api-symbol-Z2xvYmFsOkNvbnRpbnVhdGlvblJlc3VsdA"></a> `global:ContinuationResult` | `ContinuationResult` → `com.qiaomu.monkeyking.rhino.continuation.Continuation.Result` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L258` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ContinuationResult);` |
| <a id="api-symbol-Z2xvYmFsOkNyeXB0bw"></a> `global:Crypto` | `Crypto` → `com.qiaomu.monkeyking.core.crypto.Crypto` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L234` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Crypto);` |
| <a id="api-symbol-Z2xvYmFsOkN2VHlwZQ"></a> `global:CvType` | `CvType` → [org.opencv.core.CvType](https://docs.opencv.org/4.x/javadoc/org/opencv/core/CvType.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L363` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(CvType);` |
| <a id="api-symbol-Z2xvYmFsOkRldmljZVV0aWxz"></a> `global:DeviceUtils` | `DeviceUtils` → `com.qiaomu.monkeyking.util.DeviceUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L315` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(DeviceUtils);` |
| <a id="api-symbol-Z2xvYmFsOkRpc3BsYXlVdGlscw"></a> `global:DisplayUtils` | `DisplayUtils` → `com.qiaomu.monkeyking.util.DisplayUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L318` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(DisplayUtils);` |
| <a id="api-symbol-Z2xvYmFsOkR5bmFtaWNMYXlvdXRJbmZsYXRlcg"></a> `global:DynamicLayoutInflater` | `DynamicLayoutInflater` → `com.qiaomu.monkeyking.core.ui.inflater.DynamicLayoutInflater` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L255` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(DynamicLayoutInflater);` |
| <a id="api-symbol-Z2xvYmFsOkV2YWx1YXRvckV4Y2VwdGlvbg"></a> `global:EvaluatorException` | `EvaluatorException` → `org.mozilla.javascript.EvaluatorException` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L468` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(EvaluatorException);` |
| <a id="api-symbol-Z2xvYmFsOkV2ZW50RW1pdHRlcg"></a> `global:EventEmitter` | `EventEmitter` → `com.qiaomu.monkeyking.core.eventloop.EventEmitter` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L237` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(EventEmitter);` |
| <a id="api-symbol-Z2xvYmFsOkZpbGU"></a> `global:File` | `File` → [java.io.File](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/File.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L153` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(File);` |
| <a id="api-symbol-Z2xvYmFsOkZpbGVQcm92aWRlcg"></a> `global:FileProvider` | `FileProvider` → [androidx.core.content.FileProvider](https://developer.android.com/reference/androidx/core/content/FileProvider) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L132` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(FileProvider);` |
| <a id="api-symbol-Z2xvYmFsOkZvcm1Cb2R5"></a> `global:FormBody` | `FormBody` → [okhttp3.FormBody](https://square.github.io/okhttp/5.x/okhttp/okhttp3/) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L192` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(FormBody);` |
| <a id="api-symbol-Z2xvYmFsOkdlc3R1cmVSZXN1bHRDYWxsYmFjaw"></a> `global:GestureResultCallback` | `GestureResultCallback` → [android.accessibilityservice.AccessibilityService.GestureResultCallback](https://developer.android.com/reference/android/accessibilityservice/AccessibilityService.GestureResultCallback) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L9` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(GestureResultCallback);` |
| <a id="api-symbol-Z2xvYmFsOmdsb2JhbA"></a> `global:global` | `global` 引擎全局入口 · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/engine/RhinoJavaScriptEngine.kt:L114` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof global);` |
| <a id="api-symbol-Z2xvYmFsOkdsb2JhbEFwcENvbnRleHQ"></a> `global:GlobalAppContext` | `GlobalAppContext` → `com.qiaomu.monkeyking.app.GlobalAppContext` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L216` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(GlobalAppContext);` |
| <a id="api-symbol-Z2xvYmFsOkdyYXZpdHk"></a> `global:Gravity` | `Gravity` → [android.view.Gravity](https://developer.android.com/reference/android/view/Gravity) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L93` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Gravity);` |
| <a id="api-symbol-Z2xvYmFsOkhhbmRsZXI"></a> `global:Handler` | `Handler` → [android.os.Handler](https://developer.android.com/reference/android/os/Handler) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L60` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Handler);` |
| <a id="api-symbol-Z2xvYmFsOmkxOG4"></a> `global:i18n` | `i18n` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L118` | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(i18n);` |
| <a id="api-symbol-Z2xvYmFsOkltYWdl"></a> `global:Image` | `Image` → `ImageWrapper` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L471` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Image);` |
| <a id="api-symbol-Z2xvYmFsOkltYWdlVmlld0NvbXBhdA"></a> `global:ImageViewCompat` | `ImageViewCompat` → [androidx.core.widget.ImageViewCompat](https://developer.android.com/reference/androidx/core/widget/ImageViewCompat) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L135` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ImageViewCompat);` |
| <a id="api-symbol-Z2xvYmFsOkltYWdlV3JhcHBlcg"></a> `global:ImageWrapper` | `ImageWrapper` → `com.qiaomu.monkeyking.core.image.ImageWrapper` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L249` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ImageWrapper);` |
| <a id="api-symbol-Z2xvYmFsOkltZ2NvZGVjcw"></a> `global:Imgcodecs` | `Imgcodecs` → [org.opencv.imgcodecs.Imgcodecs](https://docs.opencv.org/4.x/javadoc/org/opencv/imgcodecs/Imgcodecs.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L360` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Imgcodecs);` |
| <a id="api-symbol-Z2xvYmFsOkltZ3Byb2M"></a> `global:Imgproc` | `Imgproc` → [org.opencv.imgproc.Imgproc](https://docs.opencv.org/4.x/javadoc/org/opencv/imgproc/Imgproc.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L357` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Imgproc);` |
| <a id="api-symbol-Z2xvYmFsOklucHV0VHlwZQ"></a> `global:InputType` | `InputType` → [android.text.InputType](https://developer.android.com/reference/android/text/InputType) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L72` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(InputType);` |
| <a id="api-symbol-Z2xvYmFsOkludGVudA"></a> `global:Intent` | `Intent` → [android.content.Intent](https://developer.android.com/reference/android/content/Intent) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L27` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Intent);` |
| <a id="api-symbol-Z2xvYmFsOkludGVudFV0aWxz"></a> `global:IntentUtils` | `IntentUtils` → `com.qiaomu.monkeyking.util.IntentUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L321` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(IntentUtils);` |
| <a id="api-symbol-Z2xvYmFsOkphdmFTY3JpcHRFbmdpbmU"></a> `global:JavaScriptEngine` | `JavaScriptEngine` → `com.qiaomu.monkeyking.engine.JavaScriptEngine` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L264` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JavaScriptEngine);` |
| <a id="api-symbol-Z2xvYmFsOkphdmFTY3JpcHRTb3VyY2U"></a> `global:JavaScriptSource` | `JavaScriptSource` → `com.qiaomu.monkeyking.script.JavaScriptSource` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L294` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JavaScriptSource);` |
| <a id="api-symbol-Z2xvYmFsOkphdmFVdGlscw"></a> `global:JavaUtils` | `JavaUtils` → `com.qiaomu.monkeyking.util.JavaUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L324` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JavaUtils);` |
| <a id="api-symbol-Z2xvYmFsOkpzQXBwQmFyTGF5b3V0"></a> `global:JsAppBarLayout` | `JsAppBarLayout` → `com.qiaomu.monkeyking.core.ui.widget.JsAppBarLayout` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L369` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsAppBarLayout);` |
| <a id="api-symbol-Z2xvYmFsOkpzQnV0dG9u"></a> `global:JsButton` | `JsButton` → `com.qiaomu.monkeyking.core.ui.widget.JsButton` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L372` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsButton);` |
| <a id="api-symbol-Z2xvYmFsOkpzQ2FudmFzVmlldw"></a> `global:JsCanvasView` | `JsCanvasView` → `com.qiaomu.monkeyking.core.ui.widget.JsCanvasView` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L375` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsCanvasView);` |
| <a id="api-symbol-Z2xvYmFsOkpzQ2FyZFZpZXc"></a> `global:JsCardView` | `JsCardView` → `com.qiaomu.monkeyking.core.ui.widget.JsCardView` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L378` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsCardView);` |
| <a id="api-symbol-Z2xvYmFsOkpzQ2hlY2tCb3g"></a> `global:JsCheckBox` | `JsCheckBox` → `com.qiaomu.monkeyking.core.ui.widget.JsCheckBox` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L381` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsCheckBox);` |
| <a id="api-symbol-Z2xvYmFsOkpzQ29uc29sZVZpZXc"></a> `global:JsConsoleView` | `JsConsoleView` → `com.qiaomu.monkeyking.core.ui.widget.JsConsoleView` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L384` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsConsoleView);` |
| <a id="api-symbol-Z2xvYmFsOkpzRGF0ZVBpY2tlcg"></a> `global:JsDatePicker` | `JsDatePicker` → `com.qiaomu.monkeyking.core.ui.widget.JsDatePicker` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L387` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsDatePicker);` |
| <a id="api-symbol-Z2xvYmFsOkpzRHJhd2VyTGF5b3V0"></a> `global:JsDrawerLayout` | `JsDrawerLayout` → `com.qiaomu.monkeyking.core.ui.widget.JsDrawerLayout` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L390` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsDrawerLayout);` |
| <a id="api-symbol-Z2xvYmFsOkpzRWRpdFRleHQ"></a> `global:JsEditText` | `JsEditText` → `com.qiaomu.monkeyking.core.ui.widget.JsEditText` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L393` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsEditText);` |
| <a id="api-symbol-Z2xvYmFsOkpzRmxvYXRpbmdBY3Rpb25CdXR0b24"></a> `global:JsFloatingActionButton` | `JsFloatingActionButton` → `com.qiaomu.monkeyking.core.ui.widget.JsFloatingActionButton` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L396` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsFloatingActionButton);` |
| <a id="api-symbol-Z2xvYmFsOkpzRnJhbWVMYXlvdXQ"></a> `global:JsFrameLayout` | `JsFrameLayout` → `com.qiaomu.monkeyking.core.ui.widget.JsFrameLayout` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L399` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsFrameLayout);` |
| <a id="api-symbol-Z2xvYmFsOkpzR3JpZFZpZXc"></a> `global:JsGridView` | `JsGridView` → `com.qiaomu.monkeyking.core.ui.widget.JsGridView` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L402` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsGridView);` |
| <a id="api-symbol-Z2xvYmFsOkpzSW1hZ2VCdXR0b24"></a> `global:JsImageButton` | `JsImageButton` → `com.qiaomu.monkeyking.core.ui.widget.JsImageButton` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L405` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsImageButton);` |
| <a id="api-symbol-Z2xvYmFsOkpzSW1hZ2VWaWV3"></a> `global:JsImageView` | `JsImageView` → `com.qiaomu.monkeyking.core.ui.widget.JsImageView` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L408` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsImageView);` |
| <a id="api-symbol-Z2xvYmFsOkpzTGluZWFyTGF5b3V0"></a> `global:JsLinearLayout` | `JsLinearLayout` → `com.qiaomu.monkeyking.core.ui.widget.JsLinearLayout` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L411` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsLinearLayout);` |
| <a id="api-symbol-Z2xvYmFsOkpzTGlzdFZpZXc"></a> `global:JsListView` | `JsListView` → `com.qiaomu.monkeyking.core.ui.widget.JsListView` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L414` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsListView);` |
| <a id="api-symbol-Z2xvYmFsOkpzUHJvZ3Jlc3NCYXI"></a> `global:JsProgressBar` | `JsProgressBar` → `com.qiaomu.monkeyking.core.ui.widget.JsProgressBar` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L417` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsProgressBar);` |
| <a id="api-symbol-Z2xvYmFsOkpzUmFkaW9CdXR0b24"></a> `global:JsRadioButton` | `JsRadioButton` → `com.qiaomu.monkeyking.core.ui.widget.JsRadioButton` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L420` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsRadioButton);` |
| <a id="api-symbol-Z2xvYmFsOkpzUmFkaW9Hcm91cA"></a> `global:JsRadioGroup` | `JsRadioGroup` → `com.qiaomu.monkeyking.core.ui.widget.JsRadioGroup` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L423` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsRadioGroup);` |
| <a id="api-symbol-Z2xvYmFsOkpzUmF0aW5nQmFy"></a> `global:JsRatingBar` | `JsRatingBar` → `com.qiaomu.monkeyking.core.ui.widget.JsRatingBar` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L426` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsRatingBar);` |
| <a id="api-symbol-Z2xvYmFsOkpzUmVsYXRpdmVMYXlvdXQ"></a> `global:JsRelativeLayout` | `JsRelativeLayout` → `com.qiaomu.monkeyking.core.ui.widget.JsRelativeLayout` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L429` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsRelativeLayout);` |
| <a id="api-symbol-Z2xvYmFsOkpzU2Nyb2xsVmlldw"></a> `global:JsScrollView` | `JsScrollView` → `com.qiaomu.monkeyking.core.ui.widget.JsScrollView` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L432` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsScrollView);` |
| <a id="api-symbol-Z2xvYmFsOkpzU2Vla0Jhcg"></a> `global:JsSeekBar` | `JsSeekBar` → `com.qiaomu.monkeyking.core.ui.widget.JsSeekBar` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L435` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsSeekBar);` |
| <a id="api-symbol-Z2xvYmFsOkpzU3Bpbm5lcg"></a> `global:JsSpinner` | `JsSpinner` → `com.qiaomu.monkeyking.core.ui.widget.JsSpinner` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L438` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsSpinner);` |
| <a id="api-symbol-Z2xvYmFsOkpzU3dpdGNo"></a> `global:JsSwitch` | `JsSwitch` → `com.qiaomu.monkeyking.core.ui.widget.JsSwitch` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L441` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsSwitch);` |
| <a id="api-symbol-Z2xvYmFsOkpzVGFiTGF5b3V0"></a> `global:JsTabLayout` | `JsTabLayout` → `com.qiaomu.monkeyking.core.ui.widget.JsTabLayout` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L444` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsTabLayout);` |
| <a id="api-symbol-Z2xvYmFsOkpzVGV4dENsb2Nr"></a> `global:JsTextClock` | `JsTextClock` → `com.qiaomu.monkeyking.core.ui.widget.JsTextClock` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L447` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsTextClock);` |
| <a id="api-symbol-Z2xvYmFsOkpzVGV4dFZpZXc"></a> `global:JsTextView` | `JsTextView(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L474` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsTextView);` |
| <a id="api-symbol-Z2xvYmFsOkpzVGltZVBpY2tlcg"></a> `global:JsTimePicker` | `JsTimePicker` → `com.qiaomu.monkeyking.core.ui.widget.JsTimePicker` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L450` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsTimePicker);` |
| <a id="api-symbol-Z2xvYmFsOkpzVG9nZ2xlQnV0dG9u"></a> `global:JsToggleButton` | `JsToggleButton` → `com.qiaomu.monkeyking.core.ui.widget.JsToggleButton` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L453` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsToggleButton);` |
| <a id="api-symbol-Z2xvYmFsOkpzVG9vbGJhcg"></a> `global:JsToolbar` | `JsToolbar` → `com.qiaomu.monkeyking.core.ui.widget.JsToolbar` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L456` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsToolbar);` |
| <a id="api-symbol-Z2xvYmFsOkpzVmlld1BhZ2Vy"></a> `global:JsViewPager` | `JsViewPager` → `com.qiaomu.monkeyking.core.ui.widget.JsViewPager` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L459` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsViewPager);` |
| <a id="api-symbol-Z2xvYmFsOkpzV2ViVmlldw"></a> `global:JsWebView` | `JsWebView` → `com.qiaomu.monkeyking.core.ui.widget.JsWebView` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L462` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(JsWebView);` |
| <a id="api-symbol-Z2xvYmFsOktleUV2ZW50"></a> `global:KeyEvent` | `KeyEvent` → [android.view.KeyEvent](https://developer.android.com/reference/android/view/KeyEvent) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L96` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(KeyEvent);` |
| <a id="api-symbol-Z2xvYmFsOkxheW91dFBhcmFtcw"></a> `global:LayoutParams` | `LayoutParams` → [android.view.WindowManager.LayoutParams](https://developer.android.com/reference/android/view/WindowManager.LayoutParams) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L108` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(LayoutParams);` |
| <a id="api-symbol-Z2xvYmFsOkxldmVs"></a> `global:Level` | `Level` → `org.apache.log4j.Level` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L210` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Level);` |
| <a id="api-symbol-Z2xvYmFsOkxpbmtpZnk"></a> `global:Linkify` | `Linkify` → [android.text.util.Linkify](https://developer.android.com/reference/android/text/util/Linkify) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L78` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Linkify);` |
| <a id="api-symbol-Z2xvYmFsOkxvY2FsZQ"></a> `global:Locale` | `Locale` → [java.util.Locale](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Locale.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L180` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Locale);` |
| <a id="api-symbol-Z2xvYmFsOkxvZw"></a> `global:Log` | `Log` → [android.util.Log](https://developer.android.com/reference/android/util/Log) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L84` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Log);` |
| <a id="api-symbol-Z2xvYmFsOkxvZ0NvbmZpZ3VyYXRvcg"></a> `global:LogConfigurator` | `LogConfigurator` → `de.mindpipe.android.logging.log4j.LogConfigurator` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L144` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(LogConfigurator);` |
| <a id="api-symbol-Z2xvYmFsOkxvZ01hbmFnZXI"></a> `global:LogManager` | `LogManager` → `org.apache.log4j.LogManager` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L213` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(LogManager);` |
| <a id="api-symbol-Z2xvYmFsOkxvb3Blcg"></a> `global:Looper` | `Looper` → [android.os.Looper](https://developer.android.com/reference/android/os/Looper) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L63` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Looper);` |
| <a id="api-symbol-Z2xvYmFsOk1hbmlmZXN0"></a> `global:Manifest` | `Manifest` → [android.Manifest](https://developer.android.com/reference/android/Manifest) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L6` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Manifest);` |
| <a id="api-symbol-Z2xvYmFsOk1hdA"></a> `global:Mat` | `Mat` → `com.qiaomu.monkeyking.core.opencv.Mat` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L252` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Mat);` |
| <a id="api-symbol-Z2xvYmFsOk1hdGVyaWFsRGlhbG9n"></a> `global:MaterialDialog` | `MaterialDialog` → `com.afollestad.materialdialogs.MaterialDialog` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L141` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(MaterialDialog);` |
| <a id="api-symbol-Z2xvYmFsOk1lZGlhVHlwZQ"></a> `global:MediaType` | `MediaType` → [okhttp3.MediaType](https://square.github.io/okhttp/5.x/okhttp/okhttp3/) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L195` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(MediaType);` |
| <a id="api-symbol-Z2xvYmFsOk1pbWVUeXBlTWFw"></a> `global:MimeTypeMap` | `MimeTypeMap` → [android.webkit.MimeTypeMap](https://developer.android.com/reference/android/webkit/MimeTypeMap) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L111` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(MimeTypeMap);` |
| <a id="api-symbol-Z2xvYmFsOk1vdGlvbkV2ZW50"></a> `global:MotionEvent` | `MotionEvent` → [android.view.MotionEvent](https://developer.android.com/reference/android/view/MotionEvent) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L99` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(MotionEvent);` |
| <a id="api-symbol-Z2xvYmFsOk11bHRpcGFydEJvZHk"></a> `global:MultipartBody` | `MultipartBody` → [okhttp3.MultipartBody](https://square.github.io/okhttp/5.x/okhttp/okhttp3/) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L198` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(MultipartBody);` |
| <a id="api-symbol-Z2xvYmFsOk11dGFibGVPa0h0dHA"></a> `global:MutableOkHttp` | `MutableOkHttp` → `com.qiaomu.monkeyking.core.http.MutableOkHttp` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L240` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(MutableOkHttp);` |
| <a id="api-symbol-Z2xvYmFsOk5ldHdvcmtVdGlscw"></a> `global:NetworkUtils` | `NetworkUtils` → `com.qiaomu.monkeyking.util.NetworkUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L327` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(NetworkUtils);` |
| <a id="api-symbol-Z2xvYmFsOk5vdGlmaWNhdGlvbg"></a> `global:Notification` | `Notification` → [android.app.Notification](https://developer.android.com/reference/android/app/Notification) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L12` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Notification);` |
| <a id="api-symbol-Z2xvYmFsOk5vdGlmaWNhdGlvbkNvbXBhdA"></a> `global:NotificationCompat` | `NotificationCompat` → [androidx.core.app.NotificationCompat](https://developer.android.com/reference/androidx/core/app/NotificationCompat) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L129` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(NotificationCompat);` |
| <a id="api-symbol-Z2xvYmFsOk5vdGlmaWNhdGlvbk1hbmFnZXI"></a> `global:NotificationManager` | `NotificationManager` → [android.app.NotificationManager](https://developer.android.com/reference/android/app/NotificationManager) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L15` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(NotificationManager);` |
| <a id="api-symbol-Z2xvYmFsOk5vdGlmaWNhdGlvblV0aWxz"></a> `global:NotificationUtils` | `NotificationUtils` → `com.qiaomu.monkeyking.util.NotificationUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L330` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(NotificationUtils);` |
| <a id="api-symbol-Z2xvYmFsOk9rSHR0cENsaWVudA"></a> `global:OkHttpClient` | `OkHttpClient` → [okhttp3.OkHttpClient](https://square.github.io/okhttp/5.x/okhttp/okhttp3/) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L201` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(OkHttpClient);` |
| <a id="api-symbol-Z2xvYmFsOlBhY2thZ2VNYW5hZ2Vy"></a> `global:PackageManager` | `PackageManager` → [android.content.pm.PackageManager](https://developer.android.com/reference/android/content/pm/PackageManager) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L30` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(PackageManager);` |
| <a id="api-symbol-Z2xvYmFsOlBhaW50"></a> `global:Paint` | `Paint` → [android.graphics.Paint](https://developer.android.com/reference/android/graphics/Paint) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L42` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Paint);` |
| <a id="api-symbol-Z2xvYmFsOlBlbmRpbmdJbnRlbnQ"></a> `global:PendingIntent` | `PendingIntent` → [android.app.PendingIntent](https://developer.android.com/reference/android/app/PendingIntent) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L18` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(PendingIntent);` |
| <a id="api-symbol-Z2xvYmFsOlBGaWxl"></a> `global:PFile` | `PFile` → `com.qiaomu.monkeyking.pio.PFile` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L267` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(PFile);` |
| <a id="api-symbol-Z2xvYmFsOlBvcnRlckR1ZmY"></a> `global:PorterDuff` | `PorterDuff` → [android.graphics.PorterDuff](https://developer.android.com/reference/android/graphics/PorterDuff) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L45` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(PorterDuff);` |
| <a id="api-symbol-Z2xvYmFsOlByZWY"></a> `global:Pref` | `Pref` → `com.qiaomu.monkeyking.core.pref.Pref` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L270` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Pref);` |
| <a id="api-symbol-Z2xvYmFsOlByb3h5SmF2YU9iamVjdA"></a> `global:ProxyJavaObject` | `ProxyJavaObject` → `com.qiaomu.monkeyking.rhino.ProxyJavaObject` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L273` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ProxyJavaObject);` |
| <a id="api-symbol-Z2xvYmFsOlByb3h5T2JqZWN0"></a> `global:ProxyObject` | `ProxyObject` → `com.qiaomu.monkeyking.rhino.ProxyObject` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L276` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ProxyObject);` |
| <a id="api-symbol-Z2xvYmFsOlJlZW50cmFudExvY2s"></a> `global:ReentrantLock` | `ReentrantLock` → [java.util.concurrent.locks.ReentrantLock](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L186` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ReentrantLock);` |
| <a id="api-symbol-Z2xvYmFsOlJlcXVlc3Q"></a> `global:Request` | `Request` → [okhttp3.Request](https://square.github.io/okhttp/5.x/okhttp/okhttp3/) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L204` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Request);` |
| <a id="api-symbol-Z2xvYmFsOlJlcXVlc3RCb2R5"></a> `global:RequestBody` | `RequestBody` → [okhttp3.RequestBody](https://square.github.io/okhttp/5.x/okhttp/okhttp3/) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L207` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(RequestBody);` |
| <a id="api-symbol-Z2xvYmFsOlJoaW5vVXRpbHM"></a> `global:RhinoUtils` | `RhinoUtils` → `com.qiaomu.monkeyking.util.RhinoUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L333` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(RhinoUtils);` |
| <a id="api-symbol-Z2xvYmFsOlJvb3RNb2Rl"></a> `global:RootMode` | `RootMode` → `com.qiaomu.monkeyking.util.RootUtils.RootMode` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L336` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(RootMode);` |
| <a id="api-symbol-Z2xvYmFsOlJvb3RVdGlscw"></a> `global:RootUtils` | `RootUtils` → `com.qiaomu.monkeyking.util.RootUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L339` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(RootUtils);` |
| <a id="api-symbol-Z2xvYmFsOlJ1bm5hYmxl"></a> `global:Runnable` | `Runnable` → [java.lang.Runnable](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Runnable.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L156` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Runnable);` |
| <a id="api-symbol-Z2xvYmFsOlNjYWxlR2VzdHVyZURldGVjdG9y"></a> `global:ScaleGestureDetector` | `ScaleGestureDetector` → [android.view.ScaleGestureDetector](https://developer.android.com/reference/android/view/ScaleGestureDetector) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L102` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ScaleGestureDetector);` |
| <a id="api-symbol-Z2xvYmFsOlNjcmVlbk1ldHJpY3M"></a> `global:ScreenMetrics` | `ScreenMetrics` → `com.qiaomu.monkeyking.runtime.api.ScreenMetrics` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L285` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ScreenMetrics);` |
| <a id="api-symbol-Z2xvYmFsOlNjcmlwdEVuZ2luZVNlcnZpY2U"></a> `global:ScriptEngineService` | `ScriptEngineService` → `com.qiaomu.monkeyking.engine.ScriptEngineService` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L366` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ScriptEngineService);` |
| <a id="api-symbol-Z2xvYmFsOlNjcmlwdEludGVycnVwdGVkRXhjZXB0aW9u"></a> `global:ScriptInterruptedException` | `ScriptInterruptedException` → `com.qiaomu.monkeyking.runtime.exception.ScriptInterruptedException` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L291` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ScriptInterruptedException);` |
| <a id="api-symbol-Z2xvYmFsOlNjcmlwdFJ1bnRpbWU"></a> `global:ScriptRuntime` | `ScriptRuntime` → `com.qiaomu.monkeyking.runtime.ScriptRuntime` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L279` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ScriptRuntime);` |
| <a id="api-symbol-Z2xvYmFsOlNlY3VyaXR5RXhjZXB0aW9u"></a> `global:SecurityException` | `SecurityException` → [java.lang.SecurityException](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/SecurityException.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L159` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(SecurityException);` |
| <a id="api-symbol-Z2xvYmFsOlNldHRpbmdz"></a> `global:Settings` | `Settings` → [android.provider.Settings](https://developer.android.com/reference/android/provider/Settings) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L66` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Settings);` |
| <a id="api-symbol-Z2xvYmFsOlNoZWxs"></a> `global:Shell` | `Shell` → `com.qiaomu.monkeyking.runtime.api.Shell` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L288` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Shell);` |
| <a id="api-symbol-Z2xvYmFsOlNuYWNrYmFy"></a> `global:Snackbar` | `Snackbar` → `com.google.android.material.snackbar.Snackbar` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L138` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Snackbar);` |
| <a id="api-symbol-Z2xvYmFsOlN0YW5kYXJkQ2hhcnNldHM"></a> `global:StandardCharsets` | `StandardCharsets` → [java.nio.charset.StandardCharsets](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/charset/StandardCharsets.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L174` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(StandardCharsets);` |
| <a id="api-symbol-Z2xvYmFsOlN0cmluZ1V0aWxz"></a> `global:StringUtils` | `StringUtils` → `com.qiaomu.monkeyking.util.StringUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L342` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(StringUtils);` |
| <a id="api-symbol-Z2xvYmFsOnN0cnVjdHVyZWRDbG9uZQ"></a> `global:structuredClone` | `structuredClone` 引擎全局入口 · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/ScriptRuntime.kt:L446` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof structuredClone);` |
| <a id="api-symbol-Z2xvYmFsOlN5c3RlbQ"></a> `global:System` | `System` → [java.lang.System](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/System.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L162` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(System);` |
| <a id="api-symbol-Z2xvYmFsOlRleHRUb1NwZWVjaA"></a> `global:TextToSpeech` | `TextToSpeech` → [android.speech.tts.TextToSpeech](https://developer.android.com/reference/android/speech/tts/TextToSpeech) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L69` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(TextToSpeech);` |
| <a id="api-symbol-Z2xvYmFsOlRleHRVdGlscw"></a> `global:TextUtils` | `TextUtils` → `com.qiaomu.monkeyking.util.TextUtils` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L345` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(TextUtils);` |
| <a id="api-symbol-Z2xvYmFsOlRleHRXYXRjaGVy"></a> `global:TextWatcher` | `TextWatcher` → [android.text.TextWatcher](https://developer.android.com/reference/android/text/TextWatcher) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L75` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(TextWatcher);` |
| <a id="api-symbol-Z2xvYmFsOlRoZW1lQ29sb3I"></a> `global:ThemeColor` | `ThemeColor` → `com.qiaomu.monkeyking.theme.ThemeColor` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L297` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(ThemeColor);` |
| <a id="api-symbol-Z2xvYmFsOlRocmVhZA"></a> `global:Thread` | `Thread` → [java.lang.Thread](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L165` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Thread);` |
| <a id="api-symbol-Z2xvYmFsOlRocm93YWJsZQ"></a> `global:Throwable` | `Throwable` → [java.lang.Throwable](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Throwable.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L168` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Throwable);` |
| <a id="api-symbol-Z2xvYmFsOlRpbWVVbml0"></a> `global:TimeUnit` | `TimeUnit` → [java.util.concurrent.TimeUnit](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/TimeUnit.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L177` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(TimeUnit);` |
| <a id="api-symbol-Z2xvYmFsOlRvYXN0"></a> `global:Toast` | `Toast` → [android.widget.Toast](https://developer.android.com/reference/android/widget/Toast) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L123` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Toast);` |
| <a id="api-symbol-Z2xvYmFsOlRvcExldmVsU2NvcGU"></a> `global:TopLevelScope` | `TopLevelScope` → `com.qiaomu.monkeyking.rhino.TopLevelScope` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L354` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(TopLevelScope);` |
| <a id="api-symbol-Z2xvYmFsOlR5cGVkVmFsdWU"></a> `global:TypedValue` | `TypedValue` → [android.util.TypedValue](https://developer.android.com/reference/android/util/TypedValue) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L87` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(TypedValue);` |
| <a id="api-symbol-Z2xvYmFsOlR5cGVmYWNl"></a> `global:Typeface` | `Typeface` → [android.graphics.Typeface](https://developer.android.com/reference/android/graphics/Typeface) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L48` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Typeface);` |
| <a id="api-symbol-Z2xvYmFsOlVpT2JqZWN0"></a> `global:UiObject` | `UiObject` → `com.qiaomu.monkeyking.core.automator.UiObject` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L228` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(UiObject);` |
| <a id="api-symbol-Z2xvYmFsOlVpT2JqZWN0Q29sbGVjdGlvbg"></a> `global:UiObjectCollection` | `UiObjectCollection` → `com.qiaomu.monkeyking.core.automator.UiObjectCollection` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L231` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(UiObjectCollection);` |
| <a id="api-symbol-Z2xvYmFsOlVpU2VsZWN0b3I"></a> `global:UiSelector` | `UiSelector` → `com.qiaomu.monkeyking.core.accessibility.UiSelector` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L222` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(UiSelector);` |
| <a id="api-symbol-Z2xvYmFsOlVyaQ"></a> `global:Uri` | `Uri` → [android.net.Uri](https://developer.android.com/reference/android/net/Uri) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L54` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Uri);` |
| <a id="api-symbol-Z2xvYmFsOlVSSQ"></a> `global:URI` | `URI` → [java.net.URI](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/net/URI.html) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L171` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(URI);` |
| <a id="api-symbol-Z2xvYmFsOlZlcnNpb24"></a> `global:Version` | `Version` → `io.github.g00fy2.versioncompare.Version` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L147` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(Version);` |
| <a id="api-symbol-Z2xvYmFsOlZvbGF0aWxlQm94"></a> `global:VolatileBox` | `VolatileBox` → `com.qiaomu.monkeyking.concurrent.VolatileBox` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L351` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(VolatileBox);` |
| <a id="api-symbol-Z2xvYmFsOldlYkNocm9tZUNsaWVudA"></a> `global:WebChromeClient` | `WebChromeClient` → [android.webkit.WebChromeClient](https://developer.android.com/reference/android/webkit/WebChromeClient) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L114` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(WebChromeClient);` |
| <a id="api-symbol-Z2xvYmFsOldlYlZpZXc"></a> `global:WebView` | `WebView` → [android.webkit.WebView](https://developer.android.com/reference/android/webkit/WebView) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L117` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(WebView);` |
| <a id="api-symbol-Z2xvYmFsOldlYlZpZXdDbGllbnQ"></a> `global:WebViewClient` | `WebViewClient` → [android.webkit.WebViewClient](https://developer.android.com/reference/android/webkit/WebViewClient) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L120` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(WebViewClient);` |
| <a id="api-symbol-Z2xvYmFsOldpbmRvd01hbmFnZXI"></a> `global:WindowManager` | `WindowManager` → [android.view.WindowManager](https://developer.android.com/reference/android/view/WindowManager) · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Classes.kt:L105` | 入口：全局类名；构造参数、静态成员与合法值由目标类定义 | 返回：可构造或访问静态成员的类对象；目标类初始化、参数与平台异常原样传播 | 权限：读取绑定无需权限，目标调用遵循 Android、Java 或依赖库要求；线程：绑定可在任意脚本线程读取，目标成员保留其线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：只读取绑定无副作用，构造或调用按目标 API 执行 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(WindowManager);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: global');
```

| <a id="api-symbol-Y2FsbDppc051bGxpc2g"></a> `call:isNullish` | `isNullish(...values)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/IsNullish.kt:L10` | 参数：values：零个或多个待判断值 | 返回：boolean；按 null、undefined 与 NOT_FOUND 哨兵值判断 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(isNullish(undefined, null));` |
| <a id="api-symbol-Y2FsbDpzcGVjaWVz"></a> `call:species` | `species(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L55` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：string；无法识别时为 Unknown | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(species({}));` |
| <a id="api-symbol-Z2xvYmFsOmF4aW9z"></a> `global:axios` | `axios getter` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L115` | 属性访问；无调用参数 | 返回：属性值；首次读取可能触发惰性模块加载 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(axios);` |
| <a id="api-symbol-Z2xvYmFsOmNoZWVyaW8"></a> `global:cheerio` | `cheerio getter` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L116` | 属性访问；无调用参数 | 返回：属性值；首次读取可能触发惰性模块加载 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(cheerio);` |
| <a id="api-symbol-Z2xvYmFsOmN1cnJlbnRBY3Rpdml0eQ"></a> `global:currentActivity` | `currentActivity(mode?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L334` | 参数：mode? | 返回：string；参数数量或类型不符合声明时抛出异常 | 权限：按 accessibility、Shizuku 或 root 回退路径要求；线程：同步查询 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof currentActivity);` |
| <a id="api-symbol-Z2xvYmFsOmN1cnJlbnRDb21wb25lbnQ"></a> `global:currentComponent` | `currentComponent(mode?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L350` | 参数：mode? | 返回：string；参数数量或类型不符合声明时抛出异常 | 权限：按 accessibility、Shizuku 或 root 回退路径要求；线程：同步查询 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof currentComponent);` |
| <a id="api-symbol-Z2xvYmFsOmN1cnJlbnRQYWNrYWdl"></a> `global:currentPackage` | `currentPackage(mode?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L318` | 参数：mode? | 返回：string；参数数量或类型不符合声明时抛出异常 | 权限：按 accessibility、Shizuku 或 root 回退路径要求；线程：同步查询 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof currentPackage);` |
| <a id="api-symbol-Z2xvYmFsOmNY"></a> `global:cX` | `cX(num?、base?、isRatio?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L579` | 参数：num?、base?、isRatio? | 返回：number；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof cX);` |
| <a id="api-symbol-Z2xvYmFsOmNYeQ"></a> `global:cXy` | `cXy(num?、base?、isRatio?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L661` | 参数：num?、base?、isRatio? | 返回：number；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof cXy);` |
| <a id="api-symbol-Z2xvYmFsOmNZ"></a> `global:cY` | `cY(num?、base?、isRatio?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L603` | 参数：num?、base?、isRatio? | 返回：number；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof cY);` |
| <a id="api-symbol-Z2xvYmFsOmNZeA"></a> `global:cYx` | `cYx(num?、base?、isRatio?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L627` | 参数：num?、base?、isRatio? | 返回：number；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof cYx);` |
| <a id="api-symbol-Z2xvYmFsOmRheWpz"></a> `global:dayjs` | `dayjs getter` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L117` | 属性访问；无调用参数 | 返回：属性值；首次读取可能触发惰性模块加载 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(dayjs);` |
| <a id="api-symbol-Z2xvYmFsOmV4aXQ"></a> `global:exit` | `exit(e?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L281` | 参数：e? | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：作用于当前脚本运行时；副作用：修改剪贴板、屏幕度量、缩放基数或运行状态 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof exit);` |
| <a id="api-symbol-Z2xvYmFsOmdldENsaXA"></a> `global:getClip` | `getClip(无参数)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L305` | 参数：无参数 | 返回：string；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof getClip);` |
| <a id="api-symbol-Z2xvYmFsOmdldFNjYWxlQmFzZXM"></a> `global:getScaleBases` | `getScaleBases(无参数)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L534` | 参数：无参数 | 返回：object {x, y}；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof getScaleBases);` |
| <a id="api-symbol-Z2xvYmFsOmdldFNjYWxlQmFzZVg"></a> `global:getScaleBaseX` | `getScaleBaseX(无参数)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L543` | 参数：无参数 | 返回：number；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof getScaleBaseX);` |
| <a id="api-symbol-Z2xvYmFsOmdldFNjYWxlQmFzZVk"></a> `global:getScaleBaseY` | `getScaleBaseY(无参数)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L549` | 参数：无参数 | 返回：number；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof getScaleBaseY);` |
| <a id="api-symbol-Z2xvYmFsOkhFSUdIVA"></a> `global:HEIGHT` | `HEIGHT getter` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L114` | 属性访问；无调用参数 | 返回：number；首次读取可能触发惰性模块加载 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(HEIGHT);` |
| <a id="api-symbol-Z2xvYmFsOmlzQmlnSW50"></a> `global:isBigInt` | `isBigInt(value：待判断的值)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L156` | 参数：value：待判断的值 | 返回：boolean；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof isBigInt);` |
| <a id="api-symbol-Z2xvYmFsOmlzRW1wdHlPYmplY3Q"></a> `global:isEmptyObject` | `isEmptyObject(value：待判断的值)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L174` | 参数：value：待判断的值 | 返回：boolean；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof isEmptyObject);` |
| <a id="api-symbol-Z2xvYmFsOmlzSW50ZWdlcg"></a> `global:isInteger` | `isInteger(value：待判断的值)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L150` | 参数：value：待判断的值 | 返回：boolean；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof isInteger);` |
| <a id="api-symbol-Z2xvYmFsOmlzSmF2YU9iamVjdA"></a> `global:isJavaObject` | `isJavaObject(value：待判断的 Java 对象)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L144` | 参数：value：待判断的 Java 对象 | 返回：boolean；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof isJavaObject);` |
| <a id="api-symbol-Z2xvYmFsOmlzTW9ua2V5S2luZw"></a> `global:isMonkeyKing` | `isMonkeyKing property` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L62` | 属性访问；无调用参数 | 返回：boolean；只读属性 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(isMonkeyKing);` |
| <a id="api-symbol-Z2xvYmFsOmlzUHJpbWl0aXZl"></a> `global:isPrimitive` | `isPrimitive(value：待判断的值)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L162` | 参数：value：待判断的值 | 返回：boolean；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof isPrimitive);` |
| <a id="api-symbol-Z2xvYmFsOmlzUmVmZXJlbmNl"></a> `global:isReference` | `isReference(value：待判断的值)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L168` | 参数：value：待判断的值 | 返回：boolean；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof isReference);` |
| <a id="api-symbol-Z2xvYmFsOmlzUnVubmluZw"></a> `global:isRunning` | `isRunning(无参数)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L275` | 参数：无参数 | 返回：boolean；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof isRunning);` |
| <a id="api-symbol-Z2xvYmFsOmlzU2h1dHRpbmdEb3du"></a> `global:isShuttingDown` | `isShuttingDown(无参数)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L263` | 参数：无参数 | 返回：boolean；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof isShuttingDown);` |
| <a id="api-symbol-Z2xvYmFsOmlzU3RvcHBlZA"></a> `global:isStopped` | `isStopped(无参数)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L257` | 参数：无参数 | 返回：boolean；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof isStopped);` |
| <a id="api-symbol-Z2xvYmFsOmlzVWlUaHJlYWQ"></a> `global:isUiThread` | `isUiThread(无参数)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L138` | 参数：无参数 | 返回：boolean；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof isUiThread);` |
| <a id="api-symbol-Z2xvYmFsOm5vdFN0b3BwZWQ"></a> `global:notStopped` | `notStopped(无参数)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L269` | 参数：无参数 | 返回：boolean；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof notStopped);` |
| <a id="api-symbol-Z2xvYmFsOnJhbmRvbQ"></a> `global:random` | `random(min?、max?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L477` | 参数：min?、max? | 返回：number；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof random);` |
| <a id="api-symbol-Z2xvYmFsOnJlcXVpcmVzQXBp"></a> `global:requiresApi` | `requiresApi(api)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L500` | 参数：api | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof requiresApi);` |
| <a id="api-symbol-Z2xvYmFsOnJlcXVpcmVzTW9ua2V5a2luZ1ZlcnNpb24"></a> `global:requiresMonkeykingVersion` | `requiresMonkeykingVersion(version)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L506` | 参数：version | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof requiresMonkeykingVersion);` |
| <a id="api-symbol-Z2xvYmFsOnNldENsaXA"></a> `global:setClip` | `setClip(text)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L298` | 参数：text | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：作用于当前脚本运行时；副作用：修改剪贴板、屏幕度量、缩放基数或运行状态 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof setClip);` |
| <a id="api-symbol-Z2xvYmFsOnNldFNjYWxlQmFzZXM"></a> `global:setScaleBases` | `setScaleBases(baseX、baseY)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L555` | 参数：baseX、baseY | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：作用于当前脚本运行时；副作用：修改剪贴板、屏幕度量、缩放基数或运行状态 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof setScaleBases);` |
| <a id="api-symbol-Z2xvYmFsOnNldFNjYWxlQmFzZVg"></a> `global:setScaleBaseX` | `setScaleBaseX(baseX)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L565` | 参数：baseX | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：作用于当前脚本运行时；副作用：修改剪贴板、屏幕度量、缩放基数或运行状态 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof setScaleBaseX);` |
| <a id="api-symbol-Z2xvYmFsOnNldFNjYWxlQmFzZVk"></a> `global:setScaleBaseY` | `setScaleBaseY(baseY)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L572` | 参数：baseY | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：作用于当前脚本运行时；副作用：修改剪贴板、屏幕度量、缩放基数或运行状态 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof setScaleBaseY);` |
| <a id="api-symbol-Z2xvYmFsOnNldFNjcmVlbk1ldHJpY3M"></a> `global:setScreenMetrics` | `setScreenMetrics(width、height)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L493` | 参数：width、height | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：作用于当前脚本运行时；副作用：修改剪贴板、屏幕度量、缩放基数或运行状态 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof setScreenMetrics);` |
| <a id="api-symbol-Z2xvYmFsOnNsZWVw"></a> `global:sleep` | `sleep(millisMin、millisMax?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L231` | 参数：millisMin、millisMax? | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：不额外申请 Android 权限；线程：阻塞操作不得在 UI 线程执行 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof sleep);` |
| <a id="api-symbol-Z2xvYmFsOnN0b3A"></a> `global:stop` | `stop(无参数)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L292` | 参数：无参数 | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：作用于当前脚本运行时；副作用：修改剪贴板、屏幕度量、缩放基数或运行状态 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof stop);` |
| <a id="api-symbol-Z2xvYmFsOnRvYXN0RXJyb3I"></a> `global:toastError` | `toastError(message、isLong?、isForcible?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L222` | 参数：message、isLong?、isForcible? | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：可能受通知或悬浮窗能力限制；线程：同步排队到 Toast/console 实现 | 生命周期：调用结束后返回；副作用：显示 Toast 并写入 console | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof toastError);` |
| <a id="api-symbol-Z2xvYmFsOnRvYXN0SW5mbw"></a> `global:toastInfo` | `toastInfo(message、isLong?、isForcible?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L204` | 参数：message、isLong?、isForcible? | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：可能受通知或悬浮窗能力限制；线程：同步排队到 Toast/console 实现 | 生命周期：调用结束后返回；副作用：显示 Toast 并写入 console | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof toastInfo);` |
| <a id="api-symbol-Z2xvYmFsOnRvYXN0TG9n"></a> `global:toastLog` | `toastLog(text?、isLong?、isForcible?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L195` | 参数：text?、isLong?、isForcible? | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：可能受通知或悬浮窗能力限制；线程：同步排队到 Toast/console 实现 | 生命周期：调用结束后返回；副作用：显示 Toast 并写入 console | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof toastLog);` |
| <a id="api-symbol-Z2xvYmFsOnRvYXN0VmVyYm9zZQ"></a> `global:toastVerbose` | `toastVerbose(message、isLong?、isForcible?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L186` | 参数：message、isLong?、isForcible? | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：可能受通知或悬浮窗能力限制；线程：同步排队到 Toast/console 实现 | 生命周期：调用结束后返回；副作用：显示 Toast 并写入 console | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof toastVerbose);` |
| <a id="api-symbol-Z2xvYmFsOnRvYXN0V2Fybg"></a> `global:toastWarn` | `toastWarn(message、isLong?、isForcible?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L213` | 参数：message、isLong?、isForcible? | 返回：undefined；参数数量或类型不符合声明时抛出异常 | 权限：可能受通知或悬浮窗能力限制；线程：同步排队到 Toast/console 实现 | 生命周期：调用结束后返回；副作用：显示 Toast 并写入 console | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof toastWarn);` |
| <a id="api-symbol-Z2xvYmFsOlRPRE8"></a> `global:TODO` | `TODO(reason?：可选的错误说明)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L126` | 参数：reason?：可选的错误说明 | 返回：never；始终抛出 NotImplementedError；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof TODO);` |
| <a id="api-symbol-Z2xvYmFsOnRvU3RyaW5n"></a> `global:toString` | `toString(无参数)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L695` | 参数：无参数 | 返回：string；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof toString);` |
| <a id="api-symbol-Z2xvYmFsOnVud3JhcEphdmFPYmplY3Q"></a> `global:unwrapJavaObject` | `unwrapJavaObject(value：待解包的值)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L180` | 参数：value：待解包的值 | 返回：any；Java 包装对象的底层值或原值；参数数量或类型不符合声明时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof unwrapJavaObject);` |
| <a id="api-symbol-Z2xvYmFsOndhaXQ"></a> `global:wait` | `wait(condition、limit?、interval?、callback?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L366` | 参数：condition、limit?、interval?、callback? | 返回：any；参数数量或类型不符合声明时抛出异常 | 权限：不额外申请 Android 权限；线程：阻塞操作不得在 UI 线程执行 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof wait);` |
| <a id="api-symbol-Z2xvYmFsOndhaXRGb3JBY3Rpdml0eQ"></a> `global:waitForActivity` | `waitForActivity(activityName、limit?、interval?、callback?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L451` | 参数：activityName、limit?、interval?、callback? | 返回：any；参数数量或类型不符合声明时抛出异常 | 权限：不额外申请 Android 权限；线程：阻塞操作不得在 UI 线程执行 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof waitForActivity);` |
| <a id="api-symbol-Z2xvYmFsOndhaXRGb3JQYWNrYWdl"></a> `global:waitForPackage` | `waitForPackage(packageName、limit?、interval?、callback?)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L464` | 参数：packageName、limit?、interval?、callback? | 返回：any；参数数量或类型不符合声明时抛出异常 | 权限：不额外申请 Android 权限；线程：阻塞操作不得在 UI 线程执行 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof waitForPackage);` |
| <a id="api-symbol-Z2xvYmFsOldJRFRI"></a> `global:WIDTH` | `WIDTH getter` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Global.kt:L113` | 属性访问；无调用参数 | 返回：number；首次读取可能触发惰性模块加载 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(WIDTH);` |
| <a id="api-symbol-bW9kdWxlOmlzTnVsbGlzaA"></a> `module:isNullish` | `isNullish 模块入口` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/ScriptRuntime.kt:L726` | 模块入口；无显式调用参数 | 返回：模块对象；模块初始化或加载失败时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：模块首次访问可能触发初始化 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof isNullish);` |
| <a id="api-symbol-bW9kdWxlOnNwZWNpZXM"></a> `module:species` | `species 模块入口` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/ScriptRuntime.kt:L734` | 模块入口；无显式调用参数 | 返回：模块对象；模块初始化或加载失败时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随 Rhino 脚本引擎全局作用域存在；副作用：模块首次访问可能触发初始化 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species);` |
| <a id="api-symbol-c3BlY2llcy5pc0FycmF5"></a> `species.isArray` | `species.isArray(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L78` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isArray);` |
| <a id="api-symbol-c3BlY2llcy5pc0FycmF5QnVmZmVy"></a> `species.isArrayBuffer` | `species.isArrayBuffer(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L88` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isArrayBuffer);` |
| <a id="api-symbol-c3BlY2llcy5pc0JpZ0ludA"></a> `species.isBigInt` | `species.isBigInt(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L98` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isBigInt);` |
| <a id="api-symbol-c3BlY2llcy5pc0Jvb2xlYW4"></a> `species.isBoolean` | `species.isBoolean(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L108` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isBoolean);` |
| <a id="api-symbol-c3BlY2llcy5pc0NvbnRpbnVhdGlvbg"></a> `species.isContinuation` | `species.isContinuation(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L118` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isContinuation);` |
| <a id="api-symbol-c3BlY2llcy5pc0RhdGFWaWV3"></a> `species.isDataView` | `species.isDataView(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L128` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isDataView);` |
| <a id="api-symbol-c3BlY2llcy5pc0RhdGU"></a> `species.isDate` | `species.isDate(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L138` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isDate);` |
| <a id="api-symbol-c3BlY2llcy5pc0Vycm9y"></a> `species.isError` | `species.isError(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L148` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isError);` |
| <a id="api-symbol-c3BlY2llcy5pc0Zsb2F0MzJBcnJheQ"></a> `species.isFloat32Array` | `species.isFloat32Array(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L158` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isFloat32Array);` |
| <a id="api-symbol-c3BlY2llcy5pc0Zsb2F0NjRBcnJheQ"></a> `species.isFloat64Array` | `species.isFloat64Array(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L168` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isFloat64Array);` |
| <a id="api-symbol-c3BlY2llcy5pc0Z1bmN0aW9u"></a> `species.isFunction` | `species.isFunction(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L178` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isFunction);` |
| <a id="api-symbol-c3BlY2llcy5pc0ludDE2QXJyYXk"></a> `species.isInt16Array` | `species.isInt16Array(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L188` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isInt16Array);` |
| <a id="api-symbol-c3BlY2llcy5pc0ludDMyQXJyYXk"></a> `species.isInt32Array` | `species.isInt32Array(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L198` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isInt32Array);` |
| <a id="api-symbol-c3BlY2llcy5pc0ludDhBcnJheQ"></a> `species.isInt8Array` | `species.isInt8Array(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L208` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isInt8Array);` |
| <a id="api-symbol-c3BlY2llcy5pc0phdmFDbGFzcw"></a> `species.isJavaClass` | `species.isJavaClass(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L228` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isJavaClass);` |
| <a id="api-symbol-c3BlY2llcy5pc0phdmFPYmplY3Q"></a> `species.isJavaObject` | `species.isJavaObject(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L218` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isJavaObject);` |
| <a id="api-symbol-c3BlY2llcy5pc0phdmFQYWNrYWdl"></a> `species.isJavaPackage` | `species.isJavaPackage(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L238` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isJavaPackage);` |
| <a id="api-symbol-c3BlY2llcy5pc01hcA"></a> `species.isMap` | `species.isMap(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L248` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isMap);` |
| <a id="api-symbol-c3BlY2llcy5pc05hbWVzcGFjZQ"></a> `species.isNamespace` | `species.isNamespace(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L258` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isNamespace);` |
| <a id="api-symbol-c3BlY2llcy5pc051bGw"></a> `species.isNull` | `species.isNull(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L268` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isNull);` |
| <a id="api-symbol-c3BlY2llcy5pc051bWJlcg"></a> `species.isNumber` | `species.isNumber(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L278` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isNumber);` |
| <a id="api-symbol-c3BlY2llcy5pc09iamVjdA"></a> `species.isObject` | `species.isObject(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L288` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isObject);` |
| <a id="api-symbol-c3BlY2llcy5pc1FOYW1l"></a> `species.isQName` | `species.isQName(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L298` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isQName);` |
| <a id="api-symbol-c3BlY2llcy5pc1JlZ0V4cA"></a> `species.isRegExp` | `species.isRegExp(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L308` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isRegExp);` |
| <a id="api-symbol-c3BlY2llcy5pc1NldA"></a> `species.isSet` | `species.isSet(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L318` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isSet);` |
| <a id="api-symbol-c3BlY2llcy5pc1N0cmluZw"></a> `species.isString` | `species.isString(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L328` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isString);` |
| <a id="api-symbol-c3BlY2llcy5pc1VpbnQxNkFycmF5"></a> `species.isUint16Array` | `species.isUint16Array(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L338` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isUint16Array);` |
| <a id="api-symbol-c3BlY2llcy5pc1VpbnQzMkFycmF5"></a> `species.isUint32Array` | `species.isUint32Array(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L348` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isUint32Array);` |
| <a id="api-symbol-c3BlY2llcy5pc1VpbnQ4QXJyYXk"></a> `species.isUint8Array` | `species.isUint8Array(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L358` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isUint8Array);` |
| <a id="api-symbol-c3BlY2llcy5pc1VpbnQ4Q2xhbXBlZEFycmF5"></a> `species.isUint8ClampedArray` | `species.isUint8ClampedArray(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L368` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isUint8ClampedArray);` |
| <a id="api-symbol-c3BlY2llcy5pc1VuZGVmaW5lZA"></a> `species.isUndefined` | `species.isUndefined(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L378` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isUndefined);` |
| <a id="api-symbol-c3BlY2llcy5pc1dlYWtNYXA"></a> `species.isWeakMap` | `species.isWeakMap(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L388` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isWeakMap);` |
| <a id="api-symbol-c3BlY2llcy5pc1dlYWtTZXQ"></a> `species.isWeakSet` | `species.isWeakSet(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L398` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isWeakSet);` |
| <a id="api-symbol-c3BlY2llcy5pc1hNTA"></a> `species.isXML` | `species.isXML(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L408` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isXML);` |
| <a id="api-symbol-c3BlY2llcy5pc1hNTExpc3Q"></a> `species.isXMLList` | `species.isXMLList(o)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/global/Species.kt:L418` | 参数：o：任意待识别的 JavaScript 或 Java 值 | 返回：boolean；参数数量不是 1 时抛出异常 | 权限：读取或调用绑定本身无需额外权限，目标运行时能力按环境决定；线程：同步执行，保留固定源码线程约束 | 生命周期：随当前脚本调用完成；副作用：纯查询或按目标运行时执行，不修改参数对象 | v6.7.0（固定提交） | Rhino 2.0：`console.log(typeof species.isXMLList);` |

<!-- fixed-source-contracts:end -->
