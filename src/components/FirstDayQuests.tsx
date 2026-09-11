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
          ? 'bg-[#171F2A] border-[#334255]' 
          : 'bg-gradient-to-br from-orange-50/70 via-white to-amber-50/50 border-orange-100'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#FF7A1A] text-white rounded-2xl shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold font-mono uppercase tracking-wider ${
                darkMode ? 'text-[#FFB074]' : 'text-[#FF7A1A]'
              }`}>
                First Day Victory Quests
              </span>
              {isAllCompleted && (
                <span className="text-[10px] font-bold font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded-full">
                  100% COMPLETE 🎉
                </span>
              )}
            </div>
            <h3 className={`text-base font-bold ${darkMode ? 'text-[#F8FAFC]' : 'text-stone-900'}`}>
              {isAllCompleted ? 'First Day Quests Mastered!' : `Unlock 'First Day Champion' (${completedCount}/${quests.length})`}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-xl transition cursor-pointer ${
              darkMode ? 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E2836]' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
            }`}
            title={isCollapsed ? "Expand Quests" : "Collapse Quests"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {isAllCompleted && (
            <button
              type="button"
              onClick={handleDismiss}
              className={`p-2 rounded-xl transition cursor-pointer ${
                darkMode ? 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E2836]' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
              }`}
              title="Dismiss Banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-2 rounded-full overflow-hidden mt-3.5 mb-2 ${
        darkMode ? 'bg-[#0F141C] border border-[#334255]' : 'bg-stone-200/80'
      }`}>
        <motion.div
          className="h-full bg-gradient-to-r from-[#FF7A1A] to-amber-500 rounded-full"
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
            {quests.map((quest, idx) => (
              <div
                key={`quest-${quest.id}-${idx}`}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                  quest.completed
                    ? darkMode ? 'bg-emerald-950/20 border-emerald-900/40 opacity-90' : 'bg-emerald-50/50 border-emerald-200/60 opacity-90'
                    : darkMode ? 'bg-[#1E2836] border-[#334255] hover:border-[#FF7A1A]/40' : 'bg-white border-stone-200/80 hover:border-orange-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    {quest.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className={`w-5 h-5 ${darkMode ? 'text-[#64748B]' : 'text-stone-300'}`} />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${
                      quest.completed 
                        ? darkMode ? 'line-through text-[#64748B]' : 'line-through text-stone-500' 
                        : darkMode ? 'text-[#F8FAFC]' : 'text-stone-800'
                    }`}>
                      {quest.title}
                    </h4>
                    <p className={`text-[11px] mt-0.5 leading-snug ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>
                      {quest.description}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center justify-between pt-1 border-t ${darkMode ? 'border-[#334255]' : 'border-stone-100'}`}>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    darkMode ? 'bg-[rgba(255,122,26,0.15)] text-[#FFB074] border-[rgba(255,122,26,0.35)]' : 'bg-orange-50 text-[#FF7A1A] border-orange-100'
                  }`}>
                    +{quest.xpReward} XP
                  </span>

                  {!quest.completed && (
                    <button
                      type="button"
                      onClick={() => handleQuestAction(quest)}
                      className="text-xs font-bold text-[#FF7A1A] hover:text-[#e76b13] flex items-center gap-1 cursor-pointer"
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
