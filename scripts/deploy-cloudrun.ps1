$ErrorActionPreference = "Stop"

# 1) Configure these values before running.
$PROJECT_ID = "cineconnect-491412"
$REGION = "europe-west1"
$SERVICE = "cineconnect-api"
$REPOSITORY = "cineconnect-repo"
$IMAGE = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE:latest"

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

# 2) Prerequisites.
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
  throw "gcloud CLI n'est pas installe. Installe Google Cloud SDK puis relance ce script."
}

# 3) Set project and enable required services.
gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com
gcloud auth configure-docker "$REGION-docker.pkg.dev"

# 4) Ensure Artifact Registry repository exists.
gcloud artifacts repositories describe $REPOSITORY --location $REGION *> $null
if ($LASTEXITCODE -ne 0) {
  gcloud artifacts repositories create $REPOSITORY --repository-format=docker --location=$REGION --description="repo cineconnect"
}

# 5) Create/update secrets from environment variables (never hardcoded in git).
$DATABASE_URL = $env:DATABASE_URL
$JWT_SECRET = $env:JWT_SECRET
$MAILGUN_API_KEY = $env:MAILGUN_API_KEY
$OMDB_API_KEY = $env:OMDB_API_KEY

if ([string]::IsNullOrWhiteSpace($DATABASE_URL) -or [string]::IsNullOrWhiteSpace($JWT_SECRET) -or [string]::IsNullOrWhiteSpace($MAILGUN_API_KEY) -or [string]::IsNullOrWhiteSpace($OMDB_API_KEY)) {
  throw "Definis DATABASE_URL, JWT_SECRET, MAILGUN_API_KEY et OMDB_API_KEY dans l'environnement PowerShell avant execution."
}

Set-SecretValue -Name "DATABASE_URL" -Value $DATABASE_URL
Set-SecretValue -Name "JWT_SECRET" -Value $JWT_SECRET
Set-SecretValue -Name "MAILGUN_API_KEY" -Value $MAILGUN_API_KEY
Set-SecretValue -Name "OMDB_API_KEY" -Value $OMDB_API_KEY

# 6) Build container image.
gcloud builds submit --tag $IMAGE

# 7) Deploy to Cloud Run with non-secret env + Secret Manager bindings.
gcloud run deploy $SERVICE `
  --image $IMAGE `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated `
  --env-vars-file cloudrun.env.public.yaml `
  --set-secrets DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,MAILGUN_API_KEY=MAILGUN_API_KEY:latest,OMDB_API_KEY=OMDB_API_KEY:latest

# 8) Optional: show service URL.
gcloud run services describe $SERVICE --region $REGION --format "value(status.url)"
