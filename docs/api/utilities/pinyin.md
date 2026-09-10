# Pinyin - 拼音

`pinyin` 使用内置单字、词组和姓氏数据把中文转换为拼音，并可选用 Jieba 分词。运行时同时注册 `pinyin` 与 `$pinyin`，两者引用同一个模块对象。

版本：**v6.6.1**

## pinyin

### pinyin(text, options?)

等价于 `pinyin.convert(text, options)`。

```js
let result = pinyin('中国');
console.log(JSON.stringify(result));
```

## 常量

### 拼音风格

| 常量 | 值 | 说明 |
| --- | --- | --- |
| `pinyin.STYLE_NORMAL` | `0` | 不标声调 |
| `pinyin.STYLE_TONE` | `1` | 使用带声调的韵母，默认值 |
| `pinyin.STYLE_TONE2` | `2` | 在拼音末尾加入声调数字 |
| `pinyin.STYLE_INITIALS` | `3` | 只保留声母 |
| `pinyin.STYLE_FIRST_LETTER` | `4` | 只保留首字母 |
| `pinyin.STYLE_TO3NE` | `5` | 使用源码兼容的数字声调形式 |

### 转换模式

| 常量 | 值 | 说明 |
| --- | --- | --- |
| `pinyin.MODE_NORMAL` | `0` | 普通转换，默认值 |
| `pinyin.MODE_SURNAME` | `1` | 使用单姓与复姓字典 |
| `pinyin.MODE_PLACENAME` | `2` | 地名模式兼容名称 |
| `pinyin.MODE_PLACE_NAME` | `2` | 与 `MODE_PLACENAME` 相同 |

固定源码只对姓氏模式提供专门分支；地名模式目前沿用普通转换流程。

## pinyin.convert(text, options?)

- `text` {string} - 要转换的文本
- `options` {Object} - 可选配置；非普通对象会按空配置处理
- 返回 {Array&lt;Array&lt;string&gt;&gt;} - 每个字、词组或非中文片段对应一组候选结果

选项：

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `style` | `pinyin.STYLE_TONE` | 风格常量、对应整数或枚举名称字符串 |
| `mode` | `pinyin.MODE_NORMAL` | 模式常量、对应整数或枚举名称字符串 |
| `segment` | `false` | 是否先用 Jieba 分词 |
| `heteronym` | `false` | 是否保留多音字的多个读音 |
| `group` | `false` | 将同一词组中各字的候选读音组合成一组完整字符串 |

`style` 或 `mode` 的整数、名称无效时会抛出参数错误。非中文连续片段会原样作为一个结果项保留。

返回数组额外绑定了 `compact()` 方法，可把各位置的候选项展开为完整组合；它与模块级的 `pinyin.compact()` 不是同一个实现。

```js
let result = pinyin.convert('重庆 A', {
    style: pinyin.STYLE_TONE2,
    segment: true,
    heteronym: true,
});

console.log(JSON.stringify(result));
console.log(JSON.stringify(result.compact()));
```

## pinyin.simple(text, numericTone?, segment?)

- `text` {string} - 要转换的文本
- `numericTone` {boolean} - 是否使用 `STYLE_TONE2`，默认 `false`
- `segment` {boolean} - 是否分词，默认 `false`
- 返回 {string}

对每个位置取第一个读音并连接成字符串。`numericTone` 为假时使用无声调的 `STYLE_NORMAL`。

```js
console.log(pinyin.simple('中国')); // zhongguo
console.log(pinyin.simple('中国', true)); // zhong1guo2
```

## pinyin.fromCodePoint(codePoint)

按 Unicode 码点查询单字字典，返回字典中的原始拼音字符串；没有记录时返回 `null`。多音字记录可能以逗号分隔。

```js
console.log(pinyin.fromCodePoint('中'.codePointAt(0)));
```

## pinyin.fromPhrase(phrase)

查询内置词组字典，返回按字序排列的二维拼音数组；没有记录时返回空数组。返回内容是词典中的原始带调拼音。

```js
console.log(JSON.stringify(pinyin.fromPhrase('重庆')));
```

## pinyin.compare(left, right?)

当前固定源码实现始终返回空字符串，没有执行拼音比较。不要把它作为排序比较器。

## pinyin.compact(value, options?)

当前固定源码中的模块级方法始终返回空字符串。需要组合 `pinyin.convert` 的候选结果时，应调用返回数组自带的 `result.compact()`。

## 数据、性能与副作用

- 单字和词组查询使用应用内置 SQLite 字典；首次访问会延迟初始化数据库。
- `segment: true` 会加载 Jieba 分词数据，首次调用的时间和内存开销更高。
- 转换过程只读取字典，不修改文件或系统设置。
- 姓氏模式会优先使用单姓与复姓表；普通模式优先使用词组字典，未命中时退回逐字查询。
