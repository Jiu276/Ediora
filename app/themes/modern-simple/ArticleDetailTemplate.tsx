'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Typography, Button, Tag, Space, Divider, Card, Row, Col } from 'antd'
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

export default function ModernSimpleArticleDetailTemplate({ article, config }: ArticleDetailTemplateProps) {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      <ReadingProgress color={config.colors.primary} />
      
      {/* Header */}
      <header style={{ 
        background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://picsum.photos/seed/iridium-header/1920/300')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 300, letterSpacing: '4px', fontSize: 32 }}>
            IRIDIUM
          </Title>
        </Link>
      </header>

      {/* Article Content */}
      <article style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/blog')}
            style={{ marginBottom: 32, color: config.colors.subtext }}
          >
            Back to Blog
          </Button>

          {article.featuredImage && (
            <div style={{ marginBottom: 40, borderRadius: 8, overflow: 'hidden' }}>
              <LazyImage src={article.featuredImage} alt={article.title} style={{ width: '100%', height: 'auto', maxHeight: 500, objectFit: 'cover' }} />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            {article.category && <Tag color={config.colors.primary} style={{ marginBottom: 16 }}>{article.category.name}</Tag>}
            <Title level={1} style={{ marginBottom: 24, color: config.colors.text, fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 300 }}>
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
