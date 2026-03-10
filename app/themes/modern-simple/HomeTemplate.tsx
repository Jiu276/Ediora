'use client'

import { Typography, Space, Tag, Input, Row, Col, Card, Button } from 'antd'
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

export default function ModernSimpleHomeTemplate({ articles, config, searchKeyword = '', onSearch }: HomeTemplateProps) {
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

  const featuredArticle = filteredArticles[0]
  const otherArticles = filteredArticles.slice(1)

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      {/* Hero Header with Background */}
      <header style={{ 
        background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://picsum.photos/seed/iridium-header/1920/600')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '80px 20px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <Title level={1} style={{ 
          marginBottom: 8, 
          color: '#fff',
          fontWeight: 300,
          fontSize: 48,
          letterSpacing: '4px'
        }}>
          IRIDIUM
        </Title>
        <Paragraph style={{ color: '#fff', fontSize: 14, margin: 0, letterSpacing: '2px' }}>
          DESIGN BY TEMPLATED
        </Paragraph>
        <nav style={{ marginTop: 32 }}>
          <Space size="large">
            <Link href="/" style={{ 
              color: '#fff', 
              textDecoration: 'none',
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 500
            }}>HOMEPAGE</Link>
            <Link href="/blog" style={{ color: '#fff', textDecoration: 'none' }}>LEFT SIDEBAR</Link>
            <Link href="/blog" style={{ color: '#fff', textDecoration: 'none' }}>RIGHT SIDEBAR</Link>
            <Link href="/archive" style={{ color: '#fff', textDecoration: 'none' }}>NO SIDEBAR</Link>
          </Space>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px', background: config.colors.cardBackground }}>
        <Row gutter={[32, 32]}>
          {/* Left Column - Main Content */}
          <Col xs={24} lg={16}>
            {/* Welcome Section */}
            <div style={{ marginBottom: 60 }}>
              <Title level={2} style={{ color: config.colors.text, marginBottom: 8, fontSize: 32 }}>
                WELCOME TO IRIDIUM!
              </Title>
              <Paragraph style={{ color: config.colors.subtext, fontSize: 16, marginBottom: 24 }}>
                Integer sit amet pede vel arcu aliquet pretium
              </Paragraph>
              
              {featuredArticle?.featuredImage && (
                <div style={{ marginBottom: 24, borderRadius: 8, overflow: 'hidden' }}>
                  <LazyImage
                    src={featuredArticle.featuredImage}
                    alt={featuredArticle.title}
                    style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'cover' }}
                  />
                </div>
              )}

              <Paragraph style={{ color: config.colors.text, fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
                This is <strong>Iridium</strong>, a responsive HTML5 site template freebie by <a href="#" style={{ color: config.colors.primary }}>TEMPLATED</a>. 
                Released for free under the <a href="#" style={{ color: config.colors.primary }}>Creative Commons Attribution</a> license, 
                so use it for whatever (personal or commercial) – just give us credit! Check out more of our stuff at <a href="#" style={{ color: config.colors.primary }}>our site</a> or follow us on <a href="#" style={{ color: config.colors.primary }}>Twitter</a>.
              </Paragraph>
              <Paragraph style={{ color: config.colors.text, fontSize: 15, lineHeight: 1.8 }}>
                Sed etiam vestibulum velit, euismod lacinia quam nisl id lorem. Quisque erat. Vestibulum pellentesque, 
                justo mollis pretium suscipit, justo nulla blandit libero, in blandit augue justo quis nisl. 
                Fusce mattis viverra elit. Fusce quis tortor. Consectetur adipiscing elit.
              </Paragraph>
            </div>

            {/* Three Column Section */}
            <Row gutter={[24, 24]}>
              {otherArticles.slice(0, 3).map((article, index) => {
                const titles = [
                  'AENEAN ELEMENTUM FACILISIS',
                  'FUSCE ULTRICES FRINGILLA',
                  'ETIAM RHONCUS VOLUTPAT ERAT'
                ]
                return (
                  <Col xs={24} sm={8} key={article.id}>
                    <Card
                      hoverable
                      style={{ borderRadius: 8, border: `1px solid ${config.colors.border}`, height: '100%' }}
                      cover={
                        article.featuredImage ? (
                          <LazyImage
                            src={article.featuredImage}
                            alt={article.title}
                            style={{ width: '100%', height: 180, objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ height: 180, background: config.colors.cardAltBackground }} />
                        )
                      }
                      onClick={() => window.location.href = `/blog/${article.id}`}
                    >
                      <Title level={4} style={{ color: config.colors.text, marginBottom: 12, fontSize: 18 }}>
                        {titles[index] || article.title}
                      </Title>
                      <Paragraph 
                        ellipsis={{ rows: 3 }} 
                        style={{ color: config.colors.subtext, fontSize: 14, marginBottom: 16, minHeight: 60 }}
                      >
                        {article.excerpt ? article.excerpt.replace(/<[^>]*>/g, '') : 'Nullam non wisi a sem semper eleifend. Donec mattis libero eget urna. Pellentesque viverra enim.'}
                      </Paragraph>
                      <Button 
                        type="primary" 
                        style={{ 
                          background: config.colors.primary, 
                          borderColor: config.colors.primary,
                          borderRadius: 20
                        }}
                        href={`/blog/${article.id}`}
                      >
                        MORE DETAILS
                      </Button>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </Col>

          {/* Right Sidebar */}
          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: 20 }}>
              <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                <Title level={4} style={{ color: config.colors.text, marginBottom: 16, fontSize: 18 }}>
                  PELLENTESQUE VULPUTATE
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {otherArticles.slice(3, 6).map((article) => (
                    <div key={article.id} style={{ display: 'flex', gap: 12 }}>
                      <div style={{ flexShrink: 0 }}>
                        {article.featuredImage ? (
                          <LazyImage
                            src={article.featuredImage}
                            alt={article.title}
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                          />
                        ) : (
                          <div style={{ width: 80, height: 80, background: config.colors.cardAltBackground, borderRadius: 4 }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text style={{ color: config.colors.subtext, fontSize: 11, display: 'block', marginBottom: 4 }}>
                          AUGUST 11, 2002
                        </Text>
                        <Text style={{ color: config.colors.subtext, fontSize: 11, display: 'block', marginBottom: 8 }}>
                          (10) COMMENTS
                        </Text>
                        <Link href={`/blog/${article.id}`} style={{ color: config.colors.text, textDecoration: 'none', fontSize: 13, lineHeight: 1.5 }}>
                          {article.title || 'Nullam non wisi a sem eleifend. Donec mattis libero eget urna. Pellentesque viverra enim.'}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </main>

      {/* Footer */}
      <footer style={{ background: '#2c3e50', color: '#fff', padding: '60px 24px', marginTop: 60 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={8}>
              <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>LATEST POSTS</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {otherArticles.slice(0, 5).map((article) => (
                  <Link key={article.id} href={`/blog/${article.id}`} style={{ color: '#95a5a6', textDecoration: 'none', fontSize: 14 }}>
                    Pellentesque lectus gravida blandit
                  </Link>
                ))}
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>ULTRICES FRINGILLA</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {otherArticles.slice(0, 5).map((article) => (
                  <Link key={article.id} href={`/blog/${article.id}`} style={{ color: '#95a5a6', textDecoration: 'none', fontSize: 14 }}>
                    Lorem ipsum consectetuer adipiscing
                  </Link>
                ))}
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>AENEAN ELEMENTUM</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {otherArticles.slice(0, 5).map((article) => (
                  <Link key={article.id} href={`/blog/${article.id}`} style={{ color: '#95a5a6', textDecoration: 'none', fontSize: 14 }}>
                    Pellentesque lectus gravida blandit
                  </Link>
                ))}
              </div>
            </Col>
          </Row>
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #34495e', textAlign: 'center' }}>
            <Text style={{ color: '#95a5a6', fontSize: 12 }}>
              Design: TEMPLATED Images: Unsplash (CCO)
            </Text>
          </div>
        </div>
      </footer>
    </div>
  )
}
