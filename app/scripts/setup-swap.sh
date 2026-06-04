#!/bin/bash
# 为 2GB 轻量服务器增加 2GB swap，避免 next build OOM
# 用法: sudo bash scripts/setup-swap.sh
set -euo pipefail

SWAP_FILE="${SWAP_FILE:-/swapfile}"
SWAP_GB="${SWAP_GB:-2}"

if swapon --show | grep -q "$SWAP_FILE"; then
  echo "[swap] 已启用: $SWAP_FILE"
  swapon --show
  exit 0
fi

if [ -f "$SWAP_FILE" ]; then
  echo "[swap] 文件已存在，尝试启用..."
  chmod 600 "$SWAP_FILE"
  swapon "$SWAP_FILE" || true
  swapon --show || true
  exit 0
fi

echo "[swap] 创建 ${SWAP_GB}G swap: $SWAP_FILE"
fallocate -l "${SWAP_GB}G" "$SWAP_FILE" 2>/dev/null || dd if=/dev/zero of="$SWAP_FILE" bs=1M count=$((SWAP_GB * 1024)) status=progress
chmod 600 "$SWAP_FILE"
mkswap "$SWAP_FILE"
swapon "$SWAP_FILE"

if ! grep -q "$SWAP_FILE" /etc/fstab 2>/dev/null; then
  echo "$SWAP_FILE none swap sw 0 0" >> /etc/fstab
fi

echo "[swap] 完成"
free -h
