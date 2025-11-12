import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  // 计算是否超出最大行数
  const lines = text.split('\n');
  const isOverflow = lines.length > maxLines;
  const displayText = isOverflow
    ? lines.slice(0, maxLines).join('\n') + '...'
    : text;

  return (
    <View className="mb-8">
      <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center justify-between mb-4"
      >
        <Text className="text-white text-lg font-medium">{title}</Text>
        <Ionicons name="chevron-forward" size={20} color="white" />
      </TouchableOpacity>
      <View
        className="border border-white/30 rounded-25"
        style={{
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 25,
          padding: 15,
          backgroundColor: '#44396C',
        }}
      >
        <Text
          className="text-white/80 text-base leading-5"
          numberOfLines={maxLines}
        >
          {displayText}
        </Text>
      </View>
    </View>
  );
};

