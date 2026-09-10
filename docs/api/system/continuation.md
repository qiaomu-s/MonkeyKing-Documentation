# 协程 (Continuation)

`continuation` 与 `$continuation` 指向同一个只读模块对象。它在 Rhino 2.0 中捕获当前 JavaScript 调用栈，并在异步结果到达后恢复执行。

本文于 2026-09-10 按 Monkey King 6.7.0 源码提交 `bafa2986212d27b6b59f1324f89548b72a810966` 核对。

只有启用了 `continuation` 特性的脚本才能暂停调用栈。普通执行模式调用等待接口会抛出 `IllegalStateException`。创建器与捕获的脚本运行时绑定，恢复后不要再次调用 `resume` 或 `resumeError`。

> **固定提交的错误恢复语义不同于标准 Promise。** `Continuation.Result.handle` 会记录并 Toast 非 `null` 错误，然后把该错误对象当作普通恢复值传回。因此，非 nullish 的拒绝原因不会在等待点重新抛出，而是作为普通恢复值返回。若拒绝原因为 `null` 或 `undefined`，`resumeError` 会在恢复 continuation 之前抛出参数异常；原等待点得不到恢复信号，可能一直保持等待。

## [@] continuation

### continuation

**`≤ 6.6.4`** **`READONLY`** **`Alias: $continuation`**

- **类型**：`object`
- **权限**：不需要 Android 权限
- **生命周期 / 副作用**：只影响当前脚本运行时；等待接口会暂停当前 continuation

```js
console.log($continuation === continuation); // true
console.log(typeof continuation.create); // "function"
```

## [p] enabled

### continuation.enabled

**`≤ 6.6.4`** **`READONLY`**

- **&lt;get&gt;** { [boolean](../types/data-types.md#boolean) }
- **异常**：无
- **副作用**：无

返回当前脚本引擎是否启用了 continuation 特性。

```js
if (!continuation.enabled) {
    console.warn('当前脚本不能捕获 continuation');
}
```
## [m] create

### continuation.create(scope?)

**`≤ 6.6.4`**

- **[ scope = `global` ]** { [Object](../types/data-types.md#object) } - 捕获 continuation 使用的 Rhino 作用域
- <ins>**returns**</ins> { [ContinuationCreator](#continuationcreator) }
- **异常**：参数超过 1 个时抛出异常；运行时不能捕获 continuation 时，后续 `await` 会抛出异常
- **生命周期 / 副作用**：创建与当前运行时绑定的 continuation 控制器

`scope` 只有在它是 Rhino `Scriptable` 时才会采用；其他值按未提供处理并回退到顶级作用域。

```js
const creator = continuation.create(global);
setTimeout(() => creator.resume('ready'), 20);
console.log(creator.await()); // ready
```

## [m] await

### continuation.await(promise)

**`≤ 6.6.4`**

- **promise** { `PromiseLike` } - 提供 `then` 与 `catch` 的对象
- <ins>**returns**</ins> { [any](../types/data-types.md#any) } - Promise 的完成值；非 nullish 的拒绝原因会在记录 / Toast 后作为普通恢复值返回
- **异常**：参数不是 Promise-like 或 continuation 未启用时抛出异常；nullish 拒绝会使 `resumeError` 自身抛出，等待点可能一直保持等待
- **生命周期 / 副作用**：暂停当前 JavaScript continuation，直至 Promise 完成

```js
const value = continuation.await(Promise.resolve(21));
console.log(value * 2); // 42

const recovered = continuation.await(Promise.reject(new Error('failed')));
console.log(recovered.message); // failed；此值没有在等待点抛出
```

## [m] delay

### continuation.delay(millis)

**`≤ 6.6.4`**

- **millis** { [number](../types/data-types.md#number) } - 延迟毫秒数
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：计时器参数无效或 continuation 未启用时抛出异常
- **生命周期 / 副作用**：注册一次性计时器并暂停当前 continuation

```js
const startedAt = Date.now();
continuation.delay(20);
console.log(Date.now() >= startedAt + 20); // true
```

---

## ContinuationCreator

`continuation.create()` 返回的运行时包装对象，公开 `await`、`resume` 和 `resumeError`。

## [m#] ContinuationCreator#await

### ContinuationCreator#await()

**`≤ 6.6.4`**

- <ins>**returns**</ins> { [any](../types/data-types.md#any) } - `resume` 提供的值；`resumeError` 的非 nullish 错误在记录 / Toast 后也会作为普通恢复值返回
- **异常**：未启用 continuation 时抛出 `IllegalStateException`；nullish 错误会在 `resumeError` 调用点抛出并可能让此等待点一直保持等待
- **线程 / 生命周期**：暂停当前 continuation；同一创建器只应完成一次

```js
const creator = continuation.create();
setTimeout(() => creator.resume({ ok: true }), 20);
console.log(creator.await().ok); // true
```

## [m#] ContinuationCreator#resume

### ContinuationCreator#resume(result?)

**`≤ 6.6.4`**

- **[ result = `undefined` ]** { [any](../types/data-types.md#any) }
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：重复恢复或恢复已经失效的 continuation 时，底层运行时可能抛出异常
- **线程 / 副作用**：以成功结果恢复等待中的调用栈；可由计时器或异步回调触发

```js
const creator = continuation.create();
setTimeout(() => creator.resume(7), 20);
console.log(creator.await()); // 7
```

## [m#] ContinuationCreator#resumeError

### ContinuationCreator#resumeError(error)

**`≤ 6.6.4`**

- **error** { [any](../types/data-types.md#any) } - 非 `null`、非 `undefined` 的错误值
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：error 为 nullish 或 continuation 已恢复时抛出异常；nullish 检查发生在恢复之前
- **线程 / 副作用**：以错误值恢复等待中的调用栈；固定提交不会把非 nullish 错误重新抛到等待点，而是记录 / Toast 后把它作为普通恢复值返回

```js
const creator = continuation.create();
setTimeout(() => creator.resumeError(new Error('request failed')), 20);
const recovered = creator.await();
console.log(recovered.message); // request failed

// 不要传 null 或 undefined：resumeError 会先抛出，creator.await() 可能永远等不到恢复。
```
