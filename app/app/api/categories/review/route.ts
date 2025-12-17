import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/categories/review - 获取需要审核的标签
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        needsReview: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories for review:', error)
    return NextResponse.json({ error: '获取待审核标签失败' }, { status: 500 })
  }
}

/**
 * POST /api/categories/review - 审核标签（批准/拒绝）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, action, mergeWithId } = body

    if (!categoryId || !action) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        deletedAt: null,
      },
    })

    if (!category) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 })
    }

    if (action === 'approve') {
      // 批准：移除待审核标记
      await prisma.category.update({
        where: { id: categoryId },
        data: {
          needsReview: false,
          autoCreated: false, // 批准后不再标记为自动创建
        },
      })

      return NextResponse.json({ message: '标签已批准', category })
    } else if (action === 'reject') {
      // 拒绝：软删除
      await prisma.category.update({
        where: { id: categoryId },
        data: {
          deletedAt: new Date(),
        },
      })

      return NextResponse.json({ message: '标签已拒绝并删除' })
    } else if (action === 'merge' && mergeWithId) {
      // 合并：将当前标签合并到目标标签，然后删除当前标签
      const targetCategory = await prisma.category.findFirst({
        where: {
          id: mergeWithId,
          deletedAt: null,
        },
      })

      if (!targetCategory) {
        return NextResponse.json({ error: '目标标签不存在' }, { status: 404 })
      }

      // 更新所有使用当前标签的文章，改为使用目标标签
      const articles = await prisma.article.findMany({
        where: {
          categoryId: categoryId,
          deletedAt: null,
        },
      })

      for (const article of articles) {
        await prisma.article.update({
          where: { id: article.id },
          data: { categoryId: mergeWithId },
        })
      }

      // 更新文章标签关联
      await prisma.articleTag.updateMany({
        where: {
          tag: category.name,
        },
        data: {
          tag: targetCategory.name,
        },
      })

      // 删除当前标签
      await prisma.category.update({
        where: { id: categoryId },
        data: {
          deletedAt: new Date(),
        },
      })

      return NextResponse.json({ message: '标签已合并', targetCategory })
    } else {
      return NextResponse.json({ error: '无效的操作' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error reviewing category:', error)
    return NextResponse.json({ error: '审核标签失败' }, { status: 500 })
  }
}

