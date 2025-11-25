/**
 * 记忆相关API接口
 * TODO: 亟待后端接口 - 当前使用临时地址 example.com
 */

import { fetchWithTimeout, getApiBaseUrl } from '@/utils/apiUtils';

const BASE_URL = getApiBaseUrl();
const TEMP_BASE_URL = 'https://example.com'; // TODO: 待后端确认实际接口地址
const REQUEST_TIMEOUT = 30000; // 30秒超时

// 记忆分类类型
export type MemoryCategory = '人际关系' | '偏好' | '习惯' | '临时';

// 记忆项接口
export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  content: string;
  created_at: string; // ISO 8601 格式
  updated_at?: string;
}

// 获取记忆列表响应
export interface GetMemoriesResponse {
  memories: MemoryItem[];
}

// 添加记忆请求
export interface AddMemoryRequest {
  profileId: string;
  category: MemoryCategory;
  content: string;
}

// 添加记忆响应
export interface AddMemoryResponse {
  id: string;
  category: MemoryCategory;
  content: string;
  created_at: string;
}

// 修改记忆请求
export interface UpdateMemoryRequest {
  category: MemoryCategory;
  content: string;
}


/**
 * 获取指定分类的记忆列表
 * 接口：GET /api/agent/memory
 * Query 参数：profileId (string, 可选), category (string, 可选)
 * Header：Authorization: Bearer {token}
 * @param category 记忆分类（可选）
 * @param profileId AI Profile ID（可选，从提交问卷接口返回）
 * @param token 认证token
 * @returns 记忆列表（时间倒序，最新的在前）
 */
export async function getMemories(
  category: MemoryCategory | undefined,
  profileId: string | undefined,
  token: string
): Promise<MemoryItem[]> {
  // 如果没有配置后端 URL，返回临时测试数据
  if (!BASE_URL || BASE_URL === '') {
    console.log('后端未配置，返回临时测试记忆数据', { category, profileId });
    
    // 临时测试数据：仅在"人际关系"分类时返回
    if (category === '人际关系') {
      const now = new Date();
      return [
        {
          id: 'temp-memory-2',
          category: '人际关系' as MemoryCategory,
          content: '随着时间的推移,NEST与用户之间的联系变得更加个性化。\nNEST 会在夜间主动进行签到,感知用户何时感到孤独。',
          created_at: new Date(now.getTime() - 86400000).toISOString(), // 1天前
        },
        {
          id: 'temp-memory-1',
          category: '人际关系' as MemoryCategory,
          content: 'NEST懂得如何在对话中与你的情绪语气保持一致。',
          created_at: new Date(now.getTime() - 172800000).toISOString(), // 2天前
        },
      ];
    }
    
    return [];
  }

  // 构建 URL，只添加存在的 query 参数
  const queryParams: string[] = [];
  if (profileId) {
    queryParams.push(`profileId=${encodeURIComponent(profileId)}`);
  }
  if (category) {
    queryParams.push(`category=${encodeURIComponent(category)}`);
  }
  
  const url = queryParams.length > 0
    ? `${BASE_URL}/agent/memory?${queryParams.join('&')}`
    : `${BASE_URL}/agent/memory`;
  
  console.log('[Memory] 请求:', { 
    url, 
    method: 'GET',
    queryParams: {
      profileId,
      category,
    }
  });
  
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

    if (response.status === 404) {
      // 没有记忆数据
      return [];
    }

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return [];
      }
      throw new Error('获取记忆列表失败');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return [];
    }

    const data = JSON.parse(responseText);
    
    // 检查后端返回的 code 字段（如果存在）
    if (data && typeof data === 'object' && 'code' in data) {
      const code = data.code;
      // code 为 0 或 200 表示成功，其他值表示错误
      if (code !== 0 && code !== 200) {
        const errorMessage = data.message || '获取记忆列表失败';
        throw new Error(errorMessage);
      }
    }
    
    // 处理不同的响应格式
    let memories: MemoryItem[] = [];
    if (Array.isArray(data)) {
      // 如果直接返回数组
      memories = data;
    } else if (data.memories && Array.isArray(data.memories)) {
      // 如果返回 { memories: [...] }
      memories = data.memories;
    } else if (data.data && Array.isArray(data.data)) {
      // 如果返回 { data: [...] }
      memories = data.data;
    } else {
      // 如果格式不符合预期，返回空数组（可能是成功但没有数据）
      memories = [];
    }
    
    // 按时间倒序排序（最新的在前）
    const sortedMemories = memories.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return timeB - timeA;
    });
    
    console.log('[Memory] 响应:', sortedMemories);
    return sortedMemories;
  } catch (error) {
    return [];
  }
}

/**
 * 添加记忆
 * 接口：POST /api/agent/memory
 * Header：Authorization: Bearer {token}
 * Body: { profileId, category, content }
 * @param request 添加记忆请求（包含 profileId, category, content）
 * @param token 认证token
 * @returns 新创建的记忆项
 */
export async function addMemory(request: AddMemoryRequest, token: string): Promise<AddMemoryResponse> {
  if (!BASE_URL || BASE_URL === '') {
    console.log('后端未配置，模拟添加成功');
    // 模拟成功响应
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: `memory-${Date.now()}`,
      category: request.category,
      content: request.content,
      created_at: new Date().toISOString(),
    };
  }

  const url = `${BASE_URL}/agent/memory`;
  
  console.log('[Memory] 请求:', { url, body: request });
  
  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          profileId: request.profileId,
          category: request.category,
          content: request.content,
        }),
      },
      REQUEST_TIMEOUT
    );

    const responseText = await response.text();

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          id: `memory-${Date.now()}`,
          category: request.category,
          content: request.content,
          created_at: new Date().toISOString(),
        };
      }
      console.log('[Memory] 响应:', responseText);
      throw new Error(responseText || '保存失败，请稍后重试');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        id: `memory-${Date.now()}`,
        category: request.category,
        content: request.content,
        created_at: new Date().toISOString(),
      };
    }

    const responseData = JSON.parse(responseText) as AddMemoryResponse;
    console.log('[Memory] 响应:', responseData);
    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('Unexpected character')
      ) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          id: `memory-${Date.now()}`,
          category: request.category,
          content: request.content,
          created_at: new Date().toISOString(),
        };
      }
    }
    throw error;
  }
}

/**
 * 修改记忆
 * 接口：PUT /api/agent/memory
 * Header：Authorization: Bearer {token}
 * Body: { id, profileId, category, content }
 * @param id 记忆 ID
 * @param request 修改记忆请求
 * @param profileId AI Profile ID（从提交问卷接口返回）
 * @param token 认证token
 */
export async function updateMemory(id: string, request: UpdateMemoryRequest, profileId: string, token: string): Promise<void> {
  if (!BASE_URL || BASE_URL === '') {
    console.log('后端未配置，模拟修改成功');
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  const url = `${BASE_URL}/agent/memory`;
  
  const requestBody = {
    id,
    profileId,
    category: request.category,
    content: request.content,
  };
  
  console.log('[Memory] 请求:', { url, body: requestBody });
  
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
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }
      console.log('[Memory] 响应:', responseText);
      throw new Error(responseText || '保存失败，请稍后重试');
    }

    console.log('[Memory] 响应:', responseText);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('Unexpected character')
      ) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }
    }
    throw error;
  }
}

/**
 * 删除记忆（单个）
 * 接口：DELETE /api/agent/memory
 * Header：Authorization: Bearer {token}
 * Body: { id, profileId }
 * @param id 记忆 ID
 * @param profileId AI Profile ID（从提交问卷接口返回）
 * @param token 认证token
 */
export async function deleteMemory(id: string, profileId: string, token: string): Promise<void> {
  if (!BASE_URL || BASE_URL === '') {
    console.log('后端未配置，模拟删除成功');
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  const url = `${BASE_URL}/agent/memory`;
  
  const requestBody = {
    id,
    profileId,
  };
  
  console.log('[Memory] 请求:', { url, body: requestBody });
  
  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: 'DELETE',
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
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }
      console.log('[Memory] 响应:', responseText);
      throw new Error(responseText || '删除失败，请稍后重试');
    }

    console.log('[Memory] 响应:', responseText);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('Unexpected character')
      ) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }
    }
    throw error;
  }
}

/**
 * 批量删除记忆
 * 接口：DELETE /api/agent/memory
 * Header：Authorization: Bearer {token}
 * Body: { ids, profileId }
 * @param ids 记忆 ID 数组
 * @param profileId AI Profile ID（从提交问卷接口返回）
 * @param token 认证token
 */
export async function deleteMemories(ids: string[], profileId: string, token: string): Promise<void> {
  if (!BASE_URL || BASE_URL === '') {
    console.log('后端未配置，模拟批量删除成功');
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  const url = `${BASE_URL}/agent/memory`;
  
  const requestBody = {
    ids,
    profileId,
  };
  console.log('[Memory] 请求:', { url, body: requestBody });
  
  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: 'DELETE',
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
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }
      console.log('[Memory] 响应:', responseText);
      throw new Error(responseText || '删除失败，请稍后重试');
    }

    console.log('[Memory] 响应:', responseText);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('Unexpected character')
      ) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }
    }
    throw error;
  }
}

