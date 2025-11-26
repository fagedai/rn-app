# Supabase 完整配置指南（从零开始）

本文档提供从零开始配置 Supabase 的完整步骤，包括数据库（埋点数据）和 Storage（图片上传）的配置。即使更换公司账号，按照此文档也能成功配置。

## 📋 目录

1. [创建 Supabase 项目](#1-创建-supabase-项目)
2. [获取配置信息](#2-获取配置信息)
3. [配置数据库表（埋点数据）](#3-配置数据库表埋点数据)
4. [配置 Storage Bucket（图片上传）](#4-配置-storage-bucket图片上传)
5. [配置前端代码](#5-配置前端代码)
6. [测试验证](#6-测试验证)
7. [常见问题排查](#7-常见问题排查)

---

## 1. 创建 Supabase 项目

### 1.1 注册/登录 Supabase

1. 访问 [Supabase Dashboard](https://app.supabase.com/)
2. 使用 GitHub、Google 或其他方式登录/注册账号

### 1.2 创建新项目

1. 点击 **New Project** 或 **Add Project**
2. 填写项目信息：
   - **Name**: 项目名称（如：`nest-ai-app`）
   - **Database Password**: 设置数据库密码（**重要：请保存好密码**）
   - **Region**: 选择离你最近的区域（如：`Southeast Asia (Singapore)`）
3. 点击 **Create new project**
4. 等待项目创建完成（通常需要 1-2 分钟）

---

## 2. 获取配置信息

### 2.1 获取 Project URL 和 API Keys

1. 在项目 Dashboard 中，点击左侧菜单 **Settings**（⚙️ 图标）
2. 选择 **API**
3. 复制以下信息：

   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **重要说明：**
   - **Project URL**: 用于连接 Supabase 服务
   - **anon public key**: 前端使用的公开密钥（可以暴露在客户端代码中）
   - **service_role key**: **不要**在前端使用，仅用于后端服务

### 2.2 记录配置信息

将以下信息保存到安全的地方：

```
Project URL: https://你的项目ID.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. 配置数据库表（埋点数据）

### 3.1 创建埋点事件表

1. 在 Supabase Dashboard 中，点击左侧菜单 **SQL Editor**
2. 点击 **New query**
3. 复制并执行以下 SQL：

```sql
-- 创建埋点事件表
CREATE TABLE IF NOT EXISTS tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT,
  event_name TEXT NOT NULL,
  event_time BIGINT NOT NULL,
  user_id TEXT,
  device_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  app_version TEXT NOT NULL,
  os_version TEXT,
  network_type TEXT,
  page_id TEXT,
  trace_id TEXT,
  session_id TEXT,
  
  -- 业务字段（使用 JSONB 存储，灵活扩展）
  properties JSONB DEFAULT '{}'::jsonb,
  
  -- 元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_name ON tracking_events(event_name);
CREATE INDEX IF NOT EXISTS idx_tracking_events_user_id ON tracking_events(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_device_id ON tracking_events(device_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_session_id ON tracking_events(session_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_time ON tracking_events(event_time);
CREATE INDEX IF NOT EXISTS idx_tracking_events_created_at ON tracking_events(created_at);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tracking_events_updated_at 
  BEFORE UPDATE ON tracking_events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

4. 点击 **Run** 执行 SQL
5. 确认执行成功（应该显示 "Success. No rows returned"）

### 3.2 配置 Row Level Security (RLS) 策略

**重要：** Supabase 默认启用 RLS，必须配置策略才能允许前端插入数据。

1. 在 **SQL Editor** 中，点击 **New query**
2. 复制并执行以下 SQL：

```sql
-- 启用 RLS（如果未启用）
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略（如果之前创建过）
DROP POLICY IF EXISTS "Allow anonymous insert" ON tracking_events;
DROP POLICY IF EXISTS "Allow authenticated insert" ON tracking_events;

-- 策略1：允许匿名用户（anon）插入数据（用于未登录用户埋点）
CREATE POLICY "Allow anonymous insert" ON tracking_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 策略2：允许已认证用户（authenticated）插入数据
CREATE POLICY "Allow authenticated insert" ON tracking_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

3. 点击 **Run** 执行 SQL
4. 确认执行成功

**验证 RLS 策略：**

1. 在左侧菜单点击 **Authentication** → **Policies**
2. 选择表 `tracking_events`
3. 确认看到两个策略：
   - `Allow anonymous insert` (INSERT, anon)
   - `Allow authenticated insert` (INSERT, authenticated)

---

## 4. 配置 Storage Bucket（图片上传）

### 4.1 创建 Storage Bucket

1. 在 Supabase Dashboard 中，点击左侧菜单 **Storage**
2. 点击 **Create a new bucket**
3. 填写信息：
   - **Name**: `images`（必须使用此名称，代码中已硬编码）
   - **Public bucket**: ✅ **勾选**（允许公开访问图片）
4. 点击 **Create bucket**

### 4.2 配置 Storage RLS 策略

1. 在 **Storage** 页面，点击刚创建的 `images` bucket
2. 点击 **Policies** 标签页
3. 点击 **New Policy** → **Create a policy from scratch**

#### 策略 1：允许匿名用户上传（Public Upload）

1. 填写策略信息：
   - **Policy name**: `Public Upload`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `anon` 和 `authenticated`（两个都勾选）
   - **Policy definition**: 使用以下 SQL：

```sql
bucket_id = 'images'
```

2. 点击 **Review** → **Save policy**

#### 策略 2：允许公开读取（Public Read）

1. 再次点击 **New Policy** → **Create a policy from scratch**
2. 填写策略信息：
   - **Policy name**: `Public Read`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `anon` 和 `authenticated`（两个都勾选）
   - **Policy definition**: 使用以下 SQL：

```sql
bucket_id = 'images'
```

3. 点击 **Review** → **Save policy**

**验证 Storage 策略：**

在 `images` bucket 的 **Policies** 标签页中，应该看到：
- `Public Upload` (INSERT, anon, authenticated)
- `Public Read` (SELECT, anon, authenticated)

---

## 5. 配置前端代码

### 5.1 更新 Supabase 配置

编辑 `services/supabase.ts`，将你的 Supabase 配置填入：

```typescript
// 方式1: 直接在代码中配置（推荐，因为 Supabase URL 和 Anon Key 是公开的）
const SUPABASE_URL_CONFIG = 'https://你的项目ID.supabase.co'; // 替换为你的 Project URL
const SUPABASE_ANON_KEY_CONFIG = '你的完整 Anon Key'; // 替换为你的 anon public key
```

**示例：**

```typescript
const SUPABASE_URL_CONFIG = 'https://swaijtxqidosvxslaybl.supabase.co';
const SUPABASE_ANON_KEY_CONFIG = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3YWlqdHhxaWRvc3Z4c2xheWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTE1NTUsImV4cCI6MjA3OTY4NzU1NX0.vtcAUqeHIEmyFirQxQw-9UtE-ZNWeWQ1rHlMRIXMjaw';
```

### 5.2 验证配置

检查以下文件确保配置正确：

1. **`services/supabase.ts`**
   - ✅ `SUPABASE_URL_CONFIG` 已填入 Project URL
   - ✅ `SUPABASE_ANON_KEY_CONFIG` 已填入 Anon Key

2. **`services/imageUpload.ts`**
   - ✅ 使用统一的 `supabase` 客户端（从 `services/supabase.ts` 导入）
   - ✅ Bucket 名称是 `images`

3. **`services/tracking/index.ts`**
   - ✅ 使用统一的 `supabase` 客户端（从 `services/supabase.ts` 导入）
   - ✅ 表名是 `tracking_events`

---

## 6. 测试验证

### 6.1 测试埋点数据插入

1. **启动应用**
   ```bash
   npm start
   ```

2. **触发埋点事件**
   - 打开登录页（会触发 `app_launch` 和 `page_view_login`）
   - 查看控制台，应该看到 `[Tracking] 插入成功: {id}`

3. **在 Supabase Dashboard 中验证**
   - 进入 **Table Editor** → 选择表 `tracking_events`
   - 应该能看到新插入的数据
   - 或者使用 **SQL Editor** 执行：
     ```sql
     SELECT * FROM tracking_events ORDER BY created_at DESC LIMIT 10;
     ```

### 6.2 测试图片上传

1. **在应用中上传图片**
   - 进入聊天页面
   - 选择并发送一张图片

2. **验证上传成功**
   - 查看控制台，应该看到上传成功的日志
   - 图片应该能正常显示在聊天中

3. **在 Supabase Dashboard 中验证**
   - 进入 **Storage** → `images` bucket
   - 应该能看到上传的图片文件（路径格式：`{userId}/{year}/{month}/{day}/{uuid}.jpg`）
   - 点击图片，应该能看到预览和公共 URL

---

## 7. 常见问题排查

### 7.1 埋点数据插入失败（RLS 策略错误）

**错误信息：**
```
new row violates row-level security policy for table "tracking_events"
```

**解决方案：**

1. **检查 RLS 策略是否存在**
   - 进入 **Authentication** → **Policies** → `tracking_events`
   - 确认有两个 INSERT 策略（anon 和 authenticated）

2. **重新创建策略**
   - 在 **SQL Editor** 中执行：
     ```sql
     -- 删除旧策略
     DROP POLICY IF EXISTS "Allow anonymous insert" ON tracking_events;
     DROP POLICY IF EXISTS "Allow authenticated insert" ON tracking_events;
     
     -- 重新创建策略
     CREATE POLICY "Allow anonymous insert" ON tracking_events
       FOR INSERT
       TO anon
       WITH CHECK (true);
     
     CREATE POLICY "Allow authenticated insert" ON tracking_events
       FOR INSERT
       TO authenticated
       WITH CHECK (true);
     ```

3. **检查 Supabase 客户端配置**
   - 确认使用的是 `anon` key，不是 `service_role` key
   - 检查 `services/supabase.ts` 中的配置

### 7.2 图片上传失败（RLS 策略错误）

**错误信息：**
```
new row violates row-level security policy
```

**解决方案：**

1. **检查 Storage Bucket 是否存在**
   - 进入 **Storage**，确认有 `images` bucket

2. **检查 Storage RLS 策略**
   - 进入 `images` bucket → **Policies**
   - 确认有两个策略：
     - `Public Upload` (INSERT, anon, authenticated)
     - `Public Read` (SELECT, anon, authenticated)

3. **重新创建策略**
   - 删除旧策略，重新创建（参考 [4.2 配置 Storage RLS 策略](#42-配置-storage-rls-策略)）

### 7.3 图片上传超时

**错误信息：**
```
上传超时，请检查网络连接后重试
```

**解决方案：**

1. **检查网络连接**
   - 确认设备网络正常

2. **检查图片大小**
   - 图片过大可能导致上传超时
   - 当前超时设置为 2 分钟（120 秒）

3. **查看 Supabase Dashboard Logs**
   - 进入 **Logs** → **API Logs**
   - 查看是否有错误请求

### 7.4 无法查看数据

**问题：** 在 Supabase Dashboard 中查询不到数据

**解决方案：**

1. **确认使用正确的角色查询**
   - 在 Dashboard 中查询时，使用的是 `service_role` 角色（有完整权限）
   - 如果使用 SQL Editor，默认有完整权限

2. **检查表名是否正确**
   - 确认表名是 `tracking_events`（不是 `tracking_event`）

3. **检查时间范围**
   - 使用以下 SQL 查看最近的数据：
     ```sql
     SELECT * FROM tracking_events 
     WHERE created_at >= NOW() - INTERVAL '1 hour'
     ORDER BY created_at DESC;
     ```

### 7.5 配置信息丢失

**问题：** 更换账号后不知道如何配置

**解决方案：**

1. **重新获取配置信息**
   - 参考 [2. 获取配置信息](#2-获取配置信息)

2. **更新代码配置**
   - 参考 [5.1 更新 Supabase 配置](#51-更新-supabase-配置)

3. **重新创建数据库表和策略**
   - 参考 [3. 配置数据库表（埋点数据）](#3-配置数据库表埋点数据)
   - 参考 [4. 配置 Storage Bucket（图片上传）](#4-配置-storage-bucket图片上传)

---

## 8. 快速检查清单

在完成配置后，使用以下清单验证：

### 数据库配置 ✅
- [ ] 表 `tracking_events` 已创建
- [ ] RLS 策略已配置（anon 和 authenticated 的 INSERT 策略）
- [ ] 索引已创建

### Storage 配置 ✅
- [ ] Bucket `images` 已创建
- [ ] Bucket 设置为 Public
- [ ] Storage RLS 策略已配置（Public Upload 和 Public Read）

### 前端代码配置 ✅
- [ ] `services/supabase.ts` 中已填入 Project URL
- [ ] `services/supabase.ts` 中已填入 Anon Key
- [ ] `services/imageUpload.ts` 使用统一的 supabase 客户端
- [ ] `services/tracking/index.ts` 使用统一的 supabase 客户端

### 测试验证 ✅
- [ ] 埋点数据能成功插入
- [ ] 图片能成功上传
- [ ] 在 Supabase Dashboard 中能查看到数据

---

## 9. 重要提示

1. **Anon Key 是公开的**
   - Anon Key 可以暴露在客户端代码中
   - 但不要使用 `service_role` key 在前端（有完整权限，非常危险）

2. **RLS 策略是必需的**
   - Supabase 默认启用 RLS
   - 必须配置策略才能允许前端操作

3. **Bucket 名称是硬编码的**
   - 代码中使用的是 `images` bucket
   - 如果更改 bucket 名称，需要同时修改 `services/imageUpload.ts`

4. **表名是硬编码的**
   - 代码中使用的是 `tracking_events` 表
   - 如果更改表名，需要同时修改 `services/tracking/index.ts` 和 `services/supabase.ts`

---

## 10. 参考文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [Supabase RLS 文档](https://supabase.com/docs/guides/auth/row-level-security)
- 项目内其他文档：
  - `docs/SUPABASE_TRACKING_SETUP.md` - 埋点数据存储详细文档
  - `docs/SUPABASE_STORAGE_SETUP.md` - 图片上传详细文档
  - `docs/SUPABASE_TRACKING_QUICK_START.md` - 快速开始指南

---

**最后更新：** 2025-01-26  
**维护者：** 开发团队

