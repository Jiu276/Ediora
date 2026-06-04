/**
 * 修复单篇文章：可先改英文标题，再重生成正文。
 * 用法:
 *   BASE_URL=http://127.0.0.1:50813 node scripts/fix-one-article-english.js <articleId>
 *   BASE_URL=... NEW_TITLE="English Title" node scripts/fix-one-article-english.js <articleId>
 */
const { PrismaClient } = require('@prisma/client')

const articleId = process.argv[2]
const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:27601'
const newTitle = process.env.NEW_TITLE || ''

if (!articleId) {
  console.error('用法: BASE_URL=http://127.0.0.1:PORT node scripts/fix-one-article-english.js <articleId>')
  process.exit(1)
}

async function main() {
  const prisma = new PrismaClient()
  try {
    const article = await prisma.article.findFirst({
      where: { id: articleId, deletedAt: null },
      select: { id: true, title: true, categoryId: true },
    })
    if (!article) throw new Error(`Article not found: ${articleId}`)

    if (newTitle.trim()) {
      await prisma.article.update({
        where: { id: articleId },
        data: { title: newTitle.trim() },
      })
      article.title = newTitle.trim()
      console.log('[title] updated:', article.title)
    }

    console.log('[generate] start:', article.title)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 180000)

    const genRes = await fetch(`${baseUrl}/api/generate-article`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        categoryId: article.categoryId,
        forceFallback: true,
      }),
      signal: controller.signal,
    })
    clearTimeout(timer)

    const data = await genRes.json()
    if (!genRes.ok) {
      throw new Error(`generate failed ${genRes.status}: ${JSON.stringify(data)}`)
    }

    const putRes = await fetch(`${baseUrl}/api/articles/${articleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        content: data.content,
        excerpt: data.excerpt,
      }),
    })
    if (!putRes.ok) {
      throw new Error(`PUT failed ${putRes.status}: ${await putRes.text()}`)
    }

    console.log('[ok] done:', article.title)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('[fail]', e?.message || e)
  process.exit(1)
})
