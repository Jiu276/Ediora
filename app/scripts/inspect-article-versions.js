const { PrismaClient } = require('@prisma/client')

async function main() {
  const p = new PrismaClient()
  try {
    const articleId = '95034b90-c98d-4ae5-a628-346b837ed4dc'
    const versions = await p.articleVersion.findMany({
      where: { articleId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, version: true, content: true, createdAt: true },
    })

    console.log('versions:', versions.length)
    for (const v of versions.slice(0, 10)) {
      const s = v.content || ''
      const imgLast = s.lastIndexOf('<img')
      console.log({
        version: v.version,
        id: v.id,
        len: s.length,
        imgLast,
        tail: JSON.stringify(s.slice(Math.max(0, s.length - 120))),
      })
      if (imgLast >= 0) {
        console.log(
          'imgTail:',
          JSON.stringify(s.slice(Math.max(0, imgLast - 80), imgLast + 200)),
        )
      }
    }
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

