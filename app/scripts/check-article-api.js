const { PrismaClient } = require('@prisma/client')

async function main() {
  const slugNeedle =
    'experience-rustic-elegance-with-wild-oak-boutique-fashion-essentials'

  const base = process.argv[2] || process.env.API_BASE_URL || 'http://localhost:27601'
  const url = `${base}/api/articles/slug/${slugNeedle}`

  const res = await fetch(url)
  if (!res.ok) {
    console.log('Request failed:', res.status, await res.text())
    process.exit(1)
  }
  const data = await res.json()

  const c = data?.content || ''
  const ex = data?.excerpt || ''
  console.log('contentStartsWith:', c.slice(0, 80))
  console.log('containsJsonWrapperLike:', c.includes('"content"') && c.includes('<h2>'))
  console.log('containsLiteralBackslashN:', c.includes('\\\\n'))

  console.log('excerptStartsWith:', ex.slice(0, 80))
  console.log('excerptContainsJsonWrapperLike:', ex.includes('"content"'))
  console.log('excerptContainsLiteralBackslashN:', ex.includes('\\\\n'))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

