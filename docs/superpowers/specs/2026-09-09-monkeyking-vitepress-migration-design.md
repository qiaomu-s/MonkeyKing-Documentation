# MonkeyKing Documentation VitePress 迁移设计

日期：2026-09-09
状态：已完成（阶段一迁移与阶段二 6.7.0 API 对账均已落地）

> 本文第 1、8、9 节保留了最初设计时的阶段边界，作为历史记录。阶段二的文档仓库工作已于 2026-09-10 按固定源码提交 `bafa2986212d27b6b59f1324f89548b72a810966` 完成；Android 应用侧 WebView 改造仍按原计划另行处理。

## 1. 目标与阶段边界

本阶段把现有 AutoJs6 文档仓库彻底重构为 `MonkeyKing-Documentation`：使用 VitePress 1.6 稳定版取代 Docsify 和旧 HTML 生成器，完成 Monkey King 品牌与已确认技术标识迁移，重组内容目录，保留兼容 JSON 输出，并通过 GitHub Actions 自动发布到 GitHub Pages。

阶段一完成后，站点应可独立开发、构建、搜索、预览和部署，并生成供后续 Android 应用集成使用的离线产物。

以下事项曾在初始设计中延后到阶段二；当前文档仓库状态如下：

- 对照 `/Users/muqiao/Desktop/Github/MonkeyKing` 的 6.7.0 源码，对全部 API 文档做新增、变更、删除项核对：已完成。
- 修改 MonkeyKing Android 应用的 WebView 加载实现和资源复制流程。
- 宣称整套文档内容已经完整覆盖 Monkey King 6.7.0：已完成；覆盖门禁记录在 `api-surface/coverage.json`。

阶段一不保留旧 Docsify URL。原有 `/#/console?id=m-show` 等页面和深链接允许失效，仓库内部链接必须全部迁移到新地址并通过校验。

## 2. 已确认的产品与技术决策

### 项目身份

- 新项目名：`MonkeyKing-Documentation`。
- 目标 GitHub 仓库：`qiaomu-s/MonkeyKing-Documentation`。
- 迁移时保留当前仓库的完整 Git 历史和标签。
- 正式站点域名：`https://docs.monkeyking.com`，托管于 GitHub Pages。
- npm 包名使用 `monkeyking-documentation`，项目主版本从 `2.0.0` 开始。
- 当前未跟踪的根目录 `package-lock.json` 已获准替换为正式 npm 锁文件。

### VitePress 基线

- 使用精确锁定的 VitePress `1.6.4`，不采用 2.0 Alpha。
- 使用 npm、ESM、TypeScript 配置和 Node.js 22 作为 CI 运行时。
- VitePress 内容根目录为 `docs/`，构建产物不提交到 Git。
- `docs/superpowers/**` 只保存设计与实施记录，必须通过 `srcExclude` 排除，不能发布到文档站或本地搜索。
- URL 保留 `.html`，例如 `/api/core/monkeyking.html`。
- `cleanUrls` 保持 `false`，`base` 在网站构建中为 `/`。
- 使用 VitePress 内置本地搜索，不引入 Algolia 或外部搜索服务。
- 内部死链继续作为构建错误处理，不使用 `ignoreDeadLinks` 掩盖问题。

### 视觉与品牌

- 采用已确认的 B 方案：品牌首页 + 标准 VitePress 文档内页。
- 首页使用 VitePress Home Layout，包含 Monkey King 项目说明、开始阅读、API 搜索以及主要内容入口卡片。
- 正文复用默认主题的导航、侧边栏、页内目录、代码块、暗色模式和响应式布局，只做必要的品牌样式扩展。
- 显示名统一为 `Monkey King`；仓库和工程标识使用 `MonkeyKing`。
- JS 全局对象按应用现状使用 `monkeyking`，Android 包名按应用现状使用 `com.qiaomu.monkeyking`。
- 复用 MonkeyKing 应用当前文档 Logo；站点主色复用应用默认主题色 `#00695C`。
- 上游来源、许可证和历史记录可以保留 AutoJs6 名称，但不得把上游品牌继续作为本站当前产品身份。

## 3. 信息架构

现有 Markdown 全部迁入 `docs/`，按领域移动并统一为 kebab-case。正文在阶段一不拆分，只进行路径、名称、品牌和兼容性修复。

```text
docs/
├── index.md                    # 品牌首页
├── guide/                      # 入门与使用
│   ├── overview.md
│   ├── manual.md
│   └── troubleshooting.md
├── api/
│   ├── core/                   # global、monkeyking、app、模块系统
│   ├── automation/             # automator、UI、选择器、控件自动化
│   ├── system/                 # 设备、文件、引擎、任务、线程、Shell 等
│   ├── media/                  # 颜色、图像、OCR、条码、Canvas 等
│   ├── network/                # Web、HTTP、WebSocket
│   ├── utilities/              # Crypto、OpenCC、i18n、标准化与对象扩展
│   └── types/                  # 数据类型、选项、结果和平台类型
├── reference/
│   ├── android/                # Activity、Context、API Level、脚本化 Java
│   ├── runtime/                # Runtime、Intent、异常及相关背景知识
│   ├── glossaries/             # HTTP、MIME、通知渠道等术语
│   └── color-table.md
└── project/
    ├── about.md
    ├── progress.md
    └── changelog.md
```

顶部导航固定为：首页、使用指南、API、参考资料、更新日志。侧边栏由一个类型化内容目录统一生成，内容目录同时作为路径迁移、导航生成和 JSON 输出映射的唯一来源。

以下旧辅助页面不再作为普通文档发布：

- `all.md`：删除 HTML 全集页面，由分类索引和本地搜索替代；兼容 JSON 仍生成 `json/all.json`。
- `sidebar.md`、`toc.md`：转化为 VitePress 内容目录配置后删除。
- `coverpage.md`：由新的 `index.md` 品牌首页替代。
- `404.md`：由 VitePress 主题的 404 页面替代。
- `util.md`：这是遗留的 Node.js 文档内容，不属于 Monkey King，直接删除。

## 4. 构建与数据流

### 网站构建

```text
docs/**/*.md
  → VitePress 1.6.4
  → dist/web/
  → GitHub Pages artifact
  → https://docs.monkeyking.com
```

网站构建产物使用 `base: /`，保留 `.html` 页面名。`docs/public/CNAME`、Logo 和公共资源随构建复制到 `dist/web/`。

### Android 离线产物契约

阶段一只生成并验证离线包，不修改 MonkeyKing 应用：

```text
npm run build:android
  → VitePress base: /assets/docs/
  → dist/android/
  → 稳定入口 dist/android/index.html
```

未来应用侧将把该目录复制到 `app/src/main/assets/docs/`，并使用 `WebViewAssetLoader` 从 HTTPS 虚拟域加载，而不是继续使用 `file:///android_asset/docs/`。应用侧修改单独设计和实施。

### 兼容 JSON

根目录 `json/` 继续提交到 Git，并在网站构建后复制到 `dist/web/json/`，因此 JSON 同时具备仓库文件和公开 URL 两种访问方式。

新 JSON 生成器只保留旧生成器的 JSON 职责：

- 保持现有顶层字段、章节层级、参数、返回值和描述 HTML 的数据语义。
- 使用 JSON Schema 与黄金样本验证兼容性，不要求因品牌和路径变化而保持字节完全相同。
- 保留聚合文件 `json/all.json`，即使不再提供 `all.html`。
- 删除 Python 编排器、旧 HTML 模板和旧 HTML 生成逻辑。
- 为保证旧描述 HTML 和 token 行为稳定，将旧版 `marked` 以明确命名的开发依赖别名隔离在 JSON 兼容层，不让它参与 VitePress 渲染。

## 5. 内容迁移规则

迁移以当前 Markdown 为正文基线，以 `/Users/muqiao/Desktop/Github/MonkeyKing` 中已完成的品牌和技术重命名为事实来源。

需要完成的确定性转换包括：

- `AutoJs6` → `Monkey King`、`AutoJs6-Documentation` → `MonkeyKing-Documentation`。
- `autojs` 本体对象与页面 → `monkeyking`，并同步真实代码示例和交叉引用。
- `org.autojs.autojs6` 等旧应用包名 → `com.qiaomu.monkeyking` 对应名称。
- 文档、项目、下载和仓库 URL 改为 MonkeyKing 对应地址；正式文档域名为 `docs.monkeyking.com`。
- 通知截图等资源文件采用应用仓库已经使用的 `monkeyking-*` 命名。
- 旧 camelCase/Type 文件名映射为分类目录下的 kebab-case 页面名。

不得使用不区分上下文的全局字符串替换。历史归属、第三方项目名称、旧版本说明和兼容命名空间只有在 MonkeyKing 应用仓库已有对应变更时才迁移。

### Markdown/Vue 兼容修复

只读审计确认现有 107 个 Markdown 不能原样通过 VitePress 构建。迁移必须处理：

- 38 个 Vue 双花括号插值块，使用 HTML 实体保留字面显示。
- 5 个会被 Vue 当作组件标签的类型写法，改为代码或转义文本。
- 5 行真实反引号错误。
- 13 个页面级死链。
- 223 个指向不存在标题锚点的内部链接。
- 所有因目录移动和 kebab-case 重命名而变化的内部链接。
- 图片统一迁入 `docs/public/images/`，Markdown 和原始 HTML 资源引用统一为 `/images/...`，由 VitePress 根据构建 `base` 处理。
- 不再维护 Docsify 插件、主题、搜索、复制代码、图片缩放和 Prism 静态文件。

迁移后不得依赖旧 Docsify slug。所有内部 fragment 必须按 VitePress 实际生成的标题 ID 更新，并由独立锚点检查器验证目标元素存在。

## 6. 仓库与开发体验

根目录提供统一 npm 命令：

- `npm run docs:dev`：本地开发服务器。
- `npm run build:web`：生成网站和公开 JSON 产物。
- `npm run build:android`：生成未来应用内置文档包。
- `npm run json:build`：更新根目录兼容 JSON。
- `npm run check:links`：校验页面路径和 fragment。
- `npm test`：执行单元测试与结构验证。
- `npm run test:e2e`：执行浏览器关键路径测试。

仓库说明改为 MonkeyKing-Documentation，记录 VitePress 开发、构建、Pages 发布、JSON 更新和 Android 产物生成方式。旧 `project.json`、旧 `generator/`、Docsify 入口与已提交的旧 HTML 产物全部移除。

## 7. 发布设计

GitHub Actions 在 `master` 变更后执行：

1. 使用 Node.js 22 和 `npm ci` 安装锁定依赖。
2. 执行单元测试、品牌残留检查、JSON 兼容检查和内部链接/锚点检查。
3. 构建 `dist/web/`。
4. 使用 GitHub Pages 官方 artifact 工作流发布。
5. 使用 concurrency 防止旧提交覆盖新部署。

GitHub Pages 的自定义域设置保持 `docs.monkeyking.com`，DNS 与仓库 Pages 设置作为一次性发布操作记录在迁移说明中。`docs/public/CNAME` 保留在构建产物中。

迁移到 `qiaomu-s/MonkeyKing-Documentation` 时保留完整历史，并把本地 `origin` 切换到新仓库；原远端作为 `upstream` 保留，便于追踪来源。

## 8. 验收标准

阶段一只有同时满足以下条件才算完成：

- `npm ci`、`npm test`、`npm run build:web`、`npm run build:android` 全部成功。
- 所有迁移后的内部页面链接与 fragment 均存在，不允许忽略死链。
- 首页、分类导航、本地搜索、暗色模式、移动端导航和 404 页面可用。
- Playwright 覆盖桌面和移动视口下的首页、API 页面、搜索、导航和主题切换。
- 网站构建中不存在 Docsify、旧 Node HTML 生成器和 Python 生成器运行时依赖。
- 根目录 JSON 通过 Schema 与黄金样本验证，并被复制到网站 `/json/`。
- `dist/android/index.html`、页面、搜索和静态资源在 `/assets/docs/` 基路径下加载成功。
- 除明确允许的历史归属外，用户可见页面不再把 AutoJs6 作为当前产品身份。
- GitHub Actions 成功将站点发布到 `docs.monkeyking.com`。
- README 记录固定源码、API 全量对账结果和本地验证命令；Android 应用侧改造仍不属于本仓库范围。

## 9. 原阶段二入口条件与结果

阶段二输入固定为：

- 已迁移并通过链接验证的分类化 Markdown。
- MonkeyKing 应用仓库 6.7.0 源码及 `version.properties`。
- 当前应用内 6.6.4 文档作为差异参考，而不是 Markdown 权威来源。
- 阶段一生成的内容目录、JSON Schema 和测试工具。

阶段二的最终目标“应用公开 API → 文档页面/章节”的可审计映射已完成；当前 manifest 包含 4,499 个公开符号，coverage 映射为 4,499/4,499，缺口为 0。应用侧 WebView 改造不在本仓库的交付范围内。
