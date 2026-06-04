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
  try {
    const articles = await p.article.findMany({
      where: { deletedAt: null },
      select: { id: true, content: true },
    })
    const literal = articles.filter((a) => (a.content || '').includes('\\n')).length
    console.log({ articlesTotal: articles.length, articlesWithLiteralBackslashN: literal })
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

