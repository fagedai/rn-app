import React, { useState, useRef } from 'react';
import { View, ImageBackground, Text, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeArea } from '@/hooks/useSafeArea';
import { LoginHeader } from '@/components/common/LoginHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout';
import { QuestionnaireFloorButtons } from '@/components/questionnaire/QuestionnaireFloorButtons';
import { useCreateStore } from '@/store/createStore';
import { useUserStore } from '@/store/userStore';
import { savenestName } from '@/services/api/aiSettings';
import { ErrorModal } from '@/components/common/ErrorModal';
import { useErrorModal } from '@/hooks/useErrorModal';
import { track } from '@/services/tracking';

const HEADER_HEIGHT = 44; // LoginHeader 高度

export default function EditnestName() {
  const router = useRouter();
  const { top } = useSafeArea();
  const { aiNestName, setnestName, setNestName } = useCreateStore();
  const { userInfo } = useUserStore();
  const [name, setName] = useState(aiNestName || '');
  const [loading, setLoading] = useState(false);
  const errorModal = useErrorModal();
  const inputRef = useRef<TextInput>(null);

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
    if (trimmedName === aiNestName) {
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
      
      // 更新本地store（同时更新 aiNestName 和 nestName）
      setnestName(trimmedName);
      setNestName(trimmedName); // 更新从API获取的名字，确保定制AI页面显示最新值
      
      // 机器人设定修改埋点
      track('bot_settings_update', {
        field: 'nest_name',
        old_value: aiNestName,
        new_value: trimmedName,
        bot_id: userInfo.profileId || '',
      }, {
        page_id: 'edit_nest_name',
      });
      
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
      <LoginHeader title="修改NEST名字" backButton={true} />
      <QuestionnaireLayout
        header={<View />} // LoginHeader 是绝对定位的，header 模块为空
        headerHeight={top + HEADER_HEIGHT + 10} // 安全区域 + header高度 + 10px间距
        content={
          <View className="flex-1 justify-center">
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
                    placeholder={'请输入NEST名字'}
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
          </View>
        }
        floor={
          <QuestionnaireFloorButtons
            onBack={() => router.back()}
            onNext={handleSave}
            backText="取消"
            nextText={loading ? '保存中...' : '保存'}
            showPrivacyNotice={false}
            nextDisabled={isButtonDisabled}
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

