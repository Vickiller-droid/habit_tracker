import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Brain, Home, BarChart3, Award, Smartphone, Settings as SettingsIcon, 
  Plus, Calendar, Flame, User, Check, Trophy, BookOpen, Clock, AlertCircle, Info,
  ListTodo, Trash2, Sun, Moon, Beaker, Play, RotateCw, Smile, Feather, Droplets, Dumbbell, Timer, ChevronRight, Compass, MessageSquare
} from 'lucide-react';

import { UserProfile, UserStats, Habit, HabitRecord, HabitCategory, PsychologicalPrinciple, TodoTask, FirstDayQuest } from './types';
import Onboarding from './components/Onboarding';
import HabitCard from './components/HabitCard';
import AICoach from './components/AICoach';
import Analytics from './components/Analytics';
import Gamification from './components/Gamification';
import WearableSync from './components/WearableSync';
import Settings from './components/Settings';
import GuidedSession from './components/GuidedSession';
import IntelligentCalendar from './components/IntelligentCalendar';
import InteractiveTourModal from './components/InteractiveTourModal';
import FirstDayQuests from './components/FirstDayQuests';
import FeedbackWidget from './components/FeedbackWidget';

import { playSuccessSound, playCelebrationFanfareAndClaps } from './utils/audio';
import DopamineExplosion from './components/DopamineExplosion';
import EducationalLoading from './components/EducationalLoading';
import AcronymValidationModal from './components/AcronymValidationModal';
import { validateTextInput } from './utils/wordValidator';

export function deduplicateHabits(habitsList: Habit[]): Habit[] {
  const seenNames = new Set<string>();
  return habitsList.filter(habit => {
    const normalizedName = habit.name.toLowerCase().trim();
    if (seenNames.has(normalizedName)) {
      return false;
    }
    seenNames.add(normalizedName);
    return true;
  });
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'coach' | 'analytics' | 'gamification' | 'wearables' | 'settings'>('dashboard');
  
  // Dark Mode Theme and Daily To-Do list state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('vicfungo_dark_mode') === 'true';
  });
  const [todos, setTodos] = useState<TodoTask[]>([]);
  
  // App Time Coordination (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Custom Habit Builder Modal state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [showRelaunchConfirmModal, setShowRelaunchConfirmModal] = useState<boolean>(false);
  const [newHabitName, setNewHabitName] = useState<string>('');
  const [newHabitTrigger, setNewHabitTrigger] = useState<string>('');
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>('productivity');
  const [newHabitPrinciple, setNewHabitPrinciple] = useState<PsychologicalPrinciple>('Habit Stacking');
  const [newHabitDifficulty, setNewHabitDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [newHabitReminder, setNewHabitReminder] = useState<string>('08:00');
  const [newHabitDesc, setNewHabitDesc] = useState<string>('');

  // Acronym Validation State
  const [confirmedAcronyms, setConfirmedAcronyms] = useState<Set<string>>(new Set());
  const [suspiciousWord, setSuspiciousWord] = useState<string>('');
  const [isAcronymModalOpen, setIsAcronymModalOpen] = useState<boolean>(false);
  const [pendingSubmitCallback, setPendingSubmitCallback] = useState<(() => void) | null>(null);

  const executeWithWordValidation = (textToValidate: string, proceedFn: () => void) => {
    const result = validateTextInput(textToValidate, confirmedAcronyms);
    if (!result.isValid && result.suspiciousWord) {
      setSuspiciousWord(result.suspiciousWord);
      setPendingSubmitCallback(() => proceedFn);
      setIsAcronymModalOpen(true);
    } else {
      proceedFn();
    }
  };

  const handleConfirmAcronym = (word: string) => {
    const updated = new Set(confirmedAcronyms);
    updated.add(word.toUpperCase());
    setConfirmedAcronyms(updated);
    setIsAcronymModalOpen(false);
    if (pendingSubmitCallback) {
      pendingSubmitCallback();
      setPendingSubmitCallback(null);
    }
  };

  // Bravo Completion Pop-up state
  const [showBravoPopup, setShowBravoPopup] = useState<boolean>(false);
  const [bravoMessage, setBravoMessage] = useState<string>('');

  // Today's Stack Efficiency Interactive state
  const [activeStackTab, setActiveStackTab] = useState<'gauge' | 'activate' | 'calibration'>('gauge');
  const [selectedActivationHabitId, setSelectedActivationHabitId] = useState<string | null>(null);
  const [guidedSessionHabit, setGuidedSessionHabit] = useState<Habit | null>(null);
  const [completionFlow, setCompletionFlow] = useState<{
    habit: Habit;
    stage: 'confirm' | 'reflection' | 'experience';
    reflectionQuestion?: string;
    reflectionAnswer?: string;
  } | null>(null);
  const [customSplashIntensity, setCustomSplashIntensity] = useState<number>(45); // number of particles in custom splash
  const [customSplashColor, setCustomSplashColor] = useState<string>('mixed'); // custom color theme for playground

  // Dynamic, motivational message that rotates based on user stats, streaks, time of day, or activity.
  const [motivationalMessage, setMotivationalMessage] = useState<string>('');

  const generateMotivationalMessage = (currProfile: UserProfile | null, currStats: UserStats | null): string => {
    if (!currProfile) return "Consistency compounds. One habit at a time.";
    
    const name = currProfile.name;
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    
    const baseOptions = [
      `Keep up the journey, ${name}.`,
      `Keep building momentum, ${name}.`,
      `One habit at a time, ${name}.`,
      `Consistency compounds, ${name}.`,
      `You're making progress, ${name}.`,
      `Small actions. Big results.`,
      `Let's keep the momentum going, ${name}.`,
      `Today's actions shape tomorrow, ${name}.`,
    ];
    
    const morningOptions = [
      `Rise and shine, ${name}! Your morning actions shape your future.`,
      `One habit at a time, ${name}. Let's win the morning.`,
      `Good morning, ${name}. Consistency compounds.`,
      `Small steps in the morning create massive progress, ${name}.`,
    ];
    
    const afternoonOptions = [
      `Keep building momentum, ${name}. You're doing amazing!`,
      `Keep up the journey, ${name}. Consistency is key.`,
      `Let's keep the momentum going, ${name}.`,
      `You're making incredible progress today, ${name}.`,
    ];
    
    const eveningOptions = [
      `Consistency compounds, ${name}. Reflecting on today's steps.`,
      `Great job staying committed today, ${name}.`,
      `One habit at a time, ${name}. Recharge for tomorrow.`,
      `Your future self will thank you for today's effort, ${name}.`,
    ];
    
    const streakOptions = currStats && currStats.streakDays > 0 ? [
      `Unstoppable! Your ${currStats.streakDays}d streak is locked and loaded, ${name}.`,
      `Keep building momentum, ${name}. A ${currStats.streakDays}-day streak is powerful!`,
      `Consistency is your superpower. Your ${currStats.streakDays}d streak proves it!`,
      `Feeding the flame! Keep that ${currStats.streakDays}d streak alive, ${name}.`
    ] : [];

    let pool = [...baseOptions];
    
    if (hour < 12) {
      pool = [...pool, ...morningOptions];
    } else if (hour < 17) {
      pool = [...pool, ...afternoonOptions];
    } else {
      pool = [...pool, ...eveningOptions];
    }
    
    if (streakOptions.length > 0) {
      pool = [...pool, ...streakOptions];
    }
    
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  };

  // Read state from local storage on mount
  useEffect(() => {
    const cachedProfile = localStorage.getItem('vicfungo_profile');
    const cachedStats = localStorage.getItem('vicfungo_stats');
    const cachedHabits = localStorage.getItem('vicfungo_habits');
    const cachedTodos = localStorage.getItem('vicfungo_todos');

    let initialProfile: UserProfile | null = null;
    let initialStats: UserStats | null = null;

    if (cachedProfile && cachedStats) {
      initialProfile = JSON.parse(cachedProfile);
      initialStats = JSON.parse(cachedStats);
      setProfile(initialProfile);
      setStats(initialStats);
    }
    
    if (initialProfile) {
      setMotivationalMessage(generateMotivationalMessage(initialProfile, initialStats));
      if (localStorage.getItem('vicfungo_tour_completed') !== 'true') {
        setIsTourModalOpen(true);
      }
    }
    
    if (cachedTodos) {
      setTodos(JSON.parse(cachedTodos));
    } else {
      setTodos([]);
      localStorage.setItem('vicfungo_todos', JSON.stringify([]));
    }
    
    if (cachedHabits) {
      const parsed = JSON.parse(cachedHabits);
      const cleanHabits = deduplicateHabits(parsed);
      setHabits(cleanHabits);
      localStorage.setItem('vicfungo_habits', JSON.stringify(cleanHabits));
    } else {
      // Setup beautiful behavioral psychology default habits to welcome new users
      const defaultHabits: Habit[] = [
        {
          id: 'def-1',
          name: 'Take 3 Deep Mindful Breaths',
          category: 'mindfulness',
          frequency: 'daily',
          targetDaysCount: 1,
          description: 'Stack this instantly when you sit down in your work chair to center neural circuits.',
          psychologicalPrinciple: 'Friction Reduction',
          difficulty: 'easy',
          xpReward: 30,
          reminderTime: '09:00',
          createdAt: new Date().toISOString(),
          isArchived: false,
          records: {},
          currentStreak: 0,
          longestStreak: 0
        },
        {
          id: 'def-2',
          name: 'Drink 500ml Filtered Water',
          category: 'health',
          frequency: 'daily',
          targetDaysCount: 1,
          description: 'Stack this immediately after you stand up from your morning bed node.',
          psychologicalPrinciple: 'Habit Stacking',
          difficulty: 'easy',
          xpReward: 25,
          reminderTime: '07:05',
          createdAt: new Date().toISOString(),
          isArchived: false,
          records: {},
          currentStreak: 0,
          longestStreak: 0
        },
        {
          id: 'def-3',
          name: 'Read 2 Pages of a Non-Fiction Book',
          category: 'learning',
          frequency: 'daily',
          targetDaysCount: 1,
          description: 'Stack this contract after your evening tea or coffee kettle completes.',
          psychologicalPrinciple: 'Identity Shift',
          difficulty: 'medium',
          xpReward: 40,
          reminderTime: '21:00',
          createdAt: new Date().toISOString(),
          isArchived: false,
          records: {},
          currentStreak: 0,
          longestStreak: 0
        }
      ];
      setHabits(defaultHabits);
      localStorage.setItem('vicfungo_habits', JSON.stringify(defaultHabits));
    }
  }, []);

  const saveTodos = (newTodos: TodoTask[]) => {
    setTodos(newTodos);
    localStorage.setItem('vicfungo_todos', JSON.stringify(newTodos));
  };

  const handleToggleTodo = (todoId: string) => {
    if (!stats) return;
    const task = todos.find(t => t.id === todoId);
    if (!task) return;
    
    const isNowCompleted = !task.completed;
    const updated = todos.map(t => t.id === todoId ? { ...t, completed: isNowCompleted } : t);
    saveTodos(updated);
    
    const xpReward = isNowCompleted ? 15 : -15;
    const updatedXP = Math.max(0, stats.xp + xpReward);
    const updatedStats: UserStats = {
      ...stats,
      xp: updatedXP,
      level: Math.floor(updatedXP / 500) + 1
    };
    saveState(profile!, updatedStats, habits);

    if (isNowCompleted) {
      playSuccessSound();
      setBravoMessage("Consistency in finishing your everyday tasks is key! Each action node checked off strengthens your executive functioning, building robust momentum that transforms micro-steps into unbreakable permanent routines.");
      setShowBravoPopup(true);
    }
  };

  const handleAddTodo = (text: string, onSuccess?: () => void) => {
    if (!text.trim()) return;
    executeWithWordValidation(text, () => {
      const encouragements = [
        "Wonderful choice! Action-bias is the single strongest predictor of behavioral success.",
        "Excellent structure. Keeping things on a written log is a victory for executive function.",
        "Dr. Gethro fully endorses this. Accomplishing this builds profound identity confidence.",
        "This is highly aligned with daily momentum. Let's execute this action today!",
        "Commitment is the first half of the loop. Dr. Gethro is tracking your action contract."
      ];
      const randomAdvice = encouragements[Math.floor(Math.random() * encouragements.length)];
      const newTodo: TodoTask = {
        id: `todo-${Date.now()}`,
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        encouragement: randomAdvice
      };
      saveTodos([newTodo, ...todos]);
      if (onSuccess) onSuccess();
    });
  };

  const handleDeleteTodo = (todoId: string) => {
    saveTodos(todos.filter(t => t.id !== todoId));
  };

  const handleToggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    localStorage.setItem('vicfungo_dark_mode', String(nextVal));
  };

  // Write changes to local storage whenever state changes
  const saveState = (newProfile: UserProfile, newStats: UserStats, newHabits: Habit[]) => {
    const cleanHabits = deduplicateHabits(newHabits);
    setProfile(newProfile);
    setStats(newStats);
    setHabits(cleanHabits);
    localStorage.setItem('vicfungo_profile', JSON.stringify(newProfile));
    localStorage.setItem('vicfungo_stats', JSON.stringify(newStats));
    localStorage.setItem('vicfungo_habits', JSON.stringify(cleanHabits));
  };

  const handleOnboardingComplete = (newProfile: UserProfile, newStats: UserStats) => {
    saveState(newProfile, newStats, habits);
    setMotivationalMessage(generateMotivationalMessage(newProfile, newStats));
    setIsTourModalOpen(true);
  };

  const handleCompleteTour = (xpBonus: number) => {
    localStorage.setItem('vicfungo_tour_completed', 'true');
    if (stats && profile) {
      const newXp = stats.xp + xpBonus;
      const newLevel = Math.floor(newXp / 500) + 1;
      const updatedStats: UserStats = {
        ...stats,
        xp: newXp,
        level: newLevel,
        bronzeBadges: stats.bronzeBadges.includes('Pioneer Explorer') 
          ? stats.bronzeBadges 
          : [...stats.bronzeBadges, 'Pioneer Explorer']
      };
      setStats(updatedStats);
      localStorage.setItem('vicfungo_stats', JSON.stringify(updatedStats));
    }
  };

  const markQuestComplete = (questId: 'complete_habit' | 'somatic_breath' | 'chat_coach' | 'add_task') => {
    try {
      const saved = localStorage.getItem('vicfungo_first_day_quests');
      const DEFAULT_QUESTS: FirstDayQuest[] = [
        { id: 'complete_habit', title: 'Complete Your 1st Stack Contract', description: 'Check off any habit on your daily dashboard to trigger XP & neurochemical boost.', xpReward: 25, completed: false, actionText: 'Find Habit Below' },
        { id: 'somatic_breath', title: 'Experience Somatic Box Breathing', description: 'Launch a 2-minute 4-4-4 guided breathing session in the Somatic Lab.', xpReward: 25, completed: false, actionText: 'Start Breathing' },
        { id: 'chat_coach', title: 'Consult Dr. Gethro AI Coach', description: 'Ask Dr. Gethro a question tailored to your behavioral persona.', xpReward: 25, completed: false, actionText: 'Open AI Coach' },
        { id: 'add_task', title: 'Create a Custom Habit or Task', description: 'Add a new validated daily action or habit stack contract.', xpReward: 25, completed: false, actionText: 'Build Contract' }
      ];
      const currentQuests: FirstDayQuest[] = saved ? JSON.parse(saved) : DEFAULT_QUESTS;
      const target = currentQuests.find(q => q.id === questId);
      if (target && !target.completed) {
        target.completed = true;
        localStorage.setItem('vicfungo_first_day_quests', JSON.stringify(currentQuests));
        if (stats && profile) {
          addXPForInsight(target.xpReward);
        }
      }
    } catch (e) {
      // Suppress
    }
  };

  // Launch virtual temporary somatic sessions instantly
  const launchVirtualSomatic = (type: 'breathing' | 'stretch' | 'plank') => {
    markQuestComplete('somatic_breath');
    const virtualHabits: Record<string, Habit> = {
      breathing: {
        id: 'temp-somatic-breathing',
        name: 'Guided Zen Breathing Session',
        category: 'mindfulness',
        frequency: 'daily',
        targetDaysCount: 1,
        description: 'Slow down cognitive processes using 4-4-4 deep box breathing.',
        psychologicalPrinciple: 'Identity Shift',
        difficulty: 'easy',
        xpReward: 35,
        reminderTime: '08:00',
        createdAt: new Date().toISOString(),
        isArchived: false,
        records: {},
        currentStreak: 0,
        longestStreak: 0
      },
      stretch: {
        id: 'temp-somatic-stretch',
        name: '30s Somatic Centering Stretch',
        category: 'fitness',
        frequency: 'daily',
        targetDaysCount: 1,
        description: 'Release accumulated physical muscular tension.',
        psychologicalPrinciple: 'Friction Reduction',
        difficulty: 'easy',
        xpReward: 25,
        reminderTime: '08:00',
        createdAt: new Date().toISOString(),
        isArchived: false,
        records: {},
        currentStreak: 0,
        longestStreak: 0
      },
      plank: {
        id: 'temp-somatic-plank',
        name: '30s Core Activation Plank',
        category: 'fitness',
        frequency: 'daily',
        targetDaysCount: 1,
        description: 'Stabilize your posture and activate nervous system core structures.',
        psychologicalPrinciple: 'Implementation Intention',
        difficulty: 'medium',
        xpReward: 30,
        reminderTime: '08:00',
        createdAt: new Date().toISOString(),
        isArchived: false,
        records: {},
        currentStreak: 0,
        longestStreak: 0
      }
    };
    setGuidedSessionHabit(virtualHabits[type]);
  };

  // Habit Toggle complete handler
  const handleToggleComplete = (
    habitId: string, 
    reflection?: Partial<HabitRecord>, 
    bypassGuidedInterception = false
  ) => {
    if (!stats || !profile) return;

    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      const currentlyCompleted = !!habit.records[selectedDate]?.completed;
      
      if (!currentlyCompleted && !bypassGuidedInterception) {
        // Intercept to require intentional confirmation and specialized completion experiences
        const isBreathing = habit.id === 'def-1' || 
          habit.name.toLowerCase().includes('breath') || 
          habit.name.toLowerCase().includes('breathe') ||
          habit.category === 'mindfulness';
          
        const isFocus = habit.name.toLowerCase().includes('focus') || 
          habit.name.toLowerCase().includes('timer') || 
          habit.name.toLowerCase().includes('plank') ||
          habit.name.toLowerCase().includes('stretch') ||
          habit.name.toLowerCase().includes('workout') ||
          habit.category === 'fitness' ||
          habit.category === 'productivity';

        const isReading = habit.name.toLowerCase().includes('read') || 
          habit.name.toLowerCase().includes('book') || 
          habit.name.toLowerCase().includes('learn') || 
          habit.name.toLowerCase().includes('study') || 
          habit.name.toLowerCase().includes('newsletter') ||
          habit.category === 'learning';

        if (isBreathing) {
          // Launch guided breathing directly
          setGuidedSessionHabit(habit);
        } else if (isFocus) {
          // Focus/somatic: ask to start timer or confirm
          setCompletionFlow({
            habit,
            stage: 'confirm',
            reflectionQuestion: 'We recommend running a 30s somatic timer to lock in your focus.'
          });
        } else if (isReading) {
          // Reading: ask reflection first or confirm first
          setCompletionFlow({
            habit,
            stage: 'confirm',
            reflectionQuestion: Math.random() > 0.5 ? 'What stood out to you most in your reading today?' : 'What was one idea you learned?'
          });
        } else {
          // Hydration or others: simple confirmation
          setCompletionFlow({
            habit,
            stage: 'confirm'
          });
        }
        return;
      }
    }

    let xpReward = 0;
    const updatedHabits = habits.map(h => {
      if (h.id === habitId) {
        const records = { ...h.records };
        const currentlyCompleted = !!records[selectedDate]?.completed;

        if (currentlyCompleted) {
          // Unchecking
          delete records[selectedDate];
          const newCurrentStreak = Math.max(0, h.currentStreak - 1);
          xpReward = -h.xpReward;
          return {
            ...h,
            records,
            currentStreak: newCurrentStreak
          };
        } else {
          // Checking
          records[selectedDate] = {
            date: selectedDate,
            completed: true,
            notes: reflection?.notes || '',
            mood: reflection?.mood || 'good',
            energyLevel: reflection?.energyLevel || 6,
            experienceFeeling: reflection?.experienceFeeling,
            reflectionAnswer: reflection?.reflectionAnswer
          };
          const newCurrentStreak = h.currentStreak + 1;
          const newLongestStreak = Math.max(h.longestStreak, newCurrentStreak);
          xpReward = h.xpReward;
          return {
            ...h,
            records,
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak
          };
        }
      }
      return h;
    });

    // Award XP and calculate Levelups
    const totalXP = Math.max(0, stats.xp + xpReward);
    const newLevel = Math.floor(totalXP / 500) + 1;
    const xpAddedCount = xpReward > 0 ? stats.totalCompletedCount + 1 : Math.max(0, stats.totalCompletedCount - 1);
    
    // Check if "perfect day" occurred for streaks
    const activeHabitsCount = updatedHabits.filter(uh => !uh.isArchived).length;
    const completedTodayCount = updatedHabits.filter(uh => !uh.isArchived && uh.records[selectedDate]?.completed).length;
    const isPerfectDay = activeHabitsCount > 0 && completedTodayCount === activeHabitsCount;

    let currentStreakDays = stats.streakDays;
    let multiplier = stats.streakMultiplier;

    if (isPerfectDay && xpReward > 0) {
      currentStreakDays += 1;
      multiplier = Math.min(2.5, Number((1.0 + (currentStreakDays * 0.1)).toFixed(1)));
    } else if (xpReward < 0 && !isPerfectDay) {
      currentStreakDays = Math.max(0, currentStreakDays - 1);
      multiplier = Math.max(1.0, Number((1.0 + (currentStreakDays * 0.1)).toFixed(1)));
    }

    const updatedStats: UserStats = {
      ...stats,
      xp: totalXP,
      level: newLevel,
      totalCompletedCount: xpAddedCount,
      streakDays: currentStreakDays,
      streakMultiplier: multiplier,
      lastActiveDate: selectedDate
    };

    saveState(profile, updatedStats, updatedHabits);

    if (xpReward > 0) {
      playSuccessSound();
      playCelebrationFanfareAndClaps();
      if (profile?.identityAnchor) {
        setBravoMessage(`Identity Shift reinforced! By completing this routine, you've logged concrete evidence of who you are becoming. Your action aligns perfectly with your target identity anchor: “${profile.identityAnchor}”. Every single repetition strengthens this new self! This is what consistency looks like.`);
      } else {
        setBravoMessage("Consistency in completing your habit stack is key! Doctor Gethro notes that repeating these identity habits creates unshakeable daily structures and rewires your brain for long-term behavioral success.");
      }
      setShowBravoPopup(true);
    }
  };

  // Add a brand new habit
  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim() || !newHabitTrigger.trim() || !stats || !profile) return;

    if (habits.some(h => h.name.toLowerCase().trim() === newHabitName.toLowerCase().trim())) {
      setBravoMessage(`"${newHabitName}" is already active in your Habit Stack! Vicfungo prevents duplicate habit cards to keep your dashboard clear and trustworthy.`);
      setShowBravoPopup(true);
      return;
    }

    executeWithWordValidation(`${newHabitName} ${newHabitTrigger}`, () => {
      // Build descriptions automatically with stack formulation
      const compiledDesc = newHabitDesc.trim() || `After I ${newHabitTrigger}, I will ${newHabitName}. Powered by ${newHabitPrinciple}.`;

      // Map difficulty to custom XP values
      const xpRewardMap = { easy: 30, medium: 45, hard: 60 };
      const xpVal = xpRewardMap[newHabitDifficulty] || 30;

      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        name: newHabitName.trim(),
        category: newHabitCategory,
        frequency: 'daily',
        targetDaysCount: 1,
        description: compiledDesc,
        psychologicalPrinciple: newHabitPrinciple,
        difficulty: newHabitDifficulty,
        xpReward: xpVal,
        reminderTime: newHabitReminder,
        createdAt: new Date().toISOString(),
        isArchived: false,
        records: {},
        currentStreak: 0,
        longestStreak: 0
      };

      const updatedHabits = [newHabit, ...habits];
      
      // Reset fields
      setNewHabitName('');
      setNewHabitTrigger('');
      setNewHabitDesc('');
      setShowCreateModal(false);

      saveState(profile, stats, updatedHabits);
    });
  };

  // Delete an existing habit
  const handleDeleteHabit = (habitId: string) => {
    if (!stats || !profile) return;
    const updatedHabits = habits.filter(h => h.id !== habitId);
    saveState(profile, stats, updatedHabits);
  };

  // Claim Challenge XP Reward
  const handleClaimChallengeXP = (xpReward: number, challengeId: string) => {
    if (!stats || !profile) return;
    const updatedXP = stats.xp + xpReward;
    const updatedStats: UserStats = {
      ...stats,
      xp: updatedXP,
      level: Math.floor(updatedXP / 500) + 1
    };
    saveState(profile, updatedStats, habits);
  };

  // Sync biometrics complete
  const handleSyncComplete = (steps: number, sleep: number, xpReward: number) => {
    if (!stats || !profile) return;
    const updatedXP = stats.xp + xpReward;
    const updatedStats: UserStats = {
      ...stats,
      xp: updatedXP,
      level: Math.floor(updatedXP / 500) + 1,
      bronzeBadges: stats.bronzeBadges.includes('Wearable Synced') 
        ? stats.bronzeBadges 
        : [...stats.bronzeBadges, 'Wearable Synced']
    };
    saveState(profile, updatedStats, habits);
  };

  // Upgrade Pro simulated state
  const handleUpgradePro = () => {
    if (!profile || !stats) return;
    const updatedProfile: UserProfile = { ...profile, isPro: true };
    saveState(updatedProfile, stats, habits);
  };

  // Restore complete backup
  const handleRestoreData = (backup: { profile: UserProfile; stats: UserStats; habits: Habit[] }) => {
    saveState(backup.profile, backup.stats, backup.habits);
  };

  // Reset/Clear everything
  const handleClearAllData = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // Ignore
    }
    setShowRelaunchConfirmModal(false);
    setProfile(null);
    setStats(null);
    setHabits([]);
    setTodos([]);
    setCurrentView('dashboard');
  };

  const addXPForInsight = (xp: number) => {
    if (!stats || !profile) return;
    const updatedXP = stats.xp + xp;
    const updatedStats: UserStats = {
      ...stats,
      xp: updatedXP,
      level: Math.floor(updatedXP / 500) + 1
    };
    saveState(profile, updatedStats, habits);
  };

  // Quick pre-populate template handlers
  const handleAddTemplate = (templateName: string, category: HabitCategory, trigger: string, principle: PsychologicalPrinciple, difficulty: 'easy'|'medium'|'hard', xpVal: number) => {
    if (!stats || !profile) return;
    
    if (habits.some(h => h.name.toLowerCase().trim() === templateName.toLowerCase().trim())) {
      setBravoMessage(`"${templateName}" is already active in your Habit Stack! Vicfungo prevents duplicate habit cards to keep your dashboard clear and trustworthy.`);
      setShowBravoPopup(true);
      return;
    }

    const newHabit: Habit = {
      id: `habit-temp-${Date.now()}`,
      name: templateName,
      category,
      frequency: 'daily',
      targetDaysCount: 1,
      description: `After I ${trigger}, I will ${templateName}. Custom-prescribed via Vicfungo Templates.`,
      psychologicalPrinciple: principle,
      difficulty,
      xpReward: xpVal,
      reminderTime: '08:00',
      createdAt: new Date().toISOString(),
      isArchived: false,
      records: {},
      currentStreak: 0,
      longestStreak: 0
    };

    const updatedHabits = [newHabit, ...habits];
    saveState(profile, stats, updatedHabits);
  };

  // Generate Week Days list for top interactive day selection
  const getWeekDays = () => {
    const today = new Date();
    const days = [];
    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        label: weekdayLabels[d.getDay()],
        dayNum: d.getDate(),
        isToday: dateStr === today.toISOString().split('T')[0]
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // If profile is null, render the Onboarding quiz view
  if (!profile || !stats) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Active view filters
  const completedTodayCount = habits.filter(h => !h.isArchived && h.records[selectedDate]?.completed).length;
  const totalActiveCount = habits.filter(h => !h.isArchived).length;
  const progressPercent = totalActiveCount > 0 ? Math.round((completedTodayCount / totalActiveCount) * 100) : 0;

  // Dynamic Neurochemical Equilibrium calculations
  const todoCompletedCount = todos.filter(t => t.completed).length;
  const dopamineLevel = Math.min(100, Math.round(
    25 + 
    (completedTodayCount * 20) + 
    (todoCompletedCount * 12)
  ));

  const recordsToday = habits.map(h => h.records[selectedDate]).filter(Boolean);
  const moodsMap = { great: 100, good: 80, meh: 60, bad: 40, terrible: 20 };
  const moodsVal = recordsToday.map(r => moodsMap[r.mood || 'good'] || 80);
  const averageMood = moodsVal.length > 0 ? (moodsVal.reduce((a, b) => a + b, 0) / moodsVal.length) : 60;
  const serotoninLevel = Math.min(100, Math.round(
    30 + 
    (habits.filter(h => h.category === 'mindfulness' && h.records[selectedDate]?.completed).length * 25) + 
    (averageMood * 0.45)
  ));

  const cachedDevices = localStorage.getItem('vicfungo_devices');
  const devicesList = cachedDevices ? JSON.parse(cachedDevices) : [];
  const wearablesConnected = devicesList.some((d: any) => d.connected);
  const totalSteps = devicesList.reduce((sum: number, d: any) => sum + (d.stepsToday || 0), 0);
  const endorphinLevel = Math.min(100, Math.round(
    20 + 
    (wearablesConnected ? 25 : 0) + 
    (Math.min(10000, totalSteps) / 180) + 
    (habits.filter(h => h.category === 'fitness' && h.records[selectedDate]?.completed).length * 30)
  ));

  return (
    <div id="app-root" className={`min-h-screen ${
      darkMode ? 'bg-stone-950 text-stone-100' : 'bg-[#FEFAF7] text-stone-800'
    } flex flex-col md:flex-row font-sans selection:bg-orange-100 selection:text-orange-900 transition-colors duration-300`}>
      
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 ${
        darkMode ? 'bg-stone-900/90 border-stone-850 text-stone-100' : 'bg-white border-stone-100'
      } border-b md:border-b-0 md:border-r flex flex-col justify-between shrink-0 z-20 shadow-sm transition-colors duration-300`}>
        <div>
          {/* Brand Logo */}
          <div className={`p-6 border-b ${darkMode ? 'border-stone-800' : 'border-stone-100'} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#FF8A3D] rounded-xl flex items-center justify-center shadow-lg shadow-orange-100/50 text-white">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className={`font-display font-extrabold text-xl ${darkMode ? 'text-stone-100' : 'text-stone-900'} tracking-tight`}>Vicfungo</span>
            </div>
            
            {profile.isPro && (
              <span className="text-[9px] bg-orange-100 text-[#FF8A3D] font-bold font-mono px-1.5 py-0.5 rounded-full uppercase tracking-wider">PRO</span>
            )}
          </div>

          {/* Quick User Identity Summary */}
          <div className={`p-4 mx-2 my-3 ${
            darkMode ? 'bg-stone-800/50 border-stone-800' : 'bg-[#F5F1EE] border-stone-100'
          } rounded-[24px] flex items-center gap-3 border transition-colors`}>
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF8A3D] font-bold font-display flex items-center justify-center shadow-sm shrink-0">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4 className={`font-bold ${darkMode ? 'text-stone-100' : 'text-stone-800'} text-xs truncate`}>{profile.name}</h4>
              <span className="text-[10px] text-stone-500 font-medium block truncate">Lvl {stats.level} Archetype</span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="px-3 space-y-1">
            {[
              { id: 'dashboard', label: 'My Habit Dashboard', icon: Home },
              { id: 'coach', label: 'Dr. Gethro AI Coach', icon: Brain },
              { id: 'analytics', label: 'Growth Insights', icon: BarChart3 },
              { id: 'gamification', label: 'Arena & Levels', icon: Award },
              { id: 'wearables', label: 'Somatic Sync', icon: Smartphone },
              { id: 'settings', label: 'Settings & Portability', icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive 
                      ? (darkMode ? 'bg-stone-800 border border-stone-700 text-[#FF8A3D]' : 'bg-[#FEFAF7] border border-orange-100 text-[#FF8A3D]')
                      : `text-stone-500 hover:${darkMode ? 'bg-stone-800/40 text-stone-100' : 'bg-[#F5F1EE] text-stone-900'}`
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF8A3D]' : 'text-stone-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Pro Upgrader Footer banner */}
        {!profile.isPro && (
          <div className={`p-4 m-4 ${
            darkMode ? 'bg-stone-800/40 border-stone-800' : 'bg-[#FEFAF7] border-orange-100'
          } border rounded-[24px] transition-colors`}>
            <span className="text-[9px] text-[#FF8A3D] font-bold block uppercase tracking-wider mb-1">UNLOCK COGNITIVE COUPLING</span>
            <p className={`text-[10px] ${darkMode ? 'text-stone-400' : 'text-stone-600'} leading-normal`}>
              Acquire full access to unlimited Dr. Gethro prescriptions.
            </p>
            <button
              id="sidebar-btn-upgrade"
              onClick={() => setCurrentView('settings')}
              className="mt-3 w-full py-2 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white text-xs font-bold rounded-2xl transition shadow-premium-orange cursor-pointer"
            >
              Go Pro
            </button>
          </div>
        )}
      </aside>

      {/* Main Panel Frame */}
      <main className="flex-1 flex flex-col min-w-0" id="main-panel-frame">
        
        {/* Universal Subheader with calendar status node */}
        <header className={`${
          darkMode ? 'bg-stone-900 border-stone-850 text-stone-100' : 'bg-white border-stone-100 text-stone-800'
        } p-4 sm:p-6 border-b flex items-center justify-between flex-wrap gap-4 z-10 shrink-0 transition-colors duration-300`}>
          <div>
            <span className="text-[10px] text-[#FF8A3D] font-bold font-mono tracking-wider uppercase bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded">BIOLOGICAL HABIT CYCLE</span>
            <h1 className={`text-xl font-display font-extrabold ${darkMode ? 'text-stone-100' : 'text-stone-900'} mt-1 tracking-tight`}>
              {currentView === 'dashboard' && 'Growth Dashboard'}
              {currentView === 'coach' && 'Dr. Gethro AI Growth Coach'}
              {currentView === 'analytics' && 'Growth Diagnostics'}
              {currentView === 'gamification' && 'Trophy Arena'}
              {currentView === 'wearables' && 'Somatic Integrator'}
              {currentView === 'settings' && 'Welcome to Vicfungo'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Feedback & Community Ideas Button */}
            <button
              id="btn-header-feedback"
              onClick={() => setIsFeedbackModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                darkMode 
                  ? 'bg-amber-950/30 border-amber-800/60 text-amber-400 hover:bg-amber-900/40' 
                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              }`}
              title="Feedback & Community Ideas"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Feedback & Ideas</span>
            </button>

            {/* Take Interactive Tour Button */}
            <button
              id="btn-header-take-tour"
              onClick={() => setIsTourModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                darkMode 
                  ? 'bg-orange-950/30 border-orange-800/60 text-[#FF8A3D] hover:bg-orange-900/40' 
                  : 'bg-orange-50 border-orange-200 text-[#FF8A3D] hover:bg-orange-100'
              }`}
              title="Replay Interactive Tour"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Take Tour</span>
            </button>

            {/* Relaunch as New User Button */}
            <button
              id="btn-header-relaunch-new-user"
              onClick={() => setShowRelaunchConfirmModal(true)}
              className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                darkMode 
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-400 hover:bg-rose-900/40' 
                  : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
              }`}
              title="Relaunch as New User (Reset Onboarding)"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Relaunch App</span>
            </button>

            {/* Dark Mode toggle in the main header as an alternative option */}
            <button
              id="btn-header-toggle-dark"
              onClick={handleToggleDarkMode}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                darkMode 
                  ? 'bg-stone-800 border-stone-700 text-amber-400 hover:bg-stone-700' 
                  : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
              }`}
              title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* XP progress bar bubble */}
            <div className={`px-3 py-1.5 ${
              darkMode ? 'bg-stone-800 border-stone-750' : 'bg-[#F5F1EE] border-stone-100'
            } border rounded-xl flex items-center gap-2`}>
              <span className="text-xs font-mono font-bold text-orange-500">Lvl {stats.level}</span>
              <div className="w-16 bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF8A3D]" style={{ width: `${(stats.xp % 500) / 5}%` }} />
              </div>
            </div>

            {stats.streakDays > 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-100 dark:border-red-900/30 px-3 py-1.5 rounded-xl font-mono font-bold text-xs flex items-center gap-1 shrink-0">
                <Flame className="w-4 h-4 fill-current" /> {stats.streakDays}d Streak
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Panel Scroll Surface */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6" id="panel-scroll-surface">
          
          {/* Welcome Banner space as requested: "Hey, (username), you are doing Great." */}
          <div className={`mb-6 p-6 rounded-[32px] border ${
            darkMode 
              ? 'bg-gradient-to-r from-orange-950/20 to-stone-900 border-stone-800 text-stone-100 shadow-premium-dark' 
              : 'bg-gradient-to-r from-orange-50 to-white border-orange-100/60 text-stone-800 shadow-premium'
          } relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`} id="welcome-banner-node">
            <div className="absolute right-0 top-0 w-32 h-32 bg-orange-100/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-[#FF8A3D] animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-orange-500 uppercase tracking-wider">DAILY AFFIRMATION PATHWAY</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-display font-extrabold tracking-tight">
                  {motivationalMessage || (profile ? `Keep building momentum, ${profile.name}.` : "Consistency compounds.")}
                </h2>
                <button 
                  onClick={() => setMotivationalMessage(generateMotivationalMessage(profile, stats))}
                  className={`p-1 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                    darkMode 
                      ? 'border-stone-800 text-stone-400 hover:text-orange-500 hover:bg-orange-500/10' 
                      : 'border-orange-150 text-stone-500 hover:text-[#FF8A3D] hover:bg-[#FF8A3D]/5'
                  }`}
                  title="Rotate motivation message"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              </div>
              <p className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-500'} mt-1`}>
                Your daily habit stacks are synced. Dr. Gethro encourages logging actions to anchor your identity shift.
              </p>
              {profile?.identityAnchor && (
                <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/5 dark:bg-orange-500/10 rounded-xl border border-orange-200/10 dark:border-orange-500/20 text-xs text-orange-600 dark:text-orange-400">
                  <span className="font-bold text-[9px] uppercase font-mono tracking-wider bg-orange-100 dark:bg-orange-950/30 px-1.5 py-0.5 rounded">Identity</span>
                  <span className="italic font-semibold text-stone-750 dark:text-stone-300">&ldquo;{profile.identityAnchor}&rdquo;</span>
                </div>
              )}
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold font-mono">
                ● ACTIVE SESSION
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* Dashboard view */}
              {currentView === 'dashboard' && (
                <div className="space-y-6" id="dashboard-view-panel">
                  
                  {/* First Day Victory Quest Tracker */}
                  <FirstDayQuests
                    stats={stats}
                    onRewardXp={(bonusXp) => addXPForInsight(bonusXp)}
                    onNavigateView={(v) => setCurrentView(v)}
                    onOpenSomaticSession={() => launchVirtualSomatic('breathing')}
                    onOpenCreateHabitModal={() => setShowCreateModal(true)}
                    darkMode={darkMode}
                  />

                  {/* Top Day Slider Node */}
                  <div className={`p-5 rounded-[32px] border ${
                    darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'
                  } shadow-premium flex items-center justify-between flex-wrap gap-4 transition-colors`}>
                    <div>
                      <h3 className={`font-bold ${darkMode ? 'text-stone-100' : 'text-stone-800'} text-sm`}>Select Progression Node</h3>
                      <p className="text-[10px] text-stone-500 mt-0.5">Toggle days to backfill historical tasks</p>
                    </div>

                    {/* Week slider list */}
                    <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                      {weekDays.map((wd) => {
                        const active = selectedDate === wd.dateStr;
                        return (
                          <button
                            key={wd.dateStr}
                            id={`day-select-${wd.dateStr}`}
                            onClick={() => setSelectedDate(wd.dateStr)}
                            className={`p-2.5 rounded-2xl text-center transition flex flex-col items-center justify-center cursor-pointer min-w-11 ${
                              active 
                                ? 'bg-[#FF8A3D] text-white shadow-premium-orange font-bold' 
                                : `${darkMode ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-[#F5F1EE] text-stone-600 hover:bg-stone-200'}`
                            }`}
                          >
                            <span className="text-[9px] font-mono uppercase tracking-wider">{wd.label}</span>
                            <span className="text-sm font-display mt-0.5">{wd.dayNum}</span>
                            {wd.isToday && (
                              <span className={`w-1 h-1 rounded-full mt-0.5 ${active ? 'bg-white' : 'bg-[#FF8A3D]'}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Completion summary widget */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div className={`p-6 rounded-[32px] border ${
                      darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'
                    } shadow-premium md:col-span-2 flex flex-col justify-between gap-4 transition-colors relative overflow-hidden`} id="interactive-efficiency-dashboard">
                      
                      {/* Card Header with Tabs */}
                      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded uppercase">Today&apos;s Stack Efficiency</span>
                        </div>
                        
                        <div className="flex gap-1.5 bg-[#F5F1EE] dark:bg-stone-800 p-0.5 rounded-xl">
                          <button
                            id="tab-btn-gauge"
                            onClick={() => setActiveStackTab('gauge')}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                              activeStackTab === 'gauge'
                                ? 'bg-white dark:bg-stone-900 text-[#FF8A3D] shadow-sm'
                                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                            }`}
                          >
                            📊 Yield
                          </button>
                          <button
                            id="tab-btn-activate"
                            onClick={() => setActiveStackTab('activate')}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                              activeStackTab === 'activate'
                                ? 'bg-white dark:bg-stone-900 text-[#FF8A3D] shadow-sm'
                                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                            }`}
                          >
                            ⚡ Activate Space
                          </button>
                          <button
                            id="tab-btn-calibration"
                            onClick={() => setActiveStackTab('calibration')}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                              activeStackTab === 'calibration'
                                ? 'bg-white dark:bg-stone-900 text-[#FF8A3D] shadow-sm'
                                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                            }`}
                          >
                            🧪 Dopamine Lab
                          </button>
                        </div>
                      </div>

                      {/* Tab Content rendering */}
                      <div className="flex-1 py-1">
                        <AnimatePresence mode="wait">
                          {activeStackTab === 'gauge' && (
                            <motion.div
                              key="gauge-tab"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className="flex flex-col sm:flex-row items-center justify-between gap-4"
                            >
                              <div>
                                <h3 className={`text-lg font-display font-black ${darkMode ? 'text-stone-100' : 'text-stone-800'} mt-1 tracking-tight`}>
                                  {progressPercent}% Cognitive Yield
                                </h3>
                                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                  You completed {completedTodayCount} of {totalActiveCount} habit stacks configured for today.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  <button
                                    id="btn-trigger-activate-tab"
                                    onClick={() => setActiveStackTab('activate')}
                                    className="px-3.5 py-1.5 bg-orange-50 dark:bg-orange-950/25 border border-orange-100 dark:border-orange-900/30 text-xs font-bold text-[#FF8A3D] rounded-xl hover:bg-[#FF8A3D] hover:text-white transition flex items-center gap-1.5 cursor-pointer animate-pulse"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" /> Activate Today&apos;s Stacks
                                  </button>
                                  <button
                                    id="btn-trigger-playground-tab"
                                    onClick={() => setActiveStackTab('calibration')}
                                    className="px-3.5 py-1.5 bg-stone-100 dark:bg-stone-850 text-xs font-bold text-stone-600 dark:text-stone-300 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Beaker className="w-3.5 h-3.5" /> Test Splashes
                                  </button>
                                </div>
                              </div>

                              {/* Circular Progress Gauge */}
                              <div className={`w-20 h-20 rounded-full border-4 ${darkMode ? 'border-stone-800' : 'border-stone-100'} flex items-center justify-center shrink-0 relative shadow-inner`}>
                                <div className="absolute inset-0 rounded-full border-4 border-[#FF8A3D] opacity-20 animate-pulse" />
                                <span className={`text-sm font-mono font-black ${darkMode ? 'text-orange-400' : 'text-[#FF8A3D]'}`}>{progressPercent}%</span>
                              </div>
                            </motion.div>
                          )}

                          {activeStackTab === 'activate' && (
                            <motion.div
                              key="activate-tab"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className="space-y-3"
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Somatic Trigger Runner</h4>
                                <span className="text-[10px] font-mono font-bold text-[#FF8A3D] bg-orange-50 dark:bg-orange-950/25 px-2 py-0.5 rounded">
                                  {completedTodayCount}/{totalActiveCount} Completed
                                </span>
                              </div>

                              {habits.filter(h => !h.isArchived).length > 0 ? (
                                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                                  {habits
                                    .filter(h => !h.isArchived)
                                    .map(habit => {
                                      const isCompleted = !!habit.records[selectedDate]?.completed;
                                      return (
                                        <div 
                                          key={habit.id}
                                          className={`p-3 rounded-2xl border ${
                                            isCompleted 
                                              ? 'bg-emerald-500/5 border-emerald-100/30' 
                                              : (darkMode ? 'bg-stone-800/30 border-stone-850' : 'bg-stone-50 border-stone-100')
                                          } flex items-center justify-between gap-3 transition`}
                                        >
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className={`w-2 h-2 rounded-full shrink-0 ${
                                                habit.category === 'mindfulness' ? 'bg-indigo-400' :
                                                habit.category === 'health' ? 'bg-teal-400' :
                                                habit.category === 'fitness' ? 'bg-pink-400' : 'bg-[#FF8A3D]'
                                              }`} />
                                              <p className={`text-xs font-bold ${isCompleted ? 'line-through text-stone-400' : (darkMode ? 'text-stone-250' : 'text-stone-850')} truncate`}>
                                                {habit.name}
                                              </p>
                                              {(habit.id === 'def-1' || 
                                                habit.name.toLowerCase().includes('breath') || 
                                                habit.name.toLowerCase().includes('breathe') || 
                                                habit.name.toLowerCase().includes('plank') ||
                                                habit.name.toLowerCase().includes('stretch')) && (
                                                <span className="text-[8px] font-mono font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-1 py-0.5 rounded uppercase shrink-0">
                                                  Guided ⚡
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-[10px] text-stone-500 mt-0.5 truncate pl-4">
                                              Trigger: <strong>After I {habit.description.replace(/^After I\s+/i, '') || 'start my day'}</strong>
                                            </p>
                                          </div>

                                          <div className="shrink-0">
                                            {isCompleted ? (
                                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-lg">
                                                ✓ Completed
                                              </span>
                                            ) : (
                                              <button
                                                id={`btn-activate-stack-${habit.id}`}
                                                onClick={(e) => {
                                                  // Splash effect
                                                  const splashEvent = new CustomEvent('somatic-dopamine-splash', {
                                                    detail: { x: e.clientX, y: e.clientY }
                                                  });
                                                  window.dispatchEvent(splashEvent);
                                                  playSuccessSound();
                                                  handleToggleComplete(habit.id, { completed: true });
                                                }}
                                                className="px-3 py-1.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white text-[10px] font-bold rounded-xl transition shadow-sm hover:shadow cursor-pointer"
                                              >
                                                ⚡ Trigger
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              ) : (
                                <p className="text-xs text-stone-500 py-4 text-center">
                                  No active habit stacks configured. Click &ldquo;+ Stack Habit&rdquo; below to get started!
                                </p>
                              )}
                            </motion.div>
                          )}

                          {activeStackTab === 'calibration' && (() => {
                            // Category completion percentages
                            const completedHabits = habits.filter(h => !h.isArchived);
                            
                            const dopamineCount = completedHabits.filter(h => (h.category === 'productivity' || h.category === 'health') && h.records[selectedDate]?.completed).length;
                            const dopamineTotal = completedHabits.filter(h => h.category === 'productivity' || h.category === 'health').length || 1;
                            const dopaminePct = Math.min(100, Math.round((dopamineCount / dopamineTotal) * 100));

                            const serotoninCount = completedHabits.filter(h => h.category === 'mindfulness' && h.records[selectedDate]?.completed).length;
                            const serotoninTotal = completedHabits.filter(h => h.category === 'mindfulness').length || 1;
                            const serotoninPct = Math.min(100, Math.round((serotoninCount / serotoninTotal) * 100));

                            const endorphinCount = completedHabits.filter(h => h.category === 'fitness' && h.records[selectedDate]?.completed).length;
                            const endorphinTotal = completedHabits.filter(h => h.category === 'fitness').length || 1;
                            const endorphinPct = Math.min(100, Math.round((endorphinCount / endorphinTotal) * 100));

                            return (
                              <motion.div
                                key="calibration-tab"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-4"
                              >
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-stone-550 dark:text-stone-400 uppercase tracking-wider">Neurochemical Laboratory</h4>
                                  <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/15 animate-pulse">● LIVE REACTIONS</span>
                                </div>

                                <p className="text-[11px] text-stone-500 leading-relaxed -mt-1.5">
                                  Completing routines triggers chemical reactions. Watch fluids rise and bubbles float as evidence of physiological shift.
                                </p>

                                {/* Vessel Row */}
                                <div className="grid grid-cols-3 gap-3 pt-2 bg-stone-50/50 dark:bg-stone-900/35 p-4 rounded-3xl border border-stone-150/45 dark:border-stone-850/60">
                                  {[
                                    { name: 'Dopamine', pct: dopaminePct, color: 'from-orange-500 to-amber-400', glow: 'shadow-orange-500/40', textColor: 'text-orange-500', bubbleColor: 'bg-orange-300', note: 'Productivity' },
                                    { name: 'Serotonin', pct: serotoninPct, color: 'from-emerald-500 to-teal-400', glow: 'shadow-emerald-500/40', textColor: 'text-emerald-500', bubbleColor: 'bg-emerald-300', note: 'Mindfulness' },
                                    { name: 'Endorphins', pct: endorphinPct, color: 'from-fuchsia-500 to-pink-400', glow: 'shadow-fuchsia-500/40', textColor: 'text-fuchsia-500', bubbleColor: 'bg-fuchsia-300', note: 'Somatic/Fitness' }
                                  ].map((tube) => (
                                    <div key={tube.name} className="flex flex-col items-center gap-1.5">
                                      {/* Glowing test tube */}
                                      <div className={`relative w-10 sm:w-12 h-28 sm:h-32 rounded-b-full border-2 border-stone-300 dark:border-stone-750 bg-stone-100/5 dark:bg-stone-950/50 overflow-hidden flex flex-col justify-end shadow-inner`}>
                                        
                                        {/* Fluid filler */}
                                        <motion.div
                                          className={`w-full bg-gradient-to-t ${tube.color} relative rounded-b-full shadow-lg ${tube.glow}`}
                                          initial={{ height: '15%' }}
                                          animate={{ height: `${Math.max(15, tube.pct)}%` }}
                                          transition={{ type: 'spring', damping: 15, stiffness: 60 }}
                                        >
                                          {/* Floating bubbles */}
                                          <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                            {[...Array(5)].map((_, i) => (
                                              <motion.div
                                                key={i}
                                                className={`absolute rounded-full opacity-70 ${tube.bubbleColor}`}
                                                style={{
                                                  width: `${2 + (i % 3) * 2}px`,
                                                  height: `${2 + (i % 3) * 2}px`,
                                                  left: `${15 + (i * 18) % 65}%`,
                                                  bottom: '0px'
                                                }}
                                                animate={{
                                                  y: ['0px', '-110px'],
                                                  opacity: [0, 0.9, 0],
                                                  scale: [0.7, 1.3, 0.4]
                                                }}
                                                transition={{
                                                  duration: 1.8 + (i % 2) * 1.2,
                                                  repeat: Infinity,
                                                  delay: i * 0.35,
                                                  ease: "easeInOut"
                                                }}
                                              />
                                            ))}
                                          </div>
                                          
                                          {/* Fluid meniscus shimmer */}
                                          <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 blur-[0.5px]" />
                                        </motion.div>
                                      </div>
                                      
                                      {/* Metadata */}
                                      <div className="text-center">
                                        <p className="text-[10px] font-bold text-stone-750 dark:text-stone-350 leading-none">{tube.name}</p>
                                        <p className="text-[8px] text-stone-400 mt-0.5">{tube.note}</p>
                                        <p className={`text-[11px] font-mono font-black ${tube.textColor} mt-1`}>{tube.pct}%</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Custom spark parameters */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                  <div className="p-3 bg-stone-50/50 dark:bg-stone-900/35 rounded-2xl border border-stone-150/45 dark:border-stone-850/60 flex flex-col justify-between">
                                    <div className="flex justify-between text-[10px] font-mono text-stone-500 mb-1.5">
                                      <span>Reactor Vol.</span>
                                      <strong className="text-[#FF8A3D]">{customSplashIntensity} Sparks</strong>
                                    </div>
                                    <input 
                                      type="range" 
                                      min="15" 
                                      max="120" 
                                      value={customSplashIntensity} 
                                      onChange={(e) => setCustomSplashIntensity(Number(e.target.value))}
                                      className="w-full accent-[#FF8A3D] cursor-pointer h-1.5 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none"
                                    />
                                    <div className="flex gap-1.5 mt-2.5">
                                      {['mixed', 'dopamine', 'serotonin', 'endorphin'].map((theme) => (
                                        <button
                                          key={theme}
                                          onClick={() => setCustomSplashColor(theme)}
                                          className={`px-2 py-0.5 text-[8px] font-bold rounded-md capitalize transition border cursor-pointer flex-1 ${
                                            customSplashColor === theme
                                              ? 'bg-[#FF8A3D] text-white border-[#FF8A3D]'
                                              : `${darkMode ? 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200' : 'bg-white border-stone-200 text-stone-600 hover:text-[#FF8A3D]'}`
                                          }`}
                                        >
                                          {theme}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <button
                                    onClick={(e) => {
                                      const colorsMap: Record<string, string[]> = {
                                        mixed: [],
                                        dopamine: ['#FF8A3D', '#FFB443', '#FFCE56', '#F59E0B'],
                                        serotonin: ['#10B981', '#34D399', '#A7F3D0', '#059669'],
                                        endorphin: ['#EC4899', '#F472B6', '#8B5CF6', '#D946EF']
                                      };
                                      const colors = colorsMap[customSplashColor] || [];
                                      const splashEvent = new CustomEvent('somatic-dopamine-splash', {
                                        detail: { 
                                          x: e.clientX, 
                                          y: e.clientY, 
                                          pCount: customSplashIntensity, 
                                          colors 
                                        }
                                      });
                                      window.dispatchEvent(splashEvent);
                                      playSuccessSound();
                                    }}
                                    className="p-4 bg-gradient-to-r from-orange-500 to-[#FF8A3D] text-white rounded-2xl shadow-premium-orange hover:brightness-115 active:scale-[0.98] transition flex flex-col items-center justify-center text-center cursor-pointer border border-orange-400/20"
                                  >
                                    <span className="text-[10px] font-black tracking-widest uppercase mb-1">💥 Spark Neuro-Reactor</span>
                                    <span className="text-[8px] opacity-80 leading-normal font-medium max-w-[150px]">Ignite direct visual particles radiating from your cursor</span>
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })()}
                        </AnimatePresence>
                      </div>

                    </div>

                    <div className={`p-6 rounded-[32px] border ${
                      darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'
                    } shadow-premium flex flex-col justify-between transition-colors`}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                        <h4 className={`text-xs font-bold ${darkMode ? 'text-stone-300' : 'text-stone-700'} uppercase tracking-wider`}>Dr. Gethro&apos;s Tip</h4>
                      </div>
                      <p className={`text-[11px] ${darkMode ? 'text-stone-300' : 'text-stone-600'} leading-normal italic mt-2`}>
                        &ldquo;To cement {profile.growthPersona} styles, complete your first stacked contract within 30 minutes of waking.&rdquo;
                      </p>
                    </div>

                  </div>

                  {/* Somatic Neuro-Chemical Equilibrium Panel */}
                  <div className={`p-6 rounded-[32px] border ${
                    darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'
                  } shadow-premium transition-colors duration-300 relative overflow-hidden`} id="somatic-neurochemical-panel">
                    <div className="absolute right-0 top-0 w-36 h-36 bg-orange-100/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-150 flex items-center justify-center shadow-sm shrink-0">
                        <Brain className="w-4.5 h-4.5 text-[#FF8A3D] animate-pulse" />
                      </div>
                      <div>
                        <h3 className={`text-sm font-display font-black ${darkMode ? 'text-stone-100' : 'text-stone-800'} tracking-tight`}>
                          Somatic Neuro-Chemical Equilibrium
                        </h3>
                        <p className="text-[10px] text-stone-500 font-medium">
                          Estimated biological concentrations calibrated from stack progress & linked somatic telemetry.
                        </p>
                      </div>
                    </div>

                    {stats.totalCompletedCount === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center p-8 bg-stone-50/50 dark:bg-stone-900/30 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
                        <div className="w-12 h-12 bg-orange-100/60 dark:bg-orange-950/30 rounded-full flex items-center justify-center text-orange-600 dark:text-[#FF8A3D] mb-3 animate-pulse">
                          <Brain className="w-6 h-6 animate-pulse" />
                        </div>
                        <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">No calibration data yet</h4>
                        <p className="text-xs text-stone-500 mt-1.5 max-w-md leading-relaxed">
                          Your neurochemical insights will appear as you build consistency. Complete your first habit to begin baseline neurochemical calibration!
                        </p>
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
                          <div className="p-3 bg-white dark:bg-stone-850 rounded-xl border border-stone-150/40 dark:border-stone-800 text-left">
                            <span className="text-[10px] font-bold text-stone-450 dark:text-stone-500 block uppercase">⚡ Dopamine</span>
                            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 mt-1 block font-mono">Calibrating...</span>
                          </div>
                          <div className="p-3 bg-white dark:bg-stone-850 rounded-xl border border-stone-150/40 dark:border-stone-800 text-left">
                            <span className="text-[10px] font-bold text-stone-450 dark:text-stone-500 block uppercase">🌱 Serotonin</span>
                            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 mt-1 block font-mono">Calibrating...</span>
                          </div>
                          <div className="p-3 bg-white dark:bg-stone-850 rounded-xl border border-stone-150/40 dark:border-stone-800 text-left">
                            <span className="text-[10px] font-bold text-stone-450 dark:text-stone-500 block uppercase">🏃 Endorphins</span>
                            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 mt-1 block font-mono">Calibrating...</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Dopamine */}
                        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-stone-800/40 border-stone-800' : 'bg-orange-50/15 border-orange-100/40'} flex flex-col justify-between`}>
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                                ⚡ Dopamine
                              </span>
                              <span className="text-xs font-mono font-bold text-[#FF8A3D]">
                                {dopamineLevel}%
                              </span>
                            </div>
                            
                            <div className="w-full bg-[#F5F1EE] dark:bg-stone-850 h-2.5 rounded-full overflow-hidden border border-stone-150 dark:border-stone-800 p-0.5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${dopamineLevel}%` }}
                                transition={{ duration: 1 }}
                                className="h-full bg-[#FF8A3D] rounded-full"
                              />
                            </div>
                          </div>
                          <p className={`text-[10px] ${darkMode ? 'text-stone-400' : 'text-stone-500'} leading-relaxed mt-3`}>
                            <strong>Attention & Drive:</strong> Fuels task motivation. Stacking contract completions spikes concentration level.
                          </p>
                        </div>

                        {/* Serotonin */}
                        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-stone-800/40 border-stone-800' : 'bg-emerald-50/15 border-emerald-100/40'} flex flex-col justify-between`}>
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                                🌱 Serotonin
                              </span>
                              <span className="text-xs font-mono font-bold text-emerald-500">
                                {serotoninLevel}%
                              </span>
                            </div>
                            
                            <div className="w-full bg-[#F5F1EE] dark:bg-stone-850 h-2.5 rounded-full overflow-hidden border border-stone-150 dark:border-stone-800 p-0.5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${serotoninLevel}%` }}
                                transition={{ duration: 1 }}
                                className="h-full bg-emerald-500 rounded-full"
                              />
                            </div>
                          </div>
                          <p className={`text-[10px] ${darkMode ? 'text-stone-400' : 'text-stone-500'} leading-relaxed mt-3`}>
                            <strong>Cognitive Tone:</strong> Stabilizes mental stamina. Boosted by mindful reflection logs and deep breathing.
                          </p>
                        </div>

                        {/* Endorphins */}
                        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-stone-800/40 border-stone-800' : 'bg-pink-50/15 border-pink-100/40'} flex flex-col justify-between`}>
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                                🏃 Endorphins
                              </span>
                              <span className="text-xs font-mono font-bold text-pink-500">
                                {endorphinLevel}%
                              </span>
                            </div>
                            
                            <div className="w-full bg-[#F5F1EE] dark:bg-stone-850 h-2.5 rounded-full overflow-hidden border border-stone-150 dark:border-stone-800 p-0.5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${endorphinLevel}%` }}
                                transition={{ duration: 1 }}
                                className="h-full bg-pink-500 rounded-full"
                              />
                            </div>
                          </div>
                          <p className={`text-[10px] ${darkMode ? 'text-stone-400' : 'text-stone-500'} leading-relaxed mt-3`}>
                            <strong>Physical Flow:</strong> Counters bodily stress. Unlocked by physical fitness targets and synced wearable steps.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Somatic Practice Laboratory */}
                  <div className={`p-6 rounded-[32px] border ${
                    darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'
                  } shadow-premium transition-colors relative overflow-hidden`} id="somatic-practice-laboratory">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded uppercase">Interactive Somatic Labs</span>
                          <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">● AUDIO READY</span>
                        </div>
                        <h3 className={`text-base font-display font-extrabold ${darkMode ? 'text-stone-100' : 'text-stone-900'} mt-1.5 tracking-tight`}>
                          Somatic Exercise Quick-Launch Hub
                        </h3>
                        <p className="text-xs text-stone-500 leading-relaxed max-w-2xl mt-0.5">
                          Instantly launch guided physical stretch, box-breathing, or core somatic exercises. 
                          Completing a session triggers full-screen visual biofeedback, customized synth tones, and awards direct XP!
                        </p>
                      </div>

                      <div className="text-[10px] text-stone-400 font-medium italic border-l-2 border-orange-500/30 pl-3 max-w-[220px]">
                        💡 Or, check off any habit containing &ldquo;breath&rdquo;, &ldquo;breathe&rdquo;, &ldquo;stretch&rdquo; or &ldquo;plank&rdquo; to launch guided versions!
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                      {/* Breathing */}
                      <div className={`p-4 rounded-2xl border ${
                        darkMode ? 'bg-stone-850/40 border-stone-800 hover:border-orange-500/40' : 'bg-white border-stone-150 hover:border-orange-200 hover:shadow-sm'
                      } transition flex flex-col justify-between`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#FF8A3D] font-mono">💨 4-4-4 BOX CYCLE</span>
                            <span className="text-[9px] font-mono bg-orange-50 dark:bg-orange-950/20 text-[#FF8A3D] px-1.5 py-0.5 rounded">35 XP</span>
                          </div>
                          <h4 className={`font-bold ${darkMode ? 'text-stone-200' : 'text-stone-800'} text-xs mt-2.5`}>Guided Zen Breathing</h4>
                          <p className="text-[10px] text-stone-500 mt-1 leading-normal">
                            Slow down heart-rate variability and reset neurological focus using structured inhale, hold, and exhale stages.
                          </p>
                        </div>
                        <button
                          onClick={() => launchVirtualSomatic('breathing')}
                          className="mt-4 w-full py-2 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white text-[11px] font-bold rounded-xl shadow-premium-orange transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" /> Begin Breathwork
                        </button>
                      </div>

                      {/* Stretch */}
                      <div className={`p-4 rounded-2xl border ${
                        darkMode ? 'bg-stone-850/40 border-stone-800 hover:border-orange-500/40' : 'bg-white border-stone-150 hover:border-orange-200 hover:shadow-sm'
                      } transition flex flex-col justify-between`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-teal-500 font-mono">🙆 PROPRIOCEPTIVE</span>
                            <span className="text-[9px] font-mono bg-teal-50 dark:bg-teal-950/20 text-teal-600 px-1.5 py-0.5 rounded">25 XP</span>
                          </div>
                          <h4 className={`font-bold ${darkMode ? 'text-stone-200' : 'text-stone-800'} text-xs mt-2.5`}>30s Centering Stretch</h4>
                          <p className="text-[10px] text-stone-500 mt-1 leading-normal">
                            A quick physical alignment to open posture, release thoracic muscle tension, and realign cognitive connection.
                          </p>
                        </div>
                        <button
                          onClick={() => launchVirtualSomatic('stretch')}
                          className="mt-4 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" /> Start Stretch
                        </button>
                      </div>

                      {/* Plank */}
                      <div className={`p-4 rounded-2xl border ${
                        darkMode ? 'bg-stone-850/40 border-stone-800 hover:border-orange-500/40' : 'bg-white border-stone-150 hover:border-orange-200 hover:shadow-sm'
                      } transition flex flex-col justify-between`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-500 font-mono">⚡ POSTURAL FOCUS</span>
                            <span className="text-[9px] font-mono bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 px-1.5 py-0.5 rounded">30 XP</span>
                          </div>
                          <h4 className={`font-bold ${darkMode ? 'text-stone-200' : 'text-stone-800'} text-xs mt-2.5`}>30s Core Activation Plank</h4>
                          <p className="text-[10px] text-stone-500 mt-1 leading-normal">
                            Activate fundamental spinal stabilization structures to instantly spike neural alertness and attention.
                          </p>
                        </div>
                        <button
                          onClick={() => launchVirtualSomatic('plank')}
                          className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" /> Engage Core
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Bento Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Column: Habits (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Habit List Management Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className={`text-base font-display font-extrabold ${darkMode ? 'text-stone-100' : 'text-stone-800'} tracking-tight`}>Active Stack Contracts</h2>
                          <p className="text-xs text-stone-500">Uncompromising daily behavioral structures</p>
                        </div>

                        <button
                          id="btn-trigger-create-modal"
                          onClick={() => setShowCreateModal(true)}
                          className="px-4 py-2 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white text-xs font-bold rounded-2xl shadow-premium-orange transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Stack Habit
                        </button>
                      </div>

                      {/* Render habits list */}
                      {habits.filter(h => !h.isArchived).length > 0 ? (
                        <div className="space-y-3" id="active-habits-list-frame">
                          {habits
                            .filter(h => !h.isArchived)
                            .map(habit => (
                              <HabitCard
                                key={habit.id}
                                habit={habit}
                                selectedDate={selectedDate}
                                onToggleComplete={handleToggleComplete}
                                onDelete={handleDeleteHabit}
                              />
                            ))}
                        </div>
                      ) : (
                        <div className={`py-12 text-center border-2 border-dashed ${
                          darkMode ? 'border-stone-800 bg-stone-900/30' : 'border-stone-200 bg-white'
                        } rounded-[32px] p-8`}>
                          <AlertCircle className="w-8 h-8 text-neutral-300 mx-auto mb-2 animate-bounce" />
                          <h3 className={`font-bold ${darkMode ? 'text-stone-200' : 'text-stone-800'} text-sm`}>No Active Habit Stacks</h3>
                          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                            Behavioral psychology suggests starting with tiny 2-minute habits. Click &ldquo;Stack Habit&rdquo; above to structure your first contract!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Daily To-Do List (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className={`p-6 rounded-[32px] border ${
                        darkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-100 text-stone-800'
                      } shadow-premium flex flex-col h-full`} id="todo-list-bento-node">
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ListTodo className="w-5 h-5 text-[#FF8A3D]" />
                            <h2 className="text-base font-display font-extrabold tracking-tight">Daily Action List</h2>
                          </div>
                          <span className="text-[10px] bg-orange-100 dark:bg-orange-950/40 text-[#FF8A3D] font-bold px-2 py-0.5 rounded-full font-mono">
                            +{todos.filter(t => !t.completed).length * 15} XP POTENTIAL
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                          Doctor Gethro encourages listing immediate everyday actions alongside your identity habits to cement cognitive completion.
                        </p>

                        {/* Add Todo Form */}
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const input = form.elements.namedItem('todoText') as HTMLInputElement;
                            if (!input || !input.value.trim()) return;
                            handleAddTodo(input.value, () => {
                              form.reset();
                            });
                          }}
                          className="flex gap-2 mb-4"
                        >
                          <input 
                            name="todoText"
                            type="text"
                            placeholder="Add everyday action node..."
                            className={`flex-1 px-3.5 py-2 text-xs rounded-2xl border ${
                              darkMode 
                                ? 'bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-500 focus:border-[#FF8A3D]' 
                                : 'bg-[#FEFAF7] border-stone-200 text-stone-800 placeholder-stone-400 focus:border-[#FF8A3D]'
                            } focus:outline-none transition`}
                          />
                          <button 
                            type="submit"
                            className="px-3.5 bg-[#FF8A3D] text-white hover:bg-[#e77a2f] rounded-2xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </form>

                        {/* Todos Items */}
                        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                          {todos.length > 0 ? (
                            todos.map(todo => (
                              <div 
                                key={todo.id}
                                className={`p-3 rounded-2xl border ${
                                  todo.completed 
                                    ? (darkMode ? 'bg-stone-900/40 border-stone-800/50 opacity-60' : 'bg-[#F5F1EE] border-stone-100 opacity-70')
                                    : (darkMode ? 'bg-stone-800/40 border-stone-800' : 'bg-[#FEFAF7] border-stone-100/60')
                                } transition flex flex-col gap-1.5 group`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <label className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0">
                                    <input 
                                      type="checkbox"
                                      checked={todo.completed}
                                      onChange={(e) => {
                                        if (!todo.completed) {
                                          const splashEvent = new CustomEvent('somatic-dopamine-splash', {
                                            detail: { 
                                              x: e.nativeEvent.clientX || e.clientX || window.innerWidth / 2, 
                                              y: e.nativeEvent.clientY || e.clientY || window.innerHeight / 2 
                                            }
                                          });
                                          window.dispatchEvent(splashEvent);
                                        }
                                        handleToggleTodo(todo.id);
                                      }}
                                      className="mt-0.5 rounded text-[#FF8A3D] focus:ring-[#FF8A3D] border-stone-300 w-4 h-4 shrink-0"
                                    />
                                    <span className={`text-xs font-medium leading-tight ${
                                      todo.completed ? 'line-through text-stone-400' : (darkMode ? 'text-stone-200' : 'text-stone-700')
                                    } break-words`}>
                                      {todo.text}
                                    </span>
                                  </label>
                                  <button 
                                    type="button"
                                    onClick={() => handleDeleteTodo(todo.id)}
                                    className="text-stone-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100 shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                
                                {/* Dr. Gethro encouragement note */}
                                {!todo.completed && todo.encouragement && (
                                  <div className="pl-6 text-[10px] text-[#FF8A3D]/90 font-medium italic leading-normal flex items-start gap-1">
                                    <span className="shrink-0">💡</span>
                                    <span>Gethro: &ldquo;{todo.encouragement}&rdquo;</span>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center text-stone-400 text-xs">
                              No daily actions listed. Add one above!
                            </div>
                          )}
                        </div>

                        {/* Completion counter bar */}
                        {todos.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-stone-150 flex items-center justify-between text-[11px] font-medium text-stone-500">
                            <span>
                              Completed {todos.filter(t => t.completed).length}/{todos.length} Action Nodes
                            </span>
                            <span className="text-[#FF8A3D] font-mono">
                              +{todos.filter(t => t.completed).length * 15} XP claimed
                            </span>
                          </div>
                        )}

                      </div>
                    </div>

                  </div>

                  {/* Intelligent Calendar and Chrono-Gap Interceptor */}
                  <IntelligentCalendar 
                    habits={habits}
                    selectedDate={selectedDate}
                    onExecuteHabit={(habit) => handleToggleComplete(habit.id, undefined, false)}
                    darkMode={darkMode}
                  />

                  {/* Cognitive Science Template library */}
                  <div className={`p-6 rounded-[32px] border ${
                    darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'
                  } shadow-premium transition-colors`}>
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-[#FF8A3D]" />
                      <h3 className={`font-bold ${darkMode ? 'text-stone-100' : 'text-stone-800'} text-sm`}>Cognitive Science Prescription Templates</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { title: 'The 2-Minute Zen Breathe', cat: 'mindfulness' as const, trigger: 'brew morning coffee', principle: 'Friction Reduction' as const, diff: 'easy' as const, xp: 30, desc: 'Instantly deep-breathe after coffee' },
                        { title: 'Hydration Cell Prep', cat: 'health' as const, trigger: 'walk into workspace', principle: 'Habit Stacking' as const, diff: 'easy' as const, xp: 25, desc: 'Chug 500ml of water at your desk' },
                        { title: 'Executive Journaling', cat: 'productivity' as const, trigger: 'close my daytime laptop', principle: 'Identity Shift' as const, diff: 'medium' as const, xp: 45, desc: 'Log 3 priority blocks for tomorrow' }
                      ].map((temp, i) => (
                        <div key={i} className={`p-4 ${
                          darkMode ? 'bg-stone-800/50 border-stone-800 hover:border-orange-500/40 hover:bg-stone-800' : 'bg-[#F5F1EE] border-stone-100 hover:border-orange-200 hover:bg-orange-50/20'
                        } border rounded-[24px] transition flex flex-col justify-between`}>
                          <div>
                            <span className="text-[10px] bg-orange-50 dark:bg-orange-950/20 text-orange-600 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">{temp.principle}</span>
                            <h4 className={`font-bold ${darkMode ? 'text-stone-100' : 'text-stone-800'} text-xs mt-2`}>{temp.title}</h4>
                            <p className="text-[10px] text-stone-500 mt-1 leading-normal">{temp.desc}</p>
                          </div>
                          <button
                            id={`btn-add-template-${i}`}
                            onClick={() => handleAddTemplate(temp.title, temp.cat, temp.trigger, temp.principle, temp.diff, temp.xp)}
                            className={`mt-4 w-full py-1.5 bg-white dark:bg-stone-900 border ${
                              darkMode ? 'border-stone-700 hover:border-[#FF8A3D] text-orange-400' : 'border-stone-200 hover:border-[#FF8A3D] text-[#FF8A3D]'
                            } hover:bg-[#FF8A3D] hover:text-white text-[10px] font-bold rounded-xl shadow-sm transition cursor-pointer`}
                          >
                            + Quick Stack
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* AICoach View */}
              {currentView === 'coach' && (
                <AICoach 
                  userProfile={profile} 
                  habits={habits} 
                  onAddInsightXP={addXPForInsight}
                />
              )}

              {/* Analytics View */}
              {currentView === 'analytics' && (
                <Analytics 
                  habits={habits} 
                  userProfile={profile} 
                  stats={stats} 
                />
              )}

              {/* Gamification View */}
              {currentView === 'gamification' && (
                <Gamification 
                  stats={stats} 
                  onClaimChallengeXP={handleClaimChallengeXP} 
                />
              )}

              {/* WearableSync View */}
              {currentView === 'wearables' && (
                <WearableSync 
                  stats={stats} 
                  onSyncComplete={handleSyncComplete} 
                  darkMode={darkMode}
                />
              )}

              {/* Settings View */}
              {currentView === 'settings' && (
                <Settings
                  userProfile={profile}
                  stats={stats}
                  habits={habits}
                  onUpgradePro={handleUpgradePro}
                  onRestoreData={handleRestoreData}
                  onClearAllData={handleClearAllData}
                  darkMode={darkMode}
                  onToggleDarkMode={handleToggleDarkMode}
                  onUpdateProfile={(updatedProfile) => {
                    setProfile(updatedProfile);
                    localStorage.setItem('vicfungo_profile', JSON.stringify(updatedProfile));
                  }}
                  onOpenTour={() => setIsTourModalOpen(true)}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Habit Creation Modal Overlay */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            id="habit-create-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-100 relative overflow-hidden"
              id="habit-create-modal-content"
            >
              {/* Decorative accent top bar */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-[#FF8A3D] to-amber-500" />
              
              <div className="mb-4">
                <span className="text-[10px] text-[#FF8A3D] font-mono font-bold bg-orange-50 px-2 py-0.5 rounded uppercase">Tiny Habits Contract Builder</span>
                <h3 className="text-xl font-display font-extrabold text-stone-900 mt-2">Construct New Habit Loop</h3>
              </div>

              <form onSubmit={handleCreateHabit} className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="modal-new-habit-name" className="block text-xs font-semibold text-stone-600 mb-1">What small habit would you like to build?</label>
                  <input
                    id="modal-new-habit-name"
                    type="text"
                    required
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g. Read 5 pages, stretch for 2 minutes, drink a glass of water"
                    className="w-full px-3.5 py-2.5 bg-[#FEFAF7] border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#FF8A3D] focus:bg-white transition"
                  />
                </div>

                {/* Trigger */}
                <div>
                  <label htmlFor="modal-new-habit-trigger" className="block text-xs font-semibold text-stone-600 mb-1">What do you already do every day that can remind you to do it?</label>
                  <p className="text-[10px] text-stone-400 mb-1.5 leading-normal">
                    An existing daily routine you already do automatically (like brushing teeth, finishing breakfast, or sitting down at your desk) that will remind you to do this new habit.
                  </p>
                  <input
                    id="modal-new-habit-trigger"
                    type="text"
                    required
                    value={newHabitTrigger}
                    onChange={(e) => setNewHabitTrigger(e.target.value)}
                    placeholder="e.g. Brush my teeth, finish breakfast, sit down at my desk"
                    className="w-full px-3.5 py-2.5 bg-[#FEFAF7] border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#FF8A3D] focus:bg-white transition"
                  />
                </div>

                {/* Categories and Principles row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="modal-new-habit-category" className="block text-xs font-semibold text-stone-500 mb-1">CATEGORY</label>
                    <select
                      id="modal-new-habit-category"
                      value={newHabitCategory}
                      onChange={(e) => setNewHabitCategory(e.target.value as HabitCategory)}
                      className="w-full px-3 py-2 bg-[#FEFAF7] border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#FF8A3D] cursor-pointer"
                    >
                      <option value="productivity">Productivity</option>
                      <option value="mindfulness">Mindfulness</option>
                      <option value="health">Health & Wellness</option>
                      <option value="fitness">Fitness</option>
                      <option value="learning">Learning</option>
                      <option value="social">Social</option>
                      <option value="finance">Finance</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="modal-new-habit-principle" className="block text-xs font-semibold text-stone-500 mb-1">PSYCH PRINCIPLE</label>
                    <select
                      id="modal-new-habit-principle"
                      value={newHabitPrinciple}
                      onChange={(e) => setNewHabitPrinciple(e.target.value as PsychologicalPrinciple)}
                      className="w-full px-3 py-2 bg-[#FEFAF7] border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#FF8A3D] cursor-pointer"
                    >
                      <option value="Habit Stacking">Habit Stacking</option>
                      <option value="Friction Reduction">Friction Reduction</option>
                      <option value="Temptation Bundling">Temptation Bundling</option>
                      <option value="Identity Shift">Identity Shift</option>
                      <option value="Implementation Intention">Implementation Intention</option>
                      <option value="Instant Reward">Instant Reward</option>
                    </select>
                  </div>
                </div>

                {/* Difficulty and Time row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="modal-new-habit-difficulty" className="block text-xs font-semibold text-stone-500 mb-1">DIFFICULTY</label>
                    <select
                      id="modal-new-habit-difficulty"
                      value={newHabitDifficulty}
                      onChange={(e) => setNewHabitDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#FEFAF7] border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#FF8A3D] cursor-pointer"
                    >
                      <option value="easy">Easy (+30 XP)</option>
                      <option value="medium">Medium (+45 XP)</option>
                      <option value="hard">Hard (+60 XP)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="modal-new-habit-reminder" className="block text-xs font-semibold text-stone-500 mb-1">REMINDER NODE</label>
                    <input
                      id="modal-new-habit-reminder"
                      type="time"
                      value={newHabitReminder}
                      onChange={(e) => setNewHabitReminder(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FEFAF7] border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Optional Custom Description */}
                <div>
                  <label htmlFor="modal-new-habit-description" className="block text-xs font-semibold text-stone-500 mb-1">CUSTOM DESCRIPTION / NOTES (OPTIONAL)</label>
                  <textarea
                    id="modal-new-habit-description"
                    rows={2}
                    value={newHabitDesc}
                    onChange={(e) => setNewHabitDesc(e.target.value)}
                    placeholder="Provide a subtle identity motivation..."
                    className="w-full px-3.5 py-2 bg-[#FEFAF7] border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#FF8A3D] resize-none"
                  />
                </div>

                {newHabitName && newHabitTrigger && (
                  <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl text-[11px] text-[#FF8A3D] font-medium leading-relaxed">
                    💡 <strong>Your Stack Formulation:</strong> &ldquo;After I <strong>{newHabitTrigger}</strong>, I will <strong>{newHabitName}</strong>.&rdquo;
                  </div>
                )}

                {/* Submit actions */}
                <div className="flex gap-2 pt-3 justify-end">
                  <button
                    id="btn-cancel-create-habit"
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 text-xs text-stone-500 hover:text-stone-700 transition font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-create-habit"
                    type="submit"
                    className="px-6 py-2.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white text-xs font-bold rounded-2xl transition shadow-premium-orange cursor-pointer"
                  >
                    Commit Contract
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showBravoPopup && (
          <motion.div
            id="bravo-popup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
            onClick={() => setShowBravoPopup(false)}
          >
            <motion.div
              id="bravo-popup-container"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md p-6 sm:p-8 rounded-[36px] border ${
                darkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-orange-100 text-stone-800'
              } shadow-2xl relative overflow-hidden`}
            >
              {/* Abstract orange background burst */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/10 dark:bg-orange-950/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col items-center text-center">
                {/* Pop trophy animation ring */}
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/30 text-[#FF8A3D] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-orange-100/50 dark:shadow-none animate-bounce">
                  <Trophy className="w-8 h-8" />
                </div>

                <span className="text-[10px] font-mono font-bold text-orange-500 uppercase tracking-wider mb-1.5">BEHAVIORAL MILESTONE DETECTED</span>
                
                <h3 className={`text-2xl font-display font-black tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                  {profile?.identityAnchor ? 'Identity Reinforced! 🛡️' : 'Bravo! 🎉'}
                </h3>

                <p className={`text-xs ${darkMode ? 'text-stone-300' : 'text-stone-600'} leading-relaxed mb-5`}>
                  {bravoMessage}
                </p>

                {/* Cognitive Science Writeup Beneath */}
                <div className={`w-full p-4 rounded-2xl border mb-6 text-left ${
                  darkMode ? 'bg-stone-800/40 border-stone-750' : 'bg-orange-50/30 border-orange-100/50'
                }`}>
                  <div className="flex gap-2 items-start">
                    <span className="text-sm">💡</span>
                    <div>
                      <h4 className="text-[11px] font-bold text-[#FF8A3D] uppercase tracking-wider">Doctor Gethro&apos;s Principle</h4>
                      <p className={`text-[11px] font-medium leading-normal mt-0.5 ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                        Consistency to finishing your tasks is key. Small victories repeated daily compound exponentially, establishing the identity shifting habits of peak performers.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-dismiss-bravo"
                  onClick={() => setShowBravoPopup(false)}
                  className="w-full py-3 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white text-xs font-bold rounded-2xl transition shadow-premium-orange cursor-pointer"
                >
                  Anchor This Victory
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DopamineExplosion />

      {/* Intentional and Custom Completion Flow Overlay */}
      <AnimatePresence>
        {completionFlow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`w-full max-w-lg rounded-[36px] overflow-hidden border p-8 flex flex-col relative text-center shadow-2xl transition-all ${
                darkMode 
                  ? 'bg-stone-900 border-stone-800 text-stone-100' 
                  : 'bg-[#FEFAF7] border-orange-100 text-stone-850'
              }`}
            >
              {/* Close/Cancel button */}
              <button
                onClick={() => setCompletionFlow(null)}
                className={`absolute top-6 right-6 p-2 rounded-full border transition cursor-pointer ${
                  darkMode 
                    ? 'border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200' 
                    : 'border-orange-100 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-850'
                }`}
              >
                ✕
              </button>

              {/* STAGE 1: Confirm Completion */}
              {completionFlow.stage === 'confirm' && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-orange-100/60 dark:bg-orange-950/20 rounded-full flex items-center justify-center text-[#FF8A3D] mb-5">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>

                  <h3 className="text-xl font-display font-black tracking-tight">
                    Have you completed this habit, {profile?.name}?
                  </h3>
                  
                  <div className={`mt-3 px-5 py-4 rounded-2xl w-full max-w-md border text-left ${
                    darkMode ? 'bg-stone-850 border-stone-800' : 'bg-white border-orange-100/60'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono font-bold text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded uppercase">
                        {completionFlow.habit.category}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#FF8A3D] bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded">
                        +{completionFlow.habit.xpReward} XP
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-stone-800 dark:text-white">
                      {completionFlow.habit.name}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                      {completionFlow.habit.description}
                    </p>
                  </div>

                  {completionFlow.reflectionQuestion && (
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-medium italic mt-4 max-w-sm">
                      💡 {completionFlow.reflectionQuestion}
                    </p>
                  )}

                  <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center">
                    {/* Specialized Interactive Action Button based on category */}
                    {(() => {
                      const nameLower = completionFlow.habit.name.toLowerCase();
                      const catLower = completionFlow.habit.category?.toLowerCase() || '';

                      const isBreathing = completionFlow.habit.id === 'def-1' || 
                                          nameLower.includes('breath') || 
                                          nameLower.includes('breathe') || 
                                          nameLower.includes('zen') || 
                                          catLower === 'mindfulness';

                      const isJournaling = nameLower.includes('journal') || 
                                           nameLower.includes('write') || 
                                           nameLower.includes('reflect') || 
                                           nameLower.includes('diary') ||
                                           nameLower.includes('log') ||
                                           catLower === 'journaling';

                      const isReading = nameLower.includes('read') || 
                                        nameLower.includes('book') || 
                                        nameLower.includes('learn') || 
                                        nameLower.includes('study') || 
                                        nameLower.includes('newsletter') ||
                                        catLower === 'learning';

                      const isHydration = nameLower.includes('water') || 
                                          nameLower.includes('hydrate') || 
                                          nameLower.includes('hydration') || 
                                          nameLower.includes('drink') ||
                                          nameLower.includes('cell prep') ||
                                          catLower === 'health';

                      const isPhysical = nameLower.includes('stretch') || 
                                         nameLower.includes('plank') || 
                                         nameLower.includes('workout') || 
                                         nameLower.includes('exercise') || 
                                         nameLower.includes('walk') || 
                                         nameLower.includes('run') ||
                                         catLower === 'fitness';

                      const isFocus = nameLower.includes('focus') || 
                                      nameLower.includes('sprint') || 
                                      nameLower.includes('work') || 
                                      nameLower.includes('coding') || 
                                      nameLower.includes('project') || 
                                      catLower === 'productivity';

                      if (isBreathing) {
                        return (
                          <button
                            onClick={() => {
                              const h = completionFlow.habit;
                              setCompletionFlow(null);
                              setGuidedSessionHabit(h);
                            }}
                            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                          >
                            <Play className="w-3.5 h-3.5 fill-current animate-pulse" /> Guided Breath
                          </button>
                        );
                      }
                      if (isJournaling) {
                        return (
                          <button
                            onClick={() => {
                              const h = completionFlow.habit;
                              setCompletionFlow(null);
                              setGuidedSessionHabit(h);
                            }}
                            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                          >
                            <Feather className="w-3.5 h-3.5 text-white animate-bounce" /> Open Journal
                          </button>
                        );
                      }
                      if (isReading) {
                        return (
                          <button
                            onClick={() => {
                              const h = completionFlow.habit;
                              setCompletionFlow(null);
                              setGuidedSessionHabit(h);
                            }}
                            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-white" /> Start Read
                          </button>
                        );
                      }
                      if (isHydration) {
                        return (
                          <button
                            onClick={() => {
                              const h = completionFlow.habit;
                              setCompletionFlow(null);
                              setGuidedSessionHabit(h);
                            }}
                            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                          >
                            <Droplets className="w-3.5 h-3.5 text-sky-300 animate-pulse" /> Log Water
                          </button>
                        );
                      }
                      if (isPhysical) {
                        return (
                          <button
                            onClick={() => {
                              const h = completionFlow.habit;
                              setCompletionFlow(null);
                              setGuidedSessionHabit(h);
                            }}
                            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                          >
                            <Dumbbell className="w-3.5 h-3.5 text-white" /> Run Timer
                          </button>
                        );
                      }
                      if (isFocus) {
                        return (
                          <button
                            onClick={() => {
                              const h = completionFlow.habit;
                              setCompletionFlow(null);
                              setGuidedSessionHabit(h);
                            }}
                            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                          >
                            <Timer className="w-3.5 h-3.5 text-white" /> Focus Sprint
                          </button>
                        );
                      }
                      return null;
                    })()}

                    <button
                      onClick={() => {
                        const isReading = completionFlow.habit.name.toLowerCase().includes('read') || 
                          completionFlow.habit.name.toLowerCase().includes('book') || 
                          completionFlow.habit.name.toLowerCase().includes('learn') || 
                          completionFlow.habit.name.toLowerCase().includes('study') || 
                          completionFlow.habit.name.toLowerCase().includes('newsletter') ||
                          completionFlow.habit.category === 'learning';
                          
                        if (isReading) {
                          setCompletionFlow({
                            ...completionFlow,
                            stage: 'reflection'
                          });
                        } else {
                          setCompletionFlow({
                            ...completionFlow,
                            stage: 'experience'
                          });
                        }
                      }}
                      className="px-6 py-3.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-bold rounded-2xl transition shadow-premium-orange flex items-center justify-center gap-2 cursor-pointer text-xs flex-1"
                    >
                      ✅ Completed
                    </button>

                    <button
                      onClick={() => setCompletionFlow(null)}
                      className={`px-5 py-3.5 font-bold rounded-2xl border transition cursor-pointer text-xs flex-1 ${
                        darkMode 
                          ? 'border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-300' 
                          : 'border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-600'
                      }`}
                    >
                      ⏸ Not yet
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: Lightweight Recall Reflection */}
              {completionFlow.stage === 'reflection' && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-100/60 dark:bg-purple-950/20 rounded-full flex items-center justify-center text-purple-500 mb-5">
                    <BookOpen className="w-8 h-8 animate-pulse" />
                  </div>

                  <h3 className="text-xl font-display font-black tracking-tight">
                    Psychological Memory Recall
                  </h3>
                  <p className={`text-xs mt-1.5 max-w-sm leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    Dr. Gethro recommends reflecting on your learning to secure neural retention pathways.
                  </p>

                  <div className={`mt-6 p-5 rounded-2xl w-full max-w-md border text-left ${
                    darkMode ? 'bg-stone-850 border-stone-800' : 'bg-white border-orange-100/50'
                  }`}>
                    <label htmlFor="recall-textarea" className="block text-[11px] font-mono font-bold text-[#FF8A3D] uppercase tracking-wider mb-2">
                      {completionFlow.reflectionQuestion || "What did you learn today?"}
                    </label>
                    <textarea
                      id="recall-textarea"
                      rows={3}
                      value={completionFlow.reflectionAnswer || ''}
                      onChange={(e) => setCompletionFlow({ ...completionFlow, reflectionAnswer: e.target.value })}
                      placeholder="e.g. Learned how micro-habits reduce cognitive strain and prevent decision fatigue."
                      className={`w-full p-3.5 rounded-xl text-xs sm:text-sm transition border font-medium outline-none focus:border-[#FF8A3D] shadow-inner ${
                        darkMode 
                          ? 'bg-stone-900 border-stone-800 text-stone-100 placeholder:text-stone-500' 
                          : 'bg-white border-stone-200 text-stone-900 placeholder:text-stone-400'
                      }`}
                    />
                    <div className="w-full flex justify-between items-center text-[10px] font-mono text-stone-500 dark:text-stone-400 px-1 mt-1.5">
                      <span>Active Memory Recall</span>
                      <span>{(completionFlow.reflectionAnswer || '').length} characters</span>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3 w-full max-w-md">
                    <button
                      onClick={() => setCompletionFlow({ ...completionFlow, stage: 'confirm' })}
                      className={`px-5 py-3.5 font-bold rounded-2xl border transition cursor-pointer text-xs flex-1 ${
                        darkMode 
                          ? 'border-stone-800 bg-stone-850 hover:bg-stone-800 text-stone-400' 
                          : 'border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-600'
                      }`}
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        executeWithWordValidation(completionFlow.reflectionAnswer || '', () => {
                          setCompletionFlow({
                            ...completionFlow,
                            stage: 'experience'
                          });
                        });
                      }}
                      className="px-6 py-3.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-bold rounded-2xl transition shadow-premium-orange flex items-center justify-center gap-2 cursor-pointer text-xs flex-1"
                    >
                      Save Reflection <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 3: Separated Emotional Experience Rating */}
              {completionFlow.stage === 'experience' && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-100/60 dark:bg-emerald-950/20 rounded-full flex items-center justify-center text-emerald-500 mb-5">
                    <Smile className="w-8 h-8 animate-bounce" />
                  </div>

                  <h3 className="text-xl font-display font-black tracking-tight">
                    How did it go, {profile?.name}?
                  </h3>
                  <p className={`text-xs mt-1.5 max-w-sm leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                    We record your emotional feedback separately from completion status to track cognitive energy trends.
                  </p>

                  <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-6">
                    {[
                      { key: 'easy', label: 'Easy', desc: 'No friction', emoji: '😊', color: 'hover:border-emerald-500 hover:bg-emerald-50/15' },
                      { key: 'challenging', label: 'Challenging', desc: 'Took effort', emoji: '💪', color: 'hover:border-orange-500 hover:bg-orange-50/15' },
                      { key: 'boring', label: 'Boring', desc: 'Uninteresting', emoji: '😐', color: 'hover:border-amber-500 hover:bg-amber-50/15' },
                      { key: 'energizing', label: 'Energizing', desc: 'Somatic spark', emoji: '🔥', color: 'hover:border-indigo-500 hover:bg-indigo-50/15' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        id={`feeling-option-${opt.key}`}
                        onClick={() => {
                          const recordInput: Partial<HabitRecord> = {
                            completed: true,
                            experienceFeeling: opt.key as any,
                            reflectionAnswer: completionFlow.reflectionAnswer,
                            notes: completionFlow.reflectionAnswer || ''
                          };
                          
                          // Trigger dopamine splash at screen center
                          const splashEvent = new CustomEvent('somatic-dopamine-splash', {
                            detail: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
                          });
                          window.dispatchEvent(splashEvent);
                          
                          // Finalize complete!
                          handleToggleComplete(completionFlow.habit.id, recordInput, true);
                          setCompletionFlow(null);
                        }}
                        className={`p-4 rounded-3xl border text-left transition duration-300 cursor-pointer flex flex-col justify-between h-28 ${
                          darkMode 
                            ? 'border-stone-800 bg-stone-850/50 hover:bg-stone-800' 
                            : 'border-stone-150 bg-white hover:shadow-sm'
                        } ${opt.color}`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <div>
                          <h4 className="font-bold text-xs text-stone-800 dark:text-white">{opt.label}</h4>
                          <p className="text-[10px] text-stone-500 mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-stone-500 dark:text-stone-550 mt-6 max-w-xs font-mono">
                    Choosing a somatic feeling saves this entry to your neural growth database.
                  </p>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DopamineExplosion />

      {guidedSessionHabit && (
        <GuidedSession
          habit={guidedSessionHabit}
          darkMode={darkMode}
          onComplete={(reflectionData) => {
            if (guidedSessionHabit.id.startsWith('temp-somatic-')) {
              addXPForInsight(guidedSessionHabit.xpReward);
              setGuidedSessionHabit(null);
            } else {
              const h = guidedSessionHabit;
              setGuidedSessionHabit(null);
              // Open emotional experience rating directly after guided session finishes!
              setCompletionFlow({
                habit: h,
                stage: 'experience',
                reflectionAnswer: reflectionData?.reflectionAnswer || reflectionData?.notes || ''
              });
            }
          }}
          onCancel={() => setGuidedSessionHabit(null)}
        />
      )}

      <AcronymValidationModal
        isOpen={isAcronymModalOpen}
        suspiciousWord={suspiciousWord}
        darkMode={darkMode}
        onConfirmAcronym={handleConfirmAcronym}
        onCorrect={() => setIsAcronymModalOpen(false)}
      />

      <InteractiveTourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        onCompleteTour={handleCompleteTour}
        profile={profile}
        stats={stats}
        darkMode={darkMode}
        onNavigateView={(view) => {
          setCurrentView(view);
        }}
      />

      <FeedbackWidget
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onRewardXp={(xp) => addXPForInsight(xp)}
        profile={profile}
        darkMode={darkMode}
      />

      {/* Custom Relaunch Confirmation Modal */}
      {showRelaunchConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-4 ${
            darkMode ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-100 text-stone-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-rose-500">
                <RotateCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Relaunch App as New User?</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Reset state & restart onboarding</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              This will clear all current habits, level progress, and AI coach records so you can test and validate the full onboarding experience from scratch.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                id="btn-confirm-relaunch-cancel"
                onClick={() => setShowRelaunchConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-relaunch-submit"
                onClick={handleClearAllData}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-4 h-4" /> Reset & Relaunch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
