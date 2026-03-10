import { NextRequest, NextResponse } from 'next/server'

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

// POST /api/auto-images - 生成配图建议
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, count = 5, context } = body
    
    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }
    
    const requestedCount = Math.min(Math.max(Number(count) || 5, 3), 10)

    const ctxText = typeof context === 'string' ? context : ''
    const combinedText = `${title}\n${ctxText}`.trim()

    // 从标题/正文中提取关键词，并根据文章主题加入偏向词，减少风景/抽象图
    const keywords = extractKeywords(combinedText)
    const titlePart =
      keywords.slice(0, 4).join(' ') ||
      title.replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1).slice(0, 4).join(' ') ||
      ''
    const bias = chooseBias(combinedText)
    const query = titlePart ? `${titlePart} ${bias}`.trim() : bias

    let images

    if (UNSPLASH_ACCESS_KEY) {
      images = await fetchUnsplashImages({
        query,
        desiredCount: requestedCount,
        positiveTerms: keywords,
      })
    }

    // 如果 Unsplash 不可用或无结果，则回退到 picsum.photos
    if (!images || images.length === 0) {
      images = Array.from({ length: requestedCount }, (_, i) => {
        const seed = `${encodeURIComponent(title)}-${i + 1}`
        const keyword = keywords[i % keywords.length] || 'nature'
        return {
          id: `img-${i + 1}`,
          url: `https://picsum.photos/seed/${seed}/800/600`,
          thumbnail: `https://picsum.photos/seed/${seed}/400/300`,
          description: `Image ${i + 1}: ${title}`,
          source: 'picsum',
          keyword,
        }
      })
    }
    
    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error generating images:', error)
    return NextResponse.json(
      { error: 'Failed to generate images' },
      { status: 500 }
    )
  }
}

// 从标题中提取关键词
function extractKeywords(input: string): string[] {
  // 移除常见停用词
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once']
  
  // 提取单词（只保留字母和数字）
  const clean = input
    .replace(/<[^>]*>/g, ' ')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const words = clean
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
  
  // 去重并限制数量
  const uniqueWords = [...new Set(words)].slice(0, 10)
  
  // 如果没有提取到关键词，使用默认（偏服饰/生活方式，避免风景图）
  if (uniqueWords.length === 0) {
    return ['women', 'fashion', 'lifestyle', 'clothing', 'casual']
  }
  
  return uniqueWords.length >= 5 ? uniqueWords : [...uniqueWords, 'fashion', 'lifestyle', 'women', 'style', 'outfit'].slice(0, 5)
}

function chooseBias(text: string) {
  const t = (text || '').toLowerCase()

  const isFashion =
    /\b(boutique|fashion|outfit|dress|dresses|denim|jeans|jacket|coat|top|tops|skirt|skirts|sweater|knit|style|styling|wardrobe|women|womens|accessories|handbag|bags|shoes)\b/.test(
      t
    )
  const isTravel =
    /\b(travel|trip|vacation|itinerary|hotel|flight|airport|backpacking|road\s?trip|beach|resort|tour|visa)\b/.test(
      t
    )
  const isFood =
    /\b(recipe|cook|cooking|bake|baking|kitchen|meal|restaurant|cuisine|coffee|tea|dessert)\b/.test(t)
  const isTech =
    /\b(software|developer|programming|ai|machine\s?learning|cloud|saas|startup|marketing|analytics|seo|ecommerce)\b/.test(
      t
    )

  if (isFashion) return 'women fashion boutique outfit lifestyle clothing model'
  if (isTravel) return 'travel lifestyle city street culture hotel'
  if (isFood) return 'food cooking kitchen lifestyle restaurant'
  if (isTech) return 'technology workspace laptop office startup'

  // default: lifestyle / editorial
  return 'lifestyle editorial minimal'
}

function scorePhoto(
  photo: any,
  positiveTerms: string[]
): number {
  const text =
    `${photo?.description || ''} ${photo?.alt_description || ''} ${(photo?.tags || [])
      .map((t: any) => t?.title || '')
      .join(' ')}`.toLowerCase()

  let score = 0

  // Match positive terms
  for (const term of positiveTerms.slice(0, 10)) {
    const t = String(term || '').toLowerCase()
    if (!t) continue
    if (text.includes(t)) score += 6
  }

  // Strong fashion signals
  if (/\b(woman|women|model|outfit|fashion|dress|boutique|clothing|style)\b/.test(text)) score += 12

  // Penalize common irrelevant landscape/nature terms
  if (/\b(mountain|landscape|scenery|forest|ocean|sea|beach|sunset|sky|lake|waterfall|river|snow|valley|cliff|hiking|trail)\b/.test(text)) score -= 20

  // Mild penalty: abstract / pattern / texture (often off-topic for boutique posts)
  if (/\b(abstract|texture|pattern|wallpaper)\b/.test(text)) score -= 6

  // Prefer real-looking photos (not illustrations)
  if (/\b(illustration|vector|render|3d)\b/.test(text)) score -= 10

  return score
}

async function fetchUnsplashImages({
  query,
  desiredCount,
  positiveTerms,
}: {
  query: string
  desiredCount: number
  positiveTerms: string[]
}) {
  const perPage = 30

  const url = new URL('https://api.unsplash.com/search/photos')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', String(perPage))
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('content_filter', 'high')
  url.searchParams.set('order_by', 'relevant')

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    console.error('Unsplash API error:', res.status, await res.text())
    return []
  }

  const data = await res.json()
  if (!Array.isArray(data.results) || data.results.length === 0) return []

  const ranked = data.results
    .map((photo: any) => ({
      photo,
      score: scorePhoto(photo, positiveTerms),
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .map((x: any) => x.photo)

  const picked = ranked.slice(0, Math.min(desiredCount, ranked.length))

  return picked.map((photo: any, index: number) => ({
    id: photo.id || `unsplash-${index}`,
    url: photo.urls?.regular || photo.urls?.full || '',
    thumbnail: photo.urls?.small || photo.urls?.thumb || '',
    description:
      photo.description ||
      photo.alt_description ||
      `Image ${index + 1} from Unsplash`,
    source: 'unsplash',
    photographer: photo.user?.name || '',
    photographerUrl: photo.user?.links?.html || '',
  }))
}

