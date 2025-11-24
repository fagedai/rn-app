import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EMOJI_ASSETS } from '@/utils/emoji-assets';

interface EmojiSvgProps {
  filename: string; // SVG 文件名
  size?: number;
  style?: any;
}

/**
 * SVG 表情组件
 * 根据文件名加载并渲染 SVG 表情
 * 使用 react-native-svg-transformer 将 SVG 转换为 React 组件
 */
export const EmojiSvg: React.FC<EmojiSvgProps> = ({
  filename,
  size = 24,
  style,
}) => {
  const SvgComponent = EMOJI_ASSETS[filename];

  if (!SvgComponent) {
    // 如果找不到对应的资源，返回空视图
    return (
      <View style={[styles.container, { width: size, height: size }, style]} />
    );
  }

  // 使用 react-native-svg-transformer 后，SVG 会被转换为 React 组件
  // 获取实际的组件（可能是 default 导出）
  const Component = React.useMemo(() => {
    if (!SvgComponent) return null;
    
    // 如果是函数，直接使用
    if (typeof SvgComponent === 'function') {
      return SvgComponent;
    }
    
    // 如果是对象，尝试获取 default
    if (typeof SvgComponent === 'object') {
      return (SvgComponent as any).default || SvgComponent;
    }
    
    return null;
  }, [SvgComponent]);

  if (!Component) {
    // 如果无法获取组件，显示占位符
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor: 'rgba(255,255,255,0.1)' }, style]} />
    );
  }

  try {
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Component width={size} height={size} />
      </View>
    );
  } catch (error) {
    console.warn(`Failed to render emoji SVG: ${filename}`, error);
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor: 'rgba(255,255,255,0.1)' }, style]} />
    );
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

