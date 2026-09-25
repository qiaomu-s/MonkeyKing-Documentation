# Monkey King 文档

Monkey King 官方产品文档。站点使用 VitePress 构建，面向授权用户提供使用指南、API 参考、兼容性说明和版本记录。

文档版本：**6.7.0** · 内容更新时间：**2026-09-25**

当前站点包含 121 个页面和 133 个兼容 JSON 文件。其中 4,499 个公开 API 符号属于 Monkey King 6.7.0 已审计基线；`dm` 页面为预览参考，不计入该基线。

站点入口：<https://docs.monkeyking.com>

## 本地预览

项目使用 Node.js 22.23.2（见 `.nvmrc`）和 `npm@11.17.0`：

```bash
nvm use
npm ci
npm run docs:dev
```

常用命令：

| 命令 | 用途 |
| --- | --- |
| `npm run docs:dev` | 启动本地文档开发服务器 |
| `npm run docs:preview` | 预览已生成的网站产物 |
| `npx tsc --noEmit` | 检查 TypeScript 类型 |
| `npm run api:check` | 检查公开 API 清单与页面锚点 |
| `npm run public:scan` | 检查发布内容是否包含内部实现信息 |
| `npm run examples:check` | 检查 Rhino 2.0 示例 |
| `npm run check:content` | 检查页面目录和内容契约 |
| `npm run json:build` | 重新生成兼容 JSON |
| `npm test` | 运行结构与契约测试 |
| `npm run build:web` | 构建 Web 文档 |
| `npm run check:links` | 检查页面、锚点和资源链接 |
| `npm run build:android` | 构建 Android 离线文档 |
| `npm run test:e2e` | 运行浏览器验收测试 |

公开文档只发布面向使用者的 API 清单和兼容数据；内部校验不会改变文档使用方式。

## 兼容 JSON

根目录 `json/` 是既有脚本消费者使用的兼容接口。修改 Markdown 后运行 `npm run json:build`，并确认工作区中的生成文件没有漂移。

- `monkeyking.json` 是当前产品入口；`autojs.json` 是保留的历史兼容别名，两者内容保持一致。
- 兼容 JSON 保留既有文件名、字段结构和 `all.json` 的历史页面顺序。
- 生成文件由目录清单和 schema 校验，不应手工绕过生成器修改。

## 构建产物

`npm run build:web` 生成 `dist/web/`，包含站点页面、静态资源、`CNAME` 和公开兼容 JSON。

`npm run build:android` 生成 `dist/android/`，供 Monkey King Android 工程通过 `WebViewAssetLoader` 加载离线文档。

## 反馈

如需报告文档或 API 问题，请通过应用内反馈入口或授权支持渠道提交 Monkey King 版本、Android API 级别、设备信息、最小复现脚本和完整日志。
