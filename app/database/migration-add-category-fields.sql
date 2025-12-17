-- ============================================
-- 迁移脚本：为 categories 表添加自动创建标签相关字段
-- 执行日期：2025-12-03
-- ============================================

USE test1;

-- 添加新字段
ALTER TABLE categories 
  ADD COLUMN IF NOT EXISTS auto_created BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否自动创建' AFTER description,
  ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) NULL COMMENT '置信度分数（0-1）' AFTER auto_created,
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否需要审核' AFTER confidence_score;

-- 添加索引
ALTER TABLE categories 
  ADD INDEX IF NOT EXISTS idx_auto_created (auto_created),
  ADD INDEX IF NOT EXISTS idx_needs_review (needs_review);

