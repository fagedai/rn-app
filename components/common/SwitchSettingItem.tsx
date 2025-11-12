import React from 'react';
import { View, Text, Switch } from 'react-native';

interface SwitchSettingItemProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function SwitchSettingItem({
  label,
  value,
  onValueChange,
}: SwitchSettingItemProps) {
  return (
    <View className="px-4 py-4 flex-row items-center justify-between">
      <Text className="text-white text-sm">{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: '#8b5cf6' }}
        thumbColor={value ? '#a78bfa' : '#f4f3f4'}
      />
    </View>
  );
}

