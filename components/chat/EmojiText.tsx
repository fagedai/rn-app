import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { parseShortcodes, TextSegment, getEmojiPath } from '@/utils/emoji';
import { EmojiSvg } from './EmojiSvg';

interface EmojiTextProps {
  content: string;
  fontSize?: number;
  textStyle?: any;
}

/**
 * 支持表情渲染的文本组件
 * 用于消息气泡中显示包含表情的内容
 */
export const EmojiText: React.FC<EmojiTextProps> = ({
  content,
  fontSize = 16,
  textStyle,
}) => {
  const segments = parseShortcodes(content);
  const emojiSize = fontSize * 1.1;

  const renderSegment = (segment: TextSegment, index: number) => {
    if (segment.type === 'emoji' && segment.shortcode) {
      const filename = getEmojiPath(segment.shortcode);
      if (filename) {
        return (
          <EmojiSvg
            key={`emoji-${index}`}
            filename={filename}
            size={emojiSize}
            style={styles.emojiImage}
          />
        );
      }
    }
    return (
      <Text
        key={`text-${index}`}
        style={[styles.text, { fontSize }, textStyle]}
      >
        {segment.content}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {segments.map((segment, index) => renderSegment(segment, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // 让容器根据内容自适应高度
  },
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start', // 从顶部对齐，确保第一个文字正确对齐
  },
  text: {
    color: '#FFFFFF',
    lineHeight: 22, // 设置行高
  },
  emojiImage: {
    marginHorizontal: 1,
  },
});

