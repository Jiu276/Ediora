
const API_KEY = process.env.SPARK_API_KEY
const API_BASE_URL = process.env.SPARK_API_BASE_URL || 'https://xh.v1api.cc'
const TIMEOUT = parseInt(process.env.SPARK_TIMEOUT || '60000', 10)

// 组装模型候选列表：优先主模型，其次备选，最后兼容旧变量
function getModelCandidates() {
  const primary =
    process.env.SPARK_PRIMARY_MODEL ||
    process.env.SPARK_API_MODEL || // 兼容旧配置
    'gemini-3-pro-preview'

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
  return `You are a professional content writer. Generate a high-quality, well-structured article in JSON:
{
  "content": "完整的HTML文章内容",
  "excerpt": "文章摘要，100-200字，吸引人且概括全文要点",
  "tags": ["标签1", "标签2", "标签3"]
}

【文章信息】
标题：${title}
分类：${category || '通用'}
领域：${domains && domains.length > 0 ? domains.join('、') : '未指定'}
用户补充提示：${userPrompt || '无'}

【内容要求】
1. 结构：h2 作为主标题；3-5 个 h3 章节；段落用 p 标签；可用 ul/ol
2. 长度：正文 1500-3000 字；摘要 100-200 字
3. Language: default to English for content unless the user prompt explicitly requests Chinese; keep natural tone with real human touch.
4. SEO：自然融入关键词，避免堆砌
5. 输出必须是 JSON，且只输出 JSON
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
          { role: 'system', content: '你是一个专业的标题生成助手。你必须只返回有效的JSON对象，不要任何其他文字、Markdown、代码块或解释。' },
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
          { role: 'system', content: '你是一个专业的双语内容创作者，默认输出英文正文，仅返回JSON。' },
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
        return {
          content: parsed.content || '',
          excerpt: parsed.excerpt || '',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        }
      } catch {
        // 解析失败，返回纯文本
        return {
          content: content || `<h2>${title}</h2><p>${content}</p>`,
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
    content: `<h2>${title}</h2><p>生成失败，使用占位内容。</p>`,
    excerpt: '',
    tags: [],
  }
}

