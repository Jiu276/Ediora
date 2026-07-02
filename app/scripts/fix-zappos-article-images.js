/**
 * 修复 Zappos 文章配图：清除损坏的 figure/img，写入可用 Unsplash 图片。
 *
 * 用法（voiceblend 站点 app 目录）:
 *   node scripts/fix-zappos-article-images.js
 *   DRY_RUN=1 node scripts/fix-zappos-article-images.js
 *   ARTICLE_ID=<uuid> node scripts/fix-zappos-article-images.js
 */
const { PrismaClient } = require('@prisma/client')
const { insertImagesIntoContent, stripExistingFigures } = require('./lib/insertArticleImages')

const DRY_RUN = process.env.DRY_RUN === '1'
const ARTICLE_ID = process.env.ARTICLE_ID || ''
const TITLE_NEEDLE = 'Zappos'

/** 勿在 alt 中放链接关键词，避免破坏 HTML 属性 */
const IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop',
    description: 'Red running shoes on a yellow background',
    source: 'unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80&auto=format&fit=crop',
    description: 'Fashion accessories and wardrobe essentials flat lay',
    source: 'unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80&auto=format&fit=crop',
    description: 'Woman shopping with bags in a city setting',
    source: 'unsplash',
  },
  {
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80&auto=format&fit=crop',
    description: 'Clothing rack with curated fashion pieces',
    source: 'unsplash',
  },
]

/**
 * @param {string} content
 */
function stripBrokenImageMarkup(content) {
  let html = stripExistingFigures(String(content || ''))
  html = html.replace(/<img\b[^>]*>/gi, '')
  html = html.replace(
    /[^<]*style="max-width:\s*100%;\s*height:\s*auto;\s*border-radius:\s*8px;\s*box-shadow:[^"]*"\s*\/?>/gi,
    '',
  )
  return html.replace(/\n{3,}/g, '\n\n').trim()
}

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
        { title: { contains: TITLE_NEEDLE } },
        { title: { contains: 'Shopping on Zappos' } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
  })
}

async function main() {
  const prisma = new PrismaClient()
  try {
    const article = await findArticle(prisma)
    if (!article) throw new Error('未找到 Zappos 文章')

    const cleaned = stripBrokenImageMarkup(article.content)
    const content = insertImagesIntoContent(cleaned, IMAGES, article.title)

    console.log('[article]', article.id, '|', article.title)
    console.log('[images]', IMAGES.length)
    console.log('[featured]', IMAGES[0].url)

    if (DRY_RUN) {
      console.log('[dry-run] skipped DB write')
      return
    }

    await prisma.article.update({
      where: { id: article.id },
      data: {
        content,
        featuredImage: IMAGES[0].url,
      },
    })

    await prisma.articleImage.updateMany({
      where: { articleId: article.id, deletedAt: null },
      data: { deletedAt: new Date() },
    })
    await prisma.articleImage.createMany({
      data: IMAGES.map((img, idx) => ({
        articleId: article.id,
        url: img.url,
        thumbnail: img.url,
        description: img.description,
        source: img.source,
        sortOrder: idx,
      })),
    })

    console.log('[ok] fixed:', article.id)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('[fail]', e?.message || e)
  process.exit(1)
})
