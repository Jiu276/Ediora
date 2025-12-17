import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/articles/[id]/views - 增加文章阅读量
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 使用 increment 原子操作增加阅读量
    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        viewCount: true,
      },
    })
    
    return NextResponse.json({
      id: article.id,
      viewCount: article.viewCount,
    })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    )
  }
}

// GET /api/articles/[id]/views - 获取文章阅读量
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
      select: {
        id: true,
        viewCount: true,
      },
    })
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      id: article.id,
      viewCount: article.viewCount,
    })
  } catch (error) {
    console.error('Error fetching view count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch view count' },
      { status: 500 }
    )
  }
}


