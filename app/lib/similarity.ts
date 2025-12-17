/**
 * 字符串相似度计算工具
 */

/**
 * 计算两个字符串的 Levenshtein 距离
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  // 初始化矩阵
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // 填充矩阵
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // 删除
          matrix[i][j - 1] + 1, // 插入
          matrix[i - 1][j - 1] + 1 // 替换
        )
      }
    }
  }

  return matrix[len1][len2]
}

/**
 * 计算两个字符串的相似度（0-1之间，1表示完全相同）
 * @param str1 字符串1
 * @param str2 字符串2
 * @returns 相似度分数（0-1）
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0
  if (str1.length === 0 || str2.length === 0) return 0.0

  const maxLen = Math.max(str1.length, str2.length)
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  return 1 - distance / maxLen
}

/**
 * 检查新标签是否与现有标签相似
 * @param newTagName 新标签名称
 * @param existingTags 现有标签名称数组
 * @param threshold 相似度阈值（默认 0.8）
 * @returns 如果找到相似标签，返回相似标签名称，否则返回 null
 */
export function findSimilarTag(
  newTagName: string,
  existingTags: string[],
  threshold: number = 0.8
): string | null {
  for (const existingTag of existingTags) {
    const similarity = calculateSimilarity(newTagName, existingTag)
    if (similarity >= threshold) {
      return existingTag
    }
  }
  return null
}

/**
 * 验证标签名称是否有效
 * @param tagName 标签名称
 * @returns 是否有效
 */
export function validateTagName(tagName: string): { valid: boolean; error?: string } {
  if (!tagName || tagName.trim().length === 0) {
    return { valid: false, error: '标签名称不能为空' }
  }

  const trimmed = tagName.trim()

  // 长度检查：2-20 个字符
  if (trimmed.length < 2) {
    return { valid: false, error: '标签名称至少需要 2 个字符' }
  }
  if (trimmed.length > 20) {
    return { valid: false, error: '标签名称不能超过 20 个字符' }
  }

  // 格式检查：不能以数字或特殊字符开头
  if (/^[0-9\W]/.test(trimmed)) {
    return { valid: false, error: '标签名称不能以数字或特殊字符开头' }
  }

  // 不能包含某些特殊字符
  if (/[<>{}[\]\\\/]/.test(trimmed)) {
    return { valid: false, error: '标签名称不能包含特殊字符' }
  }

  return { valid: true }
}

