# 按键常量 (Keys)

`keys` 只提供 Android 按键码常量，不负责模拟按键。需要执行返回、主页、通知栏等全局动作时，使用 [automator](automator.md)；需要底层输入事件时，使用 `rootAutomator`。常量值对应 Android 官方 [KeyEvent](https://developer.android.com/reference/android/view/KeyEvent)。

<a id="api-symbol-bW9kdWxlOmtleXM"></a>
## [@] keys

**`≤ 6.6.4`**

- **入口 / 别名**：`keys`、`$keys`
- **参数**：模块对象不可调用
- <ins>**returns**</ins> { `Keys` }
- **异常**：读取模块或常量不抛出异常
- **权限**：无
- **线程 / 生命周期**：常量在脚本运行时初始化后保持不变
- **副作用**：无；读取常量不会发送按键事件

```js
console.log(keys === $keys); // true
console.log(keys.home); // 3
```

<a id="api-symbol-a2V5cy5ob21l"></a>
## [p] keys.home

**`≤ 6.6.4`**

- **入口 / 别名**：小写主页键常量；同值入口为 `keys.HOME`
- **参数**：无
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - `KeyEvent.KEYCODE_HOME`，值为 `3`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：只读常量语义；读取时无副作用

```js
console.log(keys.home === 3); // true
```

<a id="api-symbol-a2V5cy5IT01F"></a>
## [p] keys.HOME

**`≤ 6.6.4`**

- **入口 / 别名**：大写主页键常量；同值入口为 `keys.home`
- **参数**：无
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - `KeyEvent.KEYCODE_HOME`，值为 `3`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：只读常量语义；读取时无副作用

```js
console.log(keys.HOME === keys.home); // true
```

<a id="api-symbol-a2V5cy5tZW51"></a>
## [p] keys.menu

**`≤ 6.6.4`**

- **入口 / 别名**：小写菜单键常量；同值入口为 `keys.MENU`
- **参数**：无
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - `KeyEvent.KEYCODE_MENU`，值为 `82`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：只读常量语义；读取时无副作用

```js
console.log(keys.menu); // 82
```

<a id="api-symbol-a2V5cy5NRU5V"></a>
## [p] keys.MENU

**`≤ 6.6.4`**

- **入口 / 别名**：大写菜单键常量；同值入口为 `keys.menu`
- **参数**：无
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - `KeyEvent.KEYCODE_MENU`，值为 `82`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：只读常量语义；读取时无副作用

```js
console.log(keys.MENU === keys.menu); // true
```

<a id="api-symbol-a2V5cy5iYWNr"></a>
## [p] keys.back

**`≤ 6.6.4`**

- **入口 / 别名**：小写返回键常量；同值入口为 `keys.BACK`
- **参数**：无
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - `KeyEvent.KEYCODE_BACK`，值为 `4`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：只读常量语义；读取时无副作用

```js
console.log(keys.back); // 4
```

<a id="api-symbol-a2V5cy5CQUNL"></a>
## [p] keys.BACK

**`≤ 6.6.4`**

- **入口 / 别名**：大写返回键常量；同值入口为 `keys.back`
- **参数**：无
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - `KeyEvent.KEYCODE_BACK`，值为 `4`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：只读常量语义；读取时无副作用

```js
console.log(keys.BACK === keys.back); // true
```

<a id="api-symbol-a2V5cy52b2x1bWVVcA"></a>
## [p] keys.volumeUp

**`≤ 6.6.4`**

- **入口 / 别名**：驼峰音量增大常量；同值入口为 `keys.volume_up`、`keys.VOLUME_UP`
- **参数**：无
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - `KeyEvent.KEYCODE_VOLUME_UP`，值为 `24`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：只读常量语义；读取时无副作用

```js
console.log(keys.volumeUp); // 24
```

<a id="api-symbol-a2V5cy52b2x1bWVfdXA"></a>
## [p] keys.volume_up

**`≤ 6.6.4`**

- **入口 / 别名**：下划线音量增大常量；同值入口为 `keys.volumeUp`、`keys.VOLUME_UP`
- **参数**：无
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - `KeyEvent.KEYCODE_VOLUME_UP`，值为 `24`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：只读常量语义；读取时无副作用

```js
console.log(keys.volume_up === keys.volumeUp); // true
```

<a id="api-symbol-a2V5cy5WT0xVTUVfVVA"></a>
## [p] keys.VOLUME_UP

**`≤ 6.6.4`**

- **入口 / 别名**：大写音量增大常量；同值入口为 `keys.volumeUp`、`keys.volume_up`
- **参数**：无
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - `KeyEvent.KEYCODE_VOLUME_UP`，值为 `24`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：只读常量语义；读取时无副作用

```js
console.log(keys.VOLUME_UP === 24); // true
```

<a id="api-symbol-a2V5cy52b2x1bWVEb3du"></a>
## [p] keys.volumeDown

**`≤ 6.6.4`**

- **入口 / 别名**：驼峰音量减小常量；同值入口为 `keys.volume_down`、`keys.VOLUME_DOWN`
- **参数**：无
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - `KeyEvent.KEYCODE_VOLUME_DOWN`，值为 `25`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：只读常量语义；读取时无副作用

```js
console.log(keys.volumeDown); // 25
```

<a id="api-symbol-a2V5cy52b2x1bWVfZG93bg"></a>
## [p] keys.volume_down

**`≤ 6.6.4`**

- **入口 / 别名**：下划线音量减小常量；同值入口为 `keys.volumeDown`、`keys.VOLUME_DOWN`
- **参数**：无
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - `KeyEvent.KEYCODE_VOLUME_DOWN`，值为 `25`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：只读常量语义；读取时无副作用

```js
console.log(keys.volume_down === keys.volumeDown); // true
```

<a id="api-symbol-a2V5cy5WT0xVTUVfRE9XTg"></a>
## [p] keys.VOLUME_DOWN

**`≤ 6.6.4`**

- **入口 / 别名**：大写音量减小常量；同值入口为 `keys.volumeDown`、`keys.volume_down`
- **参数**：无
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - `KeyEvent.KEYCODE_VOLUME_DOWN`，值为 `25`
- **异常 / 权限**：无
- **线程 / 生命周期 / 副作用**：只读常量语义；读取时无副作用

```js
console.log(keys.VOLUME_DOWN === 25); // true
```
