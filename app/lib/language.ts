export function containsCJK(input: unknown): boolean {
  if (input == null) return false
  const text = Array.isArray(input) ? input.join(' ') : String(input)
  return /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\uAC00-\uD7AF]/.test(text)
}
