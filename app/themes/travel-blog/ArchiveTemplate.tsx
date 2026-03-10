'use client'

import { Typography, List, Tag, Empty, Skeleton, Space, Card } from 'antd'
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons'
import Link from 'next/link'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph } = Typography

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  publishDate: string | null
  category?: {
    id: string
    name: string
  } | null
}

interface ArchiveGroup {
  year: number
  month: number
  articles: Article[]
}

interface ArchiveTemplateProps {
  loading: boolean
  archiveGroups: ArchiveGroup[]
  yearStats: Map<number, number>
  config: ThemeConfig
}

export default function TravelBlogArchiveTemplate({
  loading,
  archiveGroups,
  yearStats,
  config,
}: ArchiveTemplateProps) {
  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months[month - 1]
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: config.colors.background, padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    )
  }

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
              <Link href="/blog" style={{ color: config.colors.text, textDecoration: 'none' }}>Blog</Link>
              <Link href="/archive" style={{ color: config.colors.primary, textDecoration: 'none', fontWeight: 500 }}>Archive</Link>
            </Space>
          </nav>
        </div>
      </header>

      {/* Content */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={2} style={{ color: config.colors.text, marginBottom: 40 }}>
            Travel Archive
          </Title>

          {/* Year Stats */}
          {yearStats.size > 0 && (
            <Card style={{ marginBottom: 40, borderRadius: 8 }}>
              <Title level={4} style={{ marginBottom: 24, color: config.colors.text }}>
                Year Statistics
              </Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {Array.from(yearStats.entries())
                  .sort((a, b) => b[0] - a[0])
                  .map(([year, count]) => (
                    <div
                      key={year}
                      onClick={() => {
                        const element = document.getElementById(`year-${year}`)
                        element?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      style={{
                        padding: '16px 24px',
                        border: `1px solid ${config.colors.border}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        textAlign: 'center',
                        minWidth: 100,
                        background: config.colors.cardBackground,
                      }}
                    >
                      <div style={{ fontSize: '20px', fontWeight: 400, color: config.colors.primary }}>
                        {year}
                      </div>
                      <div style={{ color: config.colors.subtext, fontSize: 14, marginTop: 4 }}>
                        {count} articles
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Archive List */}
          {archiveGroups.length === 0 ? (
            <Empty description="No articles found" />
          ) : (
            <div>
              {archiveGroups.map((group, index) => {
                const isNewYear = index === 0 || archiveGroups[index - 1].year !== group.year

                return (
                  <div key={`${group.year}-${group.month}`} id={isNewYear ? `year-${group.year}` : undefined}>
                    {isNewYear && (
                      <Title
                        level={2}
                        style={{
                          marginTop: index > 0 ? 60 : 0,
                          marginBottom: 32,
                          color: config.colors.text,
                          fontWeight: 400,
                          fontSize: 32,
                        }}
                      >
                        {group.year}
                      </Title>
                    )}
                    <Card style={{ marginBottom: 32, borderRadius: 8 }}>
                      <div style={{ marginBottom: 20, color: config.colors.text, fontSize: 18 }}>
                        <CalendarOutlined style={{ marginRight: 8 }} />
                        {getMonthName(group.month)} {group.year} · {group.articles.length} articles
                      </div>
                      <List
                        dataSource={group.articles}
                        renderItem={(article) => (
                          <List.Item style={{ border: 'none', padding: '12px 0' }}>
                            <Link
                              href={`/blog/${article.id}`}
                              style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <FileTextOutlined style={{ color: config.colors.primary, fontSize: 16 }} />
                                <div style={{ flex: 1 }}>
                                  <span style={{ color: config.colors.text, fontSize: 16, fontWeight: 400 }}>
                                    {article.title}
                                  </span>
                                  <div style={{ marginTop: 4 }}>
                                    <Space>
                                      {article.category && (
                                        <Tag color={config.colors.primary} style={{ fontSize: 12 }}>
                                          {article.category.name}
                                        </Tag>
                                      )}
                                      {article.publishDate && (
                                        <span style={{ color: config.colors.subtext, fontSize: 12 }}>
                                          {new Date(article.publishDate).toLocaleDateString('en-US')}
                                        </span>
                                      )}
                                    </Space>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </div>
                )
              })}
            </div>
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

