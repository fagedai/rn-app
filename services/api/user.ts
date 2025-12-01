/**
 * 用户信息相关API接口
 */

import { fetchWithTimeout, getApiBaseUrl } from '@/utils/apiUtils';
import { 
  getDeviceIdPublic, 
  getPlatformPublic, 
  getAppVersionPublic, 
  getOSVersionPublic, 
  getSessionIdPublic,
  getNetworkTypePublic,
  initTracking
} from '@/services/tracking';
import { generateUUID } from '@/utils/uuid';

const BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT = 30000; // 30秒超时

/**
 * 后端返回的用户信息格式
 */
interface BackendUserInfo {
  id: string;
  mobile: string;
  name: string | null;
  gender: number;
  birthday: string | null; // ISO 8601 格式字符串，如 "2000-01-01"
  interests: string[] | null; // 兴趣数组
  background: string | null; // 背景故事
  imageUrl: string | null;
  status: number;
  registerChannel: string | null;
  isNewUser: number;
}

/**
 * 前端使用的用户信息格式
 */
export interface UserInfoResponse {
  id: string;
  mobile: string;
  name: string | null;
  gender: number | null;
  birthday: {
    year: number;
    month: number;
    day: number;
  } | null;
  interests: string[]; // 兴趣数组，如果没有则为空数组
  background: string | null; // 背景故事
  imageUrl: string | null;
  status: number;
  registerChannel: string | null;
  isNewUser: number;
}

/**
 * 更新用户信息的请求参数（只传变更的字段）
 */
export interface UpdateUserInfoRequest {
  name?: string;
  gender?: number;
  birthday?: string; // ISO 8601 格式字符串，如 "2000-01-01"
  interests?: string[]; // 兴趣数组
  background?: string; // 背景故事
}

/**
 * 获取用户信息
 * 接口：GET /api/users/me
 * 请求头：Authorization: Bearer {token}
 * @param token 认证token
 */
export async function getUserInfo(token: string): Promise<UserInfoResponse> {
  const url = `${BASE_URL}/users/me`;

  // 验证 token 是否存在，并清理空白字符
  if (!token || token.trim() === '') {
    throw new Error('请先登录');
  }

  // 清理 token 中的空白字符（包括换行符、空格等）
  const cleanToken = token.trim().replace(/\s+/g, '');
  
  console.log('[User] 请求:', { 
    url, 
    hasToken: !!token, 
    tokenLength: token.length,
    cleanTokenLength: cleanToken.length,
    tokenPrefix: cleanToken ? `${cleanToken.substring(0, 20)}...` : '无token'
  });

  try {
    // 获取设备信息（确保已初始化）
    const deviceId = getDeviceIdPublic();
    const sessionId = getSessionIdPublic();
    if (!deviceId || !sessionId) {
      initTracking();
    }
    
    const finalDeviceId = getDeviceIdPublic();
    const platform = getPlatformPublic();
    const appVersion = getAppVersionPublic();
    const osVersion = getOSVersionPublic();
    const finalSessionId = getSessionIdPublic();
    const networkType = getNetworkTypePublic();

    // GET 请求不需要 Content-Type，但需要追踪头
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${cleanToken}`,
      'X-Device-Id': finalDeviceId,
      'X-Platform': platform,
      'X-App-Version': appVersion,
      'X-OS-Version': osVersion || '',
      'X-Session-Id': finalSessionId || '',
      'X-Network-Type': networkType,
      'X-Page-Id': 'user_info_page', // 用户信息页面
      'X-Trace-Id': generateUUID(), // 每次请求生成新的追踪ID
    };

    const response = await fetchWithTimeout(
      url,
      {
        method: 'GET',
        headers,
      },
      REQUEST_TIMEOUT
    );

    const responseText = await response.text();

    // 解析响应，检查 code 字段
    let responseData: { code?: number; message?: string; data?: BackendUserInfo } | null = null;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // 如果不是 JSON 格式，检查 HTTP 状态码
      if (!response.ok) {
        console.log('[User] 响应解析失败，HTTP状态码:', response.status);
        throw new Error(responseText || '获取用户信息失败');
      }
      throw new Error('获取用户信息失败：响应格式错误');
    }

    // 检查后端返回的 code 字段（code: 0 或 code: 200 表示成功）
    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      console.log('[User] 响应 code:', responseData.code, 'message:', responseData.message);
      // 兼容两种成功码：0 或 200
      const isSuccess = responseData.code === 0 || responseData.code === 200;
      if (!isSuccess) {
        const errorMessage = responseData.message || responseText || '获取用户信息失败';
        console.error('[User] 请求失败:', { code: responseData.code, message: errorMessage });
        throw new Error(errorMessage);
      }

      // 从 data 字段中提取用户信息并映射字段
      if (responseData.data) {
        const backendData = responseData.data;
        
        // 解析生日字符串为年月日对象
        let birthday: { year: number; month: number; day: number } | null = null;
        if (backendData.birthday) {
          try {
            const date = new Date(backendData.birthday);
            if (!isNaN(date.getTime())) {
              birthday = {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
              };
            }
          } catch {
            // 静默处理生日解析失败
          }
        }

        const userInfo: UserInfoResponse = {
          id: backendData.id,
          mobile: backendData.mobile,
          name: backendData.name,
          gender: backendData.gender !== null && backendData.gender !== undefined ? backendData.gender : null,
          birthday,
          interests: backendData.interests || [], // 如果没有兴趣，返回空数组
          background: backendData.background,
          imageUrl: backendData.imageUrl,
          status: backendData.status,
          registerChannel: backendData.registerChannel,
          isNewUser: backendData.isNewUser,
        };

        console.log('[User] 响应:', userInfo);
        return userInfo;
      }
    }

    // 默认返回错误
    throw new Error('获取用户信息失败：响应格式错误');
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

/**
 * 更新用户信息
 * 接口：PUT /api/users/me
 * 请求头：Authorization: Bearer {token}
 * 请求体：只传变更的字段（JSON格式）
 * @param token 认证token
 * @param data 要更新的用户信息（只传变更的字段）
 */
export async function updateUserInfo(
  token: string,
  data: UpdateUserInfoRequest
): Promise<void> {
  const url = `${BASE_URL}/users/me`;

  console.log('[User] 请求:', { url, data });

  try {
    // 获取设备信息（确保已初始化）
    const deviceId = getDeviceIdPublic();
    const sessionId = getSessionIdPublic();
    if (!deviceId || !sessionId) {
      initTracking();
    }
    
    const finalDeviceId = getDeviceIdPublic();
    const platform = getPlatformPublic();
    const appVersion = getAppVersionPublic();
    const osVersion = getOSVersionPublic();
    const finalSessionId = getSessionIdPublic();
    const networkType = getNetworkTypePublic();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': finalDeviceId,
      'X-Platform': platform,
      'X-App-Version': appVersion,
      'X-OS-Version': osVersion || '',
      'X-Session-Id': finalSessionId || '',
      'X-Network-Type': networkType,
      'X-Page-Id': 'user_info_page', // 用户信息页面
      'X-Trace-Id': generateUUID(), // 每次请求生成新的追踪ID
    };

    const response = await fetchWithTimeout(
      url,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      },
      REQUEST_TIMEOUT
    );

    const responseText = await response.text();

    // 解析响应，检查 code 字段
    let responseData: { code?: number; message?: string } | null = null;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // 如果不是 JSON 格式，检查 HTTP 状态码
      if (!response.ok) {
        console.log('[User] 响应:', responseText);
        throw new Error(responseText || '更新用户信息失败');
      }
      // 如果 HTTP 状态码是成功的，即使不是 JSON 也认为成功
      return;
    }

    // 检查后端返回的 code 字段（code: 0 或 code: 200 表示成功）
    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      // 兼容两种成功码：0 或 200
      const isSuccess = responseData.code === 0 || responseData.code === 200;
      if (!isSuccess) {
        const errorMessage = responseData.message || responseText || '更新用户信息失败';
        throw new Error(errorMessage);
      }

      console.log('[User] 响应:', responseData);
      return;
    }

    // 如果 HTTP 状态码是成功的，即使没有 code 字段也认为成功
    if (response.ok) {
      console.log('[User] 响应:', responseText);
      return;
    }

    // 默认返回错误
    throw new Error('更新用户信息失败：响应格式错误');
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

/**
 * 发送修改手机号的验证码
 * 接口：POST /api/users/mobile/change/send-code?mobile={mobile}
 * 请求头：Authorization: Bearer {token}
 * @param mobile 手机号
 * @param token 认证token
 */
export async function sendChangePhoneCode(mobile: string, token: string): Promise<void> {
  const url = `${BASE_URL}/users/mobile/change/send-code?mobile=${encodeURIComponent(mobile)}`;

  console.log('[User] 请求发送修改手机号验证码:', { url, mobile });

  try {
    // 获取设备信息（确保已初始化）
    const deviceId = getDeviceIdPublic();
    const sessionId = getSessionIdPublic();
    if (!deviceId || !sessionId) {
      initTracking();
    }
    
    const finalDeviceId = getDeviceIdPublic();
    const platform = getPlatformPublic();
    const appVersion = getAppVersionPublic();
    const osVersion = getOSVersionPublic();
    const finalSessionId = getSessionIdPublic();
    const networkType = getNetworkTypePublic();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': finalDeviceId,
      'X-Platform': platform,
      'X-App-Version': appVersion,
      'X-OS-Version': osVersion || '',
      'X-Session-Id': finalSessionId || '',
      'X-Network-Type': networkType,
      'X-Page-Id': 'user_settings_page', // 用户设置页面
      'X-Trace-Id': generateUUID(), // 每次请求生成新的追踪ID
    };

    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers,
      },
      REQUEST_TIMEOUT
    );

    const responseText = await response.text();

    // 解析响应，检查 code 字段
    let responseData: { code?: number; message?: string } | null = null;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // 如果不是 JSON 格式，检查 HTTP 状态码
      if (!response.ok) {
        console.log('[User] 响应:', responseText);
        throw new Error(responseText || '发送验证码失败');
      }
      // 如果 HTTP 状态码是成功的，即使不是 JSON 也认为成功
      return;
    }

    // 检查后端返回的 code 字段（code: 0 或 code: 200 表示成功）
    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      // 兼容两种成功码：0 或 200
      const isSuccess = responseData.code === 0 || responseData.code === 200;
      if (!isSuccess) {
        const errorMessage = responseData.message || responseText || '发送验证码失败';
        throw new Error(errorMessage);
      }

      console.log('[User] 响应:', responseData);
      return;
    }

    // 如果 HTTP 状态码是成功的，即使没有 code 字段也认为成功
    if (response.ok) {
      console.log('[User] 响应:', responseText);
      return;
    }

    // 默认返回错误
    throw new Error('发送验证码失败：响应格式错误');
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

/**
 * 确认修改手机号
 * 接口：POST /api/users/mobile/change/confirm?mobile={mobile}&code={code}
 * 请求头：Authorization: Bearer {token}
 * @param mobile 手机号
 * @param code 验证码（可选）
 * @param token 认证token
 */
export async function confirmChangePhone(mobile: string, token: string, code?: string): Promise<void> {
  // 构建 URL，如果 code 存在则添加到 query 参数
  let url = `${BASE_URL}/users/mobile/change/confirm?mobile=${encodeURIComponent(mobile)}`;
  if (code) {
    url += `&code=${encodeURIComponent(code)}`;
  }

  console.log('[User] 请求确认修改手机号:', { url, mobile, code });

  try {
    // 获取设备信息（确保已初始化）
    const deviceId = getDeviceIdPublic();
    const sessionId = getSessionIdPublic();
    if (!deviceId || !sessionId) {
      initTracking();
    }
    
    const finalDeviceId = getDeviceIdPublic();
    const platform = getPlatformPublic();
    const appVersion = getAppVersionPublic();
    const osVersion = getOSVersionPublic();
    const finalSessionId = getSessionIdPublic();
    const networkType = getNetworkTypePublic();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': finalDeviceId,
      'X-Platform': platform,
      'X-App-Version': appVersion,
      'X-OS-Version': osVersion || '',
      'X-Session-Id': finalSessionId || '',
      'X-Network-Type': networkType,
      'X-Page-Id': 'user_settings_page', // 用户设置页面
      'X-Trace-Id': generateUUID(), // 每次请求生成新的追踪ID
    };

    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers,
      },
      REQUEST_TIMEOUT
    );

    const responseText = await response.text();

    // 解析响应，检查 code 字段
    let responseData: { code?: number; message?: string } | null = null;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // 如果不是 JSON 格式，检查 HTTP 状态码
      if (!response.ok) {
        console.log('[User] 响应:', responseText);
        throw new Error(responseText || '修改手机号失败');
      }
      // 如果 HTTP 状态码是成功的，即使不是 JSON 也认为成功
      return;
    }

    // 检查后端返回的 code 字段（code: 0 或 code: 200 表示成功）
    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      // 兼容两种成功码：0 或 200
      const isSuccess = responseData.code === 0 || responseData.code === 200;
      if (!isSuccess) {
        const errorMessage = responseData.message || responseText || '修改手机号失败';
        throw new Error(errorMessage);
      }

      console.log('[User] 响应:', responseData);
      return;
    }

    // 如果 HTTP 状态码是成功的，即使没有 code 字段也认为成功
    if (response.ok) {
      console.log('[User] 响应:', responseText);
      return;
    }

    // 默认返回错误
    throw new Error('修改手机号失败：响应格式错误');
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

