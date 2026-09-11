# 颜色 (Color)

colors 模块可用于 [ 颜色模式转换 / 色彩空间转换 / 颜色分量合成及分解 ] 等.<br>
同时包含一些颜色相关的工具, 如 [ 计算亮度值 / 相似度比较 ] 等.

colors 模块与 [images](image.md) 模块配合使用, 可完成更多图色方面的功能.

---

## 颜色表示

Monkey King 支持以下方式表示一个颜色:

- [颜色代码 (ColorHex)](../types/data-types.md#colorhex)
    - 字面量
        - `#RGB` (如 `#F00` 表示红色, 相当于 `#FF0000`)
        - `#RRGGBB` (如 `#FF0000` 表示红色)
        - `#AARRGGBB` (如 `#80FF0000` 表示半透明红色)
    - 方法
        - [colors.toHex](#m-tohex) (如 `colors.toHex(0xFF0000)` 表示红色对应的颜色字符串, 结果为 `#FF0000`)
        - [colors.toFullHex](#m-tofullhex) (如 `colors.toFullHex(0xFF0000)` 表示红色对应的完全颜色字符串, 结果为 `#FFFF0000`)
        - 其他颜色代码形式按同一 `toHex` 规则处理
- [颜色整数 (ColorInt)](../types/data-types.md#colorint)
    - 字面量
        - `0xAARRGGBB` (如 `0x8000FF00` 在 `Java` 的 `Integer` 范围对应值表示半透明绿色)
    - 方法
        - [colors.rgb](#m-rgb) (如 `colors.rgb(255, 0, 0)` 表示红色)
        - [colors.argb](#m-argb) (如 `colors.argb(128, 255, 0, 0)` 表示半透明红色)
        - [colors.rgba](#m-rgba) (如 `colors.rgba(255, 0, 0, 128)` 表示半透明红色)
        - [colors.hsv](#m-hsv) (如 `colors.hsv(0, 1, 1)` 表示红色)
        - [colors.hsva](#m-hsva) (如 `colors.rgba(0, 1, 1, 0.5)` 表示半透明红色)
        - [colors.hsl](#m-hsl) (如 `colors.hsl(0, 1, 0.5)` 表示红色)
        - [colors.hsla](#m-hsla) (如 `colors.hsl(0, 1, 0.5, 0.5)` 表示半透明红色)
        - [colors.toInt](#m-toint) (如 `colors.toInt('#FF0000')` 表示红色对应的颜色整数, 结果为 `-65536`)
        - 其他颜色整数转换入口见本页方法列表
    - 常量
        - [colors.android.RED](#p-android) ([Android 颜色列表](../../reference/color-table.md#android-颜色列表) 的红色颜色整数)
        - [colors.android.BLACK](#p-android) ([Android 颜色列表](../../reference/color-table.md#android-颜色列表) 的黑色颜色整数)
        - 其他 Android 颜色常量见[颜色表](../../reference/color-table.md#android-颜色列表)
        - [colors.css.RED](#p-css) ([Css 颜色列表](../../reference/color-table.md#css-颜色列表) 的红色颜色整数)
        - [colors.css.BLACK](#p-css) ([Css 颜色列表](../../reference/color-table.md#css-颜色列表) 的黑色颜色整数)
        - 其他 CSS 颜色常量见[颜色表](../../reference/color-table.md#css-颜色列表)
        - [colors.web.RED](#p-web) ([Web 颜色列表](../../reference/color-table.md#web-颜色列表) 的红色颜色整数)
        - [colors.web.BLACK](#p-web) ([Web 颜色列表](../../reference/color-table.md#web-颜色列表) 的黑色颜色整数)
        - 其他 Web 颜色常量见[颜色表](../../reference/color-table.md#web-颜色列表)
        - [colors.material.ORANGE](#p-material) ([Material 颜色列表](../../reference/color-table.md#material-颜色列表) 的橙色颜色整数)
        - [colors.material.ORANGE_300](#p-material) ([Material 颜色列表](../../reference/color-table.md#material-颜色列表) 的 300 色号橙色颜色整数)
        - 其他 Material 颜色常量见[颜色表](../../reference/color-table.md#material-颜色列表)
        - [colors.RED](#p-red) ([融合颜色列表](../../reference/color-table.md#融合颜色列表) 的红色颜色整数)
        - [colors.BLACK](#p-black) ([融合颜色列表](../../reference/color-table.md#融合颜色列表) 的黑色颜色整数)
        - [colors.ORANGE](#p-orange) ([融合颜色列表](../../reference/color-table.md#融合颜色列表) 的橙色颜色整数)
        - 其他融合颜色常量见[颜色表](../../reference/color-table.md#融合颜色列表)
- [颜色分量数组 (ColorComponents)](../types/data-types.md#colorcomponents)
    - 方法
        - [colors.toRgb](#m-torgb) (颜色分量数组 `[R,G,B]`)
        - [colors.toRgba](#m-torgba) (颜色分量数组 `[R,G,B,A]`)
        - [colors.toArgb](#m-toargb) (颜色分量数组 `[A,R,G,B]`)
        - [colors.toHsv](#m-tohsv) (颜色分量数组 `[H,S,V]`)
        - [colors.toHsva](#m-tohsva) (颜色分量数组 `[H,S,V,A]`)
        - [colors.toHsl](#m-tohsl) (颜色分量数组 `[H,S,L]`)
        - [colors.toHsla](#m-tohsla) (颜色分量数组 `[H,S,L,A]`)
        - 其他颜色分量转换方法见下文
- [颜色名称 (ColorName)](../types/data-types.md#colorname)
    - 常量
        - "red" (红色)
        - "black" (黑色)
        - "orange" (橙色)
        - 其他颜色名称按大小写不敏感规则解析

## 黑色与 0

需特别留意, 黑色的颜色字符串为 `#000000`, 它是完全颜色字符串 `#FF000000` 的简写形式, 其 ARGB 分量表示为 `argb(255, 0, 0, 0)`.

因此黑色的颜色整数不是 `0`, 而是 `-16777216`.

颜色整数 `0` 对应的是完全透明色, 即 `#00000000`, 其 ARGB 分量表示为 `argb(0, 0, 0, 0)`.

---

<p style="font: bold 2em sans-serif; color: #FF7043">colors</p>

---

## [m] toInt

### toInt(color)

**`6.2.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) } - 颜色整数

将颜色参数转换为 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
/* ColorHex - 颜色代码. */
colors.toInt('#CC5500'); // -3386112
colors.toInt('#C50'); // -3386112
colors.toInt('#FFCC5500'); // -3386112

/* ColorInt - 颜色整数. */
colors.toInt(0xFFCC5500); // -3386112
colors.toInt(colors.web.BURNT_ORANGE); // -3386112

/* ColorName - 颜色名称. */
colors.toInt('BURNT_ORANGE'); // -3386112
colors.toInt('burnt-orange'); // -3386112
```

## [m] toHex

### toHex(color)

**`6.2.0`** **`Overload 1/3`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorHex](../types/data-types.md#colorhex) } - 颜色代码

将颜色参数转换为 [颜色代码 (ColorHex)](../types/data-types.md#colorhex).

```js
/* ColorHex - 颜色代码. */
colors.toHex('#CC5500'); // #CC5500
colors.toHex('#C50'); // #CC5500
colors.toHex('#DECC5500'); // #DECC5500
colors.toHex('#FFCC5500'); /* #CC5500, A (alpha) 分量被省略. */

/* ColorInt - 颜色整数. */
colors.toHex(0xFFCC5500); // #CC5500
colors.toHex(colors.web.BURNT_ORANGE); // #CC5500

/* ColorName - 颜色名称. */
colors.toHex('BURNT_ORANGE'); // #CC5500
colors.toHex('burnt-orange'); // #CC5500
```

当 `A (alpha)` 分量为 `100% (255/255;100/100)` 时, `FF` 会自动省略,<br>
如 `#FFC0C0C0` 将自动转换为 `#C0C0C0`, 此方法相当于 `toHex(color, 'auto')`.

### toHex(color, alpha)

**`6.2.0`** **`Overload 2/3`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **[ alpha = `'auto'` ]** { [boolean](../types/data-types.md#boolean) | `'keep'` | `'none'` | `'auto'` } - A (alpha) 分量参数
- <ins>**returns**</ins> { [ColorHex](../types/data-types.md#colorhex) } - 颜色代码

将颜色参数转换为 [颜色代码 (ColorHex)](../types/data-types.md#colorhex), 并根据 `alpha` 参数决定颜色代码 `A (alpha)` 分量的显示状态.

`A (alpha)` 分量参数取值表:

| 取值                                                     | 含义                                                                  | 默认 |
|--------------------------------------------------------|---------------------------------------------------------------------|:--:|
| <span style="white-space:nowrap">'keep' / true</span>  | <span style="white-space:nowrap">强制显示 A 分量, 不论 A 分量是否为 0xFF</span>  |    |
| <span style="white-space:nowrap">'none' / false</span> | <span style="white-space:nowrap">强制去除 A 分量, 只保留 R / G / B 分量</span> |    |
| <span style="white-space:nowrap">'auto'</span>         | <span style="white-space:nowrap">根据 A 分量是否为 0xFF 自动决定显示状态</span>    | √  |

```js
let cA = '#AAC0C0C0';
let cB = '#FFC0C0C0';
let cC = '#C0C0C0';

colors.toHex(cA, 'auto'); /* #AAC0C0C0, 'auto' 参数可省略. */
colors.toHex(cB, 'auto'); /* #C0C0C0, 'auto' 参数可省略. */
colors.toHex(cC, 'auto'); /* #C0C0C0, 'auto' 参数可省略. */

/* cA 舍弃 A 分量. */
colors.toHex(cA, false); // #C0C0C0
colors.toHex(cA, 'none'); /* 同上. */

/* cB 保留 A 分量. */
colors.toHex(cB, true); // #FFC0C0C0
colors.toHex(cB, 'keep'); /* 同上. */

/* cC 强制显示 A 分量. */
colors.toHex(cC, true); // #FFC0C0C0
colors.toHex(cC, 'keep'); /* 同上. */
```

### toHex(color, length)

**`6.2.0`** **`Overload 3/3`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **length** { `8` | `6` | `3` } - Hex 代码长度参数
- <ins>**returns**</ins> { [ColorHex](../types/data-types.md#colorhex) } - 颜色代码

将颜色参数转换为 [颜色代码 (ColorHex)](../types/data-types.md#colorhex), 并根据 `length` 参数决定颜色代码的显示状态.

Hex 代码长度参数取值表:

| <span style="white-space:nowrap">取值</span> | 含义                                                                 |
|:------------------------------------------:|--------------------------------------------------------------------|
|                     8                      | <span style="white-space:nowrap">强制显示 A 分量, 结果格式为 #AARRGGBB</span> |
|                     6                      | <span style="white-space:nowrap">强制去除 A 分量, 结果格式为 #RRGGBB</span>   |
|                     3                      | <span style="white-space:nowrap">强制去除 A 分量, 结果格式为 #RGB</span>      |

```js
let cA = '#AA9966CC';
let cB = '#FF9966CC';
let cC = '#9966CC';
let cD = '#FAEBD7';

/* 转换为 8 长度颜色代码, 强制保留 A 分量. */
colors.toHex(cA, 8); // #AA9966CC
colors.toHex(cB, 8); // #FF9966CC
colors.toHex(cC, 8); // #FF9966CC
colors.toHex(cD, 8); // #FFFAEBD7

/* 转换为 6 长度颜色代码, 强制去除 A 分量. */
colors.toHex(cA, 6); // #9966CC
colors.toHex(cB, 6); // #9966CC
colors.toHex(cC, 6); // #9966CC
colors.toHex(cD, 6); // #FAEBD7

/* 转换为 3 长度颜色代码, 强制去除 A 分量. */
colors.toHex(cA, 3); // #96C
colors.toHex(cB, 3); // #96C
colors.toHex(cC, 3); // #96C
colors.toHex(cD, 3); /* 抛出异常. */
```

## [m] toFullHex

### toFullHex(color)

**`6.2.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorHex](../types/data-types.md#colorhex) } - 颜色代码的完整形式

将颜色参数强制转换为 [颜色代码 (ColorHex)](../types/data-types.md#colorhex) 的完整形式 (#AARRGGBB).

此方法为 [colors.toHex(color, 8)](#tohex-color-length) 的别名方法.

```js
colors.toHex('#CC5500'); // #CC5500
colors.toFullHex('#CC5500'); // #FFCC5500
```

## [m] build

### build(color?)

**`6.3.0`** **`Overload [1-2]/4`**

- **[ color = `Colors.BLACK` ]** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [Color](../types/color.md) } - Color 实例

构建一个 [Color](../types/color.md) 实例, 相当于 `new Color(color?)` 或 `Color(color?)`.

```js
colors.build('dark-orange') /* 以深橙色构建 Color 实例 */
    .setAlpha(0.85) /* 设置透明度 85%. */
    .removeBlue() /* 移除 B (blue) 分量. */
    .toHex(); // #D9FF8C00

/* 构建空 Color 实例, 设置 HSLA 分量并转换为 Hex 代码. */
colors.build().setHsla(0.25, 0.8, 0.64, 0.9).toHex(); // #E6A3ED5A
```

### build(red, green, blue, alpha?)

**`6.3.0`** **`Overload [3-4]/4`**

- **red** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - R (red)
- **green** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - G (green)
- **blue** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - B (blue)
- **[ alpha = `1` ]** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - A (alpha)
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

构建一个 [Color](../types/color.md) 实例, 相当于 `new Color(red, green, blue, alpha?)`.

```js
colors.build(120, 60, 240).setAlpha(0.85).toHex(); // #D9783CF0
colors.build(120, 60, 240, 0.85).toHex(); /* 同上. */
colors.build().setRgba(120, 60, 240, 0.85).toHex(); /* 同上. */
```

## [m] summary

### summary(color)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 颜色摘要

获取颜色摘要.

格式为 `hex($HEX), rgba($R,$G,$B/$A), int($INT)`.

其中, `A (alpha)` 分量将显示为 `0..1` 范围, 至少一位小数, 至多两位小数:

| 分量值  | 显示值  |
|------|------|
| 0    | 0.0  |
| 1    | 1.0  |
| 0.64 | 0.64 |
| 128  | 0.5  |
| 255  | 1.0  |
| 100  | 0.39 |

示例:

```js
// hex(#009688), rgba(0,150,136/1.0), int(-16738680)
colors.summary('#009688');

// hex(#BE009688), rgba(0,150,136/0.75), int(-1107257720)
colors.summary('#BE009688');

// hex(#FF0000), rgba(255,0,0/1.0), int(-65536)
colors.summary('red');

// hex(#6400008B), rgba(0,0,139/0.39), int(1677721739)
colors.build('dark-blue').setAlpha(100).summary();
```

## [m] parseColor

### parseColor(color)

- **color** { [string](../types/data-types.md#string) } - 颜色参数
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) } - 颜色整数

将颜色参数转换为 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

类似 [toInt](#m-toint), 但参数接受范围相对狭小且类型及数值要求更加严格.<br>
parseColor 的颜色参数仅支持六位数及八位数颜色代码及部分颜色名称.

支持的颜色名称 (不区分大小写):
> 'aqua', 'black', 'blue', 'cyan', 'darkgray', 'darkgrey',
>
> 'fuchsia', 'gray', 'green', 'grey', 'lightgray',
>
> 'lightgrey', 'lime', 'magenta', 'maroon', 'navy', 'olive',
>
> 'purple', 'red', 'silver', 'teal', 'white', 'yellow'.

下表列出部分 toInt 与 parseColor 传参后的结果对照:

| 参数                      | toInt     | parseColor |
|-------------------------|-----------|------------|
| 'blue'                  | -16776961 | -16776961  |
| 'burnt-orange'          | -3386112  | # 抛出异常 #   |
| '#FFCC5500'             | -3386112  | -3386112   |
| '#CC5500'               | -3386112  | -3386112   |
| '#C50'                  | -3386112  | # 抛出异常 #   |
| 0xFFCC5500              | -3386112  | # 抛出异常 #   |
| colors.web.BURNT_ORANGE | -3386112  | # 抛出异常 #   |

除非需要考虑多版本兼容, 否则建议始终使用 toInt 替代 parseColor.

## [m] toString

### toString(color)

**`[6.2.0]`** **`Overload 1/3`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorHex](../types/data-types.md#colorhex) } - 颜色代码

将颜色参数转换为 [颜色代码 (ColorHex)](../types/data-types.md#colorhex).

[toHex(color)](#tohex-color) 的别名方法.

### toString(color, alpha)

**`6.2.0`** **`Overload 2/3`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **[ alpha = `'auto'` ]** { [boolean](../types/data-types.md#boolean) | `'keep'` | `'none'` | `'auto'` } - A (alpha) 分量参数
- <ins>**returns**</ins> { [ColorHex](../types/data-types.md#colorhex) } - 颜色代码

将颜色参数转换为 [颜色代码 (ColorHex)](../types/data-types.md#colorhex), 并根据 `alpha` 参数决定颜色代码 `A (alpha)` 分量的显示状态.

[toHex(color, alpha)](#tohex-color-alpha) 的别名方法.

### toString(color, length)

**`6.2.0`** **`Overload 3/3`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **length** { `8` | `6` | `3` } - Hex 代码长度参数
- <ins>**returns**</ins> { [ColorHex](../types/data-types.md#colorhex) } - 颜色代码

将颜色参数转换为 [颜色代码 (ColorHex)](../types/data-types.md#colorhex), 并根据 `length` 参数决定颜色代码的显示状态.

[toHex(color, length)](#tohex-color-length) 的别名方法.

## [m] alpha

### alpha(color)

**`Overload 1/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `A (alpha)` 分量, 取值范围 `[0..255]`.

```js
colors.alpha('#663399'); // 255
colors.alpha(colors.TRANSPARENT); // 0
colors.alpha('#05060708'); // 5
```

### alpha(color, options)

**`6.3.0`** **`Overload 2/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **options** &#123;&#123;
    - [ max = `255` ]?: `1` | `255` - 范围最大值
- &#125;&#125; - 选项参数
- <ins>**returns**</ins> { [IntRange[0..1]](../types/data-types.md#intrange) | [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `A (alpha)` 分量.

取值范围 `[0..1]` (`options.max` 为 `1`) 或 `[0..255]` (`options.max` 为 `255` 或不指定).

```js
colors.alpha('#663399', { max: 1 }); // 1
colors.alpha('#663399', { max: 255 }); // 255
colors.alpha('#663399'); /* 同上. */

colors.alpha('#05060708', { max: 1 }); // 0.0196078431372549
colors.alpha('#05060708', { max: 255 }); // 5
colors.alpha('#05060708'); /* 同上. */
```

当 `options.max` 为 `1` 时, 相当于 [colors.alphaDouble](#m-alphadouble) 方法.

## [m] alphaDouble

### alphaDouble(color)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [Range[0..1]](../types/data-types.md#range) }

获取颜色的 `A (alpha)` 分量, 取值范围 `[0..1]`.

相当于 `colors.alpha(color, { max: 1 })`.

```js
colors.alphaDouble('#663399'); // 1
colors.alphaDouble(colors.TRANSPARENT); // 0

colors.alphaDouble('#05060708'); // 0.0196078431372549
colors.alpha('#05060708', { max: 1 }); /* 同上. */
```

## [m] getAlpha

### getAlpha(color)

**`6.3.0`** **`Overload 1/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `A (alpha)` 分量, 取值范围 `[0..255]`.

[colors.alpha(color)](#m-alpha) 的别名方法.

### getAlpha(color, options)

**`6.3.0`** **`Overload 2/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **options** &#123;&#123;
    - [ max = `255` ]?: `1` | `255` - 范围最大值
- &#125;&#125; - 选项参数
- <ins>**returns**</ins> { [IntRange[0..1]](../types/data-types.md#intrange) | [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `A (alpha)` 分量.

[colors.alpha(color, options)](#m-alpha) 的别名方法.

## [m] getAlphaDouble

### getAlphaDouble(color)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [Range[0..1]](../types/data-types.md#range) }

获取颜色的 `A (alpha)` 分量, 取值范围 `[0..1]`.

[colors.alphaDouble(color)](#m-alphadouble) 的别名方法.

## [m] setAlpha

### setAlpha(color, alpha)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **alpha** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - A (alpha)
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

设置颜色的 `A (alpha)` 分量, 返回新颜色的颜色整数.

```js
colors.toHex(colors.setAlpha('#663399', 0x80)); // #80663399
colors.toHex(colors.setAlpha('#663399', 0.5)); /* 同上, 0.5 解析为百分数分量, 即 50%. */

colors.toHex(colors.setAlpha('#663399', 255)); // #FF663399
colors.toHex(colors.setAlpha('#663399', 1)); /* 同上, 1 默认作为百分数分量, 即 100%. */
```

## [m] setAlphaRelative

### setAlphaRelative(color, percentage)

**`6.3.1`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **percentage** { [ColorComponent](../types/data-types.md#colorcomponent) } - 相对百分数
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

针对 `A (alpha)` 分量设置其相对百分比, 返回新颜色的颜色整数.

如当前颜色 `A (alpha)` 分量为 `80`, 希望设置 `A` 分量为 `50%` 相对量, 即 `40`:

```js
colors.setAlphaRelative(color, 0.5);
colors.setAlphaRelative(color, '50%'); /* 效果同上. */
```

同样地, 如希望设置 `A` 分量为 `1.5` 倍相对量, 即 `120`:

```js
colors.setAlphaRelative(color, 1.5);
colors.setAlphaRelative(color, '150%');
```

当设置的相对量超过 `255` 时, 将以 `255` 为最终值:

```js
colors.setAlphaRelative(color, 10); /* A 分量最终值为 255, 而非 800. */
```

特别地, 当原本颜色的 `A` 分量为 `0` 时, 无论如何设置相对量, `A` 分量均保持 `0` 值.

## [m] removeAlpha

### removeAlpha(color)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

去除颜色的 `A (alpha)` 分量, 返回新颜色的颜色整数.

```js
colors.toHex(colors.removeAlpha('#BE663399')); // #663399
colors.toHex(colors.removeAlpha('#CC5500')); // #CC5500
````

相当于 `colors.setAlpha(color, 0)`.

## [m] red

### red(color)

**`Overload 1/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `R (red)` 分量, 取值范围 `[0..255]`.

```js
colors.red('#663399'); // 102
colors.red(colors.TRANSPARENT); // 0
colors.red('#05060708'); // 6
```

### red(color, options)

**`6.3.0`** **`Overload 2/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **options** &#123;&#123;
    - [ max = `255` ]?: `1` | `255` - 范围最大值
- &#125;&#125; - 选项参数
- <ins>**returns**</ins> { [IntRange[0..1]](../types/data-types.md#intrange) | [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `R (red)` 分量.

取值范围 `[0..1]` (`options.max` 为 `1`) 或 `[0..255]` (`options.max` 为 `255` 或不指定).

```js
colors.red('#663399', { max: 1 }); // 0.4
colors.red('#663399', { max: 255 }); // 102
colors.red('#663399'); /* 同上. */
```

当 `options.max` 为 `1` 时, 相当于 [colors.redDouble](#m-reddouble) 方法.

## [m] redDouble

### redDouble(color)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [Range[0..1]](../types/data-types.md#range) }

获取颜色的 `R (red)` 分量, 取值范围 `[0..1]`.

相当于 `colors.red(color, { max: 1 })`.

```js
colors.redDouble('#663399'); // 0.4
```

## [m] getRed

### getRed(color)

**`6.3.0`** **`Overload 1/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `R (red)` 分量, 取值范围 `[0..255]`.

[colors.red(color)](#m-red) 的别名方法.

### getRed(color, options)

**`6.3.0`** **`Overload 2/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **options** &#123;&#123;
    - [ max = `255` ]?: `1` | `255` - 范围最大值
- &#125;&#125; - 选项参数
- <ins>**returns**</ins> { [IntRange[0..1]](../types/data-types.md#intrange) | [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `R (red)` 分量.

[colors.red(color, options)](#m-red) 的别名方法.

## [m] getRedDouble

### getRedDouble(color)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [Range[0..1]](../types/data-types.md#range) }

获取颜色的 `R (red)` 分量, 取值范围 `[0..1]`.

[colors.redDouble(color)](#m-reddouble) 的别名方法.

## [m] setRed

### setRed(color, red)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **red** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - R (red)
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

设置颜色的 `R (red)` 分量, 返回新颜色的颜色整数.

```js
colors.toHex(colors.setRed('#663399', 0x80)); // #803399
colors.toHex(colors.setRed('#663399', 0.5)); /* 同上, 0.5 解析为百分数分量, 即 50%. */

colors.toHex(colors.setRed('#663399', 255)); // #FF3399
colors.toHex(colors.setRed('#663399', 1)); /* #013399, 不同上. 1 默认作为整数分量, 而非 100%. */
```

## [m] setRedRelative

### setRedRelative(color, percentage)

**`6.3.1`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **percentage** { [ColorComponent](../types/data-types.md#colorcomponent) } - 相对百分数
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

针对 `R (red)` 分量设置其相对百分比, 返回新颜色的颜色整数.

如当前颜色 `R (red)` 分量为 `80`, 希望设置 `R` 分量为 `50%` 相对量, 即 `40`:

```js
colors.setRedRelative(color, 0.5);
colors.setRedRelative(color, '50%'); /* 效果同上. */
```

同样地, 如希望设置 `R` 分量为 `1.5` 倍相对量, 即 `120`:

```js
colors.setRedRelative(color, 1.5);
colors.setRedRelative(color, '150%');
```

当设置的相对量超过 `255` 时, 将以 `255` 为最终值:

```js
colors.setRedRelative(color, 10); /* R 分量最终值为 255, 而非 800. */
```

特别地, 当原本颜色的 `R` 分量为 `0` 时, 无论如何设置相对量, `R` 分量均保持 `0` 值.

## [m] removeRed

### removeRed(color)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

去除颜色的 `R (red)` 分量, 返回新颜色的颜色整数.

```js
colors.toHex(colors.removeRed('#BE663399')); // #BE003399
colors.toHex(colors.removeRed('#CC5500')); // #005500
````

相当于 `colors.setRed(color, 0)`.

## [m] green

### green(color)

**`Overload 1/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `G (green)` 分量, 取值范围 `[0..255]`.

```js
colors.green('#663399'); // 51
colors.green(colors.TRANSPARENT); // 0
colors.green('#05060708'); // 7
```

### green(color, options)

**`6.3.0`** **`Overload 2/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **options** &#123;&#123;
    - [ max = `255` ]?: `1` | `255` - 范围最大值
- &#125;&#125; - 选项参数
- <ins>**returns**</ins> { [IntRange[0..1]](../types/data-types.md#intrange) | [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `G (green)` 分量.

取值范围 `[0..1]` (`options.max` 为 `1`) 或 `[0..255]` (`options.max` 为 `255` 或不指定).

```js
colors.green('#663399', { max: 1 }); // 0.2
colors.green('#663399', { max: 255 }); // 51
colors.green('#663399'); /* 同上. */
```

当 `options.max` 为 `1` 时, 相当于 [colors.greenDouble](#m-greendouble) 方法.

## [m] greenDouble

### greenDouble(color)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [Range[0..1]](../types/data-types.md#range) }

获取颜色的 `G (green)` 分量, 取值范围 `[0..1]`.

相当于 `colors.green(color, { max: 1 })`.

```js
colors.greenDouble('#663399'); // 0.2
```

## [m] getGreen

### getGreen(color)

**`6.3.0`** **`Overload 1/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `G (green)` 分量, 取值范围 `[0..255]`.

[colors.green(color)](#m-green) 的别名方法.

## [m] setGreenRelative

### setGreenRelative(color, percentage)

**`6.3.1`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **percentage** { [ColorComponent](../types/data-types.md#colorcomponent) } - 相对百分数
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

针对 `G (green)` 分量设置其相对百分比, 返回新颜色的颜色整数.

如当前颜色 `G (green)` 分量为 `80`, 希望设置 `G` 分量为 `50%` 相对量, 即 `40`:

```js
colors.setGreenRelative(color, 0.5);
colors.setGreenRelative(color, '50%'); /* 效果同上. */
```

同样地, 如希望设置 `G` 分量为 `1.5` 倍相对量, 即 `120`:

```js
colors.setGreenRelative(color, 1.5);
colors.setGreenRelative(color, '150%');
```

当设置的相对量超过 `255` 时, 将以 `255` 为最终值:

```js
colors.setGreenRelative(color, 10); /* G 分量最终值为 255, 而非 800. */
```

特别地, 当原本颜色的 `G` 分量为 `0` 时, 无论如何设置相对量, `G` 分量均保持 `0` 值.

### getGreen(color, options)

**`6.3.0`** **`Overload 2/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **options** &#123;&#123;
    - [ max = `255` ]?: `1` | `255` - 范围最大值
- &#125;&#125; - 选项参数
- <ins>**returns**</ins> { [IntRange[0..1]](../types/data-types.md#intrange) | [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `G (green)` 分量.

[colors.green(color, options)](#m-green) 的别名方法.

## [m] getGreenDouble

### getGreenDouble(color)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [Range[0..1]](../types/data-types.md#range) }

获取颜色的 `G (green)` 分量, 取值范围 `[0..1]`.

[colors.greenDouble(color)](#m-greendouble) 的别名方法.

## [m] setGreen

### setGreen(color, green)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **green** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - G (green)
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

设置颜色的 `G (green)` 分量, 返回新颜色的颜色整数.

```js
colors.toHex(colors.setGreen('#663399', 0x80)); // #668099
colors.toHex(colors.setGreen('#663399', 0.5)); /* 同上, 0.5 解析为百分数分量, 即 50%. */

colors.toHex(colors.setGreen('#663399', 255)); // #66FF99
colors.toHex(colors.setGreen('#663399', 1)); /* #660199, 不同上. 1 默认作为整数分量, 而非 100%. */
```

## [m] removeGreen

### removeGreen(color)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

去除颜色的 `G (green)` 分量, 返回新颜色的颜色整数.

```js
colors.toHex(colors.removeGreen('#BE663399')); // #BE660099
colors.toHex(colors.removeGreen('#CC5500')); // #CC0000
````

相当于 `colors.setGreen(color, 0)`.

## [m] blue

### blue(color)

**`Overload 1/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `B (blue)` 分量, 取值范围 `[0..255]`.

```js
colors.blue('#663399'); // 153
colors.blue(colors.TRANSPARENT); // 0
colors.blue('#05060708'); // 8
```

### blue(color, options)

**`6.3.0`** **`Overload 2/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **options** &#123;&#123;
    - [ max = `255` ]?: `1` | `255` - 范围最大值
- &#125;&#125; - 选项参数
- <ins>**returns**</ins> { [IntRange[0..1]](../types/data-types.md#intrange) | [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `B (blue)` 分量.

取值范围 `[0..1]` (`options.max` 为 `1`) 或 `[0..255]` (`options.max` 为 `255` 或不指定).

```js
colors.blue('#663399', { max: 1 }); // 0.6
colors.blue('#663399', { max: 255 }); // 153
colors.blue('#663399'); /* 同上. */
```

当 `options.max` 为 `1` 时, 相当于 [colors.blueDouble](#m-bluedouble) 方法.

## [m] blueDouble

### blueDouble(color)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [Range[0..1]](../types/data-types.md#range) }

获取颜色的 `A (blue)` 分量, 取值范围 `[0..1]`.

相当于 `colors.blue(color, { max: 1 })`.

```js
colors.blueDouble('#663399'); // 0.6
```

## [m] getBlue

### getBlue(color)

**`6.3.0`** **`Overload 1/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `B (blue)` 分量, 取值范围 `[0..255]`.

[colors.blue(color)](#m-blue) 的别名方法.

### getBlue(color, options)

**`6.3.0`** **`Overload 2/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **options** &#123;&#123;
    - [ max = `255` ]?: `1` | `255` - 范围最大值
- &#125;&#125; - 选项参数
- <ins>**returns**</ins> { [IntRange[0..1]](../types/data-types.md#intrange) | [IntRange[0..255]](../types/data-types.md#intrange) }

获取颜色的 `B (blue)` 分量.

[colors.blue(color, options)](#m-blue) 的别名方法.

## [m] getBlueDouble

### getBlueDouble(color)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [Range[0..1]](../types/data-types.md#range) }

获取颜色的 `A (blue)` 分量, 取值范围 `[0..1]`.

[colors.blueDouble(color)](#m-bluedouble) 的别名方法.

## [m] setBlue

### setBlue(color, blue)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **blue** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - B (blue)
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

设置颜色的 `B (blue)` 分量, 返回新颜色的颜色整数.

```js
colors.toHex(colors.setBlue('#663399', 0x80)); // #663380
colors.toHex(colors.setBlue('#663399', 0.5)); /* 同上, 0.5 解析为百分数分量, 即 50%. */

colors.toHex(colors.setBlue('#663399', 255)); // #6633FF
colors.toHex(colors.setBlue('#663399', 1)); /* #663301, 不同上. 1 默认作为整数分量, 而非 100%. */
```

## [m] setBlueRelative

### setBlueRelative(color, percentage)

**`6.3.1`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **percentage** { [ColorComponent](../types/data-types.md#colorcomponent) } - 相对百分数
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

针对 `B (blue)` 分量设置其相对百分比, 返回新颜色的颜色整数.

如当前颜色 `B (blue)` 分量为 `80`, 希望设置 `B` 分量为 `50%` 相对量, 即 `40`:

```js
colors.setBlueRelative(color, 0.5);
colors.setBlueRelative(color, '50%'); /* 效果同上. */
```

同样地, 如希望设置 `B` 分量为 `1.5` 倍相对量, 即 `120`:

```js
colors.setBlueRelative(color, 1.5);
colors.setBlueRelative(color, '150%');
```

当设置的相对量超过 `255` 时, 将以 `255` 为最终值:

```js
colors.setBlueRelative(color, 10); /* B 分量最终值为 255, 而非 800. */
```

特别地, 当原本颜色的 `B` 分量为 `0` 时, 无论如何设置相对量, `B` 分量均保持 `0` 值.

## [m] removeBlue

### removeBlue(color)

**`6.3.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

去除颜色的 `B (blue)` 分量, 返回新颜色的颜色整数.

```js
colors.toHex(colors.removeBlue('#BE663399')); // #BE663300
colors.toHex(colors.removeBlue('#CC5500')); // #CC5500
````

相当于 `colors.setBlue(color, 0)`.

## [m] rgb

### rgb(color)

**`[6.2.0]`** **`Overload 1/3`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

获取 `color` 参数对应的 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

`color` 参数为颜色代码时, 支持情况如下:

| 格式        | 备注              |
|-----------|-----------------|
| #RRGGBB   | 正常              |
| #RGB      | 正常              |
| #AARRGGBB | A (alpha) 分量被忽略 |

方法调用结果的 `A (alpha)` 分量恒为 `255`, 意味着 `color` 参数中的 `A` 分量信息将被忽略.

```js
colors.rgb('#663399');
colors.rgb('#DE663399'); /* 同上, A 分量被忽略. */
```

### rgb(red, green, blue)

**`6.2.0`** **`Overload 2/3`**

- **red** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - R (red)
- **green** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - G (green)
- **blue** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - B (blue)
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量](../types/data-types.md#colorcomponent) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.rgb(255, 128, 9);
colors.rgb(0xFF, 0x80, 0x09); /* 同上. */
colors.rgb('#FF8009'); /* 同上. */
colors.rgb(1, 0.5, '3.53%'); /* 同上. */
```

### rgb(components)

**`6.2.0`** **`Overload 3/3`**

- **components** { [ColorComponents](../types/data-types.md#colorcomponents)[[]](../types/data-types.md#array) } - 颜色分量数组
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量数组](../types/data-types.md#colorcomponents) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.rgb([ 255, 128, 9 ]);
colors.rgb([ 0xFF, 0x80, 0x09 ]); /* 同上. */
colors.rgb([ 1, 0.5, '3.53%' ]); /* 同上. */
```

## [m] argb

### argb(colorHex)

**`[6.2.0]`** **`Overload 1/3`**

- **colorHex** { [string](../types/data-types.md#string) } - 颜色代码
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

获取 `colorHex` 颜色代码对应的 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

| 格式        | 备注                 |
|-----------|--------------------|
| #RRGGBB   | A (alpha) 分量为 0xFF |
| #RGB      | A (alpha) 分量为 0xFF |
| #AARRGGBB | -                  |

```js
colors.argb('#663399'); /* 相当于 argb('#FF663399') . */
colors.argb('#DE663399'); /* 结果不同上. */
```

### argb(alpha, red, green, blue)

**`6.2.0`** **`Overload 2/3`**

- **alpha** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - A (alpha)
- **red** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - R (red)
- **green** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - G (green)
- **blue** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - B (blue)
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量](../types/data-types.md#colorcomponent) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.argb(64, 255, 128, 9);
colors.argb(0x40, 0xFF, 0x80, 0x09); /* 同上. */
colors.argb('#40FF8009'); /* 同上. */
colors.argb(0.25, 1, 0.5, '3.53%'); /* 同上. */
```

### argb(components)

**`6.2.0`** **`Overload 3/3`**

- **components** { [ColorComponents](../types/data-types.md#colorcomponents)[[]](../types/data-types.md#array) } - 颜色分量数组
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量数组](../types/data-types.md#colorcomponents) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.argb([ 64, 255, 128, 9 ]);
colors.argb([ 0x40, 0xFF, 0x80, 0x09 ]); /* 同上. */
colors.argb([ 0.25, 1, 0.5, '3.53%' ]); /* 同上. */
```

## [m] rgba

### rgba(colorHex)

**`[6.2.0]`** **`Overload 1/3`**

- **colorHex** { [string](../types/data-types.md#string) } - 颜色代码
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

获取 `colorHex` 颜色代码对应的 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

| 格式        | 备注                 |
|-----------|--------------------|
| #RRGGBB   | A (alpha) 分量为 0xFF |
| #RGB      | A (alpha) 分量为 0xFF |
| #RRGGBBAA | -                  |

```js
colors.rgba('#663399'); /* 相当于 rgba('#663399FF') . */
colors.rgba('#663399FF'); /* 结果同上. */
colors.rgba('#FF663399'); /* 结果不同上. */
```

注意区分 `colors.rgba` 与 `colors.argb`:

```js
colors.rgba('#11335577'); /* A (alpha) 分量为 0x77 . */
colors.argb('#11335577'); /* A (alpha) 分量为 0x11 . */
```

### rgba(red, green, blue, alpha)

**`6.2.0`** **`Overload 2/3`**

- **red** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - R (red)
- **green** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - G (green)
- **blue** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - B (blue)
- **alpha** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - A (alpha)
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量](../types/data-types.md#colorcomponent) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.rgba(255, 128, 9, 64);
colors.rgba(0xFF, 0x80, 0x09, 0x40); /* 同上. */
colors.rgba('#FF800940'); /* 同上. */
colors.rgba(1, 0.5, '3.53%', 0.25); /* 同上. */
```

### rgba(components)

**`6.2.0`** **`Overload 3/3`**

- **components** { [ColorComponents](../types/data-types.md#colorcomponents)[[]](../types/data-types.md#array) } - 颜色分量数组
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量数组](../types/data-types.md#colorcomponents) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.rgba([ 255, 128, 9, 64 ]);
colors.rgba([ 0xFF, 0x80, 0x09, 0x40 ]); /* 同上. */
colors.rgba([ 1, 0.5, '3.53%', 0.25 ]); /* 同上. */
```

## [m] hsv

### hsv(hue, saturation, value)

**`6.2.0`** **`Overload 1/2`**

- **hue** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - H (hue)
- **saturation** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - S (saturation)
- **value** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - V (value)
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量](../types/data-types.md#colorcomponent) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.hsv(90, 80, 64);
colors.hsv(90, 0.8, 0.64); /* 同上. */
colors.hsv(0.25, 0.8, 0.64); /* 同上. */
colors.hsv('25%', '80%', '64%'); /* 同上. */
```

### hsv(components)

**`6.2.0`** **`Overload 2/2`**

- **components** { [ColorComponents](../types/data-types.md#colorcomponents)[[]](../types/data-types.md#array) } - 颜色分量数组
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量数组](../types/data-types.md#colorcomponents) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.hsv([ 90, 80, 64 ]);
colors.hsv([ 90, 0.8, 0.64 ]); /* 同上. */
colors.hsv([ 0.25, 0.8, 0.64 ]); /* 同上. */
colors.hsv([ '25%', '80%', '64%' ]); /* 同上. */
```

## [m] hsva

### hsva(hue, saturation, value, alpha)

**`6.2.0`** **`Overload 1/2`**

- **hue** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - H (hue)
- **saturation** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - S (saturation)
- **value** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - V (value)
- **alpha** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - A (alpha)
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量](../types/data-types.md#colorcomponent) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.hsva(90, 80, 64, 64);
colors.hsva(90, 0.8, 0.64, 0.25); /* 同上. */
colors.hsva(0.25, 0.8, 0.64, 0.25); /* 同上. */
colors.hsva('25%', '80%', '64%', '25%'); /* 同上. */
```

### hsva(components)

**`6.2.0`** **`Overload 2/2`**

- **components** { [ColorComponents](../types/data-types.md#colorcomponents)[[]](../types/data-types.md#array) } - 颜色分量数组
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量数组](../types/data-types.md#colorcomponents) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.hsva([ 90, 80, 64, 64 ]);
colors.hsva([ 90, 0.8, 0.64, 0.25 ]); /* 同上. */
colors.hsva([ 0.25, 0.8, 0.64, 0.25 ]); /* 同上. */
colors.hsva([ '25%', '80%', '64%', '25%' ]); /* 同上. */
```

## [m] hsl

### hsl(hue, saturation, lightness)

**`6.2.0`** **`Overload 1/2`**

- **hue** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - H (hue)
- **saturation** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - S (saturation)
- **lightness** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - L (lightness)
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量](../types/data-types.md#colorcomponent) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.hsl(90, 80, 64);
colors.hsl(90, 0.8, 0.64); /* 同上. */
colors.hsl(0.25, 0.8, 0.64); /* 同上. */
colors.hsl('25%', '80%', '64%'); /* 同上. */
```

### hsl(components)

**`6.2.0`** **`Overload 2/2`**

- **components** { [ColorComponents](../types/data-types.md#colorcomponents)[[]](../types/data-types.md#array) } - 颜色分量数组
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量数组](../types/data-types.md#colorcomponents) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.hsl([ 90, 80, 64 ]);
colors.hsl([ 90, 0.8, 0.64 ]); /* 同上. */
colors.hsl([ 0.25, 0.8, 0.64 ]); /* 同上. */
colors.hsl([ '25%', '80%', '64%' ]); /* 同上. */
```

## [m] hsla

### hsla(hue, saturation, lightness, alpha)

**`6.2.0`** **`Overload 1/2`**

- **hue** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - H (hue)
- **saturation** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - S (saturation)
- **lightness** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - L (lightness)
- **alpha** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - A (alpha)
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量](../types/data-types.md#colorcomponent) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.hsla(90, 80, 64, 64);
colors.hsla(90, 0.8, 0.64, 0.25); /* 同上. */
colors.hsla(0.25, 0.8, 0.64, 0.25); /* 同上. */
colors.hsla('25%', '80%', '64%', '25%'); /* 同上. */
```

### hsla(components)

**`6.2.0`** **`Overload 2/2`**

- **components** { [ColorComponents](../types/data-types.md#colorcomponents)[[]](../types/data-types.md#array) } - 颜色分量数组
- <ins>**returns**</ins> { [ColorInt](../types/data-types.md#colorint) }

通过 [颜色分量数组](../types/data-types.md#colorcomponents) 获取 [颜色整数 (ColorInt)](../types/data-types.md#colorint).

```js
colors.hsla([ 90, 80, 64, 64 ]);
colors.hsla([ 90, 0.8, 0.64, 0.25 ]); /* 同上. */
colors.hsla([ 0.25, 0.8, 0.64, 0.25 ]); /* 同上. */
colors.hsla([ '25%', '80%', '64%', '25%' ]); /* 同上. */
```

## [m] toRgb

### toRgb(color)

**`6.2.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorComponents](../types/data-types.md#colorcomponents) } - 颜色分量数组

获取颜色参数的 RGB [颜色分量数组](../types/data-types.md#colorcomponents).

```js
let [ r, g, b ] = colors.toRgb('#663399');
console.log(`R: ${r}, G: ${g}, B: ${b}`);
```

## [m] toRgba

### toRgba(color)

**`6.2.0`** **`Overload 1/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorComponents](../types/data-types.md#colorcomponents) } - 颜色分量数组

获取颜色参数的 RGBA [颜色分量数组](../types/data-types.md#colorcomponents).

```js
let [ r, g, b, a ] = colors.toRgba('#DE663399');
console.log(`R: ${r}, G: ${g}, B: ${b}, A: ${a}`);
```

需留意上述示例的参数格式为 `#AARRGGBB`, 结果格式为 `[RR, GG, BB, AA]`.

### toRgba(color, options)

**`6.3.0`** **`Overload 2/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **options** &#123;&#123;
    - [ maxAlpha = `255` ]?: `1` | `255` - A (alpha) 分量的范围最大值
- &#125;&#125; - 选项参数
- <ins>**returns**</ins> { [ColorComponents](../types/data-types.md#colorcomponents) } - 颜色分量数组

根据 `options` 选项参数获取颜色参数的 RGBA [颜色分量数组](../types/data-types.md#colorcomponents).

```js
let [ r1, g1, b1, a1 ] = colors.toRgba('#DE663399');
console.log(`R: ${r1}, G: ${g1}, B: ${b1}, A: ${a1}`); /* A 分量范围为 [0..255] . */

let [ r2, g2, b2, a2 ] = colors.toRgba('#DE663399', { maxAlpha: 1 });
console.log(`R: ${r2}, G: ${g2}, B: ${b2}, A: ${a2}`); /* A 分量范围为 [0..1] . */
```

## [m] toArgb

### toArgb(color)

**`6.2.0`** **`Overload 1/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorComponents](../types/data-types.md#colorcomponents) } - 颜色分量数组

获取颜色参数的 ARGB [颜色分量数组](../types/data-types.md#colorcomponents).

```js
let [ a, r, g, b ] = colors.toArgb('#DE663399');
console.log(`A: ${a}, R: ${r}, G: ${g}, B: ${b}`);
```

### toArgb(color, options)

**`6.3.0`** **`Overload 2/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **options** &#123;&#123;
    - [ maxAlpha = `255` ]?: `1` | `255` - A (alpha) 分量的范围最大值
- &#125;&#125; - 选项参数
- <ins>**returns**</ins> { [ColorComponents](../types/data-types.md#colorcomponents) } - 颜色分量数组

根据 `options` 选项参数获取颜色参数的 ARGB [颜色分量数组](../types/data-types.md#colorcomponents).

```js
let [ a1, r1, g1, b1 ] = colors.toArgb('#DE663399');
console.log(`A: ${a1}, R: ${r1}, G: ${g1}, B: ${b1}`); /* A 分量范围为 [0..255] . */

let [ a2, r2, g2, b2 ] = colors.toArgb('#DE663399', { maxAlpha: 1 });
console.log(`A: ${a2}, R: ${r2}, G: ${g2}, B: ${b2}`); /* A 分量范围为 [0..1] . */
```

## [m] toHsv

### toHsv(color)

**`6.2.0`** **`Overload 1/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorComponents](../types/data-types.md#colorcomponents) } - 颜色分量数组

获取颜色参数的 HSV [颜色分量数组](../types/data-types.md#colorcomponents).

```js
let [ h, s, v ] = colors.toHsv('#663399');
console.log(`H: ${h}, S: ${s}, V: ${v}`);
```

### toHsv(red, green, blue)

**`6.2.0`** **`Overload 2/2`**

- **red** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - R (red)
- **green** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - G (green)
- **blue** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - B (blue)
- <ins>**returns**</ins> { [ColorComponents](../types/data-types.md#colorcomponents) } - 颜色分量数组

获取颜色参数的 HSV [颜色分量数组](../types/data-types.md#colorcomponents).

```js
let [ h, s, v ] = colors.toHsv(102, 51, 153);
console.log(`H: ${h}, S: ${s}, V: ${v}`);
```

## [m] toHsva

### toHsva(color)

**`6.2.0`** **`Overload 1/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorComponents](../types/data-types.md#colorcomponents) } - 颜色分量数组

获取颜色参数的 HSVA [颜色分量数组](../types/data-types.md#colorcomponents).

其中 A (alpha) 分量范围恒为 `[0..1]`.

```js
let [ h, s, v, a ] = colors.toHsva('#BF663399');
console.log(`H: ${h}, S: ${s}, V: ${v}, A: ${a}`);
```

### toHsva(red, green, blue, alpha)

**`6.2.0`** **`Overload 2/2`**

- **red** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - R (red)
- **green** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - G (green)
- **blue** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - B (blue)
- **alpha** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - A (alpha)
- <ins>**returns**</ins> { [ColorComponents](../types/data-types.md#colorcomponents) } - 颜色分量数组

获取颜色参数的 HSVA [颜色分量数组](../types/data-types.md#colorcomponents).

其中 A (alpha) 分量范围恒为 `[0..1]`.

```js
let [ h, s, v, a ] = colors.toHsva(102, 51, 153, 191);
console.log(`H: ${h}, S: ${s}, V: ${v}, A: ${a}`);
```

## [m] toHsl

### toHsl(color)

**`6.2.0`** **`Overload 1/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorComponents](../types/data-types.md#colorcomponents) } - 颜色分量数组

获取颜色参数的 HSL [颜色分量数组](../types/data-types.md#colorcomponents).

```js
let [ h, s, l ] = colors.toHsl('#663399');
console.log(`H: ${h}, S: ${s}, L: ${l}`);
```

### toHsl(red, green, blue)

**`6.2.0`** **`Overload 2/2`**

- **red** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - R (red)
- **green** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - G (green)
- **blue** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - B (blue)
- <ins>**returns**</ins> { [ColorComponents](../types/data-types.md#colorcomponents) } - 颜色分量数组

获取颜色参数的 HSL [颜色分量数组](../types/data-types.md#colorcomponents).

```js
let [ h, s, l ] = colors.toHsl(102, 51, 153);
console.log(`H: ${h}, S: ${s}, L: ${l}`);
```

## [m] toHsla

### toHsla(color)

**`6.2.0`** **`Overload 2/2`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [ColorComponents](../types/data-types.md#colorcomponents) } - 颜色分量数组

获取颜色参数的 HSLA [颜色分量数组](../types/data-types.md#colorcomponents).

其中 A (alpha) 分量范围恒为 `[0..1]`.

```js
let [ h, s, l, a ] = colors.toHsla('#BF663399');
console.log(`H: ${h}, S: ${s}, L: ${l}, A: ${a}`);
```

### toHsla(red, green, blue, alpha)

**`6.2.0`** **`Overload 1/2`**

- **red** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - R (red)
- **green** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - G (green)
- **blue** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - B (blue)
- **alpha** { [ColorComponent](../types/data-types.md#colorcomponent) } - 颜色分量 - A (alpha)
- <ins>**returns**</ins> { [ColorComponents](../types/data-types.md#colorcomponents) } - 颜色分量数组

获取颜色参数的 HSLA [颜色分量数组](../types/data-types.md#colorcomponents).

其中 A (alpha) 分量范围恒为 `[0..1]`.

```js
let [ h, s, l, a ] = colors.toHsla(102, 51, 153, 191);
console.log(`H: ${h}, S: ${s}, L: ${l}, A: ${a}`);
```

## [m] isSimilar

### isSimilar(colorA, colorB, threshold?, algorithm?)

**`[6.2.0]`** **`Overload [1-3]/4`**

- **colorA** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **colorB** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **[ threshold = `4` ]** { [IntRange[0..255]](../types/data-types.md#intrange) } - [颜色匹配阈值](../../reference/glossaries/glossary.md#颜色匹配阈值)
- **[ algorithm = `'diff'` ]** { [ColorDetectionAlgorithm](../types/data-types.md#colordetectionalgorithm) } - 颜色检测算法
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 两个颜色是否相似

判断两个颜色是否相似.

不同阈值对结果的影响 (阈值越高, 条件越宽松, 阈值越低, 条件越严格):

```js
colors.isSimilar('orange', 'dark-orange', 5); /* false, 阈值较小, 条件相对严格. */
colors.isSimilar('orange', 'dark-orange', 10); /* true, 阈值增大, 条件趋于宽松. */
```

不同 [颜色检测算法](../types/data-types.md#colordetectionalgorithm) 对结果的影响:

```js
colors.isSimilar('orange', 'dark-orange', 9, 'rgb+'); // false
colors.isSimilar('orange', 'dark-orange', 9, 'diff'); // true
colors.isSimilar('orange', 'dark-orange', 9, 'hs'); // true

colors.isSimilar('orange', 'dark-orange', 8, 'rgb+'); // false
colors.isSimilar('orange', 'dark-orange', 8, 'diff'); // false
colors.isSimilar('orange', 'dark-orange', 8, 'hs'); // true
```

### isSimilar(colorA, colorB, options)

**`6.2.0`** **`Overload 4/4`**

- **colorA** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **colorB** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **options** &#123;&#123;
    - [ similarity ≈ `0.9843` ]?: [Range[0..1]](../types/data-types.md#range) - [颜色匹配相似度](../../reference/glossaries/glossary.md#相似度)
    - [ threshold = `4` ]?: [IntRange[0..255]](../types/data-types.md#intrange) - [颜色匹配阈值](../../reference/glossaries/glossary.md#颜色匹配阈值)
    - [ algorithm = `'diff'` ]?: [ColorDetectionAlgorithm](../types/data-types.md#colordetectionalgorithm) - 颜色检测算法
- &#125;&#125; - 选项参数
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 两个颜色是否相似

判断两个颜色是否相似.

此方法将非必要参数集中于 `options` 对象中.

```js
colors.isSimilar('#010101', '#020202', { similarity: 0.95 }); // true
```

## [m] isEqual

### isEqual(colorA, colorB, thresholdOrOptions?)

**`6.2.0`** **`Overload[1-2]/2`**

- **colorA** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **colorB** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- **[ thresholdOrOptions ]** { [number](../types/data-types.md#number) | [object](../types/data-types.md#object) } - 与 `isSimilar` 相同的阈值或选项对象，可包含 `threshold`、`similarity`、`algorithm`
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 两个颜色是否通过相似度检测

当前 6.7.0 实现使用与 `colors.isSimilar` 相同的颜色检测器：省略第三个参数时阈值为 `4`、算法为 `diff`；传入数字时将其作为阈值，传入对象时可使用 `threshold`、`similarity` 和 `algorithm`。检测只比较 `R/G/B` 分量，`A (alpha)` 不参与比较。该入口名称虽为 `isEqual`，并不保证逐通道精确相等；需要精确比较时应使用 `Color(...).equals(...)` 或 `images.isEqual(...)`（按适用类型）。

```js
/* Hex 代码. */
colors.isEqual('#FF0000', '#FF0000'); // true
colors.isEqual('#FF0000', '#F00'); /* 同上, 三位数简写形式. */
/* 颜色整数. */
colors.isEqual(-65536, 0xFF0000); // true
/* 颜色名称. */
colors.isEqual('red', 'RED'); /* true, 不区分大小写. */
colors.isEqual('orange', 'Orange'); /* true, 不区分大小写. */
colors.isEqual('dark-gray', 'DARK_GRAY'); /* true, 连字符与下划线均被支持. */
/* 不同类型比较. */
colors.isEqual('red', '#FF0000'); // true
colors.isEqual('orange', '#FFA500'); // true
/* A (alpha) 分量的不同情况. */
colors.isEqual('#A1FF0000', '#A2FF0000'); /* true, RGB 相同且默认忽略 A 分量. */
colors.isEqual('#FF0000', '#FB0000', 4); /* true, diff 阈值为 4. */
colors.isEqual('#FF0000', '#FB0000', 0); /* false, 要求完全相同的 RGB. */
```

## [m] equals

### equals(colorA, colorB)

**`DEPRECATED`**

- **colorA** { [number](../types/data-types.md#number) | [string](../types/data-types.md#string) } - 颜色参数
- **colorB** { [number](../types/data-types.md#number) | [string](../types/data-types.md#string) } - 颜色参数
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 两个颜色是否相等 (忽略 `A (alpha)` 分量)

判断两个颜色是否相等, 比较时忽略 `A (alpha)` 分量:

```js
/* Hex 代码. */
colors.equals('#FF0000', '#FF0000'); // true
/* 颜色整数. */
colors.equals(-65536, 0xFF0000); // true
/* 颜色名称. */
colors.equals('red', 'RED'); // true
/* 不同类型比较. */
colors.equals('red', '#FF0000'); // true
/* A (alpha) 分量将被忽略. */
colors.equals('#A1FF0000', '#A2FF0000'); // true
```

但以下示例将全部抛出异常:

```js
colors.equals('orange', '#FFA500'); /* 抛出异常. */
colors.equals('dark-gray', '#444'); /* 抛出异常. */
colors.equals('#FF0000', '#F00'); /* 抛出异常. */
```

上述示例对于 [colors.isEqual](#m-isequal) 则全部返回 `true`。

除非需要考虑多版本兼容，否则建议始终使用 `colors.isEqual` 替代 `colors.equals`。

## [m] luminance

### luminance(color)

**`6.2.0`**

- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [Range[0..1]](../types/data-types.md#range) } - 颜色亮度

获取颜色的 [亮度 (Luminance)](../../reference/glossaries/glossary.md#luminance), 取值范围 `[0..1]`.

```js
colors.luminance(colors.WHITE); // 1
colors.luminance(colors.BLACK); // 0
colors.luminance(colors.RED); // 0.2126
colors.luminance(colors.GREEN); // 0.7152
colors.luminance(colors.BLUE); // 0.0722
colors.luminance(colors.YELLOW); // 0.9278
```

> 参阅: [W3C Wiki](https://www.w3.org/WAI/GL/wiki/Relative_luminance)

## [m] toColorStateList

### toColorStateList(...color)

**`6.2.0`**

- **color** { [...](../../project/about.md#可变参数)[OmniColor](../types/omni-types.md#omnicolor)[[]](../../project/about.md#可变参数) } - 颜色参数
- <ins>**returns**</ins> { [android.content.res.ColorStateList](https://developer.android.com/reference/android/content/res/ColorStateList) }

将一个或多个颜色参数转换为 ColorStateList 实例.

```js
colors.toColorStateList('red'); /* 包含单一颜色的 ColorStateList. */
colors.toColorStateList('red', 'green', 'orange'); /* 包含多个颜色的 ColorStateList. */
```

## [m] setPaintColor

### setPaintColor(paint, color)

**`6.2.0`**

- **paint** { [android.graphics.Paint](https://developer.android.com/reference/android/graphics/Paint) } - 画笔参数
- **color** { [OmniColor](../types/omni-types.md#omnicolor) } - 颜色参数
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

方法 `setPaintColor` 用于解决在 `Android API 29 (10) [Q]` 及以上系统中 `Paint#setColor(color)` 无法正常设置画笔颜色的问题.

```js
let paint = new android.graphics.Paint();

/* 安卓 10 及以上系统无法正常设置颜色. */
// paint.setColor(colors.toInt('blue'));

/* 使用 colors 模块实现原始功能. */
colors.setPaintColor(paint, 'blue');
```

画笔无法正常设置颜色的原因, 是 `Android API 29 (10) [Q]` 源码中 `setColor` 有以下两种方法签名:

```text
setColor(@ColorInt int color): void
setColor(@ColorLong long color): void
```

JavaScript 语言不区分 `int` 和 `long`, 即只有 `setColor(color: number)`,<br>
它会优先匹配 Java 的 `setColor(@ColorLong long color): void`.

`ColorLong` 颜色与 `ColorInt` 颜色不同在于, 前者包含了额外的 `ColorSpace` (颜色空间) 信息,<br>
原有的 `ColorInt` 被当做 `ColorLong` 来解析, 导致颜色解析异常.

除上述 `colors.setPaintColor` 的方法外, 还有其他一些解决方案:

```js
/* A. 使用 paint.setArgb 方法. */
paint.setARGB(
    colors.alpha(color),
    colors.red(color),
    colors.green(color),
    colors.blue(color),
);

/* 同上, 语法更简洁. */
paint.setARGB.apply(paint, colors.toArgb(color));

/* B. 将 ColorInt "打包" 为 ColorLong. */
paint.setColor(android.graphics.Color.pack(colors.toInt(color)));

/* C. 直接使用带 ColorSpace 信息的 ColorLong. */
paint.setColor(android.graphics.Color.pack(
    colors.redDouble(color),
    colors.greenDouble(color),
    colors.blueDouble(color),
    colors.alphaDouble(color),
    android.graphics.ColorSpace.get(android.graphics.ColorSpace.Named.SRGB),
));
```

`colors.setPaintColor` 的大致源码:

```js
function setPaintColor(paint, color) {
    if (util.version.sdkInt >= util.versionCodes.Q) {
        paint.setARGB.apply(paint, colors.toArgb(color));
    } else {
        paint.setColor(colors.toInt(color));
    }
}
```

## [p+] android

**`6.2.0`**

[Android 颜色列表](../../reference/color-table.md#android-颜色列表) 对象.

## [p+] css

**`6.2.0`**

[Css 颜色列表](../../reference/color-table.md#css-颜色列表) 对象.

## [p+] web

**`6.2.0`**

[Web 颜色列表](../../reference/color-table.md#web-颜色列表) 对象.

## [p+] material

**`6.2.0`**

[Material 颜色列表](../../reference/color-table.md#material-颜色列表) 对象.

## [p] BLACK

**`CONSTANT`**

- [ `-16777216` ] { [number](../types/data-types.md#number) }

<span style="color: #000000">◑</span> 黑 (`#000000` `rgb(0,0,0`) 的颜色整数.

## [p] BLUE

**`CONSTANT`**

- [ `-16776961` ] { [number](../types/data-types.md#number) }

<span style="color: #0000FF">◑</span> 蓝 (`#0000FF` `rgb(0,0,255`) 的颜色整数.

## [p] CYAN

**`CONSTANT`**

- [ `-16711681` ] { [number](../types/data-types.md#number) }

<span style="color: #00FFFF">◑</span> 青 (`#00FFFF` `rgb(0,255,255`) 的颜色整数.

## [p] AQUA

**`6.2.0`** **`CONSTANT`**

- [ `-16711681` ] { [number](../types/data-types.md#number) }

<span style="color: #00FFFF">◑</span> 青 (`#00FFFF` `rgb(0,255,255`) 的颜色整数.

## [p] DARK_GRAY

**`6.2.0`** **`CONSTANT`**

- [ `-12303292` ] { [number](../types/data-types.md#number) }

<span style="color: #444444">◑</span> 暗灰 (`#444444` `rgb(68,68,68`) 的颜色整数.

## [p] DARK_GREY

**`6.2.0`** **`CONSTANT`**

- [ `-12303292` ] { [number](../types/data-types.md#number) }

<span style="color: #444444">◑</span> 暗灰 (`#444444` `rgb(68,68,68`) 的颜色整数.

## [p] DKGRAY

**`CONSTANT`**

- [ `-12303292` ] { [number](../types/data-types.md#number) }

<span style="color: #444444">◑</span> 暗灰 (`#444444` `rgb(68,68,68`) 的颜色整数.

## [p] GRAY

**`CONSTANT`**

- [ `-7829368` ] { [number](../types/data-types.md#number) }

<span style="color: #888888">◑</span> 灰 (`#888888` `rgb(136,136,136`) 的颜色整数.

## [p] GREY

**`6.2.0`** **`CONSTANT`**

- [ `-7829368` ] { [number](../types/data-types.md#number) }

<span style="color: #888888">◑</span> 灰 (`#888888` `rgb(136,136,136`) 的颜色整数.

## [p] GREEN

**`CONSTANT`**

- [ `-16711936` ] { [number](../types/data-types.md#number) }

<span style="color: #00FF00">◑</span> 绿 (`#00FF00` `rgb(0,255,0`) 的颜色整数.

## [p] LIME

**`6.2.0`** **`CONSTANT`**

- [ `-16711936` ] { [number](../types/data-types.md#number) }

<span style="color: #00FF00">◑</span> 绿 (`#00FF00` `rgb(0,255,0`) 的颜色整数.

## [p] LIGHT_GRAY

**`6.2.0`** **`CONSTANT`**

- [ `-3355444` ] { [number](../types/data-types.md#number) }

<span style="color: #CCCCCC">◑</span> 亮灰 (`#CCCCCC` `rgb(204,204,204`) 的颜色整数.

## [p] LIGHT_GREY

**`6.2.0`** **`CONSTANT`**

- [ `-3355444` ] { [number](../types/data-types.md#number) }

<span style="color: #CCCCCC">◑</span> 亮灰 (`#CCCCCC` `rgb(204,204,204`) 的颜色整数.

## [p] LTGRAY

**`CONSTANT`**

- [ `-3355444` ] { [number](../types/data-types.md#number) }

<span style="color: #CCCCCC">◑</span> 亮灰 (`#CCCCCC` `rgb(204,204,204`) 的颜色整数.

## [p] MAGENTA

**`CONSTANT`**

- [ `-65281` ] { [number](../types/data-types.md#number) }

<span style="color: #FF00FF">◑</span> 品红 / 洋红 (`#FF00FF` `rgb(255,0,255`) 的颜色整数.

## [p] FUCHSIA

**`6.2.0`** **`CONSTANT`**

- [ `-65281` ] { [number](../types/data-types.md#number) }

<span style="color: #FF00FF">◑</span> 品红 / 洋红 (`#FF00FF` `rgb(255,0,255`) 的颜色整数.

## [p] MAROON

**`6.2.0`** **`CONSTANT`**

- [ `-8388608` ] { [number](../types/data-types.md#number) }

<span style="color: #800000">◑</span> 栗 (`#800000` `rgb(128,0,0`) 的颜色整数.

## [p] NAVY

**`6.2.0`** **`CONSTANT`**

- [ `-16777088` ] { [number](../types/data-types.md#number) }

<span style="color: #000080">◑</span> 海军蓝 / 藏青 (`#000080` `rgb(0,0,128`) 的颜色整数.

## [p] OLIVE

**`6.2.0`** **`CONSTANT`**

- [ `-8355840` ] { [number](../types/data-types.md#number) }

<span style="color: #808000">◑</span> 橄榄 (`#808000` `rgb(128,128,0`) 的颜色整数.

## [p] PURPLE

**`6.2.0`** **`CONSTANT`**

- [ `-8388480` ] { [number](../types/data-types.md#number) }

<span style="color: #800080">◑</span> 紫 (`#800080` `rgb(128,0,128`) 的颜色整数.

## [p] RED

**`CONSTANT`**

- [ `-65536` ] { [number](../types/data-types.md#number) }

<span style="color: #FF0000">◑</span> 红 (`#FF0000` `rgb(255,0,0`) 的颜色整数.

## [p] SILVER

**`6.2.0`** **`CONSTANT`**

- [ `-4144960` ] { [number](../types/data-types.md#number) }

<span style="color: #C0C0C0">◑</span> 银 (`#C0C0C0` `rgb(192,192,192`) 的颜色整数.

## [p] TEAL

**`6.2.0`** **`CONSTANT`**

- [ `-16744320` ] { [number](../types/data-types.md#number) }

<span style="color: #008080">◑</span> 鸭绿 / 凫绿 (`#008080` `rgb(0,128,128`) 的颜色整数.

## [p] WHITE

**`CONSTANT`**

- [ `-1` ] { [number](../types/data-types.md#number) }

<span style="color: #FFFFFF">◑</span> 白 (`#FFFFFF` `rgb(255,255,255`) 的颜色整数.

## [p] YELLOW

**`CONSTANT`**

- [ `-256` ] { [number](../types/data-types.md#number) }

<span style="color: #FFFF00">◑</span> 黄 (`#FFFF00` `rgb(255,255,0)`) 的颜色整数.

## [p] ORANGE

**`6.2.0`** **`CONSTANT`**

- [ `-23296` ] { [number](../types/data-types.md#number) }

<span style="color: #FFA500">◑</span> 橙 (`#FFA500` `rgb(255,165,0)`) 的颜色整数.

## [p] TRANSPARENT

**`CONSTANT`**

- [ `0` ] { [number](../types/data-types.md#number) }

全透明 (`#00000000` `argb(0, 0, 0, 0)`) 的颜色整数.

---

## 融合颜色

下方给出若干代表性融合颜色. 融合颜色属性直接挂载于 colors 对象上, 使用 `colors.Xxx` 的形式访问:

```js
colors.toHex(colors.BLACK); /* 黑色. */
colors.toHex(colors.ORANGE); /* 橙色. */
colors.toHex(colors.PANSY); /* 三色堇紫色. */
colors.toHex(colors.ALIZARIN_CRIMSON); /* 茜红色. */
colors.toHex(colors.PURPLE_300); /* 材料紫色 (300 号). */
```

更多融合颜色, 参阅 [融合颜色列表](../../reference/color-table.md#融合颜色列表) 小节.

---

## MonkeyKing 6.7.0 运行时入口补充

本节记录由 6.7.0 Kotlin 运行时直接导出的入口。上文已有方法的详细颜色转换规则仍然适用；这里补齐模块、构造、动态颜色表和字符串格式化合同。

<a id="api-symbol-bW9kdWxlOmNvbG9ycw"></a>

### `colors` 模块

`colors` 是全局对象，另有 `$colors` 同义入口。它公开颜色转换函数、四张命名颜色表、融合后的直接颜色属性，以及 `all`、`themeColor` 两个 getter。除读取当前主题色和首次构造懒加载颜色表外，本页颜色计算均为同步内存操作，不申请权限。

<a id="api-symbol-ZHluYW1pYzpjb2xvcnMubWVyZ2VkLXRhYmxlLWVudHJpZXM"></a>

### `colors.<COLOR_NAME>` 融合颜色属性

```ts
colors.<COLOR_NAME>: ColorInt
```

运行时把 Android、CSS、Web、Material 颜色表作为 `colors` 的原型链，并直接暴露其中的整数常量，例如 `colors.RED`、`colors.ORANGE_300`。完整名称和值见 [颜色列表](../../reference/color-table.md)。名称冲突按运行时原型链顺序解析；需要明确来源时使用 `colors.android`、`colors.css`、`colors.web` 或 `colors.material`。

```js
console.log(colors.toHex(colors.RED))
console.log(colors.toHex(colors.material.PURPLE_300))
```

<a id="api-symbol-Y29sb3JzLmFsbA"></a>

### `colors.all`

```ts
readonly colors.all: Record<string, ColorInt>
```

首次读取时反射合并四张颜色表并返回 Rhino 对象；同名项以 `android → css → web → material` 中最先出现的值为准。getter 本身标记为不可枚举，但返回对象中的颜色名可枚举。返回对象用于查表；不要把修改它当作更新 `colors.RED` 等运行时属性的方法。

<a id="api-symbol-Y29sb3JzLnRoZW1lQ29sb3I"></a>

### `colors.themeColor`

```ts
readonly colors.themeColor: ThemeColor
```

每次读取都返回 `ThemeColorManager.currentThemeColor`，反映当前 MonkeyKing 主题。它不是固定颜色整数；可传给 `colors.toInt`、`colors.build` 或 `Color(...)` 取得主色。

```js
const primary = colors.toHex(colors.themeColor)
console.log(primary)
```

<a id="api-symbol-Y29sb3JzLnJlZA"></a>

### `colors.red(color, options?)`

```ts
colors.red(color: OmniColor, options?: { max?: 1 | 255 }): number
```

返回红色分量。`max` 缺省或为 `255` 时返回 `0..255`；`max: 1` 时返回 `0..1`。其他 `max` 值抛出 `WrappedIllegalArgumentException`。`colors.getRed` 是同义入口。

<a id="api-symbol-Y29sb3JzLmdyZWVu"></a>

### `colors.green(color, options?)`

```ts
colors.green(color: OmniColor, options?: { max?: 1 | 255 }): number
```

与 `colors.red` 相同，但读取绿色分量。`colors.getGreen` 是同义入口。

<a id="api-symbol-Y29sb3JzLmJsdWU"></a>

### `colors.blue(color, options?)`

```ts
colors.blue(color: OmniColor, options?: { max?: 1 | 255 }): number
```

与 `colors.red` 相同，但读取蓝色分量。`colors.getBlue` 是同义入口。

```js
console.log(colors.red('#336699'))             // 51
console.log(colors.green('#336699', { max: 1 })) // 0.4
console.log(colors.blue('#336699'))            // 153
```

<a id="api-symbol-Y29sb3JzLlJHQlRvSFNW"></a>

### `colors.RGBToHSV(red, green, blue, hsv)`

```ts
colors.RGBToHSV(red: number, green: number, blue: number, hsv: float[]): void
```

直接调用 Android `Color.RGBToHSV`，把结果写入长度至少为 3 的 Java `float[]`：`[hue, saturation, value]`。RGB 分量按 `0..255` 传入；该入口返回无意义的 `void`，应读取输出数组。无效数组和分量遵循 Android API 的异常/归一化行为。

<a id="api-symbol-Y29sb3JzLmNvbG9yVG9IU1Y"></a>

### `colors.colorToHSV(color, hsv)`

```ts
colors.colorToHSV(color: ColorInt, hsv: float[]): void
```

直接调用 Android `Color.colorToHSV`，把颜色整数转换结果写入 Java `float[]`。该低层入口要求真正的 Java 数组；需要普通 JavaScript 数组时优先使用上文 `colors.toHsv(color)`。

<a id="api-symbol-Y29sb3JzLkhTVlRvQ29sb3I"></a>

### `colors.HSVToColor(alpha?, hsv)`

```ts
colors.HSVToColor(hsv: float[]): ColorInt
colors.HSVToColor(alpha: number, hsv: float[]): ColorInt
```

直接调用 Android `Color.HSVToColor`。一参数形式使用完全不透明 alpha；二参数形式的 `alpha` 为 `0..255`。返回 Android ARGB 颜色整数。

```js
const hsv = java.lang.reflect.Array.newInstance(java.lang.Float.TYPE, 3)
colors.RGBToHSV(255, 0, 0, hsv)
console.log(hsv[0], hsv[1], hsv[2])
console.log(colors.toHex(colors.HSVToColor(hsv)))
```

<a id="api-symbol-Y29sb3JzLnRvUmdiU3RyaW5n"></a>

### `colors.toRgbString(colorOrRed, green?, blue?)`

```ts
colors.toRgbString(color: OmniColor): string
colors.toRgbString(red: number, green: number, blue: number): string
```

把分量四舍五入并限制到 `0..255`，返回带逗号和空格的 `rgb(r, g, b)`。

<a id="api-symbol-Y29sb3JzLnRvUmdiYVN0cmluZw"></a>

### `colors.toRgbaString(color, options?)`

```ts
colors.toRgbaString(color: OmniColor, options?: boolean | { keepTrailingZeroForFullAlpha?: boolean }): string
```

返回 `rgba(r, g, b, a)`。alpha 保留一位小数再移除多余零；完全不透明时默认写成 `1.0`。把布尔参数或对象属性 `keepTrailingZeroForFullAlpha` 设为 `false` 可输出 `1`。

<a id="api-symbol-Y29sb3JzLnRvQXJnYlN0cmluZw"></a>

### `colors.toArgbString(color, options?)`

```ts
colors.toArgbString(color: OmniColor, options?: boolean | { keepTrailingZeroForFullAlpha?: boolean }): string
```

与 `toRgbaString` 的格式规则相同，但返回 `argb(a, r, g, b)`。

<a id="api-symbol-Y29sb3JzLnRvSHN2U3RyaW5n"></a>

### `colors.toHsvString(colorOrRed, green?, blue?)`

```ts
colors.toHsvString(color: OmniColor): string
colors.toHsvString(red: number, green: number, blue: number): string
```

返回 `hsv(h, s%, v%)`；色相四舍五入为整数，饱和度和值转换为百分比并最多保留一位小数。

<a id="api-symbol-Y29sb3JzLnRvSHN2YVN0cmluZw"></a>

### `colors.toHsvaString(color, options?)`

```ts
colors.toHsvaString(color: OmniColor, options?: boolean | { keepTrailingZeroForFullAlpha?: boolean }): string
```

返回 `hsva(h, s%, v%, a)`；前三项使用 `toHsvString` 规则，alpha 使用 `toRgbaString` 规则。

<a id="api-symbol-Y29sb3JzLnRvSHNsU3RyaW5n"></a>

### `colors.toHslString(colorOrRed, green?, blue?)`

```ts
colors.toHslString(color: OmniColor): string
colors.toHslString(red: number, green: number, blue: number): string
```

返回 `hsl(h, s%, l%)`；色相四舍五入为整数，饱和度和亮度转换为百分比并最多保留一位小数。

<a id="api-symbol-Y29sb3JzLnRvSHNsYVN0cmluZw"></a>

### `colors.toHslaString(color, options?)`

```ts
colors.toHslaString(color: OmniColor, options?: boolean | { keepTrailingZeroForFullAlpha?: boolean }): string
```

返回 `hsla(h, s%, l%, a)`，格式化规则分别与 `toHslString` 和 `toRgbaString` 相同。

```js
console.log(colors.toRgbString('#80FF0000'))  // rgb(255, 0, 0)
console.log(colors.toRgbaString('#80FF0000')) // rgba(255, 0, 0, 0.5)
console.log(colors.toHsvString('red'))        // hsv(0, 100%, 100%)
console.log(colors.toHslString('red'))        // hsl(0, 100%, 50%)
```

<a id="api-symbol-bW9kdWxlOmNvbG9y"></a>

### `Color` 全局构造器

`Color` 使用原始大小写名称导出，不带 `$` 别名。它既可通过 `new Color(...)` 构造，也可像普通函数一样调用；两种形式返回同一种 [Color 实例](../types/color.md)。构造器还通过颜色表原型暴露 `Color.RED` 等命名颜色。

<a id="api-symbol-Y29uc3RydWN0OmNvbG9y"></a>

### `new Color(...)`

```ts
new Color(): Color
new Color(color: OmniColor | ThemeColor): Color
new Color(red: number, green: number, blue: number): Color
new Color(red: number, green: number, blue: number, alpha: number): Color
```

零参数使用黑色；一参数走 `colors.toInt` 的颜色转换；三、四参数分别走 `colors.rgb` 和 `colors.rgba`。不支持两个参数，参数数量必须是 `0`、`1`、`3` 或 `4`。

<a id="api-symbol-Y2FsbDpjb2xvcg"></a>

### `Color(...)`

```ts
Color(): Color
Color(color: OmniColor | ThemeColor): Color
Color(red: number, green: number, blue: number, alpha?: number): Color
```

省略 `new` 的调用与构造调用共用同一实现、返回相同对象。无效参数数量或无法转换的颜色会被运行时包装为调用/构造异常。

```js
const a = Color('orange')
const b = new Color(255, 165, 0)
console.log(a.toHex(), b.toHex())
```


## 逐符号版本与 Rhino 2.0 示例

下列每个条目都对应一个公开 API 符号；示例按 Rhino 2.0 语法书写。需要文件、网络或 UI 资源的示例应在具备相应运行条件时执行。

<!-- api-member-contract id="call:color" version="6.7.0" -->
`call:color` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof color);
```

<!-- api-member-contract id="colors.all" version="6.7.0" -->
`colors.all` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(colors.all);
```

<!-- api-member-contract id="colors.alpha" version="6.7.0" -->
`colors.alpha` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.alpha);
```

<!-- api-member-contract id="colors.alphaDouble" version="6.7.0" -->
`colors.alphaDouble` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.alphaDouble);
```

<!-- api-member-contract id="colors.android" version="6.7.0" -->
`colors.android` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(colors.android);
```

<!-- api-member-contract id="colors.argb" version="6.7.0" -->
`colors.argb` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.argb);
```

<!-- api-member-contract id="colors.blue" version="6.7.0" -->
`colors.blue` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.blue);
```

<!-- api-member-contract id="colors.blueDouble" version="6.7.0" -->
`colors.blueDouble` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.blueDouble);
```

<!-- api-member-contract id="colors.build" version="6.7.0" -->
`colors.build` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.build);
```

<!-- api-member-contract id="colors.colorToHSV" version="6.7.0" -->
`colors.colorToHSV` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.colorToHSV);
```

<!-- api-member-contract id="colors.css" version="6.7.0" -->
`colors.css` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(colors.css);
```

<!-- api-member-contract id="colors.equals" version="6.7.0" -->
`colors.equals` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.equals);
```

<!-- api-member-contract id="colors.getAlpha" version="6.7.0" -->
`colors.getAlpha` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.getAlpha);
```

<!-- api-member-contract id="colors.getAlphaDouble" version="6.7.0" -->
`colors.getAlphaDouble` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.getAlphaDouble);
```

<!-- api-member-contract id="colors.getBlue" version="6.7.0" -->
`colors.getBlue` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.getBlue);
```

<!-- api-member-contract id="colors.getBlueDouble" version="6.7.0" -->
`colors.getBlueDouble` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.getBlueDouble);
```

<!-- api-member-contract id="colors.getGreen" version="6.7.0" -->
`colors.getGreen` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.getGreen);
```

<!-- api-member-contract id="colors.getGreenDouble" version="6.7.0" -->
`colors.getGreenDouble` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.getGreenDouble);
```

<!-- api-member-contract id="colors.getRed" version="6.7.0" -->
`colors.getRed` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.getRed);
```

<!-- api-member-contract id="colors.getRedDouble" version="6.7.0" -->
`colors.getRedDouble` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.getRedDouble);
```

<!-- api-member-contract id="colors.green" version="6.7.0" -->
`colors.green` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.green);
```

<!-- api-member-contract id="colors.greenDouble" version="6.7.0" -->
`colors.greenDouble` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.greenDouble);
```

<!-- api-member-contract id="colors.hsl" version="6.7.0" -->
`colors.hsl` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.hsl);
```

<!-- api-member-contract id="colors.hsla" version="6.7.0" -->
`colors.hsla` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.hsla);
```

<!-- api-member-contract id="colors.hsv" version="6.7.0" -->
`colors.hsv` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.hsv);
```

<!-- api-member-contract id="colors.hsva" version="6.7.0" -->
`colors.hsva` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.hsva);
```

<!-- api-member-contract id="colors.HSVToColor" version="6.7.0" -->
`colors.HSVToColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.HSVToColor);
```

<!-- api-member-contract id="colors.isEqual" version="6.7.0" -->
`colors.isEqual` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.isEqual);
```

<!-- api-member-contract id="colors.isSimilar" version="6.7.0" -->
`colors.isSimilar` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.isSimilar);
```

<!-- api-member-contract id="colors.luminance" version="6.7.0" -->
`colors.luminance` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.luminance);
```

<!-- api-member-contract id="colors.material" version="6.7.0" -->
`colors.material` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(colors.material);
```

<!-- api-member-contract id="colors.parseColor" version="6.7.0" -->
`colors.parseColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.parseColor);
```

<!-- api-member-contract id="colors.red" version="6.7.0" -->
`colors.red` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.red);
```

<!-- api-member-contract id="colors.redDouble" version="6.7.0" -->
`colors.redDouble` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.redDouble);
```

<!-- api-member-contract id="colors.removeAlpha" version="6.7.0" -->
`colors.removeAlpha` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.removeAlpha);
```

<!-- api-member-contract id="colors.removeBlue" version="6.7.0" -->
`colors.removeBlue` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.removeBlue);
```

<!-- api-member-contract id="colors.removeGreen" version="6.7.0" -->
`colors.removeGreen` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.removeGreen);
```

<!-- api-member-contract id="colors.removeRed" version="6.7.0" -->
`colors.removeRed` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.removeRed);
```

<!-- api-member-contract id="colors.rgb" version="6.7.0" -->
`colors.rgb` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.rgb);
```

<!-- api-member-contract id="colors.rgba" version="6.7.0" -->
`colors.rgba` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.rgba);
```

<!-- api-member-contract id="colors.RGBToHSV" version="6.7.0" -->
`colors.RGBToHSV` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.RGBToHSV);
```

<!-- api-member-contract id="colors.setAlpha" version="6.7.0" -->
`colors.setAlpha` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.setAlpha);
```

<!-- api-member-contract id="colors.setAlphaRelative" version="6.7.0" -->
`colors.setAlphaRelative` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.setAlphaRelative);
```

<!-- api-member-contract id="colors.setBlue" version="6.7.0" -->
`colors.setBlue` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.setBlue);
```

<!-- api-member-contract id="colors.setBlueRelative" version="6.7.0" -->
`colors.setBlueRelative` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.setBlueRelative);
```

<!-- api-member-contract id="colors.setGreen" version="6.7.0" -->
`colors.setGreen` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.setGreen);
```

<!-- api-member-contract id="colors.setGreenRelative" version="6.7.0" -->
`colors.setGreenRelative` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.setGreenRelative);
```

<!-- api-member-contract id="colors.setPaintColor" version="6.7.0" -->
`colors.setPaintColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.setPaintColor);
```

<!-- api-member-contract id="colors.setRed" version="6.7.0" -->
`colors.setRed` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.setRed);
```

<!-- api-member-contract id="colors.setRedRelative" version="6.7.0" -->
`colors.setRedRelative` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.setRedRelative);
```

<!-- api-member-contract id="colors.summary" version="6.7.0" -->
`colors.summary` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.summary);
```

<!-- api-member-contract id="colors.themeColor" version="6.7.0" -->
`colors.themeColor` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(colors.themeColor);
```

<!-- api-member-contract id="colors.toArgb" version="6.7.0" -->
`colors.toArgb` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toArgb);
```

<!-- api-member-contract id="colors.toArgbString" version="6.7.0" -->
`colors.toArgbString` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toArgbString);
```

<!-- api-member-contract id="colors.toColorStateList" version="6.7.0" -->
`colors.toColorStateList` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toColorStateList);
```

<!-- api-member-contract id="colors.toFullHex" version="6.7.0" -->
`colors.toFullHex` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toFullHex);
```

<!-- api-member-contract id="colors.toHex" version="6.7.0" -->
`colors.toHex` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toHex);
```

<!-- api-member-contract id="colors.toHsl" version="6.7.0" -->
`colors.toHsl` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toHsl);
```

<!-- api-member-contract id="colors.toHsla" version="6.7.0" -->
`colors.toHsla` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toHsla);
```

<!-- api-member-contract id="colors.toHslaString" version="6.7.0" -->
`colors.toHslaString` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toHslaString);
```

<!-- api-member-contract id="colors.toHslString" version="6.7.0" -->
`colors.toHslString` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toHslString);
```

<!-- api-member-contract id="colors.toHsv" version="6.7.0" -->
`colors.toHsv` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toHsv);
```

<!-- api-member-contract id="colors.toHsva" version="6.7.0" -->
`colors.toHsva` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toHsva);
```

<!-- api-member-contract id="colors.toHsvaString" version="6.7.0" -->
`colors.toHsvaString` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toHsvaString);
```

<!-- api-member-contract id="colors.toHsvString" version="6.7.0" -->
`colors.toHsvString` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toHsvString);
```

<!-- api-member-contract id="colors.toInt" version="6.7.0" -->
`colors.toInt` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toInt);
```

<!-- api-member-contract id="colors.toRgb" version="6.7.0" -->
`colors.toRgb` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toRgb);
```

<!-- api-member-contract id="colors.toRgba" version="6.7.0" -->
`colors.toRgba` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toRgba);
```

<!-- api-member-contract id="colors.toRgbaString" version="6.7.0" -->
`colors.toRgbaString` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toRgbaString);
```

<!-- api-member-contract id="colors.toRgbString" version="6.7.0" -->
`colors.toRgbString` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toRgbString);
```

<!-- api-member-contract id="colors.toString" version="6.7.0" -->
`colors.toString` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors.toString);
```

<!-- api-member-contract id="colors.web" version="6.7.0" -->
`colors.web` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(colors.web);
```

<!-- api-member-contract id="construct:color" version="6.7.0" -->
`construct:color` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
var value = new Color('red');
console.log(value.toStringReadable());
```

<!-- api-member-contract id="dynamic:colors.merged-table-entries" version="6.7.0" -->
`dynamic:colors.merged-table-entries` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(Object.keys(colors)); // mergedTableEntries
```

<!-- api-member-contract id="module:color" version="6.7.0" -->
`module:color` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof color);
```

<!-- api-member-contract id="module:colors" version="6.7.0" -->
`module:colors` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof colors);
```
