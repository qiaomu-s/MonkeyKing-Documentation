# MonkeyKing-Documentation

Monkey King 的官方文档仓库。站点使用 VitePress 构建，源码仓库为
[`qiaomu-s/MonkeyKing-Documentation`](https://github.com/qiaomu-s/MonkeyKing-Documentation)，
正式站点为 [`https://docs.monkeyking.com`](https://docs.monkeyking.com)。

> [!IMPORTANT]
> 当前阶段只完成文档平台、内容迁移和兼容产物基线，尚未完成 Monkey King 6.7.0
> 公开 API 的全量对账。阶段二将以 Monkey King 6.7.0 源码为准完成 API 全量对账；在此之前，
> 不应宣称本站已经完整覆盖该版本。

## 本地开发

仓库要求 Node.js 22（见 `.nvmrc`）和 `npm@11.17.0`。切换到正确的 Node.js
版本并确认 npm 版本后，使用锁文件安装依赖：

```bash
nvm use
npm --version
npm ci
```

常用命令：

| 命令 | 用途 |
| --- | --- |
| `npm run docs:dev` | 启动 VitePress 本地开发服务器 |
| `npx tsc --noEmit` | 检查 TypeScript 类型 |
| `npm run check:content` | 校验内容目录、路径和迁移约束 |
| `npm run json:build` | 重新生成根目录兼容 JSON |
| `git diff --exit-code -- json` | 确认 JSON 生成结果已提交且没有漂移 |
| `npm test` | 运行 Vitest 单元测试和结构契约测试 |
| `npm run build:web` | 构建网站产物到 `dist/web/` |
| `npm run check:links` | 校验构建后的页面、锚点和资源链接 |
| `npm run build:android` | 构建 Android 离线产物到 `dist/android/` |
| `npm run test:e2e` | 构建并预览网站后运行 Playwright 浏览器测试 |

提交前至少应运行与改动相关的检查。完整验证顺序与 CI 一致：

```bash
npm ci
npx tsc --noEmit
npm run check:content
npm run json:build
git diff --exit-code -- json
npm test
npm run build:web
npm run check:links
npm run build:android
npx playwright install --with-deps chromium
npm run test:e2e
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

`npm run build:web` 生成 `dist/web/`。该目录使用站点根路径 `/`，包含 VitePress 页面、
静态资源、`CNAME` 和公开兼容 JSON，是 GitHub Pages 唯一上传的目录。构建产物不提交到 Git。

### Android

`npm run build:android` 生成 `dist/android/`，稳定入口为 `dist/android/index.html`，内部页面与
资源使用 `/assets/docs/` 基路径。该目录供后续 Monkey King Android 工程复制到
`app/src/main/assets/docs/`。

Android 集成属于独立工作：应用应使用 `WebViewAssetLoader` 通过 HTTPS 虚拟域加载离线站点，
而不是继续使用 `file:///android_asset/docs/`。本仓库只生成并验证离线产物，不修改应用代码。

## GitHub Pages 发布

`.github/workflows/pages.yml` 在面向 `master` 的拉取请求和 `master` push 上运行相同的质量门禁。
只有 `master` push 全部通过后，工作流才会上传精确的 `dist/web/` Pages artifact，并部署到
`github-pages` 环境。并发运行按 Git ref 分组；同一 ref 的旧运行会被取消。

首次发布前，仓库管理员需要完成一次 GitHub 与 DNS 配置：

1. 在仓库 **Settings → Pages → Build and deployment** 中把 Source 设为 **GitHub Actions**。
2. 在 Pages 的 Custom domain 中填写 `docs.monkeyking.com`。仓库中的
   `docs/public/CNAME` 会随网站构建进入发布产物，请勿删除。
3. 在 DNS 服务商创建 `CNAME` 记录：主机记录 `docs`，目标 `qiaomu-s.github.io`。记录值不要带
   `https://`、仓库路径或结尾斜杠，并等待 DNS 生效。
4. 建议在 GitHub 账户中验证自定义域。GitHub 签发证书且域名检查成功后，在 Pages 设置中启用
   **Enforce HTTPS**。

工作流不会创建仓库、修改远端、配置 DNS 或替管理员启用 Pages；这些操作需要由仓库所有者完成。

## 上游来源与许可证

MonkeyKing-Documentation 保留了历史文档的来源说明和 Git 历史。部分内容源自
[`SuperMonster003/AutoJs6-Documentation`](https://github.com/SuperMonster003/AutoJs6-Documentation)，
其上游又源自 [`hyb1996/AutoJs-Docs`](https://github.com/hyb1996/AutoJs-Docs)。旧生成器曾参考
Node.js 文档工具链；这些名称仅用于历史归属，不代表本站当前品牌。

版权、授权条件和需保留的声明以仓库中的 [`LICENSE`](./LICENSE) 及各文件现有声明为准。迁移或引用
上游内容时必须继续保留相应署名与许可证要求。
