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

## Installation

```bash
# Clone the repository
git clone https://github.com/vaibhavshukla06/goalstake-app.git
cd goalstake-app

# Install dependencies
npm install

# Start the development server
npm start
```

## Project Structure

```
app/
├── (tabs)           # Tab-based navigation screens
├── challenge/       # Challenge-specific screens
├── health/          # Health integration screens
├── components/      # Reusable UI components
├── constants/       # App constants and theme
├── services/        # API services
├── store/           # State management
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Progress

This project is under active development. Current progress includes:
- Basic navigation and UI structure
- User profile functionality
- Challenge viewing and participation
- Health metrics tracking
- Leaderboard and social feed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 