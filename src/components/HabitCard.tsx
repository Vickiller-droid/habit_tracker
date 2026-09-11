import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Flame, Clock, Award, ShieldAlert, Sparkles, ChevronDown, ChevronUp, MessageSquare, Smile, BatteryCharging, Brain, Moon } from 'lucide-react';
import { Habit, HabitRecord } from '../types';
import { calculateWindowStatus, parseTimeString } from '../utils/notifications';

interface HabitCardProps {
  key?: string;
  habit: Habit;
  selectedDate: string; // YYYY-MM-DD
  onToggleComplete: (habitId: string, reflection?: Partial<HabitRecord>) => void;
  onDelete: (habitId: string) => void;
  onReschedule?: (habitId: string, newTime: string) => void;
}

export default function HabitCard({ habit, selectedDate, onToggleComplete, onDelete, onReschedule }: HabitCardProps) {
  const record = habit.records[selectedDate];
  const isCompleted = !!record?.completed;
  
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>(record?.notes || '');
  const [mood, setMood] = useState<'great' | 'good' | 'meh' | 'bad' | 'terrible'>(record?.mood || 'good');
  const [energyLevel, setEnergyLevel] = useState<number>(record?.energyLevel || 6);

  // Dynamic context-aware window state based on local system clock
  const windowStatus = calculateWindowStatus(habit.reminderTime, isCompleted, selectedDate);

  const handleToggle = (e: React.MouseEvent) => {
    onToggleComplete(habit.id);
  };

  const handleReschedulePlus1Hour = (e: React.MouseEvent) => {
    e.stopPropagation();
    const parsed = parseTimeString(habit.reminderTime);
    const newTotal = (parsed.totalMinutes + 60) % 1440;
    const newH = Math.floor(newTotal / 60).toString().padStart(2, '0');
    const newM = (newTotal % 60).toString().padStart(2, '0');
    const newTime = `${newH}:${newM}`;
    if (onReschedule) {
      onReschedule(habit.id, newTime);
    }
  };

  const handleRescheduleEvening = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReschedule) {
      onReschedule(habit.id, '19:00');
    }
  };

  const handleSaveReflection = () => {
    onToggleComplete(habit.id, {
      completed: true,
      notes,
      mood,
      energyLevel
    });
    setShowReflection(false);
  };

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case 'productivity': return '⚡';
      case 'mindfulness': return '🧘';
      case 'health': return '🍏';
      case 'fitness': return '💪';
      case 'learning': return '📚';
      case 'finance': return '🪙';
      case 'social': return '❤️';
      default: return '🌱';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[rgba(16,185,129,0.15)] dark:text-[#6EE7B7] dark:border-[rgba(16,185,129,0.35)]';
      case 'medium': return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-[rgba(245,158,11,0.15)] dark:text-[#FCD34D] dark:border-[rgba(245,158,11,0.35)]';
      case 'hard': return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-[rgba(239,68,68,0.15)] dark:text-[#FCA5A5] dark:border-[rgba(239,68,68,0.35)]';
      default: return 'bg-neutral-50 text-neutral-600 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const moods: { value: 'great' | 'good' | 'meh' | 'bad' | 'terrible'; label: string; emoji: string }[] = [
    { value: 'great', label: 'Great', emoji: '🤩' },
    { value: 'good', label: 'Good', emoji: '😊' },
    { value: 'meh', label: 'Meh', emoji: '😐' },
    { value: 'bad', label: 'Tired', emoji: '🥱' },
    { value: 'terrible', label: 'Stressed', emoji: '😫' }
  ];

  return (
    <motion.div 
      layout
      id={`habit-card-${habit.id}`}
      className={`bg-white dark:bg-[#171F2A] rounded-[32px] shadow-premium border transition-all duration-300 overflow-hidden ${
        isCompleted 
          ? 'border-orange-200 dark:border-[#FF7A1A]/40 bg-orange-50/20 dark:bg-[#171F2A]' 
          : windowStatus.status === 'active'
            ? 'border-amber-500 dark:border-amber-500 shadow-xl shadow-amber-500/20 ring-2 ring-amber-500/40 bg-gradient-to-b from-amber-50/25 to-white dark:from-amber-950/20 dark:to-[#171F2A]'
            : windowStatus.status === 'overdue'
              ? 'border-amber-300 dark:border-amber-700/80 bg-white dark:bg-[#171F2A]'
              : 'border-stone-100 dark:border-[#263242] hover:border-stone-200 dark:hover:border-[#37465B]'
      }`}
    >
      {/* Overdue / Missed Window Actionable Prompt Banner */}
      {windowStatus.status === 'overdue' && !isCompleted && (
        <div
          id={`overdue-prompt-banner-${habit.id}`}
          className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 dark:from-amber-950/60 dark:via-[#1F2937] dark:to-amber-950/40 border-b border-amber-200 dark:border-amber-800/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <span className="text-base shrink-0 mt-0.5">⚠️</span>
            <div>
              <p className="text-xs font-bold text-amber-950 dark:text-amber-200 leading-snug">
                How did your <span className="underline decoration-amber-400 font-extrabold">{windowStatus.formattedTime}</span> session go? Take 5 seconds to log your progress.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              id={`btn-reschedule-plus1-${habit.id}`}
              onClick={handleReschedulePlus1Hour}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#171F2A] hover:bg-amber-100 dark:hover:bg-[#263242] text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Push active window forward by 60 minutes"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>+1 Hour</span>
            </button>
            <button
              type="button"
              id={`btn-reschedule-evening-${habit.id}`}
              onClick={handleRescheduleEvening}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#171F2A] hover:bg-amber-100 dark:hover:bg-[#263242] text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Adjust scheduled time to 07:00 PM"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Move to Evening</span>
            </button>
          </div>
        </div>
      )}

      <div className="p-5 flex items-start gap-4">
        {/* Toggle Circle */}
        <button
          id={`btn-toggle-habit-${habit.id}`}
          onClick={handleToggle}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 relative cursor-pointer group shrink-0 ${
            isCompleted 
              ? 'bg-gradient-to-br from-[#FF7A1A] to-[#F59E0B] border-[#FF7A1A] text-white shadow-premium-orange' 
              : windowStatus.status === 'active'
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 hover:bg-amber-500/20'
                : 'bg-stone-50 dark:bg-[#0F141C] border-stone-200/80 dark:border-[#263242] hover:border-[#FF7A1A] dark:hover:border-[#FF7A1A]'
          }`}
          aria-label={`Toggle completion for ${habit.name}`}
        >
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Check className="w-5 h-5 stroke-[3px]" />
            </motion.div>
          ) : (
            <div className={`w-2.5 h-2.5 rounded-full ${
              windowStatus.status === 'active' ? 'bg-amber-500 animate-ping' : 'bg-stone-300 dark:bg-[#64748B]'
            } group-hover:bg-[#FF7A1A] group-hover:scale-125 transition-all`} />
          )}
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium" id={`habit-emoji-${habit.id}`}>
              {getCategoryEmoji(habit.category)}
            </span>

            {/* Dynamic context-aware window badges */}
            {windowStatus.status === 'active' && !isCompleted && (
              <span
                id={`badge-active-window-${habit.id}`}
                className="text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1.5 shadow-xs animate-pulse"
              >
                <span>🟢</span> Active Focus Window
              </span>
            )}

            {windowStatus.status === 'upcoming' && !isCompleted && (
              <span
                id={`badge-upcoming-${habit.id}`}
                className="text-xs bg-stone-100 dark:bg-[#0F141C] text-stone-600 dark:text-[#94A3B8] border border-stone-200 dark:border-[#263242] px-2.5 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1"
              >
                <Clock className="w-3 h-3 text-stone-400 dark:text-[#64748B]" />
                <span>Scheduled for {windowStatus.formattedTime}</span>
              </span>
            )}

            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-medium ${getDifficultyColor(habit.difficulty)}`}>
              {habit.difficulty.toUpperCase()}
            </span>
            <span className="text-xs bg-orange-50 dark:bg-[rgba(255,122,26,0.15)] text-orange-700 dark:text-[#FFB074] border border-orange-200 dark:border-[rgba(255,122,26,0.35)] px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
              +{habit.xpReward} XP
            </span>
            {habit.currentStreak > 0 ? (
              <span className="text-xs bg-red-50 dark:bg-[rgba(239,68,68,0.15)] text-red-700 dark:text-[#FCA5A5] border border-red-200 dark:border-[rgba(239,68,68,0.35)] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current text-red-500 dark:text-[#FCA5A5]" /> {habit.currentStreak}d streak
              </span>
            ) : (
              <span className="text-xs bg-stone-100 dark:bg-[#0F141C] text-stone-500 dark:text-[#94A3B8] border border-stone-200 dark:border-[#263242] px-2.5 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-stone-400 dark:text-[#64748B]" /> Day 0 (No streak yet)
              </span>
            )}
            {(habit.id === 'def-1' || 
              habit.name.toLowerCase().includes('breath') || 
              habit.name.toLowerCase().includes('breathe') || 
              habit.name.toLowerCase().includes('plank') ||
              habit.name.toLowerCase().includes('stretch')) && (
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 animate-pulse">
                ⚡ Guided Coach
              </span>
            )}
          </div>

          <h3 className={`text-base font-bold tracking-tight mt-2 ${isCompleted ? 'line-through decoration-slate-400 text-stone-400 dark:text-[#64748B]' : 'text-stone-800 dark:text-[#F8FAFC]'}`} id={`habit-title-${habit.id}`}>
            {habit.name}
          </h3>

          <p className="text-xs text-stone-500 dark:text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
            {habit.description}
          </p>

          <div className="flex items-center gap-4 mt-3 text-stone-500 dark:text-[#94A3B8] text-xs">
            {habit.reminderTime && (
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-stone-400 dark:text-[#64748B]" /> {windowStatus.formattedTime}
              </span>
            )}
            <span className="flex items-center gap-1 bg-purple-50 dark:bg-[#0F141C] text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-[#263242] px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
              <Brain className="w-3 h-3 text-purple-500" /> {habit.psychologicalPrinciple}
            </span>
          </div>
        </div>

        {/* Right Actions / Expand button */}
        <div className="flex flex-col items-end justify-between self-stretch shrink-0">
          <button 
            id={`btn-delete-habit-${habit.id}`}
            onClick={() => onDelete(habit.id)}
            className="text-stone-300 dark:text-[#64748B] hover:text-red-500 dark:hover:text-[#FCA5A5] transition p-1 text-xs cursor-pointer font-bold"
            title="Delete Habit"
          >
            ✕
          </button>
          
          {isCompleted && (
            <button
              id={`btn-expand-reflection-${habit.id}`}
              onClick={() => setShowReflection(!showReflection)}
              className="text-stone-500 dark:text-[#94A3B8] hover:text-stone-800 dark:hover:text-[#F8FAFC] transition p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-[#1E2836] flex items-center gap-1 text-[11px] font-medium cursor-pointer"
            >
              {showReflection ? 'Hide reflection' : 'Reflect'}
              {showReflection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Reflection expansion drawer */}
      <AnimatePresence>
        {isCompleted && showReflection && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-stone-100 dark:border-[#263242] bg-stone-50/80 dark:bg-[#0F141C]/80 p-5"
            id={`habit-reflection-drawer-${habit.id}`}
          >
            <div className="max-w-md space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#FF7A1A]" />
                <h4 className="text-xs font-bold text-stone-700 dark:text-[#F8FAFC] uppercase tracking-wider">Psychological Wellness Log</h4>
              </div>

              {/* Mood Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 dark:text-[#94A3B8] mb-2">HOW DID THIS ACTUALLY FEEL?</label>
                <div className="flex items-center justify-between gap-1.5 bg-white dark:bg-[#171F2A] p-1.5 rounded-2xl border border-stone-100 dark:border-[#263242] shadow-xs">
                  {moods.map((m, idx) => (
                    <button
                      key={`mood-${m.value}-${idx}`}
                      type="button"
                      onClick={() => setMood(m.value)}
                      className={`flex-1 py-2 rounded-xl text-center text-xs transition flex flex-col items-center gap-1 cursor-pointer ${
                        mood === m.value 
                          ? 'bg-orange-50 dark:bg-[rgba(255,122,26,0.15)] text-orange-700 dark:text-[#FFB074] font-bold border border-orange-200 dark:border-[rgba(255,122,26,0.35)] shadow-xs' 
                          : 'hover:bg-stone-50 dark:hover:bg-[#1E2836] border border-transparent text-stone-600 dark:text-[#94A3B8]'
                      }`}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      <span className="text-[10px] text-stone-500 dark:text-[#94A3B8]">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor={`energy-slider-${habit.id}`} className="text-[11px] font-semibold text-stone-500 dark:text-[#94A3B8]">PHYSICAL ENERGY NODE</label>
                  <span className="text-xs font-mono font-bold text-orange-700 dark:text-[#FFB074] bg-orange-50 dark:bg-[rgba(255,122,26,0.15)] border border-orange-200 dark:border-[rgba(255,122,26,0.35)] px-2 py-0.5 rounded">{energyLevel} / 10</span>
                </div>
                <div className="flex items-center gap-3">
                  <BatteryCharging className="w-4 h-4 text-stone-400 dark:text-[#64748B]" />
                  <input
                    id={`energy-slider-${habit.id}`}
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-stone-200 dark:bg-[#263242] rounded-lg appearance-none cursor-pointer accent-[#FF7A1A]"
                  />
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <label htmlFor={`notes-input-${habit.id}`} className="block text-[11px] font-semibold text-stone-500 dark:text-[#94A3B8] mb-1.5">COGNITIVE RESPONSE / NOTES</label>
                <div className="relative">
                  <MessageSquare className="absolute top-3 left-3 w-4 h-4 text-stone-400 dark:text-[#64748B]" />
                  <input
                    id={`notes-input-${habit.id}`}
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Stacked after coffee. Felt clear-headed and ready."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#171F2A] border border-stone-200 dark:border-[#263242] rounded-2xl text-xs text-stone-800 dark:text-[#F8FAFC] placeholder-stone-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#FF7A1A]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReflection(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-500 dark:text-[#94A3B8] hover:text-stone-700 dark:hover:text-[#F8FAFC] transition font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id={`btn-save-reflection-${habit.id}`}
                  type="button"
                  onClick={handleSaveReflection}
                  className="px-4 py-1.5 bg-[#FF7A1A] hover:bg-[#EA6500] text-white text-xs font-semibold rounded-2xl transition shadow-premium-orange cursor-pointer"
                >
                  Save Reflection
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
