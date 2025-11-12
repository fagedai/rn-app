import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateStore } from '../../store/createStore';
import { Ionicons } from '@expo/vector-icons';

export default function TextEditor() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type: 'memory' | 'backgroundStory'; title: string }>();
  const { aiMemory, setAiMemory, aiBackgroundStory, setAiBackgroundStory } = useCreateStore();
  
  const [text, setText] = useState(
    params.type === 'memory' ? aiMemory : aiBackgroundStory
  );

  useEffect(() => {
    setText(params.type === 'memory' ? aiMemory : aiBackgroundStory);
  }, [params.type, aiMemory, aiBackgroundStory]);

  const handleSave = () => {
    if (params.type === 'memory') {
      setAiMemory(text);
    } else {
      setAiBackgroundStory(text);
    }
    router.back();
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6">
          {/* 标题栏 */}
          <View className="flex-row items-center justify-between mb-6 mt-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold flex-1 text-center">
              {params.title || '编辑'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text className="text-white text-base font-medium">保存</Text>
            </TouchableOpacity>
          </View>

          {/* 文本输入区域 */}
          <ScrollView className="flex-1">
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              className="text-white text-base leading-6"
              style={{
                minHeight: 300,
                textAlignVertical: 'top',
                color: 'white',
              }}
              placeholder="请输入内容..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

