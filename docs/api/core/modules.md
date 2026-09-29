# 模块 (Module)

Monkey King 在 Rhino 2.0 运行时提供 CommonJS 风格的模块系统。每个 JavaScript 或 JSON 文件对应一个模块；通常模块只在第一次加载时执行，之后从 `require.cache` 返回同一真值导出。产品版本对假值导出的缓存例外见 [require.cache](#p-require-cache)。

模块系统支持应用内置模块、相对或绝对文件、目录包、逐级查找的 `node_modules`，以及由原生加载器处理的 HTTP/HTTPS URL。它不是 Node.js 运行时：Node 内置模块、原生扩展和依赖 Node 系统 API 的 npm 包不保证可用。

本文于 2026-09-10 按 Monkey King 当前产品行为核对。

---

## [p] module

**`≤ 6.6.4`** **`MODULE_LOCAL`**

- { [Module](#module-对象) }

当前文件的模块对象。它只在模块作用域内使用，不是普通脚本的全局变量。

## [p] exports

**`≤ 6.6.4`** **`MODULE_LOCAL`**

- { [Object](../types/data-types.md#object) }

初始时等价于 `module.exports`。给 `exports` 增加属性会修改默认导出对象；把 `exports` 本身重新赋值不会替换模块导出，替换导出必须赋值给 `module.exports`。

```js
// math.js
exports.square = value => value * value;

// factory.js
module.exports = name => ({ name });
```

## [m] require

### require(id, parent?)

**`≤ 6.6.4`**

- **id** { [string](../types/data-types.md#string) } - 模块标识或路径
- **[ parent ]** { [Module](#module-对象) } - 解析相对路径时使用的父模块；普通脚本通常省略
- <ins>**returns**</ins> { [any](../types/data-types.md#any) } - 模块的 `module.exports`
- **异常**：找不到模块、文件读取失败、JSON 或包描述解析失败时抛出异常
- **线程 / 副作用**：同步解析、读取并执行首次加载的模块；可能产生文件、网络和模块初始化副作用

同步解析并加载模块。省略扩展名时依次尝试 JavaScript 和 JSON；目录会读取 `package.json` 的 `main`，否则尝试 `index.js`。相对路径按调用模块所在目录解析，顶层脚本按当前工作目录解析。

加载失败时抛出带 `code` 的模块错误，常见值包括 `MODULE_NOT_FOUND`、`IO_ERROR` 和 `PARSE_ERROR`。HTTP/HTTPS 标识交给原生加载器处理，可能执行同步网络访问；不要在 UI 线程加载慢速模块。

```js
const local = require('./lib/math');
const settings = require('./settings.json');

console.log(local.square(6));
console.log(settings.theme);
```

## [p] require.cache

**`≤ 6.6.4`**

- { [Object](../types/data-types.md#object) }
- **异常**：读取本身不抛出模块错误
- **副作用 / 生命周期**：删除或替换成员会改变当前运行时之后的加载行为

以已解析文件名为键保存模块导出。真值导出命中缓存时不会再次执行模块；导出为 `false`、`0`、空字符串或 `null` 时，产品版本的真值判断不会形成稳定缓存命中。删除某个键可让下一次 `require` 重新加载对应模块，这可能重复注册监听器或产生其他副作用。

```js
const path = require.resolve('./counter');
delete require.cache[path];
const fresh = require('./counter');
```

## [m] require.resolve

### require.resolve(id, parent?)

**`≤ 6.6.4`**

- **id** { [string](../types/data-types.md#string) }
- **[ parent ]** { [Module](#module-对象) } - 用于确定搜索起点的父模块
- <ins>**returns**</ins> { [string](../types/data-types.md#string) | [Object](../types/data-types.md#object) | [boolean](../types/data-types.md#boolean) } - 文件路径、内置模块描述对象或 `false`
- **异常**：无效 package.json 会抛出 `PARSE_ERROR`；底层路径查询也可能抛出 I/O 异常
- **副作用**：不执行目标模块，但会访问文件系统或内置资源索引

只执行解析，不运行目标模块。内置模块返回含 `path` 与 `core` 的资源描述对象，普通文件返回规范化路径，无法解析时返回 `false`。

```js
const resolved = require.resolve('./lib/math');
console.log(resolved || 'not found');
```

## [m] require.paths

### require.paths()

**`≤ 6.6.4`**

- <ins>**returns**</ins> { [string](../types/data-types.md#string)[] }
- **异常**：读取 Java 系统属性或环境变量失败时可能抛出异常
- **副作用**：无

返回额外模块搜索路径，包括用户目录下的 `.node_modules`、`.node_libraries`，以及 Java 系统环境中的 `NODE_PATH`。

```js
console.log(require.paths());
```

## [p] require.NODE_PATH

**`≤ 6.6.4`** **`Writable`**

- { [string](../types/data-types.md#string) | [undefined](../types/data-types.md#undefined) }

显式附加模块搜索路径。未设置时 `require.paths()` 读取进程环境变量 `NODE_PATH`；路径分隔符在 Windows 为分号，其他系统为冒号。

```js
require.NODE_PATH = files.join(files.cwd(), 'vendor');
console.log(require.paths());
```

## [p] require.debug

**`≤ 6.6.4`** **`Writable`**

- { [boolean](../types/data-types.md#boolean) } - 产品版本中默认为 `true`

控制解析失败并回退到原生加载器时是否向 Java 标准输出打印诊断信息。

```js
require.debug = false;
```

## [p] require.extensions

**`≤ 6.6.4`** **`Low-level`**

- { [Object](../types/data-types.md#object) }

产品版本初始化为空对象，加载器没有读取自定义扩展处理器的逻辑。保留该属性是兼容表面，不应依赖它注册新文件类型。

```js
console.log(Object.keys(require.extensions)); // []
```

## [p] require.root

**`≤ 6.6.4`**

- { [string](../types/data-types.md#string) }
- **异常**：赋值本身不校验目录是否存在
- **副作用 / 生命周期**：影响当前运行时之后的顶层模块解析

顶层模块解析根目录，初始化为脚本运行时当前工作目录。修改它会影响后续顶层模块解析。

```js
const previousRoot = require.root;
require.root = files.cwd();
console.log(require.root);
require.root = previousRoot;
```

---

## Module 对象

### new Module(id, parent?, core?)

**`≤ 6.6.4`**

- **id** { [string](../types/data-types.md#string) }
- **[ parent ]** { [Module](#module-对象) }
- **[ core ]** { [boolean](../types/data-types.md#boolean) } - 省略时实际值为 `undefined`，按假值处理
- <ins>**returns**</ins> { [Module](#module-对象) }
- **异常**：构造器本身不校验路径；后续加载失败由 require 抛出
- **副作用 / 生命周期**：有 parent 时把新模块追加到 `parent.children`，并为初始 exports 写入缓存

`Module` 是永久全局构造器，主要由加载器使用。普通脚本通常只需使用当前文件的 `module` 和 `require`。

```js
const child = new Module('virtual.js', module, false);
console.log(child.id); // virtual.js
```

### Module#id

**`≤ 6.6.4`**

- { [string](../types/data-types.md#string) } - 构造时的模块标识
- **副作用**：可写；修改后会影响以该模块为 parent 时的根目录计算

```js
console.log(module.id);
```

### Module#filename

**`≤ 6.6.4`**

- { [string](../types/data-types.md#string) } - 初始值与 id 相同，加载后通常为解析路径
- **副作用**：exports setter 使用该值作为 `require.cache` 的键

```js
console.log(module.filename);
```

### Module#exports

**`≤ 6.6.4`**

- **&lt;get&gt; / &lt;set&gt;** { [any](../types/data-types.md#any) }
- **异常**：无类型限制
- **副作用 / 生命周期**：赋值同时更新 `require.cache[module.filename]`

```js
module.exports = value => value * 2;
```

### Module#parent

**`≤ 6.6.4`**

- { [Module](#module-对象) | [undefined](../types/data-types.md#undefined) }
- **副作用**：可写，但手动修改不会自动维护原父模块的 children

```js
console.log(module.parent && module.parent.filename);
```

### Module#children

**`≤ 6.6.4`**

- { [Module](#module-对象)[] }
- **副作用 / 生命周期**：加载子模块或显式构造带 parent 的 Module 时追加成员

```js
require('./child');
console.log(module.children.length);
```

### Module#loaded

**`≤ 6.6.4`**

- { [boolean](../types/data-types.md#boolean) } - 构造时为 `false`
- **副作用**：可写；产品版本的 `jvm-npm.js` 不会自行把它改为 `true`，不应将它当作可靠加载完成信号

```js
console.log(module.loaded);
```

### Module#core

**`≤ 6.6.4`**

- { [boolean](../types/data-types.md#boolean) } - 是否为应用内置资源模块
- **副作用**：读取无副作用

```js
console.log(Boolean(module.core));
```

### Module#require(id)

**`≤ 6.6.4`**

- **id** { [string](../types/data-types.md#string) }
- <ins>**returns**</ins> { [any](../types/data-types.md#any) }
- **异常、线程与副作用**：与全局 require 相同，但相对路径从当前 Module 解析

```js
const sibling = module.require('./sibling');
```

### Module.require(id, parent?)

**`≤ 6.6.4`**

- **id** { [string](../types/data-types.md#string) }
- **[ parent ]** { [Module](#module-对象) }
- <ins>**returns**</ins> { [any](../types/data-types.md#any) }
- **异常、线程与副作用**：代理全局 require

```js
const value = Module.require('./lib/math', module);
```

### Module.runMain(main)

**`≤ 6.6.4`** **`Low-level`**

- **main** { [string](../types/data-types.md#string) }
- <ins>**returns**</ins> { [any](../types/data-types.md#any) }
- **异常**：入口无法解析或执行失败时抛出异常
- **副作用**：解析并通过原生加载器执行入口文件

```js
// 独立启动入口时使用；普通依赖请使用 require。
const exported = Module.runMain('./main.js');
```

### Module._load(file)

**`≤ 6.6.4`** **`Internal`**

- **file** { [string](../types/data-types.md#string) }
- <ins>**returns**</ins> { [any](../types/data-types.md#any) }
- **异常 / 副作用**：直接调用原生加载器，绕过 jvm-npm 的常规解析与缓存判断

```js
// 仅用于调试原生模块加载，不作为常规依赖入口。
console.log(typeof Module._load);
```

---

## Promise

Monkey King 在引擎初始化时把内置 `promise.js` 以只读永久全局 `Promise` 注入。它基于 Promise polyfill，并增加 `await` 与 `wait`。回调经 `setImmediate` 或 `setTimeout(..., 0)` 调度；Promise 没有取消接口，生命周期持续到完成且引用被释放。

### new Promise(executor)

**`≤ 6.6.4`**

- **executor** { [Function](../types/data-types.md#function) } - `(resolve, reject) => void`
- <ins>**returns**</ins> { `Promise` }
- **异常**：缺少 new 或 executor 不是函数时抛出 `TypeError`；executor 抛出的错误会转为拒绝
- **副作用 / 生命周期**：立即同步执行 executor，完成回调异步调度

```js
const promise = new Promise(resolve => resolve(42));
```

### Promise#then(onFulfilled?, onRejected?)

**`≤ 6.6.4`**

- **onFulfilled / onRejected** { [Function](../types/data-types.md#function) }
- <ins>**returns**</ins> { `Promise` } - 新的链式 Promise
- **异常**：处理器抛出的错误会拒绝返回的 Promise
- **副作用**：注册完成处理器

```js
Promise.resolve(21).then(value => value * 2);
```

### Promise#catch(onRejected)

**`≤ 6.6.4`**

- **onRejected** { [Function](../types/data-types.md#function) }
- <ins>**returns**</ins> { `Promise` }
- **异常 / 副作用**：等价于 `then(null, onRejected)`

```js
Promise.reject(new Error('failed')).catch(error => console.warn(error.message));
```

### Promise#finally(callback)

**`≤ 6.6.4`**

- **callback** { [Function](../types/data-types.md#function) }
- <ins>**returns**</ins> { `Promise` }
- **异常**：callback 不是函数或执行失败时，返回的 Promise 被拒绝
- **副作用**：无论成功或失败都调度 callback，并保持原值或原拒绝原因

```js
Promise.resolve('ok').finally(() => console.log('finished'));
```

### Promise#await()

**`≤ 6.6.4`** **`Continuation`**

- <ins>**returns**</ins> { [any](../types/data-types.md#any) } - 完成值；非 nullish 的拒绝原因会在记录 / Toast 后作为普通恢复值返回
- **异常**：continuation 未启用时抛出异常；nullish 拒绝会使内部 `resumeError` 在恢复前抛出，当前等待可能一直保持等待
- **线程 / 副作用**：暂停当前 continuation，直至 Promise 完成

产品版本的 `Promise#await()` 复用 `continuation.await()`：非 nullish 的拒绝原因不会在等待点重新抛出，而是作为普通恢复值返回。该行为不是标准 `await` 语义。

以下等待示例仅适用于已启用 continuation 特性的脚本。

```js
if (!continuation.enabled) {
    throw new Error('当前脚本未启用 continuation');
}

const value = Promise.resolve(42).await();
console.log(value); // 42

const recovered = Promise.reject(new Error('failed')).await();
console.log(recovered.message); // failed；同时会记录 / Toast
```

### Promise#wait()

**`≤ 6.6.4`** **`Blocking`**

- <ins>**returns**</ins> { [any](../types/data-types.md#any) }
- **异常**：实现只执行 `if (resultObj.error)`，因此只有真值拒绝原因才会抛出
- **线程 / 副作用**：阻塞当前线程直到完成；不得在 UI 线程使用

拒绝原因为 `false`、`0`、空字符串、`null` 或 `undefined` 时，真值判断把它当作没有错误，随后读取不存在的 `result` 字段并返回 `undefined`。不要用假值作为需要由 `Promise#wait()` 传播的拒绝原因。

```js
const result = Promise.resolve(21)
    .then(value => value * 2)
    .wait();

console.log(result); // 42

console.log(Promise.reject(false).wait()); // undefined
```

### Promise.resolve(value?)

**`≤ 6.6.4`**

- **value** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { `Promise` }
- **异常**：读取 thenable 的 then 属性失败时返回拒绝态 Promise
- **副作用**：已有同构 Promise 原样返回，其余值包装为完成态

```js
console.log(Promise.resolve(1) instanceof Promise); // true
```

### Promise.reject(reason?)

**`≤ 6.6.4`**

- **reason** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { `Promise` }
- **副作用**：创建拒绝态 Promise；未注册处理器时通过 console.warn 发出警告

```js
Promise.reject('no').catch(reason => console.log(reason));
```

### Promise.all(values)

**`≤ 6.6.4`**

- **values** { [Array](../types/data-types.md#array) } - 数组或带 length 的类数组对象
- <ins>**returns**</ins> { `Promise<any[]>` }
- **异常**：输入不是类数组时返回拒绝态 Promise；任一成员拒绝时整体拒绝
- **副作用**：订阅所有成员

```js
Promise.all([ Promise.resolve(1), 2 ]).then(values => console.log(values));
```

### Promise.allSettled(values)

**`≤ 6.6.4`**

- **values** { [Array](../types/data-types.md#array) } - 数组或带 length 的类数组对象
- <ins>**returns**</ins> { `Promise<object[]>` }
- **异常**：输入不是类数组时返回拒绝态 Promise
- **副作用**：等待所有成员，结果包含 `fulfilled/value` 或 `rejected/reason`

```js
Promise.allSettled([ Promise.resolve(1), Promise.reject('no') ])
    .then(results => console.log(results));
```

### Promise.race(values)

**`≤ 6.6.4`**

- **values** { [Array](../types/data-types.md#array) }
- <ins>**returns**</ins> { `Promise` }
- **异常**：输入不是类数组时返回拒绝态 Promise
- **副作用**：订阅所有成员，以第一个完成或拒绝者决定结果

```js
Promise.race([ Promise.resolve('first'), Promise.resolve('second') ])
    .then(value => console.log(value));
```

拒绝且未注册处理器的 Promise 会通过 `console.warn` 输出警告。`Promise._immediateFn` 与 `Promise._unhandledRejectionFn` 是 polyfill 内部钩子，不属于稳定业务 API。

## ResultAdapter

### new ResultAdapter()

**`≤ 6.6.4`**

- <ins>**returns**</ins> { ResultAdapter }
- **异常**：UI 线程且 continuation 不可用时，首次等待可能失败
- **线程 / 生命周期**：构造时根据线程选择 continuation 或可阻塞 disposable；一个实例应只完成一次

把回调式异步接口转换成同步结果。在 UI 线程中使用 continuation；其他线程使用可阻塞的 disposable。

```js
const adapter = new ResultAdapter();
```

### ResultAdapter#setResult(result)

**`≤ 6.6.4`**

- **result** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：底层 continuation/disposable 已完成或失效时可能抛出异常
- **副作用**：以成功值完成适配器并唤醒等待方

```js
const adapter = new ResultAdapter();
setTimeout(() => adapter.setResult('ready'), 20);
console.log(adapter.get()); // ready
```

### ResultAdapter#setError(error)

**`≤ 6.6.4`**

- **error** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：UI continuation 路径不接受 nullish 错误，并会在发出恢复信号前抛出；重复完成也可能失败
- **副作用**：非 UI 路径保存错误并唤醒阻塞方；当 `get()` 已在等待时，UI continuation 路径会记录 / Toast 非 nullish 错误，再把错误对象作为普通恢复值交给 `get()`

```js
const adapter = new ResultAdapter();
setTimeout(() => adapter.setError(new Error('failed')), 20);
const outcome = adapter.get();
// UI continuation 路径：outcome 是 Error 对象；非 UI 阻塞路径：get() 会抛出该 Error。
```

### ResultAdapter#callback()

**`≤ 6.6.4`**

- <ins>**returns**</ins> { [Function](../types/data-types.md#function) } - `(result, error) => void`
- **异常**：回调完成底层适配器失败时向调用方传播
- **副作用 / 生命周期**：返回绑定当前实例的 Node 风格回调；只能用于单次完成流程

产品版本的实现只会在 `get()` 尚未开始等待时通过底层适配器完成；若先进入阻塞式 `get()`，之后才调用这个 callback，它只写入暂存结果而不会通知阻塞方。对真正异步的非 UI 回调，优先在原生回调中直接调用 `setResult` / `setError`。

```js
const adapter = new ResultAdapter();
const callback = adapter.callback();
callback('ready', null);
console.log(adapter.get()); // ready
```

### ResultAdapter#get()

**`≤ 6.6.4`**

- <ins>**returns**</ins> { [any](../types/data-types.md#any) }
- **异常**：非 UI 阻塞路径会重新抛出非 `null` 错误；UI continuation 路径不会重新抛出非 nullish 错误
- **线程 / 副作用**：未提前完成时暂停 continuation 或阻塞当前线程

在 UI continuation 路径中，当 `get()` 已暂停调用栈后，非 nullish 的错误会被记录 / Toast 并作为普通恢复值返回；nullish `setError` 会在恢复前抛出，使已进入 `get()` 的调用可能一直保持等待。非 UI 路径使用 `ContinuationResult.getOrThrow`，会抛出任何非 `null` 错误值。

```js
const adapter = new ResultAdapter();
adapter.setResult(42);
console.log(adapter.get()); // 42
```

### ResultAdapter.promise(promiseAdapter)

**`≤ 6.6.4`**

- **promiseAdapter** { `ScriptPromiseAdapter` }
- <ins>**returns**</ins> { `Promise` }
- **异常**：参数没有 `onResolve` 或 `onReject` 时抛出异常
- **副作用**：向原生适配器注册成功与失败回调

```js
// 实际使用时，promiseAdapter 通常由 Monkey King 原生异步 API 返回。
const promiseAdapter = {
    onResolve(callback) {
        this.resolve = callback;
        return this;
    },
    onReject(callback) {
        this.reject = callback;
        setTimeout(() => this.resolve('ready'), 20);
        return this;
    },
};

ResultAdapter.promise(promiseAdapter)
    .then(value => console.log(value)); // ready
```

### ResultAdapter.wait(promise)

**`≤ 6.6.4`**

- **promise** { `Promise | ScriptPromiseAdapter` }
- <ins>**returns**</ins> { [any](../types/data-types.md#any) }
- **异常**：取决于所选等待路径，不能保证所有拒绝都会重新抛出
- **线程 / 副作用**：continuation 启用时调用 `await`，否则调用阻塞式 `wait`

`ResultAdapter.wait` 不会统一两种错误语义：continuation 启用时沿用 UI continuation 路径，非 nullish 拒绝会作为普通恢复值返回，nullish 拒绝可能一直保持等待；未启用时沿用 `Promise#wait()`，只有真值拒绝原因才会抛出，假值拒绝返回 `undefined`。

```js
console.log(ResultAdapter.wait(Promise.resolve(42))); // 42

if (continuation.enabled) {
    console.log(ResultAdapter.wait(Promise.reject('failed'))); // failed（并已记录 / Toast）
} else {
    console.log(ResultAdapter.wait(Promise.reject(false))); // undefined
}
```

## 内置第三方入口

`axios`、`cheerio`、`dayjs` 和 `i18n` 是按首次访问延迟加载的全局属性。它们打包在应用当前公开 API 中，不从网络动态更新。

- [`axios`](https://axios-http.com/docs/intro)：内置文件自报版本 `1.1.2`；Monkey King 使用适配 Android/Rhino 的构建。
- [`cheerio`](https://cheerio.js.org/docs/intro)：使用内置的单文件打包版本；产品文档未公开独立版本字段。
- [`dayjs`](https://day.js.org/docs/en/installation/installation)：使用内置的核心单文件构建；未预装全部插件和地区包。
- `i18n`：基于内置的 `banana-i18n.js`，并增加本地 JSON 目录加载约定，详见 [Internationalization](../utilities/i18n.md)。

首次读取属性时可能同步加载并执行较大的打包文件；需要控制启动耗时时，可在真正使用前再访问。以下示例只演示 Monkey King 入口，不替代组件官方文档。

```js
axios.get('https://example.com')
    .then(response => console.log(response.status))
    .catch(error => console.error(error));
```

```js
const $ = cheerio.load('<main><h1>Monkey King</h1></main>');
console.log($('h1').text()); // Monkey King
```

```js
const date = dayjs('2026-09-10T08:30:00');
console.log(date.format('YYYY-MM-DD HH:mm')); // 2026-09-10 08:30
```

```js
i18n.setLocale('zh-CN');
i18n.load({ 'zh-CN': { hello: '你好，$1' } });
console.log(i18n('hello', 'Monkey King'));
```

`axios` 的请求适配器、Cookie、证书与线程行为受 Android/Rhino 构建影响；`cheerio` 不提供浏览器 DOM；`dayjs` 未自动安装可选插件；`i18n` 的路径与语言回退由 Monkey King 包装层管理。
