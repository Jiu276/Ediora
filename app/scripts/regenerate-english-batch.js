/**
 * 批量将含中文（CJK）的文章重新生成为英文正文。
 * 用法（在 app 目录）:
 *   node scripts/regenerate-english-batch.js
 * 环境变量:
 *   BASE_URL  默认 http://localhost:27601
 *   DRY_RUN=1 仅列出待处理文章，不写库
 */
const { PrismaClient } = require('@prisma/client')
const { rehydrateOne } = require('./lib/rehydrateOne')

const REHYDRATE_IMAGES = process.env.REHYDRATE_IMAGES !== '0'
const FORCE_FALLBACK = process.env.FORCE_FALLBACK === '1'
const MIN_PLAIN = Number(process.env.MIN_ARTICLE_PLAIN_CHARS || 5500)

const LENGTH_PROMPT =
  'Length: medium-to-long, about 1200-2000 words in the body (minimum ~900 words, 5500+ characters). Use 5-6 h3 sections with 2-3 paragraphs each.'

const CJK_RE = /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\uAC00-\uD7AF]/

function hasCJK(article) {
  const blob = `${article.title || ''}\n${article.content || ''}\n${article.excerpt || ''}`
  return CJK_RE.test(blob)
}

async function regenerateOne(baseUrl, article) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 180000)

  const genRes = await fetch(`${baseUrl}/api/generate-article`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: article.title,
      categoryId: article.categoryId,
      domains: [],
      forceFallback: FORCE_FALLBACK,
      prompt: LENGTH_PROMPT,
    }),
    signal: controller.signal,
  })
  clearTimeout(timer)

  if (!genRes.ok) {
    throw new Error(`generate failed ${genRes.status}: ${await genRes.text()}`)
  }

  const data = await genRes.json()
  if (!data?.content || CJK_RE.test(data.content) || CJK_RE.test(data.excerpt || '')) {
    throw new Error('generate returned non-English content')
  }

  const plainLen = String(data.content).replace(/<[^>]*>/g, '').trim().length
  if (plainLen < MIN_PLAIN) {
    throw new Error(`generate returned short content (${plainLen} chars, need >= ${MIN_PLAIN})`)
  }

  const putRes = await fetch(`${baseUrl}/api/articles/${article.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: article.title,
      content: data.content,
      excerpt: data.excerpt || '',
    }),
  })

  if (!putRes.ok) {
    throw new Error(`PUT failed ${putRes.status}: ${await putRes.text()}`)
  }

  if (REHYDRATE_IMAGES) {
    await rehydrateOne(baseUrl, {
      id: article.id,
      title: article.title,
      content: data.content,
      excerpt: data.excerpt || '',
    })
  }
}

async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:27601'
  const dryRun = process.env.DRY_RUN === '1'
  const prisma = new PrismaClient()

  try {
    const all = await prisma.article.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true, categoryId: true, content: true, excerpt: true },
    })

    const targets = all.filter(hasCJK)
    console.log(`Found ${targets.length} article(s) with CJK (of ${all.length} total)`)

    if (targets.length === 0) return

    for (const article of targets) {
      console.log(`- ${article.id} | ${article.title}`)
    }

    if (dryRun) {
      console.log('DRY_RUN=1, skipped updates')
      return
    }

    let ok = 0
    let fail = 0
    for (const article of targets) {
      try {
        await regenerateOne(baseUrl, article)
        ok++
        console.log(`[ok] ${article.title}`)
      } catch (e) {
        fail++
        console.error(`[fail] ${article.title}:`, e?.message || e)
      }
    }

    console.log(`Done. success=${ok}, failed=${fail}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
