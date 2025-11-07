import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  backText?: string;
  nextText?: string;
  showPrivacyNotice?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onNext,
  backText = '上一步',
  nextText = '下一步',
  showPrivacyNotice = true,
}) => {

  return (
    <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
      <View className="flex-row justify-between">
        <TouchableOpacity
          className="flex-1 bg-white/18 rounded-full py-4 items-center mr-2"
          style={{
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: 30,
            paddingVertical: 16,
          }}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">{backText}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-white/18 rounded-full py-4 items-center ml-2"
          style={{
            backgroundColor: 'rgba(255,255,255,0.18)',
            borderRadius: 30,
            paddingVertical: 16,
          }}
          onPress={onNext}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">{nextText}</Text>
        </TouchableOpacity>
      </View>

      {showPrivacyNotice && (
        <Text className="text-white/60 text-xs text-center mt-4">
          您的信息将被Nest保密,可在后台修改
        </Text>
      )}
    </View>
  );
};

