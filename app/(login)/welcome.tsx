import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeArea } from '@/hooks/useSafeArea';

export default function Welcome() {
  const router = useRouter();
  const { top, bottom } = useSafeArea();
  
  // Logo容器样式（距离顶部214px + 安全区域）
  const logoContainerStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: top + 214, // 214px + 顶部安全区域
    left: 0,
    right: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }), [top]);
  
  // 底部文本容器样式
  // 按钮底部在 bottom + 94，假设按钮高度约44px，按钮顶部在 bottom + 94 - 44 = bottom + 50
  // 文本底部应该在按钮顶部上方18px，即 bottom + 50 + 18 = bottom + 68
  // 容器底部设置为文本底部位置
  const textContainerStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: bottom + 184, // 按钮底部94px + 按钮高度约44px + 18px间距 = 156px
    left: '-50%',
    right: '-50%',
    width: '100%' as const,
  }), [bottom]);
  
  // 底部按钮容器样式（距离底部94px + 安全区域）
  const bottomContainerStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: bottom + 94, // 94px + 底部安全区域
    left: 0,
    right: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }), [bottom]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/welcome_background.png')}
        resizeMode="cover"
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          {/* 固定在顶部的Logo（距离顶部214px） */}
          <View style={logoContainerStyle}>
            <View style={{ alignItems: 'center' }}>
              <Image
                source={require('@/assets/icon2.png')}
                className="w-[140px] h-[140px] mb-0"
                resizeMode="contain"
              />
              <Image
                source={require('@/assets/NEST.png')}
                className="w-[100px] h-10"
                resizeMode="contain"
              />
            </View>
          </View>

          {/* 固定在底部的文本（按钮上方18px） */}
          <View style={textContainerStyle}>
            <Text
              style={{
                fontFamily: 'Agbalumo',
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.4)',
                textAlign: 'center',
                width: '100%',
              }}
            >
              Your AI Companions Who Cares
            </Text>
          </View>

          {/* 固定在底部的按钮（距离底部94px） */}
          <View style={bottomContainerStyle}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/login')}
              style={{ alignItems: 'center', alignSelf: 'center' }}
            >
              <Image source={require('@/assets/BG.png')} resizeMode="cover" />
              <View className="absolute inset-0 flex-row items-center justify-center">
                <Image
                  source={require('@/assets/Call.png')}
                  className="w-5 h-5 mr-2"
                  resizeMode="contain"
                />
                <Text className="text-white text-base font-semibold">手机号登录</Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
});