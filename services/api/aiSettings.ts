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
 * Body：{ aiRelationship: string }
 */
export async function saveAiRelationship(aiRelationship: string, token: string): Promise<void> {
  if (!BASE_URL || BASE_URL === '') {
    console.log('后端未配置，仅更新本地 store');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }

  const url = `${BASE_URL}/agent/profile/nest`;
  
  const requestBody = { aiRelationship };
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
 * 保存AI设置（通用函数，只传变化的参数）
 * 接口：PUT /api/agent/profile/nest
 * Header：Authorization: Bearer {token}
 * Body：只包含变化的字段 { userId: string, aiName?: string, aiGender?: number, aiRelationship?: string }
 */
export interface SaveAiSettingsParams {
  userId: string | number;
  aiName?: string;
  aiGender?: 1 | 2 | 3; // 前端格式：1=男, 2=女, 3=不愿意透露
  aiRelationship?: string;
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
  
  if (params.aiName !== undefined) {
    requestBody.aiName = params.aiName;
  }
  
  if (params.aiGender !== undefined) {
    // 前端格式和后端格式一致：1=男, 2=女, 3=不愿意透露
    requestBody.aiGender = params.aiGender;
  }
  
  if (params.aiRelationship !== undefined) {
    requestBody.aiRelationship = params.aiRelationship;
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
        console.log('[AISettings] 响应:', { status: response.status, body: 'Non-JSON response' });
        throw new Error('保存失败，请稍后重试');
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
 * Body：{ aiName: string }
 */
export async function saveAiName(aiName: string, token: string): Promise<void> {
  if (!BASE_URL || BASE_URL === '') {
    console.log('后端未配置，仅更新本地 store');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }

  const url = `${BASE_URL}/agent/profile/nest`;
  
  const requestBody = { aiName };
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
 * 保存AI性别
 * 接口：PUT /api/agent/profile/nest
 * Header：Authorization: Bearer {token}
 * Body：{ aiGender: 1 | 2 | 3 } (1=男, 2=女, 3=不愿意透露)
 */
export async function saveAiGender(aiGender: 1 | 2 | 3, token: string): Promise<void> {
  if (!BASE_URL || BASE_URL === '') {
    console.log('后端未配置，仅更新本地 store');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return;
  }

  const url = `${BASE_URL}/agent/profile/nest`;
  
  // 前端格式和后端格式一致：1=男, 2=女, 3=不愿意透露
  const requestBody = { aiGender };
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

