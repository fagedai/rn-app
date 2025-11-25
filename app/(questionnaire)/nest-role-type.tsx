import React, { useState, useMemo } from 'react';
import { ImageBackground } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LoginHeader } from '@/components/common/LoginHeader';
import { SelectionModule, SelectionOptionConfig } from '@/components/common/SelectionModule';
import { useCreateStore } from '@/store/createStore';
import { useQuestionnaireStore } from '@/store/questionnaireStore';
import { useUserStore } from '@/store/userStore';
import { validateSingleChoice } from '@/utils/validation';
import { ErrorModal } from '@/components/common/ErrorModal';
import { submitQuestionnaire, type QuestionnaireSubmitData } from '@/services/api/questionnaire';
import { getArchetypeBackstory } from '@/services/api/archetype';
import { RoleInfoModal } from '@/components/common/RoleInfoModal';
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout';
import { QuestionnaireProgressTitle } from '@/components/questionnaire/QuestionnaireProgressTitle';
import { QuestionnaireFloorButtons } from '@/components/questionnaire/QuestionnaireFloorButtons';

// 4张图片，随机分配给15个选项
const BACKGROUND_IMAGES = [
  require('@/assets/intimacy.jpg'),
  require('@/assets/romance.jpg'),
  require('@/assets/joy.jpg'),
  require('@/assets/transcendence.jpg'),
];

// Q8界面选项配置
const Q8_OPTIONS_BASE: Omit<SelectionOptionConfig, 'showInfoIcon' | 'onInfoPress'>[] = [
  { 
    label: '邻家的元气邻居', 
    subtitle: '“今天又在楼下遇见你啦，要不要一起遛狗？”',
    value: '邻家的元气邻居',
    backgroundImage: BACKGROUND_IMAGES[0],
  },
  { 
    label: '取快递撞到的同学', 
    subtitle: '“上次撞到你还没道歉呢，我请奶茶？”',
    value: '取快递撞到的同学',
    backgroundImage: BACKGROUND_IMAGES[1],
  },
  { 
    label: '喜欢耍酷的街舞练习生', 
    subtitle: '“今晚广场有cypher，你来当我的唯一观众？”',
    value: '喜欢耍酷的街舞练习生',
    backgroundImage: BACKGROUND_IMAGES[2],
  },
  { 
    label: '夜班便利店店员', 
    subtitle: '“凌晨三点，城市只剩我和你，你想聊点什么？”',
    value: '夜班便利店店员',
    backgroundImage: BACKGROUND_IMAGES[3],
  },
  { 
    label: '温柔的钢琴老师', 
    subtitle: '“给你弹首《月光》，把今天的不开心都按住。”',
    value: '温柔的钢琴老师',
    backgroundImage: BACKGROUND_IMAGES[0],
  },
  { 
    label: '冷感系摄影师', 
    subtitle: '“我喜欢把故事藏在光影里，你呢？”',
    value: '冷感系摄影师',
    backgroundImage: BACKGROUND_IMAGES[1],
  },
  { 
    label: '硬核健身教练', 
    subtitle: '“先别emo，跟我做三组深蹲，把情绪甩出去。”',
    value: '硬核健身教练',
    backgroundImage: BACKGROUND_IMAGES[2],
  },
  { 
    label: '社恐但会写歌的室友', 
    subtitle: '“我把想你写进副歌，你要不要听个demo？”',
    value: '社恐但会写歌的室友',
    backgroundImage: BACKGROUND_IMAGES[3],
  },
  { 
    label: '旅行策展人', 
    subtitle: '“下一站去看海还是看雪？我已经订好了清单。”',
    value: '旅行策展人',
    backgroundImage: BACKGROUND_IMAGES[0],
  },
  { 
    label: '温酒的中医师', 
    subtitle: '“茶三分淡、话三分暖，慢慢说给我听。”',
    value: '温酒的中医师',
    backgroundImage: BACKGROUND_IMAGES[1],
  },
  { 
    label: '复古书店掌柜', 
    subtitle: '“第七排第三本是你的故事，我们一起翻开吗？”',
    value: '复古书店掌柜',
    backgroundImage: BACKGROUND_IMAGES[2],
  },
  { 
    label: '都市侦探爱好者', 
    subtitle: '“线索一：你今天心情不佳；线索二：我想逗你笑。”',
    value: '都市侦探爱好者',
    backgroundImage: BACKGROUND_IMAGES[3],
  },
  { 
    label: '赛博黑客搭档', 
    subtitle: '“我已经入侵你的不开心系统，准备清除bug。”',
    value: '赛博黑客搭档',
    backgroundImage: BACKGROUND_IMAGES[0],
  },
  { 
    label: '日本忍者学徒', 
    subtitle: '“影分身也挡不住想见你的心。”',
    value: '日本忍者学徒',
    backgroundImage: BACKGROUND_IMAGES[1],
  },
  { 
    label: '雇佣兵转兼职保镖', 
    subtitle: '“把安全感外包给我，情感也可以试着交一点。”',
    value: '雇佣兵转兼职保镖',
    backgroundImage: BACKGROUND_IMAGES[2],
  },
];

const PREVIOUS_PAGE_PROGRESS = 80;
const CURRENT_PAGE_PROGRESS_INCREMENT = 20;

export default function Q8RoleTypeSelection() {
  const router = useRouter();
  const { aiRoleType, setAiRoleType } = useCreateStore();
  const { setQ8AiRoleType, isAllCompleted, getSubmitData, resetAnswers } = useQuestionnaireStore();
  const { userInfo } = useUserStore();
  // 初始进度从上一页的进度值开始
  const [progress, setProgress] = useState(PREVIOUS_PAGE_PROGRESS);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRoleInfoModal, setShowRoleInfoModal] = useState(false);
  const [selectedArchetypeText, setSelectedArchetypeText] = useState<string>('');
  const [selectedRoleLabel, setSelectedRoleLabel] = useState<string>('');

  // 为所有选项添加信息图标配置
  const Q8_OPTIONS: SelectionOptionConfig[] = useMemo(() => {
    // 处理信息图标点击
    const handleInfoPress = (roleLabel: string) => {
      // 找到对应的选项配置，获取 label 和 subtitle
      const option = Q8_OPTIONS_BASE.find(opt => opt.label === roleLabel);
      if (option && option.label && option.subtitle) {
        // 格式化为 "标题 — 副标题"
        const archetypeText = `${option.label} — ${option.subtitle}`;
        setSelectedArchetypeText(archetypeText);
        setSelectedRoleLabel(option.label);
        setShowRoleInfoModal(true);
      } else {
        // 如果找不到配置，使用 label 作为 archetypeText
        setSelectedArchetypeText(roleLabel);
        setSelectedRoleLabel(roleLabel);
        setShowRoleInfoModal(true);
      }
    };

    return Q8_OPTIONS_BASE.map(option => ({
      ...option,
      showInfoIcon: true,
      onInfoPress: () => handleInfoPress(option.label),
    }));
  }, []);

  // 处理选项选择（单选）
  const handleSelect = (value: string) => {
    // 找到对应的选项配置，获取 label 和 subtitle
    const option = Q8_OPTIONS.find(opt => opt.value === value);
    if (option && option.label && option.subtitle) {
      // 存储格式："标题 — 副标题"
      const archetypeValue = `${option.label} — ${option.subtitle}`;
      setAiRoleType(archetypeValue);
      // 背景故事不再在这里设置，将在提交问卷时通过接口获取
    } else {
      // 如果找不到配置，使用原始值
    setAiRoleType(value);
    }
    // 选择后进度条增长20%
    setProgress(PREVIOUS_PAGE_PROGRESS + CURRENT_PAGE_PROGRESS_INCREMENT);
  };

  // 判断选项是否选中（需要匹配存储的格式）
  const isOptionSelected = (value: string) => {
    if (!aiRoleType) return false;
    // 找到对应的选项配置
    const option = Q8_OPTIONS.find(opt => opt.value === value);
    if (option && option.label && option.subtitle) {
      // 比较存储的格式："标题 — 副标题"
      const expectedValue = `${option.label} — ${option.subtitle}`;
      return aiRoleType === expectedValue;
    }
    // 如果没有 subtitle，直接比较
    return aiRoleType === value;
  };

  // 处理下一步按钮点击
  const handleNext = async () => {
    // 如果正在提交，禁止重复提交
    if (isSubmitting) {
      return;
    }

    // 验证
    const validation = validateSingleChoice(aiRoleType);
    if (!validation.valid) {
      setError(validation.error || '请选择一个选项');
      setShowErrorModal(true);
      return;
    }

    // 保存到问卷store
    setQ8AiRoleType(aiRoleType!);
    
    // 检查是否所有题目都已完成
    if (!isAllCompleted()) {
      setError('请完成所有题目');
      setShowErrorModal(true);
      return;
    }

    // 检查是否有 token
    if (!userInfo.token) {
      setError('请先登录');
      setShowErrorModal(true);
      setTimeout(() => {
        router.push('/(login)/login');
      }, 2000);
      return;
    }

    // 获取问卷数据
    const submitData = getSubmitData();
    if (!submitData) {
      setError('问卷数据不完整，请重新填写');
      setShowErrorModal(true);
      resetAnswers();
      setTimeout(() => {
        router.push('/(questionnaire)/name');
      }, 2000);
      return;
    }

    // 转换生日格式为 "YYYY-MM-DD"
    const birthdayObj = submitData.birthday!;
    const userBirthday = `${birthdayObj.year}-${String(birthdayObj.month).padStart(2, '0')}-${String(birthdayObj.day).padStart(2, '0')}`;

    // 检查 userId
    if (!userInfo.userId) {
      setError('用户信息不完整，请重新登录');
      setShowErrorModal(true);
      setIsSubmitting(false);
      setTimeout(() => {
        router.push('/(login)/login');
      }, 2000);
      return;
    }

    // 获取背景故事
    let nestBackstory = '';
    try {
      console.log('[Questionnaire] 获取背景故事:', submitData.aiRoleType);
      nestBackstory = await getArchetypeBackstory(submitData.aiRoleType!, userInfo.token || undefined);
      console.log('[Questionnaire] 背景故事获取成功');
      
      // 将背景故事保存到 createStore，以便在定制AI页面显示
      const { setAiBackgroundStory } = useCreateStore.getState();
      setAiBackgroundStory(nestBackstory);
    } catch (err) {
      console.error('获取背景故事失败:', err);
      // 如果获取背景故事失败，仍然继续提交（背景故事可以为空）
      setError('获取背景故事失败，将使用默认背景故事');
    }

    // 转换为提交格式（新接口格式）
    // userId 保持字符串格式直接发送，避免大整数精度丢失（JavaScript Number 最大安全整数为 2^53-1）
    // 直接使用字符串，JSON.stringify 会将其序列化为 JSON 字符串，后端可以解析字符串形式的数字
    const questionnaireData: QuestionnaireSubmitData = {
      userId: userInfo.userId, // 直接使用字符串，避免 Number() 转换导致精度丢失
      userName: submitData.name!,
      userGender: submitData.gender!,
      userBirthday: userBirthday,
      nestExpectation: submitData.aiExpectation!,
      nestGender: submitData.nestGender || 2, // 默认女 (2)，如果为null则使用默认值（后端会根据 archetype 自动获取）
      nestRole: submitData.role!,
      nestExperience: submitData.experience,
      nestArchetype: submitData.aiRoleType!, // 已经格式化为 "标题 — 副标题"
      nestBackstory: nestBackstory, // 通过接口获取的背景故事
    };

    // 打印提交数据，方便调试
    console.log('[Questionnaire] 提交数据:', questionnaireData);

    try {
      setIsSubmitting(true);
      // 提交问卷，获取 profileId
      const profileId = await submitQuestionnaire(questionnaireData, userInfo.token);
      
      // 保存 profileId 到 store
      const { setProfileId } = useUserStore.getState();
      setProfileId(profileId);
      
      // 提交成功后，清空临时答案
      resetAnswers();
      
      // 跳转到加载界面
    router.push('/(chat)/loading');
    } catch (err) {
      console.error('提交问卷失败:', err);
      const errorMessage = err instanceof Error ? err.message : '提交失败，请稍后重试';
      setError(errorMessage);
      setShowErrorModal(true);
      setIsSubmitting(false);
      // 提交失败，返回问卷Q1重新填写
      setTimeout(() => {
        resetAnswers();
        router.push('/(questionnaire)/name');
      }, 2000);
    }
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
            title="你的 AI 具有哪种角色类型"
            progress={progress}
            showProgressBar={true}
          />
        }
        content={
          <SelectionModule
            options={Q8_OPTIONS}
            selectedValue={aiRoleType}
            onSelect={handleSelect}
            multiple={false}
            isOptionSelected={isOptionSelected}
          />
        }
        floor={
          <QuestionnaireFloorButtons
            onBack={handleBack}
            onNext={handleNext}
            nextDisabled={!aiRoleType}
          />
        }
      />
      <ErrorModal
        visible={showErrorModal}
        message={error || ''}
        onClose={() => setShowErrorModal(false)}
      />
      <RoleInfoModal
        visible={showRoleInfoModal}
        archetypeText={selectedArchetypeText}
        roleLabel={selectedRoleLabel}
        onClose={() => setShowRoleInfoModal(false)}
      />
    </ImageBackground>
  );
}
