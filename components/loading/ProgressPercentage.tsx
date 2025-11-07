import React from 'react';
import { View, Text } from 'react-native';
import LoadingDots from './LoadingDots';

interface ProgressPercentageProps {
  progress: number;
}

export default function ProgressPercentage({ progress }: ProgressPercentageProps) {
  return (
    <View className="mt-8 items-center">
      <Text
        className="text-white text-5xl font-bold"
        style={{
          textShadowColor: 'rgba(147, 51, 234, 0.8)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        }}
      >
        {Math.round(progress)}%
      </Text>
      <LoadingDots />
    </View>
  );
}

