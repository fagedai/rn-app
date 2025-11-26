# Build Configuration Verification Script
# Verify all required configurations after prebuild

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Configuration Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$errors = @()
$warnings = @()

# 1. Check HTTP Network Security Config
Write-Host "[1] Checking HTTP Network Security Config..." -ForegroundColor Yellow
$networkConfig = "android/app/src/main/res/xml/network_security_config.xml"
if (Test-Path $networkConfig) {
    Write-Host "  [OK] Network security config exists" -ForegroundColor Green
} else {
    $errors += "Network security config missing: $networkConfig"
    Write-Host "  [X] Network security config missing!" -ForegroundColor Red
}

# 2. Check AndroidManifest.xml
Write-Host "[2] Checking AndroidManifest.xml..." -ForegroundColor Yellow
$manifest = "android/app/src/main/AndroidManifest.xml"
if (Test-Path $manifest) {
    $manifestContent = Get-Content $manifest -Raw
    
    # Check usesCleartextTraffic
    if ($manifestContent -match 'android:usesCleartextTraffic="true"') {
        Write-Host "  [OK] usesCleartextTraffic is enabled" -ForegroundColor Green
    } else {
        $errors += "AndroidManifest.xml missing usesCleartextTraffic"
        Write-Host "  [X] usesCleartextTraffic not found!" -ForegroundColor Red
    }
    
    # Check networkSecurityConfig
    if ($manifestContent -match 'android:networkSecurityConfig="@xml/network_security_config"') {
        Write-Host "  [OK] networkSecurityConfig is configured" -ForegroundColor Green
    } else {
        $errors += "AndroidManifest.xml missing networkSecurityConfig"
        Write-Host "  [X] networkSecurityConfig not found!" -ForegroundColor Red
    }
    
    # Check LoginAuthActivity
    if ($manifestContent -match 'com.mobile.auth.gatewayauth.LoginAuthActivity') {
        Write-Host "  [OK] LoginAuthActivity is declared" -ForegroundColor Green
    } else {
        $warnings += "LoginAuthActivity not found (required for Aliyun One-Pass)"
        Write-Host "  [!] LoginAuthActivity not found" -ForegroundColor Yellow
    }
} else {
    $errors += "AndroidManifest.xml not found: $manifest"
    Write-Host "  [X] AndroidManifest.xml not found!" -ForegroundColor Red
}

# 3. Check styles.xml
Write-Host "[3] Checking styles.xml..." -ForegroundColor Yellow
$styles = "android/app/src/main/res/values/styles.xml"
if (Test-Path $styles) {
    $stylesContent = Get-Content $styles -Raw
    if ($stylesContent -match 'authsdk_activity_dialog') {
        Write-Host "  [OK] authsdk_activity_dialog style exists" -ForegroundColor Green
    } else {
        $warnings += "authsdk_activity_dialog style not found (required for Aliyun One-Pass)"
        Write-Host "  [!] authsdk_activity_dialog style not found" -ForegroundColor Yellow
    }
} else {
    $warnings += "styles.xml not found: $styles"
    Write-Host "  [!] styles.xml not found" -ForegroundColor Yellow
}

# 4. Check Aliyun One-Pass files
Write-Host "[4] Checking Aliyun One-Pass files..." -ForegroundColor Yellow
$onepassModule = "android/app/src/main/java/com/anonymous/nest/AliyunOnepassModule.kt"
$onepassPackage = "android/app/src/main/java/com/anonymous/nest/AliyunOnepassPackage.kt"
$mainApplication = "android/app/src/main/java/com/anonymous/nest/MainApplication.kt"

if (Test-Path $onepassModule) {
    Write-Host "  [OK] AliyunOnepassModule.kt exists" -ForegroundColor Green
} else {
    $warnings += "AliyunOnepassModule.kt not found (required for Aliyun One-Pass)"
    Write-Host "  [!] AliyunOnepassModule.kt not found" -ForegroundColor Yellow
}

if (Test-Path $onepassPackage) {
    Write-Host "  [OK] AliyunOnepassPackage.kt exists" -ForegroundColor Green
} else {
    $warnings += "AliyunOnepassPackage.kt not found (required for Aliyun One-Pass)"
    Write-Host "  [!] AliyunOnepassPackage.kt not found" -ForegroundColor Yellow
}

if (Test-Path $mainApplication) {
    $mainAppContent = Get-Content $mainApplication -Raw
    if ($mainAppContent -match 'AliyunOnepassPackage') {
        Write-Host "  [OK] MainApplication.kt contains AliyunOnepassPackage" -ForegroundColor Green
    } else {
        $errors += "MainApplication.kt missing AliyunOnepassPackage registration"
        Write-Host "  [X] MainApplication.kt missing package registration!" -ForegroundColor Red
    }
} else {
    $warnings += "MainApplication.kt not found (required for Aliyun One-Pass)"
    Write-Host "  [!] MainApplication.kt not found" -ForegroundColor Yellow
}

# 5. Check AAR files
Write-Host "[5] Checking AAR files..." -ForegroundColor Yellow
$libsDir = "android/app/libs"
if (Test-Path $libsDir) {
    $aarFiles = Get-ChildItem -Path $libsDir -Filter "*.aar"
    if ($aarFiles.Count -gt 0) {
        Write-Host "  [OK] Found $($aarFiles.Count) AAR file(s)" -ForegroundColor Green
        foreach ($aar in $aarFiles) {
            Write-Host "      - $($aar.Name)" -ForegroundColor Gray
        }
    } else {
        $warnings += "No AAR files found in libs directory (required for Aliyun One-Pass)"
        Write-Host "  [!] No AAR files found" -ForegroundColor Yellow
    }
} else {
    $warnings += "libs directory not found (required for Aliyun One-Pass)"
    Write-Host "  [!] libs directory not found" -ForegroundColor Yellow
}

# 6. Check build.gradle files
Write-Host "[6] Checking build.gradle files..." -ForegroundColor Yellow
$appBuildGradle = "android/app/build.gradle"
$rootBuildGradle = "android/build.gradle"

if (Test-Path $appBuildGradle) {
    $appBuildContent = Get-Content $appBuildGradle -Raw
    if ($appBuildContent -match 'flatDir') {
        Write-Host "  [OK] app/build.gradle contains flatDir repository" -ForegroundColor Green
    } else {
        $warnings += "app/build.gradle missing flatDir repository (required for AAR files)"
        Write-Host "  [!] flatDir repository not found" -ForegroundColor Yellow
    }
    
    if ($appBuildContent -match 'auth_number_product') {
        Write-Host "  [OK] app/build.gradle contains AAR dependencies" -ForegroundColor Green
    } else {
        $warnings += "app/build.gradle missing AAR dependencies (required for Aliyun One-Pass)"
        Write-Host "  [!] AAR dependencies not found" -ForegroundColor Yellow
    }
} else {
    $warnings += "app/build.gradle not found"
    Write-Host "  [!] app/build.gradle not found" -ForegroundColor Yellow
}

if (Test-Path $rootBuildGradle) {
    $rootBuildContent = Get-Content $rootBuildGradle -Raw
    if ($rootBuildContent -match 'maven.aliyun.com') {
        Write-Host "  [OK] build.gradle contains Aliyun Maven repository" -ForegroundColor Green
    } else {
        $warnings += "build.gradle missing Aliyun Maven repository (required for Aliyun One-Pass)"
        Write-Host "  [!] Aliyun Maven repository not found" -ForegroundColor Yellow
    }
} else {
    $warnings += "build.gradle not found"
    Write-Host "  [!] build.gradle not found" -ForegroundColor Yellow
}

# 7. Check app.json
Write-Host "[7] Checking app.json..." -ForegroundColor Yellow
$appJson = "app.json"
if (Test-Path $appJson) {
    try {
        $appJsonContent = Get-Content $appJson -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($appJsonContent.expo.extra.api.baseUrl) {
            Write-Host "  [OK] app.json contains API baseUrl" -ForegroundColor Green
            Write-Host "      Base URL: $($appJsonContent.expo.extra.api.baseUrl)" -ForegroundColor Gray
        } else {
            # Try alternative method: check raw content
            $rawContent = Get-Content $appJson -Raw -Encoding UTF8
            if ($rawContent -match '"baseUrl"\s*:\s*"([^"]+)"') {
                Write-Host "  [OK] app.json contains API baseUrl" -ForegroundColor Green
                Write-Host "      Base URL: $($matches[1])" -ForegroundColor Gray
            } else {
                $warnings += "app.json missing API baseUrl (required for production builds)"
                Write-Host "  [!] API baseUrl not found" -ForegroundColor Yellow
            }
        }
    } catch {
        # Fallback: check raw content for baseUrl
        $rawContent = Get-Content $appJson -Raw -Encoding UTF8
        if ($rawContent -match '"baseUrl"\s*:\s*"([^"]+)"') {
            Write-Host "  [OK] app.json contains API baseUrl" -ForegroundColor Green
            Write-Host "      Base URL: $($matches[1])" -ForegroundColor Gray
        } else {
            $warnings += "app.json missing API baseUrl (required for production builds)"
            Write-Host "  [!] API baseUrl not found" -ForegroundColor Yellow
        }
    }
} else {
    $warnings += "app.json not found"
    Write-Host "  [!] app.json not found" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "`n[SUCCESS] All checks passed!" -ForegroundColor Green
    exit 0
} else {
    if ($errors.Count -gt 0) {
        Write-Host "`n[ERRORS] Found $($errors.Count) error(s):" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "  - $error" -ForegroundColor Red
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "`n[WARNINGS] Found $($warnings.Count) warning(s):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nPlease fix the errors before building!" -ForegroundColor Red
    Write-Host "Refer to docs/BUILD_POST_PROCESS.md for details." -ForegroundColor Yellow
    exit 1
}

