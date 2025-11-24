import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export function PackageBanner() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/plan')}
      className="mb-6"
      activeOpacity={0.8}
    >
      <Image
        source={require('@/assets/openPlan.png')}
        resizeMode="contain"
        style={{ width: '100%' }}
      />
    </TouchableOpacity>
  );
}

