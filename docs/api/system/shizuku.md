# Shizuku

通过 [Shizuku](https://shizuku.rikka.app/introduction/) 可以获得 ADB 特权并使用系统 API.

使用 Shizuku 需满足以下全部条件

- 设备已安装 [Shizuku 应用](https://github.com/RikkaApps/Shizuku/releases) (版本不低于 `11`)
- Shizuku 服务已启动 (参阅 [Shizuku 用户手册](https://shizuku.rikka.app/guide/setup/#start-shizuku))
- Monkey King 首页抽屉开启 Shizuku 权限开关

---

<p style="font: bold 2em sans-serif; color: #FF7043">shizuku</p>

---

## [@] shizuku

shizuku 可作为全局对象使用:

```js
typeof shizuku; // "function"
typeof shizuku.execCommand; // "function"
```

### shizuku(cmd)

**`6.4.0`** **`Overload 1/2`**

- **cmd** { [string](../types/data-types.md#string) } - 待执行命令
- <ins>**returns**</ins> { ShellResult } - Shell 结果

使用 Shizuku 执行命令.

```js
/* 模拟返回键. */
shizuku('input keyevent 4');
shizuku(`input keyevent ${KeyEvent.KEYCODE_BACK}`); /* 同上. */

/* 模拟电源键. */
shizuku('input keyevent 26');
shizuku(`input keyevent ${KeyEvent.KEYCODE_POWER}`); /* 同上. */

/* 点击屏幕坐标 (100, 120). */
shizuku("input tap 100 120");

/* 授予 Monkey King "修改安全设置" 权限. */
shizuku('pm grant com.qiaomu.monkeyking android.permission.WRITE_SECURE_SETTINGS');

/* 授予 Monkey King "投影媒体" 权限. */
shizuku('appops set com.qiaomu.monkeyking PROJECT_MEDIA allow');

/* 启用 Monkey King "无障碍服务". */
shizuku('settings put secure enabled_accessibility_services com.qiaomu.monkeyking/com.qiaomu.monkeyking.core.accessibility.AccessibilityServiceUsher');

/* 获取当前时间. */
console.log(shizuku('date').result.trim());
```

### shizuku(cmdList)

**`6.4.0`** **`Overload 2/2`**

- **cmdList** { [string](../types/data-types.md#string)[[]](../types/data-types.md#array) } - 待执行的多行命令
- <ins>**returns**</ins> { ShellResult } - Shell 结果

使用 Shizuku 一次性执行多行命令, 每行命令对应 `cmdList` 数组中的一个元素.

```js
shizuku([ 'cmd-a', 'cmd-b', 'cmd-c' ]);
shizuku('cmd-a\ncmd-b\ncmd-c'); /* 同上. */
```

[//]: # (```ts)

[//]: # (// class WrappedShizuku {)

[//]: # (//     public static service: com.qiaomu.monkeyking.core.shizuku.IUserService;)

[//]: # (//     public hasPermission&#40;&#41;: boolean;)

[//]: # (//     public config&#40;&#41;: android.content.Intent;)

[//]: # (//     public ensureService&#40;&#41;: void;)

[//]: # (//     public config&#40;isRequest: java.lang.Boolean&#41;: android.content.Intent;)

[//]: # (//     public isInstalled&#40;&#41;: boolean;)

[//]: # (//     public requestPermission&#40;&#41;: void;)

[//]: # (//     public execCommand&#40;cmdList: string[]&#41;: com.qiaomu.monkeyking.runtime.api.AbstractShell.Result;)

[//]: # (//     public execCommand&#40;cmd: string&#41;: com.qiaomu.monkeyking.runtime.api.AbstractShell.Result;)

[//]: # (// })

[//]: # (```)

<!-- fixed-source-contracts:start -->

## 固定源码合同表

下表覆盖本页在固定提交 `bafa2986212d` 中的每个 canonical 公共成员。每行同时给出稳定锚点、源码位置、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Y2FsbDpzaGl6dWt1"></a> `call:shizuku` | `shizuku(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/shizuku/Shizuku.kt:L40` | 参数：1 至 3 个参数；可选项与默认值见本页说明或源码守卫 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku);` |
| <a id="api-symbol-bW9kdWxlOnNoaXp1a3U"></a> `module:shizuku` | `shizuku` 模块入口 · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/ScriptRuntime.kt:L793` | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku);` |
| <a id="api-symbol-c2hpenVrdS5jb25maWc"></a> `shizuku.config` | `shizuku.config(isRequest: Boolean? = null)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/WrappedShizuku.kt:L161` | 参数：isRequest: Boolean? = null；可选项与默认值按固定源码重载 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.config);` |
| <a id="api-symbol-c2hpenVrdS5jb25maWdXaXRoQ29udGV4dA"></a> `shizuku.configWithContext` | `shizuku.configWithContext(GlobalAppContext.get()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/WrappedShizuku.kt:L163` | 参数：GlobalAppContext.get(；可选项与默认值按固定源码重载 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.configWithContext);` |
| <a id="api-symbol-c2hpenVrdS5jdXJyZW50QWN0aXZpdHk"></a> `shizuku.currentActivity` | `shizuku.currentActivity()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/shizuku/Shizuku.kt:L77` | 参数：无参数；可选项与默认值见本页说明或源码守卫 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.currentActivity);` |
| <a id="api-symbol-c2hpenVrdS5jdXJyZW50Q29tcG9uZW50"></a> `shizuku.currentComponent` | `shizuku.currentComponent()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/shizuku/Shizuku.kt:L86` | 参数：无参数；可选项与默认值见本页说明或源码守卫 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.currentComponent);` |
| <a id="api-symbol-c2hpenVrdS5jdXJyZW50UGFja2FnZQ"></a> `shizuku.currentPackage` | `shizuku.currentPackage()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/shizuku/Shizuku.kt:L68` | 参数：无参数；可选项与默认值见本页说明或源码守卫 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.currentPackage);` |
| <a id="api-symbol-c2hpenVrdS5leGVjQ29tbWFuZA"></a> `shizuku.execCommand` | `shizuku.execCommand(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/shizuku/Shizuku.kt:L46` | 参数：1 至 3 个参数；可选项与默认值见本页说明或源码守卫 | 返回：AbstractShell.Result；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.execCommand);` |
| <a id="api-symbol-c2hpenVrdS5nZXRDb21tYW5k"></a> `shizuku.getCommand` | `shizuku.getCommand(arg)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/shizuku/Shizuku.kt:L52` | 参数：恰好 1 个参数；可选项与默认值见本页说明或源码守卫 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.getCommand);` |
| <a id="api-symbol-c2hpenVrdS5nZXRMYXVuY2hJbnRlbnQ"></a> `shizuku.getLaunchIntent` | `shizuku.getLaunchIntent(context: Context)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/WrappedShizuku.kt:L239` | 参数：context: Context；可选项与默认值按固定源码重载 | 返回：Intent?；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.getLaunchIntent);` |
| <a id="api-symbol-c2hpenVrdS5nZXRTZXJ2aWNlT3JOdWxs"></a> `shizuku.getServiceOrNull` | `shizuku.getServiceOrNull()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/WrappedShizuku.kt:L148` | 无参数；不接受额外参数 | 返回：IUserService?；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.getServiceOrNull);` |
| <a id="api-symbol-c2hpenVrdS5oYXNQZXJtaXNzaW9u"></a> `shizuku.hasPermission` | `shizuku.hasPermission()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/WrappedShizuku.kt:L129` | 无参数；不接受额外参数 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.hasPermission);` |
| <a id="api-symbol-c2hpenVrdS5oYXNTZXJ2aWNl"></a> `shizuku.hasService` | `shizuku.hasService()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/WrappedShizuku.kt:L145` | 无参数；不接受额外参数 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.hasService);` |
| <a id="api-symbol-c2hpenVrdS5pc0luc3RhbGxlZA"></a> `shizuku.isInstalled` | `shizuku.isInstalled(context: Context)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/WrappedShizuku.kt:L126` | 参数：context: Context；可选项与默认值按固定源码重载 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.isInstalled);` |
| <a id="api-symbol-c2hpenVrdS5pc09wZXJhdGlvbmFs"></a> `shizuku.isOperational` | `shizuku.isOperational()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/WrappedShizuku.kt:L139` | 无参数；不接受额外参数 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.isOperational);` |
| <a id="api-symbol-c2hpenVrdS5pc1J1bm5pbmc"></a> `shizuku.isRunning` | `shizuku.isRunning()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/WrappedShizuku.kt:L142` | 无参数；不接受额外参数 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.isRunning);` |
| <a id="api-symbol-c2hpenVrdS5raWxs"></a> `shizuku.kill` | `shizuku.kill()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/shizuku/Shizuku.kt:L58` | 参数：无参数；可选项与默认值见本页说明或源码守卫 | 返回：Boolean；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.kill);` |
| <a id="api-symbol-c2hpenVrdS5yZXF1ZXN0UGVybWlzc2lvbg"></a> `shizuku.requestPermission` | `shizuku.requestPermission()` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/WrappedShizuku.kt:L157` | 无参数；不接受额外参数 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof shizuku.requestPermission);` |
| <a id="api-symbol-c2hpenVrdS5zZXJ2aWNl"></a> `shizuku.service` | `shizuku.service` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/WrappedShizuku.kt:L30` | 属性访问；无调用参数 | 返回：IUserService?；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(shizuku.service);` |
| <a id="api-symbol-c2hpenVrdS5zdGF0ZQ"></a> `shizuku.state` | `shizuku.state` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/shizuku/Shizuku.kt:L29` | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：必须安装、启动 Shizuku 并授予当前应用权限；线程：服务查询同步，命令会阻塞调用线程 | 生命周期：依赖 Shizuku Binder 服务，服务停止后能力失效；副作用：命令和服务调用可能修改设备状态 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(shizuku.state);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: shizuku');
```

<!-- fixed-source-contracts:end -->
