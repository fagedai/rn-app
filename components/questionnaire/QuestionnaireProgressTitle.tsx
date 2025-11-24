import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from '@/components/login/ProgressBar';

interface QuestionnaireProgressTitleProps {
  /**
   * 标题文本
   */
  title: string;
  /**
   * 进度条进度 0-100（可选，如果提供则显示进度条）
   */
  progress?: number;
  /**
   * 是否显示进度条
   */
  showProgressBar?: boolean;
}

/**
 * 问卷进度条和标题组件
 * 用于显示进度条和标题文本
 */
export const QuestionnaireProgressTitle: React.FC<QuestionnaireProgressTitleProps> = ({
  title,
  progress = 0,
  showProgressBar = false,
}) => {
  return (
    <View style={styles.container}>
      {/* 进度条（如果显示） */}
      {showProgressBar && (
        <View style={styles.progressBarContainer}>
          <ProgressBar progress={progress} />
        </View>
      )}

      {/* 标题（位于进度条下方29px，距离第一个选项10px） */}
      <View style={[styles.titleContainer, !showProgressBar && styles.titleContainerWithoutProgress]}>
        <Text style={styles.titleText}>
          {title}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressBarContainer: {
    marginBottom: 29,
    marginTop: 26,
  },
  titleContainer: {
    marginBottom: 10, // 标题下方10px
  },
  titleContainerWithoutProgress: {
    marginBottom: 10, // 标题下方10px
  },
  titleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

