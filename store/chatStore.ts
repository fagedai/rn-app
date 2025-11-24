import { create } from 'zustand';
import { generateUUID } from '@/utils/uuid';

/**
 * 消息类型
 */
export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'sending' | 'sent' | 'failed' | 'streaming';

export interface Message {
  message_id: string; // 客户端生成的UUID
  session_id: string | null;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  client_ts: number; // 客户端时间戳
  server_ts?: number; // 服务器时间戳
  created_at?: string; // UTC时间
  // 图片消息相关字段
  imageUrl?: string; // 图片 URL（上传成功后）
  thumbnailUrl?: string; // 缩略图 URL
  uploadProgress?: number; // 上传进度 0-100
  localImageUri?: string; // 本地图片 URI（上传前显示）
}

/**
 * 会话信息
 */
export interface Session {
  session_id: string;
  agent_id: string;
  last_message?: string;
  updated_at?: string;
  created_at?: string;
}

/**
 * 聊天状态
 */
interface ChatState {
  // 当前会话
  currentSessionId: string | null;
  currentAgentId: string | null;
  
  // 对话ID（用于保持上下文）
  conversationId: string | null;
  
  // 消息列表（按session_id分组）
  messages: Record<string, Message[]>;
  
  // 会话列表
  sessions: Session[];
  
  // 是否从历史记录进入
  isFromHistory: boolean;
  
  // 问候语（不入库）
  greetingMessage: string | null;
  
  // 流式接收中的消息ID
  streamingMessageId: string | null;
  
  // 分页状态
  pagination: Record<string, {
    page: number;
    hasMore: boolean;
    loading: boolean;
  }>;
  
  // Actions
  setCurrentSession: (sessionId: string | null, agentId: string | null) => void;
  setConversationId: (conversationId: string | null) => void;
  setFromHistory: (isFromHistory: boolean) => void;
  setGreetingMessage: (message: string | null) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void;
  setMessages: (sessionId: string, messages: Message[]) => void;
  appendMessages: (sessionId: string, messages: Message[]) => void;
  addSession: (session: Session) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  setStreamingMessageId: (messageId: string | null) => void;
  setPagination: (sessionId: string, pagination: { page: number; hasMore: boolean; loading: boolean }) => void;
  resetChat: () => void;
}

const initialPagination = {
  page: 1,
  hasMore: true,
  loading: false,
};

export const useChatStore = create<ChatState>((set, get) => ({
  currentSessionId: null,
  currentAgentId: null,
  conversationId: null,
  messages: {},
  sessions: [],
  isFromHistory: false,
  greetingMessage: null,
  streamingMessageId: null,
  pagination: {},
  
  setCurrentSession: (sessionId, agentId) =>
    set({
      currentSessionId: sessionId,
      currentAgentId: agentId,
    }),
  
  setConversationId: (conversationId) =>
    set({ conversationId }),
  
  setFromHistory: (isFromHistory) =>
    set({ isFromHistory }),
  
  setGreetingMessage: (message) =>
    set({ greetingMessage: message }),
  
  addMessage: (sessionId, message) =>
    set((state) => {
      const sessionMessages = state.messages[sessionId] || [];
      // 检查是否已存在（去重）
      const exists = sessionMessages.some((m) => m.message_id === message.message_id);
      if (exists) {
        return state;
      }
      return {
        messages: {
          ...state.messages,
          [sessionId]: [...sessionMessages, message],
        },
      };
    }),
  
  updateMessage: (sessionId, messageId, updates) =>
    set((state) => {
      const sessionMessages = state.messages[sessionId] || [];
      return {
        messages: {
          ...state.messages,
          [sessionId]: sessionMessages.map((msg) =>
            msg.message_id === messageId ? { ...msg, ...updates } : msg
          ),
        },
      };
    }),
  
  setMessages: (sessionId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: messages,
      },
    })),
  
  appendMessages: (sessionId, messages) =>
    set((state) => {
      const existingMessages = state.messages[sessionId] || [];
      // 去重
      const newMessages = messages.filter(
        (msg) => !existingMessages.some((m) => m.message_id === msg.message_id)
      );
      return {
        messages: {
          ...state.messages,
          [sessionId]: [...newMessages, ...existingMessages],
        },
      };
    }),
  
  addSession: (session) =>
    set((state) => {
      const exists = state.sessions.some((s) => s.session_id === session.session_id);
      if (exists) {
        return state;
      }
      return {
        sessions: [session, ...state.sessions],
      };
    }),
  
  updateSession: (sessionId, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.session_id === sessionId ? { ...s, ...updates } : s
      ),
    })),
  
  setStreamingMessageId: (messageId) =>
    set({ streamingMessageId: messageId }),
  
  setPagination: (sessionId, pagination) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        [sessionId]: pagination,
      },
    })),
  
  resetChat: () =>
    set({
      currentSessionId: null,
      currentAgentId: null,
      conversationId: null,
      messages: {},
      sessions: [],
      isFromHistory: false,
      greetingMessage: null,
      streamingMessageId: null,
      pagination: {},
    }),
}));

