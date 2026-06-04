import { getActiveTheme } from '@/lib/themeLoader'
import { prisma } from '@/lib/prisma'
// 不能与 export const dynamic 同名，故用 nextDynamic 作为 next/dynamic 的导入名
import nextDynamic from 'next/dynamic'

// 主题来自数据库，必须每次请求重新取，否则切换主题后首页仍显示构建时缓存的默认主题
export const dynamic = 'force-dynamic'

// 动态加载主题组件映射
const themeComponents: Record<string, any> = {
  default: nextDynamic(() => import('@/themes/default/HomeTemplate'), { ssr: true }),
  minimal: nextDynamic(() => import('@/themes/minimal/HomeTemplate'), { ssr: true }),
  magazine: nextDynamic(() => import('@/themes/magazine/HomeTemplate'), { ssr: true }),
  dark: nextDynamic(() => import('@/themes/dark/HomeTemplate'), { ssr: true }),
  card: nextDynamic(() => import('@/themes/card/HomeTemplate'), { ssr: true }),
  'bootstrap-blog': nextDynamic(() => import('@/themes/bootstrap-blog/HomeTemplate'), { ssr: true }),
  comprehensive: nextDynamic(() => import('@/themes/comprehensive/HomeTemplate'), { ssr: true }),
  'magazine-multi': nextDynamic(() => import('@/themes/magazine-multi/HomeTemplate'), { ssr: true }),
  'minimal-lifestyle': nextDynamic(() => import('@/themes/minimal-lifestyle/HomeTemplate'), { ssr: true }),
  'travel-blog': nextDynamic(() => import('@/themes/travel-blog/HomeTemplate'), { ssr: true }),
  'modern-magazine': nextDynamic(() => import('@/themes/modern-magazine/HomeTemplate'), { ssr: true }),
  'modern-simple': nextDynamic(() => import('@/themes/modern-simple/HomeTemplate'), { ssr: true }),
  'lifestyle-daily': nextDynamic(() => import('@/themes/lifestyle-daily/HomeTemplate'), { ssr: true }),
  'zen-blog': nextDynamic(() => import('@/themes/zen-blog/HomeTemplate'), { ssr: true }),
}

interface Article {
  id: string
  title: string
  excerpt: string | null
  slug: string
  featuredImage: string | null
  publishDate: string | null
  category?: {
    name: string
  } | null
  author: string
}

export default async function Home() {
  // 获取激活的主题
  const activeTheme = await getActiveTheme()
  const themeSlug = activeTheme?.slug || 'default'
  
  // 直接从数据库获取文章数据（服务端）
  let articles: Article[] = []
  try {
    const publishedArticles = await prisma.article.findMany({
      where: {
        status: 'published',
        deletedAt: null,
      },
      orderBy: {
        publishDate: 'desc',
      },
      take: 12,
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        featuredImage: true,
        publishDate: true,
        categoryId: true,
        author: true,
      },
    })

    // 获取类别信息
    const categoryIds = publishedArticles
      .map(a => a.categoryId)
      .filter((id): id is string => id !== null)
    
    const categories = categoryIds.length > 0
      ? await prisma.category.findMany({
          where: { id: { in: categoryIds }, deletedAt: null },
          select: { id: true, name: true },
        })
      : []

    const categoryMap = new Map(categories.map(c => [c.id, c]))

    articles = publishedArticles.map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      featuredImage: article.featuredImage,
      publishDate: article.publishDate?.toISOString() || null,
      category: article.categoryId ? categoryMap.get(article.categoryId) || null : null,
      author: article.author,
    }))
      } catch (error) {
    console.error('Error fetching articles:', error)
  }

  // 获取对应的主题组件
  const HomeTemplate = themeComponents[themeSlug] || themeComponents.default

  // 如果没有主题配置，使用默认配置
  const themeConfig = activeTheme?.config || {
    layout: 'boxed' as const,
    colors: {
      primary: '#1890ff',
      accent: '#722ed1',
      background: '#f5f5f5',
      cardBackground: '#ffffff',
      text: '#0f172a',
      subtext: '#475569',
      border: '#e5e7eb',
    },
    fonts: {
      heading: 'inherit',
      body: 'inherit',
    },
    features: {
      showSidebar: false,
      showCategories: true,
      showTags: true,
      showAuthor: true,
      showDate: true,
      showExcerpt: true,
    },
  }

  return <HomeTemplate articles={articles} config={themeConfig} />
}
