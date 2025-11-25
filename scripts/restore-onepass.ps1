# 阿里云一键登录文件恢复脚本
# 用于在重新构建后恢复所有相关文件

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupDir
)

if (-not (Test-Path $BackupDir)) {
    Write-Host "错误: 备份目录不存在: $BackupDir" -ForegroundColor Red
    exit 1
}

Write-Host "开始恢复阿里云一键登录相关文件..." -ForegroundColor Green
Write-Host "备份目录: $BackupDir`n" -ForegroundColor Cyan

# 恢复 Android 原生代码
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
        Write-Host "  ✓ 恢复: $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 备份中未找到: $file" -ForegroundColor Yellow
    }
}

# 恢复 Android 配置文件
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
        Write-Host "  ✓ 恢复: $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 备份中未找到: $file" -ForegroundColor Yellow
    }
}

# 恢复 AAR 文件
$backupLibs = Join-Path $BackupDir "android/app/libs"
if (Test-Path $backupLibs) {
    $aarFiles = Get-ChildItem -Path $backupLibs -Filter "*.aar"
    if ($aarFiles.Count -gt 0) {
        $destLibs = "android/app/libs"
        if (-not (Test-Path $destLibs)) {
            New-Item -ItemType Directory -Path $destLibs -Force | Out-Null
        }
        Copy-Item "$backupLibs/*.aar" $destLibs -Force
        Write-Host "  ✓ 恢复 AAR 文件 ($($aarFiles.Count) 个)" -ForegroundColor Green
    }
}

# 恢复 TypeScript 代码
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
        Write-Host "  ✓ 恢复: $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ 备份中未找到: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n恢复完成！" -ForegroundColor Green
Write-Host "请检查以下文件是否正确恢复:" -ForegroundColor Yellow
Write-Host "  1. MainApplication.kt 中是否包含 AliyunOnepassPackage()" -ForegroundColor Yellow
Write-Host "  2. android/app/build.gradle 中是否包含 AAR 依赖" -ForegroundColor Yellow
Write-Host "  3. android/build.gradle 中是否包含阿里云 Maven 仓库" -ForegroundColor Yellow

