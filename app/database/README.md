# Ediora 数据库设计文档

## 数据库概述

- **数据库类型**: MySQL 8.0+
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **设计原则**: 不使用外键、启用软删除、应用层维护关系

## 表结构说明

### 核心业务表

#### 1. articles（文章表）
**用途**: 存储所有文章的核心信息

**关键字段**:
- `id`: 主键，UUID格式
- `title`: 文章标题（最大500字符）
- `slug`: URL友好的标识符，用于路由（如：`/blog/my-article`）
- `content`: 文章正文，支持HTML（LONGTEXT）
- `excerpt`: 文章摘要
- `status`: 文章状态（draft/published）
- `category_id`: 关联标签类别（不使用外键）
- `title_id`: 关联文章标题（不使用外键）
- `publish_date`: 发布日期（支持定时发布）
- `featured_image`: 封面图片URL
- `enable_keyword_links`: 是否启用关键字自动超链接

**索引策略**:
- `slug`: 唯一索引，用于快速查找文章
- `status + publish_date`: 复合索引，优化已发布文章列表查询
- `category_id`, `title_id`: 用于筛选查询

#### 2. categories（标签类别表）
**用途**: 管理文章的分类标签（生活、旅游、科技等）

**关键字段**:
- `name`: 类别名称
- `slug`: URL标识符
- `description`: 类别描述

**关系**: 一篇文章属于一个标签类别（多对一）

#### 3. article_titles（文章标题表）
**用途**: 管理文章标题

**关键字段**:
- `name`: 类型名称
- `slug`: URL标识符
- `description`: 类型描述

**关系**: 一篇文章属于一个类型（多对一）

### 关联数据表

#### 4. article_tags（文章标签表）
**用途**: 存储文章的标签（多对多关系）

**设计说明**:
- 使用独立的标签表而非JSON字段，便于查询和统计
- 支持同一文章的多个标签
- 使用唯一约束防止重复（考虑软删除）

#### 5. article_custom_domains（文章自定义域名表）
**用途**: 存储发布向导中添加的自定义域名

**设计说明**:
- 一个文章可以有多个自定义域名
- 域名用于生成标题和内容时的上下文

#### 6. article_links（文章超链接表）
**用途**: 存储文章的超链接（关键字+URL）

**关键字段**:
- `keyword`: 关键字（用于在文章中匹配）
- `url`: 超链接URL

**设计说明**:
- 支持一个文章多个超链接
- 关键字用于自动在文章内容中插入链接

#### 7. article_images（文章配图表）
**用途**: 存储文章的配图（3-5张）

**关键字段**:
- `url`: 图片URL
- `thumbnail`: 缩略图URL
- `description`: 图片描述
- `source`: 图片来源（如：Unsplash）
- `sort_order`: 排序顺序

**设计说明**:
- 支持多图排序
- 第一张图片通常作为封面（featured_image）

### 配置表

#### 8. themes（主题表）
**用途**: 管理前端展示主题

**关键字段**:
- `is_active`: 是否激活（同一时间只能有一个激活的主题）

#### 9. domains（域名表）
**用途**: 管理预设域名（可选）

**说明**: 发布向导支持自定义域名，此表用于预设常用域名

#### 10. assets（资源表）
**用途**: 存储媒体资源（后续扩展功能）

**关键字段**:
- `type`: 资源类型（image/video/document等）
- `file_size`: 文件大小
- `mime_type`: MIME类型

## 数据关系图

```
articles (文章)
  ├── category_id → categories (标签类别) [多对一]
  ├── title_id → article_titles (文章标题) [多对一]
  ├── article_tags (标签) [一对多]
  ├── article_custom_domains (自定义域名) [一对多]
  ├── article_links (超链接) [一对多]
  └── article_images (配图) [一对多]
```

## 软删除机制

所有表都包含 `deleted_at` 字段：
- `deleted_at IS NULL`: 表示记录未删除
- `deleted_at IS NOT NULL`: 表示记录已软删除

**查询示例**:
```sql
-- 查询未删除的文章
SELECT * FROM articles WHERE deleted_at IS NULL;

-- 软删除文章
UPDATE articles SET deleted_at = NOW(3) WHERE id = 'xxx';

-- 恢复删除的文章
UPDATE articles SET deleted_at = NULL WHERE id = 'xxx';
```

## 索引设计

### 主要索引
1. **主键索引**: 所有表的 `id` 字段
2. **唯一索引**: `slug` 字段（categories, article_titles, articles等）
3. **外键字段索引**: 虽然不使用外键约束，但为关联字段创建索引
4. **查询字段索引**: `status`, `publish_date`, `created_at` 等
5. **复合索引**: `status + publish_date` 用于优化已发布文章列表查询

### 索引命名规范
- 主键: `PRIMARY KEY`
- 唯一索引: `UNIQUE KEY uk_xxx`
- 普通索引: `INDEX idx_xxx`

## 数据类型选择

- **ID字段**: `VARCHAR(36)` - UUID格式
- **短文本**: `VARCHAR(100-500)` - 根据实际需求
- **长文本**: `TEXT` 或 `LONGTEXT` - 文章内容使用LONGTEXT
- **时间戳**: `DATETIME(3)` - 支持毫秒精度
- **布尔值**: `BOOLEAN` - MySQL中实际为TINYINT(1)
- **枚举**: `ENUM` - 固定选项（如status）

## 初始化数据

SQL文件包含以下初始化数据：
- 2个默认文章类型（文章、页面）
- 10个默认标签类别（生活、旅游、科技等）
- 3个默认主题（默认、深色、简约）

## 使用说明

### 1. 执行SQL创建数据库

```bash
# 方式1：使用MySQL命令行
mysql -u root -p < database/schema.sql

# 方式2：在MySQL客户端中执行
source database/schema.sql
```

### 2. 配置环境变量

在 `.env` 文件中配置数据库连接：

```env
DATABASE_URL="mysql://用户名:密码@localhost:3306/ediora"
```

### 3. 使用Prisma迁移

```bash
# 生成Prisma Client
npm run db:generate

# 推送schema到数据库（开发环境）
npm run db:push

# 或创建正式迁移
npm run db:migrate
```

## 后续扩展建议

1. **用户系统**: 添加 `users` 表，支持多用户和权限管理
2. **文章版本**: 添加 `article_versions` 表，支持版本历史
3. **评论系统**: 添加 `comments` 表，支持文章评论
4. **访问统计**: 添加 `article_views` 表，记录访问数据
5. **SEO优化**: 在 `articles` 表中添加 `meta_title`, `meta_description` 等字段

