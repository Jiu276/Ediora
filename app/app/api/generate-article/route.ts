import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateArticle } from '@/lib/spark'
import { normalizeArticleContent } from '@/lib/normalizeArticleContent'
import { containsCJK } from '@/lib/language'
import {
  ENGLISH_ONLY_ERROR,
  prepareEnglishArticleFields,
} from '@/lib/articleEnglishGuard'
import { ARTICLE_LENGTH_PROMPT } from '@/lib/articleLength'
import { buildMediumEnglishFallbackArticle } from '@/lib/generateEnglishFallback'

// POST /api/generate-article - 生成文章内容（星火API，失败时回退模板）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, categoryId, domains = [], prompt, forceFallback = false } = body
    
    if (!title || !title.trim()) {
      return NextResponse.json({ error: '缺少标题' }, { status: 400 })
    }
    if (containsCJK(title)) {
      return NextResponse.json({ error: '标题必须为英文（不可包含中文字符）' }, { status: 400 })
    }

    // 获取类别信息
    let categoryName = ''
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          deletedAt: null,
        },
      })
      if (category) {
        // If DB category name is Chinese, avoid leaking it into generation prompt.
        categoryName = containsCJK(category.name) ? '' : category.name
      }
    }
    
    const buildFallbackContent = (articleTitle: string) =>
      buildMediumEnglishFallbackArticle(articleTitle, {
        category: categoryName,
        domains: Array.isArray(domains) ? domains : [],
      })

    // 优先使用星火 API
    if (forceFallback) {
      const articleContent = normalizeArticleContent(buildFallbackContent(title))
      if (containsCJK(articleContent)) {
        return NextResponse.json({ error: ENGLISH_ONLY_ERROR }, { status: 500 })
      }

      const excerpt = articleContent
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 200)

      return NextResponse.json({ content: articleContent, excerpt })
    }

    try {
      const result = await generateArticle({
        title: title.trim(),
        userPrompt: `${prompt || ''}\n\n${ARTICLE_LENGTH_PROMPT}\n\nIMPORTANT: Write the article in English only. Do not use any Chinese characters.`,
        category: categoryName,
        domains,
      })
      const prepared = prepareEnglishArticleFields({
        content: result?.content,
        excerpt: result?.excerpt,
        tags: result?.tags,
      })
      if (prepared.ok) {
        return NextResponse.json({
          ...result,
          content: prepared.content ?? '',
          excerpt: prepared.excerpt ?? '',
        })
      }
      console.warn('Spark generateArticle returned non-English content, fallback to template')
    } catch (err) {
      console.warn('Spark generateArticle failed, fallback to template:', err)
    }

    const articleContent = normalizeArticleContent(buildFallbackContent(title))
    if (containsCJK(articleContent)) {
      return NextResponse.json({ error: ENGLISH_ONLY_ERROR }, { status: 500 })
    }

    const excerpt = articleContent
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200)

    return NextResponse.json({ content: articleContent, excerpt })
  } catch (error) {
    console.error('Error generating article:', error)
    return NextResponse.json(
      { error: 'Failed to generate article' },
      { status: 500 }
    )
  }
}

