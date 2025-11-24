import React, { useEffect, useState, useMemo } from 'react';
import { View, ImageBackground, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeArea } from '@/hooks/useSafeArea';
import {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import TitleHeader from '@/components/loading/TitleHeader';
import ProgressContent from '@/components/loading/ProgressContent';

export default function LoadingProgress() {
  const router = useRouter();
  const { bottom } = useSafeArea();
  const [progress, setProgress] = useState(0);
  const progressAnimated = useSharedValue(0);
  const [submitted, setSubmitted] = useState(false);
  
  // 底部文本样式（距离底部65px + 安全区域）
  const bottomTextStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: bottom + 65, // 65px + 底部安全区域
    left: 24, // px-6 = 24px
    right: 24, // px-6 = 24px
    alignItems: 'center' as const,
  }), [bottom]);

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

  // 当进度达到100%时，跳转到聊天界面
  useEffect(() => {
    if (progress >= 100 && !submitted) {
      setSubmitted(true);
      // 等待1秒后跳转到聊天界面
      setTimeout(() => {
        router.replace('/(chat)/chat');
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, submitted]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ImageBackground
        source={require('@/assets/chat_background.png')}
        resizeMode="cover"
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center px-6">
            <TitleHeader />
            <ProgressContent progress={progress} progressAnimated={progressAnimated} />
            <View style={bottomTextStyle}>
              <Text
                style={{
                  fontSize: 13,
                  color: '#D9D9D9',
                  textAlign: 'center',
                }}
              >
                正在为您制作定制化伴侣
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

