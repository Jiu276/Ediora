import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function injectKeywordLinksIntoHtml(
  html: string,
  links: Array<{ keyword: string; url: string }>
) {
  if (!html || !Array.isArray(links) || links.length === 0) return html

  const safeLinks = links
    .map((l) => ({
      keyword: String(l.keyword || '').trim(),
      url: String(l.url || '').trim(),
    }))
    .filter((l) => l.keyword && l.url)

  if (safeLinks.length === 0) return html

  const blockRegex = /<(p|h1|h2|h3|h4|h5|h6|figcaption)([^>]*)>([\s\S]*?)<\/\1>/gi

  return html.replace(blockRegex, (match, tag, attrs, inner) => {
    let updated = inner
    for (const link of safeLinks) {
      const re = new RegExp(`\\b${escapeRegExp(link.keyword)}\\b`, 'g')
      updated = updated.replace(
        re,
        `<a href="${link.url}" target="_blank" rel="nofollow noopener noreferrer">${link.keyword}</a>`
      )
    }
    return `<${tag}${attrs}>${updated}</${tag}>`
  })
}

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
            url: link.url.trim(),
          },
        })
      )
    )

    // 如果文章启用了关键字自动超链接，则更新文章内容中的链接
    const article = await prisma.article.findFirst({
      where: { id: params.id, deletedAt: null },
    })

    if (article && article.enableKeywordLinks) {
      const newContent = injectKeywordLinksIntoHtml(article.content || '', links)
      if (newContent !== article.content) {
        await prisma.article.update({
          where: { id: params.id },
          data: { content: newContent },
        })
      }
    }

    return NextResponse.json(createdLinks, { status: 201 })
  } catch (error) {
    console.error('Error creating links:', error)
    return NextResponse.json(
      { error: 'Failed to create links' },
      { status: 500 }
    )
  }
}

