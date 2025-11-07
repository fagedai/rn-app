import React from 'react';
import { View, Text } from 'react-native';

interface PlanTitleProps {
  hasSelectedPlan: boolean;
}

export const PlanTitle: React.FC<PlanTitleProps> = ({ hasSelectedPlan }) => {
  return (
    <View className={`items-center pt-4 pb-2 mb-4 ${!hasSelectedPlan ? 'mt-2' : 'mt-12'}`}>
      <Text className="text-gray-400 text-sm overflow-hidden">
        AI Creator
      </Text>
      <Text className="text-white text-4xl font-bold">NEST</Text>
    </View>
  );
};

