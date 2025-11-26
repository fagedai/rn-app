# Aliyun One-Pass Login Files Restore Script
# Restore all related files after rebuild

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupDir
)

if (-not (Test-Path $BackupDir)) {
    Write-Host "Error: Backup directory not found: $BackupDir" -ForegroundColor Red
    exit 1
}

Write-Host "Starting to restore Aliyun One-Pass login related files..." -ForegroundColor Green
Write-Host "Backup directory: $BackupDir`n" -ForegroundColor Cyan

# Restore Android native code
$androidSrc = "android/app/src/main/java/com/anonymous/nest"
$backupSrc = Join-Path $BackupDir "android/src"
$files = @(
    "AliyunOnepassModule.kt",
    "AliyunOnepassPackage.kt",
    "MainApplication.kt"
)

foreach ($file in $files) {
    $source = Join-Path $backupSrc $file
    if (Test-Path $source) {
        $dest = Join-Path $androidSrc $file
        $destDir = Split-Path $dest -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $source $dest -Force
        Write-Host "  [OK] Restored: $file" -ForegroundColor Green
    } else {
        Write-Host "  [X] Not found in backup: $file" -ForegroundColor Yellow
    }
}

# Restore Android config files
$configFiles = @(
    "android/build.gradle",
    "android/app/build.gradle",
    "android/app/proguard-rules.pro"
)

foreach ($file in $configFiles) {
    $source = Join-Path $BackupDir $file
    if (Test-Path $source) {
        $destDir = Split-Path $file -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $source $file -Force
        Write-Host "  [OK] Restored: $file" -ForegroundColor Green
    } else {
        Write-Host "  [X] Not found in backup: $file" -ForegroundColor Yellow
    }
}

# Restore AAR files
$backupLibs = Join-Path $BackupDir "android/app/libs"
if (Test-Path $backupLibs) {
    $aarFiles = Get-ChildItem -Path $backupLibs -Filter "*.aar"
    if ($aarFiles.Count -gt 0) {
        $destLibs = "android/app/libs"
        if (-not (Test-Path $destLibs)) {
            New-Item -ItemType Directory -Path $destLibs -Force | Out-Null
        }
        Copy-Item "$backupLibs/*.aar" $destLibs -Force
        Write-Host "  [OK] Restored AAR files ($($aarFiles.Count) files)" -ForegroundColor Green
    }
}

# Restore TypeScript code
$tsFiles = @(
    "services/onepass/index.ts"
)

foreach ($file in $tsFiles) {
    $source = Join-Path $BackupDir $file
    if (Test-Path $source) {
        $destDir = Split-Path $file -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $source $file -Force
        Write-Host "  [OK] Restored: $file" -ForegroundColor Green
    } else {
        Write-Host "  [X] Not found in backup: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nRestore completed!" -ForegroundColor Green
Write-Host "Please verify the following files are correctly restored:" -ForegroundColor Yellow
Write-Host "  1. MainApplication.kt contains AliyunOnepassPackage()" -ForegroundColor Yellow
Write-Host "  2. android/app/build.gradle contains AAR dependencies" -ForegroundColor Yellow
Write-Host "  3. android/build.gradle contains Aliyun Maven repository" -ForegroundColor Yellow

