# Celery worker for Windows (solo pool is configured in settings.py).
$ErrorActionPreference = 'Stop'
$backend = Resolve-Path (Join-Path $PSScriptRoot '..')
$root = Resolve-Path (Join-Path $backend '..')
Set-Location $backend

$venvCelery = Join-Path $root '.venv\Scripts\celery.exe'
if (-not (Test-Path $venvCelery)) {
    $venvCelery = 'celery'
}

& $venvCelery -A config worker --loglevel=info
