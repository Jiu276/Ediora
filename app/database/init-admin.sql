-- ============================================
-- 初始化管理员账户
-- ============================================
-- 注意：此脚本会创建一个默认的超级管理员账户
-- 用户名：admin
-- 密码：admin123
-- 请在生产环境中立即修改密码！

-- 如果表不存在，先创建表
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  role ENUM('super_admin', 'admin', 'editor', 'author') NOT NULL DEFAULT 'editor',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认管理员账户
-- 密码：admin123 (使用 bcrypt 加密，cost=10)
-- 生成方式：在 Node.js 中运行 bcrypt.hash('admin123', 10)
INSERT INTO admins (id, username, password_hash, email, role, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'admin@ediora.com', 'super_admin', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE 
  username=VALUES(username),
  updated_at=NOW(3);

-- 注意：上面的 password_hash 是占位符，实际使用时需要通过 Node.js 生成
-- 运行以下 Node.js 代码生成正确的密码哈希：
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('admin123', 10);
-- console.log(hash);

