import React, { useState } from 'react';
import { View, Text, ImageBackground, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateStore } from '../../store/createStore';
import { GenderSelector } from '../../components/create/GenderSelector';
import { RelationshipSelector } from '../../components/create/RelationshipSelector';
import { TextPreviewCard } from '../../components/create/TextPreviewCard';
import { VoicePreviewCard } from '../../components/create/VoicePreviewCard';
import { NavigationButtons } from '../../components/common/NavigationButtons';
import { LoginHeader } from '../../components/common/LoginHeader';
import { Ionicons } from '@expo/vector-icons';

const RELATIONSHIP_OPTIONS = ['朋友', '伴侣', '兄弟姐妹', '导师'];

export default function CustomizeAI() {
  const router = useRouter();
  const {
    aiName,
    setAiName,
    aiGender,
    setAiGender,
    aiRelationship,
    setAiRelationship,
    aiMemory,
    aiBackgroundStory,
    aiVoice,
  } = useCreateStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(aiName);

  const handleNameEdit = () => {
    if (isEditingName) {
      setAiName(tempName);
    }
    setIsEditingName(!isEditingName);
  };

  const handleMemoryPress = () => {
    router.push({
      pathname: '/create/text-editor',
      params: { type: 'memory', title: 'TA的记忆' },
    });
  };

  const handleBackgroundStoryPress = () => {
    router.push({
      pathname: '/create/text-editor',
      params: { type: 'backgroundStory', title: 'TA的背景故事' },
    });
  };

  const handleVoicePress = () => {
    router.push('/create/voice');
  };

  const handleNext = () => {
    router.push('/create/loading');
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <LoginHeader title="定制AI设置" />
      <SafeAreaView className="flex-1 mt-[60px]">
        <View className="flex-1 px-6">

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* AI名称 */}
            <View className="mb-2 items-center">
              <View className="bg-white/20 rounded-full py-3 flex-row items-center relative" style={{ minWidth: 140, paddingLeft: 16, paddingRight: 0 }}>
                {/* 中间名字，绝对居中 */}
                <View className="absolute left-0 right-0 items-center">
                  {isEditingName ? (
                    <TextInput
                      value={tempName}
                      onChangeText={setTempName}
                      className="text-white text-2xl font-bold"
                      style={{ color: 'white', textAlign: 'center', minWidth: 80 }}
                      autoFocus
                      onSubmitEditing={handleNameEdit}
                    />
                  ) : (
                    <Text className="text-white text-2xl font-bold">{aiName}</Text>
                  )}
                </View>
                {/* 右侧编辑图标，位于右边框上 */}
                <View className="ml-auto" style={{ right: -10 }}>
                  <TouchableOpacity onPress={handleNameEdit}>
                    <Ionicons
                      name={isEditingName ? 'checkmark' : 'create-outline'}
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 性别选择 */}
            <View className="mb-6 items-center">
              <GenderSelector gender={aiGender} onGenderChange={setAiGender} />
            </View>

            {/* 关系选择 */}
            <View className="mb-6">
              <RelationshipSelector
                selected={aiRelationship}
                options={RELATIONSHIP_OPTIONS}
                onSelect={setAiRelationship}
              />
            </View>

            {/* TA的记忆 */}
            <TextPreviewCard
              title="TA的记忆"
              text={aiMemory}
              maxLines={3}
              onPress={handleMemoryPress}
            />

            {/* TA的背景故事 */}
            <TextPreviewCard
              title="TA的背景故事"
              text={aiBackgroundStory}
              maxLines={3}
              onPress={handleBackgroundStoryPress}
            />
            {/* 声音设置 */}
            <TouchableOpacity
              onPress={handleVoicePress}
              className="flex-row items-center justify-between mb-4"
            >
              <Text className="text-white text-lg font-medium">TA的声音设置</Text>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>
            {/* 声音预览 */}
            <View
              className="border border-white/30 rounded-25"
              style={{
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderBottomWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 25,
                padding: 15,
                backgroundColor: '#44396C',
              }}
            >
              <VoicePreviewCard currentVoice={aiVoice} />
            </View>
          </ScrollView>
          <NavigationButtons
            onBack={() => router.back()}
            onNext={handleNext}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

