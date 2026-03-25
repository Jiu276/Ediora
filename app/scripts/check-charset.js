const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

function loadEnvFile() {
  // Prisma 在 `npm run ...` 时会自动加载 `.env`，但我们这里是直接 `node xxx.js`。
  // 所以手动读取一次，避免再引入 dotenv 依赖。
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

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('Missing DATABASE_URL in app/.env')
    process.exit(1)
  }

  const p = new PrismaClient()

  try {
    const dbName = await p.$queryRawUnsafe('SELECT DATABASE() AS db')
    console.log('CURRENT_DB:', dbName?.[0]?.db)

    const dbCharset = await p.$queryRawUnsafe(
      'SELECT @@character_set_database AS cs, @@collation_database AS coll'
    )
    console.log('DB_CHARSET_COLLATION:', dbCharset)

    const themeCols = await p.$queryRawUnsafe(`
      SELECT
        COLUMN_NAME AS columnName,
        CHARACTER_SET_NAME AS characterSetName,
        COLLATION_NAME AS collationName
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'themes'
        AND COLUMN_NAME IN ('name', 'description', 'slug')
    `)
    console.log('THEMES_COLUMN_CHARSET:', themeCols)

    const categoryCols = await p.$queryRawUnsafe(`
      SELECT
        COLUMN_NAME AS columnName,
        CHARACTER_SET_NAME AS characterSetName,
        COLLATION_NAME AS collationName
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'categories'
        AND COLUMN_NAME IN ('name', 'description', 'slug')
    `)
    console.log('CATEGORIES_COLUMN_CHARSET:', categoryCols)
  } finally {
    await p.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

