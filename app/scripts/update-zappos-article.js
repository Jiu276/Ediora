/**
 * 重写 Zappos 购物指南：鞋类主题配图 + 正文，清除损坏 figure/caption。
 *
 * 用法（voiceblend 站点 app 目录）:
 *   node scripts/update-zappos-article.js
 *   DRY_RUN=1 node scripts/update-zappos-article.js
 *   ARTICLE_ID=<uuid> node scripts/update-zappos-article.js
 *   ZAPPOS_URL=https://www.zappos.com/ node scripts/update-zappos-article.js
 */
const { PrismaClient } = require('@prisma/client')
const { buildZapposArticle } = require('./content/zappos-shopping-article')

const DRY_RUN = process.env.DRY_RUN === '1'
const ARTICLE_ID = process.env.ARTICLE_ID || ''

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 */
async function findArticle(prisma) {
  if (ARTICLE_ID) {
    return prisma.article.findFirst({ where: { id: ARTICLE_ID, deletedAt: null } })
  }
  return prisma.article.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { title: { contains: 'Zappos' } },
        { title: { contains: 'Shopping on Zappos' } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
  })
}

async function main() {
  const prisma = new PrismaClient()
  const payload = buildZapposArticle()

  try {
    const article = await findArticle(prisma)
    if (!article) throw new Error('未找到 Zappos 文章。可设置 ARTICLE_ID=<uuid>')

    const plainLen = payload.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().length
    console.log('[article]', article.id, '|', article.title)
    console.log('[new title]', payload.title)
    console.log('[plain chars]', plainLen)
    console.log('[images]', payload.images.length)

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
        enableKeywordLinks: false,
        metaTitle: payload.title,
        metaDescription: payload.excerpt.slice(0, 160),
        metaKeywords: 'Zappos, sneakers, running shoes, boots, free shipping, Nike, HOKA, Birkenstock, online shopping',
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
        source: img.source,
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
