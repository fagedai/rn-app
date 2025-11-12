import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SelectionOption } from './SelectionOption';

export interface SelectionOptionConfig {
  label: string;
  value: string;
  backgroundImage?: any; // 可选的背景图片
}

export interface SelectionModuleProps {
  title: string;
  options: SelectionOptionConfig[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

export const SelectionModule: React.FC<SelectionModuleProps> = ({
  title,
  options,
  selectedValue,
  onSelect,
}) => {
  return (
    <>
      <View className="mb-14">
        <Text className="text-white text-xl text-center font-medium">
          {title}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {options.map((option, index) => (
          <SelectionOption
            key={index}
            option={option.label}
            isSelected={selectedValue === option.value}
            onPress={() => onSelect(option.value)}
            backgroundImage={option.backgroundImage}
          />
        ))}
      </ScrollView>
    </>
  );
};

