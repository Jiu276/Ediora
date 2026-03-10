#!/bin/bash

# 创建新站点脚本
# 用法: ./create-site.sh <site_number> <domain>

SITE_NUMBER=$1
DOMAIN=$2

if [ -z "$SITE_NUMBER" ] || [ -z "$DOMAIN" ]; then
    echo "用法: $0 <site_number> <domain>"
    echo "示例: $0 1 site1.example.com"
    exit 1
fi

DB_NAME="ediora_site${SITE_NUMBER}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_HOST="${DB_HOST:-localhost}"

echo "创建站点: $DOMAIN"
echo "数据库名: $DB_NAME"

# 1. 创建数据库
echo "创建数据库..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
EOF

if [ $? -ne 0 ]; then
    echo "错误: 数据库创建失败"
    exit 1
fi

# 2. 导入数据库结构
echo "导入数据库结构..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < ../../app/database/schema.sql

if [ $? -ne 0 ]; then
    echo "错误: 数据库结构导入失败"
    exit 1
fi

# 3. 更新域名映射配置（需要手动添加到 domain-mapping.ts）
echo ""
echo "✅ 数据库创建成功！"
echo ""
echo "请手动将以下配置添加到 lib/domain-mapping.ts:"
echo ""
echo "  '${DOMAIN}': {"
echo "    domain: '${DOMAIN}',"
echo "    database: '${DB_NAME}',"
echo "  },"
echo ""

# 4. 配置 SSL 证书（如果使用 Let's Encrypt）
if command -v certbot &> /dev/null; then
    read -p "是否配置 SSL 证书? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        certbot --nginx -d "$DOMAIN"
    fi
fi

echo "站点创建完成！"

