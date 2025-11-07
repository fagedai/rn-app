import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SingleNavButtonProps {
  text: string;
  onPress: () => void;
  showPrivacyNotice?: boolean;
}

export const SingleNavButton: React.FC<SingleNavButtonProps> = ({
  text,
  onPress,
  showPrivacyNotice = true,
}) => {
  return (
    <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
      <TouchableOpacity
        className="w-full bg-white/18 rounded-full py-4 items-center mb-4"
        style={{
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderRadius: 30,
          paddingVertical: 16,
        }}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text className="text-white text-base font-bold">{text}</Text>
      </TouchableOpacity>

      {showPrivacyNotice && (
        <Text className="text-white/60 text-xs text-center mt-4">
          您的信息将被Nest保密,可在后台修改
        </Text>
      )}
    </View>
  );
};

