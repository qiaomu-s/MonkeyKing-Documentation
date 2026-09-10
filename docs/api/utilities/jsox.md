# Jsox

**自 v6.6.0 起提供。**

本页所有 `js` 代码块均为 Monkey King **Rhino 2.0** 示例。

Jsox 用于把 Monkey King 的 `Mathx`、`Numberx` 和 `Arrayx` 能力安装到 JavaScript 内建对象。它会修改当前脚本运行时中的 `Math`、`Number`、`Number.prototype`、`Array` 或 `Array.prototype`，因此应在了解全局副作用后使用。

三个入口的返回值均为 `undefined`；各节的 <ins>**returns**</ins> 行给出同一契约。

## jsox

### jsox(modules?)

**v6.6.0**

- **modules** { `string | Array` } - 可选模块名；支持多个参数和嵌套数组
- <ins>**returns**</ins> { `undefined` }
- **异常**：模块名不受支持时抛出参数异常
- **副作用 / 生命周期**：永久扩展当前脚本运行时中的内建对象

全局可调用入口，与 `jsox.extend` 等价。`$jsox` 是同一函数对象的别名。没有提供模块名时会扩展全部预设模块。

```js
console.log($jsox === jsox); // true

jsox('Mathx');
console.log(Math.sum([ 1, 2, 3 ])); // 6

jsox([ 'Arrayx', 'Numberx' ]);
console.log([ 3, 1, 2 ].sorted()); // [1, 2, 3]
```

### jsox.extend(modules?)

**v6.6.0**

- **modules** { `string | Array` } - 可选模块名；参数会被展平、转成字符串并去重
- <ins>**returns**</ins> { `undefined` }
- **异常**：模块名无法解析为受支持扩展时抛出参数异常
- **副作用 / 生命周期**：永久扩展当前脚本运行时中的指定内建对象

扩展指定的 JavaScript 内建对象。常用名称 `Math`、`Mathx`、`mathx` 会归一化为 `Mathx`；另外两个模块同理。空参数调用与 `jsox.extendAll` 等价。

```js
jsox.extend('Numberx');
console.log((12.345).toFixedNum(2)); // 12.35

jsox.extend('Arrayx', 'Mathx');
console.log([ 1, 1, 2 ].distinct()); // [1, 2]
```

### jsox.extendAll()

**v6.6.0**

- **参数**：无
- <ins>**returns**</ins> { `undefined` }
- **异常**：传入参数时抛出参数数量异常
- **副作用 / 生命周期**：永久扩展当前脚本运行时中的全部预设内建对象

一次扩展全部预设模块：`Mathx`、`Numberx` 和 `Arrayx`。传入任何参数都会抛出参数数量异常。

```js
jsox.extendAll();

console.log(typeof Math.mean); // "function"
console.log(typeof Number.ensureNumber); // "function"
console.log(typeof Array.ensureArray); // "function"
```

### 支持的扩展模块

| 模块名 | 修改目标 | 主要效果 |
| --- | --- | --- |
| `Mathx` | `Math`，以及少量全局函数 | 添加随机数、统计、距离、对数和幂运算辅助方法 |
| `Numberx` | `Number`、`Number.prototype`，以及少量全局函数 | 添加数值检查、解析、限制、定点数和补位方法 |
| `Arrayx` | `Array`、`Array.prototype` | 添加去重、集合运算、排序和乱序方法 |

各扩展成员的完整签名分别参阅 [Mathx](mathx.md)、[Numberx](numberx.md) 和 [Arrayx](arrayx.md)。

### 异常、生命周期与副作用

- 不支持的模块名、无法解析为扩展模块的值会抛出参数异常。
- `jsox.extendAll` 只接受零个参数；`jsox` 与 `jsox.extend` 可接受零个或多个模块名。
- 扩展同步完成，不访问文件、网络或 Android 权限。
- 新成员安装到当前脚本运行时的内建对象及其原型，并在该运行时后续代码中持续可见；这些属性按永久属性注册。
- 对同一模块重复扩展不会创建另一套内建对象，但仍应避免在无必要时反复执行全局修改。
