import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/generate-titles/fallback - 降级方案：使用模板生成标题
 * 当 AI API 失败时使用
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    // 简单的模板生成（作为降级方案）
    const templates = [
      `${prompt}：完整指南`,
      `如何${prompt}：实用技巧分享`,
      `${prompt}的10个关键要点`,
      `深度解析：${prompt}`,
      `${prompt}：从入门到精通`,
      `关于${prompt}的全面解析`,
      `${prompt}：最佳实践指南`,
      `掌握${prompt}的核心方法`,
      `${prompt}：专业分析与建议`,
      `${prompt}：实用操作手册`,
    ]

    const titles = templates.map((title, index) => ({
      id: `fallback-${Date.now()}-${index + 1}`,
      title: title,
      score: Math.floor(Math.random() * 15) + 75, // 75-90
    }))

    return NextResponse.json({ 
      titles,
      source: 'fallback', // 标记为降级方案
      message: 'AI API 不可用，已使用模板生成'
    })
  } catch (error) {
    console.error('Error in fallback generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate titles' },
      { status: 500 }
    )
  }
}

