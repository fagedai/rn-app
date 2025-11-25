import React from 'react';
import { View, Text } from 'react-native';
import { SwitchSettingItem } from '../common/SwitchSettingItem';
import { GlassContainer } from '../common/GlassContainer';

interface SoftwareSettingsSectionProps {
  backgroundMusic: boolean;
  robotSound: boolean;
  onBackgroundMusicChange: (value: boolean) => void;
  onRobotSoundChange: (value: boolean) => void;
}

export function SoftwareSettingsSection({
  backgroundMusic,
  robotSound,
  onBackgroundMusicChange,
  onRobotSoundChange,
}: SoftwareSettingsSectionProps) {
  return (
    <>
      <Text className="text-white text-base font-semibold mb-3 ml-4">软件设置</Text>
      <GlassContainer borderRadius={18} style={{ marginBottom: 24 }}>
        <View style={{ paddingVertical: 28, paddingHorizontal: 20 }}>
          <SwitchSettingItem
            label="背景音乐设置"
            value={backgroundMusic}
            onValueChange={onBackgroundMusicChange}
          />
          <View className="h-px bg-white/10" style={{ marginVertical: 18 }} />
          <SwitchSettingItem
            label="NEST对话声音"
            value={robotSound}
            onValueChange={onRobotSoundChange}
          />
        </View>
      </GlassContainer>
    </>
  );
}

