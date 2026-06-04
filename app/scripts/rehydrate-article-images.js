/**
 * 为文章重新拉取配图并写入正文 + featuredImage + articleImage 表。
 * 用法:
 *   BASE_URL=http://127.0.0.1:50813 node scripts/rehydrate-article-images.js
 *   BASE_URL=... node scripts/rehydrate-article-images.js <articleId>
 *   DRY_RUN=1 仅列出将处理的文章
 */
const { PrismaClient } = require('@prisma/client')
const { rehydrateOne } = require('./lib/rehydrateOne')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:27601'
  const dryRun = process.env.DRY_RUN === '1'
  const onlyId = process.argv[2] || ''
  const prisma = new PrismaClient()

  try {
    const where = { deletedAt: null, ...(onlyId ? { id: onlyId } : {}) }
    const articles = await prisma.article.findMany({
      where,
      select: { id: true, title: true, content: true, excerpt: true, featuredImage: true },
      orderBy: { publishDate: 'desc' },
    })

    const forceAll = process.env.FORCE_ALL === '1'
    const needsImages = forceAll
      ? articles
      : articles.filter((a) => {
          const hasFigure = /<figure\b/i.test(a.content || '')
          return !hasFigure || !a.featuredImage
        })

    console.log(
      `Will rehydrate ${needsImages.length} article(s) (of ${articles.length} total)`,
    )

    for (const a of needsImages) {
      console.log(`- ${a.id} | ${a.title}`)
    }

    if (dryRun || needsImages.length === 0) return

    let ok = 0
    let fail = 0
    for (const article of needsImages) {
      try {
        const n = await rehydrateOne(baseUrl, article)
        ok++
        console.log(`[ok] ${article.title} (${n} images)`)
        await sleep(1500)
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
