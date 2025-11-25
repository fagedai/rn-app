/**
 * 问卷相关API接口
 */

import { fetchWithTimeout, getApiBaseUrl } from '@/utils/apiUtils';

const BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT = 5000; // 5秒超时

/**
 * 问卷答案提交数据格式（新接口格式）
 */
export interface QuestionnaireSubmitData {
  userId: number | string; // 用户ID（支持数字或字符串，避免大整数精度丢失）
  userName: string; // 用户姓名
  userGender: 1 | 2 | 3; // 1=男, 2=女, 3=不愿意透露
  userBirthday: string; // 生日格式："YYYY-MM-DD"
  nestExpectation: string; // AI期望
  nestGender: 1 | 2 | 3; // 1=男, 2=女, 3=不愿意透露（后端会根据 archetype 自动获取）
  nestRole: string; // 角色
  nestExperience: string[]; // 经历（多选）
  nestArchetype: string; // AI角色类型，格式："标题 — 副标题"
  nestBackstory: string; // AI背景故事
}

/**
 * 提交问卷答案
 * 接口地址：/api/agent/profile
 * Header 参数：Authorization: Bearer {token}
 * @returns profileId - AI Profile ID，用于后续记忆接口
 */
export async function submitQuestionnaire(
  data: QuestionnaireSubmitData,
  token: string
): Promise<string> {
  const url = `${BASE_URL}/agent/profile`;

  console.log('[Questionnaire] 请求:', { url, body: data });

  try {
  const response = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
    REQUEST_TIMEOUT
  );

    const responseText = await response.text();

    // 解析响应，检查 code 字段
    let responseData: { code: number; message?: string; data?: unknown } | null = null;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // 如果不是 JSON 格式，检查 HTTP 状态码
      if (!response.ok) {
        console.log('[Questionnaire] 响应:', responseText);
        throw new Error(responseText || '问卷提交失败，请稍后重试');
      }
      throw new Error('问卷提交失败：响应格式错误');
    }

    // 检查后端返回的 code 字段（即使 HTTP 状态码是 200，后端也可能返回错误 code）
    if (!responseData || responseData.code !== 200) {
      const errorMessage = responseData?.message || responseText || '问卷提交失败，请稍后重试';
      throw new Error(errorMessage);
    }

    // 提取 profileId（从 data 字段中）
    const profileId = typeof responseData.data === 'string' ? responseData.data : String(responseData.data || '');
    console.log('[Questionnaire] 响应:', responseData);
    
    if (!profileId) {
      throw new Error('未获取到 profileId，请稍后重试');
    }
    
    return profileId;
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


