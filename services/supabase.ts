import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from './environment';

// Get environment variables
const supabaseUrl = env.supabaseUrl;
const supabaseAnonKey = env.supabaseAnonKey;

// Custom storage implementation for React Native
const customStorage = {
  getItem: (key: string) => {
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    return AsyncStorage.removeItem(key);
  }
};

// Create the Supabase client with custom storage and automatic retries
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: async (url, options = {}) => {
      const MAX_RETRIES = 3;
      let retries = 0;
      
      while (retries < MAX_RETRIES) {
        try {
          const response = await fetch(url, options);
          if (response.ok || response.status === 404) {
            return response;
          }
          
          if (response.status >= 500) {
            // Server error, try again after a delay
            retries++;
            if (retries < MAX_RETRIES) {
              // Exponential backoff
              const delay = 1000 * Math.pow(2, retries);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          return response;
        } catch (error) {
          // Network error, try again
          retries++;
          if (retries < MAX_RETRIES) {
            const delay = 1000 * Math.pow(2, retries);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw error;
        }
      }
      
      // If we got here, we've exhausted our retries
      return fetch(url, options);
    }
  }
});

export { supabase }; 