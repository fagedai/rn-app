/**
 * API 工具函数
 * 提供通用的 API 请求和错误处理逻辑
 */

const REQUEST_TIMEOUT = 30000; // 30秒超时

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
}

/**
 * 带超时的 fetch 请求
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接后重试');
      }
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('Network request failed') ||
          error.message.includes('NetworkError')) {
        throw new Error('网络连接失败，请检查网络设置后重试');
      }
    }
    
    throw error;
  }
}

/**
 * 处理 API 响应错误
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    // 网络错误处理
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('Network request failed') ||
        error.message.includes('NetworkError') ||
        error.message.includes('status provided (0)') ||
        error.message.includes('请求超时')) {
      return '网络连接失败，请检查网络设置后重试';
    }
    return error.message || '操作失败，请稍后重试';
  }
  return '操作失败，请稍后重试';
}

/**
 * 获取 API 基地址
 */
export function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://8.166.129.71:18081/api';
}

