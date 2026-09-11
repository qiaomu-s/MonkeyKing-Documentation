# 存储 (Storages)

storages 模块可用于保存 [ 简单数据 / 配置信息 / 列表清单 ] 等.<br>
保存的数据在脚本间共享, 因此不适于敏感数据的存储.

保存数据时, 需要一个名称, 类似命名空间.<br>
一个名称对应一个独立的本地存储.<br>
但无法像 Web 开发中 LocalStorage 一样提供域名独立的存储, 因为脚本路径可能随时改变.

保存的数据仅在以下情况下会被删除:

- Monkey King 应用被卸载或清除数据
- 使用 [storages.remove](#m-remove) / [Storage#remove](../types/storage.md#m-remove) / [Storage#clear](../types/storage.md#m-clear) 等方法删除

支持存入的数据类型:

- [number](../types/data-types.md#number)
- [boolean](../types/data-types.md#boolean)
- [string](../types/data-types.md#string)
- [null](../types/data-types.md#null)
- [Array](../types/data-types.md#array)
- [Object](../types/data-types.md#object)
- 其他可被 `JSON.stringify` 序列化的复合值；不支持 `undefined`、`bigint`、函数和循环引用

具体的存入规则详见 [Storage#put](../types/storage.md#m-put) 小节.

存入时, 由 [JSON.stringify](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) 序列化数据为 [string](../types/data-types.md#string) 类型后再存入,<br>
读取时, 由 [JSON.parse](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) 还原为原本的数据类型.

---

<p style="font: bold 2em sans-serif; color: #FF7043">storages</p>

---

## [m] create

### create(name)

- **name** { [string](../types/data-types.md#string) } - 存储名称
- <ins>**returns**</ins> { [Storage](../types/storage.md) }

以 `name` 参数为名称创建一个本地存储, 并返回 [Storage](../types/storage.md) 实例:

```js
/* 创建一个名为 fruit 的本地存储. */
let sto = storages.create('fruit');

/* 存入 "键值对" 数据. */
sto.put('apple', 10);
sto.put('banana', 20);

/* 访问数据. */
sto.get('apple'); // 10
sto.get('banana'); // 20
sto.get('cherry'); // undefined
```

不同的 `name` 参数可以创建不同的本地存储:

```js
let stoFruit = storages.create('fruit');
let stoPhone = storages.create('phone');

/* "键" 名均为 apple, 不同的本地存储之间数据独立. */
stoFruit.put('apple', 7);
stoPhone.put('apple', 3);

/* 访问数据 */
stoFruit.get('apple') // 7
stoPhone.get('apple') // 3
```

如果 `name` 参数对应的本地存储已存在, 则返回一个本地存储副本:

```js
let sto = storages.create('fruit');
sto.put('apple', 10);

/* 名为 fruit 的本地存储已创建, 因此返回的是存储副本. */
let stoCopied = storages.create('fruit');

/* 虽然 stoCopied 没有存入 apple 数据, 但 fruit 本地存储中存在. */
stoCopied.get('apple'); // 10

/* 副本与原始的本地存储并非引用关系. */
sto === stoCopied; // false
```

为保证数据安全及唯一性, `name` 参数应尽量具体:

```js
storages.create('project-publishing-schedule');
```

## [m] remove

### remove(name)

- **name** { [string](../types/data-types.md#string) } - 存储名称
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - name 参数对应的本地存储是否存在

清除名为 `name` 的本地存储包含的全部数据.

如果名为 `name` 的本地存储已存在, 返回 `true`, 否则返回 `false`.

```js
let sto = storages.create('fruit');
sto.put('apple', 10);
sto.get('apple'); // 10

/* 相当于 storages.create('fruit').clear(); . */
storages.remove('fruit'); // true

/* 执行 remove 方法后, sto 对象将不存在任何存储数据. */
sto.get('apple'); // undefined

/* 但 sto 依然可以存放新的数据. */
sto.put('banana', 20);
sto.get('banana'); // 20
```

<!-- api-contracts:start -->

## API 合同表

下表覆盖本页在产品版本 `6.7.0` 中的每个 canonical 公共成员。每行同时给出稳定锚点、实现合同、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-bW9kdWxlOnN0b3JhZ2Vz"></a> `module:storages` | `storages` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storages);` |
| <a id="api-symbol-c3RvcmFnZXMuYWxs"></a> `storages.all` | `storages.all()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：NativeArray；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storages.all);` |
| <a id="api-symbol-c3RvcmFnZXMuY3JlYXRl"></a> `storages.create` | `storages.create(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storages.create);` |
| <a id="api-symbol-c3RvcmFnZXMubmFtZXM"></a> `storages.names` | `storages.names()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：NativeArray；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storages.names);` |
| <a id="api-symbol-c3RvcmFnZXMucmVtb3Zl"></a> `storages.remove` | `storages.remove(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storages.remove);` |
| <a id="api-symbol-c3RvcmFnZXMucmVtb3ZlU3luYw"></a> `storages.removeSync` | `storages.removeSync(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：运行时值；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storages.removeSync);` |
| <a id="api-symbol-c3RvcmFnZXMucmVzdWx0LmNsZWFy"></a> `storages.result.clear` | `storage.clear()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：StorageNativeObject；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storage.clear);` |
| <a id="api-symbol-c3RvcmFnZXMucmVzdWx0LmNsZWFyU3luYw"></a> `storages.result.clearSync` | `storage.clearSync()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：StorageNativeObject；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storage.clearSync);` |
| <a id="api-symbol-c3RvcmFnZXMucmVzdWx0LmNvbnRhaW5z"></a> `storages.result.contains` | `storage.contains()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：StorageNativeObject；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storage.contains);` |
| <a id="api-symbol-c3RvcmFnZXMucmVzdWx0LmdldA"></a> `storages.result.get` | `storage.get(...args)` · 实现合同  | 参数：恰好 2 个参数；可选项与默认值见本页说明或页面约束 | 返回：Any?；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storage.get);` |
| <a id="api-symbol-c3RvcmFnZXMucmVzdWx0Lm5hbWU"></a> `storages.result.name` | `storage.name` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(storage.name);` |
| <a id="api-symbol-c3RvcmFnZXMucmVzdWx0LnB1dA"></a> `storages.result.put` | `storage.put(...args)` · 实现合同  | 参数：恰好 2 个参数；可选项与默认值见本页说明或页面约束 | 返回：StorageNativeObject；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storage.put);` |
| <a id="api-symbol-c3RvcmFnZXMucmVzdWx0LnB1dFN5bmM"></a> `storages.result.putSync` | `storage.putSync(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：StorageNativeObject；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storage.putSync);` |
| <a id="api-symbol-c3RvcmFnZXMucmVzdWx0LnJlbW92ZQ"></a> `storages.result.remove` | `storage.remove(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：StorageNativeObject；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storage.remove);` |
| <a id="api-symbol-c3RvcmFnZXMucmVzdWx0LnJlbW92ZVN5bmM"></a> `storages.result.removeSync` | `storage.removeSync(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：StorageNativeObject；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storage.removeSync);` |
| <a id="api-symbol-c3RvcmFnZXMucmVzdWx0LnNlbGZSZW1vdmU"></a> `storages.result.selfRemove` | `storage.selfRemove(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：StorageNativeObject；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storage.selfRemove);` |
| <a id="api-symbol-c3RvcmFnZXMucmVzdWx0LnNlbGZSZW1vdmVTeW5j"></a> `storages.result.selfRemoveSync` | `storage.selfRemoveSync(arg)` · 实现合同  | 参数：恰好 1 个参数；可选项与默认值见本页说明或页面约束 | 返回：StorageNativeObject；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof storage.selfRemoveSync);` |
| <a id="api-symbol-c3RvcmFnZXMucmVzdWx0LnNpemU"></a> `storages.result.size` | `storage.size` · 实现合同  | 属性访问；无调用参数 | 返回：属性值；参数校验、状态或底层异常原样传播 | 权限：应用内部存储无需额外权限；线程：Sync 后缀同步完成，其余写操作走实现的异步路径 | 生命周期：数据跨脚本持久化直到删除或清除应用数据；副作用：写、删和清空会修改本地存储 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(storage.size);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: storages');
```

<!-- api-contracts:end -->
