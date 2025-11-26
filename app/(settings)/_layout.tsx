import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="settings" />
      <Stack.Screen name="edit-username" />
      <Stack.Screen name="edit-phone" />
      <Stack.Screen name="edit-gender" />
      <Stack.Screen name="edit-birthday" />
      <Stack.Screen name="edit-interests" />
      <Stack.Screen name="edit-user-background" options={{ headerShown: false }} />
    </Stack>
  );
}


