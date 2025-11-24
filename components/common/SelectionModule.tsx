import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SelectionOption } from './SelectionOption';

export interface SelectionOptionConfig {
  label: string;
  value: string;
  subtitle?: string; // 副标题（开场白）
  backgroundImage?: any; // 可选的背景图片
  onInfoPress?: () => void; // 信息图标点击回调（可选）
  showInfoIcon?: boolean; // 是否显示信息图标（可选）
}

export interface SelectionModuleProps {
  options: SelectionOptionConfig[];
  selectedValue: string | null | string[]; // 支持单选（string | null）或多选（string[]）
  onSelect: (value: string) => void;
  multiple?: boolean; // 是否多选模式
  hasAnySelected?: boolean; // 是否有任何项被选中
  scrollViewPaddingBottom?: number; // ScrollView 内容区域的底部 padding，用于控制列表结束位置
  isOptionSelected?: (value: string) => boolean; // 自定义选中判断函数（可选）
  shouldCenterContent?: boolean; // 是否垂直居中内容（已废弃，现在自动检测）
}

export const SelectionModule: React.FC<SelectionModuleProps> = ({
  options,
  selectedValue,
  onSelect,
  multiple = false,
  hasAnySelected,
  scrollViewPaddingBottom,
  isOptionSelected: customIsOptionSelected,
  shouldCenterContent = false, // 保留以兼容旧代码，但不再使用
}) => {
  // 容器高度和内容高度
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  // 判断选项是否选中（使用自定义函数或默认逻辑）
  const isOptionSelected = (value: string) => {
    if (customIsOptionSelected) {
      return customIsOptionSelected(value);
    }
    if (multiple && Array.isArray(selectedValue)) {
      return selectedValue.includes(value);
    }
    return selectedValue === value;
  };

  // 如果没有传入 hasAnySelected，自动计算
  const computedHasAnySelected = hasAnySelected !== undefined 
    ? hasAnySelected 
    : (multiple && Array.isArray(selectedValue) && selectedValue.length > 0) || (!multiple && selectedValue !== null);

  // 处理容器布局变化
  const handleContainerLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    setContainerHeight(height);
  }, []);

  // 处理内容大小变化
  const handleContentSizeChange = useCallback((width: number, height: number) => {
    setContentHeight(height);
  }, []);

  // 判断是否需要居中：内容高度 <= 容器高度
  const shouldCenter = containerHeight > 0 && contentHeight > 0 && contentHeight <= containerHeight;

  return (
    <View style={{ flex: 1 }} onLayout={handleContainerLayout}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={handleContentSizeChange}
        contentContainerStyle={{ 
          flexGrow: shouldCenter ? 1 : undefined,
          justifyContent: shouldCenter ? 'center' : undefined,
          paddingBottom: scrollViewPaddingBottom !== undefined ? scrollViewPaddingBottom : 20 
        }}
      >
        {options.map((option, index) => (
          <SelectionOption
            key={index}
            option={option.label}
            subtitle={option.subtitle}
            isSelected={isOptionSelected(option.value)}
            onPress={() => onSelect(option.value)}
            backgroundImage={option.backgroundImage}
            hasAnySelected={computedHasAnySelected}
            onInfoPress={option.onInfoPress}
            showInfoIcon={option.showInfoIcon}
          />
        ))}
      </ScrollView>
    </View>
  );
};

