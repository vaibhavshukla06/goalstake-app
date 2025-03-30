import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';

export default function ChallengeRedirect() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    // Redirect to the index page
    if (id) {
      router.replace(`/challenge/${id}/index`);
    } else {
      router.replace('/challenge');
    }
  }, [router, id]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Redirecting..." }} />
      <Text>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});