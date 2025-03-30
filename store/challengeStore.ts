import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/utils/dateUtils';

export type ChallengeType = 'steps' | 'workout' | 'meditation' | 'reading' | 'custom';
export type VerificationType = 'automatic' | 'photo' | 'honor';

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  progressPercentage: number;
  hasCompleted: boolean;
  lastUpdated: string;
  dailyProgress?: Record<string, number>;
  rankChange?: number; // positive for improvement, negative for decline
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  verificationType: VerificationType;
  startDate: string;
  endDate: string;
  stake: number;
  goal: number;
  goalUnit: string;
  participants: Participant[];
  createdBy: string;
  isCompleted: boolean;
  completionResults?: {
    participants: Participant[];
    totalPot: number;
    rewardDistribution: Record<string, number>;
    completionDate: string;
  };
}

interface ChallengeState {
  challenges: Challenge[];
  userChallenges: string[]; // IDs of challenges the user is part of
  isLoading: boolean;
  fetchChallenges: () => Promise<void>;
  addChallenge: (challenge: Omit<Challenge, 'id'>) => string;
  updateChallenge: (id: string, updates: Partial<Challenge>) => void;
  deleteChallenge: (id: string) => void;
  joinChallenge: (challengeId: string, participant: Omit<Participant, 'progressPercentage' | 'hasCompleted' | 'lastUpdated'>) => void;
  updateProgress: (challengeId: string, participantId: string, progress: number) => void;
  completeChallenge: (challengeId: string, results: Challenge['completionResults']) => void;
  getParticipantProgress: (challengeId: string, participantId: string) => number;
  getUserChallenges: (userId: string) => Challenge[];
  getActiveChallenges: () => Challenge[];
  getCompletedChallenges: () => Challenge[];
  getUpcomingChallenges: () => Challenge[];
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      challenges: [],
      userChallenges: [],
      isLoading: false,
      
      fetchChallenges: async () => {
        set({ isLoading: true });
        try {
          // In a real app, this would be an API call
          // For now, we'll use mock data if no challenges exist
          const currentChallenges = get().challenges;
          
          if (currentChallenges.length === 0) {
            // Mock data for initial load
            const mockChallenges = generateMockChallenges();
            set({ 
              challenges: mockChallenges,
              // Assume the first user is part of the first two challenges
              userChallenges: [mockChallenges[0].id, mockChallenges[1].id]
            });
          }
        } catch (error) {
          console.error('Error fetching challenges:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      addChallenge: (challenge) => {
        const id = generateId();
        set((state) => ({
          challenges: [...state.challenges, { ...challenge, id, isCompleted: false }]
        }));
        return id;
      },
      
      updateChallenge: (id, updates) => {
        set((state) => ({
          challenges: state.challenges.map((challenge) => 
            challenge.id === id ? { ...challenge, ...updates } : challenge
          )
        }));
      },
      
      deleteChallenge: (id) => {
        set((state) => ({
          challenges: state.challenges.filter((challenge) => challenge.id !== id)
        }));
      },
      
      joinChallenge: (challengeId, participant) => {
        set((state) => ({
          challenges: state.challenges.map((challenge) => {
            if (challenge.id === challengeId) {
              // Check if participant already exists
              const exists = challenge.participants.some(p => p.id === participant.id);
              if (exists) return challenge;
              
              return {
                ...challenge,
                participants: [
                  ...challenge.participants,
                  { 
                    ...participant, 
                    progressPercentage: 0, 
                    hasCompleted: false, 
                    lastUpdated: new Date().toISOString(),
                    dailyProgress: {}
                  }
                ]
              };
            }
            return challenge;
          }),
          // Add to user challenges
          userChallenges: [...state.userChallenges, challengeId]
        }));
      },
      
      updateProgress: (challengeId, participantId, progress) => {
        const today = new Date().toISOString().split('T')[0];
        
        set((state) => ({
          challenges: state.challenges.map((challenge) => {
            if (challenge.id === challengeId) {
              const updatedParticipants = challenge.participants.map((participant) => {
                if (participant.id === participantId) {
                  // Calculate rank change (mock for now)
                  const rankChange = Math.random() > 0.5 ? 1 : -1;
                  
                  // Update daily progress
                  const dailyProgress = { 
                    ...participant.dailyProgress,
                    [today]: progress
                  };
                  
                  return {
                    ...participant,
                    progressPercentage: Math.min(progress, 100),
                    hasCompleted: progress >= 100,
                    lastUpdated: new Date().toISOString(),
                    dailyProgress,
                    rankChange
                  };
                }
                return participant;
              });
              
              return {
                ...challenge,
                participants: updatedParticipants
              };
            }
            return challenge;
          })
        }));
      },
      
      completeChallenge: (challengeId, results) => {
        set((state) => ({
          challenges: state.challenges.map((challenge) => {
            if (challenge.id === challengeId) {
              return {
                ...challenge,
                isCompleted: true,
                completionResults: results
              };
            }
            return challenge;
          })
        }));
      },
      
      getParticipantProgress: (challengeId, participantId) => {
        const challenge = get().challenges.find(c => c.id === challengeId);
        if (!challenge) return 0;
        
        const participant = challenge.participants.find(p => p.id === participantId);
        return participant?.progressPercentage || 0;
      },
      
      getUserChallenges: (userId) => {
        return get().challenges.filter(challenge => 
          challenge.participants.some(participant => participant.id === userId) ||
          challenge.createdBy === userId
        );
      },
      
      getActiveChallenges: () => {
        const now = new Date().toISOString();
        return get().challenges.filter(challenge => 
          !challenge.isCompleted &&
          new Date(challenge.startDate).toISOString() <= now &&
          new Date(challenge.endDate).toISOString() >= now
        );
      },
      
      getCompletedChallenges: () => {
        return get().challenges.filter(challenge => challenge.isCompleted);
      },
      
      getUpcomingChallenges: () => {
        const now = new Date().toISOString();
        return get().challenges.filter(challenge => 
          !challenge.isCompleted &&
          new Date(challenge.startDate).toISOString() > now
        );
      }
    }),
    {
      name: 'challenge-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

// Mock data generator function
function generateMockChallenges(): Challenge[] {
  const now = new Date();
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(now.getDate() + 7);
  
  const twoWeeksLater = new Date(now);
  twoWeeksLater.setDate(now.getDate() + 14);
  
  return [
    {
      id: 'challenge-1',
      title: '10K Steps Daily',
      description: 'Complete 10,000 steps every day for a week',
      type: 'steps',
      verificationType: 'automatic',
      startDate: now.toISOString(),
      endDate: oneWeekLater.toISOString(),
      stake: 50,
      goal: 10000,
      goalUnit: 'steps',
      participants: [
        {
          id: 'user-1',
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
          progressPercentage: 45,
          hasCompleted: false,
          lastUpdated: now.toISOString(),
          dailyProgress: { [now.toISOString().split('T')[0]]: 45 }
        }
      ],
      createdBy: 'user-2',
      isCompleted: false
    },
    {
      id: 'challenge-2',
      title: 'Morning Meditation',
      description: 'Meditate for 10 minutes every morning',
      type: 'meditation',
      verificationType: 'honor',
      startDate: now.toISOString(),
      endDate: oneWeekLater.toISOString(),
      stake: 30,
      goal: 10,
      goalUnit: 'minutes',
      participants: [
        {
          id: 'user-1',
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
          progressPercentage: 60,
          hasCompleted: false,
          lastUpdated: now.toISOString(),
          dailyProgress: { [now.toISOString().split('T')[0]]: 60 }
        }
      ],
      createdBy: 'user-3',
      isCompleted: false
    },
    {
      id: 'challenge-3',
      title: 'Weekly Book Club',
      description: 'Read 100 pages this week',
      type: 'reading',
      verificationType: 'photo',
      startDate: now.toISOString(),
      endDate: oneWeekLater.toISOString(),
      stake: 40,
      goal: 100,
      goalUnit: 'pages',
      participants: [
        {
          id: 'user-2',
          name: 'John Smith',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
          progressPercentage: 75,
          hasCompleted: false,
          lastUpdated: now.toISOString(),
          dailyProgress: { [now.toISOString().split('T')[0]]: 75 }
        }
      ],
      createdBy: 'user-2',
      isCompleted: false
    }
  ];
}