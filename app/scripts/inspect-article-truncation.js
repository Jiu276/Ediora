const { PrismaClient } = require('@prisma/client')

async function main() {
  const p = new PrismaClient()
  try {
    const id = '95034b90-c98d-4ae5-a628-346b837ed4dc'
    const a = await p.article.findUnique({
      where: { id },
      select: { content: true, excerpt: true, publishDate: true },
    })
    if (!a) {
      console.log('article not found')
      return
    }

    const s = a.content || ''
    const imgFirst = s.indexOf('<img')
    const imgLast = s.lastIndexOf('<img')

    console.log('contentLen:', s.length)
    console.log('imgFirst:', imgFirst)
    console.log('imgLast:', imgLast)
    console.log('tail200:', JSON.stringify(s.slice(-200)))
    if (imgLast >= 0) {
      console.log('imgTail200:', JSON.stringify(s.slice(Math.max(0, imgLast - 120), imgLast + 220)))
    }
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

