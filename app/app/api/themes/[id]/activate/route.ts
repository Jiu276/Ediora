import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    // 先取消其他主题激活
    await prisma.theme.updateMany({
      where: { deletedAt: null },
      data: { isActive: false },
    })

    const theme = await prisma.theme.update({
      where: { id: params.id },
      data: { isActive: true },
    })

    return NextResponse.json(theme)
  } catch (error) {
    console.error('Error activating theme:', error)
    return NextResponse.json({ error: 'Failed to activate theme' }, { status: 500 })
  }
}


