import React, { useState } from 'react';
import { View, ImageBackground, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateStore } from '@/store/createStore';
import { LoginHeader } from '@/components/common/LoginHeader';
import { FilterButton } from '@/components/common/FilterButton';
import { VoiceListItem } from '@/components/create/VoiceListItem';
import { useSafeArea } from '@/hooks/useSafeArea';

interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  isVip: boolean;
}

const VOICE_OPTIONS: VoiceOption[] = [
  { id: '1', name: '清澈活泼女声-经典', gender: 'female', isVip: false },
  { id: '2', name: '温柔甜美女声', gender: 'female', isVip: false },
  { id: '3', name: '成熟知性女声', gender: 'female', isVip: true },
  { id: '4', name: '磁性低沉男声', gender: 'male', isVip: false },
  { id: '5', name: '阳光活力男声', gender: 'male', isVip: false },
  { id: '6', name: '成熟稳重男声', gender: 'male', isVip: true },
  { id: '7', name: '优雅气质女声', gender: 'female', isVip: true },
  { id: '8', name: '清新自然女声', gender: 'female', isVip: false },
];

type FilterType = 'all' | 'male' | 'female';

export default function VoiceSettings() {
  const { aiVoice, setAiVoice } = useCreateStore();
  const { getTopSpacing } = useSafeArea();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredVoices = VOICE_OPTIONS.filter((voice) => {
    if (filter === 'all') return true;
    return voice.gender === filter;
  }).sort((a, b) => {
    // 普通选项排在VIP选项前面
    if (a.isVip && !b.isVip) return 1;
    if (!a.isVip && b.isVip) return -1;
    return 0;
  });

  const handleSelectVoice = (voiceName: string) => {
    setAiVoice(voiceName);
  };

  return (
    <ImageBackground
      source={require('@/assets/customize_background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="声音设置" />
      <SafeAreaView className="flex-1" edges={['bottom']} style={{ paddingTop: getTopSpacing(44, 16) }}>
        <View className="flex-1 px-6">

          {/* 筛选按钮 */}
          <View className="flex-row mb-6 items-end">
            <FilterButton
              label="全部声音"
              isSelected={filter === 'all'}
              onPress={() => setFilter('all')}
              marginRight={12}
            />
            <FilterButton
              label="男声"
              isSelected={filter === 'male'}
              onPress={() => setFilter('male')}
              marginRight={12}
            />
            <FilterButton
              label="女声"
              isSelected={filter === 'female'}
              onPress={() => setFilter('female')}
            />
          </View>

          {/* 声音列表 */}
          <ScrollView
            className="flex-1"
            style={{
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 25,
              padding: 15,
              backgroundColor: 'transparent',
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {filteredVoices.map((voice) => (
              <VoiceListItem
                key={voice.id}
                voiceName={voice.name}
                isSelected={aiVoice === voice.name}
                isVip={voice.isVip}
                onSelect={() => handleSelectVoice(voice.name)}
              />
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

