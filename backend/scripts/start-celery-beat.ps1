# Celery beat scheduler — run in a separate terminal from the worker.
$ErrorActionPreference = 'Stop'
$backend = Resolve-Path (Join-Path $PSScriptRoot '..')
$root = Resolve-Path (Join-Path $backend '..')
Set-Location $backend

$venvCelery = Join-Path $root '.venv\Scripts\celery.exe'
if (-not (Test-Path $venvCelery)) {
    $venvCelery = 'celery'
}

& $venvCelery -A config beat --loglevel=info
