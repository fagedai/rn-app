import React from 'react';
import { View, Text, Image } from 'react-native';

export default function TitleHeader() {
  return (
    <View className="absolute top-20 items-center">
      <Text className="text-white/80 text-sm mb-1">AI Creator</Text>
      <Image
        source={require('@/assets/NEST.png')}
        style={{
          width: 57,
          height: 36,
          resizeMode: 'contain',
        }}
      />
    </View>
  );
}

