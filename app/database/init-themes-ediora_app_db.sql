-- ============================================
-- 独立库 ediora_app_db：主题 + 分类（英文展示名）
-- 在服务器上：mysql -u ediora_app -p < init-themes-ediora_app_db.sql
-- 或进入 mysql 后 source 本文件
-- ============================================

USE ediora_app_db;

-- 主题（与 app/api/init-data/route.ts 一致）
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
  name=VALUES(name),
  description=VALUES(description),
  updated_at=NOW(3);

-- 分类（英文展示名，与 database/schema.sql 一致）
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
  name=VALUES(name),
  description=VALUES(description),
  updated_at=NOW(3);
