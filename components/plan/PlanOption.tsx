import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';

interface PlanOptionProps {
  title: string;
  price: string;
  originalPrice?: string;
  isSelected: boolean;
  onPress: () => void;
  delay?: number;
  showBadge?: boolean;
  badgeText?: string;
}

export const PlanOption: React.FC<PlanOptionProps> = ({
  title,
  price,
  originalPrice,
  isSelected,
  onPress,
  delay = 0,
  showBadge = false,
  badgeText = '',
}) => {
  return (
    <Animated.View entering={SlideInDown.delay(delay).duration(500)}>
      <TouchableOpacity
        onPress={onPress}
        className="relative flex-row items-center justify-between mb-4 rounded-xl"
        style={{
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? 'rgba(168, 85, 247, 1)' : 'rgba(55, 65, 81, 1)',
          backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.1)' : 'rgba(17, 24, 39, 0.3)',
        }}
        activeOpacity={0.7}
      >
        {showBadge && isSelected && (
          <View className="absolute -top-2 left-8 z-10">
            <View className="px-3 py-1 bg-pink-500 rounded-lg shadow-lg">
              <Text className="text-white text-xs font-bold">{badgeText}</Text>
            </View>
          </View>
        )}

        <View className="flex-row items-center flex-1 p-4">
          {isSelected ? (
            <View className="w-5 h-5 rounded-full bg-purple-500 items-center justify-center mr-3">
              <View className="w-2 h-2 rounded-full bg-white" />
            </View>
          ) : (
            <View className="w-5 h-5 rounded-full border-2 border-white mr-3" />
          )}
          <Text className="text-white text-base font-medium">{title}</Text>
        </View>

        <View
          className="rounded-xl px-5 py-3 items-end"
          style={{
            backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
            borderWidth: isSelected ? 1 : 0,
            borderColor: isSelected ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
          }}
        >
          <Text className="text-white text-lg font-bold">{price}</Text>
          {originalPrice && (
            <Text className="text-gray-300 text-xs line-through">{originalPrice}</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

