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

  const keyPos = s.indexOf('"content":')
  if (keyPos >= 0) {
    const afterKey = keyPos + '"content":'.length
    const startQuote = s.indexOf('"', afterKey)
    if (startQuote >= 0) {
      const bracePos = s.lastIndexOf('}')
      if (bracePos >= 0) {
        const endQuote = s.lastIndexOf('"', bracePos - 1)
        if (endQuote > startQuote) s = s.slice(startQuote + 1, endQuote)
      } else {
        s = s.slice(startQuote + 1)
        if (s.endsWith('"')) s = s.slice(0, -1)
      }
    }
  }

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
      where: { deletedAt: null },
      select: { id: true, excerpt: true },
    })

    console.log('articles total:', articles.length)

    let changed = 0
    for (const a of articles) {
      const old = a.excerpt || ''
      if (!old) continue
      // Only normalize when it looks like the buggy wrapper.
      if (old.includes('"content"') || old.includes('\\n')) {
        const neu = normalizeArticleContent(old)
        if (neu !== old) {
          await p.article.update({ where: { id: a.id }, data: { excerpt: neu } })
          changed++
        }
      }
    }
    console.log('articles excerpt changed:', changed)

    const versions = await p.articleVersion.findMany({
      where: { deletedAt: null },
      select: { id: true, excerpt: true },
    })

    let changedV = 0
    for (const v of versions) {
      const old = v.excerpt || ''
      if (!old) continue
      if (old.includes('"content"') || old.includes('\\n')) {
        const neu = normalizeArticleContent(old)
        if (neu !== old) {
          await p.articleVersion.update({ where: { id: v.id }, data: { excerpt: neu } })
          changedV++
        }
      }
    }

    console.log('article_versions excerpt changed:', changedV)
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

