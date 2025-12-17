import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    
    return NextResponse.json(createdLinks, { status: 201 })
  } catch (error) {
    console.error('Error creating links:', error)
    return NextResponse.json(
      { error: 'Failed to create links' },
      { status: 500 }
    )
  }
}

