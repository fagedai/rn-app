import React from 'react';
import { View, Text, ScrollView, Modal, Dimensions, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { PRIVACY_POLICY } from '@/constants/privacyPolicy';
import { USER_AGREEMENT } from '@/constants/userAgreement';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = Math.round(SCREEN_HEIGHT * 0.85);

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

/**
 * 渲染格式化的协议内容
 * - 大标题（如"一、导言"）：大号字体，加粗
 * - 小标题（如"2.1 您主动提供的信息"）：正常字体，加粗
 * - 普通文本：小字体，不加粗
 * - 子文本：小字体，有缩进
 */
const renderFormattedContent = (content: string) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    const line = originalLine.trim();
    
    if (!line) {
      // 空行
      elements.push(<Text key={key++} style={styles.emptyLine}>{'\n'}</Text>);
      continue;
    }

    // 判断是否为大标题（如"一、导言"、"二、我们收集的信息"）
    if (/^[一二三四五六七八九十]+、/.test(line)) {
      elements.push(
        <Text key={key++} style={styles.mainTitle}>
          {line}
          {'\n'}
        </Text>
      );
      continue;
    }

    // 判断是否为小标题（如"2.1"、"3.1"等数字开头，或"2.1 您主动提供的信息"）
    if (/^\d+\.\d+\s/.test(line)) {
      elements.push(
        <Text key={key++} style={styles.subTitle}>
          {line}
          {'\n'}
        </Text>
      );
      continue;
    }

    // 判断是否为子标题（如"1. 注册与登录信息"）
    if (/^\d+\.\s[^：:]+$/.test(line) || /^[一二三四五六七八九十]+\.\s[^：:]+$/.test(line)) {
      elements.push(
        <Text key={key++} style={styles.subTitle}>
          {line}
          {'\n'}
        </Text>
      );
      continue;
    }

    // 判断是否为带缩进的子文本（以"-"或"•"开头，或前面有空格）
    const leadingSpaces = originalLine.match(/^[\s]*/)?.[0]?.length || 0;
    if (/^[\s]*[-•]/.test(originalLine) || leadingSpaces >= 2) {
      // 根据空格数量计算缩进级别：每2个空格为一级，每级16px
      const indentLevel = Math.min(Math.floor(leadingSpaces / 2) * 16, 64);
      elements.push(
        <Text key={key++} style={[styles.normalText, indentLevel > 0 && { paddingLeft: indentLevel }]}>
          {line}
          {'\n'}
        </Text>
      );
      continue;
    }

    // 普通文本
    elements.push(
      <Text key={key++} style={styles.normalText}>
        {line}
        {'\n'}
      </Text>
    );
  }

  return <>{elements}</>;
};

export const TermsModal: React.FC<TermsModalProps> = ({
  visible,
  onClose,
  title = '服务条款',
}) => {
  const translateY = useSharedValue(MODAL_HEIGHT);
  const opacity = useSharedValue(0);
  const [isMounted, setIsMounted] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setIsMounted(true);
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(MODAL_HEIGHT, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      const timeout = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [visible, opacity, translateY]);

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      visible={visible || isMounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          },
          overlayStyle,
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <Animated.View
          style={[
            {
              backgroundColor: '#2A1F4A',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              height: MODAL_HEIGHT,
              paddingTop: 24,
              paddingHorizontal: 24,
              paddingBottom: 40,
            },
            modalStyle,
          ]}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                alignSelf: 'center',
                width: 42,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.2)',
                marginBottom: 20,
              }}
            />
            <Text style={styles.modalTitle}>{title}</Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {renderFormattedContent(title === '服务条款' ? USER_AGREEMENT : PRIVACY_POLICY)}
            </ScrollView>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 26,
  },
  subTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    lineHeight: 24,
  },
  normalText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'normal',
    lineHeight: 20,
    marginBottom: 4,
  },
  emptyLine: {
    height: 8,
  },
});

