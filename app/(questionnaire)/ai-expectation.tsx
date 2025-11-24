import React, { useState } from 'react';
import { ImageBackground } from 'react-native';
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

// AI期望选项配置
const AI_EXPECTATION_OPTIONS: SelectionOptionConfig[] = [
  { label: '可以倾诉的人', value: '可以倾诉的人' },
  { label: '浪漫伴侣', value: '浪漫伴侣' },
  { label: '一个我可以依靠的稳定伴侣', value: '一个我可以依靠的稳定伴侣' },
  { label: '一个不带评判地理解我的人', value: '一个不带评判地理解我的人' },
  { label: '一起玩乐的人', value: '一起玩乐的人' },
  { label: '超越这些的某样东西', value: '超越这些的某样东西' },
];

const PREVIOUS_PAGE_PROGRESS = 40;
const CURRENT_PAGE_PROGRESS_INCREMENT = 20;

export default function AIExpectationSelection() {
  const router = useRouter();
  const { aiExpectation, setAiExpectation } = useCreateStore();
  const { setQ6AiExpectation } = useQuestionnaireStore();
  // 初始进度从上一页的进度值开始
  const [progress, setProgress] = useState(PREVIOUS_PAGE_PROGRESS);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // 处理选项选择（单选）
  const handleSelect = (value: string) => {
    setAiExpectation(value);
    // 选择后进度条增长15%
    setProgress(PREVIOUS_PAGE_PROGRESS + CURRENT_PAGE_PROGRESS_INCREMENT);
  };

  // 处理下一步按钮点击
  const handleNext = () => {
    // 验证
    const validation = validateSingleChoice(aiExpectation);
    if (!validation.valid) {
      setError(validation.error || '请选择一个选项');
      setShowErrorModal(true);
      return;
    }

    // 保存到问卷store
    setQ6AiExpectation(aiExpectation!);
    
    // 进入experience界面
    router.push('/(questionnaire)/experience');
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
            title="最重要的是，你希望你的 AI 是……"
            progress={progress}
            showProgressBar={true}
          />
        }
        content={
          <SelectionModule
            options={AI_EXPECTATION_OPTIONS}
            selectedValue={aiExpectation}
            onSelect={handleSelect}
            multiple={false}
          />
        }
        floor={
          <QuestionnaireFloorButtons
            onBack={handleBack}
            onNext={handleNext}
            nextDisabled={!aiExpectation}
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

