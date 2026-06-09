/**
 * 解析并校验阅读量（非负整数）
 * @param value - 表单或 API 传入值
 * @returns 有效整数；未传则 undefined
 */
export function parseViewCountInput(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined
  }
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    return NaN
  }
  return n
}
