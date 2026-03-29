# Declenche un deploiement Coolify via webhook (meme effet que le workflow GitHub Actions).
# Usage: definir COOLIFY_WEBHOOK_URL (variable d'environnement ou -WebhookUrl), puis:
#   ./scripts/trigger-coolify-deploy.ps1

param(
    [string] $WebhookUrl = $env:COOLIFY_WEBHOOK_URL
)

if (-not $WebhookUrl) {
    Write-Error "COOLIFY_WEBHOOK_URL manquant. Ajoute l'URL du webhook (Coolify > Deployments > Webhooks) ou passe -WebhookUrl."
    exit 1
}

Invoke-WebRequest -Uri $WebhookUrl -Method Post -UseBasicParsing -TimeoutSec 180 | Out-Null
Write-Host "Webhook Coolify appele OK."
