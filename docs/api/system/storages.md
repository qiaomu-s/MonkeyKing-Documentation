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
- ... ...

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
