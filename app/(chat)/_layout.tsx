import { Stack } from 'expo-router';
import React from 'react';

export default function ChatLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="loading" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="history" />
    </Stack>
  );
}


