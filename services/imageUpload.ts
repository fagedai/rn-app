import { generateUUID } from '@/utils/uuid';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

// 上传超时时间：2分钟（120秒）
const UPLOAD_TIMEOUT = 120000; // 120秒 = 2分钟

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
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase 未配置，使用本地 URI 作为临时方案。请在 services/supabase.ts 中配置 Supabase URL 和 Anon Key');
    
    // 模拟上传进度
    if (onProgress) {
      setTimeout(() => onProgress(50), 100);
      setTimeout(() => onProgress(100), 500);
    }
    
    // 返回本地 URI（实际使用时应该上传到服务器后返回 URL）
    return fileUri;
  }

  try {
    // 生成文件路径：{userId}/{yyyy}/{MM}/{dd}/{uuid}.jpg
    // 注意：不包含 bucket 名称前缀，因为 .from('images') 已经指定了 bucket
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const fileId = fileName || generateUUID();
    const filePath = `${userId}/${year}/${month}/${day}/${fileId}.jpg`;

    // 在 React Native 中，使用 expo-file-system 读取文件
    // 读取文件为 base64，然后转换为 Uint8Array
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // 将 base64 转换为 Uint8Array
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 上传文件（带超时控制）
    // 注意：Supabase JS 客户端的上传方法可能不支持进度回调
    // 这里使用基础的上传方法，如果需要进度，可能需要使用原生模块
    const uploadPromise = supabase.storage
      .from('images') // bucket 名称，需要根据实际情况修改
      .upload(filePath, bytes, {
        contentType: 'image/jpeg',
        upsert: false, // 不覆盖已存在的文件
      });

    // 创建超时 Promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('上传超时，请检查网络连接后重试'));
      }, UPLOAD_TIMEOUT);
    });

    // 使用 Promise.race 实现超时控制
    // 如果超时，timeoutPromise 会 reject，整个 Promise 会失败
    const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);

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
export async function getFileSizeInMB(uri: string): Promise<number> {
  try {
    // 使用 legacy API 获取文件信息
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('文件不存在');
    }
    
    // 如果文件信息中包含大小，直接使用
    if (fileInfo.size !== undefined) {
      return fileInfo.size / (1024 * 1024);
    }
    
    // 否则读取文件来计算大小
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // base64 字符串的大小约为实际文件大小的 4/3
    const sizeInBytes = (base64.length * 3) / 4;
    return sizeInBytes / (1024 * 1024);
  } catch (error) {
    console.error('获取文件大小失败:', error);
    throw error;
  }
}

