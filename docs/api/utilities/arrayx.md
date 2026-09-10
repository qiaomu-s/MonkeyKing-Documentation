# Arrayx (Array 扩展)

Arrayx 用于扩展 JavaScript 标准内置对象 Array 的功能 (参阅 [内置对象扩展](../../reference/glossaries/glossary.md#内置对象扩展)).

Arrayx 全局可用:

```js
console.log(typeof Arrayx); // "object"
console.log(typeof Arrayx.union); // "function"
```

当启用内置扩展后, Arrayx 将被应用在 Array 及其原型上:

```js
console.log(typeof Array.prototype.union); // "function"
console.log(typeof [].union); // "function"
```

## 启用内置扩展

内置扩展默认被禁用, 以下任一方式可启用内置扩展:

- 在脚本中加入代码片段: `plugins.extendAll();` 或 `plugins.extend('Array');`
- Monkey King 应用设置 - 扩展性 - JavaScript 内置对象扩展 - [ 启用 ]

当上述应用设置启用时, 所有脚本均默认启用内置扩展.<br>
当上述应用设置禁用时, 只有加入上述代码片段的脚本才会启用内置扩展.<br>
内置扩展往往是不安全的, 除非明确了解内置扩展的原理及风险, 否则不建议启用.

## 排序稳定性

Arrayx 的诸多排序方法, 如 [ sortBy / sortDescending / sortByDescending / sorted / sortedBy / sortedDescending / sortedByDescending ] 等, 其内部实现均调用了 JavaScript 的原生方法 [Array.prototype.sort](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).

自 ES10 (ECMAScript 2019) 起, [规范](https://tc39.es/ecma262/#sec-array.prototype.sort) 要求 Array.prototype.sort 为稳定排序, 因此 Arrayx 的排序方法也是稳定的.

> 参阅: [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#%E6%8E%92%E5%BA%8F%E7%A8%B3%E5%AE%9A%E6%80%A7)

## 排序方式

Arrayx 排序方法中的 selector (条件选择器) 使用的 compareFn (比较函数) 与默认的稍有不同.<br>
默认的比较函数按照转换为字符串的诸个字符的 Unicode 位点进行 **升序** 排序, 例如 80 会被排列到 9 之前.<br>
而 Arrayx 排序方法的 selector 则采用简单的直接比较方法:

```js
/* Arrayx 使用的 compareFn. */
(a, b) => a === b ? 0 : a > b ? 1 : -1;
```

因此对于 number 数组的排序会出现不同的结果:

```js
console.log([ 80, 70, 9 ].sort()); // [ 70, 80, 9 ]
console.log(Arrayx.sorted([ 80, 70, 9 ])); // [ 9, 70, 80 ]
```

---

<p style="font: bold 2em sans-serif; color: #FF7043">Arrayx</p>

---

## [m] ensureArray

### ensureArray(...o)

**`6.2.0`** **`xObject`**

- **o** { [...](../../project/about.md#可变参数)[any](../types/data-types.md#any)[[]](../../project/about.md#可变参数) } - 任意对象
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

相当于严格类型检查, 当任意一个 o 不满足 `Array.isArray(o)` 时抛出异常.

```js
/* 确保每一个对象都是 Array. */

console.log(Arrayx.ensureArray([])); /* 无异常. */
console.log(Arrayx.ensureArray([], 9)); /* 抛出异常. */
console.log(Arrayx.ensureArray([ 5 ], [ 2, 3 ])); /* 无异常. */

/* 启用内置对象扩展后. */

console.log(Array.ensureArray([])); /* 无异常. */
console.log(Array.ensureArray([], 9)); /* 抛出异常. */
console.log(Array.ensureArray([ 5 ], [ 2, 3 ])); /* 无异常. */
```

## [m] intersect

### intersect(o, ...others)

**`6.2.0`** **`xProto`**

- **o** { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) } - 数组
- **others** { [...](../../project/about.md#可变参数)[U](../types/data-types.md#generic)[[]](../types/data-types.md#array)[[]](../../project/about.md#可变参数) } - 待处理数组
- <ins>**returns**</ins> { ([T](../types/data-types.md#generic) & [U](../types/data-types.md#generic))[[]](../types/data-types.md#array) }

返回多个数组的交集.

```js
let arrA = [ 1, 2, 3 ];
let arrB = [ 2, 3, 4 ];
console.log(Arrayx.intersect(arrA, arrB)); // [ 2, 3 ]

/* 启用内置对象扩展后. */
console.log(arrA.intersect(arrB)); /* 同上. */

let arrC = [ 1, 1, 2 ];
let arrD = [ 1, 1, 3 ];
/* 返回的交集结果中不包含重复元素. */
console.log(Arrayx.intersect(arrC, arrD)); // [ 1 ]

/* 启用内置对象扩展后. */
console.log(arrC.intersect(arrD)); /* 同上. */
```

## [m] union

### union(o, ...others)

**`6.2.0`** **`xProto`**

- **o** { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) } - 数组
- **others** { [...](../../project/about.md#可变参数)[U](../types/data-types.md#generic)[[]](../types/data-types.md#array)[[]](../../project/about.md#可变参数) } - 待处理数组
- <ins>**returns**</ins> { ([T](../types/data-types.md#generic) | [U](../types/data-types.md#generic))[[]](../types/data-types.md#array) }

返回多个数组的并集.

```js
let arrA = [ 1, 2 ];
let arrB = [ 3, 4 ];
console.log(Arrayx.union(arrA, arrB)); // [ 1, 2, 3, 4 ]

/* 启用内置对象扩展后. */
console.log(arrA.union(arrB)); /* 同上. */

let arrC = [ 7, 8, 9 ];
let arrD = [ 7, 10 ];
/* 返回的并集结果中不包含重复元素. */
console.log(Arrayx.union(arrC, arrD)); // [ 7, 8, 9, 10 ]

/* 启用内置对象扩展后. */
console.log(arrC.union(arrD)); /* 同上. */
```

## [m] distinct

### distinct(arr)

**`6.2.0`** **`xProto`**

- **o** { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) } - 待处理数组
- <ins>**returns**</ins> { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) }

返回去除重复元素后的新数组.

```js
let arr = [ 1, 2, 1, 3, 2, 2 ];
console.log(Arrayx.distinct(arr)); // [ 1, 2, 3 ]

/* 启用内置对象扩展后. */
console.log(arr.distinct()); /* 同上. */
```

## [m] distinctBy

### distinctBy(arr, selector)

**`6.2.0`** **`xProto`**

- **arr** { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) } - 待处理数组
- **selector** { [(](../types/data-types.md#function)e: [T](../types/data-types.md#generic)[)](../types/data-types.md#function) [=>](../types/data-types.md#function) [U](../types/data-types.md#generic) } - 条件选择器
- <ins>**returns**</ins> { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) }

返回按一定条件去除重复元素后的新数组.

```js
/* 按奇偶条件去重. */
/* 即结果数组中的所有元素保证相互之间奇偶互异. */
let arrA = [ 1, 2, 1, 3, 2, 2 ];
console.log(Arrayx.distinctBy(arrA, e => e % 2)); // [ 1, 2 ]

/* 启用内置对象扩展后. */
console.log(arrA.distinctBy(e => e % 2)); // /* 同上. */

/* 按字符串长度条件去重. */
/* 即结果数组中的所有元素保证相互之间长度不同. */
let arrB = [ 'a', 'ab', 'c', 'bc', 'abc', '123' ];
console.log(Arrayx.distinctBy(arrB, e => e.length)); // [ 'a', 'ab', 'abc' ]

/* 启用内置对象扩展后. */
console.log(arrB.distinctBy(e => e.length)); /* 同上. */

/* 按对象属性条件去重. */
let arrC = [
    { num: 1, count: 10 },
    { num: 2, count: 10 },
    { num: 3, count: 20 },
    { num: 4, count: 10 },
    { num: 5, count: 20 },
];
console.log(Arrayx.distinctBy(arrC, e => e.count)); // [ { num: 1, count: 10 }, { num: 3, count: 20 } ]

/* 启用内置对象扩展后. */
console.log(arrC.distinctBy(e => e.count)); /* 同上. */
```

## [m] sortBy

### sortBy(arr, selector)

**`6.2.0`** **`xProto`**

- **arr** { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) } - 待处理数组
- **selector** { [(](../types/data-types.md#function)e: [T](../types/data-types.md#generic)[)](../types/data-types.md#function) [=>](../types/data-types.md#function) [U](../types/data-types.md#generic) } - 条件选择器
- <ins>**returns**</ins> { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) }

按一定条件原地排序, 并返回排序后的新数组.<br>
方法调用后, 原数组将发生改变.

```js
/* 将字符串按 "数字化" 顺序排序. */
let arrA = [ '10', '2', '30', '4', '50', '0x6' ];
console.log(Arrayx.sortBy(arrA, Number)); // [ '2', '4', '0x6', '10', '30', '50' ]

/* arrA 将发生改变. */
console.log(arrA); // [ '2', '4', '0x6', '10', '30', '50' ]

/* 启用内置对象扩展后的使用方式. */
console.log(arrA.sortBy(Number)); /* 结果同上. */

/* 按字符串长度条件排序. */
let arrB = [ 'a', 'ab', 'c', 'bc', 'abc', '123' ];
console.log(Arrayx.sortBy(arrB, e => e.length)); // [ 'a', 'c', 'ab', 'bc', 'abc', '123' ]

/* 启用内置对象扩展后的使用方式. */
console.log(arrB.sortBy(e => e.length)); /* 结果同上. */

/* 按对象属性条件排序. */
let arrC = [
    { num: 1, count: 10 },
    { num: 2, count: 30 },
    { num: 3, count: 20 },
    { num: 4, count: 10 },
    { num: 5, count: 0 },
];
console.log(Arrayx.sortBy(arrC, e => e.count)); /* num 按照 5 - 1 - 4 - 3 - 2 排序. */

/* 启用内置对象扩展后的使用方式. */
console.log(arrC.sortBy(e => e.count)); /* 结果同上. */
```

## [m] sortDescending

### sortDescending(arr)

**`6.2.0`** **`xProto`**

- **arr** { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) } - 待处理数组
- <ins>**returns**</ins> { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) }

按一定条件原地 **降序** 排序, 并返回排序后的新数组.<br>
方法调用后, 原数组将发生改变.

```js
/* 将字符串按 "数字化" 顺序排序. */
let arrA = [ '10', '2', '30', '4', '50', '0x6' ];

// [ '2', '4', '0x6', '10', '30', '50' ]
console.log(Arrayx.sortDescending(arrA, Number));

/* arrA 将发生改变. */
console.log(arrA[0]); // '2'

/* 启用内置对象扩展后的使用方式. */
console.log(arrA.sortDescending(Number)); /* 结果同上. */

/* 按字符串长度条件排序. */
let arrB = [ 'a', 'ab', 'c', 'bc', 'abc', '123' ];

// [ 'a', 'c', 'ab', 'bc', 'abc', '123' ]
console.log(Arrayx.sortDescending(arrB, e => e.length));

/* 启用内置对象扩展后的使用方式. */
console.log(arrB.sortDescending(e => e.length)); /* 结果同上. */

/* 按对象属性条件排序. */
let arrC = [
    { num: 1, count: 10 },
    { num: 2, count: 30 },
    { num: 3, count: 20 },
    { num: 4, count: 10 },
    { num: 5, count: 0 },
];

/* 元素将按照 num 属性值以 5 - 1 - 4 - 3 - 2 排序. */
console.log(Arrayx.sortDescending(arrC, e => e.count));

/* 启用内置对象扩展后的使用方式. */
console.log(arrC.sortDescending(e => e.count)); /* 结果同上. */
```

## [m] sortByDescending

### sortByDescending(arr, selector)

**`6.2.0`** **`xProto`**

- **arr** { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) } - 待处理数组
- **selector** { [(](../types/data-types.md#function)e: [T](../types/data-types.md#generic)[)](../types/data-types.md#function) [=>](../types/data-types.md#function) [U](../types/data-types.md#generic) } - 条件选择器
- <ins>**returns**</ins> { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) }

按一定条件原地 **降序** 排序, 并返回排序后的新数组.<br>
方法调用后, 原数组将发生改变.

> 参阅: [sortBy](#m-sortby)

## [m] sorted

### sorted(arr)

**`6.2.0`** **`xProto`**

- **arr** { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) } - 待处理数组
- <ins>**returns**</ins> { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) }

按简单比较方式原地排序, 并返回排序后的新数组.<br>
方法调用后, 原数组将 **不** 发生改变.

```js
let arr = [ 2, 3, 1, 20, 10 ];

console.log(Arrayx.sorted(arr)); // [ 1, 2, 3, 10, 20 ]

/* 启用内置对象扩展后. */
console.log(arr.sorted()); /* 同上. */

/* arr 不发生改变. */
console.log(arr); // [ 2, 3, 1, 20, 10 ]
```

## [m] sortedBy

### sortedBy(arr, selector)

**`6.2.0`** **`xProto`**

- **arr** { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) } - 待处理数组
- **selector** { [(](../types/data-types.md#function)e: [T](../types/data-types.md#generic)[)](../types/data-types.md#function) [=>](../types/data-types.md#function) [U](../types/data-types.md#generic) } - 条件选择器
- <ins>**returns**</ins> { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) }

按一定条件原地排序, 并返回排序后的新数组.<br>
方法调用后, 原数组将 **不** 发生改变.

> 参阅: [sortBy](#m-sortby)

## [m] sortedDescending

### sortedDescending(arr)

**`6.2.0`** **`xProto`**

- **arr** { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) } - 待处理数组
- <ins>**returns**</ins> { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) }

按一定条件原地 **降序** 排序, 并返回排序后的新数组.<br>
方法调用后, 原数组将 **不** 发生改变.

> 参阅: [sortDescending](#m-sortdescending)

## [m] sortedByDescending

### sortedByDescending(arr, selector)

**`6.2.0`** **`xProto`**

- **arr** { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) } - 待处理数组
- **selector** { [(](../types/data-types.md#function)e: [T](../types/data-types.md#generic)[)](../types/data-types.md#function) [=>](../types/data-types.md#function) [U](../types/data-types.md#generic) } - 条件选择器
- <ins>**returns**</ins> { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) }

按一定条件原地 **降序** 排序, 并返回排序后的新数组.<br>
方法调用后, 原数组将 **不** 发生改变.

> 参阅: [sortByDescending](#m-sortbydescending)

## [m] shuffle

### shuffle(arr)

**`6.2.0`** **`xProto`**

- **arr** { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) } - 待处理数组
- <ins>**returns**</ins> { [T](../types/data-types.md#generic)[[]](../types/data-types.md#array) }

按随机乱序方式原地排序, 并返回排序后的新数组.<br>
方法调用后, 原数组将发生改变.

```js
/* 将元素随机乱序排序. */
let arrA = [ 1, 2, 3, 4, 5, 6 ];
console.log(Arrayx.shuffle(arrA)); /* e.g. [ 2, 4, 5, 1, 6, 3 ] */

/* arrA 将发生改变. */
console.log(arrA); /* 很可能不再是 [ 1, 2, 3, 4, 5, 6 ]. */

/* 启用内置对象扩展后的使用方式. */
console.log(arrA.shuffle()); /* 另一个随机的结果. */
```

<!-- fixed-source-contracts:start -->

## 固定源码合同表

下表覆盖本页在固定提交 `bafa2986212d` 中的每个 canonical 公共成员。每行同时给出稳定锚点、源码位置、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-QXJyYXl4LmRpZmZlcg"></a> `Arrayx.differ` | `Arrayx.differ(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L91` | 参数：恰好 1 个参数；可选项与默认值见本页说明或源码守卫 | 返回：NativeArray；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.differ);` |
| <a id="api-symbol-QXJyYXl4LmRpc3RpbmN0"></a> `Arrayx.distinct` | `Arrayx.distinct(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L61` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.distinct);` |
| <a id="api-symbol-QXJyYXl4LmRpc3RpbmN0Qnk"></a> `Arrayx.distinctBy` | `Arrayx.distinctBy(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L67` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.distinctBy);` |
| <a id="api-symbol-QXJyYXl4LmVuc3VyZUFycmF5"></a> `Arrayx.ensureArray` | `Arrayx.ensureArray(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L149` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.ensureArray);` |
| <a id="api-symbol-QXJyYXl4LmludGVyc2VjdA"></a> `Arrayx.intersect` | `Arrayx.intersect(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L79` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.intersect);` |
| <a id="api-symbol-QXJyYXl4LnNodWZmbGU"></a> `Arrayx.shuffle` | `Arrayx.shuffle(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L139` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.shuffle);` |
| <a id="api-symbol-QXJyYXl4LnNvcnRCeQ"></a> `Arrayx.sortBy` | `Arrayx.sortBy(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L97` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.sortBy);` |
| <a id="api-symbol-QXJyYXl4LnNvcnRCeURlc2NlbmRpbmc"></a> `Arrayx.sortByDescending` | `Arrayx.sortByDescending(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L103` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.sortByDescending);` |
| <a id="api-symbol-QXJyYXl4LnNvcnREZXNjZW5kaW5n"></a> `Arrayx.sortDescending` | `Arrayx.sortDescending(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L109` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.sortDescending);` |
| <a id="api-symbol-QXJyYXl4LnNvcnRlZA"></a> `Arrayx.sorted` | `Arrayx.sorted(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L115` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.sorted);` |
| <a id="api-symbol-QXJyYXl4LnNvcnRlZEJ5"></a> `Arrayx.sortedBy` | `Arrayx.sortedBy(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L127` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.sortedBy);` |
| <a id="api-symbol-QXJyYXl4LnNvcnRlZEJ5RGVzY2VuZGluZw"></a> `Arrayx.sortedByDescending` | `Arrayx.sortedByDescending(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L133` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.sortedByDescending);` |
| <a id="api-symbol-QXJyYXl4LnNvcnRlZERlc2NlbmRpbmc"></a> `Arrayx.sortedDescending` | `Arrayx.sortedDescending(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L121` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.sortedDescending);` |
| <a id="api-symbol-QXJyYXl4LnN1YnRyYWN0"></a> `Arrayx.subtract` | `Arrayx.subtract(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L85` | 参数：恰好 1 个参数；可选项与默认值见本页说明或源码守卫 | 返回：NativeArray；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.subtract);` |
| <a id="api-symbol-QXJyYXl4LnVuaW9u"></a> `Arrayx.union` | `Arrayx.union(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/jsox/Arrayx.kt:L73` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx.union);` |
| <a id="api-symbol-bW9kdWxlOkFycmF5eA"></a> `module:Arrayx` | `Arrayx` 模块入口 · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/ScriptRuntime.kt:L774` | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：无需 Android 权限；线程：纯同步数组计算 | 生命周期：无持久资源；副作用：返回新数组，不修改系统状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof Arrayx);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: arrayx');
```

<!-- fixed-source-contracts:end -->
