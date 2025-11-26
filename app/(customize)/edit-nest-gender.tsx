import React, { useRef, useState, useEffect } from 'react';
import { View, ImageBackground, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeArea } from '@/hooks/useSafeArea';
import { LoginHeader } from '@/components/common/LoginHeader';
import { GenderPicker } from '@/components/login/GenderPicker';
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout';
import { QuestionnaireFloorButtons } from '@/components/questionnaire/QuestionnaireFloorButtons';
import { useCreateStore } from '@/store/createStore';
import { useUserStore } from '@/store/userStore';
import { saveAiSettings } from '@/services/api/aiSettings';
import { ErrorModal } from '@/components/common/ErrorModal';
import { useErrorModal } from '@/hooks/useErrorModal';
import { track } from '@/services/tracking';

const HEADER_HEIGHT = 44; // LoginHeader 高度

// NEST性别类型
type NestGenderType = '男' | '女' | '不愿意透露';

export default function EditNestGender() {
  const router = useRouter();
  const { top } = useSafeArea();
  const { aiGender, setAiGender, nestName } = useCreateStore();
  const { userInfo } = useUserStore();
  const [loading, setLoading] = useState(false);
  const errorModal = useErrorModal();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const genders: readonly NestGenderType[] = ['男', '女', '不愿意透露'];
  
  // 将store中的编码转换为显示格式
  const getSelectedGender = (): NestGenderType => {
    if (aiGender === null || aiGender === undefined || aiGender < 1 || aiGender > 3) {
      return genders[1]; // 默认选择"女"（编码2，索引1）
    }
    const genderIndex = aiGender - 1;
    return genders[genderIndex];
  };
  
  // 使用本地状态来跟踪当前选中的显示值
  const [currentSelectedGender, setCurrentSelectedGender] = useState<NestGenderType>(() => {
    return getSelectedGender();
  });

  // 确保初始滚动位置正确
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current && currentSelectedGender) {
        const genderIndex = genders.indexOf(currentSelectedGender);
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
  }, [currentSelectedGender, genders]);

  // 处理性别变化（用户滑动时调用）
  const handleGenderChange = (gender: NestGenderType) => {
    setCurrentSelectedGender(gender);
    
    // 将选择的性别转换为编码 (1=男, 2=女, 3=不愿意透露)
    const genderIndex = genders.indexOf(gender);
    if (genderIndex >= 0) {
      const genderCode = (genderIndex + 1) as 1 | 2 | 3;
      setAiGender(genderCode);
    }
  };

  // 处理保存
  const handleSave = async () => {
    if (loading) {
      return;
    }

    if (!userInfo.token || !userInfo.userId) {
      errorModal.show('请先登录');
      return;
    }

    // 获取当前选中的性别编码
    const genderIndex = genders.indexOf(currentSelectedGender);
    if (genderIndex < 0) {
      errorModal.show('请选择性别');
      return;
    }
    const genderCode = (genderIndex + 1) as 1 | 2 | 3;

    // 如果性别没有变化，直接返回
    if (genderCode === aiGender) {
      router.back();
      return;
    }

    try {
      setLoading(true);
      
      // 调用后端API保存性别（至少1秒防抖）
      const savePromise = saveAiSettings(
        {
          userId: userInfo.userId,
          nestGender: genderCode,
        },
        userInfo.token
      );
      const minDelayPromise = new Promise(resolve => setTimeout(resolve, 1000));
      
      await Promise.all([savePromise, minDelayPromise]);
      
      // 更新本地store
      setAiGender(genderCode);
      
      // 机器人设定修改埋点
      track('bot_settings_update', {
        field: 'nest_gender',
        old_value: aiGender,
        new_value: genderCode,
        bot_id: userInfo.profileId || '',
      }, {
        page_id: 'edit_nest_gender',
      });
      
      // 成功，直接返回
      router.back();
    } catch (error) {
      console.error('保存AI性别失败:', error);
      const errorMessage = error instanceof Error ? error.message : '保存失败，请稍后再试';
      errorModal.show(errorMessage);
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/login_background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title={`${nestName || 'AI机器人'}的性别`} backButton={true} />
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
                genders={genders}
                selectedGender={currentSelectedGender}
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

