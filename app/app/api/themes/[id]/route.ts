import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const theme = await prisma.theme.findFirst({
      where: { id: params.id, deletedAt: null },
    })
    if (!theme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 })
    }
    return NextResponse.json(theme)
  } catch (error) {
    console.error('Error fetching theme:', error)
    return NextResponse.json({ error: 'Failed to fetch theme' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { name, slug, description, isActive } = await request.json()
    const updates: any = {}

    if (name !== undefined) {
      updates.name = name.trim()
    }
    if (description !== undefined) {
      updates.description = description?.trim() || null
    }
    if (slug !== undefined) {
      updates.slug = slug.trim() || generateSlug(name || 'theme')
    }

    if (isActive === true) {
      await prisma.theme.updateMany({
        where: { deletedAt: null },
        data: { isActive: false },
      })
      updates.isActive = true
    } else if (isActive === false) {
      updates.isActive = false
    }

    const theme = await prisma.theme.update({
      where: { id: params.id },
      data: updates,
    })

    return NextResponse.json(theme)
  } catch (error: any) {
    console.error('Error updating theme:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: '主题标识已存在' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await prisma.theme.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting theme:', error)
    return NextResponse.json({ error: 'Failed to delete theme' }, { status: 500 })
  }
}


