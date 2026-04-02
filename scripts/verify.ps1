# Runs full quality gate: typecheck + lint + tests (backend + frontend).
# Usage: from repo root, .\scripts\verify.ps1
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $PSScriptRoot)
pnpm verify
