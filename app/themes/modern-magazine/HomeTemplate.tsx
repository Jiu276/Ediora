'use client'

import { useState } from 'react'
import { Card, Row, Col, Typography, Tag, Button, Space, Input, List, Avatar } from 'antd'
import { SearchOutlined, CalendarOutlined, HeartOutlined, UserOutlined, MailOutlined } from '@ant-design/icons'
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

export default function ModernMagazineHomeTemplate({ articles, config, searchKeyword = '', onSearch }: HomeTemplateProps) {
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
  const latestArticles = filteredArticles.slice(1, 7)
  const popularArticles = filteredArticles.slice(0, 5)

  return (
    <div style={{ minHeight: '100vh', background: config.colors.background }}>
      {/* Header */}
      <header style={{ background: '#1a1a1a', padding: '16px 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <div style={{ 
                  background: '#000', 
                  color: '#fff', 
                  padding: '12px 24px', 
                  fontWeight: 700, 
                  fontSize: 24,
                  letterSpacing: '2px'
                }}>
                  MAGZ
                </div>
              </Link>
            </Col>
            <Col flex="auto" style={{ maxWidth: 400, margin: '0 24px' }}>
              <Search
                placeholder="Type something here"
                allowClear
                enterButton={<SearchOutlined style={{ color: config.colors.primary }} />}
                size="large"
                value={searchKeyword}
                onChange={(e) => {
                  if (onSearch) onSearch(e.target.value)
                }}
                onSearch={handleSearch}
                style={{ background: '#fff' }}
              />
            </Col>
            <Col>
              <Space>
                <Button type="link" style={{ color: '#fff' }}>REGISTER</Button>
                <Button type="link" style={{ color: '#fff' }}>LOGIN</Button>
              </Space>
            </Col>
          </Row>
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <Space>
                <Link href="/" style={{ color: config.colors.primary, textDecoration: 'none', fontWeight: 500 }}>Standard</Link>
                <Link href="/pages" style={{ color: '#fff', textDecoration: 'none' }}>Pages</Link>
                <Link href="/dropdown" style={{ color: '#fff', textDecoration: 'none' }}>Dropdown</Link>
                <Link href="/mega" style={{ color: '#fff', textDecoration: 'none' }}>
                  Mega Menu <Tag color="red" style={{ marginLeft: 4, fontSize: 10 }}>HOT</Tag>
                </Link>
                <Link href="/column" style={{ color: '#fff', textDecoration: 'none' }}>Column</Link>
              </Space>
            </Col>
          </Row>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
        <Row gutter={[32, 32]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            {/* Featured Article */}
            {featuredArticle && !searchKeyword && (
              <Card
                style={{
                  marginBottom: 40,
                  borderRadius: 0,
                  overflow: 'hidden',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                cover={
                  featuredArticle.featuredImage ? (
                    <div style={{ position: 'relative', height: 400 }}>
                      <LazyImage
                        src={featuredArticle.featuredImage}
                        alt={featuredArticle.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        padding: '24px',
                        color: '#fff'
                      }}>
                        <Tag color={config.colors.primary} style={{ marginBottom: 12 }}>
                          {featuredArticle.category?.name || 'FEATURED'}
                        </Tag>
                        <Title level={1} style={{ color: '#fff', marginBottom: 8, fontSize: 32 }}>
                          {featuredArticle.title}
                        </Title>
                        {featuredArticle.publishDate && (
                          <Text style={{ color: '#fff', fontSize: 14 }}>
                            {new Date(featuredArticle.publishDate).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </Text>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ height: 400, background: config.colors.cardAltBackground }} />
                  )
                }
              />
            )}

            {/* Latest News */}
            <div style={{ marginBottom: 40 }}>
              <Title level={2} style={{ color: config.colors.text, marginBottom: 24, fontSize: 24 }}>
                LATEST NEWS
              </Title>
              <Row gutter={[24, 24]}>
                {latestArticles.map((article) => (
                  <Col xs={24} sm={12} key={article.id}>
                    <Card
                      hoverable
                      style={{ borderRadius: 0, border: `1px solid ${config.colors.border}`, height: '100%' }}
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
                      <div style={{ marginBottom: 12 }}>
                        <Space>
                          {article.publishDate && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {new Date(article.publishDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </Text>
                          )}
                          {article.category && (
                            <Tag color={config.colors.primary} style={{ fontSize: 11 }}>
                              {article.category.name}
                            </Tag>
                          )}
                        </Space>
                      </div>
                      <Title level={4} style={{ marginBottom: 8, color: config.colors.text, fontSize: 18 }}>
                        {article.title}
                      </Title>
                      {article.excerpt && (
                        <Paragraph 
                          ellipsis={{ rows: 2 }} 
                          style={{ color: config.colors.subtext, fontSize: 14, marginBottom: 12 }}
                        >
                          {article.excerpt.replace(/<[^>]*>/g, '')}
                        </Paragraph>
                      )}
                      <Space>
                        <Button type="text" size="small" icon={<HeartOutlined />} style={{ color: config.colors.subtext }}>
                          1,234
                        </Button>
                        <Button 
                          type="text" 
                          size="small" 
                          style={{ color: config.colors.primary, fontWeight: 500 }}
                          href={`/blog/${article.id}`}
                        >
                          More
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <div style={{ position: 'sticky', top: 20 }}>
              {/* Featured Author */}
              <Card style={{ marginBottom: 24, borderRadius: 0, background: '#2c3e50', border: 'none' }}>
                <Tag color={config.colors.primary} style={{ marginBottom: 16 }}>FEATURED</Tag>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Avatar size={80} icon={<UserOutlined />} style={{ background: config.colors.primary }} />
                  <Title level={4} style={{ color: '#fff', marginTop: 12, marginBottom: 4 }}>
                    John Doe
                  </Title>
                  <Text style={{ color: '#95a5a6' }}>@johndoe</Text>
                </div>
                <Row gutter={8} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', color: '#fff' }}>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>208</div>
                      <div style={{ fontSize: 12, color: '#95a5a6' }}>POSTS</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', color: '#fff' }}>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>3,729</div>
                      <div style={{ fontSize: 12, color: '#95a5a6' }}>STARS</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center', color: '#fff' }}>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>+</div>
                      <div style={{ fontSize: 12, color: '#95a5a6' }}>MORE</div>
                    </div>
                  </Col>
                </Row>
                <Button block style={{ background: config.colors.primary, borderColor: config.colors.primary, color: '#fff' }}>
                  SEE ALL AUTHORS
                </Button>
              </Card>

              {/* Popular */}
              <Card title="POPULAR" style={{ marginBottom: 24, borderRadius: 0 }}>
                <List
                  dataSource={popularArticles}
                  renderItem={(article) => (
                    <List.Item style={{ padding: '12px 0', border: 'none' }}>
                      <Link href={`/blog/${article.id}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                        <Row gutter={12}>
                          <Col span={8}>
                            {article.featuredImage ? (
                              <LazyImage
                                src={article.featuredImage}
                                alt={article.title}
                                style={{ width: '100%', height: 60, objectFit: 'cover', borderRadius: 4 }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: 60, background: config.colors.cardAltBackground, borderRadius: 4 }} />
                            )}
                          </Col>
                          <Col span={16}>
                            <Paragraph 
                              ellipsis={{ rows: 2 }} 
                              style={{ margin: 0, fontSize: 13, color: config.colors.text }}
                            >
                              {article.title}
                            </Paragraph>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {article.publishDate ? new Date(article.publishDate).toLocaleDateString('en-US') : ''}
                            </Text>
                          </Col>
                        </Row>
                      </Link>
                    </List.Item>
                  )}
                />
              </Card>

              {/* Newsletter */}
              <Card style={{ marginBottom: 24, borderRadius: 0, background: config.colors.cardAltBackground }}>
                <div style={{ textAlign: 'center' }}>
                  <MailOutlined style={{ fontSize: 32, color: config.colors.primary, marginBottom: 12 }} />
                  <Title level={4} style={{ marginBottom: 8 }}>Newsletter</Title>
                  <Paragraph style={{ fontSize: 12, color: config.colors.subtext, marginBottom: 16 }}>
                    Subscribe to get the latest updates
                  </Paragraph>
                  {/* antd 不提供 Space.vertical，用 direction=\"vertical\" 保证组件存在，避免 React element 为 undefined */}
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Input placeholder="Enter your email" style={{ borderRadius: 0 }} />
                    <Button 
                      block 
                      style={{ background: config.colors.primary, borderColor: config.colors.primary, color: '#fff', borderRadius: 0 }}
                    >
                      Subscribe
                    </Button>
                  </Space>
                </div>
              </Card>

              {/* Trending Tags */}
              <Card title="Trending Tags" style={{ borderRadius: 0 }}>
                <Space wrap>
                  {['HTML5', 'CSS3', 'JavaScript', 'Bootstrap', 'React', 'Vue', 'Angular'].map((tag) => (
                    <Tag key={tag} style={{ marginBottom: 8 }}>{tag}</Tag>
                  ))}
                </Space>
              </Card>
            </div>
          </Col>
        </Row>
      </main>

      {/* Footer */}
      <footer style={{ background: '#2c3e50', color: '#fff', padding: '60px 24px', marginTop: 60 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} sm={8}>
              <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>MAGZ</Title>
              <Paragraph style={{ color: '#95a5a6', fontSize: 13 }}>
                Magz is a HTML5 & CSS3 magazine template based on Bootstrap 3
              </Paragraph>
              <Button type="primary" style={{ background: config.colors.primary, borderColor: config.colors.primary }}>
                About Us
              </Button>
            </Col>
            <Col xs={24} sm={8}>
              <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>Popular Tags</Title>
              <Space wrap>
                {['HTML5', 'CSS3', 'JavaScript', 'Bootstrap', 'React'].map((tag) => (
                  <Tag key={tag} style={{ background: '#34495e', color: '#fff', border: 'none' }}>{tag}</Tag>
                ))}
              </Space>
            </Col>
            <Col xs={24} sm={8}>
              <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>Latest News</Title>
              <List
                dataSource={popularArticles.slice(0, 3)}
                renderItem={(article) => (
                  <List.Item style={{ padding: '8px 0', border: 'none' }}>
                    <Link href={`/blog/${article.id}`} style={{ color: '#95a5a6', textDecoration: 'none', fontSize: 13 }}>
                      {article.title}
                    </Link>
                  </List.Item>
                )}
              />
            </Col>
          </Row>
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #34495e', textAlign: 'center' }}>
            <Text style={{ color: '#95a5a6', fontSize: 12 }}>
              COPYRIGHT © MAGZ 2024. ALL RIGHT RESERVED.
            </Text>
          </div>
        </div>
      </footer>
    </div>
  )
}

