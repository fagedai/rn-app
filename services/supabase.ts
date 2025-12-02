/**
 * Supabase 客户端配置
 * 统一管理 Supabase 客户端实例，供多个服务使用
 */

import { createClient } from '@supabase/supabase-js';

// Supabase 配置
// 方式1: 直接在代码中配置（推荐，因为 Supabase URL 和 Anon Key 是公开的）
// 方式2: 通过环境变量配置（设置 EXPO_PUBLIC_SUPABASE_URL 和 EXPO_PUBLIC_SUPABASE_ANON_KEY）
const SUPABASE_URL_CONFIG = 'https://hhizjognadbctqzjdxvj.supabase.co'; // Supabase 项目 URL
const SUPABASE_ANON_KEY_CONFIG = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaXpqb2duYWRiY3RxempkeHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzkzMzQsImV4cCI6MjA4MDE1NTMzNH0.bj6BBrIp45Q69OHOg5M8jtxB2TRsaejoSLt7BZ6dcO4'; // Supabase Anon Key

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
        schema: 'log', // 埋点表在 log schema 中
      },
      global: {
        headers: {
          'apikey': SUPABASE_ANON_KEY, // 显式设置 apikey header
        },
      },
    })
  : null;

// 注意：现在每个事件对应一张表，不再使用统一的 tracking_events 表
// 表名映射在 services/tracking/index.ts 中的 EVENT_TABLE_MAP 定义

/**
 * 检查 Supabase 是否已配置
 */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

