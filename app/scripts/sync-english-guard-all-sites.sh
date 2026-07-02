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
#   BUILD=1                              同步后对每个站点 npm run build（慎用：全站构建很慢）
#   ONLY_SITE=summasite                  只处理该 PM2 名称的站点（可逗号分隔多个）
#   PM2_RESTART=1                        构建后 pm2 restart 对应进程名
#   LOW_MEM_BUILD=1                      构建时启用（默认 1）
# =============================================================================
set -euo pipefail

SRC_DIR="${SRC_DIR:-/home/admin/Ediora-app/app}"
DRY_RUN="${DRY_RUN:-0}"
DO_BUILD="${BUILD:-0}"
DO_PM2="${PM2_RESTART:-0}"
LOW_MEM_BUILD="${LOW_MEM_BUILD:-1}"
ONLY_SITE="${ONLY_SITE:-}"

log() { echo "[sync] $*"; }

if [ "$(id -u)" -eq 0 ]; then
  log "WARN: 当前为 root。PM2 进程通常在 admin 用户下，请改用: su - admin"
fi

if [ ! -d "$SRC_DIR" ]; then
  log "ERROR: 源目录不存在: $SRC_DIR"
  exit 1
fi

# 相对路径列表：英文防护 + 常用维护脚本
FILES=(
  "lib/articleEnglishGuard.ts"
  "lib/articleLength.ts"
  "lib/generateEnglishFallback.ts"
  "lib/language.ts"
  "lib/normalizeArticleContent.ts"
  "lib/spark.ts"
  "lib/viewCount.ts"
  "lib/keywordLinks.ts"
  "lib/insertArticleImages.ts"
  "lib/articleImageSearch.ts"
  "next.config.mjs"
  "app/api/generate-article/route.ts"
  "app/api/articles/route.ts"
  "app/api/articles/[id]/route.ts"
  "app/api/articles/slug/[slug]/route.ts"
  "app/api/articles/[id]/versions/[versionId]/route.ts"
  "app/api/auto-images/route.ts"
  "app/admin/articles/page.tsx"
  "app/admin/articles/[id]/page.tsx"
  "components/PublishWizard.tsx"
  "components/ArticleAiImagePanel.tsx"
  "scripts/regenerate-english-batch.js"
  "scripts/regenerate-short-articles.js"
  "scripts/fix-one-article-english.js"
  "scripts/rehydrate-article-images.js"
  "scripts/regenerate-english-pm2-site.sh"
  "scripts/lib/insertArticleImages.js"
  "scripts/lib/rehydrateOne.js"
  "scripts/lib/buildMediumFallback.js"
  "scripts/update-cecred-article.js"
  "scripts/fix-zappos-article-images.js"
  "scripts/content/cecred-haircare-article.js"
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

log "目标站点数: ${#SITE_DIRS[@]}"

idx=0
for DST_DIR in "${SITE_DIRS[@]}"; do
  idx=$((idx + 1))
  SRC_REAL=$(cd "$SRC_DIR" && pwd)
  DST_REAL=$(cd "$DST_DIR" && pwd)
  if [ "$SRC_REAL" = "$DST_REAL" ]; then
    log "skip (源目录): $DST_DIR"
    continue
  fi

  SITE_NAME=$(basename "$(dirname "$DST_DIR")" | sed 's/^Ediora-//')

  if [ -n "$ONLY_SITE" ]; then
    match=0
    IFS=',' read -ra ONLY_ARR <<< "$ONLY_SITE"
    for want in "${ONLY_ARR[@]}"; do
      want="$(echo "$want" | xargs)"
      if [ "$SITE_NAME" = "$want" ]; then
        match=1
        break
      fi
    done
    if [ "$match" -eq 0 ]; then
      log "skip (ONLY_SITE): $SITE_NAME"
      continue
    fi
  fi

  log "==== [$idx/${#SITE_DIRS[@]}] $DST_DIR (pm2: ${SITE_NAME:-?}) ===="

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
    log "build start: $SITE_NAME ($(date '+%H:%M:%S')) — 通常需 5~15 分钟，请耐心等待"
    (
      cd "$DST_DIR"
      export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
      export LOW_MEM_BUILD="$LOW_MEM_BUILD"
      export NEXT_TELEMETRY_DISABLED=1
      pm2 stop "$SITE_NAME" 2>/dev/null || true
      npm run build
    ) && log "build done: $SITE_NAME ($(date '+%H:%M:%S'))" || log "WARN: build failed for $SITE_NAME"
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
  log "提示: 仅复制文件已完成。单站构建示例:"
  log "  ONLY_SITE=summasite BUILD=1 PM2_RESTART=1 bash scripts/sync-english-guard-all-sites.sh"
fi
