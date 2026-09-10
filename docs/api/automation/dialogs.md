# 对话框 (Dialogs)

`dialogs` 提供阻塞、回调及 UI 线程 Promise 三种交互路径。本文按 Monkey King 6.7.0 源码提交 `bafa2986212d27b6b59f1324f89548b72a810966` 核对。

<a id="api-symbol-bW9kdWxlOmRpYWxvZ3M"></a>
## [@] dialogs

**`≤ 6.6.4`**

- **入口 / 别名**：`dialogs`、`$dialogs`；`rawInput`、`prompt`、`alert`、`confirm` 还会安装同名全局入口
- **参数**：模块对象不可调用
- <ins>**returns**</ins> { `Dialogs` }
- **异常**：读取模块本身不抛出异常
- **权限**：无额外 Android 权限
- **线程 / 生命周期**：对话框 UI 在主线程创建；无回调时，UI 脚本返回 Promise，普通脚本走同步等待
- **副作用**：成员调用会创建窗口并等待或异步接收用户输入

```js
console.log(dialogs === $dialogs); // true
console.log(typeof dialogs.build); // "function"
```

最简单的例子如下：

```
alert("您好");
```

这段代码会弹出一个消息提示框显示"您好", 并在用户点击"确定"后继续运行. 稍微复杂一点的例子如下：

```
var clear = confirm("要清除所有缓存吗?");
if(clear){
    alert("清除成功!");
}
```

`confirm()`会弹出一个对话框并让用户选择"是"或"否", 如果选择"是"则返回true.

需要特别注意的是, 对话框在ui模式下不能像通常那样使用, 应该使用回调函数或者[Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/)的形式. 理解这一点可能稍有困难. 举个例子:

```
"ui";
//回调形式
 confirm("要清除所有缓存吗?", function(clear){
     if(clear){
          alert("清除成功!");
     }
 });
//Promise形式
confirm("要清除所有缓存吗?")
    .then(clear => {
        if(clear){
          alert("清除成功!");
        }
    });
```

<a id="api-symbol-ZGlhbG9ncy5hbGVydA"></a>
## dialogs.alert(title[, content, callback])

**`≤ 6.6.4`**

- **入口 / 别名**：`dialogs.alert(...)`、全局 `alert(...)`
- **title** { [string](../types/data-types.md#string) } - 必填并转换为字符串
- **[ content = `''` ]** { [string](../types/data-types.md#string) }
- **[ callback ]** { [function](../types/data-types.md#function) } - 可作为第 2 或第 3 个参数
- <ins>**returns**</ins> { `void | Promise<any> | JsDialog` } - UI 线程且未给回调时返回 Promise；普通线程无回调时同步等待
- **异常**：参数数量不在 1..3、callback 不是函数时抛出异常
- **权限 / 线程 / 生命周期 / 副作用**：无额外权限；在 UI 线程显示一个确定按钮对话框，关闭后对应等待或回调完成

```js
dialogs.alert('同步完成', '所有文件已经写入');
```

* `title` {string} 对话框的标题.
* `content` {string} 可选, 对话框的内容. 默认为空.
* `callback` {Function} 回调函数, 可选. 当用户点击确定时被调用,一般用于ui模式.

显示一个只包含“确定”按钮的提示对话框. 直至用户点击确定脚本才继续运行.

该函数也可以作为全局函数使用.

```
alert("出现错误~", "出现未知错误, 请联系脚本作者”);
```

在ui模式下该函数返回一个`Promise`. 例如:

```
"ui";
alert("嘿嘿嘿").then(()=>{
    //当点击确定后会执行这里
});
```

<a id="api-symbol-ZGlhbG9ncy5jb25maXJt"></a>
## dialogs.confirm(title[, content, callback])

**`≤ 6.6.4`**

- **入口 / 别名**：`dialogs.confirm(...)`、全局 `confirm(...)`
- **title** { [string](../types/data-types.md#string) } - 必填
- **[ content = `''` ]** { [string](../types/data-types.md#string) }
- **[ callback ]** { [function](../types/data-types.md#function) } - 接收布尔选择结果
- <ins>**returns**</ins> { `boolean | Promise<boolean> | JsDialog` }
- **异常**：参数数量不在 1..3、callback 类型错误时抛出异常
- **权限 / 线程 / 生命周期 / 副作用**：无额外权限；UI 线程无回调时返回 Promise，普通线程无回调时阻塞到确认或取消

```js
const accepted = dialogs.confirm('删除缓存？');
console.log(accepted);
```

* `title` {string} 对话框的标题.
* `content` {string} 可选, 对话框的内容. 默认为空.
* `callback` {Function} 回调函数, 可选. 当用户点击确定时被调用,一般用于ui模式.

显示一个包含“确定”和“取消”按钮的提示对话框. 如果用户点击“确定”则返回 `true` , 否则返回 `false` .

该函数也可以作为全局函数使用.

在ui模式下该函数返回一个`Promise`. 例如:

```
"ui";
confirm("确定吗").then(value=>{
    //当点击确定后会执行这里, value为true或false, 表示点击"确定"或"取消"
});
```

<a id="api-symbol-ZGlhbG9ncy5yYXdJbnB1dA"></a>
## dialogs.rawInput(title[, prefill, callback])

**`≤ 6.6.4`**

- **入口 / 别名**：`dialogs.rawInput(...)`、全局 `rawInput(...)`
- **title** { [string](../types/data-types.md#string) } - 必填
- **[ prefill = `''` ]** { [string](../types/data-types.md#string) }
- **[ callback ]** { [function](../types/data-types.md#function) } - 可作为第 2 个参数省略 prefill
- <ins>**returns**</ins> { `string | null | Promise<string | null> | JsDialog` }
- **异常**：参数数量不在 1..3 或 callback 不是函数时抛出异常
- **权限 / 线程 / 生命周期 / 副作用**：无额外权限；普通线程无回调时同步等待，UI 线程无回调时返回 Promise

```js
const name = dialogs.rawInput('姓名', 'Monkey');
console.log(name);
```

* `title` {string} 对话框的标题.
* `prefill` {string} 输入框的初始内容, 可选, 默认为空.
* `callback` {Function} 回调函数, 可选. 当用户点击确定时被调用,一般用于ui模式.

显示一个包含输入框的对话框, 等待用户输入内容, 并在用户点击确定时将输入的字符串返回. 如果用户取消了输入, 返回null.

该函数也可以作为全局函数使用.

```
var name = rawInput("请输入您的名字", "小明");
alert("您的名字是" + name);
```

在ui模式下该函数返回一个`Promise`. 例如:

```
"ui";
rawInput("请输入您的名字", "小明").then(name => {
    alert("您的名字是" + name);
});
```

当然也可以使用回调函数, 例如:

```
rawInput("请输入您的名字", "小明", name => {
     alert("您的名字是" + name);
});
```

<a id="api-symbol-ZGlhbG9ncy5pbnB1dA"></a>
## dialogs.input(title[, prefill, callback])

**`≤ 6.6.4`**

- **入口 / 别名**：`dialogs.input(...)`
- **title** { [string](../types/data-types.md#string) } - 必填
- **[ prefill = `''` ]** { [string](../types/data-types.md#string) }
- **[ callback ]** { [function](../types/data-types.md#function) } - 接收求值后的结果
- <ins>**returns**</ins> { `any | Promise<any> | JsDialog` } - 对输入字符串执行 Rhino `eval`
- **异常**：参数数量不在 1..3、callback 类型错误或输入表达式求值失败时抛出异常
- **权限 / 线程 / 生命周期 / 副作用**：无额外权限；线程路径与 `rawInput` 相同，并会在顶级作用域执行输入文本

```js
const count = dialogs.input('数量', '1 + 2');
console.log(count); // 3
```

等效于 `eval(dialogs.rawInput(title, prefill, callback))`, 该函数和rawInput的区别在于, 会把输入的字符串用eval计算一遍再返回, 返回的可能不是字符串.

可以用该函数输入数字、数组等. 例如：

```
var age = dialogs.input("请输入您的年龄", "18");
// new Date().getYear() + 1900 可获取当前年份
var year = new Date().getYear() + 1900 - age;
alert("您的出生年份是" + year);
```

在ui模式下该函数返回一个`Promise`. 例如:

```
"ui";
dialogs.input("请输入您的年龄", "18").then(age => {
    var year = new Date().getYear() + 1900 - age;
    alert("您的出生年份是" + year);
});
```

<a id="api-symbol-ZGlhbG9ncy5wcm9tcHQ"></a>
## dialogs.prompt(title[, prefill, callback])

**`≤ 6.6.4`**

- **入口 / 别名**：`dialogs.prompt(...)`、全局 `prompt(...)`
- **title** { [string](../types/data-types.md#string) }
- **[ prefill = `''` ]** { [string](../types/data-types.md#string) }
- **[ callback ]** { [function](../types/data-types.md#function) }
- <ins>**returns**</ins> { `string | null | Promise<string | null> | JsDialog` }
- **异常**：与 `dialogs.rawInput` 相同
- **权限 / 线程 / 生命周期 / 副作用**：无额外权限；完整委托给 `rawInput`，不是会执行 `eval` 的 `input`

```js
console.log(dialogs.prompt('备注', '无'));
```

相当于 `dialogs.rawInput()`;

<a id="api-symbol-ZGlhbG9ncy5zZWxlY3Q"></a>
## dialogs.select(title, items[, callback])

**`≤ 6.6.4`**

- **入口 / 别名**：`dialogs.select(...)`
- **title** { [string](../types/data-types.md#string) } - 至少需要此参数
- **items** { [string](../types/data-types.md#string)[] | `...string` } - 数组形式支持可选 callback；非数组形式把 title 后所有参数都转换为选项
- **[ callback ]** { [function](../types/data-types.md#function) } - 数组形式的第 3 个参数
- <ins>**returns**</ins> { `number | Promise<number> | JsDialog` } - 选择索引；取消通常为 `-1`
- **异常**：没有 title、callback 类型错误或底层对话框失败时抛出异常
- **权限 / 线程 / 生命周期 / 副作用**：无额外权限；UI 线程数组形式且无回调时返回 Promise，否则按同步/回调路径显示列表

```js
const index = dialogs.select('颜色', ['红', '绿', '蓝']);
console.log(index);
```

* `title` {string} 对话框的标题.
* `items` {Array} 对话框的选项列表, 是一个字符串数组.
* `callback` {Function} 回调函数, 可选. 当用户点击确定时被调用,一般用于ui模式.

显示一个带有选项列表的对话框, 等待用户选择, 返回用户选择的选项索引(0 ~ item.length - 1). 如果用户取消了选择, 返回-1.

```
var options = ["选项A", "选项B", "选项C", "选项D"]
var i = dialogs.select("请选择一个选项", options);
if(i >= 0){
    toast("您选择的是" + options[i]);
}else{
    toast("您取消了选择");
}
```

在ui模式下该函数返回一个`Promise`. 例如:

```
"ui";
dialogs.select("请选择一个选项", ["选项A", "选项B", "选项C", "选项D"])
    .then(i => {
        toast(i);
    });
```

<a id="api-symbol-ZGlhbG9ncy5zaW5nbGVDaG9pY2U"></a>
## dialogs.singleChoice(title, items[, index, callback])

**`≤ 6.6.4`**

- **入口 / 别名**：`dialogs.singleChoice(...)`
- **title** { [string](../types/data-types.md#string) }
- **items** { [string](../types/data-types.md#string)[] } - 必须为 JavaScript 数组
- **[ index = `0` ]** { [number](../types/data-types.md#number) } - 初始选中索引
- **[ callback ]** { [function](../types/data-types.md#function) }
- <ins>**returns**</ins> { `number | Promise<number> | JsDialog` }
- **异常**：参数数量不在 2..4、items 不是数组或 callback 类型错误时抛出异常
- **权限 / 线程 / 生命周期 / 副作用**：无额外权限；显示单选列表并在结束时返回或回调索引

```js
const index = dialogs.singleChoice('环境', ['测试', '生产'], 0);
console.log(index);
```

* `title` {string} 对话框的标题.
* `items` {Array} 对话框的选项列表, 是一个字符串数组.
* `index` {number} 对话框的初始选项的位置, 默认为0.
* `callback` {Function} 回调函数, 可选. 当用户点击确定时被调用,一般用于ui模式.

显示一个单选列表对话框, 等待用户选择, 返回用户选择的选项索引(0 ~ item.length - 1). 如果用户取消了选择, 返回-1.

在ui模式下该函数返回一个`Promise`.

<a id="api-symbol-ZGlhbG9ncy5tdWx0aUNob2ljZQ"></a>
## dialogs.multiChoice(title, items[, indices, callback])

**`≤ 6.6.4`**

- **入口 / 别名**：`dialogs.multiChoice(...)`
- **title** { [string](../types/data-types.md#string) }
- **items** { [string](../types/data-types.md#string)[] } - 必须为 JavaScript 数组
- **[ indices = `[]` ]** { [number](../types/data-types.md#number)[] } - 初始选中索引数组
- **[ callback ]** { [function](../types/data-types.md#function) }
- <ins>**returns**</ins> { `number[] | null | Promise<number[] | null> | JsDialog` }
- **异常**：参数数量不在 2..4、items/indices/callback 类型非法时抛出异常
- **权限 / 线程 / 生命周期 / 副作用**：无额外权限；Java 结果会转换为 Rhino 数组，取消可能返回 `null`

```js
const selected = dialogs.multiChoice('同步内容', ['图片', '视频'], [0]);
console.log(selected);
```

* `title` {string} 对话框的标题.
* `items` {Array} 对话框的选项列表, 是一个字符串数组.
* `indices` {Array} 选项列表中初始选中的项目索引的数组, 默认为空数组.
* `callback` {Function} 回调函数, 可选. 当用户点击确定时被调用,一般用于ui模式.

显示一个多选列表对话框, 等待用户选择, 返回用户选择的选项索引的数组. 如果用户取消了选择, 返回`[]`.

在ui模式下该函数返回一个`Promise`.

<a id="api-symbol-ZGlhbG9ncy5idWlsZA"></a>
## dialogs.build(properties?)

**`≤ 6.6.4`**

- **入口 / 别名**：`dialogs.build(properties?)`
- **[ properties ]** { [Object](../types/data-types.md#object) } - 最多 1 个对象；省略或 nullish 时启用内置 preset 标题、内容及三个按钮
- <ins>**returns**</ins> { `JsDialog` } - 已构建但仍需按对象 API 调用 `show()` 的对话框
- **异常**：参数超过 1 个、properties 非对象、属性名无法映射到 builder 或属性值非法时抛出异常
- **权限**：无额外 Android 权限
- **线程 / 生命周期**：记录当前脚本线程，并通过 `ui.run` 在 UI 线程构建；事件监听器随对话框存活
- **副作用**：创建对话框对象并安装颜色、按钮、选择、输入、返回键及窗口属性；调用 `show()` 后显示

```js
dialogs.build({
    title: '确认',
    content: '继续执行？',
    positive: '继续',
    negative: '取消',
}).show();
```

* `properties` {Object} 对话框属性, 用于配置对话框.
* 返回 {Dialog}

创建一个可自定义的对话框, 例如：

```
dialogs.build({
    //对话框标题
    title: "发现新版本",
    //对话框内容
    content: "更新日志: 新增了若干了BUG",
    //确定键内容
    positive: "下载",
    //取消键内容
    negative: "取消",
    //中性键内容
    neutral: "到浏览器下载",
    //勾选框内容
    checkBoxPrompt: "不再提示"
}).on("positive", ()=>{
    //监听确定键
    toast("开始下载....");
}).on("neutral", ()=>{
    //监听中性键
    app.openUrl("https://www.autojs.org");
}).on("check", (checked)=>{
    //监听勾选框
    log(checked);
}).show();
```

选项properties可供配置的项目为:

* `title` {string} 对话框标题
* `titleColor` {string} | {number} 对话框标题的颜色
* `buttonRippleColor` {string} | {number} 对话框按钮的波纹效果颜色
* `icon` {string} | {Image} 对话框的图标, 是一个URL或者图片对象
* `content` {string} 对话框文字内容
* `contentColor`{string} | {number} 对话框文字内容的颜色
* `contentLineSpacing`{number} 对话框文字内容的行高倍数, 1.0为一倍行高
* `items` {Array} 对话框列表的选项
* `itemsColor` {string} | {number} 对话框列表的选项的文字颜色
* `itemsSelectMode` {string} 对话框列表的选项选择模式, 可以为:
    * `select` 普通选择模式
    * `single` 单选模式
    * `multi` 多选模式
* `itemsSelectedIndex` {number} | {Array} 对话框列表中预先选中的项目索引, 如果是单选模式为一个索引；多选模式则为数组
* `positive` {string} 对话框确定按钮的文字内容(最右边按钮)
* `positiveColor` {string} | {number} 对话框确定按钮的文字颜色(最右边按钮)
* `neutral` {string} 对话框中立按钮的文字内容(最左边按钮)
* `neutralColor` {string} | {number} 对话框中立按钮的文字颜色(最左边按钮)
* `negative` {string} 对话框取消按钮的文字内容(确定按钮左边的按钮)
* `negativeColor` {string} | {number} 对话框取消按钮的文字颜色(确定按钮左边的按钮)
* `checkBoxPrompt` {string} 勾选框文字内容
* `checkBoxChecked` {boolean} 勾选框是否勾选
* `progress` {Object} 配置对话框进度条的对象：
    * `max` {number} 进度条的最大值, 如果为-1则为无限循环的进度条
    * `horizontal` {boolean} 如果为true, 则对话框无限循环的进度条为水平进度条
    * `showMinMax` {boolean} 是否显示进度条的最大值和最小值
* `cancelable` {boolean} 对话框是否可取消, 如果为false, 则对话框只能用代码手动取消
* `canceledOnTouchOutside` {boolean} 对话框是否在点击对话框以外区域时自动取消, 默认为true
* `inputHint` {string} 对话框的输入框的输入提示
* `inputPrefill` {string} 对话框输入框的默认输入内容

通过这些选项可以自定义一个对话框, 并通过监听返回的Dialog对象的按键、输入事件来实现交互. 下面是一些例子.

模拟alert对话框：

```
dialogs.build({
    title: "你好",
    content: "今天也要元气满满哦",
    positive: "好的"
}).show();
```

模拟confirm对话框:

```
dialogs.build({
    title: "你好",
    content: "请问你是笨蛋吗?",
    positive: "是的",
    negative: "我是大笨蛋"
}).on("positive", ()=>{
    alert("哈哈哈笨蛋");
}).on("negative", ()=>{
    alert("哈哈哈大笨蛋");
}).show();
```

模拟单选框:

```
dialogs.build({
    title: "单选",
    items: ["选项1", "选项2", "选项3", "选项4"],
    itemsSelectMode: "single",
    itemsSelectedIndex: 3
}).on("single_choice", (index, item)=>{
    toast("您选择的是" + item);
}).show();
```

"处理中"对话框:

```
var d = dialogs.build({
    title: "下载中...",
    progress: {
        max: -1
    },
    cancelable: false
}).show();

setTimeout(()=>{
    d.dismiss();
}, 3000);
```

输入对话框:

```
dialogs.build({
    title: "请输入您的年龄",
    inputPrefill: "18"
}).on("input", (input)=>{
    var age = parseInt(input);
    toastLog(age);
}).show();
```

使用这个函数来构造对话框, 一个明显的不同是需要使用回调函数而不能像dialogs其他函数一样同步地返回结果；但也可以通过threads模块的方法来实现. 例如显示一个输入框并获取输入结果为：

```
var input = threads.disposable();
dialogas.build({
    title: "请输入您的年龄",
    inputPrefill: "18"
}).on("input", text => {
    input.setAndNotify(text);
}).show();
var age = parseInt(input.blockedGet());
tosatLog(age);
```

# Dialog

`dialogs.build()`返回的对话框对象, 内置一些事件用于响应用户的交互, 也可以获取对话框的状态和信息.

## 事件: `show`

* `dialog` {Dialog} 对话框

对话框显示时会触发的事件. 例如：

```
dialogs.build({
    title: "标题"
}).on("show", (dialog)=>{
    toast("对话框显示了");
}).show();
```

## 事件: `cancel`

* `dialog` {Dialog} 对话框

对话框被取消时会触发的事件. 一个对话框可能按取消按钮、返回键取消或者点击对话框以外区域取消. 例如：

```
dialogs.build({
    title: "标题",
    positive: "确定",
    negative: "取消"
}).on("cancel", (dialog)=>{
    toast("对话框取消了");
}).show();
```

## 事件: `dismiss`

* `dialog` {Dialog} 对话框

对话框消失时会触发的事件. 对话框被取消或者手动调用`dialog.dismiss()`函数都会触发该事件. 例如：

```
var d = dialogs.build({
    title: "标题",
    positive: "确定",
    negative: "取消"
}).on("dismiss", (dialog)=>{
    toast("对话框消失了");
}).show();

setTimeout(()=>{
    d.dismiss();
}, 5000);
```

## 事件: `positive`

* `dialog` {Dialog} 对话框

确定按钮按下时触发的事件. 例如：

```
var d = dialogs.build({
    title: "标题",
    positive: "确定",
    negative: "取消"
}).on("positive", (dialog)=>{
    toast("你点击了确定");
}).show();
```

## 事件: `negative`

* `dialog` {Dialog} 对话框

取消按钮按下时触发的事件. 例如：

```
var d = dialogs.build({
    title: "标题",
    positive: "确定",
    negative: "取消"
}).on("negative", (dialog)=>{
    toast("你点击了取消");
}).show();
```

## 事件: `neutral`

* `dialog` {Dialog} 对话框

中性按钮按下时触发的事件. 例如：

```
var d = dialogs.build({
    title: "标题",
    positive: "确定",
    negative: "取消",
    neutral: "稍后提示"
}).on("positive", (dialog)=>{
    toast("你点击了稍后提示");
}).show();
```

## 事件: `any`

* `dialog` {Dialog} 对话框
* `action` {string} 被点击的按钮, 可能的值为:
    * `positive` 确定按钮
    * `negative` 取消按钮
    * `neutral` 中性按钮

任意按钮按下时触发的事件. 例如:

```
var d = dialogs.build({
    title: "标题",
    positive: "确定",
    negative: "取消",
    neutral: "稍后提示"
}).on("any", (action, dialog)=>{
    if(action == "positive"){
        toast("你点击了确定");
    }else if(action == "negative"){
        toast("你点击了取消");
    }
}).show();
```

## 事件: `item_select`

* `index` {number} 被选中的项目索引, 从0开始
* `item` {Object} 被选中的项目
* `dialog` {Dialog} 对话框

对话框列表(itemsSelectMode为"select")的项目被点击选中时触发的事件. 例如：

```
var d = dialogs.build({
    title: "请选择",
    positive: "确定",
    negative: "取消",
    items: ["A", "B", "C", "D"],
    itemsSelectMode: "select"
}).on("item_select", (index, item, dialog)=>{
    toast("您选择的是第" + (index + 1) + "项, 选项为" + item);
}).show();
```

## 事件: `single_choice`

* `index` {number} 被选中的项目索引, 从0开始
* `item` {Object} 被选中的项目
* `dialog` {Dialog} 对话框

对话框单选列表(itemsSelectMode为"singleChoice")的项目被选中并点击确定时触发的事件. 例如：

```
var d = dialogs.build({
    title: "请选择",
    positive: "确定",
    negative: "取消",
    items: ["A", "B", "C", "D"],
    itemsSelectMode: "singleChoice"
}).on("item_select", (index, item, dialog)=>{
    toast("您选择的是第" + (index + 1) + "项, 选项为" + item);
}).show();
```

## 事件: `multi_choice`

* `indices` {Array} 被选中的项目的索引的数组
* `items` {Array} 被选中的项目的数组
* `dialog` {Dialog} 对话框

对话框多选列表(itemsSelectMode为"multiChoice")的项目被选中并点击确定时触发的事件. 例如：

```
var d = dialogs.build({
    title: "请选择",
    positive: "确定",
    negative: "取消",
    items: ["A", "B", "C", "D"],
    itemsSelectMode: "multiChoice"
}).on("item_select", (indices, items, dialog)=>{
    toast(util.format("您选择的项目为%o, 选项为%o", indices, items);
}).show();
```

## 事件: `input`

* `text` {string} 输入框的内容
* `dialog` {Dialog} 对话框

带有输入框的对话框当点击确定时会触发的事件. 例如：

```
dialogs.build({
    title: "请输入",
    positive: "确定",
    negative: "取消",
    inputPrefill: ""
}).on("input", (text, dialog)=>{
    toast("你输入的是" + text);
}).show();
```

## 事件: `input_change`

* `text` {string} 输入框的内容
* `dialog` {Dialog} 对话框

对话框的输入框的文本发生变化时会触发的事件. 例如：

```
dialogs.build({
    title: "请输入",
    positive: "确定",
    negative: "取消",
    inputPrefill: ""
}).on("input_change", (text, dialog)=>{
    toast("你输入的是" + text);
}).show();
```

## dialog.getProgress()

* 返回 {number}

获取当前进度条的进度值, 是一个整数

## dialog.getMaxProgress()

* 返回 {number}

获取当前进度条的最大进度值, 是一个整数

## dialog.getActionButton(action)

* `action` {string} 动作, 包括:
    * `positive`
    * `negative`
    * `neutral`
