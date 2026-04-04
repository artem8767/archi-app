# Після створення ПОРОЖНЬОГО репозиторію на GitHub скопіюй HTTPS URL і запусти з кореня проєкту:
#   powershell -ExecutionPolicy Bypass -File scripts/push-to-github.ps1 "https://github.com/НІК/archi-app.git"
# Якщо origin уже існує і треба підмінити URL: додай -Force
param(
  [Parameter(Mandatory = $true)]
  [string]$RepoUrl,
  [switch]$Force
)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
$branch = git branch --show-current
if (-not $branch) { throw "Не git-репозиторій або немає гілки." }

Write-Host "Гілка: $branch"
if (git remote get-url origin 2>$null) {
  $existing = git remote get-url origin
  if ($existing -ne $RepoUrl -and -not $Force) {
    throw "origin уже вказує на: $existing`nЗапусти з -Force щоб замінити на: $RepoUrl"
  }
  if ($existing -ne $RepoUrl) { git remote set-url origin $RepoUrl }
  Write-Host "origin: $RepoUrl"
} else {
  git remote add origin $RepoUrl
  Write-Host "Додано origin: $RepoUrl"
}

Write-Host "git push -u origin $branch"
git push -u origin $branch
Write-Host "Готово."
