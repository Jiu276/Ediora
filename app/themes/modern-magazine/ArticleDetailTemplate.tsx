'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Typography, Button, Tag, Space, Divider, Card } from 'antd'
import { ArrowLeftOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons'
import ReadingProgress from '@/components/ReadingProgress'
import BackToTop from '@/components/BackToTop'
import ShareButtons from '@/components/ShareButtons'
import LazyImage from '@/components/LazyImage'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph } = Typography

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
}

interface ArticleDetailTemplateProps {
  article: Article
  customDomains: any[]
  links: any[]
  relatedArticles: any[]
  config: ThemeConfig
}

export default function ModernMagazineArticleDetailTemplate({ article, config }: ArticleDetailTemplateProps) {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      <ReadingProgress color={config.colors.primary} />
      
      <header style={{ background: '#1a1a1a', padding: '16px 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#000', color: '#fff', padding: '12px 24px', fontWeight: 700, fontSize: 24, letterSpacing: '2px', display: 'inline-block' }}>
              MAGZ
            </div>
          </Link>
        </div>
      </header>

      <article style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.push('/blog')} style={{ marginBottom: 32 }}>
            Back to News
          </Button>

          {article.featuredImage && (
            <div style={{ marginBottom: 40, borderRadius: 8, overflow: 'hidden' }}>
              <LazyImage src={article.featuredImage} alt={article.title} style={{ width: '100%', height: 'auto', maxHeight: 500, objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            {article.category && <Tag color={config.colors.primary} style={{ marginBottom: 16 }}>{article.category.name}</Tag>}
            <Title level={1} style={{ marginBottom: 24, color: config.colors.text, fontSize: 'clamp(28px, 5vw, 42px)' }}>
              {article.title}
            </Title>
          </div>

          <div style={{ marginBottom: 32, color: config.colors.subtext, fontSize: 14 }}>
            <Space size="middle" split={<span>·</span>}>
              <span>By {article.author}</span>
              {article.publishDate && (
                <span>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {new Date(article.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {article.viewCount !== undefined && (
                <span>
                  <EyeOutlined style={{ marginRight: 4 }} />
                  {article.viewCount} views
                </span>
              )}
            </Space>
          </div>

          {article.excerpt && (
            <Paragraph style={{ fontSize: '18px', color: config.colors.subtext, marginBottom: 40, fontStyle: 'italic', borderLeft: `4px solid ${config.colors.primary}`, paddingLeft: 20 }}>
              {article.excerpt}
            </Paragraph>
          )}

          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{ lineHeight: 1.9, fontSize: 'clamp(16px, 4vw, 18px)', color: config.colors.text }}
            className="article-content"
          />

          {article.tags && article.tags.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <Space wrap>
                {article.tags.map((tag, index) => (
                  <Tag key={index} style={{ fontSize: 14, padding: '4px 12px' }}>#{tag}</Tag>
                ))}
              </Space>
            </div>
          )}

          <Divider style={{ margin: '40px 0' }} />

          <div style={{ marginTop: 24 }}>
            <Typography.Text strong style={{ color: config.colors.text, marginRight: 16, fontSize: 14 }}>Share:</Typography.Text>
            <ShareButtons title={article.title} url={`/blog/${article.id}`} description={article.excerpt || undefined} image={article.featuredImage || undefined} />
          </div>
        </div>
      </article>

      <BackToTop color={config.colors.primary} />
    </div>
  )
}

