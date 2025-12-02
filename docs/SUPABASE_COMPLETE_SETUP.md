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

### 3.1 埋点表结构说明

**重要变更：** 现在采用 **一个事件对应一张表** 的设计，不再使用统一的 `tracking_events` 表。

- 每个埋点事件都有独立的表
- 所有字段（公共字段 + 业务字段）都直接作为表列，不使用 JSONB
- 表名与事件名一致（如 `app_launch` 事件对应 `app_launch` 表）

### 3.2 创建 log Schema 并配置 PostgREST 访问权限

在执行建表语句之前，需要先创建 `log` schema 并配置 PostgREST 允许访问该 schema：

#### 步骤 1：创建 log Schema 并授予权限

1. 在 Supabase Dashboard 中，点击左侧菜单 **SQL Editor**
2. 点击 **New query**
3. 复制并执行以下 SQL：

```sql
-- 1. 创建 log schema（如果不存在）
CREATE SCHEMA IF NOT EXISTS log;

-- 2. 授予 authenticator 角色对 log schema 的使用权限
-- PostgREST 使用 authenticator 角色连接到数据库
GRANT USAGE ON SCHEMA log TO authenticator;

-- 3. 授予 anon 角色对 log schema 的使用权限（重要！）
-- 前端使用 anon key，PostgREST 会切换到 anon 角色执行操作
GRANT USAGE ON SCHEMA log TO anon;

-- 4. 授予 authenticated 角色对 log schema 的使用权限（可选，用于已登录用户）
GRANT USAGE ON SCHEMA log TO authenticated;

-- 5. 授予 authenticator 角色对 log schema 中所有表的访问权限
-- 这里先授予默认权限，后续创建表后会自动应用
ALTER DEFAULT PRIVILEGES IN SCHEMA log 
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticator;

-- 6. 授予 anon 角色对 log schema 中所有表的访问权限（重要！）
ALTER DEFAULT PRIVILEGES IN SCHEMA log 
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon;

-- 7. 授予 authenticated 角色对 log schema 中所有表的访问权限（可选）
ALTER DEFAULT PRIVILEGES IN SCHEMA log 
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
```

4. 点击 **Run** 执行 SQL
5. 确认执行成功

#### 步骤 2：在 Supabase Dashboard 中配置 Exposed Schemas

**重要：** 必须完成此步骤，否则 PostgREST 无法访问 `log` schema。

1. 在 Supabase Dashboard 中，点击左侧菜单 **Settings**（⚙️ 图标）
2. 选择 **API**
3. 找到 **Exposed Schemas**（公开的 schema）字段
4. 在输入框中，确保包含 `public` 和 `log`，格式如下：
   ```
   public, log
   ```
   或者：
   ```
   public,log
   ```
5. 点击 **Save** 保存更改

**注意：**
- 如果 `Exposed Schemas` 字段为空或只显示 `public`，需要手动添加 `log`
- 多个 schema 之间用逗号分隔
- 保存后可能需要等待几秒钟让配置生效

#### 步骤 3：验证配置

1. 在 **SQL Editor** 中执行以下 SQL 验证权限：

```sql
-- 检查 log schema 是否存在
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'log';

-- 检查 anon 角色的权限（前端使用 anon key，所以这个很重要）
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'log' AND grantee = 'anon';

-- 检查 authenticator 角色的权限
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'log' AND grantee = 'authenticator';
```

2. 如果看到 `log` schema 和权限信息，说明配置成功

**注意：** 所有埋点表都创建在 `log` schema 中，使用 `log.表名` 格式。

### 3.3 创建所有埋点事件表

**重要：** 所有埋点事件表的 SQL 建表语句已整理在 `docs/TRACKING_TABLES_SQL.md` 文件中。

**执行步骤：**

1. 打开 `docs/TRACKING_TABLES_SQL.md` 文件
2. 按照文档中的顺序执行 SQL 语句：
   - 先创建 schema 和配置权限（已在 3.2 中完成）
   - 然后按模块执行建表语句（App 启动 → 登录 → 问卷 → 机器人 → 聊天 → 设置）
3. 每个表的 SQL 语句都包含：
   - 表结构定义（公共字段 + 业务字段）
   - 表和字段注释
   - RLS 策略配置

**重要：** 如果你是在**创建表之后**才执行步骤 3.2 的 SQL，那么 `ALTER DEFAULT PRIVILEGES` 只对之后创建的表生效，**已存在的表需要单独授权**。

请执行以下 SQL 来授予已存在表的权限：

```sql
-- 授予 authenticator 角色对 log schema 中所有现有表的权限
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA log TO authenticator;

-- 授予 anon 角色对 log schema 中所有现有表的权限（重要！前端使用 anon key）
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA log TO anon;

-- 授予 authenticated 角色对 log schema 中所有现有表的权限（可选）
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA log TO authenticated;
```

**验证权限：**

执行以下 SQL 检查权限是否已正确授予：

```sql
-- 检查 log schema 中所有表的权限
SELECT 
  table_name,
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'log' 
  AND grantee = 'authenticator'
ORDER BY table_name, privilege_type;
```

如果看到所有表都有 `SELECT`, `INSERT`, `UPDATE`, `DELETE` 权限，说明配置成功。

**快速执行方式：**

如果你想一次性执行所有表的创建语句，可以：

1. 在 **SQL Editor** 中，点击 **New query**
2. 从 `docs/TRACKING_TABLES_SQL.md` 中复制所有 SQL 语句（按顺序）
3. 点击 **Run** 执行
4. 确认所有表都已创建成功

**验证表创建：**

1. 在左侧菜单点击 **Table Editor**
2. 在顶部选择 **Schema** 下拉菜单，选择 `log` schema
3. 确认看到所有埋点事件表（如 `app_launch`、`page_view_login`、`chat_message_send` 等）
4. 检查每个表的结构，确认包含公共字段和业务字段

**验证 RLS 策略：**

1. 在左侧菜单点击 **Authentication** → **Policies**
2. 在顶部选择 **Schema** 下拉菜单，选择 `log` schema
3. 选择任意一个埋点事件表（如 `app_launch`）
4. 确认看到两个策略：
   - `Allow anonymous insert` (INSERT, anon)
   - `Allow authenticated insert` (INSERT, authenticated)
5. 对其他表重复验证

### 3.4 事件与表名映射

前端代码中的事件名会自动映射到对应的表名。映射关系在 `services/tracking/index.ts` 中的 `EVENT_TABLE_MAP` 定义。

**当前支持的前端事件：**

- `app_launch` → `app_launch` 表
- `app_foreground` → `app_foreground` 表
- `page_view_login` → `page_view_login` 表
- `click_one_tap_login` → `click_one_tap_login` 表
- `click_sms_login` → `click_sms_login` 表
- `page_view_questionnaire` → `page_view_questionnaire` 表
- `question_view` → `question_view` 表
- `question_answer` → `question_answer` 表
- `page_view_bot_setup` → `page_view_bot_setup` 表
- `bot_profile_edit` → `bot_profile_edit` 表
- `click_bot_create` → `click_bot_create` 表
- `page_view_chat` → `page_view_chat` 表
- `chat_message_send` → `chat_message_send` 表
- `chat_reply_show` → `chat_reply_show` 表
- `page_view_settings` → `page_view_settings` 表
- `user_profile_edit` → `user_profile_edit` 表

**注意：** 后端事件（如 `login_result`、`questionnaire_submit_result`、`bot_create_result`、`bot_train_trigger`、`bot_train_result`、`chat_message_result`）由后端直接写入 Supabase，不在此映射中。

如果事件名不在映射中，会自动使用 `event_{event_name}` 作为表名。

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
   - ✅ 根据事件名自动选择对应的表（映射关系在 `EVENT_TABLE_MAP` 中定义）
   - ✅ 所有字段（公共字段 + 业务字段）直接作为表列插入，不使用 JSONB

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

