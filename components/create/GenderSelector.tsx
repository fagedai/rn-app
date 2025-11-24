import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface GenderSelectorProps {
  gender: 0 | 1 | 2; // 0=男, 1=女, 2=不愿意透露
  onGenderChange: (gender: 0 | 1 | 2) => void;
}

export const GenderSelector: React.FC<GenderSelectorProps> = ({
  gender,
  onGenderChange,
}) => {
  // 将数字转换为显示：0=男, 1=女, 2=不愿意透露（显示为女）
  const isFemale = gender === 1 || gender === 2;
  
  // 切换时：0->1, 1->0, 2->0
  const handleToggle = () => {
    if (gender === 0) {
      onGenderChange(1);
    } else {
      onGenderChange(0);
    }
  };

  return (
    <View className="flex-row items-center justify-center">
      <Text className="text-white text-base mr-3">性别:</Text>
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{
          backgroundColor: isFemale ? '#ec4899' : '#3b82f6',
        }}
      >
        <Text className="text-white text-lg font-bold">
          {isFemale ? '♀' : '♂'}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleToggle}
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

