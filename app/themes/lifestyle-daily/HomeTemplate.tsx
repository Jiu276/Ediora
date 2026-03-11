'use client'

import { Typography, Space, Tag, Input, Row, Col, Card } from 'antd'
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import type { ThemeConfig } from '@/lib/themeLoader'

const { Title, Paragraph, Text } = Typography
const { Search } = Input

interface Article {
  id: string
  title: string
  excerpt: string | null
  slug: string
  featuredImage: string | null
  publishDate: string | null
  category?: {
    name: string
  } | null
  author: string
}

interface HomeTemplateProps {
  articles: Article[]
  config: ThemeConfig
  searchKeyword?: string
  onSearch?: (keyword: string) => void
}

export default function LifestyleDailyHomeTemplate({ articles, config, searchKeyword = '', onSearch }: HomeTemplateProps) {
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

  const heroArticle = filteredArticles[0]
  const otherArticles = filteredArticles.slice(1)

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      {/* Header */}
      <header style={{ background: config.colors.cardBackground, padding: '40px 0', borderBottom: `1px solid ${config.colors.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Title level={1} style={{ 
              marginBottom: 8, 
              color: config.colors.text,
              fontWeight: 300,
              fontSize: 42,
              letterSpacing: '2px',
              fontFamily: 'serif'
            }}>
              Ablogia
            </Title>
          </Link>
          <Paragraph style={{ color: config.colors.subtext, fontSize: 13, margin: 0, letterSpacing: '1px' }}>
            Lifestyle • Travel • Daily
          </Paragraph>
          <nav style={{ marginTop: 32 }}>
            <Space size="large">
              <Link href="/" style={{ color: config.colors.text, textDecoration: 'none', fontWeight: 500 }}>HOME</Link>
              <Link href="/blog" style={{ color: config.colors.text, textDecoration: 'none' }}>FEATURES</Link>
              <Link href="/blog" style={{ color: config.colors.text, textDecoration: 'none' }}>LIFESTYLE</Link>
              <Link href="/blog" style={{ color: config.colors.text, textDecoration: 'none' }}>TRAVEL</Link>
              <Link href="/blog" style={{ color: config.colors.text, textDecoration: 'none' }}>MUSIC</Link>
              <Link href="/about" style={{ color: config.colors.text, textDecoration: 'none' }}>ABOUT</Link>
              <Link href="/contact" style={{ color: config.colors.text, textDecoration: 'none' }}>CONTACT</Link>
            </Space>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      {heroArticle && (
        <section style={{ position: 'relative', marginBottom: 60 }}>
          <div style={{ 
            position: 'relative',
            height: '500px',
            background: heroArticle.featuredImage 
              ? `url(${heroArticle.featuredImage})` 
              : `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.accent})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))'
            }} />
            <div style={{ 
              position: 'relative', 
              zIndex: 1, 
              textAlign: 'center', 
              color: '#fff',
              maxWidth: 800,
              padding: '0 24px'
            }}>
              {heroArticle.category && (
                <Tag 
                  style={{ 
                    background: config.colors.primary, 
                    color: '#fff', 
                    border: 'none',
                    padding: '6px 16px',
                    fontSize: 12,
                    marginBottom: 16,
                    borderRadius: 20
                  }}
                >
                  {heroArticle.category.name.toUpperCase()}
                </Tag>
              )}
              <Link href={`/blog/${heroArticle.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Title level={1} style={{ 
                  color: '#fff', 
                  marginBottom: 16,
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  fontWeight: 300,
                  lineHeight: 1.2
                }}>
                  {heroArticle.title}
                </Title>
              </Link>
              {heroArticle.publishDate && (
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {new Date(heroArticle.publishDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }).toUpperCase()}
                </Text>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
        <Row gutter={[40, 40]}>
          {/* Left Column - Articles */}
          <Col xs={24} lg={16}>
            {otherArticles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 50 }}>
                {otherArticles.map((article) => (
                  <article key={article.id} style={{ borderBottom: `1px solid ${config.colors.border}`, paddingBottom: 40 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {article.category && (
                        <Tag 
                          color={config.colors.primary}
                          style={{ 
                            alignSelf: 'flex-start',
                            borderRadius: 0,
                            border: 'none',
                            padding: '4px 12px',
                            fontSize: 12
                          }}
                        >
                          {article.category.name}
                        </Tag>
                      )}
                      <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Title level={2} style={{ 
                          marginBottom: 12, 
                          color: config.colors.text,
                          fontWeight: 400,
                          fontSize: 28,
                          lineHeight: 1.3
                        }}>
                          {article.title}
                        </Title>
                      </Link>
                      {article.publishDate && (
                        <Text style={{ color: config.colors.subtext, fontSize: 13 }}>
                          {new Date(article.publishDate).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </Text>
                      )}
                      {article.featuredImage && (
                        <div style={{ marginTop: 16, borderRadius: 4, overflow: 'hidden' }}>
                          <LazyImage
                            src={article.featuredImage}
                            alt={article.title}
                            style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      {article.excerpt && (
                        <Paragraph style={{ 
                          color: config.colors.subtext, 
                          fontSize: 15, 
                          lineHeight: 1.8,
                          marginTop: 16,
                          marginBottom: 0
                        }}>
                          {article.excerpt.replace(/<[^>]*>/g, '').substring(0, 250)}...
                        </Paragraph>
                      )}
                      <Link 
                        href={`/blog/${article.id}`}
                        style={{ 
                          color: config.colors.primary,
                          textDecoration: 'none',
                          fontWeight: 500,
                          fontSize: 14,
                          alignSelf: 'flex-start',
                          marginTop: 8
                        }}
                      >
                        CONTINUE READING →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <Paragraph style={{ color: config.colors.subtext, fontSize: 16 }}>
                  {searchKeyword ? 'No articles found' : 'No articles yet'}
                </Paragraph>
              </div>
            )}
          </Col>

          {/* Right Sidebar */}
          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: 20 }}>
              {/* Search */}
              <Card style={{ marginBottom: 24, borderRadius: 0, border: `1px solid ${config.colors.border}` }}>
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
                />
              </Card>

              {/* About Me */}
              <Card style={{ marginBottom: 24, borderRadius: 0, border: `1px solid ${config.colors.border}` }}>
                <Title level={4} style={{ color: config.colors.text, marginBottom: 16, fontSize: 16, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  ABOUT ME
                </Title>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ 
                    width: 100, 
                    height: 100, 
                    borderRadius: '50%', 
                    background: config.colors.cardBackground,
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 40
                  }}>
                    👤
                  </div>
                </div>
                <Paragraph style={{ color: config.colors.subtext, fontSize: 14, lineHeight: 1.6 }}>
                  Welcome to Ablogia! This is a lifestyle blog where we share daily inspirations, 
                  travel stories, and mindful living tips.
                </Paragraph>
                <Link href="/about" style={{ color: config.colors.primary, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                  Read More →
                </Link>
              </Card>

              {/* Categories */}
              <Card style={{ marginBottom: 24, borderRadius: 0, border: `1px solid ${config.colors.border}` }}>
                <Title level={4} style={{ color: config.colors.text, marginBottom: 16, fontSize: 16, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  CATEGORIES
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Journey', 'Photography', 'Lifestyle', 'Food & Drinks'].map((cat, index) => {
                    // 使用固定的数字避免 hydration 错误（实际应该从数据库获取）
                    const counts = [3, 11, 8, 20]
                    return (
                      <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link href={`/category/${cat.toLowerCase()}`} style={{ color: config.colors.text, textDecoration: 'none', fontSize: 14 }}>
                          {cat}
                        </Link>
                        <Text style={{ color: config.colors.subtext, fontSize: 12 }}>({counts[index] || 0})</Text>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Popular Posts */}
              <Card style={{ borderRadius: 0, border: `1px solid ${config.colors.border}` }}>
                <Title level={4} style={{ color: config.colors.text, marginBottom: 16, fontSize: 16, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  POPULAR POSTS
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {otherArticles.slice(0, 3).map((article) => (
                    <Link key={article.id} href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        {article.featuredImage ? (
                          <LazyImage
                            src={article.featuredImage}
                            alt={article.title}
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{ width: 80, height: 80, background: config.colors.cardBackground, borderRadius: 4, flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <Paragraph 
                            ellipsis={{ rows: 2 }} 
                            style={{ margin: 0, color: config.colors.text, fontSize: 13, lineHeight: 1.4 }}
                          >
                            {article.title}
                          </Paragraph>
                          {article.publishDate && (
                            <Text style={{ color: config.colors.subtext, fontSize: 11, marginTop: 4, display: 'block' }}>
                              {new Date(article.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </main>

      {/* Footer */}
      <footer style={{ background: config.colors.cardBackground, padding: '40px 24px', marginTop: 60, borderTop: `1px solid ${config.colors.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
            {['Facebook', 'Twitter', 'Instagram', 'Pinterest'].map((social) => (
              <div key={social} style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: config.colors.cardBackground,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: `1px solid ${config.colors.border}`
              }}>
                {social[0]}
              </div>
            ))}
          </div>
          <Text style={{ color: config.colors.subtext, fontSize: 12 }}>
            © {new Date().getFullYear()} Ablogia. All Rights Reserved.
          </Text>
        </div>
      </footer>
    </div>
  )
}
