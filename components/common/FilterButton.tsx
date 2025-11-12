import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Svg, Polygon } from 'react-native-svg';

interface FilterButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  marginRight?: number;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  label,
  isSelected,
  onPress,
  marginRight = 12,
}) => {
  return (
    <View className="items-center relative" style={{ marginRight }}>
      <TouchableOpacity
        onPress={onPress}
        className="px-5 py-4"
        style={{
          borderRadius: 20,
          backgroundColor: isSelected ? '#9333ea' : 'transparent',
          borderWidth: 1,
          borderColor: isSelected ? '#9333ea' : 'rgba(255, 255, 255, 0.3)',
        }}
      >
        <Text className="text-white text-sm">{label}</Text>
      </TouchableOpacity>
      {/* 向下三角形指示器 */}
      {isSelected && (
        <View
          style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: [{ translateX: -6 }],
            width: 12,
            height: 8,
          }}
        >
          <Svg width="12" height="8" viewBox="0 0 12 8">
            <Polygon points="6,8 0,0 12,0" fill="#9333ea" />
          </Svg>
        </View>
      )}
    </View>
  );
};

