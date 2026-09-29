# 公开 API 清单

`api-surface/` 保存公开 API 目录和文档覆盖关系。
这些文件是产品文档的一部分，字段只描述运行时可用的模块、符号、签名和
文档锚点，不包含内部审计信息。

## 文件

- `manifest.json`：公开模块与符号清单，schema v3。
- `coverage.json`：每个公开符号对应的文档页面与锚点，schema v3。
- `gaps.json`：尚未建立文档映射的公开符号；发布版本应为空数组。
别名使用 `canonicalId` 指向同一公开
入口，别名本身不重复占用文档锚点。

## 本地校验

```bash
npm run api:check
npm run check:content
npm run public:scan
```

`api:check` 会验证清单和覆盖文件的 schema、符号唯一性、别名解析、页面存在性
以及锚点有效性。`public:scan` 会检查发布目录中是否混入内部审计字段或其他不应
面向用户展示的内容。

## 页面映射约定

每条非别名规则都使用 `docs/...md#anchor` 形式的目标；别名规则通过
`canonicalId` 解析到对应的主入口。一个非别名符号只能占用一个目标，缺失目标时
应先补充 API 页面，再重新生成覆盖清单。
