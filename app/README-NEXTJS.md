# Next.js 14 + Ant Design + Prisma 5 配置说明

## 已安装的依赖

### 核心框架
- ✅ **Next.js 14.2.33** - React 全栈框架
- ✅ **React 18** - UI 库
- ✅ **TypeScript 5** - 类型支持

### UI 组件库
- ✅ **Ant Design 6.0.1** - 企业级 UI 组件库
- ✅ **@ant-design/icons 6.1.0** - Ant Design 图标库

### 数据库 ORM
- ✅ **Prisma 5.22.0** - 现代化 ORM
- ✅ **@prisma/client 5.22.0** - Prisma 客户端

## 配置文件说明

### 1. Prisma 配置

**文件位置**: `prisma/schema.prisma`

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**数据库连接**: 使用 MySQL，连接字符串在 `.env` 文件中配置

### 2. 环境变量配置

**文件位置**: `.env` (需要从 `.env.example` 复制)

```env
DATABASE_URL="mysql://user:password@localhost:3306/ediora"
```

### 3. Prisma Client 单例

**文件位置**: `lib/prisma.ts`

- 在开发环境中避免创建多个 Prisma Client 实例
- 自动记录查询日志（开发环境）
- 生产环境仅记录错误

### 4. Ant Design 配置

**文件位置**: `app/antd-provider.tsx`

- 配置中文语言包
- 包裹整个应用，使 Ant Design 组件可用

**使用方式**: 已在 `app/layout.tsx` 中集成

## 可用命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 生成 Prisma Client
npm run db:generate

# 推送 schema 到数据库（开发用）
npm run db:push

# 创建并应用迁移
npm run db:migrate

# 打开 Prisma Studio（数据库可视化工具）
npm run db:studio
```

## 使用示例

### 使用 Prisma

```typescript
import { prisma } from '@/lib/prisma'

// 在 Server Component 或 API Route 中使用
export async function getArticles() {
  const articles = await prisma.article.findMany()
  return articles
}
```

### 使用 Ant Design

```typescript
'use client'

import { Button, Card } from 'antd'

export default function MyComponent() {
  return (
    <Card>
      <Button type="primary">点击我</Button>
    </Card>
  )
}
```

## 下一步

1. 配置 `.env` 文件，设置 MySQL 数据库连接
2. 在 `prisma/schema.prisma` 中定义数据模型
3. 运行 `npm run db:push` 或 `npm run db:migrate` 创建数据库表
4. 开始开发！

