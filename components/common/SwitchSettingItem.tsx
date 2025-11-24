import React from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';

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
    <View className="px-0 flex-row items-center justify-between" style={{ paddingVertical: 0 }}>
      <Text className="text-white" style={{ fontSize: 16 }}>{label}</Text>
      <View style={styles.switchContainer}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ 
            false: 'rgba(118, 117, 119, 0.5)', 
            true: '#49234F' // 退出登录按钮的颜色
          }}
          thumbColor={'#FFFFFF'}
          ios_backgroundColor="rgba(118, 117, 119, 0.5)"
          style={styles.switch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    width: 48,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }], // 等比例放大，使按钮和轨道等大
  },
});

