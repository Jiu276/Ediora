import { containsCJK } from '@/lib/language'
import { normalizeArticleContent } from '@/lib/normalizeArticleContent'

/** @description API 返回给前端的英文校验错误文案 */
export const ENGLISH_ONLY_ERROR = '内容必须为英文（不可包含中文字符）'

export type EnglishArticleFields = {
  title?: unknown
  content?: unknown
  excerpt?: unknown
  metaTitle?: unknown
  metaDescription?: unknown
  metaKeywords?: unknown
  tags?: unknown
  images?: Array<{ description?: unknown }>
  links?: Array<{ keyword?: unknown; url?: unknown }>
}

/**
 * 规范化正文/摘要，并校验是否含 CJK 字符。
 */
export function prepareEnglishArticleFields(
  fields: EnglishArticleFields,
  options?: { normalize?: boolean },
) {
  const normalize = options?.normalize !== false
  const content =
    fields.content !== undefined && fields.content !== null
      ? normalize
        ? normalizeArticleContent(fields.content)
        : String(fields.content)
      : undefined
  const excerpt =
    fields.excerpt !== undefined && fields.excerpt !== null
      ? normalize
        ? normalizeArticleContent(fields.excerpt)
        : String(fields.excerpt)
      : undefined

  const invalidField = findFirstCJKField({
    ...fields,
    content,
    excerpt,
  })

  if (invalidField) {
    return { ok: false as const, error: ENGLISH_ONLY_ERROR, content, excerpt }
  }

  return { ok: true as const, content, excerpt }
}

/**
 * @param fields - 待检测字段
 * @returns 首个含 CJK 的字段名，无则 null
 */
export function findFirstCJKField(fields: EnglishArticleFields): string | null {
  const checks: Array<[string, unknown]> = [
    ['title', fields.title],
    ['content', fields.content],
    ['excerpt', fields.excerpt],
    ['metaTitle', fields.metaTitle],
    ['metaDescription', fields.metaDescription],
    ['metaKeywords', fields.metaKeywords],
    ['tags', fields.tags],
  ]

  for (const [name, value] of checks) {
    if (containsCJK(value)) return name
  }

  if (Array.isArray(fields.images)) {
    for (const img of fields.images) {
      if (containsCJK(img?.description)) return 'images.description'
    }
  }

  if (Array.isArray(fields.links)) {
    for (const link of fields.links) {
      if (containsCJK(link?.keyword) || containsCJK(link?.url)) return 'links'
    }
  }

  return null
}

/**
 * 清洗配图说明，避免中文写入 figcaption。
 */
export function sanitizeImageDescriptions<T extends { description?: string | null }>(
  images: T[],
  fallback: string,
): T[] {
  return images.map((img, index) => {
    const desc = String(img.description || '').trim()
    const safe =
      desc && !containsCJK(desc) ? desc : `Image ${index + 1}: ${fallback}`
    return { ...img, description: safe }
  })
}
