# Android 签名配置说明

## 📋 当前签名状态

### ✅ Debug 构建
- **签名文件**: `android/app/debug.keystore`
- **密码**: `android` (默认)
- **别名**: `androiddebugkey`
- **用途**: 开发和测试

### ⚠️ Release 构建（当前配置）
- **签名文件**: 也使用 `debug.keystore`（不安全）
- **状态**: ⚠️ **仅用于测试，不适合发布到生产环境**

## 🔐 配置生产环境签名

### 方法一：使用 EAS Build（推荐）

如果您使用 Expo Application Services (EAS)，签名会自动管理：

1. **安装 EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **登录 EAS**:
   ```bash
   eas login
   ```

3. **配置项目**:
   ```bash
   eas build:configure
   ```

4. **构建签名 APK/AAB**:
   ```bash
   eas build -p android
   ```

EAS 会自动生成和管理签名密钥。

### 方法二：手动配置生产签名

#### 步骤 1: 生成生产环境密钥库

```bash
# 在项目根目录运行
keytool -genkeypair -v -storetype PKCS12 -keystore android/app/my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**重要信息需要填写**:
- **密钥库密码**: 请记住这个密码（建议使用强密码）
- **密钥别名**: 例如 `nest-release-key`
- **密钥密码**: 可以与密钥库密码相同
- **姓名/组织**: 您的信息
- **有效期**: 建议至少 25 年（10000 天）

#### 步骤 2: 创建签名配置文件

创建 `android/keystore.properties` 文件（**不要提交到 Git**）:

```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=nest-release-key
MYAPP_RELEASE_STORE_PASSWORD=你的密钥库密码
MYAPP_RELEASE_KEY_PASSWORD=你的密钥密码
```

#### 步骤 3: 更新 build.gradle

修改 `android/app/build.gradle`:

```gradle
// 在 android { 块之前添加
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... 其他配置 ...
    
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['MYAPP_RELEASE_STORE_FILE'])
                storePassword keystoreProperties['MYAPP_RELEASE_STORE_PASSWORD']
                keyAlias keystoreProperties['MYAPP_RELEASE_KEY_ALIAS']
                keyPassword keystoreProperties['MYAPP_RELEASE_KEY_PASSWORD']
            }
        }
    }
    
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // 使用生产签名
            signingConfig signingConfigs.release
            // ... 其他配置 ...
        }
    }
}
```

#### 步骤 4: 更新 .gitignore

确保以下文件不会被提交:

```
# Android 签名文件
*.keystore
!debug.keystore
keystore.properties
*.jks
```

## 📦 构建签名 APK/AAB

### 构建 Release APK

```bash
cd android
./gradlew assembleRelease
```

APK 文件位置: `android/app/build/outputs/apk/release/app-release.apk`

### 构建 Release AAB (用于 Google Play)

```bash
cd android
./gradlew bundleRelease
```

AAB 文件位置: `android/app/build/outputs/bundle/release/app-release.aab`

## 🔄 更新图标后的操作

**更新图标不会影响签名**，但需要重新构建应用：

```bash
# 清除构建缓存
cd android
./gradlew clean

# 重新构建
./gradlew assembleRelease
```

## ⚠️ 重要提示

1. **备份密钥库**: 
   - 生产环境的 `.keystore` 文件**非常重要**
   - 如果丢失，将无法更新已发布的应用
   - 建议备份到安全的地方（加密存储）

2. **不要提交到 Git**:
   - `.keystore` 文件包含敏感信息
   - 已在 `.gitignore` 中排除

3. **密码安全**:
   - 使用强密码
   - 不要将密码提交到代码仓库
   - 使用环境变量或安全的密码管理工具

4. **签名一致性**:
   - 同一个应用的所有更新必须使用**相同的签名**
   - 如果更换签名，Google Play 会将其视为新应用

## 📝 当前配置总结

- ✅ Debug 签名: 已配置（`debug.keystore`）
- ⚠️ Release 签名: 当前使用 debug 签名（需要配置生产签名）
- ✅ 图标更新: 不影响签名，只需重新构建

## 🆘 需要帮助？

如果您需要我帮您配置生产环境签名，请告诉我：
1. 您是否已有生产环境的密钥库文件？
2. 您是否使用 EAS Build？
3. 您是否需要我帮您生成新的密钥库？

