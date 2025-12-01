import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage 存储键名
const STORAGE_KEY = 'chat_store';

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
  initializeFromStorage: () => Promise<void>; // 从持久化存储恢复
  saveToStorageImmediate: () => void; // 立即保存到持久化存储（用于APP进入后台时）
}

// 保存到持久化存储（防抖）
let saveTimeout: NodeJS.Timeout | null = null;
const saveToStorage = (get: () => ChatState, immediate = false) => {
  if (saveTimeout && !immediate) {
    clearTimeout(saveTimeout);
  }
  
  const performSave = async () => {
    try {
      const state = get();
      const dataToSave = {
        currentSessionId: state.currentSessionId,
        currentAgentId: state.currentAgentId,
        conversationId: state.conversationId,
        messages: state.messages,
        sessions: state.sessions,
        isFromHistory: state.isFromHistory,
        greetingMessage: state.greetingMessage,
        pagination: state.pagination,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('[ChatStore] 聊天数据已保存到持久化存储');
    } catch (error) {
      console.error('[ChatStore] 保存到持久化存储失败:', error);
    }
  };

  if (immediate) {
    // 立即保存（用于APP进入后台时）
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    performSave();
  } else {
    // 防抖保存（正常情况）
    saveTimeout = setTimeout(performSave, 1000); // 1秒防抖，因为聊天数据可能较大
  }
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
  
  setCurrentSession: (sessionId, agentId) => {
    set({
      currentSessionId: sessionId,
      currentAgentId: agentId,
    });
    saveToStorage(get);
  },
  
  setConversationId: (conversationId) => {
    set({ conversationId });
    saveToStorage(get);
  },
  
  setFromHistory: (isFromHistory) => {
    set({ isFromHistory });
    saveToStorage(get);
  },
  
  setGreetingMessage: (message) => {
    set({ greetingMessage: message });
    saveToStorage(get);
  },
  
  addMessage: (sessionId, message) => {
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
    });
    saveToStorage(get);
  },
  
  updateMessage: (sessionId, messageId, updates) => {
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
    });
    saveToStorage(get);
  },
  
  setMessages: (sessionId, messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: messages,
      },
    }));
    saveToStorage(get);
  },
  
  appendMessages: (sessionId, messages) => {
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
    });
    saveToStorage(get);
  },
  
  addSession: (session) => {
    set((state) => {
      const exists = state.sessions.some((s) => s.session_id === session.session_id);
      if (exists) {
        return state;
      }
      return {
        sessions: [session, ...state.sessions],
      };
    });
    saveToStorage(get);
  },
  
  updateSession: (sessionId, updates) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.session_id === sessionId ? { ...s, ...updates } : s
      ),
    }));
    saveToStorage(get);
  },
  
  setStreamingMessageId: (messageId) =>
    set({ streamingMessageId: messageId }),
  
  setPagination: (sessionId, pagination) => {
    set((state) => ({
      pagination: {
        ...state.pagination,
        [sessionId]: pagination,
      },
    }));
    saveToStorage(get);
  },
  
  resetChat: async () => {
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
    });
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('[ChatStore] 已清除所有聊天数据');
  },
  initializeFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          currentSessionId: parsed.currentSessionId || null,
          currentAgentId: parsed.currentAgentId || null,
          conversationId: parsed.conversationId || null,
          messages: parsed.messages || {},
          sessions: parsed.sessions || [],
          isFromHistory: parsed.isFromHistory || false,
          greetingMessage: parsed.greetingMessage || null,
          streamingMessageId: null, // 不恢复流式状态
          pagination: parsed.pagination || {},
        });
        console.log('[ChatStore] 从持久化存储恢复数据:', {
          hasMessages: Object.keys(parsed.messages || {}).length > 0,
          currentSessionId: parsed.currentSessionId,
          sessionsCount: (parsed.sessions || []).length,
        });
      }
    } catch (error) {
      console.error('[ChatStore] 从持久化存储恢复失败:', error);
    }
  },
  saveToStorageImmediate: () => {
    saveToStorage(get, true);
  },
}));

