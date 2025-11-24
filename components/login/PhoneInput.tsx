import React, { useMemo, memo } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { GlassContainer } from '@/components/common/GlassContainer';

interface PhoneInputProps {
  phone: string;
  code: string;
  onPhoneChange: (phone: string) => void;
  onCodeChange: (code: string) => void;
  onSendCode?: () => void;
  countdown?: number;
  disabled?: boolean;
}

// 将 GlassInput 移到组件外部，避免每次渲染都重新创建
const GlassInput = React.memo(({ children, style }: { children: React.ReactNode; style?: any }) => (
  <GlassContainer
    borderRadius={30}
    highlightHeight={60}
    style={[styles.inputBorder, style]}
  >
    {children}
  </GlassContainer>
));

const PhoneInputComponent: React.FC<PhoneInputProps> = ({
  phone,
  code,
  onPhoneChange,
  onCodeChange,
  onSendCode,
  countdown = 0,
  disabled = false,
}) => {
  const isDisabled = disabled || countdown > 0;
  const sendButtonLabel = useMemo(() => (countdown > 0 ? `${countdown}s` : ''), [countdown]);

  return (
    <View style={styles.container}>
      <GlassInput>
        <View style={styles.fieldContainer}>
          <View style={styles.fieldRow}>
            <TextInput
              style={styles.input}
              placeholder="手机号"
              placeholderTextColor="#D9D8E9"
              value={phone}
              onChangeText={onPhoneChange}
              keyboardType="phone-pad"
              selectionColor="#9EA9FF"
              autoCorrect={false}
              autoCapitalize="none"
              textAlignVertical="center"
            />
          </View>
        </View>
      </GlassInput>

      <GlassInput style={styles.codeBorder}>
        <View style={styles.fieldContainer}>
          <View style={[styles.fieldRow]}>
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="验证码"
              placeholderTextColor="#D9D8E9"
              value={code}
              onChangeText={onCodeChange}
              keyboardType="number-pad"
              selectionColor="#9EA9FF"
              autoCorrect={false}
              autoCapitalize="none"
              textAlignVertical="center"
            />
            <TouchableOpacity
              style={[styles.sendButton, isDisabled && styles.sendButtonDisabled]}
              activeOpacity={0.8}
              onPress={isDisabled ? undefined : onSendCode}
              disabled={isDisabled}
            >
              {countdown > 0 ? (
                <Text style={styles.countdownText}>{sendButtonLabel}</Text>
              ) : (
                <Image source={require('@/assets/send.png')} style={styles.sendIcon} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </GlassInput>
    </View>
  );
};

export const PhoneInput = memo(PhoneInputComponent);
PhoneInput.displayName = 'PhoneInput';

const styles = StyleSheet.create({
  container: {
    width: 336,
  },
  inputBorder: {
    width: 336,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    marginBottom: 15,
  },
  codeBorder: {
    marginBottom: 0,
  },
  fieldContainer: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  codeInput: {
    paddingRight: 18,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  countdownText: {
    color: '#A5B4FC',
    fontSize: 14,
    fontWeight: '600',
  },
});

