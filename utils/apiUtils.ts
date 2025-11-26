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
 * 优先级：
 * 1. 环境变量 EXPO_PUBLIC_API_BASE_URL（开发环境）
 * 2. app.json 中的 extra.api.baseUrl（生产环境）
 * 3. 硬编码的默认值（兜底）
 */
export function getApiBaseUrl(): string {
  // 优先使用环境变量（开发环境）
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl;
  }
  
  // 尝试从 app.json 的 extra 配置中获取（生产环境）
  try {
    const Constants = require('expo-constants');
    const extra = Constants.expoConfig?.extra as { api?: { baseUrl?: string } } | undefined;
    if (extra?.api?.baseUrl && extra.api.baseUrl.trim() !== '') {
      return extra.api.baseUrl;
    }
  } catch (error) {
    // 忽略错误，继续使用默认值
  }
  
  // 兜底：使用硬编码的API地址
  return 'http://8.166.129.71:18081/api';
}

