/**
 * 正文纯文本最少字符数。
 * 英文约 5–6 字符/词 → 5500 字符 ≈ 900–1100 词（中等偏长下限）。
 */
export const MIN_ARTICLE_PLAIN_CHARS = 5500

/** 推荐目标区间（用于 Prompt） */
export const TARGET_ARTICLE_WORDS = '1200-2000'

/**
 * @param html - HTML 正文
 * @returns 去掉标签后的纯文本长度
 */
export function getPlainTextLength(html: string): number {
  return String(html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .length
}

/**
 * 是否达到中等偏长篇幅
 */
export function isMediumOrLongArticle(html: string): boolean {
  return getPlainTextLength(html) >= MIN_ARTICLE_PLAIN_CHARS
}

/** 追加到生成 Prompt 的长度要求（英文） */
export const ARTICLE_LENGTH_PROMPT = `Length requirement: medium-to-long article, about ${TARGET_ARTICLE_WORDS} words in the body (minimum ~900 words, roughly 5500+ characters of plain text). Use 5-6 h3 sections; each section needs 2-3 substantial paragraphs (3-5 sentences each). Add bullet lists where helpful. Do not write one-sentence sections.`
