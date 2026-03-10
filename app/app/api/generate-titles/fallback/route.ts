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
      `${prompt}: A Complete Guide`,
      `How to ${prompt}: Practical Tips`,
      `10 Key Takeaways About ${prompt}`,
      `Deep Dive: ${prompt}`,
      `${prompt}: From Beginner to Pro`,
      `Everything You Need to Know About ${prompt}`,
      `${prompt}: Best Practices`,
      `Mastering ${prompt}: Core Principles`,
      `${prompt}: Professional Insights`,
      `${prompt}: A Practical Playbook`,
    ]

    const titles = templates.map((title, index) => ({
      id: `fallback-${Date.now()}-${index + 1}`,
      title: title,
      score: Math.floor(Math.random() * 15) + 75, // 75-90
    }))

    return NextResponse.json({ 
      titles,
      source: 'fallback', // 标记为降级方案
      message: 'AI API unavailable; used fallback templates.'
    })
  } catch (error) {
    console.error('Error in fallback generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate titles' },
      { status: 500 }
    )
  }
}

