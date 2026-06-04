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
  const id = '95034b90-c98d-4ae5-a628-346b837ed4dc'

  try {
    const a = await p.article.findUnique({
      where: { id },
      select: { id: true, content: true },
    })
    const old = a.content
    const neu = normalizeArticleContent(old)
    console.log('changed=', neu !== old)
    console.log('old idx of \\\\n=', old.indexOf('\\n'))
    console.log('new idx of \\\\n=', neu.indexOf('\\n'))
    console.log('old starts=', JSON.stringify(old.slice(0, 80)))
    console.log('new starts=', JSON.stringify(neu.slice(0, 80)))
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

