import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Message } from '@/store/chatStore';
import { Ionicons } from '@expo/vector-icons';
import { EmojiText } from './EmojiText';
import { GlassContainer } from '@/components/common/GlassContainer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FLATLIST_PADDING = 16; // FlatList 的 paddingHorizontal（px）

// 用户发送的消息：距离屏幕右侧22px，最大宽度到距离屏幕左侧54px
const USER_BUBBLE_MARGIN_RIGHT = 22 - FLATLIST_PADDING; // 用户消息距离屏幕右侧22px
const USER_BUBBLE_MAX_WIDTH = SCREEN_WIDTH - 54 - FLATLIST_PADDING; // 用户消息最大宽度（到屏幕左侧54px）

// NEST回复消息：距离屏幕左侧22px，最大宽度到距离屏幕右侧54px
const ASSISTANT_BUBBLE_MARGIN_LEFT = 22 - FLATLIST_PADDING; // NEST消息距离屏幕左侧22px
const ASSISTANT_BUBBLE_MAX_WIDTH = SCREEN_WIDTH - 54 - FLATLIST_PADDING; // NEST消息最大宽度（到屏幕右侧54px）

interface MessageBubbleProps {
  message: Message;
  onRetry?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry }) => {
  const isUser = message.role === 'user';
  const isImageMessage = !!(message.imageUrl || message.localImageUri);
  const imageUri = message.imageUrl || message.localImageUri;

  if (isUser) {
    // 用户消息：透明磨砂玻璃效果
    return (
      <View
        style={[
          styles.container,
          styles.userContainer,
        ]}
      >
        <GlassContainer
          borderRadius={{
            topLeft: 18,
            topRight: 18,
            bottomLeft: 18,
            bottomRight: 4,
          }}
        >
          {/* 内容层 */}
          <View style={styles.glassInner}>
            {/* 图片消息 */}
            {isImageMessage && imageUri ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
                {/* 上传进度 */}
                {message.status === 'sending' && message.uploadProgress !== undefined && (
                  <View style={styles.progressOverlay}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    {message.uploadProgress > 0 && (
                      <Text style={styles.progressText}>
                        {Math.round(message.uploadProgress)}%
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ) : (
              // 文本消息
              message.content ? (
                <EmojiText
                  content={message.content}
                  fontSize={16}
                  textStyle={[styles.text, styles.userText]}
                />
              ) : null
            )}
            
            {/* 错误提示和重试 */}
            {message.status === 'failed' && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>发送失败</Text>
                {onRetry && (
                  <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
                    <Ionicons name="refresh" size={14} color="#FFFFFF" />
                    <Text style={styles.retryText}>重试</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </GlassContainer>
      </View>
    );
  }

  // 机器人消息：透明背景
  return (
    <View
      style={[
        styles.container,
        styles.assistantContainer,
      ]}
    >
      {message.content ? (
        <EmojiText
          content={message.content}
          fontSize={16}
          textStyle={[styles.text, styles.assistantText]}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  userContainer: {
    alignSelf: 'flex-end',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
    marginRight: USER_BUBBLE_MARGIN_RIGHT, // 用户发送消息距离屏幕右侧22px
    maxWidth: USER_BUBBLE_MAX_WIDTH, // 用户消息最大宽度到屏幕左侧54px
  },
  glassContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  glassInner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    marginLeft: ASSISTANT_BUBBLE_MARGIN_LEFT, // NEST回复消息距离屏幕左侧22px
    maxWidth: ASSISTANT_BUBBLE_MAX_WIDTH, // NEST消息最大宽度到屏幕右侧54px
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#FFFFFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginRight: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    maxWidth: 200,
    maxHeight: 200,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
});

