import { NextRequest, NextResponse } from 'next/server'
import { sanitizeImageDescriptions } from '@/lib/articleEnglishGuard'
import {
  buildImageSearchQueries,
  buildTaggedFallbackImage,
  chooseImageBias,
  extractKeywords,
} from '@/lib/articleImageSearch'

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

/** POST /api/auto-images - 根据标题与正文分段生成配图 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, count = 5, context } = body

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const requestedCount = Math.min(Math.max(Number(count) || 5, 3), 10)
    const ctxText = typeof context === 'string' ? context : ''
    const queries = buildImageSearchQueries(title.trim(), ctxText, requestedCount)
    const positiveTerms = extractKeywords(`${title}\n${ctxText}`)

    const images: Array<{
      id: string
      url: string
      thumbnail: string
      description: string
      source: string
      keyword?: string
    }> = []
    const usedIds = new Set<string>()

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i]
      let picked = null

      if (UNSPLASH_ACCESS_KEY) {
        picked = await fetchOneUnsplashImage({
          query,
          positiveTerms: [...positiveTerms, ...extractKeywords(query)],
          excludeIds: usedIds,
        })
      }

      if (!picked) {
        picked = buildTaggedFallbackImage(query, i, title.trim())
      }

      if (usedIds.has(picked.id)) {
        picked = { ...picked, id: `${picked.id}-${i}` }
      }
      usedIds.add(picked.id)
      images.push(picked)
    }

    const safeImages = sanitizeImageDescriptions(images, title.trim())
    return NextResponse.json({
      images: safeImages,
      queries,
      bias: chooseImageBias(`${title}\n${ctxText}`),
    })
  } catch (error) {
    console.error('Error generating images:', error)
    return NextResponse.json({ error: 'Failed to generate images' }, { status: 500 })
  }
}

function scorePhoto(photo: Record<string, unknown>, positiveTerms: string[]): number {
  const tags = Array.isArray(photo.tags)
    ? (photo.tags as Array<{ title?: string }>).map((t) => t?.title || '').join(' ')
    : ''
  const text =
    `${photo.description || ''} ${photo.alt_description || ''} ${tags}`.toLowerCase()

  let score = 0
  for (const term of positiveTerms.slice(0, 12)) {
    const t = String(term || '').toLowerCase()
    if (t && text.includes(t)) score += 8
  }

  if (/\b(hair|shampoo|beauty|product|skincare|salon|fashion|outfit|shoes|clothing)\b/.test(text)) {
    score += 14
  }
  if (/\b(mountain|landscape|monkey|animal|forest|ocean|sunset|sky|lake|waterfall|bridge|rainbow)\b/.test(text)) {
    score -= 25
  }
  if (/\b(abstract|texture|wallpaper|pattern)\b/.test(text)) score -= 8

  return score
}

async function fetchOneUnsplashImage({
  query,
  positiveTerms,
  excludeIds,
}: {
  query: string
  positiveTerms: string[]
  excludeIds: Set<string>
}) {
  const url = new URL('https://api.unsplash.com/search/photos')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', '20')
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('content_filter', 'high')
  url.searchParams.set('order_by', 'relevant')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    console.error('Unsplash API error:', res.status, await res.text())
    return null
  }

  const data = await res.json()
  if (!Array.isArray(data.results) || data.results.length === 0) return null

  const ranked = data.results
    .filter((photo: { id?: string }) => photo.id && !excludeIds.has(photo.id))
    .map((photo: Record<string, unknown>) => ({
      photo,
      score: scorePhoto(photo, positiveTerms),
    }))
    .sort((a, b) => b.score - a.score)

  const best = ranked[0]?.photo as Record<string, unknown> | undefined
  if (!best) return null

  const urls = best.urls as Record<string, string> | undefined
  const user = best.user as Record<string, unknown> | undefined
  const links = user?.links as Record<string, string> | undefined

  return {
    id: String(best.id || `unsplash-${query}`),
    url: urls?.regular || urls?.full || '',
    thumbnail: urls?.small || urls?.thumb || '',
    description:
      String(best.description || best.alt_description || query).slice(0, 120) ||
      query,
    source: 'unsplash',
    keyword: query,
  }
}
