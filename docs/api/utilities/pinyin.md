# Pinyin - 拼音

`pinyin` 使用内置单字、词组和姓氏数据把中文转换为拼音，并可选用 Jieba 分词。运行时同时注册 `pinyin` 与 `$pinyin`，两者引用同一个模块对象。
本页所有 `js` 代码块均为 Monkey King **Rhino 2.0** 示例。

## pinyin

### pinyin(text, options?)

等价于 `pinyin.convert(text, options)`。

```js
let result = pinyin('中国');
console.log(JSON.stringify(result));
```

## 常量

### 拼音风格

| 常量 | 暴露值 | 内部编号 | 说明 |
| --- | --- | ---: | --- |
| `pinyin.STYLE_NORMAL` | `PinyinStyle.NORMAL` 枚举对象 | `0` | 不标声调 |
| `pinyin.STYLE_TONE` | `PinyinStyle.TONE` 枚举对象 | `1` | 使用带声调的韵母，默认值 |
| `pinyin.STYLE_TONE2` | `PinyinStyle.TONE2` 枚举对象 | `2` | 在拼音末尾加入声调数字 |
| `pinyin.STYLE_INITIALS` | `PinyinStyle.INITIALS` 枚举对象 | `3` | 只保留声母 |
| `pinyin.STYLE_FIRST_LETTER` | `PinyinStyle.FIRST_LETTER` 枚举对象 | `4` | 只保留首字母 |
| `pinyin.STYLE_TO3NE` | `PinyinStyle.TO3NE` 枚举对象 | `5` | 使用源码兼容的数字声调形式 |

### 转换模式

| 常量 | 暴露值 | 内部编号 | 说明 |
| --- | --- | ---: | --- |
| `pinyin.MODE_NORMAL` | `PinyinMode.NORMAL` 枚举对象 | `0` | 普通转换，默认值 |
| `pinyin.MODE_SURNAME` | `PinyinMode.SURNAME` 枚举对象 | `1` | 使用单姓与复姓字典 |
| `pinyin.MODE_PLACENAME` | `PinyinMode.PLACE_NAME` 枚举对象 | `2` | 地名模式兼容名称 |
| `pinyin.MODE_PLACE_NAME` | `PinyinMode.PLACE_NAME` 枚举对象 | `2` | 与 `MODE_PLACENAME` 相同 |

实现合同只对姓氏模式提供专门分支；地名模式目前沿用普通转换流程。

这些属性分别暴露 Kotlin `PinyinStyle 枚举对象` 与 `PinyinMode 枚举对象`，不是 JavaScript 数字。选项也可使用枚举名称字符串：风格合法名称为 `NORMAL`、`TONE`、`TONE2`、`TO3NE`、`INITIALS`、`FIRST_LETTER`；模式合法名称为 `NORMAL`、`SURNAME`、`PLACE_NAME`、`PLACENAME`。名称转换不区分大小写。

普通 JavaScript 数字（包括 `0`、`1`、`2` 等）在 Rhino 2.0 中不是 Kotlin `Int`，不能作为合法 `style` 或 `mode`；请传公开枚举对象或名称字符串。底层仅为 Java 互操作保留 `Int` 编号分支，不应据此把脚本数字写成公开契约。

## pinyin.convert(text, options?)

- `text` {string} - 要转换的文本
- `options` {Object} - 可选配置；非普通对象会按空配置处理
- 返回 {Array&lt;Array&lt;string&gt;&gt;} - 每个字、词组或非中文片段对应一组候选结果

选项：

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `style` | `pinyin.STYLE_TONE` | 公开 `PinyinStyle` 枚举对象，或合法枚举名称字符串 |
| `mode` | `pinyin.MODE_NORMAL` | 公开 `PinyinMode` 枚举对象，或合法枚举名称字符串 |
| `segment` | `false` | 是否先用 Jieba 分词 |
| `heteronym` | `false` | 是否保留多音字的多个读音 |
| `group` | `false` | 将同一词组中各字的候选读音组合成一组完整字符串 |

`style` 或 `mode` 的对象类型、名称无效时会抛出参数错误。非中文连续片段会原样作为一个结果项保留。

返回数组额外绑定了 `compact()` 方法，可把各位置的候选项展开为完整组合；它与模块级的 `pinyin.compact()` 不是同一个实现。

```js
let result = pinyin.convert('重庆 A', {
    style: pinyin.STYLE_TONE2,
    mode: 'NORMAL',
    segment: true,
    heteronym: true,
});

let surname = pinyin.convert('欧阳', {
    style: 'TONE2',
    mode: 'SURNAME',
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

- 参数数量：**1 至 2 个参数**；`left` 必填，`right` 可省略，当前实现不会读取或转换参数值
- 返回 {string} - 始终为空字符串 `""`
- 异常 - 只有参数数量不在 1 至 2 时由参数守卫抛出
- 权限 / 线程 / 生命周期 / 副作用 - 当前线程同步纯计算，不访问字典、不要求权限且不持有资源

当前实现合同没有执行拼音比较。不要把它作为排序比较器。

## pinyin.compact(value, options?)

- 参数数量：**1 至 2 个参数**；`value` 必填，`options` 可省略，当前实现不会读取参数值
- 返回 {string} - 始终为空字符串 `""`
- 异常 - 只有参数数量不在 1 至 2 时由参数守卫抛出
- 权限 / 线程 / 生命周期 / 副作用 - 当前线程同步纯计算，不访问字典、不要求权限且不持有资源

需要组合 `pinyin.convert` 的候选结果时，应调用返回数组自带的 `result.compact()`；它绑定到结果数组并执行真正的候选组合。

## 数据、性能与副作用

- 单字和词组查询使用应用内置 SQLite 字典；首次访问会延迟初始化数据库。
- `segment: true` 会加载 Jieba 分词数据，首次调用的时间和内存开销更高。
- 转换过程只读取字典，不修改文件或系统设置。
- 姓氏模式会优先使用单姓与复姓表；普通模式优先使用词组字典，未命中时退回逐字查询。
- 所有公开调用都在当前线程同步完成，不请求 Android 运行时权限；字典数据库和分词器按应用生命周期延迟初始化，返回值不需要关闭。

<!-- api-contracts:start -->

## API 合同表

下表覆盖本页在当前公开 API 中的每个 canonical 公共成员。每行同时给出稳定锚点、实现合同、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Y2FsbDpwaW55aW4"></a> `call:pinyin` | `pinyin(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof pinyin);` |
| <a id="api-symbol-bW9kdWxlOnBpbnlpbg"></a> `module:pinyin` | `pinyin` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof pinyin);` |
| <a id="api-symbol-cGlueWluLmNvbXBhY3Q"></a> `pinyin.compact` | `pinyin.compact(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof pinyin.compact);` |
| <a id="api-symbol-cGlueWluLmNvbXBhcmU"></a> `pinyin.compare` | `pinyin.compare(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof pinyin.compare);` |
| <a id="api-symbol-cGlueWluLmNvbnZlcnQ"></a> `pinyin.convert` | `pinyin.convert(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof pinyin.convert);` |
| <a id="api-symbol-cGlueWluLmZyb21Db2RlUG9pbnQ"></a> `pinyin.fromCodePoint` | `pinyin.fromCodePoint(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof pinyin.fromCodePoint);` |
| <a id="api-symbol-cGlueWluLmZyb21QaHJhc2U"></a> `pinyin.fromPhrase` | `pinyin.fromPhrase(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof pinyin.fromPhrase);` |
| <a id="api-symbol-cGlueWluLk1PREVfTk9STUFM"></a> `pinyin.MODE_NORMAL` | `pinyin.MODE_NORMAL` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(pinyin.MODE_NORMAL);` |
| <a id="api-symbol-cGlueWluLk1PREVfUExBQ0VfTkFNRQ"></a> `pinyin.MODE_PLACE_NAME` | `pinyin.MODE_PLACE_NAME` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(pinyin.MODE_PLACE_NAME);` |
| <a id="api-symbol-cGlueWluLk1PREVfUExBQ0VOQU1F"></a> `pinyin.MODE_PLACENAME` | `pinyin.MODE_PLACENAME` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(pinyin.MODE_PLACENAME);` |
| <a id="api-symbol-cGlueWluLk1PREVfU1VSTkFNRQ"></a> `pinyin.MODE_SURNAME` | `pinyin.MODE_SURNAME` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(pinyin.MODE_SURNAME);` |
| <a id="api-symbol-cGlueWluLnNpbXBsZQ"></a> `pinyin.simple` | `pinyin.simple(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof pinyin.simple);` |
| <a id="api-symbol-cGlueWluLlNUWUxFX0ZJUlNUX0xFVFRFUg"></a> `pinyin.STYLE_FIRST_LETTER` | `pinyin.STYLE_FIRST_LETTER` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(pinyin.STYLE_FIRST_LETTER);` |
| <a id="api-symbol-cGlueWluLlNUWUxFX0lOSVRJQUxT"></a> `pinyin.STYLE_INITIALS` | `pinyin.STYLE_INITIALS` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(pinyin.STYLE_INITIALS);` |
| <a id="api-symbol-cGlueWluLlNUWUxFX05PUk1BTA"></a> `pinyin.STYLE_NORMAL` | `pinyin.STYLE_NORMAL` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(pinyin.STYLE_NORMAL);` |
| <a id="api-symbol-cGlueWluLlNUWUxFX1RPM05F"></a> `pinyin.STYLE_TO3NE` | `pinyin.STYLE_TO3NE` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(pinyin.STYLE_TO3NE);` |
| <a id="api-symbol-cGlueWluLlNUWUxFX1RPTkU"></a> `pinyin.STYLE_TONE` | `pinyin.STYLE_TONE` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(pinyin.STYLE_TONE);` |
| <a id="api-symbol-cGlueWluLlNUWUxFX1RPTkUy"></a> `pinyin.STYLE_TONE2` | `pinyin.STYLE_TONE2` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：无需 Android 权限；线程：同步转换与常量读取 | 生命周期：无持久资源；副作用：无，仅返回结果或枚举对象 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(pinyin.STYLE_TONE2);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: pinyin');
```

<!-- api-contracts:end -->
