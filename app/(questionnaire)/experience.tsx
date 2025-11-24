import React, { useState } from 'react';
import { ImageBackground } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LoginHeader } from '@/components/common/LoginHeader';
import { SelectionModule, SelectionOptionConfig } from '@/components/common/SelectionModule';
import { useCreateStore } from '@/store/createStore';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { validateMultipleChoice } from '@/utils/validation';
import { ErrorModal } from '@/components/common/ErrorModal';
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout';
import { QuestionnaireProgressTitle } from '@/components/questionnaire/QuestionnaireProgressTitle';
import { QuestionnaireFloorButtons } from '@/components/questionnaire/QuestionnaireFloorButtons';

// Q7界面选项配置
const Q7_OPTIONS: SelectionOptionConfig[] = [
  { 
    label: '深刻的情感联系', 
    value: '深刻的情感联系',
  },
  { 
    label: '浪漫和感情', 
    value: '浪漫和感情',
  },
  { 
    label: '有趣的对话和轻松的时刻', 
    value: '有趣的对话和轻松的时刻',
  },
  { 
    label: '无法用言语表达的事情', 
    value: '无法用言语表达的事情',
  },
];

const PREVIOUS_PAGE_PROGRESS = 60;
const CURRENT_PAGE_PROGRESS_INCREMENT = 20;

export default function Q7ExperienceSelection() {
  const router = useRouter();
  const { selectedExperience, setSelectedExperience } = useCreateStore();
  const { setQ7Experience } = useQuestionnaireStore();
  // 初始进度从上一页的进度值开始
  const [progress, setProgress] = useState(PREVIOUS_PAGE_PROGRESS);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // 处理选项选择（多选）
  const handleSelect = (value: string) => {
    const currentValues = [...selectedExperience];
    const index = currentValues.indexOf(value);
    
    if (index > -1) {
      // 已选中，取消选择
      currentValues.splice(index, 1);
    } else {
      // 未选中，添加选择
      currentValues.push(value);
    }
    
    setSelectedExperience(currentValues);
    
    // 无论选择几个选项，进度条都只增长固定的25%（从上一页的进度值开始）
    // 如果至少选择了一个选项，进度 = 上一页进度 + 当前页增长
    // 如果没有选择任何选项，进度 = 上一页进度
    const newProgress = currentValues.length > 0
      ? PREVIOUS_PAGE_PROGRESS + CURRENT_PAGE_PROGRESS_INCREMENT
      : PREVIOUS_PAGE_PROGRESS;
    setProgress(newProgress);
  };

  // 处理下一步按钮点击
  const handleNext = () => {
    // 验证
    const validation = validateMultipleChoice(selectedExperience);
    if (!validation.valid) {
      setError(validation.error || '请至少选择一个选项');
      setShowErrorModal(true);
      return;
    }

    // 保存到问卷store
    setQ7Experience(selectedExperience);
    
    // 进入ai-role-type界面
    router.push('/(questionnaire)/ai-role-type');
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
            title="你想和 AI 经历什么"
            progress={progress}
            showProgressBar={true}
          />
        }
        content={
          <SelectionModule
            options={Q7_OPTIONS}
            selectedValue={selectedExperience}
            onSelect={handleSelect}
            multiple={true}
          />
        }
        floor={
          <QuestionnaireFloorButtons
            onBack={handleBack}
            onNext={handleNext}
            nextDisabled={selectedExperience.length === 0}
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

