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
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: 260,
          height: 12,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderRadius: 6,
              shadowColor: '#FFFFFF',
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4, // Android shadow
            },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

