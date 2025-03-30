import 'dotenv/config';

// Get environment variables based on the APP_ENV
const getEnvVars = () => {
  // Default to development environment
  const env = process.env.APP_ENV || 'development';
  
  // We don't include the actual .env* files in the repo, but here's how we'd handle them
  if (env === 'production') {
    require('dotenv').config({ path: '.env.production' });
  } else if (env === 'staging') {
    require('dotenv').config({ path: '.env.staging' });
  } else {
    require('dotenv').config({ path: '.env.development' });
  }

  // Base config that applies to all environments
  const baseConfig = {
    name: "GoalStake",
    slug: "goalstake",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "goalstake",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: `com.goalstake.app.${env}`
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: `com.goalstake.app.${env}`
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      environment: env,
      useStorybook: process.env.EXPO_PUBLIC_USE_STORYBOOK === 'true',
      eas: {
        projectId: "your-eas-project-id",
      },
    },
    updates: {
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/your-eas-project-id"
    },
    assetBundlePatterns: [
      "**/*"
    ],
  };

  // Environment-specific config
  if (env === 'production') {
    return {
      ...baseConfig,
      name: "GoalStake",
      android: {
        ...baseConfig.android,
        package: "com.goalstake.app"
      },
      ios: {
        ...baseConfig.ios,
        bundleIdentifier: "com.goalstake.app"
      }
    };
  } else if (env === 'staging') {
    return {
      ...baseConfig,
      name: "GoalStake (Staging)",
      android: {
        ...baseConfig.android,
        package: "com.goalstake.app.staging"
      },
      ios: {
        ...baseConfig.ios,
        bundleIdentifier: "com.goalstake.app.staging"
      }
    };
  }

  // Default to development config
  return {
    ...baseConfig,
    name: "GoalStake (Dev)",
    android: {
      ...baseConfig.android,
      package: "com.goalstake.app.dev"
    },
    ios: {
      ...baseConfig.ios,
      bundleIdentifier: "com.goalstake.app.dev"
    }
  };
};

export default getEnvVars(); 