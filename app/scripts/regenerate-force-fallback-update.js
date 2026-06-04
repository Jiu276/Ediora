const { PrismaClient } = require('@prisma/client')

async function main() {
  const p = new PrismaClient()
  try {
    const titleNeedle =
      'Experience Rustic Elegance with Wild Oak Boutique Fashion Essentials'
    const article = await p.article.findFirst({
      where: { title: { contains: titleNeedle }, deletedAt: null },
      select: { id: true, categoryId: true, title: true },
    })
    if (!article) throw new Error('Article not found')

    const res = await fetch('http://localhost:27601/api/generate-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        categoryId: article.categoryId,
        domains: [],
        forceFallback: true,
      }),
    })

    if (!res.ok) {
      console.log('generate failed status:', res.status)
      console.log(await res.text())
      return
    }

    const data = await res.json()
    const content = data?.content || ''
    const excerpt = data?.excerpt || ''

    const putRes = await fetch(`http://localhost:27601/api/articles/${article.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        content,
        excerpt,
      }),
    })

    if (!putRes.ok) {
      console.log('put failed status:', putRes.status)
      console.log(await putRes.text())
      return
    }

    console.log('updated article successfully')
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

