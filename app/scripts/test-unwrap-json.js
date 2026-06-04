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
    const a = await p.article.findUnique({ where: { id }, select: { id: true, content: true } })
    const s = a.content || ''
    console.log('raw prefix:', s.slice(0, 120))

    const candidate = s.replace(/\\\"/g, '"')
    console.log('candidate prefix:', candidate.slice(0, 120))

    try {
      const parsed = JSON.parse(candidate)
      console.log('parsed keys:', Object.keys(parsed || {}))
      if (parsed && typeof parsed.content === 'string') {
        console.log('parsed.content prefix:', parsed.content.slice(0, 120))
      } else {
        console.log('parsed.content not string')
      }
    } catch (e) {
      console.log('parse candidate failed:', e.message)
    }
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

