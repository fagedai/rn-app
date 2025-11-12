import React, { useState } from 'react';
import { View, ImageBackground, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../store/userStore';
import { UserProfile } from '../components/settings/UserProfile';
import { PackageBanner } from '../components/settings/PackageBanner';
import { AccountSection } from '../components/settings/AccountSection';
import { SoftwareSettingsSection } from '../components/settings/SoftwareSettingsSection';
import { PersonalInfoSection } from '../components/settings/PersonalInfoSection';

export default function Settings() {
  const { userInfo } = useUserStore();
  const [backgroundMusic, setBackgroundMusic] = useState(false);
  const [robotSound, setRobotSound] = useState(true);

  const userName = userInfo.name || '小张';
  const userGender = userInfo.gender || '男';
  const wechatLinked = 'JoyceLIANG';
  const phoneLinked = userInfo.phone || null;
  const emailLinked = null;

  // 格式化生日显示
  const formatBirthday = () => {
    if (userInfo.birthday) {
      const { year, month, day } = userInfo.birthday;
      return `${year}年${month}月${day}日`;
    }
    return '';
  };

  const birthdayText = formatBirthday();

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '设置',
          headerTitleStyle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
          headerTitleAlign: 'center',
          headerLeft: () => <View />,
          headerRight: () => <View />,
          headerBackVisible: false,
        }}
      />
      <SafeAreaView className="flex-1" style={{ marginTop: 40 }}>
        {/* 固定区域：用户信息和套餐横幅 */}
        <View className="px-6 pt-4">
          <UserProfile userName={userName} userGender={userGender} />
          <PackageBanner />
        </View>

        {/* 可滚动区域：我的账户、软件设置、个人信息 */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <AccountSection
            userName={userName}
            wechatLinked={wechatLinked}
            phoneLinked={phoneLinked}
            emailLinked={emailLinked}
          />

          <SoftwareSettingsSection
            backgroundMusic={backgroundMusic}
            robotSound={robotSound}
            onBackgroundMusicChange={setBackgroundMusic}
            onRobotSoundChange={setRobotSound}
          />

          <PersonalInfoSection
            birthdayText={birthdayText}
            userGender={userGender}
          />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

