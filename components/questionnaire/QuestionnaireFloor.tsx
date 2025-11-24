import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeArea } from '@/hooks/useSafeArea';

interface QuestionnaireFloorProps {
  /**
   * Floor 内容（通常是按钮组件）
   */
  children: React.ReactNode;
}

/**
 * 问卷页面 Floor 模块包装组件
 * 用于将绝对定位的按钮组件转换为正常布局
 */
export const QuestionnaireFloor: React.FC<QuestionnaireFloorProps> = ({
  children,
}) => {
  const { bottom } = useSafeArea();

  return (
    <View style={[styles.container, { paddingBottom: bottom }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 20, // 按钮上方间距
  },
});

