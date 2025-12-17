import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/articles/[id]/versions - 获取文章的所有版本
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const versions = await prisma.articleVersion.findMany({
      where: {
        articleId: params.id,
        deletedAt: null,
      },
      orderBy: {
        version: 'desc', // 最新版本在前
      },
    })
    
    return NextResponse.json(versions)
  } catch (error) {
    console.error('Error fetching article versions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article versions' },
      { status: 500 }
    )
  }
}

// POST /api/articles/[id]/versions - 创建文章版本快照
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 获取当前文章
    const article = await prisma.article.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    })
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }
    
    // 获取当前最大版本号
    const latestVersion = await prisma.articleVersion.findFirst({
      where: {
        articleId: params.id,
        deletedAt: null,
      },
      orderBy: {
        version: 'desc',
      },
    })
    
    const nextVersion = (latestVersion?.version || 0) + 1
    
    // 创建新版本
    const version = await prisma.articleVersion.create({
      data: {
        articleId: params.id,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        version: nextVersion,
      },
    })
    
    return NextResponse.json(version, { status: 201 })
  } catch (error) {
    console.error('Error creating article version:', error)
    return NextResponse.json(
      { error: 'Failed to create article version' },
      { status: 500 }
    )
  }
}


