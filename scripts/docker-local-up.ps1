Param(
  [switch]$FullStack
)

$ErrorActionPreference = "Stop"
$composeFile = "docker-compose.yml"

if ($FullStack) {
  Write-Host "[docker-local-up] Starting full stack: db, api, web, adminer..."
  docker compose -f $composeFile up -d db api web adminer
} else {
  Write-Host "[docker-local-up] Starting DB tools only: db + adminer..."
  docker compose -f $composeFile up -d db adminer
}

Write-Host "[docker-local-up] Done."
Write-Host "DB:       localhost:5437"
Write-Host "Adminer:  http://localhost:8083"
