Param(
  [switch]$All
)

$ErrorActionPreference = "Stop"
$composeFile = "docker-compose.yml"

if ($All) {
  Write-Host "[docker-local-down] Stopping full stack..."
  docker compose -f $composeFile down
} else {
  Write-Host "[docker-local-down] Stopping db + adminer only..."
  docker compose -f $composeFile stop db adminer
}

Write-Host "[docker-local-down] Done."
