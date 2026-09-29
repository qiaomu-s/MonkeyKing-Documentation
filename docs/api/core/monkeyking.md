# Monkey King 本体应用

`monkeyking` 全局对象包含应用身份、版本、屏幕方向、Root 模式、权限状态和进程生命周期接口。`$monkeyking` 指向同一对象，`app.monkeyking` 也指向该对象。

本文于 2026-09-10 按 Monkey King 当前产品行为核对。修改 Root 偏好、重启或退出应用都有进程级副作用，调用前应保存脚本状态。

---

<p style="font: bold 2em sans-serif; color: #FF7043">monkeyking</p>

---

## [m] getLanguage

### getLanguage()

**`6.2.0`**

- <ins>**returns**</ins> { [java.util.Locale](https://docs.oracle.com/javase/8/docs/api/java/util/Locale.html) }
- **异常**：传入参数时抛出异常
- **权限 / 副作用**：不需要额外权限；同步读取应用语言偏好

获取 Monkey King `语言` 设置选项.

此方法返回一个 java.util.Locale 对象, 如需返回其标签名, 如 `en-US`, `zh-CN` 等, 可使用 `monkeyking.getLanguage().toLanguageTag()` 或直接使用 [monkeyking.getLanguageTag()](#m-getlanguagetag) 方法.

```js
console.log(monkeyking.getLanguage().getDisplayName()); /* e.g. 日本語 */
```

## [m] getLanguageTag

### getLanguageTag()

**`6.2.0`**

- <ins>**returns**</ins> { [string](../types/data-types.md#string) }
- **异常、权限与副作用**：与 [getLanguage](#m-getlanguage) 相同

获取 Monkey King 语言设置选项.

此方法返回 [IETF 语言标签](https://en.wikipedia.org/wiki/IETF_language_tag), 相当于 `monkeyking.getLanguage().toLanguageTag()`:

```js
console.log(monkeyking.getLanguageTag()); /* e.g. en-US */
```

此方法可用于设定 i18n 对象的区域:

```js
i18n.setLocale(monkeyking.getLanguageTag());
```

## [m] isScreenPortrait

### isScreenPortrait()

**`6.3.4`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：参数不为空时抛出异常
- **权限 / 副作用**：不需要额外权限，只读取当前显示配置

当前资源方向是否为 `Configuration.ORIENTATION_PORTRAIT`。无 Activity 时使用全局资源和显示服务回退。

```js
console.log(monkeyking.isScreenPortrait());
```

## [m] isScreenLandscape

### isScreenLandscape()

**`6.3.4`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：参数不为空时抛出异常
- **权限 / 副作用**：不需要额外权限，只读取当前显示配置

当前资源方向是否为 `Configuration.ORIENTATION_LANDSCAPE`。

```js
console.log(monkeyking.isScreenLandscape());
```

## [m] restart

### restart(scriptsAfterRestart?)
- **[ scriptsAfterRestart ]** { [string](../types/data-types.md#string) | [string](../types/data-types.md#string)[] } - 重启后运行的脚本
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数超过 1 个或参数既不是字符串、数组也不是 nullish 时抛出异常
- **权限 / 线程**：不需要额外 Android 权限；发起应用级进程重启

请求重启 Monkey King 应用。字符串缺少 `.js` 扩展名时会自动补全；特殊值 `@` 代表当前引擎脚本。其他类型会抛出参数异常。

```js
files.write('./state.json', JSON.stringify({ step: 2 }));
monkeyking.restart('@');
```

该调用会结束当前进程和脚本资源，后续语句不应承担必须完成的清理工作。

## [m] exit

### exit(scriptsAfterExit?)
- **[ scriptsAfterExit ]** { [string](../types/data-types.md#string) | [string](../types/data-types.md#string)[] } - 保存为“下次应用启动后执行”的脚本
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数超过 1 个或参数既不是字符串、数组也不是 nullish 时抛出异常
- **权限 / 生命周期**：不需要额外 Android 权限；结束应用进程与当前脚本资源

请求退出 Monkey King 应用。脚本名称规范化规则与 [restart](#restart-scriptsafterrestart) 相同。传入脚本时只会把名称写入“应用重启后脚本”偏好并退出；它不会自动重启应用，也不会在退出后立即运行这些脚本。只有用户以后再次启动 Monkey King，启动流程才有机会读取并执行该偏好。此方法不同于全局 `exit()`：后者只停止当前脚本引擎。

```js
files.write('./before-exit.json', JSON.stringify({ saved: true }));
// 只登记到下次应用启动；本次调用不会安排自动重启。
monkeyking.exit('after-next-launch.js');
```

## [m] isRootAvailable

### isRootAvailable()

**`6.2.0`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：传入参数时抛出异常
- **线程 / 副作用**：同步检查当前 Root 模式、常见 `su` 路径和 RootShell 能力；只读查询

获取 Monkey King 的 Root 权限有效性.

```js
console.log(monkeyking.isRootAvailable()); // e.g. true
```

注意上述示例的检测结果取决于 Monkey King 的 `强制 Root 权限检查` 设置.<br>
此设置可通过 Monkey King 应用设置修改, 或 [setRootMode](#m-setrootmode) 方法携带 `isWriteIntoPreference` 参数实现修改.

## [m] getRootMode

### getRootMode()

**`6.2.0`**

- <ins>**returns**</ins> { [RootMode](../types/data-types.md#rootmode) }
- **异常**：传入参数时抛出异常
- **副作用**：同步只读查询；返回当前运行时覆盖值，否则返回应用偏好值

获取 Monkey King 的 Root 权限状态.

```js
 /* 是否为 '自动检测 Root 权限' 状态. */
console.log(monkeyking.getRootMode() === RootMode.AUTO_DETECT);
/* 是否为 '强制 Root 模式' 状态. */
console.log(monkeyking.getRootMode() === RootMode.FORCE_ROOT);
/* 是否为 '强制非 Root 模式' 状态. */
console.log(monkeyking.getRootMode() === RootMode.FORCE_NON_ROOT);
```

## [m] setRootMode

### setRootMode(rootMode, isWriteIntoPreference?)

**`6.2.0`** **`Overload [1-2]/2`**

- **rootMode** { [RootMode](../types/data-types.md#rootmode) | [number](../types/data-types.md#number) | [boolean](../types/data-types.md#boolean) | 'auto' | 'root' | 'non-root' } - Root 模式参数
- **[ isWriteIntoPreference = `false` ]** { [boolean](../types/data-types.md#boolean) | `"write_into_pref"` } - 是否写入应用设置
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不在 1 至 2 之间、字符串模式未知或模式类型不受支持时抛出异常
- **生命周期 / 副作用**：默认修改当前应用进程共享的临时 Root 模式，并在脚本运行时回收时重置；第二参数为 `true` 或不区分大小写的 `"write_into_pref"` 时持久写入应用偏好

设置 Monkey King 的 Root 模式.

数值模式只识别 `1`（强制 Root）、`0`（强制非 Root）和 `-1`（自动检测）；产品版本中其他数值不会改变模式，也不会抛出异常。

默认情况下, Monkey King 将根据 `su` 二进制名称特征来判断是否具有 Root 权限.
但有时设备可能使用了非常规 Root 方式或 Root 权限检测结果出现异常, 此时可设置 `强制 Root 模式` 或 `强制非 Root 模式` 来改变 Monkey King 对 Root 权限的检测结果.

以设置 '强制 Root 模式' 为例:

```js
monkeyking.setRootMode(RootMode.FORCE_ROOT);
monkeyking.setRootMode('root'); /* 同上. */
monkeyking.setRootMode(1); /* 同上. */
monkeyking.setRootMode(true); /* 同上. */
```

上述示例设置的 Root 模式, 将影响 [isRootAvailable](#m-isrootavailable) 的结果, 使其固定返回 `true`.<br>
如果设置为 `RootMode.FORCE_NON_ROOT`, [isRootAvailable](#m-isrootavailable) 将固定返回 `false`.<br>
如果设置为 `RootMode.AUTO_DETECT`, [isRootAvailable](#m-isrootavailable) 将根据 Monkey King 是否具有 `su` 二进制名称特征决定其返回结果.<br>

在没有特殊需求的情况下, 建议始终保持 Root 模式为 '自动' 模式.

需额外留意，临时 Root 模式保存在应用进程的共享状态中，并非脚本对象私有；并行脚本可能观察到同一临时值。当脚本运行时回收时，该临时状态会还原为 `RootMode.AUTO_DETECT`，随后 `getRootMode()` 再读取应用偏好。

如需将保留修改的 Root 模式, 可使用 `isWriteIntoPreference` 参数, 修改将立即写入应用设置中:

```js
monkeyking.setRootMode(RootMode.FORCE_ROOT, true);
```

上述示例代码的效果, 等效于在 Monkey King 应用中进行如下设置:

```text
[ Monkey King 设置 ] - [ 强制 Root 权限检查 ] - [ 强制 Root 模式 ] # [ 选择 ]
```

## [m] canModifySystemSettings

### canModifySystemSettings()

**`6.2.0`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：传入参数时抛出异常
- **权限 / 副作用**：不请求权限，只读取 Android `Settings.System.canWrite` 状态

获取 Monkey King 的 `修改系统设置` 权限状态.

```js
console.log(monkeyking.canModifySystemSettings()); // e.g. true
```

拥有 `修改系统设置` 后, Monkey King 可以通过脚本修改部分系统设置, 如修改屏幕超时参数, 修改媒体音量值等.

## [m] canWriteSecureSettings

### canWriteSecureSettings()

**`6.2.0`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：传入参数时抛出异常
- **权限 / 副作用**：不请求权限，只检查 `WRITE_SECURE_SETTINGS` 授权状态

获取 Monkey King 的 `修改安全设置` 权限状态.

```js
console.log(monkeyking.canWriteSecureSettings()); // e.g. true
```

拥有 `修改安全设置` 后, Monkey King 可以通过脚本修改部分安全设置, 如修改屏幕常亮类别参数, 修改无障碍服务列表内容等.

## [m] canDisplayOverOtherApps

### canDisplayOverOtherApps()

**`6.2.0`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：传入参数时抛出异常
- **权限 / 副作用**：不请求权限，只读取“显示在其他应用上层”授权状态

获取 Monkey King 的 `显示在其他应用上层` 权限状态.

```js
console.log(monkeyking.canDisplayOverOtherApps()); // e.g. true
```

拥有 `显示在其他应用上层` 后, Monkey King 可以使用悬浮窗工具, 并可通过脚本显示对话框或自定义浮动组件等.

## [p] name

**`6.6.0`** **`PERMANENT`** **`Writable`**

- { [string](../types/data-types.md#string) }

应用显示名称，当前为 `Monkey King`。

属性不可删除，但产品版本未附加 `READONLY` 标志；脚本可在当前对象上重新赋值，重新赋值不会修改 Android 应用名称。

```js
console.log(monkeyking.name); // Monkey King
```

## [p] packageName

**`6.6.0`** **`PERMANENT`** **`Writable`**

- { [string](../types/data-types.md#string) }

当前安装包名；正式应用使用 `com.qiaomu.monkeyking`，不同构建变体可能带后缀。

属性不可删除但可在当前脚本对象上重新赋值；赋值不会改变实际安装包身份。

```js
console.log(monkeyking.packageName);
```

## [p] rotation

**`6.6.0`** **`Getter`**

- **&lt;get&gt;** { [number](../types/data-types.md#number) }
- **异常 / 权限 / 副作用**：读取不需要额外权限；只查询默认显示器旋转状态

Android `Surface` 旋转常量，合法值通常为 `ROTATION_0`、`ROTATION_90`、`ROTATION_180` 或 `ROTATION_270` 对应的整数。优先从 `DisplayManager` 读取。

```js
console.log(monkeyking.rotation); // 0、1、2 或 3
```

## [p] orientation

**`6.6.0`** **`Getter`**

- **&lt;get&gt;** { [number](../types/data-types.md#number) }
- **异常 / 权限 / 副作用**：读取不需要额外权限；只查询当前资源方向

Android `Configuration.orientation`。无法取得 Activity 资源时回退为竖屏方向。

```js
console.log(monkeyking.orientation);
```

## [p] versionName

**`6.2.0`** **`PERMANENT`** **`Writable`**

- { [string](../types/data-types.md#string) }

获取版本名称.

重新赋值只改变当前脚本对象上的显示值，不改变实际构建版本。

```js
console.log(monkeyking.versionName);
console.log(monkeyking.version.name); /* 同上. */
```

## [p] versionCode

**`6.2.0`** **`PERMANENT`** **`Writable`**

- { [number](../types/data-types.md#number) }

获取版本号.

重新赋值只改变当前脚本对象上的显示值，不改变实际构建版本。

```js
console.log(monkeyking.versionCode); // e.g. 1545
console.log(monkeyking.version.code); /* 同上. */
```

## [p] versionDate

**`6.2.0`** **`PERMANENT`** **`Writable`**

- { [string](../types/data-types.md#string) }

获取版本日期.

重新赋值只改变当前脚本对象上的显示值，不改变实际构建版本。

```js
console.log(monkeyking.versionDate); // 构建时生成的英文日期字符串
console.log(monkeyking.version.date); /* 同上. */
```

## [p] themeColor

**`6.3.0`** **`Getter`**

- **&lt;get&gt;** [ThemeColor](../types/data-types.md#themecolor)
- **异常 / 副作用**：读取当前主题管理器状态，不修改主题

获取 Monkey King 的主题颜色实例.

```js
monkeyking.themeColor.getColorPrimary(); /* 获取 Monkey King 主题色的主色色值. */
```

## [p+] version

**`6.2.0`** **`PERMANENT`**

- { [Object](../types/data-types.md#object) } - 应用构建版本快照与比较方法
- **异常 / 副作用**：读取对象本身无副作用；比较方法的规则见下列成员

```js
console.log(monkeyking.version.name, monkeyking.version.code);
```

### [p] name

<a id="api-symbol-bW9ua2V5a2luZy52ZXJzaW9uLm5hbWU"></a>

**`6.2.0`** **`PERMANENT`** **`Writable`**

- { [string](../types/data-types.md#string) }

获取版本名称.

该快照属性不可删除但可在当前 `version` 对象上重新赋值；不会改变实际构建版本。

```js
console.log(monkeyking.version.name);
console.log(monkeyking.versionName); /* 同上. */
```

### [p] code

**`6.2.0`** **`PERMANENT`** **`Writable`**

- { [number](../types/data-types.md#number) }

获取版本号.

该快照属性不可删除但可在当前 `version` 对象上重新赋值；不会改变实际构建版本。

```js
console.log(monkeyking.version.code); // e.g. 1545
console.log(monkeyking.versionCode); /* 同上. */
```

### [p] date

**`6.2.0`** **`PERMANENT`** **`Writable`**

- { [string](../types/data-types.md#string) }

获取版本日期.

该快照属性不可删除但可在当前 `version` 对象上重新赋值；不会改变实际构建版本。

```js
console.log(monkeyking.version.date); // 构建时生成的英文日期字符串
console.log(monkeyking.versionDate); /* 同上. */
```

### [m] isEqual

#### isEqual(otherVersion)

**`6.2.0`**

- **otherVersion** { [string](../types/data-types.md#string) | [Version](../utilities/version.md#c-version) } - 待比较版本参数
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：参数数量不为 1 或版本字符串无法解析时抛出异常；同步纯比较

返回 Monkey King 版本是否与参数对应的版本号等同.

```js
console.log(monkeyking.version.isEqual('6.2.0')); // e.g. true
```

### [m] isHigherThan

#### isHigherThan(otherVersion)

**`6.2.0`**

- **otherVersion** { [string](../types/data-types.md#string) | [Version](../utilities/version.md#c-version) } - 待比较版本参数
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：参数数量不为 1 或版本字符串无法解析时抛出异常；同步纯比较

返回 Monkey King 版本是否高于待比较版本.

```js
console.log(monkeyking.version.isHigherThan('6.1.3')); // e.g. true
```

### [m] isLowerThan

#### isLowerThan(otherVersion)

**`6.2.0`**

- **otherVersion** { [string](../types/data-types.md#string) | [Version](../utilities/version.md#c-version) } - 待比较版本参数
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：参数数量不为 1 或版本字符串无法解析时抛出异常；同步纯比较

返回 Monkey King 版本是否低于待比较版本.

```js
console.log(monkeyking.version.isLowerThan('7.0.0')); // true
```

### [m] isAtLeast

#### isAtLeast(otherVersion)

**`6.2.0`** **`Overload 1/2`**

- **otherVersion** { [string](../types/data-types.md#string) | [Version](../utilities/version.md#c-version) } - 待比较版本参数
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：参数数量不为 1 或版本字符串无法解析时抛出异常；同步纯比较

返回 Monkey King 版本是否不低于 (即大于等于) 参数对应的版本号.

```js
console.log(monkeyking.version.isAtLeast('6.1.3')); // e.g. true
```

#### isAtLeast(otherVersion, ignoreSuffix)

**`6.2.0`** **`Overload 2/2`**

- **otherVersion** { [string](../types/data-types.md#string) | [Version](../utilities/version.md#c-version) } - 待比较版本参数
- **[ ignoreSuffix = `false` ]** { [boolean](../types/data-types.md#boolean) } - 是否忽略版本后缀
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常 / 副作用**：参数数量不在 1 至 2 之间或版本字符串无法解析时抛出异常；同步纯比较

返回 Monkey King 版本是否不低于 (即大于等于) 参数对应的版本号且根据 `ignoreSuffix` 参数决定是否忽略版本后缀.

```js
console.log(monkeyking.version.name);
console.log(monkeyking.version.isAtLeast('6.6.4')); // true
console.log(monkeyking.version.isAtLeast('6.6.4-beta1', true)); // true
```

## [p+] R

**`≤ 6.6.4`** **`Getter`** **`Alias: global.R`**

- **&lt;get&gt;** { [Object](../types/data-types.md#object) } - 按资源类型和名称延迟解析 ID 的代理
- **异常 / 副作用**：读取资源类型时创建并缓存代理；资源名称不存在时 Android `getIdentifier` 返回 `0`

使用 R 类的子类中的静态整数可访问相应的应用资源, 如 `R.string` 访问字符串资源, `R.drawable` 访问可绘制资源等.

```js
console.log(monkeyking.R.drawable.monkeyking_material);
console.log(R.drawable.monkeyking_material); /* 访问相同资源命名空间. */
```

[global.R](global.md#p-r) 的别名属性, 参阅 [全局对象 (Global)](global.md#p-r) 章节.
