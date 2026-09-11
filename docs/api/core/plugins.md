# 插件 (Plugins)

`plugins` 用于装载应用插件或当前项目根目录下的 JavaScript 插件。本文按 Monkey King 6.7.0 产品版本 `6.7.0` 核对；旧文档中的 `extend`、`extendAll` 与 `extendAllBut` 不在该提交的公开 `plugins` 表面中，因而不再作为现行接口列出。

<a id="内置扩展插件"></a>
## 旧版“内置扩展插件”名称

**`≤ 6.6.4`**

旧版文档曾把 `Arrayx`、`Numberx`、`Mathx` 称为“内置扩展插件”，并通过 `plugins.extend*` 启用。Monkey King 6.7.0 的实现合同仍分别提供这些全局增强模块，但 `plugins` 已不公开 `extend`、`extendAll` 或 `extendAllBut`；旧类型名称只用于解释历史文档，不能作为当前 `plugins` API 调用。

```js
console.log(typeof Arrayx, typeof Numberx, typeof Mathx);
```

<a id="api-symbol-bW9kdWxlOnBsdWdpbnM"></a>
## [@] plugins

**`≤ 6.6.4`**

- **入口 / 别名**：`plugins`、`$plugins`
- **参数**：模块对象本身不接收参数；它同时是可调用对象
- <ins>**returns**</ins> { `Plugins` }
- **异常**：读取模块本身不抛出异常
- **权限**：无额外 Android 权限；应用插件必须已经安装
- **线程 / 生命周期**：与当前脚本运行时绑定；加载结果和模块副作用保留到脚本结束
- **副作用**：只有调用加载接口时才解析并执行插件代码

```js
console.log(plugins === $plugins); // true
console.log(typeof plugins.load); // "function"
```

<a id="api-symbol-Y2FsbDpwbHVnaW5z"></a>
## [f] plugins(name)

**`≤ 6.6.4`**

- **入口 / 别名**：`plugins(name)`；等价于 `plugins.load(name)`
- **name** { [string](../types/data-types.md#string) } - 应用插件包名或项目插件名称；严格要求 1 个参数并按字符串转换
- <ins>**returns**</ins> { [any](../types/data-types.md#any) } - 插件入口导出的值
- **异常**：参数数量不是 1 时抛出异常；项目插件目录不存在、模块解析失败或插件入口执行失败时传播异常
- **权限**：无额外 Android 权限；应用插件路径要求对应 APK 已安装且可由 Monkey King 插件管理器读取
- **线程 / 生命周期**：在当前脚本线程同步加载并执行入口；返回对象的生命周期由插件和脚本共同决定
- **副作用**：执行应用插件主脚本或项目插件模块的顶层代码

```js
const demo = plugins('demo.js');
console.log(demo);
```

<a id="api-symbol-cGx1Z2lucy5sb2Fk"></a>
## [m] plugins.load(name)

**`≤ 6.6.4`**

- **入口 / 别名**：`plugins.load(name)`、`$plugins.load(name)`
- **name** { [string](../types/data-types.md#string) } - 恰好一个名称参数
- <ins>**returns**</ins> { [any](../types/data-types.md#any) } - 应用插件主模块函数的返回值，或项目插件的 `require` 结果
- **异常**：名称包含 `.` 且不是以 `.js` 结尾（忽略大小写）时按应用包名加载，插件不存在或入口失败会传播异常；其他名称按项目插件处理，当前项目根目录没有 `plugins` 目录时抛出 `WrappedIllegalArgumentException`
- **权限**：应用插件必须已安装；项目插件只读取当前项目文件
- **线程 / 生命周期**：同步执行；应用插件入口以顶级作用域为全局对象，并接收解包后的插件对象
- **副作用**：应用插件会解析其 `mainScriptPath` 并调用导出函数；项目插件会执行 `require('./plugins/' + name)`

```js
// 当前项目应存在 ./plugins/format.js。
const format = plugins.load('format.js');
console.log(format);
```
