import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  borderRadius?: number | {
    topLeft?: number;
    topRight?: number;
    bottomLeft?: number;
    bottomRight?: number;
  };
  borderWidth?: number;
  borderColor?: string;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  highlightHeight?: number;
  showLeftHighlight?: boolean;
}

/**
 * 通用玻璃效果容器组件
 * 提供统一的磨砂玻璃效果，包括：
 * - BlurView 模糊层
 * - 噪点纹理层
 * - 内发光高光
 * - 内层柔光
 * - 可选的左侧高光
 */
export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  style,
  borderRadius = 18,
  borderWidth = 1,
  borderColor = 'rgba(255, 255, 255, 0.18)',
  intensity = 5,
  tint = 'light',
  highlightHeight = 80,
  showLeftHighlight = false,
}) => {
  // 处理 borderRadius，支持数字或对象
  const borderRadiusValue = typeof borderRadius === 'number' 
    ? borderRadius 
    : borderRadius.topLeft || 0;
  
  const borderRadiusStyle = typeof borderRadius === 'number'
    ? { borderRadius }
    : {
        borderTopLeftRadius: borderRadius.topLeft || 0,
        borderTopRightRadius: borderRadius.topRight || 0,
        borderBottomLeftRadius: borderRadius.bottomLeft || 0,
        borderBottomRightRadius: borderRadius.bottomRight || 0,
      };

  return (
    <View
      style={[
        {
          overflow: 'hidden',
          borderWidth,
          borderColor,
          backgroundColor: 'transparent',
          ...borderRadiusStyle,
        },
        style,
      ]}
    >
      {/* 1. BlurView 模糊层 - 更透明，背景更清晰 */}
      <BlurView
        intensity={intensity}
        tint={tint}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent',
          ...borderRadiusStyle,
        }}
      />

      {/* 2. 噪点纹理层 - 更淡的纹理 */}
      <Image
        source={require('@/assets/noisy.png')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.02,
          resizeMode: 'cover',
          ...borderRadiusStyle,
        }}
      />

      {/* 3. 内发光高光 - 极淡渐变 */}
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.08)',
          'rgba(255, 255, 255, 0.03)',
          'rgba(255, 255, 255, 0)',
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: highlightHeight,
          ...borderRadiusStyle,
        }}
        pointerEvents="none"
      />

      {/* 4. 左侧高光（可选） */}
      {showLeftHighlight && (
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.08)',
            'rgba(255, 255, 255, 0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 60,
            bottom: 0,
            ...borderRadiusStyle,
          }}
          pointerEvents="none"
        />
      )}

      {/* 5. 内层柔光 - 极淡渐变 */}
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.03)',
          'rgba(255, 255, 255, 0.01)',
          'rgba(255, 255, 255, 0.00)',
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          ...borderRadiusStyle,
        }}
        pointerEvents="none"
      />

      {/* 内容层 */}
      {children}
    </View>
  );
};

