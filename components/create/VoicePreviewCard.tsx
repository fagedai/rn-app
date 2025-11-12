import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface VoicePreviewCardProps {
  currentVoice: string;
}

export const VoicePreviewCard: React.FC<VoicePreviewCardProps> = ({
  currentVoice,
}) => {
  return (
    <View className="items-center">
      {/* 圆 */}
      <View
        style={{
          position: 'absolute',
          left: 10,
          top: -4,
          width: 50,
          height: 50,
          backgroundColor: '#5F55A9',
          borderRadius: 30,
          borderWidth: 0.5,
          borderColor: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        {/* 圆形播放按钮 */}
        <View
          style={{
            width: 25,
            height: 25,
            borderRadius: 15,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="play" size={12} color="gray" />
        </View>
      </View>
      <LinearGradient
        colors={['#5F55A9', '#2E2551']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 50,
          paddingHorizontal: 15,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text className="text-white text-sm flex-1"
          style={{ marginLeft: 55 }}
        >{currentVoice}</Text>
      </LinearGradient>
    </View>
  );
};

