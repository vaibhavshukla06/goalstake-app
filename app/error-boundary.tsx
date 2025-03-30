import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { colors } from '@/constants/colors';

export function ErrorBoundary({ children }) {
  return children;
}

export default function ErrorScreen({ error }: { error: Error }) {
  const router = useRouter();
  const [errorDetails, setErrorDetails] = React.useState<string>('');
  const [showDetails, setShowDetails] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Format error details
    const details = `
Error: ${error.message}
Stack: ${error.stack || 'No stack trace available'}
`;
    setErrorDetails(details);
  }, [error]);

  const resetApp = () => {
    // In a real app, you might want to clear some state or caches here
    router.replace('/');
  };

  const goHome = () => {
    router.replace('/');
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ title: 'Something went wrong' }} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <AlertTriangle size={80} color={colors.error} />
        </View>
        
        <Text style={styles.title}>Oops! Something went wrong</Text>
        
        <Text style={styles.message}>
          We encountered an unexpected error. Don't worry, your data is safe.
        </Text>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>{error.message}</Text>
        </View>
        
        <Button 
          title="Try Again" 
          onPress={resetApp}
          icon={<RefreshCcw size={18} color={colors.background} />}
          style={styles.button}
        />
        
        <Button 
          title="Go to Home" 
          onPress={goHome}
          variant="secondary"
          icon={<Home size={18} color={colors.secondary} />}
          style={styles.button}
        />
        
        {Platform.OS !== 'web' && (
          <Button 
            title={showDetails ? "Hide Technical Details" : "Show Technical Details"} 
            onPress={toggleDetails}
            variant="outline"
            style={styles.button}
          />
        )}
        
        {showDetails && (
          <ScrollView style={styles.detailsContainer}>
            <Text style={styles.detailsText}>{errorDetails}</Text>
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary || colors.text,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: `${colors.error}15`,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.error,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  button: {
    marginBottom: 12,
    width: '100%',
  },
  detailsContainer: {
    backgroundColor: colors.cardAlt || colors.card || '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginTop: 16,
    maxHeight: 200,
  },
  detailsText: {
    fontSize: 12,
    color: colors.textSecondary || colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});