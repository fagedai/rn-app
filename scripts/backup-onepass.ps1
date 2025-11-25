# 阿里云一键登录文件备份脚本
# 用于在重新构建前备份所有相关文件

$backupDir = "backup-onepass-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "开始备份阿里云一键登录相关文件..." -ForegroundColor Green

# 备份 Android 原生代码
$androidSrc = "android/app/src/main/java/com/anonymous/nest"
$files = @(
    "AliyunOnepassModule.kt",
    "AliyunOnepassPackage.kt",
    "MainApplication.kt"
)

foreach ($file in $files) {
    $source = Join-Path $androidSrc $file
    if (Test-Path $source) {
        $dest = Join-Path $backupDir "android/src/$file"
        $destDir = Split-Path $dest -Parent
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Copy-Item $source $dest -Force
        Write-Host "  ✓ 备份: $file" -ForegroundColor Cyan
    } else {
        Write-Host "  ✗ 未找到: $file" -ForegroundColor Yellow
    }
}

# 备份 Android 配置文件
$configFiles = @(
    "android/build.gradle",
    "android/app/build.gradle",
    "android/app/proguard-rules.pro"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        $dest = Join-Path $backupDir $file
        $destDir = Split-Path $dest -Parent
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Copy-Item $file $dest -Force
        Write-Host "  ✓ 备份: $file" -ForegroundColor Cyan
    } else {
        Write-Host "  ✗ 未找到: $file" -ForegroundColor Yellow
    }
}

# 备份 AAR 文件
$libsDir = "android/app/libs"
if (Test-Path $libsDir) {
    $aarFiles = Get-ChildItem -Path $libsDir -Filter "*.aar"
    if ($aarFiles.Count -gt 0) {
        $destLibs = Join-Path $backupDir "android/app/libs"
        New-Item -ItemType Directory -Path $destLibs -Force | Out-Null
        Copy-Item "$libsDir/*.aar" $destLibs -Force
        Write-Host "  ✓ 备份 AAR 文件 ($($aarFiles.Count) 个)" -ForegroundColor Cyan
    }
}

# 备份 TypeScript 代码
$tsFiles = @(
    "services/onepass/index.ts"
)

foreach ($file in $tsFiles) {
    if (Test-Path $file) {
        $dest = Join-Path $backupDir $file
        $destDir = Split-Path $dest -Parent
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Copy-Item $file $dest -Force
        Write-Host "  ✓ 备份: $file" -ForegroundColor Cyan
    } else {
        Write-Host "  ✗ 未找到: $file" -ForegroundColor Yellow
    }
}

# 创建备份信息文件
$info = @"
备份时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
备份目录: $backupDir

备份的文件列表:
1. Android 原生代码:
   - AliyunOnepassModule.kt
   - AliyunOnepassPackage.kt
   - MainApplication.kt

2. Android 配置文件:
   - android/build.gradle (阿里云 Maven 仓库配置)
   - android/app/build.gradle (AAR 依赖配置)
   - android/app/proguard-rules.pro (ProGuard 规则)

3. AAR 文件:
   - android/app/libs/*.aar

4. TypeScript 代码:
   - services/onepass/index.ts

恢复方法:
运行 scripts/restore-onepass.ps1 -BackupDir "$backupDir"
"@

$info | Out-File -FilePath (Join-Path $backupDir "BACKUP_INFO.txt") -Encoding UTF8

Write-Host "`n备份完成！备份目录: $backupDir" -ForegroundColor Green
Write-Host "备份信息已保存到: $backupDir/BACKUP_INFO.txt" -ForegroundColor Green

