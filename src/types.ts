import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Timestamp;
  streak: number;
  totalPoints: number;
  dailyCalorieGoal: number;
  dailyFocusLimitMinutes: number;
  lastLoggedAt: Timestamp | null;
  badges: string[];
  blockedApps?: string[];
  biggestStruggle?: string;
  appLimits?: Record<string, number>;
  motivation?: string;
  dailySchedule?: string;
}

export interface FocusSession {
  id?: string;
  userId: string;
  type: 'deep_work' | 'meditation';
  duration: number;
  startTime: Timestamp;
  endTime?: Timestamp;
  completed: boolean;
  createdAt: Timestamp;
}

export interface AppUsage {
  name: string;
  minutes: number;
  category: string;
  icon: string;
}
