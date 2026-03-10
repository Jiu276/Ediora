import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function containsCJK(input: unknown) {
  if (input == null) return false
  const text = String(input)
  return /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\uAC00-\uD7AF]/.test(text)
}

// GET /api/categories - 获取所有标签类别
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - 创建标签类别
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description } = body
    
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    if (containsCJK(name) || containsCJK(slug) || containsCJK(description)) {
      return NextResponse.json(
        { error: 'Category must be English only (no Chinese characters).' },
        { status: 400 }
      )
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    })
    
    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

