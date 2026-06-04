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

function normalizeArticleContent(input) {
  if (input == null) return ''
  if (typeof input !== 'string') return String(input)

  let s = input

  // Heuristic unwrap: { "content": "<h2>...</h2>" } where JSON.parse may fail.
  const keyPos = s.indexOf('"content":')
  if (keyPos >= 0 && s.includes('<h2>')) {
    const afterKey = keyPos + '"content":'.length
    const startQuote = s.indexOf('"', afterKey)
    if (startQuote >= 0) {
      const endQuote = s.indexOf('"', startQuote + 1)
      if (endQuote > startQuote) {
        s = s.slice(startQuote + 1, endQuote)
      }
    }
  }

  // Repeatedly unwrap when content is nested as JSON string(s).
  for (let i = 0; i < 3; i++) {
    const trimmed = s.trim()
    let changed = false

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed && typeof parsed.content === 'string') {
          s = parsed.content
          changed = true
        } else if (typeof parsed === 'string') {
          s = parsed
          changed = true
        }
      } catch {
        // ignore
      }
    }

    if (changed) continue

    if (trimmed.startsWith('\"') && trimmed.endsWith('\"')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (typeof parsed === 'string') {
          s = parsed
          changed = true
        }
      } catch {
        // ignore
      }
    }

    if (!changed) break
  }

  s = s.replaceAll('\\\\r\\\\n', '\n')
  s = s.replaceAll('\\\\n', '\n')
  s = s.replaceAll('\\r\\n', '\n')
  s = s.replaceAll('\\n', '\n')

  s = s.replaceAll('\\\\t', '\t')
  s = s.replaceAll('\\t', '\t')

  return s
}

async function main() {
  loadEnvFile()

  const p = new PrismaClient()

  try {
    const articles = await p.article.findMany({
      where: {
        deletedAt: null,
        content: { contains: '\\n' },
      },
      select: { id: true, content: true },
    })

    console.log(`articles to fix: ${articles.length}`)

    let changed = 0
    for (const a of articles) {
      const normalized = normalizeArticleContent(a.content)
      if (normalized !== a.content) {
        await p.article.update({
          where: { id: a.id },
          data: { content: normalized },
        })
        changed++
      }
    }
    console.log(`articles changed: ${changed}`)

    const versions = await p.articleVersion.findMany({
      where: {
        deletedAt: null,
        content: { contains: '\\n' },
      },
      select: { id: true, content: true },
    })

    console.log(`article_versions to fix: ${versions.length}`)

    changed = 0
    for (const v of versions) {
      const normalized = normalizeArticleContent(v.content)
      if (normalized !== v.content) {
        await p.articleVersion.update({
          where: { id: v.id },
          data: { content: normalized },
        })
        changed++
      }
    }
    console.log(`article_versions changed: ${changed}`)
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

