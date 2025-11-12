import React, { useState } from 'react';
import { View, ImageBackground } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '../../components/login/ProgressBar';
import { SelectionModule, SelectionOptionConfig } from '../../components/common/SelectionModule';
import { NavigationButtons } from '../../components/common/NavigationButtons';
import { useCreateStore } from '../../store/createStore';

// 步骤配置类型
interface StepConfig {
  title: string;
  options: SelectionOptionConfig[];
  storeKey: 'selectedRole' | 'selectedExperience'; // 对应 store 中的 key，添加新步骤时需要扩展此类型
  progressIncrement: number; // 选择后增加的进度百分比
}

// 步骤配置数组 - 可以轻松添加更多步骤
const STEP_CONFIGS: StepConfig[] = [
  {
    title: '你希望你的AI机器人成为你的什么?',
    options: [
      { label: '特别的人', value: '特别的人' },
      { label: '一个频听和关心的朋友', value: '一个频听和关心的朋友' },
      { label: '支特我心理健康的人', value: '支特我心理健康的人' },
      { label: '一个帮助段实现目标的教练', value: '一个帮助段实现目标的教练' },
      { label: '一个英语导师来练习', value: '一个英语导师来练习' },
      { label: '完全不同的东西', value: '完全不同的东西' },
    ],
    storeKey: 'selectedRole',
    progressIncrement: 10,
  },
  {
    title: '你想和你的AI女友经历什么?',
    options: [
      { label: '深刻的情感联系', value: '深刻的情感联系' },
      { label: '浪漫和感情', value: '浪漫和感情' },
      { label: '有趣的对话和轻松的时刻', value: '有趣的对话和轻松的时刻' },
      { label: '无法用言语表达的事情', value: '无法用言语表达的事情' },
      // 如果需要背景图片，可以这样添加：
      // { label: '深刻的情感联系', value: '深刻的情感联系', backgroundImage: require('../../assets/exp1.png') },
    ],
    storeKey: 'selectedExperience',
    progressIncrement: 10,
  },
];

export default function AIRoleSelection() {
  const router = useRouter();
  const { selectedRole, setSelectedRole, selectedExperience, setSelectedExperience } = useCreateStore();
  const [currentStep, setCurrentStep] = useState(0); // 当前步骤索引

  const currentConfig = STEP_CONFIGS[currentStep];
  const isLastStep = currentStep === STEP_CONFIGS.length - 1;

  // 获取当前步骤的选中值
  const getCurrentSelectedValue = (): string | null => {
    if (currentConfig.storeKey === 'selectedRole') {
      return selectedRole;
    } else if (currentConfig.storeKey === 'selectedExperience') {
      return selectedExperience;
    }
    return null;
  };

  // 设置当前步骤的选中值
  const setCurrentSelectedValue = (value: string) => {
    if (currentConfig.storeKey === 'selectedRole') {
      setSelectedRole(value);
    } else if (currentConfig.storeKey === 'selectedExperience') {
      setSelectedExperience(value);
    }
  };

  // 计算进度条
  const calculateProgress = () => {
    let progress = 0;
    for (let i = 0; i <= currentStep; i++) {
      const config = STEP_CONFIGS[i];
      const selectedValue = config.storeKey === 'selectedRole' ? selectedRole : selectedExperience;
      if (selectedValue) {
        progress += config.progressIncrement;
      }
    }
    return progress;
  };

  const handleNext = () => {
    const selectedValue = getCurrentSelectedValue();
    
    if (!selectedValue) {
      // 如果没有选择，不允许进入下一步
      return;
    }

    if (isLastStep) {
      // 最后一步：跳转到定制AI设置页面
      console.log('All selections:', { selectedRole, selectedExperience });
      router.push('/create/customize');
    } else {
      // 进入下一步
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      // 第一步：返回上一页
      router.back();
    } else {
      // 返回上一步
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          <ProgressBar progress={calculateProgress()} />

          <SelectionModule
            title={currentConfig.title}
            options={currentConfig.options}
            selectedValue={getCurrentSelectedValue()}
            onSelect={setCurrentSelectedValue}
          />

          <NavigationButtons
            onBack={handleBack}
            onNext={handleNext}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

