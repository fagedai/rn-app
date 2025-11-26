# Supabase Storage 图片上传功能重构文档

本文档包含 Supabase Storage 图片上传功能的完整配置和重构步骤。

## 目录

1. [Supabase 项目配置](#1-supabase-项目配置)
2. [代码重构：迁移到新的 expo-file-system API](#2-代码重构迁移到新的-expo-file-system-api)
3. [Android 配置](#3-android-配置)
4. [Supabase Storage Bucket 配置](#4-supabase-storage-bucket-配置)
5. [测试验证](#5-测试验证)
6. [故障排查](#6-故障排查)

---

## 1. Supabase 项目配置

### 1.1 获取 Supabase 配置信息

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目（或创建新项目）
3. 进入 **Settings** → **API**
4. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** API Key: `eyJhbGci...`（完整的 JWT token）

### 1.2 配置代码中的 Supabase 信息

编辑 `services/imageUpload.ts`，填入你的 Supabase 配置：

```typescript
const SUPABASE_URL_CONFIG = 'https://你的项目ID.supabase.co';
const SUPABASE_ANON_KEY_CONFIG = '你的完整 Anon Key';
```

**当前配置（已填入）：**
- Project URL: `https://swaijtxqidosvxslaybl.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3YWlqdHhxaWRvc3Z4c2xheWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTE1NTUsImV4cCI6MjA3OTY4NzU1NX0.vtcAUqeHIEmyFirQxQw-9UtE-ZNWeWQ1rHlMRIXMjaw`

---

## 2. 代码重构：迁移到新的 expo-file-system API

### 2.1 当前状态

当前代码使用 `expo-file-system/legacy` API，这是临时方案。为了使用最新的 API 并避免弃用警告，需要迁移到新的 FileSystem API。

### 2.2 重构步骤

#### 步骤 1: 更新导入语句

**当前代码（使用 legacy API）：**
```typescript
import * as FileSystem from 'expo-file-system/legacy';
```

**重构后（使用新 API）：**
```typescript
import { File } from 'expo-file-system';
```

#### 步骤 2: 重构 `uploadImageToSupabase` 函数

**当前实现：**
```typescript
// 读取文件为 base64
const base64 = await FileSystem.readAsStringAsync(fileUri, {
  encoding: FileSystem.EncodingType.Base64,
});

// 转换为 Uint8Array
const binaryString = atob(base64);
const bytes = new Uint8Array(binaryString.length);
for (let i = 0; i < binaryString.length; i++) {
  bytes[i] = binaryString.charCodeAt(i);
}
```

**重构后实现：**
```typescript
// 使用新的 File API 读取文件
const file = new File(fileUri);
const bytes = await file.readAsBytesAsync();

// 或者使用 readAsStringAsync 然后转换（如果需要 base64）
// const base64 = await file.readAsStringAsync({ encoding: 'base64' });
// const binaryString = atob(base64);
// const bytes = new Uint8Array(binaryString.length);
// for (let i = 0; i < binaryString.length; i++) {
//   bytes[i] = binaryString.charCodeAt(i);
// }
```

#### 步骤 3: 重构 `getFileSizeInMB` 函数

**当前实现：**
```typescript
const fileInfo = await FileSystem.getInfoAsync(uri);
if (!fileInfo.exists) {
  throw new Error('文件不存在');
}
if (fileInfo.size !== undefined) {
  return fileInfo.size / (1024 * 1024);
}
```

**重构后实现：**
```typescript
// 使用新的 File API 获取文件信息
const file = new File(uri);
const info = await file.getInfoAsync();

if (!info.exists) {
  throw new Error('文件不存在');
}

if (info.size !== undefined) {
  return info.size / (1024 * 1024);
}

// 如果 size 不存在，读取文件计算大小
const bytes = await file.readAsBytesAsync();
return bytes.length / (1024 * 1024);
```

### 2.3 完整重构后的代码示例

```typescript
import { createClient } from '@supabase/supabase-js';
import { generateUUID } from '@/utils/uuid';
import { File } from 'expo-file-system';

// ... Supabase 配置 ...

export async function uploadImageToSupabase(
  fileUri: string,
  userId: string,
  fileName?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (!supabase) {
    console.warn('Supabase 未配置...');
    return fileUri;
  }

  try {
    // 生成文件路径
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const fileId = fileName || generateUUID();
    const filePath = `images/${userId}/${year}/${month}/${day}/${fileId}.jpg`;

    // 使用新的 File API 读取文件
    const file = new File(fileUri);
    const bytes = await file.readAsBytesAsync();

    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, bytes, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      throw new Error(`上传失败: ${error.message}`);
    }

    // 获取公共 URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('获取图片 URL 失败');
    }

    if (onProgress) {
      onProgress(100);
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error('上传图片失败:', error);
    throw error;
  }
}

export async function getFileSizeInMB(uri: string): Promise<number> {
  try {
    const file = new File(uri);
    const info = await file.getInfoAsync();

    if (!info.exists) {
      throw new Error('文件不存在');
    }

    if (info.size !== undefined) {
      return info.size / (1024 * 1024);
    }

    // 如果 size 不存在，读取文件计算
    const bytes = await file.readAsBytesAsync();
    return bytes.length / (1024 * 1024);
  } catch (error) {
    console.error('获取文件大小失败:', error);
    throw error;
  }
}
```

### 2.4 注意事项

- 新 API 使用 `File` 类，需要实例化 `new File(uri)`
- `readAsBytesAsync()` 直接返回 `Uint8Array`，无需 base64 转换
- `getInfoAsync()` 返回的文件信息格式与 legacy API 相同
- 如果新 API 有问题，可以暂时继续使用 `expo-file-system/legacy`

---

## 3. Android 配置

### 3.1 AndroidManifest.xml 配置

确保 `android/app/src/main/AndroidManifest.xml` 中包含以下配置：

#### 3.1.1 网络权限（已配置）

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

#### 3.1.2 允许 HTTP 连接（已配置）

在 `<application>` 标签中添加：

```xml
<application
  ...
  android:usesCleartextTraffic="true">
```

**说明：** 如果你的 Supabase 项目使用 HTTPS（推荐），可以移除 `usesCleartextTraffic`。当前配置允许 HTTP 连接，用于开发测试。

#### 3.1.3 存储权限（已配置）

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

**注意：** Android 10+ (API 29+) 使用分区存储，可能不需要 `WRITE_EXTERNAL_STORAGE` 权限。如果遇到权限问题，可以移除该权限。

### 3.2 网络安全性配置（可选）

如果需要更精细的网络安全控制，可以创建 `android/app/src/main/res/xml/network_security_config.xml`：

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- 允许所有 HTTP 连接（仅用于开发） -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    
    <!-- 生产环境应该只允许特定域名使用 HTTP -->
    <!--
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">your-api-domain.com</domain>
    </domain-config>
    -->
</network-security-config>
```

然后在 `AndroidManifest.xml` 的 `<application>` 标签中引用：

```xml
<application
  ...
  android:networkSecurityConfig="@xml/network_security_config">
```

### 3.3 Activity 配置

**Supabase Storage 不需要额外的 Activity 配置。**

与 Aliyun One-pass 不同，Supabase Storage 是纯 HTTP/HTTPS API 调用，不需要在 AndroidManifest.xml 中声明 Activity。

---

## 4. Supabase Storage Bucket 配置

### 4.1 创建 Storage Bucket

1. 登录 Supabase Dashboard
2. 进入 **Storage** 页面
3. 点击 **New bucket**
4. 配置如下：
   - **Name**: `images`（必须与代码中的 bucket 名称一致）
   - **Public bucket**: ✅ 勾选（允许公开访问图片 URL）
   - **File size limit**: 根据需求设置（例如 10MB）
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`（可选，限制文件类型）

### 4.2 配置 Bucket 策略（Row Level Security）

如果启用了 RLS（Row Level Security），需要配置策略允许上传和读取：

#### 4.2.1 允许公开读取（推荐用于图片）

在 Supabase Dashboard 的 **Storage** → **Policies** 中，为 `images` bucket 创建策略：

**策略 1: 允许公开读取**
```sql
-- 策略名称: Public Read Access
-- 操作: SELECT
-- 目标角色: anon, authenticated
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');
```

**策略 2: 允许认证用户上传**
```sql
-- 策略名称: Authenticated Upload
-- 操作: INSERT
-- 目标角色: authenticated
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');
```

**策略 3: 允许用户删除自己的文件（可选）**
```sql
-- 策略名称: User Delete Own Files
-- 操作: DELETE
-- 目标角色: authenticated
CREATE POLICY "User Delete Own Files"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**注意：** 当前代码使用 `anon` key，如果 bucket 启用了 RLS 且没有配置策略，上传会失败。建议：
- 方案 1: 将 bucket 设置为 **Public**（最简单）
- 方案 2: 配置 RLS 策略（更安全，但需要用户认证）

### 4.3 验证 Bucket 配置

在 Supabase Dashboard 的 **Storage** 页面，确认：
- ✅ Bucket `images` 已创建
- ✅ Bucket 是 Public 或已配置 RLS 策略
- ✅ 文件大小限制符合需求

---

## 5. 测试验证

### 5.1 测试图片上传

1. 运行应用：`npx expo run:android`
2. 进入聊天页面
3. 选择或拍摄一张图片
4. 观察日志输出：
   - 应该看到上传成功的日志
   - 不应该看到 "Supabase 未配置" 的警告
   - 不应该看到弃用警告

### 5.2 验证上传结果

1. 在 Supabase Dashboard 的 **Storage** → **images** bucket 中
2. 应该能看到上传的图片文件
3. 文件路径格式：`images/{userId}/{year}/{month}/{day}/{uuid}.jpg`
4. 点击文件，应该能看到公共 URL

### 5.3 验证图片显示

在聊天页面中，上传的图片应该能正常显示（使用 Supabase 返回的公共 URL）。

---

## 6. 故障排查

### 6.1 常见错误

#### 错误 1: "Supabase 未配置"
**原因：** `SUPABASE_URL_CONFIG` 或 `SUPABASE_ANON_KEY_CONFIG` 为空

**解决：** 检查 `services/imageUpload.ts` 中的配置是否正确填入

#### 错误 2: "上传失败: new row violates row-level security policy"
**原因：** Bucket 启用了 RLS，但没有配置允许上传的策略

**解决：** 
- 方案 1: 在 Supabase Dashboard 中将 bucket 设置为 Public
- 方案 2: 配置 RLS 策略（见 4.2 节）

#### 错误 3: "Property 'blob' doesn't exist"
**原因：** React Native 的 `fetch` 不支持 `blob()` 方法

**解决：** 确保使用 `expo-file-system` 读取文件，而不是 `fetch().blob()`

#### 错误 4: "Method getInfoAsync is deprecated"
**原因：** 使用了旧的 `expo-file-system` API

**解决：** 
- 临时方案：使用 `expo-file-system/legacy`
- 长期方案：迁移到新的 `File` API（见 2.2 节）

#### 错误 5: "网络连接失败"
**原因：** 
- Android 不允许 HTTP 连接
- 网络权限未配置

**解决：** 
- 检查 `AndroidManifest.xml` 中是否有 `android:usesCleartextTraffic="true"`
- 检查是否有 `INTERNET` 权限

### 6.2 调试技巧

1. **启用详细日志：**
   ```typescript
   console.log('Supabase URL:', SUPABASE_URL);
   console.log('File URI:', fileUri);
   console.log('Upload path:', filePath);
   ```

2. **检查 Supabase 客户端：**
   ```typescript
   if (!supabase) {
     console.error('Supabase 客户端未初始化');
   }
   ```

3. **验证文件读取：**
   ```typescript
   const file = new File(fileUri);
   const info = await file.getInfoAsync();
   console.log('File info:', info);
   ```

4. **检查上传响应：**
   ```typescript
   const { data, error } = await supabase.storage.from('images').upload(...);
   if (error) {
     console.error('Upload error:', error);
   } else {
     console.log('Upload success:', data);
   }
   ```

---

## 7. 重构时间表（建议）

### 阶段 1: 当前状态（已完成）
- ✅ 使用 `expo-file-system/legacy` API
- ✅ Supabase 配置已填入
- ✅ Android 网络配置已完成

### 阶段 2: 迁移到新 API（待完成）
- ⏳ 更新 `uploadImageToSupabase` 使用新的 `File` API
- ⏳ 更新 `getFileSizeInMB` 使用新的 `File` API
- ⏳ 测试验证功能正常

### 阶段 3: 优化（可选）
- ⏳ 实现真实的上传进度回调
- ⏳ 添加重试机制
- ⏳ 优化大文件上传（分块上传）

---

## 8. 参考资源

- [Expo FileSystem 文档](https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/)
- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/storage-from)
- [React Native 文件系统](https://reactnative.dev/docs/network#using-fetch)

---

## 更新日志

- **2025-01-XX**: 初始文档创建
- **2025-01-XX**: 添加 Supabase 配置说明
- **2025-01-XX**: 添加 Android 配置说明
- **2025-01-XX**: 添加重构步骤和代码示例

