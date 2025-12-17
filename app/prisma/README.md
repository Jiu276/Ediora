# Prisma Schema 说明

## 模型列表

### 核心业务模型

1. **Category** - 标签类别（生活、旅游、科技等）
2. **ArticleTitle** - 文章标题
3. **Article** - 文章（核心表）
4. **ArticleTag** - 文章标签
5. **ArticleCustomDomain** - 文章自定义域名
6. **ArticleLink** - 文章超链接
7. **ArticleImage** - 文章配图

### 配置模型

8. **Theme** - 主题
9. **Domain** - 域名
10. **Asset** - 资源

## 设计特点

### 1. 不使用外键关系
- 所有关联字段使用 `String?` 或 `String` 类型
- 不使用 `@relation` 装饰器
- 关联关系在应用层维护

### 2. 软删除支持
- 所有模型都有 `deletedAt` 字段
- 查询时需要过滤 `deletedAt: null` 的记录

### 3. 字段命名
- 数据库字段使用 snake_case（如 `created_at`）
- Prisma 模型字段使用 camelCase（如 `createdAt`）
- 使用 `@map` 映射数据库字段名

### 4. 时间戳
- `createdAt`: 自动设置创建时间
- `updatedAt`: 自动更新修改时间
- `deletedAt`: 软删除时间（nullable）

## 使用示例

### 查询未删除的记录

```typescript
import { prisma } from '@/lib/prisma'

// 查询所有未删除的文章
const articles = await prisma.article.findMany({
  where: {
    deletedAt: null
  }
})

// 查询已发布的文章
const publishedArticles = await prisma.article.findMany({
  where: {
    status: 'published',
    deletedAt: null
  },
  orderBy: {
    publishDate: 'desc'
  }
})
```

### 软删除

```typescript
// 软删除文章
await prisma.article.update({
  where: { id: articleId },
  data: {
    deletedAt: new Date()
  }
})

// 恢复删除的文章
await prisma.article.update({
  where: { id: articleId },
  data: {
    deletedAt: null
  }
})
```

### 关联查询（应用层维护）

```typescript
// 查询文章及其标签类别
const article = await prisma.article.findFirst({
  where: {
    id: articleId,
    deletedAt: null
  }
})

// 手动查询关联的类别
if (article?.categoryId) {
  const category = await prisma.category.findFirst({
    where: {
      id: article.categoryId,
      deletedAt: null
    }
  })
}

// 查询文章的所有标签
const tags = await prisma.articleTag.findMany({
  where: {
    articleId: articleId,
    deletedAt: null
  }
})
```

## 迁移命令

```bash
# 生成 Prisma Client
npm run db:generate

# 推送 schema 到数据库（开发环境，会创建/更新表结构）
npm run db:push

# 创建正式迁移（生产环境推荐）
npm run db:migrate

# 打开 Prisma Studio（数据库可视化工具）
npm run db:studio
```

## 注意事项

1. **UUID 生成**: 模型使用 `@default(uuid())`，Prisma 会自动生成 UUID
2. **唯一约束**: `ArticleTag` 的 `uk_article_tag` 约束包含 `deletedAt`，允许软删除后重新添加相同标签
3. **枚举类型**: `ArticleStatus` 枚举定义了文章状态（draft/published）
4. **索引**: 所有索引都已从 SQL 转换，保持查询性能

