import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SelectionOptionProps {
  option: string;
  isSelected: boolean;
  onPress: () => void;
  backgroundImage?: any; // 可选的背景图片
}

export const SelectionOption: React.FC<SelectionOptionProps> = ({
  option,
  isSelected,
  onPress,
  backgroundImage,
}) => {
  const content = (
    <View className="flex-1 justify-center items-center">
      <Text className="text-white text-base font-medium">{option}</Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mb-6 overflow-hidden border border-white/30"
      style={{
        height: 80,
        borderRadius: 40,
      }}
    >
      {isSelected ? (
        <LinearGradient
          colors={['#9333ea', '#ec4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-1 justify-center items-center"
        >
          {content}
        </LinearGradient>
      ) : backgroundImage ? (
        <ImageBackground
          source={backgroundImage}
          resizeMode="cover"
          className="flex-1 justify-center items-center"
          style={{
            opacity: 0.7,
          }}
        >
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
          />
          {content}
        </ImageBackground>
      ) : (
        <View
          className="flex-1 justify-center items-center"
          style={{
            backgroundColor: 'rgba(55, 65, 81, 0.6)',
          }}
        >
          {content}
        </View>
      )}
    </TouchableOpacity>
  );
};

