import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { LoginHeader } from '../../components/common/LoginHeader';
import { PhoneDisplay } from '../../components/login/PhoneDisplay';
import { useUserStore } from '../../store/userStore';

const MOCK_PHONE = '15012346382';

export default function LoginMain() {
  const router = useRouter();
  const { userInfo } = useUserStore();
  const displayPhone = userInfo.phone || MOCK_PHONE;
  
  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="登录" />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-white text-base text-center mb-[150px] mt-10">登录手机号</Text>
        <PhoneDisplay phone={displayPhone} />
        <TouchableOpacity onPress={() => router.push('/login/phone')}>
          <Text className="text-[#A5B4FC] text-[14px] mb-10 text-center underline">
            其他手机号登录
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-full bg-white/20 rounded-3xl py-4 items-center mt-[150px]"
          onPress={() => router.push('/login/name')}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">一键登录</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
