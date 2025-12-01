/**
 * 一键登录接口封装（后端负责根据阿里云 token 换取手机号）
 */

import { getApiBaseUrl } from '@/utils/apiUtils';
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

// 基地址：http://8.166.129.71:18081
// API前缀：/api/mobile
const BASE_URL = getApiBaseUrl();

// 请求载荷类型（用于类型检查）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ExchangeTokenPayload {
  token: string;
}

export interface ExchangeTokenResponse {
  phoneNumber: string;
  nextStep?: 'chat' | 'questionnaire';
  token?: string;
  userId?: string;
}

// 后端API响应格式
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
}

interface VerifyResponseData {
  message?: string;
  mobile?: string; // 手机号字段
  newUser?: boolean; // 是否为新用户
  success?: boolean;
  token?: string; // JWT token
  userId?: string; // 用户ID
}

/**
 * 向后端发送阿里云返回的 token，换取真实手机号
 * 接口地址：/api/mobile/auth/verify
 */
export async function exchangeOnePassToken(token: string): Promise<ExchangeTokenResponse> {
  // 使用 query 参数，字段名为 accessToken
  const url = `${BASE_URL}/mobile/auth/verify?accessToken=${encodeURIComponent(token)}`;

  console.log('[Login] 请求:', { url });

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
      'X-Device-Id': finalDeviceId, // getDeviceIdPublic() 总是返回 string（如果为空会自动生成）
      'X-Platform': platform, // getPlatformPublic() 总是返回 'ios' | 'android'
      'X-App-Version': appVersion, // getAppVersionPublic() 内部已有默认值 '1.0.0'
      'X-OS-Version': osVersion || '', // getOSVersionPublic() 可能返回 undefined（Platform.Version 可能不存在）
      'X-Session-Id': finalSessionId || '', // getSessionIdPublic() 可能返回 null（但已检查并初始化，理论上不会为空）
      'X-Network-Type': networkType, // getNetworkTypePublic() 内部已有默认值 'unknown'
      'X-Page-Id': 'login_page', // 登录页面
      'X-Trace-Id': generateUUID(), // 每次请求生成新的追踪ID
    };

    console.log('[Login] 请求头:', headers);

    const response = await fetch(url, {
      method: 'POST',
      headers,
    });

    // 确保响应状态码有效
    if (response.status < 200 || response.status > 599) {
      throw new Error('网络连接失败，请检查网络设置后重试');
    }

    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('接口返回格式错误，请稍后重试');
    }

    // 获取响应文本
    const responseText = await response.text();

    // 解析响应
    let responseData: ApiResponse<VerifyResponseData>;
    try {
      responseData = JSON.parse(responseText) as ApiResponse<VerifyResponseData>;
    } catch {
      console.log('[Login] 响应:', responseText);
      throw new Error('接口返回格式错误，无法解析JSON');
    }

    // 检查后端返回的状态码（即使HTTP状态码是200，后端也可能返回错误code）
    if (responseData.code !== 200) {
      console.log('[Login] 响应:', responseText);
      let errorMessage = responseData.message || '一键登录接口请求失败';
      
      // 对数据库连接错误提供更友好的提示
      if (errorMessage.includes('JDBC') || 
          errorMessage.includes('CannotGetJdbcConnection') ||
          errorMessage.includes('Failed to obtain JDBC Connection') ||
          errorMessage.includes('数据库')) {
        errorMessage = '服务器暂时无法连接，请稍后重试';
      }
      
      throw new Error(errorMessage);
    }

    console.log('[Login] 响应:', responseData);

    if (!responseData.data) {
      throw new Error('接口返回数据为空');
    }

    // 提取手机号
    const phoneNumber = responseData.data.mobile;
    if (!phoneNumber) {
      throw new Error('接口未返回手机号');
    }

    // 根据 newUser 字段判断下一步操作
    // newUser: true → 新用户，跳转到问卷
    // newUser: false → 老用户，跳转到聊天
    const nextStep: 'chat' | 'questionnaire' = responseData.data.newUser === false ? 'chat' : 'questionnaire';

    // 提取 token 和 userId
    const token = responseData.data.token;
    const userId = responseData.data.userId;

    return {
      phoneNumber,
      nextStep,
      token,
      userId,
    };
  } catch (error) {
    if (error instanceof Error) {
      // 网络错误处理
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('Network request failed') ||
          error.message.includes('NetworkError') ||
          error.message.includes('status provided (0)')) {
        throw new Error('网络连接失败，请检查网络设置后重试');
      }
    }
    throw error;
  }
}

/**
 * 发送短信验证码
 * 接口地址：/api/mobile/auth/send-code
 * 请求参数：query 参数 mobile，类型为 string
 */
export async function sendVerificationCode(phone: string): Promise<void> {
  // 使用 query 参数，直接传递手机号字符串
  const url = `${BASE_URL}/mobile/auth/send-code?mobile=${encodeURIComponent(phone)}`;
  
  console.log('[Login] 请求:', { url });
  
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
      'X-Device-Id': finalDeviceId,
      'X-Platform': platform,
      'X-App-Version': appVersion,
      'X-OS-Version': osVersion || '',
      'X-Session-Id': finalSessionId || '',
      'X-Network-Type': networkType,
      'X-Page-Id': 'login_page', // 登录页面
      'X-Trace-Id': generateUUID(), // 每次请求生成新的追踪ID
    };

    console.log('[Login] 请求头:', headers);

    const response = await fetch(url, {
      method: 'POST',
      headers,
    });

    // 确保响应状态码有效
    if (response.status < 200 || response.status > 599) {
      throw new Error('网络连接失败，请检查网络设置后重试');
    }

    const responseText = await response.text();

    if (!response.ok) {
      console.log('[Login] 响应:', responseText);
      throw new Error(responseText || '验证码发送失败，请稍后重试');
    }

    console.log('[Login] 响应:', responseText);
  } catch (error) {
    if (error instanceof Error) {
      // 网络错误处理
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('Network request failed') ||
          error.message.includes('NetworkError') ||
          error.message.includes('status provided (0)')) {
        throw new Error('网络连接失败，请检查网络设置后重试');
      }
    }
    throw error;
  }
}

export interface VerifyCodeResponse {
  phoneNumber: string;
  nextStep?: 'chat' | 'questionnaire';
  token?: string;
  userId?: string;
}

/**
 * 校验验证码并返回下一步动作
 * 接口地址：/api/mobile/auth/loginByCode
 * 请求参数：query 参数 mobile 和 code
 */
export async function verifyVerificationCode(phone: string, code: string): Promise<VerifyCodeResponse> {
  // 使用 query 参数
  const url = `${BASE_URL}/mobile/auth/loginByCode?mobile=${encodeURIComponent(phone)}&code=${encodeURIComponent(code)}`;
  
  console.log('[Login] 请求:', { url });
  
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
      'X-Device-Id': finalDeviceId, // getDeviceIdPublic() 总是返回 string（如果为空会自动生成）
      'X-Platform': platform, // getPlatformPublic() 总是返回 'ios' | 'android'
      'X-App-Version': appVersion, // getAppVersionPublic() 内部已有默认值 '1.0.0'
      'X-OS-Version': osVersion || '', // getOSVersionPublic() 可能返回 undefined（Platform.Version 可能不存在）
      'X-Session-Id': finalSessionId || '', // getSessionIdPublic() 可能返回 null（但已检查并初始化，理论上不会为空）
      'X-Network-Type': networkType, // getNetworkTypePublic() 内部已有默认值 'unknown'
      'X-Page-Id': 'login_page', // 登录页面
      'X-Trace-Id': generateUUID(), // 每次请求生成新的追踪ID
    };

    console.log('[Login] 请求头:', headers);

    const response = await fetch(url, {
      method: 'POST',
      headers,
    });

    // 确保响应状态码有效
    if (response.status < 200 || response.status > 599) {
      throw new Error('网络连接失败，请检查网络设置后重试');
    }

    // 检查响应类型
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('接口返回格式错误，请稍后重试');
    }

    // 获取响应文本
    const responseText = await response.text();

    // 解析响应
    let responseData: ApiResponse<VerifyResponseData>;
    try {
      responseData = JSON.parse(responseText) as ApiResponse<VerifyResponseData>;
    } catch {
      console.log('[Login] 响应:', responseText);
      throw new Error('接口返回格式错误，无法解析JSON');
    }

    // 记录接口返回
    console.log('[Login] 响应:', responseData);

    // 检查后端返回的状态码
    if (responseData.code !== 200) {
      const errorMessage = responseData.message || '验证码错误或已过期';
      throw new Error(errorMessage);
    }

    if (!responseData.data) {
      throw new Error('接口返回数据为空');
    }

    // 提取手机号
    const phoneNumber = responseData.data.mobile || phone; // 如果没有返回手机号，使用传入的
    
    // 根据 newUser 字段判断下一步操作
    // newUser: true → 新用户，跳转到问卷
    // newUser: false → 老用户，跳转到聊天
    const nextStep: 'chat' | 'questionnaire' = responseData.data.newUser === false ? 'chat' : 'questionnaire';

    // 提取 token 和 userId
    const token = responseData.data.token;
    const userId = responseData.data.userId;

    return {
      phoneNumber,
      nextStep,
      token,
      userId,
    };
  } catch (error) {
    if (error instanceof Error) {
      // 网络错误处理
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('Network request failed') ||
          error.message.includes('NetworkError') ||
          error.message.includes('status provided (0)')) {
        throw new Error('网络连接失败，请检查网络设置后重试');
      }
    }
    throw error;
  }
}



