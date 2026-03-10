'use client'

import { Typography, Empty, Skeleton, Pagination, Tag, Space, Card, Row, Col } from 'antd'
import { CalendarOutlined, HeartOutlined } from '@ant-design/icons'
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

export default function ModernMagazineBlogListTemplate({
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
      <header style={{ background: '#1a1a1a', padding: '16px 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#000', color: '#fff', padding: '12px 24px', fontWeight: 700, fontSize: 24, letterSpacing: '2px', display: 'inline-block' }}>
              MAGZ
            </div>
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
        <Title level={2} style={{ color: config.colors.text, marginBottom: 40 }}>LATEST NEWS</Title>

        {loading ? (
          <Row gutter={[24, 24]}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Col xs={24} sm={12} key={i}>
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
                <Col xs={24} sm={12} key={article.id}>
                  <Card
                    hoverable
                    style={{ borderRadius: 0, border: `1px solid ${config.colors.border}` }}
                    cover={
                      article.featuredImage ? (
                        <LazyImage src={article.featuredImage} alt={article.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: 180, background: config.colors.cardAltBackground }} />
                      )
                    }
                    onClick={() => window.location.href = `/blog/${article.id}`}
                  >
                    <Space style={{ marginBottom: 12 }}>
                      {article.publishDate && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(article.publishDate).toLocaleDateString('en-US')}
                        </Text>
                      )}
                      {article.category && <Tag color={config.colors.primary} style={{ fontSize: 11 }}>{article.category.name}</Tag>}
                    </Space>
                    <Title level={4} style={{ marginBottom: 8, color: config.colors.text, fontSize: 18 }}>{article.title}</Title>
                    {article.excerpt && (
                      <Paragraph ellipsis={{ rows: 2 }} style={{ color: config.colors.subtext, fontSize: 14, marginBottom: 12 }}>
                        {article.excerpt.replace(/<[^>]*>/g, '')}
                      </Paragraph>
                    )}
                    <Button type="text" size="small" style={{ color: config.colors.primary, fontWeight: 500 }} href={`/blog/${article.id}`}>
                      More
                    </Button>
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

