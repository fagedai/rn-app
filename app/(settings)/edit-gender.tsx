import React, { useRef, useState } from 'react';
import { View, ImageBackground, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginHeader } from '@/components/common/LoginHeader';
import { GenderPicker } from '@/components/login/GenderPicker';
import { SingleNavButton } from '@/components/common/SingleNavButton';
import { useUserStore, GenderType } from '@/store/userStore';
import { updateUserInfo } from '@/services/api/user';
import { getAllGenderTexts, genderTextToCode, genderCodeToText } from '@/utils/genderUtils';
import { Toast } from '@/components/common/Toast';
import { useToast } from '@/hooks/useToast';

export default function EditGender() {
  const router = useRouter();
  const { userInfo, setGender } = useUserStore();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 从用户信息获取当前性别代码，如果没有则默认选择第一个（男=1）
  const initialGenderCode: GenderType = userInfo.gender || 1;
  
  // 使用显示文本数组（用于 UI 显示）
  const genderTexts = getAllGenderTexts();
  // 当前选中的性别文本（用于 UI 显示）
  const initialGenderText = genderCodeToText(initialGenderCode) || genderTexts[0];
  
  // 本地状态管理选中的性别文本（用于 UI）
  const [selectedGenderText, setSelectedGenderText] = useState<string>(initialGenderText);
  const [loading, setLoading] = useState(false);
  const toast = useToast(2000);

  // 处理性别变化（用户滑动时调用，接收文本）
  const handleGenderChange = (genderText: string) => {
    setSelectedGenderText(genderText);
  };

  // 处理保存按钮点击
  const handleSave = async () => {
    // 如果正在加载，禁止重复提交
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      
      // 将文本转换为数字代码
      const genderCode = genderTextToCode(selectedGenderText as '男' | '女' | '不愿意透露');
      
      // 如果性别没有变化，直接返回
      if (genderCode === userInfo.gender) {
        router.back();
        return;
      }

      // 调用后端API更新性别（只传变更的字段）
      if (userInfo.token) {
        await updateUserInfo(userInfo.token, {
          gender: genderCode,
        });
      }
      
      // 更新本地store（数字格式）
      setGender(genderCode);
      
      // 显示成功提示
      toast.show('已保存');
      
      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error('修改性别失败:', error);
      // 显示失败提示
      const errorMessage = error instanceof Error ? error.message : '保存失败，请稍后再试';
      toast.show(errorMessage);
      // 失败时留在本页，保持用户选择
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/setting_backgorund.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="您的性别" backButton={true} />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* 说明文案 */}
            <Text style={styles.hintText}>用于生成合适内容</Text>
            
            {/* 性别选择器 */}
            <View
              style={{
                flex: 1,
                width: '100%',
                maxWidth: 308,
                marginTop: 32,
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
          <SingleNavButton
            text={loading ? '保存中...' : '保存'}
            onPress={handleSave}
            showPrivacyNotice={false}
            disabled={loading}
          />
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

const styles = StyleSheet.create({
  hintText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -50,
  },
});

