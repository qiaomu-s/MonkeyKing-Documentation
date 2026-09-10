# OpenCC

OpenCC, 全称 "Open Chinese Convert", 译为 "开放中文转换".

opencc 模块是一个中文简繁转换模块, 支持词汇级别的转换, 异体字转换和地区习惯用词转换 (中国大陆/台湾/香港/日本新字体).

> 参阅:<br>
> OpenCC 官方网站: https://opencc.byvoid.com<br>
> OpenCC 官方文档: https://byvoid.github.io/OpenCC<br>
> OpenCC 开源项目: https://github.com/BYVoid/OpenCC<br>
> OpenCC (Android) 开源项目: https://github.com/qichuan/android-opencc

下表列举了一些简体中文的转换示例:

|                                                  |  <span style="white-space:nowrap">程序员</span>  | <span style="white-space:nowrap">文档</span> | <span style="white-space:nowrap">文件</span> | <span style="white-space:nowrap">文件夹</span> | <span style="white-space:nowrap">荞麦面</span> | <span style="white-space:nowrap">心里为之喜悦</span> |
|--------------------------------------------------|:---------------------------------------------:|:------------------------------------------:|:------------------------------------------:|:-------------------------------------------:|:-------------------------------------------:|:----------------------------------------------:|
| <span style="white-space:nowrap">繁体</span>       |  <span style="white-space:nowrap">程序員</span>  | <span style="white-space:nowrap">文檔</span> | <span style="white-space:nowrap">文件</span> | <span style="white-space:nowrap">文件夾</span> | <span style="white-space:nowrap">蕎麥麪</span> | <span style="white-space:nowrap">心裏爲之喜悅</span> |
| <span style="white-space:nowrap">香港繁体</span>     |  <span style="white-space:nowrap">程序員</span>  | <span style="white-space:nowrap">文檔</span> | <span style="white-space:nowrap">文件</span> | <span style="white-space:nowrap">文件夾</span> | <span style="white-space:nowrap">蕎麥麪</span> | <span style="white-space:nowrap">心裏為之喜悦</span> |
| <span style="white-space:nowrap">台湾正体</span>     |  <span style="white-space:nowrap">程序員</span>  | <span style="white-space:nowrap">文檔</span> | <span style="white-space:nowrap">文件</span> | <span style="white-space:nowrap">文件夾</span> | <span style="white-space:nowrap">蕎麥麵</span> | <span style="white-space:nowrap">心裡為之喜悅</span> |
| <span style="white-space:nowrap">台湾正体 (惯)</span> | <span style="white-space:nowrap">程式設計師</span> | <span style="white-space:nowrap">文件</span> | <span style="white-space:nowrap">檔案</span> | <span style="white-space:nowrap">資料夾</span> | <span style="white-space:nowrap">蕎麥麵</span> | <span style="white-space:nowrap">心裡為之喜悅</span> |

> 注: 表中 "惯" 表示惯用词.

转换方法对照表:

|                                                  |         <span style="white-space:nowrap">简体</span>          |          <span style="white-space:nowrap">繁体</span>           |          <span style="white-space:nowrap">香港繁体</span>           |          <span style="white-space:nowrap">台湾正体</span>           |         <span style="white-space:nowrap">台湾正体 (惯)</span>          |           <span style="white-space:nowrap">日本汉字</span>            |
|--------------------------------------------------|:-----------------------------------------------------------:|:-------------------------------------------------------------:|:---------------------------------------------------------------:|:---------------------------------------------------------------:|:-----------------------------------------------------------------:|:-----------------------------------------------------------------:|
| <span style="white-space:nowrap">简体</span>       |                              -                              |     <span style="white-space:nowrap">[s2t](#m-s2t)</span>     |     <span style="white-space:nowrap">[s2hk](#m-s2hk)</span>     |     <span style="white-space:nowrap">[s2tw](#m-s2tw)</span>     |     <span style="white-space:nowrap">[s2twi](#m-s2twi)</span>     |    <span style="white-space:nowrap">< [s2jp](#m-s2jp) ></span>    |
| <span style="white-space:nowrap">繁体</span>       |    <span style="white-space:nowrap">[t2s](#m-t2s)</span>    |                               -                               |     <span style="white-space:nowrap">[t2hk](#m-t2hk)</span>     |     <span style="white-space:nowrap">[t2tw](#m-t2tw)</span>     |   <span style="white-space:nowrap">< [t2twi](#m-t2twi) ></span>   |      <span style="white-space:nowrap">[t2jp](#m-t2jp)</span>      |
| <span style="white-space:nowrap">香港繁体</span>     |   <span style="white-space:nowrap">[hk2s](#m-hk2s)</span>   |    <span style="white-space:nowrap">[hk2t](#m-hk2t)</span>    |                                -                                |  <span style="white-space:nowrap">< [hk2tw](#m-hk2tw) ></span>  |  <span style="white-space:nowrap">< [hk2twi](#m-hk2twi) ></span>  |   <span style="white-space:nowrap">< [hk2jp](#m-hk2jp) ></span>   |
| <span style="white-space:nowrap">台湾正体</span>     |   <span style="white-space:nowrap">[tw2s](#m-tw2s)</span>   |    <span style="white-space:nowrap">[tw2t](#m-tw2t)</span>    |  <span style="white-space:nowrap">< [tw2hk](#m-tw2hk) ></span>  |                                -                                |  <span style="white-space:nowrap">< [tw2twi](#m-tw2twi) ></span>  |   <span style="white-space:nowrap">< [tw2jp](#m-tw2jp) ></span>   |
| <span style="white-space:nowrap">台湾正体 (惯)</span> |  <span style="white-space:nowrap">[twi2s](#m-twi2s)</span>  | <span style="white-space:nowrap">< [twi2t](#m-twi2t) ></span> | <span style="white-space:nowrap">< [twi2hk](#m-twi2hk) ></span> | <span style="white-space:nowrap">< [twi2tw](#m-twi2tw) ></span> |                                 -                                 | <span style="white-space:nowrap"><< [twi2jp](#m-twi2jp) >></span> |
| <span style="white-space:nowrap">日本汉字</span>     | <span style="white-space:nowrap">< [jp2s](#m-jp2s) ></span> |    <span style="white-space:nowrap">[jp2t](#m-jp2t)</span>    |  <span style="white-space:nowrap">< [jp2hk](#m-jp2hk) ></span>  |  <span style="white-space:nowrap">< [jp2tw](#m-jp2tw) ></span>  | <span style="white-space:nowrap"><< [jp2twi](#m-jp2twi) >></span> |                                 -                                 |

> 注:
>
> 尖括号表示 Monkey King 封装方法, 内部经 1 次转换.<br>
> 双尖括号表示 Monkey King 封装方法, 内部经 2 次转换.
>
> 台湾正体存在惯用词.<br>
> 在转换时, 如涉及到台湾正体, 方法名称将以 "twi" 体现惯用词转换.<br>
> 如 twi2s 表示台湾正体转简体并应用惯用词转换.<br>
> 再如 hk2twi 表示香港繁体转台湾正体并应用惯用词转换.

---

<p style="font: bold 2em sans-serif; color: #FF7043">opencc</p>

---

## [@] opencc

opencc 可作为全局对象使用:

```js
typeof opencc; // "function"
typeof opencc.convert; // "function"
```

### opencc(s, type)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- **type** { [OpenCCConversion](../types/opencc-conversion.md) } - 转换类型
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

将字符串转换为目标类型.

```js
/* 简体. */
let s = '鼠标里面的硅二极管坏了, 导致光标分辨率降低';

/* 繁體 (臺灣正體標準) [惯用词]. */
let t = '滑鼠裡面的矽二極體壞了, 導致游標解析度降低';

/* s 转换为 t. */
console.log(opencc(s, 'S2TWI'));

/* t 转换为 s. */
console.log(opencc(t, 'TWI2S'));
```

`opencc(s, type)` 与 [opencc.convert(s, type)](#m-convert) 等价.

## [m] convert

### convert(s, type)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- **type** { [OpenCCConversion](../types/opencc-conversion.md) } - 转换类型
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

将字符串转换为目标类型.

`opencc.convert(s, type)` 与 [opencc(s, type)](#opencc-s-type) 等价.

## [m] s2t

### s2t(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从简体到繁体.

相当于 `opencc(s, 'S2T')`;

```js
let str = '心里为何充满喜悦';
console.log(opencc.s2t(str)); // 心裏爲何充滿喜悅
console.log(opencc(str, 'S2T')); /* 同上. */
```

> 注: s2t 的逆转换方法为 [t2s](#m-t2s).

## [m] s2hk

### s2hk(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从简体到香港繁体 (香港小学学习字词表标准).

相当于 `opencc(s, 'S2HK')`;

```js
let str = '心里为何充满喜悦';
console.log(opencc.s2hk(str)); // 心裏為何充滿喜悦
console.log(opencc(str, 'S2HK')); /* 同上. */
```

> 注: s2hk 的逆转换方法为 [hk2s](#m-hk2s).

## [m] s2tw

### s2tw(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从简体到台湾正体.

相当于 `opencc(s, 'S2TW')`;

```js
let str = '心里为何充满喜悦';
console.log(opencc.s2tw(str)); // 心裡為何充滿喜悅
console.log(opencc(str, 'S2TW')); /* 同上. */
```

> 注: s2tw 的逆转换方法为 [tw2s](#m-tw2s).

## [m] s2twi

### s2twi(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从简体到繁体 (台湾正体标准) [惯用词].

相当于 `opencc(s, 'S2TWI')`;

```js
let strA = '心里为何充满喜悦';
console.log(opencc.s2twi(strA)); // 心裡為何充滿喜悅
console.log(opencc(strA, 'S2TWI')); /* 同上. */

let strB = '使用鼠标完成文件重命名操作';
console.log(opencc.s2twi(strB)); // 使用滑鼠完成檔案重新命名操作
console.log(opencc(strB, 'S2TWI')); /* 同上. */
```

> 注: s2twi 的逆转换方法为 [twi2s](#m-twi2s).

## [m] s2jp

### s2jp(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从简体到日本汉字.

相当于 `opencc(s, 'S2JP')`.

```js
let str = '黑/废/泪/稻/亚';
console.log(opencc.s2jp(str)); // 黒/廃/涙/稲/亜
console.log(opencc(str, 'S2JP')); /* 同上. */
```

> 注: s2jp 的逆转换方法为 [jp2s](#m-jp2s).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
s2t -> t2jp
```

## [m] t2s

### t2s(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从繁体到简体.

相当于 `opencc(s, 'T2S')`;

```js
let str = '心裏爲何充滿喜悅';
console.log(opencc.t2s(str)); // 心里为何充满喜悦
console.log(opencc(str, 'T2S')); /* 同上. */
```

> 注: t2s 的逆转换方法为 [s2t](#m-s2t).

## [m] t2hk

### t2hk(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从繁体到香港繁体 (香港小学学习字词表标准).

相当于 `opencc(s, 'T2HK')`;

```js
let str = '心裏爲何充滿喜悅';
console.log(opencc.t2hk(str)); // 心裏為何充滿喜悦
console.log(opencc(str, 'T2HK')); /* 同上. */
```

> 注: t2hk 的逆转换方法为 [hk2t](#m-hk2t).

## [m] t2tw

### t2tw(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从繁体到台湾正体.

相当于 `opencc(s, 'T2TW')`;

```js
let str = '心裏爲何充滿喜悅';
console.log(opencc.t2tw(str)); // 心裡為何充滿喜悅
console.log(opencc(str, 'T2TW')); /* 同上. */
```

> 注: t2tw 的逆转换方法为 [tw2t](#m-tw2t).

## [m] t2twi

### t2twi(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从繁体到台湾正体 [惯用词].

相当于 `opencc(s, 'T2TWI')`.

```js
let strA = '心裏爲何充滿喜悅';
console.log(opencc.t2twi(strA)); // 心裡為何充滿喜悅
console.log(opencc(strA, 'T2TWI')); /* 同上. */

let strB = '使用鼠標完成文件重命名操作';
console.log(opencc.t2twi(strB)); // 使用滑鼠完成檔案重新命名操作
console.log(opencc(strB, 'T2TWI')); /* 同上. */
```

> 注: t2twi 的逆转换方法为 [twi2t](#m-twi2t).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
t2s -> s2twi
```

## [m] t2jp

### t2jp(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从繁体到日本汉字.

相当于 `opencc(s, 'T2JP')`;

```js
let str = '黑/廢/淚/稻/亞';
console.log(opencc.t2jp(str)); // 黒/廃/涙/稲/亜
console.log(opencc(str, 'T2JP')); /* 同上. */
```

> 注: t2jp 的逆转换方法为 [jp2t](#m-jp2t).

## [m] hk2s

### hk2s(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从香港繁体 (香港小学学习字词表标准) 到简体.

相当于 `opencc(s, 'HK2S')`;

```js
let str = '心裏為何充滿喜悦';
console.log(opencc.hk2s(str)); // 心里为何充满喜悦
console.log(opencc(str, 'HK2S')); /* 同上. */
```

> 注: hk2s 的逆转换方法为 [s2hk](#m-s2hk).

## [m] hk2t

### hk2t(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从香港繁体 (香港小学学习字词表标准) 到繁体.

相当于 `opencc(s, 'HK2T')`;

```js
let str = '心裏為何充滿喜悦';
console.log(opencc.hk2t(str)); // 心裏爲何充滿喜悅
console.log(opencc(str, 'HK2T')); /* 同上. */
```

> 注: hk2t 的逆转换方法为 [t2hk](#m-t2hk).

## [m] hk2tw

### hk2tw(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从香港繁体 (香港小学学习字词表标准) 到台湾正体.

相当于 `opencc(s, 'HK2TW')`.

```js
let str = '心裏為何充滿喜悦';
console.log(opencc.hk2tw(str)); // 心裡為何充滿喜悅
console.log(opencc(str, 'HK2TW')); /* 同上. */
```

> 注: hk2tw 的逆转换方法为 [tw2hk](#m-tw2hk).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
hk2t -> t2tw
```

## [m] hk2twi

### hk2twi(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从香港繁体 (香港小学学习字词表标准) 到台湾正体 [惯用词].

相当于 `opencc(s, 'HK2TWI')`.

```js
let strA = '心裏為何充滿喜悦';
console.log(opencc.hk2twi(strA)); // 心裡為何充滿喜悅
console.log(opencc(strA, 'HK2TWI')); /* 同上. */

let strB = '使用鼠標完成文件重命名操作';
console.log(opencc.hk2twi(strB)); // 使用滑鼠完成檔案重新命名操作
console.log(opencc(strB, 'HK2TWI')); /* 同上. */
```

> 注: hk2twi 的逆转换方法为 [twi2hk](#m-twi2hk).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
hk2s -> s2twi
```

## [m] hk2jp

### hk2jp(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从香港繁体 (香港小学学习字词表标准) 到日本汉字.

相当于 `opencc(s, 'HK2JP')`.

```js
let str = '黑/廢/淚/稻/亞';
console.log(opencc.hk2jp(str)); // 黒/廃/涙/稲/亜
console.log(opencc(str, 'HK2JP')); /* 同上. */
```

> 注: hk2jp 的逆转换方法为 [jp2hk](#m-jp2hk).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
hk2t -> t2jp
```

## [m] tw2s

### tw2s(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从台湾正体到简体.

相当于 `opencc(s, 'TW2S')`;

```js
let str = '心裡為何充滿喜悅';
console.log(opencc.tw2s(str)); // 心里为何充满喜悦
console.log(opencc(str, 'TW2S')); /* 同上. */
```

> 注: tw2s 的逆转换方法为 [s2tw](#m-s2tw).

## [m] tw2t

### tw2t(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从台湾正体到繁体.

相当于 `opencc(s, 'TW2T')`;

```js
let str = '心裡為何充滿喜悅';
console.log(opencc.tw2t(str)); // 心裏爲何充滿喜悅
console.log(opencc(str, 'TW2T')); /* 同上. */
```

> 注: tw2t 的逆转换方法为 [t2tw](#m-t2tw).

## [m] tw2hk

### tw2hk(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从台湾正体到香港繁体 (香港小学学习字词表标准).

相当于 `opencc(s, 'TW2HK')`.

```js
let str = '心裡為何充滿喜悅';
console.log(opencc.tw2hk(str)); // 心裏為何充滿喜悦
console.log(opencc(str, 'TW2HK')); /* 同上. */
```

> 注: tw2hk 的逆转换方法为 [hk2tw](#m-hk2tw).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
tw2t -> t2hk
```

## [m] tw2twi

### tw2twi(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从台湾正体到台湾正体 [惯用词].

相当于 `opencc(s, 'TW2TWI')`.

```js
let str = '使用鼠標完成文件重命名操作';
console.log(opencc.tw2twi(str)); // 使用滑鼠完成檔案重新命名操作
console.log(opencc(str, 'TW2TWI')); /* 同上. */
```

> 注: tw2twi 的逆转换方法为 [twi2tw](#m-twi2tw).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
tw2s -> s2twi
```

## [m] tw2jp

### tw2jp(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从台湾正体到日本汉字.

相当于 `opencc(s, 'TW2JP')`.

```js
let str = '黑/廢/淚/稻/亞';
console.log(opencc.tw2jp(str)); // 黒/廃/涙/稲/亜
console.log(opencc(str, 'TW2JP')); /* 同上. */
```

> 注: tw2jp 的逆转换方法为 [jp2tw](#m-jp2tw).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
tw2t -> t2jp
```

## [m] twi2s

### twi2s(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从繁体 (台湾正体标准) [惯用词] 到简体.

相当于 `opencc(s, 'TWI2S')`;

```js
let strA = '心裡為何充滿喜悅';
console.log(opencc.twi2s(strA)); // 心里为何充满喜悦
console.log(opencc(strA, 'TWI2S')); /* 同上. */

let strB = '使用滑鼠完成檔案重新命名操作';
console.log(opencc.twi2s(strB)); // 使用鼠标完成文件重命名操作
console.log(opencc(strB, 'TWI2S')); /* 同上. */
```

> 注: twi2s 的逆转换方法为 [s2twi](#m-s2twi).

## [m] twi2t

### twi2t(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从台湾正体 [惯用词] 到繁体.

相当于 `opencc(s, 'TWI2T')`.

```js
let strA = '心裡為何充滿喜悅';
console.log(opencc.twi2t(strA)); // 心裏爲何充滿喜悅
console.log(opencc(strA, 'TWI2T')); /* 同上. */

let strB = '使用滑鼠完成檔案重新命名操作';
console.log(opencc.twi2t(strB)); // 使用鼠標完成文件重命名操作
console.log(opencc(strB, 'TWI2T')); /* 同上. */
```

> 注: twi2t 的逆转换方法为 [t2twi](#m-t2twi).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
twi2s -> s2t
```

## [m] twi2hk

### twi2hk(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从台湾正体 [惯用词] 到香港繁体 (香港小学学习字词表标准).

相当于 `opencc(s, 'TWI2HK')`.

```js
let strA = '心裡為何充滿喜悅';
console.log(opencc.twi2hk(strA)); // 心裏為何充滿喜悦
console.log(opencc(strA, 'TWI2HK')); /* 同上. */

let strB = '使用滑鼠完成檔案重新命名操作';
console.log(opencc.twi2hk(strB)); // 使用鼠標完成文件重命名操作
console.log(opencc(strB, 'TWI2HK')); /* 同上. */
```

> 注: twi2hk 的逆转换方法为 [hk2twi](#m-hk2twi).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
twi2s -> s2hk
```

## [m] twi2tw

### twi2tw(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从台湾正体 [惯用词] 到台湾正体.

相当于 `opencc(s, 'TWI2TW')`.

```js
let str = '使用滑鼠完成檔案重新命名操作';
console.log(opencc.twi2tw(str)); // 使用鼠標完成文件重命名操作
console.log(opencc(str, 'TWI2TW')); /* 同上. */
```

> 注: twi2tw 的逆转换方法为 [tw2twi](#m-tw2twi).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
twi2s -> s2tw
```

## [m] twi2jp

### twi2jp(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从台湾正体 [惯用词] 到日本汉字.

相当于 `opencc(s, 'TWI2JP')`.

```js
let str = '黑/廢/淚/稻/亞';
console.log(opencc.twi2jp(str)); // 黒/廃/涙/稲/亜
console.log(opencc(str, 'TWI2JP')); /* 同上. */
```

> 注: twi2jp 的逆转换方法为 [jp2twi](#m-jp2twi).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
twi2s -> s2t -> t2jp
```

## [m] jp2s

### jp2s(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从日本汉字到简体.

相当于 `opencc(s, 'JP2S')`.

```js
let str = '黒/廃/涙/稲/亜';
console.log(opencc.jp2s(str)); // 黑/废/泪/稻/亚
console.log(opencc(str, 'JP2S')); /* 同上. */
```

> 注: jp2s 的逆转换方法为 [s2jp](#m-s2jp).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
jp2t -> t2s
```

## [m] jp2t

### jp2t(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从日本汉字到繁体.

相当于 `opencc(s, 'JP2T')`;

```js
let str = '黒/廃/涙/稲/亜';
console.log(opencc.jp2t(str)); // 黑/廢/淚/稻/亞
console.log(opencc(str, 'JP2T')); /* 同上. */
```

> 注: jp2t 的逆转换方法为 [2tjp](#m-t2jp).

## [m] jp2hk

### jp2hk(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从日本汉字到香港繁体 (香港小学学习字词表标准).

相当于 `opencc(s, 'JP2HK')`.

```js
let str = '黒/廃/涙/稲/亜';
console.log(opencc.jp2hk(str)); // 黑/廢/淚/稻/亞
console.log(opencc(str, 'JP2HK')); /* 同上. */
```

> 注: jp2hk 的逆转换方法为 [hk2jp](#m-hk2jp).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
jp2t -> t2hk
```

## [m] jp2tw

### jp2tw(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从日本汉字到台湾正体.

相当于 `opencc(s, 'JP2TW')`.

```js
let str = '黒/廃/涙/稲/亜';
console.log(opencc.jp2tw(str)); // 黑/廢/淚/稻/亞
console.log(opencc(str, 'JP2TW')); /* 同上. */
```

> 注: jp2tw 的逆转换方法为 [tw2jp](#m-tw2jp).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
jp2t -> t2tw
```

## [m] jp2twi

### jp2twi(s)

**`6.5.0`**

- **s** { [string](../types/data-types.md#string) } - 待转换字符串
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 转换结果

字符串转换, 从日本汉字到台湾正体 [惯用词].

相当于 `opencc(s, 'JP2TWI')`.

```js
let str = '黒/廃/涙/稲/亜';
console.log(opencc.jp2twi(str)); // 黑/廢/淚/稻/亞
console.log(opencc(str, 'JP2TWI')); /* 同上. */
```

> 注: jp2twi 的逆转换方法为 [twi2jp](#m-twi2jp).

此方法为 Monkey King 封装方法, 内部进行如下转换:

```text
jp2t -> t2s -> s2twi
```

<!-- fixed-source-contracts:start -->

## 固定源码合同表

下表覆盖本页在固定提交 `bafa2986212d` 中的每个 canonical 公共成员。每行同时给出稳定锚点、源码位置、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Y2FsbDpvcGVuY2M"></a> `call:opencc` | `opencc(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L55` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc);` |
| <a id="api-symbol-bW9kdWxlOm9wZW5jYw"></a> `module:opencc` | `opencc` 模块入口 · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/ScriptRuntime.kt:L794` | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc);` |
| <a id="api-symbol-b3BlbmNjLmNvbnZlcnQ"></a> `opencc.convert` | `opencc.convert(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L59` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.convert);` |
| <a id="api-symbol-b3BlbmNjLmhrMmpw"></a> `opencc.hk2jp` | `opencc.hk2jp(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L243` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.hk2jp);` |
| <a id="api-symbol-b3BlbmNjLmhrMnM"></a> `opencc.hk2s` | `opencc.hk2s(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L81` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.hk2s);` |
| <a id="api-symbol-b3BlbmNjLmhrMnQ"></a> `opencc.hk2t` | `opencc.hk2t(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L89` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.hk2t);` |
| <a id="api-symbol-b3BlbmNjLmhrMnR3"></a> `opencc.hk2tw` | `opencc.hk2tw(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L227` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.hk2tw);` |
| <a id="api-symbol-b3BlbmNjLmhrMnR3aQ"></a> `opencc.hk2twi` | `opencc.hk2twi(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L235` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.hk2twi);` |
| <a id="api-symbol-b3BlbmNjLmpwMmhr"></a> `opencc.jp2hk` | `opencc.jp2hk(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L315` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.jp2hk);` |
| <a id="api-symbol-b3BlbmNjLmpwMnM"></a> `opencc.jp2s` | `opencc.jp2s(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L307` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.jp2s);` |
| <a id="api-symbol-b3BlbmNjLmpwMnQ"></a> `opencc.jp2t` | `opencc.jp2t(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L97` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.jp2t);` |
| <a id="api-symbol-b3BlbmNjLmpwMnR3"></a> `opencc.jp2tw` | `opencc.jp2tw(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L323` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.jp2tw);` |
| <a id="api-symbol-b3BlbmNjLmpwMnR3aQ"></a> `opencc.jp2twi` | `opencc.jp2twi(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L331` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.jp2twi);` |
| <a id="api-symbol-b3BlbmNjLnMyaGs"></a> `opencc.s2hk` | `opencc.s2hk(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L105` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.s2hk);` |
| <a id="api-symbol-b3BlbmNjLnMyanA"></a> `opencc.s2jp` | `opencc.s2jp(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L211` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.s2jp);` |
| <a id="api-symbol-b3BlbmNjLnMydA"></a> `opencc.s2t` | `opencc.s2t(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L113` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.s2t);` |
| <a id="api-symbol-b3BlbmNjLnMydHc"></a> `opencc.s2tw` | `opencc.s2tw(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L121` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.s2tw);` |
| <a id="api-symbol-b3BlbmNjLnMydHdp"></a> `opencc.s2twi` | `opencc.s2twi(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L195` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.s2twi);` |
| <a id="api-symbol-b3BlbmNjLnMydHdw"></a> `opencc.s2twp` | `opencc.s2twp(arg)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L129` | 参数：恰好 1 个参数；可选项与默认值见本页说明或源码守卫 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.s2twp);` |
| <a id="api-symbol-b3BlbmNjLnQyaGs"></a> `opencc.t2hk` | `opencc.t2hk(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L137` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.t2hk);` |
| <a id="api-symbol-b3BlbmNjLnQyanA"></a> `opencc.t2jp` | `opencc.t2jp(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L161` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.t2jp);` |
| <a id="api-symbol-b3BlbmNjLnQycw"></a> `opencc.t2s` | `opencc.t2s(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L145` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.t2s);` |
| <a id="api-symbol-b3BlbmNjLnQydHc"></a> `opencc.t2tw` | `opencc.t2tw(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L153` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.t2tw);` |
| <a id="api-symbol-b3BlbmNjLnQydHdp"></a> `opencc.t2twi` | `opencc.t2twi(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L219` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.t2twi);` |
| <a id="api-symbol-b3BlbmNjLnR3Mmhr"></a> `opencc.tw2hk` | `opencc.tw2hk(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L251` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.tw2hk);` |
| <a id="api-symbol-b3BlbmNjLnR3Mmpw"></a> `opencc.tw2jp` | `opencc.tw2jp(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L267` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.tw2jp);` |
| <a id="api-symbol-b3BlbmNjLnR3MnM"></a> `opencc.tw2s` | `opencc.tw2s(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L169` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.tw2s);` |
| <a id="api-symbol-b3BlbmNjLnR3MnNw"></a> `opencc.tw2sp` | `opencc.tw2sp(arg)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L185` | 参数：恰好 1 个参数；可选项与默认值见本页说明或源码守卫 | 返回：String；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.tw2sp);` |
| <a id="api-symbol-b3BlbmNjLnR3MnQ"></a> `opencc.tw2t` | `opencc.tw2t(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L177` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.tw2t);` |
| <a id="api-symbol-b3BlbmNjLnR3MnR3aQ"></a> `opencc.tw2twi` | `opencc.tw2twi(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L259` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.tw2twi);` |
| <a id="api-symbol-b3BlbmNjLnR3aTJoaw"></a> `opencc.twi2hk` | `opencc.twi2hk(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L283` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.twi2hk);` |
| <a id="api-symbol-b3BlbmNjLnR3aTJqcA"></a> `opencc.twi2jp` | `opencc.twi2jp(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L299` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.twi2jp);` |
| <a id="api-symbol-b3BlbmNjLnR3aTJz"></a> `opencc.twi2s` | `opencc.twi2s(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L203` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.twi2s);` |
| <a id="api-symbol-b3BlbmNjLnR3aTJ0"></a> `opencc.twi2t` | `opencc.twi2t(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L275` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.twi2t);` |
| <a id="api-symbol-b3BlbmNjLnR3aTJ0dw"></a> `opencc.twi2tw` | `opencc.twi2tw(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/opencc/OpenCC.kt:L291` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步文本转换 | 生命周期：转换器按模块实现复用；副作用：无，仅返回文本 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof opencc.twi2tw);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: opencc');
```

<!-- fixed-source-contracts:end -->
