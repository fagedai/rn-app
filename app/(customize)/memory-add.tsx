import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '@/components/common/GlassContainer';
import { MemoryCategory, addMemory } from '@/services/api/memory';
import { CloseConfirmModal } from '@/components/common/CloseConfirmModal';
import { Toast } from '@/components/common/Toast';
import { useCreateStore } from '@/store/createStore';
import { useUserStore } from '@/store/userStore';
import { useSafeArea } from '@/hooks/useSafeArea';

const CATEGORIES: MemoryCategory[] = ['人际关系', '偏好', '习惯', '临时'];
const MAX_LENGTH = 200;

export default function MemoryAddScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: MemoryCategory }>();
  const { aiName } = useCreateStore();
  const { userInfo } = useUserStore();
  const [category, setCategory] = useState<MemoryCategory>(
    (params.category as MemoryCategory) || '人际关系'
  );
  const [text, setText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const { bottom } = useSafeArea();
  
  // 获取响应式样式
  const responsiveStyles = useMemo(() => {
    const { width, height } = Dimensions.get('window');
    return {
      categoryPicker: {
        width: Math.max(250, Math.min(297, width * 0.75)),
        height: Math.max(48, Math.min(60, height * 0.07)),
        paddingHorizontal: Math.max(12, Math.min(16, width * 0.04)),
        borderRadius: Math.max(20, Math.min(24, height * 0.03)),
      },
      categoryPickerText: {
        fontSize: Math.max(12, Math.min(14, width * 0.035)),
      },
      categoryPickerIcon: {
        fontSize: Math.max(16, Math.min(20, width * 0.05)),
      },
    };
  }, []);
  
  // 动态计算文本输入区域的高度，确保底部按钮可见
  const textInputHeight = useMemo(() => {
    const { height } = Dimensions.get('window');
    const headerHeight = 56;
    const categoryPickerHeight = responsiveStyles.categoryPicker.height;
    const categorySectionHeight = categoryPickerHeight + 24; // 分类选择器 + marginBottom
    const saveButtonHeight = 48;
    const saveButtonMargin = 20;
    const scrollPadding = 16 * 2; // 上下 padding
    const spacing = 25; // categorySection 的 marginTop
    
    // 计算可用高度
    const availableHeight = height - headerHeight - categorySectionHeight 
      - saveButtonHeight - saveButtonMargin - scrollPadding - spacing - bottom;
    
    // 根据屏幕尺寸设置最大高度：小屏幕设备使用更小的比例
    let maxHeightRatio = 1; // 默认100%
    if (height < 700) {
      // 小屏幕设备（如 iPhone SE）
      maxHeightRatio = 0.5;
    } else if (height < 800) {
      // 中等屏幕设备
      maxHeightRatio = 0.9;
    }
    
    const maxHeight = Math.min(500, height * maxHeightRatio); // 绝对最大高度从556降到400
    
    const minHeight = Math.max(150, height * 0.2); // 最小高度从200降到120，或屏幕高度的15%
    
    // 使用可用高度和最大高度的较小值，但不小于最小高度
    const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, availableHeight));
    
    return calculatedHeight;
  }, [bottom, responsiveStyles.categoryPicker.height]);

  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  const handleSave = async () => {
    const trimmedText = text.trim();
    
    // 文本为空，直接返回
    if (!trimmedText) {
      router.back();
      return;
    }

    if (!userInfo.profileId) {
      showToast('请先完成问卷');
      return;
    }

    if (!userInfo.token) {
      showToast('请先登录');
      return;
    }

    setSaving(true);
    try {
      await addMemory({
        profileId: userInfo.profileId,
        category,
        content: trimmedText,
      }, userInfo.token);
      
      // 成功后返回列表页
      router.back();
    } catch (error) {
      console.error('保存失败:', error);
      showToast('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (text.trim().length > 0) {
      setShowCloseModal(true);
    } else {
      router.back();
    }
  };

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    router.back();
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  return (
    <ImageBackground
      source={require('@/assets/customize_background.png')}
      resizeMode="cover"
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 顶部导航栏 */}
        <View style={styles.header}>
          <Text style={styles.title}>添加新记忆</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Image
              source={require('@/assets/Close Square.png')}
              style={styles.closeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 类别选择框 - 距离标题25px，响应式尺寸，水平居中 */}
          <View style={styles.categorySection}>
            <TouchableOpacity
              style={[styles.categoryPicker, responsiveStyles.categoryPicker]}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <View style={styles.categoryPickerTextContainer}>
                <Text style={[styles.categoryPickerText, responsiveStyles.categoryPickerText]}>{category}</Text>
              </View>
              <Ionicons
                name={showCategoryPicker ? 'chevron-down' : 'chevron-back'}
                size={responsiveStyles.categoryPickerIcon.fontSize}
                color="#FFFFFF"
                style={styles.categoryPickerIcon}
              />
            </TouchableOpacity>
            
            {/* 类别选择抽屉 - 绝对定位，不影响其他元素 */}
            {showCategoryPicker && (
              <View style={styles.categoryDrawer}>
                <GlassContainer borderRadius={24} style={styles.categoryDrawerContent}>
                  <View style={styles.categoryDrawerInner}>
                    {CATEGORIES.map((cat, index) => (
                      <React.Fragment key={cat}>
                        <TouchableOpacity
                          style={styles.categoryOption}
                          onPress={() => {
                            setCategory(cat);
                            setShowCategoryPicker(false);
                          }}
                        >
                          <Text style={styles.categoryOptionText}>{cat}</Text>
                        </TouchableOpacity>
                        {index < CATEGORIES.length - 1 && (
                          <View style={styles.categoryDivider} />
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                </GlassContainer>
              </View>
            )}
          </View>

          {/* 文本输入区域 */}
          <View style={styles.textInputSection}>
            <GlassContainer
              borderRadius={18}
              style={{ width: Math.min(365, Dimensions.get('window').width - 48), height: textInputHeight }}
            >
              <View style={{ flex: 1, padding: 20, position: 'relative' }}>
                <TextInput
                  style={styles.textInput}
                  value={text}
                  onChangeText={(value) => {
                    if (value.length <= MAX_LENGTH) {
                      setText(value);
                    }
                  }}
                  placeholder={`定制${aiName}的记忆，例如，${aiName}曾和你一起...`}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  multiline
                  maxLength={MAX_LENGTH}
                  textAlignVertical="top"
                />
                {/* 字数统计 - 参考背景故事的位置（右下角） */}
                <View style={styles.charCountContainer}>
                  <Text style={styles.charCountCurrent}>{charCount}</Text>
                  <Text style={styles.charCountMax}>/{MAX_LENGTH}</Text>
                </View>
              </View>
            </GlassContainer>
          </View>
          
          {/* 保存按钮 - 288x48，左右居中 */}
          <View style={styles.saveButtonSection}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={saving && styles.saveButtonDisabled}
            >
              <GlassContainer
                borderRadius={24}
                intensity={10}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? '保存中...' : '保存'}
                </Text>
              </GlassContainer>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* 关闭确认弹窗 */}
      <CloseConfirmModal
        visible={showCloseModal}
        onReturn={() => setShowCloseModal(false)}
        onClose={handleConfirmClose}
        onSave={async () => {
          setShowCloseModal(false);
          await handleSave();
        }}
      />

      {/* Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  title: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  categorySection: {
    marginTop: 0,
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative', // 为绝对定位的抽屉提供定位上下文
  },
  categoryPicker: {
    // 尺寸通过响应式样式动态设置
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    zIndex: 1002, // 最高优先级
    position: 'relative',
  },
  categoryPickerTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPickerText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center', // 水平居中
  },
  categoryPickerIcon: {
    position: 'absolute',
    right: 16,
  },
  textInputSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  charCountContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  charCountCurrent: {
    fontSize: 24,
    fontFamily: 'Agbalumo',
    color: '#FFFFFF',
  },
  charCountMax: {
    fontSize: 12,
    fontFamily: 'Agbalumo',
    color: '#FFFFFF',
  },
  saveButtonSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButton: {
    width: 288,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // 类别选择抽屉样式
  categoryDrawer: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -148.5,
    width: 297,
    zIndex: 1001,
  },
  categoryDrawerContent: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#170B2B',
  },
  categoryDrawerInner: {
    paddingTop: 60,
    paddingBottom: 8,
    backgroundColor: '#170B2B',
  },
  categoryOption: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  categoryDivider: {
    width: 164,
    height: 0.5,
    backgroundColor: 'rgba(198, 198, 198, 0.4)',
    alignSelf: 'center',
  },
});

