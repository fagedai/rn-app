/**
 * 聊天相关API接口
 */

import { fetchWithTimeout, getApiBaseUrl } from '@/utils/apiUtils';

const BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT = 30000; // 30秒超时（流式请求）

// 开发模式：使用模拟API（当没有后端时）
const USE_MOCK_API = !BASE_URL || BASE_URL === '' || process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';

/**
 * 发送消息请求载荷（新接口格式）
 */
export interface SendMessagePayload {
  userId: string; // 用户ID
  prompt?: string; // 用户发送的消息（文本消息时使用）
  imageUrl?: string; // 用户发送的图片URL（图片消息时使用）
  conversationId?: string; // 对话ID，新会话为空，后续携带以保持上下文
}

/**
 * 发送消息响应（新接口格式）
 */
export interface SendMessageResponse {
  conversationId?: string; // 对话ID（第一轮对话后返回，后续需携带）
  message?: string; // AI回复内容
  [key: string]: unknown; // 其他可能的响应字段
}

/**
 * 流式发送消息（返回ReadableStream）
 * 接口：/api/agent/invoke
 * Header：Authorization: Bearer {token}
 * Body：{ userId, prompt?, imageUrl?, conversationId? }
 */
export async function sendMessageStream(
  payload: SendMessagePayload & { token: string }, // 需要传递 token
  onChunk: (chunk: string) => void,
  onComplete: (conversationId: string | null) => void,
  onError: (error: Error) => void
): Promise<void> {
  // 开发模式：使用模拟API
  if (USE_MOCK_API) {
    const { sendMessageStreamMock } = await import('./chat.mock');
    return sendMessageStreamMock(payload, onChunk, onComplete, onError);
  }

  const url = `${BASE_URL}/agent/invoke`;

  // 构建请求体：发送图片时只带 imageUrl，发送消息时只带 prompt
  const requestBody: Record<string, string> = {
    userId: payload.userId,
  };
  
  if (payload.prompt) {
    requestBody.prompt = payload.prompt;
  }
  
  if (payload.imageUrl) {
    requestBody.imageUrl = payload.imageUrl;
  }
  
  if (payload.conversationId) {
    requestBody.conversationId = payload.conversationId;
  } else {
    requestBody.conversationId = ''; // 新会话，传空字符串
  }

  console.log('[Chat] 请求:', { url, body: requestBody });

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${payload.token}`,
        },
        body: JSON.stringify(requestBody),
      },
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      const text = await response.text();
      console.log('[Chat] 响应:', { status: response.status, body: text });
      throw new Error(text || '发送消息失败，请稍后重试');
    }

    // 检查响应类型和响应体
    const contentType = response.headers.get('content-type') || '';
    const isStreaming = contentType.includes('text/event-stream') || contentType.includes('text/plain');
    
    console.log('[Chat] 响应:', { 
      status: response.status, 
      contentType,
      hasBody: !!response.body,
      isStreaming,
    });

    // 如果响应体为空，尝试读取文本响应（可能是非流式响应）
    if (!response.body) {
      console.log('[Chat] 响应体为空，尝试读取文本响应');
      try {
        // 克隆响应以便读取文本（如果支持）
        // 注意：在 React Native 中，response.clone() 可能不可用
        // 所以直接尝试读取文本
        const text = await response.text();
        console.log('[Chat] 文本响应:', text);
        
        if (text && text.trim()) {
          // 尝试解析为 JSON
          try {
            const responseData = JSON.parse(text);
            console.log('[Chat] 响应 (JSON):', responseData);
            
            // 检查响应 code 是否为 200
            if (responseData.code !== 200) {
              const errorMsg = responseData.message || '发送消息失败，请稍后重试';
              throw new Error(errorMsg);
            }
            
            // 从 data.reply 提取回复内容（实际响应格式）
            const replyMessage = responseData.data?.reply || '';
            
            // 处理非流式响应：逐字符发送，模拟流式效果
            if (replyMessage) {
              for (let i = 0; i < replyMessage.length; i++) {
                onChunk(replyMessage[i]);
                await new Promise(resolve => setTimeout(resolve, 10));
              }
            }
            
            // 从 data.conversationId 提取对话ID
            const convId = responseData.data?.conversationId || null;
            onComplete(convId);
            return;
          } catch (e) {
            // 不是 JSON，直接作为文本发送
            console.log('[Chat] 非 JSON 响应，作为文本处理');
            for (let i = 0; i < text.length; i++) {
              onChunk(text[i]);
              await new Promise(resolve => setTimeout(resolve, 10));
            }
            onComplete(null);
            return;
          }
        } else {
          console.log('[Chat] 响应文本为空');
          throw new Error('响应体为空');
        }
      } catch (e) {
        console.log('[Chat] 读取文本响应失败:', e);
        if (e instanceof Error && e.message.includes('响应体为空')) {
          throw e;
        }
        throw new Error('响应体为空');
      }
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let conversationId: string | null = null;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('[Chat] 流式响应完成:', { conversationId });
        onComplete(conversationId);
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          // 解析SSE格式：data: {...}
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            // 处理标准响应格式：{ code, message, data: { reply, conversationId } }
            if (data.code === 200 && data.data?.reply) {
              // 逐字符发送回复内容
              const reply = data.data.reply;
              for (let i = 0; i < reply.length; i++) {
                onChunk(reply[i]);
              }
              
              // 保存 conversationId
              if (data.data.conversationId) {
                conversationId = data.data.conversationId;
              }
            }
            // 处理流式数据块（兼容其他格式）
            else if (data.content || data.chunk || data.text) {
              const chunk = data.content || data.chunk || data.text || '';
              onChunk(chunk);
            }
            
            // 处理 conversationId（其他格式）
            if (data.conversationId) {
              conversationId = data.conversationId;
            }
            
            // 处理完成信号
            if (data.type === 'complete' || data.done || data.finish_reason) {
              if (data.conversationId || data.data?.conversationId) {
                conversationId = data.conversationId || data.data.conversationId;
              }
            }
            
            // 处理错误
            if (data.type === 'error' || data.error || data.code !== 200) {
              const errorMsg = data.message || data.error || '流式接收错误';
              throw new Error(errorMsg);
            }
          }
          // 如果不是 SSE 格式，尝试直接解析为 JSON
          else {
            try {
              const data = JSON.parse(line);
              if (data.code === 200 && data.data?.reply) {
                // 逐字符发送回复内容
                const reply = data.data.reply;
                for (let i = 0; i < reply.length; i++) {
                  onChunk(reply[i]);
                }
                
                // 保存 conversationId
                if (data.data.conversationId) {
                  conversationId = data.data.conversationId;
                }
              }
            } catch (e) {
              // 忽略解析错误，可能是其他格式的数据
            }
          }
        } catch (e) {
          console.error('解析流式数据错误:', e);
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error('未知错误'));
  }
}



