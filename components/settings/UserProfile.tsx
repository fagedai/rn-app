import React from 'react';
import { View, Text, Image } from 'react-native';
import { GenderType } from '../../store/userStore';
import { genderCodeToSymbol } from '../../utils/genderUtils';

interface UserProfileProps {
  userName: string;
  userGender: GenderType | null;
}

export function UserProfile({ userName, userGender }: UserProfileProps) {
  // 将数字性别代码转换为显示符号
  const genderSymbol = userGender ? genderCodeToSymbol(userGender) : '';
  
  return (
    <View className="items-center mb-6">
      <View className="w-24 h-24 rounded-full bg-gray-400 mb-3 overflow-hidden">
        <Image
          source={require('../../assets/icon2.png')}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      <Text className="text-white text-lg font-semibold">{userName}</Text>
      {genderSymbol ? (
        <Text className="text-white/60 text-sm mt-1">{genderSymbol}</Text>
      ) : null}
    </View>
  );
}

