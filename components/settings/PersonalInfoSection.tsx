import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SettingItem } from '../common/SettingItem';
import { PersonalInfoItem } from './PersonalInfoItem';
import { GenderType } from '../../store/userStore';
import { GlassContainer } from '../common/GlassContainer';

interface PersonalInfoSectionProps {
  birthdayText: string;
  userGender: GenderType | null;
}

export function PersonalInfoSection({
  birthdayText,
  userGender,
}: PersonalInfoSectionProps) {
  const router = useRouter();

  return (
    <>
      <Text className="text-white text-base font-semibold mb-3 ml-4">个人信息</Text>
      <GlassContainer borderRadius={18}>
        <View style={{ paddingVertical: 28, paddingHorizontal: 20 }}>
          <SettingItem 
            label="生日" 
            value={birthdayText} 
            showArrow={true}
            onPress={() => {
              router.push('/(settings)/edit-birthday');
            }}
          />
          <View className="h-px bg-white/10" style={{ marginVertical: 18 }} />
          <PersonalInfoItem label="性别" gender={userGender} showArrow={true} />
          <View className="h-px bg-white/10" style={{ marginVertical: 18 }} />
          <SettingItem
            label="感兴趣的东西"
            value=""
            showArrow={true}
            isAction={true}
            onPress={() => {
              router.push('/(settings)/edit-interests');
            }}
          />
          <View className="h-px bg-white/10" style={{ marginVertical: 18 }} />
          <SettingItem 
            label="用户背景" 
            value="" 
            showArrow={true}
            onPress={() => {
              router.push('/(settings)/edit-user-background');
            }}
          />
        </View>
      </GlassContainer>
    </>
  );
}

