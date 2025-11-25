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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassContainer } from '@/components/common/GlassContainer';
import { LinearGradient } from 'expo-linear-gradient';
import { MemoryCategory, MemoryItem, getMemories, deleteMemories } from '@/services/api/memory';
import { ErrorModal } from '@/components/common/ErrorModal';
import { useSafeArea } from '@/hooks/useSafeArea';
import { useUserStore } from '@/store/userStore';
import { Dimensions } from 'react-native';

const CATEGORIES: MemoryCategory[] = ['人际关系', '偏好', '习惯', '临时'];

export default function MemoryEditListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: MemoryCategory }>();
  const { userInfo } = useUserStore();
  const [currentCategory, setCurrentCategory] = useState<MemoryCategory>(
    (params.category as MemoryCategory) || '人际关系'
  );
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const { bottom } = useSafeArea();
  
  // 动态计算 memoryContainer 的高度，确保在小屏幕上也能完整显示
  const memoryContainerHeight = useMemo(() => {
    const { height } = Dimensions.get('window');
    const headerHeight = 56;
    const categorySectionHeight = 60; // 估算分类区域高度
    const spacing = 24; // memoryContainer 的 marginTop
    const bottomPadding = bottom + 20; // 底部安全区域 + 额外间距
    
    // 计算可用高度
    const availableHeight = height - headerHeight - categorySectionHeight - spacing - bottomPadding;
    
    // 确保最小高度，最大不超过 564
    const maxHeight = 564;
    const minHeight = 200; // 最小高度
    
    return Math.max(minHeight, Math.min(maxHeight, availableHeight));
  }, [bottom]);

  // 加载记忆列表
  const loadMemories = useCallback(async () => {
    if (!userInfo.profileId) {
      console.error('profileId 不存在，无法加载记忆');
      showErrorModal('请先完成问卷');
      return;
    }
    if (!userInfo.token) {
      console.error('token 不存在，无法加载记忆');
      showErrorModal('请先登录');
      return;
    }
    setLoading(true);
    try {
      const data = await getMemories(currentCategory, userInfo.profileId, userInfo.token);
      setMemories(data);
    } catch (error) {
      console.error('加载记忆失败:', error);
      showErrorModal('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [currentCategory, userInfo.profileId, userInfo.token]);

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

  // 选择全部
  const handleSelectAll = () => {
    if (selectedIds.size === memories.length) {
      // 如果已全选，则取消全选
      setSelectedIds(new Set());
    } else {
      // 全选当前分类所有条目
      setSelectedIds(new Set(memories.map((m) => m.id)));
    }
  };

  // 批量删除
  const handleDelete = async () => {
    // n=0 → 按钮禁用，不触发请求
    if (selectedIds.size === 0) return;
    if (!userInfo.profileId) {
      showErrorModal('请先完成问卷');
      return;
    }

    if (!userInfo.token) {
      showErrorModal('请先登录');
      return;
    }

    try {
      await deleteMemories(Array.from(selectedIds), userInfo.profileId, userInfo.token);
      // 成功后调用get接口 → 刷新列表；n 归零、删除回禁用
      setSelectedIds(new Set());
      await loadMemories();
    } catch (error) {
      console.error('删除失败:', error);
      // 失败路径：保留勾选与 n，以便重试
      showErrorModal('删除失败，请重试');
    }
  };

  // 显示 ErrorModal
  const showErrorModal = (message: string) => {
    setErrorModalMessage(message);
    setErrorModalVisible(true);
  };

  // 完成编辑：退出编辑模式，返回记忆功能界面（停留在当前分类）
  const handleDone = () => {
    router.back();
  };

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const renderMemoryItem = ({ item, index }: { item: MemoryItem; index: number }) => {
    const isSelected = selectedIds.has(item.id);

    return (
      <View
        style={[
          styles.memoryItem,
          index === 0 && styles.memoryItemFirst,
        ]}
      >
        {/* 记忆卡片 */}
        <TouchableOpacity
          style={styles.memoryContent}
          onPress={() => {
            // 点击卡片跳转到编辑页面
            router.push({
              pathname: '/(customize)/memory-edit',
              params: { id: item.id },
            });
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.memoryText}>{item.content}</Text>
        </TouchableOpacity>
        {/* 复选框 - 卡片右侧11px，垂直居中 */}
        <TouchableOpacity
          style={[
            styles.checkbox,
            isSelected && styles.checkboxSelected,
          ]}
          onPress={() => handleToggleSelect(item.id)}
          activeOpacity={0.7}
        >
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      </View>
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
          {/* 左上：删除(n) */}
          <TouchableOpacity
            style={[
              styles.deleteButton,
              selectedIds.size === 0 && styles.deleteButtonDisabled
            ]}
            onPress={handleDelete}
            disabled={selectedIds.size === 0}
            activeOpacity={0.7}
          >
            <Image
              source={require('@/assets/Delete.png')}
              style={[
                styles.deleteIcon,
                selectedIds.size === 0 && styles.deleteIconDisabled
              ]}
              resizeMode="contain"
            />
            <Text style={[
              styles.deleteCount,
              selectedIds.size === 0 && styles.deleteCountDisabled
            ]}>
              删除({selectedIds.size})
            </Text>
          </TouchableOpacity>

          {/* 右上：选择全部、完成 */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={handleSelectAll}
              activeOpacity={0.7}
            >
              <Text style={styles.selectAllButtonText}>选择全部</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.doneButtonHeader}
              onPress={handleDone}
              activeOpacity={0.7}
            >
              <Text style={styles.doneButtonHeaderText}>完成</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 分类标签区域 */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
            style={styles.categoryScrollView}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  currentCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => {
                  setCurrentCategory(category);
                  setSelectedIds(new Set()); // 切换分类时清空选中项
                }}
              >
                {currentCategory === category ? (
                  <LinearGradient
                    colors={['#430047', '#4A4A4A']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.categoryButtonGradient}
                  >
                    <Text style={styles.categoryButtonTextActive}>{category}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.categoryButtonUnselected}>
                    <Text style={styles.categoryButtonText}>{category}</Text>
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
          />
        </GlassContainer>

      </SafeAreaView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    zIndex: 10,
  },
  // 左上：删除(n)
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 80,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  deleteIconDisabled: {
    opacity: 0.5,
  },
  deleteCount: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  deleteCountDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  // 右上：选择全部、完成
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectAllButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  doneButtonHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  doneButtonHeaderText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
    paddingLeft: 16,
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
    paddingHorizontal: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonUnselected: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  categoryButtonTextActive: {
    fontSize: 14,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 20,
  },
  memoryItem: {
    marginBottom: 19,
    position: 'relative',
  },
  memoryItemFirst: {
    marginTop: 0,
  },
  memoryContent: {
    padding: 20,
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(50, 46, 46, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
    marginRight: 35, // 卡片向左移动，为复选框留出空间（24 checkbox宽度 + 11间距）
  },
  memoryText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  checkbox: {
    position: 'absolute',
    right: 0, // 在memoryContent右侧11px的位置（memoryContent的marginRight: 35，所以right: 0就是卡片右侧11px）
    top: '50%',
    transform: [{ translateY: -12 }], // 垂直居中（checkbox高度24的一半）
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 200,
    minHeight: 534,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
  },
});

