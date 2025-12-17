import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/articles/[id]/images - 获取文章的配图
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const images = await prisma.articleImage.findMany({
      where: {
        articleId: params.id,
        deletedAt: null,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })
    
    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}

// POST /api/articles/[id]/images - 批量创建文章的配图
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { images } = body // images 是图片对象数组
    
    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Images must be an array' },
        { status: 400 }
      )
    }
    
    // 先删除该文章的所有现有图片（软删除）
    await prisma.articleImage.updateMany({
      where: {
        articleId: params.id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })
    
    // 创建新的图片记录
    const createdImages = await Promise.all(
      images.map((image: any, index: number) =>
        prisma.articleImage.create({
          data: {
            articleId: params.id,
            url: image.url || '',
            thumbnail: image.thumbnail || image.url || '',
            description: image.description || null,
            source: image.source || null,
            sortOrder: index,
          },
        })
      )
    )
    
    return NextResponse.json(createdImages, { status: 201 })
  } catch (error) {
    console.error('Error creating images:', error)
    return NextResponse.json(
      { error: 'Failed to create images' },
      { status: 500 }
    )
  }
}

