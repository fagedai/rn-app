import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';

interface LoginHeaderProps {
  title: string;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ title }) => {
  const router = useRouter();

  return (
    <Stack.Screen
      options={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: title,
        headerTitleStyle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 16 }}>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{'<'}</Text>
          </TouchableOpacity>
        ),
        headerRight: () => <View style={{ width: 40 }} />,
      }}
    />
  );
};

