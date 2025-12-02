import React, { useState, useRef } from 'react';
import { View, ImageBackground, Text, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeArea } from '@/hooks/useSafeArea';
import { LoginHeader } from '@/components/common/LoginHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { QuestionnaireLayout } from '@/components/questionnaire/QuestionnaireLayout';
import { QuestionnaireFloorButtons } from '@/components/questionnaire/QuestionnaireFloorButtons';
import { useUserStore } from '@/store/userStore';
import { updateUserInfo } from '@/services/api/user';
import { ErrorModal } from '@/components/common/ErrorModal';
import { useErrorModal } from '@/hooks/useErrorModal';
import { track } from '@/services/tracking';

const HEADER_HEIGHT = 44; // LoginHeader 高度

export default function EditUsername() {
  const router = useRouter();
  const { top } = useSafeArea();
  const { userInfo, setName } = useUserStore();
  const [username, setUsername] = useState(userInfo.name || '');
  const errorModal = useErrorModal();
  const inputRef = useRef<TextInput>(null);
  const [hasUserCleared, setHasUserCleared] = useState(false);
  const [loading, setLoading] = useState(false);

  // 处理文本变化，当文本为空时重置光标位置
  const handleTextChange = (text: string) => {
    setUsername(text);
    // 如果用户清空了文本，标记为已清空，这样会显示 placeholder
    if (!text) {
      setHasUserCleared(true);
      // 当文本被删除为空时，重置光标位置到中间
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

  // 验证用户名：仅支持中文/英文/下划线
  const validateUsername = (name: string): { valid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: '请输入用户名' };
    }

    const trimmedName = name.trim();
    // 正则：仅允许中文汉字、英文字母A-Z、a-z、下划线_
    const regex = /^[A-Za-z_\u4e00-\u9fa5]+$/;
    
    if (!regex.test(trimmedName)) {
      return { valid: false, error: '用户名有误，请重新输入合法用户名' };
    }

    return { valid: true };
  };

  // 处理修改
  const handleModify = async () => {
    if (loading) {
      return;
    }

    const validation = validateUsername(username);
    if (!validation.valid) {
      errorModal.show(validation.error || '用户名有误，请重新输入合法用户名');
      return;
    }

    const trimmedUsername = username.trim();
    
    // 如果用户名没有变化，直接返回
    if (trimmedUsername === userInfo.name) {
      router.back();
      return;
    }

    try {
      setLoading(true);
      // 调用后端API更新用户名（只传变更的字段）
      if (userInfo.token) {
        await updateUserInfo(userInfo.token, {
          name: trimmedUsername,
        });
      }
      
      // 更新本地store
      setName(trimmedUsername);
      
      // 用户信息修改埋点
      track('user_profile_edit', {
        field_name: 'user_name',
        old_value_length: userInfo.name ? userInfo.name.length : 0,
        new_value_length: trimmedUsername.length,
      }, {
        page_id: 'edit_username',
      });
      
      // 显示成功提示
      errorModal.show('修改成功', '修改成功');
      
      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error) {
      console.error('修改用户名失败:', error);
      const errorMessage = error instanceof Error ? error.message : '修改失败，请稍后重试';
      errorModal.show(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = !username || username.trim().length === 0 || loading;

  return (
    <ImageBackground
      source={require('@/assets/login_background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="修改用户名" backButton={true} />
      <QuestionnaireLayout
        header={<View />} // LoginHeader 是绝对定位的，header 模块为空
        headerHeight={top + HEADER_HEIGHT + 10} // 安全区域 + header高度 + 10px间距
        content={
          <View className="flex-1 justify-center">
            {/* 输入框 */}
            <View
              style={{
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
                  {/* 自定义 placeholder，避免影响光标位置 */}
                  {!username && hasUserCleared && (
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
                      请输入更改的用户名
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
                    value={username}
                    onChangeText={handleTextChange}
                    selectionColor="#9EA9FF"
                    autoCorrect={false}
                    onFocus={() => {
                      // 当输入框为空且获得焦点时，确保光标在中间
                      if (!username && inputRef.current) {
                        // 使用更长的延迟确保在渲染完成后执行
                        setTimeout(() => {
                          inputRef.current?.setNativeProps({
                            selection: { start: 0, end: 0 },
                          });
                        }, 100);
                      }
                    }}
                    onSelectionChange={(e) => {
                      // 当文本为空时，确保光标保持在中间（位置0）
                      if (!username && e.nativeEvent.selection.start !== 0) {
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

            {/* 说明文案 */}
            <Text style={styles.hintText}>仅支持中文/英文/下划线</Text>
          </View>
        }
        floor={
          <QuestionnaireFloorButtons
            onBack={() => router.back()}
            onNext={handleModify}
            backText="取消"
            nextText={loading ? '修改中...' : '修改'}
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
    marginTop: 16,
  },
});

