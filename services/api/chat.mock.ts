/**
 * 聊天API模拟服务（用于开发测试，无后端时使用）
 */

import { SendMessagePayload, GetMessagesResponse } from './chat';
import { generateUUID } from '@/utils/uuid';

// 模拟延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 模拟的回复内容
const mockResponses = [
  '你好！很高兴见到你~',
  '我理解你的感受。',
  '这听起来很有趣！',
  '能告诉我更多吗？',
  '我在这里陪伴你。',
  '让我们一起探索这个话题吧。',
  '你的想法很有价值。',
  '我完全理解你的意思。',
];

let mockSessionId: string | null = null;
let mockAgentId = 'mock-agent-123';
let mockMessages: Array<{
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  server_ts: number;
}> = [];

/**
 * 模拟流式发送消息
 */
export async function sendMessageStreamMock(
  payload: SendMessagePayload & { token?: string },
  onChunk: (chunk: string) => void,
  onComplete: (conversationId: string | null) => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    // 模拟网络延迟
    await delay(500);

    // 生成新的 conversationId（如果第一次调用）
    let mockConversationId = payload.conversationId || null;
    if (!mockConversationId) {
      mockConversationId = `conv-${generateUUID()}`;
    }

    // 生成机器人回复
    const responseText = mockResponses[Math.floor(Math.random() * mockResponses.length)] || '我明白了。';

    // 模拟流式输出（逐字显示）
    const words = responseText.split('');

    for (let i = 0; i < words.length; i++) {
      await delay(50); // 每个字符间隔50ms
      onChunk(words[i]);
    }

    // 完成
    await delay(200);
    onComplete(mockConversationId);
  } catch (error) {
    onError(error instanceof Error ? error : new Error('模拟发送失败'));
  }
}

/**
 * 模拟获取历史消息
 */
export async function getMessagesMock(
  sessionId: string,
  page: number = 1,
  pageSize: number = 30
): Promise<GetMessagesResponse> {
  await delay(300);

  // 只返回当前session的消息
  const sessionMessages = mockMessages.filter((msg) => {
    // 这里简化处理，实际应该根据session_id过滤
    return true;
  });

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMessages = sessionMessages.slice(startIndex, endIndex);

  return {
    messages: paginatedMessages,
    has_more: endIndex < sessionMessages.length,
    page,
    page_size: pageSize,
  };
}


