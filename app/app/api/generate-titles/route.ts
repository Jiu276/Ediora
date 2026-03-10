import { NextRequest, NextResponse } from 'next/server'
import { generateTitles } from '@/lib/spark'

// POST /api/generate-titles - 生成标题（星火API）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: '请输入提示词' }, { status: 400 })
    }

    // Titles can include Chinese translations for admin preview,
    // but saving to DB is still English-only (enforced at write endpoints).
    const titles = await generateTitles(prompt.trim())

    // 兜底：如果未解析到有效标题，基于提示词生成10个简单变体
    const safeTitles =
      Array.isArray(titles) && titles.length > 0
        ? titles
        : Array.from({ length: 10 }, (_, i) => ({
            title_zh: `${prompt.trim()} - 方案${i + 1}`,
            title_en: `${prompt.trim()} - Option ${i + 1}`,
            score: 0.8,
          }))
    // 增加 id 和 score 兼容前端
    const enriched = safeTitles.map((t: any, idx: number) => ({
      id: t.id || `title-${Date.now()}-${idx + 1}`,
      title: t.title_en || t.title || '',
      title_zh: t.title_zh || '',
      title_en: t.title_en || t.title || '',
      score: Math.round((t.score || 0.9) * 100),
    }))
    
    return NextResponse.json({ titles: enriched })
  } catch (error) {
    console.error('Error generating titles:', error)
    return NextResponse.json(
      { error: 'Failed to generate titles' },
      { status: 500 }
    )
  }
}

