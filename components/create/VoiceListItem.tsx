import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { VoicePreviewCard } from './VoicePreviewCard';

interface VoiceListItemProps {
  voiceName: string;
  isSelected: boolean;
  isVip: boolean;
  onSelect: () => void;
}

export const VoiceListItem: React.FC<VoiceListItemProps> = ({
  voiceName,
  isSelected,
  isVip,
  onSelect,
}) => {
  return (
    <View
      className="mb-4 rounded-xl p-4 flex-row items-center justify-between"
      style={{
        backgroundColor: isSelected ? '#9333ea' : 'rgba(55, 65, 81, 0.6)',
        borderWidth: 1,
        borderColor: isSelected ? '#9333ea' : 'rgba(255, 255, 255, 0.2)',
      }}
    >
      <View className="flex-1">
        <VoicePreviewCard currentVoice={voiceName} />
      </View>
      <View className="ml-4">
        {isSelected ? (
          <View
            style={{
              width: 60,
              height: 32,
              backgroundColor: 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text className="text-white text-sm">已选择</Text>
          </View>
        ) : isVip ? (
          <TouchableOpacity
            style={{
              width: 60,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text className="text-white text-sm">VIP</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onSelect}
            style={{
              width: 60,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text className="text-white text-sm">选择</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

