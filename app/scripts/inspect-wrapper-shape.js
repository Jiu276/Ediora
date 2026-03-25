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
  const id = '95034b90-c98d-4ae5-a628-346b837ed4dc'

  try {
    const a = await p.article.findUnique({
      where: { id },
      select: { id: true, content: true },
    })
    const s = a?.content || ''

    const first = s.indexOf('\"content\"')
    const second = s.indexOf('\"content\"', first + 1)
    console.log({ first, second })

    const keyPos = s.indexOf('"content":')
    console.log({ keyPos })

    const afterKey = keyPos + '"content":'.length
    const snippet = s.slice(Math.max(0, keyPos - 40), Math.min(s.length, keyPos + 200))
    console.log('around key:', JSON.stringify(snippet))

    // Print where the HTML value likely ends:
    // Find the next occurrence of '",' after the start of the content value.
    const startQuote = s.indexOf('\"', afterKey)
    const candidateEnd = s.indexOf('\"', startQuote + 1)
    console.log({ startQuote, candidateEnd })
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

