// components/chat/EmojiTextInput.tsx
import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  ForwardedRef,
} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native';
import {
  parseShortcodes,
  checkShortcodeBeforeCursor,
  getEmojiPath,
  isPrivateUseChar,
} from '@/utils/emoji';
import { EmojiSvg } from './EmojiSvg';

interface EmojiTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  style?: any;
  multiline?: boolean;
  maxLength?: number;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  onContentSizeChange?: (e: any) => void;
  fontSize?: number;
  onSelectionChange?: (e: any) => void;
  rightPadding?: number;
}

export const EmojiTextInput = forwardRef<TextInput, EmojiTextInputProps>(
  (
    {
  value,
  onChangeText,
  placeholder,
      placeholderTextColor = 'rgba(255,255,255,0.5)',
  style,
      multiline = true,
  maxLength,
  editable = true,
  onFocus,
  onBlur,
  onSubmitEditing,
  onContentSizeChange,
  fontSize = 16,
  onSelectionChange,
  rightPadding = 48,
    },
    ref: ForwardedRef<TextInput>
  ) => {
  const inputRef = useRef<TextInput>(null);
  const displayScrollRef = useRef<ScrollView>(null);
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [containerWidth, setContainerWidth] = useState<number | null>(null);
    const [scrollY, setScrollY] = useState(0);

    const isUserInteractingWithHistory = useRef(false);
    let interactionTimer: NodeJS.Timeout;

    React.useImperativeHandle(ref, () => inputRef.current!);
  
  const segments = parseShortcodes(value);
    const emojiSize = fontSize * 1.25;
    const lineHeight = fontSize * 1.4;
  
    const handleLayout = (e: any) => {
      setContainerWidth(e.nativeEvent.layout.width);
    };

    const handleSelectionChange = (
      e: NativeSyntheticEvent<TextInputSelectionChangeEventData>
    ) => {
      const { selection } = e.nativeEvent;
      setSelection(selection);
    onSelectionChange?.(e);
    };

    const handleKeyPress = (e: any) => {
      if (e.nativeEvent.key === 'Backspace' && selection.start === selection.end) {
        const info = checkShortcodeBeforeCursor(value, selection.start);
        if (info) {
          e.preventDefault();
          onChangeText(value.slice(0, info.start) + value.slice(info.end));
      setTimeout(() => {
            inputRef.current?.setNativeProps({
              selection: { start: info.start, end: info.start },
            });
      }, 0);
    }
      }
    };
  
    // 用户开始手动交互（滑动或点击旧内容）
    const handleScrollBeginDrag = () => {
      isUserInteractingWithHistory.current = true;
      clearTimeout(interactionTimer);
    };

    const handleTouchStart = () => {
      isUserInteractingWithHistory.current = true;
      clearTimeout(interactionTimer);
    };

    // 用户结束交互后 1.5 秒才恢复"自动贴底"行为
    const handleScrollEndDrag = () => {
      interactionTimer = setTimeout(() => {
        isUserInteractingWithHistory.current = false;
      }, 1500);
  };
  
    const handleDisplayPress = (e: any) => {
      if (!inputRef.current || !multiline || containerWidth === null) return;

      isUserInteractingWithHistory.current = true;
      clearTimeout(interactionTimer);

      const { locationX, locationY } = e.nativeEvent;
      const x = locationX;
      const y = locationY + scrollY;

      const charsPerLine = Math.floor((containerWidth - rightPadding) / (fontSize * 0.6));
      const lineIndex = Math.floor(y / lineHeight);
      const charInLine = Math.floor(x / (fontSize * 0.6));

      let position = Math.max(0, lineIndex * charsPerLine + charInLine);
      position = Math.min(position, value.length);

      // 微调：跳过私有使用区字符（表情占位符）
      let finalPos = position;
      while (finalPos < value.length && isPrivateUseChar(value[finalPos])) finalPos++;
      while (finalPos > 0 && isPrivateUseChar(value[finalPos - 1])) finalPos--;

        inputRef.current.setNativeProps({
        selection: { start: finalPos, end: finalPos },
        });
      setSelection({ start: finalPos, end: finalPos });
      inputRef.current.focus();
      
      // 主动滚动让光标行可见（偏上一点，更自然）
      if (displayScrollRef.current) {
        const targetY = Math.max(0, lineIndex * lineHeight - lineHeight * 1.5);
        displayScrollRef.current.scrollTo({ y: targetY, animated: true });
      }

      // 1.5 秒后允许自动贴底
      interactionTimer = setTimeout(() => {
        isUserInteractingWithHistory.current = false;
      }, 1500);
    };
              
    // 监听滚动偏移（用于点击计算）
    const handleScroll = (e: any) => {
      setScrollY(e.nativeEvent.contentOffset.y);
    };

    // 核心：新内容输入时自动贴底显示最新行
    useEffect(() => {
      if (!multiline || !displayScrollRef.current) return;

      if (!isUserInteractingWithHistory.current) {
        requestAnimationFrame(() => {
          displayScrollRef.current?.scrollToEnd({ animated: false });
        });
      }
    }, [value, multiline]);

    return (
      <View style={[styles.container, style]} onLayout={handleLayout}>
        {/* 隐藏输入层 */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onKeyPress={handleKeyPress}
          onSelectionChange={handleSelectionChange}
          onContentSizeChange={onContentSizeChange}
          style={[
            styles.hiddenInput,
            { fontSize, lineHeight, color: 'transparent' },
          ]}
        placeholder=""
        multiline={multiline}
        maxLength={maxLength}
        editable={editable}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmitEditing}
          textAlignVertical="top"
        underlineColorAndroid="transparent"
          scrollEnabled={multiline}
      />

        {/* 显示层 */}
      {value ? (
        <ScrollView
          ref={displayScrollRef}
            style={styles.displayScroll}
            contentContainerStyle={{ paddingRight: rightPadding }}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onTouchStart={handleTouchStart}
            onTouchEnd={handleDisplayPress}
            key={value.length}
            pointerEvents="box-none"
            scrollEnabled={false}
        >
            <View pointerEvents="none">
              <Text style={[styles.displayText, { fontSize, lineHeight, color: '#FFFFFF' }]}>
                {segments.map((seg, i) => {
                  if (seg.type === 'emoji' && seg.shortcode) {
                    const filename = getEmojiPath(seg.shortcode);
                    return (
                      <Text
                        key={i}
                        style={{ width: emojiSize, height: lineHeight, position: 'relative', color: '#FFFFFF' }}
                      >
                        {seg.placeholder || seg.content}
                        {filename && (
                          <View style={styles.inlineEmoji}>
                            <EmojiSvg filename={filename} size={emojiSize} />
                          </View>
                        )}
                      </Text>
                    );
                  }
                  return <Text key={i} style={{ color: '#FFFFFF' }}>{seg.content}</Text>;
                })}
              </Text>
            </View>
        </ScrollView>
      ) : (
          <Text style={[styles.placeholder, { fontSize, color: placeholderTextColor }]}>
          {placeholder}
        </Text>
      )}
    </View>
  );
  }
);

const styles = StyleSheet.create({
  container: { position: 'relative', flex: 1 },
  hiddenInput: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    zIndex: 3, // 输入层在最上层，接收触摸事件
    backgroundColor: 'transparent',
    color: 'transparent',
  },
  displayScroll: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    zIndex: 2, // 显示层在中间，显示内容
    backgroundColor: 'transparent',
  },
  displayText: {
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  inlineEmoji: {
    position: 'absolute',
    left: 0, top: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    position: 'absolute',
    left: 0,
    top: 12,
    zIndex: 0,
  },
});

EmojiTextInput.displayName = 'EmojiTextInput';