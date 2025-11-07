import React from 'react';
import { View, TextInput } from 'react-native';

interface NameInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const NameInput: React.FC<NameInputProps> = ({ value, onChangeText }) => {
  return (
    <View style={{ marginTop: -50 }}>
      <TextInput
        className="w-full bg-white/8 rounded-full border border-white/20 text-base px-5 py-4 text-white text-center"
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 30,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
          fontSize: 16,
          paddingHorizontal: 20,
          paddingVertical: 16,
          color: '#fff',
          textAlign: 'center',
        }}
        placeholder="请输入您的名字"
        placeholderTextColor="#ccc"
        value={value}
        onChangeText={onChangeText}
        selectionColor="#fff"
        autoCorrect={false}
      />
    </View>
  );
};

