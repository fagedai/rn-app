import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface ProgressBarProps {
  progress?: number; // 0-100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress = 10 }) => {
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 500 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value}%`,
    };
  });

  return (
    <View className="mt-4 mb-8">
      <View
        style={{
          width: '100%',
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: '#9333ea',
              borderRadius: 2,
            },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

