# 构建后操作指南

## 概述

在运行 `npx expo prebuild --clean` 后，需要手动配置一些关键设置，以确保应用功能正常。本文档详细说明所有必需的操作步骤。

## ⚠️ 重要提示

**操作顺序**：
1. 先备份（如果需要）
2. 执行 `npx expo prebuild --clean`
3. **立即执行以下所有配置步骤**
4. 最后构建应用

---

## 一、HTTP 网络访问配置

### 1.1 创建网络安全配置文件

**文件路径**：`android/app/src/main/res/xml/network_security_config.xml`

如果文件不存在，创建它：

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- 允许所有HTTP连接（用于开发和生产环境） -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    
    <!-- 明确允许特定域名的HTTP连接 -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">8.166.129.71</domain>
    </domain-config>
</network-security-config>
```

### 1.2 在 AndroidManifest.xml 中引用

**文件路径**：`android/app/src/main/AndroidManifest.xml`

确保 `<application>` 标签包含以下属性：

```xml
<application
    ...
    android:usesCleartextTraffic="true"
    android:networkSecurityConfig="@xml/network_security_config">
```

**检查清单**：
- ✅ `android:usesCleartextTraffic="true"` 已添加
- ✅ `android:networkSecurityConfig="@xml/network_security_config"` 已添加
- ✅ `android/app/src/main/res/xml/network_security_config.xml` 文件存在

---

## 二、阿里云一键登录授权页配置

### 2.1 配置授权页 Activity

**文件路径**：`android/app/src/main/AndroidManifest.xml`

在 `<application>` 标签内添加：

```xml
<!-- 阿里云一键登录授权页 Activity -->
<activity
    android:name="com.mobile.auth.gatewayauth.LoginAuthActivity"
    android:configChanges="orientation|keyboardHidden|screenSize"
    android:exported="false"
    android:launchMode="singleTop"
    android:screenOrientation="behind"
    android:theme="@style/authsdk_activity_dialog" />
```

**注意**：
- ❌ **不要**添加 `intent-filter`（会导致 Expo 开发客户端冲突）
- ✅ `android:exported="false"` 必须设置
- ✅ `android:theme="@style/authsdk_activity_dialog"` 必须引用样式

### 2.2 配置授权页样式

**文件路径**：`android/app/src/main/res/values/styles.xml`

确保包含以下样式：

```xml
<!-- 阿里云一键登录授权页样式 -->
<style name="authsdk_activity_dialog" parent="android:style/Theme.Translucent.NoTitleBar">
    <item name="android:windowBackground">@android:color/transparent</item>
    <item name="android:windowIsTranslucent">true</item>
    <item name="android:windowAnimationStyle">@android:style/Animation.Dialog</item>
</style>
```

**检查清单**：
- ✅ `LoginAuthActivity` 已在 AndroidManifest.xml 中声明
- ✅ `authsdk_activity_dialog` 样式已在 styles.xml 中定义
- ✅ Activity 没有 `intent-filter`

---

## 三、恢复阿里云一键登录相关文件

### 3.1 使用恢复脚本（推荐）

**前提**：在 prebuild 之前已经运行过备份脚本

```powershell
# Windows PowerShell
.\scripts\restore-onepass.ps1 -BackupDir "backup-onepass-YYYYMMDD-HHMMSS"
```

### 3.2 手动恢复（如果脚本不可用）

#### 3.2.1 恢复 Android 原生代码

需要恢复以下文件到 `android/app/src/main/java/com/anonymous/nest/`：

- `AliyunOnepassModule.kt` - 核心模块实现
- `AliyunOnepassPackage.kt` - React Native 包定义
- `MainApplication.kt` - 应用入口（**必须包含包注册**）

**MainApplication.kt 关键代码**：

```kotlin
override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
      add(AliyunOnepassPackage())  // ⚠️ 这一行很重要！
    }
```

#### 3.2.2 恢复 Android 配置文件

**android/build.gradle** - 添加阿里云 Maven 仓库：

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

**android/app/build.gradle** - 添加 AAR 依赖：

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

**android/app/proguard-rules.pro** - 添加 ProGuard 规则：

```proguard
# 阿里云一键登录 SDK - 保护原生模块（Release 构建必需）
-keep class com.anonymous.nest.AliyunOnepassModule { *; }
-keep class com.anonymous.nest.AliyunOnepassPackage { *; }
-keep class com.mobile.auth.gatewayauth.** { *; }
-keep class com.aliyun.ams.** { *; }
-dontwarn com.mobile.auth.gatewayauth.**
-dontwarn com.aliyun.ams.**
```

#### 3.2.3 恢复 AAR 文件

将以下 AAR 文件复制到 `android/app/libs/` 目录：

- `auth_number_product-2.14.14-log-online-standard-cuum-release.aar`
- `logger-2.2.2-release.aar`
- `main-2.2.3-release.aar`

**检查清单**：
- ✅ `MainApplication.kt` 包含 `add(AliyunOnepassPackage())`
- ✅ `android/app/build.gradle` 包含 AAR 依赖
- ✅ `android/build.gradle` 包含阿里云 Maven 仓库
- ✅ `android/app/libs/` 目录中有 3 个 AAR 文件
- ✅ `android/app/proguard-rules.pro` 包含 ProGuard 规则

---

## 四、API 地址配置

### 4.1 检查 app.json 配置

**文件路径**：`app.json`

确保 `extra` 中包含 API 配置：

```json
{
  "expo": {
    "extra": {
      "onepass": {
        "appSecret": "..."
      },
      "api": {
        "baseUrl": "http://8.166.129.71:18081/api"
      }
    }
  }
}
```

### 4.2 验证 API 地址获取逻辑

**文件路径**：`utils/apiUtils.ts`

`getApiBaseUrl()` 函数应该按以下优先级获取 API 地址：
1. 环境变量 `EXPO_PUBLIC_API_BASE_URL`（开发环境）
2. `app.json` 中的 `extra.api.baseUrl`（生产环境）
3. 硬编码的默认值（兜底）

**检查清单**：
- ✅ `app.json` 中包含 `extra.api.baseUrl`
- ✅ `utils/apiUtils.ts` 中的 `getApiBaseUrl()` 逻辑正确

---

## 五、完整操作流程

### 步骤 1: 备份（可选，但强烈推荐）

```powershell
# Windows PowerShell
.\scripts\backup-onepass.ps1
```

### 步骤 2: 执行 prebuild

```bash
npx expo prebuild --clean
```

⚠️ **警告**：这会删除整个 `android` 文件夹！

### 步骤 3: 立即执行所有配置

#### 3.1 创建网络安全配置文件

```bash
# 确保目录存在
mkdir -p android/app/src/main/res/xml

# 创建文件（内容见上文）
# 或从备份中恢复
```

#### 3.2 配置 AndroidManifest.xml

- 添加 `android:usesCleartextTraffic="true"`
- 添加 `android:networkSecurityConfig="@xml/network_security_config"`
- 添加 `LoginAuthActivity` 声明

#### 3.3 配置 styles.xml

- 添加 `authsdk_activity_dialog` 样式

#### 3.4 恢复阿里云一键登录文件

```powershell
# 使用脚本恢复
.\scripts\restore-onepass.ps1 -BackupDir "backup-onepass-YYYYMMDD-HHMMSS"

# 或手动恢复（见上文）
```

#### 3.5 验证配置

运行验证脚本或手动检查：

```bash
# 检查关键文件
ls android/app/src/main/res/xml/network_security_config.xml
ls android/app/src/main/java/com/anonymous/nest/AliyunOnepassModule.kt
ls android/app/libs/*.aar
```

### 步骤 4: 构建应用

```bash
# Android Debug
npx expo run:android

# Android Release
npx expo run:android --variant release

# 或使用 EAS Build
eas build --platform android --profile production
```

---

## 六、验证清单

构建前，请确认以下所有项目：

### HTTP 网络访问
- [ ] `android/app/src/main/res/xml/network_security_config.xml` 存在
- [ ] `AndroidManifest.xml` 包含 `android:usesCleartextTraffic="true"`
- [ ] `AndroidManifest.xml` 包含 `android:networkSecurityConfig="@xml/network_security_config"`

### 阿里云一键登录
- [ ] `AndroidManifest.xml` 包含 `LoginAuthActivity` 声明
- [ ] `styles.xml` 包含 `authsdk_activity_dialog` 样式
- [ ] `MainApplication.kt` 包含 `add(AliyunOnepassPackage())`
- [ ] `android/app/build.gradle` 包含 AAR 依赖
- [ ] `android/build.gradle` 包含阿里云 Maven 仓库
- [ ] `android/app/libs/` 目录中有 3 个 AAR 文件
- [ ] `android/app/proguard-rules.pro` 包含 ProGuard 规则

### API 配置
- [ ] `app.json` 包含 `extra.api.baseUrl`
- [ ] `utils/apiUtils.ts` 中的 `getApiBaseUrl()` 逻辑正确

---

## 七、常见问题

### Q: prebuild 后找不到某些文件？

A: 这是正常的，`prebuild --clean` 会删除整个 `android` 文件夹。需要：
1. 从备份中恢复
2. 或手动重新创建（参考本文档）

### Q: 构建后无法访问 HTTP 接口？

A: 检查：
1. `network_security_config.xml` 是否存在
2. `AndroidManifest.xml` 是否正确引用
3. 文件路径是否正确（`res/xml/` 不是 `res/values/`）

### Q: 一键登录授权页无法打开？

A: 检查：
1. `LoginAuthActivity` 是否在 `AndroidManifest.xml` 中声明
2. `authsdk_activity_dialog` 样式是否存在
3. `MainApplication.kt` 是否包含包注册
4. AAR 文件是否在 `libs/` 目录中

### Q: 生产环境 API 请求失败？

A: 检查：
1. `app.json` 中是否配置了 `extra.api.baseUrl`
2. `utils/apiUtils.ts` 是否正确读取配置
3. 网络权限是否已配置

---

## 八、快速参考

### 必需文件列表

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── AndroidManifest.xml          # 包含 HTTP 和 Activity 配置
│   │   │   ├── java/com/anonymous/nest/
│   │   │   │   ├── AliyunOnepassModule.kt   # 需要恢复
│   │   │   │   ├── AliyunOnepassPackage.kt  # 需要恢复
│   │   │   │   └── MainApplication.kt       # 需要恢复（包含包注册）
│   │   │   └── res/
│   │   │       ├── xml/
│   │   │       │   └── network_security_config.xml  # 需要创建
│   │   │       └── values/
│   │   │           └── styles.xml          # 需要添加样式
│   │   ├── libs/
│   │   │   ├── *.aar                        # 需要恢复（3个文件）
│   │   └── proguard-rules.pro               # 需要恢复
│   └── build.gradle                         # 需要恢复（AAR 依赖）
├── build.gradle                             # 需要恢复（Maven 仓库）
app.json                                     # 需要配置 API baseUrl
```

---

## 九、自动化脚本（可选）

可以创建一个自动化脚本，在 prebuild 后自动执行所有配置。但这需要根据你的具体环境定制。

---

## 十、联系支持

如果遇到问题：
1. 检查本文档的验证清单
2. 查看相关日志文件
3. 参考 `docs/ONEPASS_BACKUP.md` 了解备份恢复详情

