-- ============================================
-- Ediora 数据库初始化脚本
-- 数据库：test1
-- 用户：test1
-- ============================================
-- 
-- 使用说明：
-- 1. 确保 MySQL 服务正在运行
-- 2. 确保用户 test1 有创建数据库的权限
-- 3. 执行此脚本：mysql -u test1 -p < database/init.sql
-- ============================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS test1 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE test1;

-- 执行完整的 schema.sql
SOURCE database/schema.sql;

