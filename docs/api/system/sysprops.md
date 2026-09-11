# Sysprops - 系统属性

**自 v6.6.0 起提供。**

本页所有 `js` 代码块均为 Monkey King **Rhino 2.0** 示例。

Sysprops 只读访问 Android 系统属性。它既可读取单个属性，也可通过系统 `getprop` 命令取得属性集合；模块不提供设置或删除属性的方法。

## sysprops

### sysprops

**v6.6.0**

- **类型**：函数形态的命名空间
- **返回值**：直接调用没有属性查询语义，请使用下列成员方法

`$sysprops` 是同一全局对象的别名。

```js
console.log($sysprops === sysprops); // true
console.log(typeof sysprops.get); // "function"
```

### sysprops.get(propName, defaultValue?)

**v6.6.0**

- **propName** { `string` } - 系统属性名
- **defaultValue** { `string` } - 可选读取失败回退值
- <ins>**returns**</ins> { `string | null` } - 属性字符串，或底层访问失败时的回退值

通过 Android 系统属性接口读取字符串值。设备返回空字符串时，空字符串仍是有效结果。

```js
let sdk = sysprops.get('ro.build.version.sdk', 'unknown');
console.log(sdk);
```

### sysprops.getInt(propName, defaultValue)

**v6.6.0**

- **propName** { `string` } - 系统属性名
- **defaultValue** { `number` } - 必填整数回退值
- <ins>**returns**</ins> { `number` } - 属性整数，或底层访问失败时的回退值

读取整数系统属性。当前实现要求显式提供默认值；省略默认值会抛出参数异常。

```js
let sdk = sysprops.getInt('ro.build.version.sdk', 0);
console.log(sdk >= 0); // true
```

### sysprops.getBoolean(propName, defaultValue)

**v6.6.0**

- **propName** { `string` } - 系统属性名
- **defaultValue** { `boolean` } - 必填布尔回退值
- <ins>**returns**</ins> { `boolean` } - 属性布尔值，或底层访问失败时的回退值

读取布尔系统属性。当前实现要求显式提供默认值；省略默认值会抛出参数异常。

```js
let debuggable = sysprops.getBoolean('ro.debuggable', false);
console.log(typeof debuggable); // boolean
```

### sysprops.getAll(filter?)

### sysprops.getAll(keyFilter?, valueFilter?)

**v6.6.0**

- **filter** { `string | RegExp | object` } - 可选键过滤器，或含键和值过滤条件的对象
- **keyFilter** { `string | RegExp` } - 可选属性名过滤器
- **valueFilter** { `string | RegExp` } - 可选属性值过滤器
- <ins>**returns**</ins> { `object` } - 以属性名为键、属性值为值的普通 JavaScript 对象

无参数时返回全部可读取系统属性。单个字符串或正则表达式只过滤属性名；单个对象可使用 `key` / `keys` 和 `value` / `values` 字段。两个参数分别过滤属性名和属性值。

字符串过滤使用区分大小写的包含匹配，Rhino `RegExp` 使用正则匹配；空值表示不过滤。

```js
let all = sysprops.getAll();
console.log(typeof all); // object

let buildProps = sysprops.getAll('ro.build.');
let releaseProps = sysprops.getAll({
    key: /^ro[.]build[.]/,
    value: /release/i,
});
let sdkProps = sysprops.getAll('ro.build.', /^[0-9]+$/);

console.log(Object.keys(buildProps).length >= 0); // true
console.log(Object.keys(releaseProps).length >= 0); // true
console.log(Object.keys(sdkProps).length >= 0); // true
```

### 异常、权限与执行特性

- `get`、`getInt`、`getBoolean` 只接受 1 至 2 个参数；`getAll` 最多接受 2 个参数。数量不符会抛出异常。
- `getInt` 和 `getBoolean` 必须提供非空默认值；默认值会分别转换为整数或布尔值。
- 单项读取依赖 Android 隐藏系统属性接口。接口不可用或反射调用失败时，方法记录日志并返回默认值。
- `getAll` 会同步启动系统 `getprop` 进程、读取标准输出，然后关闭读取器并销毁进程；失败时记录日志并返回已收集的数据，通常为空对象。
- 本模块没有写操作，通常不需要 root 权限，但具体可见属性由 Android 版本和设备策略决定。
- `getAll` 涉及进程和 I/O，不宜在对响应时间敏感的 UI 路径中高频调用；其副作用是短暂创建 `getprop` 子进程。
- 子进程、读取器以及模块生命周期均由实现管理；模块自身不保留需要调用方关闭的资源。

<!-- api-contracts:start -->

## API 合同表

下表覆盖本页在产品版本 `6.7.0` 中的每个 canonical 公共成员。每行同时给出稳定锚点、实现合同、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Y2FsbDpzeXNwcm9wcw"></a> `call:sysprops` | `sysprops(...args)` · 实现合同  | 参数：按实现合同声明；可选项与默认值见本页说明或页面约束 | 返回：Augmentable(scriptRuntime), Invokable；参数校验、状态或底层异常原样传播 | 权限：读取可见系统属性通常无需权限，受限属性由系统拒绝；线程：读取和 getprop 过滤同步执行 | 生命周期：无持久资源；副作用：只读，不设置或删除系统属性 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sysprops);` |
| <a id="api-symbol-bW9kdWxlOnN5c3Byb3Bz"></a> `module:sysprops` | `sysprops` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：读取可见系统属性通常无需权限，受限属性由系统拒绝；线程：读取和 getprop 过滤同步执行 | 生命周期：无持久资源；副作用：只读，不设置或删除系统属性 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sysprops);` |
| <a id="api-symbol-c3lzcHJvcHMuZ2V0"></a> `sysprops.get` | `sysprops.get(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：读取可见系统属性通常无需权限，受限属性由系统拒绝；线程：读取和 getprop 过滤同步执行 | 生命周期：无持久资源；副作用：只读，不设置或删除系统属性 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sysprops.get);` |
| <a id="api-symbol-c3lzcHJvcHMuZ2V0QWxs"></a> `sysprops.getAll` | `sysprops.getAll(...args)` · 实现合同  | 参数：0 至 2 个参数；可选项与默认值见本页说明或页面约束 | 返回：NativeObject；参数校验、状态或底层异常原样传播 | 权限：读取可见系统属性通常无需权限，受限属性由系统拒绝；线程：读取和 getprop 过滤同步执行 | 生命周期：无持久资源；副作用：只读，不设置或删除系统属性 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sysprops.getAll);` |
| <a id="api-symbol-c3lzcHJvcHMuZ2V0Qm9vbGVhbg"></a> `sysprops.getBoolean` | `sysprops.getBoolean(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：读取可见系统属性通常无需权限，受限属性由系统拒绝；线程：读取和 getprop 过滤同步执行 | 生命周期：无持久资源；副作用：只读，不设置或删除系统属性 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sysprops.getBoolean);` |
| <a id="api-symbol-c3lzcHJvcHMuZ2V0SW50"></a> `sysprops.getInt` | `sysprops.getInt(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：读取可见系统属性通常无需权限，受限属性由系统拒绝；线程：读取和 getprop 过滤同步执行 | 生命周期：无持久资源；副作用：只读，不设置或删除系统属性 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof sysprops.getInt);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: sysprops');
```

<!-- api-contracts:end -->
