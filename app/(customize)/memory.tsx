import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassContainer } from '@/components/common/GlassContainer';
import { LinearGradient } from 'expo-linear-gradient';
import { MemoryCategory, MemoryItem, getMemories, deleteMemories } from '@/services/api/memory';
import { Toast } from '@/components/common/Toast';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useUserStore } from '@/store/userStore';

const CATEGORIES: MemoryCategory[] = ['人际关系', '偏好', '习惯', '临时'];

export default function MemoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: MemoryCategory }>();
  const { userInfo } = useUserStore();
  const [currentCategory, setCurrentCategory] = useState<MemoryCategory>(
    (params.category as MemoryCategory) || '人际关系'
  );
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [contentHeight, setContentHeight] = useState(0); // 列表内容总高度
  const { top, bottom } = useSafeArea();
  
  // 获取响应式样式
  const responsiveStyles = getResponsiveStyles();
  
  // 动态计算 memoryContainer 的高度，确保底部按钮可见
  const memoryContainerHeight = useMemo(() => {
    const { height } = Dimensions.get('window');
    const headerHeight = 56;
    const editBarHeight = isEditMode ? 44 : 0;
    
    // 分类区域高度：根据屏幕高度动态计算
    const categorySectionHeight = Math.max(50, Math.min(70, height * 0.08));
    
    // 编辑按钮相关尺寸
    const editButtonHeight = 48;
    const editButtonMarginTop = 25;
    const editButtonMarginBottom = Math.max(20, Math.min(32, bottom + 20)); // 底部安全区域 + 额外间距
    const spacing = 24; // memoryContainer 的 marginTop
    
    // 计算已使用的总高度
    const usedHeight = top + headerHeight + editBarHeight + categorySectionHeight 
      + editButtonHeight + editButtonMarginTop + editButtonMarginBottom + spacing;
    
    // 计算可用高度
    const availableHeight = height - usedHeight;
    
    // 根据屏幕尺寸设置最大高度比例：小屏幕设备使用更小的比例
    let maxHeightRatio = 0.7; // 默认70%
    if (height < 700) {
      // 小屏幕设备（如 iPhone SE）
      maxHeightRatio = 0.5;
    } else if (height < 800) {
      // 中等屏幕设备
      maxHeightRatio = 0.6;
    }
    
    const maxHeight = Math.min(564, height * maxHeightRatio);
    const minHeight = Math.max(150, height * 0.2); // 最小高度为屏幕高度的20%，但不小于150px
    
    // 使用可用高度和最大高度的较小值，但不小于最小高度
    const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, availableHeight));
    
    return calculatedHeight;
  }, [isEditMode, bottom, top]);

  // 加载记忆列表
  const loadMemories = useCallback(async () => {
    if (!userInfo.profileId) {
      console.error('profileId 不存在，无法加载记忆');
      showToast('请先完成问卷');
      return;
    }
    if (!userInfo.token) {
      console.error('token 不存在，无法加载记忆');
      showToast('请先登录');
      return;
    }
    setLoading(true);
    try {
      const data = await getMemories(currentCategory, userInfo.profileId, userInfo.token);
      setMemories(data);
    } catch (error) {
      console.error('加载记忆失败:', error);
      showToast('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [currentCategory, userInfo.profileId, userInfo.token]);

  // 切换分类
  const handleCategoryChange = (category: MemoryCategory) => {
    setCurrentCategory(category);
    setIsEditMode(false);
    setSelectedIds(new Set());
  };

  // 进入编辑模式（目前通过长按或其他方式触发，暂时保留）
  // const handleEdit = () => {
  //   setIsEditMode(true);
  //   setSelectedIds(new Set());
  // };

  // 完成编辑
  const handleDone = () => {
    setIsEditMode(false);
    setSelectedIds(new Set());
  };

  // 选择全部
  const handleSelectAll = () => {
    if (selectedIds.size === memories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(memories.map((m) => m.id)));
    }
  };

  // 切换选择
  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 批量删除
  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!userInfo.profileId) {
      showToast('请先完成问卷');
      return;
    }
    if (!userInfo.token) {
      showToast('请先登录');
      return;
    }

    try {
      await deleteMemories(Array.from(selectedIds), userInfo.profileId, userInfo.token);
      setSelectedIds(new Set());
      await loadMemories();
    } catch (error) {
      console.error('删除失败:', error);
      showToast('删除失败，请重试');
    }
  };

  // 显示 Toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };


  // 添加记忆
  const handleAdd = () => {
    router.push({
      pathname: '/(customize)/memory-add',
      params: { category: currentCategory },
    });
  };

  // 点击记忆项
  const handleMemoryPress = (memory: MemoryItem) => {
    if (isEditMode) {
      handleToggleSelect(memory.id);
    } else {
      router.push({
        pathname: '/(customize)/memory-edit',
        params: { id: memory.id },
      });
    }
  };

  useEffect(() => {
    // 如果路由参数中有分类，更新当前分类
    if (params.category) {
      setCurrentCategory(params.category as MemoryCategory);
    }
  }, [params.category]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  // 页面聚焦时自动刷新列表（从添加/编辑页面返回时）
  useFocusEffect(
    useCallback(() => {
      loadMemories();
    }, [loadMemories])
  );

  const renderMemoryItem = ({ item, index }: { item: MemoryItem; index: number }) => {
    const isSelected = selectedIds.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.memoryItem,
          index === 0 && styles.memoryItemFirst,
        ]}
        onPress={() => handleMemoryPress(item)}
        activeOpacity={0.7}
      >
        {/* 记忆卡片 - 白色光影效果 */}
        <View style={styles.memoryContent}>
          {isEditMode && (
            <TouchableOpacity
              style={[
                styles.checkbox,
                isSelected && styles.checkboxSelected,
              ]}
              onPress={() => handleToggleSelect(item.id)}
            >
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          )}
          <Text style={styles.memoryText}>{item.content}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>加载中...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>尝试添加新的记忆，让NEST更加了解你~</Text>
      </View>
    );
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
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={require('@/assets/arrow-left.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>定制记忆</Text>

          {isEditMode && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleDone}
              activeOpacity={0.7}
            >
              <Text style={styles.headerButtonText}>完成</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 编辑模式顶部操作栏 */}
        {isEditMode && (
          <View style={styles.editBar}>
            <TouchableOpacity
              style={[
                styles.deleteButton,
                selectedIds.size === 0 && styles.deleteButtonDisabled,
              ]}
              onPress={handleDelete}
              disabled={selectedIds.size === 0}
            >
              <Text
                style={[
                  styles.deleteButtonText,
                  selectedIds.size === 0 && styles.deleteButtonTextDisabled,
                ]}
              >
                删除({selectedIds.size})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={handleSelectAll}
            >
              <Text style={styles.selectAllButtonText}>选择全部</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 分类标签区域：固定+按钮 + 可滑动选项 */}
        <View style={[styles.categorySection, responsiveStyles.categorySection]}>
          {/* 固定的+按钮 - 玻璃效果 */}
          <TouchableOpacity
            style={[styles.addCategoryButton, responsiveStyles.addCategoryButton]}
            onPress={handleAdd}
            activeOpacity={0.7}
          >
            <GlassContainer
              borderRadius={30}
              style={[styles.addCategoryButtonCircle, responsiveStyles.addCategoryButtonCircle]}
            >
              {/* 文字层 */}
              <Text style={[styles.addCategoryButtonText, responsiveStyles.addCategoryButtonText]}>＋</Text>
            </GlassContainer>
          </TouchableOpacity>

          {/* 可滑动的选项 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
            style={styles.categoryScrollView}
          >
            {CATEGORIES.map((category, index) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  currentCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => handleCategoryChange(category)}
              >
                {currentCategory === category ? (
                  <LinearGradient
                    colors={['#430047', '#4A4A4A']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.categoryButtonGradient, responsiveStyles.categoryButtonGradient]}
                  >
                    <Text style={[styles.categoryButtonTextActive, responsiveStyles.categoryButtonTextActive]}>{category}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.categoryButtonUnselected, responsiveStyles.categoryButtonUnselected]}>
                    <Text style={[styles.categoryButtonText, responsiveStyles.categoryButtonText]}>{category}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 记忆列表容器 */}
        <GlassContainer
          borderRadius={18}
          style={[styles.memoryContainer, { height: memoryContainerHeight }]}
        >
          <FlatList
            data={memories}
            renderItem={renderMemoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmpty}
            refreshing={loading}
            onRefresh={loadMemories}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            style={styles.flatList}
            scrollEnabled={contentHeight > memoryContainerHeight}
            onContentSizeChange={(width, height) => {
              setContentHeight(height);
            }}
          />
        </GlassContainer>

        {/* 编辑此记忆按钮 - 距离记忆框25px */}
        <View style={[styles.editButtonSection, { marginBottom: bottom + 32 }]}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              router.push({
                pathname: '/(customize)/memory-edit-list',
                params: { category: currentCategory },
              });
            }}
            activeOpacity={0.8}
          >
            <GlassContainer
              borderRadius={24}
              intensity={5}
              tint="light"
              highlightHeight={48}
              style={styles.editButtonGlass}
            >
              <View style={styles.editButtonContent}>
                <Text style={styles.editButtonText}>编辑此记忆</Text>
                <Image
                  source={require('@/assets/编辑 1.png')}
                  style={styles.editIcon}
                  resizeMode="contain"
                />
              </View>
            </GlassContainer>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </ImageBackground>
  );
}

// 获取屏幕尺寸相关的样式
const getResponsiveStyles = () => {
  const { width, height } = Dimensions.get('window');
  return {
    categorySection: {
      paddingVertical: Math.max(4, Math.min(6, height * 0.008)),
    },
    addCategoryButton: {
      width: Math.max(45, Math.min(60, width * 0.15)),
      height: Math.max(45, Math.min(60, width * 0.15)),
      marginRight: Math.max(10, Math.min(14, width * 0.035)),
    },
    addCategoryButtonCircle: {
      borderRadius: Math.max(22.5, Math.min(30, width * 0.075)),
    },
    addCategoryButtonText: {
      fontSize: Math.max(22, Math.min(30, width * 0.075)),
      lineHeight: Math.max(22, Math.min(30, width * 0.075)),
    },
    categoryButtonGradient: {
      paddingHorizontal: Math.max(12, Math.min(18, width * 0.045)),
      paddingVertical: Math.max(10, Math.min(15, height * 0.018)),
    },
    categoryButtonUnselected: {
      paddingHorizontal: Math.max(12, Math.min(18, width * 0.045)),
      paddingVertical: Math.max(10, Math.min(15, height * 0.018)),
    },
    categoryButtonText: {
      fontSize: Math.max(12, Math.min(14, width * 0.035)),
    },
    categoryButtonTextActive: {
      fontSize: Math.max(12, Math.min(14, width * 0.035)),
    },
  };
};

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
    zIndex: 10,
  },
  headerButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  editBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  deleteButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  deleteButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  selectAllButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    position: 'relative',
  },
  addCategoryButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCategoryButtonCircle: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCategoryButtonText: {
    color: '#FFFFFF',
  },
  categoryScrollView: {
    flex: 1,
  },
  categoryScrollContent: {
    paddingRight: 16,
  },
  categoryButton: {
    marginRight: 8,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    borderColor: '#FFFFFF',
  },
  categoryButtonGradient: {
    paddingHorizontal: Math.max(12, Math.min(18, Dimensions.get('window').width * 0.045)),
    paddingVertical: Math.max(10, Math.min(15, Dimensions.get('window').height * 0.018)),
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonUnselected: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: Math.max(12, Math.min(18, Dimensions.get('window').width * 0.045)),
    paddingVertical: Math.max(10, Math.min(15, Dimensions.get('window').height * 0.018)),
  },
  categoryButtonText: {
    fontSize: Math.max(12, Math.min(14, Dimensions.get('window').width * 0.035)),
    color: '#FFFFFF',
  },
  categoryButtonTextActive: {
    fontSize: Math.max(12, Math.min(14, Dimensions.get('window').width * 0.035)),
    color: '#FFFFFF',
  },
  memoryContainer: {
    width: Math.min(365, Dimensions.get('window').width - 48), // 屏幕宽度减去左右padding
    // height 在组件中动态计算
    marginTop: 24,
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    // iOS shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Android shadow
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 33,
    paddingTop: 15,
    paddingBottom: 20,
  },
  memoryItem: {
    marginBottom: 19,
  },
  memoryItemFirst: {
    marginTop: 0,
  },
  memoryContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(50, 46, 46, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#430047',
    borderColor: '#FFFFFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  memoryText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 200,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
  },
  addButtonEmpty: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  // 编辑此记忆按钮样式
  editButtonSection: {
    marginTop: 25,
    alignItems: 'center',
    // marginBottom 在组件中动态设置
  },
  editButton: {
    width: 288,
    height: 48,
  },
  editButtonGlass: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  editIcon: {
    width: 16,
    height: 16,
    marginLeft: 11,
  },
});

