# 万维网 (Web)

Monkey King 6.7.0 的 `web` 模块在 Rhino 2.0 中创建可注入的 Android
[WebView](https://developer.android.com/reference/android/webkit/WebView)、
[WebViewClient](https://developer.android.com/reference/android/webkit/WebViewClient)
和 WebSocket。WebView 必须在 UI 线程创建和操作；加载远程页面还需要网络权限，
页面脚本及桥接能力应只用于可信内容。

<a id="api-symbol-bW9kdWxlOndlYg"></a>

在应用里显示网页内容, 而不是打开独立的浏览器, 此时可使用 WebView 类, 以实现在 [activity](../../reference/android/activity.md) 中显示网页内容.

web 模块主要用于 [WebView](https://developer.android.com/reference/android/webkit/WebView) 网页的 [ [注入 (Inject)](../../reference/glossaries/glossary.md#注入) / 构建客户端 ] 等.

> 注: 与 [http](http.md) 模块不同, http 模块主要用于网络的请求与响应.

---

<p style="font: bold 2em sans-serif; color: #FF7043">web</p>

---

## [m] newInjectableWebView

<a id="api-symbol-d2ViLm5ld0luamVjdGFibGVXZWJWaWV3"></a>

### newInjectableWebView(url?)

**`6.3.0`** **`Global`** **`Overload [1-2]/3`** **`UI`**

- **[ url ]** { [string](../types/data-types.md#string) } - 需要 WebView 加载的 URL
- <ins>**returns**</ins> { [InjectableWebView](../types/injectable-web-view.md) }

新建并返回一个 [InjectableWebView](../types/injectable-web-view.md) (可 [注入](../../reference/glossaries/glossary.md#注入) 的 [WebView](https://developer.android.com/reference/android/webkit/WebView)) 实例.

```js
'ui';

ui.layout(<vertical>
    <frame id="main"/>
</vertical>);

/* 创建一个 InjectableWebView 实例. */
let webView = newInjectableWebView();
/* 加载指定的 URL；请显式写出协议. */
webView.loadUrl('https://example.com');
/* 注入 JavaScript 脚本, 显示 alert 消息框. */
webView.inject('alert("hello")');
/* 附加视图对象到 id 为 main 的视图上. */
ui.main.addView(webView);
```

上述示例也可使用 `setContentView` 实现更简单的内容加载 (但不包含代码注入):

```js
'ui';
activity.setContentView(web.newInjectableWebView('https://example.com'));
```

除上述注入简单的 `alert` 消息框外, 还支持其他更多注入方式:

```js
/* 以给定的 URL 来替换当前的资源. */
webView.inject('document.location.replace("https://www.jetbrains.com")');
/* 替换整个 document 的内容. */
webView.inject('document.write("hello")');
/* 替换 body 元素为指定的 HTML 内容. */
webView.inject('document.body.innerHTML = "<p>hello</p>"');
/* 指定 body 元素的字体颜色. */
webView.inject('document.body.style = "color:green"');
/* 在文档末尾附加一个自定义元素. */
webView.inject('let p = document.createElement("p"); p.innerHTML = "hello"; document.body.appendChild(p)');
/* 使用回调方法获取内部信息. */
webView.inject('navigator.userAgent', result => console.log(result));
```

如需对上述 `webView` 实例进行一些设置, 可通过 `webView.getSettings()` 获得 [android.webkit.WebSettings](https://developer.android.com/reference/android/webkit/WebSettings) 对象, 再进行个性化设置:

```js
let settings = webView.getSettings();

/* 设置 WebView 默认字体大小, 默认值 16. */
settings.setDefaultFontSize(18);
/* 设置是否允许脚本自动弹出新窗口, 默认 false. */
settings.setJavaScriptCanOpenWindowsAutomatically(true);
/* 设置 WebView 是否支持使用屏幕控件或手势进行缩放, 默认 true. */
settings.setSupportZoom(false);

/* 其余 WebSettings 选项可按 Android API 逐项配置. */
```

对于 `InjectableWebView`, 其内部已经对 WebView 进行了一些初始化设置, 包括:

```java
settings.setUseWideViewPort(true);
settings.setBuiltInZoomControls(true);
settings.setLoadWithOverviewMode(true);
settings.setJavaScriptEnabled(true);
settings.setJavaScriptCanOpenWindowsAutomatically(true);
settings.setDomStorageEnabled(true);
settings.setDisplayZoomControls(false);
```

这些是 MonkeyKing 6.7.0 的默认初始化项；其他 `WebSettings` 选项保持 Android
平台默认值，调用方可在页面创建后自行调整。

此外, `InjectableWebView` 内部还初始化了一个默认的 [WebChromeClient](https://developer.android.com/reference/android/webkit/WebChromeClient) 客户端:

```java
setWebChromeClient(new WebChromeClient());
```

> 注:<br>
> WebChromeClient 中的 "Chrome" 与 Google Chrome 浏览器中的 "Chrome" 不同.<br>
> WebView 中的 "Chrome" 指代 WebView 外面的装饰及 UI 部分.<br>
> WebChromeClient 是 HTML/JavaScript 与 Android 客户端交互的中间件, 它将 WebView 中 JavaScript 产生的事件封装后传递到 Android 客户端, 从而避免一些可能的安全问题.<br>
> 同时 WebChromeClient 也可以辅助 WebView 处理 JavaScript 对话框, 显示加载进度, 上传文件等.

在 WebView 中访问了多个网页时, 按返回键会立即关闭整个页面, 而不是回退到上一个历史网页.<br>
如果希望在 WebView 里浏览历史网页, 可参考如下代码:

```js
ui.emitter.on('back_pressed', function (e) {
    if (webView.canGoBack()) {
        webView.goBack();
        e.consumed = true;
    }
});
```

### newInjectableWebView([context], url?)

**`6.3.0`** **`Global`** **`Overload 3/3`** **`UI`**

- **[ context ]** { [android.content.Context](https://developer.android.com/reference/android/content/Context) } - Android 上下文对象；缺省时使用 UI 模式下全局 `activity` 解包后的 Context
- **[ url ]** { [string](../types/data-types.md#string) } - 可选的初始 URL；为 `null`/`undefined` 时不自动加载
- <ins>**returns**</ins> { [InjectableWebView](../types/injectable-web-view.md) }

新建并返回一个 [InjectableWebView](../types/injectable-web-view.md)（可[注入](../../reference/glossaries/glossary.md#注入)的 [WebView](https://developer.android.com/reference/android/webkit/WebView)）实例。传入两个参数时第一个按 Android `Context` 解包，第二个为可选 URL；传入一个非字符串对象时将其作为 Context，无法解包时回退到全局 UI Context。传入一个字符串时按 URL 处理；不传参数时同样使用全局 UI Context。它不是 Rhino `Context`。

```js
'ui';
var context = activity;
var webView = web.newInjectableWebView(context, 'https://example.com');
activity.setContentView(webView);
```

## [m] newInjectableWebClient

<a id="api-symbol-d2ViLm5ld0luamVjdGFibGVXZWJDbGllbnQ"></a>

### newInjectableWebClient()

**`6.3.0`** **`Global`**

- <ins>**returns**</ins> { [InjectableWebClient](../types/injectable-web-client.md) }

新建并返回一个 [InjectableWebClient](../types/injectable-web-client.md) (可 [注入](../../reference/glossaries/glossary.md#注入) 的 [WebViewClient](https://developer.android.com/reference/android/webkit/WebViewClient)) 实例.

```js
/* 为 webView 对象重新设置一个新的客户端. */
webView.setWebViewClient(newInjectableWebClient());
```

## [m] newWebSocket

<a id="api-symbol-d2ViLm5ld1dlYlNvY2tldA"></a>

### newWebSocket(url)

**`6.3.1`** **`Global`**

- **url** { [string](../types/data-types.md#string) } - 请求的 URL 地址
- <ins>**returns**</ins> { [WebSocket](web-socket.md) }

构建一个 [WebSocket](web-socket.md) 实例.

相当于 `new WebSocket(url)`.

> 参阅: [WebSocket](web-socket.md) 章节

```js
var socket = web.newWebSocket('wss://echo.websocket.events');
socket.on(WebSocket.EVENT_OPEN, function () {
    socket.send('Hello from Rhino 2.0');
});
socket.exitOnClose();
```

## 线程、生命周期与异常

- `newInjectableWebView` 创建 Android 视图，只能在 UI 环境和 UI 线程安全使用；URL
  为字符串时会在构造期间开始加载。
- `newInjectableWebClient` 只创建客户端；脚本注入在页面完成加载前会进入队列。
- `newWebSocket` 立即启动异步连接，失败通过 `WebSocket.EVENT_FAILURE` 交付。
- 参数数量错误会由 Rhino/Kotlin 桥接层抛出参数异常；无法解包的 `context` 会回退到全局
  UI Context。无效 URL 会由底层 WebView 或 OkHttp 拒绝。


## 逐符号版本与 Rhino 2.0 示例

下列每个条目都对应一个公开 API 符号；示例按 Rhino 2.0 语法书写。需要文件、网络或 UI 资源的示例应在具备相应运行条件时执行。

<!-- api-member-contract id="module:web" version="6.7.0" -->
`module:web` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof web);
```

<!-- api-member-contract id="web.newInjectableWebClient" version="6.7.0" -->
`web.newInjectableWebClient` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof web.newInjectableWebClient);
```

<!-- api-member-contract id="web.newInjectableWebView" version="6.7.0" -->
`web.newInjectableWebView` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof web.newInjectableWebView);
```

<!-- api-member-contract id="web.newWebSocket" version="6.7.0" -->
`web.newWebSocket` · 版本：**6.7.0** · Rhino 2.0 示例：
```js
console.log(typeof web.newWebSocket);
```
