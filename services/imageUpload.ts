import { createClient } from '@supabase/supabase-js';
import { generateUUID } from '@/utils/uuid';

// Supabase 配置（需要从环境变量或配置文件中获取）
// 这里使用占位符，实际使用时需要替换为真实的配置
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// 创建 Supabase 客户端
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * 上传图片到 Supabase Storage
 * @param fileUri 本地文件 URI
 * @param userId 用户 ID
 * @param fileName 文件名（可选，默认使用 UUID）
 * @param onProgress 上传进度回调
 * @returns 图片 URL
 */
export async function uploadImageToSupabase(
  fileUri: string,
  userId: string,
  fileName?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // 如果 Supabase 未配置，返回本地 URI 作为临时方案（仅用于开发测试）
  if (!supabase) {
    console.warn('Supabase 未配置，使用本地 URI 作为临时方案。请后端提供 EXPO_PUBLIC_SUPABASE_URL 和 EXPO_PUBLIC_SUPABASE_ANON_KEY');
    
    // 模拟上传进度
    if (onProgress) {
      setTimeout(() => onProgress(50), 100);
      setTimeout(() => onProgress(100), 500);
    }
    
    // 返回本地 URI（实际使用时应该上传到服务器后返回 URL）
    return fileUri;
  }

  try {
    // 生成文件路径：images/{userId}/{yyyy}/{MM}/{dd}/{uuid}.jpg
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const fileId = fileName || generateUUID();
    const filePath = `images/${userId}/${year}/${month}/${day}/${fileId}.jpg`;

    // 读取文件
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // 上传文件
    // 注意：Supabase JS 客户端的上传方法可能不支持进度回调
    // 这里使用基础的上传方法，如果需要进度，可能需要使用原生模块
    const { data, error } = await supabase.storage
      .from('images') // bucket 名称，需要根据实际情况修改
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: false, // 不覆盖已存在的文件
      });

    if (error) {
      throw new Error(`上传失败: ${error.message}`);
    }

    // 获取公共 URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('获取图片 URL 失败');
    }

    // 模拟进度更新（实际实现中可能需要使用原生模块获取真实进度）
    if (onProgress) {
      onProgress(100);
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error('上传图片失败:', error);
    throw error;
  }
}

/**
 * 检查文件大小（MB）
 */
export function getFileSizeInMB(uri: string): Promise<number> {
  return new Promise((resolve, reject) => {
    fetch(uri)
      .then((response) => response.blob())
      .then((blob) => {
        const sizeInMB = blob.size / (1024 * 1024);
        resolve(sizeInMB);
      })
      .catch(reject);
  });
}

