# HttpRequestBuilderOptions

---

<p style="font: italic 1em sans-serif; color: #78909C">此章节待补充或完善...</p>
<p style="font: italic 1em sans-serif; color: #78909C">Marked by SuperMonster003 on Mar 21, 2023.</p>

---

HttpRequestBuilderOptions 是一个构建 HTTP 请求时用于传递构建选项的接口.<br>
这些选项将影响 HTTP 请求的构建.

常见相关方法或属性:

- [http.buildRequest](../network/http.md#m-buildrequest)(url, **options**)
- [http.request](../network/http.md#m-request)(url, **options**, callback)
- [http.get](../network/http.md#m-get)(url, **options**, callback)
- [http.post](../network/http.md#m-post)(url, data, **options**, callback)
- [http.postJson](../network/http.md#m-postjson)(url, data, **options**, callback)
- [http.postMultipart](../network/http.md#m-postmultipart)(url, files, **options**, callback)

---

<p style="font: bold 2em sans-serif; color: #FF7043">HttpRequestBuilderOptions</p>

---

## [p?] timeout

- [ `30000` ] { [number](data-types.md#number) } - 超时时间, 单位为秒
