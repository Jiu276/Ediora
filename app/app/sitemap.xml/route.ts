import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 防止在 `next build` 阶段尝试静态预渲染导致卡住（构建时会访问数据库）
export const dynamic = 'force-dynamic'
export const revalidate = 0

// 生成 sitemap.xml
export async function GET() {
  try {
    // 获取所有已发布的文章
    const articles = await prisma.article.findMany({
      where: {
        status: 'published',
        deletedAt: null,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // 获取基础URL（可以从环境变量获取）
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:50812'

    // 生成 sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/archive</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${articles
    .map(
      (article) => `  <url>
    <loc>${baseUrl}/blog/${article.slug}</loc>
    <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}


