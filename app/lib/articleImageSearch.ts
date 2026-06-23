const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
  'these', 'those', 'you', 'your', 'our', 'their', 'what', 'which', 'who', 'when', 'where',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'about', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'again', 'further', 'then', 'once',
  'guide', 'ultimate', 'step', 'unlock', 'with', 'into', 'from', 'that', 'this', 'article',
])

/**
 * HTML 转纯文本
 */
export function htmlToPlainText(html: string): string {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 从文本提取英文检索词
 */
export function extractKeywords(input: string): string[] {
  const clean = input
    .replace(/<[^>]*>/g, ' ')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const words = clean
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))

  return Array.from(new Set(words)).slice(0, 12)
}

/**
 * 根据标题/正文推断 Unsplash 检索偏向词
 */
export function chooseImageBias(text: string): string {
  const t = (text || '').toLowerCase()

  const isHairBeauty =
    /\b(hair|haircare|shampoo|conditioner|scalp|salon|curl|curls|shine|length|frizz|strand|blowout|styling|cecred|skincare|moistur|serum|beauty|cosmetic|makeup|lotion|cream)\b/.test(
      t,
    )
  const isFashion =
    /\b(boutique|fashion|outfit|dress|denim|jeans|jacket|coat|top|skirt|sweater|wardrobe|handbag|shoes|grenson|clothing)\b/.test(
      t,
    )
  const isTravel =
    /\b(travel|trip|vacation|itinerary|hotel|flight|airport|backpacking|beach|resort|tour)\b/.test(t)
  const isFood =
    /\b(recipe|cook|cooking|bake|kitchen|meal|restaurant|cuisine|coffee|dessert)\b/.test(t)
  const isTech =
    /\b(software|developer|programming|ai|cloud|saas|startup|marketing|analytics|seo)\b/.test(t)

  if (isHairBeauty) return 'haircare beauty shampoo hair treatment product salon'
  if (isFashion) return 'women fashion outfit clothing shoes lifestyle model'
  if (isTravel) return 'travel city street culture hotel lifestyle'
  if (isFood) return 'food cooking kitchen restaurant lifestyle'
  if (isTech) return 'technology workspace laptop office startup'

  return 'lifestyle editorial product'
}

/**
 * 提取正文各 h3 章节摘要（用于分段配图）
 */
export function extractSectionTexts(html: string): string[] {
  const sections: string[] = []
  const parts = String(html || '').split(/<h3[^>]*>/i)
  for (let i = 1; i < parts.length; i++) {
    const afterHeading = parts[i].split(/<\/h3>/i)[1] || ''
    const plain = htmlToPlainText(afterHeading).slice(0, 500)
    if (plain.length > 40) sections.push(plain)
  }
  return sections
}

/**
 * 为每张配图构建独立检索词（标题 + 章节 + 偏向词）
 */
export function buildImageSearchQueries(
  title: string,
  htmlContext: string,
  count: number,
): string[] {
  const combined = `${title}\n${htmlToPlainText(htmlContext)}`.trim()
  const bias = chooseImageBias(combined)
  const titleKeywords = extractKeywords(title)
  const bodyKeywords = extractKeywords(htmlToPlainText(htmlContext))
  const sections = extractSectionTexts(htmlContext)

  const queries: string[] = []

  for (const section of sections) {
    if (queries.length >= count) break
    const sectionKw = extractKeywords(section)
    const q = [...sectionKw.slice(0, 4), ...titleKeywords.slice(0, 2), ...bias.split(' ').slice(0, 3)]
      .filter(Boolean)
      .slice(0, 6)
      .join(' ')
    if (q) queries.push(q)
  }

  while (queries.length < count) {
    const i = queries.length
    const rotate = bodyKeywords.slice(i, i + 3)
    const q = [
      ...titleKeywords.slice(0, 3),
      ...rotate,
      ...bias.split(' ').slice(0, 3),
    ]
      .filter(Boolean)
      .slice(0, 6)
      .join(' ')
    queries.push(q || `${title} ${bias}`.trim())
  }

  return queries.slice(0, count)
}

/**
 * 无 Unsplash Key 时，按标签生成主题相关占位图（优于随机 picsum）
 */
export function buildTaggedFallbackImage(
  query: string,
  index: number,
  title: string,
): { id: string; url: string; thumbnail: string; description: string; source: string; keyword: string } {
  const tags = extractKeywords(query)
  const biasTags = chooseImageBias(query).split(' ').slice(0, 3)
  const tagStr = [...new Set([...tags.slice(0, 3), ...biasTags])].slice(0, 4).join(',') || 'lifestyle'
  const lock = index + 1

  return {
    id: `tag-${index + 1}-${tagStr.replace(/,/g, '-')}`,
    url: `https://loremflickr.com/800/600/${encodeURIComponent(tagStr)}/all?lock=${lock}`,
    thumbnail: `https://loremflickr.com/400/300/${encodeURIComponent(tagStr)}/all?lock=${lock}`,
    description: `${tagStr.replace(/,/g, ' ')} — ${title}`.slice(0, 120),
    source: 'loremflickr',
    keyword: tagStr,
  }
}
