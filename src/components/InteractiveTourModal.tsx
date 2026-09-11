import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Brain, Zap, Check, ArrowRight, ArrowLeft, X, Award, 
  Activity, Flame, ListTodo, HelpCircle, Lightbulb, Play, Volume2, 
  Compass, ChevronRight, CheckCircle2, Dumbbell, Droplets
} from 'lucide-react';
import { UserProfile, UserStats, HabitCategory } from '../types';
import { validateTextInput } from '../utils/wordValidator';
import { playBreathPromptSound, playSuccessSound } from '../utils/audio';

interface InteractiveTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteTour: (xpBonus: number) => void;
  profile: UserProfile | null;
  stats: UserStats | null;
  darkMode: boolean;
  onNavigateView?: (view: 'dashboard' | 'coach' | 'analytics' | 'gamification' | 'wearables' | 'settings') => void;
}

export default function InteractiveTourModal({
  isOpen,
  onClose,
  onCompleteTour,
  profile,
  stats,
  darkMode,
  onNavigateView
}: InteractiveTourModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  // Interactive mini-states inside the tour
  const [sampleTaskInput, setSampleTaskInput] = useState<string>('');
  const [sampleTaskValidation, setSampleTaskValidation] = useState<{ isValid: boolean; word?: string } | null>(null);
  const [sampleHabitCompleted, setSampleHabitCompleted] = useState<boolean>(false);
  const [simulatedDopamine, setSimulatedDopamine] = useState<number>(45);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStep < tourSteps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          handleFinishTour();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 0) {
          setCurrentStep(prev => prev - 1);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const handleTestWordValidation = () => {
    if (!sampleTaskInput.trim()) return;
    const res = validateTextInput(sampleTaskInput, new Set());
    if (!res.isValid && res.suspiciousWord) {
      setSampleTaskValidation({ isValid: false, word: res.suspiciousWord });
    } else {
      setSampleTaskValidation({ isValid: true });
    }
  };

  const handleToggleSampleHabit = () => {
    const nextState = !sampleHabitCompleted;
    setSampleHabitCompleted(nextState);
    if (nextState) {
      try {
        playBreathPromptSound('inhale');
      } catch (e) {
        // Suppress
      }
      setSimulatedDopamine(prev => Math.min(100, prev + 25));
    } else {
      setSimulatedDopamine(prev => Math.max(20, prev - 25));
    }
  };

  const handleFinishTour = () => {
    try {
      playSuccessSound();
    } catch (e) {
      // Suppress
    }
    onCompleteTour(25);
    onClose();
  };

  const tourSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Vicfungo 🚀',
      subtitle: 'Your Science-Backed Personal Growth & Behavioral Engine',
      badge: 'Interactive Tour • Step 1 of 6',
      icon: <Brain className="w-8 h-8 text-[#FF8A3D]" />,
      viewTarget: 'dashboard' as const,
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-stone-600 dark:text-[#E4E4E7]">
            Welcome aboard, <strong className="text-stone-900 dark:text-[#F8FAFC]">{profile?.name || 'Seeker'}</strong>! Vicfungo uses <strong>behavioral psychology</strong> and <strong>identity-shift micro-habits</strong> to help you build unshakeable consistency.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-orange-50/60 dark:bg-[rgba(249,115,22,0.12)] rounded-2xl border border-orange-100 dark:border-[rgba(249,115,22,0.25)]">
              <div className="flex items-center gap-2 font-bold text-xs text-[#FF8A3D] dark:text-[#FB923C] mb-1">
                <Zap className="w-4 h-4" /> BJ Fogg Habit Stacking
              </div>
              <p className="text-xs text-stone-600 dark:text-[#E4E4E7]">
                Map routines cleanly: <em>&ldquo;After I [anchor] ➔ I will [new habit]&rdquo;</em>.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                <Brain className="w-4 h-4" /> Growth Archetype
              </div>
              <p className="text-xs text-stone-600 dark:text-[#E4E4E7]">
                You are aligned as <strong className="text-stone-800 dark:text-[#F8FAFC]">{profile?.growthPersona || 'Micro-Habit Builder'}</strong>.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 dark:bg-[#171F2A] rounded-2xl border border-stone-200/60 dark:border-[#334255] text-xs text-stone-600 dark:text-[#E4E4E7] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Current Daily Streak: <strong className="text-stone-800 dark:text-[#F8FAFC] font-mono">{stats?.streakDays || 0} days</strong></span>
            </div>
            <span className="font-mono text-orange-600 dark:text-[#FB923C] font-bold bg-orange-100 dark:bg-[rgba(249,115,22,0.15)] border border-orange-200 dark:border-[rgba(249,115,22,0.35)] px-2 py-0.5 rounded-full text-[10px]">
              LEVEL {stats?.level || 1} • {stats?.xp || 150} XP
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'habit-stacking',
      title: 'Active Stack Contracts ⚡',
      subtitle: 'Build Routines & Quick-Launch Somatic Sessions',
      badge: 'Interactive Tour • Step 2 of 6',
      icon: <Zap className="w-8 h-8 text-[#FF8A3D]" />,
      viewTarget: 'dashboard' as const,
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-stone-600 dark:text-[#E4E4E7]">
            Active Stack Contracts sit directly on your main dashboard. Checking off a habit logs your completion, awards XP, and updates your neurochemical meters in real time.
          </p>

          {/* Interactive Mini Habit Card */}
          <div className="p-4 bg-white dark:bg-[#171F2A] rounded-2xl border border-stone-200 dark:border-[#334255] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold font-mono tracking-wider text-orange-700 dark:text-[#FB923C] bg-orange-50 dark:bg-[rgba(249,115,22,0.15)] border border-orange-200 dark:border-[rgba(249,115,22,0.35)] px-2.5 py-0.5 rounded-md uppercase">
                INTERACTIVE PREVIEW
              </span>
              <span className="text-xs font-mono font-bold text-stone-500 dark:text-[#94A3B8]">
                +30 XP
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 bg-stone-50 dark:bg-[#0F141C] rounded-xl border border-stone-200 dark:border-[#334255]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleSampleHabit}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                    sampleHabitCompleted 
                      ? 'bg-[#EA580C] border-[#EA580C] text-white shadow-sm' 
                      : 'border-slate-300 dark:border-[#334255] bg-white dark:bg-[#171F2A] hover:border-[#EA580C]'
                  }`}
                >
                  {sampleHabitCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
                <div>
                  <h4 className={`text-xs font-bold ${sampleHabitCompleted ? 'line-through text-[#94A3B8] decoration-[#94A3B8]/60' : 'text-stone-800 dark:text-[#F8FAFC]'}`}>
                    Take 3 Deep Mindful Breaths
                  </h4>
                  <p className="text-[10px] text-stone-500 dark:text-[#94A3B8]">
                    Stack: After sitting down at my desk
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-orange-700 dark:text-[#FB923C] font-bold bg-orange-100/60 dark:bg-[rgba(249,115,22,0.15)] border border-orange-200 dark:border-[rgba(249,115,22,0.35)] px-2 py-1 rounded">
                Try clicking!
              </span>
            </div>

            {sampleHabitCompleted && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-emerald-700 dark:text-[#6EE7B7] font-medium flex items-center gap-1.5 p-2 bg-emerald-50 dark:bg-[rgba(16,185,129,0.15)] rounded-xl border border-emerald-200 dark:border-[rgba(16,185,129,0.35)]"
              >
                <CheckCircle2 className="w-4 h-4" /> Contract complete! Dopamine boosted by +25%.
              </motion.div>
            )}
          </div>

          <p className="text-xs text-stone-500 dark:text-[#94A3B8] italic">
            💡 Tip: Habits with keywords like &ldquo;breath&rdquo;, &ldquo;stretch&rdquo;, or &ldquo;plank&rdquo; automatically launch audio-guided somatic exercises!
          </p>
        </div>
      )
    },
    {
      id: 'daily-action-validation',
      title: 'Daily Action List & Word Validation 📝',
      subtitle: 'Keep Your Daily Tasks High Quality & Meaningful',
      badge: 'Interactive Tour • Step 3 of 6',
      icon: <ListTodo className="w-8 h-8 text-[#FF8A3D]" />,
      viewTarget: 'dashboard' as const,
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-stone-600 dark:text-[#E4E4E7]">
            Vicfungo features an intelligent <strong>Daily Action List</strong>. To prevent accidental keyboard mashing or meaningless entries (like <code className="text-[#EA580C] dark:text-[#FB923C] font-mono">54drtytwdhe</code> or <code className="text-[#EA580C] dark:text-[#FB923C] font-mono">asdfasdf</code>), input validation checks your text before adding it.
          </p>

          {/* Interactive Validation Tester */}
          <div className="p-4 bg-stone-50 dark:bg-[#171F2A] rounded-2xl border border-[#CBD5E1] dark:border-[#334255] space-y-3">
            <span className="text-[10px] font-bold font-mono text-stone-500 dark:text-[#94A3B8] uppercase block">
              Try the Validation Engine
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                value={sampleTaskInput}
                onChange={(e) => {
                  setSampleTaskInput(e.target.value);
                  setSampleTaskValidation(null);
                }}
                placeholder="Type 'Buy groceries' or 'dfghj'..."
                className="flex-1 px-3 py-2 bg-white dark:bg-[#0F141C] border border-[#CBD5E1] dark:border-[#334255] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:border-[#EA580C]"
              />
              <button
                type="button"
                onClick={handleTestWordValidation}
                className="px-3.5 py-2 bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Validate
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-stone-400 dark:text-[#94A3B8] self-center">Try presets:</span>
              <button
                type="button"
                onClick={() => { setSampleTaskInput('Review API docs'); setSampleTaskValidation(null); }}
                className="text-[10px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:underline cursor-pointer"
              >
                &quot;Review API docs&quot;
              </button>
              <button
                type="button"
                onClick={() => { setSampleTaskInput('54drtytwdhe'); setSampleTaskValidation(null); }}
                className="text-[10px] px-2 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg hover:underline cursor-pointer"
              >
                &quot;54drtytwdhe&quot;
              </button>
              <button
                type="button"
                onClick={() => { setSampleTaskInput('L2E Assignment'); setSampleTaskValidation(null); }}
                className="text-[10px] px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:underline cursor-pointer"
              >
                &quot;L2E Assignment&quot;
              </button>
            </div>

            {sampleTaskValidation && (
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  sampleTaskValidation.isValid
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                }`}
              >
                {sampleTaskValidation.isValid ? (
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Valid phrase! Ready to accept into your daily action list.
                  </div>
                ) : (
                  <div>
                    <strong className="block mb-1">
                      ⚠️ Triggered Confirmation Modal:
                    </strong>
                    &ldquo;This doesn&apos;t appear to be a recognized word or phrase ({sampleTaskValidation.word}). Is it an acronym or intentional keyword?&rdquo;
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'ai-coach',
      title: 'Dr. Gethro AI Growth Companion 🧠',
      subtitle: 'Psychological Guidance Calibrated to Your Persona',
      badge: 'Interactive Tour • Step 4 of 6',
      icon: <Brain className="w-8 h-8 text-[#FF8A3D]" />,
      viewTarget: 'coach' as const,
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-stone-600 dark:text-[#E4E4E7]">
            Meet <strong>Dr. Gethro</strong>, your resident AI Behavioral Scientist. Dr. Gethro analyzes your active habit streaks, reflection notes, and neurochemical state to provide tailored coaching.
          </p>

          <div className="p-4 bg-orange-50/50 dark:bg-[#171F2A] rounded-2xl border border-orange-100 dark:border-[#334255] space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs">
                DrG
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-800 dark:text-[#F8FAFC]">
                  Dr. Gethro&apos;s Calibration
                </h4>
                <span className="text-[10px] text-orange-600 dark:text-[#FB923C] font-mono">
                  Tuned for {profile?.growthPersona || 'Micro-Habit Builder'}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-[#E4E4E7] italic leading-relaxed pt-1">
              &ldquo;Small, consistent triggers reduce mental initiation friction by up to 80%. Protect your streak with two-minute habits today, {profile?.name || 'Seeker'}!&rdquo;
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (onNavigateView) onNavigateView('coach');
              }}
              className="text-xs text-[#EA580C] dark:text-[#FB923C] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              Open AI Coach Chat <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'somatic-neurochemical',
      title: 'Somatic Labs & Neurochemicals 🧪',
      subtitle: 'Real-Time Dopamine, Serotonin & Endorphins',
      badge: 'Interactive Tour • Step 5 of 6',
      icon: <Activity className="w-8 h-8 text-[#FF8A3D]" />,
      viewTarget: 'dashboard' as const,
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-stone-600 dark:text-[#E4E4E7]">
            Vicfungo calculates an estimated biological neurochemical concentration based on your daily achievements, mindfulness sessions, and wearable steps:
          </p>

          <div className="space-y-3 p-4 bg-stone-50 dark:bg-[#171F2A] rounded-2xl border border-stone-200 dark:border-[#334255]">
            {/* Dopamine bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-stone-700 dark:text-[#E4E4E7] flex items-center gap-1">
                  ⚡ Dopamine (Drive & Momentum)
                </span>
                <span className="font-mono text-[#EA580C] dark:text-[#FB923C]">{simulatedDopamine}%</span>
              </div>
              <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#EA580C] rounded-full"
                  animate={{ width: `${simulatedDopamine}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Serotonin bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-stone-700 dark:text-[#E4E4E7] flex items-center gap-1">
                  🌱 Serotonin (Mindfulness & Mood)
                </span>
                <span className="font-mono text-emerald-500">65%</span>
              </div>
              <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            {/* Endorphins bar */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-stone-700 dark:text-[#E4E4E7] flex items-center gap-1">
                  🏃 Endorphins (Physical Vitality)
                </span>
                <span className="font-mono text-pink-500">50%</span>
              </div>
              <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-500 dark:text-[#94A3B8]">
            Try launching a <strong>4-4-4 Box Breathing</strong> session from the Somatic Lab on the main dashboard to feel customized synth audio prompts and haptics!
          </p>
        </div>
      )
    },
    {
      id: 'gamification-analytics',
      title: 'Gamification, Analytics & Sync 🏆',
      subtitle: 'Unlock Badges, View Heatmaps & Sync Wearables',
      badge: 'Interactive Tour • Step 6 of 6',
      icon: <Award className="w-8 h-8 text-[#FF8A3D]" />,
      viewTarget: 'gamification' as const,
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-stone-600 dark:text-[#E4E4E7]">
            You&apos;re all set to master your routines! Here are three powerful additional tabs to explore in Vicfungo:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-amber-50/50 dark:bg-[#171F2A] rounded-xl border border-amber-100 dark:border-[#334255] text-center">
              <Award className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
              <h4 className="font-bold text-xs text-stone-800 dark:text-[#F8FAFC]">Gamification</h4>
              <p className="text-[10px] text-stone-500 dark:text-[#94A3B8] mt-0.5">Bronze, Silver & Gold Badges</p>
            </div>

            <div className="p-3 bg-blue-50/50 dark:bg-[#171F2A] rounded-xl border border-blue-100 dark:border-[#334255] text-center">
              <Activity className="w-6 h-6 text-blue-500 mx-auto mb-1.5" />
              <h4 className="font-bold text-xs text-stone-800 dark:text-[#F8FAFC]">Analytics</h4>
              <p className="text-[10px] text-stone-500 dark:text-[#94A3B8] mt-0.5">Completion Heatmaps & Trends</p>
            </div>

            <div className="p-3 bg-emerald-50/50 dark:bg-[#171F2A] rounded-xl border border-emerald-100 dark:border-[#334255] text-center">
              <Compass className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
              <h4 className="font-bold text-xs text-stone-800 dark:text-[#F8FAFC]">Wearables</h4>
              <p className="text-[10px] text-stone-500 dark:text-[#94A3B8] mt-0.5">Apple Health & Fitbit Sync</p>
            </div>
          </div>

          <div className="p-3.5 bg-orange-50 dark:bg-[rgba(249,115,22,0.15)] rounded-2xl border border-orange-200 dark:border-[rgba(249,115,22,0.35)] text-center">
            <span className="text-xs font-bold text-orange-700 dark:text-[#FB923C] block">
              🎁 Tour Completion Reward
            </span>
            <p className="text-xs text-stone-700 dark:text-[#E4E4E7] mt-0.5">
              Completing this tour unlocks the <strong className="text-stone-900 dark:text-[#F8FAFC]">&ldquo;Pioneer Explorer&rdquo;</strong> milestone and awards <strong className="text-stone-900 dark:text-[#F8FAFC]">+25 XP</strong>!
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = tourSteps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md selection:bg-orange-100 selection:text-orange-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`w-full max-w-xl rounded-[32px] shadow-2xl border overflow-hidden relative ${
            darkMode ? 'bg-[#212C3C] border-[#37465B] text-[#F8FAFC]' : 'bg-white border-stone-100 text-stone-900'
          }`}
        >
          {/* Top Progress Bar */}
          <div className="w-full bg-stone-100 dark:bg-[#171F2A] h-1.5 flex">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-full transition-all duration-300 ${
                  idx <= currentStep ? 'bg-[#FF7A1A]' : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          {/* Modal Header */}
          <div className="p-6 pb-4 flex items-center justify-between border-b border-stone-100 dark:border-[#263242]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 dark:bg-[rgba(255,122,26,0.15)] rounded-2xl border border-orange-200 dark:border-[rgba(255,122,26,0.35)]">
                {currentStepData.icon}
              </div>
              <div>
                <span className="text-[10px] font-bold font-mono tracking-wider text-orange-700 dark:text-[#FB923C] bg-orange-50 dark:bg-[rgba(249,115,22,0.15)] border border-orange-200 dark:border-[rgba(249,115,22,0.35)] px-2 py-0.5 rounded uppercase">
                  {currentStepData.badge}
                </span>
                <h3 className="text-lg font-display font-black tracking-tight text-stone-900 dark:text-[#F8FAFC] mt-0.5">
                  {currentStepData.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-600 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] hover:bg-stone-100 dark:hover:bg-[#171F2A] transition cursor-pointer"
              title="Close Tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
              >
                {currentStepData.content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Modal Footer Controls */}
          <div className="p-6 pt-4 bg-stone-50/60 dark:bg-[#171F2A]/90 border-t border-stone-100 dark:border-[#263242] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(prev => prev - 1)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                  currentStep === 0
                    ? 'opacity-40 cursor-not-allowed border-transparent text-stone-400 dark:text-[#64748B]'
                    : 'border-stone-200 dark:border-[#263242] hover:bg-stone-100 dark:hover:bg-[#212C3C] text-stone-700 dark:text-[#94A3B8] cursor-pointer'
                }`}
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-stone-500 hover:text-stone-700 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] px-2 cursor-pointer font-medium"
              >
                Skip Tour
              </button>
            </div>

            <div className="flex items-center gap-2">
              {currentStepData.viewTarget && onNavigateView && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateView(currentStepData.viewTarget);
                  }}
                  className="hidden sm:flex items-center gap-1 text-xs font-bold text-stone-600 dark:text-[#94A3B8] hover:text-[#FF7A1A] dark:hover:text-[#FFA05C] px-2 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" /> Jump to View
                </button>
              )}

              {currentStep < tourSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-5 py-2.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white font-bold text-xs rounded-xl shadow-premium-orange transition flex items-center gap-1.5 cursor-pointer"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishTour}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#FF8A3D] to-amber-500 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-premium-orange transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Complete Tour (+25 XP)
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
