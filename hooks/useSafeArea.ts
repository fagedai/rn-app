import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

/**
 * 自定义 hook，提供常用的安全区域值
 * 用于处理不同设备上的状态栏、刘海屏、底部指示器等安全区域
 */
export function useSafeArea() {
  const insets = useSafeAreaInsets();

  return {
    /** 顶部安全区域（状态栏高度 + 刘海区域） */
    top: insets.top,
    /** 底部安全区域（底部指示器高度） */
    bottom: insets.bottom,
    /** 左侧安全区域 */
    left: insets.left,
    /** 右侧安全区域 */
    right: insets.right,
    /** 获取顶部间距（包含 Header 高度，通常用于 LoginHeader 下面的内容） */
    getTopSpacing: (headerHeight: number = 44, extraSpacing: number = 0) => {
      return insets.top + headerHeight + extraSpacing;
    },
    /** 获取底部间距（包含底部安全区域） */
    getBottomSpacing: (extraSpacing: number = 0) => {
      return insets.bottom + extraSpacing;
    },
    /** 是否为 iOS */
    isIOS: Platform.OS === 'ios',
    /** 是否为 Android */
    isAndroid: Platform.OS === 'android',
  };
}

