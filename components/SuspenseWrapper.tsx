import React, { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import ErrorBoundary from './ErrorBoundary';

type SuspenseWrapperProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  withErrorBoundary?: boolean;
};

/**
 * A wrapper component that combines Suspense and ErrorBoundary
 * for data loading with proper error handling
 */
export function SuspenseWrapper({
  children,
  fallback,
  withErrorBoundary = true,
}: SuspenseWrapperProps) {
  // Default fallback is a centered activity indicator
  const defaultFallback = (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );

  const content = (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );

  // Optionally wrap with error boundary
  if (withErrorBoundary) {
    return <ErrorBoundary>{content}</ErrorBoundary>;
  }

  return content;
} 