import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Text,
  ActivityIndicator,
} from 'react-native';
import { getAvailableEmojis } from '@/utils/emoji';
import { EmojiSvg } from './EmojiSvg';

interface EmojiDrawerProps {
  visible: boolean;
  onSelectEmoji: (shortcode: string) => void;
  onClose?: () => void;
  inputContainerHeight?: number; // 输入框容器高度，用于动态定位
}

/**
 * 表情抽屉组件
 * 显示表情选择面板，点击表情后插入 shortcode
 */
export const EmojiDrawer: React.FC<EmojiDrawerProps> = ({
  visible,
  onSelectEmoji,
  onClose,
  inputContainerHeight = 40,
}) => {
  const [emojis, setEmojis] = useState<{ shortcode: string; name: string; filename: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadEmojis();
    }
  }, [visible]);

  const loadEmojis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 从映射表加载表情列表
      const availableEmojis = getAvailableEmojis();
      console.log('加载的表情列表:', availableEmojis.length, availableEmojis.slice(0, 5));
      setEmojis(availableEmojis);
      
      setLoading(false);
    } catch (err) {
      setError('加载失败，点击重试');
      setLoading(false);
      console.error('加载表情失败:', err);
    }
  };

  const handleEmojiPress = (shortcode: string) => {
    onSelectEmoji(shortcode);
    // 选择表情后关闭抽屉
    onClose?.();
  };

  const renderEmojiItem = ({ item }: { item: { shortcode: string; name: string; filename: string } }) => {
    return (
      <TouchableOpacity
        style={styles.emojiItem}
        onPress={() => handleEmojiPress(item.shortcode)}
        activeOpacity={0.7}
      >
        {item.filename ? (
          <EmojiSvg
            filename={item.filename}
            size={32}
          />
        ) : (
          <View style={styles.emojiPlaceholder}>
            <Text style={styles.emojiPlaceholderText}>{item.name}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  // 动态计算底部位置：在输入框上方 10px
  const bottomPosition = inputContainerHeight + 20;

  return (
    <View style={[styles.container, { bottom: bottomPosition }]}>
      <View style={styles.drawer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadEmojis}
            >
              <Text style={styles.retryText}>重试</Text>
            </TouchableOpacity>
          </View>
        ) : emojis.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>没有找到表情</Text>
            <Text style={styles.errorText}>共 {emojis.length} 个表情</Text>
          </View>
        ) : (
          <FlatList
            data={emojis}
            renderItem={renderEmojiItem}
            keyExtractor={(item) => item.shortcode}
            numColumns={8}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>表情列表为空</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  drawer: {
    backgroundColor: 'rgba(134, 66, 136, 1)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20, 
    paddingTop: 16,
    paddingBottom: 16,
    maxHeight: 300,
    minHeight: 200,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  emojiItem: {
    width: '12.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  emojiImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  emojiPlaceholder: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPlaceholderText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

