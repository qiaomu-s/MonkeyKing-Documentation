# 综述 (Overview)

Monkey King 6.7.0 是运行在 Android 上的 JavaScript 自动化与应用开发环境。它使用 Rhino 解释脚本，并提供无障碍自动化、图像与 OCR、UI、文件、网络、任务调度、Shell、SQLite 和媒体分析等模块。

本文档于 2026-09-10 以 [Monkey King 源码](https://github.com/qiaomu-s/AutoJs6/tree/bafa2986212d27b6b59f1324f89548b72a810966) 固定提交 `bafa2986212d27b6b59f1324f89548b72a810966` 为事实来源。

## 运行环境

- **平台**：Android API 24 及以上。
- **语言**：JavaScript；Rhino 上下文使用 `Context.VERSION_ES6`。
- **引擎**：Monkey King 定制的 [Mozilla Rhino](https://github.com/mozilla/rhino)。
- **模块**：内置增强模块、CommonJS `require()`、Java / Android 类互操作。
- **异步模型**：线程、计时器、continuation 兼容的 `Promise` 与 `ResultAdapter`。

Rhino 2.0 不是浏览器或 Node.js。脚本不能默认使用 DOM、Web Worker、Node.js 原生模块或 V8 专属语法；JavaScript 语法和内建对象也应以 Monkey King 实际引擎为准。

```js
console.log({
    version: monkeyking.versionName,
    engine: engines.myEngine().toString(),
    apiLevel: device.sdkInt,
});
```

## 从哪里开始

第一次使用建议按以下顺序阅读：

1. [使用手册](manual.md)：创建脚本、权限、线程、模块和资源释放。
2. [全局对象](../api/core/global.md)：默认变量、全局函数和类型入口。
3. [自动化](../api/automation/automator.md)：无障碍、坐标、Root 与 Shizuku 操作。
4. [模块系统](../api/core/modules.md)：`require`、`Module`、`Promise` 和 `ResultAdapter`。
5. [数据类型](../api/types/data-types.md)：Rhino、Java 与 Monkey King 包装类型。

如果已经知道模块名，可直接从顶部 **API** 导航或左侧分类目录进入对应页面。

## 文档站使用方式

- 宽屏浏览器使用左侧目录和右侧本页目录。
- 移动浏览器通过顶部菜单打开分类目录。
- 点击导航栏“搜索文档”，或按 `/`、`Ctrl+K` / `Command+K` 打开本地全文搜索。
- 每页底部可进入上一篇或下一篇；标题旁的链接可复制精确锚点。
- 右上角外观按钮切换浅色、深色或跟随系统主题。
- “在 GitHub 上编辑此页”会打开当前 Markdown 源文件，便于提交修正。

Monkey King 应用内的离线文档由具体 APK 构建决定，界面入口可能随版本或构建变体变化。站点导航不再依赖旧版“索引 / 查看全部 / 长按文档标签”等交互；找不到应用内入口时可直接访问 `https://docs.monkeyking.com`。

## 编写脚本

Monkey King 自带编辑与运行能力，也可以在电脑上使用任意支持 JavaScript 的编辑器。桌面编辑器只负责文本与类型提示，实际行为仍应在 Android 设备或模拟器上的 Monkey King 6.7.0 验证。

```js
'use strict';

const output = files.join(files.cwd(), 'hello.txt');
files.write(output, 'Hello, Monkey King');
toastLog(output);
```

学习 JavaScript 可参考 [MDN JavaScript 指南](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide) 与 [JavaScript.info](https://zh.javascript.info/)。Rhino 的标准兼容性可参考 [Rhino compatibility table](https://mozilla.github.io/rhino/compat/engines.html)，但 Monkey King 还包含自身扩展与补丁。

## 版本与可追溯性

API 页面中的版本标签表示该成员的已知引入或变更版本：

- `v6.7.0`：可追溯到当前版本新增或公开的能力。
- `≤ v6.6.4`：固定源码中存在，但当前仓库历史不足以精确定位更早引入版本。
- `Deprecated`：仍可调用但不建议在新脚本中使用。

Android、Java、OkHttp、OpenCV 等外部类型只说明 Monkey King 的入口与差异；完整成员以对应项目官方文档为准。

## 反馈

- 文档问题：在 [MonkeyKing-Documentation](https://github.com/qiaomu-s/MonkeyKing-Documentation/issues) 提交 issue。
- 应用或 API 行为问题：在 [Monkey King 源码仓](https://github.com/qiaomu-s/AutoJs6/issues) 提交 issue；私有仓访问权限由仓库所有者管理。
- 提交问题时请附上 Monkey King 版本、Android API 级别、设备或模拟器信息、最小复现脚本和完整错误日志。
