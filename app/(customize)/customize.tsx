import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, ImageBackground, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateStore } from '@/store/createStore';
import { RelationshipSelector } from '@/components/create/RelationshipSelector';
import { TextPreviewCard } from '@/components/create/TextPreviewCard';
// import { VoicePreviewCard } from '@/components/create/VoicePreviewCard';
import { LoginHeader } from '@/components/common/LoginHeader';
import { useSafeArea } from '@/hooks/useSafeArea';
import { aiGenderCodeToSymbol } from '@/utils/genderUtils';
import { saveAiSettings } from '@/services/api/aiSettings';
import { useUserStore } from '@/store/userStore';
import { ErrorModal } from '@/components/common/ErrorModal';
import { useFocusEffect } from '@react-navigation/native';
import { track } from '@/services/tracking';
// import { Ionicons } from '@expo/vector-icons';

const RELATIONSHIP_OPTIONS = ['朋友', '伴侣', '兄弟姐妹', '导师'];

export default function CustomizeAI() {
  const router = useRouter();
  const { getTopSpacing } = useSafeArea();
  const { userInfo } = useUserStore();
  const {
    nestName,
    aiNestName,
    aiGender,
    aiRelationship,
    setAiRelationship,
    aiMemory,
    setAiMemory,
    aiBackgroundStory,
    nestLastMemory,
    lastCreatedMemory,
    setLastCreatedMemory,
    // aiVoice,
  } = useCreateStore();
  
  const DEFAULT_MEMORY = '随着时间的推移,NEST与用户之间的联系变得更加个性化。NEST会在夜间主动进行签到,感知用户何时感到孤独。';
  
  const [isTraining, setIsTraining] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const previousRelationshipRef = useRef<string>(aiRelationship);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRelationshipRef = useRef<string | null>(null);

  // 不再从后端获取背景故事，直接使用 store 中的值

  const handleNamePress = () => {
    router.push('/(customize)/edit-nest-name');
  };

  const handleGenderPress = () => {
    router.push('/(customize)/edit-nest-gender');
  };

  const handleMemoryPress = () => {
    router.push('/(customize)/memory');
  };

  const handleBackgroundStoryPress = () => {
    router.push({
      pathname: '/(customize)/text-editor',
      params: { type: 'backgroundStory', title: 'TA的背景故事' },
    });
  };

  // const handleVoicePress = () => {
  //   router.push('/(customize)/voice');
  // };

  // 显示 ErrorModal
  const showErrorModal = useCallback((message: string) => {
    setErrorModalMessage(message);
    setErrorModalVisible(true);
  }, []);

  // 保存关系（带节流和错误处理）
  const handleRelationshipSelect = useCallback(async (relationship: string) => {
    // 如果和当前选中相同，不处理
    if (relationship === aiRelationship) {
      return;
    }

    // 保存旧值用于回滚
    const oldRelationship = aiRelationship;
    
    // 立即更新UI（乐观更新）
    setAiRelationship(relationship);
    previousRelationshipRef.current = relationship;

    // 清除之前的节流定时器
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
    }

    // 保存待处理的关系
    pendingRelationshipRef.current = relationship;

    // 节流：800ms内只接受一次提交
    throttleTimerRef.current = setTimeout(async () => {
      const relationshipToSave = pendingRelationshipRef.current;
      if (!relationshipToSave || !userInfo.token || !userInfo.userId) {
        return;
      }

      try {
        // 显示全屏Loading（如果训练时间长）
        setIsTraining(true);

        // 调用API，只传变化的参数
        await saveAiSettings(
          {
            userId: userInfo.userId,
            nestRelationship: relationshipToSave,
          },
          userInfo.token
        );

        // 保存成功，关闭Loading
        setIsTraining(false);
        // 清除待处理的关系
        pendingRelationshipRef.current = null;
        
        // 机器人设定修改埋点
        track('bot_settings_update', {
          field: 'nest_relationship',
          old_value: oldRelationship,
          new_value: relationshipToSave,
          bot_id: userInfo.profileId || '',
        }, {
          page_id: 'customize_page',
        });
      } catch (error) {
        console.error('保存关系失败:', error);
        
        // 保存失败，关闭Loading并回滚
        setIsTraining(false);
        setAiRelationship(oldRelationship);
        previousRelationshipRef.current = oldRelationship;
        pendingRelationshipRef.current = null;
        
        // 显示错误提示
        const errorMessage = error instanceof Error ? error.message : '更新失败，请重试';
        showErrorModal(errorMessage);
      }
    }, 800);
  }, [aiRelationship, userInfo.token, userInfo.userId, setAiRelationship, showErrorModal]);


  // 页面聚焦时刷新记忆（从记忆页面返回时，使用本地记录的最后创建的记忆）
  useFocusEffect(
    useCallback(() => {
      // 机器人设定页曝光埋点
      track('page_view_customize', {
        bot_id: userInfo.profileId || '',
      }, {
        page_id: 'customize_page',
      });

      // 使用 setTimeout 延迟状态更新，避免快速状态变化导致视图管理错误
      const timer = setTimeout(() => {
        try {
          // 如果用户在记忆页面创建/编辑了记忆，使用本地记录的记忆
          if (lastCreatedMemory) {
            // 更新 aiMemory 和 nestLastMemory
            setAiMemory(lastCreatedMemory);
            const { setNestLastMemory } = useCreateStore.getState();
            setNestLastMemory(lastCreatedMemory);
            // 清除本地记录，避免下次误用
            setLastCreatedMemory(null);
            return;
          }
          
          // 如果已经有 nestLastMemory，不需要重新请求
          if (nestLastMemory) {
            // 确保 aiMemory 也使用 nestLastMemory
            if (aiMemory !== nestLastMemory) {
              setAiMemory(nestLastMemory);
            }
            return;
          }
          
          // 如果没有 nestLastMemory 且没有 lastCreatedMemory，使用默认记忆
          if (!aiMemory || aiMemory === DEFAULT_MEMORY) {
            setAiMemory(DEFAULT_MEMORY);
          }
        } catch (error) {
          console.error('[Customize] useFocusEffect 错误:', error);
        }
      }, 100); // 延迟 100ms，避免快速状态更新

      return () => {
        clearTimeout(timer);
      };
    }, [nestLastMemory, lastCreatedMemory, setAiMemory, setLastCreatedMemory, aiMemory, userInfo.profileId])
  );

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  return (
    <ImageBackground
      source={require('@/assets/customize_background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader 
        title="定制AI设置" 
        backButton={
          <TouchableOpacity 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(chat)/chat');
              }
            }} 
            style={{ 
              paddingLeft: 16,
              paddingVertical: 8,
              paddingRight: 8,
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={require('@/assets/arrow-left.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        } 
      />
      <SafeAreaView className="flex-1" edges={['bottom']} style={{ paddingTop: getTopSpacing(44, 16) }}>
        <View className="flex-1 px-6">

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* AI名称 */}
            <View className="items-center" style={{ marginBottom: 11 }}>
              <TouchableOpacity
                onPress={handleNamePress}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontFamily: 'Agbalumo',
                    fontWeight: '400',
                    fontSize: 32,
                    lineHeight: 32,
                    letterSpacing: 0,
                    color: '#FFFFFF',
                    textAlign: 'center',
                  }}
                >
                  {nestName || aiNestName || 'NEST'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 性别区域 */}
            <View className="items-center mb-6">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>性别：</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
                  {aiGenderCodeToSymbol(aiGender)}
                </Text>
                <TouchableOpacity
                  onPress={handleGenderPress}
                  activeOpacity={0.7}
                  style={{ marginLeft: 8 }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, textDecorationLine: 'underline' }}>
                    修改
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 关系选择 */}
            <View className="mb-6">
              <RelationshipSelector
                selected={aiRelationship}
                options={RELATIONSHIP_OPTIONS}
                onSelect={handleRelationshipSelect}
              />
            </View>

            {/* TA的记忆 */}
            <TextPreviewCard
              title="TA的记忆"
              text={nestLastMemory || aiMemory || DEFAULT_MEMORY}
              maxLines={3}
              onPress={handleMemoryPress}
            />

            {/* TA的背景故事 */}
            <TextPreviewCard
              title="TA的背景故事"
              text={aiBackgroundStory}
              maxLines={3}
              onPress={handleBackgroundStoryPress}
            />
            {/* 声音设置 */}
            {/* <TouchableOpacity
              onPress={handleVoicePress}
              className="flex-row items-center justify-between mb-4"
            >
              <Text className="text-white text-lg font-medium">TA的声音设置</Text>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity> */}
            {/* 声音预览 */}
            {/* <View
              className="border border-white/30 rounded-25"
              style={{
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderBottomWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 25,
                padding: 15,
                backgroundColor: '#44396C',
              }}
            >
              <VoicePreviewCard currentVoice={aiVoice} />
            </View> */}
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* 全屏Loading（训练中） */}
      <Modal visible={isTraining} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: 24,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', marginTop: 16, fontSize: 14 }}>
              正在训练AI，请稍候...
            </Text>
          </View>
        </View>
      </Modal>

      {/* ErrorModal 提示 */}
      <ErrorModal
        visible={errorModalVisible}
        message={errorModalMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </ImageBackground>
  );
}

