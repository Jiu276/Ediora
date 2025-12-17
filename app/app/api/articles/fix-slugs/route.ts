import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'

// POST /api/articles/fix-slugs - 修复所有文章的 slug（用于迁移）
export async function POST() {
  try {
    const articles = await prisma.article.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    })
    
    const results = []
    
    for (const article of articles) {
      // 如果 slug 为空或只包含无效字符，重新生成
      if (!article.slug || article.slug.trim() === '' || article.slug === 'article') {
        const newSlug = generateSlug(article.title)
        
        // 确保唯一性
        let finalSlug = newSlug
        let counter = 1
        
        while (true) {
          const existing = await prisma.article.findFirst({
            where: {
              slug: finalSlug,
              id: { not: article.id },
              deletedAt: null,
            },
          })
          
          if (!existing) {
            break
          }
          
          finalSlug = `${newSlug}-${counter}`
          counter++
          
          if (counter > 1000) {
            finalSlug = `${newSlug}-${Date.now()}`
            break
          }
        }
        
        await prisma.article.update({
          where: { id: article.id },
          data: { slug: finalSlug },
        })
        
        results.push({
          id: article.id,
          title: article.title,
          oldSlug: article.slug,
          newSlug: finalSlug,
        })
      }
    }
    
    return NextResponse.json({
      message: `成功修复 ${results.length} 篇文章的 slug`,
      results,
    })
  } catch (error: any) {
    console.error('Error fixing slugs:', error)
    return NextResponse.json(
      { error: 'Failed to fix slugs', details: error.message },
      { status: 500 }
    )
  }
}


