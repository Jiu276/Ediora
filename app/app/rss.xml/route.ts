import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 生成 RSS Feed
export async function GET() {
  try {
    // 获取最近20篇已发布的文章
    const articles = await prisma.article.findMany({
      where: {
        status: 'published',
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        author: true,
        publishDate: true,
        updatedAt: true,
      },
      orderBy: {
        publishDate: 'desc',
      },
      take: 20,
    })

    // 获取基础URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:50812'
    const siteName = 'Ediora'
    const siteDescription = 'Ediora 博客文章发布管理系统'

    // 生成 RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${baseUrl}</link>
    <description>${siteDescription}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${articles
      .map((article) => {
        const pubDate = article.publishDate
          ? new Date(article.publishDate).toUTCString()
          : new Date(article.updatedAt).toUTCString()
        const description = article.excerpt || article.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
        const content = article.content.replace(/<[^>]*>/g, '').substring(0, 500) + '...'
        
        return `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/blog/${article.slug}</link>
      <guid>${baseUrl}/blog/${article.slug}</guid>
      <description><![CDATA[${description}]]></description>
      <content:encoded xmlns:content="http://purl.org/rss/1.0/modules/content/"><![CDATA[${content}]]></content:encoded>
      <author>${article.author}</author>
      <pubDate>${pubDate}</pubDate>
    </item>`
      })
      .join('\n')}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}


