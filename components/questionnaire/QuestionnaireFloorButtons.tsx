import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface QuestionnaireFloorButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  backText?: string;
  nextText?: string;
  showPrivacyNotice?: boolean;
  renderStepIndicator?: () => React.ReactNode;
  nextDisabled?: boolean;
}

/**
 * 问卷页面 Floor 模块的双按钮组件（不使用绝对定位）
 */
export const QuestionnaireFloorButtons: React.FC<QuestionnaireFloorButtonsProps> = ({
  onBack,
  onNext,
  backText = '上一步',
  nextText = '下一步',
  showPrivacyNotice = true,
  renderStepIndicator,
  nextDisabled = false,
}) => {
  return (
    <View style={styles.container}>
      {renderStepIndicator && (
        <View style={styles.stepIndicatorContainer}>
          {renderStepIndicator()}
        </View>
      )}
      <View style={styles.buttonsRow}>
        {/* 上一步按钮 */}
        {onBack && (
          <LinearGradient
            colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
            locations={[0, 0.5, 1]}
            style={styles.button}
          >
            <TouchableOpacity
              style={styles.buttonInnerBack}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-bold">{backText}</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* 下一步按钮 */}
        {onNext && (
          <LinearGradient
            colors={nextDisabled 
              ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)']
              : ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
            locations={[0, 0.5, 1]}
            style={[styles.button, nextDisabled && styles.buttonDisabled]}
          >
            <TouchableOpacity
              style={[styles.buttonInnerNext, nextDisabled && styles.buttonInnerDisabled]}
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
        )}
      </View>
      {showPrivacyNotice && (
        <View style={styles.privacyContainer}>
          <Text className="text-white/60 text-xs text-center">
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
  buttonsRow: {
    flexDirection: 'row',
    gap: 10.5,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    padding: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonInnerBack: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(6, 6, 6, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonInnerNext: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonInnerDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  privacyContainer: {
    marginTop: 17, // 文本距离底部57px（57px - 文本高度约14px = 43px）
    width: '100%',
  },
});

