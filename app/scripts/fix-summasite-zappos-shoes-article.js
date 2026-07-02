/**
 * 修复 summasite「Shopping for Shoes on Zappos」文章：替换错误配图与护肤模板正文。
 *
 * 默认文章 ID（summasite）: 598555c7-4c5d-47dc-b20b-7fa82fe0e8e6
 *
 * 用法（Ediora-summasite/app）:
 *   node scripts/fix-summasite-zappos-shoes-article.js
 *   DRY_RUN=1 node scripts/fix-summasite-zappos-shoes-article.js
 *   ARTICLE_ID=<uuid> node scripts/fix-summasite-zappos-shoes-article.js
 */
const { PrismaClient } = require('@prisma/client')
const { buildZapposShoesGuideArticle } = require('./content/zappos-shoes-guide-article')

const DRY_RUN = process.env.DRY_RUN === '1'
const ARTICLE_ID =
  process.env.ARTICLE_ID || '598555c7-4c5d-47dc-b20b-7fa82fe0e8e6'

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 */
async function findArticle(prisma) {
  const byId = await prisma.article.findFirst({
    where: { id: ARTICLE_ID, deletedAt: null },
  })
  if (byId) return byId

  return prisma.article.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { title: { contains: 'Shopping for Shoes on Zappos' } },
        { title: { contains: 'Ultimate Guide to Shopping for Shoes' } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
  })
}

/**
 * @param {string} html
 */
function stripBrokenFigures(html) {
  let out = String(html || '')
  out = out.replace(/<figure[\s\S]*?<\/figure>/gi, '')
  out = out.replace(/<img\b[^>]*>/gi, '')
  return out.replace(/\n{3,}/g, '\n\n').trim()
}

async function main() {
  const prisma = new PrismaClient()
  const payload = buildZapposShoesGuideArticle()

  try {
    const article = await findArticle(prisma)
    if (!article) {
      throw new Error(
        `未找到 Zappos 鞋类指南文章。请设置 ARTICLE_ID（默认 ${ARTICLE_ID}）`,
      )
    }

    const plainLen = payload.content
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim().length

    console.log('[article]', article.id, '|', article.title)
    console.log('[new title]', payload.title)
    console.log('[plain chars]', plainLen)
    console.log('[images]', payload.images.length)
    console.log(
      '[had fallback]',
      /ingredient transparency|SPF|Morning and evening routine/i.test(
        article.content || '',
      ),
    )

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
        status: 'published',
        metaTitle: payload.title.slice(0, 200),
        metaDescription: payload.excerpt.slice(0, 160),
        metaKeywords:
          'Zappos, shoes, sneakers, running shoes, HOKA, Nike, free shipping, boots, Birkenstock',
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

    await prisma.articleTag.updateMany({
      where: { articleId: article.id, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    await prisma.articleTag.createMany({
      data: payload.tags.map((tag) => ({ articleId: article.id, tag })),
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

    console.log('[ok] fixed:', article.id)
    console.log('[url]', `https://summasite.store/blog/${article.id}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('[fail]', e?.message || e)
  process.exit(1)
})
