import { prisma } from './prisma'
import { getThemeConfig } from './themeConfig'

export interface ThemeConfig {
  layout: 'full-width' | 'boxed' | 'sidebar-left' | 'sidebar-right'
  colors: {
    primary: string
    accent: string
    background: string
    cardBackground: string
    text: string
    subtext: string
    border: string
  }
  fonts: {
    heading: string
    body: string
  }
  features: {
    showSidebar: boolean
    showCategories: boolean
    showTags: boolean
    showAuthor: boolean
    showDate: boolean
    showExcerpt: boolean
  }
}

export interface Theme {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  config?: ThemeConfig | null
}

/**
 * 获取当前激活的主题
 */
export async function getActiveTheme(): Promise<Theme | null> {
  try {
    const theme = await prisma.theme.findFirst({
      where: {
        deletedAt: null,
        isActive: true,
      },
    })

    if (!theme) {
      return null
    }

    // 获取主题的视觉配置
    const visualConfig = getThemeConfig(theme.slug)

    // 构建主题配置（可以从数据库的 config JSON 字段读取，或使用默认配置）
    const themeConfig: ThemeConfig = {
      layout: getDefaultLayout(theme.slug),
      colors: {
        primary: visualConfig.primary,
        accent: visualConfig.accent,
        background: visualConfig.pageBackground,
        cardBackground: visualConfig.cardBackground,
        text: visualConfig.text,
        subtext: visualConfig.subtext,
        border: visualConfig.borderColor,
      },
      fonts: {
        heading: 'inherit',
        body: 'inherit',
      },
      features: {
        showSidebar: getDefaultFeatures(theme.slug).showSidebar,
        showCategories: true,
        showTags: true,
        showAuthor: true,
        showDate: true,
        showExcerpt: true,
      },
    }

    return {
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      description: theme.description,
      isActive: theme.isActive,
      config: themeConfig,
    }
  } catch (error) {
    console.error('Error fetching active theme:', error)
    return null
  }
}

/**
 * 根据主题 slug 获取默认布局
 */
function getDefaultLayout(slug: string): ThemeConfig['layout'] {
  const layoutMap: Record<string, ThemeConfig['layout']> = {
    default: 'boxed',
    minimal: 'full-width',
    magazine: 'sidebar-right',
    dark: 'boxed',
    card: 'full-width',
    'bootstrap-blog': 'boxed',
    comprehensive: 'boxed',
    'magazine-multi': 'boxed',
    'minimal-lifestyle': 'boxed',
    'travel-blog': 'full-width',
    'modern-magazine': 'sidebar-right',
    'modern-simple': 'full-width',
    'lifestyle-daily': 'full-width',
    'zen-blog': 'full-width',
  }
  return layoutMap[slug] || 'boxed'
}

/**
 * 根据主题 slug 获取默认功能配置
 */
function getDefaultFeatures(slug: string) {
  const featuresMap: Record<string, Partial<ThemeConfig['features']>> = {
    default: { showSidebar: false },
    minimal: { showSidebar: false },
    magazine: { showSidebar: true },
    dark: { showSidebar: false },
    card: { showSidebar: false },
    'bootstrap-blog': { showSidebar: false },
    comprehensive: { showSidebar: false },
    'magazine-multi': { showSidebar: true },
    'minimal-lifestyle': { showSidebar: false },
    'travel-blog': { showSidebar: false },
    'modern-magazine': { showSidebar: true },
    'modern-simple': { showSidebar: false },
    'lifestyle-daily': { showSidebar: false },
    'zen-blog': { showSidebar: false },
  }
  return { showSidebar: false, ...featuresMap[slug] }
}

/**
 * 获取主题组件路径
 */
export function getThemeComponentPath(themeSlug: string, componentName: string): string {
  return `@/themes/${themeSlug}/${componentName}`
}

