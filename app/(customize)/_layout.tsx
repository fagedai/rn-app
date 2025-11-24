import { Stack } from 'expo-router';
import React from 'react';

export default function CustomizeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="customize" 
        options={{ headerShown: true, headerTransparent: true }}
      />
      <Stack.Screen name="text-editor" />
      <Stack.Screen name="voice" />
      <Stack.Screen name="memory" />
      <Stack.Screen name="memory-add" />
      <Stack.Screen name="memory-edit" />
      <Stack.Screen name="memory-edit-list" />
    </Stack>
  );
}

