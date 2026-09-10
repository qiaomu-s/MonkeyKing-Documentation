# Storage (存储类)

## Rhino 2.0 运行时合同

Storage 是 `storages.create(name)` 在 Monkey King **v6.7.0** 固定源码中返回的 `StorageNativeObject`。旧成员无法恢复首次发布版本时统一标记为 **≤ v6.6.4（旧文档未记录精确版本）**。

- **权限与线程**：使用应用内部 SharedPreferences，不需要额外 Android 运行时权限。`put`、`remove`、`clear` 与 `selfRemove` 使用异步 `apply()`；对应 `Sync` 方法使用同步 `commit()`，可能阻塞调用线程。
- **生命周期与副作用**：数据跨脚本持久化，直到显式删除、应用数据被清除或应用卸载。所有写入、删除与清空方法都会修改持久化状态。
- **异常**：方法必须以 Storage 实例作为 `this`；参数数量错误、写入 `undefined`、JSON 序列化失败或存储名为 nullish 时同步抛出异常。
- **返回值**：除 `get` 外，当前固定源码中的实例方法均返回 Storage 本身以支持链式调用。特别注意：`contains(key)` 当前也返回 Storage，而不是布尔值；这是固定源码行为。

```js
// Rhino 2.0
const storage = storages.create('storage-contract');
storage.putSync('enabled', true);
console.log(storage.get('enabled')); // true
console.log(storage.name);           // storage-contract
console.log(storage.size);           // 至少为 1
storage.selfRemoveSync('storage-contract');
```

存储类 Storage 是一个虚拟类, 实例通常由 [storages](../system/storages.md) 全局模块产生:

```js
/* Storage 为虚拟类, 并非真实存在. */
typeof global.Storage; // "undefined"

let sto = storages.create('test');
sto._storage instanceof com.qiaomu.monkeyking.core.storage.LocalStorage; // true
```

常见相关方法或属性:

- [storages.create](../system/storages.md#m-create)

---

<p style="font: bold 2em sans-serif; color: #FF7043">Storage</p>

---

## [m#] put

### put(key, value)

**`[6.3.0]`**

- **key** { [string](data-types.md#string) } - 待存入键名
- **value** { [AnyBut](data-types.md#anybut)[<](data-types.md#generic)[undefined](data-types.md#undefined), [bigint](../../reference/glossaries/glossary.md#bigint)[>](data-types.md#generic) } - 待存入数据
- <ins>**returns**</ins> { [Storage](storage.md) }

将 `value` 参数经 JSON 序列化后, 与 `key` 参数以键值对形式存入本地存储.

支持存入的数据类型:

- [number](data-types.md#number)
- [boolean](data-types.md#boolean)
- [string](data-types.md#string)
- [null](data-types.md#null)
- [Array](data-types.md#array)
- [Object](data-types.md#object)
- ... ...

理论上, 除 [undefined](data-types.md#undefined) 和 [bigint](../../reference/glossaries/glossary.md#bigint) 外的任意类型数据均可存入本地存储,<br>
试图存入不支持类型的数据时, 将抛出异常.

存入时, 由 [JSON.stringify](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) 序列化数据为 [string](data-types.md#string) 类型后再存入,<br>
因此数据转换时遵循 JSON 序列化规则 (如 NaN 将被转换为 null 等).

```js
let sto = storages.create('fruit');
sto.put('total', 500); /* 存入数字. */
sto.put('products', [ 'apple', 'banana' ]); /* 存入数组时将被 JSON 序列化.  */
```

链式调用:

```js
let sto = storages.create('test');
sto.put('a', 1).put('b', 2).put('c', 3).put('d', 4);
```

## [m#] get

### get(key, defaultValue?)

**`Overload [1-2]/2`**

- **key** { [string](data-types.md#string) } - 数据的键名
- **[ defaultValue ]** { [any](data-types.md#any) } - 数据默认值
- <ins>**returns**</ins> { [any](data-types.md#any) }

读取本地存储中键值与 `key` 参数对应的数据.

当本地存储中不存在键值 `key` 时, 返回 [undefined](data-types.md#undefined).

本地存储中返回的数据, 来源于 put 方法的 value 参数:

```js
let sto = storages.create('test');

sto.put('apple', 10); /* 原始数据是 number 类型的 10. */
sto.get('apple'); /* 获取的数据依然是 number 类型的 10. */

sto.put('fruits', [ 'apple', 'banana' ]); /* 原始数据是字符串数组. */
sto.get('fruits'); /* 获取的数据还原为同类型的字符串数组, 即 ['apple', 'banana']. */
```

存入时, 由 [JSON.stringify](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) 序列化数据为 [string](data-types.md#string) 类型后再存入,<br>
读取时, 由 [JSON.parse](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) 还原为原本的数据类型.

因此部分数据受 JSON 序列化的影响, 可能导致读取数据与原始数据存在差距:

```js
sto.put('apple', NaN); /* 原始数据是 number 类型的 NaN. */
sto.get('apple'); /* 获取的数据是 null. */
```

## [m#] contains

### contains(key)

- **key** { [string](data-types.md#string) } - 键名
- <ins>**returns**</ins> { [Storage](storage.md) } - 固定源码返回当前 Storage，而不是布尔值

底层会检查本地存储中是否存在键值 `key`，但当前 `StorageNativeObject` 通过链式包装返回当前 Storage 实例，布尔检查结果不会暴露给脚本。不要把返回值当作存在性判断；需要判断时可结合 `get(key, sentinel)` 使用哨兵值。

```js
let sto = storages.create('fruit');
const missing = {};
if (sto.get('apple', missing) === missing) {
    sto.putSync('apple', 10);
}
```

## [m#] remove

### remove(key)

- **key** { [string](data-types.md#string) } - 键名
- <ins>**returns**</ins> { [Storage](storage.md) }

移除本地存储中键值 `key` 对应的数据.

```js
let sto = storages.create('fruit');
sto.remove('apple').remove('banana').remove('cherry');
```

## [m#] clear

### clear()

- <ins>**returns**</ins> { [Storage](storage.md) }

通过 SharedPreferences `apply()` 异步提交清空操作，并返回当前 Storage。

```js
let sto = storages.create('fruit');
sto.put('apple', 10);
sto.get('apple'); // 10
sto.clear();
sto.get('apple'); // undefined
```

## 固定源码补充成员

### storage.name

- <ins>**returns**</ins> { [string](data-types.md#string) }

创建 Storage 时使用的命名空间。属性在实例初始化后保持不变。

### storage.size

- <ins>**returns**</ins> { [number](data-types.md#number) }

动态读取当前命名空间中的键数量；每次访问都会查询底层存储。

### storage.putSync(key, value)

参数、序列化与异常合同与 `put(key, value)` 相同，但使用 SharedPreferences `commit()` 同步落盘。返回当前 Storage；调用可能阻塞当前线程。

### storage.removeSync(key)

参数与 `remove(key)` 相同，使用 `commit()` 同步删除并返回当前 Storage。

### storage.clearSync()

无参数，使用 `commit()` 同步清空整个命名空间并返回当前 Storage。

### storage.selfRemove(name)

当前固定源码要求 **恰好 1 个** `name` 参数，并调用 `storages.remove(name)` 的异步删除路径；它不会自动采用 `storage.name`。返回当前 Storage。

### storage.selfRemoveSync(name)

当前固定源码同样要求 **恰好 1 个** `name` 参数，使用 `storages.removeSync(name)` 同步删除指定命名空间，并返回当前 Storage。

```js
const storage = storages.create('temporary-contract');
storage
    .putSync('answer', 42)
    .removeSync('answer')
    .clearSync()
    .selfRemoveSync('temporary-contract');
```
