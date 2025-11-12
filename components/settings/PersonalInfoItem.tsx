import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GenderType } from '../../store/userStore';

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
  return (
    <TouchableOpacity
      className="px-4 py-4 flex-row items-center justify-between"
      activeOpacity={0.7}
    >
      <Text className="text-white text-sm">{label}</Text>
      <View className="flex-row items-center">
        {gender && (
          <View className="w-6 h-6 rounded-full items-center justify-center mr-3">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: gender === '女' ? '#ec4899' : '#3b82f6',
              }}
            >
              <Text className="text-white text-lg font-bold">
                {gender === '女' ? '♀' : '♂'}
              </Text>
            </View>
          </View>
        )}
        {showArrow && (
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
  );
}

