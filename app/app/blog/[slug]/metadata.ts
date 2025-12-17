import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const article = await prisma.article.findFirst({
    where: {
      slug: params.slug,
      status: 'published',
      deletedAt: null,
    },
  })

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:50812'
  
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || article.title,
    keywords: article.metaKeywords?.split(',').map(k => k.trim()).join(', '),
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || article.title,
      type: 'article',
      images: article.featuredImage ? [article.featuredImage] : [],
      url: `${baseUrl}/blog/${article.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || article.title,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
  }
}


