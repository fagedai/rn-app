import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { EmojiText } from './EmojiText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FLATLIST_PADDING = 16; // FlatList 的 paddingHorizontal（px）

// NEST回复消息：距离屏幕左侧22px，最大宽度到距离屏幕右侧54px
const ASSISTANT_BUBBLE_MARGIN_LEFT = 22 - FLATLIST_PADDING; // NEST消息距离屏幕左侧22px
const ASSISTANT_BUBBLE_MAX_WIDTH = SCREEN_WIDTH - 54 - FLATLIST_PADDING; // NEST消息最大宽度（到屏幕右侧54px）

interface GreetingBubbleProps {
  message: string;
}

/**
 * 问候气泡（不入库，仅展示）
 */
export const GreetingBubble: React.FC<GreetingBubbleProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <EmojiText
        content={message}
        fontSize={16}
        textStyle={styles.text}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    maxWidth: ASSISTANT_BUBBLE_MAX_WIDTH, // NEST消息最大宽度到屏幕右侧54px
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    marginVertical: 4,
    marginLeft: ASSISTANT_BUBBLE_MARGIN_LEFT, // NEST回复消息距离屏幕左侧22px
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
  },
});
