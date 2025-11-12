import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Polygon } from 'react-native-svg';

interface RelationshipSelectorProps {
  selected: string;
  options: string[];
  onSelect: (relationship: string) => void;
}

export const RelationshipSelector: React.FC<RelationshipSelectorProps> = ({
  selected,
  options,
  onSelect,
}) => {
  return (
    <View>
      <Text className="text-white text-base font-medium mb-4">TA和我的关系</Text>
      <View className="flex-row flex-wrap">
        {options.map((option, index) => {
          const isSelected = selected === option;
          return (
            <View key={index} className="mr-3 mb-3 relative">
              <TouchableOpacity
                onPress={() => onSelect(option)}
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  borderWidth: isSelected ? 0 : 1,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={['#9333ea', '#ec4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 15,
                    }}
                  >
                    <Text className="text-white text-lg">{option}</Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={{
                      backgroundColor: 'transparent',
                      paddingHorizontal: 18,
                      paddingVertical: 15,
                      borderRadius: 20,
                    }}
                  >
                    <Text className="text-white text-lg">{option}</Text>
                  </View>
                )}
              </TouchableOpacity>
              {/* 向上箭头指示器 - 绝对定位 */}
              {isSelected && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    left: '50%',
                    marginLeft: -6,
                    width: 12,
                    height: 8,
                  }}
                >
                  <Svg width="12" height="8" viewBox="0 0 12 8">
                    <Polygon
                      points="6,0 0,8 12,8"
                      fill="#3b82f6"
                    />
                  </Svg>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

