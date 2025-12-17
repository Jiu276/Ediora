import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/article-titles/batch - 批量保存生成的标题到数据库
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { titles } = body // titles: [{ title, score, description? }]

    if (!Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json(
        { error: 'Titles array is required' },
        { status: 400 }
      )
    }

    // 检查 Prisma Client 是否可用
    if (!prisma || !prisma.articleTitle) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 503 }
      )
    }

    const savedTitles = []
    const errors = []

    // 简单 slug 生成 + 兜底（处理中文或全符号导致 slug 为空的情况）
    const makeSlug = (title: string) => {
      const base = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 100)

      // 如果 slug 为空，用随机值兜底，避免唯一约束冲突
      if (!base) {
        return `title-${Math.random().toString(36).slice(2, 8)}`
      }
      return base
    }

    const generateUniqueSlug = async (title: string) => {
      let slug = makeSlug(title)
      let attempt = 0
      while (attempt < 5) {
        const existing = await prisma.articleTitle.findFirst({
          where: { slug, deletedAt: null },
        })
        if (!existing) return slug
        slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
        attempt++
      }
      return `${slug}-${Date.now()}`
    }

    for (const titleData of titles) {
      try {
        const slug = await generateUniqueSlug(titleData.title)

        // 再次检查是否存在（防止并发冲突）
        const existing = await prisma.articleTitle.findFirst({
          where: {
            slug,
            deletedAt: null,
          },
        })

        if (existing) {
          savedTitles.push(existing)
          continue
        }

        const articleTitle = await prisma.articleTitle.create({
          data: {
            name: titleData.title,
            slug,
            description: titleData.description || `推荐度: ${titleData.score}%`,
          },
        })

        savedTitles.push(articleTitle)
      } catch (error: any) {
        console.error(`Error saving title "${titleData.title}":`, error)
        errors.push({
          title: titleData.title,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      saved: savedTitles.length,
      total: titles.length,
      titles: savedTitles,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Error batch saving titles:', error)
    return NextResponse.json(
      { error: 'Failed to save titles', details: error.message },
      { status: 500 }
    )
  }
}

