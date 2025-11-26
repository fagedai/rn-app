/**
 * Supabase 客户端配置
 * 统一管理 Supabase 客户端实例，供多个服务使用
 */

import { createClient } from '@supabase/supabase-js';

// Supabase 配置
// 方式1: 直接在代码中配置（推荐，因为 Supabase URL 和 Anon Key 是公开的）
// 方式2: 通过环境变量配置（设置 EXPO_PUBLIC_SUPABASE_URL 和 EXPO_PUBLIC_SUPABASE_ANON_KEY）
const SUPABASE_URL_CONFIG = 'https://swaijtxqidosvxslaybl.supabase.co'; // Supabase 项目 URL
const SUPABASE_ANON_KEY_CONFIG = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3YWlqdHhxaWRvc3Z4c2xheWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTE1NTUsImV4cCI6MjA3OTY4NzU1NX0.vtcAUqeHIEmyFirQxQw-9UtE-ZNWeWQ1rHlMRIXMjaw'; // Supabase Anon Key

const SUPABASE_URL = SUPABASE_URL_CONFIG || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = SUPABASE_ANON_KEY_CONFIG || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// 创建 Supabase 客户端
// 注意：使用 anon key 创建的客户端会使用 anon 角色
// 确保使用的是 anon/public key，不是 service_role key
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false, // 埋点不需要持久化会话
        autoRefreshToken: false, // 埋点不需要刷新 token
        detectSessionInUrl: false, // React Native 不需要检测 URL 中的 session
      },
      db: {
        schema: 'public', // 明确指定 schema
      },
      global: {
        headers: {
          'apikey': SUPABASE_ANON_KEY, // 显式设置 apikey header
        },
      },
    })
  : null;

// 数据库表名常量
export const TRACKING_EVENTS_TABLE = 'tracking_events';

/**
 * 检查 Supabase 是否已配置
 */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

