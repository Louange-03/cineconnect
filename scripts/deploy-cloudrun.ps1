$ErrorActionPreference = "Stop"

# 1) Configure these values before running.
$PROJECT_ID = "YOUR_GCP_PROJECT_ID"
$REGION = "europe-west1"
$SERVICE = "cineconnect-api"
$IMAGE = "gcr.io/$PROJECT_ID/$SERVICE"

function Set-SecretValue {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][string]$Value
  )

  gcloud secrets describe $Name *> $null
  if ($LASTEXITCODE -eq 0) {
    $Value | gcloud secrets versions add $Name --data-file=-
  } else {
    $Value | gcloud secrets create $Name --replication-policy="automatic" --data-file=-
  }
}

# 2) Set project.
gcloud config set project $PROJECT_ID

# 3) Create/update secrets (replace placeholder values).
Set-SecretValue -Name "DATABASE_URL" -Value "postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
Set-SecretValue -Name "JWT_SECRET" -Value "CHANGE_ME_MIN_32_CHARS"
Set-SecretValue -Name "MAILGUN_API_KEY" -Value "key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 4) Build container image.
gcloud builds submit --tag $IMAGE

# 5) Deploy to Cloud Run with non-secret env + Secret Manager bindings.
gcloud run deploy $SERVICE `
  --image $IMAGE `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --env-vars-file cloudrun.env.public.yaml `
  --set-secrets DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,MAILGUN_API_KEY=MAILGUN_API_KEY:latest

# 6) Optional: show service URL.
gcloud run services describe $SERVICE --region $REGION --format "value(status.url)"
