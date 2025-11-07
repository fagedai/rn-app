import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CIRCLE_SIZE = 180;
const CIRCLE_STROKE_WIDTH = 8;
const CIRCLE_RADIUS = (CIRCLE_SIZE - CIRCLE_STROKE_WIDTH) / 2;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

interface ProgressCircleProps {
  progressAnimated: Animated.SharedValue<number>;
}

export default function ProgressCircle({ progressAnimated }: ProgressCircleProps) {
  const animatedCircleProps = useAnimatedProps(() => {
    const progressPercent = progressAnimated.value;
    const offset = CIRCLE_CIRCUMFERENCE - (progressPercent / 100) * CIRCLE_CIRCUMFERENCE;
    
    return {
      strokeDashoffset: offset,
    };
  });

  return (
    <View
      style={{
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg
        width={CIRCLE_SIZE}
        height={CIRCLE_SIZE}
        style={{ position: 'absolute' }}
      >
        <Defs>
          <SvgLinearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#3b82f6" stopOpacity="1" />
            <Stop offset="0.5" stopColor="#9333ea" stopOpacity="1" />
            <Stop offset="1" stopColor="#e879f9" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={CIRCLE_RADIUS}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={CIRCLE_STROKE_WIDTH}
          fill="none"
        />
        <AnimatedCircle
          animatedProps={animatedCircleProps}
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={CIRCLE_RADIUS}
          stroke="url(#progressGradient)"
          strokeWidth={CIRCLE_STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${CIRCLE_CIRCUMFERENCE},${CIRCLE_CIRCUMFERENCE}`}
          strokeLinecap="round"
          rotation={-90}
          originX={CIRCLE_SIZE / 2}
          originY={CIRCLE_SIZE / 2}
        />
      </Svg>
    </View>
  );
}

