import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '@/components/common/GlassContainer';
import { MemoryCategory, MemoryItem, getMemories, updateMemory, deleteMemories } from '@/services/api/memory';
import { CloseConfirmModal } from '@/components/common/CloseConfirmModal';
import { ErrorModal } from '@/components/common/ErrorModal';
import { useUserStore } from '@/store/userStore';
import { useCreateStore } from '@/store/createStore';
import { useSafeArea } from '@/hooks/useSafeArea';

const CATEGORIES: MemoryCategory[] = ['人际关系', '偏好', '习惯', '临时'];
const MAX_LENGTH = 200;

export default function MemoryEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { userInfo } = useUserStore();
  const [memory, setMemory] = useState<MemoryItem | null>(null);
  const [category, setCategory] = useState<MemoryCategory>('人际关系');
  const [text, setText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<MemoryCategory>('人际关系');
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
    
    const maxHeight = Math.min(500, height * maxHeightRatio);
    const minHeight = Math.max(150, height * 0.2); // 最小高度为屏幕高度的20%，但不小于150px
    
    // 使用可用高度和最大高度的较小值，但不小于最小高度
    const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, availableHeight));
    
    return calculatedHeight;
  }, [bottom, responsiveStyles.categoryPicker.height]);

  // 加载记忆数据
  useEffect(() => {
    const loadMemory = async () => {
      if (!params.id) {
        router.back();
        return;
      }

      if (!userInfo.profileId) {
        showErrorModal('请先完成问卷');
        setTimeout(() => router.back(), 1500);
        return;
      }

      setLoading(true);
      try {
        if (!userInfo.token) {
          showErrorModal('请先登录');
          setLoading(false);
          return;
        }

        // 从所有分类中查找该记忆
        let found = false;
        for (const cat of CATEGORIES) {
          const memories = await getMemories(cat, userInfo.profileId, userInfo.token);
          const item = memories.find((m) => m.id === params.id);
          if (item) {
            setMemory(item);
            setCategory(item.category);
            setCurrentCategory(item.category);
            setText(item.content);
            found = true;
            break;
          }
        }

        if (!found) {
          showErrorModal('记忆不存在');
          setTimeout(() => router.back(), 1500);
        }
      } catch (error) {
        console.error('加载记忆失败:', error);
        showErrorModal('加载失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    loadMemory();
  }, [params.id, router, userInfo.profileId, userInfo.token]);

  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  const handleSave = async () => {
    if (!memory) return;

    const trimmedText = text.trim();
    
    // 文本为空 → 不请求后端；直接返回列表（数据不变）
    if (!trimmedText) {
      router.push({
        pathname: '/(customize)/memory',
        params: { category: currentCategory },
      });
      return;
    }

    if (!userInfo.profileId) {
      showErrorModal('请先完成问卷');
      return;
    }

    if (!userInfo.token) {
      showErrorModal('请先登录');
      return;
    }

    setSaving(true);
    try {
      // 文本非空（≤200） → 调用PUT接口更新该记忆数据库内容
      await updateMemory(memory.id, {
        category,
        content: trimmedText,
      }, userInfo.profileId, userInfo.token);
      
      // 记录最后编辑的记忆内容
      const { setLastCreatedMemory } = useCreateStore.getState();
      setLastCreatedMemory(trimmedText);
      
      // 成功后返回记忆功能界面 → 立即调用get接口获得当前分类的记忆文本
      router.push({
        pathname: '/(customize)/memory',
        params: { category: currentCategory },
      });
    } catch (error) {
      console.error('保存失败:', error);
      // 修改失败 → Toast"保存失败，请重试"，停留并保留已改内容
      showErrorModal('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!memory) return;
    if (!userInfo.profileId) {
      showErrorModal('请先完成问卷');
      return;
    }

    if (!userInfo.token) {
      showErrorModal('请先登录');
      return;
    }

    try {
      await deleteMemories([memory.id], userInfo.profileId, userInfo.token);
      setShowDeleteModal(false);
      // 成功后返回记忆功能界面，使用 replace 替换当前页面，避免左滑返回时回到已删除的编辑页面
      router.replace({
        pathname: '/(customize)/memory',
        params: { category: currentCategory },
      });
    } catch (error) {
      console.error('删除失败:', error);
      showErrorModal('删除失败，请重试');
    }
  };

  const handleClose = () => {
    if (!memory) {
      router.back();
      return;
    }
    
    // 如果有未保存的修改，弹出关闭确认弹窗（逻辑与添加页一致）
    if (text.trim() !== memory.content || category !== memory.category) {
      setShowCloseModal(true);
    } else {
      router.back();
    }
  };

  const handleConfirmClose = () => {
    setShowCloseModal(false);
    router.back();
  };

  const showErrorModal = (message: string) => {
    setErrorModalMessage(message);
    setErrorModalVisible(true);
  };

  if (loading) {
    return (
      <ImageBackground
        source={require('@/assets/customize_background.png')}
        resizeMode="cover"
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (!memory) {
    return null;
  }

  return (
    <ImageBackground
      source={require('@/assets/customize_background.png')}
      resizeMode="cover"
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 顶部导航栏 */}
        <View style={styles.header}>
          <Text style={styles.title}>修改记忆</Text>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Image
              source={require('@/assets/Close Square.png')}
              style={styles.closeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.scrollContent}>
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
                  placeholder="请输入记忆内容..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  multiline
                  maxLength={MAX_LENGTH}
                  textAlignVertical="top"
                />
                {/* 字数统计 - 参考背景故事的位置（右下角） */}
                <View style={styles.charCountContainer}>
                  <Text style={styles.charCountCurrent}>{charCount}</Text>
                  <Text style={styles.charCountMax}>/{MAX_LENGTH} 字</Text>
                </View>
              </View>
            </GlassContainer>
          </View>
          
          {/* 保存按钮和删除按钮 */}
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
            
            {/* 垃圾桶图标 - 保存按钮右侧11px，高度和保存按钮等高 */}
            <TouchableOpacity
              style={styles.deleteButtonBottom}
              onPress={() => setShowDeleteModal(true)}
              activeOpacity={0.7}
            >
              <Image
                source={require('@/assets/Delete.png')}
                style={styles.deleteIconBottom}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
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

      {/* 删除确认弹窗 */}
      <CloseConfirmModal
        visible={showDeleteModal}
        onReturn={() => setShowDeleteModal(false)}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
      />

      {/* ErrorModal */}
      <ErrorModal
        visible={errorModalVisible}
        message={errorModalMessage}
        onClose={() => setErrorModalVisible(false)}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
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
    position: 'absolute',
    left: 0,
    right: 0,
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
  scrollContent: {
    flex: 1,
    padding: 16,
    paddingBottom: 20,
  },
  categorySection: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
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
  deleteButtonBottom: {
    width: 48,
    height: 48,
    marginLeft: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIconBottom: {
    width: 24,
    height: 24,
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
