import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '@/components/common/GlassContainer';

interface TextPreviewCardProps {
  title: string;
  text: string;
  maxLines?: number;
  onPress: () => void;
}

export const TextPreviewCard: React.FC<TextPreviewCardProps> = ({
  title,
  text,
  maxLines = 3,
  onPress,
}) => {
  const lines = text.split('\n');
  const isOverflow = lines.length > maxLines;
  const displayText = isOverflow
    ? lines.slice(0, maxLines).join('\n') + '...'
    : text;

  return (
    <View className="mb-8">
      {/* 标题行 */}
      <TouchableOpacity onPress={onPress} className="flex-row items-center justify-between mb-4">
        <Text className="text-white text-lg font-medium">{title}</Text>
        <Ionicons name="chevron-forward" size={20} color="white" />
      </TouchableOpacity>

      {/* 深色磨砂玻璃卡片 */}
      <GlassContainer borderRadius={18}>
        <View
          style={{
            padding: 20,
            borderRadius: 18,
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: 14,
              lineHeight: 24,
            }}
            numberOfLines={maxLines}
          >
            {displayText}
          </Text>
        </View>
      </GlassContainer>
    </View>
  );
};