#!/bin/bash
# =============================================================================
# Ediora 部署：英文正文防护 + 批量修复已有中文文章
#
# 在服务器上执行（推荐）:
#   cd /home/admin/Ediora-app/app && bash scripts/deploy-english-only.sh
#
# 环境变量（可选）:
#   APP_DIR=/home/admin/Ediora-app/app   应用根目录
#   GIT_PULL=1                           部署前 git pull
#   FIX_CJK=1                            构建后批量重生成含中文文章（默认开启）
#   DRY_RUN_FIX=1                        仅列出含中文文章，不写入数据库
#   BASE_URL=http://127.0.0.1:27601      批量修复时调用的 API 地址
#   PM2_NAME=ediora                      pm2 进程名；留空则 pm2 restart all
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/home/admin/Ediora-app/app}"
BASE_URL="${BASE_URL:-http://127.0.0.1:27601}"
FIX_CJK="${FIX_CJK:-1}"
DRY_RUN_FIX="${DRY_RUN_FIX:-0}"
GIT_PULL="${GIT_PULL:-0}"
PM2_NAME="${PM2_NAME:-}"

log() { echo "[deploy] $*"; }

if [ ! -d "$APP_DIR" ]; then
  log "ERROR: APP_DIR 不存在: $APP_DIR"
  exit 1
fi

cd "$APP_DIR"
log "工作目录: $(pwd)"

if [ "$GIT_PULL" = "1" ] && [ -d .git ]; then
  log "git pull..."
  git pull --ff-only
fi

log "安装依赖..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

log "Prisma generate..."
npx prisma generate

log "释放内存（停止 pm2）..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 stop all 2>/dev/null || true
fi

log "当前内存:"
free -h 2>/dev/null || true

log "构建 Next.js（低配机请耐心等待 5–15 分钟）..."
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
export NEXT_TELEMETRY_DISABLED=1
export LOW_MEM_BUILD="${LOW_MEM_BUILD:-1}"
npm run build

log "重启应用..."
if [ -n "$PM2_NAME" ]; then
  pm2 restart "$PM2_NAME"
else
  pm2 restart all
fi

log "等待服务就绪..."
sleep 5
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sf "${BASE_URL}/api/articles?limit=1" >/dev/null 2>&1; then
    log "API 已响应: $BASE_URL"
    break
  fi
  if [ "$i" -eq 10 ]; then
    log "WARN: API 未响应，跳过批量修复（可稍后手动执行 regenerate-english-batch.js）"
    FIX_CJK=0
  fi
  sleep 2
done

if [ "$FIX_CJK" = "1" ]; then
  log "扫描并修复含中文（CJK）的文章..."
  if [ "$DRY_RUN_FIX" = "1" ]; then
    DRY_RUN=1 BASE_URL="$BASE_URL" node scripts/regenerate-english-batch.js
  else
    BASE_URL="$BASE_URL" node scripts/regenerate-english-batch.js
  fi
else
  log "已跳过批量修复（FIX_CJK=0）"
fi

log "完成。请抽查前台文章是否仍为英文。"
