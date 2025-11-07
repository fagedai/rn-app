import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface PlanActionButtonProps {
  selectedPlan: 'pro' | 'basic' | null;
  onPayment?: () => void;
  onNext?: () => void;
}

export const PlanActionButton: React.FC<PlanActionButtonProps> = ({
  selectedPlan,
  onPayment,
  onNext,
}) => {
  const buttonAnim = useSharedValue(0);

  React.useEffect(() => {
    if (selectedPlan) {
      buttonAnim.value = withTiming(1, { duration: 350 });
    } else {
      buttonAnim.value = withTiming(0, { duration: 350 });
    }
  }, [selectedPlan]);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonAnim.value,
      transform: [
        {
          translateY: interpolate(buttonAnim.value, [0, 1], [40, 0]),
        },
      ],
      pointerEvents: buttonAnim.value > 0.5 ? 'auto' : 'none',
    };
  });

  return (
    <Animated.View style={buttonAnimatedStyle} className="mb-4 mt-8">
      {selectedPlan === 'pro' ? (
        <TouchableOpacity
          onPress={onPayment}
          activeOpacity={0.8}
          className="overflow-hidden rounded-2xl"
          disabled={!selectedPlan}
        >
          <LinearGradient
            colors={['#9333ea', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 px-6 items-center"
          >
            <Text className="text-white text-lg font-bold">去支付</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onNext}
          activeOpacity={0.8}
          className="bg-gray-700 py-4 px-6 rounded-2xl items-center"
          disabled={!selectedPlan}
        >
          <Text className="text-white text-lg font-bold">下一步</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

