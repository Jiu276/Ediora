import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/articles/[id]/custom-domains - 获取文章的自定义域名
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const domains = await prisma.articleCustomDomain.findMany({
      where: {
        articleId: params.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json(domains)
  } catch (error) {
    console.error('Error fetching custom domains:', error)
    return NextResponse.json(
      { error: 'Failed to fetch custom domains' },
      { status: 500 }
    )
  }
}

// POST /api/articles/[id]/custom-domains - 批量创建文章的自定义域名
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { domains } = body // domains 是字符串数组
    
    if (!Array.isArray(domains)) {
      return NextResponse.json(
        { error: 'Domains must be an array' },
        { status: 400 }
      )
    }
    
    // 先删除该文章的所有现有域名（软删除）
    await prisma.articleCustomDomain.updateMany({
      where: {
        articleId: params.id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })
    
    // 创建新的域名记录
    const createdDomains = await Promise.all(
      domains.map((domain: string) =>
        prisma.articleCustomDomain.create({
          data: {
            articleId: params.id,
            domain: domain.trim(),
          },
        })
      )
    )
    
    return NextResponse.json(createdDomains, { status: 201 })
  } catch (error) {
    console.error('Error creating custom domains:', error)
    return NextResponse.json(
      { error: 'Failed to create custom domains' },
      { status: 500 }
    )
  }
}

