/**
 * 在 HTML 文本块内注入关键词链接，避免破坏 img/figure 等标签属性。
 */

/** @param {string} str */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * @param html - HTML 正文
 * @param links - 关键词与 URL
 */
export function injectKeywordLinksIntoHtml(
  html: string,
  links: Array<{ keyword: string; url: string }>,
): string {
  if (!html || !Array.isArray(links) || links.length === 0) return html

  const safeLinks = links
    .map((l) => ({
      keyword: String(l.keyword || '').trim(),
      url: String(l.url || '').trim(),
    }))
    .filter((l) => l.keyword && l.url)

  if (safeLinks.length === 0) return html

  const blockRegex = /<(p|h1|h2|h3|h4|h5|h6|figcaption)([^>]*)>([\s\S]*?)<\/\1>/gi

  return html.replace(blockRegex, (_match, tag, attrs, inner) => {
    let updated = inner
    for (const link of safeLinks) {
      const re = new RegExp(`\\b${escapeRegExp(link.keyword)}\\b`, 'g')
      updated = updated.replace(
        re,
        `<a href="${link.url}" target="_blank" rel="nofollow noopener noreferrer">${link.keyword}</a>`,
      )
    }
    return `<${tag}${attrs}>${updated}</${tag}>`
  })
}
