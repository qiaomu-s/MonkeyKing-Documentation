# 文档更新日志 (Changelog)

## v6.7.0 文档版本说明

<p style="font: bold 0.8em sans-serif; color: #888888">2026/09/11</p>

- `新增` 完成 Monkey King 6.7.0 的公开 API 清单、覆盖映射和兼容数据整理。
- `新增` `util`、`cvt`、`fmt`、`jsox`、`mime`、`zip`、`nanoid`、`pinyin`、`pinyin4j`、`sysprops`、`sqlite`、`mediainfo` 共 12 个 API 页面；Canonical Markdown 目录扩展到 113 页，兼容 JSON 扩展到 125 个文件。
- `优化` 完成全局、模块、自动化、OCR、通知、媒体、网络、系统和工具 API 的行为整理；每个公开符号均包含版本、参数、返回值、异常/权限/线程/生命周期说明和 Rhino 2.0 示例。
- `修复` 统一页面锚点、外部参考链接和兼容标识，清除正文中的未完成占位标记。

## v1.1.8

<p style="font: bold 0.8em sans-serif; color: #888888">2023/12/01</p>

- `新增` [中文转换 (OpenCC)](../api/utilities/opencc.md) 文档
- `新增` [OpenCCConversion](../api/types/opencc-conversion.md) 类型
- `新增` [选择器](../api/automation/ui-selector.md) 章节增加 plus / append 条目
- `新增` [控制台 (Console)](../api/system/console.md) 章节增加 [setTouchable](../api/system/console.md#m-settouchable) 条目
- `新增` [ConsoleBuildOptions](../api/types/console-build-options.md) 章节增加 [touchable](../api/types/console-build-options.md#p-touchable) 条目
- `优化` [光学字符识别 (OCR)](../api/media/ocr.md) 章节增加 Paddle 工作模式使用提示
- `优化` 完善 [Shizuku](../api/system/shizuku.md) 章节
- `优化` 完善 [选择器](../api/automation/ui-selector.md) 章节

## v1.1.7

<p style="font: bold 0.8em sans-serif; color: #888888">2023/10/30</p>

- `新增` [Shizuku](../api/system/shizuku.md) 文档
- `新增` [WebSocket](../api/network/web-socket.md) 文档
- `新增` [条码 (Barcode)](../api/media/barcode.md) 文档
- `新增` [二维码 (QR Code)](../api/media/qr-code.md) 文档
- `优化` 完善 [颜色 (Color)](../api/media/color.md) 章节
- `优化` 完善 [光学字符识别 (OCR)](../api/media/ocr.md) 章节

## v1.1.6

<p style="font: bold 0.8em sans-serif; color: #888888">2023/07/21</p>

- `优化` 完善 [控件节点](../api/automation/ui-object.md) 章节

## v1.1.5

<p style="font: bold 0.8em sans-serif; color: #888888">2023/07/06</p>

- `新增` [密文 (Crypto)](../api/utilities/crypto.md) 文档
- `新增` [CryptoCipherOptions](../api/types/crypto-cipher-options.md) / [CryptoKey](../api/types/crypto-key.md) / [CryptoKeyPair](../api/types/crypto-key-pair.md) 等类型
- `修复` floaty 模块 widht 拼写失误。
- `优化` 完善 [Base64](../api/utilities/base64.md) 章节
- `优化` 完善 [颜色 (Color)](../api/media/color.md) 章节

## v1.1.4

<p style="font: bold 0.8em sans-serif; color: #888888">2023/05/26</p>

- `新增` [console.resetGlobalLogConfig](../api/system/console.md#m-resetgloballogconfig) 文档
- `新增` [web.newWebSocket](../api/network/web.md#m-newwebsocket) 文档
- `优化` 完善 [全能类型 (Omnipotent Types)](../api/types/omni-types.md) 章节
- `优化` 完善 [安卓 API 级别 (Android API Level)](../reference/android/api-level.md) 章节

## v1.1.3

<p style="font: bold 0.8em sans-serif; color: #888888">2023/04/29</p>

- `新增` [颜色类 (Color)](../api/types/color.md) 文档
- `新增` [控制台 (Console)](../api/system/console.md) 文档
- `新增` [标准化 (Standardization)](../api/utilities/s13n.md) 文档
- `新增` [全能类型 (Omnipotent Types)](../api/types/omni-types.md) 文档
- `新增` [NoticeBuilder](../api/types/notice-builder.md) / [NoticeChannelOptions](../api/types/notice-channel-options.md) / [NoticeOptions](../api/types/notice-options.md) 等类型
- `新增` 示例代码区域增加 Copy 按钮以复制代码内容
- `新增` 文档中的图片内容支持点击以全屏方式查看
- `修复` 文档内容中部分图片资源丢失的问题
- `优化` 生成器根据 properties 文件自动获取 Monkey King 版本信息
- `优化` 压缩本地 JavaScript 文件以提升页面加载速度
- `优化` 本地化字体文件避免网络条件不佳时影响页面加载速度
- `优化` 部分表格内容强制禁用自动断行以提升阅读体验
- `优化` 完善 [颜色 (Color)](../api/media/color.md) 章节
- `优化` 完善 [消息通知 (Notice)](../api/system/notice.md) 章节
- `优化` 完善 [光学字符识别 (OCR)](../api/media/ocr.md) 章节

## v1.1.2

<p style="font: bold 0.8em sans-serif; color: #888888">2023/03/21</p>

- `新增` [光学字符识别 (OCR)](../api/media/ocr.md) 文档
- `新增` [消息通知 (Notice)](../api/system/notice.md) 文档
- `新增` [HttpRequestHeaders](../api/types/http-request-headers.md) / [HttpResponseHeaders](../api/types/http-response-headers.md) / [OpenCVRect](../api/types/opencv-rect.md) 等类型
- `新增` [通知渠道](../reference/glossaries/notification-channels.md#notification-channel-通知渠道) / [HTTP 标头](../reference/glossaries/glossary.md#http-标头) / [MIME 类型](../reference/glossaries/glossary.md#mime-类型) / [HTTP 请求方法](../reference/glossaries/http-request-methods.md#http-request-methods-http-请求方法) 等术语
- `新增` [颜色 (Color)](../api/media/color.md) 章节增加 [toColorStateList](../api/media/color.md#m-tocolorstatelist) 及 [setPaintColor](../api/media/color.md#m-setpaintcolor) 条目
- `修复` 文档更新日志条目中的链接无效的问题
- `优化` 完善 [疑难解答 (Q & A)](../guide/troubleshooting.md) 章节

## v1.1.1

<p style="font: bold 0.8em sans-serif; color: #888888">2023/03/02</p>

- `新增` [Base64](../api/utilities/base64.md) 文档
- `新增` [活动 (Activity)](../reference/android/activity.md) 文档
- `新增` [插件 (Plugins)](../api/core/plugins.md) 文档
- `新增` [存储 (Storages)](../api/system/storages.md) 文档
- `新增` [万维网 (Web)](../api/network/web.md) 文档
- `新增` [global.species](../api/core/global.md#m-species) 文档
- `新增` [术语](../reference/glossaries/glossary.md) 章节增加 [阈值](../reference/glossaries/glossary.md#阈值) / [注入](../reference/glossaries/glossary.md#注入) 等条目
- `新增` [数据类型](../api/types/data-types.md) 章节增加 [Storage](../api/types/storage.md) / [ColorDetectionAlgorithm](../api/types/data-types.md#colordetectionalgorithm) / [InjectableWebView](../api/types/injectable-web-view.md) 等类型
- `修复` 示例代码中与美元符号 ($) 相关内容可能出现占位符替换失败的问题
- `优化` 完善 [颜色 (Color)](../api/media/color.md) 章节

## v1.1.0

<p style="font: bold 0.8em sans-serif; color: #888888">2023/01/21</p>

- `新增` [Monkey King 本体应用](../api/core/monkeyking.md) 文档
- `新增` [颜色列表 (Color Table)](../reference/color-table.md) 文档
- `新增` [版本工具类 (Version)](../api/utilities/version.md) 文档
- `新增` [数据类型](../api/types/data-types.md) 章节增加 [RootMode](../api/types/data-types.md#rootmode) / [ColorInt](../api/types/data-types.md#colorint) / [IntRange](../api/types/data-types.md#intrange) 等类型
- `新增` [global.R](../api/core/global.md#p-r) 文档
- `新增` [Numberx.clampTo](../api/utilities/numberx.md#m-clampto) / [Numberx.parseAny](../api/utilities/numberx.md#m-parseany) 文档
- `优化` 完善 [颜色 (Color)](../api/media/color.md) 章节

## v1.0.6

<p style="font: bold 0.8em sans-serif; color: #888888">2022/12/18</p>

- `新增` [版本工具类 (Version)](../api/utilities/version.md) 文档
- `新增` [global.existsAll](../api/core/global.md#m-existsall) / [global.existsOne](../api/core/global.md#m-existsone) 文档

## v1.0.5

<p style="font: bold 0.8em sans-serif; color: #888888">2022/12/16</p>

- `新增` [global.cX](../api/core/global.md#m-cx) / [global.cY](../api/core/global.md#m-cy) 等相关文档

## v1.0.4

<p style="font: bold 0.8em sans-serif; color: #888888">2022/12/04</p>

- `新增` [global.exit(e)](../api/core/global.md#exit-e) 文档
- `新增` [Numberx.check](../api/utilities/numberx.md#m-check) 文档

## v1.0.3

<p style="font: bold 0.8em sans-serif; color: #888888">2022/12/02</p>

- `优化` App 文档去除右上角 Repo 区域防止遮挡文档内容
- `优化` [选择器](../api/automation/ui-selector.md) 章节完善选择器行为相关内容
- `优化` 完善 [UiSelector#paste](../api/automation/ui-selector.md#m-paste) 方法相关内容

## v1.0.2

<p style="font: bold 0.8em sans-serif; color: #888888">2022/12/01</p>

- `新增` 夜间模式主题适配
- `新增` [E4X](../api/utilities/e4x.md) / [术语](../reference/glossaries/glossary.md) / [异常](../reference/runtime/exceptions.md) / [数据类型](../api/types/data-types.md) / [选择器](../api/automation/ui-selector.md) / [控件节点](../api/automation/ui-object.md) / [控件集合](../api/automation/ui-object-collection.md) 等条目
- `修复` 章节标题可能显示不全的问题
- `修复` 代码区域滑动时导致页面滑动的问题
- `修复` App 文档无法跳转到其他章节的问题
- `优化` 重新部署文档结构并统一样式 (暂未全部完成)
- `优化` 完善 [脚本化 Java](../reference/android/scripting-java.md) 章节
- `优化` 支持 Java 等语言的语法高亮 (有限支持)
- `优化` 去除章节标题的锚点标记
- `优化` Web 文档封面适配夜间模式
