import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeArea } from '@/hooks/useSafeArea';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  backText?: string;
  nextText?: string;
  showPrivacyNotice?: boolean;
  renderStepIndicator?: () => React.ReactNode;
  nextDisabled?: boolean; // 下一步按钮是否禁用（置灰）
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onNext,
  backText = '上一步',
  nextText = '下一步',
  showPrivacyNotice = true,
  renderStepIndicator,
  nextDisabled = false,
}) => {
  const { bottom } = useSafeArea();
  
  // 按钮容器样式（距离底部86px + 安全区域）
  const buttonContainerStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: bottom + 86, // 86px + 底部安全区域（从94px减少8px）
    left: 24,
    right: 24,
    alignItems: 'center' as const,
  }), [bottom]);
  
  // 文本容器样式（距离底部57px + 安全区域）
  const textContainerStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: bottom + 57, // 57px + 底部安全区域（从65px减少8px）
    left: 24,
    right: 24,
    alignItems: 'center' as const,
  }), [bottom]);

  return (
    <>
      {/* 固定在底部的按钮（距离底部94px） */}
      <View style={buttonContainerStyle}>
      {renderStepIndicator && (
        <View style={{ marginBottom: 46 }}>{renderStepIndicator()}</View>
      )}
      <View
        style={{
          flexDirection: 'row',
          gap: 10.5,
          width: '100%',
        }}
      >
        {/* 上一步按钮：玻璃边框 + 深色背景 */}
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
          locations={[0, 0.5, 1]}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 22,
            padding: 1,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              borderRadius: 22,
              overflow: 'hidden',
              backgroundColor: 'rgba(6, 6, 6, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
            }}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-bold">{backText}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* 下一步按钮：与name页面一样的样式 */}
        <LinearGradient
          colors={nextDisabled 
            ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)']
            : ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
          locations={[0, 0.5, 1]}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 22,
            padding: 1,
            opacity: nextDisabled ? 0.5 : 1,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              borderRadius: 22,
              overflow: 'hidden',
              backgroundColor: nextDisabled 
                ? 'rgba(255,255,255,0.1)' 
                : 'rgba(255,255,255,0.25)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
            }}
            onPress={nextDisabled ? undefined : onNext}
            activeOpacity={nextDisabled ? 1 : 0.8}
            disabled={nextDisabled}
          >
            <Text 
              className="text-base font-bold"
              style={{ 
                color: nextDisabled ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF' 
              }}
            >
              {nextText}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
      </View>

      {/* 固定在底部的文本（距离底部65px） */}
      {showPrivacyNotice && (
        <View style={textContainerStyle}>
        <Text
          className="text-white/60 text-xs text-center"
        >
          您的信息将被Nest保密,可在后台修改
        </Text>
        </View>
      )}
    </>
  );
};

