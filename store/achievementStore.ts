import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement } from '@/types';

interface AchievementState {
  achievements: Achievement[];
  unlockedAchievements: string[];
  isLoading: boolean;
  
  // Actions
  fetchAchievements: () => Promise<void>;
  unlockAchievement: (achievementId: string) => void;
  isAchievementUnlocked: (achievementId: string) => boolean;
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      achievements: [],
      unlockedAchievements: [],
      isLoading: false,
      
      fetchAchievements: async () => {
        set({ isLoading: true });
        
        // In a real app, this would be an API call
        // For now, we'll use mock data if the store is empty
        if (get().achievements.length === 0) {
          set({ 
            achievements: MOCK_ACHIEVEMENTS,
            isLoading: false
          });
        } else {
          set({ isLoading: false });
        }
      },
      
      unlockAchievement: (achievementId) => {
        const isAlreadyUnlocked = get().unlockedAchievements.includes(achievementId);
        if (isAlreadyUnlocked) return;
        
        set((state) => {
          const achievementIndex = state.achievements.findIndex(a => a.id === achievementId);
          if (achievementIndex === -1) return state;
          
          const updatedAchievements = [...state.achievements];
          updatedAchievements[achievementIndex] = {
            ...updatedAchievements[achievementIndex],
            unlockedAt: new Date().toISOString()
          };
          
          return {
            achievements: updatedAchievements,
            unlockedAchievements: [...state.unlockedAchievements, achievementId]
          };
        });
      },
      
      isAchievementUnlocked: (achievementId) => {
        return get().unlockedAchievements.includes(achievementId);
      }
    }),
    {
      name: 'achievement-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        unlockedAchievements: state.unlockedAchievements
      }),
    }
  )
);

// Mock data for initial state
const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: "achievement-1",
    title: "First Steps",
    description: "Join your first challenge",
    icon: "award"
  },
  {
    id: "achievement-2",
    title: "Challenge Creator",
    description: "Create your first challenge",
    icon: "trophy"
  },
  {
    id: "achievement-3",
    title: "Goal Crusher",
    description: "Complete 5 challenges",
    icon: "target"
  },
  {
    id: "achievement-4",
    title: "Social Butterfly",
    description: "Participate in a challenge with 5+ people",
    icon: "users"
  },
  {
    id: "achievement-5",
    title: "Big Spender",
    description: "Stake 500+ coins in challenges",
    icon: "coins"
  },
  {
    id: "achievement-6",
    title: "Streak Master",
    description: "Maintain a 30-day streak in any challenge",
    icon: "flame"
  },
  {
    id: "achievement-7",
    title: "Diversified",
    description: "Complete challenges in 3 different categories",
    icon: "layers"
  }
];