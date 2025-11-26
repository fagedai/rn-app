import React, { useMemo } from 'react';
import { View, Image, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';

interface LoginHeaderProps {
  title: string;
  backButton?: boolean | React.ReactNode;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ title, backButton = true }) => {
  const router = useRouter();

  // 使用 useMemo 确保 headerLeft 函数引用稳定
  const headerLeft = useMemo(() => {
    if (!backButton) {
      return () => <View style={{ width: 40 }} />;
    }
    
    if (typeof backButton === 'boolean' && backButton) {
      // 默认返回按钮 - 返回一个函数，这个函数返回 Pressable
      return () => (
        <Pressable 
          onPress={() => {
            console.log('[LoginHeader] 返回按钮被点击');
            try {
              // 直接调用 router.back()，如果无法返回，它不会报错，只是不执行任何操作
              router.back();
            } catch (error) {
              console.error('[LoginHeader] 返回失败:', error);
              // 如果返回失败，尝试跳转到设置页面
              try {
                router.push('/(settings)/settings');
              } catch (pushError) {
                console.error('[LoginHeader] 跳转到设置页面也失败:', pushError);
              }
            }
          }} 
          style={({ pressed }) => ({ 
            paddingLeft: 16,
            paddingVertical: 8,
            paddingRight: 8,
            opacity: pressed ? 0.7 : 1,
          })}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={require('../../assets/arrow-left.png')}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </Pressable>
      );
    }
    
    // 自定义返回按钮
    return () => backButton as React.ReactNode;
  }, [backButton, router]);

  return (
    <Stack.Screen
      options={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: title,
        headerTitleStyle: { color: '#fff', fontSize: 16 },
        headerTitleAlign: 'center',
        headerBackVisible: false, // 完全隐藏默认返回按钮
        headerLeft: headerLeft,
        headerRight: () => <View style={{ width: 40 }} />,
      }}
    />
  );
};

