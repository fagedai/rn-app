import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SettingItem } from '../common/SettingItem';
import { GlassContainer } from '../common/GlassContainer';

interface AccountSectionProps {
  userName: string;
  phoneLinked: string | null;
}

export function AccountSection({
  userName,
  phoneLinked,
}: AccountSectionProps) {
  const router = useRouter();

  return (
    <>
      <Text className="text-white text-base font-semibold mb-3 ml-4">我的账户</Text>
      <GlassContainer borderRadius={18} style={{ marginBottom: 24 }}>
        <View style={{ paddingVertical: 28, paddingHorizontal: 20 }}>
          <SettingItem 
            label="用户名" 
            value={userName} 
            showArrow={true}
            onPress={() => {
              router.push('/(settings)/edit-username');
            }}
          />
          <View className="h-px bg-white/10" style={{ marginVertical: 18 }} />
          <SettingItem
            label="关联手机号"
            value={phoneLinked || ''}
            showArrow={true}
            isAction={!phoneLinked}
            actionText="去绑定"
            onPress={() => {
              router.push('/(settings)/edit-phone');
            }}
          />
        </View>
      </GlassContainer>
    </>
  );
}

