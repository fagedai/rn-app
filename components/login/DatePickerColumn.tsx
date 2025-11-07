import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const ITEM_HEIGHT = 80;

interface DatePickerColumnProps {
  data: number[];
  selectedValue: number;
  setValue: (value: number) => void;
  scrollRef: React.RefObject<ScrollView | null>;
  suffix: string;
  roundedClass?: string;
  hideLeftBorder?: boolean;
  hideRightBorder?: boolean;
  onScroll: (event: any, data: number[], setValue: (value: number) => void) => void;
}

export const DatePickerColumn: React.FC<DatePickerColumnProps> = ({
  data,
  selectedValue,
  setValue,
  scrollRef,
  suffix,
  roundedClass = '',
  hideLeftBorder = false,
  hideRightBorder = false,
  onScroll,
}) => {
  return (
    <View
      className={`flex-1 relative overflow-hidden ${roundedClass}`}
      style={{ height: ITEM_HEIGHT * 5 }}
    >
      {/* 中间选中指示器背景（灰色圆框） */}
      <View
        className={`absolute left-0 right-0 z-0 border border-white/30 bg-white/10 ${roundedClass} ${hideLeftBorder ? 'border-l-0' : ''} ${hideRightBorder ? 'border-r-0' : ''}`}
        style={{
          top: ITEM_HEIGHT * 2,
          height: ITEM_HEIGHT,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.3)',
          backgroundColor: 'rgba(128,128,128,0.3)',
          borderLeftWidth: hideLeftBorder ? 0 : 1,
          borderRightWidth: hideRightBorder ? 0 : 1,
        }}
      />

      {/* 可滚动的选项列表 */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => onScroll(e, data, setValue)}
        onScroll={(e) => onScroll(e, data, setValue)}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
      >
        {data.map((item) => {
          const isSelected = item === selectedValue;
          return (
            <View
              key={item}
              style={{
                height: ITEM_HEIGHT,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                className={isSelected ? 'text-white font-bold' : 'text-white/50'}
                style={{
                  fontSize: isSelected ? 18 : 14,
                }}
              >
                {item}
                {suffix}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

