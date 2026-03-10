'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { message, Skeleton, Card, Button } from 'antd'
import type { ThemeConfig } from '@/lib/themeLoader'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string | null
  author: string
  publishDate: string | null
  featuredImage: string | null
  viewCount?: number
  category?: {
    id: string
    name: string
    slug: string
  } | null
  tags?: string[]
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  categoryId?: string | null
}

interface CustomDomain {
  id: string
  domain: string
}

interface ArticleLink {
  id: string
  keyword: string
  url: string
}

interface RelatedArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishDate: string | null
}

// 动态加载主题组件映射
const themeArticleDetailComponents: Record<string, any> = {
  default: dynamic(() => import('@/themes/default/ArticleDetailTemplate'), { ssr: true }),
  minimal: dynamic(() => import('@/themes/minimal/ArticleDetailTemplate'), { ssr: true }),
  magazine: dynamic(() => import('@/themes/magazine/ArticleDetailTemplate'), { ssr: true }),
  dark: dynamic(() => import('@/themes/dark/ArticleDetailTemplate'), { ssr: true }),
  card: dynamic(() => import('@/themes/card/ArticleDetailTemplate'), { ssr: true }),
  'bootstrap-blog': dynamic(() => import('@/themes/bootstrap-blog/ArticleDetailTemplate'), { ssr: true }),
  comprehensive: dynamic(() => import('@/themes/comprehensive/ArticleDetailTemplate'), { ssr: true }),
  'magazine-multi': dynamic(() => import('@/themes/magazine-multi/ArticleDetailTemplate'), { ssr: true }),
  'minimal-lifestyle': dynamic(() => import('@/themes/minimal-lifestyle/ArticleDetailTemplate'), { ssr: true }),
  'travel-blog': dynamic(() => import('@/themes/travel-blog/ArticleDetailTemplate'), { ssr: true }),
  'modern-magazine': dynamic(() => import('@/themes/modern-magazine/ArticleDetailTemplate'), { ssr: true }),
  'modern-simple': dynamic(() => import('@/themes/modern-simple/ArticleDetailTemplate'), { ssr: true }),
  'lifestyle-daily': dynamic(() => import('@/themes/lifestyle-daily/ArticleDetailTemplate'), { ssr: true }),
  'zen-blog': dynamic(() => import('@/themes/zen-blog/ArticleDetailTemplate'), { ssr: true }),
}

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [article, setArticle] = useState<Article | null>(null)
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>([])
  const [links, setLinks] = useState<ArticleLink[]>([])
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [themeSlug, setThemeSlug] = useState('default')
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)

  useEffect(() => {
    fetchTheme()
    if (slug) {
      fetchArticle()
    }
  }, [slug])

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/theme/active', { cache: 'no-store' })
      if (res.ok) {
        const activeTheme = await res.json()
        if (activeTheme) {
          console.log('Active theme:', activeTheme.slug, activeTheme.config)
          setThemeSlug(activeTheme.slug)
          setThemeConfig(activeTheme.config || null)
        }
      } else {
        console.error('Failed to fetch theme:', res.status)
      }
    } catch (error) {
      console.error('Error fetching theme:', error)
    }
  }

  // 更新页面元数据
  useEffect(() => {
    if (article) {
      document.title = article.metaTitle || article.title

      // 更新 meta description
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', article.metaDescription || article.excerpt || article.title)

      // 更新 meta keywords
      if (article.metaKeywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]')
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta')
          metaKeywords.setAttribute('name', 'keywords')
          document.head.appendChild(metaKeywords)
        }
        metaKeywords.setAttribute('content', article.metaKeywords)
      }

      // 更新 Open Graph 标签
      const ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) {
        ogTitle.setAttribute('content', article.metaTitle || article.title)
      }

      const ogDescription = document.querySelector('meta[property="og:description"]')
      if (ogDescription) {
        ogDescription.setAttribute('content', article.metaDescription || article.excerpt || article.title)
      }

      if (article.featuredImage) {
        const ogImage = document.querySelector('meta[property="og:image"]')
        if (ogImage) {
          ogImage.setAttribute('content', article.featuredImage)
        }
      }
    }
  }, [article])

  const fetchArticle = async () => {
    if (!slug) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/articles/slug/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setArticle(data)

        // 获取关联数据
        if (data.id) {
          const [domainsRes, linksRes] = await Promise.all([
            fetch(`/api/articles/${data.id}/custom-domains`),
            fetch(`/api/articles/${data.id}/links`),
          ])

          if (domainsRes.ok) {
            const domains = await domainsRes.json()
            setCustomDomains(domains)
          }

          if (linksRes.ok) {
            const linksData = await linksRes.json()
            setLinks(linksData)
          }
        }

        // 获取相关文章（同类别或同标签的文章）
        if (data.id) {
          fetchRelatedArticles(data.id, data.categoryId)
          // 增加阅读量
          incrementViewCount(data.id)
        }
      } else if (res.status === 404) {
        message.error('Article not found')
        setTimeout(() => router.push('/blog'), 2000)
      } else {
        const errorData = await res.json().catch(() => ({}))
        message.error(errorData.error || 'Failed to load article')
        setTimeout(() => router.push('/blog'), 2000)
      }
    } catch (error: any) {
      console.error('Error fetching article:', error)
      message.error('Failed to load article, please try again later')
      setTimeout(() => router.push('/blog'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const incrementViewCount = async (articleId: string) => {
    try {
      await fetch(`/api/articles/${articleId}/views`, {
        method: 'POST',
      })
      // 更新本地状态
      setArticle((prev) => (prev ? { ...prev, viewCount: (prev.viewCount || 0) + 1 } : null))
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  const fetchRelatedArticles = async (articleId: string, categoryId: string | null) => {
    try {
      const params = new URLSearchParams()
      params.append('status', 'published')
      params.append('limit', '10')
      if (categoryId) {
        params.append('categoryId', categoryId)
      }

      const res = await fetch(`/api/articles?${params.toString()}`)
      if (res.ok) {
        const articles: RelatedArticle[] = await res.json()
        // 排除当前文章，取前3篇
        const filtered = articles.filter((a) => a.id !== articleId && a.slug).slice(0, 3)
        setRelatedArticles(filtered)
      }
    } catch (error) {
      console.error('Error fetching related articles:', error)
    }
  }

  // 获取对应的主题组件
  const ArticleDetailTemplate = themeArticleDetailComponents[themeSlug] || themeArticleDetailComponents.default

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: config.colors.background }}>
        <div
          style={{
            background: config.colors.cardBackground,
            borderBottom: `1px solid ${config.colors.border}`,
            padding: '16px 0',
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <Skeleton.Input active size="large" style={{ width: 200 }} />
          </div>
        </div>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
          <Card>
            <Skeleton.Image active style={{ width: '100%', height: 400, marginBottom: 24 }} />
            <Skeleton active paragraph={{ rows: 3 }} />
            <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 24 }} />
          </Card>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <p>Article not found</p>
        <Button onClick={() => router.push('/blog')}>Back to list</Button>
      </div>
    )
  }

  return (
    <ArticleDetailTemplate
      article={article}
      customDomains={customDomains}
      links={links}
      relatedArticles={relatedArticles}
      config={config}
    />
  )
}
