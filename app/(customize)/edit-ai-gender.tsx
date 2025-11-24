import React, { useRef, useState } from 'react';
import { View, ImageBackground, ScrollView, TouchableOpacity, Image, ActivityIndicator, Text } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LoginHeader } from '@/components/common/LoginHeader';
import { GenderPicker } from '@/components/login/GenderPicker';
import { useCreateStore } from '@/store/createStore';
import { useUserStore } from '@/store/userStore';
import { getAllGenderTexts } from '@/utils/genderUtils';
import { saveAiGender } from '@/services/api/aiSettings';
import { Toast } from '@/components/common/Toast';
import { useToast } from '@/hooks/useToast';

// AI性别类型（与用户性别相同）
type AiGenderType = '男' | '女' | '不愿意透露';

// 根据用户性别获取默认AI性别
const getDefaultAiGender = (userGender: 1 | 2 | 3 | null): 1 | 2 | 3 => {
  if (userGender === 1) {
    // 用户=男 → 机器人默认为女
    return 2;
  } else if (userGender === 2) {
    // 用户=女 → 机器人默认为男
    return 1;
  } else {
    // 用户=非二元性别(3) → 机器人默认为非二元性别(3)
    return 3;
  }
};

// 将AI性别代码(1,2,3)转换为显示文本
const aiGenderCodeToText = (code: 1 | 2 | 3): AiGenderType => {
  const map: Record<1 | 2 | 3, AiGenderType> = {
    1: '男',
    2: '女',
    3: '不愿意透露',
  };
  return map[code];
};

// 将显示文本转换为AI性别代码(1,2,3)
const aiGenderTextToCode = (text: AiGenderType): 1 | 2 | 3 => {
  const map: Record<AiGenderType, 1 | 2 | 3> = {
    '男': 1,
    '女': 2,
    '不愿意透露': 3,
  };
  return map[text];
};

export default function EditAiGender() {
  const router = useRouter();
  const { aiGender, setAiGender } = useCreateStore();
  const { userInfo } = useUserStore();
  const [loading, setLoading] = useState(false);
  const toast = useToast(2000);
  const scrollViewRef = useRef<ScrollView>(null);

  // 获取默认性别（如果当前没有设置，根据用户性别设置默认值）
  const defaultAiGender = getDefaultAiGender(userInfo.gender);
  // 如果 aiGender 未设置，使用默认值并更新 store
  const currentAiGender = (() => {
    if (aiGender !== null && aiGender !== undefined) {
      return aiGender;
    }
    // 首次进入，使用默认值并更新 store
    setAiGender(defaultAiGender);
    return defaultAiGender;
  })();

  // 使用显示文本数组（用于 UI 显示）
  const genderTexts = getAllGenderTexts() as AiGenderType[];
  // 当前选中的性别文本（用于 UI 显示）
  const [selectedGenderText, setSelectedGenderText] = useState<AiGenderType>(
    aiGenderCodeToText(currentAiGender)
  );

  // 标记用户是否滑动过
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  // 处理性别变化（用户滑动时调用，接收文本）
  const handleGenderChange = (genderText: string) => {
    setHasUserScrolled(true);
    setSelectedGenderText(genderText as AiGenderType);
  };

  // 处理保存按钮点击
  const handleSave = async () => {
    // 如果正在加载，禁止重复提交
    if (loading) {
      return;
    }

    let genderCodeToSubmit: 1 | 2 | 3;
    
    if (hasUserScrolled) {
      // 用户滑动过，提交用户选择的性别
      genderCodeToSubmit = aiGenderTextToCode(selectedGenderText);
    } else {
      // 用户未滑动，使用当前值
      genderCodeToSubmit = currentAiGender;
    }

    // 如果性别没有变化，直接返回
    if (genderCodeToSubmit === aiGender) {
      router.back();
      return;
    }

    try {
      setLoading(true);
      
      // 调用后端API保存AI性别
      if (!userInfo.token) {
        throw new Error('请先登录');
      }
      await saveAiGender(genderCodeToSubmit, userInfo.token);
      
      // 更新本地store
      setAiGender(genderCodeToSubmit);
      
      // 显示成功提示
      toast.show('已保存');
      
      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error('保存AI性别失败:', error);
      const errorMessage = error instanceof Error ? error.message : '保存失败，请稍后再试';
      toast.show(errorMessage);
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
          headerTitle: 'AI机器人的性别',
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
        <View className="flex-1 px-6">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                flex: 1,
                width: '100%',
                maxWidth: 308,
              }}
            >
              <GenderPicker
                genders={genderTexts}
                selectedGender={selectedGenderText}
                onGenderChange={handleGenderChange}
                scrollRef={scrollViewRef}
              />
            </View>
          </View>

          {/* 保存按钮 */}
          <View style={{ marginBottom: 40, alignItems: 'center' }}>
            <LinearGradient
              colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
              locations={[0, 0.5, 1]}
              style={{
                width: 298,
                height: 44,
                borderRadius: 22,
                padding: 1,
                opacity: loading ? 0.5 : 1,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  borderRadius: 22,
                  overflow: 'hidden',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 20,
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
            </LinearGradient>
          </View>
        </View>
      </SafeAreaView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        duration={toast.duration}
        onHide={toast.hide}
      />
    </ImageBackground>
  );
}

