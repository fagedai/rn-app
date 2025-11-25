import React, { useRef, useState } from 'react';
import { View, ImageBackground, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GenderPicker } from '@/components/login/GenderPicker';
import { useCreateStore } from '@/store/createStore';
import { useUserStore } from '@/store/userStore';
import { saveAiSettings } from '@/services/api/aiSettings';
import { ErrorModal } from '@/components/common/ErrorModal';
import { useErrorModal } from '@/hooks/useErrorModal';

// NEST性别类型
type NestGenderType = '男' | '女' | '不愿意透露';

export default function EditNestGender() {
  const router = useRouter();
  const { aiGender, setAiGender, nestName } = useCreateStore();
  const { userInfo } = useUserStore();
  const [loading, setLoading] = useState(false);
  const errorModal = useErrorModal();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const genders: readonly NestGenderType[] = ['男', '女', '不愿意透露'];
  
  // 将store中的编码转换为显示格式
  const getSelectedGender = (): NestGenderType => {
    if (aiGender === null || aiGender === undefined || aiGender < 1 || aiGender > 3) {
      return genders[1]; // 默认选择"女"（编码2，索引1）
    }
    const genderIndex = aiGender - 1;
    return genders[genderIndex];
  };
  
  // 使用本地状态来跟踪当前选中的显示值
  const [currentSelectedGender, setCurrentSelectedGender] = useState<NestGenderType>(() => {
    return getSelectedGender();
  });

  // 处理性别变化（用户滑动时调用）
  const handleGenderChange = (gender: NestGenderType) => {
    setCurrentSelectedGender(gender);
    
    // 将选择的性别转换为编码 (1=男, 2=女, 3=不愿意透露)
    const genderIndex = genders.indexOf(gender);
    if (genderIndex >= 0) {
      const genderCode = (genderIndex + 1) as 1 | 2 | 3;
      setAiGender(genderCode);
    }
  };

  // 处理保存
  const handleSave = async () => {
    if (loading) {
      return;
    }

    if (!userInfo.token || !userInfo.userId) {
      errorModal.show('请先登录');
      return;
    }

    // 获取当前选中的性别编码
    const genderIndex = genders.indexOf(currentSelectedGender);
    if (genderIndex < 0) {
      errorModal.show('请选择性别');
      return;
    }
    const genderCode = (genderIndex + 1) as 1 | 2 | 3;

    // 如果性别没有变化，直接返回
    if (genderCode === aiGender) {
      router.back();
      return;
    }

    try {
      setLoading(true);
      
      // 调用后端API保存性别（至少1秒防抖）
      const savePromise = saveAiSettings(
        {
          userId: userInfo.userId,
          nestGender: genderCode,
        },
        userInfo.token
      );
      const minDelayPromise = new Promise(resolve => setTimeout(resolve, 1000));
      
      await Promise.all([savePromise, minDelayPromise]);
      
      // 更新本地store
      setAiGender(genderCode);
      
      // 成功，直接返回
      router.back();
    } catch (error) {
      console.error('保存AI性别失败:', error);
      const errorMessage = error instanceof Error ? error.message : '保存失败，请稍后再试';
      errorModal.show(errorMessage);
      setLoading(false);
    }
  };

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
          headerTitle: `${nestName || 'AI机器人'}的性别`,
          headerTitleStyle: { color: '#fff', fontSize: 16 },
          headerTitleAlign: 'center',
          headerBackVisible: false,
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
          {/* 提示文案 */}
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 14,
              textAlign: 'center',
              marginBottom: 24,
              paddingHorizontal: 20,
            }}
          >
            选择NEST的性别
          </Text>

          {/* 性别选择器 */}
          <View
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 400,
            }}
          >
            <View
              style={{
                flex: 1,
                width: '100%',
                maxWidth: 308,
                alignSelf: 'center',
              }}
            >
              <GenderPicker
                genders={genders}
                selectedGender={currentSelectedGender}
                onGenderChange={handleGenderChange}
                scrollRef={scrollViewRef}
              />
            </View>
          </View>

          {/* 保存按钮 */}
          <View style={{ marginTop: 40 }}>
            <TouchableOpacity
              style={{
                width: 298,
                height: 44,
                borderRadius: 22,
                alignSelf: 'center',
                backgroundColor: 'rgba(255,255,255,0.25)',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: loading ? 0.5 : 1,
              }}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-bold">保存</Text>
              )}
            </TouchableOpacity>
          </View>
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

