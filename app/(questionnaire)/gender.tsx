import React, { useRef, useState, useEffect } from 'react';
import { View, ImageBackground, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeArea } from '@/hooks/useSafeArea';
import { LoginHeader } from '@/components/common/LoginHeader';
import { StepIndicator } from '@/components/common/StepIndicator';
import { GenderPicker } from '@/components/login/GenderPicker';
import { useUserStore, GenderType } from '@/store/userStore';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { getAllGenderTexts, genderTextToCode, genderCodeToText } from '@/utils/genderUtils';
import { ErrorModal } from '@/components/common/ErrorModal';
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout';
import { QuestionnaireFloorButtons } from '@/components/questionnaire/QuestionnaireFloorButtons';

const HEADER_HEIGHT = 44; // LoginHeader 高度

export default function LoginGender() {
  const router = useRouter();
  const { top } = useSafeArea();
  const { userInfo, setGender } = useUserStore();
  const { setQ2Gender } = useQuestionnaireStore();
  const defaultGenderCode: GenderType = 2; // 默认选择"女"
  const selectedGenderCode = userInfo.gender || defaultGenderCode;
  const scrollViewRef = useRef<ScrollView>(null);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // 标记用户是否滑动过
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  // 使用显示文本数组（用于 UI 显示）
  const genderTexts = getAllGenderTexts();
  // 当前选中的性别文本（用于 UI 显示）
  // 如果 selectedGenderCode 是 2（女），则显示"女"，否则使用转换后的文本或默认"女"
  const selectedGenderText = genderCodeToText(selectedGenderCode) || '女';

  // 如果用户信息中没有性别，初始化设置为默认值（女）
  useEffect(() => {
    if (!userInfo.gender) {
      setGender(defaultGenderCode);
    }
  }, [setGender, defaultGenderCode, userInfo.gender]);

  // 确保初始滚动位置正确（延迟执行，确保组件已渲染）
  useEffect(() => {
    // 延迟滚动，确保 GenderPicker 已完全渲染
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
    setHasUserScrolled(true);
    const genderCode = genderTextToCode(genderText as '男' | '女' | '不愿意透露');
    setGender(genderCode);
  };

  // 处理下一步按钮点击
  const handleNext = () => {
    let genderCodeToSubmit: GenderType;
    
    if (hasUserScrolled) {
      // 用户滑动过，提交用户选择的性别
      genderCodeToSubmit = selectedGenderCode;
    } else {
      // 用户未滑动，提交默认性别（女=2）
      genderCodeToSubmit = defaultGenderCode;
    }
    
    // 验证
    if (!genderCodeToSubmit) {
      setError('请选择性别');
      setShowErrorModal(true);
      return;
    }
    
    // 保存临时答案（数字格式）
    setGender(genderCodeToSubmit);
    setQ2Gender(genderCodeToSubmit);
    
    // 进入Q3界面（birthday页面）
    router.push('/(questionnaire)/birthday');
  };

  return (
    <ImageBackground
      source={require('@/assets/login_background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="你的性别" backButton={false} />
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
            onNext={handleNext}
            renderStepIndicator={() => <StepIndicator currentStep={2} />}
          />
        }
      />
      <ErrorModal
        visible={showErrorModal}
        message={error || ''}
        onClose={() => setShowErrorModal(false)}
      />
    </ImageBackground>
  );
}

