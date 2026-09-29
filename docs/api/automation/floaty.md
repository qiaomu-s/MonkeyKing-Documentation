# 悬浮窗 (Floaty)

`floaty` 创建覆盖在其他应用之上的脚本窗口。窗口依赖“显示在其他应用上层”权限，并与当前脚本运行时绑定；脚本结束时运行时会关闭其窗口。本文按 Monkey King 当前产品行为核对。

<a id="api-symbol-bW9kdWxlOmZsb2F0eQ"></a>
## [@] floaty

**`≤ 6.6.4`**

- **入口 / 别名**：`floaty`、`$floaty`
- **参数**：模块对象不可调用
- <ins>**returns**</ins> { `Floaty` }
- **异常**：读取模块本身不抛出异常
- **权限**：创建窗口和读取剪贴板辅助窗口需要悬浮窗权限
- **线程 / 生命周期**：每个脚本运行时维护自己的窗口集合；窗口 UI 变更会在 UI 线程执行
- **副作用**：调用创建、权限或关闭方法会启动设置页、创建系统窗口或关闭窗口

```js
console.log(floaty === $floaty); // true
console.log(floaty.hasPermission());
```

<a id="api-symbol-ZmxvYXR5LndpbmRvdw"></a>
## [m] floaty.window(xml)

**`≤ 6.6.4`**

- **入口 / 别名**：`floaty.window(xml)`、`$floaty.window(xml)`
- **xml** { `XML | string` } - 恰好一个 Rhino XML 或 XML 字符串；普通 Android `View` 不属于该增强入口的合法参数
- <ins>**returns**</ins> { `JsResizableWindow` } - 经代理包装的可调整悬浮窗；可用 `window.id` 查找布局控件
- **异常**：参数数量不为 1、布局类型或 XML 无效时抛出异常；等待权限被中断时抛出 `ScriptInterruptedException`
- **权限**：需要悬浮窗权限；未授权时打开授权界面并最多等待约 60 秒
- **线程 / 生命周期**：窗口在 UI 线程创建；从脚本线程调用时等待创建完成；关闭或脚本退出后不可复用
- **副作用**：启动悬浮窗服务并立即显示带调整控件的窗口

```js
const window = floaty.window(
    '<frame><text id="status" text="运行中"/></frame>',
);
setTimeout(() => window.close(), 2000);
```

<a id="api-symbol-ZmxvYXR5LnJhd1dpbmRvdw"></a>
## [m] floaty.rawWindow(xml)

**`≤ 6.6.4`**

- **入口 / 别名**：`floaty.rawWindow(xml)`、`$floaty.rawWindow(xml)`
- **xml** { `XML | string` } - 恰好一个 Rhino XML 或 XML 字符串
- <ins>**returns**</ins> { `JsRawWindow` } - 无内置拖动/缩放装饰的代理窗口
- **异常**：参数数量、XML 类型或布局无效时抛出异常；权限等待被中断时抛出 `ScriptInterruptedException`
- **权限**：需要悬浮窗权限；未授权时打开授权界面并等待授权
- **线程 / 生命周期**：UI 线程创建；关闭后底层窗口引用被清空
- **副作用**：启动悬浮窗服务并显示原始窗口，可覆盖状态栏区域

```js
const shade = floaty.rawWindow('<frame bg="#66000000"/>');
shade.setSize(-1, -1);
shade.setTouchable(false);
```

<a id="api-symbol-ZmxvYXR5Lmhhc1Blcm1pc3Npb24"></a>
## [m] floaty.hasPermission()

**`≤ 6.6.4`**

- **入口 / 别名**：`floaty.hasPermission()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 当前应用是否可以显示悬浮窗
- **异常**：传入参数时抛出异常
- **权限**：只读检查，不请求权限
- **线程 / 生命周期 / 副作用**：任意脚本线程可调用；不改变系统状态

```js
if (!floaty.hasPermission()) {
    console.warn('尚未授予悬浮窗权限');
}
```

<a id="api-symbol-ZmxvYXR5LnJlcXVlc3RQZXJtaXNzaW9u"></a>
## [m] floaty.requestPermission()

**`≤ 6.6.4`**

- **入口 / 别名**：`floaty.requestPermission()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：传入参数时抛出异常；启动系统悬浮窗设置失败时会回退到应用详情设置
- **权限**：发起悬浮窗权限配置，但不会替用户授予权限
- **线程 / 生命周期**：立即返回，不等待用户操作完成
- **副作用**：打开系统悬浮窗设置页；失败时尝试打开应用详情页

```js
if (!floaty.hasPermission()) {
    floaty.requestPermission();
}
```

<a id="api-symbol-ZmxvYXR5LmVuc3VyZVBlcm1pc3Npb24"></a>
## [m] floaty.ensurePermission()

**`≤ 6.6.4`**

- **入口 / 别名**：`floaty.ensurePermission()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：未获悬浮窗权限时抛出 `Exception`；传入参数时抛出异常
- **权限**：只检查权限，不打开设置页
- **线程 / 生命周期 / 副作用**：同步检查；无系统状态副作用

```js
try {
    floaty.ensurePermission();
} catch (error) {
    console.error('请先授予悬浮窗权限');
}
```

<a id="api-symbol-ZmxvYXR5LmNsb3NlQWxs"></a>
## [m] floaty.closeAll()

**`≤ 6.6.4`**

- **入口 / 别名**：`floaty.closeAll()`
- **参数**：必须为 0 个
- <ins>**returns**</ins> { `kotlin.Unit` } - 产品版本的增强包装直接返回底层 Kotlin `Unit`
- **异常**：传入参数时抛出异常；各窗口关闭异常由内部 `runCatching` 吞掉
- **权限**：无需新增权限
- **线程 / 生命周期**：UI 线程同步关闭；其他线程投递到 UI 线程并最多等待 1500 ms，然后清空当前脚本窗口集合
- **副作用**：关闭并注销当前脚本创建的全部悬浮窗

```js
floaty.closeAll();
```

<a id="api-symbol-ZmxvYXR5LmdldENsaXA"></a>
## [m] floaty.getClip(maxDelayAfterWindowReady?)

**`≤ 6.6.4`**

- **入口 / 别名**：`floaty.getClip(maxDelayAfterWindowReady?)`
- **[ maxDelayAfterWindowReady = `500` ]** { [number](../types/data-types.md#number) } - 临时窗口就绪后继续轮询非空剪贴板文本的最长毫秒数；显式 nullish 使用 500，其余值转换为长整数
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 当前剪贴板文本，超时仍可为空字符串
- **异常**：参数超过 1 个时抛出异常；权限等待或阻塞被中断时抛出 `ScriptInterruptedException`
- **权限**：需要悬浮窗权限；通过临时可聚焦原始窗口辅助读取剪贴板
- **线程 / 生命周期**：最多等待窗口附着约 1000 ms，再按 10 ms 间隔轮询；非主线程会投递到 UI 线程并阻塞等待结果
- **副作用**：短暂创建、聚焦并关闭一个透明原始悬浮窗

```js
const text = floaty.getClip(300);
console.log(text);
```

## 返回的窗口对象

`window()` 返回 `JsResizableWindow`，公开 `x`、`y`、`width`、`height`、`setPosition(x, y)`、`setSize(width, height)`、`isAdjustEnabled`、`requestFocus()`、`disableFocus()`、`exitOnClose()` 与 `close()`。`rawWindow()` 返回 `JsRawWindow`，除坐标和尺寸接口外还提供 `setTouchable(boolean)`。这些对象通过代理把未知属性名当作布局 ID 查找；找不到时返回 `undefined`，脚本自行写入的同名属性优先于视图查找。

```js
const window = floaty.rawWindow('<text id="message" text="hello"/>');
console.log(window.message); // 对应 id 为 message 的原生视图包装
window.setPosition(100, 200);
window.close();
```
