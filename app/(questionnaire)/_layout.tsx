import { Stack } from 'expo-router';
import React from 'react';

export default function QuestionnaireLoginLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="name" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="birthday" />
      <Stack.Screen name="role" />
      <Stack.Screen name="nest-gender" />
      <Stack.Screen name="ai-expectation" />
      <Stack.Screen name="experience" />
      <Stack.Screen name="ai-role-type" />
    </Stack>
  );
}


