import { NextRequest } from 'next/server'
import { generateTitlesStream } from '@/lib/spark'

// 添加详细的错误日志

/**
 * GET /api/generate-titles/stream - 流式生成标题（SSE）
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const prompt = searchParams.get('prompt')

  if (!prompt) {
    return new Response('Missing prompt parameter', { status: 400 })
  }

  // 非流式生成，再按 SSE 逐条推送，避免解析问题
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'start', message: '开始生成标题...' })}\n\n`)
        )

        const titles = await generateTitlesStream(prompt)
        const total = titles.length

        titles.forEach((t, idx) => {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'title',
                data: {
                  index: idx + 1,
                  title: t.title_en || '',
                  title_zh: t.title_zh || '',
                  title_en: t.title_en || '',
                  score: t.score,
                },
              })}\n\n`
            )
          )
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'progress',
                data: {
                  current: idx + 1,
                  total,
                  percentage: Math.round(((idx + 1) / total) * 100),
                },
              })}\n\n`
            )
          )
        })

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'complete', data: { total } })}\n\n`)
        )
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'end', message: '生成完成' })}\n\n`)
        )
      } catch (error) {
        console.error('Stream generation error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorDetails = error instanceof Error ? error.stack : String(error)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ 
              type: 'error', 
              data: { 
                message: errorMessage,
                details: errorDetails,
                hint: '请检查：1) API Key 是否正确 2) 模型名称是否正确 3) 网络连接是否正常',
              },
            })}\n\n`
          )
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

