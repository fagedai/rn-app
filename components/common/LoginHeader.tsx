import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';

interface LoginHeaderProps {
  title: string;
  backButton?: boolean | React.ReactNode;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ title, backButton = true }) => {
  const router = useRouter();

  const renderBackButton = () => {
    if (!backButton) {
      return <View style={{ width: 40 }} />;
    }
    
    if (typeof backButton === 'boolean' && backButton) {
      // 默认返回按钮
      return (
        <TouchableOpacity 
          onPress={() => {
            console.log('[LoginHeader] 返回按钮被点击');
            try {
              if (router.canGoBack()) {
                router.back();
              } else {
                console.log('[LoginHeader] 无法返回，使用 router.replace 返回首页');
                router.replace('/(chat)/chat');
              }
            } catch (error) {
              console.error('[LoginHeader] 返回失败:', error);
            }
          }} 
          style={{ 
            paddingLeft: 16,
            paddingVertical: 8,
            paddingRight: 8,
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Image
            source={require('../../assets/arrow-left.png')}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      );
    }
    
    // 自定义返回按钮
    return backButton as React.ReactNode;
  };

  return (
    <Stack.Screen
      options={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: title,
        headerTitleStyle: { color: '#fff', fontSize: 16 },
        headerTitleAlign: 'center',
        headerBackVisible: false, // 完全隐藏默认返回按钮
        headerLeft: renderBackButton,
        headerRight: () => <View style={{ width: 40 }} />,
      }}
    />
  );
};

