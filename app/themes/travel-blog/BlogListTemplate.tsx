'use client'

import { Typography, Empty, Skeleton, Pagination, Tag, Space, Card, Row, Col } from 'antd'
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons'
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
  author: string
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

export default function TravelBlogListTemplate({
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
      <header style={{ background: config.colors.cardBackground, padding: '40px 0', borderBottom: `1px solid ${config.colors.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block', 
            border: '2px solid #3498db', 
            padding: '20px 40px',
            marginBottom: 16
          }}>
            <Title level={1} style={{ margin: 0, color: config.colors.text, fontWeight: 300, letterSpacing: '4px' }}>
              travel
            </Title>
          </div>
          <Paragraph style={{ color: config.colors.subtext, fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            YOUR NEXT POCKET TRAVEL GUIDE
          </Paragraph>
          <nav style={{ marginTop: 24 }}>
            <Space size="large">
              <Link href="/" style={{ color: config.colors.text, textDecoration: 'none' }}>Home</Link>
              <Link href="/blog" style={{ color: config.colors.primary, textDecoration: 'none', fontWeight: 500 }}>Blog</Link>
              <Link href="/archive" style={{ color: config.colors.text, textDecoration: 'none' }}>Archive</Link>
            </Space>
          </nav>
        </div>
      </header>

      {/* Content */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={2} style={{ color: config.colors.text, marginBottom: 40 }}>
            All Travel Guides
          </Title>

          {loading ? (
            <Row gutter={[24, 24]}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Col xs={24} sm={12} md={8} key={i}>
                  <Card>
                    <Skeleton active />
                  </Card>
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
                      style={{ borderRadius: 8, height: '100%', border: `1px solid ${config.colors.border}` }}
                      cover={
                        article.featuredImage ? (
                          <LazyImage
                            src={article.featuredImage}
                            alt={article.title}
                            style={{ width: '100%', height: 200, objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ height: 200, background: config.colors.cardAltBackground }} />
                        )
                      }
                      onClick={() => window.location.href = `/blog/${article.id}`}
                    >
                      <Card.Meta
                        title={
                          <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Title level={4} style={{ margin: 0, color: config.colors.text }}>
                              {article.title}
                            </Title>
                          </Link>
                        }
                        description={
                          <div>
                            {article.excerpt && (
                              <Paragraph 
                                ellipsis={{ rows: 2 }} 
                                style={{ color: config.colors.subtext, marginTop: 8, marginBottom: 12 }}
                              >
                                {article.excerpt.replace(/<[^>]*>/g, '')}
                              </Paragraph>
                            )}
                            <Space>
                              {article.category && (
                                <Tag color={config.colors.primary}>{article.category.name}</Tag>
                              )}
                              {article.publishDate && (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  <CalendarOutlined style={{ marginRight: 4 }} />
                                  {new Date(article.publishDate).toLocaleDateString('en-US')}
                                </Text>
                              )}
                            </Space>
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
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#2c3e50', color: '#fff', padding: '40px 24px', marginTop: 60 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <Paragraph style={{ color: '#95a5a6', margin: 0 }}>
            © COPYRIGHT {new Date().getFullYear()} ALL RIGHTS RESERVED
          </Paragraph>
        </div>
      </footer>
    </div>
  )
}

