#!/bin/bash
# 在服务器 Ediora-app/app 目录下执行: bash scripts/server-patch-article-gen.sh
set -e
cd "$(dirname "$0")/.." || cd /home/admin/Ediora-app/app

cp lib/spark.ts "lib/spark.ts.bak.$(date +%F-%H%M%S)"
cp app/admin/articles/page.tsx "app/admin/articles/page.tsx.bak.$(date +%F-%H%M%S)"

python3 << 'PYEOF'
from pathlib import Path

def patch(path: str, old: str, new: str, label: str) -> None:
    p = Path(path)
    t = p.read_text(encoding="utf-8")
    if new in t:
        print(f"[skip] {label}: already patched")
        return
    if old not in t:
        print(f"[warn] {label}: old block not found, open {path} and patch manually")
        return
    p.write_text(t.replace(old, new, 1), encoding="utf-8")
    print(f"[ok] {label}")

OLD_SPARK = """        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content)
        return {
          content: parsed.content || '',
          excerpt: parsed.excerpt || '',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        }"""

NEW_SPARK = """        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content)
        let articleContent = String(parsed.content || '').trim()
        // 偶发双层 JSON 字符串
        if (articleContent.startsWith('{') && articleContent.includes('"content"')) {
          try {
            const inner = JSON.parse(articleContent)
            if (inner?.content) articleContent = String(inner.content).trim()
          } catch {
            // ignore
          }
        }
        const plainLen = articleContent.replace(/<[^>]*>/g, '').trim().length
        if (plainLen < 150) {
          console.warn(`[${model}] 正文过短(${plainLen}字)，尝试下一个模型`)
          continue
        }
        return {
          content: articleContent,
          excerpt: parsed.excerpt || '',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        }"""

OLD_PAGE = """          // 生成配图
          const imagesRes = await fetch('/api/auto-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titleObj.name }),
          })
          const imagesData = await imagesRes.json()

          // 选择前3张图片（直接取对象，避免 id 对比导致为空）
          const selectedImagesData = (imagesData.images || []).slice(0, 3)

          // 将图片插入到文章内容中
          let finalContent = contentData.content
          if (selectedImagesData.length > 0) {
            const parts = finalContent.split(/<h3>/)
            let newContent = parts[0]
            const imagesPerPart = Math.ceil(selectedImagesData.length / Math.max(parts.length - 1, 1))
            let imageIndex = 0

            for (let i = 1; i < parts.length; i++) {
              const part = parts[i]
              const [title, ...contentParts] = part.split('</h3>')
              const content = contentParts.join('</h3>')
              newContent += `<h3>${title}</h3>`
              const firstParagraph = content.match(/<p>[\\s\\S]*?<\\/p>/)?.[0] || ''
              newContent += firstParagraph

              const partImages = selectedImagesData.slice(imageIndex, imageIndex + imagesPerPart)
              if (partImages.length > 0) {
                const imageHtml = partImages.map((img: { url: string; description?: string }) => {
                  return `<figure style="margin: 30px 0; text-align: center;">
                    <img src="${img.url}" alt="${img.description || titleObj.name}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                    ${img.description ? `<figcaption style="margin-top: 12px; color: #666; font-size: 14px; font-style: italic;">${img.description}</figcaption>` : ''}
                  </figure>`
                }).join('\\n')
                newContent += imageHtml
              }

              const remainingContent = content.replace(firstParagraph, '')
              newContent += remainingContent
              imageIndex += imagesPerPart
            }
            finalContent = newContent
          }"""

NEW_PAGE = """          const plainTextLen = finalContentRaw.replace(/<[^>]*>/g, '').trim().length
          if (plainTextLen < 150) {
            failCount++
            console.warn(`生成正文过短，已跳过: ${titleObj.name}`, plainTextLen)
            continue
          }

          // 生成配图（带上正文上下文，提高与主题相关性）
          const imagesRes = await fetch('/api/auto-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: titleObj.name,
              count: 8,
              context: `${titleObj.name}\\n\\n${finalContentRaw}`.trim(),
            }),
          })
          const imagesData = await imagesRes.json()

          // 选择前3张图片（直接取对象，避免 id 对比导致为空）
          const selectedImagesData = (imagesData.images || []).slice(0, 3)

          const buildFigureHtml = (images: Array<{ url: string; description?: string }>) =>
            images
              .map((img) => {
                return `<figure style="margin: 30px 0; text-align: center;">
                    <img src="${img.url}" alt="${img.description || titleObj.name}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                    ${img.description ? `<figcaption style="margin-top: 12px; color: #666; font-size: 14px; font-style: italic;">${img.description}</figcaption>` : ''}
                  </figure>`
              })
              .join('\\n')

          // 将图片插入到文章内容中（必须用规范化后的 finalContentRaw）
          let finalContent = finalContentRaw
          if (selectedImagesData.length > 0) {
            if (!/<h3\\b/i.test(finalContent)) {
              const firstParagraph = finalContent.match(/<p>[\\s\\S]*?<\\/p>/)?.[0] || ''
              if (firstParagraph) {
                finalContent = finalContent.replace(
                  firstParagraph,
                  `${firstParagraph}\\n${buildFigureHtml(selectedImagesData)}`
                )
              } else {
                finalContent += buildFigureHtml(selectedImagesData)
              }
            } else {
              const parts = finalContent.split(/<h3>/)
              let newContent = parts[0]
              const imagesPerPart = Math.ceil(
                selectedImagesData.length / Math.max(parts.length - 1, 1)
              )
              let imageIndex = 0

              for (let i = 1; i < parts.length; i++) {
                const part = parts[i]
                const [title, ...contentParts] = part.split('</h3>')
                const content = contentParts.join('</h3>')
                newContent += `<h3>${title}</h3>`
                const firstParagraph = content.match(/<p>[\\s\\S]*?<\\/p>/)?.[0] || ''
                newContent += firstParagraph

                const partImages = selectedImagesData.slice(imageIndex, imageIndex + imagesPerPart)
                if (partImages.length > 0) {
                  newContent += buildFigureHtml(partImages)
                }

                const remainingContent = content.replace(firstParagraph, '')
                newContent += remainingContent
                imageIndex += imagesPerPart
              }
              finalContent = newContent
            }
          }"""

patch("lib/spark.ts", OLD_SPARK, NEW_SPARK, "spark.ts generateArticle")
patch("app/admin/articles/page.tsx", OLD_PAGE, NEW_PAGE, "articles batch generate")
PYEOF

echo "Done. Next: npm run build && pm2 restart all"
