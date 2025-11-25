import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ImageBackground, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore } from '@/store/userStore';
import { ErrorModal } from '@/components/common/ErrorModal';
import { GlassContainer } from '@/components/common/GlassContainer';
import { SingleNavButton } from '@/components/common/SingleNavButton';
import { sendChangePhoneCode, confirmChangePhone } from '@/services/api/user';
import { useErrorModal } from '@/hooks/useErrorModal';


export default function EditPhone() {
  const router = useRouter();
  const { userInfo, setPhone } = useUserStore();
  const [phone, setPhoneLocal] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const errorModal = useErrorModal();
  const lastSendTimeRef = useRef<number>(0);

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // 手机号格式校验
  const validatePhone = (phoneNumber: string): boolean => {
    const phoneReg = /^1[3-9]\d{9}$/;
    return phoneReg.test(phoneNumber);
  };

  // 发送验证码
  const handleSendCode = useCallback(async () => {
    // 防抖：3秒内多次点击视为同一次
    const now = Date.now();
    if (now - lastSendTimeRef.current < 3000) {
      return;
    }
    lastSendTimeRef.current = now;

    if (!phone || phone.trim().length === 0) {
      return; // 按钮已置灰，不会触发
    }

    // 格式校验
    if (!validatePhone(phone)) {
      errorModal.show('手机号格式不正确');
      return;
    }

    // 检查是否有 token
    if (!userInfo.token) {
      errorModal.show('用户未登录，请重新登录');
      return;
    }

    try {
      setSending(true);
      
      // 调用修改手机号的发送验证码接口
      await sendChangePhoneCode(phone, userInfo.token);
      errorModal.show('验证码已发送', '发送成功');
      setCountdown(60);
    } catch (error) {
      console.error('发送验证码失败:', error);
      const errorMessage = error instanceof Error ? error.message : '验证码发送失败，请重试';
      errorModal.show(errorMessage);
    } finally {
      setSending(false);
    }
  }, [phone, userInfo.token, errorModal]);

  // 保存
  const handleSave = useCallback(async () => {
    if (!phone || !code || code.length !== 6) {
      return; // 按钮已置灰，不会触发
    }

    // 检查是否有 token
    if (!userInfo.token) {
      errorModal.show('用户未登录，请重新登录');
      return;
    }

    try {
      setSaving(true);
      
      // 调用确认修改手机号接口（校验验证码并更新手机号）
      await confirmChangePhone(phone, userInfo.token, code);
      
      // 更新本地store
      setPhone(phone);
      
      // 显示成功提示
      errorModal.show('手机号修改成功', '修改成功');
      
      // 延迟返回
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error('保存失败:', error);
      const errorMessage = error instanceof Error ? error.message : '验证码错误或已过期';
      errorModal.show(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [phone, code, userInfo.token, setPhone, errorModal, router]);

  // 获取当前手机号（用于说明文字）
  const currentPhone = userInfo.phone || 'xxxx';
  const maskedPhone = currentPhone.length > 4 
    ? currentPhone.slice(0, 2) + '****' + currentPhone.slice(-4)
    : 'xxxx';

  // 按钮状态
  const canSendCode = phone.trim().length > 0 && !sending && countdown === 0;
  const canSave = phone.trim().length > 0 && code.trim().length === 6 && !saving;

  return (
    <ImageBackground
      source={require('@/assets/login_background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '修改手机号',
          headerTitleStyle: { color: '#fff', fontSize: 16 },
          headerTitleAlign: 'center',
          headerBackVisible: false, // 完全隐藏默认返回按钮
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 16 }}>
              <Image
                source={require('@/assets/arrow-left.png')}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ),
          headerRight: () => <View style={{ width: 40 }} />,
        }}
      />
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center px-6">
          {/* 说明文字 */}
          <Text style={styles.description}>
            请保持您最新的手机号码，输入新的手机号码以更改您当前的手机号码{maskedPhone}。
          </Text>

          {/* 手机号输入框 */}
          <View style={styles.inputContainer}>
            <GlassContainer borderRadius={30} highlightHeight={60} style={styles.inputBorder}>
              <View style={styles.fieldContainer}>
                <View style={styles.fieldRow}>
                <TextInput
                  style={styles.input}
                  placeholder="手机号"
                  placeholderTextColor="#D9D8E9"
                  value={phone}
                  onChangeText={setPhoneLocal}
                  keyboardType="phone-pad"
                  selectionColor="#9EA9FF"
                  autoCorrect={false}
                  autoCapitalize="none"
                  textAlignVertical="center"
                />
                </View>
              </View>
            </GlassContainer>
          </View>

          {/* 验证码输入框和发送按钮 */}
          <View style={styles.inputContainer}>
            <GlassContainer borderRadius={30} highlightHeight={60} style={styles.inputBorder}>
              <View style={styles.fieldContainer}>
                <View style={styles.fieldRow}>
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="验证码"
                    placeholderTextColor="#D9D8E9"
                    value={code}
                    onChangeText={(text) => {
                      // 限制为6位数字
                      const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
                      setCode(numericText);
                    }}
                    keyboardType="number-pad"
                    selectionColor="#9EA9FF"
                    autoCorrect={false}
                    autoCapitalize="none"
                    textAlignVertical="center"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, !canSendCode && styles.sendButtonDisabled]}
                    activeOpacity={0.8}
                    onPress={handleSendCode}
                    disabled={!canSendCode}
                  >
                    {countdown > 0 ? (
                      <Text style={styles.countdownText}>{countdown}s</Text>
                    ) : (
                      <Image 
                        source={require('@/assets/send.png')} 
                        style={styles.sendIcon} 
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </GlassContainer>
          </View>

          {/* 保存按钮 */}
            <SingleNavButton
            text={saving ? '保存中...' : '保存'}
              onPress={handleSave}
            disabled={!canSave || saving}
            showPrivacyNotice={false}
            />
        </View>
      </SafeAreaView>
      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.error}
        title={errorModal.title || '操作失败'}
        onClose={errorModal.hide}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  inputBorder: {
    width: 336,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
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

