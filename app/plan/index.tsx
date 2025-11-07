import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { usePlanStore } from 'store/planStore';
import { PlanLogo } from '../../components/plan/PlanLogo';
import { PlanTitle } from '../../components/plan/PlanTitle';
import { PlanFeaturesCard } from '../../components/plan/PlanFeaturesCard';
import { PlanOption } from '../../components/plan/PlanOption';
import { PlanActionButton } from '../../components/plan/PlanActionButton';
import { PlanCancelButton } from '../../components/plan/PlanCancelButton';

export default function PlanSelection() {
  const { selectedPlan, setSelectedPlan } = usePlanStore();

  const handleProPlan = () => {
    setSelectedPlan('pro');
  };

  const handleBasicPlan = () => {
    setSelectedPlan('basic');
  };

  const handlePayment = () => {
    console.log('Navigate to payment');
  };

  const handleNext = () => {
    console.log('Navigate to next step');
  };

  const handleCancel = () => {
    setSelectedPlan(null);
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          <PlanLogo selectedPlan={selectedPlan} />
          <PlanTitle hasSelectedPlan={!!selectedPlan} />
          <PlanFeaturesCard selectedPlan={selectedPlan} />

          <Animated.View
            entering={FadeIn.delay(200).duration(600)}
            className={`w-full mb-6 ${!selectedPlan ? 'mt-40' : 'mt-4'}`}
          >
            <Text className="text-gray-400 text-base text-center mb-6">
              选择您的套餐
            </Text>

            <PlanOption
              title="Pro升级套餐"
              price="¥25.99/周"
              originalPrice="¥45.99/周"
              isSelected={selectedPlan === 'pro'}
              onPress={handleProPlan}
              delay={300}
              showBadge={true}
              badgeText="Save 90%"
            />

            <PlanOption
              title="基础套餐"
              price="免费"
              isSelected={selectedPlan === 'basic'}
              onPress={handleBasicPlan}
              delay={400}
            />
          </Animated.View>

          <PlanActionButton
            selectedPlan={selectedPlan}
            onPayment={handlePayment}
            onNext={handleNext}
          />

          <PlanCancelButton selectedPlan={selectedPlan} onCancel={handleCancel} />
        </View>

        <View className="pb-6">
          <Text className="text-gray-500 text-xs text-center">
            使用条款 | 隐私政策 | 购买
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
