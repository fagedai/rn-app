# 埋点功能实现状态

## ✅ 已完成

### 1. 埋点服务框架
- ✅ 创建了 `services/tracking/index.ts` 统一埋点服务
- ✅ 实现了 `track()` 方法，自动补全公共字段
- ✅ 实现了 Session ID 和设备 ID 管理
- ✅ 在 App 启动时初始化埋点（`app/_layout.tsx`）
- ✅ 添加了调试模式（开发环境自动开启，控制台打印）

### 2. 已实现的埋点事件

#### App 启动 ✅
- **事件**: `app_launch`
- **位置**: `app/_layout.tsx`
- **字段**: `launch_type: 'cold'`

#### 登录流程 ✅
- **事件**: `page_view_login`
- **位置**: `app/(login)/login.tsx`
- **字段**: `mode`, `from_page`

- **事件**: `click_one_tap_login`
- **位置**: `app/(login)/login.tsx` - `startAuthorizationFlow`
- **字段**: `from_page`, `has_read_agreement`

- **事件**: `click_sms_login`
- **位置**: `app/(login)/login.tsx` - 跳转到 `/phone` 时
- **字段**: `from_page`

#### 聊天对话（核心）✅
- **事件**: `page_view_chat`
- **位置**: `app/(chat)/chat.tsx`
- **字段**: `bot_id`, `from_page`, `from_history_session`

- **事件**: `chat_message_send`
- **位置**: 
  - `app/(chat)/chat.tsx` - `handleSendMessage`（文本消息）
  - `components/chat/ChatInput.tsx` - `processAndUploadImage`（图片消息）
- **字段**: `bot_id`, `session_id`, `message_id`, `content_length`, `has_emoji`, `from_history_session`

- **事件**: `chat_reply_show`
- **位置**: 
  - `app/(chat)/chat.tsx` - `onComplete` 回调（文本消息回复）
  - `components/chat/ChatInput.tsx` - `onComplete` 回调（图片消息回复）
- **字段**: `bot_id`, `session_id`, `message_id`, `reply_length`

#### 问卷流程 ✅
- **事件**: `page_view_questionnaire`
- **位置**: `app/(questionnaire)/name.tsx`
- **字段**: `question_id`, `question_type`

- **事件**: `questionnaire_answer`
- **位置**: `app/(questionnaire)/name.tsx` - `handleNext`
- **字段**: `question_id`, `question_type`, `answer`

- **事件**: `questionnaire_submit`
- **位置**: `app/(questionnaire)/nest-role-type.tsx` - `handleSubmit`
- **字段**: `question_count`, `has_archetype`

#### 机器人创建 ✅
- **事件**: `bot_create_result`
- **位置**: `app/(questionnaire)/nest-role-type.tsx` - `handleSubmit`
- **字段**: `bot_id`, `result` (`success`/`failed`), `has_archetype`, `error_message` (失败时)

#### 机器人设定页 ✅
- **事件**: `page_view_customize`
- **位置**: `app/(customize)/customize.tsx` - `useFocusEffect`
- **字段**: `bot_id`

- **事件**: `bot_settings_update`
- **位置**: 
  - `app/(customize)/edit-nest-name.tsx` - `handleSave` (修改名字)
  - `app/(customize)/edit-nest-gender.tsx` - `handleSave` (修改性别)
  - `app/(customize)/text-editor.tsx` - `handleSave` (修改背景故事)
  - `app/(customize)/customize.tsx` - `handleRelationshipSelect` (修改关系)
- **字段**: `field`, `old_value`, `new_value`, `bot_id`

#### 设置页面 ✅
- **事件**: `page_view_settings`
- **位置**: `app/(settings)/settings.tsx`
- **字段**: 无

- **事件**: `user_info_update`
- **位置**: 
  - `app/(settings)/edit-gender.tsx` - `handleSave` (修改性别)
  - `app/(settings)/edit-username.tsx` - `handleModify` (修改用户名)
- **字段**: `field`, `old_value`, `new_value`

## ⏳ 待实现（可选）

### 1. 问卷其他题目
- ⏳ 其他问卷页面的曝光和作答埋点（gender, birthday, role, nest-gender, nest-expectation, experience）

### 2. 其他用户信息修改
- ⏳ `user_info_update` - 修改生日、手机号等

## 📝 使用示例

### 基本用法

```typescript
import { track } from '@/services/tracking';

// 页面曝光
track('page_view_login', {
  mode: 'login',
  from_page: 'splash',
}, {
  page_id: 'login_page',
});

// 按钮点击
track('click_one_tap_login', {
  from_page: 'login_page',
  has_read_agreement: true,
});

// 业务事件
track('chat_message_send', {
  bot_id: 'bot_123',
  session_id: 'session_456',
  message_id: 'msg_789',
  content_length: 50,
  has_emoji: false,
  from_history_session: false,
});
```

## 🔧 调试

开发环境下，所有埋点事件会自动在控制台打印，格式如下：

```
[Tracking] 埋点事件: {
  "event_id": "xxx",
  "event_name": "page_view_login",
  "event_time": 1234567890,
  "user_id": "user_123",
  "device_id": "device_456",
  "platform": "android",
  "app_version": "1.0.0",
  "session_id": "session_789",
  ...
}
```

## 📋 后续工作

1. **设备 ID 持久化**: 使用 AsyncStorage 持久化 device_id（当前使用内存存储）
2. **网络类型检测**: 安装 `expo-network` 包获取网络类型
3. **批量上报**: 实现埋点数据批量上报，减少网络请求
4. **上报接口**: 对接后端埋点接口或 Supabase events 表（当前已实现基础框架，只需配置接口地址）
5. **完成剩余埋点**: 问卷其他题目、其他用户信息修改等（可选）

## 📚 相关文档

- [埋点方案文档](./TRACKING_IMPLEMENTATION.md) - 详细实现指南
- [埋点方案说明](./埋点方案说明.md) - 原始需求文档（待创建）

