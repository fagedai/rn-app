# 埋点事件表 SQL 建表语句（前端事件）

本文档包含所有**前端埋点事件**对应的表结构 SQL 语句。

**重要说明：**
- 所有表都创建在 `log` schema 中（使用 `log.表名` 格式）
- 每个事件对应一张独立的表
- 所有字段（公共字段 + 业务字段）都直接作为表列，不使用 JSONB
- 所有表都需要配置 RLS 策略以允许前端插入数据
- **注意：** 后端事件（如 `login_result`、`chat_message_result` 等）由后端直接写入，不在此文档中

**重要：** 在执行建表语句之前，需要先完成以下配置：

1. **创建 log schema 并授予权限**（参考 `docs/SUPABASE_COMPLETE_SETUP.md` 的 3.2 节）
2. **在 Supabase Dashboard 中配置 Exposed Schemas**（Settings > API > Exposed Schemas，添加 `log`）

如果还没有完成上述配置，请先参考 `docs/SUPABASE_COMPLETE_SETUP.md` 完成配置，否则会出现 `PGRST106` 错误（schema 不被允许访问）。

---

## 公共字段说明

所有表都包含以下公共字段：

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| event_id | varchar(64) | 是 | 事件唯一 ID（主键） |
| event_name | varchar(100) | 是 | 事件名称 |
| event_time | bigint | 否 | 事件发生时间，毫秒级时间戳 |
| user_id | varchar(64) | 否 | 用户 ID |
| device_id | varchar(128) | 否 | 设备 ID |
| platform | varchar(32) | 否 | 客户端平台，例如 ios / android / web |
| app_version | varchar(32) | 否 | 客户端应用版本号 |
| os_version | varchar(64) | 否 | 操作系统版本号 |
| network_type | varchar(32) | 否 | 网络类型，例如 wifi / 4g 等 |
| page_id | varchar(128) | 否 | 当前页面 ID，用于定位埋点所在页面 |
| trace_id | varchar(128) | 否 | 调用链追踪 ID，用于串联前后端请求 |
| session_id | varchar(128) | 否 | 会话 ID，用于区分不同会话 |
| created_at | timestamp with time zone | 否 | 记录写入数据库时间，默认 now() |

---

## 1. App 启动与前后台切换

### 1.1 app_launch（App 启动）

```sql
CREATE TABLE log.app_launch (
  event_id      varchar(64)  not null,
  event_name    varchar(100) not null,
  event_time    bigint       null,
  user_id       varchar(64)  null,
  device_id     varchar(128) null,
  platform      varchar(32)  null,
  app_version   varchar(32)  null,
  os_version    varchar(64)  null,
  network_type  varchar(32)  null,
  page_id       varchar(128) null,
  trace_id      varchar(128) null,
  session_id    varchar(128) null,
  launch_type   varchar(32)  null,
  created_at    timestamp with time zone null default now(),
  constraint app_launch_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.app_launch IS 'App 启动事件';
COMMENT ON COLUMN log.app_launch.event_id     IS '事件唯一ID';
COMMENT ON COLUMN log.app_launch.event_name   IS '事件名称';
COMMENT ON COLUMN log.app_launch.event_time   IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.app_launch.user_id      IS '用户ID';
COMMENT ON COLUMN log.app_launch.device_id    IS '设备ID';
COMMENT ON COLUMN log.app_launch.platform     IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.app_launch.app_version  IS '客户端应用版本号';
COMMENT ON COLUMN log.app_launch.os_version   IS '操作系统版本号';
COMMENT ON COLUMN log.app_launch.network_type IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.app_launch.page_id      IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.app_launch.trace_id     IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.app_launch.session_id   IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.app_launch.launch_type   IS '启动类型，cold / hot';
COMMENT ON COLUMN log.app_launch.created_at   IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.app_launch ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.app_launch;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.app_launch;
CREATE POLICY "Allow anonymous insert" ON log.app_launch FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.app_launch FOR INSERT TO authenticated WITH CHECK (true);
```

### 1.2 app_foreground（App 进入前台，预留）

```sql
CREATE TABLE log.app_foreground (
  event_id            varchar(64)  not null,
  event_name          varchar(100) not null,
  event_time          bigint       null,
  user_id             varchar(64)  null,
  device_id           varchar(128) null,
  platform            varchar(32)  null,
  app_version         varchar(32)  null,
  os_version          varchar(64)  null,
  network_type        varchar(32)  null,
  page_id             varchar(128) null,
  trace_id            varchar(128) null,
  session_id          varchar(128) null,
  stay_background_ms  integer     null,
  created_at          timestamp with time zone null default now(),
  constraint app_foreground_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.app_foreground IS 'App 进入前台事件（预留）';
COMMENT ON COLUMN log.app_foreground.event_id           IS '事件唯一ID';
COMMENT ON COLUMN log.app_foreground.event_name         IS '事件名称';
COMMENT ON COLUMN log.app_foreground.event_time         IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.app_foreground.user_id            IS '用户ID';
COMMENT ON COLUMN log.app_foreground.device_id          IS '设备ID';
COMMENT ON COLUMN log.app_foreground.platform           IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.app_foreground.app_version        IS '客户端应用版本号';
COMMENT ON COLUMN log.app_foreground.os_version         IS '操作系统版本号';
COMMENT ON COLUMN log.app_foreground.network_type       IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.app_foreground.page_id            IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.app_foreground.trace_id           IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.app_foreground.session_id         IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.app_foreground.stay_background_ms IS '本次在后台停留时长（毫秒）';
COMMENT ON COLUMN log.app_foreground.created_at         IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.app_foreground ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.app_foreground;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.app_foreground;
CREATE POLICY "Allow anonymous insert" ON log.app_foreground FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.app_foreground FOR INSERT TO authenticated WITH CHECK (true);
```

---

## 2. 登录/注册流程

### 2.1 page_view_login（登录页曝光）

```sql
CREATE TABLE log.page_view_login (
  event_id     varchar(64)  not null,
  event_name   varchar(100) not null,
  event_time   bigint       null,
  user_id      varchar(64)  null,
  device_id    varchar(128) null,
  platform     varchar(32)  null,
  app_version  varchar(32)  null,
  os_version   varchar(64)  null,
  network_type varchar(32)  null,
  page_id      varchar(128) null,
  trace_id     varchar(128) null,
  session_id   varchar(128) null,
  mode         varchar(32)  null,
  from_page    varchar(128) null,
  created_at   timestamp with time zone null default now(),
  constraint page_view_login_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.page_view_login IS '登录页曝光事件';
COMMENT ON COLUMN log.page_view_login.event_id     IS '事件唯一ID';
COMMENT ON COLUMN log.page_view_login.event_name   IS '事件名称';
COMMENT ON COLUMN log.page_view_login.event_time   IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.page_view_login.user_id      IS '用户ID';
COMMENT ON COLUMN log.page_view_login.device_id    IS '设备ID';
COMMENT ON COLUMN log.page_view_login.platform     IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.page_view_login.app_version  IS '客户端应用版本号';
COMMENT ON COLUMN log.page_view_login.os_version   IS '操作系统版本号';
COMMENT ON COLUMN log.page_view_login.network_type IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.page_view_login.page_id      IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.page_view_login.trace_id     IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.page_view_login.session_id   IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.page_view_login.mode          IS '登录模式，login / register';
COMMENT ON COLUMN log.page_view_login.from_page    IS '来源页面ID';
COMMENT ON COLUMN log.page_view_login.created_at   IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.page_view_login ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.page_view_login;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.page_view_login;
CREATE POLICY "Allow anonymous insert" ON log.page_view_login FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.page_view_login FOR INSERT TO authenticated WITH CHECK (true);
```

### 2.2 click_one_tap_login（点击一键登录）

```sql
CREATE TABLE log.click_one_tap_login (
  event_id           varchar(64)  not null,
  event_name         varchar(100) not null,
  event_time         bigint       null,
  user_id            varchar(64)  null,
  device_id          varchar(128) null,
  platform           varchar(32)  null,
  app_version        varchar(32)  null,
  os_version         varchar(64)  null,
  network_type       varchar(32)  null,
  page_id            varchar(128) null,
  trace_id           varchar(128) null,
  session_id         varchar(128) null,
  from_page          varchar(128) null,
  has_read_agreement boolean      null,
  created_at         timestamp with time zone null default now(),
  constraint click_one_tap_login_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.click_one_tap_login IS '点击一键登录事件';
COMMENT ON COLUMN log.click_one_tap_login.event_id           IS '事件唯一ID';
COMMENT ON COLUMN log.click_one_tap_login.event_name         IS '事件名称';
COMMENT ON COLUMN log.click_one_tap_login.event_time         IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.click_one_tap_login.user_id            IS '用户ID';
COMMENT ON COLUMN log.click_one_tap_login.device_id          IS '设备ID';
COMMENT ON COLUMN log.click_one_tap_login.platform           IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.click_one_tap_login.app_version        IS '客户端应用版本号';
COMMENT ON COLUMN log.click_one_tap_login.os_version         IS '操作系统版本号';
COMMENT ON COLUMN log.click_one_tap_login.network_type       IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.click_one_tap_login.page_id            IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.click_one_tap_login.trace_id           IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.click_one_tap_login.session_id         IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.click_one_tap_login.from_page          IS '来源页面ID';
COMMENT ON COLUMN log.click_one_tap_login.has_read_agreement IS '是否勾选协议';
COMMENT ON COLUMN log.click_one_tap_login.created_at         IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.click_one_tap_login ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.click_one_tap_login;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.click_one_tap_login;
CREATE POLICY "Allow anonymous insert" ON log.click_one_tap_login FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.click_one_tap_login FOR INSERT TO authenticated WITH CHECK (true);
```

### 2.3 click_sms_login（点击短信验证码登录）

```sql
CREATE TABLE log.click_sms_login (
  event_id     varchar(64)  not null,
  event_name   varchar(100) not null,
  event_time   bigint       null,
  user_id      varchar(64)  null,
  device_id    varchar(128) null,
  platform     varchar(32)  null,
  app_version  varchar(32)  null,
  os_version   varchar(64)  null,
  network_type varchar(32)  null,
  page_id      varchar(128) null,
  trace_id     varchar(128) null,
  session_id   varchar(128) null,
  from_page    varchar(128) null,
  created_at   timestamp with time zone null default now(),
  constraint click_sms_login_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.click_sms_login IS '点击短信验证码登录事件';
COMMENT ON COLUMN log.click_sms_login.event_id     IS '事件唯一ID';
COMMENT ON COLUMN log.click_sms_login.event_name   IS '事件名称';
COMMENT ON COLUMN log.click_sms_login.event_time   IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.click_sms_login.user_id      IS '用户ID';
COMMENT ON COLUMN log.click_sms_login.device_id    IS '设备ID';
COMMENT ON COLUMN log.click_sms_login.platform     IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.click_sms_login.app_version  IS '客户端应用版本号';
COMMENT ON COLUMN log.click_sms_login.os_version   IS '操作系统版本号';
COMMENT ON COLUMN log.click_sms_login.network_type IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.click_sms_login.page_id      IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.click_sms_login.trace_id     IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.click_sms_login.session_id   IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.click_sms_login.from_page    IS '来源页面ID';
COMMENT ON COLUMN log.click_sms_login.created_at   IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.click_sms_login ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.click_sms_login;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.click_sms_login;
CREATE POLICY "Allow anonymous insert" ON log.click_sms_login FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.click_sms_login FOR INSERT TO authenticated WITH CHECK (true);
```

---

## 3. 问卷 & 用户画像

### 3.1 page_view_questionnaire（问卷页曝光）

```sql
CREATE TABLE log.page_view_questionnaire (
  event_id             varchar(64)  not null,
  event_name           varchar(100) not null,
  event_time           bigint       null,
  user_id              varchar(64)  null,
  device_id            varchar(128) null,
  platform             varchar(32)  null,
  app_version          varchar(32)  null,
  os_version           varchar(64)  null,
  network_type         varchar(32)  null,
  page_id              varchar(128) null,
  trace_id             varchar(128) null,
  session_id           varchar(128) null,
  questionnaire_version varchar(32)  null,
  from_page            varchar(128) null,
  created_at           timestamp with time zone null default now(),
  constraint page_view_questionnaire_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.page_view_questionnaire IS '问卷页曝光事件';
COMMENT ON COLUMN log.page_view_questionnaire.event_id             IS '事件唯一ID';
COMMENT ON COLUMN log.page_view_questionnaire.event_name           IS '事件名称';
COMMENT ON COLUMN log.page_view_questionnaire.event_time           IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.page_view_questionnaire.user_id              IS '用户ID';
COMMENT ON COLUMN log.page_view_questionnaire.device_id            IS '设备ID';
COMMENT ON COLUMN log.page_view_questionnaire.platform             IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.page_view_questionnaire.app_version          IS '客户端应用版本号';
COMMENT ON COLUMN log.page_view_questionnaire.os_version           IS '操作系统版本号';
COMMENT ON COLUMN log.page_view_questionnaire.network_type         IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.page_view_questionnaire.page_id              IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.page_view_questionnaire.trace_id             IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.page_view_questionnaire.session_id           IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.page_view_questionnaire.questionnaire_version IS '问卷版本号';
COMMENT ON COLUMN log.page_view_questionnaire.from_page            IS '来源页面ID';
COMMENT ON COLUMN log.page_view_questionnaire.created_at           IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.page_view_questionnaire ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.page_view_questionnaire;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.page_view_questionnaire;
CREATE POLICY "Allow anonymous insert" ON log.page_view_questionnaire FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.page_view_questionnaire FOR INSERT TO authenticated WITH CHECK (true);
```

### 3.2 question_view（单题目曝光）

```sql
CREATE TABLE log.question_view (
  event_id      varchar(64)  not null,
  event_name    varchar(100) not null,
  event_time    bigint       null,
  user_id       varchar(64)  null,
  device_id     varchar(128) null,
  platform      varchar(32)  null,
  app_version   varchar(32)  null,
  os_version    varchar(64)  null,
  network_type  varchar(32)  null,
  page_id       varchar(128) null,
  trace_id      varchar(128) null,
  session_id    varchar(128) null,
  question_id   varchar(128) null,
  order_index   integer     null,
  question_type varchar(32)  null,
  created_at    timestamp with time zone null default now(),
  constraint question_view_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.question_view IS '单题目曝光事件';
COMMENT ON COLUMN log.question_view.event_id     IS '事件唯一ID';
COMMENT ON COLUMN log.question_view.event_name   IS '事件名称';
COMMENT ON COLUMN log.question_view.event_time   IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.question_view.user_id      IS '用户ID';
COMMENT ON COLUMN log.question_view.device_id    IS '设备ID';
COMMENT ON COLUMN log.question_view.platform     IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.question_view.app_version  IS '客户端应用版本号';
COMMENT ON COLUMN log.question_view.os_version   IS '操作系统版本号';
COMMENT ON COLUMN log.question_view.network_type IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.question_view.page_id      IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.question_view.trace_id     IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.question_view.session_id   IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.question_view.question_id  IS '题目ID';
COMMENT ON COLUMN log.question_view.order_index  IS '题目顺序';
COMMENT ON COLUMN log.question_view.question_type IS '题目类型，single_choice / multi_choice / text';
COMMENT ON COLUMN log.question_view.created_at   IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.question_view ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.question_view;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.question_view;
CREATE POLICY "Allow anonymous insert" ON log.question_view FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.question_view FOR INSERT TO authenticated WITH CHECK (true);
```

### 3.3 question_answer（单题目作答）

```sql
CREATE TABLE log.question_answer (
  event_id      varchar(64)  not null,
  event_name    varchar(100) not null,
  event_time    bigint       null,
  user_id       varchar(64)  null,
  device_id     varchar(128) null,
  platform      varchar(32)  null,
  app_version   varchar(32)  null,
  os_version    varchar(64)  null,
  network_type  varchar(32)  null,
  page_id       varchar(128) null,
  trace_id      varchar(128) null,
  session_id    varchar(128) null,
  question_id   varchar(128) null,
  order_index   integer     null,
  answer_type   varchar(32)  null,
  answer_value  varchar(512) null,
  time_spent_ms integer     null,
  created_at    timestamp with time zone null default now(),
  constraint question_answer_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.question_answer IS '单题目作答事件';
COMMENT ON COLUMN log.question_answer.event_id     IS '事件唯一ID';
COMMENT ON COLUMN log.question_answer.event_name   IS '事件名称';
COMMENT ON COLUMN log.question_answer.event_time   IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.question_answer.user_id      IS '用户ID';
COMMENT ON COLUMN log.question_answer.device_id    IS '设备ID';
COMMENT ON COLUMN log.question_answer.platform     IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.question_answer.app_version  IS '客户端应用版本号';
COMMENT ON COLUMN log.question_answer.os_version   IS '操作系统版本号';
COMMENT ON COLUMN log.question_answer.network_type IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.question_answer.page_id      IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.question_answer.trace_id     IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.question_answer.session_id   IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.question_answer.question_id  IS '题目ID';
COMMENT ON COLUMN log.question_answer.order_index  IS '题目顺序';
COMMENT ON COLUMN log.question_answer.answer_type  IS '答案类型，option / text';
COMMENT ON COLUMN log.question_answer.answer_value  IS '答案内容（选项ID或文本，可截断）';
COMMENT ON COLUMN log.question_answer.time_spent_ms IS '从题目曝光到作答完成所用时间（毫秒）';
COMMENT ON COLUMN log.question_answer.created_at   IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.question_answer ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.question_answer;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.question_answer;
CREATE POLICY "Allow anonymous insert" ON log.question_answer FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.question_answer FOR INSERT TO authenticated WITH CHECK (true);
```

---

## 4. 机器人创建 & 训练

### 4.1 page_view_bot_setup（机器人设定页曝光）

```sql
CREATE TABLE log.page_view_bot_setup (
  event_id     varchar(64)  not null,
  event_name   varchar(100) not null,
  event_time   bigint       null,
  user_id      varchar(64)  null,
  device_id    varchar(128) null,
  platform     varchar(32)  null,
  app_version  varchar(32)  null,
  os_version   varchar(64)  null,
  network_type varchar(32)  null,
  page_id      varchar(128) null,
  trace_id     varchar(128) null,
  session_id   varchar(128) null,
  from_page    varchar(128) null,
  created_at   timestamp with time zone null default now(),
  constraint page_view_bot_setup_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.page_view_bot_setup IS '机器人设定页曝光事件';
COMMENT ON COLUMN log.page_view_bot_setup.event_id     IS '事件唯一ID';
COMMENT ON COLUMN log.page_view_bot_setup.event_name   IS '事件名称';
COMMENT ON COLUMN log.page_view_bot_setup.event_time   IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.page_view_bot_setup.user_id      IS '用户ID';
COMMENT ON COLUMN log.page_view_bot_setup.device_id    IS '设备ID';
COMMENT ON COLUMN log.page_view_bot_setup.platform     IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.page_view_bot_setup.app_version  IS '客户端应用版本号';
COMMENT ON COLUMN log.page_view_bot_setup.os_version   IS '操作系统版本号';
COMMENT ON COLUMN log.page_view_bot_setup.network_type IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.page_view_bot_setup.page_id      IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.page_view_bot_setup.trace_id     IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.page_view_bot_setup.session_id   IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.page_view_bot_setup.from_page    IS '来源页面ID';
COMMENT ON COLUMN log.page_view_bot_setup.created_at   IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.page_view_bot_setup ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.page_view_bot_setup;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.page_view_bot_setup;
CREATE POLICY "Allow anonymous insert" ON log.page_view_bot_setup FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.page_view_bot_setup FOR INSERT TO authenticated WITH CHECK (true);
```

### 4.2 bot_profile_edit（修改机器人信息）

```sql
CREATE TABLE log.bot_profile_edit (
  event_id         varchar(64)  not null,
  event_name       varchar(100) not null,
  event_time       bigint       null,
  user_id          varchar(64)  null,
  device_id        varchar(128) null,
  platform         varchar(32)  null,
  app_version      varchar(32)  null,
  os_version       varchar(64)  null,
  network_type     varchar(32)  null,
  page_id          varchar(128) null,
  trace_id         varchar(128) null,
  session_id       varchar(128) null,
  field_name       varchar(64)  null,
  old_value_length integer     null,
  new_value_length integer     null,
  created_at       timestamp with time zone null default now(),
  constraint bot_profile_edit_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.bot_profile_edit IS '修改机器人信息事件';
COMMENT ON COLUMN log.bot_profile_edit.event_id         IS '事件唯一ID';
COMMENT ON COLUMN log.bot_profile_edit.event_name       IS '事件名称';
COMMENT ON COLUMN log.bot_profile_edit.event_time       IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.bot_profile_edit.user_id          IS '用户ID';
COMMENT ON COLUMN log.bot_profile_edit.device_id        IS '设备ID';
COMMENT ON COLUMN log.bot_profile_edit.platform         IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.bot_profile_edit.app_version      IS '客户端应用版本号';
COMMENT ON COLUMN log.bot_profile_edit.os_version       IS '操作系统版本号';
COMMENT ON COLUMN log.bot_profile_edit.network_type     IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.bot_profile_edit.page_id          IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.bot_profile_edit.trace_id         IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.bot_profile_edit.session_id       IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.bot_profile_edit.field_name       IS '修改字段名，bot_name / bot_gender / relationship / bot_persona 等';
COMMENT ON COLUMN log.bot_profile_edit.old_value_length IS '旧值长度';
COMMENT ON COLUMN log.bot_profile_edit.new_value_length IS '新值长度';
COMMENT ON COLUMN log.bot_profile_edit.created_at       IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.bot_profile_edit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.bot_profile_edit;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.bot_profile_edit;
CREATE POLICY "Allow anonymous insert" ON log.bot_profile_edit FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.bot_profile_edit FOR INSERT TO authenticated WITH CHECK (true);
```

### 4.3 click_bot_create（点击创建/保存机器人）

```sql
CREATE TABLE log.click_bot_create (
  event_id       varchar(64)  not null,
  event_name     varchar(100) not null,
  event_time     bigint       null,
  user_id        varchar(64)  null,
  device_id      varchar(128) null,
  platform       varchar(32)  null,
  app_version    varchar(32)  null,
  os_version     varchar(64)  null,
  network_type   varchar(32)  null,
  page_id        varchar(128) null,
  trace_id       varchar(128) null,
  session_id     varchar(128) null,
  from_page      varchar(128) null,
  is_first_create boolean     null,
  created_at     timestamp with time zone null default now(),
  constraint click_bot_create_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.click_bot_create IS '点击创建/保存机器人事件';
COMMENT ON COLUMN log.click_bot_create.event_id       IS '事件唯一ID';
COMMENT ON COLUMN log.click_bot_create.event_name     IS '事件名称';
COMMENT ON COLUMN log.click_bot_create.event_time     IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.click_bot_create.user_id        IS '用户ID';
COMMENT ON COLUMN log.click_bot_create.device_id      IS '设备ID';
COMMENT ON COLUMN log.click_bot_create.platform       IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.click_bot_create.app_version    IS '客户端应用版本号';
COMMENT ON COLUMN log.click_bot_create.os_version     IS '操作系统版本号';
COMMENT ON COLUMN log.click_bot_create.network_type   IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.click_bot_create.page_id        IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.click_bot_create.trace_id       IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.click_bot_create.session_id     IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.click_bot_create.from_page      IS '来源页面ID';
COMMENT ON COLUMN log.click_bot_create.is_first_create IS '是否为该用户第一次创建机器人';
COMMENT ON COLUMN log.click_bot_create.created_at     IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.click_bot_create ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.click_bot_create;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.click_bot_create;
CREATE POLICY "Allow anonymous insert" ON log.click_bot_create FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.click_bot_create FOR INSERT TO authenticated WITH CHECK (true);
```

---

## 5. 聊天对话

### 5.1 page_view_chat（聊天页曝光）

```sql
CREATE TABLE log.page_view_chat (
  event_id            varchar(64)  not null,
  event_name          varchar(100) not null,
  event_time          bigint       null,
  user_id             varchar(64)  null,
  device_id           varchar(128) null,
  platform            varchar(32)  null,
  app_version         varchar(32)  null,
  os_version          varchar(64)  null,
  network_type        varchar(32)  null,
  page_id             varchar(128) null,
  trace_id            varchar(128) null,
  session_id          varchar(128) null,
  bot_id              varchar(128) null,
  from_page           varchar(128) null,
  from_history_session boolean     null,
  created_at          timestamp with time zone null default now(),
  constraint page_view_chat_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.page_view_chat IS '聊天页曝光事件';
COMMENT ON COLUMN log.page_view_chat.event_id            IS '事件唯一ID';
COMMENT ON COLUMN log.page_view_chat.event_name          IS '事件名称';
COMMENT ON COLUMN log.page_view_chat.event_time          IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.page_view_chat.user_id             IS '用户ID';
COMMENT ON COLUMN log.page_view_chat.device_id           IS '设备ID';
COMMENT ON COLUMN log.page_view_chat.platform            IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.page_view_chat.app_version         IS '客户端应用版本号';
COMMENT ON COLUMN log.page_view_chat.os_version          IS '操作系统版本号';
COMMENT ON COLUMN log.page_view_chat.network_type        IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.page_view_chat.page_id             IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.page_view_chat.trace_id            IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.page_view_chat.session_id          IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.page_view_chat.bot_id              IS '机器人ID';
COMMENT ON COLUMN log.page_view_chat.from_page           IS '来源页面ID';
COMMENT ON COLUMN log.page_view_chat.from_history_session IS '是否从历史会话进入';
COMMENT ON COLUMN log.page_view_chat.created_at          IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.page_view_chat ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.page_view_chat;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.page_view_chat;
CREATE POLICY "Allow anonymous insert" ON log.page_view_chat FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.page_view_chat FOR INSERT TO authenticated WITH CHECK (true);
```

### 5.2 chat_message_send（用户发送消息）

```sql
CREATE TABLE log.chat_message_send (
  event_id            varchar(64)  not null,
  event_name          varchar(100) not null,
  event_time          bigint       null,
  user_id             varchar(64)  null,
  device_id           varchar(128) null,
  platform            varchar(32)  null,
  app_version         varchar(32)  null,
  os_version          varchar(64)  null,
  network_type        varchar(32)  null,
  page_id             varchar(128) null,
  trace_id            varchar(128) null,
  session_id          varchar(128) null,
  bot_id              varchar(128) null,
  message_id          varchar(128) null,
  content_length      integer     null,
  has_emoji           boolean     null,
  from_history_session boolean     null,
  created_at          timestamp with time zone null default now(),
  constraint chat_message_send_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.chat_message_send IS '用户发送消息事件';
COMMENT ON COLUMN log.chat_message_send.event_id            IS '事件唯一ID';
COMMENT ON COLUMN log.chat_message_send.event_name          IS '事件名称';
COMMENT ON COLUMN log.chat_message_send.event_time          IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.chat_message_send.user_id             IS '用户ID';
COMMENT ON COLUMN log.chat_message_send.device_id           IS '设备ID';
COMMENT ON COLUMN log.chat_message_send.platform            IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.chat_message_send.app_version         IS '客户端应用版本号';
COMMENT ON COLUMN log.chat_message_send.os_version          IS '操作系统版本号';
COMMENT ON COLUMN log.chat_message_send.network_type        IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.chat_message_send.page_id             IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.chat_message_send.trace_id            IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.chat_message_send.session_id          IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.chat_message_send.bot_id              IS '机器人ID';
COMMENT ON COLUMN log.chat_message_send.message_id          IS '消息ID';
COMMENT ON COLUMN log.chat_message_send.content_length      IS '消息文本长度';
COMMENT ON COLUMN log.chat_message_send.has_emoji           IS '是否包含 emoji';
COMMENT ON COLUMN log.chat_message_send.from_history_session IS '是否从历史会话入口发送';
COMMENT ON COLUMN log.chat_message_send.created_at          IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.chat_message_send ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.chat_message_send;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.chat_message_send;
CREATE POLICY "Allow anonymous insert" ON log.chat_message_send FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.chat_message_send FOR INSERT TO authenticated WITH CHECK (true);
```

### 5.3 chat_reply_show（回复展示完成）

```sql
CREATE TABLE log.chat_reply_show (
  event_id       varchar(64)  not null,
  event_name     varchar(100) not null,
  event_time     bigint       null,
  user_id        varchar(64)  null,
  device_id      varchar(128) null,
  platform       varchar(32)  null,
  app_version    varchar(32)  null,
  os_version     varchar(64)  null,
  network_type   varchar(32)  null,
  page_id        varchar(128) null,
  trace_id       varchar(128) null,
  session_id     varchar(128) null,
  bot_id         varchar(128) null,
  message_id     varchar(128) null,
  reply_length   integer     null,
  is_interrupted boolean     null,
  created_at     timestamp with time zone null default now(),
  constraint chat_reply_show_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.chat_reply_show IS '回复展示完成事件';
COMMENT ON COLUMN log.chat_reply_show.event_id       IS '事件唯一ID';
COMMENT ON COLUMN log.chat_reply_show.event_name     IS '事件名称';
COMMENT ON COLUMN log.chat_reply_show.event_time     IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.chat_reply_show.user_id        IS '用户ID';
COMMENT ON COLUMN log.chat_reply_show.device_id      IS '设备ID';
COMMENT ON COLUMN log.chat_reply_show.platform       IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.chat_reply_show.app_version    IS '客户端应用版本号';
COMMENT ON COLUMN log.chat_reply_show.os_version     IS '操作系统版本号';
COMMENT ON COLUMN log.chat_reply_show.network_type   IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.chat_reply_show.page_id        IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.chat_reply_show.trace_id       IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.chat_reply_show.session_id     IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.chat_reply_show.bot_id         IS '机器人ID';
COMMENT ON COLUMN log.chat_reply_show.message_id     IS '对应的用户消息ID';
COMMENT ON COLUMN log.chat_reply_show.reply_length   IS '回复内容长度';
COMMENT ON COLUMN log.chat_reply_show.is_interrupted IS '用户是否中途手动中断回复';
COMMENT ON COLUMN log.chat_reply_show.created_at     IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.chat_reply_show ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.chat_reply_show;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.chat_reply_show;
CREATE POLICY "Allow anonymous insert" ON log.chat_reply_show FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.chat_reply_show FOR INSERT TO authenticated WITH CHECK (true);
```

---

## 6. 设置 & 用户信息

### 6.1 page_view_settings（设置页曝光）

```sql
CREATE TABLE log.page_view_settings (
  event_id     varchar(64)  not null,
  event_name   varchar(100) not null,
  event_time   bigint       null,
  user_id      varchar(64)  null,
  device_id    varchar(128) null,
  platform     varchar(32)  null,
  app_version  varchar(32)  null,
  os_version   varchar(64)  null,
  network_type varchar(32)  null,
  page_id      varchar(128) null,
  trace_id     varchar(128) null,
  session_id   varchar(128) null,
  created_at   timestamp with time zone null default now(),
  constraint page_view_settings_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.page_view_settings IS '设置页曝光事件';
COMMENT ON COLUMN log.page_view_settings.event_id     IS '事件唯一ID';
COMMENT ON COLUMN log.page_view_settings.event_name   IS '事件名称';
COMMENT ON COLUMN log.page_view_settings.event_time   IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.page_view_settings.user_id      IS '用户ID';
COMMENT ON COLUMN log.page_view_settings.device_id    IS '设备ID';
COMMENT ON COLUMN log.page_view_settings.platform     IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.page_view_settings.app_version  IS '客户端应用版本号';
COMMENT ON COLUMN log.page_view_settings.os_version   IS '操作系统版本号';
COMMENT ON COLUMN log.page_view_settings.network_type IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.page_view_settings.page_id      IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.page_view_settings.trace_id     IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.page_view_settings.session_id   IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.page_view_settings.created_at   IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.page_view_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.page_view_settings;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.page_view_settings;
CREATE POLICY "Allow anonymous insert" ON log.page_view_settings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.page_view_settings FOR INSERT TO authenticated WITH CHECK (true);
```

### 6.2 user_profile_edit（用户个人信息修改）

```sql
CREATE TABLE log.user_profile_edit (
  event_id         varchar(64)  not null,
  event_name       varchar(100) not null,
  event_time       bigint       null,
  user_id          varchar(64)  null,
  device_id        varchar(128) null,
  platform         varchar(32)  null,
  app_version      varchar(32)  null,
  os_version       varchar(64)  null,
  network_type     varchar(32)  null,
  page_id          varchar(128) null,
  trace_id         varchar(128) null,
  session_id       varchar(128) null,
  field_name       varchar(64)  null,
  old_value_length integer     null,
  new_value_length integer     null,
  created_at       timestamp with time zone null default now(),
  constraint user_profile_edit_pkey primary key (event_id)
) tablespace pg_default;

COMMENT ON TABLE log.user_profile_edit IS '用户个人信息修改事件';
COMMENT ON COLUMN log.user_profile_edit.event_id         IS '事件唯一ID';
COMMENT ON COLUMN log.user_profile_edit.event_name       IS '事件名称';
COMMENT ON COLUMN log.user_profile_edit.event_time       IS '事件发生时间，毫秒级时间戳';
COMMENT ON COLUMN log.user_profile_edit.user_id          IS '用户ID';
COMMENT ON COLUMN log.user_profile_edit.device_id        IS '设备ID';
COMMENT ON COLUMN log.user_profile_edit.platform         IS '客户端平台，例如 ios / android / web';
COMMENT ON COLUMN log.user_profile_edit.app_version      IS '客户端应用版本号';
COMMENT ON COLUMN log.user_profile_edit.os_version       IS '操作系统版本号';
COMMENT ON COLUMN log.user_profile_edit.network_type     IS '网络类型，例如 wifi / 4g 等';
COMMENT ON COLUMN log.user_profile_edit.page_id          IS '当前页面ID，用于定位埋点所在页面';
COMMENT ON COLUMN log.user_profile_edit.trace_id         IS '调用链追踪ID，用于串联前后端请求';
COMMENT ON COLUMN log.user_profile_edit.session_id       IS '会话ID，用于区分不同会话';
COMMENT ON COLUMN log.user_profile_edit.field_name       IS '修改字段，user_name / birthday / gender / interests / background 等';
COMMENT ON COLUMN log.user_profile_edit.old_value_length IS '旧值长度';
COMMENT ON COLUMN log.user_profile_edit.new_value_length IS '新值长度';
COMMENT ON COLUMN log.user_profile_edit.created_at       IS '记录写入数据库时间';

-- 配置 RLS 策略
ALTER TABLE log.user_profile_edit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous insert" ON log.user_profile_edit;
DROP POLICY IF EXISTS "Allow authenticated insert" ON log.user_profile_edit;
CREATE POLICY "Allow anonymous insert" ON log.user_profile_edit FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow authenticated insert" ON log.user_profile_edit FOR INSERT TO authenticated WITH CHECK (true);
```

---

## 7. 批量执行建议

1. **先创建 schema**：执行 `CREATE SCHEMA IF NOT EXISTS log;`

2. **按模块执行建表语句**：建议按照模块顺序执行（App 启动 → 登录 → 问卷 → 机器人 → 聊天 → 设置）

3. **验证表创建**：在 Supabase Dashboard 的 **Table Editor** 中，切换到 `log` schema，确认所有表都已创建

4. **验证 RLS 策略**：在 **Authentication** → **Policies** 中，选择 `log` schema，确认每个表都有两个 INSERT 策略（anon 和 authenticated）

---

## 8. 注意事项

1. **仅前端事件**：本文档只包含前端埋点事件的建表语句。后端事件（如 `login_result`、`chat_message_result` 等）由后端团队负责创建和管理。

2. **使用 log schema**：所有表都创建在 `log` schema 中，使用 `log.表名` 格式。前端代码已配置为使用 `log` schema。

3. **主键使用 event_id**：所有表使用 `event_id varchar(64)` 作为主键，不再使用 UUID 类型的 `id` 字段。

4. **字段类型统一**：
   - `varchar(64)` 用于 event_id、user_id
   - `varchar(100)` 用于 event_name
   - `varchar(128)` 用于 device_id、page_id、trace_id、session_id、bot_id、message_id 等
   - `varchar(32)` 用于 platform、app_version、network_type 等短字符串
   - `varchar(64)` 用于 os_version
   - `bigint` 用于时间戳（毫秒）
   - `integer` 用于整数
   - `boolean` 用于布尔值
   - `timestamp with time zone` 用于 created_at

5. **RLS 策略**：所有表都配置了允许 `anon` 和 `authenticated` 角色插入数据的策略，以便前端应用可以写入数据

6. **注释**：所有表和字段都添加了中文注释，便于理解和维护

