-- 联盟推广链接（linkhaitao 等）常超过 500 字符
-- 在站点 app 目录执行: mysql -u USER -p DATABASE < scripts/migrate-article-link-url-2000.sql

ALTER TABLE article_links
  MODIFY COLUMN url VARCHAR(2000) NOT NULL COMMENT '超链接URL';
