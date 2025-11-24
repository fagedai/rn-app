import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { LoginHeader } from '@/components/common/LoginHeader';
import { PhoneDisplay } from '@/components/login/PhoneDisplay';
import { useUserStore } from '@/store/userStore';
import { TermsModal } from '@/components/common/TermsModal';
import { ErrorModal } from '@/components/common/ErrorModal';
import { useAgreementStore } from '@/store/agreementStore';
import { checkVerifyEnable, initOnepass, isOnepassAvailable, login as onepassLogin, quitLoginPage } from '@/services/onepass';
import { exchangeOnePassToken } from '@/services/api/login';
import { getUserInfo } from '@/services/api/user';
import { useCreateStore } from '@/store/createStore';
import { useSafeArea } from '@/hooks/useSafeArea';

type OnepassExtraConfig = {
  appKey?: string;
  appSecret?: string;
};

const extra = (Constants.expoConfig?.extra as { onepass?: OnepassExtraConfig } | undefined)?.onepass;

const ONEPASS_APP_KEY = process.env.EXPO_PUBLIC_ONEPASS_APP_KEY ?? extra?.appKey ?? '';
const ONEPASS_APP_SECRET = process.env.EXPO_PUBLIC_ONEPASS_APP_SECRET ?? extra?.appSecret ?? '';

export default function LoginMain() {
  const router = useRouter();
  const { userInfo, setPhone, setToken, setUserId, setName, setGender, setBirthday, setInterests, setBackgroundStory } = useUserStore();
  const { bottom } = useSafeArea();
  const [displayPhone, setDisplayPhone] = useState(
    userInfo.phone || '等待授权获取本机号码',
  );
  const { agreed, toggleAgreed } = useAgreementStore();
  
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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [onepassReady, setOnepassReady] = useState(false);
  const [phoneAuthorized, setPhoneAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [nextStep, setNextStep] = useState<'chat' | 'questionnaire' | null>(null);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: '',
    message: '',
  });
  const autoLaunchRef = useRef(false);

  const showErrorModal = useCallback((message: string, title = '一键登录失败') => {
    setErrorModal({
      visible: true,
      title,
      message,
    });
  }, []);

  const closeErrorModal = useCallback(() => {
    setErrorModal((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const startAuthorizationFlow = useCallback(
    async (trigger: 'auto' | 'manual' = 'manual') => {
      if (!onepassReady) {
        if (trigger === 'manual') {
          showErrorModal(initError ?? '当前环境暂不支持一键登录，请稍后再试', '无法使用一键登录');
        }
        return;
      }

      try {
        setLoading(true);
        const { token } = await onepassLogin();
        const data = await exchangeOnePassToken(token);
        setPhone(data.phoneNumber);
        setDisplayPhone(data.phoneNumber);
        setPhoneAuthorized(true);
        setNextStep(data.nextStep || 'questionnaire'); // 保存下一步操作，默认问卷
        setInitError(null);
        
        // 保存 token 和 userId
        if (data.token) {
          setToken(data.token);
          if (data.userId) {
            setUserId(data.userId);
          }
        }

        // 不再自动跳转，等待用户点击同意条款并点击一键登录按钮
      } catch (error) {
        setPhoneAuthorized(false);
        // 先显示错误弹窗，1.5秒后再跳转到短信验证页
        showErrorModal('一键登录失败', '授权失败');
        setTimeout(() => {
          router.push('/phone');
        }, 1500);
      } finally {
        setLoading(false);
      }
    },
    [onepassReady, initError, showErrorModal, setPhone, setPhoneAuthorized, setDisplayPhone, router],
  );

  useEffect(() => {
    // 监听全局手机号变更，保证显示数据同步
    if (userInfo.phone) {
      setDisplayPhone(userInfo.phone);
      setPhoneAuthorized(true);
    }
  }, [userInfo.phone]);

  useEffect(() => {
    let isUnmounted = false;

    async function prepareOnepass() {
      // 检测当前环境是否支持阿里云一键登录
      if (!isOnepassAvailable()) {
        const message = '当前构建未集成阿里云一键登录 SDK';
        setInitError(message);
        showErrorModal(message, '无法使用一键登录');
        return;
      }

      if (!ONEPASS_APP_SECRET) {
        const message = '缺少阿里云一键登录配置，请补齐环境变量';
        setInitError(message);
        showErrorModal(message, '配置缺失');
        return;
      }

      try {
        const initConfig: Parameters<typeof initOnepass>[0] = {
          appSecret: ONEPASS_APP_SECRET,
          timeout: 8000,
        };
        if (ONEPASS_APP_KEY) {
          initConfig.appKey = ONEPASS_APP_KEY;
        }

        await initOnepass(initConfig);

        const canVerify = await checkVerifyEnable();
        if (!canVerify) {
          const message = '当前网络或运营商暂不支持一键登录';
          setInitError(message);
          showErrorModal(message, '无法使用一键登录');
          return;
        }

        setOnepassReady(true);
      } catch (error) {
        if (!isUnmounted) {
          const message = (error as Error).message || '一键登录初始化失败';
          setInitError(message);
          showErrorModal(message, '初始化失败');
        }
      }
    }

    prepareOnepass();

    return () => {
      isUnmounted = true;
      quitLoginPage();
    };
  }, [showErrorModal, startAuthorizationFlow]);

  useEffect(() => {
    if (onepassReady && !phoneAuthorized && !autoLaunchRef.current) {
      autoLaunchRef.current = true;
      startAuthorizationFlow('auto');
    }
  }, [onepassReady, phoneAuthorized, startAuthorizationFlow]);

  const handleConfirmLogin = async () => {
    if (!phoneAuthorized) {
      showErrorModal('请先获取本机号码再登录', '未获取手机号');
      return;
    }

    if (!agreed) {
      showErrorModal('请先阅读并同意服务条款与隐私政策', '未同意条款');
      return;
    }

    // 检查是否有 token
    if (!userInfo.token) {
      showErrorModal('登录信息已失效，请重新登录', '提示');
      return;
    }

    try {
      setLoading(true);

      // 调用获取用户信息接口
      const userInfoData = await getUserInfo(userInfo.token);
      
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
      
      console.log('[Login] 用户信息已更新:', userInfoData);

      // 根据 isNewUser 字段判断跳转
      // isNewUser === 1 表示已完成问卷，跳转到聊天页面
      // 否则跳转到问卷页面
      if (userInfoData.isNewUser === 1) {
          router.replace('/(chat)/chat');
      } else {
        router.replace('/(questionnaire)/name');
      }
    } catch (error) {
      console.error('[Login] 获取用户信息失败:', error);
      // 获取用户信息失败，默认跳转到问卷页面
        router.replace('/(questionnaire)/name');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ImageBackground
      source={require('@/assets/login_background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="登录" />
      <SafeAreaView className="flex-1" edges={['bottom']}>
        <View className="flex-1 w-full px-6" style={{ paddingTop: 262 }}>
        <View className="flex-1 items-center">
          <Text className="text-white text-base text-center mb-[80px]">您的手机号</Text>
          <PhoneDisplay phone={displayPhone} />
          <TouchableOpacity onPress={() => router.push('/phone')}>
            <Text className="text-[#D9D9D9] text-[13px] mt-[74px] text-center underline">
              其他手机号登录
            </Text>
          </TouchableOpacity>
        </View>
        </View>
        
        {/* 固定在底部的按钮（距离底部94px） */}
        <View style={bottomButtonStyle}>
          <TouchableOpacity
            className={`w-full rounded-3xl items-center ${phoneAuthorized && !agreed ? 'opacity-60' : ''}`}
            onPress={phoneAuthorized ? handleConfirmLogin : () => startAuthorizationFlow('manual')}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Image
              source={require('@/assets/BG.png')}
              resizeMode="cover"
              style={{ marginTop: -18, marginBottom: -18 }}
            />
            <View className="absolute inset-0 flex-row items-center justify-center">
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  一键登录
                </Text>
              )}
            </View>
          </TouchableOpacity>
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
                <Text className="text-sm leading-5" style={{ color: '#00B3F8' }}>
                  服务条款
                </Text>
              </TouchableOpacity>
              <Text className="text-white text-sm leading-5" style={{ color: '#D9D9D9' }}>
                和
              </Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
                <Text className="text-sm leading-5" style={{ color: '#00B3F8' }}>
                  隐私政策
                </Text>
              </TouchableOpacity>
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
