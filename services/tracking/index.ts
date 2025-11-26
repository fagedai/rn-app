/**
 * 埋点服务
 * 统一的事件追踪接口，自动补全公共字段
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { generateUUID } from '@/utils/uuid';
import { useUserStore } from '@/store/userStore';

// 动态导入可选依赖
let Application: { nativeApplicationVersion?: string } | null = null;
try {
  Application = require('expo-application');
} catch {
  // expo-application 未安装，使用备用方案
}

// 调试模式开关（可通过环境变量或设置控制）
const DEBUG_TRACKING = process.env.EXPO_PUBLIC_TRACKING_DEBUG === 'true' || __DEV__;

// Session ID 管理（App 启动时生成，进程结束前保持不变）
let sessionId: string | null = null;
let sessionStartTime: number = Date.now();

// 设备 ID 管理（首次生成后持久化）
const DEVICE_ID_KEY = '@nest_device_id';
let deviceId: string | null = null;

/**
 * 初始化 Session ID（App 启动时调用）
 */
export function initTracking() {
  // 生成新的 session_id
  sessionId = generateUUID();
  sessionStartTime = Date.now();
  
  // 尝试从 AsyncStorage 读取 device_id，如果没有则生成新的
  // 注意：这里暂时使用内存存储，后续可以改为 AsyncStorage
  if (!deviceId) {
    // TODO: 从 AsyncStorage 读取，如果没有则生成并保存
    deviceId = generateUUID();
  }
  
  if (DEBUG_TRACKING) {
    console.log('[Tracking] 初始化:', { sessionId, deviceId });
  }
}

/**
 * 获取设备 ID（如果未初始化则自动初始化）
 */
function getDeviceId(): string {
  if (!deviceId) {
    deviceId = generateUUID();
  }
  return deviceId;
}

/**
 * 获取平台信息
 */
function getPlatform(): 'ios' | 'android' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

/**
 * 获取 App 版本号
 */
function getAppVersion(): string {
  // 优先使用 expo-application，如果没有则使用 Constants
  try {
    if (Application) {
      return Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';
    }
    return Constants.expoConfig?.version || '1.0.0';
  } catch {
    return Constants.expoConfig?.version || '1.0.0';
  }
}

/**
 * 获取系统版本
 */
async function getOSVersion(): Promise<string | undefined> {
  try {
    // 需要安装 expo-device 包
    // const Device = await import('expo-device');
    // return Device.osVersion;
    return Platform.Version?.toString();
  } catch {
    return Platform.Version?.toString();
  }
}

/**
 * 获取网络类型
 */
async function getNetworkType(): Promise<string | undefined> {
  try {
    // 需要安装 expo-network 包
    // const Network = await import('expo-network');
    // const state = await Network.getNetworkStateAsync();
    // return state.type === Network.NetworkStateType.WIFI ? 'wifi' : 
    //        state.type === Network.NetworkStateType.CELLULAR ? '4g' : 'none';
    return undefined; // 暂时不实现
  } catch {
    return undefined;
  }
}

/**
 * 公共字段接口
 */
export interface CommonTrackingFields {
  event_id?: string;
  event_name: string;
  event_time: number;
  user_id?: string;
  device_id: string;
  platform: 'ios' | 'android';
  app_version: string;
  os_version?: string;
  network_type?: string;
  page_id?: string;
  trace_id?: string;
  session_id?: string;
}

/**
 * 埋点事件接口
 */
export interface TrackingEvent extends CommonTrackingFields {
  [key: string]: unknown; // 允许额外的业务字段
}

/**
 * 获取埋点上报接口地址
 */
function getTrackingApiUrl(): string | null {
  // 优先使用环境变量配置的埋点接口
  const trackingUrl = process.env.EXPO_PUBLIC_TRACKING_API_URL;
  if (trackingUrl) {
    return trackingUrl;
  }
  
  // 如果没有配置，使用主 API 地址 + /tracking/events
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (baseUrl) {
    return `${baseUrl}/tracking/events`;
  }
  
  // 如果都没有配置，返回 null（只打印，不上报）
  return null;
}

/**
 * 上报埋点数据（实际发送到后端或第三方平台）
 */
async function sendTrackingEvent(event: TrackingEvent): Promise<void> {
  try {
    // 调试模式下打印
    if (DEBUG_TRACKING) {
      console.log('[Tracking] 埋点事件:', JSON.stringify(event, null, 2));
    }
    
    // 获取上报接口地址
    const trackingUrl = getTrackingApiUrl();
    
    // 如果没有配置接口地址，只打印不上报（开发环境）
    if (!trackingUrl) {
      if (DEBUG_TRACKING) {
        console.log('[Tracking] 未配置埋点接口地址，仅打印不上报');
      }
      return;
    }
    
    // 获取用户 token（可选，如果后端需要认证）
    const userInfo = useUserStore.getState().userInfo;
    const token = userInfo.token;
    
    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // 如果用户已登录，添加 Authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 上报到后端接口
    // 使用 fetch 而不是 fetchWithTimeout，避免埋点超时影响主流程
    const response = await fetch(trackingUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(event),
    });
    
    // 检查响应状态（但不抛出错误，避免影响主流程）
    if (!response.ok && DEBUG_TRACKING) {
      console.warn('[Tracking] 上报失败，HTTP 状态:', response.status);
    }
  } catch (error) {
    // 埋点失败不影响主流程，静默处理
    // 只在调试模式下打印错误
    if (DEBUG_TRACKING) {
      console.error('[Tracking] 上报失败:', error);
    }
  }
}

/**
 * 统一的埋点方法
 * @param eventName 事件名称，如 'app_launch', 'page_view_login' 等
 * @param properties 业务字段（会自动合并公共字段）
 * @param options 可选配置（page_id, trace_id 等）
 */
export async function track(
  eventName: string,
  properties: Record<string, unknown> = {},
  options: {
    page_id?: string;
    trace_id?: string;
  } = {}
): Promise<void> {
  try {
    // 确保已初始化
    if (!sessionId) {
      initTracking();
    }

    // 获取用户信息
    const userInfo = useUserStore.getState().userInfo;
    const userId = userInfo.userId || undefined;

    // 构建公共字段
    const commonFields: CommonTrackingFields = {
      event_id: generateUUID(),
      event_name: eventName,
      event_time: Date.now(),
      user_id: userId,
      device_id: getDeviceId(),
      platform: getPlatform(),
      app_version: getAppVersion(),
      os_version: await getOSVersion(),
      network_type: await getNetworkType(),
      page_id: options.page_id,
      trace_id: options.trace_id,
      session_id: sessionId || undefined,
    };

    // 合并业务字段
    const event: TrackingEvent = {
      ...commonFields,
      ...properties,
    };

    // 异步上报（不阻塞主流程）
    sendTrackingEvent(event).catch(() => {
      // 静默处理错误
    });
  } catch (error) {
    // 埋点失败不影响主流程
    if (DEBUG_TRACKING) {
      console.error('[Tracking] track 失败:', error);
    }
  }
}

/**
 * 获取当前 Session ID
 */
export function getSessionId(): string | null {
  return sessionId;
}

/**
 * 获取当前设备 ID
 */
export function getDeviceIdPublic(): string {
  return getDeviceId();
}

