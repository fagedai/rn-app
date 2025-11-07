import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const ITEM_HEIGHT = 60;

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
  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < genders.length) {
      onGenderChange(genders[index]);
    }
  };

  return (
    <View
      style={{
        height: ITEM_HEIGHT * 5,
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 中间选中指示器背景（灰色圆框） */}
      <View
        style={{
          position: 'absolute',
          top: ITEM_HEIGHT * 2,
          left: 0,
          right: 0,
          height: ITEM_HEIGHT,
          backgroundColor: 'rgba(128,128,128,0.3)',
          borderRadius: 30,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.3)',
        }}
      />

      {/* 可滚动的选项列表 */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
      >
        {genders.map((gender) => {
          const isSelected = selectedGender === gender;
          return (
            <View
              key={gender}
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
                {gender}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

