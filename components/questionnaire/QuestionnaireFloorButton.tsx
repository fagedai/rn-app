import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface QuestionnaireFloorButtonProps {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  showPrivacyNotice?: boolean;
  renderStepIndicator?: () => React.ReactNode;
}

/**
 * 问卷页面 Floor 模块的按钮组件（不使用绝对定位）
 */
export const QuestionnaireFloorButton: React.FC<QuestionnaireFloorButtonProps> = ({
  text,
  onPress,
  disabled = false,
  showPrivacyNotice = true,
  renderStepIndicator,
}) => {
  return (
    <View style={styles.container}>
      {renderStepIndicator && (
        <View style={styles.stepIndicatorContainer}>
          {renderStepIndicator()}
        </View>
      )}
      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
        locations={[0, 0.5, 1]}
        style={[styles.button, disabled && styles.buttonDisabled]}
      >
        <TouchableOpacity
          style={styles.buttonInner}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">{text}</Text>
        </TouchableOpacity>
      </LinearGradient>
      {showPrivacyNotice && (
        <View style={styles.privacyContainer}>
          <Text className="text-white/30 text-xs text-center">
            您的信息将被Nest保密,可在后台修改
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  stepIndicatorContainer: {
    marginBottom: 46,
  },
  button: {
    width: 298,
    height: 44,
    borderRadius: 22,
    padding: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonInner: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  privacyContainer: {
    marginTop: 17, // 文本距离底部57px（57px - 文本高度约14px = 43px）
    width: '100%',
  },
});

