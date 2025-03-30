# GoalStake App

A React Native/Expo mobile application for accountability challenges with financial stakes.

## Overview

GoalStake helps users achieve their goals by allowing them to create or join challenges with financial stakes. When users commit to a challenge, they put money on the line that they'll only get back if they complete the challenge successfully.

## Features

- **User Authentication**: Secure user registration and login system
- **Challenge Creation**: Create custom challenges with specific goals, timeframes, and stake amounts
- **Challenge Discovery**: Browse and join public challenges from other users
- **Social Feed**: View updates and progress from challenges you're participating in
- **Leaderboards**: See how you rank against other participants
- **Health Integration**: Connect with health tracking platforms for automatic verification
- **Profile Management**: Manage your profile, view achievements, and track progress

## Tech Stack

- React Native
- Expo SDK 52+
- TypeScript
- React Navigation v7
- Supabase (Authentication & Database)
- Zustand (State Management)
- NativeWind (Styling)
- React Query (Server state management)
- Jest & React Testing Library (Testing)
- Storybook (Component documentation)
- ESLint & Prettier (Code quality)
- Husky & lint-staged (Pre-commit hooks)
- GitHub Actions (CI/CD)

## Installation

```bash
# Clone the repository
git clone https://github.com/vaibhavshukla06/goalstake-app.git
cd goalstake-app

# Install dependencies
npm install

# Start the development server
npm start

# Run specific environments
npm run start:dev
npm run start:staging
npm run start:prod
```

## Project Structure

```
app/
├── (tabs)                # Tab-based navigation screens
├── challenge/            # Challenge-specific screens
├── health/               # Health integration screens
├── components/           # Reusable UI components
│   ├── atoms/            # Basic UI elements (Button, Input, etc.)
│   ├── molecules/        # Compound components (Cards, FormFields, etc.)
│   ├── organisms/        # Complex components (Lists, Forms, etc.)
│   └── templates/        # Page layout templates
├── constants/            # App constants and theme
├── services/             # API services
├── store/                # State management
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
│   ├── context/          # React context providers
│   └── hooks/            # Custom React hooks
└── .storybook/           # Storybook configuration
```

## Environment Setup

The application supports multiple environments:

- **Development**: `npm run start:dev`
- **Staging**: `npm run start:staging`
- **Production**: `npm run start:prod`

Environment variables are managed through `.env.[environment]` files and the `app.config.js` configuration.

## Storybook

Component documentation and development is available through Storybook:

```bash
# Run Storybook server
npm run storybook

# Run Storybook with Expo
npm run storybook:start
```

## Progress

This project is under active development. Current progress includes:
- Basic navigation and UI structure
- User profile functionality
- Challenge viewing and participation
- Health metrics tracking
- Leaderboard and social feed
- Improved architecture with atomic design
- Environment configuration
- CI/CD setup with GitHub Actions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 