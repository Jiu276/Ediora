const { PrismaClient } = require('@prisma/client')

async function main() {
  const p = new PrismaClient()
  try {
    const title =
      'Experience Rustic Elegance with Wild Oak Boutique Fashion Essentials'
    const article = await p.article.findFirst({
      where: { title: { contains: title }, deletedAt: null },
      select: { id: true, categoryId: true, title: true, excerpt: true },
    })
    if (!article) throw new Error('Article not found')

    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 180000)

    const res = await fetch('http://localhost:27601/api/generate-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        categoryId: article.categoryId,
        domains: [],
      }),
      signal: controller.signal,
    })
    clearTimeout(t)

    if (!res.ok) {
      console.log('generate failed status:', res.status)
      console.log(await res.text())
      return
    }

    const data = await res.json()
    const content = data?.content || ''
    const excerpt = data?.excerpt || ''

    console.log('generated content len:', content.length)
    console.log('generated content tail:', JSON.stringify(content.slice(-200)))
    console.log('generated excerpt len:', excerpt.length)

    // Update article in DB
    const putRes = await fetch(
      `http://localhost:27601/api/articles/${article.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content,
          excerpt,
        }),
      },
    )

    if (!putRes.ok) {
      console.log('put failed status:', putRes.status)
      console.log(await putRes.text())
      return
    }

    console.log('PUT success')
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error('regenerate-update error:', e?.message || e)
  process.exit(1)
})

