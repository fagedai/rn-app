import React from 'react';
import { View, Text } from 'react-native';

export default function TitleHeader() {
  return (
    <View className="absolute top-20 items-center">
      <Text className="text-white/80 text-sm mb-1">AI Creator</Text>
      <Text className="text-white text-4xl font-bold">NEST</Text>
    </View>
  );
}

