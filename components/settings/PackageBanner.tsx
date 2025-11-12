import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export function PackageBanner() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/plan')}
      className="mb-6 rounded-2xl overflow-hidden"
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(147, 51, 234, 0.6)', 'rgba(79, 70, 229, 0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="px-4 py-4 flex-row items-center"
      >
        <View className="w-12 h-12 items-center justify-center mr-3">
          <Ionicons name="diamond" size={28} color="#a78bfa" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-white text-base font-medium">
              开通套餐,解锁更多权益
            </Text>
            <View style={{ marginLeft: 5 }}>
              <Text
                className="text-white border border-white/30 rounded-full px-3 py-1 text-center"
                style={{ fontSize: 8 }}
              >
                省90%
              </Text>
            </View>
          </View>
        </View>
        <View className="w-10 h-10 rounded-xl bg-purple-600 items-center justify-center">
          <Ionicons name="paper-plane" size={20} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

