import 'global.css';
import { Stack } from 'expo-router';
import React from 'react';
import { Text, View, AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Agbalumo_400Regular } from '@expo-google-fonts/agbalumo';
import { ABeeZee_400Regular } from '@expo-google-fonts/abeezee';
import { LogBox } from 'react-native';
import { initTracking, track } from '@/services/tracking';

// 设置全局错误处理
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    console.error('[Global Error Handler]', {
      message: error.message,
      stack: error.stack,
      isFatal,
      name: error.name,
    });
    // 调用原始处理器
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

// 忽略某些警告（可选）
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Agbalumo: Agbalumo_400Regular,
    ABeeZee: ABeeZee_400Regular,
  });

  // 初始化埋点（App 启动时）
  React.useEffect(() => {
    initTracking();
    
    // 上报 App 启动事件
    track('app_launch', {
      launch_type: 'cold', // 冷启动（后续可以区分热启动）
    });
  }, []);

  // 监听 App 前后台切换（预留，当前版本不实现）
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // 预留：app_foreground 事件
      // if (nextAppState === 'active') {
      //   track('app_foreground', { ... });
      // }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    console.log('fontsLoaded', fontsLoaded);
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff' }}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
    <Stack
      initialRouteName="(login)"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#000' },
      }}
    >
      <Stack.Screen name="(login)" />
      <Stack.Screen name="(questionnaire)" />
      <Stack.Screen name="(chat)" />
      <Stack.Screen name="plan" />
      <Stack.Screen name="(settings)" />
    </Stack>
    </SafeAreaProvider>
  );
}
