import React from 'react';
import { View, StyleSheet } from 'react-native';
import StarParticles from './StarParticles';
import ProgressText from '@/components/loading/ProgressText';
import type { SharedValue } from 'react-native-reanimated';

interface ProgressContentProps {
  progress: number;
  progressAnimated: SharedValue<number>;
}

// 使用 React.memo 确保 StarParticles 不会因为 progress 变化而重新渲染
const StarParticlesWrapper = React.memo(() => <StarParticles />);
StarParticlesWrapper.displayName = 'StarParticlesWrapper';

export default function ProgressContent({ progress, progressAnimated }: ProgressContentProps) {
  return (
    <View style={[styles.container]}>
      {/* 星点动画 - 绝对定位，水平垂直居中，完全独立于百分比动画 */}
      <StarParticlesWrapper />
      {/* 百分比文字 - 绝对定位，水平垂直居中 */}
      <ProgressText progress={progress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

