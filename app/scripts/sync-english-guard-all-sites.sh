#!/bin/bash
# =============================================================================
# 将英文防护相关代码同步到本机所有 Ediora-* 站点目录
#
# 用法（在服务器上，源码目录已是最新代码）:
#   cd /home/admin/Ediora-app/app && bash scripts/sync-english-guard-all-sites.sh
#
# 环境变量:
#   SRC_DIR=/home/admin/Ediora-app/app     源目录（已含最新防护代码）
#   DRY_RUN=1                            只打印将要复制的文件，不写入
#   BUILD=1                              同步后对每个站点 npm run build
#   PM2_RESTART=1                        构建后 pm2 restart 对应进程名
#   LOW_MEM_BUILD=1                      构建时启用（默认 1）
# =============================================================================
set -euo pipefail

SRC_DIR="${SRC_DIR:-/home/admin/Ediora-app/app}"
DRY_RUN="${DRY_RUN:-0}"
DO_BUILD="${BUILD:-0}"
DO_PM2="${PM2_RESTART:-0}"
LOW_MEM_BUILD="${LOW_MEM_BUILD:-1}"

log() { echo "[sync] $*"; }

if [ ! -d "$SRC_DIR" ]; then
  log "ERROR: 源目录不存在: $SRC_DIR"
  exit 1
fi

# 相对路径列表：英文防护 + 常用维护脚本
FILES=(
  "lib/articleEnglishGuard.ts"
  "lib/language.ts"
  "lib/normalizeArticleContent.ts"
  "lib/spark.ts"
  "next.config.mjs"
  "app/api/generate-article/route.ts"
  "app/api/articles/route.ts"
  "app/api/articles/[id]/route.ts"
  "app/api/articles/[id]/versions/[versionId]/route.ts"
  "app/api/auto-images/route.ts"
  "app/admin/articles/page.tsx"
  "components/PublishWizard.tsx"
  "scripts/regenerate-english-batch.js"
  "scripts/fix-one-article-english.js"
  "scripts/rehydrate-article-images.js"
  "scripts/regenerate-english-pm2-site.sh"
  "scripts/lib/insertArticleImages.js"
  "scripts/lib/rehydrateOne.js"
)

# 校验源文件
MISSING=0
for f in "${FILES[@]}"; do
  if [ ! -f "$SRC_DIR/$f" ]; then
    log "WARN: 源文件缺失，将跳过: $f"
    MISSING=$((MISSING + 1))
  fi
done
if [ "$MISSING" -eq "${#FILES[@]}" ]; then
  log "ERROR: 源目录没有任何可同步文件，请先 git pull"
  exit 1
fi

# 站点目录：/home/admin/Ediora-xxx/app，排除源目录自身
mapfile -t SITE_DIRS < <(
  find /home/admin -maxdepth 2 -type d -path '/home/admin/Ediora-*/app' 2>/dev/null | sort -u
)

if [ "${#SITE_DIRS[@]}" -eq 0 ]; then
  log "ERROR: 未找到 /home/admin/Ediora-*/app"
  exit 1
fi

log "源目录: $SRC_DIR"
log "目标站点数: ${#SITE_DIRS[@]}"

for DST_DIR in "${SITE_DIRS[@]}"; do
  SRC_REAL=$(cd "$SRC_DIR" && pwd)
  DST_REAL=$(cd "$DST_DIR" && pwd)
  if [ "$SRC_REAL" = "$DST_REAL" ]; then
    log "skip (源目录): $DST_DIR"
    continue
  fi

  SITE_NAME=$(basename "$(dirname "$DST_DIR")" | sed 's/^Ediora-//')
  log "----> $DST_DIR (pm2: ${SITE_NAME:-?})"

  for f in "${FILES[@]}"; do
    if [ ! -f "$SRC_DIR/$f" ]; then
      continue
    fi
    mkdir -p "$(dirname "$DST_DIR/$f")"
    if [ "$DRY_RUN" = "1" ]; then
      echo "  would copy: $f"
    else
      cp -a "$SRC_DIR/$f" "$DST_DIR/$f"
      echo "  copied: $f"
    fi
  done

  if [ "$DRY_RUN" = "1" ]; then
    continue
  fi

  if [ "$DO_BUILD" = "1" ]; then
    log "build: $DST_DIR"
    (
      cd "$DST_DIR"
      export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
      export LOW_MEM_BUILD="$LOW_MEM_BUILD"
      export NEXT_TELEMETRY_DISABLED=1
      pm2 stop "$SITE_NAME" 2>/dev/null || true
      npm run build
    ) || log "WARN: build failed for $SITE_NAME"
  fi

  if [ "$DO_PM2" = "1" ]; then
    if pm2 describe "$SITE_NAME" >/dev/null 2>&1; then
      log "pm2 restart: $SITE_NAME"
      pm2 restart "$SITE_NAME"
    else
      log "WARN: pm2 进程不存在: $SITE_NAME（请手动启动）"
    fi
  fi
done

log "完成。"
if [ "$DRY_RUN" = "1" ]; then
  log "本次为预览 (DRY_RUN=1)。正式同步请: bash scripts/sync-english-guard-all-sites.sh"
fi
if [ "$DO_BUILD" = "0" ]; then
  log "提示: 同步后建议对每个站点执行 BUILD=1 PM2_RESTART=1 bash scripts/sync-english-guard-all-sites.sh"
fi
