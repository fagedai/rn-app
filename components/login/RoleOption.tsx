import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface RoleOptionProps {
  option: string;
  isSelected: boolean;
  onPress: () => void;
}

export const RoleOption: React.FC<RoleOptionProps> = ({
  option,
  isSelected,
  onPress,
}) => {
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
          <Text className="text-white text-base font-medium">{option}</Text>
        </LinearGradient>
      ) : (
        <View
          className="flex-1 justify-center items-center"
          style={{
            backgroundColor: 'rgba(55, 65, 81, 0.6)',
          }}
        >
          <Text className="text-white text-base font-medium">{option}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

