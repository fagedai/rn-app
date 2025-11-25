import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  ImageBackground,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChatStore, Message, MessageRole } from '@/store/chatStore';
import { useCreateStore } from '@/store/createStore';
import { useUserStore } from '@/store/userStore';
import { getNestInfo } from '@/services/api/aiSettings';
import { useSafeArea } from '@/hooks/useSafeArea';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { GreetingBubble } from '@/components/chat/GreetingBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ChatInput } from '@/components/chat/ChatInput';
import { ScrollToBottomButton } from '@/components/chat/ScrollToBottomButton';
import {
  sendMessageStream,
  // ensureAgentId, // 已移除
} from '@/services/api/chat';
import { getHistoryMessages } from '@/services/api/history';
import { generateUUID } from '@/utils/uuid';
import { ErrorModal } from '@/components/common/ErrorModal';
import { uploadImageToSupabase } from '@/services/imageUpload';
import * as ImageManipulator from 'expo-image-manipulator';

const PAGE_SIZE = 30;

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  
  const {
    currentSessionId,
    conversationId,
    messages,
    isFromHistory,
    greetingMessage,
    streamingMessageId,
    pagination,
    setCurrentSession,
    setConversationId,
    setFromHistory,
    setGreetingMessage,
    addMessage,
    updateMessage,
    setMessages,
    appendMessages,
    setStreamingMessageId,
    setPagination,
  } = useChatStore();

  const { aiRelationship, nestName } = useCreateStore();
  const { userInfo } = useUserStore();
  const { bottom } = useSafeArea();

  const flatListRef = useRef<FlatList>(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [historyMessageCount, setHistoryMessageCount] = useState(0); // 记录历史消息数量
  const nestInfoLoadedRef = useRef(false); // 标记是否已加载 nestInfo

  // 初始化：判断进入方式
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // agent_id 功能已移除，直接设置会话
        setCurrentSession(null, null);

        if (params.sessionId) {
          // 从历史记录进入
          setFromHistory(true);
          setCurrentSession(params.sessionId, null); // agent_id 功能已移除，传入 null
          setConversationId(params.sessionId);
          
          // 拉取历史消息
          await loadHistoryMessages(params.sessionId);
        } else {
          // 常规进入
          setFromHistory(false);
          
          // 老用户第一次进入chat页面时，获取AI基本设置信息
          if (userInfo.isNewUser === 0 && !nestInfoLoadedRef.current && userInfo.token) {
            try {
              console.log('[Chat] 老用户首次进入，获取AI基本设置信息');
              const nestInfo = await getNestInfo(userInfo.token);
              
              // 更新 createStore
              const { 
                setNestName, 
                setNestRelationship, 
                setNestLastMemory, 
                setNestBackstory,
                setnestName,
                setAiRelationship,
                setAiBackgroundStory,
              } = useCreateStore.getState();
              
              if (nestInfo.profile_id) {
                // 更新 userStore 中的 profileId（如果还没有）
                const { setProfileId } = useUserStore.getState();
                if (!userInfo.profileId) {
                  setProfileId(nestInfo.profile_id);
                }
              }
              
              // 更新 nestInfo 相关字段
              if (nestInfo.nest_name) {
                setNestName(nestInfo.nest_name);
                setnestName(nestInfo.nest_name);
              }
              if (nestInfo.nest_relationship) {
                setNestRelationship(nestInfo.nest_relationship);
                setAiRelationship(nestInfo.nest_relationship);
              }
              if (nestInfo.nest_last_memory !== null) {
                setNestLastMemory(nestInfo.nest_last_memory);
              }
              if (nestInfo.nest_backstory) {
                setNestBackstory(nestInfo.nest_backstory);
                setAiBackgroundStory(nestInfo.nest_backstory);
              }
              
              nestInfoLoadedRef.current = true;
              console.log('[Chat] AI基本设置信息已加载:', nestInfo);
            } catch (error) {
              console.error('[Chat] 获取AI基本设置信息失败:', error);
              // 失败不影响正常使用，静默处理
              nestInfoLoadedRef.current = true; // 标记为已尝试，避免重复请求
            }
          }
        }

        // 使用默认问候语（不再调用 API）
        const { nestName } = useCreateStore.getState();
        const defaultGreeting = '嗨～终于见到你啦，我是Lisa💜';
        const finalGreeting = defaultGreeting.replace(/Lisa/g, nestName);
        setGreetingMessage(finalGreeting);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '初始化失败';
        setError(errorMessage);
        setShowErrorModal(true);
      }
    };

    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当 nestName 变化时，更新招呼语
  useEffect(() => {
    if (greetingMessage && nestName) {
      // 匹配 "我是XXX💜" 格式，替换名字
      const updatedGreeting = greetingMessage.replace(/我是[^💜]+💜/g, `我是${nestName}💜`);
      // 如果招呼语中包含旧名字（可能是其他格式），也替换（如 "Lisa"）
      const finalGreeting = updatedGreeting.replace(/Lisa/g, nestName);
      if (finalGreeting !== greetingMessage) {
        setGreetingMessage(finalGreeting);
      }
    } else if (greetingMessage && !nestName) {
      // 如果名字为空，使用默认名字
      const defaultGreeting = '嗨～终于见到你啦，我是Lisa💜';
      setGreetingMessage(defaultGreeting);
    }
  }, [nestName, greetingMessage, setGreetingMessage]);

  // 加载历史消息（从历史记录进入时调用）
  const loadHistoryMessages = async (conversationId: string) => {
    if (!userInfo.token) {
      console.error('加载历史消息失败: 用户未登录');
      return;
    }

    try {
      setPagination(conversationId, {
        page: 1,
        hasMore: false,
        loading: true,
      });

      const historyMessage = await getHistoryMessages(conversationId, userInfo.token);
      
      if (!historyMessage) {
        // 没有历史消息，设置为空数组
        setMessages(conversationId, []);
        setPagination(conversationId, {
          page: 1,
          hasMore: false,
          loading: false,
        });
        return;
      }

      // 转换消息格式：将 user_message 和 agent_message 转换为消息数组
      const formattedMessages: Message[] = [];
      
      // 添加用户消息
      if (historyMessage.userMessage) {
        formattedMessages.push({
          message_id: generateUUID(),
          session_id: conversationId,
          role: 'user',
          content: historyMessage.userMessage,
          status: 'sent',
          client_ts: Date.now(),
        });
      }
      
      // 添加助手消息
      if (historyMessage.agentMessage) {
        formattedMessages.push({
          message_id: generateUUID(),
          session_id: conversationId,
          role: 'assistant',
          content: historyMessage.agentMessage,
          status: 'sent',
          client_ts: Date.now(),
        });
      }

      setMessages(conversationId, formattedMessages);
      setHistoryMessageCount(formattedMessages.length); // 记录历史消息数量
      setPagination(conversationId, {
        page: 1,
        hasMore: false,
        loading: false,
      });
    } catch (err) {
      setPagination(conversationId, {
        page: 1,
        hasMore: false,
        loading: false,
      });
      console.error('加载历史消息失败:', err);
    }
  };

  // 重试图片上传
  const retryImageUpload = useCallback(
    async (message: Message) => {
      if (!message.localImageUri) {
        setError('图片文件已丢失，无法重试');
        setShowErrorModal(true);
        return;
      }

      const sessionId = message.session_id || currentSessionId || 'temp';
      const userId = 'user_' + Date.now(); // 临时用户ID，实际应从用户状态获取

      // 更新消息状态为 sending
      updateMessage(sessionId, message.message_id, {
        status: 'sending',
        uploadProgress: 0,
      });

      try {
        // 重新压缩图片（发送图：最长边 ≤ 1024px，质量 0.8）
        const imageInfo = await ImageManipulator.manipulateAsync(
          message.localImageUri,
          [],
          { format: ImageManipulator.SaveFormat.JPEG }
        );

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

        const compressedResult = await ImageManipulator.manipulateAsync(
          message.localImageUri,
          resizeActions.length > 0 ? resizeActions : [],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        // 重新上传
        const imageUrl = await uploadImageToSupabase(
          compressedResult.uri,
          userId,
          undefined,
          (progress) => {
            updateMessage(sessionId, message.message_id, { uploadProgress: progress });
          }
        );

        // 上传成功，更新消息状态
        updateMessage(sessionId, message.message_id, {
          status: 'sent',
          imageUrl: imageUrl,
          uploadProgress: 100,
        });

        // 发送图片消息到后端（触发NEST图像理解任务）
        if (userInfo.userId && userInfo.token) {
          const messageId = generateUUID();
          const clientTs = Date.now();
          
          await sendMessageStream(
            {
              userId: userInfo.userId,
              imageUrl: imageUrl,
              conversationId: conversationId || '',
              token: userInfo.token,
            },
            (chunk: string) => {
              // 处理流式响应
              const store = useChatStore.getState();
              const currentStreamingId = store.streamingMessageId || `assistant-${messageId}`;
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
            (newConversationId: string | null) => {
              // 流式接收完成，更新 conversationId
              if (newConversationId) {
                setConversationId(newConversationId);
              }
              const store = useChatStore.getState();
              const currentStreamingId = store.streamingMessageId || `assistant-${messageId}`;
              updateMessage(sessionId, currentStreamingId, {
                status: 'sent',
              });
              setStreamingMessageId(null);
            },
            (error: Error) => {
              console.error('发送图片消息错误:', error);
              setError('发送图片消息失败');
              setShowErrorModal(true);
            }
          );
        }
      } catch (error) {
        console.error('重试上传失败:', error);
        updateMessage(sessionId, message.message_id, {
          status: 'failed',
        });
        setError('图片发送失败，请重试');
        setShowErrorModal(true);
      }
    },
    [currentSessionId, conversationId, userInfo.userId, userInfo.token, updateMessage, addMessage, setCurrentSession, setConversationId, setStreamingMessageId]
  );

  // 发送消息
  const handleSendMessage = useCallback(
    async (content: string) => {

      const messageId = generateUUID();
      const clientTs = Date.now();
      const sessionId = currentSessionId;

      // 创建用户消息
      const userMessage: Message = {
        message_id: messageId,
        session_id: sessionId,
        role: 'user',
        content,
        status: 'sending',
        client_ts: clientTs,
      };

      const finalSessionId = sessionId || 'temp'; // 临时sessionId，后端会创建新的
      addMessage(finalSessionId, userMessage);

      // 滚动到底部
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      setInputDisabled(true);
      setRetryCount(0);

      // 立即设置 streamingMessageId，这样打字指示器会立即显示
      const assistantMessageId = `assistant-${messageId}`;
      setStreamingMessageId(assistantMessageId);

      // 检查 userId 和 token
      if (!userInfo.userId || !userInfo.token) {
        setError('用户未登录，请重新登录');
        setShowErrorModal(true);
        setInputDisabled(false);
        setStreamingMessageId(null);
        return;
      }

      // 发送消息（流式）
      console.log('发送消息:', { userId: userInfo.userId, prompt: content, conversationId: conversationId || '' });
      await sendMessageStream(
        {
          userId: userInfo.userId,
          prompt: content,
          conversationId: conversationId || '',
          token: userInfo.token,
        },
        // onChunk: 接收流式数据
        (chunk: string) => {
          // 获取最新状态
          const store = useChatStore.getState();
          const currentStreamingId = store.streamingMessageId || `assistant-${messageId}`;
          setStreamingMessageId(currentStreamingId);

          const currentMessages = store.messages[finalSessionId] || [];
          const existingMessage = currentMessages.find(
            (m) => m.message_id === currentStreamingId
          );

          if (existingMessage) {
            updateMessage(finalSessionId, currentStreamingId, {
              content: existingMessage.content + chunk,
              status: 'streaming',
            });
          } else {
            // 创建NEST消息，时间戳应该比用户消息稍晚
            addMessage(finalSessionId, {
              message_id: currentStreamingId,
              session_id: finalSessionId,
              role: 'assistant',
              content: chunk,
              status: 'streaming',
              client_ts: clientTs + 100, // 确保在用户消息之后
            });
          }

          // 自动滚动到底部
          if (isAtBottom) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 50);
          }
        },
        // onComplete: 流式接收完成
        (newConversationId: string | null) => {
          console.log('流式接收完成:', { newConversationId });
          // 获取最新状态
          const store = useChatStore.getState();
          
          // 更新 conversationId（第一轮对话后会返回）
          if (newConversationId) {
            setConversationId(newConversationId);
          }
          
          // 更新助手消息状态
          const currentStreamingId = store.streamingMessageId || `assistant-${messageId}`;
          updateMessage(finalSessionId, currentStreamingId, {
            status: 'sent',
          });
          
          // 更新用户消息状态
          updateMessage(finalSessionId, messageId, {
            status: 'sent',
          });

          setStreamingMessageId(null);
          setInputDisabled(false);
          setRetryCount(0);
        },
        // onError: 错误处理
        async (error: Error) => {
          console.error('发送消息错误:', error);
          updateMessage(finalSessionId, messageId, {
            status: 'failed',
          });

          // 重试机制（最多3次）
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              handleSendMessage(content);
            }, delay);
          } else {
            // 超过重试次数，显示错误提示
            setError('网络有点差，我们再试一次？');
            setShowErrorModal(true);
            setInputDisabled(false);
            setStreamingMessageId(null);
            setRetryCount(0);
          }
        }
      );
    },
    [
      currentSessionId,
      conversationId,
      userInfo.userId,
      userInfo.token,
      isAtBottom,
      retryCount,
      addMessage,
      updateMessage,
      setCurrentSession,
      setConversationId,
      setStreamingMessageId,
      setMessages,
    ]
  );

  // 滚动处理
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;
    setIsAtBottom(isNearBottom);
    setShowScrollButton(!isNearBottom);
  }, []);

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
    setIsAtBottom(true);
    setShowScrollButton(false);
  };

  // 注意：新的历史记录 API 不支持分页，所以不需要 handleLoadMore

  // 渲染消息项
  const renderMessage = ({ item, index }: { item: Message | string; index: number }) => {
    // 问候气泡
    if (item === 'greeting' && greetingMessage) {
      return <GreetingBubble message={greetingMessage} />;
    }

    // 完整分割线（位于最后一条历史消息下方30px）
    if (item === 'historyDivider') {
      return (
        <View style={styles.historyDividerContainer}>
          <View style={styles.historyDivider} />
        </View>
      );
    }

    // 普通消息
    if (typeof item === 'object' && 'message_id' in item) {
      const msg = item as Message;
      return (
        <MessageBubble
          message={msg}
          onRetry={
            msg.status === 'failed' && msg.role === 'user'
              ? () => {
                  // 如果是图片消息，重新上传图片
                  if (msg.localImageUri || msg.imageUrl) {
                    retryImageUpload(msg);
                  } else {
                    // 文本消息重试
                    handleSendMessage(msg.content);
                  }
                }
              : undefined
          }
        />
      );
    }

    return null;
  };

  // 准备列表数据
  const sessionId = currentSessionId || 'temp';
  const sessionMessages = messages[sessionId] || [];
  const listData: (Message | string)[] = [];

  // 问候气泡在最上面（最先显示）
  if (greetingMessage) {
    listData.push('greeting');
  }

  // 添加消息（按时间排序，最早的在最上面）
  const sortedMessages = [...sessionMessages].sort((a, b) => {
    const timeA = a.server_ts || a.client_ts;
    const timeB = b.server_ts || b.client_ts;
    return timeA - timeB; // 时间小的在前（从上到下）
  });
  
  // 如果是历史进入，在最后一条历史消息后添加完整分割线
  if (isFromHistory && historyMessageCount > 0) {
    const historyMessages = sortedMessages.slice(0, historyMessageCount);
    const newMessages = sortedMessages.slice(historyMessageCount);
    
    // 添加历史消息
    listData.push(...historyMessages);
    
    // 如果有历史消息，在最后一条历史消息后添加完整分割线
    if (historyMessages.length > 0) {
      listData.push('historyDivider');
    }
    
    // 添加新消息
    listData.push(...newMessages);
  } else {
    // 非历史进入，直接添加所有消息
    listData.push(...sortedMessages);
  }

  // 如果有正在流式接收的消息，且消息内容为空，显示打字指示器
  // 或者在等待AI回复时（inputDisabled为true）也显示
  const showTyping = (() => {
    // 如果有 streamingMessageId，检查消息是否存在或为空
    if (streamingMessageId) {
      const sessionId = currentSessionId || 'temp';
      const sessionMessages = messages[sessionId] || [];
      const streamingMessage = sessionMessages.find(
        (m) => m.message_id === streamingMessageId
      );
      // 只有当消息不存在或内容为空时才显示打字指示器
      return !streamingMessage || streamingMessage.content.trim().length === 0;
    }
    // 如果 inputDisabled 为 true，说明正在等待回复，也应该显示打字指示器
    return inputDisabled;
  })();

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
        className="flex-1"
      >
        <SafeAreaView className="flex-1" edges={['top']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            {/* 顶部导航栏 */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: 'transparent',
              }}
            >
              <TouchableOpacity
                onPress={() => router.push('/(chat)/history')}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={require('@/assets/expand.png')}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={() => {
                  router.push('/(customize)/customize');
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Agbalumo',
                    fontWeight: '400',
                    fontSize: 20,
                    lineHeight: 20,
                    letterSpacing: 0,
                    color: '#FFFFFF',
                    textAlign: 'center',
                  }}
                >
                  {nestName}
                </Text>
                <Text style={{ fontSize: 10, color: '#D9D9D9', marginTop: 2 }}>
                  {aiRelationship}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  router.push('/(settings)/settings');
                }}
              >
                <Image
                  source={require('@/assets/settings.png')}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            {/* 消息列表 */}
            <FlatList
              ref={flatListRef}
              data={listData}
              renderItem={renderMessage}
              keyExtractor={(item, index) => {
                if (typeof item === 'string') {
                  return item + index;
                }
                return item.message_id;
              }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              inverted={false}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
              }}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                paddingBottom: 8,
              }}
              ListFooterComponent={
                showTyping ? (
                  <View style={{ marginTop: 8 }}>
                    <TypingIndicator />
                  </View>
                ) : null
              }
            />

            {/* 滚动到底部按钮 */}
            <ScrollToBottomButton
              visible={showScrollButton}
              onPress={scrollToBottom}
            />

            {/* 输入框 */}
            <View style={{ paddingBottom: bottom }}>
              <ChatInput
                onSend={handleSendMessage}
                disabled={inputDisabled}
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
      <ErrorModal
        visible={showErrorModal}
        message={error || ''}
        onClose={() => setShowErrorModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  historyDividerContainer: {
    marginTop: 30, // 位于最后一条历史消息下方30px
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  historyDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    // 分割线宽度从距离左边16到距离右边16（contentContainerStyle 已有 paddingHorizontal: 16）
  },
});
