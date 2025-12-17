-- ============================================
-- 初始化主题数据
-- 可以直接在数据库管理工具中执行此 SQL
-- ============================================

USE test1;

-- 插入默认主题（如果不存在）
INSERT INTO themes (id, name, slug, description, is_active, created_at, updated_at) VALUES
('1', '默认主题', 'default', '现代简洁风格，适合通用博客', TRUE, NOW(3), NOW(3)),
('2', '深色主题', 'dark', '深色主题，护眼舒适', FALSE, NOW(3), NOW(3)),
('3', '简约主题', 'minimal', '极简风格，专注内容本身', FALSE, NOW(3), NOW(3)),
('4', '杂志风格', 'magazine', '杂志排版风格，适合内容丰富', FALSE, NOW(3), NOW(3)),
('5', '卡片风格', 'card', '大卡片风格，视觉冲击力强', FALSE, NOW(3), NOW(3)),
('6', 'Bootstrap Blog', 'bootstrap-blog', 'Bootstrap 5 风格博客主题，经典现代设计', FALSE, NOW(3), NOW(3)),
('7', '综合类博客', 'comprehensive', '综合类博客主题，现代简约设计，适合多领域内容', FALSE, NOW(3), NOW(3)),
('8', '多功能杂志', 'magazine-multi', '杂志风格多功能主题，深色头部，红色强调色，适合内容丰富', FALSE, NOW(3), NOW(3)),
('9', '简约休闲生活', 'minimal-lifestyle', '简约休闲生活主题，浅色配色，优雅设计，适合生活方式博客', FALSE, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE 
  name=VALUES(name), 
  description=VALUES(description),
  updated_at=NOW(3);

-- 插入默认标签类别（如果不存在）
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
ON DUPLICATE KEY UPDATE 
  name=VALUES(name), 
  description=VALUES(description),
  updated_at=NOW(3);

-- 插入默认文章标题（如果不存在）
INSERT INTO article_titles (id, name, slug, description, created_at, updated_at) VALUES
('1', '默认标题', 'default-title', '默认文章标题', NOW(3), NOW(3)),
('2', '标准标题', 'standard-title', '标准文章标题', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE 
  name=VALUES(name), 
  description=VALUES(description),
  updated_at=NOW(3);

-- 查询验证
SELECT '主题数据' as type, COUNT(*) as count FROM themes WHERE deleted_at IS NULL
UNION ALL
SELECT '分类数据', COUNT(*) FROM categories WHERE deleted_at IS NULL
UNION ALL
SELECT '标题数据', COUNT(*) FROM article_titles WHERE deleted_at IS NULL;

