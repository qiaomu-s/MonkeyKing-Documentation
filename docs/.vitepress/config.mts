import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vitepress'
import type { DefaultTheme, UserConfig } from 'vitepress'
import { sidebar, topNav } from './navigation'

export type DocsBuildTarget = 'web' | 'android'

const repositoryRoot = fileURLToPath(new URL('../..', import.meta.url))
const repositoryUrl =
  'https://github.com/qiaomu-s/MonkeyKing-Documentation'

export function resolveBuildTarget(value?: string): DocsBuildTarget {
  if (value === undefined || value === '' || value === 'web') return 'web'
  if (value === 'android') return 'android'
  throw new Error(`Unsupported DOCS_BUILD_TARGET: ${value}`)
}

export function createSiteConfig(
  targetValue?: string,
): UserConfig<DefaultTheme.Config> {
  const target = resolveBuildTarget(targetValue)
  const base = target === 'android' ? '/assets/docs/' : '/'

  return {
    lang: 'zh-CN',
    title: 'Monkey King',
    titleTemplate: ':title | Monkey King',
    description: 'Monkey King 自动化脚本平台的使用指南、API 与参考文档。',
    base,
    outDir: resolve(repositoryRoot, 'dist', target),
    srcExclude: ['superpowers/**'],
    cleanUrls: false,
    ignoreDeadLinks: false,
    appearance: true,
    lastUpdated: true,
    head: [
      [
        'link',
        {
          rel: 'icon',
          href: `${base}logo.png`,
          type: 'image/png',
        },
      ],
      ['meta', { name: 'theme-color', content: '#00695C' }],
    ],
    themeConfig: {
      logo: { src: '/logo.png', alt: 'Monkey King 标志' },
      siteTitle: 'Monkey King',
      nav: topNav,
      sidebar,
      outline: { level: [2, 3], label: '本页目录' },
      search: {
        provider: 'local',
        options: {
          translations: {
            button: {
              buttonText: '搜索文档',
              buttonAriaLabel: '搜索 Monkey King 文档',
            },
            modal: {
              displayDetails: '显示详情',
              resetButtonTitle: '清除搜索条件',
              backButtonTitle: '关闭搜索',
              noResultsText: '没有找到相关结果',
              footer: {
                selectText: '选择',
                selectKeyAriaLabel: '回车键',
                navigateText: '切换',
                navigateUpKeyAriaLabel: '向上箭头',
                navigateDownKeyAriaLabel: '向下箭头',
                closeText: '关闭',
                closeKeyAriaLabel: 'Escape 键',
              },
            },
          },
        },
      },
      editLink: {
        pattern: `${repositoryUrl}/edit/master/docs/:path`,
        text: '在 GitHub 上编辑此页',
      },
      socialLinks: [
        {
          icon: 'github',
          link: repositoryUrl,
          ariaLabel: 'MonkeyKing-Documentation GitHub 仓库',
        },
      ],
      lastUpdated: {
        text: '最后更新',
        formatOptions: {
          dateStyle: 'medium',
          timeStyle: 'short',
          forceLocale: true,
        },
      },
      docFooter: {
        prev: '上一页',
        next: '下一页',
      },
      darkModeSwitchLabel: '外观',
      lightModeSwitchTitle: '切换到浅色模式',
      darkModeSwitchTitle: '切换到深色模式',
      sidebarMenuLabel: '文档目录',
      returnToTopLabel: '返回顶部',
      skipToContentLabel: '跳到正文',
      externalLinkIcon: true,
      notFound: {
        code: '404',
        title: '没有找到这页 Monkey King 文档',
        quote: '页面可能已经移动，试试搜索文档或返回 Monkey King 首页。',
        linkText: '返回文档首页',
        linkLabel: '返回 Monkey King 文档首页',
      },
      footer: {
        message: 'Monkey King 文档',
        copyright: '基于 Apache-2.0 许可证发布',
      },
    },
  }
}

export default defineConfig(createSiteConfig(process.env.DOCS_BUILD_TARGET))
