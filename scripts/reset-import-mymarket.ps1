param(
    [string]$ImportDir = "",
    [string]$ContainerName = "tiza-postgres",
    [string]$DbName = "tiza",
    [string]$DbUser = "tiza"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ImportDir)) {
    $latestImport = Get-ChildItem (Join-Path $PSScriptRoot "..\\data-import") -Directory |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $latestImport) {
        throw "No import directory found under data-import."
    }

    $ImportDir = $latestImport.FullName
}

$resolvedImportDir = (Resolve-Path $ImportDir).Path
$categoriesCsv = Join-Path $resolvedImportDir "mymarket-categories-db-ready.csv"
$productsCsv = Join-Path $resolvedImportDir "mymarket-products-db-ready.csv"
$sqlFile = Join-Path $PSScriptRoot "reset-import-mymarket.sql"

if (-not (Test-Path $categoriesCsv)) {
    throw "Missing categories CSV: $categoriesCsv"
}

if (-not (Test-Path $productsCsv)) {
    throw "Missing products CSV: $productsCsv"
}

if (-not (Test-Path $sqlFile)) {
    throw "Missing SQL file: $sqlFile"
}

docker ps --format "{{.Names}}" | Select-String -SimpleMatch $ContainerName | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "Container '$ContainerName' is not running."
}

Write-Host "Copying CSV files into $ContainerName..."
docker cp $categoriesCsv "${ContainerName}:/tmp/mymarket-categories-db-ready.csv"
docker cp $productsCsv "${ContainerName}:/tmp/mymarket-products-db-ready.csv"

Write-Host "Resetting database and importing catalog from $resolvedImportDir..."
Get-Content $sqlFile -Raw | docker exec -i $ContainerName psql -v ON_ERROR_STOP=1 -U $DbUser -d $DbName

Write-Host "Import finished."
