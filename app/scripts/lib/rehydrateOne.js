const { insertImagesIntoContent } = require('./insertArticleImages')

/**
 * @param {string} baseUrl
 * @param {{ id: string; title: string; content: string; excerpt: string | null }} article
 * @returns {Promise<number>} 插入的图片数量
 */
async function rehydrateOne(baseUrl, article) {
  const imagesRes = await fetch(`${baseUrl}/api/auto-images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: article.title,
      count: 8,
      context: `${article.title}\n\n${article.content || ''}`.trim(),
    }),
  })

  if (!imagesRes.ok) {
    throw new Error(`auto-images failed ${imagesRes.status}: ${await imagesRes.text()}`)
  }

  const imagesData = await imagesRes.json()
  const selected = (imagesData.images || []).slice(0, 3)
  if (selected.length === 0) {
    throw new Error('no images returned')
  }

  const finalContent = insertImagesIntoContent(
    article.content || '',
    selected,
    article.title,
  )

  const putRes = await fetch(`${baseUrl}/api/articles/${article.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: article.title,
      content: finalContent,
      excerpt:
        article.excerpt || finalContent.replace(/<[^>]*>/g, '').trim().slice(0, 200),
      featuredImage: selected[0]?.url || null,
    }),
  })

  if (!putRes.ok) {
    throw new Error(`PUT failed ${putRes.status}: ${await putRes.text()}`)
  }

  const imgPostRes = await fetch(`${baseUrl}/api/articles/${article.id}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images: selected }),
  })

  if (!imgPostRes.ok) {
    throw new Error(`images POST failed ${imgPostRes.status}: ${await imgPostRes.text()}`)
  }

  return selected.length
}

module.exports = { rehydrateOne }
