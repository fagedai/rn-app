import React, { useRef, useEffect } from 'react';
import { View, ImageBackground, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginHeader } from '../../components/common/LoginHeader';
import { StepIndicator } from '../../components/common/StepIndicator';
import { NavigationButtons } from '../../components/common/NavigationButtons';
import { GenderPicker } from '../../components/login/GenderPicker';
import { useUserStore, GenderType } from '../../store/userStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 80;

export default function LoginGender() {
  const router = useRouter();
  const { userInfo, setGender } = useUserStore();
  const selectedGender = userInfo.gender || '女';
  const scrollViewRef = useRef<ScrollView>(null);

  const genders: readonly GenderType[] = ['男', '女', '其他'];

  useEffect(() => {
    const defaultIndex = genders.indexOf(selectedGender);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: defaultIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="你的性别" />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          <View
            style={{
              height: ITEM_HEIGHT * 5,
              marginTop: SCREEN_HEIGHT * 0.25,
              marginBottom: 200,
              justifyContent: 'center',
            }}
          >
            <GenderPicker
              genders={genders}
              selectedGender={selectedGender}
              onGenderChange={setGender}
              scrollRef={scrollViewRef}
            />
          </View>

          <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
            <StepIndicator currentStep={2} />
            <NavigationButtons
              onBack={() => router.back()}
              onNext={() => router.push('/login/birthday')}
            />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

