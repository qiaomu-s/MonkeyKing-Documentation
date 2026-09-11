# Monkey King 文档

Monkey King 6.7.0 的中文使用指南、API 参考与兼容数据说明。文档站点使用 VitePress 构建，
适合在浏览器中阅读，也可作为应用内离线帮助页发布。

> 文档版本：**6.7.0** · 内容更新时间：**2026-09-11**

站点入口：<https://docs.monkeyking.com>

## 本地开发

仓库使用 Node.js 22.23.2（见 `.nvmrc`）和 `npm@11.17.0`；`package.json`
声明支持 `>=22.9 <23`。切换到正确的 Node.js 版本并确认 npm 版本后，使用锁文件安装依赖：

```bash
nvm use
npm --version
npm ci
```

常用命令：

| 命令 | 用途 |
| --- | --- |
| `npm run docs:dev` | 启动 VitePress 本地开发服务器 |
| `npm run docs:preview` | 预览已生成的 `dist/web/` 网站产物 |
| `npx tsc --noEmit` | 检查 TypeScript 类型 |
| `npm run api:extract -- --source <source> --ref <ref> --check` | 校验公开 API manifest |
| `npm run api:mime -- --source <source> --ref <ref> --check` | 校验 MIME 常量附录 |
| `npm run api:coverage -- --check` | 校验每个公开符号唯一映射到有效文档锚点 |
| `npm run api:check` | 校验 manifest、coverage、页面与锚点契约 |
| `npm run examples:check` | 校验 Rhino 2.0 JavaScript 示例和占位代码 |
| `npm run check:content` | 校验内容目录、路径和迁移约束 |
| `npm run json:build` | 重新生成根目录兼容 JSON |
| `git diff --exit-code -- json` | 确认 JSON 生成结果已提交且没有漂移 |
| `npm test` | 运行 Vitest 单元测试和结构契约测试 |
| `npm run build:web` | 构建网站产物到 `dist/web/` |
| `npm run check:links` | 校验构建后的页面、锚点和资源链接 |
| `npm run build:android` | 构建 Android 离线产物到 `dist/android/` |
| `npm run test:e2e` | 构建并预览网站后运行 Playwright 浏览器测试 |
| `npm run api:smoke -- --serial emulator-5554` | 在已安装 Monkey King 6.7.0 的设备上执行 API smoke 脚本 |

提交前至少应运行与改动相关的检查。完整验证顺序与 CI 一致：

```bash
npm ci
npx tsc --noEmit
npm run api:extract -- --source /path/to/MonkeyKing --ref bafa2986212d27b6b59f1324f89548b72a810966 --check
npm run api:mime -- --source /path/to/MonkeyKing --ref bafa2986212d27b6b59f1324f89548b72a810966 --check
npm run api:coverage -- --check
npm run api:check
npm run examples:check
npm run check:content
npm run json:build
git diff --exit-code -- api-surface json
npm test
npm run build:web
npm run check:links
npm run build:android
npx playwright install --with-deps chromium
npm run test:e2e
npm run api:smoke -- --serial emulator-5554
```

## 兼容 JSON

根目录 `json/` 是对既有消费者承诺的兼容接口，必须提交到 Git。修改文档或内容目录后运行
`npm run json:build`，并通过 `git diff --exit-code -- json` 验证生成结果已经纳入提交。
网站构建还会把这些文件逐字节复制到 `dist/web/json/`，供公开 URL 使用。

兼容规则如下：

- `monkeyking.json` 是当前产品入口；`autojs.json` 是必须保留的历史兼容别名，两者内容字节一致。
- 生成器只更新活动页面和聚合输出，不得手工修改生成文件来绕过 Schema、清单或黄金样本检查。
- 以下 10 个冻结 JSON 文件受 SHA-256 清单保护，构建时保持原始字节，不重写、不重命名：
  `accessibilityActionsType.json`、`coordinates-based-automation.json`、
  `coordinatesBasedAutomation.json`、`errors.json`、`globals.json`、
  `imageWrapper.json`、`intent.json`、`intrinsicTypes.json`、
  `widgets-based-automation.json`、`widgetsBasedAutomation.json`。

## 构建产物

### Web

`npm run build:web` 生成 `dist/web/`，包含页面、静态资源和兼容 JSON。构建产物不提交到版本库。

### Android

`npm run build:android` 生成 `dist/android/`，稳定入口为 `dist/android/index.html`，内部页面与
资源使用 `/assets/docs/` 基路径。该目录供后续 Monkey King Android 工程复制到
`app/src/main/assets/docs/`。

Android 集成属于独立工作：应用应使用 `WebViewAssetLoader` 通过 HTTPS 虚拟域加载离线站点，
而不是继续使用 `file:///android_asset/docs/`。本仓库只生成并验证离线产物，不修改应用代码。

## 内容质量

提交内容前建议运行 `npm run check:content`、`npm run examples:check`、`npm run public:scan`
和 `npm test`。`public:scan` 会检查 README、文档、兼容 JSON、API 清单与构建产物中的公开文案，
避免把内部路径、版本提交标识或维护流程带到用户界面。
