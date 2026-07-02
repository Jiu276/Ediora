import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  findOverlongArticleLink,
  MAX_ARTICLE_LINK_URL_LENGTH,
  normalizeArticleLinkUrl,
} from '@/lib/articleLinkLimits'

// GET /api/articles/[id]/links - 获取文章的超链接
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const links = await prisma.articleLink.findMany({
      where: {
        articleId: params.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json(links)
  } catch (error) {
    console.error('Error fetching links:', error)
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    )
  }
}

// POST /api/articles/[id]/links - 批量创建文章的超链接
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { links } = body // links 是 { keyword: string, url: string }[] 数组
    
    if (!Array.isArray(links)) {
      return NextResponse.json(
        { error: 'Links must be an array' },
        { status: 400 }
      )
    }

    const overlong = findOverlongArticleLink(links)
    if (overlong) {
      return NextResponse.json(
        {
          error: `链接 URL 过长：关键词「${overlong.keyword}」为 ${overlong.length} 字符，最多 ${MAX_ARTICLE_LINK_URL_LENGTH} 字符`,
        },
        { status: 400 },
      )
    }
    
    // 先删除该文章的所有现有链接（软删除）
    await prisma.articleLink.updateMany({
      where: {
        articleId: params.id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })
    
    // 创建新的链接记录
    const createdLinks = await Promise.all(
      links.map((link: { keyword: string; url: string }) =>
        prisma.articleLink.create({
          data: {
            articleId: params.id,
            keyword: link.keyword.trim(),
            url: normalizeArticleLinkUrl(link.url),
          },
        })
      )
    )

    // 关键词链接仅存 articleLink 表，展示时在 slug API 动态注入，避免污染正文 HTML

    return NextResponse.json(createdLinks, { status: 201 })
  } catch (error) {
    console.error('Error creating links:', error)
    const message = (error as { message?: string })?.message || ''
    if (/Data too long|value too long|P2000/i.test(message)) {
      return NextResponse.json(
        {
          error: `链接 URL 过长，请确认数据库已执行 scripts/migrate-article-link-url-2000.sql（上限 ${MAX_ARTICLE_LINK_URL_LENGTH} 字符）`,
        },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: 'Failed to create links', details: message || String(error) },
      { status: 500 }
    )
  }
}

