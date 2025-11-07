import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolate } from 'react-native-reanimated';

interface PlanCancelButtonProps {
  selectedPlan: 'pro' | 'basic' | null;
  onCancel: () => void;
}

export const PlanCancelButton: React.FC<PlanCancelButtonProps> = ({
  selectedPlan,
  onCancel,
}) => {
  const cancelAnim = useSharedValue(0);

  React.useEffect(() => {
    if (selectedPlan) {
      cancelAnim.value = withTiming(1, { duration: 350 });
    } else {
      cancelAnim.value = withTiming(0, { duration: 350 });
    }
  }, [selectedPlan]);

  const cancelAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cancelAnim.value,
      transform: [
        {
          translateY: interpolate(cancelAnim.value, [0, 1], [40, 0]),
        },
      ],
      pointerEvents: cancelAnim.value > 0.5 ? 'auto' : 'none',
    };
  });

  return (
    <Animated.View style={cancelAnimatedStyle} className="mb-6">
      <TouchableOpacity onPress={onCancel}>
        <Text className="text-gray-500 text-sm text-center">随时取消</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

