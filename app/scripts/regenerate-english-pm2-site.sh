#!/bin/bash
# 对指定 PM2 站点批量修复含中文文章（使用该站点自己的 .env 数据库）
# 用法:
#   bash scripts/regenerate-english-pm2-site.sh summasite
#   DRY_RUN_FIX=1 bash scripts/regenerate-english-pm2-site.sh summasite
set -euo pipefail

SITE_NAME="${1:-}"
if [ -z "$SITE_NAME" ]; then
  echo "用法: bash scripts/regenerate-english-pm2-site.sh <pm2名称>"
  echo "示例: bash scripts/regenerate-english-pm2-site.sh summasite"
  pm2 list
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "ERROR: 未找到 pm2"
  exit 1
fi

# 从 pm2 读取工作目录
APP_CWD=$(pm2 jlist 2>/dev/null | node -e "
const name = process.argv[1];
const list = JSON.parse(require('fs').readFileSync(0,'utf8'));
const proc = list.find(p => p.name === name);
if (!proc) process.exit(2);
console.log(proc.pm2_env?.pm_cwd || proc.pm2_env?.cwd || '');
" "$SITE_NAME" 2>/dev/null) || APP_CWD=""

if [ -z "$APP_CWD" ] || [ ! -d "$APP_CWD" ]; then
  echo "ERROR: 无法从 pm2 获取站点目录，请手动: pm2 describe $SITE_NAME"
  exit 1
fi

echo "[site] pm2=$SITE_NAME cwd=$APP_CWD"

# 从 ecosystem / .env 猜测端口，默认 27601
PORT=$(grep -E '^PORT=' "$APP_CWD/.env" 2>/dev/null | tail -1 | cut -d= -f2 | tr -d '"' | tr -d "'")
PORT="${PORT:-27601}"
BASE_URL="${BASE_URL:-http://127.0.0.1:${PORT}}"

echo "[site] BASE_URL=$BASE_URL"

cd "$APP_CWD"

if [ ! -f scripts/regenerate-english-batch.js ]; then
  echo "ERROR: $APP_CWD 下没有 scripts/regenerate-english-batch.js"
  echo "请先将 Ediora 代码同步到该站点目录，或在该目录 git pull"
  exit 1
fi

export BASE_URL
export DRY_RUN="${DRY_RUN_FIX:-0}"
if [ "$DRY_RUN" = "1" ]; then
  DRY_RUN=1 node scripts/regenerate-english-batch.js
else
  node scripts/regenerate-english-batch.js
fi
