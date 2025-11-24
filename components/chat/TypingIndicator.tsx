import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

/**
 * 打字指示器：三个光点依次跳起5px再落回
 * - 每个点跳动的完整周期：向上 0.4s + 向下 0.4s = 0.8s
 * - 三个点依次开始，间隔 0.267s（0.8s/3），形成连续的波浪效果
 */
export const TypingIndicator: React.FC = () => {
  const dot1 = React.useRef(new Animated.Value(0)).current;
  const dot2 = React.useRef(new Animated.Value(0)).current;
  const dot3 = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 动画参数
    const JUMP_HEIGHT = -5; // 跳起高度（像素）
    const JUMP_DURATION = 300; // 向上跳动时间（毫秒）
    const FALL_DURATION = 300; // 向下落回时间（毫秒）
    const TOTAL_CYCLE = JUMP_DURATION + FALL_DURATION; // 完整周期：600ms
    const DOT_INTERVAL = TOTAL_CYCLE / 3; // 每个点之间的间隔：200ms

    // 创建单个点的循环动画
    // 每个点的循环周期固定为 TOTAL_CYCLE * 3（1800ms）
    // 这样三个点在1800ms内各跳一次，依次开始，形成连续的波浪效果
    const createDotAnimation = (dot: Animated.Value, startDelay: number) => {
      // 单个点的跳动：向上跳 -> 向下落（耗时600ms）
      const jumpSequence = Animated.sequence([
        Animated.timing(dot, {
          toValue: JUMP_HEIGHT,
          duration: JUMP_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: FALL_DURATION,
          useNativeDriver: true,
        }),
      ]);

      // 循环结构：每个点的循环周期是 1800ms（3 * 600ms）
      // 序列：延迟 -> 跳动 -> 等待 -> 循环
      const cycleDuration = TOTAL_CYCLE * 3; // 1800ms
      return Animated.loop(
        Animated.sequence([
          // 初始延迟（第一次和后续循环都一样）
          Animated.delay(startDelay),
          // 执行跳动（耗时600ms）
          jumpSequence,
          // 等待到下一个1800ms周期的开始
          Animated.delay(cycleDuration - startDelay - TOTAL_CYCLE),
        ])
      );
    };

    // 创建三个点的动画，依次开始
    // 点1：0ms 开始，每1800ms循环
    // 点2：200ms 开始，每1800ms循环  
    // 点3：400ms 开始，每1800ms循环
    // 这样会形成：点1跳 -> 点2跳 -> 点3跳 -> 点1跳（循环）
    const animation1 = createDotAnimation(dot1, 0);
    const animation2 = createDotAnimation(dot2, DOT_INTERVAL);
    const animation3 = createDotAnimation(dot3, DOT_INTERVAL * 2);

    // 启动所有动画
    animation1.start();
    animation2.start();
    animation3.start();

    // 清理函数：停止所有动画并重置位置
    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            {
              transform: [{ translateY: dot1 }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              transform: [{ translateY: dot2 }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              transform: [{ translateY: dot3 }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 4,
  },
});

