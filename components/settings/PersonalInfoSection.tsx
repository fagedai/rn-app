import React from 'react';
import { View, Text } from 'react-native';
import { SettingItem } from '../common/SettingItem';
import { PersonalInfoItem } from './PersonalInfoItem';
import { GenderType } from '../../store/userStore';

interface PersonalInfoSectionProps {
  birthdayText: string;
  userGender: GenderType | null;
}

export function PersonalInfoSection({
  birthdayText,
  userGender,
}: PersonalInfoSectionProps) {
  return (
    <>
      <Text className="text-white text-base font-semibold mb-3 ml-4">个人信息</Text>
      <View className="bg-white/10 rounded-2xl mb-6 overflow-hidden">
        <SettingItem label="生日" value={birthdayText} showArrow={true} />
        <View className="h-px bg-white/10" />
        <PersonalInfoItem label="性别" gender={userGender} showArrow={true} />
        <View className="h-px bg-white/10" />
        <SettingItem
          label="感兴趣的东西"
          value="去绑定"
          showArrow={true}
          isAction={true}
        />
        <View className="h-px bg-white/10" />
        <SettingItem label="用户背景" value="" showArrow={true} />
      </View>
    </>
  );
}

