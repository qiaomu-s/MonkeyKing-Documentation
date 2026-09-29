# 引擎 (Engines)

engines模块包含了一些与脚本环境、脚本运行、脚本引擎有关的函数, 包括运行其他脚本, 关闭脚本等.

例如, 获取脚本所在目录：

```
toast(engines.myEngine().cwd());
```

## engines.execScript(name, script[, config])

* `name` {string} 要运行的脚本名称. 这个名称和文件名称无关, 只是在任务管理中显示的名称.
* `script` {string} 要运行的脚本内容.
* `config` {Object} 运行配置项
    * `delay` {number} 延迟执行的毫秒数, 默认为0
    * `loopTimes` {number} 循环运行次数, 默认为1. 0为无限循环.
    * `interval` {number} 循环运行时两次运行之间的时间间隔, 默认为0
    * `path` {Array} | {string} 指定脚本运行的目录. 这些路径会用于require时寻找模块文件.

在新的脚本环境中运行脚本script. 返回一个[ScriptExectuion](#scriptexecution)对象.

所谓新的脚本环境, 指定是, 脚本中的变量和原脚本的变量是不共享的, 并且, 脚本会在新的线程中运行.

最简单的例子如下：

```
engines.execScript("hello world", "toast('hello world')");
```

如果要循环运行, 则：

```
//每隔3秒运行一次脚本, 循环10次
engines.execScript("hello world", "toast('hello world')", {
    loopTimes: 10,
    interval: 3000
});
```

用字符串来编写脚本非常不方便, 可以结合 `Function.toString()`的方法来执行特定函数:

```
function helloWorld(){
    //注意, 这里的变量和脚本主体的变量并不共享
    toast("hello world");
}
engines.execScript("hello world", "helloWorld();\n" + helloWorld.toString());
```

如果要传递变量, 则可以把这些封装成一个函数：

```
function exec(action, args){
    args = args || {};
    engines.execScript(action.name, action.name + "(" + JSON.stringify(args) + ");\n" + action.toString());
}

//要执行的函数, 是一个简单的加法
function add(args){
    toast(args.a + args.b);
}

//在新的脚本环境中执行 1 + 2
exec(add, {a: 1, b:2});
```

## engines.execScriptFile(path[, config])

* `path` {string} 要运行的脚本路径.
* `config` {Object} 运行配置项
    * `delay` {number} 延迟执行的毫秒数, 默认为0
    * `loopTimes` {number} 循环运行次数, 默认为1. 0为无限循环.
    * `interval` {number} 循环运行时两次运行之间的时间间隔, 默认为0
    * `path` {Array} | {string} 指定脚本运行的目录. 这些路径会用于require时寻找模块文件.

在新的脚本环境中运行脚本文件path. 返回一个[ScriptExecution](#scriptexecution)对象.

```
engines.execScriptFile("/sdcard/脚本/1.js");
```

## engines.execAutoFile(path[, config])

* `path` {string} 要运行的录制文件路径.
* `config` {Object} 运行配置项
    * `delay` {number} 延迟执行的毫秒数, 默认为0
    * `loopTimes` {number} 循环运行次数, 默认为1. 0为无限循环.
    * `interval` {number} 循环运行时两次运行之间的时间间隔, 默认为0
    * `path` {Array} | {string} 指定脚本运行的目录. 这些路径会用于require时寻找模块文件.

在新的脚本环境中运行录制文件path. 返回一个[ScriptExecution](#scriptexecution)对象.

```
engines.execAutoFile("/sdcard/脚本/1.auto");
```

## engines.stopAll()

停止所有正在运行的脚本. 包括当前脚本自身.

## engines.stopAllAndToast()

停止所有正在运行的脚本并显示停止的脚本数量. 包括当前脚本自身.

## engines.myEngine()

返回当前脚本的脚本引擎对象([ScriptEngine](#scriptengine))

**[v4.1.0新增]**
特别的, 该对象可以通过`execArgv`来获取他的运行参数, 包括外部参数、intent等. 例如：

```
log(engines.myEngine().execArgv);
```

普通脚本的运行参数通常为空, 通过定时任务的广播启动的则可以获取到启动的intent.

## engines.all()

* 返回 {Array}

返回当前所有正在运行的脚本的脚本引擎[ScriptEngine](#scriptengine)的数组.

```
log(engines.all());
```

# ScriptExecution

执行脚本时返回的对象, 可以通过他获取执行的引擎、配置等, 也可以停止这个执行.

要停止这个脚本的执行, 使用`exectuion.getEngine().forceStop()`.

## ScriptExecution.getEngine()

返回执行该脚本的脚本引擎对象([ScriptEngine](#scriptengine))

## ScriptExecution.getConfig()

返回该脚本的运行配置([ScriptConfig](#scriptconfig))

# ScriptEngine

脚本引擎对象.

## ScriptEngine.forceStop()

停止脚本引擎的执行.

## ScriptEngine.cwd()

* 返回 {string}

返回脚本执行的路径. 对于一个脚本文件而言为这个脚本所在的文件夹；对于其他脚本, 例如字符串脚本, 则为`null`或者执行时的设置值.

## ScriptEngine.getSource()

* 返回 ScriptSource

返回当前脚本引擎正在执行的脚本对象.

```
log(engines.myEngine().getSource());
```

## ScriptEngine.emit(eventName[, ...args])

* `eventName` {string} 事件名称
* `...args` {any} 事件参数

向该脚本引擎发送一个事件, 该事件可以在该脚本引擎对应的脚本的events模块监听到并在脚本主线程执行事件处理.

例如脚本receiver.js的内容如下：

```
//监听say事件
events.on("say", function(words){
    toastLog(words);
});
//保持脚本运行
setInterval(()=>{}, 1000);
```

同一目录另一脚本可以启动他并发送该事件：

```
//运行脚本
var e = engines.execScriptFile("./receiver.js");
//等待脚本启动
sleep(2000);
//向该脚本发送事件
e.getEngine().emit("say", "你好");
```

# ScriptConfig

脚本执行时的配置.

## delay

* {number}

延迟执行的毫秒数

## interval

* {number}

循环运行时两次运行之间的时间间隔

## loopTimes

* {number}

循环运行次数

## getPath()

* 返回 {Array}

返回一个字符串数组表示脚本运行时模块寻找的路径.

<!-- api-contracts:start -->

## API 合同表

下表覆盖本页在当前公开 API 中的每个 canonical 公共成员。每行同时给出稳定锚点、实现合同、参数与返回合同、权限与线程、生命周期与副作用、版本，以及可独立执行的 Rhino 2.0 成员存在性或值读取示例。对象实例名（如 `db`、`cursor`、`storage`）沿用本页正文中的创建方式。

| API ID / 稳定锚点 | 签名或入口 | 参数、可选项与默认值 | 返回值与异常 | 权限与线程 | 生命周期与副作用 | 版本 | Rhino 2.0 示例 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="api-symbol-ZW5naW5lcy5hbGw"></a> `engines.all` | `engines.all(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无额外 Android 运行时权限；线程：同步读取引擎注册表 | 生命周期：返回对象由 ScriptEngineService 管理；副作用：仅枚举不修改引擎 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof engines.all);` |
| <a id="api-symbol-ZW5naW5lcy5leGVjQXV0b0ZpbGU"></a> `engines.execAutoFile` | `engines.execAutoFile(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无额外 Android 运行时权限；线程：同步读取引擎注册表 | 生命周期：返回对象由 ScriptEngineService 管理；副作用：仅枚举不修改引擎 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof engines.execAutoFile);` |
| <a id="api-symbol-ZW5naW5lcy5leGVjU2NyaXB0"></a> `engines.execScript` | `engines.execScript(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无额外 Android 运行时权限；线程：同步读取引擎注册表 | 生命周期：返回对象由 ScriptEngineService 管理；副作用：仅枚举不修改引擎 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof engines.execScript);` |
| <a id="api-symbol-ZW5naW5lcy5leGVjU2NyaXB0RmlsZQ"></a> `engines.execScriptFile` | `engines.execScriptFile(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无额外 Android 运行时权限；线程：同步读取引擎注册表 | 生命周期：返回对象由 ScriptEngineService 管理；副作用：仅枚举不修改引擎 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof engines.execScriptFile);` |
| <a id="api-symbol-ZW5naW5lcy5nZXRFbmdpbmVz"></a> `engines.getEngines` | `engines.getEngines()` · 实现合同  | 参数：无参数；可选项与默认值见本页说明或页面约束 | 返回：Set&lt;ScriptEngine&lt;out ScriptSource&gt;&gt;；参数校验、状态或底层异常原样传播 | 权限：无额外 Android 运行时权限；线程：同步读取引擎注册表 | 生命周期：返回对象由 ScriptEngineService 管理；副作用：仅枚举不修改引擎 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof engines.getEngines);` |
| <a id="api-symbol-ZW5naW5lcy5teUVuZ2luZQ"></a> `engines.myEngine` | `engines.myEngine(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无额外 Android 运行时权限；线程：同步读取引擎注册表 | 生命周期：返回对象由 ScriptEngineService 管理；副作用：仅枚举不修改引擎 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof engines.myEngine);` |
| <a id="api-symbol-ZW5naW5lcy5zdG9wQWxs"></a> `engines.stopAll` | `engines.stopAll(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无额外 Android 运行时权限；线程：同步读取引擎注册表 | 生命周期：返回对象由 ScriptEngineService 管理；副作用：仅枚举不修改引擎 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof engines.stopAll);` |
| <a id="api-symbol-ZW5naW5lcy5zdG9wQWxsQW5kVG9hc3Q"></a> `engines.stopAllAndToast` | `engines.stopAllAndToast(...args)` · 实现合同  | 参数：按实现合同声明与本页成员说明；可选项、默认值和合法值不得超出公开重载 | 返回：按实现合同声明；参数校验、状态或底层异常原样传播 | 权限：无额外 Android 运行时权限；线程：同步读取引擎注册表 | 生命周期：返回对象由 ScriptEngineService 管理；副作用：仅枚举不修改引擎 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof engines.stopAllAndToast);` |
| <a id="api-symbol-bW9kdWxlOmVuZ2luZXM"></a> `module:engines` | `engines` 模块入口 · 实现合同  | 入口：全局或父模块属性；无构造参数 | 返回：模块对象；参数校验、状态或底层异常原样传播 | 权限：无额外 Android 运行时权限；线程：同步读取引擎注册表 | 生命周期：返回对象由 ScriptEngineService 管理；副作用：仅枚举不修改引擎 | ≤ v6.6.4（旧文档未记录精确版本） | Rhino 2.0：`console.log(typeof engines);` |

### Rhino 2.0 表格读取示例

```js
console.log('Rhino 2.0 contract table: engines');
```

<!-- api-contracts:end -->
