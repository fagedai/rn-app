import React from 'react';
import { View } from 'react-native';

interface StepIndicatorProps {
  currentStep: number; // 1, 2, or 3
  totalSteps?: number;
  style?: object;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps = 3,
  style,
}) => {
  return (
    <View
      className="flex-row justify-center items-center"
      style={{ ...(style || {}) }}
    >
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        
        return (
          <React.Fragment key={index}>
            {isActive ? (
              <View
                className="mr-3"
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: '#fff',
                }}
              />
            ) : (
              <View
                className="rounded-full mr-3"
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

