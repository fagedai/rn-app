import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/userStore';
import { useCreateStore } from '@/store/createStore';
import { getHistoryList, HistoryRecord } from '@/services/api/history';
import { ErrorModal } from '@/components/common/ErrorModal';
import { FullScreenLoading } from '@/components/common/FullScreenLoading';

/**
 * 格式化相对时间
 * @param timestamp 时间戳（毫秒）
 * @returns 相对时间字符串（如"2天前"、"1周前"）或日期（YYYY-MM-DD）
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const weeks = Math.floor(days / 7);

  if (days < 1) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) {
      const minutes = Math.floor(diff / (60 * 1000));
      return minutes < 1 ? '刚刚' : `${minutes}分钟前`;
    }
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else if (days < 30) {
    return `${weeks}周前`;
  } else {
    // 超过30天显示日期
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

type TimeFilter = 'all' | '30days' | '7days';

export default function HistoryScreen() {
  const router = useRouter();
  const { userInfo } = useUserStore();
  const { nestName } = useCreateStore();

  const [allRecords, setAllRecords] = useState<HistoryRecord[]>([]); // 所有记录
  const [filteredRecords, setFilteredRecords] = useState<HistoryRecord[]>([]); // 筛选后的记录
  const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('30days'); // 默认选择30天内
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // 显示ErrorModal
  const showErrorModal = useCallback((message: string) => {
    setErrorModalMessage(message);
    setErrorModalVisible(true);
  }, []);

  // 根据时间筛选记录
  const filterRecordsByTime = useCallback(
    (records: HistoryRecord[], filter: TimeFilter): HistoryRecord[] => {
      if (filter === 'all') {
        return records;
      }

      const now = Date.now();
      const filterDays = filter === '30days' ? 30 : 7;
      const filterTimestamp = now - filterDays * 24 * 60 * 60 * 1000; // 毫秒

      return records.filter((record) => record.lastMessageTime >= filterTimestamp);
    },
    []
  );

  // 应用筛选
  useEffect(() => {
    const filtered = filterRecordsByTime(allRecords, selectedFilter);
    setFilteredRecords(filtered);
  }, [allRecords, selectedFilter, filterRecordsByTime]);

  // 加载历史记录
  const loadHistory = useCallback(
    async () => {
      if (!userInfo.token) {
        showErrorModal('用户未登录，请重新登录');
        return;
      }

      setLoading(true);

      try {
        const response = await getHistoryList(userInfo.token);
        // 确保 records 始终是数组
        const loadedRecords = Array.isArray(response?.records) ? response.records : [];
        setAllRecords(loadedRecords);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '加载失败，请重试';
        showErrorModal(errorMessage);
        // 失败时不清空列表，保留已有内容
      } finally {
        setLoading(false);
      }
    },
    [userInfo.token, showErrorModal]
  );

  // 初始化加载
  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 处理筛选按钮点击
  const handleFilterPress = useCallback((filter: TimeFilter) => {
    setSelectedFilter(filter);
  }, []);

  // 点击列表项
  const handleRecordPress = useCallback(
    (record: HistoryRecord) => {
      router.push({
        pathname: '/(chat)/chat',
        params: { sessionId: record.conversationId },
      });
    },
    [router]
  );

  // 渲染列表项
  const renderRecordItem = useCallback(
    ({ item }: { item: HistoryRecord }) => {
      return (
        <View style={styles.recordItemWrapper}>
          <TouchableOpacity
            style={styles.recordItem}
            onPress={() => handleRecordPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.recordContent}>
              <Text style={styles.recordTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.recordSummary} numberOfLines={2}>
                {item.summary}
              </Text>
            </View>
            <Text style={styles.recordTime}>{formatRelativeTime(item.lastMessageTime)}</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [handleRecordPress]
  );

  // 渲染空状态
  const renderEmptyState = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          暂无历史记录，去和{nestName || 'NEST'}聊聊吧
        </Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ImageBackground
        source={require('@/assets/chat_background.png')}
        resizeMode="cover"
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* 顶部导航栏 */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Image
                source={require('@/assets/arrow-left.png')}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>聊天历史</Text>
            <View style={styles.headerRight} />
          </View>

          {/* 时间筛选按钮 */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === '30days' && styles.filterButtonActive]}
              onPress={() => handleFilterPress('30days')}
              activeOpacity={0.7}
            >
              <Text style={styles.filterButtonText}>30天内</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === '7days' && styles.filterButtonActive]}
              onPress={() => handleFilterPress('7days')}
              activeOpacity={0.7}
            >
              <Text style={styles.filterButtonText}>7天内</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
              onPress={() => handleFilterPress('all')}
              activeOpacity={0.7}
            >
              <Text style={styles.filterButtonText}>全部</Text>
            </TouchableOpacity>
          </View>

          {/* 列表 */}
          {loading && allRecords.length === 0 ? (
            <FullScreenLoading visible={true} />
          ) : (
            <FlatList
              data={filteredRecords}
              renderItem={renderRecordItem}
              keyExtractor={(item) => item.conversationId}
              contentContainerStyle={
                filteredRecords.length === 0 ? styles.emptyListContainer : styles.listContainer
              }
              ListEmptyComponent={renderEmptyState}
            />
          )}
        </SafeAreaView>

        {/* ErrorModal */}
        <ErrorModal
          visible={errorModalVisible}
          message={errorModalMessage}
          onClose={() => setErrorModalVisible(false)}
        />
      </ImageBackground>
    </>
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
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  headerTitle: {
    fontFamily: 'Agbalumo',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerRight: {
    width: 48,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordItemWrapper: {
    paddingBottom: 16,
  },
  recordItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'flex-start',
  },
  recordContent: {
    flex: 1,
    marginRight: 12,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  recordSummary: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  recordTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    alignSelf: 'flex-start',
    minWidth: 60,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

