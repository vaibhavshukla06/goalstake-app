import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function ErrorBoundary({ error }: { error: Error }) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.subtitle}>{error.message || 'An unexpected error occurred'}</Text>
      <Pressable 
        style={styles.button} 
        onPress={() => router.replace('/')}
      >
        <Text style={styles.buttonText}>Go to Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#5E72EB',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#6B7280',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#5E72EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 