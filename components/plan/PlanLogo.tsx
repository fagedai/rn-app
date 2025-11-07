import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate } from 'react-native-reanimated';

interface PlanLogoProps {
  selectedPlan: string | null;
}

export const PlanLogo: React.FC<PlanLogoProps> = ({ selectedPlan }) => {
  const iconPosition = useSharedValue(0);

  React.useEffect(() => {
    if (selectedPlan) {
      iconPosition.value = withSpring(1, { damping: 15, stiffness: 100 });
    } else {
      iconPosition.value = withSpring(0, { damping: 15, stiffness: 100 });
    }
  }, [selectedPlan]);

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(iconPosition.value, [0, 1], [0, -180]);
    const scale = interpolate(iconPosition.value, [0, 1], [1, 0.5]);
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  if (selectedPlan) return null;

  return (
    <Animated.View
      style={iconAnimatedStyle}
      className="items-center mb-4 mt-40"
    >
      <View className="w-32 h-32 rounded-full bg-white items-center justify-center">
        <View className="w-20 h-20 rounded-full bg-[#1a1a2e] items-center justify-center">
          <View
            className="w-16 h-2 bg-gray-600 rounded-full"
            style={{ transform: [{ rotate: '45deg' }] }}
          />
        </View>
      </View>
    </Animated.View>
  );
};

