/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HabitCategory = 'health' | 'productivity' | 'mindfulness' | 'learning' | 'fitness' | 'finance' | 'social';

export type PsychologicalPrinciple = 
  | 'Habit Stacking' 
  | 'Friction Reduction' 
  | 'Temptation Bundling' 
  | 'Identity Shift' 
  | 'Implementation Intention' 
  | 'Instant Reward'
  | 'Social Accountability';

export interface HabitRecord {
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
  mood?: 'great' | 'good' | 'meh' | 'bad' | 'terrible';
  energyLevel?: number; // 1-10
  experienceFeeling?: 'easy' | 'challenging' | 'boring' | 'energizing';
  reflectionAnswer?: string;
}

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekly' | 'custom';
  targetDaysCount: number; // e.g. 5 days/week or 1 day/day
  description: string;
  psychologicalPrinciple: PsychologicalPrinciple;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  reminderTime: string; // HH:MM
  createdAt: string;
  isArchived: boolean;
  records: { [date: string]: HabitRecord }; // keyed by YYYY-MM-DD
  currentStreak: number;
  longestStreak: number;
}

export type GrowthPersona = 
  | 'The Identity Shifter' // Focuses on who they want to become
  | 'The Micro-Habit Builder' // Focuses on tiny gains & Friction Reduction
  | 'The Game Strategist' // Highly motivated by gamification & stats
  | 'The Mindful Observer'; // Focuses on awareness, mood, and reflection

export interface UserProfile {
  name: string;
  growthPersona: GrowthPersona;
  focusAreas: HabitCategory[];
  quizAnswers: {
    motivation: string;
    obstacle: string;
    coachingTone: string;
    stylePreference: string;
  };
  joinedAt: string;
  isPro: boolean;
  identityAnchor?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streakMultiplier: number; // e.g. 1.0, 1.2, 1.5 based on perfect days
  bronzeBadges: string[];
  silverBadges: string[];
  goldBadges: string[];
  totalCompletedCount: number;
  streakDays: number; // consecutive active days in app
  lastActiveDate: string; // YYYY-MM-DD
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  insights?: {
    title: string;
    description: string;
    category: string;
    principle: string;
  }[];
}

export interface AIInsight {
  title: string;
  description: string;
  category: string;
  principle: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface WearableDevice {
  name: string;
  type: 'apple' | 'fitbit' | 'garmin' | 'oura' | 'whoop' | 'samsung' | 'other';
  connected: boolean;
  lastSyncedAt: string;
  stepsToday: number;
  sleepHours: number;
}

export interface TodoTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  encouragement?: string;
}

export interface FeedbackItem {
  id: string;
  category: 'UI/UX Improvement' | 'New Habit Feature' | 'AI Coach Idea' | 'Bug Report' | 'General Feedback';
  rating: number; // 1 to 5
  message: string;
  authorName: string;
  timestamp: string;
  upvotes: number;
  tags?: string[];
  userUpvoted?: boolean;
}

export interface FirstDayQuest {
  id: 'complete_habit' | 'somatic_breath' | 'chat_coach' | 'add_task';
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  actionText: string;
}

