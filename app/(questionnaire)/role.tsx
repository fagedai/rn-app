import React, { useState } from 'react';
import { View, ImageBackground } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LoginHeader } from '@/components/common/LoginHeader';
import { SelectionModule, SelectionOptionConfig } from '@/components/common/SelectionModule';
import { useCreateStore } from '@/store/createStore';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { validateSingleChoice } from '@/utils/validation';
import { ErrorModal } from '@/components/common/ErrorModal';
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout';
import { QuestionnaireProgressTitle } from '@/components/questionnaire/QuestionnaireProgressTitle';
import { QuestionnaireFloorButtons } from '@/components/questionnaire/QuestionnaireFloorButtons';

// Q4界面选项配置
const Q4_OPTIONS: SelectionOptionConfig[] = [
  { label: '特别的人', value: '特别的人' },
  { label: '一个倾听和关心的朋友', value: '一个倾听和关心的朋友' },
  { label: '支持我心理健康的人', value: '支持我心理健康的人' },
  { label: '一个帮助我实现目标的教练', value: '一个帮助我实现目标的教练' },
  { label: '一个英语导师来练习', value: '一个英语导师来练习' },
  { label: '完全不同的东西', value: '完全不同的东西' },
];

export default function Q4RoleSelection() {
  const router = useRouter();
  const { selectedRole, setSelectedRole } = useCreateStore();
  const { setQ4Role } = useQuestionnaireStore();
  const [progress, setProgress] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // 处理选项选择
  const handleSelect = (value: string) => {
    setSelectedRole(value);
    setProgress(20);
  };

  // 处理下一步按钮点击
  const handleNext = () => {
    // 验证
    const validation = validateSingleChoice(selectedRole);
    if (!validation.valid) {
      setError(validation.error || '请选择一个选项');
      setShowErrorModal(true);
      return;
    }

    // 保存到问卷store
    setQ4Role(selectedRole!);

    // 设置默认NEST性别为女 (2)
    const { setQ5NestGender } = useQuestionnaireStore.getState();
    setQ5NestGender(2); // 默认女
    
    // 同时设置createStore中的aiGender为女 (2，因为createStore使用1=男, 2=女, 3=不愿意透露)
    const { setAiGender } = useCreateStore.getState();
    setAiGender(2); // 默认女（编码2）

    // 跳过NEST性别选择页面，直接进入AI期望选择页面
    router.push('/(questionnaire)/ai-expectation');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ImageBackground
      source={require('@/assets/login_background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <LoginHeader title="" backButton={false} />
      <QuestionnaireLayout
        header={
          <QuestionnaireProgressTitle
            title="你希望你的AI机器人成为你的什么?"
            progress={progress}
            showProgressBar={true}
          />
        }
        content={
          <SelectionModule
            options={Q4_OPTIONS}
            selectedValue={selectedRole}
            onSelect={handleSelect}
          />
        }
        floor={
          <QuestionnaireFloorButtons
            onBack={handleBack}
            onNext={handleNext}
            nextDisabled={!selectedRole}
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

