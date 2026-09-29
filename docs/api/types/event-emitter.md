# 事件发射器 (EventEmitter)

EventEmitter 是 Monkey King 多个模块共用的事件接口。`events`、传感器和 WebSocket 等对象会提供这些方法；业务脚本通常不直接构造 Java `EventEmitter`。

本文于 2026-09-10 按 Monkey King 当前产品行为核对。

默认监听器上限是 10。带运行时计时器的发射器会把回调排入脚本事件循环；没有计时器时通过当前脚本桥接器调用。注册、移除与发送操作本身同步完成，但监听器是否立即执行取决于发射器的计时器配置。

以下接口在可追溯历史中早于当前版本体系，产品版本中均已存在，因此以 `≤ 6.6.4` 标记。

除“获取 EventEmitter 接口”一节外，后续示例均假设已执行：

```js
const emitter = events.__asEmitter__({});
```

## [m#] EventEmitter#on

### EventEmitter#on(eventName, listener)

**`≤ 6.6.4`**

- **eventName** { [string](data-types.md#string) }
- **listener** { [Function](data-types.md#function) }
- <ins>**returns**</ins> { [EventEmitter](#事件发射器-eventemitter) }
- **异常**：监听器达到上限或参数不能转换为要求的 Java 类型时抛出异常
- **副作用**：注册持久监听器并发送内部 `newListener` 事件

若已有 sticky 数据，listener 会先收到该数据，然后继续保留。

```js
emitter.on('data', value => console.log(value));
```

## [m#] EventEmitter#addListener

### EventEmitter#addListener(eventName, listener)

**`≤ 6.6.4`**

- **参数、返回、异常与副作用**：与 [on](#eventemitter-on-eventname-listener) 完全相同

```js
emitter.addListener('data', value => console.log(value));
```

## [m#] EventEmitter#once

### EventEmitter#once(eventName, listener)

**`≤ 6.6.4`**

- **eventName** { [string](data-types.md#string) }
- **listener** { [Function](data-types.md#function) }
- <ins>**returns**</ins> { [EventEmitter](#事件发射器-eventemitter) }
- **异常**：监听器达到上限或参数类型不兼容时抛出异常
- **副作用**：注册一次性监听器并发送 `newListener`

若立即消费 sticky 数据，该监听器不会加入后续监听列表。

> **产品版本缺陷：**同一事件存在两个或更多 once 监听器时，发送循环会用递增索引修改 `CopyOnWriteArrayList`。前一个监听器删除后，后续删除可能命中错误位置或抛出 `IndexOutOfBoundsException`，后续一次性监听器可能残留。不要依赖一轮 `emit` 安全清除多个 `once` / `prependOnceListener`；需要可靠的一次性语义时应由回调自行用 `removeListener` 注销。

```js
emitter.once('ready', value => console.log(value));
```

## [m#] EventEmitter#prependListener

### EventEmitter#prependListener(eventName, listener)

**`≤ 6.6.4`**

- **eventName** { [string](data-types.md#string) }
- **listener** { [Function](data-types.md#function) }
- <ins>**returns**</ins> { [EventEmitter](#事件发射器-eventemitter) }
- **异常**：监听器达到上限或参数类型不兼容时抛出异常
- **副作用**：把持久监听器插入同名列表开头，并发送 `newListener`

与 `on` 不同，产品版本中的 prepend 路径不会立即回放已保存的 sticky 数据。

```js
emitter.prependListener('step', () => console.log('first'));
```

## [m#] EventEmitter#prependOnceListener

### EventEmitter#prependOnceListener(eventName, listener)

**`≤ 6.6.4`**

- **eventName** { [string](data-types.md#string) }
- **listener** { [Function](data-types.md#function) }
- <ins>**returns**</ins> { [EventEmitter](#事件发射器-eventemitter) }
- **异常**：监听器达到上限或参数类型不兼容时抛出异常
- **副作用**：把一次性监听器插入列表开头，并发送 `newListener`

与 `once` 不同，产品版本中的 prepend 路径不会立即消费已保存的 sticky 数据。它仍受 [多个 once 监听器的移除缺陷](#eventemitter-once-eventname-listener) 影响。

```js
emitter.prependOnceListener('step', () => console.log('first once'));
```

## [m#] EventEmitter#emit

### EventEmitter#emit(eventName, ...args)

**`≤ 6.6.4`**

- **eventName** { [string](data-types.md#string) }
- **args** { [...any[]](data-types.md#any) }
- <ins>**returns**</ins> { [boolean](data-types.md#boolean) } - 是否存在并调度了监听器
- **异常**：同步桥接执行的监听器异常会进入当前脚本异常流程
- **副作用**：按当前快照顺序发送事件；单个可正确定位的一次性监听器会在本次发送后移除，但多个一次性监听器可能残留并导致 `IndexOutOfBoundsException`

```js
const handled = emitter.emit('data', 42, 'ok');
console.log(handled);
```

## [m#] EventEmitter#emitSticky

### EventEmitter#emitSticky(eventName, ...args)

**`≤ 6.6.4`**

- **参数、返回与异常**：与 [emit](#eventemitter-emit-eventname-args) 相同
- **副作用 / 生命周期**：发送事件并保存本次参数；之后注册的监听器会立即收到最近一次 sticky 数据

移除监听器不会清除 sticky 数据；再次调用 `emitSticky` 会替换同名事件保存的参数。

```js
emitter.emitSticky('state', 'ready');
emitter.once('state', value => console.log(value)); // ready
```

## [m#] EventEmitter#removeListener

### EventEmitter#removeListener(eventName, listener)

**`≤ 6.6.4`**

- **eventName** { [string](data-types.md#string) }
- **listener** { [Function](data-types.md#function) } - 注册时的同一函数对象
- <ins>**returns**</ins> { [EventEmitter](#事件发射器-eventemitter) }
- **异常**：参数类型不兼容时抛出异常
- **副作用**：移除第一个匹配监听器；成功移除时发送 `removeListener`

```js
const listener = value => console.log(value);
emitter.on('data', listener);
emitter.removeListener('data', listener);
```

## [m#] EventEmitter#removeAllListeners

### EventEmitter#removeAllListeners(eventName?)

**`≤ 6.6.4`**

- **[ eventName ]** { [string](data-types.md#string) }
- <ins>**returns**</ins> { [EventEmitter](#事件发射器-eventemitter) }
- **异常**：指定事件名无法转换为字符串时抛出异常
- **副作用**：底层 Java 重载分别移除指定事件或全部事件监听器，并为每个移除项发送 `removeListener`；不清除 sticky 数据

> **`events.__asEmitter__` 适配缺陷：**两个 removeAllListeners Java 重载会以同名属性互相覆盖，反射返回顺序又没有稳定保证。因此适配后的脚本对象最终只保留其中一个签名；不要依赖两种调用形式同时可用。若需要稳定地清空某一事件，请获取 `listeners(eventName)` 快照并逐个调用 `removeListener(eventName, listener)`。

```js
for (const listener of emitter.listeners('data')) {
    emitter.removeListener('data', listener);
}
```

## [m#] EventEmitter#listeners

### EventEmitter#listeners(eventName)

**`≤ 6.6.4`**

- **eventName** { [string](data-types.md#string) }
- <ins>**returns**</ins> { [Function](data-types.md#function)[] } - 监听器快照
- **异常**：事件名类型不兼容时抛出异常
- **副作用**：查询不存在的事件也会建立一个空监听器列表

```js
console.log(emitter.listeners('data').length);
```

## [m#] EventEmitter#listenerCount

### EventEmitter#listenerCount(eventName)

**`≤ 6.6.4`**

- **eventName** { [string](data-types.md#string) }
- <ins>**returns**</ins> { [number](data-types.md#number) }
- **异常**：事件名类型不兼容时抛出异常
- **副作用**：无

```js
console.log(emitter.listenerCount('data')); // 0 或正整数
```

## [m#] EventEmitter#eventNames

### EventEmitter#eventNames()

**`≤ 6.6.4`**

- <ins>**returns**</ins> { [string](data-types.md#string)[] }
- **异常**：无
- **副作用**：无

返回内部已建立的事件名。空列表对应的名称也可能保留，结果顺序没有稳定保证。

```js
console.log(emitter.eventNames());
```

## [m#] EventEmitter#setMaxListeners

### EventEmitter#setMaxListeners(maxListeners)

**`≤ 6.6.4`**

- **maxListeners** { [number](data-types.md#number) } - 建议使用非负整数；0 表示无限制
- <ins>**returns**</ins> { [EventEmitter](#事件发射器-eventemitter) }
- **异常**：Java 数值转换失败时抛出异常；负数会使后续注册立即触发上限错误
- **副作用**：修改当前发射器的监听器上限

```js
emitter.setMaxListeners(20);
```

## [m#] EventEmitter#getMaxListeners

### EventEmitter#getMaxListeners()

**`≤ 6.6.4`**

- <ins>**returns**</ins> { [number](data-types.md#number) }
- **异常**：无
- **副作用**：无

```js
console.log(emitter.getMaxListeners()); // 默认 10
```

## [m#] EventEmitter#getTimer

### EventEmitter#getTimer()

**`≤ 6.6.4`** **`Low-level`**

- <ins>**returns**</ins> { `Timer | null` }
- **异常**：无
- **副作用**：无

返回发射器用于调度监听器的运行时计时器；没有计时器时返回 `null`。该对象属于运行时内部设施，不应由业务脚本关闭或替换。

```js
console.log(emitter.getTimer() === null || typeof emitter.getTimer() === 'object');
```

## [m#] EventEmitter#defaultMaxListeners

### EventEmitter#defaultMaxListeners()

**`≤ 6.6.4`** **`Low-level`**

- <ins>**returns**</ins> { [number](data-types.md#number) } - 新实例的默认上限，产品版本中为 10
- **异常**：无
- **副作用**：无

```js
console.log(emitter.defaultMaxListeners()); // 10
```

## 获取 EventEmitter 接口

`events.__asEmitter__(object?, thread?)` 是底层适配入口，会把上述 Java 公共方法安装到 Rhino 对象。object 必须是 Rhino `ScriptableObject`；thread 只接受运行时主线程代理或 Java `Thread`。同名 Java 重载没有被合并：它们先同时通过属性缺失检查，再依次写入相同属性名，后写入者覆盖先写入者；`removeAllListeners()` 与 `removeAllListeners(eventName)` 因此不能视为可靠共存。

```js
const emitter = events.__asEmitter__({});
emitter.once('ready', value => console.log(value));
emitter.emit('ready', 42);
```

适配后的发射器与当前脚本运行时绑定。脚本退出后不要继续从其他线程调用其监听器。
