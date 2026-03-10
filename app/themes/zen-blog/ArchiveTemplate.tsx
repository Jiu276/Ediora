'use client'

import { Typography, List, Tag, Empty, Skeleton, Space } from 'antd'
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons'
import Link from 'next/link'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title } = Typography

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

export default function ZenBlogArchiveTemplate({ loading, archiveGroups, yearStats, config }: ArchiveTemplateProps) {
  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months[month - 1]
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: config.colors.background, padding: '60px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background, padding: '60px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 60, borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Title level={1} style={{ marginBottom: 16, color: config.colors.text, fontWeight: 300, letterSpacing: '6px', fontSize: 48, fontFamily: 'serif' }}>
              ZenBlog
            </Title>
          </Link>
          <div style={{ marginTop: 20 }}>
            <Link href="/blog" style={{ marginRight: 24, color: config.colors.text, textDecoration: 'none', fontSize: 14 }}>Blog</Link>
            <Link href="/archive" style={{ marginRight: 24, color: config.colors.primary, textDecoration: 'none', fontSize: 14, fontWeight: 300 }}>Archive</Link>
          </div>
        </header>

        {yearStats.size > 0 && (
          <div style={{ marginBottom: 60, borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 24, color: config.colors.text, fontSize: 18, fontWeight: 300 }}>
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
                      borderRadius: 4,
                      cursor: 'pointer',
                      textAlign: 'center',
                      minWidth: 100,
                      background: config.colors.cardBackground,
                    }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: 300, color: config.colors.primary }}>
                      {year}
                    </div>
                    <div style={{ color: config.colors.subtext, fontSize: 14, marginTop: 4 }}>
                      {count} articles
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

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
                        fontWeight: 300,
                        fontSize: 32,
                        fontFamily: 'serif'
                      }}
                    >
                      {group.year}
                    </Title>
                  )}
                  <div
                    style={{
                      marginBottom: 40,
                      borderBottom: `1px solid ${config.colors.border}`,
                      paddingBottom: 32,
                    }}
                  >
                    <div style={{ marginBottom: 20, color: config.colors.text, fontSize: 18, fontWeight: 300 }}>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      {getMonthName(group.month)} {group.year} · {group.articles.length} articles
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {group.articles.map((article) => (
                        <Link
                          key={article.id}
                          href={`/blog/${article.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <div
                            style={{
                              padding: '16px 0',
                              borderBottom: `1px solid ${config.colors.border}`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                              <FileTextOutlined style={{ color: config.colors.primary, fontSize: 16 }} />
                              <span style={{ color: config.colors.text, fontSize: 16, fontWeight: 300 }}>
                                {article.title}
                              </span>
                            </div>
                            <div style={{ marginLeft: 28, marginTop: 8 }}>
                              <Space size="middle" style={{ color: config.colors.subtext, fontSize: 14 }}>
                                {article.category && (
                                  <Tag style={{ border: `1px solid ${config.colors.border}`, background: 'transparent', color: config.colors.subtext, borderRadius: 0, fontSize: 12 }}>
                                    {article.category.name}
                                  </Tag>
                                )}
                                {article.publishDate && (
                                  <span>{new Date(article.publishDate).toLocaleDateString('en-US')}</span>
                                )}
                              </Space>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <footer style={{ marginTop: 100, textAlign: 'center', paddingTop: 40, borderTop: `1px solid ${config.colors.border}` }}>
          <div style={{ color: config.colors.subtext, fontSize: 12, fontWeight: 300 }}>
            © {new Date().getFullYear()} ZenBlog
          </div>
        </footer>
      </div>
    </div>
  )
}
