# 意图 (Intent)

Android `Intent` 是组件之间传递操作请求和数据的消息对象。Monkey King 提供全局 Java 类 `Intent`，并由 `app` 模块负责把 JavaScript 对象转换为 Intent、启动 Activity 或 Service、发送广播。完整平台字段和方法请查阅 [android.content.Intent 官方文档](https://developer.android.com/reference/android/content/Intent)。

本文于 2026-09-10 按 Monkey King 当前产品行为核对。

## Intent

**`≤ v6.6.4`** **`Global`**

全局 `Intent` 是 `android.content.Intent` 的 Java 类包装，可直接调用 Android 构造器、方法和静态常量。

```js
const intent = new Intent(Intent.ACTION_VIEW);
intent.setData(Uri.parse('https://example.com'));
intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

console.log(intent instanceof android.content.Intent); // true
```

构造器和实例方法属于 Android 外部 API；其可用性、参数和系统限制随设备 API 级别变化，Monkey King 不重新定义这些成员。

## app.intent(o)

**`≤ v6.6.4`**

- **o** { [android.content.Intent](https://developer.android.com/reference/android/content/Intent) | Object } - 已有 Intent，或用于构建 Intent 的配置对象
- <ins>**returns**</ins> { [android.content.Intent](https://developer.android.com/reference/android/content/Intent) } - 传入 Intent 时原样返回；传入对象时返回新实例
- **异常**：参数数量不为 1，或参数不是 Intent / JavaScript 对象时抛出 `IllegalArgumentException`
- **权限 / 线程 / 副作用**：同步构建对象，不启动组件，不请求权限

配置对象支持以下字段：

| 字段 | 类型 | 行为 |
| --- | --- | --- |
| `action` | `string` | 不含句点时自动加 `android.intent.action.` 前缀 |
| `data` | `string` / URI 兼容值 | 转换为 Android `Uri` |
| `type` | `string` | 与 `data` 同时存在时调用 `setDataAndType()` |
| `packageName` | `string` / App 枚举 | 限制目标包；`package` 是兼容别名 |
| `className` | `string` | 与 `packageName` 组合为显式组件 |
| `category` | `string` / Iterable | 添加一个或多个 category |
| `flags` | `number` / `string` / Iterable | 接受整数、常量短名或按 `|` 分隔的组合 |
| `extras` | `Object` | 逐项写入 Intent extras |
| `url` | `string` / Object | 先生成 URL，再写入 `data` |

```js
const intent = app.intent({
    action: 'VIEW',
    data: 'https://example.com/docs',
    flags: ['activity_new_task', 'clear_top'],
    extras: {
        source: 'monkeyking',
        retryCount: 1,
    },
});

console.log(intent instanceof Intent); // true
console.log(intent.getAction());       // android.intent.action.VIEW
```

## 启动与发送

`app.startActivity()`、`app.startService()` 和 `app.sendBroadcast()` 都接受 Intent 或相应配置对象；部分方法也有全局别名。具体重载、Root / Shizuku / 双开选项和返回值见 [App 模块](../../api/core/app.md)。

### 启动 Activity

启动外部 Activity 会切换前台界面，目标不存在或系统禁止后台启动时可能抛出 Android 异常。显式指定包名可以避免由多个应用处理同一 Intent 时出现系统选择器。

```js
app.startActivity({
    action: 'VIEW',
    data: 'https://example.com',
    packageName: 'com.android.chrome',
});
```

若不要求特定浏览器，应省略 `packageName`，让 Android 选择可处理该 URI 的应用。

### 发送广播

广播接收方是否可见取决于 Android 版本、目标应用的组件导出规则和权限。不要把密码、令牌等敏感值放入可被其他应用接收的隐式广播。

```js
app.sendBroadcast({
    action: 'com.example.MONKEYKING_EVENT',
    packageName: 'com.example.receiver',
    extras: {
        event: 'sync-complete',
    },
});
```

### 启动 Service

Android 8.0 及以上对后台 Service 有额外限制；能否启动由系统和目标应用决定。长时间后台任务通常需要目标应用提供前台 Service。

```js
const intent = app.intent({
    packageName: 'com.example.service',
    className: 'com.example.service.SyncService',
    extras: { mode: 'incremental' },
});

app.startService(intent);
```

## 常见错误

- `android.conent.Intent` 是错误包名；正确名称是 `android.content.Intent`。
- `setClass()` 需要 Android `Context` 和 Java `Class`，不是两个字符串。使用包名和类名字符串时，应调用 `setClassName()` 或使用 `app.intent({ packageName, className })`。
- URI 必须能被目标应用处理；即使 Intent 构建成功，启动阶段仍可能抛出 `ActivityNotFoundException`。
- 从 Application Context 启动 Activity 通常需要 `FLAG_ACTIVITY_NEW_TASK`；优先使用 `app.startActivity()` 让 Monkey King 处理常见标志和上下文。

## 相关页面

- [App 模块](../../api/core/app.md)
- [Context](../android/context.md)
- [Activity](../android/activity.md)
- [异常](exceptions.md)
