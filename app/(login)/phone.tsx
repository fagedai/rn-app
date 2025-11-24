import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassContainer } from '@/components/common/GlassContainer';
import { useRouter } from 'expo-router';
import { LoginHeader } from '@/components/common/LoginHeader';
import { PhoneInput } from '@/components/login/PhoneInput';
import { useUserStore } from '@/store/userStore';
import { useAgreementStore } from '@/store/agreementStore';
import { useCreateStore } from '@/store/createStore';
import { TermsModal } from '@/components/common/TermsModal';
import { ErrorModal } from '@/components/common/ErrorModal';
import { sendVerificationCode, verifyVerificationCode } from '@/services/api/login';
import { getUserInfo } from '@/services/api/user';
import { useSafeArea } from '@/hooks/useSafeArea';

export default function LoginPhone() {
  const router = useRouter();
  const { userInfo, setPhone, setCode, setToken, setUserId, setName, setGender, setBirthday, setInterests, setBackgroundStory } = useUserStore();
  const { agreed, toggleAgreed } = useAgreementStore();
  const { top, bottom } = useSafeArea();
  // 使用本地状态管理输入值，避免频繁触发 store 更新导致重新渲染
  const [localPhone, setLocalPhone] = useState(userInfo.phone || '');
  const [localCode, setLocalCode] = useState(userInfo.code || '');
  
  // 稳定 style 对象引用，避免每次渲染都创建新对象
  const containerStyle = useMemo(() => ({
    paddingTop: top + 180
  }), [top]);
  
  // 固定底部按钮样式（距离底部94px + 安全区域）
  const bottomButtonStyle = useMemo(() => ({
    position: 'absolute' as const,
    left: 24, // px-6 = 24px
    right: 24, // px-6 = 24px
    bottom: bottom + 94, // 94px + 底部安全区域
    alignItems: 'center' as const,
  }), [bottom]);
  
  // 固定底部文本样式（距离底部65px + 安全区域）
  const bottomTextStyle = useMemo(() => ({
    position: 'absolute' as const,
    left: 24, // px-6 = 24px
    right: 24, // px-6 = 24px
    bottom: bottom + 65, // 65px + 底部安全区域
    alignItems: 'center' as const,
  }), [bottom]);
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string; title?: string }>({
    visible: false,
    message: '',
    title: '提示',
  });

  // 更新本地状态并同步到 store，使用防抖减少频繁更新
  const handlePhoneChange = useCallback((phone: string) => {
    setLocalPhone(phone);
    // 立即同步到 store，但 PhoneInput 组件已用 React.memo 包装，不会重新渲染
    setPhone(phone);
  }, [setPhone]);

  const handleCodeChange = useCallback((code: string) => {
    setLocalCode(code);
    // 立即同步到 store，但 PhoneInput 组件已用 React.memo 包装，不会重新渲染
    setCode(code);
  }, [setCode]);

  const showErrorModal = useCallback((message: string, title = '提示') => {
    setErrorModal({
      visible: true,
      message,
      title,
    });
  }, []);

  const closeErrorModal = useCallback(() => {
    setErrorModal((prev) => ({ ...prev, visible: false }));
  }, []);

  // 只在组件挂载时同步一次外部 store 的值（例如从其他页面导航过来时已设置的值）
  useEffect(() => {
    if (userInfo.phone && userInfo.phone !== localPhone) {
      setLocalPhone(userInfo.phone);
    }
    if (userInfo.code && userInfo.code !== localCode) {
      setLocalCode(userInfo.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在挂载时执行一次

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendCode = useCallback(async () => {
    if (!agreed) {
      showErrorModal('请先阅读并同意服务条款与隐私政策');
      return;
    }
    if (sending || countdown > 0) return;
    if (!localPhone) {
      showErrorModal('请先填写手机号');
      return;
    }
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(localPhone)) {
      showErrorModal('请输入有效的中国大陆手机号');
      return;
    }
    try {
      setSending(true);
      await sendVerificationCode(localPhone);
      showErrorModal('验证码已发送', '发送成功');
      setCountdown(60);
    } catch (error) {
      showErrorModal((error as Error).message ?? '验证码发送异常，请重试', '发送失败');
    } finally {
      setSending(false);
    }
  }, [sending, countdown, localPhone, agreed, showErrorModal]);

  const handleLogin = useCallback(async () => {
    if (!agreed) {
      showErrorModal('请先阅读并同意服务条款与隐私政策');
      return;
    }

    if (!localPhone || !localCode) {
      showErrorModal('请填写手机号和验证码');
      return;
    }

    if (localCode.length !== 4) {
      showErrorModal('请输入4位验证码');
      return;
    }

    if (verifying) {
      return;
    }

    try {
      setVerifying(true);
      const data = await verifyVerificationCode(localPhone, localCode);
      
      // 更新手机号到 store
      setPhone(data.phoneNumber);
      
      // 保存 token 和 userId
      if (data.token) {
        setToken(data.token);
        if (data.userId) {
          setUserId(data.userId);
        }
      }
      
      // 调用获取用户信息接口
      if (data.token) {
        try {
          const userInfoData = await getUserInfo(data.token);
          
          // 将获取到的用户信息映射到 userStore
          if (userInfoData.name) {
            setName(userInfoData.name);
          }
          if (userInfoData.gender !== null && userInfoData.gender !== undefined) {
            setGender(userInfoData.gender);
          }
          if (userInfoData.birthday) {
            setBirthday(userInfoData.birthday);
          }
          if (userInfoData.interests) {
            setInterests(userInfoData.interests);
          }
          if (userInfoData.background) {
            setBackgroundStory(userInfoData.background);
          }
          
          console.log('[Phone] 用户信息已更新:', userInfoData);
          
          // 根据 isNewUser 字段判断跳转
          // isNewUser === 1 表示已完成问卷，跳转到聊天页面
          // 否则跳转到问卷页面
          if (userInfoData.isNewUser === 1) {
              router.replace('/(chat)/chat');
          } else {
            router.replace('/(questionnaire)/name');
          }
        } catch (userInfoError) {
          console.error('[Phone] 获取用户信息失败:', userInfoError);
          // 获取用户信息失败，默认跳转到问卷页面
            router.replace('/(questionnaire)/name');
        }
      } else {
        // 没有 token，跳转到问卷页面
        router.replace('/(questionnaire)/name');
      }
    } catch (error) {
      console.error('验证验证码失败:', error);
      const errorMessage = error instanceof Error ? error.message : '验证码错误或已过期';
      showErrorModal(errorMessage, '验证失败');
    } finally {
      setVerifying(false);
    }
  }, [agreed, localPhone, localCode, verifying, router, setPhone, setToken, setUserId, setName, setGender, setBirthday, setInterests, setBackgroundStory, userInfo, showErrorModal]);

  return (
    <ImageBackground
      source={require('@/assets/login_background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="登陆" />
      <SafeAreaView className="flex-1" edges={['bottom']}>
        <View 
          className="flex-1 w-full px-6" 
          style={containerStyle}
        >
          <View className="flex-1 items-center justify-start">
            <Text className="text-white text-base text-center mb-[35px]" style={{ marginTop: 20 }}>
            请输入您的短信验证码
          </Text>
          <PhoneInput
            phone={localPhone}
            code={localCode}
            onPhoneChange={handlePhoneChange}
            onCodeChange={handleCodeChange}
            onSendCode={handleSendCode}
            countdown={countdown}
            disabled={sending}
          />
          </View>
          
          {/* 固定在底部的按钮（距离底部94px） */}
          <View style={bottomButtonStyle}>
          <GlassContainer
            borderRadius={24}
            highlightHeight={48}
            style={{
              width: 308,
              height: 48,
            }}
          >
            {/* 按钮内容 */}
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 24,
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: verifying ? 0.6 : 1,
              }}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={verifying}
            >
              {verifying ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
              <Text className="text-white text-base font-bold">
                进入
              </Text>
              )}
            </TouchableOpacity>
          </GlassContainer>
          </View>
          
          {/* 固定在底部的协议同意文本（距离底部65px） */}
          <View style={bottomTextStyle}>
            <View className="flex-row items-center">
            <TouchableOpacity
              className={`w-5 h-5 rounded-md border border-white/40 mr-3 items-center justify-center ${
                agreed ? 'bg-white/80' : 'bg-transparent'
              }`}
              onPress={toggleAgreed}
              activeOpacity={0.7}
            >
              {agreed && <View className="w-2.5 h-2.5 rounded-sm bg-[#7C8CFD]" />}
            </TouchableOpacity>
            <View className="flex-row items-center flex-wrap">
              <Text className="text-white text-sm leading-5" style={{ color: '#D9D9D9' }}>
                继续即表示您同意我们的
              </Text>
              <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                <Text className="text-sm leading-5 mx-1" style={{ color: '#00B3F8' }}>
                  服务条款
                </Text>
              </TouchableOpacity>
              <Text className="text-white text-sm leading-5" style={{ color: '#D9D9D9' }}>
                和
              </Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
                <Text className="text-sm leading-5 ml-1" style={{ color: '#00B3F8' }}>
                  隐私政策
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      </SafeAreaView>
      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="服务条款"
      />
      <TermsModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="隐私政策"
      />
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        onClose={closeErrorModal}
      />
    </ImageBackground>
  );
}
