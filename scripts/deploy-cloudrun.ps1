param(
  [string]$ProjectId = "",
  [string]$Region = "europe-west1",
  [ValidateSet("dev", "staging", "prod")]
  [string]$Environment = "prod",
  [string]$SecretVersion = "latest",
  [switch]$UseSecretManager,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
  $ProjectId = (gcloud config get-value project 2>$null).Trim()
}

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
  throw "ProjectId manquant. Passe -ProjectId <GCP_PROJECT_ID> ou configure 'gcloud config set project'."
}

# -------- Cloud Run services --------
$serviceSuffix = if ($Environment -eq "prod") { "" } else { "-$Environment" }
$BackendServiceName = "cineconnect-api$serviceSuffix"
$FrontendServiceName = "cineconnect-web$serviceSuffix"

# -------- Backend env vars (mode local/manual) --------
$DatabaseUrl = "postgresql://CHANGE_ME"
$JwtSecret = "CHANGE_ME_JWT_SECRET_MIN_32_CHARS"
$OmdbApiKey = "CHANGE_ME_OMDB_API_KEY"
$MailProvider = "mailgun"
$MailgunApiKey = "CHANGE_ME_MAILGUN_API_KEY"
$MailgunDomain = "CHANGE_ME_MAILGUN_DOMAIN"
$MailgunFrom = "CineConnect <postmaster@CHANGE_ME>"
$MailgunBaseUrl = "https://api.eu.mailgun.net"
$PasswordResetTokenTtl = "30"
$PasswordResetSubject = "Reinitialisation du mot de passe"
$PasswordResetDevReturnLink = "false"

# -------- Secret Manager mapping (mode recommande) --------
$secretPrefix = "cineconnect-$Environment"
$DatabaseUrlSecretName = "$secretPrefix-database-url"
$JwtSecretSecretName = "$secretPrefix-jwt-secret"
$OmdbApiKeySecretName = "$secretPrefix-omdb-api-key"
$MailgunApiKeySecretName = "$secretPrefix-mailgun-api-key"

function Assert-Configured([string]$Name, [string]$Value) {
  if ($Value -like "CHANGE_ME*") {
    throw "Variable '$Name' non configuree. Edite scripts/deploy-cloudrun.ps1 puis relance."
  }
}

Write-Host "Project: $ProjectId"
Write-Host "Region:  $Region"
Write-Host "Env:     $Environment"
Write-Host "Version: $SecretVersion"
Write-Host "Secrets: $UseSecretManager"
Write-Host "DryRun:  $DryRun"

if ($DryRun) {
  Write-Host "[DryRun] gcloud builds submit --config cloudbuild.backend.yaml"
  if ($UseSecretManager) {
    Write-Host "[DryRun] gcloud run deploy $BackendServiceName ... --set-secrets DATABASE_URL=${DatabaseUrlSecretName}:${SecretVersion},..."
  } else {
    Write-Host "[DryRun] gcloud run deploy $BackendServiceName ... --set-env-vars ..."
  }
  Write-Host "[DryRun] gcloud builds submit --config cloudbuild.frontend.yaml ..."
  Write-Host "[DryRun] gcloud run deploy $FrontendServiceName ..."
  Write-Host "[DryRun] gcloud run services update $BackendServiceName --update-env-vars FRONTEND_URL=<frontend-url>"
  exit 0
}

if (-not $UseSecretManager) {
  Assert-Configured "DatabaseUrl" $DatabaseUrl
  Assert-Configured "JwtSecret" $JwtSecret
  Assert-Configured "OmdbApiKey" $OmdbApiKey
  Assert-Configured "MailgunApiKey" $MailgunApiKey
  Assert-Configured "MailgunDomain" $MailgunDomain
}

Write-Host "1/6 Build backend image..."
& gcloud builds submit --project $ProjectId --config cloudbuild.backend.yaml

Write-Host "2/6 Deploy backend service..."
$backendEnv = @(
  "NODE_ENV=production",
  "FRONTEND_URL=https://placeholder.invalid",
  "DEPLOY_ENV=$Environment",
  "MAIL_PROVIDER=$MailProvider",
  "MAILGUN_DOMAIN=$MailgunDomain",
  "MAILGUN_FROM=$MailgunFrom",
  "MAILGUN_BASE_URL=$MailgunBaseUrl",
  "PASSWORD_RESET_TOKEN_TTL_MINUTES=$PasswordResetTokenTtl",
  "PASSWORD_RESET_EMAIL_SUBJECT=$PasswordResetSubject",
  "PASSWORD_RESET_DEV_RETURN_LINK=$PasswordResetDevReturnLink"
) -join ","

if ($UseSecretManager) {
  $backendSecrets = @(
    "DATABASE_URL=${DatabaseUrlSecretName}:${SecretVersion}",
    "JWT_SECRET=${JwtSecretSecretName}:${SecretVersion}",
    "OMDB_API_KEY=${OmdbApiKeySecretName}:${SecretVersion}",
    "MAILGUN_API_KEY=${MailgunApiKeySecretName}:${SecretVersion}"
  ) -join ","

  & gcloud run deploy $BackendServiceName `
    --project $ProjectId `
    --image "gcr.io/$ProjectId/cineconnect-api" `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --set-env-vars $backendEnv `
    --set-secrets $backendSecrets
} else {
  $backendEnv = @(
    $backendEnv,
    "DATABASE_URL=$DatabaseUrl",
    "JWT_SECRET=$JwtSecret",
    "OMDB_API_KEY=$OmdbApiKey",
    "MAILGUN_API_KEY=$MailgunApiKey"
  ) -join ","

  & gcloud run deploy $BackendServiceName `
    --project $ProjectId `
    --image "gcr.io/$ProjectId/cineconnect-api" `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --set-env-vars $backendEnv
}

Write-Host "3/6 Resolve backend URL..."
$BackendUrl = (& gcloud run services describe $BackendServiceName `
  --project $ProjectId `
  --region $Region `
  --platform managed `
  --format "value(status.url)").Trim()

if ([string]::IsNullOrWhiteSpace($BackendUrl)) {
  throw "Impossible de recuperer l'URL backend Cloud Run."
}

Write-Host "Backend URL: $BackendUrl"

Write-Host "4/6 Build frontend image..."
& gcloud builds submit `
  --project $ProjectId `
  --config cloudbuild.frontend.yaml `
  --substitutions "_VITE_API_URL=$BackendUrl,_VITE_SOCKET_URL=$BackendUrl"

Write-Host "5/6 Deploy frontend service..."
& gcloud run deploy $FrontendServiceName `
  --project $ProjectId `
  --image "gcr.io/$ProjectId/cineconnect-web" `
  --platform managed `
  --region $Region `
  --allow-unauthenticated

Write-Host "6/6 Resolve frontend URL and update backend FRONTEND_URL..."
$FrontendUrl = (& gcloud run services describe $FrontendServiceName `
  --project $ProjectId `
  --region $Region `
  --platform managed `
  --format "value(status.url)").Trim()

if ([string]::IsNullOrWhiteSpace($FrontendUrl)) {
  throw "Impossible de recuperer l'URL frontend Cloud Run."
}

& gcloud run services update $BackendServiceName `
  --project $ProjectId `
  --region $Region `
  --platform managed `
  --update-env-vars "FRONTEND_URL=$FrontendUrl"

Write-Host ""
Write-Host "Deploiement termine."
Write-Host "Frontend: $FrontendUrl"
Write-Host "Backend : $BackendUrl"
Write-Host "Health  : $BackendUrl/health"
