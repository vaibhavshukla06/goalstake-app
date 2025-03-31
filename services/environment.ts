import Constants from 'expo-constants';

/**
 * Environment configuration for the app
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Environment variables interface
 */
export interface EnvironmentVariables {
  environment: Environment;
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiUrl: string;
  useStorybook: boolean;
}

/**
 * Get the current environment
 */
export const getEnvironment = (): Environment => {
  return (Constants.expoConfig?.extra?.environment as Environment) || 'development';
};

/**
 * Get environment variables
 */
export const getEnvironmentVariables = (): EnvironmentVariables => {
  return {
    environment: getEnvironment(),
    supabaseUrl: Constants.expoConfig?.extra?.supabaseUrl as string,
    supabaseAnonKey: Constants.expoConfig?.extra?.supabaseAnonKey as string,
    apiUrl: Constants.expoConfig?.extra?.apiUrl as string,
    useStorybook: Constants.expoConfig?.extra?.useStorybook as boolean,
  };
};

/**
 * Check if app is running in development environment
 */
export const isDevelopment = (): boolean => getEnvironment() === 'development';

/**
 * Check if app is running in staging environment
 */
export const isStaging = (): boolean => getEnvironment() === 'staging';

/**
 * Check if app is running in production environment
 */
export const isProduction = (): boolean => getEnvironment() === 'production';

// Export the environment variables as a singleton
export const env = getEnvironmentVariables(); 