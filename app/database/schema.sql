-- ============================================
-- Ediora 数据库设计
-- 数据库：MySQL
-- 版本：1.0
-- 创建日期：2025-12-03
-- ============================================
-- 
-- 设计原则：
-- 1. 不使用外键约束（应用层维护关系）
-- 2. 所有表启用软删除（deletedAt 字段）
-- 3. 统一使用 UUID 作为主键（VARCHAR(36)）
-- 4. 时间戳字段统一使用 DATETIME(3) 支持毫秒
-- ============================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS test1 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE test1;

-- ============================================
-- 1. 标签类别表 (categories)
-- 用途：管理文章的分类标签，如生活、旅游、科技等
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键ID',
  name VARCHAR(100) NOT NULL COMMENT '类别名称（如：生活、旅游、科技）',
  slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL友好的标识符',
  description TEXT COMMENT '类别描述',
  auto_created BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否自动创建',
  confidence_score DECIMAL(3,2) NULL COMMENT '置信度分数（0-1）',
  needs_review BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否需要审核',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  INDEX idx_slug (slug),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_auto_created (auto_created),
  INDEX idx_needs_review (needs_review)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签类别表';

-- ============================================
-- 2. 文章标题表 (article_titles)
-- 用途：管理文章标题
-- ============================================
CREATE TABLE IF NOT EXISTS article_titles (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键ID',
  name VARCHAR(100) NOT NULL COMMENT '标题名称',
  slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL友好的标识符',
  description TEXT COMMENT '标题描述',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  INDEX idx_slug (slug),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标题表';

-- ============================================
-- 3. 主题表 (themes)
-- 用途：管理前端展示主题
-- ============================================
CREATE TABLE IF NOT EXISTS themes (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键ID',
  name VARCHAR(100) NOT NULL COMMENT '主题名称',
  slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL友好的标识符',
  description TEXT COMMENT '主题描述',
  is_active BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否激活',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  INDEX idx_slug (slug),
  INDEX idx_is_active (is_active),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='主题表';

-- ============================================
-- 4. 域名表 (domains)
-- 用途：管理域名信息（可选，发布向导也支持自定义域名）
-- ============================================
CREATE TABLE IF NOT EXISTS domains (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键ID',
  name VARCHAR(200) NOT NULL COMMENT '域名名称',
  url VARCHAR(255) NOT NULL COMMENT '域名URL',
  description TEXT COMMENT '域名描述',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  INDEX idx_url (url),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='域名表';

-- ============================================
-- 5. 文章表 (articles)
-- 用途：核心表，存储所有文章信息
-- ============================================
CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键ID',
  title VARCHAR(500) NOT NULL COMMENT '文章标题',
  slug VARCHAR(500) NOT NULL UNIQUE COMMENT 'URL友好的标识符（用于路由）',
  content LONGTEXT NOT NULL COMMENT '文章正文（支持HTML）',
  excerpt TEXT COMMENT '文章摘要',
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft' COMMENT '文章状态：草稿/已发布',
  
  -- 关联字段（不使用外键）
  category_id VARCHAR(36) NULL COMMENT '标签类别ID（关联categories表）',
  title_id VARCHAR(36) NOT NULL COMMENT '文章标题ID（关联article_titles表）',
  author VARCHAR(100) NOT NULL DEFAULT 'Admin' COMMENT '作者名称',
  
  -- 发布相关字段
  publish_date DATETIME(3) NULL COMMENT '发布日期',
  featured_image VARCHAR(500) NULL COMMENT '封面图片URL',
  enable_keyword_links BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否启用关键字自动超链接',
  view_count INT NOT NULL DEFAULT 0 COMMENT '阅读量',
  meta_title VARCHAR(200) NULL COMMENT 'SEO标题',
  meta_description VARCHAR(500) NULL COMMENT 'SEO描述',
  meta_keywords VARCHAR(500) NULL COMMENT 'SEO关键词',
  
  -- 时间戳
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  
  -- 索引
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_category_id (category_id),
  INDEX idx_title_id (title_id),
  INDEX idx_publish_date (publish_date),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_status_publish_date (status, publish_date) COMMENT '用于查询已发布文章并按时间排序'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- ============================================
-- 6. 文章标签表 (article_tags)
-- 用途：存储文章的标签（多对多关系，但使用简单字符串数组方式）
-- ============================================
CREATE TABLE IF NOT EXISTS article_tags (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键ID',
  article_id VARCHAR(36) NOT NULL COMMENT '文章ID（关联articles表）',
  tag VARCHAR(100) NOT NULL COMMENT '标签名称',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  INDEX idx_article_id (article_id),
  INDEX idx_tag (tag),
  INDEX idx_deleted_at (deleted_at),
  UNIQUE KEY uk_article_tag (article_id, tag, deleted_at) COMMENT '同一文章同一标签唯一（考虑软删除）'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标签表';

-- ============================================
-- 7. 文章自定义域名表 (article_custom_domains)
-- 用途：存储文章关联的自定义域名（发布向导中添加的域名）
-- ============================================
CREATE TABLE IF NOT EXISTS article_custom_domains (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键ID',
  article_id VARCHAR(36) NOT NULL COMMENT '文章ID（关联articles表）',
  domain VARCHAR(255) NOT NULL COMMENT '自定义域名',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  INDEX idx_article_id (article_id),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章自定义域名表';

-- ============================================
-- 8. 文章超链接表 (article_links)
-- 用途：存储文章的超链接（发布向导中添加的关键字+URL）
-- ============================================
CREATE TABLE IF NOT EXISTS article_links (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键ID',
  article_id VARCHAR(36) NOT NULL COMMENT '文章ID（关联articles表）',
  keyword VARCHAR(200) NOT NULL COMMENT '关键字',
  url VARCHAR(500) NOT NULL COMMENT '超链接URL',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  INDEX idx_article_id (article_id),
  INDEX idx_keyword (keyword),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章超链接表';

-- ============================================
-- 9. 文章配图表 (article_images)
-- 用途：存储文章的配图（发布向导中选择的3-5张图片）
-- ============================================
CREATE TABLE IF NOT EXISTS article_images (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键ID',
  article_id VARCHAR(36) NOT NULL COMMENT '文章ID（关联articles表）',
  url VARCHAR(500) NOT NULL COMMENT '图片URL',
  thumbnail VARCHAR(500) NULL COMMENT '缩略图URL',
  description VARCHAR(500) NULL COMMENT '图片描述',
  source VARCHAR(100) NULL COMMENT '图片来源（如：Unsplash）',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  INDEX idx_article_id (article_id),
  INDEX idx_sort_order (article_id, sort_order),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章配图表';

-- ============================================
-- 10. 资源表 (assets)
-- 用途：存储媒体资源（图片、附件等，后续扩展功能）
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键ID',
  name VARCHAR(255) NOT NULL COMMENT '资源名称',
  url VARCHAR(500) NOT NULL COMMENT '资源URL',
  type VARCHAR(50) NOT NULL DEFAULT 'image' COMMENT '资源类型（image/video/document等）',
  file_size BIGINT NULL COMMENT '文件大小（字节）',
  mime_type VARCHAR(100) NULL COMMENT 'MIME类型',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  INDEX idx_type (type),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源表';

-- ============================================
-- 初始化数据
-- ============================================

-- 插入默认文章标题
INSERT INTO article_titles (id, name, slug, description, created_at, updated_at) VALUES
('1', '默认标题', 'default-title', '默认文章标题', NOW(3), NOW(3)),
('2', '标准标题', 'standard-title', '标准文章标题', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE name=VALUES(name), updated_at=NOW(3);

-- 插入默认标签类别
INSERT INTO categories (id, name, slug, description, created_at, updated_at) VALUES
('1', '生活', 'life', '生活相关文章', NOW(3), NOW(3)),
('2', '旅游', 'travel', '旅游相关文章', NOW(3), NOW(3)),
('3', '科技', 'tech', '科技相关文章', NOW(3), NOW(3)),
('4', '美食', 'food', '美食相关文章', NOW(3), NOW(3)),
('5', '健康', 'health', '健康相关文章', NOW(3), NOW(3)),
('6', '教育', 'education', '教育相关文章', NOW(3), NOW(3)),
('7', '娱乐', 'entertainment', '娱乐相关文章', NOW(3), NOW(3)),
('8', '财经', 'finance', '财经相关文章', NOW(3), NOW(3)),
('9', '体育', 'sports', '体育相关文章', NOW(3), NOW(3)),
('10', '时尚', 'fashion', '时尚相关文章', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE name=VALUES(name), updated_at=NOW(3);

-- 插入默认主题
INSERT INTO themes (id, name, slug, description, is_active, created_at, updated_at) VALUES
('1', '默认主题', 'default', '现代简洁风格，适合通用博客', TRUE, NOW(3), NOW(3)),
('2', '深色主题', 'dark', '深色主题，护眼舒适', FALSE, NOW(3), NOW(3)),
('3', '简约主题', 'minimal', '极简风格，专注内容本身', FALSE, NOW(3), NOW(3)),
('4', '杂志风格', 'magazine', '杂志排版风格，适合内容丰富', FALSE, NOW(3), NOW(3)),
('5', '卡片风格', 'card', '大卡片风格，视觉冲击力强', FALSE, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE name=VALUES(name), updated_at=NOW(3);

-- ============================================
-- 11. 文章版本表 (article_versions)
-- 用途：存储文章的历史版本，支持版本对比和恢复
-- ============================================
CREATE TABLE IF NOT EXISTS article_versions (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键ID',
  article_id VARCHAR(36) NOT NULL COMMENT '文章ID（关联articles表）',
  title VARCHAR(500) NOT NULL COMMENT '文章标题',
  content LONGTEXT NOT NULL COMMENT '文章正文',
  excerpt TEXT COMMENT '文章摘要',
  version INT NOT NULL DEFAULT 1 COMMENT '版本号',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  INDEX idx_article_id (article_id),
  INDEX idx_article_version (article_id, version),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章版本表';

-- ============================================
-- 12. 管理员表 (admins)
-- 用途：存储后台管理员账户信息
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(36) PRIMARY KEY COMMENT '主键ID',
  username VARCHAR(100) NOT NULL UNIQUE COMMENT '用户名',
  password_hash VARCHAR(255) NOT NULL COMMENT '加密后的密码',
  email VARCHAR(255) NULL COMMENT '邮箱',
  role ENUM('super_admin', 'admin', 'editor', 'author') NOT NULL DEFAULT 'editor' COMMENT '角色：super_admin(超级管理员), admin(管理员), editor(编辑), author(作者)',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ============================================
-- 数据库设计说明
-- ============================================
-- 
-- 1. 核心表关系：
--    - articles (文章) ←→ categories (标签类别) - 多对一
--    - articles (文章) ←→ article_titles (文章标题) - 多对一
--    - articles (文章) ←→ article_tags (标签) - 一对多
--    - articles (文章) ←→ article_custom_domains (自定义域名) - 一对多
--    - articles (文章) ←→ article_links (超链接) - 一对多
--    - articles (文章) ←→ article_images (配图) - 一对多
--
-- 2. 软删除机制：
--    - 所有表都有 deleted_at 字段
--    - 查询时过滤 deleted_at IS NULL 的记录
--    - 删除操作更新 deleted_at 字段而不是真正删除
--
-- 3. 不使用外键：
--    - 所有关联关系通过应用层维护
--    - 使用索引优化查询性能
--
-- 4. 时间戳：
--    - created_at: 创建时间，自动设置
--    - updated_at: 更新时间，自动更新
--    - deleted_at: 软删除时间，NULL表示未删除
--
-- 5. 索引策略：
--    - 主键自动创建索引
--    - 外键字段（虽然不使用外键约束）创建索引
--    - 常用查询字段创建索引（status, publish_date等）
--    - 复合索引用于优化复杂查询
--
-- 6. 字符集：
--    - 使用 utf8mb4 支持完整的 Unicode 字符（包括 emoji）
--    - 使用 utf8mb4_unicode_ci 排序规则
--
-- ============================================

