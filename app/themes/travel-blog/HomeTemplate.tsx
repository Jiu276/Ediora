'use client'

import { useState } from 'react'
import { Card, Row, Col, Typography, Tag, Button, Space, Input } from 'antd'
import { SearchOutlined, CalendarOutlined, EnvironmentOutlined, RightOutlined } from '@ant-design/icons'
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

export default function TravelBlogHomeTemplate({ articles, config, searchKeyword = '', onSearch }: HomeTemplateProps) {
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

  const featuredArticles = filteredArticles.slice(0, 3)
  const otherArticles = filteredArticles.slice(3)

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      {/* Top Bar */}
      <div style={{ background: '#2c3e50', color: '#fff', padding: '8px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Link href="/about" style={{ color: '#fff', textDecoration: 'none' }}>About us</Link>
                <span style={{ color: '#7f8c8d' }}>|</span>
                <Link href="/sitemap" style={{ color: '#fff', textDecoration: 'none' }}>Sitemap</Link>
              </Space>
            </Col>
            <Col>
              <Space>
                <Link href="/destinations" style={{ color: '#fff', textDecoration: 'none' }}>Destinations</Link>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* Main Header */}
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
              <Link href="/" style={{ color: config.colors.primary, textDecoration: 'none', fontWeight: 500 }}>Home</Link>
              <Link href="/blog" style={{ color: config.colors.text, textDecoration: 'none' }}>Category</Link>
              <Link href="/blog" style={{ color: config.colors.text, textDecoration: 'none' }}>Post</Link>
              <Link href="/pages" style={{ color: config.colors.text, textDecoration: 'none' }}>Pages</Link>
            </Space>
          </nav>
        </div>
      </header>

      {/* Featured Destinations Carousel */}
      {featuredArticles.length > 0 && (
        <section style={{ padding: '60px 24px', background: config.colors.cardBackground }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <Title level={2} style={{ color: config.colors.text, marginBottom: 8 }}>
                Featured Destinations
              </Title>
              <Paragraph style={{ color: config.colors.subtext, maxWidth: 600, margin: '0 auto' }}>
                Discover amazing places around the world and plan your next adventure
              </Paragraph>
            </div>
            <Row gutter={[24, 24]}>
              {featuredArticles.map((article, index) => (
                <Col xs={24} sm={12} md={8} key={article.id}>
                  <Card
                    hoverable
                    style={{ 
                      height: '100%',
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    cover={
                      article.featuredImage ? (
                        <div style={{ position: 'relative', height: 300, overflow: 'hidden' }}>
                          <LazyImage
                            src={article.featuredImage}
                            alt={article.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                            padding: '20px',
                            color: '#fff'
                          }}>
                            <Text strong style={{ color: '#fff', fontSize: 18, display: 'block', marginBottom: 4 }}>
                              {article.category?.name || 'DESTINATION'}
                            </Text>
                            <Text style={{ color: '#fff', fontSize: 14 }}>
                              {article.category?.name || 'Explore'}
                            </Text>
                          </div>
                        </div>
                      ) : (
                        <div style={{ height: 300, background: config.colors.cardAltBackground, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: config.colors.subtext }}>No Image</Text>
                        </div>
                      )
                    }
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
                        <div style={{ marginTop: 12 }}>
                          {article.excerpt && (
                            <Paragraph 
                              ellipsis={{ rows: 2 }} 
                              style={{ color: config.colors.subtext, marginBottom: 12 }}
                            >
                              {article.excerpt.replace(/<[^>]*>/g, '')}
                            </Paragraph>
                          )}
                          <Space>
                            {article.publishDate && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {new Date(article.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </Text>
                            )}
                          </Space>
                          <div style={{ marginTop: 16 }}>
                            <Button 
                              type="primary" 
                              style={{ background: config.colors.primary, borderColor: config.colors.primary }}
                              href={`/blog/${article.id}`}
                            >
                              Discover <RightOutlined />
                            </Button>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      {otherArticles.length > 0 && (
        <section style={{ padding: '60px 24px', background: config.colors.background }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Row gutter={[32, 32]}>
              <Col xs={24} lg={16}>
                <Title level={3} style={{ color: config.colors.text, marginBottom: 32 }}>
                  Latest Travel Guides
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {otherArticles.map((article) => (
                    <Card
                      key={article.id}
                      hoverable
                      style={{ borderRadius: 8, border: `1px solid ${config.colors.border}` }}
                      onClick={() => window.location.href = `/blog/${article.id}`}
                    >
                      <Row gutter={24}>
                        <Col xs={24} sm={8}>
                          {article.featuredImage ? (
                            <LazyImage
                              src={article.featuredImage}
                              alt={article.title}
                              style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 4 }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: 200, background: config.colors.cardAltBackground, borderRadius: 4 }} />
                          )}
                        </Col>
                        <Col xs={24} sm={16}>
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            {article.category && (
                              <Tag color={config.colors.primary}>{article.category.name}</Tag>
                            )}
                            <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                              <Title level={4} style={{ margin: 0, color: config.colors.text }}>
                                {article.title}
                              </Title>
                            </Link>
                            {article.excerpt && (
                              <Paragraph 
                                ellipsis={{ rows: 2 }} 
                                style={{ color: config.colors.subtext, margin: 0 }}
                              >
                                {article.excerpt.replace(/<[^>]*>/g, '')}
                              </Paragraph>
                            )}
                            <Space>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <CalendarOutlined style={{ marginRight: 4 }} />
                                {article.publishDate ? new Date(article.publishDate).toLocaleDateString('en-US') : ''}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                By {article.author}
                              </Text>
                            </Space>
                          </Space>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              </Col>
              <Col xs={24} lg={8}>
                <div style={{ position: 'sticky', top: 20 }}>
                  <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                    <Title level={4} style={{ marginBottom: 16 }}>Travel Essentials</Title>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, background: config.colors.cardAltBackground, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          🎒
                        </div>
                        <Text>Backpack</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, background: config.colors.cardAltBackground, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          📷
                        </div>
                        <Text>Camera</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, background: config.colors.cardAltBackground, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          🕶️
                        </div>
                        <Text>Sunglasses</Text>
                      </div>
                    </Space>
                  </Card>
                  <Card style={{ borderRadius: 8 }}>
                    <Title level={4} style={{ marginBottom: 16 }}>Top Categories</Title>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Link href="/category/restaurants" style={{ color: config.colors.text, textDecoration: 'none' }}>
                        🍴 Restaurants
                      </Link>
                      <Link href="/category/markets" style={{ color: config.colors.text, textDecoration: 'none' }}>
                        🛍️ Markets
                      </Link>
                      <Link href="/category/beaches" style={{ color: config.colors.text, textDecoration: 'none' }}>
                        🏖️ Beaches
                      </Link>
                      <Link href="/category/camping" style={{ color: config.colors.text, textDecoration: 'none' }}>
                        ⛺ Camping
                      </Link>
                    </Space>
                  </Card>
                </div>
              </Col>
            </Row>
          </div>
        </section>
      )}

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

