'use client'

import { Typography, Empty, Skeleton, Pagination, Tag, Space, Card, Row, Col } from 'antd'
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

export default function LifestyleDailyBlogListTemplate({
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
      <header style={{ background: config.colors.cardBackground, padding: '40px 0', borderBottom: `1px solid ${config.colors.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Title level={1} style={{ marginBottom: 8, color: config.colors.text, fontWeight: 300, fontSize: 42, letterSpacing: '2px', fontFamily: 'serif' }}>
              Ablogia
            </Title>
          </Link>
          <Paragraph style={{ color: config.colors.subtext, fontSize: 13, margin: 0, letterSpacing: '1px' }}>
            Lifestyle • Travel • Daily
          </Paragraph>
          <nav style={{ marginTop: 32 }}>
            <Space size="large">
              <Link href="/" style={{ color: config.colors.text, textDecoration: 'none' }}>HOME</Link>
              <Link href="/blog" style={{ color: config.colors.primary, textDecoration: 'none', fontWeight: 500 }}>BLOG</Link>
              <Link href="/archive" style={{ color: config.colors.text, textDecoration: 'none' }}>ARCHIVE</Link>
            </Space>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}>
        <Title level={2} style={{ color: config.colors.text, marginBottom: 40 }}>All Articles</Title>

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 50 }}>
              {articles.map((article) => (
                <article key={article.id} style={{ borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
                  {article.category && (
                    <Tag color={config.colors.primary} style={{ borderRadius: 0, border: 'none', padding: '4px 12px', fontSize: 12, marginBottom: 12 }}>
                      {article.category.name}
                    </Tag>
                  )}
                  <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Title level={2} style={{ marginBottom: 12, color: config.colors.text, fontWeight: 400, fontSize: 28 }}>
                      {article.title}
                    </Title>
                  </Link>
                  {article.publishDate && (
                    <Text style={{ color: config.colors.subtext, fontSize: 13, display: 'block', marginBottom: 16 }}>
                      {new Date(article.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Text>
                  )}
                  {article.featuredImage && (
                    <div style={{ marginBottom: 16, borderRadius: 4, overflow: 'hidden' }}>
                      <LazyImage src={article.featuredImage} alt={article.title} style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'cover' }} />
                    </div>
                  )}
                  {article.excerpt && (
                    <Paragraph style={{ color: config.colors.subtext, fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
                      {article.excerpt.replace(/<[^>]*>/g, '').substring(0, 250)}...
                    </Paragraph>
                  )}
                  <Link href={`/blog/${article.id}`} style={{ color: config.colors.primary, textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>
                    CONTINUE READING →
                  </Link>
                </article>
              ))}
            </div>

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
