import React from 'react';
import { View, Text } from 'react-native';
import { SettingItem } from '../common/SettingItem';

interface AccountSectionProps {
  userName: string;
  wechatLinked: string;
  phoneLinked: string | null;
  emailLinked: string | null;
}

export function AccountSection({
  userName,
  wechatLinked,
  phoneLinked,
  emailLinked,
}: AccountSectionProps) {
  return (
    <>
      <Text className="text-white text-base font-semibold mb-3 ml-4">我的账户</Text>
      <View className="bg-white/10 rounded-2xl mb-6 overflow-hidden">
        <SettingItem label="用户名" value={userName} showArrow={false} />
        <View className="h-px bg-white/10" />
        <SettingItem label="关联微信" value={wechatLinked} showArrow={true} />
        <View className="h-px bg-white/10" />
        <SettingItem
          label="关联手机号"
          value={phoneLinked || '去绑定'}
          showArrow={true}
          isAction={!phoneLinked}
        />
        <View className="h-px bg-white/10" />
        <SettingItem
          label="关联邮箱"
          value={emailLinked || ''}
          showArrow={true}
          isAction={!emailLinked}
        />
        <View className="h-px bg-white/10" />
        <SettingItem label="修改密码" value="" showArrow={true} />
      </View>
    </>
  );
}

