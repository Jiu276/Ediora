/**
 * 关键词提取工具
 * 从文章标题和内容中提取关键词
 */

/**
 * 中文停用词列表（简化版）
 */
const STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这',
  '为', '与', '及', '或', '等', '以及', '以及', '以及', '以及', '以及',
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could',
])

/**
 * 从文本中提取关键词
 * @param text 文本内容
 * @param maxKeywords 最大关键词数量
 * @returns 关键词数组
 */
export function extractKeywords(text: string, maxKeywords: number = 5): string[] {
  if (!text) return []

  // 移除 HTML 标签
  const cleanText = text.replace(/<[^>]*>/g, ' ')

  // 移除标点符号和特殊字符，保留中文、英文、数字
  const normalizedText = cleanText.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')

  // 分词（简单版本：按空格和常见分隔符分割）
  const words = normalizedText
    .split(/[\s\n\r\t，。、；：！？]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0)

  // 统计词频
  const wordFreq: Record<string, number> = {}
  words.forEach((word) => {
    // 过滤停用词和单字符
    if (word.length < 2 || STOP_WORDS.has(word.toLowerCase())) {
      return
    }

    // 中文词：2-6 个字符
    if (/^[\u4e00-\u9fa5]+$/.test(word)) {
      if (word.length >= 2 && word.length <= 6) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    }
    // 英文词：2-20 个字符
    else if (/^[a-zA-Z]+$/.test(word)) {
      if (word.length >= 2 && word.length <= 20) {
        wordFreq[word.toLowerCase()] = (wordFreq[word.toLowerCase()] || 0) + 1
      }
    }
  })

  // 按频率排序，取前 N 个
  const sortedWords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word)

  return sortedWords
}

/**
 * 从文章标题和内容中提取最佳关键词作为标签候选
 * @param title 文章标题
 * @param content 文章内容（可选）
 * @returns 最佳关键词（用于创建新标签）
 */
export function extractBestKeywordForTag(title: string, content?: string): string | null {
  const keywords = extractKeywords(`${title} ${content || ''}`, 10)

  if (keywords.length === 0) return null

  // 优先选择较短的、有意义的词（2-4 个字符）
  const preferredKeywords = keywords.filter((k) => {
    if (/^[\u4e00-\u9fa5]+$/.test(k)) {
      return k.length >= 2 && k.length <= 4
    }
    return k.length >= 2 && k.length <= 15
  })

  return preferredKeywords[0] || keywords[0] || null
}

