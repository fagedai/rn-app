/**
 * 简化的文本输入框组件
 * 参考 react-native-chatUI 的实现方式
 * 使用普通的 TextInput，简化实现
 */
import React, {
  useRef,
  forwardRef,
  ForwardedRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native';

interface SimpleTextInputProps {
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

export const SimpleTextInput = forwardRef<TextInput, SimpleTextInputProps>(
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
    },
    ref: ForwardedRef<TextInput>
  ) => {
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => inputRef.current!);

    return (
      <View style={[styles.container, style]}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          style={[
            styles.input,
            { fontSize },
          ]}
          multiline={multiline}
          maxLength={maxLength}
          editable={editable}
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSubmitEditing}
          onContentSizeChange={onContentSizeChange}
          onSelectionChange={onSelectionChange}
          textAlignVertical="top"
          underlineColorAndroid="transparent"
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    padding: 0,
    textAlignVertical: 'top',
  },
});

SimpleTextInput.displayName = 'SimpleTextInput';

