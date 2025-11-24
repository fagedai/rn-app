import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingItemProps {
  label: string;
  value: string;
  showArrow: boolean;
  isAction?: boolean;
  actionText?: string;
  onPress?: () => void;
}

export function SettingItem({
  label,
  value,
  showArrow,
  isAction = false,
  actionText,
  onPress,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      className="px-0 flex-row items-center justify-between"
      style={{ paddingVertical: 0 }}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text className="text-white" style={{ fontSize: 16 }}>{label}</Text>
      <View className="flex-row items-center">
        {value ? (
          <Text className="text-gray-400 mr-2" style={{ fontSize: 16 }}>{value}</Text>
        ) : isAction && actionText ? (
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.6)', marginRight: 8 }}>{actionText}</Text>
        ) : null}
        {showArrow && (
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
  );
}

