'use client'

import { Typography, List, Tag, Empty, Skeleton, Space, Card } from 'antd'
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

export default function ModernMagazineArchiveTemplate({ loading, archiveGroups, yearStats, config }: ArchiveTemplateProps) {
  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months[month - 1]
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: config.colors.background, padding: '60px 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}><Skeleton active paragraph={{ rows: 10 }} /></div>
      </div>
    )
  }

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

      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Title level={2} style={{ color: config.colors.text, marginBottom: 40 }}>ARCHIVE</Title>

          {yearStats.size > 0 && (
            <Card style={{ marginBottom: 40 }}>
              <Title level={4} style={{ marginBottom: 24 }}>Year Statistics</Title>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {Array.from(yearStats.entries()).sort((a, b) => b[0] - a[0]).map(([year, count]) => (
                  <div key={year} onClick={() => { const element = document.getElementById(`year-${year}`); element?.scrollIntoView({ behavior: 'smooth' }) }} style={{ padding: '16px 24px', border: `1px solid ${config.colors.border}`, borderRadius: 8, cursor: 'pointer', textAlign: 'center', minWidth: 100 }}>
                    <div style={{ fontSize: '20px', fontWeight: 400, color: config.colors.primary }}>{year}</div>
                    <div style={{ color: config.colors.subtext, fontSize: 14, marginTop: 4 }}>{count} articles</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {archiveGroups.length === 0 ? (
            <Empty description="No articles found" />
          ) : (
            <div>
              {archiveGroups.map((group, index) => {
                const isNewYear = index === 0 || archiveGroups[index - 1].year !== group.year
                return (
                  <div key={`${group.year}-${group.month}`} id={isNewYear ? `year-${group.year}` : undefined}>
                    {isNewYear && <Title level={2} style={{ marginTop: index > 0 ? 60 : 0, marginBottom: 32, color: config.colors.text, fontSize: 32 }}>{group.year}</Title>}
                    <Card style={{ marginBottom: 32 }}>
                      <div style={{ marginBottom: 20, color: config.colors.text, fontSize: 18 }}>
                        <CalendarOutlined style={{ marginRight: 8 }} />
                        {getMonthName(group.month)} {group.year} · {group.articles.length} articles
                      </div>
                      <List dataSource={group.articles} renderItem={(article) => (
                        <List.Item style={{ border: 'none', padding: '12px 0' }}>
                          <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <FileTextOutlined style={{ color: config.colors.primary, fontSize: 16 }} />
                              <div style={{ flex: 1 }}>
                                <span style={{ color: config.colors.text, fontSize: 16, fontWeight: 400 }}>{article.title}</span>
                                <div style={{ marginTop: 4 }}>
                                  <Space>
                                    {article.category && <Tag color={config.colors.primary} style={{ fontSize: 12 }}>{article.category.name}</Tag>}
                                    {article.publishDate && <span style={{ color: config.colors.subtext, fontSize: 12 }}>{new Date(article.publishDate).toLocaleDateString('en-US')}</span>}
                                  </Space>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </List.Item>
                      )} />
                    </Card>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

