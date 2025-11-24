/**
 * 历史聊天记录相关API接口
 */

import { fetchWithTimeout, getApiBaseUrl } from '@/utils/apiUtils';

const BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT = 10000; // 10秒超时

/**
 * 历史记录项（前端使用格式）
 */
export interface HistoryRecord {
  conversationId: string; // 会话ID
  title: string; // 会话标题
  summary: string; // 会话描述
  lastMessageTime: number; // 最近消息时间戳（毫秒）
}

/**
 * 获取历史记录列表响应
 */
export interface GetHistoryListResponse {
  records: HistoryRecord[];
  total: number;
}

/**
 * 后端返回的历史记录项格式
 */
interface BackendHistoryRecord {
  conversationId: string;
  conversation_title: string;
  conversation_desc: string;
  last_message_time: string; // ISO 8601 格式字符串
}

/**
 * 获取历史记录列表
 * 接口：GET /api/conversations/history
 * 请求头：Authorization: Bearer {token}
 * @param token 认证token
 */
export async function getHistoryList(token: string): Promise<GetHistoryListResponse> {
  const url = `${BASE_URL}/conversations/history`;

  console.log('[History] 请求:', { url });

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
      REQUEST_TIMEOUT
    );

    const responseText = await response.text();

    // 解析响应，检查 code 字段
    let responseData: { code?: number; message?: string; data?: BackendHistoryRecord[] } | null = null;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // 如果不是 JSON 格式，检查 HTTP 状态码
      if (!response.ok) {
        console.log('[History] 响应:', { status: response.status, body: responseText });
        throw new Error(responseText || '获取历史记录失败');
      }
      console.log('[History] 响应: 非JSON格式', { status: response.status, body: responseText });
      // 返回空列表
      return { records: [], total: 0 };
    }

    // 检查后端返回的 code 字段（code: 0 或 code: 200 表示成功）
    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      // 兼容两种成功码：0 或 200
      const isSuccess = responseData.code === 0 || responseData.code === 200;
      if (!isSuccess) {
        const errorMessage = responseData.message || responseText || '获取历史记录失败';
        console.log('[History] 响应错误:', { status: response.status, body: responseText, code: responseData.code });
        throw new Error(errorMessage);
      }

      // 从 data 字段中提取 records 并映射字段
      if (responseData.data && Array.isArray(responseData.data)) {
        const records: HistoryRecord[] = responseData.data.map((item) => ({
          conversationId: item.conversationId,
          title: item.conversation_title || '',
          summary: item.conversation_desc || '',
          lastMessageTime: new Date(item.last_message_time).getTime(), // 转换为时间戳（毫秒）
        }));

        console.log('[History] 响应:', { records, total: records.length });
        return { records, total: records.length };
      }
    }

    // 默认返回空列表
    console.log('[History] 响应: 格式不符合预期，返回空列表', responseData);
    return { records: [], total: 0 };
  } catch (error) {
    if (error instanceof Error) {
      // 网络错误处理
      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('NetworkError') ||
        error.message.includes('status provided (0)')
      ) {
        throw new Error('网络连接失败，请检查网络设置后重试');
      }
    }
    console.log('[History] 响应失败:', error);
    throw error;
  }
}

/**
 * 历史消息项（后端返回格式）
 */
interface BackendHistoryMessage {
  turn_id: string;
  conversation_id: string;
  user_message: string;
  agent_message: string;
  created_at: string;
}

/**
 * 历史消息项（前端使用格式）
 */
export interface HistoryMessage {
  session_id: string;
  userMessage: string;
  agentMessage: string;
}

/**
 * 获取历史记录详细对话
 * 接口：GET /api/conversations/{conversationId}/messages
 * 请求头：Authorization: Bearer {token}
 * @param conversationId 会话ID
 * @param token 认证token
 */
export async function getHistoryMessages(
  conversationId: string,
  token: string
): Promise<HistoryMessage | null> {
  const url = `${BASE_URL}/conversations/${encodeURIComponent(conversationId)}/messages`;

  console.log('[History] 请求:', { url, conversationId });

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
      REQUEST_TIMEOUT
    );

    const responseText = await response.text();

    // 解析响应，检查 code 字段
    let responseData: { code?: number; message?: string; data?: BackendHistoryMessage[] } | null = null;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // 如果不是 JSON 格式，检查 HTTP 状态码
      if (!response.ok) {
        console.log('[History] 响应:', { status: response.status, body: responseText });
        throw new Error(responseText || '获取历史消息失败');
      }
      console.log('[History] 响应: 非JSON格式', { status: response.status, body: responseText });
      return null;
    }

    // 检查后端返回的 code 字段（code: 0 或 code: 200 表示成功）
    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      // 兼容两种成功码：0 或 200
      const isSuccess = responseData.code === 0 || responseData.code === 200;
      if (!isSuccess) {
        const errorMessage = responseData.message || responseText || '获取历史消息失败';
        console.log('[History] 响应错误:', { status: response.status, body: responseText, code: responseData.code });
        throw new Error(errorMessage);
      }

      // 从 data 字段中提取消息（data 数组应该只有一个对象）
      if (responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
        const item = responseData.data[0]; // 取第一个对象
        const historyMessage: HistoryMessage = {
          session_id: item.conversation_id,
          userMessage: item.user_message || '',
          agentMessage: item.agent_message || '',
        };

        console.log('[History] 响应:', historyMessage);
        return historyMessage;
      }
    }

    // 如果没有数据，返回 null
    console.log('[History] 响应: 数据为空', responseData);
    return null;
  } catch (error) {
    if (error instanceof Error) {
      // 网络错误处理
      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('NetworkError') ||
        error.message.includes('status provided (0)')
      ) {
        throw new Error('网络连接失败，请检查网络设置后重试');
      }
    }
    console.log('[History] 响应失败:', error);
    throw error;
  }
}
