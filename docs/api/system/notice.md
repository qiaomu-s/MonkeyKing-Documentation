# 消息通知 (Notice)

`notice` 与 `$notice` 指向同一个可调用模块对象；`notice.builder` 每次读取都会创建新的 AndroidX `NotificationCompat.Builder`。本文于 2026-09-10 按 Monkey King 6.7.0 源码提交 `bafa2986212d27b6b59f1324f89548b72a810966` 核对。

发送通知会写入系统通知栏；创建、修改和删除渠道会改变应用级系统设置。Android 8.0 及以上使用通知渠道，渠道提交后除名称和描述外的大部分属性不能由应用自由提高或修改；Android 13 及以上还可能需要用户授予通知权限。

notice 模块用于创建并显示消息通知.

位于通知栏的消息, 可用于 [ 消息提醒 / 信息通信 / 执行操作 ] 等.

> 注: 不同安卓系统的通知表现可能存在较大差异, 与文档描述也可能存在出入.

## 简单操作

显示一条通知:

```js
/* 内容为 hello (标题为空). */
notice('hello');

/* 标题为 new message, 内容为 hello. */
notice('new message', 'hello');

/* 标题为 new message, 内容为 hello. */
notice({ title: 'new message', content: 'hello' });

/* 标题为 new message, 内容为 hello. */
notice(notice.getBuilder()
    .setContentTitle('new message')
    .setContentText('hello'));
```

显示两条独立的通知:

```js
notice('hello');
notice('world');
```

显示两条可覆盖的通知:

```js
/* 方法 A: 通过指定相同的通知 ID 实现通知覆盖. */

let id = 5; /* 任意 ID 均可, 用于区分不同的通知. */

notice('hello', { notificationId: id }); /* 指定一个通知 ID. */
sleep(1e3); /* 阻塞 1 秒. */
notice('world', { notificationId: id }); /* 通知 ID 相同, 因此 1 秒后上一条通知被替代 (覆盖). */

/* 方法 B: 通过 notice.config 配置 notice 的默认选项. */

notice.config({ useDynamicDefaultNotificationId: false }); /* 禁用动态通知 ID 选项. */
notice('hello');
sleep(1e3); /* 阻塞 1 秒. */
notice('world'); /* 1 秒后上一条通知被替代 (覆盖). */
```

显示一条定制通知:

```js
notice('hello', {
    bigContent: 'This is a message which says "hello"\n-- from Monkey King', /* 设置长内容. */
    isSilent: true, /* 静音模式. */
    appendScriptName: 'content', /* 附加脚本名称到内容结尾. */
    intent: 'docs', /* 点击通知后跳转到 Monkey King 的文档页面. */
    autoCancel: true, /* 点击通知后自动移除通知. */
});

/* 更多配置选项, 可参阅本章节后续内容. */
```

如果需要发送多条上述定制通知, 可将上述定制选项提取出来:

```js
/* 定义一个定制通知选项变量. */
let options = {
    bigContent: 'This is a message which says "hello"\n-- from Monkey King', /* 设置长内容. */
    isSilent: true, /* 静音模式. */
    appendScriptName: 'content', /* 附加脚本名称到内容结尾. */
    intent: 'docs', /* 点击通知后跳转到 Monkey King 的文档页面. */
    autoCancel: true, /* 点击通知后自动移除通知. */
};

/* 以上述定制选项发送三条通知. */

notice('hello', options);
notice('world', options);
notice('tour', options);
```

上述示例指定通知 ID 可实现通知覆盖:

```js
/* 指定一个通知 ID 为固定值. */
options.notificationId = 20;

/* 以上述定制选项发送三条可覆盖的通知. */

notice('hello', options);
sleep(1e3);
notice('world', options); /* 1 秒后覆盖 'hello'. */
sleep(1e3);
notice('tour', options); /* 1 秒后覆盖 'world'. */

/* options 可随时进行定制修改. */

delete options.bigContent; /* 删除长内容. */
sleep(1e3);
notice('movie', options); /* 1 秒后覆盖 'tour' */

options.intent = 'home'; /* 修改 intent 属性. */
sleep(1e3);
notice('here', options); /* 1 秒后覆盖 'movie' */
```

## 通知渠道

`通知渠道 (Notification Channel)` 用于分类管理通知.

例如设置两个渠道, 水果和天气. 水果渠道用于发送与水果销量变化相关的通知, 天气渠道用于发送气象数据变化相关的通知.

不同渠道的通知可分别定制, 如是否弹出通知, 是否振动, 通知指示灯开关及颜色, 是否静音等. 渠道之间的设置是互相独立的.

> 更多通知渠道的内容, 参阅 [通知渠道](../../reference/glossaries/notification-channels.md) 术语章节.

> notice 模块的渠道相关方法, 参阅 [notice.channel](#p-channel) 小节.

### 创建渠道

通知渠道使用 `渠道 ID (Channel ID)` 作为唯一标识.

以渠道 ID 名称 `'my_channel_id'` 为例, 当 ID 为 `'my_channel_id'` 的渠道从未创建时, `channel.create('my_channel_id', options)` 将创建一个新的渠道, 其 ID 为 `'my_channel_id'`.

```js
notice.channel.create('my_channel_id', {
    name: 'New message',
    description: 'Messages from David',
    importance: 3,
    enableLights: true,
    lightColor: 'blue',
    enableVibration: true,
});
```

上述示例代码创建了一个新渠道, 并进行了渠道配置, 包括 [ 名称 (name) / 描述 (description) / 优先级 (importance) / 启动指示灯且设置为蓝色 / 启用振动 ].

创建渠道后, 使用渠道 ID 可以在渠道内显示通知:

```js
/* 简单通知. */
notice('hello', { channelId: 'my_channel_id' });

/* 设置一些选项. */
notice('hello', {
    channelId: 'my_channel_id',
    isSilent: true, /* 静音模式. */
    intent: 'homepage', /* 点击通知后跳转到 Monkey King 的主页页面. */
    autoCancel: true, /* 点击通知后自动移除通知. */
});
```

### 修改渠道

以渠道 ID 名称 `'my_channel_id'` 为例, 当 ID 为 `'my_channel_id'` 的渠道已存在 (且未经删除) 时, `channel.create('my_channel_id', options)` 将修改这个渠道的相关配置.

```js
notice.channel.create('my_channel_id', {
    name: 'New message',
    description: 'There is a new message from David',
    importance: 3,
});
```

上述示例代码修改了渠道配置, 包括 [ 名称 (name) / 描述 (description) / 优先级 (importance) ].

需额外留意, 渠道的修改并非总是生效的, 需满足以下规则:

- 名称 (name) 允许修改
- 描述 (description) 允许修改
- 优先级 (importance) 需同时满足以下两个条件方可修改
    - 优先级降级修改
    - 用户从未修改当前渠道的优先级
- 除上述 [ 名称 / 描述 / 优先级 ] 外, 其他所有属性均无法修改

### 恢复渠道

以渠道 ID 名称 `'my_channel_id'` 为例, 当 ID 为 `'my_channel_id'` 的渠道通过 `channel.remove()` 被删除时, `channel.create('my_channel_id', options)` 将重新恢复之前被删除的渠道 (反删除), 且附带之前渠道的所有配置.

这样的设计是防止应用通过代码的方式恶意篡改用户对通知渠道的配置.

### 渠道放权

使用代码创建渠道时, 可自定义渠道的默认通知行为, 如指示灯颜色及是否振动等.

但渠道创建后, 将无法通过代码更改这些设置 (除上面提到的名称, 描述, 和受条件限制的优先级之外).

对于渠道的设置, 用户拥有最终控制权.

---

<p style="font: bold 2em sans-serif; color: #FF7043">notice</p>

---

## [@] notice

notice 可作为全局对象使用:

```js
typeof notice; // "function"
typeof notice.channel; // "object"
typeof notice.getBuilder; // "function"
```

所有 `notice` 调用形式最多接受 3 个参数，并同步向 Android 通知服务提交通知。content/title 重载要求相应位置为字符串，builder 重载最多接受 2 个参数，且其 options 必须是 JavaScript 对象；其他带 options 的重载也会校验 options 所在参数。priority、intent 或渠道配置不合法时抛出异常。固定提交中，无法匹配字符串或 builder 的单个首参数会按空 options 处理并发送默认测试通知。若 `POST_NOTIFICATIONS` 权限检查未通过，调用会在提交给 NotificationManager 之前同步抛出 RuntimeException，而不是仅由系统静默拒绝显示。

```js
try {
    notice('需要通知权限');
} catch (error) {
    console.error(error); // 权限检查失败时在提交前同步到达这里
}
```

### notice(content)

**`6.3.0`** **`Global`** **`Overload 1/8`**

- **content** { [string](../types/data-types.md#string) } - 通知消息的内容
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - 通知 ID

发送通知, 包含内容.

```js
notice('hello');
```

### notice(title, content)

**`6.3.0`** **`Global`** **`Overload 2/8`**

- **title** { [string](../types/data-types.md#string) } - 通知消息的标题
- **content** { [string](../types/data-types.md#string) } - 通知消息的内容
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - 通知 ID

发送通知, 包含标题及内容.

```js
notice('message', 'hello');
```

> 注: 第 1 个 (索引 0) 参数代表标题, 第 2 个 (索引 1) 参数代表内容.

### notice()

**`6.3.0`** **`Global`** **`Overload 3/8`**

- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - 通知 ID

发送通知, 主要用于测试.

该测试通知包含标题及内容.

```js
// 以 Monkey King 语言为 English 为例,
// 标题为 Script notification,
// 内容为 Notification from script.
notice();
```

### notice(options)

**`6.3.0`** **`Global`** **`Overload 4/8`**

- **options** { [NoticeOptions](../types/notice-options.md) } - 通知选项配置
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - 通知 ID

发送通知, 并进行选项配置.

```js
notice({
    bigContent: 'This is a message which says "hello"\n-- from Monkey King', /* 设置长内容. */
    isSilent: true, /* 静音模式. */
    appendScriptName: 'content', /* 附加脚本名称到内容结尾. */
    intent: 'settings', /* 点击通知后跳转到 Monkey King 的设置页面. */
    autoCancel: true, /* 点击通知后自动移除通知. */
});
```

更多配置选项, 可参阅 [NoticeOptions](../types/notice-options.md) 类型章节.

### notice(content, options)

**`6.3.0`** **`Global`** **`Overload 5/8`**

- **content** { [string](../types/data-types.md#string) } - 通知消息的内容
- **options** { [NoticeOptions](../types/notice-options.md) } - 通知选项配置
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - 通知 ID

发送通知, 包含内容, 并进行选项配置.

与 `notice(options)` 类似, 但增加 `content` 参数.

```js
notice('hello', { isSilent: true });
```

> 注: 内容参数可能重复指定.<br>
> 出现重复指定时, 按以下优先级处理:<br>
> options.content > content

### notice(title, content, options)

**`6.3.0`** **`Global`** **`Overload 6/8`**

- **title** { [string](../types/data-types.md#string) } - 通知消息的标题
- **content** { [string](../types/data-types.md#string) } - 通知消息的内容
- **options** { [NoticeOptions](../types/notice-options.md) } - 通知选项配置
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - 通知 ID

发送通知, 包含标题及内容, 并进行选项配置.

与 `notice(options)` 类似, 但增加 `title` 和 `content` 参数.

```js
notice('message', 'hello', { isSilent: true });
```

> 注: 标题参数与内容参数可能重复指定.<br>
> 出现重复指定时, 按以下优先级处理:<br>
> options.title > title
> options.content > content

### notice(builder)

**`6.3.0`** **`Global`** **`Overload 7/8`**

- **builder** { [NoticeBuilder](../types/notice-builder.md) } - 通知构建器
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - 通知 ID

使用 `通知构建器 (Notice Builder)` 发送通知.

```js
const builder = notice.getBuilder()
    .setContentTitle('任务状态')
    .setContentText('已完成');
const notificationId = notice(builder);
console.log(notificationId);
```

参阅 [getBuilder](#m-getbuilder) 小节.

### notice(builder, options)

**`6.3.0`** **`Global`** **`Overload 8/8`**

- **builder** { [NoticeBuilder](../types/notice-builder.md) } - 通知构建器
- **options** { [NoticeOptions](../types/notice-options.md) } - 通知选项配置
- <ins>**returns**</ins> { [number](../types/data-types.md#number) } - 通知 ID

使用 `通知构建器 (Notice Builder)` 发送通知, 并进行选项配置.

```js
let notificationId = 12;
let progress = 0;
let progressMax = 100;

let builder = notice.getBuilder()
    .setSilent(true)
    .setContentTitle('正在下载应用');

while (progress < progressMax) {
    builder
        .setProgress(progressMax, progress, false)
        .setContentText(`已完成 ${progress}%`);
    notice(builder, { notificationId });
    sleep(50);
    progress += Mathx.randInt(1, 4);
}
builder
    .setContentText(`已完成 ${progressMax}%`)
    .setContentTitle('下载完成')
notice(builder, { notificationId });
```

参阅 [getBuilder](#m-getbuilder) 小节.

## [m] isEnabled

### isEnabled()

**`6.3.0`**

- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) }
- **异常**：传入参数时抛出异常
- **权限 / 副作用**：不发起权限申请，只读查询应用通知开关与通知权限状态

检测 Monkey King 的通知是否未被阻止 (not blocked).

通常的阻止 (block) 情况:

- 通知全局开关默认未开启或被用户关闭
- 通知权限 `Manifest.permission.POST_NOTIFICATIONS` 未授予或被撤回

```js
console.log(notice.isEnabled()); /* e.g. true */
```

部分机型的 toast 功能依赖通知权限, 如需在使用 toast 时检查通知权限是否被阻止, 可使用 `isEnabled` 或 `ensureEnabled` 方法:

```js
if (!notice.isEnabled()) {
    console.warn('通知被阻止, toast 可能无法正常显示');
}
toast('hello');

notice.ensureEnabled();
toast('hello');
```

结合 [notice.launchSettings](#m-launchsettings) 可辅助用户跳转至通知设置页面:

```js
if (!notice.isEnabled()) {
    notice.launchSettings();
}
```

## [m] ensureEnabled

### ensureEnabled()

**`6.3.0`**

- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：传入参数或当前通知被阻止时抛出异常
- **权限 / 副作用**：通知被阻止时会先尝试启动系统通知设置页，然后抛出异常；不会直接修改系统设置

确保 Monkey King 的通知未被阻止 (not blocked).

当通知被阻止时，`ensureEnabled() 会先尝试打开系统通知设置页，再抛出异常`。因此它不是纯检查接口；只想查询状态时应使用 `isEnabled()`。

```js
try {
    notice.ensureEnabled();
    console.log('通知可用');
} catch (error) {
    console.warn('已尝试打开通知设置，请在设置中启用通知');
}
```

## [m] launchSettings

### launchSettings()

**`6.3.0`**

- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：仅传入参数时由参数守卫抛出；设置页启动失败会被 startSafely 吞掉，不会从此方法传播
- **副作用**：尝试启动 Monkey King 的系统通知设置页面；启动失败时静默返回 `undefined`

跳转至 Monkey King 的通知设置页面.

```js
notice.launchSettings();
// 返回 undefined 不代表设置页一定成功打开。
```

## [m] cancel

### cancel(id)

**`6.3.0`**

- **id** { [number](../types/data-types.md#number) } - 通知 ID
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不为 1 时抛出异常；nullish 或不能转为有效数字的值会静默忽略
- **副作用**：从系统通知栏取消当前应用对应 ID 的通知；不存在时无操作

消除通知.

```js
let id = notice({ title: 'New message' });
/* 2 秒后自动消除通知. */
setTimeout(() => notice.cancel(id), 2e3);
```

## [m] getBuilder

### getBuilder()

**`6.3.0`**

- <ins>**returns**</ins> { [NoticeBuilder](../types/notice-builder.md) }
- **异常**：传入参数时抛出异常；默认 priority 配置非法时也会抛出异常
- **权限 / 副作用**：只创建内存中的新 builder，不发送通知，也不请求权限

获取一个简单通知构建器.

简单通知构建器包含以下默认设置:

- `setSmallIcon(R.drawable.monkeyking_material)` # Monkey King 应用图标作为 smallIcon
- `setPriority(NotificationCompat.PRIORITY_HIGH)` # 高优先级 (仅针对 Android 7.1 及以下)

构建器通常配合 `notice` 方法作为 第 1 个 (索引 0) 参数使用, 即 `notice(notice.getBuilder())`:

```js
let builder = notice.getBuilder();
builder.setContentTitle('Weather condition');
builder.setContentText('The sky is getting dark');
notice(builder);

/* 链式调用使代码更简洁. */

notice(notice.getBuilder()
    .setContentTitle('Weather condition')
    .setContentText('The sky is getting dark'));
```

构建器可用于设置更多通知行为, 如 [setStyle](../types/notice-builder.md#m-setstyle), [setTimeoutAfter](../types/notice-builder.md#m-settimeoutafter), [setProgress](../types/notice-builder.md#m-setprogress) 等.

但需要注意参数类型需严格符合要求, Monkey King 内置的 [全能类型](../types/omni-types.md) 是不可用的.

关于通知构建器的更多用法, 参阅 [NoticeBuilder](../types/notice-builder.md) 类型章节.

## [m] config

config 方法用于修改默认配置, 即用于配置通知渠道与通知发送的默认行为.

例如 `notice('hello')` 会发送一个内容为 "hello" 的通知, 但其中隐含了许多默认的通知行为.

> 注: 初次使用 notice 模块时, 建议先跳过此小节内容, 待了解包括 [channel](#p-channel) 等在内的相关内容后再继续阅读当前小节.

例如, `isSilent` 默认为 `false`, 表示不进行强制静音.<br>
通过 `notice.config` 可配置所有通知发送时, 默认启用强制静音:

```js
notice.config({ defaultIsSilent: true }); /* 通知发送时, 默认强制静音. */
```

执行上述示例代码后, `notice('hello')` 将会静音发送通知.

如果不执行上述代码, 则需要在每一个 notice 方法中加入 `isSilent` 选项设置:

```js
notice('hello', { isSilent: true });
notice('message', { isSilent: true });
notice('finished', { isSilent: true });
notice('all notifications use the same default policy', { isSilent: true });
```

因此, `notice.config` 适用于在同一个脚本或项目中, 有多次使用 `notice` 需求的场景.

> 注: notice.config 配置的是默认行为, 当通过参数明确指定了某个行为时, 默认行为将不会生效.

### config(preset)

**`6.3.0`**

- **preset** { [NoticePresetConfiguration](../types/notice-preset-configuration.md) } - 通知预设配置对象
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数数量不为 1、参数不是 JavaScript 对象、键不存在或对应配置不可写时抛出异常
- **生命周期 / 副作用**：同步修改当前脚本运行时后续通知和渠道创建所用的默认配置；nullish 值会尝试恢复内置默认值

配置通知渠道与通知发送的默认行为.

```js
notice.config({
    useDynamicDefaultNotificationId: false, /* 禁用动态通知 ID. */
    useScriptNameAsDefaultChannelId: false, /* 禁用以脚本名称作为渠道 ID. */
    enableChannelInvalidModificationWarnings: false, /* 禁用渠道修改无效的警告消息. */
    defaultTitle: 'NEW MESSAGE', /* 修改默认通知标题. */
    defaultContent: 'Created by Monkey King',
    defaultPriority: 'default',
});
```

更多可用的默认行为配置, 参阅 [NoticePresetConfiguration](../types/notice-preset-configuration.md) 类型章节.

## [p] builder

### notice.builder

**`6.3.0`** **`Getter`**

- **&lt;get&gt;** { [NoticeBuilder](../types/notice-builder.md) }
- **异常**：notice.builder 与 notice.getBuilder() 相同；当前 `defaultPriority` 不是合法数字或 `default` / `low` / `min` / `high` / `max` 时会抛出异常
- **权限 / 副作用**：读取只创建内存中的新 builder，不发送通知，也不请求权限

每次读取都等价于重新调用 `notice.getBuilder()`，不会复用之前的构建状态。

```js
const first = notice.builder;
const second = notice.builder;
console.log(first !== second); // true

notice.config({ defaultPriority: 'invalid-priority' });
try {
    void notice.builder; // 抛出 Unknown priority
} finally {
    notice.config({ defaultPriority: null }); // 恢复内置默认值
}
```

## [p+] channel

渠道方法同步访问 Android `NotificationManager`。创建或删除会改变应用级系统设置；查询方法只读。Android 8.0 以下不创建真正的渠道。`create` 最多接受 2 个参数，错误的渠道选项值会抛出异常，但第二参数若不是 JavaScript 对象会按空 options 处理。

### [m] create

`channel.create` 可用于 [ [创建](#创建渠道) / [修改](#修改渠道) / [恢复](#恢复渠道) ] 某个特定 `渠道 ID (Channel ID)` 的通知渠道.

详见 [通知渠道](#通知渠道) 小节.

#### create(channelId)

**`6.3.0`** **`Overload 1/3`**

- **channelId** { [string](../types/data-types.md#string) | [number](../types/data-types.md#number) } - 渠道 ID
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 渠道 ID
- **异常 / 副作用**：参数超过 2 个或渠道配置值非法时抛出异常；同步创建、恢复或提交默认配置的渠道

创建通知渠道, 并指定渠道 ID.

```js
let id = 'my_channel_id';
notice.channel.create(id); /* 创建渠道. */
notice('hello', { channelId: id }); /* 发送通知. */
```

#### create(channelId, options)

**`6.3.0`** **`Overload 2/3`**

- **channelId** { [string](../types/data-types.md#string) | [number](../types/data-types.md#number) } - 渠道 ID
- **options** { [NoticeChannelOptions](../types/notice-channel-options.md) } - 渠道创建选项
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 渠道 ID
- **异常 / 副作用**：同上一重载；已存在渠道只会提交系统允许修改的字段

创建通知渠道, 指定渠道 ID 并进行渠道配置.

```js
notice.channel.create('my_channel_id', {
    name: 'New message', /* 渠道名称. */
    description: 'Messages from David', /* 渠道描述. */
    importance: 3, /* 渠道优先级. */
    enableLights: true, /* 启用指示灯. */
    lightColor: 'blue', /* 设置指示灯颜色. */
    enableVibration: true, /* 启用振动. */
});
```

更多渠道配置相关信息, 参阅 [NoticeChannelOptions](../types/notice-channel-options.md) 类型章节.

> 注: 渠道 ID 可能重复指定.<br>
> 出现重复指定时, 按以下优先级处理:<br>
> options.id > channelId

#### create(options)

**`6.3.0`** **`Overload 3/3`**

- **options** { [NoticeChannelOptions](../types/notice-channel-options.md) } - 渠道创建选项
- <ins>**returns**</ins> { [string](../types/data-types.md#string) } - 渠道 ID
- **异常 / 副作用**：options 中 `id` 与配置值非法时抛出异常；同步创建、恢复或修改渠道

创建通知渠道, 与 `create(channelId, options)` 方法类似, 但省略 `channelId` 参数.

如需指定渠道 ID, 可在 `options` 参数中使用 `id` 属性:

```js
notice.channel.create({ id: 'my_channel_id' });
```

当不指定 `id` 时，默认配置会使用当前运行脚本的脚本名称；若关闭 `useScriptNameAsDefaultChannelId`，则使用内置默认渠道 ID。

更多渠道配置相关信息, 参阅 [NoticeChannelOptions](../types/notice-channel-options.md) 类型章节.

合法的 `importance` 字符串为 `unspecified`、`none`、`min`、`low`、`default`、`high`、`max`；`lockscreenVisibility` 为 `public`、`private` 或 `secret`。未知字符串、非数组的 `vibrationPattern` 等无效参数会抛出异常。

### [m] createIfNeeded

#### createIfNeeded(channelId, options?)

**`6.3.0`** **`Overload 1/2`**

- **channelId** { [string](../types/data-types.md#string) | [number](../types/data-types.md#number) | [NoticeChannelOptions](../types/notice-channel-options.md) }
- **[ options ]** { [NoticeChannelOptions](../types/notice-channel-options.md) }
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常**：参数超过 2 个、渠道 ID 或 options 不合法时抛出异常
- **副作用**：渠道不存在时写入 Android 通知渠道设置；已存在时不修改

仅当指定渠道不存在时创建渠道。第一个参数也可以直接是 options 对象，此时优先从其 `channelId` 读取 ID；缺少 channelId 时回退到当前默认渠道 ID。此方法用于避免重复提交已有渠道；它不会把新 options 强制覆盖到已有渠道。

```js
notice.channel.createIfNeeded('sync-result', {
    name: '同步结果',
    importance: 'default',
});
notice('同步完成', { channelId: 'sync-result' });
```

#### createIfNeeded(options)

**`6.3.0`** **`Overload 2/2`**

- **options** { [NoticeChannelOptions](../types/notice-channel-options.md) } - 可通过 `channelId` 提供渠道 ID；省略时使用当前默认渠道 ID
- <ins>**returns**</ins> { [void](../types/data-types.md#void) }
- **异常 / 副作用**：与上一重载相同

```js
notice.channel.createIfNeeded({
    channelId: 'download-result',
    name: '下载结果',
});

// 未写 channelId 时不会因缺少 ID 抛出，而是使用当前默认渠道 ID。
notice.channel.createIfNeeded({ name: '默认脚本渠道' });
```

### [m] contains

#### contains(channelId)

**`6.3.0`**

- **channelId** { [string](../types/data-types.md#string) | [number](../types/data-types.md#number) } - 渠道 ID
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 当前渠道 ID 是否已被创建
- **异常**：参数数量不为 1 时抛出异常
- **副作用**：只读查询

返回指定 `渠道 ID (Channel ID)` 的 Monkey King 渠道是否存在.

```js
notice.channel.contains('my_channel_id'); /* e.g. false */
```

### [m] remove

#### remove(channelId)

**`6.3.0`**

- **channelId** { [string](../types/data-types.md#string) | [number](../types/data-types.md#number) } - 渠道 ID
- <ins>**returns**</ins> { [boolean](../types/data-types.md#boolean) } - 删除前, 当前渠道 ID 是否已被创建
- **异常**：参数数量不为 1 时抛出异常
- **副作用**：存在时从 Android 通知管理器删除渠道

根据 `渠道 ID (Channel ID)` 删除 Monkey King 的渠道实例.

删除前, 若渠道已被创建且未被删除, 则返回 `true`, 否则返回 `false`.

```js
let id = 'my_channel_id';
if (notice.channel.contains(id)) {
    notice.channel.remove(id); // true
}
```

### [m] get

#### get(channelId)

**`6.3.0`**

- **channelId** { [string](../types/data-types.md#string) | [number](../types/data-types.md#number) } - 渠道 ID
- <ins>**returns**</ins> { [android.app.NotificationChannel](https://developer.android.com/reference/android/app/NotificationChannel) | [null](../types/data-types.md#null) } - 渠道实例
- **异常**：参数数量不为 1 时抛出异常
- **副作用**：只读查询

根据 `渠道 ID (Channel ID)` 获取 Monkey King 的渠道实例, 不存在时返回 `null`.

```js
let id = 'my_channel_id';
if (notice.channel.contains(id)) {
    console.log(notice.channel.get(id)); /* 打印通知渠道信息. */
} else {
    console.log(`ID "${id}" 对应的通知渠道不存在`);
}

/* 不使用 contains 也可以判断 Channel ID 的存在性. */

let channel = notice.channel.get(id);
if (channel !== null) {
    console.log(channel.getName(), channel.getImportance());
}
```

### [m] getAll

#### getAll()

**`6.3.0`**

- <ins>**returns**</ins> { [android.app.NotificationChannel](https://developer.android.com/reference/android/app/NotificationChannel)[[]](../types/data-types.md#array) } - 渠道实例数组
- **异常**：传入参数时抛出异常
- **副作用**：只读查询

获取 Monkey King 的所有通知渠道实例 (不包含已被删除的).

```js
console.log(`当前共计渠道 ${notice.channel.getAll().length} 个`);
notice.channel.getAll().map(ch => ch.getId()); /* 获取所有渠道的 ID. */
```

在 Android 8.0 以下，`contains` 和 `remove` 返回 `false`，`get` 返回 `null`，`getAll` 返回空数组；系统不会创建真正的通知渠道。
