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
  const p = new PrismaClient()

  const titleNeedle =
    'Experience Rustic Elegance with Wild Oak Boutique Fashion Essentials'

  try {
    const article = await p.article.findFirst({
      where: { title: { contains: titleNeedle }, deletedAt: null },
      select: { id: true, title: true, content: true },
    })

    if (!article) {
      console.log('not found by title')
      return
    }

    const s = article.content || ''
    const hasLiteralBackslashN = s.includes('\\n')
    const hasActualNewline = s.includes('\n')
    const backslashCount = (s.match(/\\/g) || []).length
    console.log({
      id: article.id,
      hasLiteralBackslashN,
      hasActualNewline,
      backslashCount,
      contentPrefix: JSON.stringify(s.slice(0, 120)),
    })

    const idx = s.indexOf('\\n')
    if (idx >= 0) {
      console.log('first \\n idx', idx)
      console.log('around', JSON.stringify(s.slice(idx - 40, idx + 40)))
    }
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

