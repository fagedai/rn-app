import React from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolate } from 'react-native-reanimated';

const PRO_FEATURES = [
  '每日无限次文字互动',
  'AI自动学习你的语气与偏好',
  '解锁所有AI人格风格',
  '保存所有聊天记录',
  '每周赠送解锁语音或故事',
  '每月赠送1次生成情感故事',
];

const BASIC_FEATURES = [
  { text: '每日无限次文字互动', included: true },
  { text: 'AI自动学习你的语气与偏好', included: true },
  { text: '解锁所有AI人格风格', included: true },
  { text: '保存所有聊天记录', included: false },
  { text: '每周赠送解锁语音或故事', included: false },
  { text: '每月赠送1次生成情感故事', included: false },
];

interface PlanFeaturesCardProps {
  selectedPlan: 'pro' | 'basic' | null;
}

export const PlanFeaturesCard: React.FC<PlanFeaturesCardProps> = ({ selectedPlan }) => {
  const contentOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (selectedPlan) {
      contentOpacity.value = withTiming(1, { duration: 300 });
    } else {
      contentOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [selectedPlan]);

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [
        {
          translateY: interpolate(contentOpacity.value, [0, 1], [20, 0]),
        },
      ],
    };
  });

  if (!selectedPlan) return null;

  const features = selectedPlan === 'pro' ? PRO_FEATURES : BASIC_FEATURES;
  const planName = selectedPlan === 'pro' ? 'VIP 升级套餐' : '基础套餐';

  return (
    <Animated.View
      style={contentAnimatedStyle}
      className="mb-6 mt-8"
    >
      <View className="bg-purple-500/20 rounded-3xl p-6 border border-purple-500/30 relative overflow-hidden">
        {selectedPlan === 'pro' && (
          <>
            <View className="absolute -left-8 -top-8 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl" />
            <View className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />
            <View className="absolute right-4 top-4 w-16 h-16 bg-purple-300/10 rounded-lg rotate-45 blur-sm" />
            <View className="absolute left-4 bottom-4 w-20 h-20 bg-blue-300/10 rounded-lg -rotate-45 blur-sm" />
          </>
        )}

        <View className="relative z-10">
          {features.map((feature, index) => {
            const featureText = typeof feature === 'string' ? feature : feature.text;
            const isIncluded = typeof feature === 'string' ? true : feature.included;

            return (
              <View key={index} className="flex-row items-center mb-4">
                {isIncluded ? (
                  <View className="w-5 h-5 rounded-full bg-purple-500 items-center justify-center mr-3">
                    <Text className="text-white text-xs">✓</Text>
                  </View>
                ) : (
                  <View className="w-5 h-5 rounded-full border-2 border-red-500 items-center justify-center mr-3">
                    <Text className="text-red-500 text-xs">✗</Text>
                  </View>
                )}
                <Text
                  className={`text-sm flex-1 ${
                    isIncluded ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {featureText}
                </Text>
              </View>
            );
          })}
        </View>

        <View className="relative z-10 mt-4 items-end">
          <Text className="text-white text-lg font-bold">{planName}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

