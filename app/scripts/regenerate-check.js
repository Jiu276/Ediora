const { PrismaClient } = require('@prisma/client')

async function main() {
  const p = new PrismaClient()
  try {
    const title =
      'Experience Rustic Elegance with Wild Oak Boutique Fashion Essentials'
    const article = await p.article.findFirst({
      where: { title: { contains: title }, deletedAt: null },
      select: { id: true, categoryId: true },
    })
    if (!article) throw new Error('Article not found')

    const res = await fetch('http://localhost:27601/api/generate-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article ? title : title,
        categoryId: article.categoryId,
        domains: [],
      }),
    })

    if (!res.ok) {
      console.log('generate failed', res.status)
      console.log(await res.text())
      return
    }

    const data = await res.json()
    const content = data?.content || ''
    const excerpt = data?.excerpt || ''

    console.log('generated content len:', content.length)
    console.log(
      'generated content tail:',
      JSON.stringify(content.slice(Math.max(0, content.length - 160))),
    )
    console.log('generated excerpt len:', excerpt.length)
    console.log('generated excerpt tail:', JSON.stringify(excerpt.slice(-160)))
    console.log('content has incomplete img:', content.includes('<img src=\\\\'))
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

