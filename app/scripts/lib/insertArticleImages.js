/**
 * 将配图插入 HTML 正文（与后台批量发布逻辑一致）
 * @param {string} content
 * @param {Array<{ url: string; description?: string }>} images
 * @param {string} title
 * @returns {string}
 */
function buildFigureHtml(images, title) {
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
 * @param {string} content
 * @returns {string}
 */
function stripExistingFigures(content) {
  return String(content || '').replace(/<figure[\s\S]*?<\/figure>/gi, '')
}

/**
 * @param {string} content
 * @param {Array<{ url: string; description?: string }>} selectedImages
 * @param {string} title
 * @returns {string}
 */
function insertImagesIntoContent(content, selectedImages, title) {
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

module.exports = {
  buildFigureHtml,
  stripExistingFigures,
  insertImagesIntoContent,
}
