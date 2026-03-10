'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Typography, Button, Tag, Space, Divider } from 'antd'
import { ArrowLeftOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons'
import ReadingProgress from '@/components/ReadingProgress'
import BackToTop from '@/components/BackToTop'
import ShareButtons from '@/components/ShareButtons'
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

export default function ZenBlogArticleDetailTemplate({ article, config }: ArticleDetailTemplateProps) {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background, padding: 'clamp(30px, 8vw, 60px) clamp(16px, 4vw, 20px)' }}>
      <ReadingProgress color={config.colors.primary} />
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 60, borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
          <Link href="/blog" style={{ textDecoration: 'none' }}>
            <Title level={1} style={{ marginBottom: 16, color: config.colors.text, fontWeight: 300, letterSpacing: '6px', fontSize: 42, fontFamily: 'serif' }}>
              ZenBlog
            </Title>
          </Link>
          <div style={{ marginTop: 20 }}>
            <Link href="/blog" style={{ marginRight: 24, color: config.colors.subtext, textDecoration: 'none', fontSize: 14 }}>Articles</Link>
            <Link href="/archive" style={{ marginRight: 24, color: config.colors.subtext, textDecoration: 'none', fontSize: 14 }}>Archive</Link>
            <Link href="/admin" style={{ color: config.colors.subtext, textDecoration: 'none', fontSize: 14 }}>Admin</Link>
          </div>
        </header>

        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.push('/blog')} style={{ marginBottom: 40, color: config.colors.subtext }}>
          Back to list
        </Button>

        <article style={{ borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40, marginBottom: 40 }}>
          <Title level={1} style={{ marginBottom: 24, color: config.colors.text, fontWeight: 300, fontSize: 'clamp(28px, 6vw, 40px)', lineHeight: 1.3, letterSpacing: '0.5px', fontFamily: 'serif' }}>
            {article.title}
          </Title>

          <div style={{ marginBottom: 32, color: config.colors.subtext, fontSize: 14 }}>
            <Space size="middle" split={<span>·</span>}>
              <span>✍️ {article.author}</span>
              {article.publishDate && (
                <span>📅 {new Date(article.publishDate).toLocaleString('en-US')}</span>
              )}
              {article.viewCount !== undefined && (
                <span>
                  <EyeOutlined style={{ marginRight: 4 }} />
                  {article.viewCount} views
                </span>
              )}
              {article.category && (
                <Tag style={{ border: `1px solid ${config.colors.border}`, background: 'transparent', color: config.colors.subtext, borderRadius: 0 }}>
                  {article.category.name}
                </Tag>
              )}
            </Space>
            {article.tags && article.tags.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {article.tags.map((tag, index) => (
                  <Tag key={index} style={{ marginRight: 8, marginBottom: 4, border: 'none', background: 'transparent', color: config.colors.subtext }}>
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>

          {article.excerpt && (
            <Paragraph style={{ fontSize: '18px', color: config.colors.subtext, marginBottom: 40, fontStyle: 'italic', borderLeft: `3px solid ${config.colors.primary}`, paddingLeft: 16, fontWeight: 300 }}>
              {article.excerpt}
            </Paragraph>
          )}

          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{ lineHeight: 1.9, fontSize: 'clamp(15px, 4vw, 17px)', color: config.colors.text, fontWeight: 300 }}
            className="article-content"
          />

          <Divider style={{ margin: '32px 0' }} />

          <div style={{ marginTop: 24 }}>
            <Typography.Text strong style={{ color: config.colors.text, marginRight: 16, fontSize: 14 }}>Share:</Typography.Text>
            <ShareButtons title={article.title} url={`/blog/${article.id}`} description={article.excerpt || undefined} image={article.featuredImage || undefined} />
          </div>
        </article>

        <footer style={{ marginTop: 80, textAlign: 'center', paddingTop: 40, borderTop: `1px solid ${config.colors.border}` }}>
          <Paragraph style={{ color: config.colors.subtext, fontSize: 12, margin: 0, fontWeight: 300 }}>
            © {new Date().getFullYear()} ZenBlog
          </Paragraph>
        </footer>
      </div>

      <BackToTop color={config.colors.primary} />
    </div>
  )
}
