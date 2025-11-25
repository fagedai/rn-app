# 阿里云一键登录文件备份和恢复指南

## 概述

当需要重新构建应用（例如更换 AppSecret）时，为了避免重新配置阿里云一键登录相关的文件，可以使用备份和恢复脚本。

## 需要备份的文件

### 1. Android 原生代码
- `android/app/src/main/java/com/anonymous/nest/AliyunOnepassModule.kt` - 核心模块实现
- `android/app/src/main/java/com/anonymous/nest/AliyunOnepassPackage.kt` - React Native 包定义
- `android/app/src/main/java/com/anonymous/nest/MainApplication.kt` - 应用入口（包含包注册）

### 2. Android 配置文件
- `android/build.gradle` - 包含阿里云 Maven 仓库配置
- `android/app/build.gradle` - 包含 AAR 依赖配置
- `android/app/proguard-rules.pro` - ProGuard 混淆规则

### 3. AAR 文件
- `android/app/libs/*.aar` - 阿里云一键登录 SDK 的 AAR 文件
  - `auth_number_product-2.14.14-log-online-standard-cuum-release.aar`
  - `logger-2.2.2-release.aar`
  - `main-2.2.3-release.aar`

### 4. TypeScript 代码
- `services/onepass/index.ts` - 一键登录服务封装

## 使用方法

### 备份文件

在重新构建前，运行备份脚本：

```powershell
# Windows PowerShell
.\scripts\backup-onepass.ps1
```

备份文件会保存在 `backup-onepass-YYYYMMDD-HHMMSS` 目录中。

### 恢复文件

重新构建后，运行恢复脚本：

```powershell
# Windows PowerShell
.\scripts\restore-onepass.ps1 -BackupDir "backup-onepass-20241125-143000"
```

## 手动备份和恢复

如果脚本无法使用，可以手动备份以下关键内容：

### 1. MainApplication.kt 关键代码

确保 `MainApplication.kt` 中包含：

```kotlin
override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
      add(AliyunOnepassPackage())  // 这一行很重要！
    }
```

### 2. android/build.gradle 关键配置

确保包含阿里云 Maven 仓库：

```gradle
allprojects {
  repositories {
    google()
    mavenCentral()
    maven { url 'https://www.jitpack.io' }
    // 阿里云 Maven 仓库
    maven { url 'https://maven.aliyun.com/repository/public' }
    maven { url 'https://maven.aliyun.com/repository/central' }
  }
}
```

### 3. android/app/build.gradle 关键配置

确保包含 AAR 依赖：

```gradle
// 配置本地 AAR 文件仓库
repositories {
    flatDir {
        dirs 'libs'
    }
}

dependencies {
    // ... 其他依赖
    
    // 阿里云一键登录 SDK（使用本地 AAR 文件）
    implementation(name: 'auth_number_product-2.14.14-log-online-standard-cuum-release', ext: 'aar')
    implementation(name: 'logger-2.2.2-release', ext: 'aar')
    implementation(name: 'main-2.2.3-release', ext: 'aar')
}
```

### 4. android/app/proguard-rules.pro 关键配置

确保包含 ProGuard 规则：

```proguard
# 阿里云一键登录 SDK - 保护原生模块（Release 构建必需）
-keep class com.anonymous.nest.AliyunOnepassModule { *; }
-keep class com.anonymous.nest.AliyunOnepassPackage { *; }
-keep class com.mobile.auth.gatewayauth.** { *; }
-keep class com.aliyun.ams.** { *; }
-dontwarn com.mobile.auth.gatewayauth.**
-dontwarn com.aliyun.ams.**
```

## 验证恢复

恢复后，请检查：

1. ✅ `MainApplication.kt` 中是否包含 `add(AliyunOnepassPackage())`
2. ✅ `android/app/build.gradle` 中是否包含 AAR 依赖
3. ✅ `android/build.gradle` 中是否包含阿里云 Maven 仓库
4. ✅ `android/app/libs/` 目录中是否有 3 个 AAR 文件
5. ✅ `android/app/proguard-rules.pro` 中是否包含 ProGuard 规则

## 注意事项

1. **AAR 文件很重要**：如果 AAR 文件丢失，需要重新从阿里云下载
2. **MainApplication.kt**：重新构建可能会覆盖这个文件，需要手动添加包注册
3. **build.gradle**：重新构建可能会重置这些文件，需要手动恢复配置
4. **ProGuard 规则**：Release 构建时必需，否则可能无法正常工作

## 常见问题

### Q: 恢复后仍然无法使用一键登录？

A: 检查以下几点：
1. 确认 `MainApplication.kt` 中已添加 `AliyunOnepassPackage()`
2. 确认 AAR 文件在 `android/app/libs/` 目录中
3. 确认 `build.gradle` 中的依赖配置正确
4. 清理并重新构建：`cd android && ./gradlew clean && ./gradlew assembleDebug`

### Q: 找不到备份目录？

A: 备份目录名称格式为 `backup-onepass-YYYYMMDD-HHMMSS`，可以在项目根目录查找。

### Q: 可以手动复制文件吗？

A: 可以，但请确保复制所有列出的文件，特别是 `MainApplication.kt` 中的包注册代码。

