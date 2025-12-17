import { NextResponse } from 'next/server'
import { checkAndPublishScheduledArticles } from '@/lib/scheduler'

// GET /api/scheduler/publish - 手动触发定时发布任务（用于测试）
// 在生产环境中，这个端点应该被定时任务调用（如 cron job）
export async function GET() {
  try {
    const result = await checkAndPublishScheduledArticles()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('定时发布任务失败:', error)
    return NextResponse.json(
      { error: '定时发布任务失败', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/scheduler/publish - 手动触发定时发布任务
export async function POST() {
  try {
    const result = await checkAndPublishScheduledArticles()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('定时发布任务失败:', error)
    return NextResponse.json(
      { error: '定时发布任务失败', details: error.message },
      { status: 500 }
    )
  }
}


