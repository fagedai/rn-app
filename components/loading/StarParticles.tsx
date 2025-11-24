import React, { useEffect, useRef, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const CONTAINER_SIZE = 200; // 容器大小
// 多个轨道半径，从内到外（删除最内层和两个最外层，确保距离百分比至少10px）
// 百分比文字24px，中心到边缘约12px，加上10px间距，最内层至少22px，设置为30px更安全
const ORBIT_RADII = [65, 80]; // 多个圆轨道（删除最内层50和最外层95、110）

interface StarParticleProps {
  angle: number; // 角度（弧度）
  radius: number; // 轨道半径
  delay: number; // 动画延迟
  size: number; // 星点大小
}

const StarParticle: React.FC<StarParticleProps> = React.memo(({ angle, radius, delay, size }) => {
  const opacity = useSharedValue(0);
  const animationStarted = useRef(false);
  
  // 使用 useMemo 固定动画持续时间，确保不会因为重新渲染而改变
  const { fadeInDuration, fadeOutDuration } = useMemo(() => ({
    fadeInDuration: 2000 + Math.random() * 500, // 2000-2500ms 从无到亮
    fadeOutDuration: 2000 + Math.random() * 500, // 2000-2500ms 从亮到消失
  }), []);

  useEffect(() => {
    // 确保动画只启动一次，完全独立于其他动画
    if (animationStarted.current) return;
    animationStarted.current = true;

    // 从无到亮再到消失的动画，以匀速闪烁
    // 使用固定的持续时间，确保动画速度恒定，不受百分比动画影响
    // 直接启动动画，React Native Reanimated 会自动在 UI 线程上运行
    // 使用线性 easing 确保匀速，完全独立于百分比动画
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }), // 初始状态：无
          withTiming(1, { duration: fadeInDuration, easing: Easing.linear }), // 从无到亮，匀速
          withTiming(0, { duration: fadeOutDuration, easing: Easing.linear }) // 从亮到消失，匀速
        ),
        -1,
        false
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // 计算星点位置（极坐标转直角坐标）
  const x = CONTAINER_SIZE / 2 + radius * Math.cos(angle);
  const y = CONTAINER_SIZE / 2 + radius * Math.sin(angle);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#FFFFFF',
        },
        animatedStyle,
      ]}
    />
  );
});

StarParticle.displayName = 'StarParticle';

const StarParticles = React.memo(() => {
  // 使用 useMemo 确保星点数组只在组件首次挂载时生成一次
  // 这样即使父组件重新渲染，星点数组也不会改变，动画保持稳定
  const stars = useMemo(() => {
    const starList: { angle: number; radius: number; delay: number; size: number; id: string }[] = [];
  const ANGLE_THRESHOLD = (10 * Math.PI) / 180; // 10度转换为弧度
  const SECTORS = 12; // 将圆分成12个扇形
  const SECTOR_ANGLE = (2 * Math.PI) / SECTORS; // 每个扇形的角度（30度）
  
  // 检查在指定角度范围内是否已有足够的点
    const getPointsInAngleRange = (targetAngle: number, existingStars: typeof starList): number => {
    return existingStars.filter(star => {
      // 计算角度差（考虑周期性）
      let angleDiff = Math.abs(star.angle - targetAngle);
      angleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff); // 取较小的角度差
      return angleDiff <= ANGLE_THRESHOLD;
    }).length;
  };
  
  // 为每个轨道生成星点
  ORBIT_RADII.forEach((radius, radiusIndex) => {
    // 创建12个扇形的索引数组
    const sectorIndices = Array.from({ length: SECTORS }, (_, i) => i);
    
    // 随机打乱扇形索引，然后选择前5个（每个轨道最多5个点）
    const shuffledSectors = sectorIndices.sort(() => Math.random() - 0.5);
    const selectedSectors = shuffledSectors.slice(0, 5);
    
    // 在每个选中的扇形内生成一个星点
    selectedSectors.forEach((sectorIndex) => {
      // 计算该扇形的起始角度
      const sectorStartAngle = sectorIndex * SECTOR_ANGLE;
      
      // 在该扇形内随机选择一个角度
      let angle = sectorStartAngle + Math.random() * SECTOR_ANGLE;
      
      // 检查10°范围内是否已有2个点
      let attempts = 0;
        while (getPointsInAngleRange(angle, starList) >= 2 && attempts < 10) {
        // 如果该角度范围内已有2个点，尝试在该扇形内选择另一个角度
        angle = sectorStartAngle + Math.random() * SECTOR_ANGLE;
        attempts++;
      }
      
      // 如果尝试10次后仍然无法放置，跳过这个扇形
      if (attempts < 10) {
        // 增加延迟间隔，让星点错开闪烁，避免同时闪烁造成快速闪烁的视觉效果
        const delay = radiusIndex * 300 + sectorIndex * 200 + Math.random() * 100;
        const size = 4 + Math.random() * 3; // 随机大小 4-7px
        
          starList.push({
          angle,
          radius,
          delay,
          size,
            id: `star-${radiusIndex}-${sectorIndex}-${Math.random()}`, // 唯一ID
        });
      }
    });
  });
    
    return starList;
  }, []); // 空依赖数组，确保只生成一次

  return (
    <View
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: CONTAINER_SIZE,
        height: CONTAINER_SIZE,
        transform: [{ translateX: -CONTAINER_SIZE / 2 }, { translateY: -CONTAINER_SIZE / 2 }],
      }}
    >
      {stars.map((star) => (
        <StarParticle
          key={star.id} // 使用唯一ID作为key，而不是index
          angle={star.angle}
          radius={star.radius}
          delay={star.delay}
          size={star.size}
        />
      ))}
    </View>
  );
});

StarParticles.displayName = 'StarParticles';

export default StarParticles;

