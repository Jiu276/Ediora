/** 配图项 */
export interface ArticleImageItem {
  url: string
  description?: string
  thumbnail?: string
  source?: string
}

/**
 * 构建单张 figure HTML
 */
export function buildSingleFigureHtml(image: ArticleImageItem, title: string): string {
  const alt = image.description || title
  const caption = image.description
    ? `<figcaption style="margin-top: 12px; color: #666; font-size: 14px; font-style: italic;">${image.description}</figcaption>`
    : ''
  return `<figure style="margin: 30px 0; text-align: center;">
                    <img src="${image.url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                    ${caption}
                  </figure>`
}

/**
 * 构建 figure HTML
 */
function buildFigureHtml(images: ArticleImageItem[], title: string): string {
  return images.map((img) => buildSingleFigureHtml(img, title)).join('\n')
}

/**
 * 移除已有 figure，避免重复插入
 */
function stripExistingFigures(content: string): string {
  return String(content || '').replace(/<figure[\s\S]*?<\/figure>/gi, '')
}

/**
 * 统计正文中可替换的图片位（figure 或独立 img）
 */
export function countContentImageSlots(content: string): number {
  const figures = (String(content || '').match(/<figure[\s\S]*?<\/figure>/gi) || []).length
  if (figures > 0) return figures
  return (String(content || '').match(/<img\b/gi) || []).length
}

/**
 * 将选中配图插入 HTML 正文（无已有图片时使用）
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

/**
 * 用新配图按顺序替换正文中已有 figure / img；多余新图则追加插入
 */
export function replaceImagesInContent(
  content: string,
  selectedImages: ArticleImageItem[],
  title: string,
): string {
  if (!selectedImages.length) return content

  let imgIndex = 0
  const hasFigures = /<figure[\s\S]*?<\/figure>/i.test(content)

  if (hasFigures) {
    let result = content.replace(/<figure[\s\S]*?<\/figure>/gi, () => {
      if (imgIndex >= selectedImages.length) return ''
      return buildSingleFigureHtml(selectedImages[imgIndex++], title)
    })
    if (imgIndex < selectedImages.length) {
      result = insertImagesIntoContent(result, selectedImages.slice(imgIndex), title)
    }
    return result
  }

  if (/<img\b/i.test(content)) {
    let result = content.replace(/<img\b[^>]*>/gi, () => {
      if (imgIndex >= selectedImages.length) return ''
      const img = selectedImages[imgIndex++]
      const alt = img.description || title
      return `<img src="${img.url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />`
    })
    if (imgIndex < selectedImages.length) {
      result = insertImagesIntoContent(result, selectedImages.slice(imgIndex), title)
    }
    return result
  }

  return insertImagesIntoContent(content, selectedImages, title)
}
