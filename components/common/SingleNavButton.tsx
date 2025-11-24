import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeArea } from '@/hooks/useSafeArea';

interface SingleNavButtonProps {
  text: string;
  onPress: () => void;
  showPrivacyNotice?: boolean;
  renderStepIndicator?: () => React.ReactNode;
  disabled?: boolean;
}

export const SingleNavButton: React.FC<SingleNavButtonProps> = ({
  text,
  onPress,
  showPrivacyNotice = true,
  renderStepIndicator,
  disabled = false,
}) => {
  const { bottom } = useSafeArea();
  
  // 按钮容器样式（距离底部86px + 安全区域）
  const buttonContainerStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: bottom + 86, // 86px + 底部安全区域（从94px减少8px）
    left: 0,
    right: 0,
    alignItems: 'center' as const,
  }), [bottom]);
  
  // 文本容器样式（距离底部57px + 安全区域）
  const textContainerStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: bottom + 57, // 57px + 底部安全区域（从65px减少8px）
    left: 0,
    right: 0,
    alignItems: 'center' as const,
  }), [bottom]);
  
  return (
    <>
      {/* 固定在底部的按钮（距离底部94px） */}
      <View style={buttonContainerStyle}>
      {renderStepIndicator && (
        <View style={{ marginBottom: 46 }}>{renderStepIndicator()}</View>
      )}
      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
        locations={[0, 0.5, 1]}
        style={{
          width: 298,
          height: 44,
          borderRadius: 22,
          padding: 1,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            borderRadius: 22,
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.25)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">{text}</Text>
        </TouchableOpacity>
      </LinearGradient>
      </View>

      {/* 固定在底部的文本（距离底部65px） */}
      {showPrivacyNotice && (
        <View style={textContainerStyle}>
        <Text
          className="text-white/30 text-xs text-center"
        >
          您的信息将被Nest保密,可在后台修改
        </Text>
        </View>
      )}
    </>
  );
};

