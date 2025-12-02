import React, { useRef, useState, useEffect } from 'react';
import { View, ImageBackground, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeArea } from '@/hooks/useSafeArea';
import { LoginHeader } from '@/components/common/LoginHeader';
import { GenderPicker } from '@/components/login/GenderPicker';
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout';
import { QuestionnaireFloorButtons } from '@/components/questionnaire/QuestionnaireFloorButtons';
import { useUserStore, GenderType } from '@/store/userStore';
import { updateUserInfo } from '@/services/api/user';
import { getAllGenderTexts, genderTextToCode, genderCodeToText, GenderDisplayText } from '@/utils/genderUtils';
import { ErrorModal } from '@/components/common/ErrorModal';
import { useErrorModal } from '@/hooks/useErrorModal';
import { track } from '@/services/tracking';

const HEADER_HEIGHT = 44; // LoginHeader 高度

export default function EditGender() {
  const router = useRouter();
  const { top } = useSafeArea();
  const { userInfo, setGender } = useUserStore();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 从用户信息获取当前性别代码，如果没有则默认选择第一个（男=1）
  const initialGenderCode: GenderType = userInfo.gender || 1;
  
  // 使用显示文本数组（用于 UI 显示）
  const genderTexts = getAllGenderTexts();
  // 当前选中的性别文本（用于 UI 显示）
  const initialGenderText = genderCodeToText(initialGenderCode) || genderTexts[0];
  
  // 本地状态管理选中的性别文本（用于 UI）
  const [selectedGenderText, setSelectedGenderText] = useState<GenderDisplayText>(initialGenderText as GenderDisplayText);
  const [loading, setLoading] = useState(false);
  const errorModal = useErrorModal();

  // 确保初始滚动位置正确
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current && selectedGenderText) {
        const genderIndex = genderTexts.indexOf(selectedGenderText);
        if (genderIndex >= 0) {
          const itemTotalHeight = 50 + 25; // ITEM_HEIGHT + ITEM_SPACING
          scrollViewRef.current.scrollTo({
            y: genderIndex * itemTotalHeight,
            animated: false,
          });
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedGenderText, genderTexts]);

  // 处理性别变化（用户滑动时调用，接收文本）
  const handleGenderChange = (genderText: string) => {
    setSelectedGenderText(genderText as GenderDisplayText);
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
      
      // 用户信息修改埋点
      track('user_profile_edit', {
        field_name: 'user_gender',
        old_value_length: userInfo.gender ? String(userInfo.gender).length : 0,
        new_value_length: String(genderCode).length,
      }, {
        page_id: 'edit_gender',
      });
      
      // 显示成功提示
      errorModal.show('已保存', '保存成功');
      
      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error('修改性别失败:', error);
      // 显示失败提示
      const errorMessage = error instanceof Error ? error.message : '保存失败，请稍后再试';
      errorModal.show(errorMessage);
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
      <QuestionnaireLayout
        header={<View />} // LoginHeader 是绝对定位的，header 模块为空
        headerHeight={top + HEADER_HEIGHT + 10} // 安全区域 + header高度 + 10px间距
        content={
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
        }
        floor={
          <QuestionnaireFloorButtons
            onBack={() => router.back()}
            onNext={handleSave}
            backText="取消"
            nextText={loading ? '保存中...' : '保存'}
            showPrivacyNotice={false}
            nextDisabled={loading}
          />
        }
      />
      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.error}
        title={errorModal.title || '操作失败'}
        onClose={errorModal.hide}
      />
    </ImageBackground>
  );
}

