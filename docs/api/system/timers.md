# 定时器 (Timers)

timers 模块暴露了一个全局的 API, 用于在某个未来时间段调用调度函数.  因为定时器函数是全局的, 所以使用该 API 无需调用 timers.***

Monkey King 中的计时器函数实现了与 Web 浏览器提供的定时器类似的 API, 除了它使用了一个不同的内部实现, 它是基于 Android Looper-Handler消息循环机制构建的. 其实现机制与Node.js比较相似.

例如, 要在5秒后发出消息"hello":

```
setTimeout(function(){
    toast("hello")
}, 5000);
```

需要注意的是, 这些定时器仍然是单线程的. 如果脚本主体有耗时操作或死循环, 则设定的定时器不能被及时执行, 例如：

```
setTimeout(function(){
    //这里的语句会在15秒后执行而不是5秒后
    toast("hello")
}, 5000);
//暂停10秒
sleep(10000);
```

再如：

```
setTimeout(function(){
    //这里的语句永远不会被执行
    toast("hello")
}, 5000);
//死循环
while(true);
```

## setInterval(callback, delay\[, ...args\])

* `callback` {Function} 当定时器到点时要调用的函数.
* `delay` {number} 调用 callback 之前要等待的毫秒数.
* `...args` {any} 当调用 callback 时要传入的可选参数.

预定每隔 delay 毫秒重复执行的 callback.  返回一个用于 clearInterval() 的 id.

当 delay 小于 0 时, delay 会被设为 0.

## setTimeout(callback, delay\[, ...args\])

* `callback` {Function} 当定时器到点时要调用的函数.
* `delay` {number} 调用 callback 之前要等待的毫秒数.
* `...args` {any} 当调用 callback 时要传入的可选参数.

预定在 delay 毫秒之后执行的单次 callback.  返回一个用于 clearTimeout() 的 id.

callback 可能不会精确地在 delay 毫秒被调用.  Monkey King 不能保证回调被触发的确切时间, 也不能保证它们的顺序.  回调会在尽可能接近所指定的时间上调用.

当 delay 小于 0 时, delay 会被设为 0.

## setImmediate(callback[, ...args])

* `callback` {Function} 在Looper循环的当前回合结束时要调用的函数.
* `...args` {any} 当调用 callback 时要传入的可选参数.

预定立即执行的 callback, 它是在 I/O 事件的回调之后被触发.  返回一个用于 clearImmediate() 的 id.

当多次调用 setImmediate() 时, callback 函数会按照它们被创建的顺序依次执行.  每次事件循环迭代都会处理整个回调队列.  如果一个立即定时器是被一个正在执行的回调排入队列的, 则该定时器直到下一次事件循环迭代才会被触发.

setImmediate()、setInterval() 和 setTimeout() 方法每次都会返回表示预定的计时器的id.  它们可用于取消定时器并防止触发.

## clearInterval(id)

* `id` {number} 一个 setInterval() 返回的 id.

取消一个由 setInterval() 创建的循环定时任务.

例如：

```
//每5秒就发出一次hello
var id = setInterval(function(){
    toast("hello");
}, 5000);
//1分钟后取消循环
setTimeout(function(){
    clearInterval(id);
}, 60 * 1000);
```

## clearTimeout(id)

* `id` {number} 一个 setTimeout() 返回的 id.

取消一个由 setTimeout() 创建的定时任务.

## clearImmediate(id)

* `id` {number} 一个 setImmediate() 返回的 id.

取消一个由 setImmediate() 创建的 Immediate 对象.

<!-- fixed-source-contracts:start -->

## 固定源码合同表

下表覆盖本页在固定提交 `bafa2986212d` 中的每个 canonical 公共成员。每行同时给出稳定锚点、源码位置、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Z2xvYmFsOmNsZWFySW1tZWRpYXRl"></a> `global:clearImmediate` | `clearImmediate(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/timers/Timers.kt:L94` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof clearImmediate);` |
| <a id="api-symbol-Z2xvYmFsOmNsZWFySW50ZXJ2YWw"></a> `global:clearInterval` | `clearInterval(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/timers/Timers.kt:L77` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof clearInterval);` |
| <a id="api-symbol-Z2xvYmFsOmNsZWFyVGltZW91dA"></a> `global:clearTimeout` | `clearTimeout(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/timers/Timers.kt:L58` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof clearTimeout);` |
| <a id="api-symbol-Z2xvYmFsOmtlZXBBbGl2ZQ"></a> `global:keepAlive` | `keepAlive(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/timers/Timers.kt:L109` | 参数：0 至 1 个参数；可选项与默认值见本页说明或源码守卫 | 返回：Double；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof keepAlive);` |
| <a id="api-symbol-Z2xvYmFsOmxvb3A"></a> `global:loop` | `loop()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/timers/Timers.kt:L100` | 参数：无参数；可选项与默认值见本页说明或源码守卫 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof loop);` |
| <a id="api-symbol-Z2xvYmFsOnNldEltbWVkaWF0ZQ"></a> `global:setImmediate` | `setImmediate(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/timers/Timers.kt:L83` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof setImmediate);` |
| <a id="api-symbol-Z2xvYmFsOnNldEludGVydmFs"></a> `global:setInterval` | `setInterval(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/timers/Timers.kt:L64` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof setInterval);` |
| <a id="api-symbol-Z2xvYmFsOnNldFRpbWVvdXQ"></a> `global:setTimeout` | `setTimeout(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/timers/Timers.kt:L45` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof setTimeout);` |
| <a id="api-symbol-bW9kdWxlOnRpbWVycw"></a> `module:timers` | `timers` 模块入口 · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/ScriptRuntime.kt:L740` | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers);` |
| <a id="api-symbol-dGltZXJzLmNsZWFySW1tZWRpYXRl"></a> `timers.clearImmediate` | `timers.clearImmediate(id: Double)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L85` | 参数：id: Double；可选项与默认值按固定源码重载 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers.clearImmediate);` |
| <a id="api-symbol-dGltZXJzLmNsZWFySW50ZXJ2YWw"></a> `timers.clearInterval` | `timers.clearInterval(id: Double)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L77` | 参数：id: Double；可选项与默认值按固定源码重载 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers.clearInterval);` |
| <a id="api-symbol-dGltZXJzLmNsZWFyVGltZW91dA"></a> `timers.clearTimeout` | `timers.clearTimeout(id: Double)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L65` | 参数：id: Double；可选项与默认值按固定源码重载 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers.clearTimeout);` |
| <a id="api-symbol-dGltZXJzLmdldFRpbWVyRm9ySWQ"></a> `timers.getTimerForId` | `timers.getTimerForId(id: Double)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L49` | 参数：id: Double；可选项与默认值按固定源码重载 | 返回：Timer?；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers.getTimerForId);` |
| <a id="api-symbol-dGltZXJzLmdldFRpbWVyRm9yVGhyZWFk"></a> `timers.getTimerForThread` | `timers.getTimerForThread(thread: Thread)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L37` | 参数：thread: Thread；可选项与默认值按固定源码重载 | 返回：Timer?；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers.getTimerForThread);` |
| <a id="api-symbol-dGltZXJzLmhhc1BlbmRpbmdDYWxsYmFja3M"></a> `timers.hasPendingCallbacks` | `timers.hasPendingCallbacks()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L93` | 无参数；不接受额外参数 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers.hasPendingCallbacks);` |
| <a id="api-symbol-dGltZXJzLmtlZXBBbGl2ZQ"></a> `timers.keepAlive` | `timers.keepAlive(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/timers/Timers.kt:L109` | 参数：0 至 1 个参数；可选项与默认值见本页说明或源码守卫 | 返回：Double；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers.keepAlive);` |
| <a id="api-symbol-dGltZXJzLm1haW5UaW1lcg"></a> `timers.mainTimer` | `timers.mainTimer` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L18` | 属性访问；无调用参数 | 返回：Timer；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(timers.mainTimer);` |
| <a id="api-symbol-dGltZXJzLm1heENhbGxiYWNrVXB0aW1lTWlsbGlzRm9yQWxsVGhyZWFkcw"></a> `timers.maxCallbackUptimeMillisForAllThreads` | `timers.maxCallbackUptimeMillisForAllThreads` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L19` | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(timers.maxCallbackUptimeMillisForAllThreads);` |
| <a id="api-symbol-dGltZXJzLm5ld1RpbWVy"></a> `timers.newTimer` | `timers.newTimer(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L111` | 参数：按固定源码声明；可选项与默认值见本页说明或源码守卫 | 返回：Timer；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers.newTimer);` |
| <a id="api-symbol-dGltZXJzLnJlY3ljbGU"></a> `timers.recycle` | `timers.recycle()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L89` | 无参数；不接受额外参数 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers.recycle);` |
| <a id="api-symbol-dGltZXJzLnNldEltbWVkaWF0ZQ"></a> `timers.setImmediate` | `timers.setImmediate(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L81` | 参数：按固定源码声明；可选项与默认值见本页说明或源码守卫 | 返回：Double；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers.setImmediate);` |
| <a id="api-symbol-dGltZXJzLnNldEludGVydmFs"></a> `timers.setInterval` | `timers.setInterval(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L69` | 参数：按固定源码声明；可选项与默认值见本页说明或源码守卫 | 返回：Double；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers.setInterval);` |
| <a id="api-symbol-dGltZXJzLnNldEludGVydmFsRXh0"></a> `timers.setIntervalExt` | `timers.setIntervalExt(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/timers/Timers.kt:L123` | 参数：1 至 4 个参数；可选项与默认值见本页说明或源码守卫 | 返回：Double；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers.setIntervalExt);` |
| <a id="api-symbol-dGltZXJzLnNldFRpbWVvdXQ"></a> `timers.setTimeout` | `timers.setTimeout(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L57` | 参数：按固定源码声明；可选项与默认值见本页说明或源码守卫 | 返回：Double；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof timers.setTimeout);` |
| <a id="api-symbol-dGltZXJzLnRpbWVyRm9yQ3VycmVudFRocmVhZA"></a> `timers.timerForCurrentThread` | `timers.timerForCurrentThread` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/Timers.kt:L21` | 属性访问；无调用参数 | 返回：Timer?；参数校验、状态或底层异常原样传播 | 权限：无需额外 Android 权限；线程：回调在线程对应的 Looper 或 EventLoop 上执行 | 生命周期：未清除的 timer 保持事件循环活动；副作用：安排、取消或重复执行回调 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(timers.timerForCurrentThread);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: timers');
```

<!-- fixed-source-contracts:end -->
