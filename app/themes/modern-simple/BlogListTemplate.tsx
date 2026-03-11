'use client'

import { Typography, Empty, Skeleton, Pagination, Tag, Space, Row, Col, Card, Button } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph, Text } = Typography

interface Article {
  id: string
  title: string
  excerpt: string | null
  publishDate: string | null
  slug: string
  featuredImage: string | null
  category?: {
    id: string
    name: string
    slug: string
  } | null
}

interface BlogListTemplateProps {
  articles: Article[]
  loading: boolean
  currentPage: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  config: ThemeConfig
}

export default function ModernSimpleBlogListTemplate({
  articles,
  loading,
  currentPage,
  total,
  pageSize,
  onPageChange,
  config,
}: BlogListTemplateProps) {
  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      {/* Header */}
      <header style={{ 
        background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://picsum.photos/seed/iridium-header/1920/400')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <Title level={1} style={{ 
          marginBottom: 8, 
          color: '#fff',
          fontWeight: 300,
          fontSize: 42,
          letterSpacing: '4px'
        }}>
          IRIDIUM
        </Title>
        <Paragraph style={{ color: '#fff', fontSize: 14, margin: 0, letterSpacing: '2px' }}>
          DESIGN BY TEMPLATED
        </Paragraph>
        <nav style={{ marginTop: 24 }}>
          <Space size="large">
            <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>HOMEPAGE</Link>
            <Link href="/blog" style={{ color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px' }}>BLOG</Link>
            <Link href="/archive" style={{ color: '#fff', textDecoration: 'none' }}>ARCHIVE</Link>
          </Space>
        </nav>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px', background: config.colors.cardBackground }}>
        <Title level={2} style={{ color: config.colors.text, marginBottom: 40, fontSize: 28 }}>
          ALL ARTICLES
        </Title>

        {loading ? (
          <Row gutter={[24, 24]}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Col xs={24} sm={12} md={8} key={i}>
                <Card><Skeleton active /></Card>
              </Col>
            ))}
          </Row>
        ) : articles.length === 0 ? (
          <Empty description="No articles found" />
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {articles.map((article) => (
                <Col xs={24} sm={12} md={8} key={article.id}>
                  <Card
                    hoverable
                    style={{ borderRadius: 8, border: `1px solid ${config.colors.border}`, height: '100%' }}
                    cover={
                      article.featuredImage ? (
                        <LazyImage src={article.featuredImage} alt={article.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: 200, background: config.colors.cardBackground }} />
                      )
                    }
                    onClick={() => window.location.href = `/blog/${article.id}`}
                  >
                    <Card.Meta
                      title={
                        <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Title level={4} style={{ margin: 0, color: config.colors.text, fontSize: 18 }}>
                            {article.title}
                          </Title>
                        </Link>
                      }
                      description={
                        <div>
                          {article.excerpt && (
                            <Paragraph ellipsis={{ rows: 2 }} style={{ color: config.colors.subtext, marginTop: 8, marginBottom: 12 }}>
                              {article.excerpt.replace(/<[^>]*>/g, '')}
                            </Paragraph>
                          )}
                          <Space>
                            {article.category && <Tag color={config.colors.primary}>{article.category.name}</Tag>}
                            {article.publishDate && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {new Date(article.publishDate).toLocaleDateString('en-US')}
                              </Text>
                            )}
                          </Space>
                          <div style={{ marginTop: 16 }}>
                            <Button 
                              type="primary" 
                              size="small"
                              style={{ background: config.colors.primary, borderColor: config.colors.primary, borderRadius: 20 }}
                              href={`/blog/${article.id}`}
                            >
                              MORE DETAILS
                            </Button>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {total > pageSize && (
              <div style={{ marginTop: 40, textAlign: 'center' }}>
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={(page) => {
                    onPageChange(page)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  showSizeChanger={false}
                  showTotal={(total) => `Total ${total} articles`}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
