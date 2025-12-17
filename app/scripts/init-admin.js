/**
 * 初始化管理员账户脚本
 * 使用方法：node scripts/init-admin.js
 */

const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initAdmin() {
  try {
    const username = process.argv[2] || 'admin'
    const password = process.argv[3] || 'admin123'
    const email = process.argv[4] || 'admin@ediora.com'
    const role = process.argv[5] || 'super_admin'

    console.log('正在创建管理员账户...')
    console.log(`用户名: ${username}`)
    console.log(`密码: ${password}`)
    console.log(`邮箱: ${email}`)
    console.log(`角色: ${role}`)

    // 检查用户是否已存在
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        username,
        deletedAt: null,
      },
    })

    if (existingAdmin) {
      console.log(`用户 ${username} 已存在，正在更新密码...`)
      const passwordHash = bcrypt.hashSync(password, 10)
      await prisma.admin.update({
        where: { id: existingAdmin.id },
        data: {
          passwordHash,
          email,
          role,
        },
      })
      console.log('✅ 管理员账户更新成功！')
    } else {
      // 创建新用户
      const passwordHash = bcrypt.hashSync(password, 10)
      const admin = await prisma.admin.create({
        data: {
          username,
          passwordHash,
          email,
          role,
        },
      })
      console.log('✅ 管理员账户创建成功！')
      console.log(`ID: ${admin.id}`)
    }

    console.log('\n登录信息：')
    console.log(`用户名: ${username}`)
    console.log(`密码: ${password}`)
    console.log('\n⚠️  请妥善保管登录信息，建议首次登录后立即修改密码！')
  } catch (error) {
    console.error('❌ 创建管理员账户失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

initAdmin()

