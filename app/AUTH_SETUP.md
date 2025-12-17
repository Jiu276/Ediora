# 认证系统设置指南

## 概述

本项目已实现完整的后台登录认证和角色权限系统。

## 功能特性

- ✅ 用户登录/登出
- ✅ 基于角色的权限控制（RBAC）
- ✅ 4种角色：超级管理员、管理员、编辑、作者
- ✅ 权限细粒度控制
- ✅ 用户管理（仅超级管理员）

## 角色权限说明

### 1. 超级管理员 (super_admin)
- 所有权限
- 可以管理用户
- 可以管理系统设置

### 2. 管理员 (admin)
- 管理文章、分类、主题
- 不能管理用户
- 不能修改系统设置

### 3. 编辑 (editor)
- 创建和编辑文章
- 可以发布文章
- 不能删除文章
- 不能管理分类和主题

### 4. 作者 (author)
- 只能创建和编辑自己的文章
- 不能发布文章（只能保存草稿）
- 不能管理其他内容

## 初始化步骤

### 1. 更新数据库

首先，需要更新数据库结构：

```bash
# 生成 Prisma Client
npm run db:generate

# 推送数据库变更
npm run db:push
```

### 2. 创建初始管理员账户

有两种方式创建初始管理员：

#### 方式一：使用 Node.js 脚本（推荐）

```bash
node scripts/init-admin.js [用户名] [密码] [邮箱] [角色]
```

示例：
```bash
# 创建默认超级管理员（用户名：admin，密码：admin123）
node scripts/init-admin.js

# 创建自定义管理员
node scripts/init-admin.js myadmin mypassword123 admin@example.com super_admin
```

#### 方式二：手动创建

1. 运行以下 Node.js 代码生成密码哈希：
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your_password', 10);
console.log(hash);
```

2. 在数据库中执行 SQL：
```sql
INSERT INTO admins (id, username, password_hash, email, role, created_at, updated_at) VALUES
(UUID(), 'admin', '生成的密码哈希', 'admin@ediora.com', 'super_admin', NOW(3), NOW(3));
```

### 3. 访问登录页面

启动开发服务器：
```bash
npm run dev
```

访问：`http://localhost:50812/admin/login`

使用初始管理员账户登录。

## 使用说明

### 登录

1. 访问 `/admin/login`
2. 输入用户名和密码
3. 点击"登录"按钮

### 登出

1. 点击右上角的用户菜单
2. 选择"退出登录"

### 用户管理（仅超级管理员）

1. 登录后，在左侧菜单找到"用户管理"
2. 可以创建、编辑、删除用户
3. 可以修改用户角色

## 权限控制

### 在 API 中使用权限检查

```typescript
import { getCurrentUser, requirePermission } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  // 检查权限
  requirePermission(user, 'article:delete')

  // 执行操作...
}
```

### 在页面中使用权限检查

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { hasPermission } from '@/lib/auth'

export default function MyPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!hasPermission(data.user, 'article:delete')) {
          router.push('/admin')
          return
        }
        setUser(data.user)
      })
  }, [])

  // ...
}
```

## 权限列表

| 权限 | 说明 | 允许的角色 |
|------|------|-----------|
| `article:create` | 创建文章 | 所有角色 |
| `article:edit:own` | 编辑自己的文章 | 所有角色 |
| `article:edit:all` | 编辑所有文章 | super_admin, admin, editor |
| `article:delete` | 删除文章 | super_admin, admin |
| `article:publish` | 发布文章 | super_admin, admin, editor |
| `category:manage` | 管理分类 | super_admin, admin |
| `theme:manage` | 管理主题 | super_admin, admin |
| `user:manage` | 管理用户 | super_admin |
| `system:settings` | 系统设置 | super_admin |
| `title:generate` | 生成文章标题 | 所有角色 |

## 安全建议

1. **首次登录后立即修改密码**
2. **不要在生产环境使用默认密码**
3. **定期更换管理员密码**
4. **限制超级管理员账户数量**
5. **为不同用户分配合适的角色**

## 故障排除

### 问题：无法登录

1. 检查数据库表是否已创建
2. 检查管理员账户是否存在
3. 检查密码是否正确
4. 查看浏览器控制台和服务器日志

### 问题：权限不足

1. 检查用户角色是否正确
2. 检查权限配置是否正确
3. 确认操作是否需要特定权限

### 问题：Session 失效

1. 检查 Cookie 设置
2. 检查服务器时间是否正确
3. 清除浏览器 Cookie 后重新登录

## 技术实现

- **认证方式**：Session-based（使用 Next.js cookies）
- **密码加密**：bcryptjs（cost=10）
- **Session 存储**：HttpOnly Cookie
- **Session 过期时间**：7天

## 相关文件

- `lib/auth.ts` - 认证和权限工具函数
- `app/api/auth/login/route.ts` - 登录 API
- `app/api/auth/logout/route.ts` - 登出 API
- `app/api/auth/me/route.ts` - 获取当前用户 API
- `app/admin/login/page.tsx` - 登录页面
- `app/admin/layout.tsx` - 后台布局（包含权限检查）
- `app/admin/users/page.tsx` - 用户管理页面
- `prisma/schema.prisma` - 数据库模型定义

