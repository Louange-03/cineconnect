Param(
  [switch]$FullStack
)

$ErrorActionPreference = "Stop"

if ($FullStack) {
  Write-Host "[docker-local-up] Starting full stack: db, api, web, adminer..."
  docker compose up -d db api web adminer
} else {
  Write-Host "[docker-local-up] Starting DB tools only: db + adminer..."
  docker compose up -d db adminer
}

Write-Host "[docker-local-up] Done."
Write-Host "DB:       localhost:5437"
Write-Host "Adminer:  http://localhost:8083"
