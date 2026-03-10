'use client'

import { Typography, Empty, Skeleton, Pagination, Tag, Space } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import Link from 'next/link'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph, Text } = Typography

interface Article {
  id: string
  title: string
  excerpt: string | null
  publishDate: string | null
  slug: string
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

export default function ZenBlogBlogListTemplate({
  articles,
  loading,
  currentPage,
  total,
  pageSize,
  onPageChange,
  config,
}: BlogListTemplateProps) {
  return (
    <div style={{ minHeight: '100vh', background: config.colors.background, padding: '60px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 60, borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Title level={1} style={{ marginBottom: 16, color: config.colors.text, fontWeight: 300, letterSpacing: '6px', fontSize: 48, fontFamily: 'serif' }}>
              ZenBlog
            </Title>
          </Link>
          <Paragraph style={{ color: config.colors.subtext, fontSize: 13, margin: 0, letterSpacing: '2px' }}>
            Mindful · Simple · Peaceful
          </Paragraph>
          <nav style={{ marginTop: 24 }}>
            <Space size="large">
              <Link href="/" style={{ color: config.colors.text, textDecoration: 'none' }}>Home</Link>
              <Link href="/blog" style={{ color: config.colors.primary, textDecoration: 'none', fontWeight: 300 }}>Blog</Link>
              <Link href="/archive" style={{ color: config.colors.text, textDecoration: 'none' }}>Archive</Link>
            </Space>
          </nav>
        </header>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Paragraph style={{ color: config.colors.subtext, fontSize: 16, fontWeight: 300 }}>
              No articles found
            </Paragraph>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
              {articles.map((article, index) => (
                <article key={article.id} style={{ borderBottom: index < articles.length - 1 ? `1px solid ${config.colors.border}` : 'none', paddingBottom: index < articles.length - 1 ? 40 : 0 }}>
                  <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Title level={2} style={{ marginBottom: 20, color: config.colors.text, fontWeight: 300, fontSize: 32, lineHeight: 1.4, letterSpacing: '0.5px', fontFamily: 'serif' }}>
                      {article.title}
                    </Title>
                    {article.excerpt && (
                      <Paragraph style={{ color: config.colors.subtext, fontSize: 16, lineHeight: 1.9, marginBottom: 24, fontWeight: 300 }}>
                        {article.excerpt.replace(/<[^>]*>/g, '').substring(0, 200)}...
                      </Paragraph>
                    )}
                    <Space size="middle" style={{ color: config.colors.subtext, fontSize: 13 }}>
                      {article.publishDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CalendarOutlined />
                          {new Date(article.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      )}
                      {article.category && (
                        <Tag style={{ border: `1px solid ${config.colors.border}`, background: 'transparent', color: config.colors.subtext, borderRadius: 0, padding: '2px 12px', fontSize: 12, fontWeight: 300 }}>
                          {article.category.name}
                        </Tag>
                      )}
                    </Space>
                  </Link>
                </article>
              ))}
            </div>

            {total > pageSize && (
              <div style={{ marginTop: 60, textAlign: 'center' }}>
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
                  simple
                />
              </div>
            )}
          </>
        )}

        <footer style={{ marginTop: 100, textAlign: 'center', paddingTop: 40, borderTop: `1px solid ${config.colors.border}` }}>
          <Text style={{ color: config.colors.subtext, fontSize: 12, fontWeight: 300, letterSpacing: '1px' }}>
            © {new Date().getFullYear()} ZenBlog
          </Text>
        </footer>
      </div>
    </div>
  )
}
