# 运行时 (Runtime)

每个 Monkey King JavaScript 引擎都拥有一个 `ScriptRuntime` 实例，并在执行用户脚本前把它注入为全局变量 `runtime`。它保存当前引擎的模块实现、线程与计时器、权限请求入口以及需要在脚本结束时释放的资源。

本文于 2026-09-10 按 Monkey King 当前产品行为核对。除明确标注为 当前版本的成员外，无法精确追溯的既有入口统一标记为 `≤ v6.6.4`。

## runtime

**`≤ v6.6.4`** **`Global`**

- { `com.qiaomu.monkeyking.runtime.ScriptRuntime` }
- **生命周期**：一台引擎对应一个 runtime；脚本退出时会清理该 runtime 注册的线程、计时器、事件、传感器、浮窗、截图器、 OCR 和 Closeable 资源
- **线程**：对象可从脚本线程和子线程访问，但具体成员仍可能要求主线程或禁止 UI 线程阻塞

```js
console.log(runtime instanceof ScriptRuntime); // true
console.log(runtime.ownerId);
console.log(runtime.engines.myEngine().id);
```

通常应优先使用文档中的全局模块，例如 `files`、`images`、`threads` 和 `shell`。`runtime.files` 等属性是它们的底层实现入口，Java 方法重载和参数转换规则可能与增强后的全局模块不同。

## 核心状态

### runtime.topLevelScope

**`≤ v6.6.4`**

- { `TopLevelScope` } - 当前 Rhino 顶级作用域，与初始 `global` 对象相同
- **异常 / 副作用**：正常脚本中只读使用；运行时只允许初始化一次，再次设置会抛出异常

```js
console.log(runtime.topLevelScope === global); // true
console.log(runtime.topLevelScope.require === require); // true
```

### runtime.clip

**`≤ v6.6.4`**

- { [string](../../api/types/data-types.md#string) } - 系统剪贴板文本
- **线程**：后台线程会把读写操作投递到主线程并阻塞等待；写入最多等待 60 秒
- **权限 / 副作用**：修改系统剪贴板；Android 版本和前台状态可能限制读取结果

```js
const previous = runtime.clip;
runtime.clip = 'Monkey King';
console.log(runtime.clip);
runtime.clip = previous;
```

### runtime.isStopped / runtime.isExiting

**`≤ v6.6.4`**

- `isStopped` { [boolean](../../api/types/data-types.md#boolean) } - 当前脚本线程是否已收到中断
- `isExiting` { [boolean](../../api/types/data-types.md#boolean) } - runtime 是否已进入退出清理阶段
- **副作用**：读取无副作用；不要手动改写 `isExiting`

```js
console.log({
    stopped: runtime.isStopped,
    exiting: runtime.isExiting,
});
```

### runtime.screenMetrics

**`≤ v6.6.4`**

- { `ScreenMetrics` } - 坐标缩放基准

优先使用全局 `setScreenMetrics()`、`setScaleBases()`、`cX()` 和 `cY()`。直接修改该对象会影响当前 runtime 的自动化坐标换算。

```js
runtime.setScreenMetrics(1080, 1920);
console.log(runtime.screenMetrics.scaleX(540));
```

### runtime.isJavaPrimitiveWrap

**`≤ v6.6.4`**

- { [boolean](../../api/types/data-types.md#boolean) } - 是否把 Java 原始类型返回值保留为 Java 包装值
- **副作用**：改变当前 runtime 后续 Java / Rhino 值转换行为

```js
const previous = runtime.isJavaPrimitiveWrap;
runtime.isJavaPrimitiveWrap = true;
console.log(runtime.isJavaPrimitiveWrap);
runtime.isJavaPrimitiveWrap = previous;
```

## 权限

### runtime.requestPermissions(permissions)

**`≤ v6.6.4`**

- **permissions** { [string[]](../../api/types/data-types.md#array) } - Android 运行时权限名称
- <ins>**returns**</ins> { `void` }
- **规范化**：不以 `android.permission.` 开头的名称会转为大写并自动补齐此前缀
- **异常**：数组中包含 `null` 等无法处理的值时可能抛出 Java 异常
- **权限 / 线程 / 副作用**：筛掉已授权项后启动 Monkey King 的权限请求 Activity；方法本身不等待用户结果

只能请求当前 APK Manifest 已声明且 Android 允许动态授予的权限。实现合同的 Manifest 不只声明定位和录音权限，但签名级、特殊访问权或不属于运行时权限的项目不能通过此方法获得。不要通过修改 APK 绕过平台权限模型。

```js
runtime.requestPermissions([
    'access_fine_location',
    'android.permission.RECORD_AUDIO',
]);
```

权限概念和平台限制见 [Android 权限概览](https://developer.android.com/guide/topics/permissions/overview)。

## 动态加载

### runtime.load(...paths)

### runtime.load(directory, recursive)

**`≤ v6.6.4`**

- **paths** { [...string[]](../../api/types/data-types.md#string) } - 一个或多个 JAR / DEX 路径
- **directory** { [string](../../api/types/data-types.md#string) } - 待扫描目录
- **recursive** { [boolean](../../api/types/data-types.md#boolean) } - 是否递归扫描子目录
- <ins>**returns**</ins> { `void` }
- **异常 / 权限 / 副作用**：读取文件并永久扩展当前进程类加载器；无效文件、不可读路径或加载失败会抛出异常

`load()` 根据扩展名同时接受 JAR 和 DEX。相对路径通过当前脚本的 `files` 工作目录解析。

```js
runtime.load('./libs/example.jar', './libs/feature.dex');
```

### runtime.loadJar(...paths)

### runtime.loadJar(directory, recursive)

**`≤ v6.6.4`**

只加载 JAR 文件。Monkey King 会把 JAR 交给 Android 类加载器处理；类名冲突、字节码与 Android 不兼容或依赖缺失都会在加载或首次使用时失败。

```js
runtime.loadJar('./libs/jsoup.jar');
importClass(org.jsoup.Jsoup);

console.log(Jsoup.parse('<p>Monkey King</p>').text());
```

### runtime.loadDex(...paths)

### runtime.loadDex(directory, recursive)

**`≤ v6.6.4`**

只加载 DEX 文件。不要加载来源不可信的 JAR / DEX；动态代码与当前脚本拥有相同的应用权限和数据访问能力。

```js
runtime.loadDex('./libs/feature.dex');
console.log(typeof Packages.com.example.Feature);
```

## 兼容底层方法

### runtime.sleep(millis)

**`≤ v6.6.4`**

- **millis** { [number](../../api/types/data-types.md#number) } - 毫秒数，转换为 Java `long`
- <ins>**returns**</ins> { `void` }
- **异常 / 线程 / 副作用**：阻塞当前线程；线程被中断时抛出 `ScriptInterruptedException`

该底层方法没有全局 `sleep(min, max)` 的随机区间和 UI 线程保护，应优先使用全局版本。

```js
runtime.sleep(50);
console.log('awake');
```

### runtime.shell(command, withRoot)

**`≤ v6.6.4`**

- **command** { [string](../../api/types/data-types.md#string) }
- **withRoot** { [number](../../api/types/data-types.md#number) } - `0` 为普通 shell，非 `0` 请求 Root
- <ins>**returns**</ins> { `AbstractShell.Result` }
- **权限 / 副作用**：同步创建进程并执行命令；Root 模式需要 `su` 授权

```js
const result = runtime.shell('id', 0);
console.log(result.code);
console.log(result.result);
```

增强后的 `shell()` 模块支持更清晰的布尔与选项参数，通常更适合脚本使用。

### runtime.selector()

**`≤ v6.6.4`**

- <ins>**returns**</ins> { `UiSelector` } - 绑定当前 accessibility bridge 的新选择器
- **权限 / 副作用**：创建选择器本身不阻塞；查询控件前需要无障碍服务

```js
auto.waitFor();
const selector = runtime.selector().text('确定');
console.log(selector.exists());
```

### runtime.setScreenMetrics(width, height)

**`≤ v6.6.4`**

- **width** { [number](../../api/types/data-types.md#number) } - 设计宽度整数
- **height** { [number](../../api/types/data-types.md#number) } - 设计高度整数
- <ins>**returns**</ins> { `void` }
- **副作用**：更新当前 runtime 的自动化坐标缩放参数

```js
runtime.setScreenMetrics(1080, 1920);
click(540, 960);
```

### runtime.exit(error?)

### runtime.stop()

**`≤ v6.6.4`** **`stop: deprecated`**

- **[ error ]** { [java.lang.Throwable](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Throwable.html) }
- <ins>**returns**</ins> { `never` }
- **异常 / 生命周期 / 副作用**：可先把异常交给引擎未捕获异常处理器，然后中断当前脚本、停止子线程并触发 runtime 清理；后台线程调用时抛出 `ScriptInterruptedException`

优先使用全局 `exit(error?)`。`runtime.stop()` 仅为兼容入口。

```js
if (files.exists('./stop.flag')) {
    runtime.exit();
}
```

## runtime 属性集合

### runtime.getProperty(key)

### runtime.putProperty(key, value)

### runtime.removeProperty(key)

**`≤ v6.6.4`**

- **key** { [string](../../api/types/data-types.md#string) }
- **value** { [any](../../api/types/data-types.md#any) }
- <ins>**returns**</ins> - `getProperty` 返回当前值或 `null`；`putProperty` 返回被替换的旧值；`removeProperty` 返回被移除的值
- **线程 / 生命周期**：由并发 Map 保存，可跨当前 runtime 的线程访问；runtime 销毁后不会持久化

```js
runtime.putProperty('job.state', { done: false });
console.log(runtime.getProperty('job.state').done); // false
runtime.removeProperty('job.state');
```

## Continuation

### runtime.createContinuation(scope?)

**`≤ v6.6.4`**

- **[ scope = runtime.topLevelScope ]** { `org.mozilla.javascript.Scriptable` }
- <ins>**returns**</ins> { `Continuation` }
- **异常 / 线程 / 副作用**：依赖当前 Rhino continuation 上下文与计时器；在不支持 continuation 的执行模式下可能失败

这是低层入口。业务脚本优先使用 `continuation`、`Promise` 和 `ResultAdapter` 文档化接口。

```js
const current = runtime.createContinuation(global);
console.log(current !== null);
```

## 原生对象

### runtime.rootShell

**`≤ v6.6.4`**

- { `AbstractShell` } - 延迟创建并缓存的 Root shell
- **权限 / 副作用**：首次读取会尝试建立 Root shell；脚本退出时关闭

```js
if (monkeyking.isRootAvailable()) {
    runtime.rootShell.exec('id');
    console.log(runtime.rootShell.isExecWithRoot()); // true
}
```

### runtime.mediaInfo
- { [org.mediainfo.android.MediaInfo](https://mediaarea.net/en/MediaInfo/Support/SDK) } - runtime 持有的原生 MediaInfo 实例
- **生命周期**：由当前 runtime 管理；业务脚本优先使用 [mediainfo 模块](../../api/media/mediainfo.md)

```js
console.log(runtime.mediaInfo.getClass().getName());
```

## 模块实现属性

以下属性暴露当前 runtime 使用的底层对象。它们用于桥接增强模块，版本兼容性不如同名全局 API；除调试或 Java 互操作外，不建议直接调用。

| runtime 属性 | 推荐脚本入口 |
| --- | --- |
| `app` | `app` |
| `console` | `console` |
| `automator` / `accessibilityBridge` / `info` | `auto`、`automator`、`selector` |
| `ui` / `uiHandler` | `ui` |
| `util` | `util` |
| `dialogs` | `dialogs` |
| `events` | `events` |
| `loopers` / `timers` / `threads` | `timers`、`threads` |
| `http` | `http` |
| `device` | `device` |
| `recorder` | `recorder` |
| `toaster` | `toast` |
| `ocr` / `ocrMLKit` / `ocrRapid` | `ocr` |
| `floaty` | `floaty` |
| `colors` | `colors` |
| `files` | `files` |
| `notice` | `notice` |
| `sensors` | `sensors` |
| `media` | `media` |
| `plugins` | `plugins` |
| `images` | `images` |
| `barcode` | `barcode` |
| `shizuku` | `shizuku` |
| `mime` | `mime` |
| `sqlite` | `sqlite` |
| `scale` | `cX()`、`cY()`、`setScaleBases()` |

```js
console.log(runtime.files === files); // 底层对象与增强代理不保证严格相等
console.log(typeof files.read, typeof runtime.files.read);
```

## 不应由脚本调用的生命周期成员

`initPrologue()`、`initEpilogue()`、`cancelScriptJobs()` 和 `onExit()` 是引擎内部生命周期方法。它们虽然因 JVM 可见性可能被 Rhino 访问，但不属于稳定脚本契约；手动调用会重复安装模块、取消协程任务或提前释放资源。

```js
// 只检查名称，不调用生命周期方法。
console.log(typeof runtime.onExit); // function
```

## 相关页面

- [全局对象](../../api/core/global.md)
- [模块系统、Promise 与 ResultAdapter](../../api/core/modules.md)
- [脚本化 Java](../android/scripting-java.md)
- [异常](exceptions.md)
