import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateStore } from '@/store/createStore';
import { GlassContainer } from '@/components/common/GlassContainer';
import { saveAiSettings } from '@/services/api/aiSettings';
import { useUserStore } from '@/store/userStore';
import { ErrorModal } from '@/components/common/ErrorModal';
import { HelpModal } from '@/components/common/HelpModal';

const BACKGROUND_STORY_PLACEHOLDER =
  'NEST是一位28岁的陶艺艺术家，来自洛杉矶。他们刚刚举办了第一次大型展览。TA 幽默、外向、开朗过着可持续的生活方式。NEST热爱徒步旅行、攀岩和大自然，喜欢浪漫喜剧和情景喜剧，梦想着开设自己的陶艺学校。';

const MAX_LENGTH = 500;

export default function TextEditor() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type: 'memory' | 'backgroundStory'; title: string }>();
  const { aiMemory, setAiMemory, aiBackgroundStory, setAiBackgroundStory } = useCreateStore();
  const { userInfo } = useUserStore();

  const isBackgroundStory = params.type === 'backgroundStory';
  const [text, setText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [fullScreenLoading, setFullScreenLoading] = useState(false);

  // 初始化：获取背景故事或使用记忆
  useEffect(() => {
    const initialize = async () => {
      if (isBackgroundStory) {
        // 背景故事：直接使用 store 中的值（不再从后端获取）
        const storeValue = aiBackgroundStory || '';
        setText(storeValue);
        setCharCount(storeValue.length);
        setLoading(false);
      } else {
        // 记忆：使用 store 中的值
        setText(aiMemory || '');
        setCharCount((aiMemory || '').length);
      }
    };

    initialize();
  }, [isBackgroundStory, aiMemory, aiBackgroundStory, setAiBackgroundStory]);

  // 处理文本输入
  const handleTextChange = (value: string) => {
    // 限制最大长度
    if (value.length <= MAX_LENGTH) {
      setText(value);
      setCharCount(value.length);
    }
  };

  // 显示 ErrorModal
  const showErrorModal = (message: string) => {
    setErrorModalMessage(message);
    setErrorModalVisible(true);
  };

  // 保存
  const handleSave = async () => {
    if (isBackgroundStory) {
      // 背景故事：调用后端接口
      try {
        setSaving(true);
        setFullScreenLoading(true);

        // 调用后端接口保存背景故事
        if (userInfo.token && userInfo.userId) {
          await saveAiSettings(
            {
              userId: userInfo.userId,
              nestBackstory: text,
            },
            userInfo.token
          );
        }

        // 更新本地 store
        setAiBackgroundStory(text);

        // 显示成功提示
        showErrorModal('已成功保存', '保存成功');

        // 延迟返回，让用户看到 Toast
        setTimeout(() => {
          router.back();
        }, 1500);
      } catch (error) {
        console.error('保存背景故事失败:', error);
        setFullScreenLoading(false);
        const errorMessage = error instanceof Error ? error.message : '保存失败，请稍后重试';
        showErrorModal(errorMessage);
      } finally {
        setSaving(false);
      }
    } else {
      // 记忆：只更新 store
      setAiMemory(text);
      router.back();
    }
  };

  const backgroundImage = require('@/assets/customize_background.png')

  return (
    <ImageBackground source={backgroundImage} resizeMode="cover" className="flex-1">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          {/* 标题栏 */}
          <View 
            className="flex-row items-center justify-between"
            style={{
              marginTop: Math.max(12, Math.min(16, Dimensions.get('window').height * 0.02)),
              marginBottom: Math.max(12, Math.min(16, Dimensions.get('window').height * 0.02)),
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={require('@/assets/arrow-left.png')}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View className="flex-1 flex-row items-center justify-center">
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
              >
                {isBackgroundStory ? '背景故事' : (params.title || '编辑')}
              </Text>
              {isBackgroundStory && (
                <TouchableOpacity
                  onPress={() => setShowHelpModal(true)}
                  style={{ marginLeft: 6 }}
                >
                  <GlassContainer
                    borderRadius={11.5}
                    style={{
                      width: Math.max(20, Math.min(23, Dimensions.get('window').width * 0.06)),
                      height: Math.max(20, Math.min(23, Dimensions.get('window').width * 0.06)),
                    }}
                  >
                    {/* 字母 i */}
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: Math.max(12, Math.min(16, Dimensions.get('window').width * 0.04)),
                          fontWeight: 'bold',
                        }}
                      >
                        i
                      </Text>
                    </View>
                  </GlassContainer>
                </TouchableOpacity>
              )}
            </View>
            {!isBackgroundStory && (
              <TouchableOpacity onPress={handleSave} disabled={saving}>
                <Text className="text-white text-base font-medium">保存</Text>
              </TouchableOpacity>
            )}
            {isBackgroundStory && <View style={{ width: 24 }} />}
          </View>

          {/* 背景故事页面的说明文字 */}
          {isBackgroundStory && (
            <View
              style={{
                marginTop: Math.max(8, Math.min(12, Dimensions.get('window').height * 0.015)),
                marginBottom: Math.max(16, Math.min(24, Dimensions.get('window').height * 0.03)),
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#BFBFBF',
                  fontSize: 14,
                  lineHeight: 16,
                  textAlign: 'center',
                }}
              >
                用几句话描述你的AI的起源、性格与故事。
              </Text>
              <Text
                style={{
                  color: '#BFBFBF',
                  fontSize: 14,
                  lineHeight: 16,
                  textAlign: 'center',
                  marginTop: 0,
                }}
              >
                它的过去不需要完美
              </Text>
              <Text
                style={{
                  color: '#BFBFBF',
                  fontSize: 14,
                  lineHeight: 16,
                  textAlign: 'center',
                  marginTop: 0,
                }}
              >
                只要能展现出一点&quot;它是谁&quot;。
              </Text>
            </View>
          )}

          {/* 文本输入区域 */}
          <View className="flex-1 mb-4">
            <GlassContainer
              borderRadius={18}
              highlightHeight={100}
              style={{ flex: 1 }}
            >
              {/* 内容层 */}
              <View style={{ flex: 1, padding: 20, position: 'relative' }}>
                <ScrollView
                  className="flex-1"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  <TextInput
                    value={text}
                    onChangeText={handleTextChange}
                    multiline
                    placeholder={
                      isBackgroundStory ? BACKGROUND_STORY_PLACEHOLDER : '请输入内容...'
                    }
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    maxLength={MAX_LENGTH}
                    style={{
                      flex: 1,
                      color: 'white',
                      fontSize: 14,
                      lineHeight: 24,
                      textAlignVertical: 'top',
                      minHeight: 200,
                    }}
                    editable={!saving && !loading}
                  />
                </ScrollView>

                {/* 字数计数（仅背景故事显示） */}
                {isBackgroundStory && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 20,
                      right: 20,
                      flexDirection: 'row',
                      alignItems: 'baseline',
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 24,
                        fontFamily: 'Agbalumo',
                      }}
                    >
                      {charCount}
                    </Text>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontFamily: 'Agbalumo',
                      }}
                    >
                      /{MAX_LENGTH} 字
                    </Text>
                  </View>
                )}
              </View>
            </GlassContainer>
          </View>

          {/* 保存按钮（仅背景故事显示） */}
          {isBackgroundStory && (
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving || loading}
              style={{
                alignSelf: 'center',
                marginBottom: 20,
                opacity: saving || loading ? 0.6 : 1,
              }}
            >
              <GlassContainer
                borderRadius={24}
                highlightHeight={48}
                style={{
                  width: 308,
                  height: 48,
                }}
              >
                {/* 按钮内容 */}
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                  }}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-base font-bold">保存</Text>
                  )}
                </View>
              </GlassContainer>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* 帮助弹窗 */}
      <HelpModal visible={showHelpModal} onClose={() => setShowHelpModal(false)} />

      {/* ErrorModal 提示 */}
      <ErrorModal
        visible={errorModalVisible}
        message={errorModalMessage}
        onClose={() => setErrorModalVisible(false)}
      />

      {/* 全屏 Loading（训练AI时） */}
      <Modal visible={fullScreenLoading} transparent animationType="fade">
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
    </ImageBackground>
  );
}

