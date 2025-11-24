import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';

interface ProgressTextProps {
  progress: number;
}

export default function ProgressText({ progress }: ProgressTextProps) {
  const [textSize, setTextSize] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setTextSize({ width, height });
  };

  // 如果还没有测量到尺寸，使用估算值
  const translateX = textSize.width > 0 ? -textSize.width / 2 : -30;
  const translateY = textSize.height > 0 ? -textSize.height / 2 : -12;

  return (
    <View 
      style={[
        styles.container,
        {
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      <Text 
        style={styles.text}
        onLayout={handleLayout}
      >
        {Math.round(progress)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Agbalumo',
    fontWeight: '400',
    fontSize: 24,
    lineHeight: 24,
    letterSpacing: 0,
    color: '#FFFFFF',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

