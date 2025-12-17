import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/article-titles/[id] - 获取单个文章标题
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleTitle = await prisma.articleTitle.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    })
    
    if (!articleTitle) {
      return NextResponse.json(
        { error: 'Article title not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(articleTitle)
  } catch (error) {
    console.error('Error fetching article title:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article title' },
      { status: 500 }
    )
  }
}

// PUT /api/article-titles/[id] - 更新文章标题
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, slug, description } = body
    
    const articleTitle = await prisma.articleTitle.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
      },
    })
    
    return NextResponse.json(articleTitle)
  } catch (error: any) {
    console.error('Error updating article title:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update article title' },
      { status: 500 }
    )
  }
}

// DELETE /api/article-titles/[id] - 软删除文章标题
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleTitle = await prisma.articleTitle.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
      },
    })
    
    return NextResponse.json(articleTitle)
  } catch (error) {
    console.error('Error deleting article title:', error)
    return NextResponse.json(
      { error: 'Failed to delete article title' },
      { status: 500 }
    )
  }
}

