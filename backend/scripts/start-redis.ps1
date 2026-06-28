# Starts Redis from docker-compose for local Celery (port 6379).
# Requires Docker Desktop to be running.
$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $root

docker compose up redis -d
Write-Host 'Redis is running on localhost:6379'
