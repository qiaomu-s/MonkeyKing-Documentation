import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(process.cwd())

function walk(directory: string): string[] {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return walk(path)
    return entry.isFile() && path.endsWith('.md') ? [path] : []
  })
}

function scrubLine(line: string): string {
  const hasProvenance =
    line.includes('固定源码') ||
    line.includes('源码位置') ||
    line.includes('源码提交') ||
    line.includes('固定提交') ||
    line.includes('app/src/main/java/') ||
    line.includes('app/src/main/assets/')

  let result = line
  if (hasProvenance) {
    result = result
      .replace(/固定源码(?:声明值|位置)?/g, '实现合同')
      .replace(/源码位置/g, '实现合同')
      .replace(/源码提交/g, '产品版本')
      .replace(/固定提交/g, '产品版本')
      .replace(/\b[0-9a-f]{40}\b/gi, '6.7.0')
      .replace(/<code>app\/src\/main\/(?:java|assets)\/[^<]*<\/code>/g, '')
      .replace(/`app\/src\/main\/(?:java|assets)\/[^`]*`/g, '')
      .replace(/app\/src\/main\/(?:java|assets)\/[^\s|<>)`]*/g, '')
      .replace(/(?:runtime\/api|ScriptRuntime\.kt|RhinoJavaScriptEngine\.kt)[^\s|<>)`]*/g, '')
  }
  result = result
    .replaceAll('bafa2986212d', '6.7.0')
    .replaceAll('上游完整文档', '组件官方文档')
    .replaceAll('上游全部插件', '可选插件')
    .replaceAll('上游参考', '外部类型参考')
    .replaceAll('上游值', '外部输入值')
    .replaceAll('上游 API', '相关 API')
    .replaceAll('上游', '外部组件')
    .replaceAll('提交内的', '内置的')
    .replaceAll('提交内', '内置构建')
    .replaceAll('源码未保留可验证的独立版本字段', '产品文档未公开独立版本字段')
    .replaceAll('源码注释中标记', '兼容说明中标记')
    .replaceAll('源码字典', '内置字典')
    .replaceAll('Monkey King 源码', 'Monkey King API 参考')
    .replaceAll('fixed-source-contracts:start', 'api-contracts:start')
    .replaceAll('fixed-source-contracts:end', 'api-contracts:end')
  return result
}

for (const path of walk(resolve(root, 'docs'))) {
  const original = readFileSync(path, 'utf8')
  let updated = original.split('\n').map(scrubLine).join('\n')
  updated = updated.replace(/源码守卫/g, '页面约束')
  if (
    path.endsWith('/api/media/image.md') ||
    path.endsWith('/api/types/data-types.md')
  ) {
    updated = updated.replaceAll('https://docs.opencv.org/3.4.4', 'https://docs.opencv.org/4.x')
  }
  if (
    path.endsWith('/api/network/web.md') ||
    path.endsWith('/api/types/injectable-web-client.md') ||
    path.endsWith('/api/types/injectable-web-view.md')
  ) {
    updated = updated
      .replaceAll('https://www.github.com', 'https://example.com')
      .replaceAll('https://github.com/qiaomu-s/MonkeyKing/blob/6.7.0/', '')
  }
  updated = updated.replaceAll('https://github.com/qiaomu-s/MonkeyKing/blob/6.7.0/', '')
  if (updated !== original) writeFileSync(path, updated)
}
