const { PrismaClient } = require('@prisma/client')

async function main() {
  const p = new PrismaClient()
  try {
    const titleNeedle =
      'Experience Rustic Elegance with Wild Oak Boutique Fashion Essentials'
    const article = await p.article.findFirst({
      where: { title: { contains: titleNeedle }, deletedAt: null },
      select: { id: true, categoryId: true, title: true, slug: true },
    })
    console.log(article)
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

