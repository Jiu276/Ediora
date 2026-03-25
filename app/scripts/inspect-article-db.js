const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx <= 0) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

async function main() {
  loadEnvFile()

  const prisma = new PrismaClient()
  const titleNeedle =
    'Experience Rustic Elegance with Wild Oak Boutique Fashion Essentials'

  try {
    const article = await prisma.article.findFirst({
      where: { title: { contains: titleNeedle }, deletedAt: null },
      select: { id: true, title: true, content: true, excerpt: true },
    })

    if (!article) {
      console.log('Article not found')
      return
    }

    const s = article.content || ''
    const ex = article.excerpt || ''
    console.log('id:', article.id)
    console.log('contentLength:', s.length)
    console.log('contentStartsWith:', s.slice(0, 120))
    console.log('contentEndsWith:', s.slice(-120))
    console.log('hasJsonWrapperLike:', s.includes('"content"') && s.includes('<h2>'))
    console.log('hasLiteralBackslashN:', s.includes('\\n'))
    console.log('hasActualNewline:', s.includes('\n'))
    console.log('excerptLength:', ex.length)
    console.log('excerptStartsWith:', ex.slice(0, 120))
    console.log('excerptHasJsonWrapperLike:', ex.includes('"content"') && ex.includes('<h2>'))
    console.log('excerptHasLiteralBackslashN:', ex.includes('\\\\n'))
    console.log('excerptPrefixJson:', JSON.stringify(ex.slice(0, 260)))
    console.log('excerptEndsWithRaw:', JSON.stringify(ex.slice(-120)))

    // Quick normalization test for excerpt (same heuristics as server-side)
    let e = ex
    const keyPos = e.indexOf('"content":')
    console.log('excerpt keyPos:', keyPos)
    if (keyPos >= 0) {
      const afterKey = keyPos + '"content":'.length
      const startQuote = e.indexOf('"', afterKey)
      console.log('excerpt startQuote:', startQuote)
      if (startQuote >= 0) {
        const bracePos = e.lastIndexOf('}')
        console.log('excerpt bracePos:', bracePos)
        const endSearchLimit = bracePos >= 0 ? bracePos : e.length
        const endQuote = e.lastIndexOf('"', endSearchLimit - 1)
        console.log('excerpt endQuote:', endQuote)
        if (endQuote > startQuote) {
          e = e.slice(startQuote + 1, endQuote)
        }
      }
    }
    e = e.replaceAll('\\\\r\\\\n', '\n')
    e = e.replaceAll('\\\\n', '\n')
    e = e.replaceAll('\\r\\n', '\n')
    e = e.replaceAll('\\n', '\n')
    e = e.replaceAll('\\\\t', '\t')
    e = e.replaceAll('\\t', '\t')
    console.log('excerptNormalizedPreview:', e.slice(0, 160))

    console.log('prefixJson:', JSON.stringify(s.slice(0, 240)))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

