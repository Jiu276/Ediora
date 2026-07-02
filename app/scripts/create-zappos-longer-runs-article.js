/**
 * 在 summasite（或任意 Ediora 站点）新建/更新 Zappos 夏季跑步主题文章。
 *
 * 用法（summasite app 目录）:
 *   node scripts/create-zappos-longer-runs-article.js
 *   DRY_RUN=1 node scripts/create-zappos-longer-runs-article.js
 *   ORDER_COUNT=45 node scripts/create-zappos-longer-runs-article.js
 *   ARTICLE_ID=<uuid> node scripts/create-zappos-longer-runs-article.js
 */
const { PrismaClient } = require('@prisma/client')
const { buildZapposLongerRunsArticle } = require('./content/zappos-longer-runs-article')

const DRY_RUN = process.env.DRY_RUN === '1'
const ARTICLE_ID = process.env.ARTICLE_ID || ''
const ORDER_COUNT = Number.parseInt(process.env.ORDER_COUNT || '42', 10)
const VIEW_COUNT = Number.isFinite(ORDER_COUNT) && ORDER_COUNT > 0 ? ORDER_COUNT * 100 : 4200
/** 2026-06-22 前约半个月 */
const PUBLISH_DATE = new Date('2026-06-10T14:20:00.000Z')

const TITLE = 'Longer Days, Longer Runs, and a Zappos Cart Full of New Gear'

/**
 * @param {string} title
 */
function generateSlug(title) {
  return String(title || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, '-')
    .replace(/[:：，,。.？?！!；;]/g, '-')
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9-]/g, '')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200) || 'article'
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} baseSlug
 */
async function ensureUniqueSlug(prisma, baseSlug) {
  let slug = baseSlug
  let n = 1
  while (true) {
    const hit = await prisma.article.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true },
    })
    if (!hit || (ARTICLE_ID && hit.id === ARTICLE_ID)) return slug
    n += 1
    slug = `${baseSlug}-${n}`
  }
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 */
async function findExisting(prisma) {
  if (ARTICLE_ID) {
    return prisma.article.findFirst({ where: { id: ARTICLE_ID, deletedAt: null } })
  }
  return prisma.article.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { title: TITLE },
        { title: { contains: 'Longer Days, Longer Runs' } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
  })
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 */
async function resolveCategoryId(prisma) {
  const cat = await prisma.category.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { slug: 'life' },
        { slug: 'fashion' },
        { name: { contains: 'life' } },
      ],
    },
    orderBy: { createdAt: 'asc' },
  })
  return cat?.id ?? null
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} articleId
 * @param {string[]} tags
 */
async function syncTags(prisma, articleId, tags) {
  await prisma.articleTag.updateMany({
    where: { articleId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
  if (tags.length > 0) {
    await prisma.articleTag.createMany({
      data: tags.map((tag) => ({ articleId, tag })),
    })
  }
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} articleId
 * @param {Array<{ keyword: string; url: string }>} links
 */
async function syncLinks(prisma, articleId, links) {
  await prisma.articleLink.updateMany({
    where: { articleId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
  if (links.length > 0) {
    await prisma.articleLink.createMany({
      data: links.map((l) => ({
        articleId,
        keyword: l.keyword,
        url: l.url,
      })),
    })
  }
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} articleId
 * @param {Array<{ url: string; caption: string; source: string }>} images
 */
async function syncImages(prisma, articleId, images) {
  await prisma.articleImage.updateMany({
    where: { articleId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
  await prisma.articleImage.createMany({
    data: images.map((img, idx) => ({
      articleId,
      url: img.url,
      thumbnail: img.url,
      description: img.caption,
      source: img.source,
      sortOrder: idx,
    })),
  })
}

async function main() {
  const prisma = new PrismaClient()
  const payload = buildZapposLongerRunsArticle()
  const baseSlug = generateSlug(payload.title)

  try {
    const existing = await findExisting(prisma)
    const plainLen = payload.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().length

    console.log('[title]', payload.title)
    console.log('[slug]', baseSlug)
    console.log('[plain chars]', plainLen)
    console.log('[images]', payload.images.length)
    console.log('[publish]', PUBLISH_DATE.toISOString())
    console.log('[viewCount]', VIEW_COUNT, `(ORDER_COUNT=${ORDER_COUNT} × 100)`)
    console.log('[mode]', existing ? `update ${existing.id}` : 'create')

    if (DRY_RUN) {
      console.log('[dry-run] skipped DB write')
      return
    }

    const categoryId = await resolveCategoryId(prisma)
    const slug = existing?.slug || (await ensureUniqueSlug(prisma, baseSlug))

    const articleData = {
      title: payload.title,
      slug,
      content: payload.content,
      excerpt: payload.excerpt,
      featuredImage: payload.featuredImage,
      publishDate: PUBLISH_DATE,
      viewCount: VIEW_COUNT,
      status: 'published',
      enableKeywordLinks: false,
      metaTitle: payload.title.slice(0, 200),
      metaDescription: payload.excerpt.slice(0, 160),
      metaKeywords:
        'Zappos, longer runs, running shoes, HOKA Clifton, summer training, free shipping, road running',
      categoryId,
    }

    let articleId
    if (existing) {
      await prisma.article.update({
        where: { id: existing.id },
        data: articleData,
      })
      articleId = existing.id
    } else {
      const created = await prisma.article.create({
        data: {
          ...articleData,
          titleId: '1',
          author: 'Admin',
        },
      })
      articleId = created.id
    }

    await syncTags(prisma, articleId, payload.tags)
    await syncLinks(prisma, articleId, payload.links)
    await syncImages(prisma, articleId, payload.images)

    console.log('[ok]', existing ? 'updated' : 'created', articleId)
    console.log('[url]', `/blog/${articleId}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('[fail]', e?.message || e)
  process.exit(1)
})
