import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GenderType } from '../../store/userStore';
import { genderCodeToSymbol } from '../../utils/genderUtils';

interface PersonalInfoItemProps {
  label: string;
  gender: GenderType | null;
  showArrow: boolean;
}

export function PersonalInfoItem({
  label,
  gender,
  showArrow,
}: PersonalInfoItemProps) {
  const router = useRouter();
  
  // 将数字性别代码转换为显示符号
  const genderSymbol = gender ? genderCodeToSymbol(gender) : '';

  return (
    <TouchableOpacity
      className="px-0 flex-row items-center justify-between"
      style={{ paddingVertical: 0 }}
      activeOpacity={0.7}
      onPress={() => {
        router.push('/(settings)/edit-gender');
      }}
    >
      <Text className="text-white" style={{ fontSize: 16 }}>{label}</Text>
      <View className="flex-row items-center">
        {genderSymbol ? (
          <Text className="text-white/60 text-base mr-2">{genderSymbol}</Text>
        ) : null}
        {showArrow && (
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
  );
}

