import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeArea } from '@/hooks/useSafeArea';

interface QuestionnaireLayoutProps {
  /**
   * Header 模块内容（插槽）
   */
  header: React.ReactNode;
  /**
   * Content 模块内容（插槽）
   */
  content: React.ReactNode;
  /**
   * Floor 模块内容（插槽）
   */
  floor: React.ReactNode;
  /**
   * Header 高度（默认根据是否有 LoginHeader 自动计算）
   */
  headerHeight?: number;
  /**
   * Floor 高度（默认根据按钮类型自动计算）
   */
  floorHeight?: number;
}

/**
 * 问卷页面三模块布局组件
 * - header: 固定高度，标题内容用插槽
 * - content: flex: 1，从顶到底自由高度
 * - floor: 固定高度，固定在底部
 */
export const QuestionnaireLayout: React.FC<QuestionnaireLayoutProps> = ({
  header,
  content,
  floor,
  headerHeight,
  floorHeight,
}) => {
  return (
    <SafeAreaView className="flex-1" edges={['bottom']}>
      <View className="flex-1 px-6" style={styles.container}>
        {/* Header 模块：固定高度 */}
        {headerHeight ? (
          <View style={[styles.header, { height: headerHeight }]}>
            {header}
          </View>
        ) : (
          <View style={styles.header}>
            {header}
          </View>
        )}

        {/* Content 模块：flex: 1，填充剩余空间 */}
        <View style={styles.content}>
          {content}
        </View>

        {/* Floor 模块：固定高度，固定在底部 */}
        {floorHeight ? (
          <View style={[styles.floor, { height: floorHeight }]}>
            {floor}
          </View>
        ) : (
          <View style={styles.floor}>
            {floor}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  header: {
    // 默认高度会根据内容自动计算，或者通过 headerHeight prop 指定
    paddingTop: 10, // header 下方10px间距
  },
  content: {
    flex: 1,
  },
  floor: {
    // 高度通过计算或 prop 指定
    paddingTop: 20, // floor 上方20px间距
    paddingBottom: 57, // floor 下方20px间距
    justifyContent: 'flex-end',
  },
});

