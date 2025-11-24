import React from 'react';
import { View, Text } from 'react-native';

interface ProgressPercentageProps {
  progress: number;
}

export default function ProgressPercentage({ progress }: ProgressPercentageProps) {
  return (
    <View className="items-center" style={{ justifyContent: 'center' }}>
      <Text
        style={{
          fontFamily: 'Agbalumo',
          fontWeight: '400',
          fontSize: 24,
          lineHeight: 24, // 100% of 24px
          letterSpacing: 0,
          color: '#FFFFFF',
          textAlign: 'center',
          textAlignVertical: 'center',
        }}
      >
        {Math.round(progress)}%
      </Text>
    </View>
  );
}

