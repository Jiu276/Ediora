import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 获取所有已发布文章使用的标签
    const articles = await prisma.article.findMany({
      where: {
        status: 'published',
        deletedAt: null,
      },
      select: {
        id: true,
      },
    })

    const articleIds = articles.map((a) => a.id)

    // 获取文章标签关联
    const articleTags = articleIds.length > 0
      ? await prisma.articleTag.findMany({
          where: {
            articleId: { in: articleIds },
          },
          select: {
            tagId: true,
          },
        })
      : []

    const tagIds = [...new Set(articleTags.map((at) => at.tagId))]

    // 获取标签信息
    const tags = tagIds.length > 0
      ? await prisma.tag.findMany({
          where: {
            id: { in: tagIds },
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        })
      : []

    // 统计每个标签的使用次数
    const tagCounts = new Map<string, number>()
    articleTags.forEach((at) => {
      tagCounts.set(at.tagId, (tagCounts.get(at.tagId) || 0) + 1)
    })

    // 添加使用次数并排序
    const tagsWithCount = tags
      .map((tag) => ({
        ...tag,
        count: tagCounts.get(tag.id) || 0,
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json(tagsWithCount)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: '获取标签失败' }, { status: 500 })
  }
}

