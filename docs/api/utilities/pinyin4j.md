# Pinyin4j

**自 v6.6.1 起提供。**

Pinyin4j 模块封装 pinyin4j 2.5.1，用于把基础汉字转换为汉语拼音，或把带数字的声调转换为声调符号。

## pinyin4j

### pinyin4j(string, options?)

**v6.6.1**

- **string** { `string` } - 待转换文本
- **options** { `object | string` } - 可选；字符串会直接作为分隔符
- <ins>**returns**</ins> { `string` }
- **异常**：参数数量或格式选项不合法时抛出异常
- **副作用 / 生命周期**：同步纯计算，不持有资源

全局可调用入口，与 `pinyin4j.of` 等价。`$pinyin4j` 是同一函数对象的别名。

```js
console.log(pinyin4j('中国')); // zhongguo
console.log(pinyin4j('中国', ' ')); // zhong guo
console.log($pinyin4j === pinyin4j); // true
```

### pinyin4j.of(string, options?)

**v6.6.1**

- **string** { `string` } - 待转换文本
- **options** { `object | string` } - 格式选项，或作为简写的分隔符字符串
- <ins>**returns**</ins> { `string` }
- **异常**：参数数量、枚举值或底层拼音格式组合不合法时抛出异常
- **副作用 / 生命周期**：同步纯计算，不持有资源

逐字符转换 `U+4E00` 至 `U+9FA5` 范围内的汉字。范围外字符原样保留；一个汉字有多个读音时只采用 pinyin4j 返回的第一项。

选项对象支持以下名称和别名：

| 选项 | 默认值 | 合法值 |
| --- | --- | --- |
| `separator` / `sep` | 空字符串 | 任意字符串 |
| `case` / `caseType` | `LOWERCASE` | `LOWERCASE`、`LOW`、`L`、`0`；或 `UPPERCASE`、`UP`、`U`、`1` |
| `tone` / `toneType` | `WITHOUT_TONE` | `WITH_TONE_NUMBER`、`WITH_NUMBER`、`NUMBER`、`NUM`；`WITHOUT_TONE`、`NO_TONE`、`NO`、`FALSE`、`0`；`WITH_TONE_MARK`、`WITH_MARK`、`MARK`、`TRUE`、`1` |
| `v` / `vChar` / `vCharType` | `WITH_V` | `WITH_U_AND_COLON`、`U_AND_COLON`、`U_COLON`、`U:`；`WITH_V`、`V`；`WITH_U_UNICODE`、`U_UNICODE`、`UNICODE`、`Ü` |

也可直接传入 pinyin4j 的 `HanyuPinyinCaseType`、`HanyuPinyinToneType` 和 `HanyuPinyinVCharType` 枚举对象。使用声调符号且未指定 v 字符格式时，默认改用 Unicode `ü`。

```js
console.log(pinyin4j.of('中国', {
    separator: ' ',
    case: 'UPPERCASE',
    tone: 'WITH_TONE_NUMBER',
})); // ZHONG1 GUO2

console.log(pinyin4j.of('女', {
    tone: 'WITH_TONE_MARK',
})); // nǚ
```

实现会在每个输入字符转换后追加分隔符，最后只移除首尾空白。因此空格分隔符不会留下尾随空格，而 `-` 一类非空白分隔符会保留在结果末尾。

```js
console.log(pinyin4j.of('中国', '-')); // zhong-guo-
```

### pinyin4j.as(numberedPinyin)

**v6.6.1**

- **numberedPinyin** { `string` } - 含 0 至 4 声调数字的拼音文本
- <ins>**returns**</ins> { `string` } - 转换声调后的文本
- **异常**：参数数量不为 1 时抛出异常
- **副作用 / 生命周期**：同步纯计算，不持有资源

把可识别的韵母加数字形式替换为 Unicode 声调字符。未匹配的内容原样保留；数字 0 表示轻声并移除数字。

```js
console.log(pinyin4j.as('zhong1 guo2')); // zhōng guó
console.log(pinyin4j.as('nv3 hai2')); // nǚ hái
```

### 异常、线程与副作用

- `pinyin4j` 与 `pinyin4j.of` 必须传入 1 至 2 个参数，`pinyin4j.as` 必须传入 1 个参数；数量不符会抛出异常。
- 非法的大小写、声调或 v 字符枚举值会抛出参数异常；pinyin4j 不接受的格式组合也可能抛出格式异常。
- 空字符串返回空字符串。除无效枚举外，输入会按 Monkey King 的字符串转换规则处理。
- 所有转换同步完成，只进行内存计算，不访问文件、网络或 Android 权限，也不维护需要关闭的资源。
