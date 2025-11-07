import React from 'react';
import { View, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginHeader } from '../../components/common/LoginHeader';
import { StepIndicator } from '../../components/common/StepIndicator';
import { SingleNavButton } from '../../components/common/SingleNavButton';
import { NameInput } from '../../components/login/NameInput';
import { useUserStore } from '../../store/userStore';

export default function LoginName() {
  const router = useRouter();
  const { userInfo, setName } = useUserStore();
  const name = userInfo.name || '小张';

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="你的名字" />
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center px-6">
          <NameInput value={name} onChangeText={setName} />
          <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
            <StepIndicator currentStep={1} />
            <SingleNavButton
              text="下一步"
              onPress={() => router.push('/login/gender')}
            />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

