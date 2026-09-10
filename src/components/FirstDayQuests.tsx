import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, CheckCircle2, Circle, ArrowRight, Zap, Brain, Activity, 
  ListTodo, Trophy, ChevronDown, ChevronUp, Award, Flame, X
} from 'lucide-react';
import { FirstDayQuest, UserStats } from '../types';
import { playSuccessSound } from '../utils/audio';

interface FirstDayQuestsProps {
  stats: UserStats | null;
  onRewardXp: (xpBonus: number, badgeName?: string) => void;
  onNavigateView: (view: 'dashboard' | 'coach' | 'analytics' | 'gamification' | 'wearables' | 'settings') => void;
  onOpenSomaticSession?: () => void;
  onOpenCreateHabitModal?: () => void;
  darkMode: boolean;
}

const DEFAULT_QUESTS: FirstDayQuest[] = [
  {
    id: 'complete_habit',
    title: 'Complete Your 1st Stack Contract',
    description: 'Check off any habit on your daily dashboard to trigger XP & neurochemical boost.',
    xpReward: 25,
    completed: false,
    actionText: 'Find Habit Below'
  },
  {
    id: 'somatic_breath',
    title: 'Experience Somatic Box Breathing',
    description: 'Launch a 2-minute 4-4-4 guided breathing session in the Somatic Lab.',
    xpReward: 25,
    completed: false,
    actionText: 'Start Breathing'
  },
  {
    id: 'chat_coach',
    title: 'Consult Dr. Gethro AI Coach',
    description: 'Ask Dr. Gethro a question tailored to your behavioral persona.',
    xpReward: 25,
    completed: false,
    actionText: 'Open AI Coach'
  },
  {
    id: 'add_task',
    title: 'Create a Custom Habit or Task',
    description: 'Add a new validated daily action or habit stack contract.',
    xpReward: 25,
    completed: false,
    actionText: 'Build Contract'
  }
];

export default function FirstDayQuests({
  stats,
  onRewardXp,
  onNavigateView,
  onOpenSomaticSession,
  onOpenCreateHabitModal,
  darkMode
}: FirstDayQuestsProps) {
  const [quests, setQuests] = useState<FirstDayQuest[]>(() => {
    try {
      const saved = localStorage.getItem('vicfungo_first_day_quests');
      return saved ? JSON.parse(saved) : DEFAULT_QUESTS;
    } catch (e) {
      return DEFAULT_QUESTS;
    }
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('vicfungo_quests_dismissed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('vicfungo_first_day_quests', JSON.stringify(quests));
  }, [quests]);

  const completedCount = quests.filter(q => q.completed).length;
  const isAllCompleted = completedCount === quests.length;

  const handleQuestAction = (quest: FirstDayQuest) => {
    if (quest.completed) return;

    if (quest.id === 'complete_habit') {
      // Scroll smoothly to stack contracts
      const el = document.getElementById('section-stack-contracts');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (quest.id === 'somatic_breath') {
      if (onOpenSomaticSession) onOpenSomaticSession();
    } else if (quest.id === 'chat_coach') {
      onNavigateView('coach');
    } else if (quest.id === 'add_task') {
      if (onOpenCreateHabitModal) onOpenCreateHabitModal();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('vicfungo_quests_dismissed', 'true');
  };

  if (isDismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border p-5 transition-all shadow-sm mb-6 ${
        darkMode 
          ? 'bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 border-stone-800' 
          : 'bg-gradient-to-br from-orange-50/70 via-white to-amber-50/50 border-orange-100'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FF8A3D] text-white rounded-2xl shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono text-[#FF8A3D] uppercase tracking-wider">
                First Day Victory Quests
              </span>
              {isAllCompleted && (
                <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  100% COMPLETE 🎉
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {isAllCompleted ? 'First Day Quests Mastered!' : `Unlock 'First Day Champion' (${completedCount}/${quests.length})`}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            title={isCollapsed ? "Expand Quests" : "Collapse Quests"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {isAllCompleted && (
            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
              title="Dismiss Banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200/80 dark:bg-stone-800 h-2 rounded-full overflow-hidden mt-3.5 mb-2">
        <motion.div
          className="h-full bg-gradient-to-r from-[#FF8A3D] to-amber-500 rounded-full"
          animate={{ width: `${(completedCount / quests.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Expandable Quest List */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3"
          >
            {quests.map((quest) => (
              <div
                key={quest.id}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                  quest.completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 opacity-90'
                    : 'bg-white dark:bg-stone-850 border-stone-200/80 dark:border-stone-800 hover:border-orange-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    {quest.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-300 dark:text-stone-600" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${quest.completed ? 'line-through text-stone-500 dark:text-stone-400' : 'text-stone-800 dark:text-stone-100'}`}>
                      {quest.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                      {quest.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-[10px] font-mono font-bold text-[#FF8A3D] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded">
                    +{quest.xpReward} XP
                  </span>

                  {!quest.completed && (
                    <button
                      type="button"
                      onClick={() => handleQuestAction(quest)}
                      className="text-xs font-bold text-[#FF8A3D] hover:text-[#e77a2f] flex items-center gap-1 cursor-pointer"
                    >
                      {quest.actionText} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
