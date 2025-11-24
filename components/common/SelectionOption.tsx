import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 根据屏幕尺寸计算间距（在小屏设备上减小间距）
const getResponsiveSpacing = (baseSpacing: number): number => {
  // 如果屏幕高度小于 800，减小间距（针对小屏真机）
  const scaleFactor = SCREEN_HEIGHT < 800 ? 0.7 : 1;
  return Math.round(baseSpacing * scaleFactor);
};

interface SelectionOptionProps {
  option: string;
  subtitle?: string; // 副标题（开场白）
  isSelected: boolean;
  onPress: () => void;
  backgroundImage?: any; // 可选的背景图片
  hasAnySelected?: boolean; // 是否有任何项被选中（用于experience页面）
  onInfoPress?: () => void; // 信息图标点击回调（可选）
  showInfoIcon?: boolean; // 是否显示信息图标（可选）
}

export const SelectionOption: React.FC<SelectionOptionProps> = ({
  option,
  subtitle,
  isSelected,
  onPress,
  backgroundImage,
  hasAnySelected = false,
  onInfoPress,
  showInfoIcon = false,
}) => {
  // 如果使用背景图片，使用新的尺寸和样式（298px宽，84px高，23px圆角，67%透明度）
  if (backgroundImage) {
    // 计算背景色透明度：
    // - 未选择时（没有任何项被选中）：#000000 46% 透明度
    // - 有其他项被选中时，未选中项：#000000 80% 透明度
    // - 选中项：保持原有样式
    const getBackgroundOpacity = () => {
      if (isSelected) {
        return 'rgba(255, 255, 255, 0.25)'; // 选中项保持原样
      }
      if (hasAnySelected) {
        return 'rgba(0, 0, 0, 0.8)'; // 有其他项被选中时，未选中项 80%
      }
      return 'rgba(0, 0, 0, 0.46)'; // 未选择时 46%
    };

    // 响应式间距
    const responsiveMarginTop = getResponsiveSpacing(5);
    const responsiveMarginBottom = getResponsiveSpacing(8);

    return (
      <View
        style={{
          marginTop: responsiveMarginTop,
          marginBottom: responsiveMarginBottom,
          alignSelf: 'center',
          position: 'relative',
        }}
      >
        {/* 光影效果 - 使用多层半透明 View 叠加，从选项边缘向外逐渐变淡 */}
        {isSelected && (
          <>
            {/* 最外层光影 - 最淡，最大 */}
            <View
              style={{
                position: 'absolute',
                width: Math.min(308, SCREEN_WIDTH - 40), // 298 + 5*2，响应式
                height: subtitle ? 110 : 94, // 有副标题时增加高度
                borderRadius: 25,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                top: -5,
                left: -5,
                zIndex: -1,
              }}
            />
            {/* 中层光影 */}
            <View
              style={{
                position: 'absolute',
                width: Math.min(304, SCREEN_WIDTH - 44), // 298 + 3*2，响应式
                height: subtitle ? 106 : 90, // 有副标题时增加高度
                borderRadius: 24,
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                top: -3,
                left: -3,
                zIndex: -1,
              }}
            />
            {/* 内层光影 - 最亮，最靠近选项 */}
            <View
              style={{
                position: 'absolute',
                width: Math.min(300, SCREEN_WIDTH - 46), // 298 + 1*2，响应式
                height: subtitle ? 102 : 86, // 有副标题时增加高度
                borderRadius: 23.5,
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                top: -1,
                left: -1,
                zIndex: -1,
              }}
            />
          </>
        )}
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={{
            width: Math.min(298, SCREEN_WIDTH - 48), // 响应式宽度：最小298px，但不超过屏幕宽度减去左右padding
            height: subtitle ? 100 : 84, // 有副标题时增加高度
            borderRadius: 23,
            overflow: 'hidden',
          }}
        >
          <ImageBackground
            source={backgroundImage}
            resizeMode="cover"
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 0.67, // 67% 透明度
            }}
          >
            <View
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: getBackgroundOpacity(),
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 16,
                position: 'relative',
              }}
            >
              {/* 信息图标 - 位于标题右侧 */}
              {showInfoIcon && onInfoPress && (
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                  onPress={(e) => {
                    e.stopPropagation();
                    onInfoPress();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="information-circle" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <Text 
                style={{ 
                  fontSize: 20,
                  color: '#FFFFFF',
                  fontWeight: '500',
                  textAlign: 'center',
                  marginBottom: subtitle ? 4 : 0,
                  paddingRight: showInfoIcon ? 32 : 0, // 为信息图标留出空间
                }}
              >
                {option}
              </Text>
              {subtitle && (
                <Text 
                  style={{ 
                    fontSize: 16,
                    color: 'rgba(255, 255, 255, 0.8)',
                    textAlign: 'center',
                  }}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  }

  // 使用玻璃+深色样式
  // 响应式间距
  const responsiveMarginBottom = getResponsiveSpacing(27);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        marginBottom: responsiveMarginBottom,
        width: Math.min(336, SCREEN_WIDTH - 48), // 响应式宽度：最小336px，但不超过屏幕宽度减去左右padding
        height: 55,
        alignSelf: 'center',
      }}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
        locations={[0, 0.5, 1]}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 100,
          padding: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: 100,
            backgroundColor: isSelected 
              ? 'rgba(255,255,255,0.25)'  // 选中后使用下一步按钮相同的背景
              : 'rgba(6, 6, 6, 0.25)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text 
            className="text-base font-medium"
            style={{ 
              color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
            }}
          >
            {option}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

