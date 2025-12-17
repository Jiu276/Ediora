import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/article-titles - 获取所有文章标题
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const excludeUsed = searchParams.get('excludeUsed') === 'true'

    // 检查 Prisma Client 是否可用
    if (!prisma || !prisma.articleTitle) {
      console.warn('Prisma Client not initialized or ArticleTitle model not found')
      return NextResponse.json([])
    }

    let articleTitles = await prisma.articleTitle.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 过滤已被文章使用的标题
    if (excludeUsed) {
      const usedTitles = await prisma.article.findMany({
        where: { deletedAt: null },
        select: { titleId: true },
      })
      const usedSet = new Set(usedTitles.map(u => u.titleId))
      articleTitles = articleTitles.filter(t => !usedSet.has(t.id))
    }
    
    // 确保返回数组
    return NextResponse.json(Array.isArray(articleTitles) ? articleTitles : [])
  } catch (error: any) {
    console.error('Error fetching article titles:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
    })
    
    // 如果是表不存在的错误，返回空数组而不是错误
    if (
      error.code === 'P2021' || 
      error.code === 'P1001' ||
      error.message?.includes('does not exist') ||
      error.message?.includes('Unknown table') ||
      error.message?.includes('Table') ||
      error.message?.includes('model') ||
      error.message?.includes('ArticleTitle')
    ) {
      console.warn('Article titles table does not exist yet or Prisma Client not generated, returning empty array')
      return NextResponse.json([])
    }
    
    // 对于其他错误，也返回空数组，避免前端崩溃
    console.warn('Returning empty array due to error:', error.message)
    return NextResponse.json([])
  }
}

// POST /api/article-titles - 创建文章标题
export async function POST(request: NextRequest) {
  try {
    // 检查 Prisma Client 是否可用
    if (!prisma || !prisma.articleTitle) {
      return NextResponse.json(
        { error: 'Database not initialized. Please run: npm run db:generate && npm run db:push' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { name, slug, description } = body
    
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }
    
    const articleTitle = await prisma.articleTitle.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    })
    
    return NextResponse.json(articleTitle, { status: 201 })
  } catch (error: any) {
    console.error('Error creating article title:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
    })
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      )
    }
    
    // 如果是表不存在的错误
    if (
      error.code === 'P2021' || 
      error.code === 'P1001' ||
      error.message?.includes('does not exist') ||
      error.message?.includes('Unknown table')
    ) {
      return NextResponse.json(
        { error: 'Database table does not exist. Please run: npm run db:push' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create article title', details: error.message },
      { status: 500 }
    )
  }
}

