import { registerRootComponent } from 'expo';
import Constants from 'expo-constants';

let EntryPoint;

// Based on environment variable, load either Storybook or the main app
if (Constants.expoConfig?.extra?.useStorybook) {
  // Import Storybook
  EntryPoint = require('./.storybook').default;
} else {
  // Import the regular app
  EntryPoint = require('./expo-router/entry');
}

registerRootComponent(EntryPoint); 