import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/init-data - 初始化数据库预设数据
export async function POST(_request: NextRequest) {
  try {
    // 检查 Prisma Client 是否可用
    if (!prisma || !prisma.category) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 503 }
      )
    }

    const results = {
      categories: 0,
      articleTitles: 0,
      themes: 0,
    }

    // 1. 插入默认标签类别（展示名英文，slug 与 database/schema.sql 一致）
    const categories = [
      { id: '1', name: 'Lifestyle', slug: 'life', description: 'Lifestyle related articles' },
      { id: '2', name: 'Travel', slug: 'travel', description: 'Travel related articles' },
      { id: '3', name: 'Technology', slug: 'tech', description: 'Technology related articles' },
      { id: '4', name: 'Food', slug: 'food', description: 'Food related articles' },
      { id: '5', name: 'Health', slug: 'health', description: 'Health related articles' },
      { id: '6', name: 'Education', slug: 'education', description: 'Education related articles' },
      { id: '7', name: 'Entertainment', slug: 'entertainment', description: 'Entertainment related articles' },
      { id: '8', name: 'Finance', slug: 'finance', description: 'Finance related articles' },
      { id: '9', name: 'Sports', slug: 'sports', description: 'Sports related articles' },
      { id: '10', name: 'Fashion', slug: 'fashion', description: 'Fashion related articles' },
    ]

    for (const cat of categories) {
      try {
        await prisma.category.upsert({
          where: { id: cat.id },
          update: { 
            name: cat.name, 
            slug: cat.slug, 
            description: cat.description,
            updatedAt: new Date(),
          },
          create: {
            ...cat,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        results.categories++
      } catch (error) {
        console.error(`Error upserting category ${cat.id}:`, error)
      }
    }

    // 2. 插入默认文章标题
    const articleTitles = [
      { id: '1', name: '默认标题', slug: 'default-title', description: '默认文章标题' },
      { id: '2', name: '标准标题', slug: 'standard-title', description: '标准文章标题' },
    ]

    for (const title of articleTitles) {
      try {
        await prisma.articleTitle.upsert({
          where: { id: title.id },
          update: { 
            name: title.name, 
            slug: title.slug, 
            description: title.description,
            updatedAt: new Date(),
          },
          create: {
            ...title,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        results.articleTitles++
      } catch (error) {
        console.error(`Error upserting article title ${title.id}:`, error)
      }
    }

    // 3. 插入默认主题（与 database/init-themes.sql + database/schema.sql 中的扩展主题一致）
    const themes = [
      { id: '1', name: '默认主题', slug: 'default', description: '现代简洁风格，适合通用博客', isActive: true },
      { id: '2', name: '深色主题', slug: 'dark', description: '深色主题，护眼舒适', isActive: false },
      { id: '3', name: '简约主题', slug: 'minimal', description: '极简风格，专注内容本身', isActive: false },
      { id: '4', name: '杂志风格', slug: 'magazine', description: '杂志排版风格，适合内容丰富', isActive: false },
      { id: '5', name: '卡片风格', slug: 'card', description: '大卡片风格，视觉冲击力强', isActive: false },
      {
        id: '6',
        name: 'Bootstrap Blog',
        slug: 'bootstrap-blog',
        description: 'Bootstrap 5 风格博客主题，经典现代设计',
        isActive: false,
      },
      {
        id: '7',
        name: '综合类博客',
        slug: 'comprehensive',
        description: '综合类博客主题，现代简约设计，适合多领域内容',
        isActive: false,
      },
      {
        id: '8',
        name: '多功能杂志',
        slug: 'magazine-multi',
        description: '杂志风格多功能主题，深色头部，红色强调色，适合内容丰富',
        isActive: false,
      },
      {
        id: '9',
        name: '简约休闲生活',
        slug: 'minimal-lifestyle',
        description: '简约休闲生活主题，浅色配色，优雅设计，适合生活方式博客',
        isActive: false,
      },
      {
        id: 'travel-blog',
        name: 'Travel Blog',
        slug: 'travel-blog',
        description: 'Perfect for travel and adventure content',
        isActive: false,
      },
      {
        id: 'modern-magazine',
        name: 'Modern Magazine',
        slug: 'modern-magazine',
        description: 'Modern magazine style with sidebar',
        isActive: false,
      },
      {
        id: 'modern-simple',
        name: 'Modern Simple',
        slug: 'modern-simple',
        description: 'Clean and minimal modern design',
        isActive: false,
      },
      {
        id: 'lifestyle-daily',
        name: 'Lifestyle Daily',
        slug: 'lifestyle-daily',
        description: 'Perfect for lifestyle and daily content',
        isActive: false,
      },
      {
        id: 'zen-blog',
        name: 'Zen Blog',
        slug: 'zen-blog',
        description: 'Peaceful and mindful blog design',
        isActive: false,
      },
    ]

    for (const theme of themes) {
      try {
        await prisma.theme.upsert({
          where: { id: theme.id },
          update: { 
            name: theme.name, 
            slug: theme.slug, 
            description: theme.description, 
            isActive: theme.isActive,
            updatedAt: new Date(),
          },
          create: {
            ...theme,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        results.themes++
      } catch (error) {
        console.error(`Error upserting theme ${theme.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: '初始化数据成功',
      results,
    })
  } catch (error: any) {
    console.error('Error initializing data:', error)
    return NextResponse.json(
      { error: 'Failed to initialize data', details: error.message },
      { status: 500 }
    )
  }
}

