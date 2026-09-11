# 任务 (Tasks)

`tasks` 管理 Monkey King 的定时任务与广播触发任务；`$tasks` 指向同一个模块对象。当前实现合同未保留这些旧 API 的首次发布标签，因此本页统一标记为 **≤ v6.6.4（旧文档未记录精确版本）**。

本页示例面向 Monkey King **Rhino 2.0**。任务增删改查会同步访问 `TimedTaskManager` 的持久化数据；不需要额外 Android 运行时权限，但脚本路径必须可读，系统能否准时触发仍受 Android 后台、闹钟与省电策略影响。

## 通用选项

`addDailyTask`、`addWeeklyTask`、`addDisposableTask` 与 `addIntentTask` 接受 0 或 1 个选项对象。

| 选项 | 默认值 | 合法值与作用 |
| --- | --- | --- |
| `path` | 无 | 必填脚本路径；相对路径按当前脚本运行目录解析。 |
| `time` / `date` | 当前时间 | 数字时间戳、JavaScript `Date` 或 Joda-Time 可解析的字符串；`time` 优先。 |
| `delay` | `0` | 首次执行前延迟毫秒数。 |
| `interval` | `0` | 循环间隔毫秒数。 |
| `loopTimes` | `1` | 执行次数。 |
| `callback` | 无 | JavaScript 函数；任务写入后以任务对象为唯一参数调用。 |
| `isAsync` / `async` | `false` | 为真时在线程模块启动的工作线程中完成回调；从 UI 线程调用时也会自动切到工作线程。 |
| `daysOfWeek` | 当前星期 | 仅周任务使用。接受星期英文全称、三字母缩写、中文“一”至“日”，以及数字 `0..6` 或 `1..7`。 |
| `action` | 无 | 仅 Intent 任务使用的广播 action；启动广播会自动设为本地广播。 |
| `dataType` | 无 | 仅 Intent 任务使用的 MIME data type。 |
| `isLocal` / `local` | 由 action 决定 | 是否监听应用内本地广播；显式值优先。 |

同步调用返回任务对象，若提供 `callback` 则返回回调结果。异步调用或 UI 线程调用返回 `threads.start(...)` 创建的线程对象。未知日期、未知星期、缺少 `path`、错误参数数量或非函数 `callback` 都会抛出参数异常。

## 创建任务

### tasks.addTask(task)

只接受一个 `TimedTask` 或 `IntentTask` 实例，同步写入任务管理器并返回原实例；其他类型抛出异常。

### tasks.addDailyTask(options?)

创建每天在指定时间运行的任务。

### tasks.addWeeklyTask(options?)

创建每周任务；`daysOfWeek` 会被转换为 `TimedTask` 使用的星期位掩码。

### tasks.addDisposableTask(options?)

创建只执行一次的任务，`time` / `date` 表示完整日期时间。

### tasks.addIntentTask(options?)

创建收到指定广播后执行的任务。

## 查询、更新与删除

| 方法 | 参数 | 返回值与异常 |
| --- | --- | --- |
| `tasks.getTimedTask(id)` | 一个可转换为长整数的任务 ID | 对应 `TimedTask`，不存在时返回 `null`。 |
| `tasks.getIntentTask(id)` | 一个可转换为长整数的任务 ID | 对应 `IntentTask`，不存在时返回 `null`。 |
| `tasks.removeTask(task)` | `TimedTask`、`IntentTask` 或 nullish | 删除成功返回 `true`；nullish 返回 `false`；其他类型抛出异常。 |
| `tasks.removeTimedTask(id)` | 一个整数 ID | 查找并删除定时任务，返回布尔值。 |
| `tasks.removeIntentTask(id)` | 一个整数 ID | 查找并删除 Intent 任务，返回布尔值。 |
| `tasks.updateTask(task)` | `TimedTask`、`IntentTask` 或 nullish | 更新成功返回 `true`；nullish 返回 `false`；其他类型抛出异常。 |
| `tasks.queryTimedTasks(options?)` | 可选 `{ path }` | 返回全部定时任务；提供路径时只返回脚本路径完全相同的任务。 |
| `tasks.queryIntentTasks(options?)` | 可选 `{ path, action }` | 返回同时满足已提供过滤条件的 Intent 任务。 |

## 星期位掩码

### tasks.timeFlagToDays(flag)

把整数位掩码转换为星期索引数组。索引使用 `0..6`，其中 `0` 表示星期日。

### tasks.daysToTimeFlag(days)

把星期索引数组转换为位掩码。只检查 `0..6` 七个位；重复值不会重复计数。

## Rhino 2.0 示例

下面创建一个一次性任务，随后通过脚本路径查回它。示例会写入任务数据库，确认后可调用 `tasks.removeTask(task)` 清理。

```js
const task = tasks.addDisposableTask({
    path: files.path('./scheduled-job.js'),
    time: Date.now() + 60 * 1000,
    delay: 0,
    interval: 0,
    loopTimes: 1,
});

console.log(task);
console.log(tasks.queryTimedTasks({ path: files.path('./scheduled-job.js') }));
```

生命周期上，任务写入后独立于创建它的脚本保存，直到执行策略完成、应用数据被清除，或调用删除 API。副作用包括持久化任务、注册广播触发条件以及未来启动脚本；查询与位掩码转换不会修改任务。

<!-- api-contracts:start -->

## API 合同表

下表覆盖本页在产品版本 `6.7.0` 中的每个 canonical 公共成员。每行同时给出稳定锚点、实现合同、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-bW9kdWxlOnRhc2tz"></a> `module:tasks` | `tasks` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks);` |
| <a id="api-symbol-dGFza3MuYWRkRGFpbHlUYXNr"></a> `tasks.addDailyTask` | `tasks.addDailyTask(...args)` · 实现合同  | 参数：0 至 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Any?；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.addDailyTask);` |
| <a id="api-symbol-dGFza3MuYWRkRGlzcG9zYWJsZVRhc2s"></a> `tasks.addDisposableTask` | `tasks.addDisposableTask(...args)` · 实现合同  | 参数：0 至 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Any?；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.addDisposableTask);` |
| <a id="api-symbol-dGFza3MuYWRkSW50ZW50VGFzaw"></a> `tasks.addIntentTask` | `tasks.addIntentTask(...args)` · 实现合同  | 参数：0 至 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Any?；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.addIntentTask);` |
| <a id="api-symbol-dGFza3MuYWRkVGFzaw"></a> `tasks.addTask` | `tasks.addTask(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Any；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.addTask);` |
| <a id="api-symbol-dGFza3MuYWRkV2Vla2x5VGFzaw"></a> `tasks.addWeeklyTask` | `tasks.addWeeklyTask(...args)` · 实现合同  | 参数：0 至 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Any?；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.addWeeklyTask);` |
| <a id="api-symbol-dGFza3MuZGF5c1RvVGltZUZsYWc"></a> `tasks.daysToTimeFlag` | `tasks.daysToTimeFlag(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Int；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.daysToTimeFlag);` |
| <a id="api-symbol-dGFza3MuZ2V0SW50ZW50VGFzaw"></a> `tasks.getIntentTask` | `tasks.getIntentTask(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：IntentTask?；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.getIntentTask);` |
| <a id="api-symbol-dGFza3MuZ2V0VGltZWRUYXNr"></a> `tasks.getTimedTask` | `tasks.getTimedTask(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：TimedTask?；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.getTimedTask);` |
| <a id="api-symbol-dGFza3MucXVlcnlJbnRlbnRUYXNrcw"></a> `tasks.queryIntentTasks` | `tasks.queryIntentTasks(...args)` · 实现合同  | 参数：0 至 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：NativeArray；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.queryIntentTasks);` |
| <a id="api-symbol-dGFza3MucXVlcnlUaW1lZFRhc2tz"></a> `tasks.queryTimedTasks` | `tasks.queryTimedTasks(...args)` · 实现合同  | 参数：0 至 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：NativeArray；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.queryTimedTasks);` |
| <a id="api-symbol-dGFza3MucmVtb3ZlSW50ZW50VGFzaw"></a> `tasks.removeIntentTask` | `tasks.removeIntentTask(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.removeIntentTask);` |
| <a id="api-symbol-dGFza3MucmVtb3ZlVGFzaw"></a> `tasks.removeTask` | `tasks.removeTask(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.removeTask);` |
| <a id="api-symbol-dGFza3MucmVtb3ZlVGltZWRUYXNr"></a> `tasks.removeTimedTask` | `tasks.removeTimedTask(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.removeTimedTask);` |
| <a id="api-symbol-dGFza3MudGltZUZsYWdUb0RheXM"></a> `tasks.timeFlagToDays` | `tasks.timeFlagToDays(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：NativeArray；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.timeFlagToDays);` |
| <a id="api-symbol-dGFza3MudXBkYXRlVGFzaw"></a> `tasks.updateTask` | `tasks.updateTask(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：模块不额外请求权限，未来执行受后台和闹钟策略影响；线程：管理器同步，async 或 UI 调用启动工作线程 | 生命周期：任务持久化并可在创建脚本结束后继续存在；副作用：增删改写任务数据库并注册未来触发 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof tasks.updateTask);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: tasks');
```

<!-- api-contracts:end -->
