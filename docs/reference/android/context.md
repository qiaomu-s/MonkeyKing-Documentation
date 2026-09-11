# 上下文 (Context)

Android 的 `Context` 表示组件或应用所处的运行环境，可用于访问资源、系统服务、包信息以及启动组件。Monkey King 只负责把相关 Java 类型和实例带入 Rhino；完整 Android API 请查阅 [android.content.Context 官方文档](https://developer.android.com/reference/android/content/Context)。

本文于 2026-09-10 按 Monkey King 6.7.0 产品版本 `6.7.0` 核对。

## Monkey King 中的可用入口

### Context

**`≤ v6.6.4`** **`Global`**

全局 `Context` 是 `android.content.Context` 的 Java 类包装，而不是当前应用的上下文实例。它主要用于常量、类型判断和 Java API 签名。

```js
const appContext = GlobalAppContext.get();

console.log(appContext instanceof Context); // true
console.log(Context.MODE_PRIVATE);          // 0
```

### GlobalAppContext.get()

**`≤ v6.6.4`** **`Global class`**

- <ins>**returns**</ins> { [android.content.Context](https://developer.android.com/reference/android/content/Context) } - Monkey King 进程的 Application Context
- **异常**：应用上下文尚未初始化时抛出 `IllegalStateException`；正常脚本执行阶段已经完成初始化
- **权限 / 线程 / 副作用**：不需要权限，可在任意线程读取，不会创建 Activity

实现合同提交不会向普通脚本注入小写全局变量 `context`。旧脚本若依赖 `context`，应明确取得应用上下文，或由调用方传入组件上下文。

```js
const context = GlobalAppContext.get();
const packageName = context.getPackageName();
const filesDir = context.getFilesDir().getAbsolutePath();

console.log(packageName);
console.log(filesDir);
```

### activity

UI 脚本执行时会额外注入 `activity`，其值为当前 `ScriptExecuteActivity`；Activity 销毁时该全局值会被置为 `null`。普通后台脚本不能假设它存在。详见 [Activity](activity.md)。

```js
'ui';

ui.layout(<text text="Context example" />);

console.log(activity instanceof android.app.Activity); // true
console.log(activity.getApplicationContext() instanceof Context); // true
```

## Application Context 与 Activity Context

`GlobalAppContext.get()` 返回 Application Context，生命周期与应用进程一致，适合访问资源、文件、 SharedPreferences 和多数系统服务。它没有 Activity 的窗口和界面生命周期，不应直接用于依赖界面主题或窗口令牌的操作。

需要显示界面、创建依赖 Activity 主题的对话框或调用只接受 Activity 的 API 时，应在 UI 脚本中使用 `activity`，或使用具体 View 的 `getContext()`：

```js
'ui';

ui.layout(
    <vertical padding="16">
        <button id="button" text="读取上下文" />
    </vertical>
);

ui.button.on('click', view => {
    const viewContext = view.getContext();
    console.log(viewContext instanceof Context);
});
```

## 生命周期与安全注意事项

- 不要把 `activity` 或 View Context 保存到跨脚本的静态对象中；Activity 销毁后继续持有会造成泄漏。
- Application Context 可长期持有，但它不提供 Activity 窗口。通过它启动 Activity 时通常需要 `Intent.FLAG_ACTIVITY_NEW_TASK`；Monkey King 的 `app.startActivity()` 已处理常见启动场景。
- `getSystemService()` 的返回值和可用性取决于 Android 版本、设备实现和权限。先检查 `null`，再使用服务对象。
- 组件启动、文件访问、系统设置和通知等操作仍受各自权限与 Android 后台启动限制约束。

```js
const context = GlobalAppContext.get();
const service = context.getSystemService(Context.POWER_SERVICE);

if (service !== null) {
    console.log(service.isInteractive());
}
```

## 相关页面

- [Activity](activity.md)
- [Intent](../runtime/intent.md)
- [脚本化 Java](scripting-java.md)
- [App 模块](../../api/core/app.md)
