-- ============================================
-- thedailypulse_xyz_db：同步分类 + 主题（与新项目 init-data 一致）
-- 用法：mysql -u test1 -p thedailypulse_xyz_db < init-themes-thedailypulse_xyz_db.sql
-- 说明：不删除文章；仅 upsert 预设数据、清理脏分类、默认主题保持激活
-- ============================================

USE thedailypulse_xyz_db;

-- 1. 主题（14 个）
INSERT INTO themes (id, name, slug, description, is_active, created_at, updated_at) VALUES
('1', '默认主题', 'default', '现代简洁风格，适合通用博客', TRUE, NOW(3), NOW(3)),
('2', '深色主题', 'dark', '深色主题，护眼舒适', FALSE, NOW(3), NOW(3)),
('3', '简约主题', 'minimal', '极简风格，专注内容本身', FALSE, NOW(3), NOW(3)),
('4', '杂志风格', 'magazine', '杂志排版风格，适合内容丰富', FALSE, NOW(3), NOW(3)),
('5', '卡片风格', 'card', '大卡片风格，视觉冲击力强', FALSE, NOW(3), NOW(3)),
('6', 'Bootstrap Blog', 'bootstrap-blog', 'Bootstrap 5 风格博客主题，经典现代设计', FALSE, NOW(3), NOW(3)),
('7', '综合类博客', 'comprehensive', '综合类博客主题，现代简约设计，适合多领域内容', FALSE, NOW(3), NOW(3)),
('8', '多功能杂志', 'magazine-multi', '杂志风格多功能主题，深色头部，红色强调色，适合内容丰富', FALSE, NOW(3), NOW(3)),
('9', '简约休闲生活', 'minimal-lifestyle', '简约休闲生活主题，浅色配色，优雅设计，适合生活方式博客', FALSE, NOW(3), NOW(3)),
('travel-blog', 'Travel Blog', 'travel-blog', 'Perfect for travel and adventure content', FALSE, NOW(3), NOW(3)),
('modern-magazine', 'Modern Magazine', 'modern-magazine', 'Modern magazine style with sidebar', FALSE, NOW(3), NOW(3)),
('modern-simple', 'Modern Simple', 'modern-simple', 'Clean and minimal modern design', FALSE, NOW(3), NOW(3)),
('lifestyle-daily', 'Lifestyle Daily', 'lifestyle-daily', 'Perfect for lifestyle and daily content', FALSE, NOW(3), NOW(3)),
('zen-blog', 'Zen Blog', 'zen-blog', 'Peaceful and mindful blog design', FALSE, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  slug = VALUES(slug),
  description = VALUES(description),
  updated_at = NOW(3);

-- 仅默认主题激活
UPDATE themes SET is_active = FALSE, updated_at = NOW(3) WHERE deleted_at IS NULL;
UPDATE themes SET is_active = TRUE, updated_at = NOW(3) WHERE id = '1' AND deleted_at IS NULL;

-- 2. 分类（10 个，英文展示名，slug 不变）
INSERT INTO categories (id, name, slug, description, created_at, updated_at) VALUES
('1', 'Lifestyle', 'life', 'Lifestyle related articles', NOW(3), NOW(3)),
('2', 'Travel', 'travel', 'Travel related articles', NOW(3), NOW(3)),
('3', 'Technology', 'tech', 'Technology related articles', NOW(3), NOW(3)),
('4', 'Food', 'food', 'Food related articles', NOW(3), NOW(3)),
('5', 'Health', 'health', 'Health related articles', NOW(3), NOW(3)),
('6', 'Education', 'education', 'Education related articles', NOW(3), NOW(3)),
('7', 'Entertainment', 'entertainment', 'Entertainment related articles', NOW(3), NOW(3)),
('8', 'Finance', 'finance', 'Finance related articles', NOW(3), NOW(3)),
('9', 'Sports', 'sports', 'Sports related articles', NOW(3), NOW(3)),
('10', 'Fashion', 'fashion', 'Fashion related articles', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  slug = VALUES(slug),
  description = VALUES(description),
  updated_at = NOW(3);

-- 3. 软删除脏分类（it / that 等）
UPDATE categories SET deleted_at = NOW(3), updated_at = NOW(3)
WHERE deleted_at IS NULL AND slug IN ('it', 'that');

-- 4. 文章标题模板（可选，与 init-data 一致）
INSERT INTO article_titles (id, name, slug, description, created_at, updated_at) VALUES
('1', '默认标题', 'default-title', '默认文章标题', NOW(3), NOW(3)),
('2', '标准标题', 'standard-title', '标准文章标题', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  updated_at = NOW(3);

-- 5. 验证
SELECT 'themes' AS type, COUNT(*) AS cnt FROM themes WHERE deleted_at IS NULL
UNION ALL
SELECT 'categories', COUNT(*) FROM categories WHERE deleted_at IS NULL
UNION ALL
SELECT 'active_theme', COUNT(*) FROM themes WHERE deleted_at IS NULL AND is_active = TRUE;

SELECT id, name, slug, is_active FROM themes WHERE deleted_at IS NULL ORDER BY name;
SELECT id, name, slug FROM categories WHERE deleted_at IS NULL ORDER BY name;
