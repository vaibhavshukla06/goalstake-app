import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Simple stack navigator with minimal configuration
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="not-found" options={{ headerShown: true, title: 'Not Found' }} />
          <Stack.Screen name="error" options={{ headerShown: true, title: 'Error' }} />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}