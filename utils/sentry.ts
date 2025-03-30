import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

export const initSentry = (): void => {
  const environment = Constants.expoConfig?.extra?.environment || 'development';
  const dsn = Constants.expoConfig?.extra?.sentryDsn || '';
  
  if (!dsn) {
    console.warn('Sentry DSN not provided. Error tracking is disabled.');
    return;
  }
  
  Sentry.init({
    dsn,
    environment,
    enableAutoSessionTracking: true,
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // We recommend adjusting this value in production
    tracesSampleRate: environment === 'production' ? 0.2 : 1.0,
    // We don't directly use the routing instrumentation in the initialize phase
    // That's typically done when setting up the navigation container
  });
};

export const captureException = (error: Error, context?: Record<string, any>): void => {
  Sentry.captureException(error, { extra: context });
};

export const setUserContext = (userId: string | null, additionalData?: Record<string, any>): void => {
  if (userId) {
    Sentry.setUser({
      id: userId,
      ...additionalData,
    });
  } else {
    Sentry.setUser(null);
  }
};

export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: Sentry.SeverityLevel,
  data?: Record<string, any>
): void => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
};

export default {
  initSentry,
  captureException,
  setUserContext,
  addBreadcrumb,
}; 