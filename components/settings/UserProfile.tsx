import React from 'react';
import { View, Text, Image } from 'react-native';

interface UserProfileProps {
  userName: string;
}

export function UserProfile({ userName }: UserProfileProps) {
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
    </View>
  );
}

