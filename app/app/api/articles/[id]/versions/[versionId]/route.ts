import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/articles/[id]/versions/[versionId] - 获取特定版本
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const version = await prisma.articleVersion.findFirst({
      where: {
        id: params.versionId,
        articleId: params.id,
        deletedAt: null,
      },
    })
    
    if (!version) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(version)
  } catch (error) {
    console.error('Error fetching article version:', error)
    return NextResponse.json(
      { error: 'Failed to fetch article version' },
      { status: 500 }
    )
  }
}

// POST /api/articles/[id]/versions/[versionId]/restore - 恢复到指定版本
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    // 获取要恢复的版本
    const version = await prisma.articleVersion.findFirst({
      where: {
        id: params.versionId,
        articleId: params.id,
        deletedAt: null,
      },
    })
    
    if (!version) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      )
    }
    
    // 在恢复前，先创建当前版本的快照
    const currentArticle = await prisma.article.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    })
    
    if (currentArticle) {
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
      
      await prisma.articleVersion.create({
        data: {
          articleId: params.id,
          title: currentArticle.title,
          content: currentArticle.content,
          excerpt: currentArticle.excerpt,
          version: nextVersion,
        },
      })
    }
    
    // 恢复文章内容
    const restoredArticle = await prisma.article.update({
      where: { id: params.id },
      data: {
        title: version.title,
        content: version.content,
        excerpt: version.excerpt,
      },
    })
    
    return NextResponse.json({
      message: '版本恢复成功',
      article: restoredArticle,
      restoredFrom: version,
    })
  } catch (error) {
    console.error('Error restoring article version:', error)
    return NextResponse.json(
      { error: 'Failed to restore article version' },
      { status: 500 }
    )
  }
}


