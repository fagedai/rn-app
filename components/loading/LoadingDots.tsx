import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export default function LoadingDots() {
  const dot1Opacity = useSharedValue(0.8);
  const dot2Opacity = useSharedValue(0.8);
  const dot3Opacity = useSharedValue(0.8);

  useEffect(() => {
    dot1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    dot2Opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    dot3Opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
  }));
  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
  }));
  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
  }));

  return (
    <View className="flex-row mt-2 items-center">
      <Animated.View
        style={[
          {
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            marginHorizontal: 2,
          },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          {
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            marginHorizontal: 2,
          },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          {
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            marginHorizontal: 2,
          },
          dot3Style,
        ]}
      />
    </View>
  );
}

