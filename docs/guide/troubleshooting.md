# 疑难解答 (Troubleshooting)

本页针对 Monkey King 6.7.0 的常见运行问题给出可验证的排查顺序。先运行最小脚本确认环境，再逐项增加权限、线程和外部依赖；不要一次把所有设置都打开。

本文按 Monkey King 6.7.0 的公开行为核对。

## 先确认版本与执行环境

```js
console.log({
    versionName: monkeyking.versionName,
    versionCode: monkeyking.versionCode,
    packageName: monkeyking.packageName,
    apiLevel: device.sdkInt,
    engine: engines.myEngine().toString(),
    cwd: files.cwd(),
});
```

提交问题时保留这段输出，并说明脚本是普通、UI、定时任务、Intent 触发还是打包应用。Monkey King 主应用的正式包名是 `com.qiaomu.monkeyking`；构建变体或自建 APK 可能带后缀。

## 脚本无法运行

### 出现语法错误

Monkey King 使用 Rhino 2.0，不是 V8、浏览器或 Node.js。先删除装饰器、可选链等不确定语法，确认最小 ES6 脚本可运行：

```js
'use strict';

const values = [1, 2, 3];
console.log(values.map(value => value * 2));
```

如果代码来自 npm 包，还要确认它没有依赖 DOM、Node.js 原生模块、动态 `import()` 或构建期注入变量。第三方库入口见 [模块系统](../api/core/modules.md)。

### 相对路径找不到文件

相对路径以当前引擎工作目录为基准，不一定等于脚本文件所在目录。打印 `files.cwd()`，再用 `files.path()` 或 `files.join()` 解析：

```js
const path = files.join(files.cwd(), 'config.json');
console.log({ path, exists: files.exists(path) });
```

定时任务、Intent 触发和打包应用可能使用不同工作目录，不要硬编码桌面开发时的绝对路径。

### `require()` 找不到模块

先确认模块名、文件扩展名和目录中的 `package.json` / `index.js`。本地模块应使用 CommonJS：

```js
// lib/value.js
module.exports = { value: 42 };

// main.js
const local = require('./lib/value');
console.log(local.value);
```

Monkey King 支持部分 `node_modules` 布局，但不保证 Node.js 原生模块或面向 V8 的预编译包可用。

## 无障碍与自动化

### 找不到控件或点击无效

1. 确认 Monkey King 无障碍服务已启用。
2. 在脚本开始调用 `auto.waitFor()`，不要只依赖系统设置页的开关状态。
3. 打印当前包名、Activity 和控件树中的关键属性。
4. 优先使用稳定的 `id`、文本与层级组合，避免只依赖屏幕坐标。
5. WebView、游戏、自绘 Canvas 或安全窗口可能没有可用无障碍节点，此时再考虑坐标或图像方案。

```js
auto.waitFor();

console.log({
    packageName: currentPackage(),
    activityName: currentActivity(),
});

const target = text('确定').findOne(3000);
if (target === null) {
    throw new Error('未找到“确定”控件');
}
console.log(target.click());
```

自动化动作会影响当前前台应用。测试时使用专用账号和可恢复数据，避免在支付、删除或授权界面上直接运行未验证脚本。

### 坐标在另一台设备上偏移

确认设计分辨率、屏幕方向、状态栏和显示缩放。可用 `setScreenMetrics()` 或 `setScaleBases()` 建立缩放基准，但分屏、折叠屏和应用内缩放仍可能改变实际坐标。

```js
setScreenMetrics(1080, 1920);
console.log({ x: cX(540), y: cY(960) });
```

## 截图、图像与 OCR

### 截图返回失败或弹出授权窗口

调用 `images.requestScreenCapture()` 会触发 Android MediaProjection 授权；用户可拒绝，系统也可能在进程重启后要求重新授权。不要在 UI 线程等待授权。

```js
if (!images.requestScreenCapture()) {
    throw new Error('用户拒绝截图权限');
}

const image = images.captureScreen();
try {
    console.log(image.getWidth(), image.getHeight());
} finally {
    image.recycle();
}
```

图像包装对象占用原生内存。循环处理时应在 `finally` 中回收中间图像，并避免长期保存大量截图。

### OCR 结果为空或差异很大

6.7.0 提供 ML Kit、Paddle 和 Rapid 三种入口。不同引擎的模型、语言、方向校正和输出类型不同；先用同一张清晰、正向、对比度足够的静态图片比较，再调整区域和选项。

```js
const image = images.read('./ocr-sample.png');
try {
    console.log(ocr.mlkit.recognizeText(image));
    console.log(ocr.rapid.recognizeText(image));
} finally {
    image.recycle();
}
```

Paddle 可使用内置实现或插件宿主，是否可用取决于当前构建和插件安装状态。完整选项见 [OCR](../api/media/ocr.md)。

## 权限问题

### `runtime.requestPermissions()` 没有效果

该方法只会请求 APK Manifest 已声明、且 Android 允许动态授予的运行时权限。Root、Shizuku、无障碍、通知监听、悬浮窗、所有文件访问、修改系统设置等属于特殊访问权，需要各自的系统设置或模块入口。

```js
runtime.requestPermissions([
    'record_audio',
    'android.permission.ACCESS_FINE_LOCATION',
]);
```

方法会启动权限请求 Activity，但不会同步返回最终授权结果。需要继续使用权限时，应在用户操作后再次检查实际能力。

### 悬浮窗或对话框无法显示

- 检查“显示在其他应用上层”权限。
- 后台脚本没有 `activity`，不要把 Application Context 当作 Activity 窗口使用。
- UI 脚本中的界面更新应切回 UI 线程。
- 系统和厂商可能限制后台弹窗。

```js
if (!floaty.hasPermission()) {
    floaty.requestPermission();
    exit();
}
```

### Android 13 及以上通知不显示

除通知渠道外，系统可能要求 `POST_NOTIFICATIONS` 运行时权限。用户关闭渠道后，应用不能用脚本强制重新打开，只能引导用户进入系统通知设置。

## UI 线程与阻塞

### UI 点击后界面卡死

网络、文件大批量处理、`sleep()`、同步 OCR 和 Promise `wait()` 都不应直接在 UI 回调中执行。把耗时工作放入 `threads.start()`，只在 `ui.run()` 中更新视图：

```js
'ui';

ui.layout(
    <vertical padding="16">
        <button id="load" text="加载" />
        <text id="result" text="未开始" />
    </vertical>
);

ui.load.on('click', () => {
    threads.start(() => {
        const response = http.get('https://example.com');
        const text = response.body.string();
        ui.run(() => ui.result.setText(`长度: ${text.length}`));
    });
});
```

脚本退出时 runtime 会清理其线程、计时器、事件和 UI 资源，但业务代码仍应主动关闭不再需要的响应体、文件和监听器。

## 网络与 WebSocket

### HTTP 请求失败

先区分 DNS、TLS、超时、HTTP 状态码和 JSON 解析错误。服务器返回 404 或 500 不等于传输层异常；读取响应前检查状态码。

```js
try {
    const response = http.get('https://example.com');
    console.log({
        statusCode: response.statusCode,
        statusMessage: response.statusMessage,
    });
    console.log(response.body.string());
} catch (error) {
    console.error(error.stack || error);
}
```

企业代理、自签名证书和旧 TLS 配置需要服务端或客户端证书策略配合。不要通过全局关闭证书校验来解决生产问题。

### WebSocket 连接后脚本立即退出

保留 WebSocket 引用并注册事件；根据脚本设计维持事件循环。退出时关闭连接，避免远端仍认为会话有效。

```js
const socket = web.newWebSocket('wss://echo.websocket.events');

socket.on('open', () => socket.send('hello'));
socket.on('text', text => {
    console.log(text);
    socket.close(1000, 'done');
});
socket.on('failure', error => console.error(error));
```

## Root 与 Shizuku

### Root 命令失败

`su` 文件存在不代表授权成功。先检查 `monkeyking.isRootAvailable()`，再查看 shell 结果的 `code`、`result` 和 `error`。不要假设不同 Root 管理器的提示和挂载命名空间完全一致。

```js
const result = shell('id', true);
console.log(result.toJson());
result.throwIfError();
```

### Shizuku 未连接

Shizuku 依赖管理器应用、Binder 服务和用户授权。设备重启后服务可能需要重新启动。调用命令前检查模块的 operational / permission 状态，失败时不要自动退化为 Root，除非脚本明确允许。

## 定时任务与外部启动

### 定时任务没有按时运行

检查 Android 精确闹钟权限、电池优化、自启动与后台限制。Monkey King 被强制停止、清除数据或卸载后，任务不能继续运行。厂商电源管理可能延迟或取消后台启动。

定时或 Intent 启动的脚本可从当前引擎参数读取触发数据：

```js
const argv = engines.myEngine().execArgv;
if (argv && argv.intent) {
    console.log(argv.intent.getAction());
}
```

### 锁屏后自动化失败

`device.wakeUp()` 只负责唤醒屏幕，不保证解除安全锁屏。不要在文档或脚本中保存 PIN、密码等敏感凭据；需要无人值守设备时，应使用专门测试设备和合规的设备管理方案。

## 项目与打包 APK

项目目录使用 `project.json` 描述入口、版本、包名和 `launchConfig`。6.7.0 同时识别兼容键 `hideLogs` 与规范键 `logsVisible`；新项目应优先使用语义明确的规范字段。

```json
{
  "name": "First Project",
  "versionName": "1.0.0",
  "versionCode": 1,
  "packageName": "com.example.first",
  "main": "main.js",
  "launchConfig": {
    "logsVisible": false,
    "splashVisible": false,
    "launcherVisible": true,
    "runOnBoot": false
  }
}
```

自建 APK 的功能、签名、包名、权限和系统升级路径都可能与 Monkey King 主应用不同。构建前确认资源许可、applicationId 唯一性和所需权限，不要依靠 APK 编辑器追加危险权限。

## 文档显示或搜索异常

- 网页版支持浅色 / 深色主题和本地全文搜索。
- 应用内离线文档取决于 APK 内置资源；与在线站点版本不一致时，以 `https://docs.monkeyking.com` 为准。
- 搜索不到新 API 时，先确认页面底部更新时间与应用版本。
- 失效链接或错误签名请通过应用内反馈入口或授权支持渠道提交，并附页面 URL 和标题锚点。

## 如何提交有效反馈

最小反馈应包含：

1. Monkey King `versionName` 和 `versionCode`。
2. Android API 级别、设备型号或模拟器镜像。
3. 脚本执行方式及已授予权限。
4. 可直接运行的最小复现脚本。
5. 完整日志、异常栈和预期结果。

文档或应用行为问题请通过应用内反馈入口或授权支持渠道提交。
