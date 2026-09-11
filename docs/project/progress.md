# 文档进度 (Progress)

截至 **2026-09-10**，文档仓库已按 Monkey King 6.7.0 固定源码提交
`bafa2986212d27b6b59f1324f89548b72a810966` 完成全量 API 对账。

## 总体状态

| 指标 | 当前值 | 验证方式 |
| --- | ---: | --- |
| Canonical Markdown 页面 | 113 | `npm run check:content` |
| 兼容 JSON 文件 | 125 | `npm run json:build` 与 JSON 契约测试 |
| 固定源码公开符号 | 4,499 | `npm run api:extract` |
| 已映射公开符号 | 4,499 / 4,499 | `npm run api:check` |
| 未映射符号 | 0 | `api-surface/gaps.json` |
| JavaScript 示例 | 2,180 | `npm run examples:check` |
| 构建页面 | 115 HTML | `npm run build:web` 与链接检查 |

“完成”表示页面已存在、正文包含版本信息和 Rhino 2.0 示例，并且每个固定源码公开符号都映射到唯一有效页面锚点。Android、Java、OkHttp、OpenCV 和 MediaInfo 等外部类型只在本仓库说明 Monkey King 的入口与差异，完整 API 以其官方资料为准。

## 分领域页面

| 领域 | 页面数 | 状态 | 入口 |
| --- | ---: | :---: | --- |
| 使用指南与项目说明 | 6 | √ | [综述](../guide/overview.md)、[使用手册](../guide/manual.md)、[疑难解答](../guide/troubleshooting.md) |
| 核心 API | 5 | √ | [全局对象](../api/core/global.md)、[模块](../api/core/modules.md)、[Monkey King](../api/core/monkeyking.md) |
| 自动化 API | 9 | √ | [自动化](../api/automation/automator.md)、[选择器](../api/automation/ui-selector.md)、[控件](../api/automation/ui-object.md) |
| 系统 API | 17 | √ | [设备](../api/system/device.md)、[SQLite](../api/system/sqlite.md)、[线程](../api/system/threads.md) |
| 媒体 API | 9 | √ | [图像](../api/media/image.md)、[OCR](../api/media/ocr.md)、[MediaInfo](../api/media/mediainfo.md) |
| 网络 API | 3 | √ | [Web](../api/network/web.md)、[HTTP](../api/network/http.md)、[WebSocket](../api/network/web-socket.md) |
| 工具 API | 20 | √ | [Util](../api/utilities/util.md)、[数据转换](../api/utilities/converter.md)、[MIME](../api/utilities/mime.md)、[Zip](../api/utilities/zip.md) |
| 类型参考 | 31 | √ | [数据类型](../api/types/data-types.md)、[图像包装类](../api/types/image-wrapper.md)、[通知类型](../api/types/notice-builder.md) |
| Android / 运行时参考 | 7 | √ | [Activity](../reference/android/activity.md)、[Context](../reference/android/context.md)、[Runtime](../reference/runtime/runtime.md) |
| 术语与颜色表 | 6 | √ | [术语](../reference/glossaries/glossary.md)、[颜色表](../reference/color-table.md) |

## 新增的 6.7.0 页面

- 工具：[`util`](../api/utilities/util.md)、[`cvt`](../api/utilities/converter.md)、[`fmt`](../api/utilities/formatter.md)、[`jsox`](../api/utilities/jsox.md)、[`mime`](../api/utilities/mime.md)、[`zip`](../api/utilities/zip.md)、[`nanoid`](../api/utilities/nanoid.md)、[`pinyin`](../api/utilities/pinyin.md)、[`pinyin4j`](../api/utilities/pinyin4j.md)。
- 系统：[`sysprops`](../api/system/sysprops.md)、[`sqlite`](../api/system/sqlite.md)。
- 媒体：[`mediainfo`](../api/media/mediainfo.md)。

## 本地验收

修改正文、目录或 API 清单后，至少运行以下命令：

```bash
npx tsc --noEmit
npm run api:coverage -- --check
npm run api:check
npm run examples:check
npm run check:content
npm run json:build
npm test
npm run build:web
npm run check:links
```

完整 CI 顺序、固定源码 checkout 和 Android / 模拟器 smoke 验证见 [仓库 README](https://github.com/qiaomu-s/MonkeyKing-Documentation#本地开发)。
