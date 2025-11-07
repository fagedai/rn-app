import React, { useEffect, useState } from 'react';
import { View, ImageBackground } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import TitleHeader from '../../components/loading/TitleHeader';
import ProgressContent from '../../components/loading/ProgressContent';

export default function LoadingProgress() {
  const [progress, setProgress] = useState(0);
  const progressAnimated = useSharedValue(0);

  // 进度动画：从0到100%
  useEffect(() => {
    progressAnimated.value = withTiming(100, {
      duration: 5000, // 5秒完成
      easing: Easing.out(Easing.ease),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 更新进度值
  useAnimatedReaction(
    () => progressAnimated.value,
    (value) => {
      runOnJS(setProgress)(value);
    }
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ImageBackground
        source={require('../../assets/background.png')}
        resizeMode="cover"
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center px-6">
            <TitleHeader />
            <ProgressContent progress={progress} progressAnimated={progressAnimated} />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

