import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 根据屏幕尺寸计算响应式字体大小
// 参考 SelectionOption 的实现，使用屏幕高度作为判断标准
const getResponsiveFontSize = (baseSize: number): number => {
  // 如果屏幕高度小于 800（小屏真机），减小字体
  // 模拟器通常高度较大（>800），真机可能较小
  if (SCREEN_HEIGHT < 800) {
    // 小屏真机，减小字体（约85%）
    return Math.max(Math.round(baseSize * 0.85), baseSize - 3);
  } else if (SCREEN_HEIGHT > 900) {
    // 大屏设备（如平板或大屏手机），略微增大
    return Math.min(Math.round(baseSize * 1.05), baseSize + 2);
  }
  // 中等屏幕（800-900），保持原大小
  return baseSize;
};

// 根据屏幕尺寸计算响应式内边距
const getResponsivePadding = (basePadding: number): number => {
  // 使用屏幕高度作为判断标准
  if (SCREEN_HEIGHT < 800) {
    // 小屏真机，减小内边距（约85%）
    return Math.max(Math.round(basePadding * 0.85), basePadding - 3);
  } else if (SCREEN_HEIGHT > 900) {
    // 大屏设备，略微增大
    return Math.round(basePadding * 1.05);
  }
  // 中等屏幕，保持原大小
  return basePadding;
};

interface InterestItemProps {
  id: string;
  label: string;
  icon?: string; // 图标emoji或icon name
  isSelected: boolean;
  onPress: () => void;
}

export const InterestItem: React.FC<InterestItemProps> = ({
  label,
  icon,
  isSelected,
  onPress,
}) => {
  // 计算响应式样式
  const responsiveIconSize = getResponsiveFontSize(14);
  const responsiveLabelSize = getResponsiveFontSize(16);
  const responsivePaddingH = getResponsivePadding(16);
  const responsivePaddingV = getResponsivePadding(18);
  const responsiveIconMargin = getResponsivePadding(5);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        <View
          style={[
            styles.inner,
            {
              paddingHorizontal: responsivePaddingH,
              paddingVertical: responsivePaddingV,
            },
            isSelected && styles.selectedInner,
          ]}
        >
          {icon && (
            <Text style={[styles.icon, { fontSize: responsiveIconSize, marginRight: responsiveIconMargin }]}>{icon}</Text>
          )}
          <Text style={[styles.label, { fontSize: responsiveLabelSize }, isSelected && styles.selectedLabel]}>
            {label}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    marginBottom: 12,
  },
  gradient: {
    borderRadius: 20,
    padding: 1,
  },
  inner: {
    borderRadius: 20,
    backgroundColor: 'rgba(6, 6, 6, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedInner: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  icon: {
    // fontSize 和 marginRight 在组件中动态设置
  },
  label: {
    // fontSize 在组件中动态设置
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  selectedLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

