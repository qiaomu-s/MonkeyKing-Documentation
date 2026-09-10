# Monkey King 使用手册 (Manual)

本页给出 Monkey King 6.7.0 的最小可运行工作流。API 细节以各分类页面为准；运行环境为 Android 上的 Rhino 2.0，而不是浏览器或 Node.js。

示例于 2026-09-10 按源码提交 `bafa2986212d27b6b59f1324f89548b72a810966` 复核。

## 创建并运行脚本

1. 在 Monkey King 文件页新建 `.js` 文件。
2. 输入脚本并保存。
3. 点击运行按钮；脚本日志显示在控制台或底部日志面板。
4. 需要停止时，从运行任务列表结束对应引擎。

```js
'use strict';

toast('Hello, Monkey King');
console.log({ version: monkeyking.versionName });
```

脚本默认可使用 `console`、`files`、`app`、`device`、`images` 等全局模块，也可以用 `$console`、`$files` 等兼容别名访问大部分模块。

## 权限准备

- 控件查找和普通手势：启用无障碍服务，调用 `auto.waitFor()` 等待服务可用。
- 截图和图像识别：先调用 `images.requestScreenCapture()`，并处理用户拒绝授权的情况。
- 悬浮窗：在系统设置中授予“显示在其他应用上层”权限。
- Root、Shizuku、写系统设置和安全设置：只在确实需要时启用，并在调用前检查能力。
- 通知：Android 13 及以上可能需要通知权限；渠道行为由系统管理。

权限请求会显示系统界面或跳转设置页，是有用户可见副作用的操作。

## 文件与工作目录

相对路径以当前脚本引擎的工作目录为基准。使用 `files.path()` 或 `files.join()` 构造路径，不要假设进程工作目录与脚本目录永远相同。

```js
const configPath = files.join(files.cwd(), 'config.json');

if (!files.exists(configPath)) {
    files.write(configPath, JSON.stringify({ firstRun: false }, null, 2));
}
```

文件、网络和模块加载通常是同步操作；不要在 UI 线程执行耗时调用。

## UI 脚本与普通脚本

UI 脚本需要声明 UI 模式，并且视图修改应在 UI 线程完成。普通脚本中的阻塞等待、`sleep()` 和 Promise `wait()` 不得直接放到 UI 回调中。

```js
'ui';

ui.layout(
    <vertical padding="16">
        <text id="status" text="Ready" />
        <button id="start" text="Run" />
    </vertical>
);

ui.start.on('click', () => {
    threads.start(() => {
        const value = http.get('https://example.com').body.string();
        ui.run(() => ui.status.setText(String(value.length)));
    });
});
```

## 模块与依赖

本地模块使用 CommonJS：通过 `require()` 加载，通过 `module.exports` 导出。Monkey King 支持 JavaScript、JSON、目录包和部分 `node_modules`，但不承诺兼容 Node.js 原生模块。

```js
// lib/greet.js
module.exports = name => `Hello, ${name}`;

// main.js
const greet = require('./lib/greet');
console.log(greet('Monkey King'));
```

详见 [模块系统](../api/core/modules.md)。

## 生命周期与资源释放

脚本停止时会清理该运行时注册的事件、线程、定时器、传感器、悬浮窗、截图器和 OCR 资源。仍建议主动释放长生命周期资源：

```js
events.on('exit', () => {
    sensors.unregisterAll();
    floaty.closeAll();
});
```

图片包装对象占用原生内存，用完应调用 `recycle()`；网络响应体应及时读取或关闭；事件监听器不再需要时应移除。

## 错误处理

参数数量、类型、权限、线程和文件状态不符合要求时，API 可能抛出 Java 或 Rhino 异常。对外部输入、文件和网络调用使用 `try/catch`，不要把异常仅写入日志后继续使用无效结果。

```js
try {
    const response = http.get('https://example.com/api');
    if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error(`HTTP ${response.statusCode}`);
    }
    console.log(response.body.string());
} catch (error) {
    console.error(error.stack || error);
}
```

## 下一步

- [综述](overview.md)：运行环境和文档导航。
- [全局对象](../api/core/global.md)：全局函数、全局变量与类型判断。
- [自动化](../api/automation/automator.md)：无障碍、坐标和 Root 输入。
- [模块](../api/core/modules.md)：`require`、`Module`、`Promise` 与 `ResultAdapter`。
- [疑难解答](troubleshooting.md)：常见环境和权限问题。
