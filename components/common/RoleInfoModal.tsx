import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { getArchetypeBackstory } from '@/services/api/archetype';
import { useUserStore } from '@/store/userStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RoleInfoModalProps {
  visible: boolean;
  archetypeText: string; // 格式："标题 — 副标题"
  roleLabel: string; // 角色标题（用于显示）
  onClose: () => void;
}

export const RoleInfoModal: React.FC<RoleInfoModalProps> = ({
  visible,
  archetypeText,
  roleLabel,
  onClose,
}) => {
  const { userInfo } = useUserStore();
  const [backgroundStory, setBackgroundStory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBackstory = useCallback(async () => {
    if (!archetypeText) return;

    setLoading(true);
    setError(null);

    try {
      const story = await getArchetypeBackstory(archetypeText, userInfo.token || undefined);
      setBackgroundStory(story);
    } catch (err) {
      console.error('获取背景故事失败:', err);
      setError(err instanceof Error ? err.message : '获取背景故事失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [archetypeText, userInfo.token]);

  // 当弹窗显示时，获取背景故事
  useEffect(() => {
    if (visible && archetypeText) {
      fetchBackstory();
    } else {
      // 关闭时重置状态
      setBackgroundStory('');
      setError(null);
    }
  }, [visible, archetypeText, fetchBackstory]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 关闭按钮 */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Image
              source={require('@/assets/Close Square.png')}
              style={styles.closeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 标题 */}
          <View style={styles.header}>
            <Text style={styles.title}>{roleLabel}</Text>
          </View>

          {/* 背景故事内容 */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>加载中...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchBackstory}
                  activeOpacity={0.7}
                >
                  <Text style={styles.retryButtonText}>重试</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.storyText}>{backgroundStory}</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 365,
    height: SCREEN_HEIGHT * 0.6, // 60% 屏幕高度
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#170B2B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  storyText: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'left',
  },
});

