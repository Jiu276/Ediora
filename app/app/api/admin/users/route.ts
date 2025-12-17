import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, requirePermission } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// 获取用户列表
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    requirePermission(user, 'user:manage')

    const users = await prisma.admin.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('Get users error:', error)
    if (error.message === '权限不足') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 })
  }
}

// 创建用户
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    requirePermission(user, 'user:manage')

    const body = await request.json()
    const { username, password, email, role } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.admin.findFirst({
      where: {
        username,
        deletedAt: null,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      )
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10)

    // 创建用户
    const newUser = await prisma.admin.create({
      data: {
        username,
        passwordHash,
        email: email || null,
        role: role || 'editor',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user: newUser })
  } catch (error: any) {
    console.error('Create user error:', error)
    if (error.message === '权限不足') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }
    return NextResponse.json({ error: '创建用户失败' }, { status: 500 })
  }
}

