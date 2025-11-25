import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
      <Text className="text-white text-base font-medium mb-4">与我的关系</Text>
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {options.map((option) => {
          const isSelected = selected === option;
          // 计算每个选项的宽度：屏幕宽度减去左右padding(48px = 24px * 2)和3个gap(24px = 8px * 3)，除以4个选项
          const optionWidth = (SCREEN_WIDTH - 48 - 24) / 4;
          return (
            <View key={option} style={{ marginBottom: 12, width: optionWidth }}>
              <TouchableOpacity
                onPress={() => onSelect(option)}
                style={{
                  borderRadius: 24,
                  overflow: 'hidden',
                  borderWidth: isSelected ? 1 : 1,
                  borderColor: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSelected ? (
                  <LinearGradient
                    colors={['#430047', '#4A4A4A']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text 
                      style={{
                        color: '#FFFFFF',
                        fontSize: 14,
                        textAlign: 'center',
                      }}
                    >
                      {option}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text 
                      style={{
                        color: '#FFFFFF',
                        fontSize: 14,
                        textAlign: 'center',
                      }}
                    >
                      {option}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

