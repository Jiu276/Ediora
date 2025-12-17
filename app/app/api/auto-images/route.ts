import { NextRequest, NextResponse } from 'next/server'

// POST /api/auto-images - 生成配图建议（模拟）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title } = body
    
    // 使用可重复的 seed，让同一篇文章生成的图片保持稳定
    const seedBase = encodeURIComponent(title || 'edorian-article')
    
    const images = Array.from({ length: 5 }, (_, i) => {
      const seed = `${seedBase}-${i + 1}`
      return {
        id: `img-${i + 1}`,
        url: `https://picsum.photos/seed/${seed}/800/600`,
        thumbnail: `https://picsum.photos/seed/${seed}/400/300`,
        description: `配图 ${i + 1} - ${title}`,
        source: 'Unsplash',
      }
    })
    
    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error generating images:', error)
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    )
  }
}

