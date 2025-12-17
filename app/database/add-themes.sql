-- ============================================
-- 添加主题到数据库
-- 可以直接在数据库管理工具中执行此 SQL
-- ============================================

USE test1;

-- 添加 Bootstrap Blog 主题（如果不存在）
INSERT INTO themes (id, name, slug, description, is_active, created_at, updated_at) VALUES
('6', 'Bootstrap Blog', 'bootstrap-blog', 'Bootstrap 5 风格博客主题，经典现代设计', FALSE, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE 
  name=VALUES(name), 
  description=VALUES(description),
  updated_at=NOW(3);

-- 添加综合类博客主题（如果不存在）
INSERT INTO themes (id, name, slug, description, is_active, created_at, updated_at) VALUES
('7', '综合类博客', 'comprehensive', '综合类博客主题，现代简约设计，适合多领域内容', FALSE, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE 
  name=VALUES(name), 
  description=VALUES(description),
  updated_at=NOW(3);

-- 添加多功能杂志主题（如果不存在）
INSERT INTO themes (id, name, slug, description, is_active, created_at, updated_at) VALUES
('8', '多功能杂志', 'magazine-multi', '杂志风格多功能主题，深色头部，红色强调色，适合内容丰富', FALSE, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE 
  name=VALUES(name), 
  description=VALUES(description),
  updated_at=NOW(3);

-- 添加简约休闲生活主题（如果不存在）
INSERT INTO themes (id, name, slug, description, is_active, created_at, updated_at) VALUES
('9', '简约休闲生活', 'minimal-lifestyle', '简约休闲生活主题，浅色配色，优雅设计，适合生活方式博客', FALSE, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE 
  name=VALUES(name), 
  description=VALUES(description),
  updated_at=NOW(3);

-- 查询验证
SELECT id, name, slug, description, is_active, created_at 
FROM themes 
WHERE deleted_at IS NULL 
ORDER BY created_at DESC;

