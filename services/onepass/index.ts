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
  if (!isOnepassAvailable()) return;
  const module = AliyunOnepass;
  if (!module) return;
  await module.init(config);
}

/**
 * 预取号流程，获取掩码手机号
 */
export async function preLogin(timeout = 5000): Promise<{ maskNumber?: string } | null> {
  if (!isOnepassAvailable()) return null;
  const module = AliyunOnepass;
  if (!module) return null;
  const result = await module.preLogin(timeout);
  return result;
}

/**
 * 检查当前网络和运营商是否支持一键登录
 */
export async function checkVerifyEnable(): Promise<boolean> {
  if (!isOnepassAvailable()) return false;
  const module = AliyunOnepass;
  if (!module) return false;
  const available = await module.checkVerifyEnable();
  return available;
}

/**
 * 拉起授权页，返回阿里云颁发的 token
 */
export async function login(timeout = 8000): Promise<{ token: string }> {
  if (!isOnepassAvailable()) {
    throw new Error('当前环境不支持一键登录');
  }

  const module = AliyunOnepass;
  if (!module) {
    throw new Error('一键登录模块未初始化');
  }

  const { token } = await module.login(timeout);
  return { token };
}

/**
 * 关闭授权页，避免内存泄露
 */
export function quitLoginPage() {
  if (!isOnepassAvailable()) return;
  AliyunOnepass?.quitLoginPage();
}


