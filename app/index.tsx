import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Redirect } from 'expo-router';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#5E72EB" />
      <Text style={{ marginTop: 16, color: '#6B7280' }}>Loading...</Text>
      <Redirect href={'/(tabs)/index' as any} />
    </View>
  );
} 