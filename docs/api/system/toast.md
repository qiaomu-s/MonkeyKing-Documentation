# 消息浮动框 (Toast)

toast 模块用于 [消息浮动框](https://developer.android.com/guide/topics/ui/notifiers/toasts?hl=zh-cn) 的 [ 显示 / 消除 / 定制 ] 等.

部分操作系统的 toast 消息可能无法按队列依次显示, 新的 toast 消息直接覆盖之前的 toast 消息.

可能出现上述异常的操作系统:

- API 级别 28 (安卓 9) [P]
- 鸿蒙 (HarmonyOS) 2

部分机型需授予 "后台弹出页面" 权限才能正常显示 toast 消息.

可能依赖上述权限的设备及操作系统:

- 小米 (XiaoMi / Redmi / BlackShark) - MIUI
- 维沃 (VIVO / IQOO) - Funtouch OS / OriginOS
- 欧珀 (OPPO / Realme) - ColorOS

部分机型的 toast 消息正常显示依赖通知权限, 当未授予通知权限或通知被 `阻止 (block)` 时, toast 可能无法正常显示, 参阅 [notice.isEnabled](notice.md#m-isenabled) 小节.

---

<p style="font: bold 2em sans-serif; color: #FF7043">toast</p>

---

## [@] toast

toast 可作为全局对象使用:

```js
typeof toast; // "function"
typeof toast.dismissAll; // "function"
```

### toast(text)

**`Global`** **`Overload 1/4`** **`Async`**

- **text** { [string](../types/data-types.md#string) } - 消息内容
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

显示一个消息浮动框.

消息框的显示默认是依次进行的:

```js
/* 显示消息框 2 秒钟. */
toast("hello");
/* 显示消息框 2 秒钟, 且在前一个消息框消失后才显示. */
toast("world");
/* 显示消息框 2 秒钟, 且在前一个消息框消失后才显示. */
toast("hello world");
```

### toast(text, isLong)

**`Global`** **`Overload 2/4`** **`Async`**

- **text** { [string](../types/data-types.md#string) } - 消息内容
- **isLong = false** { `'long'` | `'l'` | `'short'` | `'s'` | [boolean](../types/data-types.md#boolean) } - 是否以较长时间显示
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

控制单个消息框显示时长:

```js
toast("hello", 'long'); /* 显示消息框 3.5 秒钟. */
toast("hello", true); /* 同上. */
```

> 注: 仅有 [ 长 / 短 ] 两种时长, 此时长由安卓系统决定.<br>
> 通常, 短时为 2 秒, 长时为 3.5 秒.

### toast(text, isLong, isForcible)

**`Global`** **`Overload 3/4`** **`Async`**

- **text** { [string](../types/data-types.md#string) } - 消息内容
- **isLong = false** { `'long'` | `'l'` | `'short'` | `'s'` | [boolean](../types/data-types.md#boolean) } - 是否以较长时间显示
- **isForcible = false** { `'forcible'` | `'f'` | [boolean](../types/data-types.md#boolean) } - 是否强制覆盖显示
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

使用 "强制覆盖显示" 参数可立即显示消息框:

```js
toast("hello");
/* 显示消息框 2 秒钟, 且立即显示, 前一个消息框 "hello" 被 "覆盖". */
toast("world", "short", "forcible");
```

> 注: 强制覆盖仅对当前脚本有效, 对其他脚本及应用程序无效.

### toast(text, isForcible)

**`Global`** **`Overload 4/4`** **`Async`**

- **text** { [string](../types/data-types.md#string) } - 消息内容
- **isForcible** { `'forcible'` | `'f'` } - 强制覆盖显示 (字符标识)
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }

此方法相当于忽略 isLong 参数:

```js
toast("hello");
/* 显示消息框 2 秒钟, 且立即显示, 前一个消息框 "hello" 被 "覆盖". */
toast("world", "forcible");
```

> 注: 此方法的 isForcible 参数只能为具有明确意义的字符标识, 不能为 boolean 类型或其他类型, 否则 isForcible 将被视为 isLong.

## [m] dismissAll

### dismissAll()

**`Global`** - <ins>**returns**</ins> { [void](../types/data-types.md#void) }

强制消除所有由 Monkey King 产生的消息框, 包括正在显示的及等待显示的.

使用方式:

```js
toast.dismissAll(); /* 立即消除所有消息框. */
```

示例:

```js
toast("hello");
toast("world");
toast("of");
toast("JavaScript");

sleep(1e3);

/* "hello" 显示 1 秒后消失, "world" 及其他消息框均不再显示. */
/* 若无 sleep 语句, 由于 toast 是异步的, 上述消息框均不会显示. */
toast.dismissAll();

/* dismissAll 仅对已在队列中的消息框有效, 因此下述消息框正常显示. */
toast("forcibly dismissed");
```

> 注: 强制取消显示仅对当前脚本有效, 对其他脚本及应用程序无效.

<!-- fixed-source-contracts:start -->

## 固定源码合同表

下表覆盖本页在固定提交 `bafa2986212d` 中的每个 canonical 公共成员。每行同时给出稳定锚点、源码位置、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-Y2FsbDp0b2FzdA"></a> `call:toast` | `toast(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/toast/Toast.kt:L30` | 参数：0 至 3 个参数；可选项与默认值见本页说明或源码守卫 | 返回：Undefined；参数校验、状态或底层异常原样传播 | 权限：普通 Toast 无额外权限；线程：显示请求交给 Android UI 处理 | 生命周期：Toast 由系统短暂显示；副作用：显示提示并可能替换当前 Toast | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof toast);` |
| <a id="api-symbol-bW9kdWxlOnRvYXN0"></a> `module:toast` | `toast` 模块入口 · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/ScriptRuntime.kt:L786` | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；初始化或目标成员异常原样传播 | 权限：普通 Toast 无额外权限；线程：显示请求交给 Android UI 处理 | 生命周期：Toast 由系统短暂显示；副作用：显示提示并可能替换当前 Toast | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof toast);` |
| <a id="api-symbol-dG9hc3QuZGlzbWlzc0FsbA"></a> `toast.dismissAll` | `toast.dismissAll(...args)` · 固定源码 `app/src/main/java/com/qiaomu/monkeyking/runtime/api/augment/toast/Toast.kt:L50` | 参数：按固定源码声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按固定源码声明；参数校验、状态或底层异常原样传播 | 权限：普通 Toast 无额外权限；线程：显示请求交给 Android UI 处理 | 生命周期：Toast 由系统短暂显示；副作用：显示提示并可能替换当前 Toast | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof toast.dismissAll);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: toast');
```

<!-- fixed-source-contracts:end -->
