import { NativeModules } from 'react-native';

type OnepassConfig = {
  appKey?: string;
  appSecret: string;
  timeout?: number;
};

type AliyunOnepassModule = {
  init: (config: OnepassConfig) => Promise<void>;
  preLogin: (timeout: number) => Promise<{ maskNumber?: string; msg?: string }>;
  checkVerifyEnable: () => Promise<boolean>;
  login: (timeout: number) => Promise<{ token: string; msg?: string; requestId?: string }>;
  quitLoginPage: () => void;
};

const AliyunOnepass = NativeModules.AliyunOnepass as AliyunOnepassModule | undefined;

/**
 * 判断原生一键登录模块是否存在
 * 为了兼容 Expo 托管模式，这里返回布尔值供前端决定是否展示按钮
 */
export function isOnepassAvailable(): boolean {
  const available = Boolean(AliyunOnepass?.init);
  return available;
}

/**
 * 初始化阿里云一键登录 SDK
 */
export async function initOnepass(config: OnepassConfig) {
  if (!isOnepassAvailable()) {
    console.error('[Onepass] SDK 不可用');
    throw new Error('当前环境不支持一键登录');
  }
  const module = AliyunOnepass;
  if (!module) {
    console.error('[Onepass] 模块未初始化');
    throw new Error('一键登录模块未初始化');
  }
  
  try {
    await module.init(config);
  } catch (error) {
    console.error('[Onepass] 初始化失败:', error);
    throw error;
  }
}

/**
 * 预取号流程，获取掩码手机号
 */
export async function preLogin(timeout = 5000): Promise<{ maskNumber?: string; msg?: string } | null> {
  console.log('[Onepass] 开始预取号，timeout:', timeout);
  
  if (!isOnepassAvailable()) {
    console.warn('[Onepass] SDK 不可用，返回 null');
    return null;
  }
  const module = AliyunOnepass;
  if (!module) {
    console.warn('[Onepass] 模块未初始化，返回 null');
    return null;
  }
  
  try {
    const result = await module.preLogin(timeout);
    console.log('[Onepass] 预取号成功，result:', {
      maskNumber: result?.maskNumber,
      msg: result?.msg
    });
    return result;
  } catch (error) {
    console.error('[Onepass] 预取号失败:', error);
    throw error;
  }
}

/**
 * 检查当前网络和运营商是否支持一键登录
 */
export async function checkVerifyEnable(): Promise<boolean> {
  console.log('[Onepass] 开始检查网络和运营商支持');
  
  if (!isOnepassAvailable()) {
    console.warn('[Onepass] SDK 不可用，返回 false');
    return false;
  }
  const module = AliyunOnepass;
  if (!module) {
    console.warn('[Onepass] 模块未初始化，返回 false');
    return false;
  }
  
  try {
    const available = await module.checkVerifyEnable();
    console.log('[Onepass] 检查结果:', available);
    return available;
  } catch (error) {
    console.error('[Onepass] 检查失败:', error);
    return false;
  }
}

/**
 * 拉起授权页，返回阿里云颁发的 token
 */
export async function login(timeout = 8000): Promise<{ token: string }> {
  if (!isOnepassAvailable()) {
    console.error('[Onepass] SDK 不可用');
    throw new Error('当前环境不支持一键登录');
  }

  const module = AliyunOnepass;
  if (!module) {
    console.error('[Onepass] 模块未初始化');
    throw new Error('一键登录模块未初始化');
  }

  try {
    const result = await module.login(timeout);
    
    if (!result.token) {
      console.error('[Onepass] ❌ token 为空');
      // 即使失败也要关闭授权页
      quitLoginPage();
      throw new Error(result.msg || '登录失败：未获取到 token');
    }
    
    // 确保授权页已关闭（Android 代码中已经关闭，这里作为兜底）
    console.log('[Onepass] 确保授权页已关闭');
    quitLoginPage();
    
    console.log('[Onepass] ✅ 返回 token');
    return { token: result.token };
  } catch (error) {
    const errorMessage = (error as Error)?.message || String(error);
    
    // 检查是否是用户切换其他登录方式（700001）
    if (errorMessage.includes('700001') || errorMessage.includes('用户切换其他登录方式')) {
      // 用户主动切换登录方式，不记录为错误，直接抛出特殊错误
      const switchError = new Error('USER_SWITCHED_LOGIN_METHOD');
      (switchError as any).code = 'USER_SWITCHED_LOGIN_METHOD';
      throw switchError;
    }
    
    console.error('[Onepass] 错误消息:', errorMessage);
    throw error;
  }
}

/**
 * 关闭授权页，避免内存泄露
 */
export function quitLoginPage() {
  if (!isOnepassAvailable()) return;
  AliyunOnepass?.quitLoginPage();
}


