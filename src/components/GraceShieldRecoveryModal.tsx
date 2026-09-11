import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, Check, ArrowRight, X, Heart, Wind, Target, Zap } from 'lucide-react';

interface GraceShieldRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (friction: string, microAction: string) => void;
  streakDays: number;
  identityAnchor?: string;
  darkMode: boolean;
}

export default function GraceShieldRecoveryModal({
  isOpen,
  onClose,
  onComplete,
  streakDays,
  identityAnchor,
  darkMode
}: GraceShieldRecoveryModalProps) {
  const [selectedFriction, setSelectedFriction] = useState<string>('cognitive_overload');
  const [selectedAction, setSelectedAction] = useState<string>('box_breathing');
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathCount, setBreathCount] = useState<number>(0);
  const [hasActionDone, setHasActionDone] = useState<boolean>(true);

  if (!isOpen) return null;

  const frictionOptions = [
    {
      id: 'cognitive_overload',
      label: 'Energy / Cognitive Fatigue',
      desc: 'High cognitive demand, felt exhausted or depleted'
    },
    {
      id: 'schedule_shock',
      label: 'Schedule Shock / Disruption',
      desc: 'Unexpected deadline, urgent errand, or emergency'
    },
    {
      id: 'cue_drift',
      label: 'Routine Cue Drift',
      desc: 'Out of normal environment or forgot the habit trigger'
    },
    {
      id: 'intentional_rest',
      label: 'Rest / Recharge Day',
      desc: 'Needed intentional recovery to prevent burnout'
    }
  ];

  const actionOptions = [
    {
      id: 'box_breathing',
      icon: Wind,
      title: '3 Diaphragmatic Box Breaths',
      desc: 'Downregulate amygdala arousal and reset executive control'
    },
    {
      id: 'identity_anchor',
      icon: Target,
      title: 'Affirm Identity Anchor',
      desc: identityAnchor ? `Speak: "${identityAnchor}"` : 'Re-center on who you are actively becoming'
    },
    {
      id: 'trigger_prep',
      icon: Zap,
      title: 'Pre-Stage Today\'s Cue',
      desc: 'Set water, book, or equipment in plain sight for today'
    }
  ];

  const handleStartBreathing = () => {
    setIsBreathingActive(true);
    setBreathCount(1);
    const interval = setInterval(() => {
      setBreathCount(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          setIsBreathingActive(false);
          setHasActionDone(true);
          return 3;
        }
        return prev + 1;
      });
    }, 2500);
  };

  const handleConfirm = () => {
    const frictionLabel = frictionOptions.find(f => f.id === selectedFriction)?.label || selectedFriction;
    const actionTitle = actionOptions.find(a => a.id === selectedAction)?.title || selectedAction;
    onComplete(frictionLabel, actionTitle);
  };

  return (
    <div
      id="recovery-mission-modal-backdrop"
      className="fixed inset-0 bg-stone-950/75 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        id="recovery-mission-modal-container"
        initial={{ scale: 0.93, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 16, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg p-6 sm:p-7 rounded-[32px] border ${
          darkMode ? 'bg-[#1A2330] border-[#334255] text-[#F8FAFC]' : 'bg-white border-orange-100 text-stone-900'
        } shadow-2xl relative overflow-hidden my-6`}
      >
        {/* Abstract Warm Background Flare */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm shrink-0">
              <Shield className="w-6 h-6 stroke-[2.2] fill-amber-500/20" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Streak Recovery Mission
              </span>
              <h3 className="text-xl font-display font-black tracking-tight mt-0.5">
                Preserve Your {streakDays > 0 ? `${streakDays}-Day` : 'Daily'} Streak
              </h3>
            </div>
          </div>

          <button
            id="btn-close-recovery-modal"
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              darkMode ? 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#263242]' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className={`text-xs ${darkMode ? 'text-[#CBD5E1]' : 'text-stone-600'} leading-relaxed mb-5`}>
          Dr. Gethro notes: <em>&ldquo;Never miss twice.&rdquo;</em> A single pause is normal human variation. Complete this 60-second micro-reset to activate your weekly Grace Shield and safeguard your momentum.
        </p>

        {/* Step 1: Honest Reflection */}
        <div className="mb-5">
          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 font-mono ${darkMode ? 'text-[#CBD5E1]' : 'text-stone-700'}`}>
            1. Why did yesterday slip?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {frictionOptions.map((opt, idx) => {
              const active = selectedFriction === opt.id;
              return (
                <button
                  key={`friction-${opt.id}-${idx}`}
                  type="button"
                  onClick={() => setSelectedFriction(opt.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    active
                      ? 'border-[#EA580C] bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-1 ring-[#EA580C]'
                      : darkMode
                        ? 'border-[#334255] bg-[#141B24] text-[#94A3B8] hover:border-stone-600 hover:text-[#F8FAFC]'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className={`text-[10px] mt-1 leading-snug ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Micro-Reset Action */}
        <div className="mb-6">
          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 font-mono ${darkMode ? 'text-[#CBD5E1]' : 'text-stone-700'}`}>
            2. 60-Second Micro-Reset Commitment
          </label>
          <div className="space-y-2">
            {actionOptions.map((opt, idx) => {
              const active = selectedAction === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={`action-${opt.id}-${idx}`}
                  type="button"
                  onClick={() => setSelectedAction(opt.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    active
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500'
                      : darkMode
                        ? 'border-[#334255] bg-[#141B24] text-[#CBD5E1] hover:border-stone-600'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      active ? 'bg-amber-500/20 text-amber-500' : darkMode ? 'bg-[#1E2836] text-[#94A3B8]' : 'bg-stone-200/60 text-stone-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{opt.title}</div>
                      <div className={`text-[10px] ${darkMode ? 'text-[#94A3B8]' : 'text-stone-500'}`}>{opt.desc}</div>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                    active 
                      ? 'bg-amber-500 border-amber-500 text-white' 
                      : darkMode ? 'border-[#334255]' : 'border-stone-300'
                  }`}>
                    {active && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Breath Helper if selected */}
          {selectedAction === 'box_breathing' && (
            <div className={`mt-3 p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
              darkMode ? 'bg-[#0F141C] border-[#334255]' : 'bg-amber-50/60 border-amber-200/60'
            }`}>
              <div className="text-xs font-medium">
                {isBreathingActive ? (
                  <span className="text-amber-600 dark:text-amber-400 font-bold animate-pulse">
                    Breathing Cycle {breathCount}/3: Inhale... Hold... Exhale...
                  </span>
                ) : breathCount >= 3 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> 3 Deep Breaths Completed!
                  </span>
                ) : (
                  <span className={darkMode ? 'text-[#CBD5E1]' : 'text-stone-700'}>
                    Tap to run a synchronized 3-breath cycle
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleStartBreathing}
                disabled={isBreathingActive}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer disabled:opacity-50 shrink-0"
              >
                {breathCount >= 3 ? 'Repeat' : 'Breathe'}
              </button>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            id="btn-cancel-recovery-mission"
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 rounded-2xl border text-xs font-bold transition cursor-pointer text-center ${
              darkMode ? 'border-[#334255] text-[#94A3B8] hover:bg-[#263242]' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            Cancel
          </button>

          <button
            id="btn-complete-recovery-mission"
            type="button"
            onClick={handleConfirm}
            className="flex-[2] py-3 px-4 rounded-2xl bg-gradient-to-r from-[#EA580C] to-amber-500 hover:from-[#C2410C] hover:to-amber-600 text-white text-xs font-extrabold transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Shield className="w-4 h-4 fill-white/20" />
            <span>Preserve Streak with Shield</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
