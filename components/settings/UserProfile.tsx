import React from 'react';
import { View, Text, Image } from 'react-native';
import { GenderType } from '../../store/userStore';

interface UserProfileProps {
  userName: string;
  userGender: GenderType | null;
}

export function UserProfile({ userName, userGender }: UserProfileProps) {
  return (
    <View className="items-center mb-6">
      <View className="w-24 h-24 rounded-full bg-gray-400 mb-3 overflow-hidden">
        <Image
          source={require('../../assets/icon.png')}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      <View className="flex-row items-center">
        <Text className="text-white text-lg font-semibold mr-2">{userName}</Text>
        <View className="w-6 h-6 rounded-full items-center justify-center mr-3">
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{
              backgroundColor: userGender === '女' ? '#ec4899' : '#3b82f6',
            }}
          >
            <Text className="text-white text-lg font-bold">
              {userGender === '女' ? '♀' : '♂'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

