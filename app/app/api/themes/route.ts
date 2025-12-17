import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'

// GET /api/themes - 列出所有主题
export async function GET() {
  try {
    const themes = await prisma.theme.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(themes)
  } catch (error) {
    console.error('Error fetching themes:', error)
    return NextResponse.json({ error: 'Failed to fetch themes' }, { status: 500 })
  }
}

// POST /api/themes - 创建主题
export async function POST(request: NextRequest) {
  try {
    const { name, slug, description } = await request.json()

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: '主题名称不能为空' }, { status: 400 })
    }

    const finalSlug = (slug && slug.trim()) || generateSlug(name)

    const theme = await prisma.theme.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
      },
    })

    return NextResponse.json(theme, { status: 201 })
  } catch (error: any) {
    console.error('Error creating theme:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: '主题标识已存在，请更换 slug' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create theme' }, { status: 500 })
  }
}


