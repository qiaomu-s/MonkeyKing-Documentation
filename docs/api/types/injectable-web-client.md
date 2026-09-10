# InjectableWebClient

[android.webkit.WebViewClient](https://developer.android.com/reference/android/webkit/WebViewClient)
的子类。Monkey King 6.7.0 在 Rhino 2.0 中用它把脚本排队到页面加载完成后执行。

常见相关方法或属性:

- [web.newInjectableWebClient](../network/web.md#m-newinjectablewebclient)

> 注: 本章节仅列出 InjectableWebClient 独有的而不包含继承的属性及方法.

---

<p style="font: bold 2em sans-serif; color: #FF7043">InjectableWebClient</p>

---

## [m#] inject

### inject(script, callback?)

**`6.7.0`** **`Overload [1-2]/2`**

- **script** { [string](data-types.md#string) } - 脚本
- **[ callback ]** { [(](data-types.md#function)value: [string](data-types.md#string)[)](data-types.md#function) [=>](data-types.md#function) [void](data-types.md#void) } - 脚本
- <ins>**returns**</ins> { [void](data-types.md#void) }

注入 `script` 参数提供的 JavaScript 脚本, `callback` 回调参数可用于获取脚本语句的执行结果.

```js
'ui';

let client = web.newInjectableWebClient();
client.inject('navigator.userAgent', value => console.log(value));

let webView = web.newInjectableWebView('www.github.com');
webView.setWebViewClient(client);
activity.setContentView(webView);
```

## [m#] injectAndWait

### injectAndWait(script)

**`6.7.0`**

- **script** { [string](data-types.md#string) } - 脚本
- <ins>**returns**</ins> { [string](data-types.md#string) } - 脚本执行结果

注入 `script` 参数提供的 JavaScript 脚本, 等待脚本执行完毕, 返回执行结果.

```js
'ui';

var client = web.newInjectableWebClient();
var webView = web.newInjectableWebView('https://example.com');
webView.setWebViewClient(client);
activity.setContentView(webView);

threads.start(function () {
    console.log(client.injectAndWait('document.title'));
});
```

`inject` 在页面尚未完成时进入 FIFO 队列，页面完成后调用 Android
[`WebView.evaluateJavascript`](https://developer.android.com/reference/android/webkit/WebView#evaluateJavascript(java.lang.String,%20android.webkit.ValueCallback%3Cjava.lang.String%3E))。
`injectAndWait` 会阻塞当前线程直到回调到达，不应在 UI 线程调用；线程被中断时抛出
`ScriptInterruptedException`。客户端还会启用 JavaScript 和 file URL 的跨源访问能力，
因此只应加载可信页面和脚本。
