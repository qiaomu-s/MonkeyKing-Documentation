# InjectableWebView

[android.webkit.WebView](https://developer.android.com/reference/android/webkit/WebView)
的子类。Monkey King 为 Rhino 2.0 预设 JavaScript、DOM storage、宽视口和
缩放支持，并安装默认的 InjectableWebClient 与
[WebChromeClient](https://developer.android.com/reference/android/webkit/WebChromeClient)。

常见相关方法或属性:

- [web.newInjectableWebView](../network/web.md#m-newinjectablewebview)

> 注：本页展开 `InjectableWebView` 自有成员；继承自 `WebView` 的成员请参阅
> [Android 官方参考](https://developer.android.com/reference/android/webkit/WebView)。

---

<p style="font: bold 2em sans-serif; color: #FF7043">InjectableWebView</p>

---

## [m#] inject

### inject(script, callback?)

 **`Overload [1-2]/2`**

- **script** { [string](data-types.md#string) } - 脚本
- **[ callback ]** { [(](data-types.md#function)value: [string](data-types.md#string)[)](data-types.md#function) [=>](data-types.md#function) [void](data-types.md#void) } - 脚本
- <ins>**returns**</ins> { [void](data-types.md#void) }

注入 `script` 参数提供的 JavaScript 脚本, `callback` 回调参数可用于获取脚本语句的执行结果.

```js
'ui';
let webView = web.newInjectableWebView('https://example.com');
webView.inject('navigator.userAgent', value => console.log(value));
activity.setContentView(webView);
```

调用会转交给内部 `InjectableWebClient`。页面尚未加载完成时脚本进入队列；加载完成后
使用 `evaluateJavascript` 异步执行。回调值是 WebView 返回的 JSON 编码字符串。
WebView 的创建、附加和大多数操作必须在 UI 线程进行。加载 `file:` URL 时会额外开启
文件访问和 file URL 的跨源访问能力，只应对可信本地内容使用。

页面不再使用时应先从父容器移除并在 UI 线程调用继承的 `webView.destroy()`；
`InjectableWebView` 没有额外的自动销毁钩子。若在页面加载完成前排队注入脚本，
队列会一直保留到 `onPageFinished`，没有取消单条排队脚本的公开方法。
