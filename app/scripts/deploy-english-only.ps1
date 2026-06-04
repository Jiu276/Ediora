# =============================================================================
# Ediora 本地 → 服务器部署辅助（Windows PowerShell）
#
# 用法示例:
#   cd D:\ArticleAxis\Ediora\app
#   .\scripts\deploy-english-only.ps1 -ServerUser admin -ServerHost YOUR_IP
#
# 仅上传脚本并在服务器执行（需已配置 SSH 密钥）:
#   .\scripts\deploy-english-only.ps1 -ServerUser admin -ServerHost YOUR_IP -RemoteOnly
# =============================================================================
param(
  [string]$ServerUser = "admin",
  [string]$ServerHost = "",
  [string]$RemoteAppDir = "/home/admin/Ediora-app/app",
  [switch]$RemoteOnly,
  [switch]$GitPull,
  [switch]$DryRunFix
)

$ErrorActionPreference = "Stop"
$LocalAppDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

if (-not $ServerHost) {
  Write-Host @"

请在服务器 SSH 登录后执行:

  cd /home/admin/Ediora-app/app
  git pull
  bash scripts/deploy-english-only.sh

或一行（先预览含中文文章）:

  cd /home/admin/Ediora-app/app && git pull && DRY_RUN_FIX=1 bash scripts/deploy-english-only.sh

正式部署并修复:

  cd /home/admin/Ediora-app/app && git pull && GIT_PULL=0 bash scripts/deploy-english-only.sh

"@
  exit 0
}

$sshTarget = "${ServerUser}@${ServerHost}"

Write-Host "[deploy] 同步脚本到服务器..."
scp "$LocalAppDir\scripts\deploy-english-only.sh" "${sshTarget}:${RemoteAppDir}/scripts/"
scp "$LocalAppDir\scripts\regenerate-english-batch.js" "${sshTarget}:${RemoteAppDir}/scripts/"

if ($RemoteOnly) {
  $flags = @()
  if ($GitPull) { $flags += "GIT_PULL=1" }
  if ($DryRunFix) { $flags += "DRY_RUN_FIX=1" }
  $cmd = "cd $RemoteAppDir && $($flags -join ' ') bash scripts/deploy-english-only.sh"
  Write-Host "[deploy] 远程执行: $cmd"
  ssh $sshTarget $cmd
  exit $LASTEXITCODE
}

Write-Host @"
[deploy] 脚本已上传。请在服务器执行完整部署:

  ssh $sshTarget
  cd $RemoteAppDir
  git pull
  bash scripts/deploy-english-only.sh

若代码通过 Git 管理，也可在服务器仅:

  cd $RemoteAppDir && git pull && bash scripts/deploy-english-only.sh

"@
