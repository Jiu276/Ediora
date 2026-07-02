/**
 * 在 HTML 文本块内注入关键词链接，避免破坏 img/figure/figcaption 及已有链接。
 */

/** @param {string} str */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const TEXT_BLOCK_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

/**
 * 在纯文本片段中注入关键词链接（跳过已有 HTML 标签内部）
 * @param text - 不含外层块级标签的 inner HTML
 * @param links - 关键词与 URL
 */
function injectLinksIntoTextSegment(
  text: string,
  links: Array<{ keyword: string; url: string }>,
): string {
  if (!text || links.length === 0) return text

  const anchorRegex = /<a\b[\s\S]*?<\/a>/gi
  const parts = text.split(anchorRegex)
  const anchors = text.match(anchorRegex) || []

  const processedParts = parts.map((part) => {
    let updated = part
    for (const link of links) {
      const re = new RegExp(`\\b${escapeRegExp(link.keyword)}\\b`, 'g')
      updated = updated.replace(
        re,
        `<a href="${link.url}" target="_blank" rel="nofollow noopener noreferrer">${link.keyword}</a>`,
      )
    }
    return updated
  })

  let result = ''
  for (let i = 0; i < processedParts.length; i++) {
    result += processedParts[i]
    if (i < anchors.length) result += anchors[i]
  }
  return result
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

  const figurePlaceholders: string[] = []
  let withoutFigures = html.replace(/<figure[\s\S]*?<\/figure>/gi, (match) => {
    const idx = figurePlaceholders.length
    figurePlaceholders.push(match)
    return `__FIGURE_PLACEHOLDER_${idx}__`
  })

  const tagPattern = TEXT_BLOCK_TAGS.join('|')
  const blockRegex = new RegExp(
    `<(${tagPattern})([^>]*)>([\\s\\S]*?)<\\/\\1>`,
    'gi',
  )

  withoutFigures = withoutFigures.replace(blockRegex, (_match, tag, attrs, inner) => {
    const updated = injectLinksIntoTextSegment(String(inner), safeLinks)
    return `<${tag}${attrs}>${updated}</${tag}>`
  })

  return withoutFigures.replace(/__FIGURE_PLACEHOLDER_(\d+)__/g, (_m, idx) => {
    return figurePlaceholders[Number(idx)] ?? ''
  })
}
