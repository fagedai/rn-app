import React from 'react';
import { View, Text, ImageBackground, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '../../components/login/ProgressBar';
import { RoleOption } from '../../components/login/RoleOption';
import { NavigationButtons } from '../../components/common/NavigationButtons';
import { useCreateStore } from '../../store/createStore';

const OPTIONS = [
  '完全不同的东西',
  '一个帮助我实现目标的教练',
  '完全不同的东西',
  '一个英语导师来练习',
  '特别的人',
];

export default function AIRoleSelection() {
  const router = useRouter();
  const { selectedRole, setSelectedRole } = useCreateStore();

  const handleNext = () => {
    console.log('Selected option:', selectedRole);
    // 跳转到加载进度页面
    router.push('/create/loading');
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          <ProgressBar progress={selectedRole ? 10 : 0} />

          <View className="mb-14">
            <Text className="text-white text-xl text-center font-medium">
              你希望你的AI机器人成为你的什么?
            </Text>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {OPTIONS.map((option, index) => (
              <RoleOption
                key={index}
                option={option}
                isSelected={selectedRole === option}
                onPress={() => setSelectedRole(option)}
              />
            ))}
          </ScrollView>

          <NavigationButtons
            onBack={() => router.back()}
            onNext={handleNext}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

