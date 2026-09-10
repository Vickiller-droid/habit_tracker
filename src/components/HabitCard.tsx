import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Flame, Clock, Award, ShieldAlert, Sparkles, ChevronDown, ChevronUp, MessageSquare, Smile, BatteryCharging, Brain } from 'lucide-react';
import { Habit, HabitRecord } from '../types';

interface HabitCardProps {
  key?: string;
  habit: Habit;
  selectedDate: string; // YYYY-MM-DD
  onToggleComplete: (habitId: string, reflection?: Partial<HabitRecord>) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitCard({ habit, selectedDate, onToggleComplete, onDelete }: HabitCardProps) {
  const record = habit.records[selectedDate];
  const isCompleted = !!record?.completed;
  
  const [showReflection, setShowReflection] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>(record?.notes || '');
  const [mood, setMood] = useState<'great' | 'good' | 'meh' | 'bad' | 'terrible'>(record?.mood || 'good');
  const [energyLevel, setEnergyLevel] = useState<number>(record?.energyLevel || 6);

  const handleToggle = (e: React.MouseEvent) => {
    onToggleComplete(habit.id);
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
      case 'easy': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'hard': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-neutral-50 text-neutral-500';
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
      className={`bg-white rounded-[32px] shadow-premium border transition-all duration-300 overflow-hidden ${
        isCompleted ? 'border-orange-100 bg-orange-50/10' : 'border-stone-100 hover:border-stone-200'
      }`}
    >
      <div className="p-5 flex items-start gap-4">
        {/* Toggle Circle */}
        <button
          id={`btn-toggle-habit-${habit.id}`}
          onClick={handleToggle}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 relative cursor-pointer group shrink-0 ${
            isCompleted 
              ? 'bg-[#FF8A3D] border-[#FF8A3D] text-white shadow-premium-orange' 
              : 'bg-[#F5F1EE] border-stone-200 hover:border-orange-200 hover:bg-orange-50/30'
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
            <div className="w-2.5 h-2.5 rounded-full bg-stone-300 group-hover:bg-[#FF8A3D] transition-all" />
          )}
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium" id={`habit-emoji-${habit.id}`}>
              {getCategoryEmoji(habit.category)}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-medium ${getDifficultyColor(habit.difficulty)}`}>
              {habit.difficulty.toUpperCase()}
            </span>
            <span className="text-xs bg-orange-50 text-[#FF8A3D] border border-orange-100 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
              +{habit.xpReward} XP
            </span>
            {habit.currentStreak > 0 ? (
              <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" /> {habit.currentStreak}d streak
              </span>
            ) : (
              <span className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-750 px-2.5 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-stone-400" /> Day 0 (No streak yet)
              </span>
            )}
            {(habit.id === 'def-1' || 
              habit.name.toLowerCase().includes('breath') || 
              habit.name.toLowerCase().includes('breathe') || 
              habit.name.toLowerCase().includes('plank') ||
              habit.name.toLowerCase().includes('stretch')) && (
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/45 dark:border-indigo-900/35 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 animate-pulse">
                ⚡ Guided Coach
              </span>
            )}
          </div>

          <h3 className={`text-base font-bold text-stone-800 tracking-tight mt-2 ${isCompleted ? 'line-through text-stone-400' : ''}`} id={`habit-title-${habit.id}`}>
            {habit.name}
          </h3>

          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {habit.description}
          </p>

          <div className="flex items-center gap-4 mt-3 text-stone-500 text-xs">
            {habit.reminderTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" /> {habit.reminderTime}
              </span>
            )}
            <span className="flex items-center gap-1 bg-purple-50 text-purple-600 border border-purple-100 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
              <Brain className="w-3 h-3" /> {habit.psychologicalPrinciple}
            </span>
          </div>
        </div>

        {/* Right Actions / Expand button */}
        <div className="flex flex-col items-end justify-between self-stretch shrink-0">
          <button 
            id={`btn-delete-habit-${habit.id}`}
            onClick={() => onDelete(habit.id)}
            className="text-stone-300 hover:text-red-500 transition p-1 text-xs cursor-pointer font-bold"
            title="Delete Habit"
          >
            ✕
          </button>
          
          {isCompleted && (
            <button
              id={`btn-expand-reflection-${habit.id}`}
              onClick={() => setShowReflection(!showReflection)}
              className="text-stone-500 hover:text-stone-700 transition p-1 rounded-lg hover:bg-[#F5F1EE] flex items-center gap-1 text-[11px] font-medium cursor-pointer"
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
            className="border-t border-stone-100 bg-[#F5F1EE]/60 p-5"
            id={`habit-reflection-drawer-${habit.id}`}
          >
            <div className="max-w-md space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#FF8A3D]" />
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Psychological Wellness Log</h4>
              </div>

              {/* Mood Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-2">HOW DID THIS ACTUALLY FEEL?</label>
                <div className="flex items-center justify-between gap-1.5 bg-white p-1.5 rounded-2xl border border-stone-100">
                  {moods.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMood(m.value)}
                      className={`flex-1 py-2 rounded-xl text-center text-xs transition flex flex-col items-center gap-1 cursor-pointer ${
                        mood === m.value 
                          ? 'bg-orange-50 text-[#FF8A3D] font-bold border border-orange-100 shadow-sm' 
                          : 'hover:bg-[#F5F1EE] border border-transparent'
                      }`}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      <span className="text-[10px] text-stone-500">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor={`energy-slider-${habit.id}`} className="text-[11px] font-semibold text-stone-500">PHYSICAL ENERGY NODE</label>
                  <span className="text-xs font-mono font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">{energyLevel} / 10</span>
                </div>
                <div className="flex items-center gap-3">
                  <BatteryCharging className="w-4 h-4 text-stone-400" />
                  <input
                    id={`energy-slider-${habit.id}`}
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#FF8A3D]"
                  />
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <label htmlFor={`notes-input-${habit.id}`} className="block text-[11px] font-semibold text-stone-500 mb-1.5">COGNITIVE RESPONSE / NOTES</label>
                <div className="relative">
                  <MessageSquare className="absolute top-3 left-3 w-4 h-4 text-stone-400" />
                  <input
                    id={`notes-input-${habit.id}`}
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Stacked after coffee. Felt clear-headed and ready."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-2xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#FF8A3D]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReflection(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-500 hover:text-stone-700 transition font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id={`btn-save-reflection-${habit.id}`}
                  type="button"
                  onClick={handleSaveReflection}
                  className="px-4 py-1.5 bg-[#FF8A3D] hover:bg-[#e77a2f] text-white text-xs font-semibold rounded-2xl transition shadow-sm cursor-pointer"
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
