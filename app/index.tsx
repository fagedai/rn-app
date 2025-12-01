import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore, GenderType } from '@/store/userStore';
import { useChatStore } from '@/store/chatStore';
import { useCreateStore } from '@/store/createStore';
import { usePlanStore } from '@/store/planStore';
import { useAgreementStore } from '@/store/agreementStore';
import { getUserInfo } from '@/services/api/user';

export default function Index() {
  const router = useRouter();
  const { userInfo, initializeFromStorage, setName, setPhone, setGender, setBirthday, setInterests, setBackgroundStory, setIsNewUser } = useUserStore();
  const { initializeFromStorage: initializeChatStore } = useChatStore();
  const { initializeFromStorage: initializeCreateStore } = useCreateStore();
  const { initializeFromStorage: initializePlanStore } = usePlanStore();
  const { initializeFromStorage: initializeAgreementStore } = useAgreementStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // 1. 恢复所有持久化数据
        console.log('[Index] 开始恢复所有持久化数据...');
        await Promise.all([
          initializeFromStorage(), // 用户数据（token, userId）
          initializeChatStore(), // 聊天数据
          initializeCreateStore(), // AI相关数据
          initializePlanStore(), // 计划数据
          initializeAgreementStore(), // 协议同意状态
        ]);
        console.log('[Index] 所有持久化数据恢复完成');

        // 2. 获取最新的 userInfo（因为 initializeFromStorage 会更新 store）
        const currentUserInfo = useUserStore.getState().userInfo;
        
        // 3. 检查是否有 token
        if (!currentUserInfo.token) {
          console.log('[Index] 未找到保存的 token，跳转到登录页面');
          router.replace('/(login)/welcome');
          return;
        }

        // 4. 验证 token 有效性并获取用户信息
        console.log('[Index] 找到保存的 token，验证有效性...');
        try {
          const userInfoData = await getUserInfo(currentUserInfo.token);
          
          // 更新用户信息到 store
          if (userInfoData.mobile) {
            setPhone(userInfoData.mobile); // 确保手机号从API获取并保存
          }
          if (userInfoData.name) {
            setName(userInfoData.name);
          }
          if (userInfoData.gender !== null && userInfoData.gender !== undefined) {
            setGender(userInfoData.gender as GenderType);
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
          if (userInfoData.isNewUser !== null && userInfoData.isNewUser !== undefined) {
            setIsNewUser(userInfoData.isNewUser);
          }

          console.log('[Index] Token 有效，用户信息已恢复:', userInfoData);

          // 4. 根据 isNewUser 决定跳转
          // isNewUser === 0 表示已注册且已填完问卷，跳转到聊天页面
          // isNewUser === 1 表示新用户（未完成问卷），跳转到问卷页面
          if (userInfoData.isNewUser === 0) {
            router.replace('/(chat)/chat');
          } else {
            router.replace('/(questionnaire)/name');
          }
        } catch (error) {
          // Token 无效或过期，清除并跳转到登录页面
          console.error('[Index] Token 验证失败:', error);
          const { resetUserInfo } = useUserStore.getState();
          await resetUserInfo();
          router.replace('/(login)/welcome');
        }
      } catch (error) {
        console.error('[Index] 检查登录状态失败:', error);
        router.replace('/(login)/welcome');
      } finally {
        setIsChecking(false);
      }
    };

    checkLoginStatus();
  }, []); // 只在组件挂载时执行一次

  // 显示加载状态
  if (isChecking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={{ color: '#fff', marginTop: 16 }}>正在检查登录状态...</Text>
      </View>
    );
  }

  // 这个 return 实际上不会执行，因为上面会进行路由跳转
  return null;
}

