import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingItemProps {
  label: string;
  value: string;
  showArrow: boolean;
  isAction?: boolean;
}

export function SettingItem({
  label,
  value,
  showArrow,
  isAction = false,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      className="px-4 py-4 flex-row items-center justify-between"
      activeOpacity={0.7}
    >
      <Text className="text-white text-sm">{label}</Text>
      <View className="flex-row items-center">
        {value && (
          <Text className="text-sm mr-2 text-gray-400">{value}</Text>
        )}
        {showArrow && (
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
  );
}

