import React, { useState } from 'react';
import { View, ImageBackground, ScrollView, TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { useCreateStore } from '@/store/createStore';
import { useChatStore } from '@/store/chatStore';
import { useAgreementStore } from '@/store/agreementStore';
import { UserProfile } from '@/components/settings/UserProfile';
import { AccountSection } from '@/components/settings/AccountSection';
import { PersonalInfoSection } from '@/components/settings/PersonalInfoSection';
import { GlassContainer } from '@/components/common/GlassContainer';
import { LoginHeader } from '@/components/common/LoginHeader';
import { useSafeArea } from '@/hooks/useSafeArea';
// import { logout } from '@/services/api/logout'; // 已移除
import { formatBirthday } from '@/utils/dateUtils';

export default function Settings() {
  const router = useRouter();
  const { userInfo, resetUserInfo } = useUserStore();
  const { resetAnswers } = useQuestionnaireStore();
  const { resetCreateState } = useCreateStore();
  const { resetChat } = useChatStore();
  const { setAgreed } = useAgreementStore();
  const { getTopSpacing } = useSafeArea();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userName = userInfo.name || '小张';
  const userGender = userInfo.gender; // 保持数字格式用于传递
  const phoneLinked = userInfo.phone || null;

  // 格式化生日显示
  const birthdayText = formatBirthday(userInfo.birthday);

  // 退出登录处理
  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);

      // 清除本地数据（退出登录功能已移除，仅清除本地数据）
      // await Promise.all([
        // 后台注销推送token
        // logout(), // 已移除
        // 清除本地数据（已经在内存中，不需要异步操作）
      // ]);

      // 清除所有本地store数据
      resetUserInfo();
      resetAnswers();
      resetCreateState();
      resetChat();
      setAgreed(false);

      // 导航到软件启动页（welcome页面）
      router.replace('/(login)/welcome');
    } catch (error) {
      console.error('退出登录失败:', error);
      // 即使出错，也清除本地数据并跳转
      resetUserInfo();
      resetAnswers();
      resetCreateState();
      resetChat();
      setAgreed(false);
      router.replace('/(login)/welcome');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/setting_backgorund.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="设置" />
      <SafeAreaView className="flex-1" edges={['bottom']}>
        {/* 固定区域：用户信息和套餐横幅 */}
        <View className="px-6" style={{ paddingTop: getTopSpacing(44, 20) }}>
          <UserProfile userName={userName} />
          {/* <PackageBanner /> */}
        </View>

        {/* 可滚动区域：我的账户、个人信息 */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <AccountSection
            userName={userName}
            phoneLinked={phoneLinked}
          />

          <PersonalInfoSection
            birthdayText={birthdayText}
            userGender={userGender}
          />

          {/* 退出登录按钮 - 距离个人信息25px */}
          <View style={styles.logoutButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <GlassContainer
                borderRadius={24}
                style={StyleSheet.flatten([
                  styles.logoutButton,
                  isLoggingOut ? styles.logoutButtonDisabled : {},
                ]) as ViewStyle}
              >
                <View style={styles.logoutButtonInner}>
                  {isLoggingOut ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                  <Text style={styles.logoutButtonText}>退出登录</Text>
                  )}
                </View>
              </GlassContainer>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  logoutButtonContainer: {
    marginTop: 25,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutButton: {
    width: 308,
    height: 48,
  },
  logoutButtonInner: {
    width: 308,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(127, 23, 23, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
});

