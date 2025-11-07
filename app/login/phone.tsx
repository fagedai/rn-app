import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { LoginHeader } from '../../components/common/LoginHeader';
import { PhoneInput } from '../../components/login/PhoneInput';
import { useUserStore } from '../../store/userStore';

export default function LoginPhone() {
  const router = useRouter();
  const { userInfo, setPhone, setCode } = useUserStore();

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="登录" />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-white text-base text-center mb-[150px] -mt-10">
          请输入您的短信验证码
        </Text>
        <PhoneInput
          phone={userInfo.phone}
          code={userInfo.code}
          onPhoneChange={setPhone}
          onCodeChange={setCode}
        />
        <TouchableOpacity
          className="w-full bg-transparent border border-white/30 rounded-full py-4 items-center mt-[150px] shadow-lg shadow-white/10"
          onPress={() => router.push('/login/name')}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">进入</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
