/**
 * 重写 Cécred 品牌文章：中等篇幅、4 张配图、关键词链至 cecred.com。
 *
 * 用法（在目标站点 app 目录，如 Ediora-voiceblend/app）:
 *   node scripts/update-cecred-article.js
 *   DRY_RUN=1 node scripts/update-cecred-article.js
 *   ORDER_COUNT=42 node scripts/update-cecred-article.js   # 阅读量 = 订单量 × 100
 *   ARTICLE_ID=<uuid> node scripts/update-cecred-article.js
 */
const { PrismaClient } = require('@prisma/client')
const { buildCecredArticle } = require('./content/cecred-haircare-article')

const DRY_RUN = process.env.DRY_RUN === '1'
const ORDER_COUNT = Number.parseInt(process.env.ORDER_COUNT || '38', 10)
const VIEW_COUNT = Number.isFinite(ORDER_COUNT) && ORDER_COUNT > 0 ? ORDER_COUNT * 100 : 3800
const PUBLISH_DATE = new Date('2026-05-01T09:30:00.000Z')
const ARTICLE_ID = process.env.ARTICLE_ID || ''

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 */
async function findArticle(prisma) {
  if (ARTICLE_ID) {
    return prisma.article.findFirst({
      where: { id: ARTICLE_ID, deletedAt: null },
    })
  }

  const byTitle = await prisma.article.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { title: { contains: 'Unlock Length' } },
        { title: { contains: 'Cécred' } },
        { title: { contains: 'Cecred' } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
  })
  return byTitle
}

async function main() {
  const prisma = new PrismaClient()
  const payload = buildCecredArticle()

  try {
    const article = await findArticle(prisma)
    if (!article) {
      throw new Error('未找到 Cécred 相关文章。可设置 ARTICLE_ID=<uuid>')
    }

    const plainLen = payload.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().length
    console.log('[article]', article.id, '|', article.title)
    console.log('[new title]', payload.title)
    console.log('[plain chars]', plainLen)
    console.log('[images]', payload.images.length)
    console.log('[publish]', PUBLISH_DATE.toISOString())
    console.log('[viewCount]', VIEW_COUNT, `(ORDER_COUNT=${ORDER_COUNT} × 100)`)

    if (DRY_RUN) {
      console.log('[dry-run] skipped DB write')
      return
    }

    await prisma.article.update({
      where: { id: article.id },
      data: {
        title: payload.title,
        content: payload.content,
        excerpt: payload.excerpt,
        featuredImage: payload.featuredImage,
        publishDate: PUBLISH_DATE,
        viewCount: VIEW_COUNT,
        status: 'published',
        enableKeywordLinks: false,
        metaTitle: payload.title,
        metaDescription: payload.excerpt.slice(0, 160),
        metaKeywords: 'Cécred, haircare, Foundation Collection, Styling Collection, protein ritual, length retention, shine',
      },
    })

    await prisma.articleLink.updateMany({
      where: { articleId: article.id, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    await prisma.articleLink.createMany({
      data: payload.links.map((l) => ({
        articleId: article.id,
        keyword: l.keyword,
        url: l.url,
      })),
    })

    await prisma.articleImage.updateMany({
      where: { articleId: article.id, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    await prisma.articleImage.createMany({
      data: payload.images.map((img, idx) => ({
        articleId: article.id,
        url: img.url,
        thumbnail: img.url,
        description: img.caption,
        source: 'unsplash',
        sortOrder: idx,
      })),
    })

    console.log('[ok] updated:', article.id)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('[fail]', e?.message || e)
  process.exit(1)
})
