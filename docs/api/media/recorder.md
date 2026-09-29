# 记录器 (Recorder)

`recorder` 是脚本内存中的轻量计时记录器。它使用 `System.currentTimeMillis()` 保存墙上时钟毫秒值，可按字符串键保存，也可使用匿名栈；数据只属于当前 `ScriptRuntime`，不会写入磁盘，脚本结束后即丢失。

> 本模块用于“记录经过时间”，不要与执行定时任务的 [timers](../system/timers.md) 混淆。系统时间被手动或网络校时调整时，计算出的间隔也会随之变化。

<a id="api-symbol-bW9kdWxlOnJlY29yZGVy"></a>

## `recorder` 模块

运行时自动提供，无需导入。命名记录保存在键值表中，匿名记录保存在后进先出栈中。实现不做跨线程同步；应在同一脚本线程使用，或由调用方自行串行化访问。

<a id="api-symbol-Y2FsbDpyZWNvcmRlcg"></a>

## `recorder(keyOrFunction?, timestampOrThis?)`

```ts
recorder(): number
recorder(key: string, timestamp?: number): number
recorder(callback: Function, thisObject?: object): number
```

全局对象可直接调用，行为与 `recorder.shortcut` 完全相同，最多接受两个实参。

```js
recorder('download')              // 第一次：保存当前毫秒值
sleep(250)
console.log(recorder('download')) // 后续：返回从首次保存到现在的毫秒数
```

<a id="api-symbol-cmVjb3JkZXIuc2hvcnRjdXQ"></a>

## `recorder.shortcut(keyOrFunction?, timestampOrThis?)`

```ts
recorder.shortcut(): number
recorder.shortcut(key: string, timestamp?: number): number
recorder.shortcut(callback: Function, thisObject?: object): number
```

快捷入口按首参数类型分派：

- 省略参数：匿名栈为空时压入当前时间并返回该时间戳；栈非空时弹出最后一项并返回经过毫秒数。
- 字符串键：键不存在时保存 `timestamp`（默认当前时间）；键存在时返回从已保存值到 `timestamp`（默认当前时间）的差。命名记录不会因读取自动删除。
- 函数：以临时键记录开始时间，立即调用函数，返回函数执行耗时并删除临时键。第二参数若提供，必须是非函数 JavaScript 对象并作为回调的 `this`；其他类型会抛出 `IllegalArgumentException`。回调自身的异常会继续向外传播。

```js
const elapsed = recorder(function work() {
  sleep(120)
})
console.log(elapsed)

const context = { answer: 42 }
const elapsedWithThis = recorder(function () {
  console.log(this.answer)
}, context)
```

<a id="api-symbol-cmVjb3JkZXIuc2F2ZQ"></a>

## `recorder.save(key?, timestamp?)`

```ts
recorder.save(key?: string, timestamp?: number): number
```

保存并返回时间戳。省略 `timestamp` 时使用当前毫秒值；省略 `key` 时压入匿名栈，否则覆盖同名记录。显式时间戳会按长整数数值转换后保存为 JavaScript `number`。

```js
const startedAt = recorder.save('job')
recorder.save('fixture', 1_000)
```

<a id="api-symbol-cmVjb3JkZXIubG9hZA"></a>

## `recorder.load(key?, timestamp?)`

```ts
recorder.load(key?: string, timestamp?: number): number
```

返回 `timestamp - savedTimestamp`，省略 `timestamp` 时使用当前时间。匿名读取会弹出栈顶；命名读取保留记录。键不存在或匿名栈为空时返回 `NaN`。

```js
recorder.save('phase')
sleep(80)
console.log(recorder.load('phase'))
console.log(Number.isNaN(recorder.load('missing')))
```

<a id="api-symbol-cmVjb3JkZXIuaXNMZXNzVGhhbg"></a>

## `recorder.isLessThan(key, compare)`

```ts
recorder.isLessThan(key: string, compare: number): boolean
```

比较命名记录到当前时间的间隔是否小于 `compare` 毫秒。缺失键产生 `NaN`，因此返回 `false`；无法转换为长整数的比较值会触发数值转换异常。

<a id="api-symbol-cmVjb3JkZXIuaXNHcmVhdGVyVGhhbg"></a>

## `recorder.isGreaterThan(key, compare)`

```ts
recorder.isGreaterThan(key: string, compare: number): boolean
```

比较命名记录到当前时间的间隔是否大于 `compare` 毫秒。它不会移除或更新记录。

```js
recorder.save('poll')
sleep(30)
if (recorder.isGreaterThan('poll', 20)) console.log('超过 20 ms')
```

<a id="api-symbol-cmVjb3JkZXIuaGFz"></a>

## `recorder.has(key)`

```ts
recorder.has(key: string): boolean
```

命名键存在时返回 `true`。`null` 或 `undefined` 返回 `false`；匿名栈不参与查询。

<a id="api-symbol-cmVjb3JkZXIucmVtb3Zl"></a>

## `recorder.remove(key)`

```ts
recorder.remove(key: string): boolean
```

删除命名记录，确实删除时返回 `true`，键缺失或参数为空时返回 `false`。不会影响匿名栈。

<a id="api-symbol-cmVjb3JkZXIuY2xlYXI"></a>

## `recorder.clear()`

```ts
recorder.clear(): void
```

清空全部命名记录和匿名栈。该操作不可撤销，但只影响当前脚本运行时的内存状态。

```js
recorder.save('a')
recorder.save()
recorder.clear()
console.log(recorder.has('a')) // false
console.log(recorder.load())   // NaN
```

## 权限、异常与版本

- 所有入口都只操作内存和系统时钟，不申请 Android 权限，也不执行 I/O。
- 参数数量或类型不符合合同会抛出参数/转换异常；计时键缺失本身不抛异常，而以 `NaN` 表示。
- 回调快捷形式同步执行回调，耗时包含整个同步调用过程。
- 本页合同对应 MonkeyKing。


## 逐符号版本与 Rhino 2.0 示例

下列每个条目都对应一个公开 API 符号；示例按 Rhino 2.0 语法书写。需要文件、网络或 UI 资源的示例应在具备相应运行条件时执行。

<!-- api-member-contract id="call:recorder" -->
`call:recorder` · Rhino 2.0 示例：
```js
console.log(typeof recorder);
```

<!-- api-member-contract id="module:recorder" -->
`module:recorder` · Rhino 2.0 示例：
```js
console.log(typeof recorder);
```

<!-- api-member-contract id="recorder.clear" -->
`recorder.clear` · Rhino 2.0 示例：
```js
console.log(typeof recorder.clear);
```

<!-- api-member-contract id="recorder.has" -->
`recorder.has` · Rhino 2.0 示例：
```js
console.log(typeof recorder.has);
```

<!-- api-member-contract id="recorder.isGreaterThan" -->
`recorder.isGreaterThan` · Rhino 2.0 示例：
```js
console.log(typeof recorder.isGreaterThan);
```

<!-- api-member-contract id="recorder.isLessThan" -->
`recorder.isLessThan` · Rhino 2.0 示例：
```js
console.log(typeof recorder.isLessThan);
```

<!-- api-member-contract id="recorder.load" -->
`recorder.load` · Rhino 2.0 示例：
```js
console.log(typeof recorder.load);
```

<!-- api-member-contract id="recorder.remove" -->
`recorder.remove` · Rhino 2.0 示例：
```js
console.log(typeof recorder.remove);
```

<!-- api-member-contract id="recorder.save" -->
`recorder.save` · Rhino 2.0 示例：
```js
console.log(typeof recorder.save);
```

<!-- api-member-contract id="recorder.shortcut" -->
`recorder.shortcut` · Rhino 2.0 示例：
```js
console.log(typeof recorder.shortcut);
```
