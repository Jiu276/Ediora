export type TocHeading = {
  id: string
  text: string
  level: 1 | 2 | 3
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
}

/**
 * 从 HTML 中提取 h1/h2/h3，并为这些标题注入 id，方便目录点击滚动。
 * - 仅在浏览器环境可用；这些模板都是 client component。
 * - 如果解析失败，会回退到原 HTML，不影响正文渲染。
 */
export function addHeadingIdsAndExtractToc(html: string, maxDepth: 1 | 2 | 3 = 3) {
  if (!html) return { htmlWithIds: html, headings: [] as TocHeading[] }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const headingsEls = Array.from(doc.body.querySelectorAll<HTMLElement>('h1,h2,h3'))

    const usedIds = new Map<string, number>()
    const headings: TocHeading[] = []

    for (const el of headingsEls) {
      const level = Number(el.tagName.replace('H', '')) as 1 | 2 | 3
      if (level > maxDepth) continue

      const text = (el.textContent || '').trim().replace(/\s+/g, ' ')
      if (!text) continue

      const baseId = slugify(text) || 'section'
      const nextCount = (usedIds.get(baseId) ?? 0) + 1
      usedIds.set(baseId, nextCount)
      const id = nextCount === 1 ? baseId : `${baseId}-${nextCount}`

      el.setAttribute('id', id)
      headings.push({ id, text, level })
    }

    return { htmlWithIds: doc.body.innerHTML, headings }
  } catch {
    return { htmlWithIds: html, headings: [] as TocHeading[] }
  }
}

