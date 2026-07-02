/** 联盟推广链接（如 linkhaitao）可能较长 */
export const MAX_ARTICLE_LINK_URL_LENGTH = 2000

/**
 * @param url - 待校验链接
 */
export function normalizeArticleLinkUrl(url: unknown): string {
  return String(url || '').trim()
}

/**
 * @param url - 待校验链接
 */
export function isArticleLinkUrlTooLong(url: string): boolean {
  return url.length > MAX_ARTICLE_LINK_URL_LENGTH
}

/**
 * @param links - 关键词链接列表
 * @returns 首个超长项，无则 null
 */
export function findOverlongArticleLink(
  links: Array<{ keyword?: unknown; url?: unknown }>,
): { keyword: string; length: number } | null {
  for (const link of links) {
    const url = normalizeArticleLinkUrl(link.url)
    if (isArticleLinkUrlTooLong(url)) {
      return {
        keyword: String(link.keyword || '').trim() || '(empty)',
        length: url.length,
      }
    }
  }
  return null
}
