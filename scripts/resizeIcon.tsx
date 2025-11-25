/**
 * 图标调整工具
 * 在 Expo 开发环境中运行此脚本，将 logo.png 调整为 1024x1024 的图标尺寸
 * 
 * 使用方法：
 * 1. 在项目中创建一个临时页面，导入此组件
 * 2. 或者直接在开发环境中运行
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

const ICON_SIZE = 1024;

export default function ResizeIconScreen() {
  useEffect(() => {
    resizeIcon();
  }, []);

  const resizeIcon = async () => {
    try {
      console.log('开始处理图标...');
      
      // 加载原始 logo
      const logoAsset = Asset.fromModule(require('@/assets/logo.png'));
      await logoAsset.downloadAsync();
      
      if (!logoAsset.localUri) {
        throw new Error('无法加载 logo.png');
      }

      console.log('原始图片路径:', logoAsset.localUri);

      // 调整图片大小到 1024x1024
      const result = await ImageManipulator.manipulateAsync(
        logoAsset.localUri,
        [{ resize: { width: ICON_SIZE, height: ICON_SIZE } }],
        {
          compress: 1, // 不压缩，保持最高质量
          format: ImageManipulator.SaveFormat.PNG, // 使用 PNG 格式保持透明度
        }
      );

      console.log('处理后的图片路径:', result.uri);
      console.log('处理后的图片尺寸:', result.width, 'x', result.height);

      // 注意：在开发环境中，我们无法直接覆盖 assets 文件夹中的文件
      // 用户需要手动将处理后的图片复制到 assets/icon2.png
      Alert.alert(
        '图标处理完成',
        `图片已调整为 ${ICON_SIZE}x${ICON_SIZE}px\n\n请将处理后的图片保存为 assets/icon2.png\n\n处理后的图片路径：\n${result.uri}`,
        [{ text: '确定' }]
      );
    } catch (error) {
      console.error('处理失败:', error);
      Alert.alert('处理失败', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>正在处理图标...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});

