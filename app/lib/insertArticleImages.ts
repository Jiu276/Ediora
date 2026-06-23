/** 配图项 */
export interface ArticleImageItem {
  url: string
  description?: string
  thumbnail?: string
  source?: string
}

/**
 * 构建 figure HTML
 */
function buildFigureHtml(images: ArticleImageItem[], title: string): string {
  return images
    .map((img) => {
      const alt = img.description || title
      const caption = img.description
        ? `<figcaption style="margin-top: 12px; color: #666; font-size: 14px; font-style: italic;">${img.description}</figcaption>`
        : ''
      return `<figure style="margin: 30px 0; text-align: center;">
                    <img src="${img.url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                    ${caption}
                  </figure>`
    })
    .join('\n')
}

/**
 * 移除已有 figure，避免重复插入
 */
function stripExistingFigures(content: string): string {
  return String(content || '').replace(/<figure[\s\S]*?<\/figure>/gi, '')
}

/**
 * 将选中配图插入 HTML 正文（与后台批量发布逻辑一致）
 */
export function insertImagesIntoContent(
  content: string,
  selectedImages: ArticleImageItem[],
  title: string,
): string {
  if (!selectedImages.length) return content

  let finalContent = stripExistingFigures(content)
  const figureHtml = buildFigureHtml(selectedImages, title)

  if (!/<h3\b/i.test(finalContent)) {
    const firstParagraph = finalContent.match(/<p>[\s\S]*?<\/p>/)?.[0] || ''
    if (firstParagraph) {
      finalContent = finalContent.replace(
        firstParagraph,
        `${firstParagraph}\n${figureHtml}`,
      )
    } else {
      finalContent += figureHtml
    }
    return finalContent
  }

  const parts = finalContent.split(/<h3>/)
  let newContent = parts[0]
  const imagesPerPart = Math.ceil(
    selectedImages.length / Math.max(parts.length - 1, 1),
  )
  let imageIndex = 0

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i]
    const [heading, ...contentParts] = part.split('</h3>')
    const sectionContent = contentParts.join('</h3>')
    newContent += `<h3>${heading}</h3>`
    const firstParagraph = sectionContent.match(/<p>[\s\S]*?<\/p>/)?.[0] || ''
    newContent += firstParagraph

    const partImages = selectedImages.slice(imageIndex, imageIndex + imagesPerPart)
    if (partImages.length > 0) {
      newContent += buildFigureHtml(partImages, title)
    }

    newContent += sectionContent.replace(firstParagraph, '')
    imageIndex += imagesPerPart
  }

  return newContent
}
