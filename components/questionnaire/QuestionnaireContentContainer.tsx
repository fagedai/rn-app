import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSafeArea } from '@/hooks/useSafeArea';

interface QuestionnaireContentContainerProps {
  children: React.ReactNode;
  /**
   * 标题类型：
   * - 'header': 使用 LoginHeader 的标题（name/gender/birthday 页面）
   * - 'text': 使用进度条下面的文本标题（其他问卷页面）
   */
  titleType: 'header' | 'text';
  /**
   * 标题高度（用于计算内容区域高度）
   * - header 类型：LoginHeader 高度（通常为 44px）
   * - text 类型：进度条高度 + 间距 + 文本高度（约 26 + 29 + 32 = 87px）
   */
  titleHeight?: number;
}

const HEADER_HEIGHT = 44; // LoginHeader 高度（iOS 标准）

const BUTTON_HEIGHT = 44; // 按钮高度
const BUTTON_BOTTOM_OFFSET = 94; // 按钮距离底部距离
const BUTTON_TOP_MARGIN = 20; // 按钮上方间距
const TITLE_BOTTOM_MARGIN = 10; // 标题下方间距

/**
 * 问卷中间内容容器组件
 * 高度计算：
 * - header 类型：从 LoginHeader 下方10px 到 按钮上方20px
 * - text 类型：从容器顶部（标题在容器内部，从标题下方10px开始）到 按钮上方20px
 */
export const QuestionnaireContentContainer: React.FC<QuestionnaireContentContainerProps> = ({
  children,
  titleType,
  titleHeight,
}) => {
  const { top: safeTop, bottom } = useSafeArea();
  const { height: screenHeight } = Dimensions.get('window');

  // 计算内容区域高度
  const containerStyle = useMemo(() => {
    let top: number;
    
    if (titleType === 'header') {
      // header 类型：LoginHeader 是绝对定位的，需要考虑安全区域顶部
      // LoginHeader 位置 = 安全区域顶部 + header 高度
      // 内容区域从 LoginHeader 下方10px开始
      const headerHeight = titleHeight !== undefined ? titleHeight : HEADER_HEIGHT;
      top = safeTop + headerHeight + TITLE_BOTTOM_MARGIN;
    } else {
      // text 类型：从容器顶部开始（标题在容器内部，会从标题下方10px开始显示内容）
      top = 0;
    }
    
    // 计算按钮顶部位置：
    // NavigationButtons 的按钮容器是绝对定位的，bottom = bottom + 94
    // 这里的 bottom 是安全区域高度，94 是按钮容器底部距离父容器底部的距离
    // 按钮容器底部距离屏幕底部 = bottom + 94
    // 按钮高度 = 44px
    // 按钮顶部距离屏幕底部 = bottom + 94 + 44
    // 按钮顶部距离屏幕顶部 = screenHeight - (bottom + 94 + 44)
    // 内容区域底部应该在按钮上方20px，所以 = screenHeight - (bottom + 94 + 44 + 20)
    const buttonTop = screenHeight - (bottom + BUTTON_BOTTOM_OFFSET + BUTTON_HEIGHT);
    const bottomOffset = buttonTop - BUTTON_TOP_MARGIN;
    
    // 内容区域高度
    const contentHeight = bottomOffset - top;

    return {
      position: 'absolute' as const,
      top,
      left: 24, // px-6 = 24px
      right: 24,
      height: Math.max(200, contentHeight), // 确保最小高度 200px
    };
  }, [titleType, titleHeight, screenHeight, safeTop, bottom]);

  return (
    <View style={[styles.container, containerStyle]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'red',
  },
});

