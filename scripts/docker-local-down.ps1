Param(
  [switch]$All
)

$ErrorActionPreference = "Stop"

if ($All) {
  Write-Host "[docker-local-down] Stopping full stack..."
  docker compose down
} else {
  Write-Host "[docker-local-down] Stopping db + adminer only..."
  docker compose stop db adminer
}

Write-Host "[docker-local-down] Done."
