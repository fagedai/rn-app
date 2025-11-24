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
  // 检查是否是等待授权文本
  const isWaitingText = phone === '等待授权获取本机号码';
  
  // 检查是否是电话号码（11位数字）或已经遮掩的格式（包含****）
  const isPhoneNumber = /^\d{11}$/.test(phone) || (phone.includes('****') && phone.length >= 11);
  
  if (isWaitingText) {
    // 等待授权文本：15px字体，不遮掩
    return (
      <View className="w-full items-center mb-4">
        <Text className="text-white" style={{ fontSize: 15, fontFamily: 'ABeeZee' }}>
          {phone}
        </Text>
      </View>
    );
  }
  
  // 电话号码：36px字体，遮掩处理
  const displayText = isPhoneNumber && /^\d{11}$/.test(phone) ? maskPhone(phone) : phone;
  return (
    <View className="w-full items-center mb-4">
      <Text className="text-white" style={{ fontSize: 36, fontFamily: 'ABeeZee', letterSpacing: 6 }}>
        {displayText}
      </Text>
    </View>
  );
};

