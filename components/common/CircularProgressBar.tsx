import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressBarProps {
  size?: number; // 直径
  strokeWidth?: number; // 圆环宽度
  progress?: number; // 0-100
  color?: string;
  bgColor?: string;
}

export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  size = 80,
  strokeWidth = 8,
  progress = 0,
  color = '#9333ea',
  bgColor = '#eee',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 500 });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressValue.value / 100),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* 背景圆环 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* 进度圆环 */}
        <AnimatedCircle
          animatedProps={animatedProps}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference},${circumference}`}
          strokeLinecap="butt"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
    </View>
  );
};

// 用法示例：
// <CircularProgressBar progress={60} size={100} />
