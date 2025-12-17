import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, requirePermission } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// 更新用户
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    requirePermission(user, 'user:manage')

    const body = await request.json()
    const { email, role, password } = body

    // 检查用户是否存在
    const existingUser = await prisma.admin.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 不能修改超级管理员的角色
    if (existingUser.role === 'super_admin' && role && role !== 'super_admin') {
      return NextResponse.json(
        { error: '不能修改超级管理员的角色' },
        { status: 400 }
      )
    }

    // 构建更新数据
    const updateData: any = {}
    if (email !== undefined) {
      updateData.email = email || null
    }
    if (role !== undefined) {
      updateData.role = role
    }
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.admin.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error('Update user error:', error)
    if (error.message === '权限不足') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 })
  }
}

// 删除用户（软删除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    requirePermission(user, 'user:manage')

    // 检查用户是否存在
    const existingUser = await prisma.admin.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 不能删除超级管理员
    if (existingUser.role === 'super_admin') {
      return NextResponse.json(
        { error: '不能删除超级管理员' },
        { status: 400 }
      )
    }

    // 不能删除自己
    if (existingUser.id === user.id) {
      return NextResponse.json(
        { error: '不能删除自己' },
        { status: 400 }
      )
    }

    // 软删除
    await prisma.admin.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete user error:', error)
    if (error.message === '权限不足') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }
    return NextResponse.json({ error: '删除用户失败' }, { status: 500 })
  }
}

