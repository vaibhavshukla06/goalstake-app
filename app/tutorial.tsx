import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { colors } from '@/constants/colors';

export default function Tutorial() {
  const router = useRouter();
  
  // Add empty routing info to prevent undefined.match errors
  const routingInfo = { params: {}, pathname: '/tutorial' };
  
  React.useEffect(() => {
    // Navigate away from tutorial after a short delay
    setTimeout(() => {
      router.replace('/');
    }, 100);
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to GoalStake</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 20,
    color: colors.primary,
    marginBottom: 20,
  },
}); 