import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ITEM_HEIGHT = 50;

interface DatePickerColumnProps {
  data: number[];
  selectedValue: number;
  setValue: (value: number) => void;
  scrollRef: React.RefObject<ScrollView | null>;
  suffix: string;
  title?: string; // 列标题，显示在列表上方
  roundedClass?: string;
  hideLeftBorder?: boolean;
  hideRightBorder?: boolean;
  onScroll: (event: any, data: number[], setValue: (value: number) => void) => void;
  showBackground?: boolean;
}

export const DatePickerColumn: React.FC<DatePickerColumnProps> = ({
  data,
  selectedValue,
  setValue,
  scrollRef,
  suffix,
  title,
  roundedClass = '',
  hideLeftBorder = false,
  hideRightBorder = false,
  onScroll,
  showBackground = true,
}) => {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      {/* 列标题：显示在列表上方 */}
      {title && (
        <Text className="text-white text-base mb-2" style={{ fontSize: 16 }}>
          {title}
        </Text>
      )}
      <View
        style={{ 
          height: ITEM_HEIGHT * 5, 
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          ...(roundedClass === 'rounded-l-full' ? {
            borderTopLeftRadius: 25,
            borderBottomLeftRadius: 25,
          } : roundedClass === 'rounded-r-full' ? {
            borderTopRightRadius: 25,
            borderBottomRightRadius: 25,
          } : {}),
        }}
      >
        {/* 中间选中指示器背景（仅在独立使用时显示） */}
        {showBackground && (
          <LinearGradient
            colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
            locations={[0, 0.5, 1]}
            style={{
              position: 'absolute',
              top: ITEM_HEIGHT * 2,
              left: 0,
              right: 0,
              height: ITEM_HEIGHT,
              borderRadius: 22,
              padding: 1,
              zIndex: 0,
            }}
          >
            <View
              style={{
                flex: 1,
                borderRadius: 22,
                backgroundColor: 'rgba(6, 6, 6, 0.25)',
              }}
            />
          </LinearGradient>
        )}

        {/* 可滚动的选项列表 */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, zIndex: 1 }}
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
        {data && data.length > 0 ? (
          data.map((item) => {
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
                    color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  {String(item)}
                </Text>
              </View>
            );
          })
        ) : (
          <View style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF' }}>暂无数据</Text>
          </View>
        )}
        </ScrollView>
      </View>
    </View>
  );
};

