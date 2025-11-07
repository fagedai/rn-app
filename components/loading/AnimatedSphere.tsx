import React, { useEffect } from 'react';
import { View } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const SPHERE_SIZE = 120;

export default function AnimatedSphere() {
  const sphereScale = useSharedValue(1);
  const sphereOpacity = useSharedValue(0.8);

  useEffect(() => {
    sphereScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    sphereOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const sphereStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: sphereScale.value }],
      opacity: sphereOpacity.value,
    };
  });

  return (
    <Animated.View style={sphereStyle}>
      <ExpoLinearGradient
        colors={['#9333ea', '#e879f9', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: SPHERE_SIZE,
          height: SPHERE_SIZE,
          borderRadius: SPHERE_SIZE / 2,
          shadowColor: '#9333ea',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <View
          style={{
            width: SPHERE_SIZE * 0.4,
            height: SPHERE_SIZE * 0.4,
            borderRadius: SPHERE_SIZE * 0.2,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            position: 'absolute',
            top: SPHERE_SIZE * 0.15,
            left: SPHERE_SIZE * 0.15,
          }}
        />
      </ExpoLinearGradient>
    </Animated.View>
  );
}

