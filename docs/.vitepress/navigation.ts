import type { DefaultTheme } from 'vitepress'
import {
  contentEntriesBySection,
  contentSectionOrder,
} from '../../scripts/content/catalog'
import type { ContentSectionId } from '../../scripts/content/catalog'

export const sidebarSectionLabels = Object.freeze({
  guide: '使用指南',
  project: '项目文档',
  'api/core': '核心 API',
  'api/automation': '自动化 API',
  'api/system': '系统 API',
  'api/media': '媒体 API',
  'api/network': '网络 API',
  'api/utilities': '工具 API',
  'api/types': 'API 类型',
  'reference/android': 'Android 参考',
  'reference/runtime': '运行时参考',
  'reference/glossaries': '术语表',
  reference: '其他参考',
} satisfies Record<ContentSectionId, string>)

function createSidebarGroup(
  sectionId: ContentSectionId,
): DefaultTheme.SidebarItem {
  return {
    text: sidebarSectionLabels[sectionId],
    collapsed: sectionId.startsWith('api/') || sectionId.startsWith('reference/'),
    items: contentEntriesBySection[sectionId].map(({ route, title }) => ({
      text: title,
      link: route,
    })),
  }
}

const sidebarGroups = Object.freeze(
  Object.fromEntries(
    contentSectionOrder.map((sectionId) => [
      sectionId,
      createSidebarGroup(sectionId),
    ]),
  ),
) as Readonly<Record<ContentSectionId, DefaultTheme.SidebarItem>>

export const topNav: DefaultTheme.NavItem[] = [
  { text: '首页', link: '/' },
  { text: '使用指南', link: '/guide/overview.html', activeMatch: '^/guide/' },
  { text: 'API', link: '/api/core/monkeyking.html', activeMatch: '^/api/' },
  {
    text: '参考资料',
    link: '/reference/android/activity.html',
    activeMatch: '^/reference/',
  },
  {
    text: '更新日志',
    link: '/project/changelog.html',
    activeMatch: '^/project/changelog(?:\\.html)?$',
  },
]

export const sidebar: DefaultTheme.SidebarMulti = {
  '/guide/': [sidebarGroups.guide],
  '/project/': [sidebarGroups.project],
  '/api/': contentSectionOrder
    .filter((sectionId) => sectionId.startsWith('api/'))
    .map((sectionId) => sidebarGroups[sectionId]),
  '/reference/': contentSectionOrder
    .filter(
      (sectionId) =>
        sectionId === 'reference' || sectionId.startsWith('reference/'),
    )
    .map((sectionId) => sidebarGroups[sectionId]),
}
