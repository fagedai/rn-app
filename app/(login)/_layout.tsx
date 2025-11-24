import { Stack } from 'expo-router';
import React from 'react';

export default function LoginLayout() {
  return (
    <Stack initialRouteName="welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="phone" />
    </Stack>
  );
}
