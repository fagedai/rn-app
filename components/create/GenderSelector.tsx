import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface GenderSelectorProps {
  gender: 'male' | 'female';
  onGenderChange: (gender: 'male' | 'female') => void;
}

export const GenderSelector: React.FC<GenderSelectorProps> = ({
  gender,
  onGenderChange,
}) => {
  return (
    <View className="flex-row items-center justify-center">
      <Text className="text-white text-base mr-3">性别:</Text>
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{
          backgroundColor: gender === 'female' ? '#ec4899' : '#3b82f6',
        }}
      >
        <Text className="text-white text-lg font-bold">
          {gender === 'female' ? '♀' : '♂'}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onGenderChange(gender === 'female' ? 'male' : 'female')}
        className="px-4 py-2 rounded-full"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
        }}
      >
        <Text className="text-white text-sm">修改</Text>
      </TouchableOpacity>
    </View>
  );
};

