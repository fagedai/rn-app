import React, { useState } from 'react';
import { View, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeArea } from '@/hooks/useSafeArea';
import { LoginHeader } from '@/components/common/LoginHeader';
import { StepIndicator } from '@/components/common/StepIndicator';
import { NameInput } from '@/components/login/NameInput';
import { useUserStore } from '@/store/userStore';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { validateName } from '@/utils/validation';
import { ErrorModal } from '@/components/common/ErrorModal';
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout';
import { QuestionnaireFloorButton } from '@/components/questionnaire/QuestionnaireFloorButton';
import { track } from '@/services/tracking';
import { useEffect } from 'react';

const HEADER_HEIGHT = 44; // LoginHeader 高度

export default function LoginName() {
  const router = useRouter();
  const { top } = useSafeArea();
  const { userInfo, setName } = useUserStore();
  const { setQ1Name } = useQuestionnaireStore();
  const [name, setNameLocal] = useState(userInfo.name || '');
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleNameChange = (text: string) => {
    setNameLocal(text);
    setName(text);
  };

  const handleNext = () => {
    const validation = validateName(name);
    if (!validation.valid) {
      setError(validation.error || '请输入有效的姓名');
      setShowErrorModal(true);
      return;
    }

    // 问卷题目作答埋点
    track('question_answer', {
      question_id: 'q1_name',
      answer_type: 'text',
      answer_value: name.trim(),
    }, {
      page_id: 'questionnaire_name',
    });

    // 保存到问卷store
    setQ1Name(name.trim());
    // 进入Q2
    router.push('/(questionnaire)/gender');
  };

  // 问卷第一页曝光埋点
  useEffect(() => {
    track('page_view_questionnaire', {}, {
      page_id: 'questionnaire_name',
    });
  }, []);

  return (
    <ImageBackground
      source={require('@/assets/login_background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="你的名字" />
      <QuestionnaireLayout
        header={<View />} // LoginHeader 是绝对定位的，header 模块为空
        headerHeight={top + HEADER_HEIGHT + 10} // 安全区域 + header高度 + 10px间距
        content={
          <View className="flex-1 justify-center">
            <NameInput value={name} onChangeText={handleNameChange} />
          </View>
        }
        floor={
          <QuestionnaireFloorButton
            text="下一步"
            onPress={handleNext}
            renderStepIndicator={() => <StepIndicator currentStep={1} />}
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

