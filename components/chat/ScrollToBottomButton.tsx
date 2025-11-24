import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeArea } from '@/hooks/useSafeArea';

interface ScrollToBottomButtonProps {
  visible: boolean;
  onPress: () => void;
}

/**
 * "有新消息↓"悬浮条
 */
export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  visible,
  onPress,
}) => {
  const { bottom } = useSafeArea();
  
  // 按钮样式（距离底部150px，在输入框上方，+ 安全区域）
  const containerStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: bottom + 150, // 150px + 底部安全区域（在输入框上方）
    alignSelf: 'center' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  }), [bottom]);
  
  if (!visible) return null;

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress}>
      <Text style={styles.text}>有新消息</Text>
      <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 4,
  },
});

