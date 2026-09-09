# Monkey King 本体应用

monkeyking 全局对象主要包含与 Monkey King 应用本身相关的属性及方法, 如获取 Monkey King 的 [ Root 状态 / 语言标签 / 权限状态 ] 等.

---

<p style="font: bold 2em sans-serif; color: #FF7043">monkeyking</p>

---

## [m] getLanguage

### getLanguage()

**`6.2.0`**

- <ins>**returns**</ins> { [java.util.Locale](https://docs.oracle.com/javase/8/docs/api/java/util/Locale.html) }

获取 Monkey King `语言` 设置选项.

此方法返回一个 java.util.Locale 对象, 如需返回其标签名, 如 `en-US`, `zh-CN` 等, 可使用 `monkeyking.getLanguage().toLanguageTag()` 或直接使用 [monkeyking.getLanguageTag()](#m-getlanguagetag) 方法.

```js
console.log(monkeyking.getLanguage().getDisplayName()); /* e.g. 日本語 */
```

## [m] getLanguageTag

### getLanguageTag()

**`6.2.0`**

- <ins>**returns**</ins> { [string](../types/data-types.md#string) }

获取 Monkey King 语言设置选项.

此方法返回 [IETF 语言标签](https://en.wikipedia.org/wiki/IETF_language_tag), 相当于 `monkeyking.getLanguage().toLanguageTag()`:

```js
console.log(monkeyking.getLanguageTag()); /* e.g. en-US */
```

此方法可用于设定 i18n 对象的区域:

```js
i18n.setLocale(monkeyking.getLanguageTag());
```

## [m] isRootAvailable

### isRootAvailable()

**`6.2.0`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

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
- **[ isWriteIntoPreference = `false` ]** {  [boolean](../types/data-types.md#boolean) } - 是否写入应用设置
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

设置 Monkey King 的 Root 模式.

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

需额外留意, Root 模式修改仅对当前 `运行时 (Runtime)` 有效, 当脚本结束时, 已设置的 Root 模式将自动还原为 '自动' 模式, 即 `RootMode.AUTO_DETECT`.

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

获取 Monkey King 的 `修改系统设置` 权限状态.

```js
console.log(monkeyking.canModifySystemSettings()); // e.g. true
```

拥有 `修改系统设置` 后, Monkey King 可以通过脚本修改部分系统设置, 如修改屏幕超时参数, 修改媒体音量值等.

## [m] canWriteSecureSettings

### canWriteSecureSettings()

**`6.2.0`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

获取 Monkey King 的 `修改安全设置` 权限状态.

```js
console.log(monkeyking.canWriteSecureSettings()); // e.g. true
```

拥有 `修改安全设置` 后, Monkey King 可以通过脚本修改部分安全设置, 如修改屏幕常亮类别参数, 修改无障碍服务列表内容等.

## [m] canDisplayOverOtherApps

### canDisplayOverOtherApps()

**`6.2.0`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

获取 Monkey King 的 `显示在其他应用上层` 权限状态.

```js
console.log(monkeyking.canDisplayOverOtherApps()); // e.g. true
```

拥有 `显示在其他应用上层` 后, Monkey King 可以使用悬浮窗工具, 并可通过脚本显示对话框或自定义浮动组件等.

## [p] versionName

**`6.2.0`**

- { [string](../types/data-types.md#string) }

获取版本名称.

```js
console.log(monkeyking.versionName); // e.g. 6.2.0-alpha9
console.log(monkeyking.version.name); /* 同上. */
```

## [p] versionCode

**`6.2.0`**

- { [number](../types/data-types.md#number) }

获取版本号.

```js
console.log(monkeyking.versionCode); // e.g. 1545
console.log(monkeyking.version.code); /* 同上. */
```

## [p] versionDate

**`6.2.0`**

- { [string](../types/data-types.md#string) }

获取版本日期.

```js
console.log(monkeyking.versionDate); // e.g. Dec 18, 2022
console.log(monkeyking.version.date); /* 同上. */
```

## [p] themeColor

**`6.3.0`** **`Getter`**

- **&lt;get&gt;** [ThemeColor](../types/data-types.md#themecolor)

获取 Monkey King 的主题颜色实例.

```js
monkeyking.themeColor.getColorPrimary(); /* 获取 Monkey King 主题色的主色色值. */
```

## [p+] version

### [p] name

**`6.2.0`**

- { [string](../types/data-types.md#string) }

获取版本名称.

```js
console.log(monkeyking.version.name); // e.g. 6.2.0-alpha9
console.log(monkeyking.versionName); /* 同上. */
```

### [p] code

**`6.2.0`**

- { [number](../types/data-types.md#number) }

获取版本号.

```js
console.log(monkeyking.version.code); // e.g. 1545
console.log(monkeyking.versionCode); /* 同上. */
```

### [p] date

**`6.2.0`**

- { [string](../types/data-types.md#string) }

获取版本日期.

```js
console.log(monkeyking.version.date); // e.g. Dec 18, 2022
console.log(monkeyking.versionDate); /* 同上. */
```

### [m] isEqual

#### isEqual(otherVersion)

**`6.2.0`**

- **otherVersion** { [string](../types/data-types.md#string) | [Version](../utilities/version.md#c-version) } - 待比较版本参数
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

返回 Monkey King 版本是否与参数对应的版本号等同.

```js
console.log(monkeyking.version.isEqual('6.2.0')); // e.g. true
```

### [m] isHigherThan

#### isHigherThan(otherVersion)

**`6.2.0`**

- **otherVersion** { [string](../types/data-types.md#string) | [Version](../utilities/version.md#c-version) } - 待比较版本参数
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

返回 Monkey King 版本是否高于待比较版本.

```js
console.log(monkeyking.version.isHigherThan('6.1.3')); // e.g. true
```

### [m] isLowerThan

#### isLowerThan(otherVersion)

**`6.2.0`**

- **otherVersion** { [string](../types/data-types.md#string) | [Version](../utilities/version.md#c-version) } - 待比较版本参数
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

返回 Monkey King 版本是否低于待比较版本.

```js
console.log(monkeyking.version.isLowerThan('6.2.0')); // e.g. true
```

### [m] isAtLeast

#### isAtLeast(otherVersion)

**`6.2.0`** **`Overload 1/2`**

- **otherVersion** { [string](../types/data-types.md#string) | [Version](../utilities/version.md#c-version) } - 待比较版本参数
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

返回 Monkey King 版本是否不低于 (即大于等于) 参数对应的版本号.

```js
console.log(monkeyking.version.isAtLeast('6.1.3')); // e.g. true
```

#### isAtLeast(otherVersion, ignoreSuffix)

**`6.2.0`** **`Overload 2/2`**

- **otherVersion** { [string](../types/data-types.md#string) | [Version](../utilities/version.md#c-version) } - 待比较版本参数
- **[ ignoreSuffix = `false` ]** { [boolean](../types/data-types.md#boolean) } - 是否忽略版本后缀
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }

返回 Monkey King 版本是否不低于 (即大于等于) 参数对应的版本号且根据 `ignoreSuffix` 参数决定是否忽略版本后缀.

```js
console.log(monkeyking.version.name); // e.g. 6.2.0-alpha9
console.log(monkeyking.version.isAtLeast('6.2.0')); // e.g. false
console.log(monkeyking.version.isAtLeast('6.2.0', true)); // e.g. true
```

## [p+] R

使用 R 类的子类中的静态整数可访问相应的应用资源, 如 `R.string` 访问字符串资源, `R.drawable` 访问可绘制资源等.

[global.R](global.md#p-r) 的别名属性, 参阅 [全局对象 (Global)](global.md#p-r) 章节.
