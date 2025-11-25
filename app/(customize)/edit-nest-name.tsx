import React, { useState, useRef } from 'react';
import { View, ImageBackground, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useCreateStore } from '@/store/createStore';
import { useUserStore } from '@/store/userStore';
import { savenestName } from '@/services/api/aiSettings';
import { ErrorModal } from '@/components/common/ErrorModal';
import { SingleNavButton } from '@/components/common/SingleNavButton';
import { useErrorModal } from '@/hooks/useErrorModal';

export default function EditnestName() {
  const router = useRouter();
  const { nestName, setnestName } = useCreateStore();
  const { userInfo } = useUserStore();
  const [name, setName] = useState(nestName || '');
  const [loading, setLoading] = useState(false);
  const errorModal = useErrorModal();
  const inputRef = useRef<TextInput>(null);
  const [hasUserCleared, setHasUserCleared] = useState(false);

  // 验证AI名字：仅支持英文字母，长度1-8
  const validatenestName = (name: string): { valid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: '非法用户名，请重试' };
    }

    const trimmedName = name.trim();
    // 正则：^[A-Za-z]{1,8}$
    const regex = /^[A-Za-z]{1,8}$/;
    
    if (!regex.test(trimmedName)) {
      return { valid: false, error: '非法用户名，请重试' };
    }

    return { valid: true };
  };

  // 处理文本变化，限制输入
  const handleTextChange = (text: string) => {
    // 只允许英文字母
    const filteredText = text.replace(/[^A-Za-z]/g, '');
    // 限制长度最多8位
    const limitedText = filteredText.slice(0, 8);
    setName(limitedText);
    
    if (!limitedText) {
      setHasUserCleared(true);
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.setNativeProps({
            selection: { start: 0, end: 0 },
          });
        }, 10);
      }
    } else {
      setHasUserCleared(false);
    }
  };

  // 处理保存
  const handleSave = async () => {
    // 如果正在加载，禁止重复提交
    if (loading) {
      return;
    }

    const validation = validatenestName(name);
    if (!validation.valid) {
      errorModal.show(validation.error || '非法用户名，请重试');
      return;
    }

    const trimmedName = name.trim();
    
    // 如果名字没有变化，直接返回
    if (trimmedName === nestName) {
      router.back();
      return;
    }

    try {
      setLoading(true);
      
      // 调用后端API保存AI名字（至少1秒防抖）
      if (!userInfo.token || !userInfo.userId) {
        throw new Error('请先登录');
      }
      const savePromise = savenestName(trimmedName, userInfo.userId, userInfo.token);
      const minDelayPromise = new Promise(resolve => setTimeout(resolve, 1000));
      
      await Promise.all([savePromise, minDelayPromise]);
      
      // 更新本地store
      setnestName(trimmedName);
      
      // 成功，直接返回，不显示Toast
      router.back();
    } catch (error) {
      console.error('保存AI名字失败:', error);
      const errorMessage = error instanceof Error ? error.message : '保存失败，请稍后再试';
      errorModal.show(errorMessage);
      setLoading(false);
    }
  };

  const isButtonDisabled = !name || name.trim().length === 0 || loading;

  return (
    <ImageBackground
      source={require('@/assets/login_background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '修改NEST名字',
          headerTitleStyle: { color: '#fff', fontSize: 16 },
          headerTitleAlign: 'center',
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 16 }}>
              <Image
                source={require('@/assets/arrow-left.png')}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ),
          headerRight: () => <View style={{ width: 40 }} />,
        }}
      />
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center px-6">
          {/* 提示文案 */}
          <Text style={styles.hintText}>
            修改名字后，NEST会以新名字与您交流
          </Text>

          {/* 输入框标签 */}
          <Text style={styles.labelText}>
            NEST名字（仅支持英文字母，最多8位）
          </Text>

          {/* 输入框 */}
          <View
            style={{
              marginTop: 16,
              alignSelf: 'center',
            }}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
              locations={[0, 0.5, 1]}
              style={{
                width: 298,
                height: 55,
                borderRadius: 22,
                padding: 1,
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: 22,
                  backgroundColor: 'rgba(6, 6, 6, 0.25)',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {/* 自定义 placeholder */}
                {!name && hasUserCleared && (
                  <Text
                    style={{
                      position: 'absolute',
                      width: '100%',
                      textAlign: 'center',
                      fontSize: 16,
                      color: '#D9D8E9',
                      pointerEvents: 'none',
                    }}
                  >
                    {nestName || '请输入NEST名字'}
                  </Text>
                )}
                <TextInput
                  ref={inputRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    fontSize: 16,
                    color: '#FFFFFF',
                    textAlign: 'center',
                  }}
                  value={name}
                  onChangeText={handleTextChange}
                  placeholder={nestName || '请输入NEST名字'}
                  placeholderTextColor="#D9D8E9"
                  selectionColor="#9EA9FF"
                  autoCorrect={false}
                  autoCapitalize="none"
                  maxLength={8}
                  onFocus={() => {
                    if (!name && inputRef.current) {
                      setTimeout(() => {
                        inputRef.current?.setNativeProps({
                          selection: { start: 0, end: 0 },
                        });
                      }, 100);
                    }
                  }}
                  onSelectionChange={(e) => {
                    if (!name && e.nativeEvent.selection.start !== 0) {
                      setTimeout(() => {
                        inputRef.current?.setNativeProps({
                          selection: { start: 0, end: 0 },
                        });
                      }, 100);
                    }
                  }}
                />
              </View>
            </LinearGradient>
          </View>

          {/* 保存按钮 */}
          <View style={{ marginTop: 40 }}>
            <LinearGradient
              colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
              locations={[0, 0.5, 1]}
              style={{
                width: 298,
                height: 44,
                borderRadius: 22,
                padding: 1,
                alignSelf: 'center',
                opacity: isButtonDisabled ? 0.5 : 1,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  borderRadius: 22,
                  overflow: 'hidden',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                }}
                onPress={handleSave}
                disabled={isButtonDisabled}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-base font-bold">保存</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </SafeAreaView>
      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.error}
        title={errorModal.title || '操作失败'}
        onClose={errorModal.hide}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hintText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  labelText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
});

