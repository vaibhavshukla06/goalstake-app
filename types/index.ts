export type User = {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    balance: number;
    createdAt: string;
  };
  
  export type Challenge = {
    id: string;
    title: string;
    description: string;
    creatorId: string;
    creatorName: string;
    stake: number;
    startDate: string;
    endDate: string;
    category: ChallengeCategory;
    type: ChallengeType;
    target: number;
    unit: string;
    participants: Participant[];
    isPublic: boolean;
  };
  
  export type Participant = {
    userId: string;
    username: string;
    avatar?: string;
    progress: number;
    lastUpdated: string;
    isCompleted: boolean;
  };
  
  export type Progress = {
    id: string;
    challengeId: string;
    userId: string;
    value: number;
    date: string;
    notes?: string;
  };
  
  export type Achievement = {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;
  };
  
  export enum ChallengeCategory {
    Fitness = "fitness",
    Learning = "learning",
    Productivity = "productivity",
    Finance = "finance",
    Health = "health",
    Other = "other",
  }
  
  export enum ChallengeType {
    Accumulative = "accumulative", // Add up progress (e.g., steps, pages read)
    Streak = "streak", // Consecutive days of activity
    Completion = "completion", // Binary complete/incomplete
  }
  
  export type Transaction = {
    id: string;
    userId: string;
    amount: number;
    type: "stake" | "reward" | "deposit";
    description: string;
    challengeId?: string;
    createdAt: string;
  };
  
  export type Notification = {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: "challenge" | "achievement" | "system";
    read: boolean;
    createdAt: string;
    data?: any;
  };