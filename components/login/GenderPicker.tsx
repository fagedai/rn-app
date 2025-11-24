import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ITEM_HEIGHT = 50;
const ITEM_SPACING = 25; // 每个项之间的距离

interface GenderPickerProps<T extends string = string> {
  genders: readonly T[];
  selectedGender: T;
  onGenderChange: (gender: T) => void;
  scrollRef: React.RefObject<ScrollView | null>;
}

export const GenderPicker = <T extends string = string>({
  genders,
  selectedGender,
  onGenderChange,
  scrollRef,
}: GenderPickerProps<T>) => {
  const itemTotalHeight = ITEM_HEIGHT + ITEM_SPACING;
  // 选中框位置：垂直居中，使用 onLayout 动态计算
  const [selectedIndicatorTop, setSelectedIndicatorTop] = React.useState(0);
  const containerRef = React.useRef<View>(null);

  // 初始滚动标记，避免重复滚动
  const hasInitialScrolled = React.useRef(false);

  React.useEffect(() => {
    // 使用 setTimeout 确保布局完成后再计算
    setTimeout(() => {
      containerRef.current?.measure((x, y, width, height) => {
        const top = (height - ITEM_HEIGHT) / 2;
        setSelectedIndicatorTop(top);
      });
    }, 100);
  }, []);

  // 当 selectedIndicatorTop 计算完成且未初始滚动时，自动滚动到选中项
  React.useEffect(() => {
    if (selectedIndicatorTop > 0 && !hasInitialScrolled.current && scrollRef.current) {
      const selectedIndex = genders.indexOf(selectedGender);
      if (selectedIndex >= 0) {
        hasInitialScrolled.current = true;
        // 增加延迟，确保 ScrollView 已经完全渲染
        setTimeout(() => {
          // 由于 contentContainerStyle 已经设置了 paddingTop: selectedIndicatorTop
          // 所以滚动偏移量直接使用 selectedIndex * itemTotalHeight 即可
          scrollRef.current?.scrollTo({
            y: selectedIndex * itemTotalHeight,
            animated: false,
          });
          // 滚动后，再次确认位置（防止第一次滚动失败）
          setTimeout(() => {
            scrollRef.current?.scrollTo({
              y: selectedIndex * itemTotalHeight,
              animated: false,
            });
          }, 100);
        }, 200);
      }
    }
  }, [selectedIndicatorTop, selectedGender, genders, itemTotalHeight, scrollRef]);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemTotalHeight);
    if (index >= 0 && index < genders.length) {
      onGenderChange(genders[index]);
    }
  };

  return (
    <View
      ref={containerRef}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        const top = (height - ITEM_HEIGHT) / 2;
        setSelectedIndicatorTop(top);
      }}
    >
      {/* 中间选中指示器背景（与name页面输入框一致的样式） */}
      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
        locations={[0, 0.5, 1]}
        style={{
          position: 'absolute',
          top: selectedIndicatorTop,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT,
          borderRadius: 100,
          padding: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: 100,
            backgroundColor: 'rgba(6, 6, 6, 0.25)',
          }}
        />
      </LinearGradient>

      {/* 可滚动的选项列表 */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemTotalHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={{
          paddingTop: selectedIndicatorTop,
          paddingBottom: selectedIndicatorTop,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
      >
        {genders.map((gender, index) => {
          const isSelected = selectedGender === gender;
          const isLastItem = index === genders.length - 1;
          return (
            <View
              key={gender}
              style={{
                height: ITEM_HEIGHT,
                marginBottom: isLastItem ? 0 : ITEM_SPACING,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                className={isSelected ? 'text-white font-bold' : 'text-white/50'}
                style={{
                  fontSize: isSelected ? 20 : 16,
                }}
              >
                {gender}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

