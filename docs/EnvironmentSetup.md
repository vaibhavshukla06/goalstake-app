# Environment Setup Guide for GoalStake

This guide explains how to work with different environments (development, staging, production) in the GoalStake app.

## Environment Overview

GoalStake uses a multi-environment architecture to separate development, staging, and production environments:

- **Development**: Used for local development and testing. Points to the development Supabase project.
- **Staging**: Used for testing before production deployment. Points to the staging Supabase project.
- **Production**: The live app environment. Points to the production Supabase project.

## Environment Files

The app uses different `.env` files for each environment:

- `.env.development` - Development environment variables
- `.env.staging` - Staging environment variables
- `.env.production` - Production environment variables

### Required Environment Variables

Each environment file must contain:

```
NODE_ENV=development|staging|production
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=https://your-project-id.supabase.co
```

## Switching Environments

### Running the App

Use these npm scripts to start the app in different environments:

```bash
# Development
npm run start:dev

# Staging
npm run start:staging

# Production
npm run start:prod
```

### Building the App

Use these scripts to build for different environments:

```bash
# Android
npm run build:android:dev
npm run build:android:staging
npm run build:android:prod

# iOS
npm run build:ios:dev
npm run build:ios:staging
npm run build:ios:prod
```

## Working with Supabase

Each environment should have its own Supabase project:

1. **Development**: For local testing
2. **Staging**: For pre-production testing
3. **Production**: For the live app

### Setting Up Multiple Supabase Projects

1. Create separate Supabase projects for each environment
2. Update the corresponding `.env` files with the correct project URLs and keys
3. Run `npm run setup:env` to validate your environment setup

## Environment Variables in Code

Access environment variables in your code using the environment service:

```typescript
import { env, isDevelopment, isStaging, isProduction } from '@/services/environment';

// Access variables
const supabaseUrl = env.supabaseUrl;

// Check current environment
if (isDevelopment()) {
  console.log('Running in development mode');
}
```

## Environment Validation

To ensure your environments are set up correctly:

```bash
npm run validate:env
```

This will check that all your environment files exist and contain the required variables, and optionally test the Supabase connection for each environment.

## Best Practices

1. **Never commit sensitive keys**: Make sure your `.env.*` files are listed in `.gitignore`.
2. **Use environment checks**: Use `isDevelopment()`, `isStaging()`, and `isProduction()` to conditionally execute code based on the environment.
3. **Keep parity**: Ensure your database schema is synchronized across all environments. 