/**
 * AI设置相关API接口
 * 接口：/api/agent/profile/nest - AI角色设定
 */

import { fetchWithTimeout, getApiBaseUrl } from '@/utils/apiUtils';

const BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT = 30000; // 30秒超时

/**
 * 保存AI关系
 * 接口：PUT /api/agent/profile/nest
 * Header：Authorization: Bearer {token}
 * Body：{ userId: string | number, nestRelationship: string }
 */
export async function saveAiRelationship(aiRelationship: string, userId: string | number, token: string): Promise<void> {
  if (!BASE_URL || BASE_URL === '') {
    console.log('后端未配置，仅更新本地 store');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }

  const url = `${BASE_URL}/agent/profile/nest`;
  
  const requestBody = { userId, nestRelationship: aiRelationship };
  console.log('[AISettings] 请求:', { url, body: requestBody });
  
  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      },
      REQUEST_TIMEOUT
    );

    const responseText = await response.text();

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return;
      }
      console.log('[AISettings] 响应:', responseText);
      throw new Error(responseText || '保存失败，请稍后重试');
    }

    console.log('[AISettings] 响应:', responseText);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('Unexpected character')
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return;
      }
    }
    throw error;
  }
}

/**
 * 保存AI设置（通用函数，只传变化的参数）
 * 接口：PUT /api/agent/profile/nest
 * Header：Authorization: Bearer {token}
 * Body：只包含变化的字段 { userId: string, nestName?: string, nestGender?: number, nestRelationship?: string, nestBackstory?: string }
 */
export interface SaveAiSettingsParams {
  userId: string | number;
  nestName?: string;
  nestGender?: 1 | 2 | 3; // 前端格式：1=男, 2=女, 3=不愿意透露
  nestRelationship?: string;
  nestBackstory?: string; // AI背景故事
}

export async function saveAiSettings(params: SaveAiSettingsParams, token: string): Promise<void> {
  if (!BASE_URL || BASE_URL === '') {
    console.log('后端未配置，仅更新本地 store');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }

  const url = `${BASE_URL}/agent/profile/nest`;
  
  // 构建请求体，只包含提供的字段
  const requestBody: Record<string, any> = { userId: params.userId };
  
  if (params.nestName !== undefined) {
    requestBody.nestName = params.nestName;
  }
  
  if (params.nestGender !== undefined) {
    // 前端格式和后端格式一致：1=男, 2=女, 3=不愿意透露
    requestBody.nestGender = params.nestGender;
  }
  
  if (params.nestRelationship !== undefined) {
    requestBody.nestRelationship = params.nestRelationship;
  }
  
  if (params.nestBackstory !== undefined) {
    requestBody.nestBackstory = params.nestBackstory;
  }
  
  console.log('[AISettings] 请求:', { url, body: requestBody });
  
  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      },
      REQUEST_TIMEOUT
    );

    const responseText = await response.text();

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('保存失败，请稍后重试');
      }
      console.log('[AISettings] 响应:', responseText);
      throw new Error(responseText || '保存失败，请稍后重试');
    }

    console.log('[AISettings] 响应:', responseText);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('Unexpected character')
      ) {
        throw new Error('网络连接失败，请检查网络设置后重试');
      }
    }
    throw error;
  }
}

/**
 * 保存AI名字
 * 接口：PUT /api/agent/profile/nest
 * Header：Authorization: Bearer {token}
 * Body：{ userId: string | number, nestName: string }
 */
export async function savenestName(nestName: string, userId: string | number, token: string): Promise<void> {
  if (!BASE_URL || BASE_URL === '') {
    console.log('后端未配置，仅更新本地 store');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }

  const url = `${BASE_URL}/agent/profile/nest`;
  
  const requestBody = { userId, nestName: nestName };
  console.log('[AISettings] 请求:', { url, body: requestBody });
  
  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      },
      REQUEST_TIMEOUT
    );

    const responseText = await response.text();

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log('[AISettings] 响应:', { status: response.status, body: 'Non-JSON response' });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return;
      }
      console.log('[AISettings] 响应:', { status: response.status, body: responseText });
      throw new Error(responseText || '保存失败，请稍后重试');
    }

    console.log('[AISettings] 响应:', { status: response.status, body: responseText });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('Unexpected character')
      ) {
        console.log('[AISettings] 响应失败:', error.message);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return;
      }
    }
    throw error;
  }
}

/**
 * 获取AI基本设置信息
 * 接口：GET /api/agent/profile/nestInfo
 * Header：Authorization: Bearer {token}
 * @returns AI基本设置信息
 */
export interface NestInfoResponse {
  profile_id: string;
  nest_name: string | null;
  nest_relationship: string | null;
  nest_last_memory: string | null;
  nest_backstory: string | null;
}

export async function getNestInfo(token: string): Promise<NestInfoResponse> {
  if (!BASE_URL || BASE_URL === '') {
    console.log('后端未配置，返回空数据');
    throw new Error('后端未配置');
  }

  const url = `${BASE_URL}/agent/profile/nestInfo`;
  console.log('[AISettings] 请求:', { url });

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

    // 解析响应
    let responseData: { code: number; message?: string; data?: NestInfoResponse } | null = null;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      if (!response.ok) {
        console.log('[AISettings] 响应:', responseText);
        throw new Error(responseText || '获取AI设置信息失败');
      }
      throw new Error('获取AI设置信息失败：响应格式错误');
    }

    // 检查后端返回的 code 字段
    if (!responseData || responseData.code !== 200) {
      const errorMessage = responseData?.message || responseText || '获取AI设置信息失败';
      throw new Error(errorMessage);
    }

    if (!responseData.data) {
      throw new Error('获取AI设置信息失败：数据为空');
    }

    console.log('[AISettings] 响应:', responseData.data);
    return responseData.data;
  } catch (error) {
    if (error instanceof Error) {
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

