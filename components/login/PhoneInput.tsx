import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

interface PhoneInputProps {
  phone: string;
  code: string;
  onPhoneChange: (phone: string) => void;
  onCodeChange: (code: string) => void;
  onSendCode?: () => void;
  onResendCode?: () => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  phone,
  code,
  onPhoneChange,
  onCodeChange,
  onSendCode,
  onResendCode,
}) => {
  return (
    <>
      <TextInput
        className="w-full bg-white/8 rounded-full border border-white/20 text-base px-5 py-4 mb-4 text-white"
        placeholder="手机号"
        placeholderTextColor="#ccc"
        value={phone}
        onChangeText={onPhoneChange}
        keyboardType="phone-pad"
        selectionColor="#fff"
        autoCorrect={false}
        autoCapitalize="none"
      />
      <View className="w-full flex-row items-center mb-3">
        <TextInput
          className="flex-1 bg-white/8 rounded-full border border-white/20 text-base px-5 py-4 mr-2 text-white"
          placeholder="验证码"
          placeholderTextColor="#ccc"
          value={code}
          onChangeText={onCodeChange}
          keyboardType="number-pad"
          selectionColor="#fff"
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity className="bg-white/18 rounded-3xl px-4 py-2.5" onPress={onSendCode}>
          <Text className="text-white text-[15px] font-bold">发送</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onResendCode}>
        <Text className="text-[#A5B4FC] text-[13px] mb-10 text-center underline">
          未收到验证码？重新发送
        </Text>
      </TouchableOpacity>
    </>
  );
};

