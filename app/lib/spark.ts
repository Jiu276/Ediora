import { containsCJK } from '@/lib/language'

const API_KEY = process.env.SPARK_API_KEY
const API_BASE_URL = process.env.SPARK_API_BASE_URL || 'https://xh.v1api.cc'
const TIMEOUT = parseInt(process.env.SPARK_TIMEOUT || '60000', 10)

// 组装模型候选列表：优先主模型，其次备选，最后兼容旧变量
function getModelCandidates() {
  const primary =
    process.env.SPARK_PRIMARY_MODEL ||
    process.env.SPARK_API_MODEL || // 兼容旧配置
    'gemini-3.1-pro-preview'

  const fallbacks =
    (process.env.SPARK_FALLBACK_MODELS || '')
      .split(',')
      .map(m => m.trim())
      .filter(Boolean)

  const all = [primary, ...fallbacks]
  // 去重
  return Array.from(new Set(all))
}

function ensureApiKey() {
  if (!API_KEY) {
    throw new Error('SPARK_API_KEY is not configured')
  }
}

function buildTitlePrompt(userPrompt: string) {
  return `你是专业的文章标题生成助手。根据用户提示词生成 10 个高质量英文标题，并附上中文翻译（仅用于后台预览，不用于写入数据库）。

【用户提示词】
${userPrompt}

【输出要求】
1) 生成 exactly 10 个标题（不多不少），每个标题必须包含：
- title_en: English title（必须英文，不要出现中文字符）
- title_zh: 中文翻译（可中文）
- score: 0-1 的小数

2) 标题要求：
- 吸引人、有创意、符合 SEO
- 多样化，避免重复
- 标题长度建议 6-12 words（英文）

3) 输出格式：
- 只返回 JSON 对象，不要任何其他文字
- 不要 Markdown，不要代码块
- JSON 必须可解析

返回格式示例：
{
  "titles": [
    { "title_en": "English Title", "title_zh": "中文翻译", "score": 0.95 }
  ]
}
`
}

function buildArticlePrompt(title: string, userPrompt?: string, category?: string, domains?: string[]) {
  return `Write a high-quality English blog article and return ONLY valid JSON in this shape:
{
  "content": "<h2>...</h2><h3>...</h3><p>...</p>",
  "excerpt": "100-200 word English summary",
  "tags": ["tag1", "tag2", "tag3"]
}

Article title: ${title}
Category: ${category || 'General'}
Topics/domains: ${domains && domains.length > 0 ? domains.join(', ') : 'Not specified'}
Additional instructions: ${userPrompt || 'None'}

Requirements:
1. Structure: one h2 title, 3-5 h3 sections, paragraphs in p tags; optional ul/ol lists.
2. Length: 1500-3000 words in the body; excerpt 100-200 words.
3. Language: ENGLISH ONLY. Do not use Chinese, Japanese, or Korean characters anywhere in content, excerpt, or tags.
4. Tone: natural, human, practical; avoid generic filler and template phrasing.
5. SEO: weave keywords naturally; no keyword stuffing.
6. Output: return JSON only, no markdown fences or extra commentary.
`
}

function parseTitlesFromText(text: string) {
  const cleaned = text.replace(/```json|```/gi, '').trim()
  try {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0])
      if (Array.isArray(data.titles)) return data.titles
    }
  } catch {
    // ignore
  }

  // Extract title_zh/title_en pairs if present
  const pairMatches = Array.from(
    cleaned.matchAll(/"title_zh"\s*:\s*"([^"]+)"[\s\S]*?"title_en"\s*:\s*"([^"]+)"/gi)
  )
  if (pairMatches.length > 0) {
    return pairMatches.slice(0, 10).map((m) => ({
      title_zh: m[1].trim(),
      title_en: m[2].trim(),
      score: 0.9,
    }))
  }

  // Extract title_en only
  const enMatches = Array.from(cleaned.matchAll(/"title_en"\s*:\s*"([^"]+)"/gi))
  if (enMatches.length > 0) {
    return enMatches.slice(0, 10).map((m) => ({
      title_zh: '',
      title_en: m[1].trim(),
      score: 0.9,
    }))
  }

  // Line parsing (e.g. "Title 1", "- Title 2", etc.)
  const lines = cleaned.split('\n').filter(l => l.trim())
  const titles: Array<{ title_zh: string; title_en: string; score: number }> = []
  for (const line of lines) {
    // 过滤掉 JSON 结构行
    if (/"titles"|"title_zh"|"title_en"|"score"/.test(line)) continue
    if (/^\s*[\{\[\}]/.test(line)) continue

    const textLine = line.replace(/^\s*[-*\d\.\)]\s*/, '').trim()
    if (textLine.length > 5) {
      titles.push({ title_zh: '', title_en: textLine, score: 0.85 })
    }
    if (titles.length >= 10) break
  }
  if (titles.length === 0) {
    return Array.from({ length: 10 }, (_, i) => ({
      title_zh: '',
      title_en: `Option ${i + 1}: ${cleaned.substring(0, 40)}`.trim(),
      score: 0.8,
    }))
  }
  return titles
}

async function callChatCompletion(model: string, body: any, stream = false): Promise<Response> {
  ensureApiKey()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const res = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        stream,
        response_format: stream ? undefined : { type: 'json_object' },
        ...body,
      }),
      signal: controller.signal,
    })
    return res
  } finally {
    clearTimeout(timer)
  }
}

export async function generateTitles(
  prompt: string
): Promise<Array<{ title_zh: string; title_en: string; score: number }>> {
  const models = getModelCandidates()
  let lastError: any = null

  for (const model of models) {
    try {
      const res = await callChatCompletion(model, {
        messages: [
          {
            role: 'system',
            content:
              'You are a professional title generator. Return valid JSON only. title_en must be English only (no CJK). title_zh is optional Chinese translation for admin preview only.',
          },
          { role: 'user', content: buildTitlePrompt(prompt) },
        ],
        temperature: 0.8,
        max_tokens: 2048,
      })

      if (!res.ok) {
        const text = await res.text()
        lastError = new Error(`Spark API error: ${res.status} ${text}`)
        continue
      }

      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content || ''
      console.log(`[${model}] AI返回内容:`, content.substring(0, 500)) // 调试日志
      const parsed = parseTitlesFromText(content)
      const titles = (Array.isArray(parsed) ? parsed : []).map((t: any) => ({
        title_zh: (t.title_zh || '').trim(),
        title_en: (t.title_en || t.title || '').trim(),
        score: typeof t.score === 'number' ? t.score : 0.9,
      }))
      // 过滤占位标题
      const validTitles = titles.filter((t: { title_zh: string; title_en: string; score: number }) => {
        const en = (t.title_en || '').trim()
        const isPlaceholder = /^title\s*\d+$/i.test(en)
        return !isPlaceholder
      })
      if (validTitles.length > 0) {
        const unique = Array.from(new Set(validTitles.map(t => t.title_en)))
          .map((title_en) => validTitles.find(t => t.title_en === title_en)!)
          .slice(0, 10)

        // Ensure always 10 titles for UI expectations
        const padded = [...unique]
        let i = 1
        while (padded.length < 10) {
          padded.push({
            title_zh: '',
            title_en: `${prompt.replace(/\s+/g, ' ').trim()} - Option ${i++}`.slice(0, 80),
            score: 0.8,
          })
        }

        console.log(`[${model}] Parsed ${padded.length} English titles`)
        return padded
      }
      console.warn(`[${model}] 解析结果全是占位标题，尝试下一个模型`)
    } catch (err) {
      lastError = err
      continue
    }
  }

  if (lastError) throw lastError
  return []
}

export async function generateTitlesStream(
  prompt: string
): Promise<Array<{ title_zh: string; title_en: string; score: number }>> {
  // 直接使用非流式生成，返回标题数组，路由层按需推流
  const titles = await generateTitles(prompt)
  return titles.slice(0, 10)
}

export async function generateArticle(params: {
  title: string
  userPrompt?: string
  category?: string
  domains?: string[]
}) {
  const { title, userPrompt, category, domains } = params
  const models = getModelCandidates()
  let lastError: any = null

  for (const model of models) {
    try {
      const res = await callChatCompletion(model, {
        messages: [
          {
            role: 'system',
            content:
              'You are a professional English content writer. Output English-only HTML article JSON. Never use Chinese characters.',
          },
          { role: 'user', content: buildArticlePrompt(title, userPrompt, category, domains) },
        ],
        temperature: 0.8,
        max_tokens: 4096,
      })

      if (!res.ok) {
        const text = await res.text()
        lastError = new Error(`Spark API error: ${res.status} ${text}`)
        continue
      }

      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content || ''
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content)
        let articleContent = String(parsed.content || '').trim()
        // 偶发双层 JSON 字符串
        if (articleContent.startsWith('{') && articleContent.includes('"content"')) {
          try {
            const inner = JSON.parse(articleContent)
            if (inner?.content) articleContent = String(inner.content).trim()
          } catch {
            // ignore
          }
        }
        const plainLen = articleContent.replace(/<[^>]*>/g, '').trim().length
        if (plainLen < 150) {
          console.warn(`[${model}] 正文过短(${plainLen}字)，尝试下一个模型`)
          continue
        }
        const result = {
          content: articleContent,
          excerpt: parsed.excerpt || '',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        }
        if (
          containsCJK(result.content) ||
          containsCJK(result.excerpt) ||
          containsCJK(result.tags)
        ) {
          console.warn(`[${model}] 正文含非英文字符，尝试下一个模型`)
          lastError = new Error('Model returned non-English content')
          continue
        }
        return result
      } catch {
        const wrapped = content || `<h2>${title}</h2><p>${content}</p>`
        if (containsCJK(wrapped)) {
          lastError = new Error('Model returned non-English content')
          continue
        }
        return {
          content: wrapped,
          excerpt: content.slice(0, 200),
          tags: [],
        }
      }
    } catch (err) {
      lastError = err
      continue
    }
  }

  if (lastError) throw lastError
  return {
    content: `<h2>${title}</h2><p>Content generation failed. Please try again.</p>`,
    excerpt: '',
    tags: [],
  }
}

