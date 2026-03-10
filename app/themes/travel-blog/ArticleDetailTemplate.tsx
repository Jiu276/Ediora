'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Typography, Button, Tag, Space, Divider, Card, Row, Col } from 'antd'
import { ArrowLeftOutlined, CalendarOutlined, EyeOutlined, EnvironmentOutlined } from '@ant-design/icons'
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
  publishDate: string | null
  featuredImage: string | null
}

interface ArticleDetailTemplateProps {
  article: Article
  customDomains: CustomDomain[]
  links: ArticleLink[]
  relatedArticles: RelatedArticle[]
  config: ThemeConfig
}

export default function TravelBlogArticleDetailTemplate({
  article,
  customDomains,
  links,
  relatedArticles,
  config,
}: ArticleDetailTemplateProps) {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      <ReadingProgress color={config.colors.primary} />
      
      {/* Header */}
      <header style={{ background: config.colors.cardBackground, padding: '20px 0', borderBottom: `1px solid ${config.colors.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-block', 
              border: '2px solid #3498db', 
              padding: '10px 30px',
              marginBottom: 8
            }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Title level={3} style={{ margin: 0, color: config.colors.text, fontWeight: 300, letterSpacing: '4px' }}>
                  travel
                </Title>
              </Link>
            </div>
          </div>
        </div>
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
              <LazyImage
                src={article.featuredImage}
                alt={article.title}
                style={{ width: '100%', height: 'auto', maxHeight: 500, objectFit: 'cover' }}
              />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            {article.category && (
              <Tag color={config.colors.primary} style={{ marginBottom: 16 }}>
                {article.category.name}
              </Tag>
            )}
            <Title
              level={1}
              style={{
                marginBottom: 24,
                color: config.colors.text,
                fontWeight: 400,
                fontSize: 'clamp(28px, 5vw, 42px)',
                lineHeight: 1.3,
              }}
            >
              {article.title}
            </Title>
          </div>

          <div style={{ marginBottom: 32, color: config.colors.subtext, fontSize: 14 }}>
            <Space size="middle" split={<span>·</span>}>
              <span>By {article.author}</span>
              {article.publishDate && (
                <span>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {new Date(article.publishDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
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
            <Paragraph
              style={{
                fontSize: '18px',
                color: config.colors.subtext,
                marginBottom: 40,
                fontStyle: 'italic',
                borderLeft: `4px solid ${config.colors.primary}`,
                paddingLeft: 20,
              }}
            >
              {article.excerpt}
            </Paragraph>
          )}

          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{
              lineHeight: 1.9,
              fontSize: 'clamp(16px, 4vw, 18px)',
              color: config.colors.text,
            }}
            className="article-content"
          />

          {article.tags && article.tags.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <Space wrap>
                {article.tags.map((tag, index) => (
                  <Tag key={index} style={{ fontSize: 14, padding: '4px 12px' }}>
                    #{tag}
                  </Tag>
                ))}
              </Space>
            </div>
          )}

          <Divider style={{ margin: '40px 0' }} />

          <div style={{ marginTop: 24 }}>
            <Typography.Text strong style={{ color: config.colors.text, marginRight: 16, fontSize: 14 }}>
              Share this article:
            </Typography.Text>
            <ShareButtons
              title={article.title}
              url={`/blog/${article.id}`}
              description={article.excerpt || undefined}
              image={article.featuredImage || undefined}
            />
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section style={{ padding: '60px 24px', background: config.colors.cardBackground }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{ color: config.colors.text, marginBottom: 40 }}>
              Related Travel Guides
            </Title>
            <Row gutter={[24, 24]}>
              {relatedArticles.map((related) => (
                <Col xs={24} sm={12} md={8} key={related.id}>
                  <Card
                    hoverable
                    style={{ borderRadius: 8, border: `1px solid ${config.colors.border}` }}
                    cover={
                      related.featuredImage ? (
                        <LazyImage
                          src={related.featuredImage}
                          alt={related.title}
                          style={{ width: '100%', height: 200, objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ height: 200, background: config.colors.cardAltBackground }} />
                      )
                    }
                    onClick={() => window.location.href = `/blog/${related.id}`}
                  >
                    <Card.Meta
                      title={
                        <Link href={`/blog/${related.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Title level={4} style={{ margin: 0, color: config.colors.text }}>
                            {related.title}
                          </Title>
                        </Link>
                      }
                      description={
                        related.excerpt && (
                          <Paragraph 
                            ellipsis={{ rows: 2 }} 
                            style={{ color: config.colors.subtext, marginTop: 8 }}
                          >
                            {related.excerpt.replace(/<[^>]*>/g, '')}
                          </Paragraph>
                        )
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ background: '#2c3e50', color: '#fff', padding: '40px 24px', marginTop: 60 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <Paragraph style={{ color: '#95a5a6', margin: 0 }}>
            © COPYRIGHT {new Date().getFullYear()} ALL RIGHTS RESERVED
          </Paragraph>
        </div>
      </footer>

      <BackToTop color={config.colors.primary} />
    </div>
  )
}

