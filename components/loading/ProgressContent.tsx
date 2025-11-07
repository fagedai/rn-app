import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import ProgressCircle from './ProgressCircle';
import AnimatedSphere from './AnimatedSphere';
import ProgressPercentage from './ProgressPercentage';
import Animated from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProgressContentProps {
  progress: number;
  progressAnimated: Animated.SharedValue<number>;
}

export default function ProgressContent({ progress, progressAnimated }: ProgressContentProps) {
  return (
    <View className="items-center justify-center" style={{ marginTop: SCREEN_HEIGHT * 0.15 }}>
      <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        <ProgressCircle progressAnimated={progressAnimated} />
        <View style={{ position: 'absolute' }}>
          <AnimatedSphere />
        </View>
      </View>

      <ProgressPercentage progress={progress} />

      <Text className="text-white/80 text-base mt-6 text-center">
        正在为您制作定制化伴侣
      </Text>
    </View>
  );
}

