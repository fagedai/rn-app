/**
 * 埋点服务
 * 统一的事件追踪接口，自动补全公共字段
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { generateUUID } from '@/utils/uuid';
import { useUserStore } from '@/store/userStore';
import { supabase, TRACKING_EVENTS_TABLE, isSupabaseConfigured } from '@/services/supabase';

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
 * 分离公共字段和业务字段
 * 公共字段作为表字段，业务字段合并到 properties JSONB 字段
 */
function separateFields(event: TrackingEvent): {
  tableFields: Record<string, unknown>;
  properties: Record<string, unknown>;
} {
  // 公共字段列表（这些字段会作为表字段）
  const commonFieldNames = [
    'event_id',
    'event_name',
    'event_time',
    'user_id',
    'device_id',
    'platform',
    'app_version',
    'os_version',
    'network_type',
    'page_id',
    'trace_id',
    'session_id',
  ];

  const tableFields: Record<string, unknown> = {};
  const properties: Record<string, unknown> = {};

  // 分离字段
  Object.keys(event).forEach((key) => {
    if (commonFieldNames.includes(key)) {
      tableFields[key] = event[key];
    } else {
      properties[key] = event[key];
    }
  });

  return { tableFields, properties };
}

/**
 * 上报埋点数据到 Supabase 数据库
 */
async function sendTrackingEvent(event: TrackingEvent): Promise<void> {
  try {
    // 调试模式下打印
    if (DEBUG_TRACKING) {
      console.log('[Tracking] 埋点事件:', JSON.stringify(event, null, 2));
    }

    // 检查 Supabase 是否已配置
    if (!isSupabaseConfigured() || !supabase) {
      if (DEBUG_TRACKING) {
        console.warn('[Tracking] Supabase 未配置，仅打印不上报');
      }
      return;
    }

    // 分离公共字段和业务字段
    const { tableFields, properties } = separateFields(event);

    // 构建插入数据
    const insertData = {
      ...tableFields,
      properties: properties, // 业务字段合并到 properties JSONB 字段
    };

    // 插入到 Supabase 数据库
    // 注意：Supabase JS 客户端会自动使用创建时传入的 key 对应的角色
    // 如果使用 anon key，则使用 anon 角色；如果使用 service_role key，则使用 service_role 角色
    // 使用 returning: 'minimal' 避免 RLS 策略不允许 SELECT 时的错误
    const { data, error } = await supabase
      .from(TRACKING_EVENTS_TABLE)
      .insert([insertData], { returning: 'minimal' });

    if (error) {
      // 插入失败，记录错误但不影响主流程
      if (DEBUG_TRACKING) {
        console.error('[Tracking] 插入失败:', error);
        console.error('[Tracking] 错误代码:', error.code);
        console.error('[Tracking] 错误消息:', error.message);
        console.error('[Tracking] 错误详情:', error.details);
        console.error('[Tracking] 错误提示:', error.hint);
        console.error('[Tracking] 插入数据:', JSON.stringify(insertData, null, 2));
        
        // 检查 Supabase 客户端配置
        if (supabase) {
          // @ts-ignore - 访问内部属性用于调试
          const clientUrl = (supabase as any).supabaseUrl;
          // @ts-ignore
          const clientKey = (supabase as any).supabaseKey;
          console.error('[Tracking] Supabase URL:', clientUrl);
          console.error('[Tracking] Supabase Key 前20字符:', clientKey?.substring(0, 20));
          
          // 尝试解码 JWT payload 来检查 role
          let keyType = 'unknown';
          try {
            if (clientKey) {
              const parts = clientKey.split('.');
              if (parts.length >= 2) {
                // 解码 payload（第二部分）
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                keyType = payload.role === 'anon' ? 'anon key' : 
                         payload.role === 'service_role' ? 'service_role key' : 
                         `unknown role: ${payload.role}`;
              }
            }
          } catch (e) {
            keyType = '无法解码 JWT';
          }
          console.error('[Tracking] 使用的 Key 类型:', keyType);
        }
      }
      return;
    }

    // 插入成功
    if (DEBUG_TRACKING && data) {
      console.log('[Tracking] 插入成功:', data[0]?.id);
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

/**
 * 获取平台信息（导出供其他模块使用）
 */
export function getPlatformPublic(): 'ios' | 'android' {
  return getPlatform();
}

/**
 * 获取 App 版本号（导出供其他模块使用）
 */
export function getAppVersionPublic(): string {
  return getAppVersion();
}

/**
 * 获取系统版本（导出供其他模块使用，同步版本）
 */
export function getOSVersionPublic(): string | undefined {
  return Platform.Version?.toString();
}

/**
 * 获取 Session ID（导出供其他模块使用）
 */
export function getSessionIdPublic(): string | null {
  return sessionId;
}

