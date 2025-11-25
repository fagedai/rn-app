/**
 * 图标调整工具页面
 * 访问此页面可以将 logo.png 调整为 1024x1024 的图标尺寸
 * 
 * 使用方法：
 * 1. 在 Expo Go 或开发环境中导航到此页面
 * 2. 等待处理完成
 * 3. 根据提示保存处理后的图片
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { Asset } from 'expo-asset';

const ICON_SIZE = 1024;

export default function ResizeIconScreen() {
  const [status, setStatus] = useState<string>('准备中...');
  const [resultUri, setResultUri] = useState<string | null>(null);

  useEffect(() => {
    resizeIcon();
  }, []);

  const resizeIcon = async () => {
    try {
      setStatus('正在加载原始图片...');
      
      // 加载原始 logo
      const logoAsset = Asset.fromModule(require('@/assets/logo.png'));
      await logoAsset.downloadAsync();
      
      if (!logoAsset.localUri) {
        throw new Error('无法加载 logo.png');
      }

      setStatus('正在调整图片尺寸...');

      // 调整图片大小到 1024x1024
      const result = await ImageManipulator.manipulateAsync(
        logoAsset.localUri,
        [{ resize: { width: ICON_SIZE, height: ICON_SIZE } }],
        {
          compress: 1, // 不压缩，保持最高质量
          format: ImageManipulator.SaveFormat.PNG, // 使用 PNG 格式保持透明度
        }
      );

      setResultUri(result.uri);
      setStatus(`处理完成！尺寸: ${result.width}x${result.height}px`);

      Alert.alert(
        '图标处理完成',
        `图片已调整为 ${ICON_SIZE}x${ICON_SIZE}px\n\n处理后的图片路径：\n${result.uri}\n\n请查看控制台日志获取完整路径，然后手动将图片复制到 assets/logo.png 替换原文件`,
        [{ text: '确定' }]
      );
      
      console.log('='.repeat(50));
      console.log('图标处理完成！');
      console.log(`处理后的图片路径: ${result.uri}`);
      console.log(`图片尺寸: ${result.width}x${result.height}px`);
      console.log('请手动将处理后的图片复制到 assets/logo.png');
      console.log('='.repeat(50));
    } catch (error) {
      console.error('处理失败:', error);
      setStatus(`处理失败: ${String(error)}`);
      Alert.alert('处理失败', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>图标调整工具</Text>
      <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      <Text style={styles.status}>{status}</Text>
      {resultUri && (
        <Text style={styles.result}>处理后的图片路径：{resultUri}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  loader: {
    marginVertical: 20,
  },
  status: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  result: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    padding: 10,
  },
});

