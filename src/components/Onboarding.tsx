import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, ArrowRight, Check, Bell } from 'lucide-react';
import { UserProfile, UserStats, GrowthPersona, HabitCategory, Habit } from '../types';
import ThemeToggle from './ThemeToggle';
import { GoogleSignInButton } from './GoogleSignInButton';
import { GoogleAuthModal } from './GoogleAuthModal';
import { GoogleUser } from '../utils/googleAuth';

interface OnboardingProps {
  onComplete: (profile: UserProfile, stats: UserStats, initialHabit?: Habit) => void;
  onGoogleSignIn?: (user: GoogleUser) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function Onboarding({ onComplete, onGoogleSignIn, darkMode = false, onToggleDarkMode }: OnboardingProps) {
  const [step, setStep] = useState<number>(0);
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [identityAnchor, setIdentityAnchor] = useState<string>('');
  const [motivation, setMotivation] = useState<string>('');
  const [obstacle, setObstacle] = useState<string>('');
  const [coachingTone, setCoachingTone] = useState<string>('');
  const [selectedFocus, setSelectedFocus] = useState<HabitCategory[]>([]);
  
  // Custom first habit fields
  const [habitName, setHabitName] = useState<string>('');
  const [habitCategory, setHabitCategory] = useState<HabitCategory>('productivity');
  const [habitTrigger, setHabitTrigger] = useState<string>('');
  const [habitTime, setHabitTime] = useState<string>('08:00');
  const [sendReminder, setSendReminder] = useState<boolean>(true);

  // Input refs for enter-key traversal
  const identityInputRef = useRef<HTMLInputElement>(null);
  const habitTriggerRef = useRef<HTMLInputElement>(null);

  const handleToggleReminder = async () => {
    const nextVal = !sendReminder;
    setSendReminder(nextVal);
    if (nextVal && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (e) {
          console.warn('Failed to request notification permission:', e);
        }
      }
    }
  };

  const focusCategories: { value: HabitCategory; label: string; icon: string; desc: string }[] = [
    { value: 'productivity', label: 'Productivity', icon: '⚡', desc: 'Focus, work, deep tasks' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘', desc: 'Meditation, stress relief, peace' },
    { value: 'health', label: 'Health & Wellness', icon: '🍏', desc: 'Sleep, nutrition, hydration' },
    { value: 'fitness', label: 'Fitness', icon: '💪', desc: 'Exercise, runs, stretching' },
    { value: 'learning', label: 'Learning & Skills', icon: '📚', desc: 'Reading, languages, coding' },
    { value: 'finance', label: 'Finance', icon: '🪙', desc: 'Saving, tracking expenses' },
    { value: 'social', label: 'Social & Family', icon: '❤️', desc: 'Calling friends, family quality' }
  ];

  const handleToggleFocus = (cat: HabitCategory) => {
    if (selectedFocus.includes(cat)) {
      setSelectedFocus(selectedFocus.filter(f => f !== cat));
    } else {
      setSelectedFocus([...selectedFocus, cat]);
    }
  };

  const calculatePersona = (): GrowthPersona => {
    if (obstacle === 'hard-start') return 'The Micro-Habit Builder';
    if (obstacle === 'distracted') return 'The Identity Shifter';
    if (obstacle === 'lose-interest') return 'The Game Strategist';
    return 'The Mindful Observer';
  };

  const handleGoogleSuccess = (user: GoogleUser) => {
    setShowGoogleModal(false);
    if (onGoogleSignIn) {
      onGoogleSignIn(user);
    } else {
      const persona = calculatePersona();
      const profile: UserProfile = {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        googleId: user.id,
        authProvider: 'google',
        isAuthenticated: true,
        growthPersona: persona,
        focusAreas: selectedFocus.length > 0 ? selectedFocus : ['productivity', 'mindfulness'],
        quizAnswers: {
          motivation: motivation || 'Identity shift and long-term focus',
          obstacle: obstacle || 'Time management',
          coachingTone: coachingTone || 'supportive',
          stylePreference: 'adaptive'
        },
        joinedAt: new Date().toISOString(),
        isPro: false,
        identityAnchor: identityAnchor.trim() || `someone who shows up every day with clarity & health`
      };

      const stats: UserStats = {
        userId: user.id,
        xp: 200,
        level: 1,
        streakMultiplier: 1.0,
        bronzeBadges: ['Google Voyager'],
        silverBadges: [],
        goldBadges: [],
        totalCompletedCount: 0,
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        graceShieldAvailable: true
      };

      onComplete(profile, stats);
    }
  };

  const handleFinish = async () => {
    // Trigger Notification.requestPermission() when clicking 'Finalize Setup' if reminder is on
    if (sendReminder && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (e) {
          console.warn('Failed to request notification permission:', e);
        }
      }
    }

    const persona = calculatePersona();
    
    const profile: UserProfile = {
      name: name.trim() || 'Seeker',
      growthPersona: persona,
      focusAreas: selectedFocus.length > 0 ? selectedFocus : ['productivity', 'mindfulness'],
      quizAnswers: {
        motivation,
        obstacle,
        coachingTone: coachingTone || 'supportive',
        stylePreference: 'adaptive'
      },
      joinedAt: new Date().toISOString(),
      isPro: false,
      identityAnchor: identityAnchor.trim() || `someone who protects my clarity & health`
    };

    const stats: UserStats = {
      xp: 150, // Starting bonus
      level: 1,
      streakMultiplier: 1.0,
      bronzeBadges: ['Seed of Growth'],
      silverBadges: [],
      goldBadges: [],
      totalCompletedCount: 0,
      streakDays: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      graceShieldAvailable: true
    };

    const initialHabit: Habit | undefined = habitName.trim() ? {
      id: `custom-onboarding-${Date.now()}`,
      name: habitName.trim(),
      category: habitCategory,
      frequency: 'daily',
      targetDaysCount: 1,
      description: habitTrigger.trim()
        ? `After I ${habitTrigger.trim()}, I will ${habitName.trim()}.`
        : 'Daily behavioral anchor contract.',
      psychologicalPrinciple: 'Habit Stacking',
      difficulty: 'easy',
      xpReward: 35,
      reminderTime: habitTime || '08:00',
      reminderEnabled: sendReminder,
      createdAt: new Date().toISOString(),
      isArchived: false,
      records: {},
      currentStreak: 0,
      longestStreak: 0
    } : undefined;

    onComplete(profile, stats, initialHabit);
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div id="onboarding-root" className={`min-h-screen ${
      darkMode ? 'bg-[#0F141C] text-[#F8FAFC]' : 'bg-[#FEFAF7] text-[#0F172A]'
    } flex items-center justify-center p-4 selection:bg-orange-100 selection:text-orange-950 relative overflow-hidden transition-colors duration-300`}>
      
      {/* Top right prominent Light / Dark toggle header */}
      <header className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-2">
        <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode || (() => {})} />
      </header>

      {/* Soft atmospheric ambient light */}
      <div className={`absolute top-1/4 -left-20 w-96 h-96 ${darkMode ? 'bg-orange-600/10' : 'bg-orange-200/25'} rounded-full blur-3xl pointer-events-none`} />
      <div className={`absolute bottom-1/4 -right-20 w-96 h-96 ${darkMode ? 'bg-amber-600/10' : 'bg-amber-200/25'} rounded-full blur-3xl pointer-events-none`} />

      <div className={`w-full max-w-xl ${
        darkMode ? 'bg-[#171F2A]/95 border-[#263242] shadow-2xl text-[#F8FAFC]' : 'bg-white/95 border-[#CBD5E1] shadow-premium text-[#0F172A]'
      } backdrop-blur-xl rounded-[32px] overflow-hidden relative z-10 border transition-colors duration-300`}>
        
        {/* Soft top gradient light wash */}
        <div className={`absolute top-0 inset-x-0 h-44 ${
          darkMode ? 'bg-gradient-to-b from-orange-500/10 to-transparent' : 'bg-gradient-to-b from-orange-100/30 via-amber-50/15 to-transparent'
        } pointer-events-none`} />

        {/* Top Progress Bar */}
        {step > 0 && step < 6 && (
          <div className={`w-full ${darkMode ? 'bg-[#0F141C]' : 'bg-stone-100'} h-1.5 flex relative z-10`}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`flex-1 h-full transition-all duration-300 ${
                  s <= step ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        )}

        <div className="p-8 sm:p-10 relative z-10">
          <AnimatePresence mode="wait">
            
            {/* Step 0: Warm Landing */}
            {step === 0 && (
              <motion.div 
                key="landing"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center py-4 sm:py-6"
                id="onboarding-step-0"
              >
                {/* Centerpiece Brain Icon with radiant warm aura */}
                <div className="relative inline-flex mb-6 group">
                  <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-orange-400/25 via-amber-300/25 to-rose-400/20 blur-md opacity-80 group-hover:opacity-100 transition duration-300" />
                  <div className={`relative p-4 rounded-2xl ${
                    darkMode ? 'bg-[#1E2836] border-[#334255]' : 'bg-gradient-to-b from-white to-orange-50/80 border-orange-200/80'
                  } border shadow-md flex items-center justify-center`}>
                    <Brain className="w-10 h-10 text-[#FF7A1A] stroke-[2.2]" />
                  </div>
                </div>

                <h1 className={`text-3xl sm:text-4xl font-display font-extrabold ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'} tracking-tight mb-3`}>
                  Welcome to <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">Vicfungo</span>
                </h1>
                <p className={`${darkMode ? 'text-[#E4E4E7]' : 'text-slate-600'} mb-8 max-w-md mx-auto text-sm leading-relaxed`}>
                  A science-backed personal growth platform rooted in behavioral psychology. Let&apos;s discover your growth archetype and craft your tailored pathway.
                </p>

                {/* 3 Step preview cards with luminous warm color grading */}
                <div className="space-y-3.5 mb-8 text-left max-w-md mx-auto">
                  <div className={`group flex items-start gap-3.5 p-3.5 rounded-2xl ${
                    darkMode ? 'bg-[#1E2836]/70 border-[#334255] hover:border-orange-500/50' : 'bg-gradient-to-r from-orange-50/50 via-amber-50/30 to-stone-50/40 border-[#CBD5E1] hover:border-orange-300'
                  } border transition-all duration-200 shadow-xs hover:shadow-sm`}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-mono font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                      01
                    </div>
                    <div>
                      <h3 className={`font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'} text-sm tracking-tight`}>Psychological Profiling</h3>
                      <p className={`text-xs ${darkMode ? 'text-[#E4E4E7]' : 'text-slate-600'} leading-relaxed mt-0.5`}>Determine your cognitive style to match your tailored AI Coaching mode.</p>
                    </div>
                  </div>

                  <div className={`group flex items-start gap-3.5 p-3.5 rounded-2xl ${
                    darkMode ? 'bg-[#1E2836]/70 border-[#334255] hover:border-orange-500/50' : 'bg-gradient-to-r from-orange-50/50 via-amber-50/30 to-stone-50/40 border-[#CBD5E1] hover:border-orange-300'
                  } border transition-all duration-200 shadow-xs hover:shadow-sm`}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-mono font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                      02
                    </div>
                    <div>
                      <h3 className={`font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'} text-sm tracking-tight`}>Tiny Habits Method</h3>
                      <p className={`text-xs ${darkMode ? 'text-[#E4E4E7]' : 'text-slate-600'} leading-relaxed mt-0.5`}>Stack triggers to make your routines stick effortlessly with zero friction.</p>
                    </div>
                  </div>

                  <div className={`group flex items-start gap-3.5 p-3.5 rounded-2xl ${
                    darkMode ? 'bg-[#1E2836]/70 border-[#334255] hover:border-orange-500/50' : 'bg-gradient-to-r from-orange-50/50 via-amber-50/30 to-stone-50/40 border-[#CBD5E1] hover:border-orange-300'
                  } border transition-all duration-200 shadow-xs hover:shadow-sm`}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-mono font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                      03
                    </div>
                    <div>
                      <h3 className={`font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'} text-sm tracking-tight`}>Adaptive AI Growth Companion</h3>
                      <p className={`text-xs ${darkMode ? 'text-[#E4E4E7]' : 'text-slate-600'} leading-relaxed mt-0.5`}>Engage in science-backed reflection sessions with Dr. Gethro, your personal growth guide.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto">
                  <button
                    id="btn-onboarding-start"
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto flex-1 px-7 py-3.5 bg-gradient-to-r from-orange-500 via-[#FF7A1A] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-premium-orange hover:shadow-[0_14px_32px_-6px_rgba(255,122,41,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Discover Your Archetype</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <GoogleSignInButton
                    id="btn-onboarding-google-signin"
                    onClick={() => setShowGoogleModal(true)}
                    darkMode={darkMode}
                    text="Sign in with Google"
                    className="w-full sm:w-auto"
                  />
                </div>

                <p className={`text-xs mt-5 ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'} font-medium`}>
                  Returning user? Sign in with Google to immediately sync your habits and streak records.
                </p>
              </motion.div>
            )}

            {/* Step 1: Name & Identity Anchor Input */}
            {step === 1 && (
              <motion.div 
                key="name-step"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                id="onboarding-step-1"
              >
                <div className="mb-5 flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-semibold text-orange-700 dark:text-[#FFB074] uppercase tracking-wider bg-orange-50 dark:bg-[rgba(255,122,26,0.15)] border border-orange-200/60 dark:border-[rgba(255,122,26,0.35)] px-2.5 py-1 rounded-full font-mono">Identity</span>
                    <h2 className={`text-2xl font-display font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'} mt-2.5`}>Tell us about yourself</h2>
                    <p className={`${darkMode ? 'text-[#E4E4E7]' : 'text-slate-600'} text-xs mt-1`}>Our AI Coach will address you and tailor your psychological feedback based on this identity.</p>
                  </div>
                  <GoogleSignInButton
                    variant="compact"
                    darkMode={darkMode}
                    text="Autofill with Google"
                    onClick={() => setShowGoogleModal(true)}
                  />
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="user-name-input" className={`block text-[10px] font-bold ${darkMode ? 'text-[#94A3B8]' : 'text-[#334155]'} uppercase tracking-wider mb-1.5`}>Your Name</label>
                    <input
                      id="user-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          identityInputRef.current?.focus();
                        }
                      }}
                      placeholder="Enter your name or nickname"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] ${
                        darkMode 
                          ? 'bg-[#0F141C] border-[#334255] text-[#F8FAFC] placeholder:text-[#64748B]' 
                          : 'bg-white border-[#CBD5E1] text-[#0F172A] placeholder:text-[#64748B]'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="user-identity-input" className={`block text-[10px] font-bold ${darkMode ? 'text-[#94A3B8]' : 'text-[#334155]'} uppercase tracking-wider mb-1.5`}>
                      Your Identity Shift Anchor (Who are you becoming?)
                    </label>
                    <input
                      ref={identityInputRef}
                      id="user-identity-input"
                      type="text"
                      value={identityAnchor}
                      onChange={(e) => setIdentityAnchor(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (name.trim()) {
                            setStep(2);
                          }
                        }
                      }}
                      placeholder="e.g. I am building healthy daily routines"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm italic transition focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] ${
                        darkMode 
                          ? 'bg-[#0F141C] border-[#334255] text-[#F8FAFC] placeholder:text-[#64748B]' 
                          : 'bg-white border-[#CBD5E1] text-[#0F172A] placeholder:text-[#64748B]'
                      }`}
                    />
                    
                    {/* Four Selectable Generic Archetype Chips */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        'I am a disciplined high-performer',
                        'I am building healthy daily routines',
                        'I am focused on calm, mindful learning',
                        'I am an organized creative hitting daily goals'
                      ].map((archetype, idx) => {
                        const isSelected = identityAnchor === archetype;
                        return (
                          <button
                            key={`archetype-${idx}`}
                            type="button"
                            onClick={() => setIdentityAnchor(archetype)}
                            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium text-left ${
                              isSelected
                                ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-xs font-semibold'
                                : `${
                                    darkMode 
                                      ? 'bg-[#1E2836] hover:bg-[#263242] border-[#334255] text-[#E4E4E7]' 
                                      : 'bg-[#F1F5F9] hover:bg-slate-200/70 border-[#CBD5E1] text-[#334155]'
                                  }`
                            }`}
                          >
                            {archetype}
                          </button>
                        );
                      })}
                    </div>
                    
                    <p className={`text-[10px] ${darkMode ? 'text-[#94A3B8]' : 'text-slate-500'} mt-2.5 leading-relaxed`}>
                      💡 Behavioral psychology shows identity-focused habits are 4x more likely to stick. Focus on <em>who you want to be</em>, not just what you want to achieve.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(0)} 
                    className={`px-6 py-3 font-medium rounded-xl transition cursor-pointer text-sm ${
                      darkMode ? 'bg-[#1E2836] hover:bg-[#263242] text-[#E4E4E7] border border-[#334255]' : 'bg-[#F1F5F9] hover:bg-slate-200/80 text-[#334155] border border-[#CBD5E1]'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    id="btn-onboarding-step-1-next"
                    disabled={!name.trim()}
                    onClick={() => setStep(2)}
                    className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm ${
                      name.trim() 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-premium-orange cursor-pointer active:scale-[0.98]' 
                        : `${darkMode ? 'bg-[#1E2836] text-[#64748B]' : 'bg-slate-100 text-slate-400'} cursor-not-allowed`
                    }`}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Focus Areas */}
            {step === 2 && (
              <motion.div 
                key="focus-step"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                id="onboarding-step-2"
              >
                <div className="mb-6">
                  <span className="text-xs font-semibold text-orange-700 dark:text-[#FFB074] uppercase tracking-wider bg-orange-50 dark:bg-[rgba(255,122,26,0.15)] border border-orange-200/60 dark:border-[rgba(255,122,26,0.35)] px-2.5 py-1 rounded-full font-mono">Intention</span>
                  <h2 className={`text-2xl font-display font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'} mt-3`}>Select your focal paths</h2>
                  <p className={`${darkMode ? 'text-[#E4E4E7]' : 'text-slate-600'} text-sm mt-1`}>Which domains of your life are you prioritising right now?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-h-[300px] overflow-y-auto pr-1">
                  {focusCategories.map((cat, idx) => {
                    const isSelected = selectedFocus.includes(cat.value);
                    return (
                      <button
                        key={`focus-${cat.value}-${idx}`}
                        id={`focus-cat-${cat.value}`}
                        type="button"
                        onClick={() => handleToggleFocus(cat.value)}
                        className={`p-4 rounded-2xl text-left border transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected 
                            ? 'bg-orange-50 dark:bg-[rgba(255,122,26,0.18)] border-2 border-[#EA580C] ring-1 ring-[#EA580C]/40 shadow-xs' 
                            : `${
                                darkMode 
                                  ? 'bg-[#1E2836] border-[#334255] hover:border-[#EA580C]/60 hover:bg-[#263242]' 
                                  : 'bg-[#F1F5F9] border-[#CBD5E1] hover:border-[#EA580C]/60 hover:bg-slate-200/70'
                              }`
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <h4 className={`font-semibold text-sm ${isSelected ? 'text-[#EA580C] dark:text-[#FFB074]' : darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>{cat.label}</h4>
                          <p className={`text-xs mt-0.5 ${darkMode ? 'text-[#94A3B8]' : 'text-slate-500'}`}>{cat.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(1)} 
                    className={`px-6 py-3.5 font-medium rounded-2xl transition cursor-pointer text-sm ${
                      darkMode ? 'bg-[#1E2836] hover:bg-[#263242] text-[#E4E4E7] border border-[#334255]' : 'bg-[#F1F5F9] hover:bg-slate-200/80 text-[#334155] border border-[#CBD5E1]'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    id="btn-onboarding-step-2-next"
                    disabled={selectedFocus.length === 0}
                    onClick={() => setStep(3)}
                    className={`flex-1 py-3.5 rounded-2xl font-semibold transition flex items-center justify-center gap-2 text-sm ${
                      selectedFocus.length > 0 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-premium-orange cursor-pointer active:scale-[0.98]' 
                        : `${darkMode ? 'bg-[#1E2836] text-[#64748B]' : 'bg-slate-100 text-slate-400'} cursor-not-allowed`
                    }`}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Obstacle Diagnosis */}
            {step === 3 && (
              <motion.div 
                key="obstacle-step"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                id="onboarding-step-3"
              >
                <div className="mb-6">
                  <span className="text-xs font-semibold text-orange-700 dark:text-[#FFB074] uppercase tracking-wider bg-orange-50 dark:bg-[rgba(255,122,26,0.15)] border border-orange-200/60 dark:border-[rgba(255,122,26,0.35)] px-2.5 py-1 rounded-full font-mono">Friction</span>
                  <h2 className={`text-2xl font-display font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'} mt-3`}>What is your biggest hurdle?</h2>
                  <p className={`${darkMode ? 'text-[#E4E4E7]' : 'text-slate-600'} text-sm mt-1`}>Tell us what usually gets in your way so we can customize your system.</p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    { 
                      id: 'hard-start', 
                      title: 'Trouble getting started', 
                      subtitle: 'Procrastinating or feeling too overwhelmed to begin.' 
                    },
                    { 
                      id: 'distracted', 
                      title: 'Forgetting to do it', 
                      subtitle: 'Life gets busy and habits slip your mind during the day.' 
                    },
                    { 
                      id: 'lose-interest', 
                      title: 'Losing steam quickly', 
                      subtitle: 'Starting strong but fading out after a few days.' 
                    },
                    { 
                      id: 'lonely', 
                      title: 'Doing it all alone', 
                      subtitle: 'No accountability or feedback to keep you showing up.' 
                    }
                  ].map((obs, idx) => {
                    const isSelected = obstacle === obs.id;
                    return (
                      <button
                        key={`obstacle-${obs.id}-${idx}`}
                        id={`obstacle-${obs.id}`}
                        type="button"
                        onClick={() => setObstacle(obs.id)}
                        className={`w-full p-4 text-left rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected 
                            ? 'bg-orange-50 dark:bg-[rgba(255,122,26,0.18)] border-2 border-[#EA580C] ring-1 ring-[#EA580C]/40 shadow-xs' 
                            : `${
                                darkMode 
                                  ? 'bg-[#1E2836] border-[#334255] hover:border-[#EA580C]/60 hover:bg-[#263242]' 
                                  : 'bg-[#F1F5F9] border-[#CBD5E1] hover:border-[#EA580C]/60 hover:bg-slate-200/70'
                              }`
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 transition shrink-0 ${
                          isSelected 
                            ? 'border-[#EA580C] bg-[#EA580C] text-white' 
                            : `${darkMode ? 'border-[#475569] bg-[#0F141C]' : 'border-[#CBD5E1] bg-white'}`
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1">
                          <span className={`block font-semibold text-sm ${isSelected ? 'text-[#EA580C] dark:text-[#FFB074]' : darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>
                            {obs.title}
                          </span>
                          <span className={`block text-xs mt-0.5 ${darkMode ? 'text-[#94A3B8]' : 'text-slate-600'} leading-relaxed`}>
                            {obs.subtitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(2)} 
                    className={`px-6 py-3.5 font-medium rounded-2xl transition cursor-pointer text-sm ${
                      darkMode ? 'bg-[#1E2836] hover:bg-[#263242] text-[#E4E4E7] border border-[#334255]' : 'bg-[#F1F5F9] hover:bg-slate-200/80 text-[#334155] border border-[#CBD5E1]'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    id="btn-onboarding-step-3-next"
                    disabled={!obstacle}
                    onClick={() => setStep(4)}
                    className={`flex-1 py-3.5 rounded-2xl font-semibold transition flex items-center justify-center gap-2 text-sm ${
                      obstacle 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-premium-orange cursor-pointer active:scale-[0.98]' 
                        : `${darkMode ? 'bg-[#1E2836] text-[#64748B]' : 'bg-slate-100 text-slate-400'} cursor-not-allowed`
                    }`}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Persona Calculated & Coaching Selection */}
            {step === 4 && (
              <motion.div 
                key="persona-step"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                id="onboarding-step-4"
                className="py-2"
              >
                <div className="text-center mb-6">
                  <div className={`inline-flex p-3 rounded-full mb-3 shadow-xs ${
                    darkMode ? 'bg-[rgba(255,122,26,0.15)] border border-[rgba(255,122,26,0.35)] text-[#FFB074]' : 'bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 border border-orange-200'
                  }`}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className={`block text-xs font-mono uppercase tracking-wider font-semibold ${darkMode ? 'text-[#94A3B8]' : 'text-slate-500'}`}>YOUR GROWTH ARCHETYPE</span>
                  <h2 className="text-2xl font-display font-extrabold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent mt-1">
                    {calculatePersona()}
                  </h2>
                </div>

                <div className={`p-4 rounded-2xl border mb-6 text-sm leading-relaxed shadow-xs ${
                  darkMode ? 'bg-[#1E2836] border-[#334255] text-[#E4E4E7]' : 'bg-gradient-to-r from-orange-50/60 via-amber-50/40 to-stone-50/40 border-[#CBD5E1] text-[#0F172A]'
                }`}>
                  {calculatePersona() === 'The Micro-Habit Builder' && (
                    <p>Choosing the <strong className="text-[#EA580C] dark:text-[#FFB074]">Friction Reduction</strong> pathway configures your routine to be incredibly easy to start. We break your goals down into simple 2-minute habits so you never struggle with starting or get overwhelmed. Dr. Gethro will focus entirely on building consistent momentum rather than demanding heavy volume.</p>
                  )}
                  {calculatePersona() === 'The Identity Shifter' && (
                    <p>Choosing the <strong className="text-[#EA580C] dark:text-[#FFB074]">Identity Shifter</strong> pathway rewires how you perceive yourself. Instead of aiming for raw stats, you will align your habits with the type of person you want to become. Dr. Gethro will help you anchor these new routines to reliable daily triggers so they become automatic parts of your identity.</p>
                  )}
                  {calculatePersona() === 'The Game Strategist' && (
                    <p>Choosing the <strong className="text-[#EA580C] dark:text-[#FFB074]">Game Strategist</strong> pathway turns your growth into an immersive personal game. You will earn XP, level up, and unlock customizable reward milestones. Dr. Gethro will gamify your tracking to maximize dopamine and make staying consistent feel genuinely fun.</p>
                  )}
                  {calculatePersona() === 'The Mindful Observer' && (
                    <p>Choosing the <strong className="text-[#EA580C] dark:text-[#FFB074]">Mindful Observer</strong> pathway connects your routines with mental wellness. You will track habits alongside your emotional energy levels and mental battery. Dr. Gethro will offer gentle mindfulness reflections to build sustainable routines that align with your overall well-being.</p>
                  )}
                </div>

                <div className="mb-6">
                  <label htmlFor="coaching-style-select" className={`block text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-[#94A3B8]' : 'text-[#334155]'}`}>Select Dr. Gethro&apos;s Coaching Persona</label>
                  <div className="grid grid-cols-2 gap-2" id="coaching-style-select">
                    {[
                      { id: 'supportive', name: 'Empathetic Mentor', desc: 'Compassionate & encouraging' },
                      { id: 'scientific', name: 'Habit Scientist', desc: 'Data & psychological metrics' },
                      { id: 'challenging', name: 'Executive Catalyst', desc: 'Direct, focused, performance-driven' },
                      { id: 'zen', name: 'Mindful Guide', desc: 'Gentle, meditative reflection' }
                    ].map((tone, idx) => {
                      const isSelected = coachingTone === tone.id;
                      return (
                        <button
                          key={`tone-${tone.id}-${idx}`}
                          type="button"
                          onClick={() => setCoachingTone(tone.id)}
                          className={`p-3 text-left rounded-xl border text-xs transition cursor-pointer ${
                            isSelected 
                              ? 'bg-[#EA580C] border-[#EA580C] text-white shadow-sm' 
                              : `${
                                  darkMode 
                                    ? 'bg-[#1E2836] border-[#334255] hover:border-[#EA580C]/60 hover:bg-[#263242] text-[#E4E4E7]' 
                                    : 'bg-[#F1F5F9] border-[#CBD5E1] hover:border-[#EA580C]/60 hover:bg-slate-200/70 text-[#334155]'
                                }`
                          }`}
                        >
                          <h4 className="font-bold">{tone.name}</h4>
                          <p className={`mt-0.5 ${isSelected ? 'text-orange-100' : darkMode ? 'text-[#94A3B8]' : 'text-slate-500'}`}>{tone.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(3)} 
                    className={`px-6 py-3.5 font-medium rounded-2xl transition cursor-pointer text-sm ${
                      darkMode ? 'bg-[#1E2836] hover:bg-[#263242] text-[#E4E4E7] border border-[#334255]' : 'bg-[#F1F5F9] hover:bg-slate-200/80 text-[#334155] border border-[#CBD5E1]'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    id="btn-onboarding-step-4-next"
                    onClick={() => setStep(5)}
                    className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 via-[#FF7A1A] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-2xl transition shadow-premium-orange flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-[0.98]"
                  >
                    Commit to Pathway
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: BJ Fogg Stack First Habit */}
            {step === 5 && (
              <motion.div 
                key="first-habit-step"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                id="onboarding-step-5"
              >
                <div className="mb-6">
                  <span className="text-xs font-semibold text-orange-700 dark:text-[#FFB074] uppercase tracking-wider bg-orange-50 dark:bg-[rgba(255,122,26,0.15)] border border-orange-200/60 dark:border-[rgba(255,122,26,0.35)] px-2.5 py-1 rounded-full font-mono">HABIT STACKING</span>
                  <h2 className={`text-2xl font-display font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'} mt-3`}>Stack Your First Habit</h2>
                  <p className={`${darkMode ? 'text-[#E4E4E7]' : 'text-slate-600'} text-sm mt-1`}>
                    Anchor your new routine to an existing daily habit to make it stick effortlessly.
                  </p>
                </div>

                <div className={`space-y-4 mb-8 p-5 rounded-2xl border shadow-xs ${
                  darkMode ? 'bg-[#1E2836] border-[#334255]' : 'bg-[#F1F5F9] border-[#CBD5E1]'
                }`}>
                  <div>
                    <label htmlFor="first-habit-name" className={`block text-xs font-bold mb-1.5 ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>What small habit would you like to build?</label>
                    <input
                      id="first-habit-name"
                      type="text"
                      value={habitName}
                      onChange={(e) => setHabitName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          habitTriggerRef.current?.focus();
                        }
                      }}
                      placeholder="e.g. Read 5 pages, stretch for 2 minutes, drink a glass of water"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] ${
                        darkMode 
                          ? 'bg-[#0F141C] border-[#334255] text-[#F8FAFC] placeholder:text-[#64748B]' 
                          : 'bg-white border-[#CBD5E1] text-[#0F172A] placeholder:text-[#64748B]'
                      }`}
                    />
                  </div>

                  <div>
                    <label htmlFor="first-habit-trigger" className={`block text-xs font-bold mb-1.5 ${darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'}`}>What do you already do every day that can remind you to do it?</label>
                    <input
                      ref={habitTriggerRef}
                      id="first-habit-trigger"
                      type="text"
                      value={habitTrigger}
                      onChange={(e) => setHabitTrigger(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleFinish();
                        }
                      }}
                      placeholder="e.g. After I brew my morning coffee..., After I sit down at my desk..."
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] ${
                        darkMode 
                          ? 'bg-[#0F141C] border-[#334255] text-[#F8FAFC] placeholder:text-[#64748B]' 
                          : 'bg-white border-[#CBD5E1] text-[#0F172A] placeholder:text-[#64748B]'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="first-habit-category" className={`block text-xs font-bold mb-1 ${darkMode ? 'text-[#94A3B8]' : 'text-[#334155]'}`}>CATEGORY</label>
                      <select
                        id="first-habit-category"
                        value={habitCategory}
                        onChange={(e) => setHabitCategory(e.target.value as HabitCategory)}
                        className={`w-full px-3 py-2 rounded-xl border text-sm cursor-pointer font-medium transition focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] ${
                          darkMode 
                            ? 'bg-[#0F141C] border-[#334255] text-[#F8FAFC]' 
                            : 'bg-white border-[#CBD5E1] text-[#0F172A]'
                        }`}
                      >
                        <option value="productivity">Productivity</option>
                        <option value="mindfulness">Mindfulness</option>
                        <option value="health">Health & Wellness</option>
                        <option value="fitness">Fitness</option>
                        <option value="learning">Learning</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="first-habit-time" className={`block text-xs font-bold mb-1 ${darkMode ? 'text-[#94A3B8]' : 'text-[#334155]'}`}>APPROX TIME</label>
                      <input
                        id="first-habit-time"
                        type="time"
                        value={habitTime}
                        onChange={(e) => setHabitTime(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleFinish();
                          }
                        }}
                        className={`w-full px-3 py-2 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C] ${
                          darkMode 
                            ? 'bg-[#0F141C] border-[#334255] text-[#F8FAFC]' 
                            : 'bg-white border-[#CBD5E1] text-[#0F172A]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Send a reminder at scheduled time toggle */}
                  <div
                    id="onboarding-reminder-toggle-card"
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-colors ${
                      darkMode ? 'bg-[#0F141C]/80 border-[#263242]' : 'bg-stone-50 border-stone-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          sendReminder 
                            ? 'bg-amber-500/20 text-amber-500' 
                            : darkMode ? 'bg-[#1E2836] text-[#64748B]' : 'bg-stone-200 text-stone-500'
                        }`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <label 
                            htmlFor="toggle-onboarding-reminder" 
                            className={`text-xs font-bold cursor-pointer select-none block ${
                              darkMode ? 'text-[#F8FAFC]' : 'text-[#0F172A]'
                            }`}
                          >
                            Send a reminder at scheduled time
                          </label>
                          <p className={`text-[11px] leading-relaxed mt-0.5 ${
                            darkMode ? 'text-[#94A3B8]' : 'text-stone-500'
                          }`}>
                            Allows device notifications to nudge you when your habit window opens.
                          </p>
                        </div>
                      </div>

                      <button
                        id="toggle-onboarding-reminder"
                        type="button"
                        role="switch"
                        aria-checked={sendReminder}
                        onClick={handleToggleReminder}
                        className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                          sendReminder ? 'bg-[#EA580C]' : darkMode ? 'bg-[#334255]' : 'bg-stone-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                            sendReminder ? 'translate-x-5.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {habitName && habitTrigger && (
                    <div className={`p-3.5 rounded-xl border text-xs font-medium leading-relaxed shadow-xs ${
                      darkMode ? 'bg-[rgba(255,122,26,0.15)] border-[rgba(255,122,26,0.35)] text-[#FFB074]' : 'bg-orange-50 border-orange-200 text-[#0F172A]'
                    }`}>
                      💡 <strong>Your Behavioral Contract:</strong> &ldquo;After I <strong>{habitTrigger}</strong>, I will <strong>{habitName}</strong>.&rdquo;
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(4)} 
                    className={`px-6 py-3.5 font-medium rounded-2xl transition cursor-pointer text-sm ${
                      darkMode ? 'bg-[#1E2836] hover:bg-[#263242] text-[#E4E4E7] border border-[#334255]' : 'bg-[#F1F5F9] hover:bg-slate-200/80 text-[#334155] border border-[#CBD5E1]'
                    }`}
                  >
                    Back
                  </button>
                  <button
                    id="btn-onboarding-finalize"
                    onClick={handleFinish}
                    className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 via-[#FF7A1A] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-2xl transition shadow-premium-orange flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-[0.98]"
                  >
                    Finalize Setup
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Google Authentication Modal */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={handleGoogleSuccess}
        darkMode={darkMode}
      />
    </div>
  );
}
