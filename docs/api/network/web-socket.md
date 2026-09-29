# WebSocket

Monkey King 的 <code>WebSocket</code> 是对
[OkHttp WebSocket](https://square.github.io/okhttp/5.x/okhttp/okhttp3/-web-socket/)
的 Rhino 2.0 封装，并继承 [EventEmitter](../types/event-emitter.md) 的事件接口。
构造实例会立即创建连接；收发、关闭和失败结果通过事件回调交付。

本页按 Monkey King 的实现合同描述公开行为。网络权限、DNS、TLS
证书校验和服务端策略都可能令连接失败。监听器在运行时计时器线程可用时由
<code>setImmediate</code> 调度，否则由脚本桥直接调用；不要在监听器中执行长时间
阻塞操作。

~~~js
var socket = new WebSocket('wss://echo.websocket.events');

socket
    .on(WebSocket.EVENT_OPEN, function () {
        socket.send('Hello from Rhino 2.0');
    })
    .on(WebSocket.EVENT_TEXT, function (text) {
        console.log(text);
        socket.close(WebSocket.CODE_CLOSE_NORMAL, 'done');
    })
    .on(WebSocket.EVENT_FAILURE, function (error) {
        console.error(error);
    });

socket.exitOnClose();
~~~

<a id="api-symbol-bW9kdWxlOndlYlNvY2tldA"></a>

## WebSocket 模块



全局 <code>WebSocket</code> 同时是构造器和静态常量容器。也可通过
[web.newWebSocket](web.md#newwebsocket-url) 使用默认 HTTP 客户端创建同类实例。

<a id="api-symbol-Y29uc3RydWN0OndlYlNvY2tldA"></a>

## new WebSocket(url) / new WebSocket(client, url)

**Global**

- <code>url</code>：字符串，WebSocket 地址。
- <code>client</code>：可选的 Monkey King 可变 OkHttp 客户端；其他类型会回退到
  <code>http.okhttp</code>。
- 返回：新的 <code>WebSocket</code> 实例。

一个参数时使用运行时默认客户端。两个参数时，首参数只有在属于运行时的
<code>MutableOkHttp</code> 类型时才会采用。构造过程立即调用客户端的
<code>newWebSocket</code>，因此连接事件可能很快到达。

~~~js
var defaultSocket = new WebSocket('wss://echo.websocket.events');
var configuredSocket = new WebSocket(http.okhttp, 'wss://echo.websocket.events');

defaultSocket.exitOnClose();
configuredSocket.exitOnClose();
~~~

<a id="api-symbol-d2ViU29ja2V0LmdldA"></a>

## WebSocket.get(scope, key)



静态字段代理。运行时用它从 <code>WebSocket</code> 伴生对象读取名为
<code>key</code> 的公开常量；不存在或读取失败时返回 Rhino 的“属性不存在”值。
脚本通常直接读取 <code>WebSocket.EVENT_OPEN</code> 等属性，无需手动调用本方法。

### 事件常量

事件监听器的最后一个参数始终是当前 <code>WebSocket</code> 实例。

<a id="api-symbol-d2ViU29ja2V0LkVWRU5UX09QRU4"></a>

#### WebSocket.EVENT_OPEN

**值：<code>"open"</code>**

连接建立后触发。监听器参数为 <code>(response, socket)</code>，其中
<code>response</code> 是握手响应。

<a id="api-symbol-d2ViU29ja2V0LkVWRU5UX01FU1NBR0U"></a>

#### WebSocket.EVENT_MESSAGE

**值：<code>"message"</code>**

收到任意消息时触发。监听器参数为 <code>(message, socket)</code>；
<code>message</code> 是字符串或
[okio.ByteString](https://square.github.io/okio/3.x/okio/okio/okio/-byte-string/)。
同一消息随后还会触发 <code>EVENT_TEXT</code> 或 <code>EVENT_BYTES</code>。

<a id="api-symbol-d2ViU29ja2V0LkVWRU5UX1RFWFQ"></a>

#### WebSocket.EVENT_TEXT

**值：<code>"text"</code>**

收到文本消息时触发。监听器参数为 <code>(text, socket)</code>。

<a id="api-symbol-d2ViU29ja2V0LkVWRU5UX0JZVEVT"></a>

#### WebSocket.EVENT_BYTES

**值：<code>"bytes"</code>**

收到二进制消息时触发。监听器参数为 <code>(bytes, socket)</code>，
<code>bytes</code> 为 <code>okio.ByteString</code>。

<a id="api-symbol-d2ViU29ja2V0LkVWRU5UX0NMT1NJTkc"></a>

#### WebSocket.EVENT_CLOSING

**值：<code>"closing"</code>**

远端表示不会再发送消息时触发。监听器参数为
<code>(code, reason, socket)</code>。

<a id="api-symbol-d2ViU29ja2V0LkVWRU5UX0NMT1NFRA"></a>

#### WebSocket.EVENT_CLOSED

**值：<code>"closed"</code>**

双方完成关闭且连接资源已释放时触发。监听器参数为
<code>(code, reason, socket)</code>。

<a id="api-symbol-d2ViU29ja2V0LkVWRU5UX0ZBSUxVUkU"></a>

#### WebSocket.EVENT_FAILURE

**值：<code>"failure"</code>**

读写或握手失败时触发。监听器参数为
<code>(error, response, socket)</code>；在尚无 HTTP 响应时
<code>response</code> 为 <code>null</code>。失败前已排队或已接收的数据可能丢失。

<a id="api-symbol-d2ViU29ja2V0LkVWRU5UX01BWF9SRUJVSUxEUw"></a>

#### WebSocket.EVENT_MAX_REBUILDS

**值：<code>"max_rebuilds"</code>**

调用 <code>rebuild</code> 时已达到允许的重建次数后触发。监听器参数为
<code>(maxRebuildTimes, socket)</code>。

~~~js
var socket = new WebSocket('wss://echo.websocket.events');
socket.on(WebSocket.EVENT_MESSAGE, function (message) {
    if (typeof message === 'string') {
        console.log('text:', message);
    } else {
        console.log('bytes:', message.hex());
    }
});
socket.exitOnClose();
~~~

### 关闭状态常量

这些值可传给 <code>close(code, reason)</code>。OkHttp 会校验发送用关闭码；
部分保留状态码用于描述接收或异常状态，并不适合作为主动发送值。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfQ0xPU0VfTk9STUFM"></a>

#### WebSocket.CODE_CLOSE_NORMAL

**值：1000**

正常完成或常规关闭。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfQ0xPU0VfR09JTkdfQVdBWQ"></a>

#### WebSocket.CODE_CLOSE_GOING_AWAY

**值：1001**

端点即将离开或服务即将不可用。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfQ0xPU0VfUFJPVE9DT0xfRVJST1I"></a>

#### WebSocket.CODE_CLOSE_PROTOCOL_ERROR

**值：1002**

协议错误或无效帧。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfQ0xPU0VfVU5TVVBQT1JURUQ"></a>

#### WebSocket.CODE_CLOSE_UNSUPPORTED

**值：1003**

收到端点不支持的数据帧类型。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfQ0xPU0VEX05PX1NUQVRVUw"></a>

#### WebSocket.CODE_CLOSED_NO_STATUS

**值：1005**

连接已关闭，但未收到关闭状态码。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfQ0xPU0VfQUJOT1JNQUw"></a>

#### WebSocket.CODE_CLOSE_ABNORMAL

**值：1006**

未收到关闭帧的异常关闭。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfVU5TVVBQT1JURURfUEFZTE9BRA"></a>

#### WebSocket.CODE_UNSUPPORTED_PAYLOAD

**值：1007**

消息内容与声明类型不一致，例如无效 UTF-8。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfUE9MSUNZX1ZJT0xBVElPTg"></a>

#### WebSocket.CODE_POLICY_VIOLATION

**值：1008**

消息违反端点策略，且没有更具体的状态码。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfQ0xPU0VfVE9PX0xBUkdF"></a>

#### WebSocket.CODE_CLOSE_TOO_LARGE

**值：1009**

消息过大，端点无法处理。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfTUFOREFUT1JZX0VYVEVOU0lPTg"></a>

#### WebSocket.CODE_MANDATORY_EXTENSION

**值：1010**

客户端要求的扩展没有由服务端协商。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfU0VSVkVSX0VSUk9S"></a>

#### WebSocket.CODE_SERVER_ERROR

**值：1011**

服务端处理请求时发生内部错误。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfU0VSVklDRV9SRVNUQVJU"></a>

#### WebSocket.CODE_SERVICE_RESTART

**值：1012**

服务正在重启。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfVFJZX0FHQUlOX0xBVEVS"></a>

#### WebSocket.CODE_TRY_AGAIN_LATER

**值：1013**

服务端暂时拒绝请求，可稍后重试。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfQkFEX0dBVEVXQVk"></a>

#### WebSocket.CODE_BAD_GATEWAY

**值：1014**

网关从外部组件收到无效响应。

<a id="api-symbol-d2ViU29ja2V0LkNPREVfVExTX0hBTkRTSEFLRV9GQUlM"></a>

#### WebSocket.CODE_TLS_HANDSHAKE_FAIL

**值：1015**

TLS 握手失败，例如证书未通过验证。

### 实例属性

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLmNsaWVudA"></a>

#### socket.client



创建连接所用的
[okhttp3.OkHttpClient](https://square.github.io/okhttp/5.x/okhttp/okhttp3/-ok-http-client/)
只读引用。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLnVybA"></a>

#### socket.url



构造时提供的 URL 字符串。重建连接时继续使用该值。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLmRlZmF1bHRNYXhMaXN0ZW5lcnM"></a>

#### socket.defaultMaxListeners



继承自 <code>EventEmitter</code> 的静态默认值，初始为 10。它只影响之后创建的
发射器实例的初始上限；已有实例请用 <code>setMaxListeners</code> 修改。

### 连接与消息方法

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLnNlbmQ"></a>

#### socket.send(text) / socket.send(bytes)



- <code>text</code>：字符串，按 UTF-8 文本消息发送。
- <code>bytes</code>：<code>okio.ByteString</code>，按二进制消息发送。
- 返回：布尔值，消息成功进入发送队列时为 <code>true</code>。

方法立即返回。连接正在关闭、已关闭、已取消，或队列超出 OkHttp 限制时返回
<code>false</code>；队列溢出还会启动优雅关闭。

~~~js
var socket = new WebSocket('wss://echo.websocket.events');
socket.on(WebSocket.EVENT_OPEN, function () {
    console.log(socket.send('text message'));
    var bytes = okio.ByteString.encodeUtf8('binary message');
    console.log(socket.send(bytes));
    socket.close();
});
socket.exitOnClose();
~~~

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLmNsb3Nl"></a>

#### socket.close(code?, reason?) / socket.close(reason)



启动优雅关闭，并让已排队消息有机会先发送。省略状态码时使用
<code>CODE_CLOSE_NORMAL</code>；只传字符串时把它作为正常关闭原因。返回是否成功
启动关闭流程。状态码或原因不符合 OkHttp 约束时会抛出参数异常。

~~~js
socket.close();
socket.close(WebSocket.CODE_CLOSE_NORMAL);
socket.close(WebSocket.CODE_CLOSE_NORMAL, 'finished');
socket.close('finished');
~~~

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLmNhbmNlbA"></a>

#### socket.cancel()



立即取消连接并释放资源，尚未发送的队列内容会被丢弃。无返回值。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLnF1ZXVlU2l6ZQ"></a>

#### socket.queueSize()



返回等待发送的消息内容字节数，不含 WebSocket 帧、操作系统或中间网络缓冲。
取消后仍可能返回非零值，表示这些已排队数据没有送达。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLnJlcXVlc3Q"></a>

#### socket.request()



返回发起本连接的原始
[okhttp3.Request](https://square.github.io/okhttp/5.x/okhttp/okhttp3/-request/)。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLnJlYnVpbGQ"></a>

#### socket.rebuild(maxRebuildTimes?)



先取消当前连接，再用同一客户端和 URL 新建连接。传入
<code>maxRebuildTimes</code> 时先更新上限；每次成功开始重建后计数加一。达到上限时
不会新建连接，而会触发 <code>EVENT_MAX_REBUILDS</code>。省略上限时沿用当前值，
初始上限为 <code>Int.MAX_VALUE</code>。

~~~js
var socket = new WebSocket('wss://echo.websocket.events');
socket.on(WebSocket.EVENT_FAILURE, function () {
    socket.rebuild(3);
});
socket.on(WebSocket.EVENT_MAX_REBUILDS, function (limit) {
    console.error('rebuild limit:', limit);
});
socket.exitOnClose();
~~~

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLmV4aXRPbkNsb3Nl"></a>

#### socket.exitOnClose(enabled?) / socket.exitOnClose(timeout)



控制脚本退出时是否关闭连接。省略参数或传 <code>true</code> 会启用，传
<code>false</code> 会禁用；传入毫秒数会启用并把关闭延迟设为不小于零的值。此设置
不会令当前脚本立即退出，也不会等待远端完成关闭。

### 事件监听方法

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLm9u"></a>

#### socket.on(eventName, listener)



在事件列表末尾注册持久监听器并返回当前 socket，便于链式调用。如果该事件曾由
<code>emitSticky</code> 发射，注册时会先把保存的参数交给监听器，然后仍保留监听器。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLmFkZExpc3RlbmVy"></a>

#### socket.addListener(eventName, listener)



<code>on</code> 的别名，返回当前 socket。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLm9uY2U"></a>

#### socket.once(eventName, listener)



注册只执行一次的监听器并返回当前 socket。若已有同名粘性事件，监听器会立即收到
保存的参数，并且不会再加入监听列表。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLnByZXBlbmRMaXN0ZW5lcg"></a>

#### socket.prependListener(eventName, listener)



把持久监听器插入列表开头，并触发内部 <code>newListener</code> 事件。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLnByZXBlbmRPbmNlTGlzdGVuZXI"></a>

#### socket.prependOnceListener(eventName, listener)



把一次性监听器插入列表开头，并触发内部 <code>newListener</code> 事件。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLnJlbW92ZUxpc3RlbmVy"></a>

#### socket.removeListener(eventName, listener)



按函数对象身份移除第一个匹配监听器；成功移除时触发内部
<code>removeListener</code> 事件。返回当前 socket。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLnJlbW92ZUFsbExpc3RlbmVycw"></a>

#### socket.removeAllListeners(eventName?)



移除指定事件或全部事件的监听器，并为每个被移除的监听器触发内部
<code>removeListener</code> 事件。返回当前 socket。

~~~js
function onText(text) {
    console.log(text);
}

socket.prependOnceListener(WebSocket.EVENT_TEXT, onText);
socket.on(WebSocket.EVENT_TEXT, onText);
console.log(socket.listenerCount(WebSocket.EVENT_TEXT));
socket.removeListener(WebSocket.EVENT_TEXT, onText);
~~~

### 事件发射与查询

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLmVtaXQ"></a>

#### socket.emit(eventName, ...args)



向当前已注册监听器发射事件。有监听器时返回 <code>true</code>，否则返回
<code>false</code>。一次性监听器在本次发射后移除。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLmVtaXRTdGlja3k"></a>

#### socket.emitSticky(eventName, ...args)



先执行普通 <code>emit</code>，再保存本次参数，供之后注册的
<code>on</code>/<code>once</code> 监听器接收。返回普通发射是否命中监听器。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLmV2ZW50TmFtZXM"></a>

#### socket.eventNames()



返回监听器映射中已有的事件名称数组。移除单个监听器不会自动删除空的名称项。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLmxpc3RlbmVyQ291bnQ"></a>

#### socket.listenerCount(eventName)



返回指定事件当前注册的监听器数量；没有该事件时返回 0。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLmxpc3RlbmVycw"></a>

#### socket.listeners(eventName)



返回指定事件监听函数的快照数组。查询尚不存在的事件会为该名称创建空的监听器项。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLmdldE1heExpc3RlbmVycw"></a>

#### socket.getMaxListeners()



返回当前实例的监听器上限。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLnNldE1heExpc3RlbmVycw"></a>

#### socket.setMaxListeners(maxListeners)



设置每个事件名称允许的监听器数量并返回当前 socket。使用 0 表示不限制；使用正数
表示有限上限。超过上限时，后续注册会抛出包装后的
<code>TooManyListenersException</code>。

<a id="api-symbol-d2ViU29ja2V0Lmluc3RhbmNlLmdldFRpbWVy"></a>

#### socket.getTimer()



返回创建 <code>EventEmitter</code> 时绑定的运行时计时器；没有绑定时返回
<code>null</code>。这是底层调度对象，通常无需直接操作。

~~~js
var socket = new WebSocket('wss://echo.websocket.events');
socket.setMaxListeners(20);
console.log(socket.getMaxListeners());
console.log(socket.eventNames());
socket.cancel();
~~~

## 生命周期与错误处理

- 构造和重建都会把实例加入运行时的弱引用列表，供脚本退出钩子处理。
- <code>close</code> 是优雅关闭；<code>cancel</code> 立即丢弃未发送队列。
- <code>exitOnClose</code> 只登记退出策略。若实例已被回收，退出钩子不会再处理它。
- WebSocket 网络回调可能晚于发起调用；在 UI 脚本中更新视图时仍需遵守 Android
  线程规则。
- 服务端拒绝、网络断开、DNS 或 TLS 失败统一通过 <code>EVENT_FAILURE</code>
  交付；主动方法的参数错误则直接抛出。


## 逐符号版本与 Rhino 2.0 示例

下列每个条目都对应一个公开 API 符号；示例按 Rhino 2.0 语法书写。需要文件、网络或 UI 资源的示例应在具备相应运行条件时执行。

<!-- api-member-contract id="construct:webSocket" -->
`construct:webSocket` · Rhino 2.0 示例：
```js
var value = new WebSocket('wss://echo.websocket.events');
value.cancel();
```

<!-- api-member-contract id="module:webSocket" -->
`module:webSocket` · Rhino 2.0 示例：
```js
console.log(typeof webSocket);
```

<!-- api-member-contract id="webSocket.CODE_BAD_GATEWAY" -->
`webSocket.CODE_BAD_GATEWAY` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_BAD_GATEWAY);
```

<!-- api-member-contract id="webSocket.CODE_CLOSE_ABNORMAL" -->
`webSocket.CODE_CLOSE_ABNORMAL` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_CLOSE_ABNORMAL);
```

<!-- api-member-contract id="webSocket.CODE_CLOSE_GOING_AWAY" -->
`webSocket.CODE_CLOSE_GOING_AWAY` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_CLOSE_GOING_AWAY);
```

<!-- api-member-contract id="webSocket.CODE_CLOSE_NORMAL" -->
`webSocket.CODE_CLOSE_NORMAL` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_CLOSE_NORMAL);
```

<!-- api-member-contract id="webSocket.CODE_CLOSE_PROTOCOL_ERROR" -->
`webSocket.CODE_CLOSE_PROTOCOL_ERROR` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_CLOSE_PROTOCOL_ERROR);
```

<!-- api-member-contract id="webSocket.CODE_CLOSE_TOO_LARGE" -->
`webSocket.CODE_CLOSE_TOO_LARGE` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_CLOSE_TOO_LARGE);
```

<!-- api-member-contract id="webSocket.CODE_CLOSE_UNSUPPORTED" -->
`webSocket.CODE_CLOSE_UNSUPPORTED` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_CLOSE_UNSUPPORTED);
```

<!-- api-member-contract id="webSocket.CODE_CLOSED_NO_STATUS" -->
`webSocket.CODE_CLOSED_NO_STATUS` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_CLOSED_NO_STATUS);
```

<!-- api-member-contract id="webSocket.CODE_MANDATORY_EXTENSION" -->
`webSocket.CODE_MANDATORY_EXTENSION` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_MANDATORY_EXTENSION);
```

<!-- api-member-contract id="webSocket.CODE_POLICY_VIOLATION" -->
`webSocket.CODE_POLICY_VIOLATION` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_POLICY_VIOLATION);
```

<!-- api-member-contract id="webSocket.CODE_SERVER_ERROR" -->
`webSocket.CODE_SERVER_ERROR` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_SERVER_ERROR);
```

<!-- api-member-contract id="webSocket.CODE_SERVICE_RESTART" -->
`webSocket.CODE_SERVICE_RESTART` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_SERVICE_RESTART);
```

<!-- api-member-contract id="webSocket.CODE_TLS_HANDSHAKE_FAIL" -->
`webSocket.CODE_TLS_HANDSHAKE_FAIL` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_TLS_HANDSHAKE_FAIL);
```

<!-- api-member-contract id="webSocket.CODE_TRY_AGAIN_LATER" -->
`webSocket.CODE_TRY_AGAIN_LATER` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_TRY_AGAIN_LATER);
```

<!-- api-member-contract id="webSocket.CODE_UNSUPPORTED_PAYLOAD" -->
`webSocket.CODE_UNSUPPORTED_PAYLOAD` · Rhino 2.0 示例：
```js
console.log(WebSocket.CODE_UNSUPPORTED_PAYLOAD);
```

<!-- api-member-contract id="webSocket.EVENT_BYTES" -->
`webSocket.EVENT_BYTES` · Rhino 2.0 示例：
```js
console.log(WebSocket.EVENT_BYTES);
```

<!-- api-member-contract id="webSocket.EVENT_CLOSED" -->
`webSocket.EVENT_CLOSED` · Rhino 2.0 示例：
```js
console.log(WebSocket.EVENT_CLOSED);
```

<!-- api-member-contract id="webSocket.EVENT_CLOSING" -->
`webSocket.EVENT_CLOSING` · Rhino 2.0 示例：
```js
console.log(WebSocket.EVENT_CLOSING);
```

<!-- api-member-contract id="webSocket.EVENT_FAILURE" -->
`webSocket.EVENT_FAILURE` · Rhino 2.0 示例：
```js
console.log(WebSocket.EVENT_FAILURE);
```

<!-- api-member-contract id="webSocket.EVENT_MAX_REBUILDS" -->
`webSocket.EVENT_MAX_REBUILDS` · Rhino 2.0 示例：
```js
console.log(WebSocket.EVENT_MAX_REBUILDS);
```

<!-- api-member-contract id="webSocket.EVENT_MESSAGE" -->
`webSocket.EVENT_MESSAGE` · Rhino 2.0 示例：
```js
console.log(WebSocket.EVENT_MESSAGE);
```

<!-- api-member-contract id="webSocket.EVENT_OPEN" -->
`webSocket.EVENT_OPEN` · Rhino 2.0 示例：
```js
console.log(WebSocket.EVENT_OPEN);
```

<!-- api-member-contract id="webSocket.EVENT_TEXT" -->
`webSocket.EVENT_TEXT` · Rhino 2.0 示例：
```js
console.log(WebSocket.EVENT_TEXT);
```

<!-- api-member-contract id="webSocket.get" -->
`webSocket.get` · Rhino 2.0 示例：
```js
console.log(WebSocket.get);
```

<!-- api-member-contract id="webSocket.instance.addListener" -->
`webSocket.instance.addListener` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.addListener);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.cancel" -->
`webSocket.instance.cancel` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.cancel);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.client" -->
`webSocket.instance.client` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.client);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.close" -->
`webSocket.instance.close` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.close);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.defaultMaxListeners" -->
`webSocket.instance.defaultMaxListeners` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.defaultMaxListeners);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.emit" -->
`webSocket.instance.emit` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.emit);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.emitSticky" -->
`webSocket.instance.emitSticky` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.emitSticky);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.eventNames" -->
`webSocket.instance.eventNames` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.eventNames);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.exitOnClose" -->
`webSocket.instance.exitOnClose` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.exitOnClose);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.getMaxListeners" -->
`webSocket.instance.getMaxListeners` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.getMaxListeners);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.getTimer" -->
`webSocket.instance.getTimer` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.getTimer);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.listenerCount" -->
`webSocket.instance.listenerCount` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.listenerCount);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.listeners" -->
`webSocket.instance.listeners` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.listeners);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.on" -->
`webSocket.instance.on` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.on);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.once" -->
`webSocket.instance.once` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.once);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.prependListener" -->
`webSocket.instance.prependListener` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.prependListener);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.prependOnceListener" -->
`webSocket.instance.prependOnceListener` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.prependOnceListener);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.queueSize" -->
`webSocket.instance.queueSize` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.queueSize);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.rebuild" -->
`webSocket.instance.rebuild` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.rebuild);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.removeAllListeners" -->
`webSocket.instance.removeAllListeners` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.removeAllListeners);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.removeListener" -->
`webSocket.instance.removeListener` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.removeListener);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.request" -->
`webSocket.instance.request` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.request);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.send" -->
`webSocket.instance.send` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.send);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.setMaxListeners" -->
`webSocket.instance.setMaxListeners` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.setMaxListeners);
socket.cancel();
```

<!-- api-member-contract id="webSocket.instance.url" -->
`webSocket.instance.url` · Rhino 2.0 示例：
```js
var socket = new WebSocket('wss://echo.websocket.events');
console.log(socket.url);
socket.cancel();
```
