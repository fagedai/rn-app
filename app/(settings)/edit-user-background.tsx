import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/userStore';
import { updateUserInfo } from '@/services/api/user';
import { GlassContainer } from '@/components/common/GlassContainer';
import { Toast } from '@/components/common/Toast';
import { UserBackgroundHelpModal } from '@/components/common/UserBackgroundHelpModal';
import { useToast } from '@/hooks/useToast';

const USER_BACKGROUND_PLACEHOLDER = '用户个人的背景故事介绍';

const MAX_LENGTH = 500;

export default function EditUserBackground() {
  const router = useRouter();
  const { userInfo, setBackgroundStory } = useUserStore();

  const [text, setText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const toast = useToast(1500);

  // 初始化：从 userStore 获取用户背景故事
  useEffect(() => {
    const storeValue = userInfo.backgroundStory || '';
    setText(storeValue);
    setCharCount(storeValue.length);
  }, [userInfo.backgroundStory]);

  // 处理文本输入
  const handleTextChange = (value: string) => {
    // 限制最大长度
    if (value.length <= MAX_LENGTH) {
      setText(value);
      setCharCount(value.length);
    }
  };


  // 保存
  const handleSave = async () => {
    // 如果正在保存，禁止重复提交
    if (saving) {
      return;
    }

    try {
      setSaving(true);

      // 检查背景故事是否有变化
      const currentBackground = userInfo.backgroundStory || '';
      const hasChanged = text !== currentBackground;
      
      if (!hasChanged) {
        router.back();
        return;
      }

      // 调用后端接口保存（只传变更的字段）
      if (userInfo.token) {
        await updateUserInfo(userInfo.token, {
          background: text || null, // 如果为空字符串，传 null
        });
      }

      // 更新本地 store
      setBackgroundStory(text);

      // 显示成功提示
      toast.show('已成功保存');

      // 延迟返回，让用户看到 Toast
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error('保存用户背景故事失败:', error);
      const errorMessage = error instanceof Error ? error.message : '保存失败，请稍后重试';
      toast.show(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/setting_backgorund.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          {/* 标题栏 */}
          <View className="flex-row items-center justify-between mb-6 mt-4">
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
                背景文案
              </Text>
              <TouchableOpacity
                onPress={() => setShowHelpModal(true)}
                style={{ marginLeft: 6 }}
              >
                <GlassContainer
                  borderRadius={11.5}
                  style={{
                    width: 23,
                    height: 23,
                  }}
                >
                  {/* 感叹号 */}
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
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}
                    >
                      !
                    </Text>
                  </View>
                </GlassContainer>
              </TouchableOpacity>
            </View>
            <View style={{ width: 48 }} />
          </View>

          {/* 文本输入区域 */}
          <View className="flex-1 mb-4">
            <GlassContainer
              borderRadius={18}
              style={{ flex: 1 }}
            >
              {/* 内容层 */}
              <View style={{ flex: 1, padding: 20, position: 'relative' }}>
                {loading ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  </View>
                ) : (
                  <>
                    <ScrollView
                      className="flex-1"
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ flexGrow: 1 }}
                    >
                      <TextInput
                        value={text}
                        onChangeText={handleTextChange}
                        multiline
                        placeholder={USER_BACKGROUND_PLACEHOLDER}
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

                    {/* 字数计数 */}
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
                        /{MAX_LENGTH}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </GlassContainer>
          </View>

          {/* 保存按钮 */}
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
        </View>
      </SafeAreaView>

      {/* 帮助弹窗 */}
      <UserBackgroundHelpModal visible={showHelpModal} onClose={() => setShowHelpModal(false)} />

      {/* Toast 提示 */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        duration={toast.duration}
        onHide={toast.hide}
      />
    </ImageBackground>
  );
}

