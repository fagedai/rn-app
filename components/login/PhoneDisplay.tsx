import React from 'react';
import { View, Text } from 'react-native';

interface PhoneDisplayProps {
  phone: string;
}

function maskPhone(phone: string) {
  if (!phone || phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export const PhoneDisplay: React.FC<PhoneDisplayProps> = ({ phone }) => {
  return (
    <View className="w-full bg-white/10 rounded-[30px] border border-white/20 py-[18px] px-5 items-center mb-4">
      <Text className="text-white text-[20px] tracking-widest">{maskPhone(phone)}</Text>
    </View>
  );
};

