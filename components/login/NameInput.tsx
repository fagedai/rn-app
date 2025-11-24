import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, TextInput } from 'react-native';

interface NameInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const NameInput: React.FC<NameInputProps> = ({ value, onChangeText }) => {
  return (
    <View
      style={{
        marginTop: -50,
        alignSelf: 'center',
      }}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
        locations={[0, 0.5, 1]}
        style={{
          width: 298,
          height: 55,
          borderRadius: 22,
          padding: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: 22,
            backgroundColor: 'rgba(6, 6, 6, 0.25)',
            justifyContent: 'center',
          }}
        >
          <TextInput
            style={{
              width: '100%',
              height: '100%',
              fontSize: 16,
              color: '#FFFFFF',
              textAlign: 'center',
            }}
            placeholder="请输入您的名字"
            placeholderTextColor="#D9D8E9"
            value={value}
            onChangeText={onChangeText}
            selectionColor="#9EA9FF"
            autoCorrect={false}
          />
        </View>
      </LinearGradient>
      
    </View>
  );
};

