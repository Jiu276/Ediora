/**
 * 将正文过短的文章重新生成为中等偏长英文（默认走星火，失败则用加长回退模板）。
 * 用法:
 *   BASE_URL=http://127.0.0.1:50813 node scripts/regenerate-short-articles.js
 *   BASE_URL=... node scripts/regenerate-short-articles.js <articleId>
 *   MIN_ARTICLE_PLAIN_CHARS=900  最短纯文本字符数
 */
const { PrismaClient } = require('@prisma/client')
const { rehydrateOne } = require('./lib/rehydrateOne')

const MIN_PLAIN = Number(process.env.MIN_ARTICLE_PLAIN_CHARS || 900)
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:27601'
const onlyId = process.argv[2] || ''
const REHYDRATE_IMAGES = process.env.REHYDRATE_IMAGES !== '0'
const LENGTH_PROMPT =
  'Length: medium-to-long, about 1200-2000 words in the body (minimum ~900 words). Use 5-6 h3 sections with 2-3 paragraphs each.'

function plainLen(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .length
}

async function regenerateOne(article) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 180000)

  const genRes = await fetch(`${baseUrl}/api/generate-article`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: article.title,
      categoryId: article.categoryId,
      domains: [],
      prompt: LENGTH_PROMPT,
      forceFallback: false,
    }),
    signal: controller.signal,
  })
  clearTimeout(timer)

  if (!genRes.ok) {
    throw new Error(`generate failed ${genRes.status}: ${await genRes.text()}`)
  }

  const data = await genRes.json()
  if (!data?.content || plainLen(data.content) < MIN_PLAIN) {
    throw new Error(`content too short (${plainLen(data.content)} chars)`)
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
  const prisma = new PrismaClient()
  try {
    const where = { deletedAt: null, ...(onlyId ? { id: onlyId } : {}) }
    const all = await prisma.article.findMany({
      where,
      select: { id: true, title: true, categoryId: true, content: true },
    })

    const targets = all.filter((a) => plainLen(a.content) < MIN_PLAIN)
    console.log(`Short articles: ${targets.length} (of ${all.length}, min ${MIN_PLAIN} chars)`)
    for (const a of targets) {
      console.log(`- ${plainLen(a.content)} chars | ${a.title}`)
    }
    if (targets.length === 0) return

    let ok = 0
    let fail = 0
    for (const article of targets) {
      try {
        await regenerateOne(article)
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
