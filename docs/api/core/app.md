# 通用应用 (App)

`app` 用于解析和启动 Android `Intent`、查询安装应用、打开系统页面，以及通过 Shizuku、root 或普通 shell 操作双开用户。本文按 Monkey King 当前产品行为核对。

<a id="api-symbol-bW9kdWxlOmFwcA"></a>
## [@] app

**`≤ 6.6.4`**

- **入口 / 别名**：`app`、`$app`
- **参数**：模块对象不可调用
- <ins>**returns**</ins> { `App` }
- **异常**：读取模块本身不抛出异常
- **权限**：普通 Intent 操作不额外申请权限；强停、root 启动和双开操作依赖 Shizuku、root 或系统 shell 能力
- **线程 / 生命周期**：与当前脚本运行时绑定；部分 UI 启动在 Android 主线程完成
- **副作用**：成员可启动 Activity/Service、发送广播、打开设置、卸载应用或执行 shell 命令

```js
console.log(app === $app); // true
console.log(app.versionName);
```

<a id="api-symbol-YXBwLnZlcnNpb25Db2Rl"></a>
## [p] app.versionCode

**`≤ 6.6.4`**

- **入口 / 别名**：`app.versionCode`
- **参数**：无
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - 当前 Monkey King 构建的 `BuildConfig.VERSION_CODE`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：运行时初始化时赋值；读取无副作用

```js
console.log(Number.isFinite(app.versionCode)); // true
```

<a id="api-symbol-YXBwLnZlcnNpb25OYW1l"></a>
## [p] app.versionName

**`≤ 6.6.4`**

- **入口 / 别名**：`app.versionName`
- **参数**：无
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 当前 Monkey King 构建的 `BuildConfig.VERSION_NAME`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：运行时初始化时赋值；读取无副作用

```js
console.log(app.versionName);
```

<a id="api-symbol-YXBwLmZpbGVQcm92aWRlckF1dGhvcml0eQ"></a>
## [p] app.fileProviderAuthority

**`≤ 6.6.4`**

- **入口 / 别名**：`app.fileProviderAuthority`
- **参数**：无
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 查看或编辑文件时使用的 FileProvider authority
- **异常 / 权限**：读取无异常；实际共享文件时受 Android URI 授权约束
- **线程 / 生命周期 / 副作用**：构造 `AppUtils` 时确定；读取无副作用

```js
console.log(app.fileProviderAuthority);
```

<a id="api-symbol-YXBwLmN1cnJlbnRBY3Rpdml0eQ"></a>
## [p] app.currentActivity

**`≤ 6.6.4`**

- **入口 / 别名**：`app.currentActivity`
- **参数**：无
- <ins>**returns**</ins> { [android.app.Activity](https://developer.android.com/reference/android/app/Activity) | [null](../types/data-types.md#null) } - 弱引用保存的当前 Activity
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：Activity 销毁或未登记时为 null；读取会写一条 Android debug 日志

```js
console.log(app.currentActivity === null || app.currentActivity.getClass());
```

<a id="api-symbol-YXBwLnNldEN1cnJlbnRBY3Rpdml0eQ"></a>
## [m] app.setCurrentActivity(activity)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.setCurrentActivity(activity)`；主要供运行时生命周期桥接使用
- **activity** { [android.app.Activity](https://developer.android.com/reference/android/app/Activity) | [null](../types/data-types.md#null) } - 新的当前 Activity
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常 / 权限**：类型不兼容时由 Rhino/Java 桥接抛出；无额外权限
- **线程 / 生命周期 / 副作用**：替换内部弱引用并写 Android debug 日志，不会结束旧 Activity

```js
const previous = app.currentActivity;
app.setCurrentActivity(previous);
```

<a id="api-symbol-YXBwLmxhdW5jaA"></a>
## [m] app.launch(appOrPackage)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.launch(...)`、全局 `launch(...)`；委托给 `launchPackage`
- **appOrPackage** { `PresetApp | string | null` } - 预设应用、预设别名或包名；必须恰好 1 个参数
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 找到启动 Intent 且调用未抛出时为 true
- **异常**：参数数量错误时抛出；nullish 返回 false；其他异常通常被 `launchPackage` 转为 false
- **权限**：目标 Activity 必须可从当前应用启动
- **线程 / 生命周期 / 副作用**：同步解析后启动目标应用 Activity

```js
console.log(app.launch('com.android.settings'));
```

<a id="api-symbol-YXBwLmxhdW5jaFBhY2thZ2U"></a>
## [m] app.launchPackage(appOrPackage)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.launchPackage(...)`、全局 `launchPackage(...)`
- **appOrPackage** { `PresetApp | string | null` } - 预设别名会先转换为包名
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - nullish、无启动 Activity 或启动失败时为 false
- **异常**：参数数量不是 1 时抛出；内部启动异常被捕获并转为 false
- **权限**：受 Android 包可见性与 Activity 导出规则限制
- **线程 / 生命周期 / 副作用**：调用 PackageManager 获取 launch Intent 并启动 Activity

```js
if (!app.launchPackage('com.example.missing')) {
    console.warn('应用不可启动');
}
```

<a id="api-symbol-YXBwLmxhdW5jaEFwcA"></a>
## [m] app.launchApp(appName)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.launchApp(appName)`、全局 `launchApp(appName)`
- **appName** { `PresetApp | string | null` } - 应用显示名称；预设别名直接走其包名
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：参数数量不是 1 时抛出；nullish 或找不到名称时返回 false
- **权限**：受包可见性和目标 Activity 导出规则限制
- **线程 / 生命周期 / 副作用**：枚举已安装应用名称后启动第一个匹配包

```js
console.log(app.launchApp('Monkey King'));
```

<a id="api-symbol-YXBwLmdldFBhY2thZ2VOYW1l"></a>
## [m] app.getPackageName(appName)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.getPackageName(appName)`、全局 `getPackageName(appName)`
- **appName** { `PresetApp | string | null` } - 预设别名或应用显示名称
- <ins>**returns**</ins> { [string](../types/data-types.md#string) | [null](../types/data-types.md#null) } - 第一个匹配应用的包名
- **异常**：参数数量不是 1 时抛出；nullish 返回 null
- **权限**：查询结果受 Android 包可见性限制
- **线程 / 生命周期 / 副作用**：同步枚举安装应用；不修改系统状态

```js
console.log(app.getPackageName('Monkey King'));
```

<a id="api-symbol-YXBwLmdldEFwcE5hbWU"></a>
## [m] app.getAppName(packageOrAlias)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.getAppName(...)`、全局 `getAppName(...)`
- **packageOrAlias** { `PresetApp | string | null` } - 包名或预设应用别名
- <ins>**returns**</ins> { [string](../types/data-types.md#string) | [null](../types/data-types.md#null) } - 应用标签
- **异常**：参数数量不是 1 时抛出；不存在或 nullish 返回 null
- **权限**：查询受包可见性限制
- **线程 / 生命周期 / 副作用**：同步读取 PackageManager；无系统状态副作用

```js
console.log(app.getAppName('com.android.settings'));
```

<a id="api-symbol-YXBwLmdldEFwcEJ5QWxpYXM"></a>
## [m] app.getAppByAlias(alias)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.getAppByAlias(alias)`
- **alias** { [string](../types/data-types.md#string) } - 恰好一个值，按字符串转换
- <ins>**returns**</ins> { `PresetApp | null` } - 内置预设应用枚举项
- **异常**：参数数量不是 1 时抛出
- **权限**：无
- **线程 / 生命周期 / 副作用**：只查内置别名表，不访问 PackageManager

```js
console.log(app.getAppByAlias('settings'));
```

<a id="api-symbol-YXBwLmlzSW5zdGFsbGVk"></a>
## [m] app.isInstalled(appNameOrAlias)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.isInstalled(...)`、全局 `isInstalled(...)`
- **appNameOrAlias** { `PresetApp | string | null` } - 产品版本的增强入口先经 `getPackageName` 解析，因此普通字符串按应用显示名称而不是直接按包名查询
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：参数数量不是 1 时抛出；解析或查询失败返回 false
- **权限**：受包可见性限制
- **线程 / 生命周期 / 副作用**：同步查询；无系统状态副作用

```js
console.log(app.isInstalled('Monkey King'));
```

<a id="api-symbol-YXBwLmlzSW5zdGFsbGVkQW5kRW5hYmxlZA"></a>
## [m] app.isInstalledAndEnabled(packageName)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.isInstalledAndEnabled(packageName)`
- **packageName** { [string](../types/data-types.md#string) | [null](../types/data-types.md#null) } - 实际包名
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 已安装且 ApplicationInfo.enabled 为 true
- **异常**：不存在、nullish 或查询异常时返回 false
- **权限**：受包可见性限制
- **线程 / 生命周期 / 副作用**：同步只读查询

```js
console.log(app.isInstalledAndEnabled('com.android.settings'));
```

<a id="api-symbol-YXBwLmVuc3VyZUluc3RhbGxlZA"></a>
## [m] app.ensureInstalled(packageOrApp)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.ensureInstalled(packageName)`、`app.ensureInstalled(presetApp)`
- **packageOrApp** { `string | PresetApp` } - 包名或预设应用对象
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：包不存在、nullish 或查询失败时抛出带应用名称的 `Exception`
- **权限**：查询受包可见性限制
- **线程 / 生命周期 / 副作用**：同步只读校验

```js
app.ensureInstalled('com.android.settings');
```

<a id="api-symbol-YXBwLmlzRHVhbEluc3RhbGxlZA"></a>
## [m] app.isDualInstalled(appNameOrAlias)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.isDualInstalled(...)`、全局 `isDualInstalled(...)`
- **appNameOrAlias** { `PresetApp | string | null` } - 先按 `getPackageName` 解析
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 任一非当前 Android 用户的 package 查询成功且包含目标包时为 true
- **异常**：参数数量不是 1 时抛出；反射、shell 或查询失败被转为 false
- **权限**：需要可工作的 Shizuku、root 或 shell 后端访问用户包列表
- **线程 / 生命周期 / 副作用**：同步枚举用户并执行 `cmd package list packages`

```js
console.log(app.isDualInstalled('Monkey King'));
```

<a id="api-symbol-YXBwLmxhdW5jaFNldHRpbmdz"></a>
## [m] app.launchSettings(packageName)

**`≤ 6.6.4`**

- **入口 / 别名**：底层 `AppUtils.launchSettings(packageName)`；标准增强环境中的同名脚本属性同时是 `launchAppDetailsSettings` 的别名
- **packageName** { [string](../types/data-types.md#string) } - 实际包名
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 设置页 Intent 是否安全启动
- **异常**：Java 桥接类型错误时抛出
- **权限**：无需特殊权限
- **线程 / 生命周期 / 副作用**：启动系统应用详情设置页

```js
console.log(app.launchSettings('com.android.settings'));
```

<a id="api-symbol-YXBwLmxhdW5jaEFwcERldGFpbHNTZXR0aW5ncw"></a>
## [m] app.launchAppDetailsSettings(appOrPackage)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.launchAppDetailsSettings`；别名 `launchSettings`、`openAppSetting`、`openAppSettings`，并安装对应全局入口
- **appOrPackage** { `PresetApp | string | null` } - 预设别名或包名
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - nullish 为 false，否则返回设置页启动结果
- **异常**：参数数量不是 1 时抛出
- **权限**：无需特殊权限
- **线程 / 生命周期 / 副作用**：启动目标包的系统详情设置页

```js
app.launchAppDetailsSettings('com.android.settings');
```

<a id="api-symbol-YXBwLmxhdW5jaER1YWxBcHBEZXRhaWxzU2V0dGluZ3M"></a>
## [m] app.launchDualAppDetailsSettings(appOrPackage)

**`≤ 6.6.4`**

- **入口 / 别名**：别名 `launchDualSettings`、`openDualAppSetting`、`openDualAppSettings`，并安装同名全局入口
- **appOrPackage** { `PresetApp | string | null` } - 预设别名或包名
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - shell/反射流程未抛出时为 true
- **异常**：参数数量不是 1 时抛出；内部双开错误被捕获并转为 false
- **权限**：需要 Shizuku、root 或 shell 能力访问另一 Android 用户
- **线程 / 生命周期 / 副作用**：为非当前用户执行应用详情设置 Activity

```js
console.log(app.launchDualAppDetailsSettings('com.example.app'));
```

<a id="api-symbol-YXBwLmlzQWN0aXZpdHlTaG9ydEZvcm0"></a>
## [m] app.isActivityShortForm(name)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.isActivityShortForm(name)`
- **name** { [string](../types/data-types.md#string) } - `settings/preferences/pref/documentation/docs/doc/console/log/homepage/home/about/build`
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：Java 桥接类型不匹配时抛出
- **权限**：无
- **线程 / 生命周期 / 副作用**：只查询固定枚举

```js
console.log(app.isActivityShortForm('docs')); // true
```

<a id="api-symbol-YXBwLmlzQnJvYWRjYXN0U2hvcnRGb3Jt"></a>
## [m] app.isBroadcastShortForm(name)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.isBroadcastShortForm(name)`
- **name** { [string](../types/data-types.md#string) } - `inspect_layout_bounds/layout_bounds/bounds/inspect_layout_hierarchy/layout_hierarchy/hierarchy`
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：Java 桥接类型不匹配时抛出
- **权限**：无障碍布局检查本身可能需要无障碍服务
- **线程 / 生命周期 / 副作用**：只查询固定枚举

```js
console.log(app.isBroadcastShortForm('bounds')); // true
```

<a id="api-symbol-YXBwLmludGVudA"></a>
## [m] app.intent(intentOrOptions)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.intent(value)`
- **intentOrOptions** { [android.content.Intent](https://developer.android.com/reference/android/content/Intent) | [Object](../types/data-types.md#object) } - Intent 原样返回；对象可含 `url/package/packageName/className/extras/category/action/flags/type/data`
- <ins>**returns**</ins> { [android.content.Intent](https://developer.android.com/reference/android/content/Intent) }
- **异常**：参数数量不是 1 或类型不是 Intent/JavaScript 对象时抛出；未知 flags、无效 className 模板等会抛出
- **权限**：构造 Intent 不请求权限
- **线程 / 生命周期 / 副作用**：同步创建或配置对象，不自动启动；`action` 无点号时补 `android.intent.action.`

```js
const intent = app.intent({
    action: 'VIEW',
    data: 'https://example.com',
});
console.log(intent.getAction());
```

<a id="api-symbol-YXBwLnBhcnNlVXJp"></a>
## [m] app.parseUri(value)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.parseUri(value)`
- **value** { [string](../types/data-types.md#string) | [android.net.Uri](https://developer.android.com/reference/android/net/Uri) | [any](../types/data-types.md#any) } - 字符串或 Uri
- <ins>**returns**</ins> { [android.net.Uri](https://developer.android.com/reference/android/net/Uri) | [null](../types/data-types.md#null) }
- **异常**：参数数量不是 1 时抛出；其他类型返回 null
- **权限**：无
- **线程 / 生命周期 / 副作用**：同步解析；`file://` 字符串经脚本文件路径解析并返回 `Uri.fromFile`

```js
console.log(String(app.parseUri('https://example.com/path')));
```

<a id="api-symbol-YXBwLmdldFVyaUZvckZpbGU"></a>
## [m] app.getUriForFile(path)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.getUriForFile(path)`
- **path** { [string](../types/data-types.md#string) } - 可含 `file://` 前缀；非 nullish 值按字符串转换
- <ins>**returns**</ins> { [android.net.Uri](https://developer.android.com/reference/android/net/Uri) | [null](../types/data-types.md#null) } - 产品版本返回 `Uri.fromFile`，不是 FileProvider content URI
- **异常**：参数数量不是 1 时抛出；nullish 或路径解析失败返回 null
- **权限**：只构造 Uri；后续跨应用共享仍受 Android 文件 URI 限制
- **线程 / 生命周期 / 副作用**：同步解析当前脚本路径；不检查文件是否存在

```js
console.log(String(app.getUriForFile('./data.txt')));
```

<a id="api-symbol-YXBwLmludGVudFRvU2hlbGw"></a>
## [m] app.intentToShell(intentOrOptions)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.intentToShell(value)`
- **intentOrOptions** { [android.content.Intent](https://developer.android.com/reference/android/content/Intent) | [Object](../types/data-types.md#object) }
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 可拼接到 Android `am start/service/broadcast` 的参数
- **异常**：参数数量错误、类型非法、extras 为空数组、nullish/Infinity/NaN 数字或未知 extra 类型时抛出
- **权限**：仅生成命令字符串
- **线程 / 生命周期 / 副作用**：同步序列化 component、extras、category、action、flags、type 与 data；不执行命令

```js
const args = app.intentToShell({ action: 'VIEW', data: 'https://example.com' });
console.log(args);
```

<a id="api-symbol-YXBwLnN0YXJ0QWN0aXZpdHk"></a>
## [m] app.startActivity(target[, options])

**`≤ 6.6.4`**

- **入口 / 别名**：`app.startActivity(...)`、全局 `startActivity(...)`
- **target** { `string | java.net.URI | Intent | Object` } - URL、Activity 短名、Intent 或配置对象
- **[ options ]** { [Object](../types/data-types.md#object) } - 仅 Intent/对象 target 可用；与对象 target 浅合并
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不在 1..2、组合非法、短名未知或 Intent/shell 启动失败时抛出
- **权限**：普通启动受导出规则限制；对象的 `shizuku/root/dual` 仅在对应能力可用时采用
- **线程 / 生命周期 / 副作用**：字符串 URL 自动补 `http://`；启动 Activity 或按选项执行 shell

```js
app.startActivity('docs');
```

<a id="api-symbol-YXBwLnN0YXJ0RHVhbEFjdGl2aXR5"></a>
## [m] app.startDualActivity(target[, options])

**`≤ 6.6.4`**

- **入口 / 别名**：`app.startDualActivity(...)`、全局 `startDualActivity(...)`
- **target** { `string | java.net.URI | Intent | Object` } - 与 `startActivity` 相同的主要输入形态
- **[ options ]** { [Object](../types/data-types.md#object) } - 仅 Intent/对象 target 可用
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量、类型、短名或双开 shell 失败时抛出
- **权限**：需要 Shizuku、root 或 shell 能力访问另一 Android 用户
- **线程 / 生命周期 / 副作用**：为每个非当前用户执行带 `--user` 的 `am start`；产品版本的 `java.net.URI` 分支仍调用普通 `openUrl`

```js
app.startDualActivity({ packageName: 'com.example.app' });
```

<a id="api-symbol-YXBwLnN0YXJ0U2VydmljZQ"></a>
## [m] app.startService(intentOrOptions)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.startService(value)`、全局 `startService(value)`
- **intentOrOptions** { [android.content.Intent](https://developer.android.com/reference/android/content/Intent) | [Object](../types/data-types.md#object) }
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不是 1、类型非法或 Android 拒绝启动服务时抛出
- **权限**：目标 Service 必须可访问；对象 `root: true` 且 root 可用时执行 `am startservice`
- **线程 / 生命周期 / 副作用**：同步发起服务启动，不等待服务完成

```js
app.startService({
    packageName: 'com.example.app',
    className: 'com.example.app.SyncService',
});
```

<a id="api-symbol-YXBwLnNlbmRCcm9hZGNhc3Q"></a>
## [m] app.sendBroadcast(nameOrIntent)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.sendBroadcast(...)`、全局 `sendBroadcast(...)`
- **nameOrIntent** { `string | Intent | Object` } - 字符串仅接受布局检查短名；其他输入构造广播 Intent
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不是 1、未知短名、Intent 配置或 shell 失败时抛出
- **权限**：广播受 Android 导出与权限约束；对象 `root: true` 可选 root shell
- **线程 / 生命周期 / 副作用**：短名在主协程触发布局边界/层级浮窗；其他路径发送系统广播

```js
app.sendBroadcast('inspect_layout_bounds');
```

<a id="api-symbol-YXBwLnNlbmRMb2NhbEJyb2FkY2FzdFN5bmM"></a>
## [m] app.sendLocalBroadcastSync(intent)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.sendLocalBroadcastSync(intent)`、全局同名入口
- **intent** { [android.content.Intent](https://developer.android.com/reference/android/content/Intent) | [null](../types/data-types.md#null) } - 恰好一个参数
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：非 Intent 且非 null 时抛出；后台任务异常只打印堆栈
- **权限**：无额外权限
- **线程 / 生命周期 / 副作用**：名称保留“Sync”，但产品版本会在 IO 调度器查询定时 Intent 任务，再投递到主线程执行，调用本身不会等任务完成

```js
const intent = app.intent({ action: 'com.example.LOCAL_TASK' });
app.sendLocalBroadcastSync(intent);
```

<a id="api-symbol-YXBwLnNlbmRFbWFpbA"></a>
## [m] app.sendEmail(options)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.sendEmail(options)`、全局 `sendEmail(options)`
- **options** { [Object](../types/data-types.md#object) } - 可含 `email/cc/bcc/subject/text/attachment`；非对象按空对象处理
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不是 1 或附件 URI/Activity 启动失败时抛出
- **权限**：附件共享受文件和 URI 权限限制
- **线程 / 生命周期 / 副作用**：构造 `ACTION_SEND`、MIME `message/rfc822` 的 chooser 并启动邮件应用

```js
app.sendEmail({
    email: ['hello@example.com'],
    subject: 'Monkey King',
    text: 'Hello',
});
```

<a id="api-symbol-YXBwLm9wZW5Vcmw"></a>
## [m] app.openUrl(url)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.openUrl(url)`
- **url** { [string](../types/data-types.md#string) } - 恰好一个值并转为字符串；不含 `://` 时补 `http://`
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不是 1 时抛出；安全启动无法处理时通常静默失败
- **权限**：目标 URL 需有可处理的 Activity
- **线程 / 生命周期 / 副作用**：发送 `ACTION_VIEW` Intent

```js
app.openUrl('example.com');
```

<a id="api-symbol-YXBwLm9wZW5EdWFsVXJs"></a>
## [m] app.openDualUrl(url)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.openDualUrl(url)`
- **url** { [string](../types/data-types.md#string) } - 不含协议时补 `http://`
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不是 1 或双开 shell 失败时抛出
- **权限**：需要 Shizuku、root 或 shell 能力访问另一用户
- **线程 / 生命周期 / 副作用**：为非当前用户执行 `ACTION_VIEW` Activity

```js
app.openDualUrl('https://example.com');
```

<a id="api-symbol-YXBwLmxhdW5jaER1YWw"></a>
## [m] app.launchDual(appOrPackage)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.launchDual(...)`、全局 `launchDual(...)`；委托给 `launchDualPackage`
- **appOrPackage** { `PresetApp | string | null` }
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：参数数量不是 1 时抛出；内部失败由 `launchDualPackage` 转为 false
- **权限**：需要另一用户的 shell 启动能力
- **线程 / 生命周期 / 副作用**：启动双开用户中的目标包

```js
console.log(app.launchDual('com.example.app'));
```

<a id="api-symbol-YXBwLmxhdW5jaER1YWxQYWNrYWdl"></a>
## [m] app.launchDualPackage(appOrPackage)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.launchDualPackage(...)`、全局同名入口
- **appOrPackage** { `PresetApp | string | null` } - 预设别名或包名
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 无启动 Intent 或任何内部失败时为 false
- **异常**：参数数量不是 1 时抛出
- **权限**：需要 Shizuku、root 或 shell 能力
- **线程 / 生命周期 / 副作用**：获取当前用户包的 launch Intent，再为非当前用户执行

```js
console.log(app.launchDualPackage('com.example.app'));
```

<a id="api-symbol-YXBwLmxhdW5jaER1YWxBcHA"></a>
## [m] app.launchDualApp(appName)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.launchDualApp(appName)`、全局同名入口
- **appName** { `PresetApp | string | null` } - 应用显示名称或预设别名
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：参数数量不是 1 时抛出；解析和双开失败转为 false
- **权限**：需要包查询和另一用户 shell 能力
- **线程 / 生命周期 / 副作用**：解析显示名称后启动双开应用

```js
console.log(app.launchDualApp('Monkey King'));
```

<a id="api-symbol-YXBwLnVuaW5zdGFsbA"></a>
## [m] app.uninstall(appOrPackage)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.uninstall(...)`、全局 `uninstall(...)`
- **appOrPackage** { `PresetApp | string | null` } - 预设别名或包名；nullish 不执行
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不是 1 时抛出；安全启动卸载页失败通常静默
- **权限**：最终卸载需用户在系统界面确认
- **线程 / 生命周期 / 副作用**：打开 `ACTION_DELETE package:` 系统卸载界面

```js
app.uninstall('com.example.app');
```

<a id="api-symbol-YXBwLnVuaW5zdGFsbER1YWw"></a>
## [m] app.uninstallDual(appOrPackage)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.uninstallDual(...)`、全局同名入口
- **appOrPackage** { `PresetApp | string | null` } - 预设别名或包名
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不是 1 或双开 shell 失败时抛出；nullish 不执行
- **权限**：需要另一 Android 用户的 Activity 启动能力；仍需系统卸载确认
- **线程 / 生命周期 / 副作用**：为非当前用户启动 `ACTION_DELETE`

```js
app.uninstallDual('com.example.app');
```

<a id="api-symbol-YXBwLnZpZXdGaWxl"></a>
## [m] app.viewFile(path)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.viewFile(path)`
- **path** { [string](../types/data-types.md#string) } - 当前脚本可解析的文件路径
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - nullish 为 false，否则返回底层安全启动结果
- **异常**：参数数量不是 1、非字符串、文件不存在或不是普通文件时抛出
- **权限**：跨应用读取由 FileProvider URI 授权处理
- **线程 / 生命周期 / 副作用**：解析真实路径并启动可查看该文件的 Activity；该入口已在兼容说明中标记待迁移到 files

```js
app.viewFile(files.path('./report.txt'));
```

<a id="api-symbol-YXBwLmVkaXRGaWxl"></a>
## [m] app.editFile(path)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.editFile(path)`
- **path** { [string](../types/data-types.md#string) } - 当前脚本可解析的文件路径
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - nullish 为 false，否则返回底层安全启动结果
- **异常**：参数数量不是 1、非字符串、文件不存在或不是普通文件时抛出
- **权限**：跨应用写入由 FileProvider URI 授权和目标编辑器决定
- **线程 / 生命周期 / 副作用**：启动可编辑该文件的 Activity；该入口已在兼容说明中标记待迁移到 files

```js
app.editFile(files.path('./draft.txt'));
```

<a id="api-symbol-YXBwLmtpbGw"></a>
## [m] app.kill(appNameOrAlias)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.kill(...)`、全局 `kill(...)`
- **appNameOrAlias** { `PresetApp | string | null` } - 先经 `getPackageName` 解析，因此普通字符串按显示名称处理
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - shell 结果 code 为 0 时为 true
- **异常**：参数数量不是 1 时抛出；无法解析包名返回 false
- **权限**：依次选用可用的 Shizuku、root、普通 shell；普通 shell 通常无权强停其他应用
- **线程 / 生命周期 / 副作用**：同步执行 `am force-stop package`

```js
console.log(app.kill('Monkey King'));
```

<a id="api-symbol-YXBwLmtpbGxEdWFs"></a>
## [m] app.killDual(appNameOrAlias)

**`≤ 6.6.4`**

- **入口 / 别名**：`app.killDual(...)`、全局同名入口
- **appNameOrAlias** { `PresetApp | string | null` } - 先经 `getPackageName` 解析
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 双开执行流程未抛出时为 true
- **异常**：参数数量不是 1 时抛出；内部反射或 shell 错误被转为 false
- **权限**：需要 Shizuku、root 或 shell 能力
- **线程 / 生命周期 / 副作用**：对非当前用户执行 `am force-stop`；源码说明同包名应用可能一起被强停，不能区分主开与双开

```js
console.log(app.killDual('Monkey King'));
```
