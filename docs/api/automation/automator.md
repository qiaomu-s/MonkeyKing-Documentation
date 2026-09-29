# 自动化 (Automator)

本页覆盖三组运行时入口：`auto` 管理 Monkey King 无障碍服务，`automator` 执行控件、坐标、手势与系统全局动作，`RootAutomator` 通过 root 或 Shizuku 直接写入触摸设备。本文按 Monkey King 当前公开 API 核对。

<a id="api-symbol-bW9kdWxlOmF1dG8"></a>
## [@] auto

**`≤ 6.6.4`**

- **入口 / 别名**：`auto`、`$auto`
- **参数**：模块同时可调用，详见 `auto(...)`
- <ins>**returns**</ins> { `Auto` }
- **异常**：读取模块本身不抛出异常
- **权限**：服务启停可能使用 WRITE_SECURE_SETTINGS 或 root；否则打开系统无障碍设置
- **线程 / 生命周期**：与当前脚本运行时和进程内无障碍桥接绑定
- **副作用**：成员可启停服务、改变查找模式/标志、注册事件或打开设置

```js
console.log(auto === $auto); // true
console.log(auto.state);
```

<a id="api-symbol-Y2FsbDphdXRv"></a>
### [f] auto(modeOrRestart?[, isForcibleRestart])

**`≤ 6.6.4`**

- **入口 / 别名**：`auto(...)`、`$auto(...)`
- **[ modeOrRestart ]** { `string | boolean | null` } - 无参数/nullish 等价于 `false`；布尔值用于确保服务，字符串仅设置 `normal` 或 `fast`
- **[ isForcibleRestart ]** { [boolean](../types/data-types.md#boolean) } - 两参数形式先设置 mode，再确保服务
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：超过 2 个参数、未知 mode 或布尔参数类型错误时包装为运行时异常
- **权限 / 线程 / 生命周期 / 副作用**：可能重启/等待无障碍服务；单独传字符串不会启动服务

```js
auto('normal', false);
```

<a id="api-symbol-YXV0by5zZXJ2aWNl"></a>
### [p] auto.service

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.service`
- **参数**：无
- <ins>**returns**</ins> { [android.accessibilityservice.AccessibilityService](https://developer.android.com/reference/android/accessibilityservice/AccessibilityService) | [null](../types/data-types.md#null) } - 当前进程的服务实例
- **异常 / 权限**：读取无异常；未启动服务时为 null
- **线程 / 生命周期 / 副作用**：实例随 Android 服务连接变化；读取无副作用

```js
console.log(auto.service === null ? 'stopped' : 'connected');
```

<a id="api-symbol-YXV0by5zZXJ2aWNlcw"></a>
### [p] auto.services

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.services`
- **参数**：无
- <ins>**returns**</ins> { [string](../types/data-types.md#string)[] } - 系统已启用的无障碍服务组件名
- **异常**：底层读取失败通常返回空数组
- **权限**：仅在安全设置访问已授权或 root 可用时读取；否则返回空数组
- **线程 / 生命周期 / 副作用**：每次读取当前系统设置，不修改服务

```js
console.log(auto.services.join('\n'));
```

<a id="api-symbol-YXV0by53aW5kb3dz"></a>
### [p] auto.windows

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.windows`
- **参数**：无
- <ins>**returns**</ins> { [android.view.accessibility.AccessibilityWindowInfo](https://developer.android.com/reference/android/view/accessibility/AccessibilityWindowInfo)[] } - 当前服务窗口的 Rhino 数组
- **异常**：无服务时返回空数组
- **权限**：需要已连接的无障碍服务
- **线程 / 生命周期 / 副作用**：窗口对象是系统快照；读取不改变过滤器

```js
console.log(auto.windows.length);
```

<a id="api-symbol-YXV0by5yb290"></a>
### [p] auto.root

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.root`
- **参数**：无
- <ins>**returns**</ins> { [UiObject](ui-object.md) | [null](../types/data-types.md#null) } - 当前过滤窗口的根节点
- **异常**：服务或根节点不可用时返回 null
- **权限**：需要无障碍服务
- **线程 / 生命周期 / 副作用**：受 `setWindowFilter` 影响；节点会随界面变化失效

```js
const root = auto.root;
console.log(root === null ? 'no root' : root.className());
```

<a id="api-symbol-YXV0by5yb290SW5BY3RpdmVXaW5kb3c"></a>
### [p] auto.rootInActiveWindow

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.rootInActiveWindow`
- **参数**：无
- <ins>**returns**</ins> { [UiObject](ui-object.md) | [null](../types/data-types.md#null) } - 系统当前活动窗口根节点
- **异常**：服务或根节点不可用时返回 null
- **权限**：需要无障碍服务
- **线程 / 生命周期 / 副作用**：不采用自定义窗口过滤器；返回节点可能很快失效

```js
console.log(auto.rootInActiveWindow);
```

<a id="api-symbol-YXV0by53aW5kb3dSb290cw"></a>
### [p] auto.windowRoots

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.windowRoots`
- **参数**：无
- <ins>**returns**</ins> { [UiObject](ui-object.md)[] } - 过滤后窗口的根节点数组
- **异常**：服务不可用时通常为空数组
- **权限**：需要无障碍服务
- **线程 / 生命周期 / 副作用**：受 `setWindowFilter` 影响；读取不保活节点

```js
auto.windowRoots.forEach(root => console.log(root.packageName()));
```

<a id="api-symbol-YXV0by5zdGF0ZQ"></a>
### [p] auto.state

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.state`
- **参数**：无
- <ins>**returns**</ins> { [Object](../types/data-types.md#object) } - 含 `hasInstance/hasService/isRunning/isOperational` 四个布尔快照
- **异常 / 权限**：无额外异常；读取系统启用状态
- **线程 / 生命周期 / 副作用**：每次创建新对象，不是实时监听器

```js
const state = auto.state;
console.log(state.hasService, state.isOperational);
```

<a id="api-symbol-YXV0by5zdGFydA"></a>
### [m] auto.start()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.start()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 服务已运行或通过 root/安全设置成功启用时为 true
- **异常**：传入参数时抛出
- **权限**：可使用 root 或 WRITE_SECURE_SETTINGS；均不可用时打开系统无障碍设置
- **线程 / 生命周期 / 副作用**：同步尝试启用服务；失败会显示引导并返回 false

```js
console.log(auto.start());
```

<a id="api-symbol-YXV0by5lbmFibGU"></a>
### [m] auto.enable()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.enable()`；完整委托给 `auto.start()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：传入参数时抛出
- **权限**：与 `auto.start()` 相同
- **线程 / 生命周期 / 副作用**：可能修改系统无障碍设置或打开设置页

```js
auto.enable();
```

<a id="api-symbol-YXV0by5zdG9w"></a>
### [m] auto.stop()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.stop()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - root、安全设置或 `disableSelf` 成功停用时为 true
- **异常**：传入参数时抛出
- **权限**：可使用 root/WRITE_SECURE_SETTINGS；失败时打开无障碍设置
- **线程 / 生命周期 / 副作用**：停止服务会使节点、窗口和监听器失效

```js
console.log(auto.stop());
```

<a id="api-symbol-YXV0by5kaXNhYmxl"></a>
### [m] auto.disable()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.disable()`；完整委托给 `auto.stop()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：传入参数时抛出
- **权限**：与 `auto.stop()` 相同
- **线程 / 生命周期 / 副作用**：可能停用系统服务或打开设置页

```js
auto.disable();
```

<a id="api-symbol-YXV0by5oYXNJbnN0YW5jZQ"></a>
### [m] auto.hasInstance()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.hasInstance()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 当前进程是否持有服务实例
- **异常 / 权限**：传入参数时抛出；不请求权限
- **线程 / 生命周期 / 副作用**：只读当前进程状态

```js
console.log(auto.hasInstance());
```

<a id="api-symbol-YXV0by5oYXNTZXJ2aWNl"></a>
### [m] auto.hasService()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.hasService()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统设置是否列出 Monkey King 服务
- **异常 / 权限**：传入参数时抛出；只读安全设置
- **线程 / 生命周期 / 副作用**：不保证进程内实例已连接

```js
console.log(auto.hasService());
```

<a id="api-symbol-YXV0by5leGlzdHM"></a>
### [m] auto.exists()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.exists()`；与 `auto.hasService()` 同义
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 权限**：传入参数时抛出；不请求权限
- **线程 / 生命周期 / 副作用**：只读系统启用状态

```js
console.log(auto.exists() === auto.hasService());
```

<a id="api-symbol-YXV0by5pc1J1bm5pbmc"></a>
### [m] auto.isRunning()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.isRunning()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - `hasService && hasInstance`
- **异常 / 权限**：传入参数时抛出；不请求权限
- **线程 / 生命周期 / 副作用**：只读组合状态

```js
console.log(auto.isRunning());
```

<a id="api-symbol-YXV0by5pc09wZXJhdGlvbmFs"></a>
### [m] auto.isOperational()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.isOperational()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 服务已启用、实例已连接且当前进程确认可工作
- **异常 / 权限**：传入参数时抛出；不请求权限
- **线程 / 生命周期 / 副作用**：比 `isRunning` 更严格的只读状态

```js
if (!auto.isOperational()) console.warn('无障碍桥接尚未就绪');
```

<a id="api-symbol-YXV0by5zdGF0ZUxpc3RlbmVy"></a>
### [m] auto.stateListener(listener?)

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.stateListener(listener?)`
- **[ listener ]** { `AccessibilityServiceCallback | Object | null` } - 对象可实现 `onConnected()`、`onDisconnected()`；nullish 清除监听器
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：超过 1 个参数或 listener 无法适配接口时抛出
- **权限**：监听本身不请求权限
- **线程 / 生命周期 / 副作用**：替换桥接层单一状态监听器；回调线程由服务连接过程决定

```js
auto.stateListener({
    onConnected() { console.log('connected'); },
    onDisconnected() { console.log('disconnected'); },
});
```

<a id="api-symbol-YXV0by5yZWdpc3RlckV2ZW50"></a>
### [m] auto.registerEvent(name, listener)

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.registerEvent(name, listener)`
- **name** { [string](../types/data-types.md#string) } - 非 nullish 的事件键
- **listener** { `AccessibilityEventCallback | Object | null` } - 对象实现 `onAccessibilityEvent(event)`；nullish 删除同名监听
- <ins>**returns**</ins> { `kotlin.Unit` }
- **异常**：参数不是 2 个、name 为 nullish 或 listener 无法适配时抛出
- **权限 / 线程 / 生命周期 / 副作用**：会先确保服务；监听按当前脚本 ownerId 隔离并在脚本退出时清理

```js
auto.registerEvent('window-change', {
    onAccessibilityEvent(event) { console.log(event); },
});
```

<a id="api-symbol-YXV0by5yZWdpc3RlckV2ZW50cw"></a>
### [m] auto.registerEvents(name, listener)

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.registerEvents(name, listener)`；产品版本直接委托给单数方法，不接受事件映射表
- **name** { [string](../types/data-types.md#string) }
- **listener** { `AccessibilityEventCallback | Object | null` }
- <ins>**returns**</ins> { `kotlin.Unit` }
- **异常 / 权限**：与 `registerEvent` 相同
- **线程 / 生命周期 / 副作用**：只注册一个 name；会确保服务并替换该脚本同名监听

```js
auto.registerEvents('content-change', {
    onAccessibilityEvent(event) { console.log(event); },
});
```

<a id="api-symbol-YXV0by5yZW1vdmVFdmVudA"></a>
### [m] auto.removeEvent(name)

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.removeEvent(name)`
- **name** { [string](../types/data-types.md#string) } - 非 nullish 事件键
- <ins>**returns**</ins> { `kotlin.Unit` }
- **异常**：参数数量不是 1 或 name 为 nullish 时抛出
- **权限**：不请求权限
- **线程 / 生命周期 / 副作用**：只删除当前脚本 ownerId 下的同名监听

```js
auto.removeEvent('window-change');
```

<a id="api-symbol-YXV0by5yZW1vdmVFdmVudHM"></a>
### [m] auto.removeEvents(name)

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.removeEvents(name)`；产品版本直接委托给 `removeEvent`
- **name** { [string](../types/data-types.md#string) } - 仍然只接受一个名称
- <ins>**returns**</ins> { `kotlin.Unit` }
- **异常 / 权限**：与 `removeEvent` 相同
- **线程 / 生命周期 / 副作用**：不会一次清除全部事件，只删除一个同名监听

```js
auto.removeEvents('content-change');
```

<a id="api-symbol-YXV0by53YWl0Rm9y"></a>
### [m] auto.waitFor(timeout?)

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.waitFor(timeout?)`
- **[ timeout = `-1` ]** { [number](../types/data-types.md#number) } - 等待服务启动的毫秒数；nullish 转为 -1
- <ins>**returns**</ins> { `kotlin.Unit` }
- **异常**：超过 1 个参数时抛出；启动/等待失败或线程中断时抛出 `ScriptInterruptedException`
- **权限**：优先尝试 root/安全设置，否则打开系统无障碍设置
- **线程 / 生命周期 / 副作用**：阻塞当前脚本线程直到服务启动；不要在 UI 线程无 continuation 地调用

```js
auto.waitFor(5000);
```

<a id="api-symbol-YXV0by5zZXRNb2Rl"></a>
### [m] auto.setMode(mode)

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.setMode(mode)`
- **mode** { [string](../types/data-types.md#string) } - 合法值为 `normal`、`fast`，忽略大小写
- <ins>**returns**</ins> { `kotlin.Unit` }
- **异常**：参数数量不是 1、类型非字符串或未知值时抛出
- **权限**：不单独启动服务
- **线程 / 生命周期 / 副作用**：修改当前运行时 AccessibilityBridge 的查找模式

```js
auto.setMode('fast');
```

<a id="api-symbol-YXV0by5zZXRGbGFncw"></a>
### [m] auto.setFlags(flags)

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.setFlags(flags)`
- **flags** { [string](../types/data-types.md#string) | [string](../types/data-types.md#string)[] } - `findOnUiThread`、`useUsageStats`、`useShell`
- <ins>**returns**</ins> { `kotlin.Unit` }
- **异常**：参数数量不是 1、类型非法或含未知标志时抛出
- **权限**：`useUsageStats` 需要使用情况访问权，`useShell` 通常需要 root
- **线程 / 生命周期 / 副作用**：每次调用从 0 重新组合并覆盖桥接 flags

```js
auto.setFlags(['findOnUiThread', 'useUsageStats']);
```

<a id="api-symbol-YXV0by5zZXRXaW5kb3dGaWx0ZXI"></a>
### [m] auto.setWindowFilter(filter?)

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.setWindowFilter(filter?)`
- **[ filter ]** { `boolean | WindowFilter | function | null` } - nullish/省略表示所有窗口通过；布尔值建立恒定结果
- <ins>**returns**</ins> { `kotlin.Unit` }
- **异常**：超过 1 个参数或类型非法时抛出
- **权限**：读取窗口需要无障碍服务
- **线程 / 生命周期 / 副作用**：改变 `auto.root`、`auto.windowRoots` 和选择器的搜索窗口

```js
auto.setWindowFilter(window => String(window.getTitle()) === 'QQ');
```

<a id="api-symbol-YXV0by5sYXVuY2hTZXR0aW5ncw"></a>
### [m] auto.launchSettings()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.launchSettings()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { `kotlin.Unit` }
- **异常**：传入参数时抛出；设置页启动失败被安全启动逻辑处理
- **权限**：不直接修改权限
- **线程 / 生命周期 / 副作用**：显示选择 Monkey King 的提示并打开系统无障碍设置

```js
auto.launchSettings();
```

<a id="api-symbol-YXV0by5jbGVhckNhY2hl"></a>
### [m] auto.clearCache()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.clearCache()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - Android 13+ 仅在服务实例成功清缓存时为 true
- **异常**：传入参数时抛出
- **权限**：Android 13+ 需要服务实例；旧版本调用进程级 AccessibilityInteractionClient
- **线程 / 生命周期 / 副作用**：清除无障碍节点交互缓存，现有 UiObject 可能失效

```js
console.log(auto.clearCache());
```

<a id="api-symbol-YXV0by5jdXJyZW50UGFja2FnZQ"></a>
### [m] auto.currentPackage()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.currentPackage()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 运行时记录的最近包名，未知时为空字符串
- **异常 / 权限**：传入参数时抛出；准确性取决于无障碍/usage stats/shell 配置
- **线程 / 生命周期 / 副作用**：读取最近事件快照

```js
console.log(auto.currentPackage());
```

<a id="api-symbol-YXV0by5jdXJyZW50QWN0aXZpdHk"></a>
### [m] auto.currentActivity()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.currentActivity()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 最近 Activity 类名，未知时为空字符串
- **异常 / 权限**：传入参数时抛出；数据来源依赖当前自动化配置
- **线程 / 生命周期 / 副作用**：只读运行时快照

```js
console.log(auto.currentActivity());
```

<a id="api-symbol-YXV0by5jdXJyZW50Q29tcG9uZW50"></a>
### [m] auto.currentComponent()

**`≤ 6.6.4`**

- **入口 / 别名**：`auto.currentComponent()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - `package/activity`，任一部分未知时为空字符串
- **异常 / 权限**：传入参数时抛出；不请求新权限
- **线程 / 生命周期 / 副作用**：组合最近包名与 Activity 快照

```js
console.log(auto.currentComponent());
```

<a id="api-symbol-bW9kdWxlOmF1dG9tYXRvcg"></a>
## [@] automator

**`≤ 6.6.4`**

- **入口 / 别名**：`automator`、`$automator`；若干方法同时安装为全局函数
- **参数**：模块对象不可调用
- <ins>**returns**</ins> { `Automator` }
- **异常**：读取模块本身不抛出
- **权限**：全部动作依赖 Monkey King 无障碍服务；坐标手势依赖 Android 手势分发能力
- **线程 / 生命周期**：同步动作等待完成，异步手势通过回调结束；对象随脚本运行时存活
- **副作用**：操纵屏幕控件、系统界面、输入文本或截图

```js
console.log(automator === $automator); // true
console.log(automator.isServiceRunning());
```

<a id="api-symbol-YXV0b21hdG9yLnBlcmZvcm0"></a>
### [m] automator.perform(action[, options])


- **入口 / 别名**：`automator.perform(...)`
- **参数**：`action` 为动作对象；可选 `options` 指定 `frame`、`frameInfo` 和 `timeoutMs`
- <ins>**returns**</ins> { `object` } - 返回输入执行结果对象；在 UI 线程调用时返回 Promise
- **坐标**：没有帧元数据时使用物理屏幕像素；传入 `ImageWrapper` 或 `frameInfo` 时使用输入图像坐标并由运行时换算
- **线程 / 生命周期 / 副作用**：脚本线程同步执行，UI 线程切换为异步提交；`timeoutMs` 只影响本次动作

```js
const result = automator.perform(
  { type: 'tap', x: 320, y: 640 },
  { timeoutMs: 3000 },
)
console.log(result.status)
```

<a id="click-x-y"></a>
<a id="api-symbol-YXV0b21hdG9yLmNsaWNr"></a>
### [m] automator.click(target[, index])

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.click(...)`、全局 `click(...)`
- **target** { `number,number | [x,y] | {x,y} | Point | Rect | UiObject | string` } - 坐标、点、矩形、控件或文本；文本可配可选 index；还支持四边界数字
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 手势/控件动作完成且所有目标窗口成功时为 true
- **异常**：空参数、坐标对象缺 x/y、重载不匹配、负坐标或服务不可用时抛出
- **权限**：需要无障碍服务；坐标点击需要 Android 7.0+ 的手势能力
- **线程 / 生命周期 / 副作用**：坐标路径同步等待手势完成；UiObject 不可点击时回退到 bounds 中心

```js
console.log(automator.click(300, 600));
```

<a id="api-symbol-YXV0b21hdG9yLmxvbmdDbGljaw"></a>
### [m] automator.longClick(target[, index])

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.longClick(...)`、全局 `longClick(...)`
- **target** { `number,number | [x,y] | {x,y} | Point | Rect | UiObject | string` } - 重载规则与 `click` 相同
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：空参数、对象/坐标或重载非法、服务不可用时抛出
- **权限**：需要无障碍服务；坐标长按需要手势能力
- **线程 / 生命周期 / 副作用**：同步等待；UiObject 不可长按时回退到 bounds 中心手势

```js
console.log(automator.longClick([300, 600]));
```

<a id="api-symbol-YXV0b21hdG9yLnByZXNz"></a>
### [m] automator.press(point[, duration])

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.press(...)`、全局 `press(...)`
- **point / duration** { `(x, y[, duration]) | ([x,y][, duration]) | (duration, [x,y])` } - 两坐标未给时长时使用 `ViewConfiguration.getTapTimeout()`
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：参数数量不在 1..3、形态非法、数值转换或负坐标失败时抛出
- **权限**：需要无障碍服务和手势分发能力
- **线程 / 生命周期 / 副作用**：同步派发单点按压并等待完成

```js
console.log(automator.press([300, 600], 800));
```

<a id="api-symbol-YXV0b21hdG9yLnN3aXBl"></a>
### [m] automator.swipe(points, duration)

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.swipe(...)`、全局 `swipe(...)`
- **points / duration** { `(x1,y1,x2,y2,duration) | ([x1,y1],[x2,y2],duration) | ([[x1,y1],[x2,y2]],duration)` } - duration 也可放在数组参数前
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：仅接受 2、3 或 5 个参数；数组形态、数值或负坐标非法时抛出
- **权限**：需要无障碍服务和手势分发能力
- **线程 / 生命周期 / 副作用**：同步缩放坐标、派发滑动并等待完成

```js
console.log(automator.swipe([100, 800], [700, 800], 500));
```

<a id="api-symbol-YXV0b21hdG9yLmdlc3R1cmU"></a>
### [m] automator.gesture(duration, ...points)

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.gesture(...)`、全局 `gesture(...)`
- **duration** { [number](../types/data-types.md#number) } - 毫秒
- **points** { `...[x,y] | [[x,y], ...] | number[]` } - 至少一个路径点
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：空参数、点数组/数字非法、负坐标或服务不可用时抛出
- **权限 / 线程 / 生命周期 / 副作用**：需要无障碍服务；从 start=0 同步派发并等待，最长内部等待约 128 秒

```js
automator.gesture(500, [100, 500], [700, 500]);
```

<a id="api-symbol-YXV0b21hdG9yLmdlc3R1cmVBc3luYw"></a>
### [m] automator.gestureAsync(duration, ...points[, callback])

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.gestureAsync(...)`
- **duration** { [number](../types/data-types.md#number) }；**points** { `[x,y][]` }
- **[ callback ]** { `GestureResultCallbackLike` } - 最后一个参数可实现 `onCompleted/onCancelled`
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：空参数、点/回调适配失败或服务不可用时抛出
- **权限 / 线程 / 生命周期 / 副作用**：需要无障碍服务；提交后立即返回，回调由 Android 手势结果线程触发

```js
automator.gestureAsync(300, [100, 400], [500, 400], {
    onCompleted() { console.log('done'); },
});
```

<a id="api-symbol-YXV0b21hdG9yLmdlc3R1cmVz"></a>
### [m] automator.gestures(...strokes)

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.gestures(...)`、全局 `gestures(...)`
- **strokes** { `StrokeParams[]` } - 每项为 `[duration, [x,y], ...]` 或 `[start, duration, [x,y], ...]`
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：任一 stroke 不是数组、参数位置/数值/坐标非法时抛出
- **权限**：需要无障碍服务和手势分发能力
- **线程 / 生命周期 / 副作用**：把全部 stroke 构成一个 GestureDescription，同步等待完成

```js
automator.gestures(
    [500, [200, 800], [500, 500]],
    [500, [800, 800], [500, 500]],
);
```

<a id="api-symbol-YXV0b21hdG9yLmdlc3R1cmVzQXN5bmM"></a>
### [m] automator.gesturesAsync(...strokes[, callback])

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.gesturesAsync(...)`
- **strokes** { `StrokeParams[]` }；**[ callback ]** { `GestureResultCallbackLike` } - 最后一项可为回调
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：没有参数、stroke 不是数组或回调无法适配时抛出
- **权限**：需要无障碍服务
- **线程 / 生命周期 / 副作用**：异步调用 `dispatchGesture` 并立即返回

```js
automator.gesturesAsync([300, [100, 100], [300, 300]]);
```

<a id="api-symbol-YXV0b21hdG9yLmlzU2VydmljZVJ1bm5pbmc"></a>
### [m] automator.isServiceRunning()

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.isServiceRunning()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 产品版本只检查当前进程是否有服务实例
- **异常 / 权限**：传入参数时抛出；不请求权限
- **线程 / 生命周期 / 副作用**：只读状态；不等同于 `auto.isOperational()`

```js
console.log(automator.isServiceRunning());
```

<a id="api-symbol-YXV0b21hdG9yLmVuc3VyZVNlcnZpY2U"></a>
### [m] automator.ensureService()

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.ensureService()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { `kotlin.Unit` }
- **异常**：传入参数或服务无法启动时抛出
- **权限**：可能打开无障碍设置或使用已配置的便捷启用方式
- **线程 / 生命周期 / 副作用**：同步确保 AccessibilityBridge 服务已启动

```js
automator.ensureService();
```

<a id="api-symbol-YXV0b21hdG9yLndhaXRGb3JTZXJ2aWNl"></a>
### [m] automator.waitForService(timeout?)

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.waitForService(timeout?)`
- **[ timeout = `-1` ]** { [number](../types/data-types.md#number) } - 毫秒
- <ins>**returns**</ins> { `kotlin.Unit` }
- **异常**：超过 1 个参数、等待失败或线程中断时抛出 `ScriptInterruptedException`
- **权限**：优先便捷启用，否则打开系统无障碍设置
- **线程 / 生命周期 / 副作用**：阻塞当前脚本线程直到服务启动；避免在无 continuation 的 UI 线程使用

```js
automator.waitForService(5000);
```

<a id="api-symbol-YXV0b21hdG9yLnNjcm9sbERvd24"></a>
### [m] automator.scrollDown(target?)

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.scrollDown(...)`、全局 `scrollDown(...)`
- **[ target ]** { `number | string[,index] | bounds` } - 无参数滚动面积最大的可滚动控件；数字选择第 N 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：目标重载非法或服务不可用时抛出
- **权限**：需要无障碍服务
- **线程 / 生命周期 / 副作用**：执行 ACTION_SCROLL_FORWARD；对所有过滤窗口要求动作成功

```js
console.log(automator.scrollDown());
```

<a id="api-symbol-YXV0b21hdG9yLnNjcm9sbFVw"></a>
### [m] automator.scrollUp(target?)

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.scrollUp(...)`、全局 `scrollUp(...)`
- **[ target ]** { `number | string[,index] | bounds` } - 无参数滚动面积最大的可滚动控件
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：目标重载非法或服务不可用时抛出
- **权限**：需要无障碍服务
- **线程 / 生命周期 / 副作用**：执行 ACTION_SCROLL_BACKWARD

```js
console.log(automator.scrollUp(0));
```

<a id="api-symbol-YXV0b21hdG9yLmlucHV0"></a>
### [m] automator.input([index,] text)

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.input(...)`、全局 `input(...)`
- **[ index = `-1` ]** { [number](../types/data-types.md#number) } - 可编辑控件索引；省略时匹配默认目标
- **text** { [string](../types/data-types.md#string) } - 追加文本
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：参数数量不在 1..2、索引转换或服务失败时抛出
- **权限 / 线程 / 生命周期 / 副作用**：需要无障碍服务；执行 UiObject ACTION_APPEND_TEXT

```js
automator.input(0, 'hello');
```

<a id="api-symbol-YXV0b21hdG9yLnNldFRleHQ"></a>
### [m] automator.setText([index,] text)

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.setText(...)`、全局 `setText(...)`
- **[ index = `-1` ]** { [number](../types/data-types.md#number) }；**text** { [string](../types/data-types.md#string) }
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：参数数量不在 1..2、索引转换或服务失败时抛出
- **权限**：需要无障碍服务
- **线程 / 生命周期 / 副作用**：执行 ACTION_SET_TEXT，替换而不是追加现有内容

```js
automator.setText('replacement');
```

<a id="api-symbol-YXV0b21hdG9yLmNhcHR1cmVTY3JlZW4"></a>
### [m] automator.captureScreen()

**`≤ 6.6.4`**

- **入口 / 别名**：`automator.captureScreen()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [ImageWrapper](../types/image-wrapper.md) } - 默认显示器截图
- **异常**：传入参数、Android 低于 11、服务不可用、截图失败返回 null 后解包或等待中断时抛出
- **权限**：需要无障碍服务；使用 Android 11+ `AccessibilityService.takeScreenshot`
- **线程 / 生命周期 / 副作用**：内部通过 ResultAdapter 等待 Promise；硬件 Bitmap 会复制为可读 ARGB_8888，调用方负责按图像 API 回收

```js
const image = automator.captureScreen();
console.log(image.getWidth(), image.getHeight());
```

<a id="api-symbol-YXV0b21hdG9yLmxvY2tTY3JlZW4"></a>
### [m] automator.lockScreen()


- **入口 / 别名**：`automator.lockScreen()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受锁屏全局动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出；Android 9 以下调用失败会被转换为 false
- **权限**：需要已连接的无障碍服务
- **线程 / 生命周期 / 副作用**：同步请求 `GLOBAL_ACTION_LOCK_SCREEN`，成功时立即锁定设备

```js
console.log(automator.lockScreen());
```

<a id="api-symbol-YXV0b21hdG9yLnRha2VTY3JlZW5zaG90"></a>
### [m] automator.takeScreenshot()


- **入口 / 别名**：`automator.takeScreenshot()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受截图全局动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出；Android 9 以下调用失败会被转换为 false
- **权限**：需要已连接的无障碍服务
- **线程 / 生命周期 / 副作用**：同步请求 `GLOBAL_ACTION_TAKE_SCREENSHOT`；它触发系统截图界面，不返回图像数据，读取图像请用 `captureScreen()`

```js
if (!automator.takeScreenshot()) console.warn('系统未接受截图动作');
```

<a id="api-symbol-YXV0b21hdG9yLmhlYWRzZXRob29r"></a>
### [m] automator.headsethook()


- **入口 / 别名**：`automator.headsethook()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受耳机键全局动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出；Android 12 以下的不支持错误被转换为 false
- **权限**：需要已连接的无障碍服务
- **线程 / 生命周期 / 副作用**：同步请求 `GLOBAL_ACTION_KEYCODE_HEADSETHOOK`，可能播放、暂停或接听当前媒体/通话

```js
console.log(automator.headsethook());
```

<a id="api-symbol-YXV0b21hdG9yLmFjY2Vzc2liaWxpdHlCdXR0b24"></a>
### [m] automator.accessibilityButton()


- **入口 / 别名**：`automator.accessibilityButton()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受无障碍按钮动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出；Android 12 以下的不支持错误被转换为 false
- **权限**：需要已连接的无障碍服务
- **线程 / 生命周期 / 副作用**：同步请求 `GLOBAL_ACTION_ACCESSIBILITY_BUTTON`

```js
console.log(automator.accessibilityButton());
```

<a id="api-symbol-YXV0b21hdG9yLmFjY2Vzc2liaWxpdHlCdXR0b25DaG9vc2Vy"></a>
### [m] automator.accessibilityButtonChooser()


- **入口 / 别名**：`automator.accessibilityButtonChooser()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受无障碍按钮选择器动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出；Android 12 以下的不支持错误被转换为 false
- **权限**：需要已连接的无障碍服务
- **线程 / 生命周期 / 副作用**：同步请求 `GLOBAL_ACTION_ACCESSIBILITY_BUTTON_CHOOSER`，成功时显示无障碍快捷功能选择器

```js
console.log(automator.accessibilityButtonChooser());
```

<a id="api-symbol-YXV0b21hdG9yLmFjY2Vzc2liaWxpdHlTaG9ydGN1dA"></a>
### [m] automator.accessibilityShortcut()


- **入口 / 别名**：`automator.accessibilityShortcut()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受无障碍快捷方式动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出；Android 12 以下的不支持错误被转换为 false
- **权限**：需要已连接的无障碍服务
- **线程 / 生命周期 / 副作用**：同步请求 `GLOBAL_ACTION_ACCESSIBILITY_SHORTCUT`

```js
console.log(automator.accessibilityShortcut());
```

<a id="api-symbol-YXV0b21hdG9yLmFjY2Vzc2liaWxpdHlBbGxBcHBz"></a>
### [m] automator.accessibilityAllApps()


- **入口 / 别名**：`automator.accessibilityAllApps()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受无障碍“所有应用”动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出；Android 12 以下的不支持错误被转换为 false
- **权限**：需要已连接的无障碍服务
- **线程 / 生命周期 / 副作用**：同步请求 `GLOBAL_ACTION_ACCESSIBILITY_ALL_APPS`，具体呈现由系统实现决定

```js
console.log(automator.accessibilityAllApps());
```

<a id="api-symbol-YXV0b21hdG9yLmRpc21pc3NOb3RpZmljYXRpb25TaGFkZQ"></a>
### [m] automator.dismissNotificationShade()


- **入口 / 别名**：`automator.dismissNotificationShade()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受收起通知栏动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出；Android 12 以下的不支持错误被转换为 false
- **权限**：需要已连接的无障碍服务
- **线程 / 生命周期 / 副作用**：同步请求 `GLOBAL_ACTION_DISMISS_NOTIFICATION_SHADE`

```js
console.log(automator.dismissNotificationShade());
```

<a id="api-symbol-YXV0b21hdG9yLmJhY2s"></a>
### [m] automator.back()


- **入口 / 别名**：`automator.back()`、全局 `back()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受返回动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出
- **权限 / 线程 / 生命周期 / 副作用**：需要已连接的无障碍服务；同步请求 `GLOBAL_ACTION_BACK`

```js
console.log(back());
```

<a id="api-symbol-YXV0b21hdG9yLmhvbWU"></a>
### [m] automator.home()


- **入口 / 别名**：`automator.home()`、全局 `home()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受主页动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出
- **权限 / 线程 / 生命周期 / 副作用**：需要已连接的无障碍服务；同步请求 `GLOBAL_ACTION_HOME`

```js
console.log(home());
```

<a id="api-symbol-YXV0b21hdG9yLnBvd2VyRGlhbG9n"></a>
### [m] automator.powerDialog()


- **入口 / 别名**：`automator.powerDialog()`、全局 `powerDialog()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受电源菜单动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出
- **权限 / 线程 / 生命周期 / 副作用**：需要已连接的无障碍服务；同步请求 `GLOBAL_ACTION_POWER_DIALOG`，成功时显示系统电源菜单

```js
console.log(powerDialog());
```

<a id="api-symbol-YXV0b21hdG9yLm5vdGlmaWNhdGlvbnM"></a>
### [m] automator.notifications()


- **入口 / 别名**：`automator.notifications()`、全局 `notifications()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受展开通知栏动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出
- **权限 / 线程 / 生命周期 / 副作用**：需要已连接的无障碍服务；同步请求 `GLOBAL_ACTION_NOTIFICATIONS`

```js
console.log(notifications());
```

<a id="api-symbol-YXV0b21hdG9yLnF1aWNrU2V0dGluZ3M"></a>
### [m] automator.quickSettings()


- **入口 / 别名**：`automator.quickSettings()`、全局 `quickSettings()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受展开快捷设置动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出
- **权限 / 线程 / 生命周期 / 副作用**：需要已连接的无障碍服务；同步请求 `GLOBAL_ACTION_QUICK_SETTINGS`

```js
console.log(quickSettings());
```

<a id="api-symbol-YXV0b21hdG9yLnJlY2VudHM"></a>
### [m] automator.recents()


- **入口 / 别名**：`automator.recents()`、全局 `recents()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受最近任务动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出
- **权限 / 线程 / 生命周期 / 副作用**：需要已连接的无障碍服务；同步请求 `GLOBAL_ACTION_RECENTS`

```js
console.log(recents());
```

<a id="api-symbol-YXV0b21hdG9yLnNwbGl0U2NyZWVu"></a>
### [m] automator.splitScreen()


- **入口 / 别名**：`automator.splitScreen()`、全局 `splitScreen()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 系统接受切换分屏动作时为 true
- **异常**：传入参数或无障碍服务不可用时抛出
- **权限 / 线程 / 生命周期 / 副作用**：需要已连接的无障碍服务；同步请求 `GLOBAL_ACTION_TOGGLE_SPLIT_SCREEN`，设备或系统版本不支持时可返回 false

```js
console.log(splitScreen());
```

<a id="api-symbol-bW9kdWxlOnJvb3RBdXRvbWF0b3I"></a>
## [@] RootAutomator


- **入口 / 别名**：全局构造器 `RootAutomator`
- **参数**：模块本身通过构造器使用，详见 `new RootAutomator(...)`
- <ins>**returns**</ins> { `RootAutomator` 构造器 }
- **异常**：读取入口本身不抛出
- **权限**：实例化必须具有 root，或已运行且可访问可写触摸设备的 Shizuku
- **线程 / 生命周期 / 副作用**：每个实例维护独立触点槽位、默认触点 ID 与底层 root shell 或 Shizuku 命令缓冲区

```js
console.log(typeof RootAutomator); // function
```

<a id="api-symbol-Y29uc3RydWN0OnJvb3RBdXRvbWF0b3I"></a>
### [c] new RootAutomator(waitForReady?)


- **[ waitForReady = `false` ]** { [boolean](../types/data-types.md#boolean) | [number](../types/data-types.md#number) } - 布尔 true 最多等待 5000 ms 就绪，false 不等待；数字直接作为等待超时毫秒数，负数不等待
- <ins>**returns**</ins> { `RootAutomator` } - 将核心输入设备对象包装成 Rhino 原生代理
- **异常**：超过 1 个参数、root 与 Shizuku 都不可用、Shizuku 无法访问可写输入设备、初始化失败或等待超时时抛出
- **权限**：需要 root 或 operational Shizuku；Shizuku 后端还必须解析到可写输入设备
- **线程 / 生命周期 / 副作用**：root 后端启动输入事件进程；Shizuku 后端映射屏幕坐标并批量执行 `sendevent`；结束使用时应调用 `exit()`

```js
const ra = new RootAutomator(true);
try {
    ra.tap(300, 600);
} finally {
    ra.exit();
}
```

<a id="api-symbol-ZHluYW1pYzpyb290QXV0b21hdG9yLmluc3RhbmNlLmZvcndhcmRlZC1tZXRob2Rz"></a>
### [dynamic] RootAutomator 实例转发方法


- **入口 / 别名**：`ra.<publicMethod>(...)`；方法来自核心 `RootAutomator` Java 对象
- **参数**：依具体 public 方法而定；常用方法包括 `sendEvent`、`touch`、`setScreenMetrics`、`tap`、`swipe`、`press`、`longPress`、`touchDown`、`touchUp`、`touchMove`、`getDefaultId`、`setDefaultId` 与 `exit`
- <ins>**returns**</ins> { `any` } - 保留对应 Java 方法的返回值
- **异常**：参数转换、输入设备写入、等待就绪、线程中断或 shell/Shizuku 执行失败时抛出
- **权限**：沿用构造实例时选择的 root 或 Shizuku 后端
- **线程 / 生命周期 / 副作用**：读取实例上存在的 public 函数时生成绑定到内部对象的函数，因此脱离属性调用仍保留 receiver；产品版本未采用旧 JavaScript 模块的名称过滤器

```js
const ra = new RootAutomator(5000);
const tap = ra.tap; // 已绑定内部 receiver
try {
    ra.setScreenMetrics(device.width, device.height);
    tap(320, 640);
} finally {
    ra.exit();
}
```


<!-- api-member-contract id="automator.perform" -->
`automator.perform` · Rhino 2.0 示例：
```js
console.log(typeof automator.perform);
```
