// 定时发布任务调度器
// 使用 Next.js API Routes 实现定时任务

import { prisma } from './prisma'

/**
 * 检查并发布到期的文章
 * 这个函数应该被定时调用（例如每分钟或每5分钟）
 */
export async function checkAndPublishScheduledArticles() {
  try {
    const now = new Date()
    
    // 查找所有状态为草稿，但发布日期已到的文章
    const articlesToPublish = await prisma.article.findMany({
      where: {
        status: 'draft',
        publishDate: {
          lte: now, // 发布日期小于等于当前时间
        },
        deletedAt: null,
      },
    })
    
    if (articlesToPublish.length === 0) {
      return { published: 0, message: '没有需要发布的文章' }
    }
    
    // 批量更新文章状态为已发布
    const updatePromises = articlesToPublish.map(article =>
      prisma.article.update({
        where: { id: article.id },
        data: { status: 'published' },
      })
    )
    
    await Promise.all(updatePromises)
    
    return {
      published: articlesToPublish.length,
      message: `成功发布 ${articlesToPublish.length} 篇文章`,
      articles: articlesToPublish.map(a => ({ id: a.id, title: a.title })),
    }
  } catch (error) {
    console.error('定时发布任务错误:', error)
    throw error
  }
}


