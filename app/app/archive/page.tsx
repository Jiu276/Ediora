'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { ThemeConfig } from '@/lib/themeLoader'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publishDate: string | null
  category?: {
    id: string
    name: string
  } | null
}

interface ArchiveGroup {
  year: number
  month: number
  articles: Article[]
}

// 动态加载主题组件映射
const themeArchiveComponents: Record<string, any> = {
  default: dynamic(() => import('@/themes/default/ArchiveTemplate'), { ssr: true }),
  minimal: dynamic(() => import('@/themes/minimal/ArchiveTemplate'), { ssr: true }),
  magazine: dynamic(() => import('@/themes/magazine/ArchiveTemplate'), { ssr: true }),
  dark: dynamic(() => import('@/themes/dark/ArchiveTemplate'), { ssr: true }),
  card: dynamic(() => import('@/themes/card/ArchiveTemplate'), { ssr: true }),
  'bootstrap-blog': dynamic(() => import('@/themes/bootstrap-blog/ArchiveTemplate'), { ssr: true }),
  comprehensive: dynamic(() => import('@/themes/comprehensive/ArchiveTemplate'), { ssr: true }),
  'magazine-multi': dynamic(() => import('@/themes/magazine-multi/ArchiveTemplate'), { ssr: true }),
  'minimal-lifestyle': dynamic(() => import('@/themes/minimal-lifestyle/ArchiveTemplate'), { ssr: true }),
  'travel-blog': dynamic(() => import('@/themes/travel-blog/ArchiveTemplate'), { ssr: true }),
  'modern-magazine': dynamic(() => import('@/themes/modern-magazine/ArchiveTemplate'), { ssr: true }),
  'modern-simple': dynamic(() => import('@/themes/modern-simple/ArchiveTemplate'), { ssr: true }),
  'lifestyle-daily': dynamic(() => import('@/themes/lifestyle-daily/ArchiveTemplate'), { ssr: true }),
  'zen-blog': dynamic(() => import('@/themes/zen-blog/ArchiveTemplate'), { ssr: true }),
}

export default function ArchivePage() {
  const [loading, setLoading] = useState(true)
  const [archiveGroups, setArchiveGroups] = useState<ArchiveGroup[]>([])
  const [yearStats, setYearStats] = useState<Map<number, number>>(new Map())
  const [themeSlug, setThemeSlug] = useState('default')
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)

  useEffect(() => {
    fetchTheme()
    fetchArticles()
  }, [])

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/theme/active', { cache: 'no-store' })
      if (res.ok) {
        const activeTheme = await res.json()
        if (activeTheme) {
          setThemeSlug(activeTheme.slug)
          setThemeConfig(activeTheme.config || null)
        }
      }
    } catch (error) {
      console.error('Error fetching theme:', error)
    }
  }

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/articles?status=published')
      const articles: Article[] = await res.json()

      // 按年月分组
      const groups = new Map<string, Article[]>()
      const yearCounts = new Map<number, number>()

      articles.forEach((article) => {
        if (article.publishDate) {
          const date = new Date(article.publishDate)
          const year = date.getFullYear()
          const month = date.getMonth() + 1
          const key = `${year}-${month}`

          if (!groups.has(key)) {
            groups.set(key, [])
          }
          groups.get(key)!.push(article)

          // 统计每年的文章数
          yearCounts.set(year, (yearCounts.get(year) || 0) + 1)
        }
      })

      // 转换为数组并排序
      const archiveArray: ArchiveGroup[] = Array.from(groups.entries())
        .map(([key, articles]) => {
          const [year, month] = key.split('-').map(Number)
          return {
            year,
            month,
            articles: articles.sort(
              (a, b) => new Date(b.publishDate!).getTime() - new Date(a.publishDate!).getTime()
            ),
          }
        })
        .sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year
          return b.month - a.month
        })

      setArchiveGroups(archiveArray)
      setYearStats(yearCounts)
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取对应的主题组件
  const ArchiveTemplate = themeArchiveComponents[themeSlug] || themeArchiveComponents.default

  // 如果没有主题配置，使用默认配置
  const config: ThemeConfig = themeConfig || {
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

  return (
    <ArchiveTemplate
      loading={loading}
      archiveGroups={archiveGroups}
      yearStats={yearStats}
      config={config}
    />
  )
}
