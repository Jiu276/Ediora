'use client'

import { Typography, Space, Tag, Input, Row, Col } from 'antd'
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons'
import Link from 'next/link'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph, Text } = Typography
const { Search } = Input

interface Article {
  id: string
  title: string
  excerpt: string | null
  slug: string
  publishDate: string | null
  category?: {
    name: string
  } | null
}

interface HomeTemplateProps {
  articles: Article[]
  config: ThemeConfig
  searchKeyword?: string
  onSearch?: (keyword: string) => void
}

export default function ZenBlogHomeTemplate({ articles, config, searchKeyword = '', onSearch }: HomeTemplateProps) {
  const handleSearch = (value: string) => {
    if (onSearch) {
      onSearch(value)
    } else {
      window.location.href = `/search?q=${encodeURIComponent(value)}`
    }
  }

  const filteredArticles = searchKeyword
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          (article.excerpt && article.excerpt.toLowerCase().includes(searchKeyword.toLowerCase()))
      )
    : articles

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background, padding: '60px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Zen Header */}
        <header style={{ textAlign: 'center', marginBottom: 80, borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Title 
              level={1} 
              style={{ 
                marginBottom: 16, 
                color: config.colors.text,
                fontWeight: 300,
                letterSpacing: '6px',
                fontSize: 48,
                fontFamily: 'serif'
              }}
            >
              ZenBlog
            </Title>
          </Link>
          <Paragraph style={{ color: config.colors.subtext, fontSize: 13, margin: 0, letterSpacing: '2px' }}>
            Mindful · Simple · Peaceful
          </Paragraph>
        </header>

        {/* Search Bar - Zen Style */}
        <div style={{ marginBottom: 60, textAlign: 'center' }}>
          <Search
            placeholder="Search..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchKeyword}
            onChange={(e) => {
              if (onSearch) onSearch(e.target.value)
            }}
            onSearch={handleSearch}
            style={{ maxWidth: 500, margin: '0 auto' }}
          />
        </div>

        {/* Articles List - Zen Minimal Style */}
        {filteredArticles.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
            {filteredArticles.map((article, index) => (
              <article 
                key={article.id} 
                style={{ 
                  borderBottom: index < filteredArticles.length - 1 ? `1px solid ${config.colors.border}` : 'none', 
                  paddingBottom: index < filteredArticles.length - 1 ? 40 : 0 
                }}
              >
                <Link
                  href={`/blog/${article.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Title
                    level={2}
                    style={{
                      marginBottom: 20,
                      color: config.colors.text,
                      fontWeight: 300,
                      fontSize: 32,
                      lineHeight: 1.4,
                      letterSpacing: '0.5px',
                      fontFamily: 'serif'
                    }}
                  >
                    {article.title}
                  </Title>
                  {article.excerpt && (
                    <Paragraph
                      style={{
                        color: config.colors.subtext,
                        fontSize: 16,
                        lineHeight: 1.9,
                        marginBottom: 24,
                        fontWeight: 300
                      }}
                    >
                      {article.excerpt.replace(/<[^>]*>/g, '').substring(0, 200)}...
                    </Paragraph>
                  )}
                  <Space size="middle" style={{ color: config.colors.subtext, fontSize: 13 }}>
                    {article.publishDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CalendarOutlined />
                        {new Date(article.publishDate).toLocaleDateString('en-US', { 
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    )}
                    {article.category && (
                      <Tag 
                        style={{ 
                          border: `1px solid ${config.colors.border}`, 
                          background: 'transparent', 
                          color: config.colors.subtext,
                          borderRadius: 0,
                          padding: '2px 12px',
                          fontSize: 12,
                          fontWeight: 300
                        }}
                      >
                        {article.category.name}
                      </Tag>
                    )}
                  </Space>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Paragraph style={{ color: config.colors.subtext, fontSize: 16, fontWeight: 300 }}>
              {searchKeyword ? 'No articles found' : 'No articles yet'}
            </Paragraph>
          </div>
        )}

        {/* Zen Footer */}
        <footer style={{ marginTop: 100, textAlign: 'center', paddingTop: 40, borderTop: `1px solid ${config.colors.border}` }}>
          <Text style={{ color: config.colors.subtext, fontSize: 12, fontWeight: 300, letterSpacing: '1px' }}>
            © {new Date().getFullYear()} ZenBlog
          </Text>
        </footer>
      </div>
    </div>
  )
}
