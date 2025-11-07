import { Stack } from 'expo-router';
import React from 'react';

export default function LoginLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="name" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="birthday" />
      <Stack.Screen name="role" />
    </Stack>
  );
}
