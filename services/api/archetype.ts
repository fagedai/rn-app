/**
 * 角色类型（Archetype）相关API接口
 */

import { fetchWithTimeout, getApiBaseUrl } from '@/utils/apiUtils';

const BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT = 5000; // 5秒超时

/**
 * 获取角色类型背景故事
 * 接口地址：/api/nest/archetype/backstory
 * Query 参数：archetypeText (string, 可选)
 * @returns 背景故事文本
 */
export async function getArchetypeBackstory(
  archetypeText: string,
  token?: string
): Promise<string> {
  if (!BASE_URL || BASE_URL === '') {
    console.log('后端未配置，返回空字符串');
    return '';
  }

  const url = `${BASE_URL}/nest/archetype/backstory?archetypeText=${encodeURIComponent(archetypeText)}`;

  console.log('[Archetype] 请求:', { url, archetypeText });

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithTimeout(
      url,
      {
        method: 'GET',
        headers,
      },
      REQUEST_TIMEOUT
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.log('[Archetype] 响应:', responseText);
      throw new Error(responseText || '获取背景故事失败，请稍后重试');
    }

    // 解析响应
    let responseData: { code?: number; message?: string; data?: string } | null = null;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // 如果不是 JSON 格式，直接返回响应文本
      return responseText;
    }

    // 检查后端返回的 code 字段
    if (responseData && responseData.code !== undefined && responseData.code !== 200) {
      const errorMessage = responseData.message || responseText || '获取背景故事失败，请稍后重试';
      throw new Error(errorMessage);
    }

    // 提取背景故事（从 data 字段中，如果没有 data 字段则使用整个响应）
    const backstory = responseData?.data || responseText;
    console.log('[Archetype] 响应:', backstory);

    return backstory;
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
    throw error;
  }
}

