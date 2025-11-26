# 埋点功能实现指南

本文档说明如何在 NEST-AI 项目中实现埋点功能。

## 一、已完成的准备工作

### 1. 埋点服务框架
- ✅ 创建了 `services/tracking/index.ts` 统一埋点服务
- ✅ 实现了 `track()` 方法，自动补全公共字段
- ✅ 实现了 Session ID 和设备 ID 管理
- ✅ 在 App 启动时初始化埋点（`app/_layout.tsx`）
- ✅ 添加了调试模式（开发环境自动开启）

### 2. 公共字段自动补全
埋点服务会自动补全以下公共字段：
- `event_id`: 事件唯一 ID（UUID）
- `event_time`: 事件发生时间（毫秒时间戳）
- `device_id`: 设备 ID（首次生成后持久化）
- `platform`: ios / android
- `app_version`: App 版本号
- `os_version`: 系统版本
- `session_id`: App 会话 ID
- `user_id`: 用户 ID（从 userStore 自动获取）

## 二、需要逐步添加的埋点事件

### 2.1 App 启动 ✅
- **位置**: `app/_layout.tsx`
- **状态**: 已实现
- **事件**: `app_launch`

### 2.2 登录流程

#### 2.2.1 登录页曝光
- **位置**: `app/(login)/login.tsx`
- **事件**: `page_view_login`
- **需要添加**: 在组件首次渲染时调用

#### 2.2.2 点击一键登录
- **位置**: `app/(login)/login.tsx` - `handleOneTapLogin` 函数
- **事件**: `click_one_tap_login`
- **需要添加**: 在按钮点击时调用

#### 2.2.3 点击短信登录
- **位置**: `app/(login)/login.tsx` - 跳转到 `/phone` 时
- **事件**: `click_sms_login`
- **需要添加**: 在路由跳转时调用

### 2.3 问卷流程

#### 2.3.1 问卷页曝光
- **位置**: `app/(questionnaire)/` 各问卷页面
- **事件**: `page_view_questionnaire`
- **需要添加**: 在问卷第一页渲染时调用

#### 2.3.2 单题目曝光
- **位置**: 各问卷页面组件
- **事件**: `question_view`
- **需要添加**: 在题目显示时调用

#### 2.3.3 单题目作答
- **位置**: 各问卷页面 - 点击"下一步"时
- **事件**: `question_answer`
- **需要添加**: 在提交答案时调用

### 2.4 机器人创建

#### 2.4.1 机器人设定页曝光
- **位置**: `app/(customize)/customize.tsx`
- **事件**: `page_view_bot_setup`
- **需要添加**: 在页面渲染时调用

#### 2.4.2 点击创建/保存机器人
- **位置**: `app/(customize)/customize.tsx` - 保存操作
- **事件**: `click_bot_create`
- **需要添加**: 在保存按钮点击时调用

### 2.5 聊天对话（核心）

#### 2.5.1 聊天页曝光
- **位置**: `app/(chat)/chat.tsx`
- **事件**: `page_view_chat`
- **需要添加**: 在聊天页面渲染时调用

#### 2.5.2 用户发送消息
- **位置**: `components/chat/ChatInput.tsx` - `onSend` 或 `processAndUploadImage`
- **事件**: `chat_message_send`
- **需要添加**: 在消息发送时调用

#### 2.5.3 回复展示完成
- **位置**: `app/(chat)/chat.tsx` - 流式响应完成时
- **事件**: `chat_reply_show`
- **需要添加**: 在回复内容完全展示时调用

### 2.6 设置页面

#### 2.6.1 设置页曝光
- **位置**: `app/(settings)/settings.tsx`
- **事件**: `page_view_settings`
- **需要添加**: 在页面渲染时调用

#### 2.6.2 用户信息修改
- **位置**: 各设置编辑页面（`edit-username.tsx`, `edit-gender.tsx` 等）
- **事件**: `user_profile_edit`
- **需要添加**: 在保存修改时调用

## 三、使用方法

### 3.1 基本用法

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

### 3.2 调试模式

开发环境下，埋点事件会自动在控制台打印，格式如下：

```
[Tracking] 埋点事件: {
  "event_id": "xxx",
  "event_name": "page_view_login",
  "event_time": 1234567890,
  "user_id": "user_123",
  "device_id": "device_456",
  "platform": "android",
  "app_version": "1.0.0",
  ...
}
```

## 四、实现步骤

### 阶段 1: 核心流程埋点（优先）
1. ✅ App 启动
2. ⏳ 登录页曝光
3. ⏳ 点击一键登录
4. ⏳ 聊天页曝光
5. ⏳ 发送消息
6. ⏳ 回复展示

### 阶段 2: 问卷流程埋点
1. ⏳ 问卷页曝光
2. ⏳ 题目曝光和作答

### 阶段 3: 机器人创建埋点
1. ⏳ 机器人设定页曝光
2. ⏳ 创建/保存机器人

### 阶段 4: 设置页面埋点
1. ⏳ 设置页曝光
2. ⏳ 用户信息修改

## 五、注意事项

1. **埋点失败不影响主流程**: 所有埋点调用都是异步的，失败不会影响业务逻辑
2. **性能考虑**: 埋点上报是异步的，不会阻塞 UI
3. **调试模式**: 开发环境下会自动打印埋点内容，方便测试验证
4. **数据上报**: 当前版本只在控制台打印，实际上报逻辑需要后续实现（后端接口或 Supabase）

## 六、后续工作

1. **设备 ID 持久化**: 使用 AsyncStorage 持久化 device_id
2. **网络类型检测**: 安装 `expo-network` 包获取网络类型
3. **批量上报**: 实现埋点数据批量上报，减少网络请求
4. **上报接口**: 对接后端埋点接口或 Supabase events 表
5. **错误重试**: 实现埋点失败重试机制

