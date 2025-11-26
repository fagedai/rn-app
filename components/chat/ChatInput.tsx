import React, { useState, useRef, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image, Alert, Platform } from 'react-native';
import { GlassContainer } from '@/components/common/GlassContainer';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { SimpleTextInput } from './SimpleTextInput';
import { EmojiDrawer } from './EmojiDrawer';
import { SHORTCODE_TO_PLACEHOLDER, convertPlaceholdersToShortcodes } from '@/utils/emoji';
import { useChatStore, Message } from '@/store/chatStore';
import { generateUUID } from '@/utils/uuid';
import { uploadImageToSupabase, getFileSizeInMB } from '@/services/imageUpload';
import { sendMessageStream } from '@/services/api/chat';
import { useUserStore } from '@/store/userStore';
import { ErrorModal } from '@/components/common/ErrorModal';
import { track } from '@/services/tracking';
import { splitMessageByNewlines } from '@/utils/messageSplitter';
import { useCreateStore } from '@/store/createStore';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = '| 说点什么',
}) => {
  const [text, setText] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showEmojiDrawer, setShowEmojiDrawer] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const inputRef = useRef<any>(null);
  const inputContainerRef = useRef<View>(null);
  const [inputContainerHeight, setInputContainerHeight] = useState(40);
  
  // 获取 chatStore 的方法
  const { 
    currentSessionId, 
    conversationId, 
    addMessage, 
    updateMessage,
    setMessages,
    setStreamingMessageId,
    setConversationId,
  } = useChatStore();
  
  // 获取用户信息
  const { userInfo } = useUserStore();

  const handleSend = () => {
    console.log('handleSend called', { text, disabled });
    const trimmedText = text.trim();
    if (!trimmedText || disabled) {
      console.log('Cannot send:', { trimmedText, disabled });
      return;
    }
    // 将占位符转换为 shortcode 后发送
    const convertedText = convertPlaceholdersToShortcodes(trimmedText);
    console.log('Sending message:', convertedText);
    onSend(convertedText);
    setText('');
    setInputHeight(40); // 重置输入框高度
    inputRef.current?.blur();
  };

  // 使用 useMemo 优化，避免不必要的重新渲染
  const canSend = useMemo(() => text.trim().length > 0 && !disabled, [text, disabled]);

  const handleFocus = () => {
    // 聚焦时不需要特殊处理
  };

  const handleBlur = () => {
    // 失焦时不需要特殊处理
  };

  const handlePlusPress = () => {
    setShowActionMenu(!showActionMenu);
    // 打开操作菜单时关闭表情抽屉
    if (showActionMenu) {
      setShowEmojiDrawer(false);
    }
  };

  const handleEmojiIconPress = () => {
    setShowEmojiDrawer(!showEmojiDrawer);
    setShowActionMenu(false);
  };

  const handleEmojiSelect = (shortcode: string) => {
    // 将 shortcode 转换为占位符（格式：[表情英文]，例如 [sad]）
    const placeholder = SHORTCODE_TO_PLACEHOLDER[shortcode] || shortcode;
    
    // 获取当前光标位置
    let cursorPosition = text.length;
    if (inputRef.current && 'getSelection' in inputRef.current) {
      const selection = (inputRef.current as any).getSelection();
      if (selection) {
        cursorPosition = selection.end || selection.start || text.length;
      }
    }
    
    // 在光标位置插入占位符
    const newText = text.slice(0, cursorPosition) + placeholder + text.slice(cursorPosition);
    setText(newText);

    // 选择表情后，聚焦输入框
    inputRef.current?.focus();

    // 更新光标位置到插入表情后
    setTimeout(() => {
      const newCursorPosition = cursorPosition + placeholder.length;
      inputRef.current?.setNativeProps({
        selection: { start: newCursorPosition, end: newCursorPosition },
      });
    }, 0);
  };

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    const contentHeight = height || 20;
    const maxContentHeight = 100; // 最大内容高度（120 - 20 padding = 100）
    
    let newHeight: number;
    if (contentHeight <= maxContentHeight) {
      newHeight = Math.max(40, contentHeight + 20); // +20 是为了 paddingVertical
      setInputHeight(newHeight);
    } else {
      newHeight = 120;
      setInputHeight(newHeight);
    }
    
    setInputContainerHeight(newHeight);
  };

  const handleInputContainerLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setInputContainerHeight(height);
  };

  React.useEffect(() => {
    setInputContainerHeight(inputHeight);
  }, [inputHeight]);

  // 请求相册和相机权限
  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (mediaLibraryStatus !== 'granted') {
          Alert.alert('需要相册权限', '请允许访问相册以选择图片');
        }
        if (cameraStatus !== 'granted') {
          showErrorModal('请允许访问相机以拍照', '需要相机权限');
        }
      }
    })();
  }, []);

  // 显示 ErrorModal 提示
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const showErrorModal = (message: string) => {
    setErrorModalMessage(message);
    setErrorModalVisible(true);
  };

  // 处理相册选择 - 完整流程：选图 → 裁剪 → 压缩 → 上传 → 发送
  const handleImagePicker = async () => {
    try {
      setShowActionMenu(false);
      
      // 步骤1: 打开相册选择器
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // 强制裁剪
        quality: 0.8,
        allowsMultipleSelection: false,
        aspect: [1, 1], // 1:1 裁剪比例（可根据需求调整）
      });

      // 取消选择：直接返回，不产生消息
      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        return;
      }

      const originalAsset = pickerResult.assets[0];
      let croppedUri = originalAsset.uri;

      // 步骤2: 处理图片（压缩和生成缩略图）
      await processAndUploadImage(croppedUri);
    } catch (error) {
      console.error('选择图片失败:', error);
      showErrorModal('选择图片失败，请重试');
    }
  };

  // 处理相机拍照 - 完整流程：拍照 → 裁剪 → 压缩 → 上传 → 发送
  const handleCamera = async () => {
    try {
      setShowActionMenu(false);
      
      // 步骤1: 打开相机
      const cameraResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // 强制裁剪
        quality: 0.8,
        aspect: [1, 1], // 1:1 裁剪比例（可根据需求调整）
      });

      // 取消拍照：直接返回
      if (cameraResult.canceled || !cameraResult.assets || cameraResult.assets.length === 0) {
        return;
      }

      const originalAsset = cameraResult.assets[0];
      let croppedUri = originalAsset.uri;

      // 步骤2: 处理图片（压缩和生成缩略图）
      await processAndUploadImage(croppedUri);
    } catch (error) {
      console.error('拍照失败:', error);
      showErrorModal('拍照失败，请重试');
    }
  };

  // 检查图片格式是否支持
  const isSupportedImageFormat = (uri: string): boolean => {
    const extension = uri.split('.').pop()?.toLowerCase() || '';
    const supportedFormats = ['jpg', 'jpeg', 'png', 'heic', 'webp'];
    return supportedFormats.includes(extension);
  };

  // 处理并上传图片的完整流程
  const processAndUploadImage = async (imageUri: string, existingMessageId?: string) => {
    try {
      const sessionId = currentSessionId || 'temp';
      
      // 检查用户信息
      if (!userInfo.userId || !userInfo.token) {
        showErrorModal('用户未登录，请重新登录');
        return;
      }
      
      const userId = userInfo.userId;

      // 步骤1: 检查图片格式
      if (!isSupportedImageFormat(imageUri)) {
        showErrorModal('图片格式不支持，仅支持 jpeg/png/heic/webp');
        return;
      }

      // 步骤2: 检查文件大小
      const fileSizeMB = await getFileSizeInMB(imageUri);
      if (fileSizeMB > 10) {
        showErrorModal('图片过大');
        return;
      }

      // 步骤3: 获取图片尺寸以确定压缩方式
      // 使用 getImageInfoAsync 获取图片信息，避免不必要的处理
      const imageInfo = await ImageManipulator.manipulateAsync(
        imageUri,
        [], // 不进行任何操作，只获取信息
        { format: ImageManipulator.SaveFormat.JPEG }
      );

      // 步骤4: 压缩图片（发送图：最长边 ≤ 1024px，质量 0.8）
      const maxDimension = 1024;
      const width = imageInfo.width;
      const height = imageInfo.height;
      const maxSide = Math.max(width, height);
      
      let resizeActions: ImageManipulator.Action[] = [];
      if (maxSide > maxDimension) {
        if (width > height) {
          resizeActions.push({ resize: { width: maxDimension } });
        } else {
          resizeActions.push({ resize: { height: maxDimension } });
        }
      }
      // 如果不需要压缩，resizeActions 为空数组，只转换格式

      const compressedResult = await ImageManipulator.manipulateAsync(
        imageUri,
        resizeActions.length > 0 ? resizeActions : [],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 步骤5: 生成缩略图（最长边 ≤ 256px，质量 0.5）
      const thumbnailMaxDimension = 256;
      const thumbnailMaxSide = Math.max(width, height);
      
      let thumbnailResizeActions: ImageManipulator.Action[] = [];
      if (thumbnailMaxSide > thumbnailMaxDimension) {
        if (width > height) {
          thumbnailResizeActions.push({ resize: { width: thumbnailMaxDimension } });
        } else {
          thumbnailResizeActions.push({ resize: { height: thumbnailMaxDimension } });
        }
      }

      const thumbnailResult = await ImageManipulator.manipulateAsync(
        imageUri,
        thumbnailResizeActions.length > 0 ? thumbnailResizeActions : [],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 步骤6: 创建或更新占位消息（<300ms 内完成）
      const messageId = existingMessageId || generateUUID();
      const clientTs = Date.now();
      
      if (!existingMessageId) {
        // 新消息：创建占位消息
        const placeholderMessage: Message = {
          message_id: messageId,
          session_id: sessionId,
          role: 'user',
          content: '', // 图片消息 content 为空
          status: 'sending',
          client_ts: clientTs,
          localImageUri: compressedResult.uri, // 本地预览
          uploadProgress: 0,
        };
        addMessage(sessionId, placeholderMessage);
      } else {
        // 重试：更新现有消息
        updateMessage(sessionId, messageId, {
          localImageUri: compressedResult.uri,
          uploadProgress: 0,
        });
      }

      // 步骤7: 上传图片到 Supabase Storage
      try {
        const imageUrl = await uploadImageToSupabase(
          compressedResult.uri,
          userId,
          undefined,
          (progress) => {
            // 更新上传进度
            updateMessage(sessionId, messageId, { uploadProgress: progress });
          }
        );

        // 步骤8: 上传成功，更新消息状态为已发送
        updateMessage(sessionId, messageId, {
          status: 'sent',
          imageUrl: imageUrl,
          thumbnailUrl: thumbnailResult.uri, // 缩略图使用本地 URI
          uploadProgress: 100,
        });

        // 发送图片消息埋点
        const { profileId } = useUserStore.getState().userInfo;
        const { isFromHistory } = useChatStore.getState();
        track('chat_message_send', {
          bot_id: profileId || '',
          session_id: sessionId,
          message_id: messageId,
          content_length: 0, // 图片消息长度为 0
          has_emoji: false,
          from_history_session: isFromHistory,
        });

        // 步骤9: 通过 agent/invoke 接口发送图片 URL 到后端
        // 参数：{ userId, imageUrl, conversationId }
        // 响应流程和普通消息一样（流式响应）
        const assistantMessageId = `assistant-${messageId}`;
        setStreamingMessageId(assistantMessageId);

        await sendMessageStream(
          {
            userId: userId,
            imageUrl: imageUrl, // 图片 URL
            conversationId: conversationId || '',
            token: userInfo.token,
          },
          // onChunk: 接收流式数据
          (chunk: string) => {
            const store = useChatStore.getState();
            const currentStreamingId = store.streamingMessageId || assistantMessageId;
            setStreamingMessageId(currentStreamingId);

            const currentMessages = store.messages[sessionId] || [];
            const existingMessage = currentMessages.find(
              (m) => m.message_id === currentStreamingId
            );

            if (existingMessage) {
              updateMessage(sessionId, currentStreamingId, {
                content: existingMessage.content + chunk,
                status: 'streaming',
              });
            } else {
              // 创建助手消息
              addMessage(sessionId, {
                message_id: currentStreamingId,
                session_id: sessionId,
                role: 'assistant',
                content: chunk,
                status: 'streaming',
                client_ts: clientTs + 100,
              });
            }
          },
          // onComplete: 流式接收完成
          (newConversationId: string | null) => {
            console.log('[ChatInput] 图片消息流式接收完成:', { newConversationId });
            
            if (newConversationId) {
              setConversationId(newConversationId);
            }
            
            const store = useChatStore.getState();
            const currentStreamingId = store.streamingMessageId || assistantMessageId;
            const assistantMessage = store.messages[sessionId]?.find(
              (m) => m.message_id === currentStreamingId
            );
            
            if (!assistantMessage) {
              setStreamingMessageId(null);
              return;
            }

            // 检查是否需要分割消息（根据换行符）
            const fullContent = assistantMessage.content;
            const messageParts = splitMessageByNewlines(fullContent);

            if (messageParts.length > 1) {
              // 需要分割成多个消息气泡
              const currentMessages = store.messages[sessionId] || [];
              
              // 找到原消息的索引
              const originalMessageIndex = currentMessages.findIndex(
                (m) => m.message_id === currentStreamingId
              );

              if (originalMessageIndex >= 0) {
                // 创建新的消息列表
                const newMessages: Message[] = [];
                
                // 保留原消息之前的所有消息
                newMessages.push(...currentMessages.slice(0, originalMessageIndex));
                
                // 为每个分割后的部分创建独立的消息气泡
                messageParts.forEach((part, index) => {
                  const partMessageId = index === 0 
                    ? currentStreamingId // 第一个部分使用原消息ID
                    : generateUUID(); // 其他部分使用新ID
                  
                  newMessages.push({
                    message_id: partMessageId,
                    session_id: sessionId,
                    role: 'assistant',
                    content: part,
                    status: 'sent',
                    client_ts: assistantMessage.client_ts + index * 10, // 递增时间戳，保持顺序
                  });
                });
                
                // 保留原消息之后的所有消息
                newMessages.push(...currentMessages.slice(originalMessageIndex + 1));
                
                // 更新消息列表
                setMessages(sessionId, newMessages);
              }
            } else {
              // 不需要分割，直接更新状态
            updateMessage(sessionId, currentStreamingId, {
              status: 'sent',
              });
            }
            
            // 回复展示完成埋点（使用完整内容长度）
            const { profileId } = useUserStore.getState().userInfo;
            track('chat_reply_show', {
              bot_id: profileId || '',
              session_id: sessionId,
              message_id: messageId,
              reply_length: fullContent.length,
              is_interrupted: false,
            });
            
            setStreamingMessageId(null);
          },
          // onError: 错误处理
          (error: Error) => {
            console.error('[ChatInput] 发送图片消息错误:', error);
            updateMessage(sessionId, messageId, {
              status: 'failed',
            });
            setStreamingMessageId(null);
            showErrorModal('发送图片失败，请重试');
          }
        );
      } catch (uploadError) {
        console.error('上传失败:', uploadError);
        
        // 上传失败，更新消息状态
        updateMessage(sessionId, messageId, {
          status: 'failed',
        });

        // 检查错误类型
        if (uploadError instanceof Error) {
          if (uploadError.message.includes('网络') || uploadError.message.includes('Network')) {
            showErrorModal('网络异常，请重试');
          } else {
            showErrorModal('图片发送失败，请重试');
          }
        } else {
          showErrorModal('图片发送失败，请重试');
        }
      }
    } catch (error) {
      console.error('处理图片失败:', error);
      showErrorModal('图片处理失败，请重试');
    }
  };


  return (
    <View style={styles.container}>
      <View 
        ref={inputContainerRef}
        style={[styles.inputContainer, { height: inputHeight }]}
        onLayout={handleInputContainerLayout}
      >
        <SimpleTextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          style={[
            styles.input,
            { paddingRight: canSend ? 60 : 48 },
          ]}
          multiline
          maxLength={1000}
          editable={!disabled}
          onSubmitEditing={handleSend}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onContentSizeChange={handleContentSizeChange}
          fontSize={16}
        />
        
        {/* 纸飞机图标（有文本时显示） */}
        {canSend && (
          <TouchableOpacity
            style={styles.sendIconButton}
            onPress={handleSend}
            disabled={!canSend}
          >
            <Ionicons name="paper-plane-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        
        {/* 右侧+符号或x符号 */}
        <TouchableOpacity
          style={styles.plusButton}
          onPress={handlePlusPress}
        >
          <Text style={styles.plusSymbol}>{showActionMenu ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>

      {/* 操作菜单弹窗 */}
      {showActionMenu && (
        <View style={[
          styles.actionMenu,
          {
            bottom: inputContainerHeight + 15, // 在输入框上方 15px
          }
        ]}>
          <GlassContainer borderRadius={50} highlightHeight={50}>
            {/* 内容层 */}
            <View style={styles.actionMenuContent}>
              <TouchableOpacity
                style={styles.actionIcon}
                onPress={handleEmojiIconPress}
              >
                <Image
                  source={require('@/assets/Emoji.png')}
                  style={styles.actionImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionIcon}
                onPress={handleImagePicker}
              >
                <Image
                  source={require('@/assets/Image.png')}
                  style={styles.actionImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionIcon}
                onPress={handleCamera}
              >
                <Image
                  source={require('@/assets/Camera.png')}
                  style={styles.actionImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          </GlassContainer>
        </View>
      )}

      {/* 表情抽屉 */}
      <EmojiDrawer
        visible={showEmojiDrawer}
        onSelectEmoji={handleEmojiSelect}
        onClose={() => {
          setShowEmojiDrawer(false);
        }}
        inputContainerHeight={inputContainerHeight}
      />

      {/* ErrorModal 提示 */}
      <ErrorModal
        visible={errorModalVisible}
        message={errorModalMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flex: 1,
    marginLeft: 0, // 去掉左边距，让输入框占据电话图标的位置
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 16, // 为+号预留空间
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: 120, // 最高120px，允许更多行
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start', // 从顶部对齐，支持多行输入
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    padding: 0,
    textAlignVertical: 'top', // 改为顶部对齐，支持多行输入
  },
  sendIconButton: {
    position: 'absolute',
    right: 45,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // 确保按钮在最上层，可以接收点击事件
    width: 40, // 增加点击区域
    minHeight: 40,
  },
  plusButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusSymbol: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  plusButtonDisabled: {
    opacity: 0.5,
  },
  actionMenu: {
    position: 'absolute',
    right: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 50,
  },
  actionMenuContent: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    marginHorizontal: 2.5,
    padding: 4,
  },
  actionImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

