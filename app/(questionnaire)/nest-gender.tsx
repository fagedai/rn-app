import React, { useRef, useState, useEffect } from 'react';
import { View, ImageBackground, ScrollView, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginHeader } from '@/components/common/LoginHeader';
import { NavigationButtons } from '@/components/common/NavigationButtons';
import { GenderPicker } from '@/components/login/GenderPicker';
import { ProgressBar } from '@/components/login/ProgressBar';
import { useCreateStore } from '@/store/createStore';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { ErrorModal } from '@/components/common/ErrorModal';

// NEST性别类型
type NestGenderType = '男' | '女' | '不愿意透露';

const PREVIOUS_PAGE_PROGRESS = 20;
const CURRENT_PAGE_PROGRESS_INCREMENT = 20;

export default function Q5NestGenderSelection() {
  const router = useRouter();
  const { aiGender, setAiGender } = useCreateStore();
  const { setQ5NestGender } = useQuestionnaireStore();
  const defaultGenderIndex = 1; // 默认选择中间选项"女" (索引1)
  
  const genders: readonly NestGenderType[] = ['男', '女', '不愿意透露'];
  
  // 将store中的编码转换为显示格式
  const getSelectedGender = (): NestGenderType => {
    // 如果 aiGender 是 null 或 undefined，或者不在有效范围内，使用默认值（女）
    if (aiGender === null || aiGender === undefined || aiGender < 1 || aiGender > 3) {
      return genders[defaultGenderIndex]; // 默认选择"女"（编码2，索引1）
    }
    // 编码转索引：1→0, 2→1, 3→2
    const genderIndex = aiGender - 1;
    return genders[genderIndex];
  };
  
  // 使用本地状态来跟踪当前选中的显示值，这样可以正确区分"女"和"不愿意透露"
  // 初始值使用默认值"女"（编码2，索引1）
  const [currentSelectedGender, setCurrentSelectedGender] = useState<NestGenderType>(() => {
    const selected = getSelectedGender();
    // 如果获取到的不是默认值，确保设置为默认值
    if (selected !== genders[defaultGenderIndex]) {
      // 如果 store 中没有值或值无效，使用默认值
      if (aiGender === null || aiGender === undefined || aiGender < 1 || aiGender > 3) {
        return genders[defaultGenderIndex];
      }
    }
    return selected;
  });
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 初始化：如果 store 中没有值，设置为默认值（女，编码2）
  useEffect(() => {
    if (aiGender === null || aiGender === undefined || aiGender < 1 || aiGender > 3) {
      setAiGender(2); // 设置为"女"（编码2）
      setCurrentSelectedGender(genders[defaultGenderIndex]); // 设置为"女"
    }
  }, []);

  // 标记用户是否滑动过
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  // 初始进度从上一页的进度值开始
  const [progress, setProgress] = useState(PREVIOUS_PAGE_PROGRESS);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // 初始滚动现在由 GenderPicker 组件内部处理
  // 不再需要在这里手动设置滚动位置

  // 处理性别变化（用户滑动时调用）
  const handleGenderChange = (gender: NestGenderType) => {
    setHasUserScrolled(true);
    // 更新本地状态以正确显示高亮
    setCurrentSelectedGender(gender);
    
    // 将选择的性别转换为编码 (1=男, 2=女, 3=不愿意透露)
    const genderIndex = genders.indexOf(gender);
    if (genderIndex >= 0) {
      const genderCode = (genderIndex + 1) as 1 | 2 | 3; // 索引转编码：0→1, 1→2, 2→3
      setAiGender(genderCode);
    }
    
    // 选择后进度条增加15%
    setProgress(PREVIOUS_PAGE_PROGRESS + CURRENT_PAGE_PROGRESS_INCREMENT);
  };

  // 处理下一步按钮点击
  const handleNext = () => {
    let genderToSubmit: 1 | 2 | 3;
    
    if (!hasUserScrolled) {
      // 用户未滑动，提交默认性别（女，编码2）
      genderToSubmit = 2; // 女 = 2
      setAiGender(2); // createStore 中使用编码
      // 未滑动时，如果还没有更新进度，现在更新
      if (progress === PREVIOUS_PAGE_PROGRESS) {
        setProgress(PREVIOUS_PAGE_PROGRESS + CURRENT_PAGE_PROGRESS_INCREMENT);
      }
    } else {
      // 直接使用编码（1=男, 2=女, 3=不愿意透露）
      genderToSubmit = aiGender as 1 | 2 | 3;
    }
    
    // 保存到问卷store（使用编码格式：1=男, 2=女, 3=不愿意透露）
    setQ5NestGender(genderToSubmit);
    
    // 进入ai-expectation界面
    router.push('/(questionnaire)/nest-expectation');
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
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          {/* 进度条 */}
          <View style={{ marginBottom: 29, marginTop: 26 }}>
            <ProgressBar progress={progress} />
          </View>

          {/* 标题：距离进度条下方29px，距离第一个选项32px */}
          <View>
            <Text 
              className="text-center"
              style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              你希望你的NEST是什么性别
            </Text>
          </View>

          <View
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 600,
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

          <NavigationButtons
            onBack={handleBack}
            onNext={handleNext}
          />
        </View>
      </SafeAreaView>
      <ErrorModal
        visible={showErrorModal}
        message={error || ''}
        onClose={() => setShowErrorModal(false)}
      />
    </ImageBackground>
  );
}

